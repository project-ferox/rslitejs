(function(root) {

function semaphore(count, cb) {
	return function() {
		--count;
		if (count == 0)
			cb.apply(null, arguments);
		else if (count < 0)
			throw "Semaphore decremented past 0";
	};
}

root.rslite.semaphore = semaphore;

}).call(this, this);