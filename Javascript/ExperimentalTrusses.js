/*jshint esversion:6 */
/*global TrussNode Tensor Velocity Planet*/

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
	 * @param  {TrussView} view
	 * @param  {number} updatefrequency
	 */
	constructor(...args) {
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
		// let governedNode = this.parentTrussNode.parentTrussNode;
		// let parent = this.parentTrussNode;
		// let governedTruss = governedNode.truss;

		// protagonist = governedTruss.protagonist;
		// parent.selector = this.addNode(new Selector(parent));
		// // Set up a keysensornode and make it sensitive to q, e and space
		// let sensorNode = this.addNode(new KeySensorNode(parent, new Position(2, 1), 0.01, 'myKeySensorNode'));
		// sensorNode.registerKey(37, new Vector(-2, 0));
		// sensorNode.registerKey(65, new Vector(-2, 0));
		// sensorNode.registerKey(39, new Vector(2, 0));
		// sensorNode.registerKey(68, new Vector(2, 0));
		// sensorNode.registerKey(32, new Vector(0, 1));

		// this.addTensor(new Spring(f1, b1, springconstant * 10));
		// this.addTensor(new Spring(f2, b2, springconstant * 10));
		// this.addTensor(new Spring(f3, b3, springconstant * 10));
		// this.addTensor(new Spring(f4, b4, springconstant * 10));
		// this.addTensor(new Spring(f5, b5, springconstant * 10));

		// // let fulcrum = this.addNode(new Node(this, new Position(2, 5), NaN, 'fulcrum', undefined, undefined, 1, 5000));

		// // this.addTensor(new Spring(fulcrum, sensorNode, 900));

		// // Create two gravitywells and two fields towards them that can be used
		// // by the actuator to pull the protagonist left or right

		// // Add one actuator that takes care of left - right movement
		// let leftRightActuatorNode = this.addNode(
		// 	new LeftRightNode(protagonist, new Position(1, 0.5), new Position(3, 0.5),
		// 		leftField1, rightField1, 0.05, 'myLeftRightNode', 0, 0, 0.99));

		// let downEarth = this.addNode(new Node(parent, new Position(0, 6371e3), 5.97219e24, 'EarthForJump', undefined, undefined, 0));
		// let leftEarth = this.addNode(
		// 	new Node(parent, new Position(-6371e3, -6371e1), 5.97219e24, 'leftEarth', undefined, undefined, 0));
		// let rightEarth = this.addNode(
		// 	new Node(parent, new Position(6371e3, -6371e1), 5.97219e24, 'rightEarth', undefined, undefined, 0));
		// let leftField1 = this.addTensor(new Field(leftEarth, protagonist, 6.67e-11));
		// let rightField1 = this.addTensor(new Field(rightEarth, protagonist, 6.67e-11));
		// let gravity = this.addTensor(new Field(downEarth, protagonist, 6.67e-11));
		// // let egoGravityField = this.addTensor(new Field(rightEarth, protagonist, 6.67e-11));

		// // Connect it via a spring to the keysensor node
		// this.addTensor(new Spring(sensorNode, leftRightActuatorNode, 50, 0.1));

		// this.addTensor(new Spring(sensorNode, jumpActuator, 500, 0.1));

		// let jumpActuator = this.addNode(
		// 	new JumpNode(parent, protagonist, new Position(0.5, 1), new Position(0.5, 2),
		// 		gravity, 0.05, 'myJumpNode'));

		// this.addTensor(new Spring(sensorNode, jumpActuator, 500, 0.1));
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
	constructor(...args) {
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
		// let governedNode = this.parentTrussNode.parentTrussNode;
		// let parent = this.parentTrussNode;
		// let governedTruss = governedNode.truss;

		// let protagonist = governedTruss.protagonist;
		// parent.selector = this.addNode(new Selector(parent));

		// let centrePoint = Vector.divideVector(governedNode.view.worldViewSize, 2);
		// let positionNode = this.addNode(new PositionNode(parent, protagonist));
		// let scrollNode = this.addNode(new ScrollNode(parent, governedNode, centrePoint,
		// 	0.2, 'ScrollNode', undefined, undefined, 0.9));

		// let tensor = this.addTensor(new DampenedSpring(positionNode, scrollNode, 200, 0.2));
		// tensor.equilibriumLength = 0;
	}
}

var cheatCounter=0;

/**
 * @class
 * @extends Truss
 */
