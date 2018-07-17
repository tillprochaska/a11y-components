import { createElement, createSvgElement } from '../helpers/createElement.js';
import { attachShadow } from '../helpers/attachShadow.js';
import styles from './styles.css';

import A11ySelectOption from '../select-option/index.js';

export default class A11ySelect extends HTMLElement {

    constructor() {
        super();

        this.tabIndex = 0;
        this.setAttribute('role', 'button');
        this.setAttribute('aria-haspopup', 'listbox');
        this.close();
    }

    connectedCallback() {
        this._addElements();
        this._addListeners();
    }

    _addElements() {
        let shadowRoot = attachShadow(this, styles);

        this.$label = createElement('span', {
            attrs: {
                class: 'select-field-label',
            }
        });

        // create dropdown icon
        let $icon = createSvgElement('svg', {
            attrs: {
                class: 'select-field-icon',
                viewBox: '0 0 32 32',
                'aria-hidden': 'true'
            },
            html: createSvgElement('path', {
                attrs: {
                    d: 'M16.003 18.626l7.081-7.081L25 13.46l-8.997 8.998-9.003-9 1.917-1.916z'
                }
            })
        });

        // create visible field
        this.$field = createElement('div', {
            attrs: {
                class: 'select-field',
            },
            html: [ this.$label, $icon ]
        });

        // create options list
        this.$options = createElement('div', {
            attrs: {
                class: 'select-options',
                role: 'listbox',
            },
            html: createElement('slot')
        });

        shadowRoot.appendChild(this.$field);
        shadowRoot.appendChild(this.$options);
    }

    _addListeners() {
        // This ensures that an option is selected, e. g. when
        // no option is explicitly selected or the selected option
        // is removed from the DOM.
        this.shadowRoot.querySelector('slot').addEventListener('slotchange', () => {
            this.select(this.value);
        });

        // toggle select on click
        this.$field.addEventListener('click', event => this.toggle());

        // close select if focus moves out of select
        this.addEventListener('focusout', event => {
            window.setTimeout(() => {
                if(!this.contains(document.activeElement)) {
                    this.close();
                }
            }, 0);
        });

        // This listens for the custom `select` event, which is
        // usually fired by instances of A11ySelectOption on click.
        this.addEventListener('select', event => {
            if(event.target instanceof A11ySelectOption) {
                this.select(event.target);
                this.close();
                this.focus();
            }
        });

        // This listens for the custom `highlight` event, which is
        // usually fired by instances of A11ySelectOption on mouseover.
        this.addEventListener('highlight', event => {
            if(event.target instanceof A11ySelectOption) {
                this.highlight(event.target);
            }
        });

        this.addEventListener('keydown', event => {
            if(!this.isOpen) {

                // opens select on arrow up/down or space key
                if([' ', 'Spacebar', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                    this.open();
                    return;
                }

            } else {

                // close on escape key
                if(['Escape', 'Esc'].includes(event.key)) {
                    this.close();
                    return;
                }

                // highlights previous option on arrow up
                if(event.key === 'ArrowUp') {
                    let $prev = this._getHighlightedOptionNode()._getPreviousOptionNode();
                    this.highlight($prev);
                    return;
                }

                // highlights next option on arrow down
                if(event.key === 'ArrowDown') {
                    let $next = this._getHighlightedOptionNode()._getNextOptionNode();
                    this.highlight($next);
                    return;
                }
                
                // highlights option starting with pressed key
                this.typeahead(event.key);

            }

        });
    }

    get label() {
        return this.hasAttribute('label') ? this.getAttribute('label') : null;
    }

    set label(value) {
        if(value) {
            this.setAttribute('label', value);
        } else {
            this.removeAttribute('label');
        }
    }

    get value() {
        let $options = this._getOptionNodes();
        let $selected = this._getSelectedOptionNode();

        // if there aren’t any options, return an empty string
        if($options.length < 1) {
            return '';
        }

        // if no option is selected explicitly, return first option
        if(!$selected) {
            return $options[0].value;
        }

        return $selected.value;
    }

    set value(value) {
        this.select(value);
    }

    // select an option by element reference or value
    select(option) {
        if(!option) return;

        let $options = this._getOptionNodes();
        let $selected = this._getOptionNode(option);

        // select given option, unselect any other options
        $options.forEach($option => {
            if($option !== $selected) {
                $option.selected = false;
            } else {
                $option.selected = true;
            }
        });

        // update the select’s label
        this.$label.innerHTML = $selected.label;
        if(this.label) {
            this.setAttribute('aria-label', `${ this.label }: ${ $selected.label }`);
        } else {
            this.setAttribute('aria-label', $selected.label);
        }
    }

    // highlight an option by element reference or value
    highlight(option) {
        if(!option) return;

        let $options = this._getOptionNodes();
        let $highlighted = this._getOptionNode(option);

        // highlight given option, remove highlight from all
        // other options
        $options.forEach($option => {
            if($option !== $highlighted) {
                $option.highlighted = false;
            } else {
                $option.highlighted = true;
            }
        });
    }

    // highlight the first option that starts with
    // the given key or key sequence
    typeahead(key) {

        // Cancel a potential timeout that has been set after
        // previous keyboard events
        if(this._typeaheadTimeout) {
            clearTimeout(this._typeaheadTimeout);
        }

        // Set the string options will be filtered for. This is
        // either a single character, the given key, or if other
        // keys have been pressed before, the a sequence of keys.
        let filter = (this._typeaheadCache ? this._typeaheadCache : '') + event.key;
        let $options = this._getOptionNodes();

        // Find the first option that matches the filter string. In
        // the case that no option matches the full filter string,
        // this also filters for the single character, that has been
        // pressed most recently.
        let $fullMatch = null;
        let $partialMatch = null;

        for(let $option of $options) {
            let label = $option.label.toLowerCase();

            if(!$fullMatch && label.startsWith(filter)) {
                $fullMatch = $option;
                break;
            } else if(!$partialMatch && label.startsWith(event.key)) {
                $partialMatch = $option;
            }
        }

        // If a fullly or partially matching option has been,
        // it is highlighted and the cache is updated.
        if($fullMatch) {
            this.highlight($fullMatch);
            this._typeaheadCache = filter;
        } else if($partialMatch) {
            this.highlight($partialMatch);
            this._typeaheadCache = event.key;
        } else {
            this._typeaheadCache = null;
        }

        // Finally, a timeout is set to reset the filter cache
        // after a given period of inactivity. If a new key is
        // pressed before the timeout expires, it is cancelled
        // at the beginning of this method.
        this._typeaheadTimeout = setTimeout(() => {
            this._typeaheadCache = null;
        }, 500);
        
    }

    toggle() {
        if(this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.setAttribute('aria-expanded', 'true');
        this.highlight(this.value);
    }

    close() {
        this.isOpen = false;
        this.setAttribute('aria-expanded', 'false');
    }

    _getOptionNodes() {
        return this
            .shadowRoot
            .querySelector('slot')
            .assignedNodes()
            .filter($node => {
                return $node instanceof A11ySelectOption;
            });
    }

    // helper to find an option by element reference or value
    _getOptionNode(option) {
        let $options = this._getOptionNodes();

        if(option instanceof A11ySelectOption) {
            return $options.find($option => $option === option);
        } else {
            return $options.find($option => $option.value === option);
        }
    }

    _getSelectedOptionNode() {
        return this._getOptionNodes().find($option => $option.selected);
    }

    _getHighlightedOptionNode() {
        return this._getOptionNodes().find($option => $option.highlighted);
    }

}