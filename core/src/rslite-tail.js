
	var rslite = function(endpoint) {
		var pipeline = new Pipeline();

		pipeline.addHandler(new RequestBuilder(endpoint));
		pipeline.addHandler(new RequestSender());

		/*
		*/

		return pipeline;
	};

	if (typeof define === 'function' && define.amd) {
		define(rslite);
	} else if (typeof exports === "object") {
		module.exports = rslite;
	} else {
		root.rslite = rslite;
	}
})(this);