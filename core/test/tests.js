(function() {

var endpoint = "https://localhost:8443/storage";
var testUser = "test";

var storage = new rslite(endpoint);
test("Instantiate", function() {
	ok(typeof storage == 'object', 'Successfully create an rslite instance');
});

asyncTest("Getting list of public docs with no token returns successfully", function() {
	var handler = storage.get("test/public/documents/");

	handler.complete(function(contents) {
		ok(typeof contents == 'object', 'Returned contents is a javascript object');
		start();
	}, function(e) {
		start();
		throw e;
	});
});

})();