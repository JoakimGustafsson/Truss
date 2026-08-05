import { Labels } from './Label.js';
import { downMouse, upMouse } from './ui-actions.js';
import { objectFactory } from './objectFactory.js';

/**
 * @class
 */
class Stack {
	/**
	 */
	constructor() {
		this.items = [];
		this.count = 0;
	}

	/**
	 * @return {number}
	 */
	getLength() {
		return this.count;
	}

	/**
	 * @param  {World} item
	 * @return {World}
	 */
	push(item) {
		this.items.push(item);
		this.count = this.count + 1;
		return item;
	}

	/**
	 * @return {TrussNode}
	 */
	pop() {
		if (this.count > 0) {
			this.count = this.count - 1;
		}

		return this.items.pop();
	}

	/**
	 * @return {TrussNode}
	 */
	peek() {
		return this.items.slice(-1)[0];
	}
}

/**
 * @class
 */
class World {
	/**
	 * This class is used to represent a truss(node) world and the supporting governor truss(node)s
	 * @param {TrussNode} trussNode
	 * @param {List} governors
	 */
	constructor(trussNode, governors =[]) {
		this.trussNode = trussNode;
		this.governors = governors;
		this.labels = new Labels();
	}

	/**
	 * @param {number} timestamp
	 */
	tick(timestamp) {
		this.trussNode.tick(timestamp);
		if (this.governors) {
			for (let governor of this.governors) {
				governor.tick(timestamp);
			}
		}
	}

	/**
	 * Clean up everything and make sure no event-listeners or similar are left dnagling
	 */
	close() {
		this.trussNode.close();
		if (this.governors) {
			for (let governor of this.governors) {
				governor.close();
			}
		}
	}

	/**
	 * @param {Function} f
	 */
	mapAll(f) {
		f(this.trussNode);
		if (this.governors) {
			for (let governor of this.governors) {
				f(governor);
			}
		}
	}

	/**
	 * @return {Object} serialized Json object
	 */
	serialize() {
		let representationObject = {
			'classname': 'World',
		};

		let {nodes, tensors} = this.listAllNodesAndTensors();
		// nodes = [this.trussNode, ...this.governors, ...nodes];

		this.serializeAllNodes(nodes, tensors, representationObject);

		this.serializeAllTensors(tensors, nodes, representationObject);

		representationObject.trussNode = nodes.indexOf(this.trussNode);

		representationObject.governors = [];
		if (this.governors) {
			for (let governor of this.governors) {
				representationObject.governors.push(nodes.indexOf(governor));
			}
		}

		return representationObject;
	}

	/**
	 * @param  {List} tensors
	 * @param  {List} nodes
	 * @param  {Object} representationObject
	 */
	serializeAllTensors(tensors, nodes, representationObject) {
		let tensorList = [];
		for (let tensor of tensors) {
			tensorList.push(tensor.serialize(nodes, tensors));
		}
		representationObject.tensors = tensorList;
	}

	/**
	 * @param  {List} nodes
	 * @param  {List} tensors
	 * @param  {Object} representationObject
	 */
	serializeAllNodes(nodes, tensors, representationObject) {
		let nodeList = [];
		for (let node of nodes) {
			let nodeSerilization = node.serialize(nodes, tensors);
			if (nodeSerilization) {
				nodeList.push(nodeSerilization);
			}
		}
		representationObject.nodes = nodeList;
	}

	/**
	 * @return {Object}
	 */
	listAllNodesAndTensors() {
		let nodes = this.labels.findLabel('node').getNodes();
		let tensors = this.labels.findLabel('tensor').getTensors();
		return {nodes, tensors};
	}


