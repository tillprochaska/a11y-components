function createElement(tag, { html, attrs, events } = {}, createFunction) {
	createFunction = createFunction || getCreateFunction();
	let $element = createFunction(tag);

	let addChild = (html) => {
		if(html instanceof Element) {
			$element.appendChild(html);
		} else if(typeof html === 'string') {
			let $text = document.createTextNode(html);
			$element.appendChild($text);
		}
	}

	if(html !== undefined) {
		if(Array.isArray(html)) {
			for(let item of html) {
				addChild(item);
			}
		} else {
			addChild(html);
		}
	}

	if(attrs) {
		for(let attr in attrs) {
			$element.setAttribute(attr, attrs[attr]);
		}
	}

	if(events) {
		for(let event in events) {
			$element.addEventListener(event, events[event]);
		}
	}

	return $element;
};

function createSvgElement(tag, options) {
	return createElement(tag, options, getCreateFunction('http://www.w3.org/2000/svg'));
}

function getCreateFunction(namespace) {
	if(namespace) {
		return (tag) => document.createElementNS(namespace, tag);
	} else {
		return (tag) => document.createElement(tag);
	}
}

export { createElement, createSvgElement };