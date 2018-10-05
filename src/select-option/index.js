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
        this.addEventListener('click', event => {
            // Stopping the event from bubbling up in order
            // to prevent event listeners on the main select
            // to reopen the component etc.
            event.stopPropagation();
            let click = new CustomEvent('select', { bubbles: true });
            this.dispatchEvent(click);
        });

        this.addEventListener('keydown', event => {
            if([' ', 'Spacebar', 'Enter'].includes(event.key)) {
                // Stopping event propagation for the same
                // reasons as above.
                event.stopPropagation();
                let select = new CustomEvent('select', { bubbles: true });
                this.dispatchEvent(select);
            }
        });

        this.addEventListener('mousemove', () => {
            if(!this.highlighted) {
                let event = new CustomEvent('highlight', { bubbles: true });
                this.dispatchEvent(event);
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

    get highlighted() {
        return document.activeElement === this;
    }

    set highlighted(value) {
        if(value) {
            this.focus();
        }
    }

    _getNextOptionNode() {
        return this.nextElementSibling;
    }

    _getPreviousOptionNode() {
        return this.previousElementSibling;
    }

}
