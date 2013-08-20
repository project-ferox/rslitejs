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

// Unfortunately we need to do this since our tests depend on localStorage which is global.
QUnit.config.reorder = false;

var error = function(e) {
	console.log(e);
	start(); throw e;
}

var semaphore = rslite.semaphore;
var storage = new rslite(endpoint, testUser);
storage.setToken(token);
rslite.cache.install(storage);

function createCachePath(path) {
	return testUser + "/" + path;
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
	var storage = new rslite(endpoint, testUser);
	rslite.cache.install(storage);
	storage.goOffline();

	var handler1 = storage.put('public/documents/athing.json', {a:{doc:'here'}});
	var handler2 = storage.put('public/documents/other.json', {a:'b'});

	var sem = semaphore(2, start);
	handler1.complete(function() {
		console.log(storage.getHandler('cache')._cache);
		storage.getHandler('cache')._cache.get(createCachePath('public/documents/athing.json'),
		function(err, item) {
			deepEqual(item, {a:{doc:'here'}});
			sem();
		});
	}, error);

	handler2.complete(function() {
		storage.getHandler('cache')._cache.get(createCachePath('public/documents/other.json'),
		function(err, item) {
			deepEqual(item, {a:'b'});
			sem();
		});
	}, error);
});

asyncTest("Cache stores all transactions while online", function() {
	var sem = semaphore(2, start);

	var handler = storage.put('public/documents/testdoc.json', testdoc);
	handler.complete(function(resource) {
		storage.getHandler('cache')._cache.get(createCachePath('public/documents/testdoc.json'),
		function(err, item) {
			deepEqual(item, testdoc);
			sem();
		});
	}, error);

	handler = storage.put('public/documents/other.json', "abc");
	handler.complete(function() {
		storage.getHandler('cache')._cache.get(createCachePath('public/documents/other.json'),
		function(err, item) {
			equal(item, "abc");
			sem();
		});
	}, error);
});

asyncTest("Cache can be forced to update", function() {
	storage.goOffline();

	var future = storage.put('public/documents/testdoc.json', "bad");
	future.complete(function() {
		storage.goOnline();
		return storage.get('public/documents/testdoc.json', {forceCacheUpdate: true});
	}, error)
	.complete(function(resource) {
		deepEqual(resource, testdoc);
		start();
	}, error);
});

asyncTest("Keys for items in the cache can be retrieved", function() {
	storage.getHandler('cache').getCachedPaths(function(paths) {
		console.log(paths);
		ok(paths.indexOf(createCachePath('public/documents/other.json')) >= 0)
		ok(paths.indexOf(createCachePath('public/documents/testdoc.json')) >= 0)
		ok(paths.indexOf(createCachePath('public/documents/athing.json')) >= 0)
		start();
	});
});

asyncTest("Cache can be purged", function() {
	storage.getHandler('cache').purge(null, function() {
		storage.getHandler('cache').getCachedPaths(function(paths) {
			console.log(paths);
			equal(paths.length, 0);
			start();
		});
	});
});

asyncTest("Entire cache can be refreshed", function() {
	storage.goOffline();

	var future = storage.put('public/documents/testdoc.json', "bad");
	future.complete(function() {
		storage.goOnline();
		var future = storage.getHandler('cache').refresh();
		future.complete(function() {
			storage.get('public/documents/testdoc.json').complete(function(resource) {
				deepEqual(resource, testdoc);
				start();
			}, error);
		}, error);
	});
});

// test("Number of items held can be configured", function() {

// });

// test("Eviction algorithm may be provided", function() {

// });

asyncTest("Can put stuff to the cache only (ignoring backend)", function() {
	if (!storage.isOnline()) throw "Storage is offline for some reason";

	var future = storage.put('public/documents/offline', 'offline', {cacheOnly: true});
	future.complete(function() {
		storage.getHandler('cache').purge(null, function() {
			storage.get('public/documents/offline').complete(function() {
				ok(false);
				start();
			}, function() {
				// error is ok since the doc shouldn't exist.
				ok(true);
				start();
			});
		});
	}, error);
});

// test("Specific items may be removed from the cache", function() {

// });

// TODO: what type of errors should we expect when the doc doesn't exist?

})();