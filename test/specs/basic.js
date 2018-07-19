const { isExpanded, isClosed, isFocussed, isSelected, isHighlighted } = require('../support/helpers.js');
const URL = '/test/fixtures/basic.html';

describe('basic select component', () => {

    beforeEach(() => {
        browser.url(URL);
    });

    describe('if closed', () => {

        it('does not show options', () => {
            isClosed();
        });

        it('selects the first element by default', () => {
            isSelected('Apples');
        });

    });

    describe('after clicking', () => {

        beforeEach(() => {
            browser.click('a11y-select');
        });

        it('is open', () => {
            isExpanded();
        });

        it('highlights selected option', () => {
            isSelected('Apples');
            isHighlighted('Apples');
        });

        it('highlights option on mouseover', () => {
            browser.moveToObject('a11y-select-option:nth-child(3)');
            isHighlighted('Bananas');
        });

        it('highlights option if the mouse is moved within that option', () => {
            browser.moveToObject('a11y-select-option:nth-child(3)', 5, 5);
            browser.keys(['ArrowUp']);
            browser.moveToObject('a11y-select-option:nth-child(3)', 10, 10);
            isHighlighted('Bananas');
        });

        it('selects an option on click', () => {
            browser.click('a11y-select-option:nth-child(3)');
            isSelected('Bananas');
        });

        it('restores focus after selecting an option via keyboard', () => {
            browser.keys(['ArrowDown', 'ArrowDown', 'Enter']);
            isFocussed();
        });

        it('restores focus after selecting an option via mouse click', () => {
            browser.click('a11y-select-option:nth-child(3)');
            isFocussed();
        });

        it('closes on blur', () => {
            browser.keys(['Tab']);
            isClosed();
        });

        it('closes on click', () => {
            browser.click('a11y-select');
            isClosed();
        });

    });

});