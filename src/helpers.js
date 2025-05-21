import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import test from 'node:test';
import path from 'path';
import { fileURLToPath } from 'url';

let harEntries = [];

function createHarEntry(t, request, response) {
    return {
        _test_name: t?.name,
        _type: 'har',
        startedDateTime: new Date().toISOString(),
        time: 0,
        request: {
            method: request.method?.toUpperCase(),
            url: `${request.baseURL}${request.url}`,
            httpVersion: 'HTTP/1.1',
            cookies: [],
            headers: Object.entries(request.headers)
                .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                .map(([name, value]) => ({name, value})),
            queryString: [],
            postData: request.data ? {
                mimeType: request.headers['Content-Type'] || 'application/json',
                text: request.data
            } : undefined,
            headersSize: -1,
            bodySize: -1
        },
        response: {
            status: response.status,
            statusText: response.statusText,
            httpVersion: 'HTTP/1.1',
            cookies: [],
            headers: Object.entries(response.headers)
                .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                .map(([name, value]) => ({name, value})),
            content: {
                size: -1,
                mimeType: response.headers['content-type'] || 'application/json',
                text: JSON.stringify(response.data)
            },
            redirectURL: '',
            headersSize: -1,
            bodySize: -1
        },
        cache: {},
        timings: {
            send: -1,
            wait: -1,
            receive: -1
        }
    };
}

export function writeHarFile(testName) {
    
    const har = {
        log: {
            version: '1.2',
            creator: {
                name: 'verify.scim.dev',
                version: '1.0'
            },
            pages: [], // Add empty pages array
            entries: harEntries
        }
    };
    
    const harPath = testName;
    fs.writeFileSync(harPath, JSON.stringify(har, null, 2));
    harEntries = []; // Clear entries after writing
}

export function clearHarEntries() {
    harEntries = [];
}

/**
 * 
 * @param {*} config 
 * @param TestContext testContext 
 * @returns 
 */
export function getAxiosInstance(config, testContext = null) {
    const instance = axios.create({
        baseURL: config.baseURL,
        headers: {
            'Authorization': `${config.authHeader}`,
            'User-Agent': 'verify.scim.dev'
        },
        validateStatus: function (status) {
            // Return true for any status code (don't throw errors)
            return true;
        }
    });

    const t = testContext;

    // Add request interceptor to log the raw HTTP request
    instance.interceptors.request.use(request => {
        return request;
    });

    // Add response interceptor to log the raw HTTP response
    instance.interceptors.response.use(response => {
        const harEntry = createHarEntry(t, response.config, response);
        
        if(process.env.HAR_VIA_DIAGNOSTIC) {
            t?.diagnostic(harEntry);
        }

        harEntries.push(harEntry);

        return response;
    }, error => {
        if (error.response) {
            const harEntry = createHarEntry(error.response.config, error.response);
            
            if(process.env.HAR_VIA_DIAGNOSTIC) {
                t?.diagnostic(harEntry);
            }

            harEntries.push(harEntry);
        }
        return Promise.reject(error);
    });
    return instance;
}

export function canonicalize(resource, schema){
    // Create a deep copy of the user object
    const canonicalizedResource = JSON.parse(JSON.stringify(resource));
    const schemas = canonicalizedResource.schemas || [];

    // Find the core schema (usually first in the schemas array)
    // ... but not necessarily. For this, we need to check the ResourceTypes endpoint
    const coreSchema = schema.id;

    if (coreSchema) {
        // Initialize the core schema object if it doesn't exist
        if (!canonicalizedResource[coreSchema]) {
            canonicalizedResource[coreSchema] = {};
        }
        
        // Move attributes that are not schemas, meta, id, or extension schemas to the core schema
        Object.keys(canonicalizedResource).forEach(key => {
            // Skip schemas, meta, id, and extension schemas (which start with urn: but aren't the core schema)
            if (key === 'schemas' || key === 'meta' || key === 'id' || key == 'externalId' || schemas.includes(key)) {
                return;
            }
            
            // Move the attribute to the core schema and delete from root
            canonicalizedResource[coreSchema][key] = canonicalizedResource[key];
            delete canonicalizedResource[key];
        });
    }

    return canonicalizedResource;
}
