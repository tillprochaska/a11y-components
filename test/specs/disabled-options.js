const { isExpanded, isClosed, isFocussed, isSelected, isHighlighted } = require('../support/helpers.js');
const URL = '/test/fixtures/disabled-options.html';

describe('select component', () => {

    beforeEach(() => {
        browser.url(URL);
    });

    it('automatically selects the first selectable option if the value isn’t explicitly set', () => {
        isSelected('Blackberries');
    });

    describe('if open', () => {

        beforeEach(() => {
            browser.click('a11y-select');
        });

        it('does not change highlighted option when hovering over disabled options', () => {
            isHighlighted('Blackberries');
            browser.moveToObject('a11y-select-option:nth-child(2)');
            isHighlighted('Blackberries');
            browser.moveToObject('a11y-select-option:nth-child(4)');
            isHighlighted('Blueberries');
        });

        it('does not change selected or highlighted option when clicking on disabled options', () => {
            isSelected('Blackberries');
            isHighlighted('Blackberries');
            browser.click('a11y-select-option:nth-child(2)');
            isSelected('Blackberries');
            isHighlighted('Blackberries');
        });

        it('highlights first/last selectable option on cmd/alt/ctrl and arrow up/down', () => {
            // Meta keys vary on different operating systems, so it’s
            // sufficient to test if any of the following key combinations
            // passes the test.

            browser.keys(['Control', 'ArrowDown']);
            browser.keys(['Meta', 'ArrowDown']);
            browser.keys(['Alt', 'ArrowDown']);

            isHighlighted('Pineapples');
            isSelected('Blackberries');

            browser.keys(['Control', 'ArrowUp']);
            browser.keys(['Meta', 'ArrowUp']);
            browser.keys(['Alt', 'ArrowUp']);

            isHighlighted('Blackberries');
            isSelected('Blackberries');
        })

    });

});
