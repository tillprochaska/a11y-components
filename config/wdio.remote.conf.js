const path = require('path');

let eventType = process.env.TRAVIS_EVENT_TYPE.split('_')[0];
let branch    = process.env.TRAVIS_BRANCH;
let buildNo   = process.env.TRAVIS_BUILD_NUMBER;

module.exports = {

    services: ['browserstack'],
    baseUrl: `http://${ process.env.BROWSERSTACK_USER }.browserstack.com`,

    user: process.env.BROWSERSTACK_USER,
    key: process.env.BROWSERSTACK_KEY,

    browserstackLocal: true,
    browserstackOpts: {
        folder: path.resolve(__dirname, '../'),
    },

    maxInstances: 10,
    capabilities: [{
        browserName: 'chrome',
        version: '67',
    }].map(cap => Object.assign(cap, {
        project: 'accessible-select',
        build: `${ eventType }: ${ branch } (#${ buildNo })`
    })),

};