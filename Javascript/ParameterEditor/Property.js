
let ParameterCategory = {
	APPEARANCE: 1,
	TRIGGER: 2,
	EFFECT: 3,
	CONTENT: 4,
};

/*
let ParameteType = {
	STRING: 1,
	NUMBER: 2,
	SELECTION: 3,
	PICTURE: 4,
	POSITION: 5,
	NODELIST: 6,
	SWITCH: 7,
	LABELLIST: 8,
	NODE: 9,
	TENSORLIST: 10,
}; */


/**
 * @class
 */
class PropertyList {
	/**
	 */
	constructor() {
		this.list = [];
	}

	/**
	 * @param  {Property} prop
	 * @return {Property}
	 */
	addProperty(prop) {
		this.list.push(prop);
		return prop;
	}

	/**
	 * @param  {Property} labelProperty The property containing the labels should always be present
	 */
	clearProperties(labelProperty) {
		this.list = [labelProperty];
	}

	/**
	 * @return {Array}
	 */
	getProperties() {
		return this.list;
	}

	/**
	 * @param {element} element
	 * @param {number} ignoreLabels
	 */
	populateProperties(element, ignoreLabels) {
		element.innerHTML = '';

		let labelArea = document.createElement('div');
		// labelArea.classList.add('dummy');

		let otherArea = document.createElement('div');

		this.list[0].populateProperty(labelArea, otherArea);
		element.appendChild(labelArea);

		this.populateRest(otherArea);
		element.appendChild(otherArea);
	}

	/**
	 * @param {element} element
	 */
	populateRest(element) {
		element.innerHTML = '';
		for (let prop of this.list) {
			if (prop.propertyName != 'labelString') {
				prop.populateProperty(element);
			}
		}
	}

	/** Loop through all properties and display the values from the inputObject
	 * @param  {Object} inputObject
	 */
	updatePropertyValues(inputObject) {
		for (let i = 0; i < this.list.length; i++) {
			this.list[i].updatePropertyValue(inputObject);
		}
	}
}


/**
 * @class Property
 */
class Property {
	/**

	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 * @param  {Object} defaultValue
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue) {
		this.propertyName = propertyName;
		this.identity = 'editWindowTruss' + idHTML;
		this.title = displayTitle;
		this.help = helpText;
		this.defaultValue = defaultValue;
		this.HTMLElement = undefined;
	}

	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(serializeObject, localNodeList, tensorList) {
		return serializeObject;
	}

	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	deSerialize(serializeObject, localNodeList, tensorList) {
		return serializeObject;
	}

	/** creates the default value editing area and handles input updates
	 * @param  {String} id
	 * @param  {Element} parameterValue
	 * @return {Element}
	 */
	makeInputField(id, parameterValue) {
		let inputField = this.makeViewOfInputField(id, parameterValue);
		let _this = this;
		inputField.addEventListener('input', function(e) {
			universe.selectedObject[_this.propertyName] = inputField.value;
		}, false);
		return inputField;
	}

	/** Creates the default value editing area. This does not handle any input (see makeinputField)
	 * @param  {String} id
	 * @param  {Element} parameterValue
	 * @return {Element}
	 */
	makeViewOfInputField(id, parameterValue) {
		let inputField = document.createElement('input');
		inputField.type = 'text';
		inputField.value = 'Default';
		inputField.classList.add('text');
		inputField.classList.add('inputcss');
		inputField.id = id;
		inputField.style.width = '140px';
		parameterValue.appendChild(inputField);
		return inputField;
	}

	/** Creates the graphical representation of a name value pair and return the editable area
	 * @param  {Element} element
	 * @return {Element} The right hand side that should be filled with value container(s)
	 */
	createNameValuePair(element) {
		let outerDiv = document.createElement('div');
		outerDiv.id = this.identity + 'Container';
		// outerDiv.style.position='absolute';
		outerDiv.classList.add('parameterEditArea');
		element.appendChild(outerDiv);
		let valuePair = document.createElement('div');
		valuePair.classList.add('valuepair');
		outerDiv.appendChild(valuePair);
		let parameterName = document.createElement('div');
		parameterName.classList.add('lname');
		parameterName.title = this.help;
		parameterName.innerHTML = this.title;
		valuePair.appendChild(parameterName);
		let parameterValue = document.createElement('div');
		parameterValue.classList.add('rvalue');
		valuePair.appendChild(parameterValue);
		return parameterValue;
	}


