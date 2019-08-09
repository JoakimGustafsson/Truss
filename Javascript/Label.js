/*jshint esversion:6 */
/* exported Labels */
/* global PushCalculator CenterDisplay PullCalculator ImpulseCalculator SpringCalculator FieldCalculator AbsorbCalculator */
/* global AngleNode BounceTensorManagent AngleTensor SelectorBehaviour KeySensor Scriptposition DebugWindowSensor */
/* global ButtonBehaviour ScriptShow CollisionSensor CollisionSensor2 CollisionBounce ScriptPosition PropertyList */

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
		this.nodeLabel = this.registerLabel('node', [], {
			'nameProperty': '',
			'positionProperty': new Position(1, 1),
			'visibilityProperty': 1,
			'sizeProperty': 1,
			'colorProperty': 'white',
			'parentTrussNodeProperty': undefined,
			'connectedTensorsProperty': undefined,
		});

		this.seedLabel = this.registerLabel('seed', [this.nodeLabel], {
			'firstEdgeNodeProperty': undefined,
		});
		this.hardBall = this.registerLabel('hardball', [this.nodeLabel], {
			'elasticModulusProperty': 1,
			//'sizeProperty': 1,
		});
		this.cellNodeLabel = this.registerLabel('cellnode', [this.nodeLabel], {});
		this.tensorLabel = this.registerLabel('tensor', [], {
			'nameProperty': '',
			'visibilityProperty': 1,
			'startNodeProperty': undefined,
			'endNodeProperty': undefined,
			'colorProperty': 'white',
			'parentTrussNodeProperty': undefined,
		});
		this.cellEdgeLabel = this.registerLabel('celledge', [this.tensorLabel], {
			'startSeedProperty': undefined,
			'endSeedProperty': undefined,
		});
		let positionTensorLabel = this.registerLabel('positiontensor', [this.tensorLabel], {
			'constantProperty': 1,
		});
		this.registerLabel('pullspring', [positionTensorLabel], {
			'equilibriumLengthProperty': 1,
		}, [new PullCalculator()]);
		this.registerLabel('pushspring', [positionTensorLabel], {
			'equilibriumLengthProperty': 1,
		}, [new PushCalculator()]);
		this.registerLabel('impulsespring', [positionTensorLabel], {}, [new ImpulseCalculator()]);
		this.springLabel = this.registerLabel('spring', [positionTensorLabel], {
			'equilibriumLengthProperty': 1,
		}, [new SpringCalculator()]);
		this.registerLabel('field', [positionTensorLabel], {}, [new FieldCalculator()]);
		this.absorbLabel = this.registerLabel('absorber', [this.tensorLabel], {
			'absorberProperty': 1,
			'visibilityProperty': 1,
		}, [new AbsorbCalculator()]);
		this.moveableLabel = this.registerLabel('moveable', [this.nodeLabel], {
			'massProperty': 1,
			'nodeFrictionProperty': 0.99,
		});
		this.angleNode = this.registerLabel('anglenode', [this.nodeLabel], {
			'angleProperty': 0,
			'turnrateProperty': 0,
			'turnFrictionProperty': 0.99,
		}, [new AngleNode()]);
		this.registerLabel('angletensor', [this.tensorLabel], {
			'startAngleProperty': 0,
			'torqueConstantProperty1': 0,
			'endAngleProperty': 0,
			'torqueConstantProperty2': 0,
		}, [new AngleTensor()]);
		this.registerLabel('debugtensor', [], {
			'degree1Property': 1,
			'degree2Property': 1,
		});
		this.registerLabel('velocitynode', [], {
			'velocityProperty': undefined,
		});
		this.registerLabel('color', [], {
			'colorProperty': 'red',
			'visibilityProperty': 1,
		});
		this.registerLabel('picture', [this.nodeLabel], {
			'pictureProperty': '/Resources/default.jpg',
			'sizeProperty': 1,
			'visibilityProperty': 1,
		});
		this.registerLabel('dampenedspring', [this.springLabel, this.absorbLabel], {});
		this.registerLabel('gravitywell', [this.nodeLabel], {
			'constantProperty': 6.67e-11,
			'massProperty': 5.97219e24,
			'nameProperty': 'Earth',
			'positionProperty': new Position(0, 6371000),
			'enforcedProperty': true,
		});
		this.registerLabel('truss', [this.nodeLabel], {
			'screenSizeProperty': new Position(200, 200),
			'worldSizeProperty': new Position(20, 20),
			'setWorldOffsetProperty': new Position(0, 0),
			'lockedRatioProperty': 1,
			'fpsTargetProperty': 60,
			'fpsProperty': 60,
			'timeMultiplierProperty': 1,
			'snapGridProperty': 0,
		});
		this.sensorLabel = this.registerLabel('sensor', [this.nodeLabel], {});
		this.registerLabel('selector', [this.sensorLabel, this.moveableLabel], {}, [new SelectorBehaviour()]);
		this.registerLabel('keysensor', [this.sensorLabel, this.moveableLabel], {
			'keyProperty': [],
			'restPositionProperty': new Position(1, 1),
		}, [new KeySensor()]);

		this.registerLabel('scriptposition', [this.moveableLabel], {
			'positionScriptProperty': '() => {alert("MyPositionScript");}',
		}, [new ScriptPosition()]);
		this.registerLabel('scriptshow', [], {
			'showScriptProperty': '() => {alert("MyShowScript");}',
		}, [new ScriptShow()]);

		this.collideLabel = this.registerLabel('collide', [this.sensorLabel], {
			'collisionLabelProperty': '',
		}, [new CollisionSensor()]);

		this.preupdateposition = this.registerLabel('preupdateposition', [], {},
			[]);

		this.postupdateposition = this.registerLabel('postupdateposition', [], {},
			[]);

		this.collideLabel = this.registerLabel('collide2', [this.preupdateposition], {
			'collisionLabelProperty': '',
		}, [new CollisionSensor2()]);
	
		this.registerLabel('bouncetensormanagement', [this.postupdateposition,this.preupdateposition], {}, [new BounceTensorManagent()]);

		this.registerLabel('rubberbounceactuator', [this.tensorLabel], {}, [new CollisionBounce()]);
			
		
		this.registerLabel('button', [this.nodeLabel, this.moveableLabel], {
			'buttonScriptProperty': '/*sourcepath template.js*/ () => {alert("MyButtonScript");}',},
		[new ButtonBehaviour()]);
		this.registerLabel('debug', [this.sensorLabel], {}, [new DebugWindowSensor()]);
			
		this.registerLabel('center', [this.sensorLabel], {}, [new CenterDisplay()]);
	}

	

	/**
	 * @param  {Property} name
	 * @param  {List} dependencies
	 * @param  {List} properties
	 * @param  {List} behaviours
	 * @return {Label}
	 */
	registerLabel(name, dependencies, properties, behaviours) {
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
		return this.registerLabel(labelName);
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
	 * @param {StoreableObject} reference
	 * @return {Array} Array of Labels
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
	 * @param  {StoreableObject} reference
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
	// given an object



	/**
	 * @param  {StoreableObject} reference
	 * @return  {Object}
	 */
	addWithDependencies(reference) {
		function recursiveaddition(_this) {
			if (!_this.hasMember(reference)) {
				reference.labels.push(_this);
				_this.addReference(reference);
				for(let l of _this.dependencies) {
					recursiveaddition(l);
				}
			}
		}
		reference.addedLabels.push(this);
		recursiveaddition(this);
	}

	/** TODO: Keep an eye on this, potentially really expensive.
	 * @param  {StoreableObject} reference
	 * @return  {Object}
	 */
	removeWithDependencies(reference) {
		reference.world.labels.clearOldReferences(reference);
		removeIfPresent(this, reference.addedLabels);
		reference.labels=[];
		for(let item of reference.parsedLabels) {
			item.addReference(reference);
			reference.labels.push(item);
		}
		for(let item of reference.addedLabels) {
			item.addWithDependencies(reference);
		}
	}

	/**
	 * @param  {StoreableObject} reference
	 * @return  {Object}
	 */
	hasMember(reference) {
		//check wich is shortest objects labels or label list of objects
		return (reference.labels.indexOf(reference)>=0);
	}


	/**
	 * @param  {StoreableObject} reference
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
