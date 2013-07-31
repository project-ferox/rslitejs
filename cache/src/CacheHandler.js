(function(root) {

function CacheHandler() {
	// use indexedDB as the cache.
	// TODO: more sensible to have the cache handle the queueing?
	this._queue = [];
	this._cache = new root.rslite.priv.Cache(this._processQueue.bind(this));
}

CacheHandler.prototype = {
	setToken: function(ctx, token) { return ctx.next(token); },
	get: function(ctx, path, options) {
		if (this._cache._openPending) {
			var self = this;
			var future = new Future();

			this._queue.push(function() {
				future._resolveLater(self.get(ctx, path, options));
			});

			return future;
		}

		var future = new Future();
		var self = this;
		var fullPath = ctx.pipeline.endpoint + '/' + path;
		this._cache.get(fullPath, function(resource, err) {
			if (resource == Cache.MISS || err != null) {
				console.log("Couldn't use the cache. " + err);
				future._resolveLater(ctx.next(path, options));
			} else if (err == null) {
				future._resolve(resource);
			}
		}, options);

		return future;
		//return ctx.next(path, responseType);
	},

	put: function(ctx, path, data, options) {
		if (!options || !options.bypassCache) {
			if (this._cache._openPending) {
				var self = this;
				this._queue.push(function() {
					self._cache.put(path, data, options);
				});
			} else {
				var fullPath = ctx.pipeline.endpoint + '/' + path;
				this._cache.put(fullPath, data, options);
			}
		}

		return ctx.next(path, data, options)
	},

	delete: function(ctx, path, options) {
		if (!options || !options.retainCached) {
			var fullPath = ctx.pipeline.endpoint + '/' + path;
			this._cache.delete(fullPath, options);
		}

		return ctx.next(path, options);
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
		pipeline._aborter = new root.rslite.handlers.Aborter();

		pipeline.goOnline = goOnline.bind(pipeline);
		pipeline.goOffline = goOffline.bind(pipeline);

		pipeline.addBefore("requestBuilder", "cache", new CacheHandler());
	}
};

root.rslite.handlers.Cache = CacheHandler;

}).call(this, this);