	/**
	 * @param  {buttonObject} but
	 * @param  {Node} node1
	 */
	registerOnClick(but, node1) {
		but.addEventListener('click', function() {
			let previousSelectedObject = universe.selectedObject;
			universe.selectedObject = node1;
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': universe.selectedObject,
					'previousSelectedObject': previousSelectedObject,
					'trussNode': undefined,
				},
				bubbles: true,
				cancelable: true,
			});
			universe.currentNode.element.dispatchEvent(event);
		});
	}

	// This is called when the screen should be updated by a value change in an object
	/**
	 * @param  {Object} selectedObject
	 */
	updatePropertyValue(selectedObject) {
		let element = this.input;
		if ((element == undefined) || (element == null)) {
			console.log('updatePropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
			return;
		}
		if (selectedObject[this.propertyName]==undefined) {
			selectedObject[this.propertyName]=this.defaultValue;
		}
		element.value = selectedObject[this.propertyName];
	};
}

/* *********************************************************************************** */
/* *********************************************************************************** */
/* *********************************************************************************** */
/* *********************************************************************************** */
/* *********************************************************************************** */
/* *********************************************************************************** */
/* *********************************************************************************** */
/* *********************************************************************************** */
/* *********************************************************************************** */
/* *********************************************************************************** */
/* ************************************************************************************ */


/**
 * @class NumberProperty
 * @extends Property
 */
class NumberProperty extends Property {
	/**
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 * @param  {Object} defaultValue
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue) {
		super(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue);
	}


	/**
	 * @param {Element} element
	 * @param {Element} restArea
	 */
	populateProperty(element, restArea) {
		let display = '';
		let addNodeButton;
		this.HTMLElement = restArea;

		let parameterValue = this.createNameValuePair(element);
		this.input = this.makeInputField(this.identity, parameterValue);
		parameterValue.appendChild(this.input);
	}
}

/**
 * @class StringProperty
 * @extends Property
 */
class StringProperty extends Property {
	/**
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 * @param  {Object} defaultValue
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue) {
		super(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue);
	}


	/**
	 * @param {Element} element
	 * @param {Element} restArea
	 */
	populateProperty(element, restArea) {
		let display = '';
		let addNodeButton;
		this.HTMLElement = restArea;

		let parameterValue = this.createNameValuePair(element);
		this.input = this.makeInputField(this.identity, parameterValue);
		parameterValue.appendChild(this.input);
	}
}

/**
 * @class SwitchProperty
 * @extends Property
 */
class SwitchProperty extends Property {
	/**
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 * @param  {Object} defaultValue
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue) {
		super(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue);
	}


	/**
	 * @param {Element} element
	 * @param {Element} restArea
	 */
	populateProperty(element, restArea) {
		let display = '';
		let addNodeButton;
		this.HTMLElement = restArea;
		let parameterValue = this.createNameValuePair(element);
		this.input = this.makeSwitchField(this.identity, parameterValue);
	}

	/**
		 * @param  {String} id
		 * @param  {Element} parameterValue
		 * @return {Element}
		 */
	makeSwitchField(id, parameterValue) {
		// let inputField = this.makeViewOfSwitchField(id, parameterValue);

		let inputLabel = document.createElement('label');
		inputLabel.classList.add('switch');
		let inputField = document.createElement('input');
		inputField.type = 'checkbox';
		inputField.id = id;
		inputLabel.appendChild(inputField);

		let inputSpan = document.createElement('span');
		inputSpan.classList.add('slider');
		// inputSpan.classList.add('round');
		inputLabel.appendChild(inputSpan);

		parameterValue.appendChild(inputLabel);


		let _this = this;
		inputField.addEventListener('input', function(e) {
			universe.selectedObject[_this.propertyName] = inputField.checked;
		}, false);
		return inputField;
	}

	/**
		 * @param  {String} id
		 * @param  {Element} parameterValue
		 * @return {Element}
		 */
	makeViewOfSwitchField(id, parameterValue) {
		let inputLabel = document.createElement('label');
		inputLabel.classList.add('switch');
		let inputField = document.createElement('input');
		inputField.type = 'checkbox';
		inputField.id = id;
		inputLabel.appendChild(inputField);

		let inputSpan = document.createElement('span');
		inputSpan.classList.add('slider');
		// inputSpan.classList.add('round');
		inputLabel.appendChild(inputSpan);

		parameterValue.appendChild(inputLabel);
		return inputField;
	}

