
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

var nextMethodNames = ['setToken', 'get', 'put', 'delete'];

PipeContext.END = {};
var endStubFunc = function() { return PipeContext.END; };

var obj = PipeContext.END;
var nextMethods = {};

function Pipeline() {
	this._handlers = [];
	this._contextCtor = PipeContext;
	this._nextMethods = nextMethods;
}

var pipelineProto = Pipeline.prototype = {
	addHandler: function(handler) {
		this._handlers.push(handler);
	}
};

nextMethodNames.forEach(function(name) {
	obj[name] = endStubFunc;

	nextMethods[name] = new Function(
		"var handler = this._nextHandler();" +
		"return handler." + name + ".apply(handler, arguments);");

	pipelineProto[name] = new Function(
		"var ctx = new this._contextCtor(this._handlers, this._nextMethods." + name + ", arguments);"
		+ "return ctx.next();");
});
