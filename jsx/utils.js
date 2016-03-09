var placeholders;

$.addRemoteItems = function(data) {
    addRemoteItems(data);
}

$.getPlaceholders = function() {
    placeholders = app.activeDocument.selection;
}

function addRemoteItems(data) {

    try {
        var cgroup = activeDocument.activeLayer;
        if(data.clipped){
            cgroup = activeDocument.activeLayer.groupItems.add();
        }

        var placeholder = placeholders.pop();
        var placedItem = cgroup.placedItems.add();
        placedItem.file = new File(data.path);
        var w = placedItem.width;
        var h = placedItem.height;

        var dx = 0;
        var dy = 0;

        if(w > h){
            placedItem.height = placeholder.height;
            placedItem.width = w * placeholder.height/h;
            dx = (placedItem.width - placeholder.width)/2 >> 0;
        }else {
            placedItem.width = placeholder.width;
            placedItem.height = h * placeholder.width/w;
            dy = (placedItem.height - placeholder.height)/2 >> 0;
        }

        placedItem.top = placeholder.top + dy;
        placedItem.left = placeholder.left - dx;
        placedItem.embed();

        // clip
        if(data.clipped){
            var cmask = placeholder.duplicate(cgroup, ElementPlacement.INSIDE);
            cmask.clipping = true;
            cgroup.clipped = true;
        }
    }catch(e){
        alert(e);
    }
}
