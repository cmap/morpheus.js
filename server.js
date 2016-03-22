var finalhandler = require('finalhandler')
var http = require('http');
var https = require('https');
var serveStatic = require('serve-static')
var serve = serveStatic('.', {
	'index' : [ 'index.html', 'index.htm' ]
})
var server = http.createServer(function(req, res) {
	var done = finalhandler(req, res)
	serve(req, res, done)
})
server.listen(3000);
// var fs = require('fs');
// var options = {
// key : fs.readFileSync('key.pem'),
// cert : fs.readFileSync('cert.pem')
// };
// var sServer = https.createServer(options, function(req, res) {
// var done = finalhandler(req, res)
// serve(req, res, done)
// })
 //sServer.listen(3001);

