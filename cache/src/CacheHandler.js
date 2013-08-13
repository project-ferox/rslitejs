(function(root) {
var Future = root.rslite.Future;
var Aborter = root.rslite.handlers.Aborter;
var Cache = root.rslite.priv.Cache;

/**
Provides caching in the rslite pipeline.

Conflicts between documents are detected at the level below the cache.
*/
function CacheHandler() {
	// TODO: more sensible to have the cache handle the queueing?
	this._queue = [];
	this._cache = new Cache(this._processQueue.bind(this));
}

CacheHandler.prototype = {
	setToken: function(ctx, token) { return ctx.next(token); },
	setPipeline: function(pipeline) { this._pipeline = pipeline; },
	get: function(ctx, path, options) {
		var self = this;
		if (this._cache._openPending) {
			var future = new Future();
			this._queue.push(function() {
				future._resolveLater(self.get(ctx, path, options));
			});

			return future;
		}

		var future = new Future();
		var fullPath = ctx.pipeline.endpoint + '/' + path;
		var getCompleteCb = function(resource) {
				if (resource != Aborter.OFFLINE)
					self._cache.put(fullPath, resource);
		};

		if (options && options.forceCacheUpdate) {
			future.complete(getCompleteCb);
			future._resolveLater(ctx.next(path, options));
		} else {
			var checkCacheOnly = options && options.checkCacheOnly;
			this._cache.get(fullPath, function(err, resource) {
				if ((resource == Cache.MISS || err != null) && !checkCacheOnly) {
					if (!options || !options.bypassCache) {
						future.complete(getCompleteCb);
					}
					future._resolveLater(ctx.next(path, options));
				} else if (err == null) {
					future._resolve(resource);
				}
			}, options);
		}

		return future;
	},

	put: function(ctx, path, data, options) {
		if (options) var cacheOnly = options.cacheOnly;
		if (!options || !options.bypassCache) {
			if (this._cache._openPending) {
				var self = this;
				var future = new Future();
				this._queue.push(function() {
					future._resolveLater(self._cache.put(path, data, options));
				});

				return future;
			}

			var count = cacheOnly ? 1 : 2;
			var future = new Future(count);
			var fullPath = ctx.pipeline.endpoint + '/' + path;
			this._cache.put(fullPath, data, function(err) {
				if (!err)
					future._resolve();
				else
					future._fail(err);
			}, options);
		}

		if (!cacheOnly)
			var handler = ctx.next(path, data, options);

		if (future) {
			if (handler)
				future._resolveLater(handler);
			return future;
		}

		return handler;
	},

	delete: function(ctx, path, options) {
		if (!options || !options.retainCached) {
			var future = new Future(2);
			var fullPath = ctx.pipeline.endpoint + '/' + path;
			this._cache.delete(fullPath, function(err) {
				if (!err)
					future._resolve();
				else
					future._fail(err);
			}, options);
		}

		var handler = ctx.next(path, options);

		if (future) {
			future._resolveLater(handler);
			return future;
		}

		return handler;
	},

	_refresh: function(future, paths) {
		var options = {forceCacheUpdate: true};
		var future2 = new Future(paths.length);
		paths.forEach(function(path) {
			var f = this._pipeline.get(path.substring(this._pipeline.endpoint.length+1), options);
			future2._resolveLater(f);
		}, this);

		if (future)
			future._resolveLater(future2);

		return future2;
	},

	refresh: function(paths) {
		if (!paths) {
			var self = this;
			var future = new Future();
			this.getCachedPaths(function(paths) {
				self._refresh(future, paths);
			});
			return future;
		} else {
			return this._refresh(null, paths);
		}
	},

	purge: function(paths, cb) {
		this._cache.purge(paths, cb);
	},

	push: function(paths) {
		if (!paths)
			paths = this.getCachedPaths();

		var options = {bypassCache: true};
		var self = this;
		var getCb = function(err, resource, path) {
			if (!err) {
				self._pipeline.put(path, resource, options);
			}
		};

		paths.forEach(function(path) {
			this._cache.get(path, getCb);
		}, this);
	},

	getCachedPaths: function(cb) {
		this._cache.getCachedPaths(cb);
	},

	_processQueue: function() {
		this._queue.forEach(function(cb) {
			cb();
		});

		this._queue = [];
	}
};

function goOnline() {
	this.remove('aborter');
}

function goOffline() {
	this.addAfter('cache', 'aborter', this._aborter);
}

function isOnline() {
	return this.getHandler('aborter') == null;
}

root.rslite.cache = {
	install: function(pipeline, options) {
		pipeline._aborter = new Aborter();

		pipeline.goOnline = goOnline.bind(pipeline);
		pipeline.goOffline = goOffline.bind(pipeline);
		pipeline.isOnline = isOnline.bind(pipeline);

		pipeline.addBefore("requestBuilder", "cache", new CacheHandler());
	}
};

root.rslite.handlers.Cache = CacheHandler;

return {
	install: root.rslite.cache.install,
	handler: root.rslite.handlers.Cache
};

}).call(this, this);