module.exports = {

    isExpanded() {
        browser.isVisible('a11y-select-option:first-child').should.be.true;
        browser.getAttribute('a11y-select', 'aria-expanded').should.equal('true');
    },

    isClosed() {
        browser.isVisible('a11y-select-option:first-child').should.be.false;
        browser.getAttribute('a11y-select', 'aria-expanded').should.equal('false');
    },

    isFocussed() {
        browser.hasFocus('a11y-select').should.be.true;
    },

    isSelected(value) {
        browser.getHTML('a11y-select-option[selected]', false).should.equal(value);
        browser.getHTML('a11y-select-option[aria-selected="true"]', false).should.equal(value);
    },

    isHighlighted(value) {
        browser.getHTML('a11y-select-option:focus', false).should.equal(value);
    },

    getOptionsScrollTop(selector = 'a11y-select') {
        return browser.execute((selector) => {
            return document
                .querySelector(selector)
                .shadowRoot
                .querySelector('.select-options')
                .scrollTop;
        }, selector).value;
    }

};