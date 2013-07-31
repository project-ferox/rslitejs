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

continuation();

function continuation() {

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
		var handler = storage.delete(testUser + "/public/documents/testsave.json");
		ok(true);
		handler.complete(function(data, xhr) {
			ok(true);
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
		headers: {"content-type": "text/plain"}
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

asyncTest("Providing a bad token for access controlled operations results in an unauthorized response", function() {
	var storage = new rslite(endpoint);
	storage.setToken('baf');

	var handler = storage.put(testUser + "/public/documents/shouldfail", testdoc);

	handler.complete(function(data, hxr) {
		ok(false);
		start();
	}, function(e, xhr) {
		equal(xhr.status, 401);
		start();
	});
});

asyncTest("Providing no token for access controlled ops result in an unauthorized response", function() {
	var storage = new rslite(endpoint);
	var handler = storage.put(testUser + "/public/documents/shouldfail", testdoc);

	handler.complete(function(data, hxr) {
		ok(false);
		start();
	}, function(e, xhr) {
		equal(xhr.status, 401);
		start();
	});
});

asyncTest("We can retrieve blobs", function() {
	var handler = storage.get(testUser + "/public/documents/image.png", {responseType: 'blob'});

	handler.complete(function(data, xhr) {
		var blob = new Blob([data], {type: 'image/png'});
		var img = document.createElement('img');
		img.onload = function(e) {
			window.URL.revokeObjectURL(img.src);
			equal(img.width, 218);
			equal(img.height, 128);
			start();
		};
		img.src = window.URL.createObjectURL(blob);
		document.body.appendChild(img);
	}, error);
});

asyncTest("We can save blobs", function() {
	var storage = new rslite(endpoint);
	storage.setToken(token);

	var blob = new Blob(["abc123 where is teh text?"], {type: 'text/plain'});

console.log(blob instanceof Blob);

	var handler = storage.put(testUser + "/public/documents/blob", blob);

	handler.complete(function(data, xhr) {
		ok(true);
		start();

		// todo retrieve and check the blob that was saved.
	}, error);
});

// asyncTest("We can save files", function() {
// 	start();
// });

asyncTest("We can save byte arrays", function() {
	var storage = new rslite(endpoint);
	storage.setToken(token);
	var array = new Uint8Array([1, 2, 3]);
	storage.put(testUser + "/public/documents/array", array.buffer)
		.complete(function(data, xhr) {
			ok(true);
			start();
		}, error)

		// todo retrieve and check the array
});

asyncTest("We can retrieve byte arrays", function() {
	storage.get(testUser + "/public/documents/array", {responseType: 'arraybuffer'}).complete(
		function(data) {
			var array = new Uint8Array(data);
			equal(array[2], 3);
			equal(array.length, 3);
			start();
		}, error);
});

asyncTest("JSON docs can be patched", function() {
	start();
});

asyncTest("File paths can be watched / subscribed to", function() {
	start();
});

asyncTest("Upload progress is reported", function() {
	start();
});

asyncTest("Download progress is reported", function() {
	start();
});

// TODO: test return codes

// TODO: test header fields

// TODO: cookie based token tests

// TODO: memory tests for ferox-remotestorage

// TODO: performance benchmarks for ferox-remotestorage

// TODO: load and concurrency testing
}

})();