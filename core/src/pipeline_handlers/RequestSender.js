
function RequestSender() {

}

RequestSender.prototype = {
	setToken: function() {},
	
	get: function(ctx, path) {
		ctx.handler._xhr.send();

		return ctx.handler;
	},

	put: function(ctx, path, data, options) {
		// TODO: add additional headers
		if (options)
			var headers = options.headers;
		if (root.rslite.utils.treatAsJson(data)) {
			data = JSON.stringify(data);

			if (!headers || !('content-type' in headers))
				ctx.handler._xhr.setRequestHeader('Content-Type', 'application/json');
		}

		
		if (headers) {
			for (var header in headers) {
				ctx.handler._xhr.setRequestHeader(header, headers[header]);
			}
		}

		ctx.handler._xhr.send(data);

		return ctx.handler;
	},

	delete: function(ctx, path) {
		ctx.handler._xhr.send();

		return ctx.handler;
	}
};