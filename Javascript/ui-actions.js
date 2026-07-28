import { universe, setMouseSet } from './globals.js';
import { Node } from './Nodes/Node.js';
import { Tensor } from './Tensors.js';
import { Position } from './Primitives.js';

export function downMouse(e) { setMouseSet(true); }
export function upMouse(e) { setMouseSet(false); }

export function openBottomPanel(evt, divName) {
	var i, tabcontent, tablinks;
	tabcontent = universe.currentNode.getElements('.tabcontent');
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = 'none';
	}
	tablinks = universe.currentNode.getElements('.tabsectionbuttons');
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].classList.remove('active');
	}
	universe.currentNode.getElement('#' + divName).style.display = 'block';
	if (evt)
		evt.currentTarget.classList.add('active');
	else
		universe.currentNode.getElement('#propertiesButton').classList.add('active');
}

export function selectMainNode() {
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
	universe.currentNode.element.dispatchEvent(event);
}

export function movePropertyEdit(configAreaName) {
	if (configAreaName == 'trussConfigArea') {
		selectMainNode();
	}
	let view = universe.currentNode.getElement('#configview');
	let container = universe.currentNode.getElement('#' + configAreaName);
	container.appendChild(view);
}

var connectionNode;
var connectionNodeEventListener;

export function makeNode() {
	let selector = document.getElementById('nodeType');
	let value = selector.value;
	if (value == 'Node') {
		let newNode = new Node(universe.currentWorld, universe.currentNode, 'node added', {
			'localPosition': new Position(1, 1),
		});
		universe.select(newNode);
		universe.newNode = newNode;
	}
}

var connectionTensor;
var connectionEventListener;

export function makeTensor() {
	let selectorDropDown = universe.currentNode.getElement('#tensorType');
	let value = selectorDropDown.value;
	if (connectionTensor) {
		universe.currentNode.removeTensor(connectionTensor);
	}
	connectionTensor = undefined;

	if (value == 'Spring') {
		connectionTensor = new Tensor(universe.selectedObject, universe.currentNode.selector, 'spring', {
			'equilibriumLength': 6,
			'constant': 100,
			'color': 'white',
		});
	} else if (value == 'DampenedSpring') {
		connectionTensor = new Tensor(universe.selectedObject, universe.currentNode.selector, 'spring absorber', {
			'equilibriumLength': 6,
			'dampeningConstant': 1,
			'constant': 100,
			'color': 'white',
		});
	} else if (value == 'PullSpring') {
		connectionTensor = new Tensor(universe.selectedObject, universe.currentNode.selector, 'pullspring', {
			'equilibriumLength': 6,
			'constant': 100,
		});
	} else if (value == 'Absorber') {
		new Tensor(universe.selectedObject, universe.currentNode.selector, 'absorber', {
			'dampeningConstant': 1,
		});
	} else if (value == 'Field') {
		connectionTensor = new Tensor(universe.selectedObject, universe.currentNode.selector, 'field', {
			'constant': 0.0001,
		});
	}
	if (connectionTensor && !connectionEventListener) {
		connectionEventListener = document.addEventListener('selectionEvent', function(e) {
			if (connectionTensor && universe.selectedObject && universe.selectedObject.isNode) {
				connectionTensor.sensorAttach();
				connectionTensor = undefined;
			}
		}, false);
	}
}

export function changeDebugLevel() {
	universe.currentNode.debugLevel = universe.currentNode.getElement('#debugLevel').value;
}

export function addGravityCheat() {
	let gravityWellLabel = universe.currentWorld.labels.findLabel('gravitywell');
	if (!gravityWellLabel) return;
	let nodes = gravityWellLabel.getNodes();
	if (!nodes || nodes.length == 0) return;
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

export function deleteSelected() {
	universe.selectedObject.unreference();
}

export function highlightAndModifyPropertyButtons(selectionEvent) {
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

export function getlabel(label) { return universe.currentWorld.labels.findLabel(label); }
