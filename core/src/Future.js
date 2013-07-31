function Future() {
	this._errorBacks = [];
	this._thenBacks = [];
	this._progressBacks = [];

	this._resolve = this._resolve.bind(this);
	this._fail = this._fail.bind(this);
	this._progress = this._progress.bind(this);

	this._completed = false;
}

Future.prototype = {
	complete: function(cb) {
		if (this._completed)
			cb.apply(null, this._finalArguments)
		else
			this._thenBacks.push(cb);
	},

	error: function(cb) {
		if (this._completed)
			cb.apply(null, this._finalArguments);
		else
			this._errorBacks.push(cb);
	},

	progress: function(cb) {
		if (!this._completed)
			this._progressBacks.push(cb);
	},

	_resolveLater: function(future) {
		future.complete(this._resolve);
		future.error(this._fail);
		future.progress(this._progress);
	},

	_resolve: function() {
		if (this._completed)
			throw "Future already completed";

		var finalArguments = this._finalArguments = arguments;
		this._completed = true;

		this._thenBacks.forEach(function(cb) {
			cb.apply(null, finalArguments);
		});

		this._clearCallbacks();
	},

	_fail: function() {
		if (this._completed)
			throw "Future already completed";

		var finalArguments = this._finalArguments = arguments;
		this._completed = true;

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

rslite.Future = Future;
