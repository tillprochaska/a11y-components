import { createElement, createSvgElement } from '../helpers/createElement.js';
import { attachShadow } from '../helpers/attachShadow.js';
import styles from './styles.css';

export default class A11ySelectOption extends HTMLElement {

    constructor() {
        super();

        this.setAttribute('role', 'menuitem');
        this.tabIndex = -1;
    }

    connectedCallback() {
        this._addElements();
        this._addListeners();
    }

    _addElements() {
        let shadowRoot = attachShadow(this, styles);

        let $icon = createSvgElement('svg', {
            attrs: {
                viewBox: '0 0 32 32',
                class: 'select-option-icon',
                'aria-hidden': 'true'
            },
            html: createSvgElement('path', {
                attrs: {
                    d: 'M5 16.577l2.194-2.195 5.486 5.484L24.804 7.743 27 9.937l-14.32 14.32z'
                }
            })
        });

        shadowRoot.appendChild($icon);

        let $slot = createElement('slot');
        shadowRoot.appendChild($slot);
    }

    _addListeners() {
        this.addEventListener('click', () => {
            let event = new CustomEvent('select', { bubbles: true });
            this.dispatchEvent(event);
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