	// This is called when the screen should be updated by a value change in an object
	/**
	 * @param  {Object} selectedObject
	 */
	updatePropertyValue(selectedObject) {
		let element = this.input;
		if ((element == undefined) || (element == null)) {
			console.log('updatePropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
			return;
		}
		if (selectedObject[this.propertyName]==undefined) {
			selectedObject[this.propertyName]=this.defaultValue;
		}
		element.checked = selectedObject[this.propertyName];
	};
}

/**
 * @class PositionProperty
 * @extends Property
 */
class PositionProperty extends Property {
	/**
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 * @param  {Object} defaultValue
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue) {
		super(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue);
	}


	/**
	 * @param {Element} element
	 * @param {Element} restArea
	 */
	populateProperty(element, restArea) {
		let display = '';
		let addNodeButton;
		this.HTMLElement = restArea;
		let id = this.identity;

		let parameterValue = this.createNameValuePair(element);

		let xValuePair = document.createElement('div');
		xValuePair.classList.add('valuepair');
		xValuePair.classList.add('xyvaluepair');
		parameterValue.appendChild(xValuePair);
		let parameterName = document.createElement('div');
		parameterName.classList.add('lname');
		parameterName.innerHTML = 'X';
		xValuePair.appendChild(parameterName);
		let xparameterValue = document.createElement('div');
		xparameterValue.classList.add('rvalue');
		xValuePair.appendChild(xparameterValue);

		let xinputField = this.makeViewOfInputField(id + 'X', parameterValue);
		xinputField.style.width = '50px';
		xparameterValue.appendChild(xinputField);

		this.xInput = xinputField;

		let yValuePair = document.createElement('div');
		yValuePair.classList.add('valuepair');
		yValuePair.classList.add('xyvaluepair');
		parameterValue.appendChild(yValuePair);
		let yparameterName = document.createElement('div');
		yparameterName.classList.add('lname');
		yparameterName.innerHTML = 'Y';
		yValuePair.appendChild(yparameterName);
		let yparameterValue = document.createElement('div');
		yparameterValue.classList.add('rvalue');
		yValuePair.appendChild(yparameterValue);

		let yinputField = this.makeViewOfInputField(id + 'Y', parameterValue);
		yinputField.style.width = '50px';
		yparameterValue.appendChild(yinputField);

		this.yInput = yinputField;

		let _this = this;

		xinputField.addEventListener('input', function(e) {
			universe.selectedObject[_this.propertyName].x = parseInt(xinputField.value);
		}, false);

		yinputField.addEventListener('input', function(e) {
			universe.selectedObject[_this.propertyName].y = parseInt(yinputField.value);
		}, false);
	}

	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(serializeObject, localNodeList, tensorList) {
		return {
			'x': serializeObject.x,
			'y': serializeObject.y,
		};
	}

	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Position}
	 */
	deSerialize(serializeObject, localNodeList, tensorList) {
		return new Position(serializeObject.x, serializeObject.y);
	}

	// This is called when the screen should be updated by a value change in an object
	/**
	 * @param  {Object} selectedObject
	 */
	updatePropertyValue(selectedObject) {
		let elementX = this.xInput;
		let elementY = this.yInput;
		if ((elementX == undefined) || (elementX == null)) {
			console.log('updatePropertyValue cannot find HTML element ' + this.identity + 'X & Y. (Title:' + this.title + ')');
			return;
		} else {
			elementX.value = Math.round(100 * selectedObject[this.propertyName].x) / 100;
			elementY.value = Math.round(100 * selectedObject[this.propertyName].y) / 100;
		}
	}
}

/**
 * @class NodeProperty
 * @extends Property
 */
class NodeProperty extends Property {
	/**
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 * @param  {Object} defaultValue
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue) {
		super(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue);
	}


	/**
	 * @param {Element} element
	 * @param {Element} restArea
	 */
	populateProperty(element, restArea) {
		let display = '';
		let addNodeButton;
		this.HTMLElement = restArea;
		let id = this.identity;

		let parameterValue = this.createNameValuePair(element);
		this.input = document.createElement('div');
		this.input.style.display = 'inline';
		parameterValue.appendChild(this.input);

		let changeButton = document.createElement('button');
		changeButton.classList.add('trussButton');
		changeButton.classList.add('tensorButtonRight');
		changeButton.innerHTML = 'X';

		parameterValue.appendChild(changeButton);

		let _this = this;
		this.attachFunction = function() {
			if (_this && universe.currentNode.selector && universe.selectedObject && universe.selectedObject.isNode) {
				_this.initialSelectedItem.sensorAttach();
				_this = undefined;
			}
		};

		changeButton.onclick = function(x) {
			universe.selectedObject[_this.propertyName] = universe.currentNode.selector;
			_this.initialSelectedItem = universe.selectedObject;
			document.addEventListener('selectionEvent', _this.attachFunction, false);
		};
	}


	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(serializeObject, localNodeList, tensorList) {
		return localNodeList.indexOf(serializeObject);
	}

	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Position}
	 */
	deSerialize(serializeObject, localNodeList, tensorList) {
		return localNodeList[serializeObject];
	}

	// This is called when the screen should be updated by a value change in an object
	/**
	 * @param  {Object} selectedObject
	 */
	updatePropertyValue(selectedObject) {
		let element = this.input;
		if ((element == undefined) || (element == null)) {
			console.log('updatePropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
			return;
		}
		if (selectedObject[this.propertyName]==undefined) {
			selectedObject[this.propertyName]=this.defaultValue;
		}
		if (element.myNode!=selectedObject[this.propertyName]) {
			element.innerHTML = '';
			let node = selectedObject[this.propertyName];
			if (node) {
				let button=selectedObject[this.propertyName].generateHTML();
				button.classList.add('tensorButtonLeft');
				element.appendChild(button);
			} else {
				element.innerHTML = 'undefined';
			}
		}
		element.myNode=selectedObject[this.propertyName];
	}
}

