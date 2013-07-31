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
	ok(typeof rslite.goOffline == 'function', 'Added goOffline to pipe');
	ok(typeof rslite.goOnline == 'function', 'Added goOnline to pipe');

	ok(rslite.get('cache') != null, 'Cache is in the pipe');
});

test("Cache allows rslite to go offline", function() {

});

test("Cache allows rslite to go online", function() {

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

})();