class PerformanceTrussNodex extends TrussNode {
	/**
	 * @constructor
	 * @param  {TrussView} view
	 * @param  {number} updatefrequency
	 */
	constructor(...args) {
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
		// let governedNode = this.parentTrussNode.parentTrussNode;
		// let parent = this.parentTrussNode;
		// let world = parent.world;

		this.selector = new Node(this.world, this, 'selector', {'name': 'Selector '});


		let start = new Node(this.world, this, 'node', {
			'name': 'startright',
			'localPosition': new Position(1, 2),
		});

		let end = new Node(this.world, this, 'node', {
			'name': 'endright',
			'localPosition': new Position(1, 1),
		});

		new Tensor(start, end,
			'spring bounce rubberbounceactuator',
			{
				'name': 'right',
				'constant': 10,
				'equilibriumLength': 1,
			});

		
		new Node(this.world, this, 'button', {
			'name': 'button',
			'localPosition': new Position(1.05, 1),
			'buttonScript':  '/*sourcepath template.js*/ () => {'+
				'new Node(this.world, this, \'collide moveable debugnode\', {'+
				'\'name\': \'ball\'+cheatCounter++,'+
				'\'mass\': 1,'+
				'\'localPosition\': new Position(0, 0),'+
				'\'velocityLoss\': 1,'+
				'\'collisionLabel\': \'bounce\','+
				'\'velocity\': new Velocity(10, 10),'+
			'});}'
		});

	}
}

/**
 * @class
 * @extends Truss
 */
