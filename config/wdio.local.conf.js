const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
	return handler(request, response);
});

module.exports = {

    services: ['selenium-standalone'],
    baseUrl: 'http://localhost:3000',

    maxInstances: 1,
    capabilities: [{
        browserName: 'chrome'
    }],

    onPrepare(config) {
    	return new Promise((resolve, reject) => {
    		server.listen(3000, () => resolve());
    	});
    },

    onComplete() {
    	return new Promise((resolve, reject) => {
    		server.close(() => resolve());
    	});
    },

};