
$.runScriptFromInput = function(options) {
    try {
        runScriptFromInput(options);
        testObject.a ++;
        dispatchCEPEvent("My Custom Event", 'runScriptFromInput');
    }catch (e){
        alert(e);
    }

    return "complete";
}

function runScriptFromInput(str){
    var script = bridgeTalkEncode(str);
    var scriptDecoded = decodeURI(script);
    eval(scriptDecoded);
}


function runScriptFromFile(file){
    var sf = file;

    if(!(file instanceof File)){
        sf = File(file);
    }
    if(!sf.exists){
        alert("Sorry, it appears that this script file cannot be located at '"+decodeURI(sf.toString())+"'");
        return;
    }
    sf.open('r');
    var scriptString = sf.read().replace("#target illustrator",'');
    sf.close();

    // Thanks to: https://forums.adobe.com/thread/287506?tstart=0
    var pathToScript = "var ScriptPanel_MyLocation = '"+sf.fsName+"';";
    var script = "var scp ='" + bridgeTalkEncode(pathToScript+"\r"+scriptString) + "'";

    script += ";\nvar scpDecoded = decodeURI( scp );\n";
    script += "eval( scpDecoded );";

    var bt = new BridgeTalk();
    bt.target = 'illustrator';
    bt.body = script;
    bt.onError = function(errObj){
        alert(errObj.body);
    }
    bt.send();
}
function bridgeTalkEncode( txt ) {
    txt = encodeURIComponent( txt );
    txt = txt.replace( /\r/, "%0d" );
    txt = txt.replace( /\n/, "%0a" );
    txt = txt.replace( /\\/, "%5c" );
    txt = txt.replace(/'/g, "%27");
    return txt.replace(/"/g, "%22");
}

function selectScriptFile(){
    var fileMatch = function(f){
        return f instanceof Folder || (f instanceof File && f.displayName.match(/(\.js$|\.jsx$)/));
    };
    var dataFile = File.openDialog("Choose a Script", fileMatch);
    if(dataFile != null){
        dataFile  = File(dataFile.fsName.replace("file://", ""));
        runScriptFromFile(dataFile);
    }
}

function stringify(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
    } else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n];
            t = typeof(v);
            if (obj.hasOwnProperty(n)) {
                if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = stringify(v);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
}

var addRemoteItems = function(data) {
    try {
        var sel = app.activeDocument.selection;
        var placeholder = sel.pop();
        var placedItem = activeDocument.activeLayer.placedItems.add();
        placedItem.file = new File(data.path);
        var w = placedItem.width;
        var h = placedItem.height;
        var r = 1;
        if(w > h){
            placedItem.height = placeholder.height;
            placedItem.width = w * placeholder.height/h;
        }else {
            placedItem.width = placeholder.width;
            placedItem.height = h * placeholder.width/w;
        }
        // placedItem.width = placeholder.width;
        // placedItem.height = placeholder.height;
        placedItem.top = placeholder.top;
        placedItem.left = placeholder.left;
        placedItem.embed();
        app.activeDocument.selection = sel;
    }catch(e){
        alert(e);
    }
}
