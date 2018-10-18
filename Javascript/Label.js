/* exported Labels */
/* global PushCalculator PullCalculator SpringCalculator FieldCalculator AbsorbCalculator */
/* global AngleNode AngleTensor SelectorBehaviour KeySensor Scriptposition */
/* global ScriptShow CollisionSensor CollisionBounce ScriptPosition PropertyList */

/**
 * @class
 */
class Labels {
	/**
	 */
	constructor() {
		this.list = [];

		this.createProperties();

		this.createInitialLabels();
	}

	createProperties() {
		this.allProperties = new PropertyList();
	}

	createInitialLabels() {
		this.allProperties = new PropertyList();
		this.nodeLabel = this.addLabel('node', [], {
			'nameProperty': '',
			'positionProperty': new Position(1, 1),
			'visibilityProperty': 1,
			'colorProperty': 'white',
			'parentTrussNodeProperty': undefined,
			'connectedTensorsProperty': undefined,
		});
		this.tensorLabel = this.addLabel('tensor', [], {
			'visibilityProperty': 1,
			'startNodeProperty': undefined,
			'endNodeProperty': undefined,
			'colorProperty': 'white',
			'parentTrussNodeProperty': undefined,
		});
		let positionTensorLabel = this.addLabel('positiontensor', [this.tensorLabel], {
			'constantProperty': 1,
		});
		this.addLabel('pullspring', [positionTensorLabel], {
			'equilibriumLengthProperty': 1,
		}, [new PullCalculator()]);
		this.addLabel('pushspring', [positionTensorLabel], {
			'equilibriumLengthProperty': 1,
		}, [new PushCalculator()]);
		this.springLabel = this.addLabel('spring', [positionTensorLabel], {
			'equilibriumLengthProperty': 1,
		}, [new SpringCalculator()]);
		this.addLabel('field', [positionTensorLabel], {}, [new FieldCalculator()]);
		this.absorbLabel = this.addLabel('absorber', [this.tensorLabel], {
			'absorberProperty': 1,
			'visibilityProperty': 1,
		}, [new AbsorbCalculator()]);
		this.moveableLabel = this.addLabel('moveable', [this.nodeLabel], {
			'massProperty': 1,
			'nodeFrictionProperty': 0.99,
		});
		this.angleNode = this.addLabel('anglenode', [this.nodeLabel], {
			'angleProperty': 0,
			'turnrateProperty': 0,
			'turnFrictionProperty': 0.99,
		}, [new AngleNode()]);
		this.addLabel('angletensor', [this.tensorLabel], {
			'startAngleProperty': 0,
			'torqueConstantProperty1': 0,
			'endAngleProperty': 0,
			'torqueConstantProperty2': 0,
		}, [new AngleTensor()]);
		this.addLabel('debugtensor', [], {
			'degree1Property': 1,
			'degree2Property': 1,
		});
		this.addLabel('debugnode', [], {
			'velocityProperty': undefined,
		});
		this.addLabel('color', [], {
		 	'colorProperty': 'red',
		 	'visibilityProperty': 1,
		 });
		this.addLabel('picture', [this.nodeLabel], {
			'pictureProperty': '/Resources/default.jpg',
			'sizeProperty': 1,
			'visibilityProperty': 1,
		});
		this.addLabel('dampenedspring', [this.springLabel, this.absorbLabel], {});
		this.addLabel('gravitywell', [this.nodeLabel], {
			'constantProperty': 6.67e-11,
			'massProperty': 5.97219e24,
			'nameProperty': 'Earth',
			'positionProperty': new Position(0, 6371000),
			'enforcedProperty': true,
		});
		this.addLabel('truss', [this.nodeLabel], {
			'screenSizeProperty': new Position(200, 200),
			'worldSizeProperty': new Position(20, 20),
			'setWorldOffsetProperty': new Position(0, 0),
			'fpsTargetProperty': 60,
			'fpsProperty': 60,
			'snapGridProperty': 0,
		});
		this.sensorLabel = this.addLabel('sensor', [this.nodeLabel], {});
		this.addLabel('selector', [this.sensorLabel, this.moveableLabel], {}, [new SelectorBehaviour()]);
		this.addLabel('keysensor', [this.sensorLabel, this.moveableLabel], {
			'keyProperty': [],
			'restPositionProperty': new Position(1, 1),
		}, [new KeySensor()]);

		this.addLabel('scriptposition', [this.moveableLabel], {
			'positionScriptProperty': '() => {alert("MyPositionScript");}',
		}, [new ScriptPosition()]);
		this.addLabel('scriptshow', [], {
			'showScriptProperty': '() => {alert("MyShowScript");}',
		}, [new ScriptShow()]);
		this.collideLabel = this.addLabel('collide', [this.sensorLabel], {
			'collisionLabelProperty': '',
		}, [new CollisionSensor()]);
		this.addLabel('bounceactuator', [this.angleNode, this.moveableLabel, this.collideLabel], {},
			[new CollisionBounce()]);
		this.addLabel('button', [this.nodeLabel, this.moveableLabel], {
			'buttonScriptProperty': '() => {alert("MyButtonScript");}',
			'nameProperty': 'Button',
		},
			[new ButtonBehaviour()]);
	}

