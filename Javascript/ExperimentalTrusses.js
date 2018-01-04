/**
 *
 */

let EarthCenter = new Position(0, 6371e3);
let Earth = new Node(EarthCenter, 5.97219e24, 'Earth', undefined, undefined, 0);

let f2;
/**
 * Create a Field 'Tensor' between the input node and the Earth node
 * @param  {Node} node
 * @return {Field}
 */
function gravityField(node) {
	return new Field(Earth, node, 6.67e-11);
}
/**
 * @class
 * @extends Truss
 */
class WalkTruss extends Truss {
	/**
	 * Creates a new node and ensures that it if connected to the 'gravity' Field
	 * @param  {other} args
	 * @return {Node}
	 */
	addGravityNode(...args) {
		let temp = this.addNode(...args);
		this.addTensor(gravityField(temp));
		return temp;
	}

	/**
	 * @constructor
	 * @param  {View} view
	 * @param  {number} updatefrequency
	 */
	constructor(view, updatefrequency) {
		super(view, updatefrequency);

		// Create a protagonist (yellow circle) and connect it to gravity
		let protagonist = new ProtagonistNode(new Position(3, 2.5), 70, 'Ego1');
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
		f2 = this.addGravityNode(new Node(new Position(5, 4), 100, 'floor2'));
		let f3 = this.addGravityNode(new Node(new Position(9, 3), 100, 'floor3'));
		let f4 = this.addGravityNode(new Node(new Position(10, 3), 100, 'floor4'));
		let f5 = this.addGravityNode(new Node(new Position(14, 3), 100, 'floor5'));

		let b1 = this.addNode(new Node(new Position(1, 7), NaN, 'base1'));
		let b2 = this.addNode(new Node(new Position(5, 6), NaN, 'base2'));
		let b3 = this.addNode(new Node(new Position(9, 6), NaN, 'base3'));
		let b4 = this.addNode(new Node(new Position(10, 6), NaN, 'base4'));
		let b5 = this.addNode(new Node(new Position(14, 6), NaN, 'base5'));


		let b6 = this.addNode(new Node(new Position(1, 8), NaN, 'fulcrum', undefined, undefined, 1, 1000));
		let f6 = this.addGravityNode(new Node(new Position(2, 7), 70, 'weight1', 0, 0, 0.99));
		let f7 = this.addGravityNode(new Node(new Position(3, 6), 70, 'weight2', 0, 0, 0.99));


		let springconstant = 50000;
		let absorbconstant = 5000;

		this.addTensor(new Spring(b6, f6, springconstant));
		this.addTensor(new Spring(f6, f7, springconstant));


		// let startTensor =
		this.addTensor(new Spring(f1, f2, 90000));

		this.addTensor(new Spring(f2, f3, springconstant));
		this.addTensor(new Spring(f4, f5, springconstant));

		this.addTensor(new Spring(b1, f2, springconstant));
		this.addTensor(new Absorber(b1, f2, absorbconstant));

		this.addTensor(new Spring(b2, f1, springconstant));
		this.addTensor(new Absorber(b2, f1, absorbconstant));

		this.addTensor(new Spring(f2, b3, springconstant));
		this.addTensor(new Absorber(f2, b3, absorbconstant));

		this.addTensor(new Spring(f3, b2, springconstant));
		this.addTensor(new Absorber(f3, b2, absorbconstant));

		this.addTensor(new Spring(b4, f5, springconstant));
		this.addTensor(new Absorber(b4, f5, absorbconstant));


		this.addTensor(new Spring(f1, b1, springconstant / 100));
		this.addTensor(new Spring(f2, b2, springconstant / 100));
		this.addTensor(new Spring(f3, b3, springconstant / 100));
		this.addTensor(new Spring(f4, b4, springconstant));
		this.addTensor(new Spring(f5, b5, springconstant));

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
		let leftEarth = new Node(new Position(-6371e3, -6371e1), 5.97219e24, 'leftEarth', undefined, undefined, 0);
		let rightEarth = new Node(new Position(6371e3, -6371e1), 5.97219e24, 'rightEarth', undefined, undefined, 0);
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

		this.addTensor(new Spring(sensorNode, jumpActuator, 50, 0.1));

		let collissionsensor = new CollisionSensorNode(new Position(4, 1), 0.01, 'CollissionSensor1');
		collissionsensor.registerTrussObjectAndActuator(this, protagonist, lineBreakerActuator);

		let bounceSensor = new BounceSensorNode(new Position(6, 1), 0.01, 'BounceSensor1');
		bounceSensor.registerTrussObjectAndActuator(this, protagonist, lineBreakerActuator);

		// let collissionsensor2 = new CollisionSensorNode(new Position(4, 1), 0.01, 'CollissionSensor2');
		// collissionsensor2.registerTrussObjectAndActuator(this, protagonist2, lineBreakerActuator2);

		// let bounceSensor2 = new BounceSensorNode(new Position(6, 1), 0.01, 'BounceSensor2');
		// bounceSensor2.registerTrussObjectAndActuator(this, protagonist2, lineBreakerActuator2);

		// this.addTensor(new Spring(protagonist, protagonist2, springconstant));
	}
}

