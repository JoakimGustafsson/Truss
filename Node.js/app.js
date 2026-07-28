var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SAVES_DIR    = path.resolve(PROJECT_ROOT, 'Saves');
const RESOURCES_DIR = path.resolve(PROJECT_ROOT, 'Resources');

/** Returns the resolved path only if it stays inside allowedDir, else null. */
function safeResolve(allowedDir, userInput) {
	const resolved = path.resolve(allowedDir, userInput);
	return resolved.startsWith(allowedDir + path.sep) || resolved === allowedDir
		? resolved
		: null;
}

// Serve static assets — scoped to the project root only (no parent directories).
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(PROJECT_ROOT));

app.get('/', function (req, res) {
	res.sendFile(path.join(PROJECT_ROOT, 'Truss.html'));
});

app.get('/dir/:folder', function (req, res) {
	const target = safeResolve(PROJECT_ROOT, req.params.folder);
	if (!target) {
		return res.status(400).end('Invalid path.');
	}
	fs.readdir(target, function (err, files) {
		if (err) {
			console.error(err);
			return res.status(404).end('Not found.');
		}
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end(JSON.stringify(files));
	});
});

app.get('/load/:fileName', function (req, res) {
	const target = safeResolve(SAVES_DIR, req.params.fileName);
	if (!target) {
		return res.status(400).end('Invalid path.');
	}
	fs.readFile(target, function (err, data) {
		if (err) {
			console.error(err);
			return res.status(404).end('Not found.');
		}
		console.log('Loaded: ' + target);
		res.end(data);
	});
});

app.post('/upload', function (req, res) {
	var form = new formidable.IncomingForm();
	form.multiples = true;
	form.uploadDir = RESOURCES_DIR;

	form.on('file', function (field, file) {
		// Use path.basename to strip any directory components from the uploaded name.
		const safeName = path.basename(file.originalFilename || file.name);
		const dest = path.join(RESOURCES_DIR, safeName);
		fs.rename(file.filepath || file.path, dest, function (err) {
			if (err) console.error('Upload rename error:', err);
		});
	});

	form.on('error', function (err) {
		console.log('Upload error: \n' + err);
	});

	form.on('end', function () {
		res.end('success');
	});

	form.parse(req);
});

app.post('/save', function (req, res) {
	var body = [];

	req.on('data', function (chunk) {
		body.push(chunk);
	}).on('end', function () {
		body = Buffer.concat(body).toString();
		var obj = JSON.parse(body);
		const target = safeResolve(SAVES_DIR, obj.fileName);
		if (!target) {
			return res.status(400).end('Invalid path.');
		}
		fs.writeFile(target, JSON.stringify(obj.fileContent), function (err) {
			if (err) {
				console.error(err);
				return res.status(500).end('Save failed.');
			}
			console.log('Saved: ' + target);
			res.end('Successful save.\n');
		});
	});
});


var server = app.listen(3000, function () {
	console.log('Server listening on port 3000');
});