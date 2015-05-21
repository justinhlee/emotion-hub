var http = require('http');
var ip_address = '127.0.0.1';
//var ip_address = '45.55.241.129';
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8080, ip_address);
console.log('Server running');