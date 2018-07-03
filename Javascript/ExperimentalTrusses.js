/**
 *
 */
let EarthCenter = new Position(0, 6371e3);

/**
 * @class
 * @extends Truss
 */
class WalkTruss extends Truss {
	/**
	 * @constructor
	 * @param  {View} view
	 * @param  {number} updatefrequency
	 */
	constructor(...args) {
		super(...args);
		this.blur = true;
	}

	/**
	 * Creates a new node and ensures that it if connected to the 'gravity' Field
	 * @param {Truss} truss
	 * @param  {other} args
	 * @return {Node}
	 */
	addGravityNode(...args) {
		return this.addGravityNodeAndTensor(...args).node;
	}

	/**
 	 * @param  {Truss} truss
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(truss, nodeList, tensorList) {
		let representationObject = super.serialize(truss, nodeList, tensorList);
		representationObject.classname = 'WalkTruss';
		return representationObject;
	}

	/**
 	* @param  {Truss} truss
	 * @param  {other} args
	 * @return {Object} Node, Field
	 */
	addGravityNodeAndTensor(...args) {
		let node = this.addNode(...args);
		let gravity = this.addTensor(this.gravityField(node));
		return {
			node,
			gravity,
		};
	}

	/**
	 * Create a Field 'Tensor' between the input node and the Earth node
	 * @param  {Node} node
	 * @return {Field}
	 */
	gravityField(node) {
		return new Field(this.earth, node, 6.67e-11);
	}

