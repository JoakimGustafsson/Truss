/**
 * 
 */


var keyState = {};

function KeySensorNode(startPosition, mass = 0.001, name = "keysensornode", positionFunction, showFunction, velocityLoss = 1) {
	Node.call(this, startPosition, mass, name, positionFunction, showFunction, velocityLoss);
	this.startPosition = startPosition;
	this.keyList = [];

	window.addEventListener('keydown', function (e) {
		keyState[e.keyCode || e.which] = true;
	}, true);
	window.addEventListener('keyup', function (e) {
		keyState[e.keyCode || e.which] = false;
	}, true);

	KeySensorNode.prototype.updatePosition = function (time) {
		var p = this.startPosition;
		for (var i = 0; i < this.keyList.length; i++) {
			if (keyState[this.keyList[i].key])
				p = addVectors(p, this.keyList[i].vector);
		}
		this.setPosition(p);
	}

	KeySensorNode.prototype.registerKey = function (keyNr, v) {
		this.keyList.push({
			"key": keyNr,
			"vector": v
		});
	}
}
inheritPrototype(KeySensorNode, Node);






function CollisionSensorNode(position, mass = 0.01, name = "collisionsensornode", positionFunction, showFunction, velocityLoss) {
	Node.call(this, position, mass, name, positionFunction, showFunction, velocityLoss);

	this.actuator;
	var _this = this;


	CollisionSensorNode.prototype.registerTrussObjectAndActuator = function (truss, obj, actuator) {
		truss.addCollider(obj);
		this.localactuator = actuator;
		this.localtruss = truss;
		this.localobject = obj;
	}

	CollisionSensorNode.prototype.collisionFunction = function (e) {
		var collider = e.detail.collider;
		if (collider != _this.localobject)
			return;
		var where = e.detail.where;
		var from = e.detail.from;
		var tensor = e.detail.tensor;

		var direction = "left";
		if (from > 0)
			direction = "right";
		console.log(collider.name +
			" collided with tensor " + tensor.getName() + " at " + where + " along its length. It collided from the " +
			direction
		);

		_this.localactuator.attachToTensor(_this.localtruss, tensor, where, from);
	}

	document.addEventListener("collisionEvent", this.collisionFunction, false);
}
inheritPrototype(CollisionSensorNode, Node);