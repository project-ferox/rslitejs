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
	start(); throw e;
}

var storage = new rslite(endpoint);
test("Instantiate", function() {
	ok(typeof storage == 'object', 'Successfully create an rslite instance');
});

// TODO: these are really integration tests between rslite and some remotestorage provider.

module("Integration tests");
asyncTest("Getting list of public docs with no token returns successfully", function() {
	var handler = storage.get(testUser + "/public/documents/");

	handler.complete(function(contents) {
		ok(typeof contents == 'object', 'Returned contents is a javascript object');
		start();
	}, error);
});

asyncTest("Getting a JSON doc returns the converted form of that doc", function() {
	var handler = storage.get(testUser + "/public/documents/testdoc.json");

	handler.complete(function(contents) {
		ok(typeof contents == 'object', 'JSON was converted to an object');
		start();
	}, error);
});

asyncTest("Getting a public doc returns that doc", function() {
	var handler = storage.get(testUser + "/public/documents/testdoc.json");

	handler.complete(function(contents) {
		deepEqual(contents, testdoc);
		start();
	}, error);
});

asyncTest("Save a doc, then delete it", function() {
	var storage = new rslite(endpoint);
	storage.setToken(token);
	var handler = storage.put(testUser + "/public/documents/testsave.json", testdoc);

	handler.complete(function(data, xhr) {
		var header = xhr.getResponseHeader('ETag');
		notEqual(header, '');
		notEqual(header, null);
		
		var handler = storage.delete(testUser + "/public/documents/testsave.json");
		handler.complete(function(data, xhr) {
			var header = xhr.getResponseHeader('ETag');
			notEqual(header, '');
			notEqual(header, null);

			start();
		}, error)
	}, error);
});

asyncTest("Save a doc and get it back, then delete it", function() {
	var storage = new rslite(endpoint);
	storage.setToken(token);

	var handler = storage.put(testUser + "/public/documents/saveandget.json", testdoc);
	handler.complete(function(data, xhr) {
		var handler = storage.get(testUser + "/public/documents/saveandget.json");
		handler.complete(function(data) {
			deepEqual(data, testdoc);

			var handler = storage.delete(testUser + "/public/documents/saveandget.json");
			handler.complete(start, error);
		}, error);
	}, error);
});

asyncTest("We can save a doc with a specific content-type", function() {
	var storage = new rslite(endpoint);
	storage.setToken(token);

	var handler = storage.put(testUser + "/public/documents/ctype.txt", testdoc, {
		"content-type": "text/plain"
	});

	handler.complete(function(data, xhr) {
		var handler = storage.get(testUser + "/public/documents/ctype.txt");
		handler.complete(function(data, xhr) {
			var header = xhr.getResponseHeader("content-type");
			equal(header, 'text/plain');
			start();
		}, error);
	}, error);
});

asyncTest("We can save blobs", function() {
	start();
});

asyncTest("We can save files", function() {
	start();
});

asyncTest("We can save byte arrays", function() {
	start();
});

asyncTest("We can retrieve blobs", function() {
	start();
});

asyncTest("We can retrieve files", function() {
	start();
});

asyncTest("We can retrieve byte arrays", function() {
	start();
});

asyncTest("Providing a bad token results in an unauthorized response", function() {
	start();
});

asyncTest("JSON docs can be patched", function() {
	start();
});

asyncTest("File paths can be watched / subscribed to", function() {
	start();
});

// TODO: test return codes

// TODO: test header fields

// TODO: cookie based token tests

// TODO: memory tests for ferox-remotestorage

// TODO: performance benchmarks for ferox-remotestorage

// TODO: load and concurrency testing

})();