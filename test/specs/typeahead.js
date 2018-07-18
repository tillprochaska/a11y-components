const { isSelected, isHighlighted } = require('../support/helpers.js');
const URL = '/test/fixtures/basic.html';

describe('select component', () => {

    beforeEach(() => {
        browser.url(URL);
    });

    describe('if closed and focussed', () => {

        beforeEach(() => {
            browser.execute(() => {
                document.querySelector('a11y-select').focus();
            });
        });

        it('selects first option starting with pressed key', () => {
            browser.keys(['b']);
            isSelected('Bananas');
        });

        it('selects first option starting with a sequence of pressed keys', () => {
            browser.keys(['b', 'l']);
            isSelected('Blueberries');
        });

        it('selects first option starting with the key pressed most recently if no option matches full key sequence', () => {
            browser.keys(['b', 'l', 'o']);
            isSelected('Oranges');
        });

    });

    describe('if open and focussed', () => {

        beforeEach(() => {
            browser.click('a11y-select');
        });

        it('highlights first option starting with pressed key', () => {
            browser.keys(['b']);
            isHighlighted('Bananas');
        });

        it('highlights first option starting with a sequence of pressed keys', () => {
            browser.keys(['b', 'l']);
            isHighlighted('Blueberries');
        });

        it('highlights first option starting with the key pressed most recently if no option matches full key sequence', () => {
            browser.keys(['b', 'l', 'o']);
            isHighlighted('Oranges');
        });

    });

});