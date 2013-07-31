	rslite.handlers = {
		Aborter: Aborter,
		RequestBuilder: RequestBuilder,
		RequestSender: RequestSender
	};

	if (typeof define === 'function' && define.amd) {
		define('rslite', rslite);
	} else if (typeof exports === "object") {
		module.exports = rslite;
	} else {
		root.rslite = rslite;
	}
}).call(this, this);