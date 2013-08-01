function Aborter() {}

Aborter.OFFLINE = {};

// TODO: make sure the aborter errors are the same as
// the errors you'd get from the RequestHandler.
Aborter.prototype = {
	setToken: function(ctx, token) {
		return ctx.next(token);
	},

	get: function() {
		var future = new root.rslite.Future();
		future._resolve(Aborter.OFFLINE);

		return future;
	},

	put: function() {
		var future = new root.rslite.Future();
		future.upload = new root.rslite.Future();

		future._resolve(Aborter.OFFLINE);
		future.upload._resolve(Aborter.OFFLINE);

		return future;
	},

	delete: function() {
		var future = new root.rslite.Future();
		future._resolve(Aborter.OFFLINE);

		return future;
	}
};