	/**
	 * @param  {Object} restoreObject
	 * @return {Object}
	 */
	deserialize(restoreObject) {
		this.labels = new Labels();
		let nodeList=[];
		let nodeRestoreList = Array.isArray(restoreObject.nodes) ? restoreObject.nodes : [];
		let tensorRestoreList = Array.isArray(restoreObject.tensors) ? restoreObject.tensors : [];
		
		console.log(`📦 Deserializing ${nodeRestoreList.length} nodes...`);
		for (let nodeRestoreObject of nodeRestoreList) {
			let node = objectFactory(this, nodeRestoreObject);
			nodeList.push(node);
			// Pre-link parent truss references early so property/materialization code
			// that runs during deserialize can access parent canvas state.
			if (nodeRestoreObject &&
				nodeRestoreObject.parentTrussNode !== undefined &&
				nodeRestoreObject.parentTrussNode !== null &&
				nodeRestoreObject.parentTrussNode >= 0 &&
				nodeRestoreObject.parentTrussNode < nodeList.length) {
				node.parentTrussNode = nodeList[nodeRestoreObject.parentTrussNode];
			}
		}

		console.log(`📦 Deserializing ${tensorRestoreList.length} tensors...`);
		let tensorList=[];
		for (let tensorRestoreObject of tensorRestoreList) {
			let tensor = objectFactory(this, tensorRestoreObject);
			tensorList.push(tensor);
		}


		// deserialize them
		console.log(`🔗 Linking nodes to their data...`);
		let index=0;
		for (let node of nodeList) {
			node.deserialize(nodeRestoreList[index], nodeList, tensorList);
			index++;
		}

		console.log(`🔗 Linking tensors to their connected nodes...`);
		index=0;
		for (let tensor of tensorList) {
			tensor.deserialize(tensorRestoreList[index], nodeList, tensorList);
			index++;
		}

		this.trussNode = nodeList[restoreObject.trussNode];
		if (!this.trussNode && nodeList.length > 0) {
			this.trussNode = nodeList[0];
		}

		this.governors=[];
		if (restoreObject.governors) {
			for (let governor of restoreObject.governors) {
				this.governors.push(nodeList[governor]);
			}
		}

		if (this.trussNode) {
			let selectorLabel = this.labels.findLabel('selector');
			let selectors = selectorLabel ? selectorLabel.getNodes() : [];
			if (selectors.length == 1) {
				this.trussNode.selector = selectors[0];
			} else {
				this.trussNode.selector = this.trussNode;
			}
		}
		
		console.log(`✓ Deserialization successful: ${nodeList.length} nodes, ${tensorList.length} tensors`);
		
		// Mark that we just loaded a save so we can monitor first tick
		this._justDeserialized = true;

		return this;
	}
}


/**
 * @class
 */
class Universe {
	/**
	 * This class is used to represent a stack of Trusses representing the sequence of trusses
	 * used to get to the currentTruss.
	 * There is also a collection of governor trusses that will be active all the time.
	 * @param {Element} background
	 */
	constructor(background) {
		this.name = 'MyUniverse';
		this.universeStack = new Stack();
		this.currentWorld = undefined;	// This is the current world, including trussNode and Governors
		this.currentNode = undefined; // This is the currently displayed trussNode (either the worlds trussNode or a governor Node)
		this.background = background;
		this.selectedObject = undefined;
		this.hoveredNode = undefined; // Node currently under mouse cursor
		this.followedNode = undefined; // Node being followed (persists independent of selection)
		this.cameraFollowMode = false; // Legacy compatibility - now followedNode is what matters
		this.setupTicks = 0; // Initiated in SetCurrent
	}

	/**
	 * @param {Object} newSelectedObject
	 */
	select(newSelectedObject) {
		let previousSelectedObject = this.selectedObject;
		this.selectedObject = newSelectedObject;
		let event = new CustomEvent('selectionEvent', {
			detail: {
				'selectedObject': this.selectedObject,
				'previousSelectedObject': previousSelectedObject,
				'truss': undefined,
			},
			bubbles: true,
			cancelable: true,
		});
		if (!this.currentNode.element) {
			console.error('No element in currentNode for selection purposes.');
			return;
		}
		this.currentNode.element.dispatchEvent(event);
	}

	/**
	 * @return {World}
	 */
	pop() {
		return this.universeStack.pop();
	}

	/**
	 * @param {World} world
	 * @return {World}
	 */
	push(world) {
		return this.universeStack.push(world);
	}

