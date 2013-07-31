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

var semaphore = rslite.semaphore;
var storage = new rslite(endpoint + "/" + testUser);
rslite.cache.install(storage);

function createCachePath(path) {
	return endpoint + "/" + testUser + "/" + path;
}

test("Cache installed", function() {
	ok(storage.getHandler('cache') != null, 'Cache is in the pipe');
});

test("Cache allows rslite to go offline", function() {
	ok(typeof storage.goOffline == 'function', 'Added goOffline to pipe');
});

test("Cache allows rslite to go online", function() {
	ok(typeof storage.goOnline == 'function', 'Added goOnline to pipe');
});

asyncTest("Cache stores all transactions while offline", function() {
	var storage = new rslite(endpoint + "/" + testUser);
	rslite.cache.install(storage);
	storage.goOffline();

	var handler1 = storage.put('documents/testdoc.json', testdoc);
	var handler2 = storage.put('documents/other.json', {a:'b'});

	var sem = semaphore(2, start);
	handler1.complete(function() {
		storage.getHandler('cache').get(createCachePath('documents/testdoc.json'),
		function(item) {
			deepEqual(item, testdoc);
			sem();
		});
	}, error);

	handler2.complete(function() {
		storage.getHandler('cache').get(createCachePath('documents/other.json'),
		function(item) {
			deepEqual(item, {a:'b'});
			sem();
		});
	}, error);
});

asyncTest("Cache stores all transactions while online", function() {
	start();
});

test("Cache can be forced to update", function() {

});

test("Keys for items in the cache can be retrieved", function() {

});

test("Cache can be purged", function() {

});

test("Entire cache can be refreshed", function() {

});

test("Number of items held can be configured", function() {

});

test("Eviction algorithm may be provided", function() {

});

test("Can put stuff to the cache only", function() {

});

test("Specific items may be removed from the cache", function() {

});

})();