
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
		if (typeof data == 'object' && !(data instanceof Blob || 
			data instanceof ArrayBuffer ||
			data instanceof File ||
			data instanceof FormData ||
			data instanceof Document ||
			data instanceof ArrayBufferView)) {
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