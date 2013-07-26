
function RequestSender() {

}

RequestSender.prototype = {
	setToken: function() {},
	
	get: function(ctx, path) {
		ctx.handler._xhr.send();

		return ctx.handler;
	},

	put: function(ctx, path) {
		// TODO: add additional headers
		var data = ctx.data;
		if (typeof data == 'object' && !(data instanceof Blob || 
			data instanceof ArrayBuffer ||
			data instanceof File ||
			data instanceof FormData ||
			data instanceof Document ||
			data instanceof ArrayBufferView)) {
			data = JSON.stringify(data);
		}

		ctx.handler._xhr.send(data);

		return ctx.handler;
	},

	delete: function(ctx, path) {
		ctx.handler._xhr.send();

		return ctx.handler;
	}
};