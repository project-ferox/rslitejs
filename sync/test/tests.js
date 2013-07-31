(function() {
var endpoint = "https://localhost:8443/storage";
var testUser = "test";
var testdoc = {
	"one": 2,
	"three": 4,
	"five": {
		"six": 7
	}
};
var token = 'testtoken';

var error = function(e) {
	console.log(e);
	start(); throw e;
}

storage = new rslite(endpoint);

//rslite.cache.install(storage);
rslite.sync.install(storage);
test("Installed", function() {

});

test("Can be run with a cache", function() {

});

test("Can be run without a cache", function() {

});

test("Allows listeners to be registered for updates to a path", function() {

});

test("Can sync via polling", function() {

});

test("Can sync via websockets (push)", function() {

});

test("Doesn't add a handler to the pipeline, just adds methods to the pipeline object",
function() {
	//sync(path)
	//unsync(path)
	//addSyncListener(path)
	//removeSyncListener(path)
	//syncInterval(time) //invalid if using push state to sync
	//
});

});