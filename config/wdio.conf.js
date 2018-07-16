exports.config = {

    specs: [
        './test/specs/**/*.js'
    ],

    services: ['selenium-standalone'],
    maxInstances: 1,
    capabilities: [{
        browserName: 'chrome'
    }],

    sync: true,
    logLevel: 'silent',
    coloredLogs: true,
    deprecationWarnings: true,

    bail: 0,
    screenshotPath: './screenshots',
    baseUrl: 'http://localhost:5000',
    connectionRetryCount: 3,

    reporters: ['spec'],
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd'
    },

}
