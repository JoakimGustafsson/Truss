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
	 * @param  {TrussNode} item
	 */
	push(item) {
		this.items.push(item);
		this.count = this.count + 1;
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
class Universe {
	/**
	 * This class is used to represent a stack of Trusses representing the sequence of trusses
	 * used to get to the currentTruss.
	 * There is also a collection of governor trusses that will be active all the time.
	 * @param {Element} background
	 */
	constructor(background) {
		this.name='MyUniverse';
		this.universeStack = new Stack();
		this.governors = [];
		this.current = {};
		this.background=background;
		this.selectedObject = undefined;
		this.setupTicks=0; // Initiated in SetCurrent
	}

	/**
	 * @return {TrussNode}
	 */
	pop() {
		return this.universeStack.pop();
	}

	/**
	 * @param {TrussNode} trussNode
	 * @return {TrussNode}
	 */
	push(trussNode) {
		this.current=trussNode;
		return this.universeStack.push(trussNode);
	}

	/**
	* @param {number} timestamp
	 */
	tick(timestamp) {
		if (!this.universeStack || this.universeStack.getLength()==0 || !this.current) {
			console.log('Error in Universe. No current truss.');
		}
		// If newly changed current, ticka all a few times to get pictures right in the small windows
		if (this.setupTicks>0) {
			universe.tickAll(timestamp);
			this.setupTicks--;
		}
		this.current.tick(timestamp);
		for (let governor of this.governors) {
			governor.tick(timestamp);
		}
	}

	/**
	* @param {number} timestamp
	 */
	tickAll(timestamp) {
		for (let stackTruss of this.universeStack.items) {
			if (this.current!=stackTruss) {
				stackTruss.tick(timestamp);
			}
		}
	}

	/**
	 */
	showUniverse() {
		this.background.innerHTML='';
		let topPosition=10;
		let _this=this;

		let clickFunction = function(refNode) {
			return function() {
				_this.setCurrent(refNode);
			};
		};
		for (let governor of this.governors) {
			let govDiv = governor.element;
			govDiv.classList.add('govenorTruss');
			govDiv.classList.add('govenorTrussFrame');
			if (!govDiv.initiated) {
				govDiv.id=governor.name+'Div';
				govDiv.refNode=governor;
			}
			this.background.appendChild(govDiv);
			govDiv.initiated='true';
			govDiv.style.top=topPosition+'px';
			topPosition=topPosition+110;
			governor.resize();
			if (!govDiv.selectTrussListener) {
				govDiv.selectTrussListener= clickFunction(governor);
				govDiv.addEventListener('click', govDiv.selectTrussListener);
			}
		}

		topPosition=10;
		for (let stackTruss of this.universeStack.items) {
			let stackDiv = stackTruss.element;
			stackDiv.classList.add('stackTruss');
			stackDiv.classList.add('stackTrussFrame');
			if (!stackDiv.initiated) {
				stackDiv.id=stackTruss.name+'Div';
				stackDiv.refNode=stackTruss;
			}
			this.background.appendChild(stackDiv);
			stackDiv.initiated='true';
			stackDiv.style.top=topPosition+'px';
			topPosition=topPosition+110;
			stackTruss.resize();
			if (!stackDiv.selectTrussListener) {
				stackDiv.selectTrussListener= clickFunction(stackTruss);
				stackDiv.addEventListener('click', stackDiv.selectTrussListener);
				topPosition++;
			}
		}

		let mainDiv = this.current.element;
		mainDiv.classList.remove('govenorTruss');
		mainDiv.classList.remove('stackTruss');
		mainDiv.removeEventListener('click', mainDiv.selectTrussListener);
		mainDiv.selectTrussListener = undefined;
		mainDiv.classList.add('mainTruss');
		mainDiv.style.top='10px';
		mainDiv.id='TrussBackground';
	}

	/**
	 * @param  {Node} newCurrent
	 */
	setCurrent(newCurrent) {
		if (this.current) {
			this.current.element.classList.remove('mainTruss');
			this.current.canvas.onmousedown = undefined;
			this.current.canvas.onmouseup = undefined;
		}
		this.current=newCurrent;
		this.showUniverse();
		this.current.canvas.onmousedown = downMouse;
		this.current.canvas.onmouseup = upMouse;
		newCurrent.resize();
		this.setupTicks=3;
	}
}

