var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '../..')));

app.use(express.static(path.join(__dirname, '../../Truss')));
app.use(express.static(path.join(__dirname, '../../Truss/Javascript')));

app.use(express.static(path.join(__dirname, '../Operator Instruction')));
app.use(express.static(path.join(__dirname, '../Operator Instruction/WebContent')));
app.use(express.static(path.join(__dirname, '../Operator Instruction/Resources')));

app.use(express.static(path.join(__dirname, '../Operator Instruction Editor')));
app.use(express.static(path.join(__dirname, '../Operator Instruction Editor/Resources')));
app.use(express.static(path.join(__dirname, '../Operator Instruction Editor/WebContent')));

app.use(express.static(path.join(__dirname, '../File upload code/Views')));
app.use(express.static(path.join(__dirname, '../File upload code/Public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '../Truss.html'));
});

app.get('/dir/:folder', function (req, res) {
	console.log("folder:"+req.params.folder);
	fs.readdir(__dirname + "/../Operator Instruction/"+req.params.folder,function(err, files){
   		if (err) {
      			return console.error(err);
   		}
   		files.forEach( function (file){
      			console.log( file );
   		});

   		res.writeHead(200, {'Content-Type': 'text/plain'});
   	    res.end( JSON.stringify(files));
   	});
})

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '../Operator Instruction/Resources');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

app.post('/save', function(req, res){
	var body=[];
	
	req.on('data', function(chunk) {
	    body.push(chunk);
	  }).on('end', function() {
		    body = Buffer.concat(body).toString();
//		    console.log("Body: "+body);
		    var obj = JSON.parse(body);
//		    console.log("obj"+obj);
//		    console.log("obj.fileName:"+obj.fileName);
//		    console.log("obj.fileContent:"+obj.fileContent);
		    fs.writeFile("../Operator Instruction/Saves/"+obj.fileName, obj.fileContent, function(err) {
		        if(err) {
		            return console.log(err);
		        }
		        console.log("The file was saved!");
		        res.end('Successful save.\n')
		    }); 

	  });
});

app.post('/load/:fileName', function(req, res){
	console.log("fileName:"+req.params.filename);
	fs.readFile(req.params.filename, function(err,data) {
		if(err) {
			return console.log(err);
		}
		console.log("The file was loaded!");
		res.end(data);
	}); 

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});