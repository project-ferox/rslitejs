(function(root) {

function Future() {
	
}

function errOpen() {
	this._openPending = undefined;
}

function succOpen() {
	this._openPending = false;
}

function Cache() {
	var openReq = indexedDB.open("rslite-cache");
	openReq.onerror = errOpen.bind(this);
	openReq.onsuccess = succOpen.bind(this);

	this._openPending = true;
}

function CacheHandler() {
	// use indexedDB as the cache.
	this._cache = new Cache();
	this._queue = [];
}

CacheHandler.prototype = {
	setToken: function(ctx, token) { return ctx.next(token); },
	get: function(ctx, path, responseType, forceUpdate) {
		if (this._cache._openPending) {
			var self = this;
			var future = new Future();

			this._queue.push({ 
				future: future,
				func: function() {
					return self.get(ctx, path, responseType, forceUpdate);
				}
			});

			return future;
		}

		var future = new Future();
		var self = this;
		this._cache.get(path, function(resource, err) {
			if (resource == self._cache.miss) {
				future.resolveLater(ctx.next(path, responseType));
			} else {
				future.resolve(resource);
			}
		});

		return future;
		//return ctx.next(path, responseType);
	},

	put: function(ctx, path, data, extraHeaders, cacheOnly) {
		return ctx.next(path, data, extraHeaders)
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
		pipeline.goOffline = goOffline;
		pipeline.goOnline = goOnline;
		pipeline._aborter = new Aborter();

		pipeline.goOnline = goOnline.bind(pipeline);
		pipeline.goOffline = goOffline.bind(pipeline);

		pipeline.addBefore("requestBuilder", new CacheHandler());
	}
};

}).call(this, this);