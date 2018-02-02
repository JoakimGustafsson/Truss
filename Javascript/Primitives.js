

/** Standard inheritance help function. Hopefully not needed anymore
 * @param  {object} childObject
 * @param  {object} parentObject
 */
function inheritPrototype(childObject, parentObject) {
	let copyOfParent = Object.create(parentObject.prototype);
	copyOfParent.constructor = childObject;
	childObject.prototype = copyOfParent;
}

/**
 * Support function that removes an element from an array the way I expect it to
 * @param  {object} element
 * @param  {Array} list
 */
function removeIfPresent(element, list) {
	let index = list.indexOf(element);
	if (index >= 0) {
		list.splice(index, 1);
	}
}
/**
 * The base vector class used to represent a point on a two dimensional plane
 * @class
 */
class Vector {
	/**
	 * Create a vector consisting of an x and a y position
  * @param  {number} x=0
  * @param  {number} y=0
  */
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	/**
	 * Returns the vector pointing in exactly the opposite direction
	 * @return {Vector} The vector pointing in exactly the oposite direction
	 */
	opposite() {
		return new Vector(-this.x, -this.y);
	};

	/**
	 * Returns the vector pointing in exactly the opposite direction
	 * @return {Vector} The vector pointing in exactly the oposite direction
	 */
	serialize() {
		return {'x': this.x,
			'y': this.y};
	};

	/**
	 * @param  {Object} restoreObject
	 * @return {Vector}
	 */
	deserialize(restoreObject) {
		this.x += restoreObject.x;
		this.y += restoreObject.y;
		return this;
	};

	/**
	 * Add a vector v to this vector
	 * @param  {Vector} v
	 * @return {Vector}
	 */
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	};

	/**
	 * Modify the length of this vector by dividing it by c
	 * @param  {number} c
	 * @return {Vector}
	 */
	divide(c) {
		this.x /= c;
		this.y /= c;
		return this;
	};
}
/**
 * @class
 * @extends Vector
 */
class Position extends Vector {
	/** Create a two dimensional position
	 * @param  {number} x The horizontal position
	 * @param  {number} y The vertical position
	 */
	constructor(x, y) {
		super(x, y);
	}


	/**
	* Add a vector v to this vector
	* @param  {Vector} v
	* @return {Position}
	*/
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	};
}

/**
 * @class
 * @extends Vector
 */
class Force extends Vector {
	/**
	 * @param  {number} x The horizontal position
	 * @param  {number} y The vertical position
	 */
	constructor(x, y) {
		super(x, y);
	}
}

/**
 * @class
 * @extends Vector
 */
class Velocity extends Vector {
	/**
	 * @param  {number} x The horizontal position
	 * @param  {number} y The vertical position
	 */
	constructor(x, y) {
		super(x, y);
	}

	/**
	 * Add a vector v to this vector
	 * @param  {Vector} v
	 * @return {Velocity}
	 */
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	};
}

/**
 * @param  {Vector} v1
 * @param  {Vector} v2
 * @return {number}
 */
function addVectors(v1, v2) {
	return new Vector(v1.x + v2.x, v1.y + v2.y);
}
/**
 * @param  {Vector} v1
 * @param  {Vector} v2
 * @return {number}
 */
function subtractVectors(v1, v2) {
	return new Vector(v1.x - v2.x, v1.y - v2.y);
}
/**
 * @param  {number} m
 * @param  {Vector} v1
 * @return {Vector}
 */
function multiplyVector(m, v1) {
	return new Vector(m * v1.x, m * v1.y);
}
/**
 * @param  {Vector} v1
 * @param  {number} m
 * @return {Vector}
 */
function divideVector(v1, m) {
	return new Vector(v1.x / m, v1.y / m);
}
/**
 * @param  {Vector} v1
 * @param  {Vector} v2
 * @return {number}
 */
function dotProduct(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y;
}
/**
 * @param  {Vector} v
 * @return {Vector}
 */
function perpendicular(v) {
	return new Vector(v.y, -v.x);
}

/** returns the angle given a x and y. The angle range is +PI to -PI

	 * @param  {number} x difference in x
	 * @param  {number} y difference in y
	 * @return {number} angle
	 */
function getAngle(x, y) {
	if (x==0) {
		if (y > 0) {
			return Math.PI/2;
		} else {
			return -Math.PI/2;
		}
	}

	let ratio = y/x;
	let returnAngle = Math.atan(ratio);
	if (x<0) {
		returnAngle = Math.PI + returnAngle;
	}
	return returnAngle;
}

/** Ensure that an Rad angle is inside the -PI to  PI span
 * @param  {number} angle
 * @return {number}
 */
function anglify(angle) {
	while (angle>Math.PI) {
		angle-=2*Math.PI;
	}
	while (angle< -Math.PI) {
		angle+=2*Math.PI;
	}
	return angle;
}

