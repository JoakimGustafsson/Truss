import { universe, setMouseSet } from './globals.js';
import { Node } from './Nodes/Node.js';
import { Tensor } from './Tensors.js';
import { Position } from './Primitives.js';
import { GRAVITY_FIELD_CONSTANT } from './Gravity.js';

export function downMouse(e) {
	if (e && e.target && e.target.closest && e.target.closest('.configareaouter')) {
		setMouseSet(false);
		return;
	}
	setMouseSet(true);
}
export function upMouse(e) { setMouseSet(false); }

export function openBottomPanel(evt, divName) {
	if (!universe.currentNode) {
		return;
	}
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
	if (evt && evt.currentTarget && evt.currentTarget.classList &&
		evt.currentTarget.classList.contains('tabsectionbuttons'))
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
	if (!universe.currentNode) {
		return;
	}
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
	if (!selector || !universe.currentNode || !universe.currentWorld) {
		return;
	}
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
	if (!universe.currentNode || !universe.selectedObject) {
		return;
	}
	let selectorDropDown = universe.currentNode.getElement('#tensorType');
	if (!selectorDropDown) {
		return;
	}
	let value = selectorDropDown.value;
	if (connectionTensor) {
		universe.currentNode.removeTensor(connectionTensor);
		connectionTensor = undefined;
	}
	if (connectionEventListener) {
		document.removeEventListener('selectionEvent', connectionEventListener, false);
		connectionEventListener = undefined;
	}

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
		connectionTensor = new Tensor(universe.selectedObject, universe.currentNode.selector, 'absorber', {
			'dampeningConstant': 1,
		});
	} else if (value == 'Field') {
		connectionTensor = new Tensor(universe.selectedObject, universe.currentNode.selector, 'field', {
			'constant': 0.0001,
		});
	}
	if (connectionTensor) {
		connectionEventListener = function(e) {
			if (connectionTensor && universe.selectedObject && universe.selectedObject.isNode) {
				connectionTensor.sensorAttach();
				document.removeEventListener('selectionEvent', connectionEventListener, false);
				connectionEventListener = undefined;
				connectionTensor = undefined;
			}
		};
		document.addEventListener('selectionEvent', connectionEventListener, false);
	}
}

export function changeDebugLevel() {
	const debugLevelDropdown = document.getElementById('debugLevel');
	if (debugLevelDropdown && universe.currentWorld) {
		universe.currentWorld.debugLevel = debugLevelDropdown.value;
	}
}

export function addGravityCheat() {
	let gravityWellLabel = universe.currentWorld.labels.findLabel('gravitywell');
	if (!gravityWellLabel) return;
	let nodes = gravityWellLabel.getNodes();
	if (!nodes || nodes.length == 0) return;
	let gravityWell = nodes[0];
	universe.currentNode.addTensor(
		new Tensor(gravityWell, universe.selectedObject, 'gravity field', {
			'constant': GRAVITY_FIELD_CONSTANT,
			'visible': 0,
		}));
}

export function deleteSelected() {
	if (universe.selectedObject) {
		universe.selectedObject.unreference();
	}
}

export function highlightAndModifyPropertyButtons(selectionEvent) {
	let select = selectionEvent.detail.selectedObject;
	let connectionDiv = universe.currentNode.getElement('#connectionDiv');
	if (!connectionDiv) {
		return;
	}
	if (!select) {
		connectionDiv.innerHTML = '';
		connectionDiv.appendChild(createEmptyConnectionState('No selection'));
		return;
	}
	let previousSelectedObject = selectionEvent.detail.previousSelectedObject;
	select.setHighlight(2);
	if (previousSelectedObject) {
		previousSelectedObject.setHighlight(0);
	}
	connectionDiv.innerHTML = '';
	let connectionHtml = select.generateconnectionHTML();
	connectionDiv.appendChild(connectionHtml);
	if (!connectionHtml.hasChildNodes()) {
		connectionDiv.appendChild(createEmptyConnectionState('No connections'));
	}
	let gravityButton = universe.currentNode.getElement('#gravityButton');
	let tensorAdder = universe.currentNode.getElement('#tensorAdder');
	if (select.isNode) {
		if (gravityButton) gravityButton.style.display = 'inline';
		if (tensorAdder) tensorAdder.style.display = 'inline';
	} else {
		if (gravityButton) gravityButton.style.display = 'none';
		if (tensorAdder) tensorAdder.style.display = 'none';
	}
}

function createEmptyConnectionState(message) {
	let empty = document.createElement('div');
	empty.classList.add('banner-empty-state');
	empty.textContent = message;
	return empty;
}

export function getlabel(label) {
	if (!universe.currentWorld) {
		return undefined;
	}
	return universe.currentWorld.labels.findLabel(label);
}
