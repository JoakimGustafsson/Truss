/* function setupFileSelectionPanel(type,callback){
    openBottomPanel(0, 'resourceDiv', callback);
    openBottomSubPanel(0, type);
    //selectFileFunction(callback);
}*/

let ParameterCategory = {
	APPEARANCE: 1,
	TRIGGER: 2,
	EFFECT: 3,
	CONTENT: 4,
};

let ParameteType = {
	STRING: 1,
	NUMBER: 2,
	SELECTION: 3,
	PICTURE: 4,
	POSITION: 5,
	NODELIST: 6,
};


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
	 */
	addProperty(prop) {
		this.list.push(prop);
	}

	/**
	 * @return {Array}
	 */
	getProperties() {
		return this.list;
	}

	/**
	 * @param  {element} element
	 */
	populateProperties(element) {
		for (let i = 0; i < this.list.length; i++) {
			this.list[i].populateProperty(element);
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
	 * @param  {Object} worldObject
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {ParameteType} parameterType
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 */
	constructor(worldObject, propertyName, idHTML, displayTitle, parameterType, parameterCategory, helpText) {
		this.worldObject = worldObject;
		this.propertyName = propertyName;
		this.identity = 'editWindowTruss' + idHTML;
		this.title = displayTitle;
		this.type = parameterType;
		this.help = helpText;
		this.HTMLElement = undefined;
	}


	/**
	 * @param {HTMLElement} element
	 */
	populateProperty(element) {
		let display = '';
		let addNodeButton;

		if (this.type == ParameteType.NODELIST) {
			this.makeNodeButtons(element, this.identity);
		} else if (this.type == ParameteType.NUMBER) {
			this.makeNumber(element, this.identity);
		} else if (this.type == ParameteType.STRING) {
			this.makeString(element, this.identity);
		} else if (this.type == ParameteType.POSITION) {
			this.makePosition(element, this.identity, display);
		}
	};
	/**
	 * @param  {Element} element
	 * @param  {String} id
	 * @param  {String} display
	 */
	makePosition(element, id, display) {
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

		let xinputField = this.makeViewOfInputField(id+'X', parameterValue);
		xinputField.style.width='50px';
		xparameterValue.appendChild(xinputField);

		this.xInput=xinputField;

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

		let yinputField = this.makeViewOfInputField(id+'Y', parameterValue);
		yinputField.style.width='50px';
		yparameterValue.appendChild(yinputField);

		this.yInput=yinputField;

		let _this = this;

		xinputField.addEventListener('input', function(e) {
			universe.selectedObject[_this.propertyName].x = parseInt(xinputField.value);
		}, false);

		yinputField.addEventListener('input', function(e) {
			universe.selectedObject[_this.propertyName].y = parseInt(yinputField.value);
		}, false);

		return;
	}

	/**
	 * @param  {Element} element
	 * @param  {String} id
	 */
	makeString(element, id) {
		let parameterValue = this.createNameValuePair(element);

		this.input = this.makeInputField(id, parameterValue);
		parameterValue.appendChild(this.input);
	}

	/**
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

	/**
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
		inputField.style.width='140px';
		parameterValue.appendChild(inputField);
		return inputField;
	}

	/**
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
	 * @param  {Element} element
	 * @param  {String} id
	 */
	makeNumber(element, id) {
		let parameterValue = this.createNameValuePair(element);
		this.input = this.makeInputField(id, parameterValue);
		parameterValue.appendChild(this.input);
		return;
	}
	/**
	 * @param  {Element} element
	 * @param  {String} id
	 */
	makeNodeButtons(element, id) {
		let parameterValue = this.createNameValuePair(element);

		let addNodeButton = document.createElement('button');
		addNodeButton.innerHTML = 'Add node';
		addNodeButton.id = id;
		addNodeButton.classList.add('trussButton');
		addNodeButton.classList.add('tensorButtonMiddle');
		addNodeButton.addEventListener('click', function() {
			alert('RIGHT Add');
		}, false);
		parameterValue.appendChild(addNodeButton);

		let removeNodeButton = document.createElement('button');
		removeNodeButton.innerHTML = 'Remove node';
		removeNodeButton.classList.add('simpleButton');
		removeNodeButton.style.display = 'inline';
		removeNodeButton.addEventListener('click', function() {
			alert('RIGHT Remove');
		}, false);
		parameterValue.appendChild(removeNodeButton);
		for (let node of this.worldObject) {
			let nodeButton = document.createElement('button');
			nodeButton.innerHTML = node.name;
			nodeButton.classList.add('simpleButton');
			nodeButton.style.display = 'inline';
			parameterValue.appendChild(nodeButton);
			this.registerOnClick(nodeButton, node);
		}
		this.input={};
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
					'universe.selectedObject': universe.selectedObject,
					'previousSelectedObject': previousSelectedObject,
					'truss': undefined,
				},
				bubbles: true,
				cancelable: true,
			});
			document.dispatchEvent(event);
		});
	}

	/**
	 * @param {Array} list
	 * @return {string}
	 */
	generateOptions(list) {
		let res = '';
		for (let i = 0; i < list.length; i++) {
			if (!list[i][2] || userLevel != 'basic') {
				res += ' <option value="' + list[i][0] + '">' + list[i][1] + '</option>';
			}
		}
		return res;
	}

	// This is called when the screen should be updated by a value change in an object
	/**
	 * @param  {Object} selectedObject
	 */
	updatePropertyValue(selectedObject) {
		if (this.type == ParameteType.POSITION) {
			let elementX = this.xInput;
			let elementY = this.yInput;
			if ((elementX == undefined) || (elementX == null)) {
				alert('updatePropertyValue cannot find HTML element ' + this.identity + 'X & Y. (Title:' + this.title + ')');
				return;
			} else {
				elementX.value = Math.round(100 * selectedObject[this.propertyName].x) / 100;
				elementY.value = Math.round(100 * selectedObject[this.propertyName].y) / 100;
			}
		} else {
			let element = this.input;
			if ((element == undefined) || (element == null)) {
				alert('updatePropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
				return;
			}
			element.value = selectedObject[this.propertyName];
		}
	};
}
