(function(root) {
var empty = function() {};
var File = root.File || empty;
var Blob = root.Blob || empty;
var FormData = root.FormData || empty;
var Document = root.Document || empty;
var ArrayBufferView = root.ArrayBufferView || empty;


var rslite = function(endpoint) {
	var pipeline = createPipeline(['setToken', 'get', 'put', 'delete']);

	pipeline.addLast('requestBuilder', new RequestBuilder(endpoint));
	pipeline.addLast('requestSender', new RequestSender());

	return pipeline;
};
