// TODO: determine the various status codes and dispatch replies appropriately.
// e.g., to error / abort / whatever.
function EventTarget(xhr, delegate, callbacks) {
	this._xhr = xhr;

	this._progressBacks = [];
	this._errorBacks = [];
	this._thenBacks = [];

	delegate.onload = callbacks.onload.bind(this);

	delegate.onabort =
	delegate.onerror = 
	delegate.ontimeout = callbacks.onerror.bind(this);

	delegate.onprogress = callbacks.onprogress.bind(this);
}

var standardCallbacks = {
	onload: function() {
		var data;

		if (typeof this._xhr.response != 'string') {
			data = this._xhr.response;
		} else if (this._xhr.getResponseHeader('content-type').indexOf('application/json') == 0) {
			data = JSON.parse(this._xhr.response);
		} else {
			data = this._xhr.response;
		}

		this._thenBacks.forEach(function(cb) {
			cb(data, this._xhr);
		}, this);
	},

	onprogress: function(e) {
		this._progressBacks.forEach(function(cb) {
			cb(e);
		});
	},

	onerror: function(e) {
		this._errorBacks.forEach(function(cb) {
			cb(e);
		});
	}
};

var uploadCallbacks = Object.create(standardCallbacks);
uploadCallbacks.onload = function() {
	this._thenBacks.forEach(function(cb) {
		cb(null, this._xhr);
	}, this);
};


function RequestHandler(xhr) {
	EventTarget.call(this, xhr, xhr, standardCallbacks);
	this.upload = new EventTarget(xhr, xhr.upload, uploadCallbacks);
}

RequestHandler.prototype = {
	cancel: function() {
		this._xhr.abort();
		return this;
	},

	complete: function(cb, ecb) {
		if (cb != null)
			this._thenBacks.push(cb);
		if (ecb != null)
			this._errorBacks.push(ecb);
	},

	error: function(cb) {
		this._errorBacks.push(cb);
	},

	progress: function(cb) {
		this._progressBacks.push(cb);
	}
};

function createXhr() {
	return window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
}