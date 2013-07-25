
function PipeContext(handlers, nextMehod, args) {
	this._handlers = handlers;
	this._next = nextMehod;

	this._args = Array.prototype.slice.call(args, 0);
	this._args.unshift(this);
	this._i = 0;
}

PipeContext.prototype = {
	next: function() {
		return this._next.apply(this, this._args);
	},

	_nextHandler: function() {
		if (this._i >= this._handlers.length) return PipeContext.END;

		var handler = this._handlers[this._i];
		this._i += 1;
		return handler;
	}
};

// TODO: we could technically auto-generate the code for all of this.

PipeContext.END = {
	setToken: function() { return PipeContext.END; },
	get: function() { return PipeContext.END; },
	put: function() { return PipeContext.END; },
	delete: function() { return PipeContext.END; }
};

var nextMethods = {
	setToken: function() {
		var handler = this._nextHandler();

		return handler.setToken.apply(handler, arguments);
	},

	get: function() {
		var handler = this._nextHandler();

		return handler.get.apply(handler, arguments);
	},

	put: function() {
		var handler = this._nextHandler();

		return handler.get.apply(handler, arguments);
	},

	delete: function() {
		var handler = this._nextHandler();

		return handler.delete.apply(handler, arguments);
	}
};



function Pipeline() {
	this._handlers = [];
}

Pipeline.prototype = {
	setToken: function() {
		var ctx = new PipeContext(this._handlers, nextMethods.setToken, arguments);
		return ctx.next();
	},

	get: function() {
		var ctx = new PipeContext(this._handlers, nextMethods.get, arguments);
		return ctx.next();
	},

	put: function() {
		var ctx = new PipeContext(this._handlers, nextMethods.put, arguments);
		return ctx.next();
	},

	delete: function() {
		var ctx = new PipeContext(this._handlers, nextMethods.delete, arguments);
		return ctx.next();
	},

	addHandler: function(handler) {
		this._handlers.push(handler);
	}
};