	/**
	 * @param {number} timestamp
	 */
	tick(timestamp) {
		if (!this.universeStack || this.universeStack.getLength() == 0 || !this.currentWorld) {
			console.log('Error in Universe. No current truss.');
		}
		// If newly changed current, ticka all a few times to get pictures right in the small windows
		if (this.setupTicks > 0) {
			this.tickAll(timestamp);
			this.setupTicks--;
		}
		this.currentWorld.tick(timestamp);
	}

	/**
	 * @param {number} timestamp
	 */
	tickAll(timestamp) {
		for (let stackTruss of this.universeStack.items) {
			if (this.currentWorld != stackTruss) {
				stackTruss.tick(timestamp);
			}
		}
	}

	/**
	 */
	show() {
		this.background.innerHTML = '';
		let topPosition = 10;
		let _this = this;

		let clickSetWorld = function(refNode) {
			return function() {
				_this.setCurrentWorld(refNode);
			};
		};
		let clickSetView = function(refWorld) {
			return function() {
				_this.setCurrentView(refWorld);
			};
		};
		for (let governor of this.currentWorld.governors) {
			let govDiv = governor.element;
			govDiv.removeAttribute('style');
			govDiv.classList.add('govenorTruss');
			govDiv.classList.add('govenorTrussFrame');
			if (!govDiv.initiated) {
				govDiv.id = governor.name + 'Div';
				govDiv.refNode = governor;
			}
			this.background.appendChild(govDiv);
			govDiv.initiated = 'true';
			govDiv.style.top = topPosition + 'px';
			topPosition = topPosition + 110;
			governor.resize();
			if (!govDiv.selectTrussListener) {
				govDiv.selectTrussListener = clickSetView(governor);
				govDiv.addEventListener('click', govDiv.selectTrussListener);
			}
		}

		topPosition = 10;
		for (let world of this.universeStack.items) {
			let stackTruss = world.trussNode;
			let stackDiv = stackTruss.element;
			stackDiv.removeAttribute('style');
			stackDiv.classList.add('stackTruss');
			stackDiv.classList.add('stackTrussFrame');
			if (!stackDiv.initiated) {
				stackDiv.id = stackTruss.name + 'Div';
				stackDiv.refNode = stackTruss;
			}
			this.background.appendChild(stackDiv);
			stackDiv.initiated = 'true';
			stackDiv.style.top = topPosition + 'px';
			topPosition = topPosition + 110;
			if (!stackDiv.selectTrussListener) {
				stackDiv.selectTrussListener = clickSetWorld(world);
				stackDiv.addEventListener('click', stackDiv.selectTrussListener);
				topPosition++;
			}
		}

		let mainDiv = this.currentNode.element;
		mainDiv.classList.remove('govenorTruss');
		mainDiv.classList.remove('stackTruss');
		mainDiv.removeEventListener('click', mainDiv.selectTrussListener);
		mainDiv.selectTrussListener = undefined;
		mainDiv.classList.add('mainTruss');
		mainDiv.style.top = '10px';
		mainDiv.id = 'TrussBackground';
	}

	/**
	 * @param  {World} newWorld
	 */
	setCurrentWorld(newWorld) {
		if (this.currentNode) {
			this.currentNode.element.classList.remove('mainTruss');
			this.currentNode.canvas.onmousedown = undefined;
			this.currentNode.canvas.onmouseup = undefined;
		}

		this.currentWorld = newWorld;
		this.setCurrentView(newWorld.trussNode);
	}
	/**
	 * @param  {Node} newNodeToShow
	 */
	setCurrentView(newNodeToShow) {
		this.currentNode=newNodeToShow;
		this.selectedObject = undefined;
		this.show();
		this.currentNode.canvas.onmousedown = downMouse;
		this.currentNode.canvas.onmouseup = upMouse;
		// Recompute from the active DOM size without changing worldViewSize.
		newNodeToShow.resize(true);
		this.setupTicks = 3;
	}
}

export { Stack, World, Universe };
