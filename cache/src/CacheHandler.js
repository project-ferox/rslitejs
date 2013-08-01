(function(root) {
var Future = root.rslite.Future;
var Aborter = root.rslite.handlers.Aborter;
var Cache = root.rslite.priv.Cache;

function CacheHandler() {
	// use indexedDB as the cache.
	// TODO: more sensible to have the cache handle the queueing?
	this._queue = [];
	this._cache = new Cache(this._processQueue.bind(this));
}

CacheHandler.prototype = {
	setToken: function(ctx, token) { return ctx.next(token); },
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
			this._cache.get(fullPath, function(resource, err) {
				if (resource == Cache.MISS || err != null) {
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
		if (!options || !options.bypassCache) {
			if (this._cache._openPending) {
				var self = this;
				var future = new Future();
				this._queue.push(function() {
					future._resolveLater(self._cache.put(path, data, options));
				});

				return future;
			}

			var future = new Future(2);
			var fullPath = ctx.pipeline.endpoint + '/' + path;
			this._cache.put(fullPath, data, function(err) {
				if (!err)
					future._resolve();
				else
					future._fail(err);
			}, options);
		}

		var handler = ctx.next(path, data, options);

		if (future) {
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

	refresh: function(paths) {

	},

	purge: function(paths) {
		this._cache.purge(paths);
	},

	push: function(paths) {

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

root.rslite.cache = {
	install: function(pipeline, options) {
		pipeline._aborter = new Aborter();

		pipeline.goOnline = goOnline.bind(pipeline);
		pipeline.goOffline = goOffline.bind(pipeline);

		pipeline.addBefore("requestBuilder", "cache", new CacheHandler());
	}
};

root.rslite.handlers.Cache = CacheHandler;

}).call(this, this);