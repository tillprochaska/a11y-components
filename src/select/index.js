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

        // create visible field
        this.$field = createElement('div', {
            attrs: {
                class: 'select-field',
            },
            html: this.$label
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
                if([' ', 'Spacebar', 'Enter', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                    event.preventDefault();
                    this.open();
                    return;
                }

            }

            if(this.isOpen) {

                // close on escape key
                if(['Escape', 'Esc'].includes(event.key)) {
                    this.close();
                    this.focus();
                    return;
                }

                // highlights previous/first option on arrow up
                if(event.key === 'ArrowUp') {
                    event.preventDefault();
                    let $previous;

                    if(event.metaKey || event.altKey || event.ctrlKey) {
                        // if meta/alt/ctrl key is pressed, jump to first option
                        this.highlightFirst();
                    } else {
                        // otherwise highlight previous option
                        this.highlightPrevious();
                    }

                    let $highlighted = this._getHighlightedOptionNode();
                    this._scrollOptionIntoView($highlighted, 'top');

                    return;
                }

                // highlights next option on arrow down
                if(event.key === 'ArrowDown') {
                    event.preventDefault();

                    if(event.metaKey || event.altKey || event.ctrlKey) {
                        // if meta/alt/ctrl key is pressed, jump to last option
                        this.highlightLast();
                    } else {
                        // otherwise highlight next option
                        this.highlightNext();
                    }

                    let $highlighted = this._getHighlightedOptionNode();
                    this._scrollOptionIntoView($highlighted, 'bottom');

                    return;
                }

            }

            // directly select matching option if closed,
            // otherwise just highlight
            if(!this.isOpen) {
                let $match = this.typeahead(event.key);
                this.select($match);
            } else {
                let $match = this.typeahead(event.key);
                this.highlight($match);
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
            return this._getNextSelectableOptionNode();
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

        if(!$highlighted || !$highlighted.isSelectable()) {
            return;
        }

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

    highlightFirst() {
        let $options = this._getSelectableOptionNodes();
        if($options.length <= 0) return;
        this.highlight($options[0]);
    }

    highlightLast() {
        let $options = this._getSelectableOptionNodes();
        if($options.length <= 0) return;
        this.highlight($options[$options.length - 1]);
    }

    highlightNext() {
        let $highlighted = this._getHighlightedOptionNode();
        let $next = this._getNextSelectableOptionNode($highlighted);
        this.highlight($next);
    }

    highlightPrevious() {
        let $highlighted = this._getHighlightedOptionNode();
        let $previous = this._getPreviousSelectableOptionNode($highlighted);
        this.highlight($previous);
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
            if(!$option.isSelectable()) continue;
            let label = $option.label.toLowerCase();

            if(label.startsWith(filter)) {
                $fullMatch = $option;
                break;
            } else if(!$partialMatch && label.startsWith(event.key)) {
                $partialMatch = $option;
            }
        }

        // Reset the filter cache after a given period of inactivity.
        // If another key is pressed before the timeout expires, it
        // is cancelled at the beginning of this method.
        this._typeaheadTimeout = setTimeout(() => {
            this._typeaheadCache = null;
        }, 500);

        // If a fullly or partially matching option has been,
        // it is returned and the cache is updated.
        if($fullMatch) {
            this._typeaheadCache = filter;
            return $fullMatch
        } else if($partialMatch) {
            this._typeaheadCache = event.key;
            return $partialMatch;
        } else {
            this._typeaheadCache = null;
        }

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
        this._scrollOptionIntoView(this.value);
        this.highlight(this.value);
    }

    close() {
        this.isOpen = false;
        this.setAttribute('aria-expanded', 'false');
    }

    // This methods makes sure that the given option is
    // in the visible part of the options list. The second
    // parameter specifies the scroll direction. If the
    // given is not visible, `top` and `bottom` scroll the
    // option to the top and bottom of the list, respectively.
    _scrollOptionIntoView(option, dir = 'top') {
        if(!option) return;

        let $option      = this._getOptionNode(option);
        let listScroll   = this.$options.scrollTop;
        let listHeight   = this.$options.getBoundingClientRect().height;
        let optionTop    = $option.offsetTop;
        let optionHeight = $option.getBoundingClientRect().height;

        if(optionTop < listScroll || optionTop + optionHeight > listScroll + listHeight) {
            if(dir === 'top') {
                // option is scrolled to the top
                this.$options.scrollTop = optionTop;
            } else {
                // option is scrolled top the bottom
                this.$options.scrollTop = optionTop - listHeight + optionHeight;
            }
        }
    }

    _getOptionNodes(filter = () => true) {
        return this
            .shadowRoot
            .querySelector('slot')
            .assignedNodes()
            .filter($node => {
                return $node instanceof A11ySelectOption && filter($node);
            });
    }

    _getSelectableOptionNodes() {
        return this._getOptionNodes($node => $node.isSelectable());
    }

    // helper to find an option by element reference or value
    _getOptionNode(option) {
        let $options = this._getOptionNodes();

        if(option instanceof A11ySelectOption) {
            return option;
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

    _getNextOptionNode(option, filter = () => true, ring = false) {
        let $option = this._getOptionNode(option);

        // if no valid option is given, return the first option
        if(!$option) {
            return this._getOptionNodes(filter)[0];
        }

        let $next = $option._getNextOptionNode();
        let passesFilter = $next && filter($next);

        while($next && $next !== $option && !passesFilter) {
            $next = $next._getNextOptionNode();

            if(!$next && ring) {
                $next = this._getOptionNodes()[0];
            }

            passesFilter = $next && filter($next);
        }

        return $next;
    }

    _getNextSelectableOptionNode(option, filter = () => true, ring) {
        return this._getNextOptionNode(option, $node => {
            return $node.isSelectable() && filter($node);
        }, ring);
    }

    _getPreviousOptionNode(option, filter = () => true, ring = false) {
        let $option = this._getOptionNode(option);

        // if no option is given, return the last option
        if(!$option) {
            let $options = this._getOptionNodes(filter);
            return $options[$options.length - 1];
        }

        let $previous = $option._getPreviousOptionNode();
        let passesFilter = $previous && filter($previous);

        while($previous && $previous !== $option && !passesFilter) {
            $previous = $previous._getPreviousOptionNode();

            if(!$previous && ring) {
                $options = this.getOptionNodes();
                $previous = $options[$options.length];
            }

            passesFilter = $previous && filter($previous);
        }

        return $previous;
    }

    _getPreviousSelectableOptionNode(option, filter = () => true, ring) {
        return this._getPreviousOptionNode(option, $node => {
            return $node.isSelectable() && filter($node);
        }, ring);
    }

}
