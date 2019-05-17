/*jshint esversion:6 */
/* globals SimpleNode */


/**
 * Inspired by https://www.redblobgames.com/x/1722-b-rep-triangle-meshes/
 * @class
 */
class Grid {
	/**
	 */
	constructor(seedLabel) {
		this.seedLabel=seedLabel;
		this.vertexLabel = universe.currentWorld.labels.findLabel('vertex');
		this.cellEdgeLabel = universe.currentWorld.labels.findLabel('celledge');
		new Fortune(this);
	}

}


/**
 * Fortune's algorithm implementation
 * @class
 */
class Fortune {
	/**
	 */
	constructor(grid) {
		this.grid=grid;
		this.sweepLine= new SweepLine(grid.seedLabel);
        
	}

}

/**
 * 
 * @class
 */
class SweepLine {
	/**
	 */
	constructor(seedLabel) {
		this.current=0;
		this.queue = seedLabel.getNodes().sort((a,b)=>{
			console.log(a.localPosition.y);
			return a.localPosition.y-b.localPosition.y;
		});
	}
    
	addCircleEvent(position) {
		for (let i = this.current; i < this.queue.length; i++) {
			if (position.y < this.queue[i].localPosition.y) {
				this.queue.splice(i, 0, position);
				break;
			}
		}
	}

	getEvent() {
		if (this.current>=this.queue.length) {
			throw 'Event log empty!';
		}
		return this.queue[this.current++];
	}
}


/**
 * 
 * @class
 */
class BeachLine {
	/**
	 */
	constructor(seedLabel) {
		this.current=0;
		this.queue = seedLabel.getNodes().sort((a,b)=>{
			console.log(a.localPosition.y);
			return a.localPosition.y-b.localPosition.y;
		});
	}
    
	addCircleEvent(position) {
		for (let i = this.current; i < this.queue.length; i++) {
			if (position.y < this.queue[i].localPosition.y) {
				this.queue.splice(i, 0, position);
				break;
			}
		}
	}

	getEvent() {
		if (this.current>=this.queue.length) {
			throw 'Event log empty!';
		}
		return this.queue[this.current++];
	}
}





function FortuneNode(key, value, level, left, right) {
	this.key = key;
	this.value = value;

	this.level = level;
	this.left = left;
	this.right = right;
}

var bottom = new FortuneNode(null, null, 0);
bottom.left = bottom;
bottom.right = bottom;

function newFortuneNode(key, value) {
	return new FortuneNode(key, value, 1, bottom, bottom);
}

class BBTree {
	construct(compareFn) {
		this._compare = compareFn || ((a,b) => {return a-b;});
		this._path = [];
	}


	find(key) {
		var node = this.root,
			compare = this._compare;

		while (node !== bottom) {
			var c = compare(key, node.key);
			if (c === 0) return node;
			node = c < 0 ? node.left : node.right;
		}
		return null;
	}

	insert(key, value) {

		var compare = this._compare,
			node = this.root,
			path = this._path;

		if (!node) {
			this.root = newFortuneNode(key, value);
			return this;
		}

		var k = 0;

		while (true) {
			var c = compare(key, node.key);
			if (!c) return this;

			path[k] = node;
			k++;

			if (c < 0) {
				if (node.left === bottom) { node.left = newFortuneNode(key, value); break; }
				node = node.left;

			} else {
				if (node.right === bottom) { node.right = newFortuneNode(key, value); break; }
				node = node.right;
			}
		}

		this._rebalance(path, k);

		return this;
	}

	_rebalance(path, k) {

		var rotated, node, parent, updated, m = 0;

		for (var i = k - 1; i >= 0; i--) {
			rotated = node = path[i];

			if (node.level === node.left.level && node.level === node.right.level) {
				updated = true;
				node.level++;

			} else {
				rotated = this.skew(node);
				rotated = this.split(rotated);
			}

			if (rotated !== node) {
				updated = true;
				if (i) {
					parent = path[i - 1];
					if (parent.left === node) parent.left = rotated;
					else parent.right = rotated;

				} else this.root = rotated;
			}
			if (!updated) m++;
			if (m === 2) break;
		}
	}
    
	skew(node) {
		if (node.left.level === node.level) {
			var temp = node;
			node = node.left;
			temp.left = node.right;
			node.right = temp;
		}
		return node;
	}

	split(node) {
		if (node.right.right.level === node.level) {
			var temp = node;
			node = node.right;
			temp.right = node.left;
			node.left = temp;
			node.level++;
		}
		return node;
	}


}


