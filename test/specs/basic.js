const chai = require('chai');
global.expect = chai.expect;
chai.Should();

const URL = '/test/fixtures/basic.html';

let isExpanded = () => {
    browser.isVisible('a11y-select-option:first-child').should.be.true;
    browser.getAttribute('a11y-select', 'aria-expanded').should.equal('true');
};

let isClosed = () => {
    browser.isVisible('a11y-select-option:first-child').should.be.false;
    browser.getAttribute('a11y-select', 'aria-expanded').should.equal('false');
};

let isFocussed = () => {
    browser.hasFocus('a11y-select').should.be.true;
}

let isSelected = (value) => {
    browser.getHTML('a11y-select-option[selected]', false).should.equal(value);
    browser.getHTML('a11y-select-option[aria-selected="true"]', false).should.equal(value);
};

let isHighlighted = (value) => {
    browser.getHTML('a11y-select-option[highlighted]', false).should.equal(value);
};

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

            it('has focus', () => {
                isFocussed();
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

    describe('if open and focussed', () => {

        beforeEach(() => {
            browser.click('a11y-select');
            isSelected('Apples');
            isHighlighted('Apples');
        });

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

        it('highlights the first option that begins with that key after pressing a key', () => {
            browser.keys(['B']);
            isHighlighted('Bananas');
        });

        it('highlights the first option that starts with that string after pressing multiple keys successively', () => {
            browser.keys(['B', 'L']);
            isHighlighted('Blueberries');
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