
let ParameterCategory = {
	APPEARANCE: 1,
	TRIGGER: 2,
	EFFECT: 3,
	CONTENT: 4,
};


/**
 * @class
 */
class PropertyList {
	/**
	 */
	constructor() {
		this.massProperty = new NumberProperty('mass', 'mass', 'Mass', ParameterCategory.CONTENT, 'The mass of the node in Kilograms.');
		this.nameProperty = new StringProperty('name', 'name', 'Name', ParameterCategory.CONTENT, 'The name of the node.');
		this.constantProperty = new NumberProperty('constant', 'constant', 'Constant', ParameterCategory.CONTENT, 'The tensor constant.');
		this.absorberProperty = new NumberProperty('dampeningConstant', 'dampeningConstant', 'Dampening Constant', ParameterCategory.CONTENT, 'The absorb constant.');
		this.positionProperty = new PositionProperty('localPosition', 'localPosition', 'Position', ParameterCategory.CONTENT, 'The position counted from the upper left corner.');
		this.velocityProperty = new PositionProperty('velocity', 'velocity', 'Velocity', ParameterCategory.CONTENT, 'The velocity.');
		this.angleProperty = new NumberProperty('angle', 'angle', 'Node angle', ParameterCategory.CONTENT, 'The angle of the node.');
		this.startAngleProperty = new NumberProperty('angle1', 'angle1', 'Start angle', ParameterCategory.CONTENT, 'The angle of the tensor at the start node.');
		this.endAngleProperty = new NumberProperty('angle2', 'angle2', 'End angle', ParameterCategory.CONTENT, 'The angle of the tensor at the end node.');
		// this.torqueConstantProperty = new NumberProperty('torqueConstant', 'torqueConstant', 'Torque constant', ParameterCategory.CONTENT, 'How stiff the node is with respect to attempts angle differences.');
		this.torqueConstantProperty1 = new NumberProperty('torqueConstant1', 'torqueConstant1', 'Start torque constant', ParameterCategory.CONTENT, 'How stiff the tensor attachment is to the start node with respect to the angle.');
		this.torqueConstantProperty2 = new NumberProperty('torqueConstant2', 'torqueConstant2', 'End torque constant', ParameterCategory.CONTENT, 'How stiff the tensor attachment is to the start node with respect to the angle.');
		this.turnrateProperty = new NumberProperty('turnrate', 'turnrate', 'Turn rate', ParameterCategory.CONTENT, 'The speed at which the node turns.');
		this.nodeFrictionProperty = new NumberProperty('velocityLoss', 'velocityLoss', 'Node friction', ParameterCategory.CONTENT, 'How much velocity bleeds of the node (0-1, where 1 is no bleed of).');
		this.turnFrictionProperty = new NumberProperty('turnLoss', 'turnLoss', 'Rotational friction', ParameterCategory.CONTENT, 'How much rotation speed bleeds of the node (0-1, where 1 is no bleed of).');
		this.colorProperty = new StringProperty('color', 'color', 'Colour', ParameterCategory.CONTENT, 'The colour of the node.');
		this.positionScriptProperty = new ScriptProperty('positionScript', 'positionScript', 'Position script', ParameterCategory.CONTENT, 'This script should return a new position object where this node will be moved to.');
		this.showScriptProperty = new ScriptProperty('showScript', 'showScript', 'Show script', ParameterCategory.CONTENT, 'This script is run when the object should be drawn on the screen.');
		this.buttonScriptProperty = new ScriptProperty('buttonScript', 'buttonScript', 'Button script', ParameterCategory.CONTENT, 'This script is run when the button is pressed.');
		
		this.collisionLabelProperty = new LabelProperty('collisionLabel', 'collisionLabel', 'Collide label', ParameterCategory.CONTENT, 'Collide with tensors having this label.');
		this.pictureProperty = new StringProperty('pictureReference', 'pictureReference', 'Picture filename', ParameterCategory.CONTENT, 'The picture filename.');
		this.sizeProperty = new NumberProperty('size', 'size', 'Size (1=normal)', ParameterCategory.CONTENT, 'The picture size');
		this.equilibriumLengthProperty = new NumberProperty('equilibriumLength', 'equilibriumLength', 'Length', ParameterCategory.CONTENT, 'How long should the relaxed spring be.');
		this.degree1Property = new NumberProperty('degree1', 'degree1', 'Angle 1', ParameterCategory.CONTENT, 'The angle the node connects to the start node.');
		this.degree2Property = new NumberProperty('degree2', 'degree2', 'Angle 2', ParameterCategory.CONTENT, 'The angle the node connects to the end node.');
		this.screenSizeProperty = new PositionProperty('screenSize', 'screenSize', 'Screen size', ParameterCategory.CONTENT, 'The size of the displayed screen in pixels.');
		this.worldSizeProperty = new PositionProperty('worldSize', 'worldSize', 'World display size', ParameterCategory.CONTENT, 'The size of the displayed worldview in that worlds measurement.');
		this.setWorldOffsetProperty = new PositionProperty('worldOffset', 'worldOffset', 'View position', ParameterCategory.CONTENT, 'The world coordinates of the upper left corner.');
		this.fpsTargetProperty = new NumberProperty('fpsTarget', 'fpsTarget', 'Updates per second', ParameterCategory.CONTENT, 'Graphical update frequency aim.');
		this.fpsProperty = new NumberProperty('fps', 'fps', 'Frames per Second', ParameterCategory.CONTENT, 'Graphical update frequency aim.');
		this.visibilityProperty = new SwitchProperty('visible', 'visible', 'Visible', ParameterCategory.CONTENT, 'Should this be visible on the screen.');
		this.snapGridProperty = new NumberProperty('gridSize', 'gridSize', 'Align to grid', ParameterCategory.CONTENT, 'Aligning all new positions to this grid. (0 for no alignment)');
		this.enforcedProperty = new NumberProperty('enforced', 'enforced', 'Enforced', ParameterCategory.CONTENT, 'Special parameter that only is used in labels to enforce all parameter values are enforced.');
		this.startNodeProperty = new NodeProperty('node1', 'node1', 'Start node', ParameterCategory.CONTENT, 'Start node.');
		this.endNodeProperty = new NodeProperty('node2', 'node2', 'End node', ParameterCategory.CONTENT, 'End node.');
		this.parentTrussNodeProperty = new NodeProperty('parentTrussNode', 'parentTrussNode', 'Parent node', ParameterCategory.CONTENT, 'Owning truss node.');
		this.connectedTensorsProperty = new TensorListProperty('connectedTensors', 'connectedTensors', 'Tensors', ParameterCategory.CONTENT, 'All tensors based on node positions.');
		this.keyProperty = new PropertyListProperty('keyVectors', 'keyVectors', 'KeyVectorList', ParameterCategory.CONTENT, 'All tensors based on node positions.', [
			() => new StringProperty('key', 'key', 'Trigger key', ParameterCategory.CONTENT, 'The number of the key that triggers the move.'),
			() => new PositionProperty('vector', 'vector', 'Position change', ParameterCategory.CONTENT, 'The position node moves when the key is pressed.')
		]);
		this.restPositionProperty = new PositionProperty('restPosition', 'restPosition', 'Rest position', ParameterCategory.CONTENT, 'The position when no key is pressed.');
	}
}

