function Aborter() {}

// TODO: make sure the aborter errors are the same as
// the errors you'd get from the RequestHandler.
Aborter.prototype = {
	setToken: function(ctx, token) {
		return ctx.next(token);
	},

	get: function() {
		var future = new Future();
		future._fail({type: 'offline'}, null);

		return future;
	},

	put: function() {
		var future = new Future();
		future.upload = new Future();

		future._fail({type: 'offline'}, null);
		future.upload._fail({type: 'offline'}, null);

		return future;
	},

	delete: function() {
		var future = new Future();
		future._fail({type: 'offline'}, null);

		return future;
	}
};