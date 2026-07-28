import { World } from './Universe.js';
import { universe } from './globals.js';

/** Support function that returns the filename from a filepath
 * @param  {string} filename
 * @return {string}
 */
function getShortFileName(filename) {
	return filename.split('/').pop().split('.')[0];
}

/** Support function that returns the file extension from a filepath
 * @param  {string} filename
 * @return {string}
 */
function getFileExtension(filename) {
	return filename.split('.').pop();
}

/**
 * @param  {string} theUrl
 * @param  {function} callback
 * @param  {object} fileContent
 * @param  {string} fileName
 */
function httpPostAsync(theUrl, callback, fileContent, fileName) {
	let xmlHttp = new XMLHttpRequest();

	xmlHttp.open('POST', theUrl);
	xmlHttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			callback(xmlHttp.responseText);
		}
	};

	let temp = {
		'fileName': fileName,
		'fileContent': fileContent,
	};

	xmlHttp.send(JSON.stringify(temp));
}

/**
 * @param  {string} theUrl
 * @param  {string} callback
 */
function httpGetAsync(theUrl, callback) {
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			callback(xmlHttp.responseText);
		}
	};
	xmlHttp.open('GET', theUrl, true); // true for asynchronous
	xmlHttp.send();
}

/**
 * Convert older TrussNode-rooted saves into the current World format.
 * @param {Object} restoreObject
 * @return {Object}
 */
function normalizeRestoreObject(restoreObject) {
	if (!restoreObject || restoreObject.classname == 'World') {
		return restoreObject;
	}
	if (!restoreObject.truss || !Array.isArray(restoreObject.truss.nodes) || !Array.isArray(restoreObject.truss.tensors)) {
		return restoreObject;
	}

	function inferLegacyLabelString(item) {
		if (!item) {
			return 'node';
		}
		if (item.labelString) {
			return item.labelString;
		}
		switch (item.classname) {
			case 'TrussNode':
			case 'PerformanceTrussNode':
			case 'WalkTruss':
			case 'GovenorTruss':
			case 'ScrollerTruss':
				return 'truss';
			case 'Selector':
				return 'selector';
			case 'KeySensorNode':
				return 'keysensor';
			case 'ProximitySensorNode':
			case 'CollisionSensorNode':
			case 'BounceSensorNode':
			case 'PositionNode':
			case 'HTMLEditNode':
			case 'PropertyUpdateNode':
				return 'sensor';
			case 'ProtagonistNode':
				return 'moveable node color';
			case 'PictureNode':
				return 'picture node';
			case 'CollectionNode':
				return 'moveable node';
			case 'JumpNode':
			case 'LeftRightNode':
			case 'LineBreakerNode':
			case 'ScrollNode':
				return 'moveable node';
			case 'Field':
				return 'field';
			case 'Spring':
				return 'spring';
			case 'PullSpring':
				return 'pullspring';
			case 'Absorber':
				return 'absorber';
			case 'DampenedSpring':
				return 'spring absorber';
			case 'Node':
			default:
				if (item.name == 'Earth') {
					return 'gravitywell node';
				}
				if (item.name && (item.name.indexOf('Top') >= 0 || item.name.indexOf('Bottom') >= 0 || item.name.indexOf('nayl') >= 0)) {
					return 'moveable node';
				}
				return 'moveable node';
		}
	}

	let legacyTruss = restoreObject.truss;
	let rootNode = Object.assign({}, restoreObject);
	rootNode.labelString = inferLegacyLabelString(rootNode);
	rootNode.screenSize = legacyTruss.view && legacyTruss.view.screenSize ? legacyTruss.view.screenSize : rootNode.screenSize;
	rootNode.worldSize = legacyTruss.view && legacyTruss.view.worldViewSize ? legacyTruss.view.worldViewSize : rootNode.worldSize;
	rootNode.worldOffset = legacyTruss.view && legacyTruss.view.offset ? legacyTruss.view.offset : rootNode.worldOffset;
	if (rootNode.parentTrussNode == undefined || rootNode.parentTrussNode == null) {
		rootNode.parentTrussNode = 0;
	}
	if (legacyTruss.timestep) {
		rootNode.fpsTarget = 1 / legacyTruss.timestep;
	}
	if (legacyTruss.fps != undefined) {
		rootNode.fps = legacyTruss.fps;
	}
	if (legacyTruss.gridSize != undefined) {
		rootNode.gridSize = legacyTruss.gridSize;
	}
	delete rootNode.truss;

	let tensors = legacyTruss.tensors.map((tensor) => {
		let normalizedTensor = Object.assign({}, tensor);
		normalizedTensor.labelString = inferLegacyLabelString(normalizedTensor);
		if (typeof normalizedTensor.node1 == 'number') {
			normalizedTensor.node1 += 1;
		}
		if (typeof normalizedTensor.node2 == 'number') {
			normalizedTensor.node2 += 1;
		}
		return normalizedTensor;
	});
	let nodes = legacyTruss.nodes.map((node) => {
		let normalizedNode = Object.assign({}, node);
		normalizedNode.labelString = inferLegacyLabelString(normalizedNode);
		if (normalizedNode.parentTrussNode == undefined || normalizedNode.parentTrussNode == null) {
			normalizedNode.parentTrussNode = 0;
		}
		return normalizedNode;
	});

	return {
		classname: 'World',
		nodes: [rootNode].concat(nodes),
		tensors: tensors,
		trussNode: 0,
		governors: [],
	};
}