/**
 * @class TensorListProperty
 * @extends Property
 */
class TensorListProperty extends Property {
	/**
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 * @param  {Object} defaultValue
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue) {
		super(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue);
	}


	/**
	 * @param {Element} element
	 * @param {Element} restArea
	 */
	populateProperty(element, restArea) {
		let display = '';
		let addNodeButton;
		this.HTMLElement = restArea;
		let id = this.identity;

		let parameterValue = this.createNameValuePair(element);

		for (let tensor of universe.selectedObject[this.propertyName]) {
			let tensorButton = document.createElement('button');
			tensorButton.innerHTML = tensor.getName();
			tensorButton.classList.add('simpleButton');
			tensorButton.style.display = 'inline';
			parameterValue.appendChild(tensorButton);
			this.registerOnClick(tensorButton, tensor);
		}

		let inputField = document.createElement('div');
		inputField.id = id;
		inputField.style.width = '140px';
		parameterValue.appendChild(inputField);
		this.input=inputField;
	}


	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(serializeObject, localNodeList, tensorList) {
		let returnList=[];
		for (let tensor of serializeObject) {
			returnList.push(tensorList.indexOf(tensor));
		}
		return returnList;
	}

	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	deSerialize(serializeObject, localNodeList, tensorList) {
		let returnList=[];
		for (let tensor of serializeObject) {
			returnList.push(tensorList[tensor]);
		}
		return returnList;
	}
}

/**
 * @class LabelListProperty
 * @extends Property
 */
class LabelListProperty extends Property {
	/**
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 * @param  {Object} defaultValue
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue) {
		super(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue);
	}


	/**
	 * @param {Element} element
	 * @param {Element} restArea
	 */
	populateProperty(element, restArea) {
		let display = '';
		let addNodeButton;
		this.HTMLElement = restArea;

		let parameterValue = this.createNameValuePair(element);


		let secondaryLabelsDiv = document.createElement('div');
		secondaryLabelsDiv.id = 'labelContainer';
		secondaryLabelsDiv.classList.add('labelList');

		this.input = this.makePropertyListField(parameterValue, secondaryLabelsDiv);

		parameterValue.appendChild(this.input);
		element.appendChild(secondaryLabelsDiv);
	}

	/**
	 * @param  {Element} parameterValue
	 * @param  {Element} secondaryLabelsDiv
	 * @return {Element}
	 */
	makePropertyListField(parameterValue, secondaryLabelsDiv) {
		let inputField = this.makeViewOfInputField(this.identity, parameterValue);
		let _this = this;

		let finalizelabels = function(object, value) {
			if (!value) {
				value = object.labelString;
			}
			secondaryLabelsDiv.innerHTML = '';
			object.labelString = value;
			object.refreshPropertiesAfterLabelChange();

			for (let label of object.labels) {
				let labelDiv = document.createElement('div');
				labelDiv.innerHTML = label.name;
				labelDiv.classList.add('smallLabel');
				secondaryLabelsDiv.appendChild(labelDiv);
			}

			return;
		};

		inputField.addEventListener('input', function(e) {
			universe.selectedObject[_this.propertyName] = inputField.value;
		}, true);
		inputField.addEventListener('keydown', function(e) {
			if (e.key === 'Enter') {
				finalizelabels(universe.selectedObject, inputField.value);
				universe.selectedObject.properties.populateRest(_this.HTMLElement, true);
			}
		}, true);
		inputField.addEventListener('blur', function(e) {
			finalizelabels(universe.selectedObject, inputField.value);
			universe.selectedObject.properties.populateRest(_this.HTMLElement, true);
		}, true);

		finalizelabels(universe.selectedObject);
		return inputField;
	}
}
