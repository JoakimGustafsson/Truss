/* global Tensor Spring */

/**
 * @class
 */
class GeneralControl {
	/**
	 * This class handles all functionality directly triggered in the View and ties it to the model

	 */
	constructor() {

		window.addEventListener('keydown', function (e) {
			if (!universe.currentWorld.fastEdit) {
				return;
			}
			console.log(e.keyCode);
			if (e.keyCode == 78) {
				this.makeNode();
			} else if (e.keyCode == 84) {
				this.makeTensor();
			}
		}, true);


		this.myX = 3;
		this.myY = 3;
		this.mouseSet = false;

		this.connectionNode;
		this.connectionNodeEventListener;

		this.connectionTensor;
		this.connectionEventListener;

		document.getElementById('mainArea').onmousemove =  (e) => {this.myMove(e);};


		document.addEventListener('selectionEvent', (e) => {this.highlightAndModifyPropertyButtons(e);}			, false);


	}

	/**
	 * @param  {Event} e
	 */
	myMove(e) {
		this.myX = e.pageX;
		this.myY = e.pageY;
	}

	/**
	 * @param  {Event} e
	 */
	// eslint-disable-next-line no-unused-vars
	downMouse(e) {
		this.mouseSet = true;
	}

	/**
	 * @param  {Event} e
	 */
	// eslint-disable-next-line no-unused-vars
	upMouse(e) {
		this.mouseSet = false;
	}



	/** Open the right tab in the parameter editing window
	 * @param  {Event} evt
	 * @param  {Element} divName
	 */
	openBottomPanel(evt, divName) {
		// Declare all variables
		var i, tabcontent, tablinks;

		// Get all elements with class='tabcontent' and hide them
		tabcontent = universe.currentNode.getElements('.tabcontent');
		// document.getElementsByClassName('tabcontent');
		for (i = 0; i < tabcontent.length; i++) {
			tabcontent[i].style.display = 'none';
		}

		// Get all elements with class='tablinks' and remove the class 'active'
		tablinks = universe.currentNode.getElements('.tabsectionbuttons');
		//document.getElementsByClassName('tabsectionbuttons');
		for (i = 0; i < tablinks.length; i++) {
			tablinks[i].classList.remove('active');
		}

		// Show the current tab, and add an 'active' class to the button that opened the tab
		universe.currentNode.getElement('#' + divName).style.display = 'block';

		if (evt)
			evt.currentTarget.classList.add('active');
		else
			universe.currentNode.getElement('#' + 'propertiesButton').classList.add('active');
	}

	/** Handles highlighting if the selected tensor or node
	 * @param  {Event} selectionEvent
	 */
	highlightAndModifyPropertyButtons(selectionEvent) {
		let select = selectionEvent.detail.selectedObject;
		let connectionDiv = universe.currentNode.getElement('#connectionDiv');

		if (!select) {
			connectionDiv.innerHTML = '';
			return;
		}
		let previousSelectedObject = selectionEvent.detail.previousSelectedObject;
		select.setHighlight(2);
		if (previousSelectedObject) {
			previousSelectedObject.setHighlight(0);
		}

		connectionDiv.innerHTML = '';
		connectionDiv.appendChild(select.generateconnectionHTML());

		let gravityButton = universe.currentNode.getElement('#gravityButton');
		let tensorAdder = universe.currentNode.getElement('#tensorAdder');

		if (select.isNode) {
			gravityButton.style.display = 'inline';
			tensorAdder.style.display = 'inline';
		} else {
			gravityButton.style.display = 'none';
			tensorAdder.style.display = 'none';
		}
	}

	makeNode() {
		let selector = document.getElementById('nodeType');
		let value;
		if (!selector) {
			value = 'Node';
		} else {
			value = selector.value;
		}
		if (value == 'Node') {
			let newNode = new Node(universe.currentWorld, universe.currentNode, 'node added', {
				'localPosition': new Position(1, 1),
			});
			universe.select(newNode);
			//universe.newNode = newNode;
		}
	}


	makeTensor() {
		let selectorDropDown = universe.currentNode.getElement('#tensorType');
		let value = selectorDropDown.value;
		if (this.connectionTensor) {
			// Some tensor is already currently being drawn
			universe.currentNode.removeTensor(this.connectionTensor);
		}
		this.connectionTensor = undefined;

		if (value == 'Spring') {
			this.connectionTensor = new Spring(universe.selectedObject, universe.currentNode.selector, 100);
		} else if (value == 'DampenedSpring') {
			this.connectionTensor =
				new Tensor(universe.selectedObject, universe.currentNode.selector, 'spring absorber', {
					'equilibriumLength': 6,
					'dampeningConstant': 1,
					'constant': 100,
					'color': 'white',
				});
		} else if (value == 'PullSpring') {
			this.connectionTensor =
				new Tensor(universe.selectedObject, universe.currentNode.selector, 'pullspring', {
					'equilibriumLength': 6,
					'constant': 100,
				});
		} else if (value == 'Absorber') {
			new Tensor(universe.selectedObject, universe.currentNode.selector, 'absorber', {
				'dampeningConstant': 1,
			});
		} else if (value == 'Field') {
			this.connectionTensor =
				new Tensor(universe.selectedObject, universe.currentNode.selector, 'field', {
					'constant': 0.0001,
				});
		}
		if (this.connectionTensor && !this.connectionEventListener) {
			this.connectionEventListener = document.addEventListener('selectionEvent', function () {
				if (this.connectionTensor && universe.selectedObject && universe.selectedObject.isNode) {
					this.connectionTensor.sensorAttach();
					this.connectionTensor = undefined;
				}
			}, false);
		}
	}


	changeDebugLevel() {
		universe.currentWorld.debugLevel = document.getElementById('debugLevel').value;
	}

	addGravityCheat() {
		let gravityWellLabel = universe.currentWorld.labels.findLabel('gravitywell');
		if (!gravityWellLabel) {
			return;
		}
		let nodes = gravityWellLabel.getNodes();
		if (!nodes || nodes.length == 0) {
			return;
		}
		let gravityWell = nodes[0];
		let constant = gravityWell.constant;
		if (!constant) {
			alert('Could not find gravitywell labeled node or field constant for gravity.');
			return;
		}
		universe.currentNode.addTensor(
			new Tensor(universe.selectedObject, gravityWell, 'gravity field', {
				'constant': constant,
				'visible': 0,
			}));
	}

	deleteSelected() {
		universe.selectedObject.unreference();
	}

	selectMainNode() {
		universe.select();
		/*
        let previousSelectedObject = universe.selectedObject;
        universe.selectedObject = universe.currentNode;
        let event = new CustomEvent('selectionEvent', {
            detail: {
                'selectedObject': universe.selectedObject,
                'previousSelectedObject': previousSelectedObject,
                'trussNode': universe.selectedObject.parentObject,
            },
            bubbles: true,
            cancelable: true,
        });
        universe.currentNode.element.dispatchEvent(event);*/
	}

	updateResize() {
		universe.currentNode.resize();
	}

	movePropertyEdit(configAreaName) {
		if (configAreaName == 'trussConfigArea') {
			this.selectMainNode();
		}
		let view = universe.currentNode.getElement('#configview');
		let container = universe.currentNode.getElement('#' + configAreaName);
		container.appendChild(view);
	}
}