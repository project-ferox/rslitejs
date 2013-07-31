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

var storage = new rslite(endpoint);
rslite.cache.install(storage);

test("Cache installed", function() {
	ok(storage.getHandler('cache') != null, 'Cache is in the pipe');
});

test("Cache allows rslite to go offline", function() {
	ok(typeof storage.goOffline == 'function', 'Added goOffline to pipe');
});

test("Cache allows rslite to go online", function() {
	ok(typeof storage.goOnline == 'function', 'Added goOnline to pipe');
});

test("Cache stores all transactions while offline", function() {

});

test("Cache stores all transactions while online", function() {

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