/**
 * @param  {number} a
 * @param  {number} b
 * @return {number}
 */
function angleSubstract(a, b) {
	return anglify(a-b);
}

/**
 * @param  {number} a
 * @param  {number} b
 * @return {number}
 */
function angleAdd(a, b) {
	return anglify(a+b);
}

/**
 * @param  {Vector} v
 * @return {number}
 */
function length2(v) {
	return v.x * v.x + v.y * v.y;
}
/**
 * @param  {Vector} v
 * @return {number}
 */
function length(v) {
	return Math.sqrt(length2(v));
}

/** returns the distance between two positions
 * @param  {Node} p1
 * @param  {Node} p2
 * @return {number}
 */
function positionDistance(p1, p2) {
	return Math.sqrt(Math.pow(p2.x-p1.x, 2)+ Math.pow(p2.y-p1.y, 2));
}

/** returns the distance between two nodes
 * @param  {Node} n1
 * @param  {Node} n2
 * @return {number}
 */
function nodeDistance(n1, n2) {
	let p1 = n1.getPosition();
	let p2 = n2.getPosition();
	return positionDistance(p1, p2);
}

/** given a vector v, scale it so that the length becomes l
 * @param  {number} l The length of the resulting vector
 * @param  {Vector} v The original vector
 * @return {Vector}
 */
function normalizeVector(l, v) {
	let length = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
	return multiplyVector(l / length, v);
}


/**
 * Find multiplier s in L = p3 + perp(p2-p1)s = c where c crosses p1p2
 * The sign of s will tell if p3 is on the right sight of the p1p2 line. S<0 means right side
 * @param  {Position} p1
 * @param  {Position} p2
 * @param  {Position} p3
 * @return {number} This number tells the minimum distance between the P1 P2 line and p3. The sign tells if on right or left side
 */
function getS(p1, p2, p3) {
	let a = subtractVectors(p2, p1);
	let b = subtractVectors(p3, p1);
	let s = dotProduct(a, perpendicular(b)) / length2(a);
	return s;
}

/**
 * Find multiplier t in L = p1 + perp(p2-p1)t = c where c is the closest point to p3 on p1p2
 * if 0<=t<=1 it lies between p1 and p2.
 * t can also be used to determina at what fraction of p1p2 it should "break"
 * @param  {Position} p1 The line first crosses p1
 * @param  {Position} p2 The line second crosses p2
 * @param  {Position} p3 The Position we want to check
 * @return {number} This represent where on the p1p2 line P3 is closest
 */
function getT(p1, p2, p3) {
	let a = subtractVectors(p2, p1);
	let b = subtractVectors(p3, p1);
	let t = dotProduct(a, b) / length2(a);
	return t;
}

// This returns true if the closest point from p3 on the line crossing p1 and p2 lies between p1 and p2
/**
 * @param  {Position} p1 The line first crosses p1
 * @param  {Position} p2 The line second crosses p2
 * @param  {Position} p3 The Position we want to check
 * @return {number} This represent where on the p1p2 line P3 is closest
 */
function getTInside(p1, p2, p3) {
	t = getT(p1, p2, p3);
	return ((0 <= t) && (t <= 1));
}

// This returns true if the closest point from p3 on the line crossing p1 and p2 lies between p1 and p2
/**
 * @param  {Position} p1 The line first crosses p1
 * @param  {Position} p2 The line second crosses p2
 * @param  {Position} p3 The Position we want to check
 * @return {number} This represent where on the p1p2 line P3 is closest
 */
function getTInside2(p1, p2, p3) {
	t = getT(p1, p2, p3);
	return ((0.05 <= t) && (t <= 0.95));
}


/**
 * Check if p1 and p2 are within horizontal or vertical distance from each other
 * Used as a sloppy fast distance check without squareroot operations
 * @param  {Position} p1
 * @param  {Position} p2
 * @param  {number} distance
 * @return {number}
 */
function boxClose(p1, p2, distance) {
	return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y)) < distance;
}

/**
 * @param  {Array} currentList
 * @param  {Array} allObjects
 * @return {Array}
 */
function serializeList(currentList, allObjects) {
	let returnList=[];
	for (let t of currentList) {
		returnList.push(allObjects.indexOf(t));
	}
	return returnList;
}

/**
 * @param  {Array} numberList
 * @param  {Array} allObjects
 * @return {Array}
 */
function deserializeList(numberList, allObjects) {
	let returnList=[];
	for (let t of numberList) {
		returnList.push(allObjects[t]);
	}
	return returnList;
}

/**
 * @param  {Object} representationObject
 * @param  {Object} nodeList
 * @param  {Object} tensorList
 * @return {Object}
 */
function objectFactory(representationObject, nodeList, tensorList) {
	return (Function('return new ' + representationObject.classname))();
	// newNode.deserialize(representationObject, nodeList, tensorList);
}
