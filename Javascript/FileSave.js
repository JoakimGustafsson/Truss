/**
 * @param  {string} fileName
 * @param  {string} fileToSave
 * @param  {string} extension
 */
function saveFile1(fileName, fileToSave, extension) {
	// ensure citations are handled correctly
	fileToSave = JSON.stringify(fileToSave);

	if (getFileExtension(fileName)!=extension) {
		fileName=fileName+'.'+extension;
	}

	$.ajax({
		url: '/save',
		type: 'POST',
		data: '{ "fileName":"'+fileName+'", "fileContent":'+fileToSave+'}',
		processData: false,
		contentType: false,
		success: function(data) {
			console.log('Save successful!\n' + data);
			cleanupFilemanagementViews(data);
		},
		xhr: function() {
			let xhr = new XMLHttpRequest();
			return xhr;
		},
	});
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

    
/*
	xmlHttp.open('POST', theUrl, true); // true for asynchronous
    xmlHttp.send();
*/
}


/**
 * @param  {string} fileName
 */
function saveFile(fileName) {
	httpPostAsync('/save', function(x) {
		alert(x);
	}, mainNode.serialize(), fileName+'.tnd');
	// saveFile1(fileName, mainNode.serialize(), 'truss');
}
