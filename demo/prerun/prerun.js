const compile = require('./compile');
const cleanup = require('./cleanup');

// Remove the output directory before running the tests
cleanup();

// Compile the Handlebars template
compile();
