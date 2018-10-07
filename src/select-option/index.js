import { createElement, createSvgElement } from '../helpers/createElement.js';
import { attachShadow } from '../helpers/attachShadow.js';
import styles from './styles.css';

export default class A11ySelectOption extends HTMLElement {

    constructor() {
        super();

        this.setAttribute('role', 'option');
        this.tabIndex = -1;
    }

    connectedCallback() {
        this._addElements();
        this._addListeners();
    }

    _addElements() {
        let shadowRoot = attachShadow(this, styles);
        let $slot = createElement('slot');
        shadowRoot.appendChild($slot);
    }

    _addListeners() {
        this.addEventListener('mousedown', event => {
            // If the option is not selectable (e. g. it’s disabled)
            // prevent loosing focus and do not send any events.
            // Ad the `click` event is fired after pressing and releasing
            // the mouse, but focus shifts as soon as the `mousedown` event
            // occurs on a focussable element, we need to prevent it
            // in this event handler.
            event.preventDefault();
        });

        this.addEventListener('click', event => {
            // Stopping the event from bubbling up in order
            // to prevent event listeners on the main select
            // to reopen the component etc.
            event.stopPropagation();
            if(this.isSelectable()) {
                this.select();
            }
        });

        this.addEventListener('keydown', event => {
            if([' ', 'Spacebar', 'Enter'].includes(event.key)) {
                // Stopping event propagation for the same
                // reasons as above.
                event.stopPropagation();
                if(this.isSelectable()) {
                    this.select();
                }
            }
        });

        this.addEventListener('mousemove', () => {
            if(this.isSelectable() && !this.highlighted) {
                this.highlight();
            }
        });
    }

    get label() {
        return this.textContent;
    }

    set label(value) {
        this.innerHTML = value;
    }

    get value() {
        if(this.hasAttribute('value')) {
            return this.getAttribute('value');
        } else {
            return this.textContent;
        }
    }

    set value(value) {
        if(value) {
            this.setAttribute('value', value);
        } else {
            this.removeAttribute('value');
        }
    }

    select() {
        this.selected = true;
        let click = new CustomEvent('select', { bubbles: true });
        this.dispatchEvent(click);
    }

    get selected() {
        return this.hasAttribute('selected');
    }

    set selected(value) {
        if(value) {
            this.setAttribute('selected', '');
            this.setAttribute('aria-selected', 'true');
        } else {
            this.removeAttribute('selected');
            this.setAttribute('aria-selected', 'false');
        }
    }

    highlight() {
        this.highlighted = true;
        let event = new CustomEvent('highlight', { bubbles: true });
        this.dispatchEvent(event);
    }

    get highlighted() {
        return document.activeElement === this;
    }

    set highlighted(value) {
        if(value) {
            this.focus();
        }
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(value) {
        if(value) {
            this.setAttribute('value', value);
        } else {
            this.removeAttribute('disabled', value);
        }
    }

    isSelectable() {
        return !this.disabled;
    }

    _getNextOptionNode() {
        return this.nextElementSibling;
    }

    _getPreviousOptionNode() {
        return this.previousElementSibling;
    }

}
