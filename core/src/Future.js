// TODO: we need to specify behavior for multiple resolutions...
(function(root) {

function Callbacks() {
	this._thenBacks = [];
	this._errorBacks = [];
}

Callbacks.prototype = {
	complete: function(cb) {
		this._thenBacks.push(cb);
	},

	error: function(cb) {
		this._errorBacks.push(cb);
	}
};

function CallbacksList() {
	this._callbacks = [];
	this._callbacks.push(new Callbacks());
}

CallbacksList.prototype = {
	complete: function(cursor, cb) {
		var callbacks = this._getCallbacks(cursor);
		callbacks.complete(cb);
	},

	error: function(cursor, cb) {
		var callbacks = this._getCallbacks(cursor);
		callbacks.error(cb);
	},

	thenBacks: function(cursor) {
		var cbs = this._callbacks[cursor];
		return cbs ? cbs._thenBacks : [];
	},

	errorBacks: function(cursor) {
		var cbs = this._callbacks[cursor];
		return cbs ? cbs._errorBacks : [];
	},

	clearBacks: function(cursor) {
		delete this._callbacks[cursor];
	},

	_getCallbacks: function(cursor) {
		var callbacks = this._callbacks[cursor];
		if (!callbacks) {
			callbacks = new Callbacks();
			this._callbacks[cursor] = callbacks;
		}

		return callbacks;
	},

	size: function() {
		return this._callbacks.length;
	}
};

function CallbacksPointer(cursor, callbacksList) {
	this._cursor = cursor;
	this._callbacksList = callbacksList;

	this.complete = this.complete.bind(this);
	this.error = this.error.bind(this);
}

CallbacksPointer.prototype = {
	complete: function(cb, ecb) {
		if (cb)
			this._callbacksList.complete(this._cursor, cb);
		if (ecb)
			this._callbacksList.error(this._cursor, ecb);

		return new CallbacksPointer(this._cursor + 1, this._callbacksList);
	},

	error: function(cb) {
		this._callbacksList.error(this._cursor, cb);
		return new CallbacksPointer(this._cursor + 1, this._callbacksList);
	}
};

function CallbackNotifier(cursor, callbacksList) {
	this._cursor = cursor;
	this._callbacksList = callbacksList;
}

CallbackNotifier.prototype = {
	// TODO: clear cbs
	resolved: function(args) {
		var thenBacks = this._callbacksList.thenBacks(this._cursor);
		this._notify(thenBacks, args);
		this._callbacksList.clearBacks(this._cursor);
	},

	failed: function(args) {
		var errorBacks = this._callbacksList.errorBacks(this._cursor);
		this._notify(errorBacks, args);
		this._callbacksList.clearBacks(this._cursor);
	},

	_notify: function(backs, args) {
		var canAddMore = this._cursor + 1 < this._callbacksList.size();
		backs.forEach(function(cb) {
			var result = cb.apply(null, args);
			if (result instanceof Future && true) {
				result._addNotifier(new CallbackNotifier(this._cursor + 1, this._callbacksList));
			}
		}, this);
	}
}

function Future(resolutions) {
	this._resolutions = resolutions || 1;
	this._progressBacks = [];
	this._error = false;

	this._callbacksList = new CallbacksList();
	this._notifiers = [];
	this._notifiers.push(new CallbackNotifier(0, this._callbacksList));
	this._callbacksPointer = new CallbacksPointer(0, this._callbacksList);

	this._resolve = this._resolve.bind(this);
	this._fail = this._fail.bind(this);
	this._progress = this._progress.bind(this);
}

Future.prototype = {
	_completed: function() {
		return this._resolutions == 0;
	},

	complete: function(cb, ecb) {
		var result = this._callbacksPointer.complete(cb, ecb);

		if (this._completed()) {
			if (cb && !this._error)
				this._notifyResolved();

			if (ecb && this._error)
				this._notifyFailed();
		}

		return result;
	},

	_addNotifier: function() {
		this._notifiers.push(new CallbackNotifier(1, this._callbacksList));
	},

	error: function(cb) {
		var result = this._callbacksPointer.error(cb);

		if (this._completed && this._error) {
			this._notifyFailed();
		}

		return result;
	},

	progress: function(cb) {
		if (!this._completed())
			this._progressBacks.push(cb);
	},

	_resolveLater: function(future) {
		future.complete(this._resolve);
		future.error(this._fail);
		future.progress(this._progress);
	},

	_resolve: function() {
		if (this._completed())
			throw "Future already completed";
		var finalArguments = this._finalArguments = arguments;
		this._resolutions -= 1;

		if (!this._completed()) return;

		this._notifyResolved();
	},

	_fail: function() {
		this._error = true;
		if (this._completed())
			throw "Future already completed";

		var finalArguments = this._finalArguments = arguments;
		this._resolutions -= 1;

		if (!this._completed()) return;

		this._notifyFailed();
	},

	_notifyResolved: function() {
		this._notifiers.forEach(function(notifier) {
			notifier.resolved(this._finalArguments);
		}, this);
	},

	_notifyFailed: function() {
		this._notifiers.forEach(function(notifier) {
			notifier.failed(this._finalArguments);
		}, this);
	},

	_progress: function() {
		var args = arguments;
		this._progressBacks.forEach(function(cb) {
			cb.apply(null, args);
		});
	}
};

root.rslite.Future = Future;

}).call(this, this);