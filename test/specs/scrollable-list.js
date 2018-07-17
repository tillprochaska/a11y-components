const { getOptionsScrollTop } = require('../support/helpers.js');

const chai = require('chai');
global.expect = chai.expect;
chai.Should();

const URL = '/test/fixtures/large-dataset';

describe('select component with many options', () => {

    beforeEach(() => {
        browser.url(URL);
    });

    describe('scroll behaviour', () => {

        beforeEach(() => {
            browser.click('a11y-select');
        });

        it('does not change scroll position if highlighted option is in view', () => {
            let scrollBefore = getOptionsScrollTop();
            browser.keys(['ArrowDown', 'ArrowDown']);
            let scrollAfter = getOptionsScrollTop();
            scrollBefore.should.equal(scrollAfter);
        });

        it('scrolls highlighted option to bottom if below visible part of list', () => {
            let scrollBefore = getOptionsScrollTop();
            browser.keys(Array(10).fill('ArrowDown'));
            let scrollAfter = getOptionsScrollTop();
            scrollBefore.should.be.below(scrollAfter);
        });

        it('scrolls highlighted option to top if above visible part of list', () => {
            // option is not visible so it needs to
            // be clicked programmatically
            browser.execute(() => {
                document.querySelector('a11y-select-option:last-child').click();
            });
            browser.click('a11y-select');

            let scrollBefore = getOptionsScrollTop();
            browser.keys(Array(10).fill('ArrowUp'));
            let scrollAfter = getOptionsScrollTop();
            scrollBefore.should.be.above(scrollAfter);
        });

    });

});