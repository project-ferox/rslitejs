
// TODO: determine the various status codes and dispatch requests appropriately.
// TODO: check content-type header and convert content appropriately.
function RequestHandler(xhr) {
	this._xhr = xhr;

	xhr.onload = handlerCallbacks.onload.bind(this);
	xhr.upload.onabort = xhr.onabort =
		xhr.upload.onerror = xhr.onerror = 
			xhr.ontimeout = handlerCallbacks.onerror.bind(this);

	xhr.onprogress = handlerCallbacks.onprogress.bind(this);
	xhr.upload.onprogress = handlerCallbacks.uploadProgress.bind(this);

	this._progressBacks = [];
	this._errorBacks = [];
	this._thenBacks = [];
	this._uploadProgressBacks = [];
}

var handlerCallbacks = {
	onload: function() {
		this._thenBacks.forEach(function(cb) {
			var data;

			if (typeof this._xhr.response != 'string') {
				data = this._xhr.response;
			} else if (this._xhr.getResponseHeader('content-type').indexOf('application/json') == 0) {
				data = JSON.parse(this._xhr.response);
			} else {
				data = this._xhr.response;
			}

			cb(data, this._xhr);
		}, this);
	},

	onprogress: function(e) {
		this._progressBacks.forEach(function(cb) {
			cb(e);
		});
	},

	uploadProgress: function(e) {
		this._uploadProgressBacks.forEach(function(cb) {
			cb(e);
		});
	},

	onerror: function(e) {
		this._errorBacks.forEach(function(cb) {
			cb(e);
		});
	}
};

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
	},

	uploadProgress: function(cb) {
		this._uploadProgressBacks.push(cb);
	}
};

function createXhr() {
	return window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
}