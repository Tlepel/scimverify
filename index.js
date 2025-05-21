// Main entry point for the scimverify package
import { runAllTests } from './scim.test.js';
import runBasicTests from './src/basics.js';
import runUserTests from './src/users.js';
import runGroupTests from './src/groups.js';
import runResourceTypeTests from './src/resourcetypes.js';
import { runTests as runSchemaTests } from './src/schemas.js';
import { getAxiosInstance, writeHarFile, clearHarEntries } from './src/helpers.js';

// Export main functionality
export { 
  runAllTests,
  runBasicTests,
  runUserTests, 
  runGroupTests,
  runResourceTypeTests,
  runSchemaTests,
  getAxiosInstance,
  writeHarFile,
  clearHarEntries
};

// Default export for convenience
export default runAllTests;
