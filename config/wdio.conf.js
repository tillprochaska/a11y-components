let service = process.env.TRAVIS ? 'remote' : 'local';
let envConfig = require(`./wdio.${ service }.conf.js`);

let config = {

    specs: [
        './test/specs/**/*.js'
    ],

    sync: true,
    logLevel: 'silent',
    coloredLogs: true,
    deprecationWarnings: false,

    bail: 0,
    screenshotPath: './screenshots',
    connectionRetryCount: 3,

    reporters: ['spec'],
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd'
    },

    before() {
        const chai = require('chai');
        global.expect = chai.expect;
        chai.Should();
    }

};

config = Object.assign(config, envConfig);
module.exports = { config };
