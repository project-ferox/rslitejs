
function RequestSender() {

}

RequestSender.prototype = {
	setToken: function() {},
	
	get: function(ctx, path) {
		ctx.handler._xhr.send();

		return ctx.handler;
	},

	put: function(ctx, path) {
		ctx.handler._xhr.send(ctx.data);

		return ctx.handler;
	}
};