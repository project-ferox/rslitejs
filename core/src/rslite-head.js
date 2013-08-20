(function(root) {
var empty = function() {};
var File = root.File || empty;
var Blob = root.Blob || empty;
var FormData = root.FormData || empty;
var Document = root.Document || empty;
var ArrayBufferView = root.ArrayBufferView || empty;


var rslite = function(endpoint, user) {
	if (!user)
		throw "Must specify a user";

	var pipeline = createPipeline(['setToken', 'get', 'put', 'delete']);

	pipeline.endpoint = endpoint + '/' + user;
	pipeline.addLast('requestBuilder', new RequestBuilder(pipeline.endpoint));
	pipeline.addLast('requestSender', new RequestSender());
	pipeline.user = user;

	return pipeline;
};

root.rslite = rslite;

root.rslite.utils = {};
rslite.utils.treatAsJson = function(data) {
	return typeof data == 'object' && !(data instanceof Blob || 
			data instanceof ArrayBuffer ||
			data instanceof File ||
			data instanceof FormData ||
			data instanceof Document ||
			data instanceof ArrayBufferView)
};

var localStoragePrefix = 'rslCache';
root.rslite.localStoragePrefix = localStoragePrefix;