	/**
	 * @param  {Property} name
	 * @param  {List} dependencies
	 * @param  {List} properties
	 * @param  {List} behaviours
	 * @return {Label}
	 */
	addLabel(name, dependencies, properties, behaviours) {
		if (properties) {
			let enforced = properties.enforcedProperty;
			for (const [key, value] of Object.entries(properties)) {
				properties[key] = {
					'propertyObject': this.allProperties[key],
					'defaultValue': value,
					'enforced': enforced,
				};
			}
		}
		let label = new Label(name, dependencies, properties, behaviours);
		this.list.push(label);
		return label;
	}

	/**
	 * @return {Array}
	 */
	getLabels() {
		return this.list;
	}

	/**
	 * @param {string} labelName
	 * @return {Array}
	 */
	findLabel(labelName) {
		if (!labelName) {
			labelName = 'EmptyName';
		}
		for (let l of this.list) {
			if (l.name == labelName) {
				return l;
			}
		}
		return this.addLabel(labelName);
	}

	/**
	 * @param {Object} reference
	 */
	clearOldReferences(reference) {
		if (reference.labels) {
			for (let l of reference.labels) {
				l.clearOldReference(reference);
			}
		}
	}

	/**
	 * @param {string} labelName
	 * @param {object} reference
	 * @return {Label}
	 */
	addReference(labelName, reference) {
		let label = this.findLabel(labelName);
		label.addReference(reference);
		return label;
	}

	/**
	 * @param {List} startList
	 * @param {object} reference
	 * @param {List} resultList
	 * @return {List}
	 */
	recursiveDependencies(startList, reference, resultList) {
		if (startList && startList.length == 0) {
			return resultList;
		}
		for (let label of startList) {
			if (resultList.indexOf(label) == -1) {
				label.addReference(reference);
				// resultList = [label, ...this.recursiveDependencies(label.dependencies, reference, resultList)];
				resultList = this.recursiveDependencies(label.dependencies, reference, [...resultList, label]);
			} else {
				resultList = this.recursiveDependencies(label.dependencies, reference, resultList);
			}
		}
		return resultList;
	}

	/**
	 * @param {string} labelString
	 * @param {object} reference
	 * @return {Label}
	 */
	parse(labelString, reference) {
		this.clearOldReferences(reference);
		if (!labelString) {
			return [];
		}
		let stringList = labelString.toLowerCase().split(/[\s,]+/);
		let startList = [];
		for (let name of stringList) {
			if (name != '') {
				let label = this.findLabel(name);
				if (startList.indexOf(label) == -1) {
					startList.push(label);
				}
			}
		}
		let returnList = this.recursiveDependencies(startList, reference, []);
		return returnList;
	}

	/**
	 * @param {string} divName
	 */
	show(divName) {
		let area = universe.currentNode.getElement('#' + divName);
		let displayDiv = universe.currentNode.getElement('#labelContentArea');
		area.innerHTML = '';
		if (this.list) {
			for (let label of this.list) {
				if (label.used()) {
					let leftButton = document.createElement('button');
					leftButton.classList.add('trussButton');
					leftButton.classList.add('nodeButton');
					leftButton.innerHTML = label.name;
					this.registerOnClick(leftButton, label, displayDiv);
					area.appendChild(leftButton);
				}
			}
		}
	}

	/**
	 * @param  {buttonObject} but
	 * @param  {Node} label
	 * @param  {Node} displayDiv
	 */
	registerOnClick(but, label, displayDiv) {
		but.addEventListener('click', function() {
			displayDiv.innerHTML = '';
			for (let item of label.getReferences()) {
				displayDiv.appendChild(item.generateHTML());
			}
		});
	}
}

/**
 * @class
 */
class Label {
	/**
	 * @param {string} name
	 * @param {string} dependencies
	 * @param {string} properties
	 * @param {List} behaviours
	 */
	constructor(name, dependencies = [], properties = [], behaviours =[]) {
		this.name = name;
		this.nodes = [];
		this.tensors = [];
		this.dependencies = dependencies;
		this.properties = properties;
		this.behaviours = behaviours;
	}

	/**
	 * @param  {Property} reference
	 * @return  {Object}
	 */
	addReference(reference) {
		for (let behaviour of this.behaviours) {
			behaviour.attachTo(reference);
		}
		if (reference.isNode) {
			return this.nodes.push(reference);
		} else {
			return this.tensors.push(reference);
		}
	}
	/**
	 * @param  {Property} reference
	 * @return  {number} Nr of uses
	 */
	clearOldReference(reference) {
		for (let behaviour of this.behaviours) {
			behaviour.detachFrom(reference);
		}
		if (reference.isNode) {
			removeIfPresent(reference, this.nodes);
			return this.used();
		} else {
			removeIfPresent(reference, this.tensors);
			return this.used();
		}
	}

	/**
	 * @return {number}
	 */
	used() {
		return this.nodes.length + this.tensors.length;
	}

	/**
	 * @return {Array}
	 */
	getNodes() {
		return this.nodes;
	}

	/**
	 * @return {Array}
	 */
	getTensors() {
		return this.tensors;
	}

	/**
	 * @return {Array}
	 */
	getReferences() {
		return [...this.tensors, ...this.nodes];
	}
}
