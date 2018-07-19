const { isExpanded, isClosed, isFocussed, isSelected, isHighlighted } = require('../support/helpers.js');
const URL = '/test/fixtures/basic.html';

describe('basic select component', () => {

    beforeEach(() => {
        browser.url(URL);
    });

    describe('if closed and focussed', () => {

        beforeEach(() => {
            browser.execute(() => {
                document.querySelector('a11y-select').focus();
            });
        });

        it('expands and highlights selection when pressing space bar', () => {
            browser.keys(['ArrowDown']);
            isExpanded();
            isHighlighted('Apples');
        });

        it('expands and highlights selection when pressing enter', () => {
            browser.keys(['Enter']);
            isExpanded();
            isHighlighted('Apples');
        })

        it('expands and highlights selection when pressing arrow down key', () => {
            browser.keys(['ArrowDown']);
            isExpanded();
            isHighlighted('Apples');
        });

        it('expands and highlights selection when pressing arrow up key', () => {
            browser.keys(['ArrowUp']);
            isExpanded();
            isHighlighted('Apples');
        });

    });

    describe('if open and focussed', () => {

        beforeEach(() => {
            browser.click('a11y-select');
        });

        it('highlights prev/next option on arrow up/down', () => {
            browser.keys(['ArrowDown']);
            isHighlighted('Mangos');
            isSelected('Apples');

            browser.keys(['ArrowUp']);
            isHighlighted('Apples');
            isSelected('Apples');
        });

        it('selects the currently highlighted option on space bar', () => {
            browser.keys(['ArrowDown', ' ']);
            isSelected('Mangos');
            isClosed();
        });

        it('selects the currently highlighted option on enter', () => {
            browser.keys(['ArrowDown', 'Enter']);
            isSelected('Mangos');
            isClosed();
        });

        it('does not change the selected option on escape', () => {
            browser.keys(['ArrowDown', 'Escape']);
            isSelected('Apples');
            isClosed();
        });

    });

});