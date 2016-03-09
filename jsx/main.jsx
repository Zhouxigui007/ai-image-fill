#include "underscore.js";
#include "json2.js";
#include "utils.js";

var actDoc;
var selectedObjects;


// load xLib
try {
	var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
} catch (e) {
	alert(e);
}

function dispatchCEPEvent(_type, _data) {
	if (xLib) {
		var eventObj = new CSXSEvent();
		eventObj.type = _type;
		eventObj.data = _data;
		eventObj.dispatch();
	}
}

$.runScriptFromFile = function(options) {
	// alert('runScriptFromFile '+options);

	runScriptFromFile(scriptFolderPath+'/'+options);
	dispatchCEPEvent("My Custom Event", 'runScriptFromFile');
	return "complete";
}

$.addRemoteItems = function(data) {
	// alert(data);
	addRemoteItems(data);
}

