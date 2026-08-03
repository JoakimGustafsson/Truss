import { Universe, World } from './Universe.js';
import { PerformanceTrussNode } from './ExperimentalTrusses.js';
import { Position, Vector } from './Primitives.js';
import { setUniverse, setFPSdisplay, setMyX, setMyY, setDisplayMousePercent } from './globals.js';
import { openBottomPanel, highlightAndModifyPropertyButtons, makeNode, makeTensor, downMouse, upMouse } from './ui-actions.js';

let _universe;

function mainLoop(timestamp) {
	_universe.tick(timestamp / 1000);
	requestAnimationFrame(mainLoop);
}

function updateResize() {
	if (_universe && _universe.currentNode) {
		_universe.currentNode.resize();
	}
}

function init() {
	if (window.location.protocol === 'file:') {
		console.warn('Run Truss through Node.js/app.js (http://localhost:3000), not file:// URLs.');
	}

	setFPSdisplay(document.getElementById('FPSdisplay'));

	_universe = new Universe(document.getElementById('mainArea'));
	setUniverse(_universe);

	let latestWorld = _universe.push(new World());

	let latestNode = new PerformanceTrussNode(latestWorld, undefined, 'truss', {
		'name': 'MainNode',
	}, new Position(0, 0), new Vector(60, 70), 1 / 60, 1, 'MainNode');
	latestNode.initiate();
	latestWorld.trussNode = latestNode;
	latestWorld.governors = [];
	latestNode.resize();

	_universe.setCurrentWorld(latestWorld);

	window.requestAnimationFrame(mainLoop);

	document.getElementById('mainArea').onmousemove = function(e) {
		// Store viewport-relative coordinates (for world coordinate system)
		setMyX(e.clientX);
		setMyY(e.clientY);
		
		// Calculate and store display plane percentages once, here
		// All other code uses these percentages without further conversion
		if (_universe && _universe.currentNode && _universe.currentNode.view) {
			const view = _universe.currentNode.view;
			const containerRect = view.element.getBoundingClientRect();
			const canvasX = e.clientX - containerRect.left;
			const canvasY = e.clientY - containerRect.top;
			
			const displayPercX = (canvasX / containerRect.width) * 100;
			const displayPercY = (1 - (canvasY / containerRect.height)) * 100;
			
			setDisplayMousePercent(displayPercX, displayPercY);
		}
	};
	document.getElementById('mainArea').addEventListener('mousedown', downMouse, false);
	window.addEventListener('mouseup', upMouse, false);
	document.getElementById('mainArea').addEventListener('mouseleave', upMouse, false);
	
	// Right-click to open banner
	document.getElementById('mainArea').addEventListener('contextmenu', function(e) {
		e.preventDefault();
		if (_universe && _universe.selectedObject) {
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': _universe.selectedObject,
					'previousSelectedObject': null,
					'trussNode': _universe.selectedObject.parentObject || _universe.selectedObject,
				},
				bubbles: true,
				cancelable: true,
			});
			_universe.currentNode.element.dispatchEvent(event);
			console.log('✓ Banner triggered via right-click');
		}
		return false;
	}, false);

	document.addEventListener('selectionEvent', function(e) {
		highlightAndModifyPropertyButtons.call(this, e);
	}, false);

	openBottomPanel(undefined, 'propertiesDiv');
	updateResize();
}

window.addEventListener('keydown', function(e) {
	if (!_universe || !_universe.currentWorld || !_universe.currentWorld.fastEdit) return;
	if (e.keyCode == 78) {
		makeNode();
	} else if (e.keyCode == 84) {
		makeTensor();
	} else if (e.keyCode == 66) {
		// 'B' key to trigger banner by firing a selection event
		if (_universe.selectedObject) {
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': _universe.selectedObject,
					'previousSelectedObject': null,
					'trussNode': _universe.selectedObject.parentObject || _universe.selectedObject,
				},
				bubbles: true,
				cancelable: true,
			});
			_universe.currentNode.element.dispatchEvent(event);
			console.log('✓ Banner triggered via B key');
		}
	}
}, true);

window.addEventListener('resize', updateResize);

init();
