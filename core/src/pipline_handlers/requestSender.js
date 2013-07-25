function RequestSender() {

}

RequestSender.prototype = {
	setToken: function() {},
	
	get: function(ctx, path) {
		ctx.handler._xhr.send();

		return pipe.handler;
	},

	put: function(ctx, path) {
		ctx.handler._xhr.send(ctx.data);

		return pipe.handler;
	}
};