class PerformanceTrussNode extends TrussNode {
	/**
	 * @constructor
	 * @param  {TrussView} view
	 * @param  {number} updatefrequency
	 */
	constructor(...args) {
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
		// let governedNode = this.parentTrussNode.parentTrussNode;
		// let parent = this.parentTrussNode;
		// let world = parent.world;

		this.selector = new Node(this.world, this, 'selector', {
			'name': 'Selector ', 
			'color': 'red',
			'size':0.02});


		let start2 = new Node(this.world, this, 'node', {
			'name': 'startleft',
			'localPosition': new Position(1, 1),
		});

		let start2a = new Node(this.world, this, 'node', {
			'localPosition': new Position(4, -1),
		});
		
		let start2b = new Node(this.world, this, 'node', {
			'localPosition': new Position(-2, 5),
		});
	
		let end2 = new Node(this.world, this, 'node', {
			'name': 'endleft',
			'localPosition': new Position(1, 10),
		});


		new Node(this.world, this, 'debug', {
			'name': 'debug',
			'localPosition': new Position(0, 0),
		});

		let start = new Node(this.world, this, 'node', {
			'name': 'startright',
			'localPosition': new Position(3, 1),
		});

		let starta = new Node(this.world, this, 'node', {
			'localPosition': new Position(0, -1),
		});
	
		let startb = new Node(this.world, this, 'node', {
			'localPosition': new Position(6, 5),
		});

		let end = new Node(this.world, this, 'node', {
			'name': 'endright',
			'localPosition': new Position(3, 10),
		});
		/*
		let enda = new Node(this.world, this, 'node', {
			'localPosition': new Position(6, 6),
		});
	
		let endb = new Node(this.world, this, 'node', {
			'localPosition': new Position(0, 12),
		});

		let end2a = new Node(this.world, this, 'node', {
			'localPosition': new Position(-2, 6),
		});
	
		let end2b = new Node(this.world, this, 'node', {
			'localPosition': new Position(4, 12),
		});
		*/
		new Tensor(start2, end2,
			'pullspring rubberbounceactuator collide2',
			{
				'name': 'left',
				'constant': 900,
				'collisionLabel': 'bounce',
				'equilibriumLength': 8,
			});

		new Tensor(start, end,
			'pullspring rubberbounceactuator collide2',
			{
				'name': 'right',
				'constant': 10,
				'collisionLabel': 'bounce',
				'equilibriumLength': 1,
			});

		new Tensor(start2a, start2b,
			'pullspring rubberbounceactuator',
			{
				'name': 'nw',
				'constant': 100,
				'equilibriumLength': 0,
			});
	
	
		new Tensor(starta, startb,
			'pullspring rubberbounceactuator',
			{
				'name': 'ne',
				'constant': 100,
				'equilibriumLength': 0,
			});
		/*new Tensor(enda, endb,
			'pullspring bounce rubberbounceactuator',
			{
				'name': 'sw',
				'constant': 100,
				'equilibriumLength': 0,
			});
		new Tensor(end2a, end2b,
			'pullspring bounce rubberbounceactuator',
			{
				'name': 'se',
				'constant': 100,
				'equilibriumLength': 0,
			});*/

		new Tensor(start, start2,
			'pullspring rubberbounceactuator',
			{
				'name': 'top',
				'constant': 10,
				'equilibriumLength': 0.1,
			});
	
		new Tensor(end2, end,
			'spring rubberbounceactuator',
			{
				'name': 'bottom',
				'constant': 10,
				'equilibriumLength': 0.1,
			});
		
		/*new Node(this.world, this, 'collide moveable velocitynode', {
			'name': 'newball_'+1,
			'mass': 1,
			'elasticModulus': 10000,
			'size': 0.1,
			'color': 'lightgreen',
			'localPosition': new Position(2.5, 5),
			'velocityLoss': 1,
			'collisionLabel': 'bounce',
			'velocity': new Velocity(7,7),
		});
		new Node(this.world, this, 'moveable velocitynode', {
			'name': 'Original',
			'mass': 10,
			'size': 0.06,
			'color': 'yellow',
			'localPosition': new Position(2.0, 9.99),
			'velocityLoss': 1,
			'velocity': new Velocity(-1,0),
		});*/

		for (let a = 0; a<10; a++) {
			let color='white';
			if (a==6) {
				color='red';
			}
			if (a==14) {
				color='green';
			}
			new Node(this.world, this, 'bounce moveable velocitynode', {
				'name': 'newball_'+a,
				'mass': 1,
				'size': 0.04,
				'color': color,
				'localPosition': new Position(2, 3+0.09*a),
				'velocityLoss': 1,
				'velocity': new Velocity(-2,-0.3+0.19*a),
			});
		} 
	
		/*
		for (let a = 0; a<10; a++) {
			new Node(this.world, this, 'collide moveable hardball velocitynode', {
				'name': 'newball_'+a,
				'mass': 1,
				'elasticModulus': 10000,
				'size': 0.04,
				'color': 'white',
				'localPosition': new Position(2, 3+0.09*a),
				'velocityLoss': 1,
				'collisionLabel': 'bounce',
				'velocity': new Velocity(1,0),
			});
		} 

		for (let a = 0; a<0; a++) {
			new Node(this.world, this, 'collide moveable hardball velocitynode', {
				'name': 'newball2_'+a,
				'mass': 2,
				'elasticModulus': 10000,
				'size': 0.04,
				'color': 'white',
				'localPosition': new Position(1.9, 5+0.09*a),
				'velocityLoss': 1,
				'collisionLabel': 'bounce',
				'velocity': new Velocity(1,0),
			});
		} */
		
		/*
		let alpha = new Node(this.world, this, 'moveable hardball', {
			'name': 'alpha',
			'size': 2,
			'localPosition': new Position(6, 5),
			'elasticModulus': 1000,
		});

		
		let beta = new Node(this.world, this, 'moveable hardball', {
			'name': 'beta',
			'localPosition': new Position(6, 9),
			'size': 1,
			'elasticModulus': 1000,
		});
		new Tensor(alpha, beta,
			'pullspring pushspring',
			{
				'name': 'experimetalstring',
				'constant': 10,
				'equilibriumLength': 1,
			});

		
		new Node(this.world, this, 'collide moveable debugnode', {
			'name': 'ball3',
			'mass': 1,
			'localPosition': new Position(2, 3),
			'velocityLoss': 1,
			'collisionLabel': 'bounce',
			'velocity': new Velocity(1, 0.1),
		});*/
		
		

		new Node(this.world, this, 'node button', {
			'name': 'new Ball',
			'localPosition': new Position(4, 1),
			'size': 0.02,
			'buttonScript':  ' () => {'+
				'new Node(this.world, this, \'collide moveable hardball velocitynode\', {'+
				'\'name\': \'ball\'+cheatCounter++,'+
				'\'mass\': 1,'+
				'\'elasticModulus\': 1000,'+
				'\'size\': 0.02,'+
				'\'localPosition\': new Position(2, 3),'+
				'\'velocityLoss\': 1,'+
				'\'collisionLabel\': \'bounce\','+
				'\'velocity\': new Velocity(1, 1.5*Math.random()-0.5),'+
			'});}'
		});

		/*
		new Node(this.world, this, 'button', {
			'name': 'generate',
			'localPosition': new Position(4, 3),
			'buttonScript':  ' () => {'+
				'generate();'+
			'}'
		});

		/*
		let a = new Node(this.world, this, 'moveable anglenode', {
			'name': 'a',
			'localPosition': new Position(8, 12),
		});
		let b = new Node(this.world, this, 'moveable anglenode', {
			'name': 'b',
			'localPosition': new Position(10, 12),
		});
		let c = new Node(this.world, this, 'moveable anglenode', {
			'name': 'c',
			'localPosition': new Position(12, 12),
		});

		new Tensor(a, b,
			'spring angletensor',
			{
				'constant': 100,
				'equilibriumLength': 7,
				'angle2': 3,
				'torqueConstant2': 100,
			});

		new Tensor(b, c,
			'spring angletensor',
			{
				'constant': 100,
				'equilibriumLength': 7,
				'angle1': 0,
				'torqueConstant1': 100,
			});

*/

	}
}

function generate() {
	let div = document.createElement('div');
	div.style.position='absolute';
	div.style.top='0px';
	div.style.left='0px';
	div.style.position='absolute';
	div.style.width = '600px';
	div.style.height = '600px';
	div.style.background = 'rgba(0.5, 0.5, 0.5, 0.5)';
	div.style.color = 'white';
	document.getElementById('mainArea').appendChild(div);
	new Planet(div);
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
	constructor(truss, startPosition, mass = 70, name = 'ProtagonistNode', velocityLoss = 1) {
		super(truss, startPosition, mass, name, velocityLoss);
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
	 */
	show(truss) {
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
