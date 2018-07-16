import { createElement } from './createElement.js';

function attachShadow(self, styles) {
	let $style = createElement('style', {
	    html: styles
	});

	let shadowRoot = self.attachShadow({ mode: 'open' });
	shadowRoot.appendChild($style);

	return shadowRoot;
}

export { attachShadow };