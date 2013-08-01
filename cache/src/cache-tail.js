
};

if (typeof define == 'function' && define.amd) {
	define(['rslite'], function(rslite) {
		return init.call({rslite: rslite}, {rslite: rslite});
	});
} else {
	init.call(this, this);
}

}).call(this, this);