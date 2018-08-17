/**
 *
 */
let EarthCenter = new Position(0, 6371e3);

/**
 * @class
 * @extends TrussNode
 */
class GovenorTruss extends TrussNode {
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

		this.addTensor(new Spring(f1, b1, springconstant*10));
		this.addTensor(new Spring(f2, b2, springconstant*10));
		this.addTensor(new Spring(f3, b3, springconstant*10));
		this.addTensor(new Spring(f4, b4, springconstant*10));
		this.addTensor(new Spring(f5, b5, springconstant*10));

		// let fulcrum = this.addNode(new Node(this, new Position(2, 5), NaN, 'fulcrum', undefined, undefined, 1, 5000));

		// this.addTensor(new Spring(fulcrum, sensorNode, 900));

		// Set up a keysensornode and make it sensitive to q, e and space
		let sensorNode = this.addNode(new KeySensorNode(new Position(2, 1), 0.01, 'myKeySensorNode'));
		sensorNode.registerKey(37, new Vector(-1, 0));
		sensorNode.registerKey(65, new Vector(-1, 0));
		sensorNode.registerKey(39, new Vector(1, 0));
		sensorNode.registerKey(68, new Vector(1, 0));
		sensorNode.registerKey(32, new Vector(0, 1));

		// Create two gravitywells and two fields towards them that can be used
		// by the actuator to pull the protagonist left or right

		// Add one actuator that takes care of left - right movement
		let leftRightActuatorNode = this.addNode(
			new LeftRightNode(protagonist, new Position(1, 0.5), new Position(3, 0.5),
				leftField1, rightField1, 0.05, 'myLeftRightNode', 0, 0, 0.99));

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

		this.addTensor(new Spring(sensorNode, jumpActuator, 500, 0.1));

		let jumpActuator = this.addNode(
			new JumpNode(parent, protagonist, new Position(0.5, 1), new Position(0.5, 2),
				gravity, 0.05, 'myJumpNode'));

		this.addTensor(new Spring(sensorNode, jumpActuator, 500, 0.1));
	}
}

/**
 * @class
 * @extends TrussNode
 */
class ScrollerTruss extends TrussNode {
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

		// let bounceSensor2 = new BounceSensorNode(new Position(6, 1), 0.01, 'BounceSensor2');
		// bounceSensor2.registerTrussObjectAndActuator(this, protagonist2, lineBreakerActuator2);

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
class PerformanceTrussNode extends TrussNode {
	/**
	 * @constructor
	 * @param  {View} view
	 * @param  {number} updatefrequency
	 */
	constructor( ...args) {
		super(...args);
		this.blur = true;
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'PerformanceTrussNode';
		return representationObject;
	}


	/**
	 * @param {Node} protagonist
	 */
	initiate() {
		let governedNode=this.parentTrussNode.parentTrussNode;
		let parent = this.parentTrussNode;
		let world = parent.world;

		this.selector = new Selector(this.world, this, 'selector', {
			'name': 'Selector ',
		});

		for (let row=1; row < 2; row++) {
			for (let column=1; column < 2; column++) {
				let x = new Node(this.world, this, 'turngridnode node', {
					'name': 'Node '+column+' '+row,
					'localPosition': new Position(column*3, row*3),
					// 'pictureReference': 'trussicon.png',
					// 'pictureHeight': 600,
					// 'pictureWidth': 600,
					// 'turnrate': 0.04,
				});

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
