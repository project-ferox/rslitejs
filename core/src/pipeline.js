
function PipeContext(handlers, nextMehod, end, args) {
	this._handlers = handlers;
	this._next = nextMehod;
	this._end = end;

	this._args = Array.prototype.slice.call(args, 0);
	this._args.unshift(this);
	this._i = 0;
}

PipeContext.prototype = {
	next: function() {
		return this._next.apply(this, this._args);
	},

	_nextHandler: function() {
		if (this._i >= this._handlers.length) return end;

		var handler = this._handlers[this._i];
		this._i += 1;
		return handler;
	}
};

function createPipeline(pipedMethodNames) {
	var end = {};
	var endStubFunc = function() { return end; };
	var nextMethods = {};

	function Pipeline() {
		this._handlers = [];
		this._contextCtor = PipeContext;
		this._nextMethods = nextMethods;
		this.end = end;
	}

	var pipelineProto = Pipeline.prototype = {
		addHandler: function(handler) {
			this._handlers.push(handler);
		}
	};

	pipedMethodNames.forEach(function(name) {
		end[name] = endStubFunc;

		nextMethods[name] = new Function(
			"var handler = this._nextHandler();" +
			"return handler." + name + ".apply(handler, arguments);");

		pipelineProto[name] = new Function(
			"var ctx = new this._contextCtor(this._handlers, this._nextMethods." + name + ", this.end, arguments);"
			+ "return ctx.next();");
	});

	return new Pipeline();
}
