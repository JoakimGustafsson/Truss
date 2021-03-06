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
 * @param  {string} fileName
 */
function saveFile(fileName) {
<<<<<<< HEAD
	mainNode.truss.hideEdit();
	httpPostAsync('/save', function(x) {
		console.log('Server reported: ' + x);
	}, mainNode.serialize(), fileName + '.json');
=======
	universe.currentWorld.mapAll((trussNode) => trussNode.hideEdit());
	httpPostAsync('/save', function(x) {
		console.log('Server reported: ' + x);
	}, universe.currentWorld.serialize(), fileName + '.json');
>>>>>>> newtestbranch
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
<<<<<<< HEAD
	mainNode.truss.hideEdit();
	httpGetAsync('/load/' + fileName, function(x) {
		console.log('Server reported: ' + x);
		mainNode.clean();
		newMainNode=new TrussNode();
		newMainNode.deserialize(undefined, JSON.parse(x));
=======
	// mainNode.truss.hideEdit();
	httpGetAsync('/load/' + fileName, function(x) {
		console.log('Server reported: ' + x);
		// mainNode.clean();
		universe.pop().close();
		let newWorld= new World();
		newWorld.deserialize(JSON.parse(x));
		universe.push(newWorld);
		universe.setCurrentWorld(newWorld);
>>>>>>> newtestbranch
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

<<<<<<< HEAD
	let fileListElement = document.getElementById('fileList');
=======
	let fileListElement = universe.currentNode.getElement('#fileList');
	// document.getElementById('fileList');
>>>>>>> newtestbranch
	if (!fileListElement) {
		alert('Could not find file list window.');
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
<<<<<<< HEAD
			element = document.createElement('span');
			element.className = 'filename';
			element.innerHTML = fileName;
			fileListElement.appendChild(element);
			fileListElement.appendChild(document.createElement('br'));
=======
			element = document.createElement('div');
			element.className = 'filename';
			element.innerHTML = fileName;
			fileListElement.appendChild(element);
			// fileListElement.appendChild(document.createElement('br'));
>>>>>>> newtestbranch
			element.title = fileName;
			element.setAttribute('onclick', 'loadFile(\'' + fileName + '\');');
			element.setAttribute('onmouseover', 'highLightFile(this);');
			element.setAttribute('onmouseout', 'unhighLightFile(this);');
		}
	}
}
