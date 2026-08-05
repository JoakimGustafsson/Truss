import { Universe, World } from './Universe.js';
import { PerformanceTrussNode } from './ExperimentalTrusses.js';
import { Position, Vector } from './Primitives.js';
import { setUniverse, setFPSdisplay, setMyX, setMyY, setDisplayMousePercent } from './globals.js';
import { openBottomPanel, highlightAndModifyPropertyButtons, makeNode, makeTensor, downMouse, upMouse } from './ui-actions.js';

let _universe;
let _followFrameCount = 0; // Global counter for logging

function updateCameraFollow(followedObject, trussNode) {
	// followedObject can be either a Node or a Tensor
	let targetNode = followedObject;
	if (followedObject && followedObject.node1) {
		targetNode = followedObject.node1;
	}
	
	if (!targetNode || !targetNode.localPosition || !trussNode.view) {
		return;
	}

	const worldPos = targetNode.localPosition;
	const view = trussNode.view;
	const screenCenterX = view.element.clientWidth / 2;
	const screenCenterY = view.element.clientHeight / 2;
	
	// View formulas:
	// screenX = (worldX - offset.x) / xScale
	// screenY = -(worldY - offset.y) / yScale
	// 
	// To center object at screen center:
	// screenCenterX = (worldX - offset.x) / xScale
	// screenCenterY = -(worldY - offset.y) / yScale
	//
	// Solving for offset:
	// offset.x = worldX - screenCenterX * xScale
	// offset.y = worldY + screenCenterY * yScale
	
	const targetOffsetX = worldPos.x - screenCenterX * view.xScale;
	const targetOffsetY = worldPos.y + screenCenterY * view.yScale;
	
	// Use near-zero smoothing to directly track node position
	// Smoothing is kept minimal since any lag causes visible jitter on fast-moving objects
	let smoothing = 0.001; // Virtually instant tracking
	
	// Reduce smoothing at extreme zoom to prevent position quantization
	if (view.xScale < 0.001 || view.xScale > 1000) {
		smoothing = 0.0001; // Effectively instant at extreme zoom
	}
	
	const oldOffsetX = view.offset.x;
	const oldOffsetY = view.offset.y;
	
	view.offset.x = view.offset.x * smoothing + targetOffsetX * (1 - smoothing);
	view.offset.y = view.offset.y * smoothing + targetOffsetY * (1 - smoothing);
	
	// Log offset changes to identify oscillation pattern
	_followFrameCount++;
	const offsetChangeX = Math.abs(view.offset.x - oldOffsetX);
	const offsetChangeY = Math.abs(view.offset.y - oldOffsetY);
	
	if (_followFrameCount % 20 === 0) {
		console.log(`📍 Frame ${_followFrameCount}: ΔX=${offsetChangeX.toFixed(6)}, ΔY=${offsetChangeY.toFixed(6)} | Target: (${targetOffsetX.toFixed(4)}, ${targetOffsetY.toFixed(4)}) | Curr: (${view.offset.x.toFixed(4)}, ${view.offset.y.toFixed(4)}) | xScale=${view.xScale.toFixed(6)}`);
	}
}

function mainLoop(timestamp) {
	_universe.tick(timestamp / 1000);
	
	// Update node highlighting based on current state (selection, hover, follow)
	if (_universe.currentNode && _universe.currentNode.updateNodeHighlighting) {
		_universe.currentNode.updateNodeHighlighting();
	}
	
	// Update camera follow if a node is being followed
	if (_universe.followedNode && _universe.currentNode) {
		updateCameraFollow(_universe.followedNode, _universe.currentNode);
	}
	
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
			
			// Update hovered node based on picking
			if (_universe.currentNode && _universe.currentNode.getClosestObject) {
				_universe.hoveredNode = _universe.currentNode.getClosestObject(3);
			}
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
	// FastEdit mode: Enable keyboard shortcuts for rapid node/tensor creation
	// N = Create new Node
	// T = Create new Tensor
	// B = Open banner (property editor) for selected object
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