/**
 * @class
 * @extends Node
 */
class ProtagonistNode extends Node {
	/**
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(startPosition, mass = 70, name = 'ProtagonistNode', positionFunction, showFunction, velocityLoss = 1) {
		super(startPosition, mass, name, positionFunction, showFunction, velocityLoss);
		this.actuators = 0;
		this.sensors = 0;
	}

	/**
	 * Draws the tensor on a given Canvas. The graphicDebugLevel determines how many details that should be displayed
	 * @param  {Canvas} canvas
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel
	 */
	show(canvas, time, graphicDebugLevel = 0) {
		if (canvas.inside(this.getPosition())) {
			canvas.context.strokeStyle = 'yellow';
			canvas.context.beginPath();
			canvas.drawCircle(this.getPosition(), 1);
			canvas.context.stroke();
			canvas.context.strokeStyle = 'red';
			canvas.context.beginPath();
			canvas.drawCircle(this.getPosition(), 0.01);
			canvas.context.stroke();
		}
	}
}

/**
 * @param  {View} view
 * @param  {number} updatefrequency

function MyTruss(view, updatefrequency) {
	Truss.call(this, view, updatefrequency);

	let myX = 3;
	let myY = 3;
	let mouseSet = false;

	/**
	 * @param  {Event} e
	 *
	function myMove(e) {
		myX = e.pageX;
		myY = e.pageY;
	}

	/**
	 * @param  {Event} e
	 *
	function downMouse(e) {
		mouseSet = true;
	}

	/**
	 * @param  {Event} e
	 *
	function upMouse(e) {
		mouseSet = false;
	}

	let thisTrussView = this.view;
	thisTrussView.context.canvas.onmousemove = myMove;
	thisTrussView.context.canvas.onmousedown = downMouse;
	thisTrussView.context.canvas.onmouseup = upMouse;


	let n1 = this.addNode(new Node(new Position(1, 0.3), 5, 'fulcrum', function(node, tick) {
		return new Position(1 + 0.5 * Math.sin(tick), 0.3);
	}));
	let n2 = this.addNode(new Node(new Position(1.3, 0.6), 10, 'right'));
	let n3 = this.addNode(new Node(new Position(1, 0.9), 100, 'down', function(node, n) {
		if (mouseSet) {
			return thisTrussView.worldPosition(myX, myY);
		}
		return node.getPosition();
	}));
	let n4 = this.addNode(new Node(new Position(0.7, 0.6), 10, 'left'));

	this.addTensor(new Spring(n1, n2, 100));
	this.addTensor(new Spring(n2, n3, 500));
	this.addTensor(new Spring(n3, n4, 500));
	this.addTensor(new Spring(n4, n1, 100));
	this.addTensor(new Spring(n2, n4, 100));


	this.addTensor(new Absorber(n1, n2, 100));
	this.addTensor(new Absorber(n2, n3, 249));
	this.addTensor(new Absorber(n3, n4, 500));
	this.addTensor(new Absorber(n4, n1, 500));
	this.addTensor(new Absorber(n2, n4, 100));

	this.addTensor(gravityField(n2));
	this.addTensor(gravityField(n3));
	this.addTensor(gravityField(n4));

	this.initConnect();
}
*/