	/**
	 *
	 */
	initiate() {
		let parent=this.parentTrussNode;
		let Earth = this.addNode(new Node(parent, EarthCenter, 5.97219e24, 'Earth'));
		this.earth=Earth;
		parent.selector = this.addNode(new Selector(parent));


		// Create a protagonist (yellow circle) and connect it to gravity
		this.protagonist = this.addNode(new ProtagonistNode(parent, new Position(5, 5), 70, 'Ego1'));
		/*
		// let protagonist = new ProtagonistNode(new Position(0.1, 1), 70, 'Ego1');
		this.addNode(protagonist);

		let egoGravityField = this.addTensor(gravityField(protagonist)); // Needed to create a jumpactuator

		// Add one actuator to take care of springrunning
		let lineBreakerActuator = this.addNode(
			new LineBreakerNode(protagonist, 0.01, 'lineBreakerActuator1'));

		this.addSensor(lineBreakerActuator); // wrong way to do it

		// let ego2 = this.addGravityNode(new ProtagonistNode(new Position(4, 1.2), 70, 'Ego2'));
		// let protagonist2 = new ProtagonistNode(new Position(4, 2.3), 70, 'Ego2');
		// this.addNode(protagonist2);
		// let egoGravityField2 = this.addTensor(gravityField(protagonist2)); // Needed to create a jumpactuator
		// let lineBreakerActuator2 = this.addNode(
		//	new LineBreakerNode(protagonist2, 0.01, 'lb2'));
		// this.addSensor(lineBreakerActuator2); // wrong way to do it

		// Set up the truss of nodes
		let f1 = this.addGravityNode(new Node(new Position(1, 2), 100, 'floor1'));
		f2 = this.addGravityNode(new Node(new Position(5, 4), 100, 'floor2', 0, 0, 0.99, 1000));
		let f3 = this.addGravityNode(new Node(new Position(9, 3), 100, 'floor3'));
		let f4 = this.addGravityNode(new Node(new Position(10, 3), 100, 'floor4'));
		let f5 = this.addGravityNode(new Node(new Position(12, 3), 100, 'floor5'));

		let b1 = this.addNode(new Node(new Position(1, 7), NaN, 'base1'));
		let b2 = this.addNode(new Node(new Position(5, 6), NaN, 'base2'));
		let b3 = this.addNode(new Node(new Position(9, 6), NaN, 'base3'));
		let b4 = this.addNode(new Node(new Position(10, 6), NaN, 'base4'));
		let b5 = this.addNode(new Node(new Position(12, 6), NaN, 'base5')); */

		// rotation

		let b6 = this.addNode(new Node(parent, new Position(0.2, 2.24), NaN, 'fulcrum', undefined, undefined, 1, 5000));
		let f6 = this.addGravityNode(new Node(parent, new Position(2, 1), 10, 'bar 1', 0, 0, 0.9, 2000));

		f6.pictureReference='facade.jpg';

		let leftpic = this.addGravityNode(new Node(parent, new Position(3, 2), 10, 'left', 0, 0, 0.99));
		let bottompic = this.addGravityNode(new Node(parent, new Position(4, 3), 70, 'bottom', 0, 0, 0.999));
		let rightpic = this.addGravityNode(new Node(parent, new Position(5, 2), 10, 'right', 0, 0, 0.99));

		/* f7 = this.addGravityNode(new Node(new Position(4, 1), 70, 'top', 0,
			function() {
				if (!pic) {
					pic = document.getElementById('dimage');
				}
				if (pic && mainNode && rightpic && f7 && bottompic && leftpic) {
					warpMatrix(mainNode.truss, pic,
						rightpic.getPosition(),
						this.getPosition(),
						bottompic.getPosition(),
						leftpic.getPosition());
				}
			}
		));*/

		let f7 = this.addGravityNode(new PictureNode(parent, new Position(4, 1), 70, 'top', [rightpic, bottompic, leftpic], 'facade.jpg'));

		/* let leftpic = this.addGravityNode(new Node(new Position(3, 2), 10, 'left', 0, 0, 0.99));
		let bottompic = this.addGravityNode(new Node(new Position(4, 3), 70, 'bottom', 0, 0, 1));
		let rightpic = this.addGravityNode(new Node(new Position(5, 2), 10, 'right', 0,
			function() {
				if (!pic) {
					var pic = document.getElementById('dimage');
				}
				warpMatrix(mainNode.truss, pic,
					rightpic.getPosition(),
					f7.getPosition(),
					bottompic.getPosition(),
					leftpic.getPosition());
			}
		));*/


		let springconstant = 5000;
		let absorbconstant = 50;

		this.addTensor(new Spring(b6, f6, 900));
		this.addTensor(new Spring(f6, f7, springconstant));

		this.addTensor(new Spring(f7, leftpic, springconstant * 10));
		this.addTensor(new Spring(leftpic, bottompic, springconstant / 10));
		this.addTensor(new Spring(bottompic, rightpic, springconstant));
		this.addTensor(new Spring(leftpic, rightpic, springconstant / 10));
		this.addTensor(new Spring(rightpic, f7, springconstant));


		this.addTensor(new Spring(this.protagonist, bottompic, springconstant));
		/*
		// let startTensor =
		this.addTensor(new Spring(f1, f2, 9000));

		this.addTensor(new Spring(b2, f1, springconstant));
		this.addTensor(new Absorber(b2, f1, absorbconstant));
		this.addTensor(new Spring(f2, f3, springconstant));
		this.addTensor(new Spring(f4, f5, springconstant*10));

		this.addTensor(new Spring(b1, f2, springconstant));
		this.addTensor(new Absorber(b1, f2, absorbconstant));


		this.addTensor(new Spring(f2, b3, springconstant));
		this.addTensor(new Absorber(f2, b3, absorbconstant));

		this.addTensor(new Spring(f3, b2, springconstant));
		this.addTensor(new Absorber(f3, b2, absorbconstant));

		this.addTensor(new Spring(b4, f5, springconstant*10));
		this.addTensor(new Absorber(b4, f5, absorbconstant));

		this.addTensor(new Spring(f1, b1, springconstant*10));
		this.addTensor(new Spring(f2, b2, springconstant*10));
		this.addTensor(new Spring(f3, b3, springconstant*10));
		this.addTensor(new Spring(f4, b4, springconstant*10));
		this.addTensor(new Spring(f5, b5, springconstant*10));

		this.addTensor(new Absorber(f1, b1, absorbconstant));
		this.addTensor(new Absorber(f2, b2, absorbconstant));
		this.addTensor(new Absorber(f3, b3, absorbconstant));
		this.addTensor(new Absorber(f4, b4, absorbconstant));
		this.addTensor(new Absorber(f5, b5, absorbconstant));


		// Set up a keysensornode and make it sensitive to q, e and space
		let sensorNode = this.addNode(new KeySensorNode(new Position(2, 1), 0.01, 'myKeySensorNode'));
		sensorNode.registerKey(37, new Vector(-1, 0));
		sensorNode.registerKey(65, new Vector(-1, 0));
		sensorNode.registerKey(39, new Vector(1, 0));
		sensorNode.registerKey(68, new Vector(1, 0));
		sensorNode.registerKey(32, new Vector(0, 1));

		// Create two gravitywells and two fields towards them that can be used
		// by the actuator to pull the protagonist left or right
		let leftEarth = this.addNode(new Node(new Position(-6371e3, -6371e1), 5.97219e24, 'leftEarth', undefined, undefined, 0));
		let rightEarth =this.addNode( new Node(new Position(6371e3, -6371e1), 5.97219e24, 'rightEarth', undefined, undefined, 0));
		let leftField1 = this.addTensor(new Field(leftEarth, protagonist, 6.67e-11)); // 6.67e-11));
		let rightField1 = this.addTensor(new Field(rightEarth, protagonist, 6.67e-11));

		// Add one actuator that takes care of left - right movement
		let leftRightActuatorNode = this.addNode(
			new LeftRightNode(protagonist, new Position(1, 0.5), new Position(3, 0.5),
				leftField1, rightField1, 0.05, 'myLeftRightNode', 0, 0, 0.99));

		// Connect it via a spring to the keysensor node
		this.addTensor(new Spring(sensorNode, leftRightActuatorNode, 50, 0.1));


		let jumpActuator = this.addNode(
			new JumpNode(protagonist, new Position(0.5, 1), new Position(0.5, 2),
				egoGravityField, 0.05, 'myJumpNode'));

		this.addTensor(new Spring(sensorNode, jumpActuator, 500, 0.1));

		let collissionsensor = this.addNode(new CollisionSensorNode(new Position(4, 1), 0.01,
			'CollissionSensor1', protagonist, lineBreakerActuator));
		// collissionsensor.registerTrussObjectAndActuator(mainNode, protagonist, lineBreakerActuator);

		let bounceSensor = this.addNode(new BounceSensorNode(new Position(6, 1), 0.01, 'BounceSensor1', protagonist, lineBreakerActuator));
		// bounceSensor.registerTrussObjectAndActuator(mainNode, protagonist, lineBreakerActuator);

		// let collissionsensor2 = new CollisionSensorNode(new Position(4, 1), 0.01, 'CollissionSensor2');
		// collissionsensor2.registerTrussObjectAndActuator(this, protagonist2, lineBreakerActuator2);

		// let bounceSensor2 = new BounceSensorNode(new Position(6, 1), 0.01, 'BounceSensor2');
		// bounceSensor2.registerTrussObjectAndActuator(this, protagonist2, lineBreakerActuator2);

		// this.addTensor(new Spring(protagonist, protagonist2, springconstant));

		Localview =this.view;

		let selectorNode = this.addNode(new Node(new Position(1, 0.9), 100, 'pusher', function(node, n) {
			if (mouseSet) {
				return Localview.worldPosition(myX, myY);
			}
			return node.getPosition();
		}));

		let saveTrigger = this.addNode(new ProximitySensorNode(new Position(5, 1), 1, 'proximity1',
			function() {
				if (!savedState) {
					savedState=mainNode.serialize();
				}
			}
		));
		saveTrigger.registerProximity(selectorNode, 1, new Vector(0.5, 0));

		let loadTrigger = this.addNode(new ProximitySensorNode(new Position(7, 1), 1, 'proximity2',
			function() {
				if (savedState) {
					// mainNode.truss.clear();
					newMainNode=new TrussNode();
					newMainNode.deserialize(savedState);
					// Object.setPrototypeOf(mainNode, TrussNode.prototype);
					// mainNode.prototype=TrussNode.prototype;
					savedState=undefined;
				}
			}
		));
		loadTrigger.registerProximity(selectorNode, 1, new Vector(0.5, 0));
		*/
	}
}

