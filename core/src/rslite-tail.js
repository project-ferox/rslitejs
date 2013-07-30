
	var rslite = function(endpoint) {
		var pipeline = createPipeline(['setToken', 'get', 'put', 'delete']);

		pipeline.addLast('requestBuilder', new RequestBuilder(endpoint));
		pipeline.addLast('requestSender', new RequestSender());

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
}).call(this, this);