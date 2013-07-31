(function(root) {

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

var localStoragePrefix = 'rslCache';
function LocalStorageCache(openListener) {
	this._openPending = false;
	openListener();
	this._db = localStorage;
}

LocalStorageCache.prototype = {
	get: function(path, cb, options) {
		var item = this._db.getItem(localStoragePrefix + path);
		if (item == null) {
			cb(MISS);
		} else {
			cb(item);
		}
	},

	// TODO: should be able to notify listeners on a given path.
	put: function(path, data, cb, options) {
		this._db.setItem(localStoragePrefix + path, data);
		cb();
	},

	delete: function(path, cb, options) {
		this._db.removeItem(localStoragePrefix + path);
		cb();
	},

	purge: function(paths) {
		var localStorage = this._db;
		if (!paths) {
			for (var i = 0; i < localStorage.length; ++i) {
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