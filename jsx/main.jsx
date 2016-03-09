#include "underscore.js";
#include "json2.js";
#include "utils.js";

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