/**
 * @class
 * @extends Truss
 */
class GovenorTruss extends Truss {
	/**
	 * @constructor
	 * @param  {View} view
	 * @param  {number} updatefrequency
	 */
	constructor( ...args) {
		super(...args);
		this.blur = true;
		// this.governedTruss = governedTruss;
	}


	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'GovenorTruss';
		return representationObject;
	}


	/**
	 * @param {Node} protagonist
	 */
	initiate() {
		let governedNode=this.parentTrussNode.parentTrussNode;
		let parent = this.parentTrussNode;
		let governedTruss=governedNode.truss;

		protagonist = governedTruss.protagonist;
		parent.selector = this.addNode(new Selector(parent));
		// Set up a keysensornode and make it sensitive to q, e and space
		let sensorNode = this.addNode(new KeySensorNode(parent, new Position(2, 1), 0.01, 'myKeySensorNode'));
		sensorNode.registerKey(37, new Vector(-2, 0));
		sensorNode.registerKey(65, new Vector(-2, 0));
		sensorNode.registerKey(39, new Vector(2, 0));
		sensorNode.registerKey(68, new Vector(2, 0));
		sensorNode.registerKey(32, new Vector(0, 1));


		// let fulcrum = this.addNode(new Node(this, new Position(2, 5), NaN, 'fulcrum', undefined, undefined, 1, 5000));

		// this.addTensor(new Spring(fulcrum, sensorNode, 900));


		// Create two gravitywells and two fields towards them that can be used
		// by the actuator to pull the protagonist left or right


		let downEarth = this.addNode(new Node(parent, new Position(0, 6371e3), 5.97219e24, 'EarthForJump', undefined, undefined, 0));
		let leftEarth = this.addNode(
			new Node(parent, new Position(-6371e3, -6371e1), 5.97219e24, 'leftEarth', undefined, undefined, 0));
		let rightEarth =this.addNode(
			new Node(parent, new Position(6371e3, -6371e1), 5.97219e24, 'rightEarth', undefined, undefined, 0));
		let leftField1 = this.addTensor(new Field(leftEarth, protagonist, 6.67e-11));
		let rightField1 = this.addTensor(new Field(rightEarth, protagonist, 6.67e-11));
		let gravity = this.addTensor(new Field(downEarth, protagonist, 6.67e-11));
		// let egoGravityField = this.addTensor(new Field(rightEarth, protagonist, 6.67e-11));

		// Add one actuator that takes care of left - right movement
		let leftRightActuatorNode = this.addNode(
			new LeftRightNode(parent, protagonist, new Position(1, 5), new Position(3, 5),
				leftField1, rightField1, 2, 'myLeftRightNode', 0, 0, 0.99));

		// Connect it via a spring to the keysensor node
		this.addTensor(new Spring(sensorNode, leftRightActuatorNode, 50, 0.1));


		let jumpActuator = this.addNode(
			new JumpNode(parent, protagonist, new Position(0.5, 1), new Position(0.5, 2),
				gravity, 0.05, 'myJumpNode'));

		this.addTensor(new Spring(sensorNode, jumpActuator, 500, 0.1));
	}
}

