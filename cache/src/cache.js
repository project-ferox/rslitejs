(function(root) {
var localStoragePrefix = root.rslite.localStoragePrefix;

function errOpen() {
	this._openPending = undefined;
	this._openListener();
}

function succOpen(event) {
	this._openPending = false;
	this._db = event.target.result;
	this._openListener();
}

function IndexedDbCache(openListener) {
	var openReq = indexedDB.open("rslite-cache", 1);
	openReq.onerror = errOpen.bind(this);
	openReq.onsuccess = succOpen.bind(this);

	this._openPending = true;
	this._openListener = openListener;
}

IndexedDbCache.prototype = {
	get: function(path, cb, options) {
		if (!this._db) {
			cb(null, "Couldn't open DB");
			return;
		}
	},

	// TODO: ought we accept callbacks and do some more robust handling?
	put: function(path, data, options) {
		if (!this._db)
			return;
	},

	delete: function(path, options) {
		if (!this._db)
			return;
	}
};

var MISS = IndexedDbCache.MISS = {};

// For now the LocalStorageCache only caches text and json.
function LocalStorageCache(openListener) {
	this._openPending = false;
	this._db = localStorage;
	openListener();
	console.log('Falling back to LocalStorageCache.  Will only cache text and json.');
}

LocalStorageCache.prototype = {
	get: function(path, cb, options) {
		var item = this._db.getItem(localStoragePrefix + path);
		if (item == null) {
			cb(null, MISS, path);
		} else {
			cb(null, JSON.parse(item), path);
		}
	},

	// TODO: should be able to notify listeners on a given path.
	put: function(path, data, cb, options) {
		if (root.rslite.utils.treatAsJson(data) || typeof data == 'string') {
			this._db.setItem(localStoragePrefix + path, JSON.stringify(data));
			if (cb)
				cb();
		} else {
			if (cb)
				cb();
		}
	},

	delete: function(path, cb, options) {
		this._db.removeItem(localStoragePrefix + path);
		if (cb)
			cb();
	},

	purge: function(paths, cb) {
		var localStorage = this._db;
		if (!paths) {
			var len = localStorage.length;
			for (var i = len-1; i >= 0; --i) {
				var key = localStorage.key(i);
				if (key.indexOf(localStoragePrefix) == 0) {
					localStorage.removeItem(key);
				}
			}
		} else {
			paths.forEach(function(path) {
				localStorage.removeItem(localStoragePrefix + path);
			});
		}

		if (cb)
			cb();
	},

	getCachedPaths: function(cb) {
		var result = [];
		for (var i = 0; i < localStorage.length; ++i) {
			var key = localStorage.key(i);
			if (key.indexOf(localStoragePrefix) == 0)
				result.push(key.substring(localStoragePrefix.length));
		}

		cb(result);
	}
};

LocalStorageCache.MISS = MISS;

if (!root.rslite.priv)
	root.rslite.priv = {};

if (false)
	root.rslite.priv.Cache = IndexedDbCache;
else
	root.rslite.priv.Cache = LocalStorageCache;

}).call(this, this);