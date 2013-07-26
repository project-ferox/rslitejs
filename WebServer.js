var Express = require("express");
var faye = require("faye");

var webServ = Express.createServer();
webServ.use(Express.static('../rslitejs'));

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
bayeux.attach(webServ);

webServ.listen(8080);
console.log("Web server and pub-sub server listening on port: 8080");

bayeux.bind('publish', function() {
	console.log("\nGOT A PUBLISH")
  	console.log(arguments);
});
