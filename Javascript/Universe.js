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
	 *
	 */
	constructor() {
		this.universeStack = new Stack();
		this.governors = [];

		Object.defineProperty(this, 'current', {
			get: function() {
				return this.universeStack.peek();
			},
			set: function(value) {
				this.universeStack.push(value);
			},
		});
	}

	/**
	 * @return {TrussNode}
	 */
	pop() {
		return this.universeStack.pop();
	}

	/**
	* @param {number} timestamp
	 */
	tick(timestamp) {
		if (!this.universeStack || this.universeStack.getLength()>0 || !this.current) {
			console.log('Error in Universe. No current truss.');
		}
		this.current.tick();
		for (let governor of this.governors) {
			governor.tick(timestamp);
		}
	}

	/**
	 * @param {Element} background
	 */
	showUniverse1(background) {
		// mainDiv.align='left';
		let topPosition=10;
		for (let governor of this.governors) {
			let govDiv = governor.element;
			govDiv.classList.add('govenorTruss');
			govDiv.id=governor.name+'Div';
			govDiv.style.top=topPosition+'px';
			topPosition=topPosition+110;
			background.appendChild(govDiv);
		}

		topPosition=10;
		for (let stackTruss of this.universeStack.items) {
			let stackDiv = stackTruss.element;
			stackDiv.classList.add('stackTruss');
			stackDiv.id=stackTruss.name+'Div';
			stackDiv.style.top=topPosition+'px';
			topPosition=topPosition+110;
			background.appendChild(stackDiv);
		}

		let mainDiv = this.current.element;
		mainDiv.classList.remove('stackTruss');
		mainDiv.classList.add('mainTruss');
		mainDiv.style.top='10px';
		mainDiv.id='TrussBackground';
	}
}

