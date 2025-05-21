import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { run } from 'node:test';
import { ndjson } from './reporters/ndjson-reporter.js';

import { Writable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Function to verify Turnstile token
async function verifyTurnstileToken(token, remoteip) {
    try {
        const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: token,
            remoteip: remoteip
        });
        return response.data.success === true;
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return false;
    }
}

// Queue implementation for processing requests
const requestQueue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || requestQueue.length === 0) return;
    
    isProcessing = true;
    const { req, res, resolve, reject } = requestQueue.shift();
    
    try {
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        process.env.BASE_URL = req.body.url;
        process.env.AUTH_HEADER = req.body.authHeader;
        process.env.CONFIG = JSON.stringify(req.body);
        process.env.HAR_VIA_DIAGNOSTIC = true;

        const responseStream = new Writable({
            write(chunk, encoding, callback) {
                res.write(chunk);
                callback();
            }
        });

        const testRun = run({
            files: [path.resolve(__dirname, 'scim.test.js')],
            concurrency: 1,
            timeout: 20000,
        });
        
        testRun.on('test:fail', () => {
            process.exitCode = 1;
        });

        testRun.on('end', () => {
            res.end();
            process.env.BASE_URL = '';
            process.env.AUTH_HEADER = '';
            process.env.CONFIG = '';
            isProcessing = false; // Only set to false after test run completes
            processQueue(); // Process next request if any
            resolve();
        });

        testRun.pipe(ndjson()).pipe(responseStream);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: error.message });
        }
        isProcessing = false; // Set to false if there's an error
        processQueue(); // Try next request
        reject(error);
    }
}

// HTTP endpoint for running tests with streaming response
app.post('/run-tests', async (req, res) => {
    if (process.env.TURNSTILE_ENABLED === 'true') {
        const token = req.headers['cf-challenge-token'];
        const remoteip = req.headers['cf-connecting-ip'];
        if (!token || !remoteip) {
            return res.status(400).json({ error: 'Missing Turnstile token or remote IP' });
        }
        if (!await verifyTurnstileToken(token, remoteip)) {
            return res.status(403).json({ error: 'Invalid Turnstile token' });
        }
    }

    // Add request to queue
    const promise = new Promise((resolve, reject) => {
        requestQueue.push({ req, res, resolve, reject });
    });
    
    // Trigger queue processing
    processQueue();
    
    // Wait for this request to complete
    try {
        await promise;
    } catch (error) {
        // Error already handled in processQueue
    }
});

// For traditional server
if (process.env.SERVER_MODE !== 'function') {
    const httpServer = createServer(app);
    
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for serverless function use - Digital Ocean Functions will use this
export const main = function(req, res) {
    // In serverless environments, we need to ensure we're not relying on stream.listeners
    // Use the Express app directly instead of trying to handle as an async function
    return app(req, res);
};

// For backwards compatibility
export default main;
