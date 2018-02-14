
// Select a file and then load it from the 'Saves' folder
function load(extension, callback) {
	displayLoadorSave('loadselect', extension, function(type, fileName) {
		getLoadFile(fileName, callback);
	});
}

// Support function for load that loads the actual selected file
function getLoadFile(fileName, resultCallback) {
	loadview.innerHTML='';
	httpGetAsync('http://localhost:3000/load/'+fileName, resultCallback);
}

// select a name, then save the file on the server
function save(fileToSave, callback) {
	saveContent=fileToSave;
	displayLoadorSave('savedialog', '', callback);
}

function getShortFileName(filename) {
	return filename.split('/').pop().split('.')[0];
}

function getFileExtension(filename) {
	return filename.split('.').pop();
}

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