/**
 * @class
 */
class Properties {
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
	 * @param {Object} ownerObject
	 */
	populateProperties(element, ownerObject) {
		element.innerHTML = '';

		let labelArea = document.createElement('div');
		// labelArea.classList.add('dummy');

		let otherArea = document.createElement('div');

		this.list[0].populateProperty(labelArea, ownerObject, otherArea);
		element.appendChild(labelArea);

		this.populateRest(otherArea, ownerObject);
		element.appendChild(otherArea);
	}

	/**
	 * @param {element} element
	 * @param {Object} ownerObject
	 */
	populateRest(element, ownerObject) {
		element.innerHTML = '';
		for (let prop of this.list) {
			if (prop.propertyName != 'labelString') {
				prop.populateProperty(element, ownerObject);
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
	 * @param  {number} index
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, defaultValue, index = -1) {
		this.propertyName = propertyName;
		this.identity = 'editWindowTruss' + idHTML;
		this.title = displayTitle;
		this.help = helpText;
		this.defaultValue = defaultValue;
		this.index = index;
	}

	/**
	 * @param  {Object} serializeObject
	 * @return {Object}
	 */
	serialize(serializeObject) {
		return serializeObject;
	}

	/**
	 * @param  {Object} serializeObject
	 * @return {Object}
	 */
	deSerialize(serializeObject) {
		if ((serializeObject.constructor === String) || (serializeObject.constructor === Number)) {
			return serializeObject;
		} else return '';
	}

	/** creates the default value editing area and handles input updates
	 * @param  {String} id
	 * @param  {Element} parameterValue
	 * @return {Element}
	 */
	makeInputField(id, parameterValue) {
		let inputField = this.makeViewOfInputField(id, parameterValue);
		inputField.addEventListener('input', () => {
			this.assignValue(inputField.value);
		});
		return inputField;
	}

	/** actually assign to the owning object
	 * @param  {Object} value
	 * @param  {Object} owner
	 */
	assignValue(value, owner) {
		if (owner) {
			this.owner=owner;
		}
		this.owner[this.propertyName] = value;
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

	/** Creates the default value editing area. This does not handle any input (see makeinputField)
	 * @param  {String} id
	 * @param  {Element} parameterValue
	 * @param  {number} rows
	 * @return {Element}
	 */
	makeViewOfInputFieldMultiline(id, parameterValue, rows) {
		let inputField = document.createElement('textarea');
		inputField.rows = rows;
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
	 * @param  {Object} valueObject
	 */
	updatePropertyValue(valueObject) {
		let element = this.input;
		if ((element == undefined) || (element == null)) {
			console.log('updatePropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
			return;
		}
		if (valueObject[this.propertyName]==undefined) {
			valueObject[this.propertyName]=this.defaultValue;
		}
		element.value = valueObject[this.propertyName];
	}
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
	 * @param {Object} owner
	 */
	populateProperty(element, owner) {
		this.owner=owner;

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
	 * @param {Object} owner
	 */
	populateProperty(element, owner) {
		this.owner=owner;
		let parameterValue = this.createNameValuePair(element);
		this.input = this.makeInputField(this.identity, parameterValue);
		parameterValue.appendChild(this.input);
	}
}

/**
 * @class ScriptProperty
 * @extends Property
 */
class ScriptProperty extends Property {
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
		this[propertyName+'_Evaluated']='X';
	}


	/**
	 * @param {Element} element
	 * @param {Object} owner
	 */
	populateProperty(element, owner) {
		this.owner=owner;
		let parameterValue = this.createNameValuePair(element);
		this.input = this.makeViewOfInputFieldMultiline(this.identity, parameterValue, 5);
		this.input.addEventListener('input', () => {
			this.assignValue(this.input.value);
		});
		parameterValue.appendChild(this.input);
	}


	/** actually assign to the owning object
	 * @param  {Object} value
	 * @param  {Object} owner
	 */
	assignValue(value, owner) {
		let supportThis = function myEval(script) {
			return eval(script);
		};
		if (owner) {
			this.owner=owner;
		}
		this.owner[this.propertyName] = value;

		try {
			this.owner[this.propertyName+'_Evaluated']=
				supportThis.call(this.owner, value);
		}
		catch(err) {
			console.log(err);
			this.owner[this.propertyName+'_Evaluated']=undefined;
		}
	}
}

/**
 * @class ScriptProperty
 * @extends Property
 */
class LabelProperty extends Property {
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
		this[propertyName+'_Label']=undefined;
	}


	/**
	 * @param {Element} element
	 * @param {Object} owner
	 */
	populateProperty(element, owner) {
		this.owner=owner;
		let parameterValue = this.createNameValuePair(element);
		this.input = this.makeInputField(this.identity, parameterValue);
		this.input.addEventListener('input', () => {
			this.assignValue(this.input.value);
		});
		parameterValue.appendChild(this.input);
	}


	/** actually assign to the owning object
	 * @param  {Object} value
	 * @param  {Object} owner
	 */
	assignValue(value, owner) {
		if (owner) {
			this.owner=owner;
		}
		this.owner[this.propertyName] = value;

		try {
			this.owner[this.propertyName+'_Label']= owner.world.labels.findLabel(value);
		}
		catch(err) {
			console.log(err);
			this.owner[this.propertyName+'_Label']=undefined;
		}
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
	 * @param {Object} owner
	 */
	populateProperty(element, owner) {
		this.owner=owner;
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

		inputField.addEventListener('input', () => {
			this.assignValue(inputField.checked);
		});

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
	 * @param  {Object} valueObject
	 */
	updatePropertyValue(valueObject) {
		let element = this.input;
		if ((element == undefined) || (element == null)) {
			console.log('updatePropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
			return;
		}
		if (valueObject[this.propertyName]==undefined) {
			valueObject[this.propertyName]=this.defaultValue;
		}
		element.checked = valueObject[this.propertyName];
	}
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
	 * @param {Object} owner
	 */
	populateProperty(element, owner) {
		this.owner=owner;
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
		xinputField.style.margin = '1px 0px 1px 0px';
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
		yinputField.style.margin = '1px 0px 1px 0px';
		yparameterValue.appendChild(yinputField);

		this.yInput = yinputField;


		xinputField.addEventListener('input', () => {
			this.assignValue(
				new Position(parseInt(xinputField.value),
					parseInt(yinputField.value),
				), owner);
		});

		/* function(e) {
			universe.selectedObject[_this.propertyName].x = parseInt(xinputField.value);
		}, false); */

		yinputField.addEventListener('input', () => {
			this.assignValue(
				new Position(parseInt(xinputField.value),
					parseInt(yinputField.value),
				), owner);
		});

		/* function(e) {
			universe.selectedObject[_this.propertyName].y = parseInt(yinputField.value);
		}, false); */
	}

	/**
	 * @param  {Object} serializeObject
	 * @return {Object}
	 */
	serialize(serializeObject) {
		return {
			'x': serializeObject.x,
			'y': serializeObject.y,
		};
	}

	/**
	 * @param  {Object} serializeObject
	 * @return {Position}
	 */
	deSerialize(serializeObject) {
		return new Position(serializeObject.x, serializeObject.y);
	}

	// This is called when the screen should be updated by a value change in an object
	/**
	 * @param  {Object} valueObject
	 */
	updatePropertyValue(valueObject) {
		let elementX = this.xInput;
		let elementY = this.yInput;
		if ((elementX == undefined) || (elementX == null)) {
			console.log('updatePropertyValue cannot find HTML element ' + this.identity + 'X & Y. (Title:' + this.title + ')');
			return;
		} else {
			elementX.value = Math.round(100 * valueObject[this.propertyName].x) / 100;
			elementY.value = Math.round(100 * valueObject[this.propertyName].y) / 100;
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
	 * @param {Object} owner
	 */
	populateProperty(element, owner) {
		this.owner=owner;

		let parameterValue = this.createNameValuePair(element);
		this.input = document.createElement('div');
		this.input.style.display = 'inline';
		parameterValue.appendChild(this.input);

		let changeButton = document.createElement('button');
		changeButton.classList.add('trussButton');
		changeButton.classList.add('tensorButtonRight');
		changeButton.innerHTML = 'X';

		parameterValue.appendChild(changeButton);

		this.active=false;

		this.attachFunction = () => {
			if (this.active && universe.currentNode.selector &&
				this.owner && this.owner.isNode) {
				this.initialSelectedItem.sensorAttach();
				this.active=false;
			}
		};

		changeButton.onclick = () => {
			this.assignValue(universe.currentNode.selector);
			this.initialSelectedItem =this.owner;
			this.active=true;
			document.addEventListener('selectionEvent', this.attachFunction, false);
		};
	}


	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @return {Object}
	 */
	serialize(serializeObject, localNodeList) {
		if (localNodeList) {
			return localNodeList.indexOf(serializeObject);
		} else {
			return serializeObject;
		}
	}

	/**
	 * @param  {Object} serializeObject
	 * @param  {Array} localNodeList
	 * @return {Position}
	 */
	deSerialize(serializeObject, localNodeList) {
		if (localNodeList) {
			return localNodeList[serializeObject];
		} else {
			return serializeObject;
		}
	}

	// This is called when the screen should be updated by a value change in an object
	/**
	 * @param  {Object} valueObject
	 */
	updatePropertyValue(valueObject) {
		let element = this.input;
		if ((element == undefined) || (element == null)) {
			console.log('updatePropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
			return;
		}
		if (valueObject[this.propertyName]==undefined) {
			valueObject[this.propertyName]=this.defaultValue;
		}
		if (element.myNode!=valueObject[this.propertyName]) {
			element.innerHTML = '';
			let node = valueObject[this.propertyName];
			if (node) {
				let button=valueObject[this.propertyName].generateHTML();
				button.classList.add('tensorButtonLeft');
				element.appendChild(button);
			} else {
				element.innerHTML = 'undefined';
			}
		}
		element.myNode=valueObject[this.propertyName];
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
	 * @param {Object} owner
	 */
	populateProperty(element, owner) {
		this.owner=owner;
		this.input={};
		return;

		// let id = this.identity;

		// let parameterValue = this.createNameValuePair(element);

		// for (let tensor of owner[this.propertyName]) {
		// 	let tensorButton = document.createElement('button');
		// 	tensorButton.innerHTML = tensor.getName();
		// 	tensorButton.classList.add('trussButton');
		// 	tensorButton.classList.add('tensorButtonMiddle');

		// 	tensorButton.style.display = 'inline';
		// 	parameterValue.appendChild(tensorButton);
		// 	this.registerOnClick(tensorButton, tensor);
		// }

		// let inputField = document.createElement('div');
		// inputField.id = id;
		// inputField.style.width = '140px';
		// parameterValue.appendChild(inputField);
		// this.input=inputField;
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
	 * @param {Object} owner
	 * @param {Element} restArea
	 */
	populateProperty(element, owner, restArea) {
		this.owner=owner;

		let parameterValue = this.createNameValuePair(element);


		let secondaryLabelsDiv = document.createElement('div');
		secondaryLabelsDiv.id = 'labelContainer';
		secondaryLabelsDiv.classList.add('labelList');

		this.input = this.makePropertyListField(parameterValue, secondaryLabelsDiv, restArea);

		parameterValue.appendChild(this.input);
		element.appendChild(secondaryLabelsDiv);
	}

	/**
	 * @param  {Element} parameterValue
	 * @param  {Element} secondaryLabelsDiv
	 * @param  {Element} restArea
	 * @return {Element}
	 */
	makePropertyListField(parameterValue, secondaryLabelsDiv, restArea) {
		let inputField = this.makeViewOfInputField(this.identity, parameterValue);
		let _this = this;

		let finalizelabels = function(value) {
			if (!value) {
				value = _this.owner.labelString;
			}
			secondaryLabelsDiv.innerHTML = '';
			_this.owner.labelString = value;
			_this.owner.refreshPropertiesAfterLabelChange();

			for (let label of _this.owner.labels) {
				let labelDiv = document.createElement('div');
				labelDiv.innerHTML = label.name;
				labelDiv.classList.add('smallLabel');
				secondaryLabelsDiv.appendChild(labelDiv);
			}

			return;
		};

		inputField.addEventListener('input', () => {
			this.assignValue(inputField.value);
		});
		inputField.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				finalizelabels(inputField.value);
				this.owner.properties.populateRest(restArea, this.owner);
			}
		});
		inputField.addEventListener('blur', () => {
			finalizelabels(inputField.value);
			this.owner.properties.populateRest(restArea, this.owner);
		});

		finalizelabels();
		return inputField;
	}
}

/**
 * @class PropertyListProperty
 * @extends Property
 */
class PropertyListProperty extends Property {
	/**
	 * @param  {string} propertyName
	 * @param  {string} idHTML
	 * @param  {string} displayTitle
	 * @param  {parameterCategory} parameterCategory
	 * @param  {string} helpText
	 * @param  {Object} propertyCreatorList
	 *
	 */
	constructor(propertyName, idHTML, displayTitle, parameterCategory, helpText, propertyCreatorList) {
		super(propertyName, idHTML, displayTitle, parameterCategory, helpText, {});
		this.propertyCreatorList=propertyCreatorList;
		this.propertyList=[];
	}


	/**
	 * @param {Element} element
	 * @param {Object} owner
	 */
	populateProperty(element, owner) {
		this.owner=owner;
		this.input= [];

		let _this=this;

		let outerDiv = document.createElement('div');
		outerDiv.id = this.identity + 'Container';
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
		this.listArea = document.createElement('div');
		this.listArea.classList.add('dynamicPropertyList');


		let addRowButton = document.createElement('button');
		addRowButton.innerHTML = 'Add Row';
		addRowButton.classList.add('trussButton');
		addRowButton.classList.add('tensorButtonMiddle');
		addRowButton.addEventListener('click', () => {
			let props = {};
			let values = {};
			for (let propCreator of _this.propertyCreatorList) {
				let newProperty = propCreator();
				props[newProperty.propertyName] = newProperty;
				values[newProperty.propertyName] = newProperty.deSerialize({}, [], []);
				newProperty.owner=values;
			}

			if (!this.owner[this.propertyName]) {
				this.owner[this.propertyName]=[];
			}
			if (!this.owner[this.propertyName+'Properties']) {
				this.owner[this.propertyName+'Properties']=[];
			}
			this.owner[this.propertyName].push(values);
			this.owner[this.propertyName+'Properties'].push(props);
			this.generate();
		});
		addRowButton.style.display = 'inline';
		valuePair.appendChild(addRowButton);
		valuePair.appendChild(this.listArea);

		this.generate();
	}

	/**
 	*
 	*/
	generate() {
		this.listArea.innerHTML ='';

		let ownerList = this.owner[this.propertyName+'Properties'];
		let valList = this.owner[this.propertyName];
		if (!ownerList) {
			return;
		}

		/*
		[ {
			'key': 32,
			'vector': OBJECT1,
			}, {
			'key': 62,
			'vector': OBJECT2,
			}]
		*/
		for (let i=0; i<ownerList.length; i++) {
			let row = ownerList[i];
			let val = valList[i];
			let rowDiv = document.createElement('div');
			rowDiv.id = 'row';
			rowDiv.innerHTML='';
			/* eslint-disable-next-line */
			for (let [key, property] of Object.entries(row)) {
				property.populateProperty(rowDiv, val);
			}
			this.listArea.appendChild(rowDiv);
		}
	}


	/**
	 * @param  {Object} serializeObject
	 * @return {Object}
	 */
	serialize(serializeObject) {
		return JSON.stringify(serializeObject[this.propertyName]);
	}

	/**
	 * @param  {Object} serializeObject
	 * @return {Object}
	 */
	deSerialize(serializeObject) {
		return JSON.parse(serializeObject[this.propertyName]);
	}

	// This is called when the screen should be updated by a value change in an object
	/**
	 * @param  {Object} valueObject
	 */
	updatePropertyValue(valueObject) {
		let element = this.input;
		if ((element == undefined) || (element == null)) {
			console.log('updatePropertyValue cannot find HTML element ' + this.identity + '. (Title:' + this.title + ')');
			return;
		}
		let ownerList = valueObject[this.propertyName+'Properties'];
		let valList = valueObject[this.propertyName];
		if (!ownerList) {
			return;
		}
		for (let i=0; i<ownerList.length; i++) {
			let row = ownerList[i];
			let val = valList[i];
			let rowDiv = document.createElement('div');
			rowDiv.id = 'row';
			rowDiv.innerHTML='';
			/* eslint-disable-next-line */
			for (let [key , property] of Object.entries(row)) {
				property.updatePropertyValue(val);
			}
		}
	}
}
