// TODO: we need to specify behavior for multiple resolutions...
(function(root) {
function Future(resolutions) {
	this._resolutions = resolutions || 1;
	this._errorBacks = [];
	this._thenBacks = [];
	this._progressBacks = [];
	this._error = false;

	this._resolve = this._resolve.bind(this);
	this._fail = this._fail.bind(this);
	this._progress = this._progress.bind(this);
}

Future.prototype = {
	_completed: function() {
		return this._resolutions == 0;
	},

	complete: function(cb) {
		if (this._completed())
			if (!this._error)
				cb.apply(null, this._finalArguments)
		else
			this._thenBacks.push(cb);
	},

	error: function(cb) {
		if (this._completed())
			if (this._error)
				cb.apply(null, this._finalArguments);
		else
			this._errorBacks.push(cb);
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

		this._thenBacks.forEach(function(cb) {
			cb.apply(null, finalArguments);
		});

		this._clearCallbacks();
	},

	_fail: function() {
		this._error = true;
		if (this._completed())
			throw "Future already completed";

		var finalArguments = this._finalArguments = arguments;
		this._resolutions -= 1;

		if (!this._completed()) return;

		this._errorBacks.forEach(function(cb) {
			cb.apply(null, finalArguments);
		});

		this._clearCallbacks();
	},

	_progress: function() {
		var args = arguments;
		this._progressBacks.forEach(function(cb) {
			cb.apply(null, args);
		});
	},

	_clearCallbacks: function() {
		this._errorBacks = [];
		this._thenBacks = [];
		this._progressBacks = [];
	}
};

root.rslite.Future = Future;

}).call(this, this);