/**
 * @param  {string} fileName
 */
function saveFile(fileName) {
	universe.currentWorld.mapAll((trussNode) => trussNode.hideEdit());
	httpPostAsync('/save', function(x) {
		console.log('Server reported: ' + x);
	}, universe.currentWorld.serialize(), fileName + '.json');
}

/**
 * @param  {string} folderName
 */
function directory(folderName) {
	httpGetAsync('/dir/' + folderName, function(x) {
		console.log('Server reported: ' + x);
		displaySaves(x);
	});
}

/** @param  {string} fileName
*/
function loadFile(fileName) {
	// mainNode.truss.hideEdit();
	httpGetAsync('/load/' + fileName, function(x) {
		console.log('Server reported: ' + x);
		// mainNode.clean();
		universe.pop().close();
		let newWorld= new World();
		universe.currentWorld = newWorld;
		newWorld.deserialize(normalizeRestoreObject(JSON.parse(x)));
		universe.push(newWorld);
		universe.setCurrentWorld(newWorld);
	});
}

/**
	 * @param  {element} element
	 */
function highLightFile(element) {
	element.className='selectedfilename';
}
/**
	 * @param  {element} element
	 */
function unhighLightFile(element) {
	element.className='filename';
}

/**
 * @param  {string} text
 * @param  {string} extension
 */
function displaySaves(text) {
	let fullPath;
	let element;

	let fileListElement = universe.currentNode.getElement('#fileList');
	// document.getElementById('fileList');
	if (!fileListElement) {
		console.error('Could not find file list window element.');
		return;
	}
	fileListElement.innerHTML='';
	let fileList = JSON.parse(text);
	let fileName;
	// XXclearDropDown();
	for (let i = 0; i < fileList.length; i++) {
		fileName = fileList[i];
		if (getFileExtension(fileName) == 'json') {
			fullPath = '../Saves/' + fileName;
			element = document.createElement('div');
			element.className = 'filename';
				element.innerHTML = fileName;
				fileListElement.appendChild(element);
				element.title = fileName;
				element.addEventListener('click', () => loadFile(fileName));
				element.addEventListener('mouseover', () => highLightFile(element));
				element.addEventListener('mouseout', () => unhighLightFile(element));
		}
	}
}

export { getShortFileName, getFileExtension, httpPostAsync, httpGetAsync, saveFile, directory, loadFile, highLightFile, unhighLightFile, displaySaves };