/**
 * @class
 * @extends Truss
 */
class ScrollerTruss extends Truss {
	/**
	 * @constructor
	 * @param  {View} view
	 * @param  {number} updatefrequency
	 */
	constructor( ...args) {
		super(...args);
		this.blur = true;
		// this.governedTruss = governedTruss;
	}


	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'GovenorTruss';
		return representationObject;
	}


	/**
	 * @param {Node} protagonist
	 */
	initiate() {
		let governedNode=this.parentTrussNode.parentTrussNode;
		let parent = this.parentTrussNode;
		let governedTruss=governedNode.truss;

		protagonist = governedTruss.protagonist;
		parent.selector = this.addNode(new Selector(parent));

		let centrePoint = Vector.divideVector(governedNode.view.worldViewSize, 2);
		let positionNode = this.addNode(new PositionNode(parent, protagonist));
		let scrollNode = this.addNode(new ScrollNode(parent, governedNode, centrePoint,
			0.2, 'ScrollNode', undefined, undefined, 0.9));

		let tensor = this.addTensor(new DampenedSpring(positionNode, scrollNode, 200, 0.2));
		tensor.equilibriumLength=0;
	}
}

/**
 * @class
 * @extends Truss
 */
class PerformanceTruss extends Truss {
	/**
	 * @constructor
	 * @param  {View} view
	 * @param  {number} updatefrequency
	 */
	constructor( ...args) {
		super(...args);
		this.blur = true;
		// this.governedTruss = governedTruss;
	}


	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'GovenorTruss';
		return representationObject;
	}


	/**
	 * @param {Node} protagonist
	 */
	initiate() {
		let governedNode=this.parentTrussNode.parentTrussNode;
		let parent = this.parentTrussNode;
		let governedTruss=governedNode.truss;

		// protagonist = governedTruss.protagonist;
		parent.selector = this.addNode(new Selector(parent));

		for (let row=1; row < 10; row++) {
			for (let column=1; column < 10; column++) {
				let x = this.addNode(new Node(parent, new Position(row*3, column*3), 1));
				x.pictureReference='trussicon.png';
				x.pictureHeight=600;
				x.pictureWidth=600;
				// x.element.width='300px';
				// x.pictureReference='trussIcon.png';
				x.turnrate=0.04;
				protagonist=x;
			}
		}
	}
}

/**
 * @class
 * @extends Node
 */
class ProtagonistNode extends Node {
	/**
	 * @param  {Truss} truss
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(truss, startPosition, mass = 70, name = 'ProtagonistNode', positionFunction, showFunction, velocityLoss = 1) {
		super(truss, startPosition, mass, name, positionFunction, showFunction, velocityLoss);
		this.color = 'yellow';
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(truss, nodeList, tensorList) {
		let representationObject = super.serialize(truss, nodeList, tensorList);
		representationObject.classname = 'ProtagonistNode';
		return representationObject;
	}

	/**
	 * Draw the circle representing the node
	 * @param {Truss} truss
	 * @param {number} time
	 * @param {number} graphicDebugLevel
	 */
	show(truss, time, graphicDebugLevel = 0) {
		let view = truss.view;
		let cxt = view.context;
		if (view.inside(this.getPosition())) {
			this.highLight(cxt);
			cxt.beginPath();
			view.drawCircle(this.getPosition(), 0.5);
			cxt.stroke();
			cxt.strokeStyle = 'red';
			cxt.beginPath();
			view.drawCircle(this.getPosition(), 0.01);
			cxt.stroke();
		}
	}
}
