(function(root) {
var meta = localStorage.getItem(localStoragePrefix + 'meta') || {};
if (!meta.lastKnownRevs)
	meta.lastKnownRevs = {};

window.onunload = function() {
	localStorage.setItem(localStoragePrefix + 'meta', meta);
};

function ConflictDetect() {
	this._lastKnownRevs = meta.lastKnownRevs;
	this._getOrPutComplete = this._getOrPutComplete.bind(this);
}

ConflictDetect.prototype = {
	setToken: function(ctx, token) { return ctx.next(token); },
	get: function(ctx, path, options) {
		var lastRev = this._lastKnownRevs[path];
		if (!lastRev || (options && options.ignoreConflicts)) {
			return ctx.next(path, options);
		} else {
			options || (options = {});
			options.headers['If-Match'] = lastRev.rev;

			var future = new Future();
			future.complete(this._getOrPutComplete);
			this._resolveLater(ctx.next(path, options));
			return future;
		}
	},

	put: function(ctx, path, data, options) {
		if (options && options.ignoreConflicts) {
			return ctx.next(path, options);
		} else {
			var lastRev = this._lastKnownRevs[path];
			options || (options = {});
			if (!lastRev) {
				options.headers['If-None-Match'] = '*';
			} else {
				options.headers['If-Match'] = lastRev.rev;
			}

			var future = new Future();
			future.complete(this._getOrPutComplete);
			future._resolveLater(ctx.next(path, options));
			return future;
		}
	},

	delete: function(ctx, path, options) {
		if (options && options.ignoreConflicts) {
			return ctx.next(path, options);
		} else {
			// and if lastRev doesn't exist?
			var lastRev = this._lastKnownRevs[path];
			options || (options = {});

			if (!lastRev) {
				throw "No record of the item you are trying to delete.  Did you forget ignoreConflicts?";
			} else {
				options.headers['If-Match'] = lastRev.rev;
			}

			return ctx.next(path, options);
		}
	},

	_getOrPutComplete: function(data, xhr) {
		// get the etag header
		// stuff it into last-known-revs
		var rev = xhr.getResponseHeader('ETag');
		var lastRev = this._lastKnownRevs[path];
		if (!lastRev) {
			lastRev = this._lastKnownRevs[path] = {};
		}

		lastRev.rev = rev;
	}
};

root.rslite.ConflictDetect = ConflictDetect;
}).call(this, this);
