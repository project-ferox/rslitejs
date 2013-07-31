
function RequestBuilder(endpoint) {
	this._token = null;
	this._endpoint = endpoint;
}

RequestBuilder.prototype = {
	/**
	If token is provided then all XHR requests will have
	the token added to the Authorization header, otherwise
	the token is assumed to be encoded and passed by some other
	means that is outside the scope of rslite.
	*/
	setToken: function(ctx, token) {
		this._token = token;

		return ctx.next(token);
	},

	/**
	Issues a get request for the specified path.
	*/
	get: function(ctx, path, options) {
		var xhr = createXhr();
		var handler = new RequestHandler(xhr);

		xhr.open('GET', this._endpoint + '/' + path);
		if (options && options.responseType)
			xhr.responseType = options.responseType;
		
		this._addToken(xhr);
		ctx.handler = handler;

		return ctx.next(path, options);
	},

	/**
	Perform an upsert
	*/
	put: function(ctx, path, data, options) {
		var xhr = createXhr();
		var handler = new RequestHandler(xhr);

		xhr.open('PUT', this._endpoint + '/' + path);
		this._addToken(xhr);

		ctx.handler = handler;
		return ctx.next(path, data, options);
	},

	/**
	Perform a delete
	*/
	delete: function(ctx, path) {
		var xhr = createXhr();
		var handler = new RequestHandler(xhr);

		xhr.open('DELETE', this._endpoint + '/' + path);
		this._addToken(xhr);

		ctx.handler = handler;

		return ctx.next(path);
	},

	_addToken: function(xhr) {
		if (this._token != null)
			xhr.setRequestHeader('Authorization', 'Bearer ' + this._token);
	}
};