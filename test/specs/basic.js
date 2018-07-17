const { isExpanded, isClosed, isFocussed, isSelected, isHighlighted } = require('../support/helpers.js');

const chai = require('chai');
global.expect = chai.expect;
chai.Should();

const URL = '/test/fixtures/basic';

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

        describe('after clicking', () => {

            beforeEach(() => {
                browser.click('a11y-select');
            });

            it('is open', () => {
                isExpanded();
            });

            it('has highlighted the currently selected option', () => {
                isSelected('Apples');
            });

        });

        describe('if focussed', () => {

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

    });

    describe('if open', () => {

        beforeEach(() => {
            browser.click('a11y-select');
        });

        it('highlights selected option', () => {
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

        describe('if focussed', () => {

            it('closes on blur', () => {
                browser.keys(['Tab']);
                isClosed();
            });

            it('closes on click', () => {
                browser.click('a11y-select');
                isClosed();
            });

            it('highlights prev/next option on arrow up/down', () => {
                browser.keys(['ArrowDown']);
                isHighlighted('Mangos');
                isSelected('Apples');

                browser.keys(['ArrowUp']);
                isHighlighted('Apples');
                isSelected('Apples');
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

});