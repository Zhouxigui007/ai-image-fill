/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

var csInterface = new CSInterface();
var message = '';

// Reloads extension panel
var menuXML = '<Menu> \
  <MenuItem Id="reloadPanel" Label="Reload Panel" Enabled="true" Checked="false"/> \
</Menu>';

csInterface.setPanelFlyoutMenu(menuXML, flyoutMenuCallback);
csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", flyoutMenuCallback);
function flyoutMenuCallback(event){
  if (event.type === "com.adobe.csxs.events.flyoutMenuClicked") {
    if(event.data.menuId == 'reloadPanel'){
      location.reload();
    }
  }
}

// Loads / executes a jsx file
function loadJSXFile(pPath) {
  var scriptPath = csInterface.getSystemPath(SystemPath.EXTENSION) + pPath;
  try {
    csInterface.evalScript('$._ext.evalFile("' + scriptPath + '")');
  }catch(e){
    alert('error '+e);
  }
}

function init() {
  csInterface.addEventListener("My Custom Event", function(e) {
    var dataType = typeof(e.data);
    var str = '';
    if(dataType == "object"){
      if(e.data.type == 'listScripts'){
        addScripts(e.data);
      }else {
        str = JSON.stringify(e.data);
      }
    }else {
      str = e.data;
    }
    $("#output").html("<br>" + str);
  });



  themeManager.init();
  loadJSXFile("/jsx/main.jsx");

  // remote assets
  var cleanFileName = function(name) {
    name = name.split(' ').join('-');
    return name.replace(/\W/g, '');
  };

  var createTempFolder = function() {
    var tempFolderName = 'remoteImages/';
    var tempFolder;
    tempFolder = '/tmp/' + tempFolderName;


    if (window.navigator.platform.toLowerCase().indexOf('win') > -1) {
    tempFolder = csInterface.getSystemPath(SystemPath.USER_DATA) + '/../Local/Temp/' + tempFolderName;
    }
    window.cep.fs.makedir(tempFolder);
    return tempFolder;
  };

  var downloadAndOpenInIllustrator = function(url, name) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      if (this.status == 200 || this.status == 304) {
        var uInt8Array = new Uint8Array(this.response);
        var i = uInt8Array.length;
        var binaryString = new Array(i);
        while (i--)
          binaryString[i] = String.fromCharCode(uInt8Array[i]);

        var imgData = binaryString.join('');
        var base64 = window.btoa(imgData);
        var downloadedFile = createTempFolder() + name + '.jpg';

        window.cep.fs.writeFile(downloadedFile, base64, cep.encoding.Base64);

        var data = {
          'path': downloadedFile
        }
        var stringified = $.stringify(data);
        csInterface.evalScript("$.addRemoteItems("+stringified+")");
      }
    };
    xhr.send();
  };

  function addImageToPlaceholder(url){
    var n = cleanFileName(url);
    downloadAndOpenInIllustrator(url, n);
  }

  var keys = {
    'flickr' : {
      'api_key': 'e54c45ed6c52a5f6871bf8b4dd959902'
    }
  }
  var flickrURL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search';

  function searchFlickr(tags){
    csInterface.evalScript("app.activeDocument.selection.length;", function(selectionLength){
      if(selectionLength){
        var data = {
          'api_key': keys.flickr.api_key,
          'format': 'json',
          'tags': tags || 'kitten',
          'sort': 'interestingness-desc',
          'per_page': selectionLength,
          'page': Math.random() * 5 >> 0,
          'nojsoncallback': 1,
          'content_type': 1,
          'media': 'photos',
          'orientation':'square'
        }
        var request = {
          'url': flickrURL,
          'data': data,
          'dataType': "json",
          'success': function(response){
            var count = response.photos.photo.length;
            var html = '';
            _.each(response.photos.photo, function(photo){
              var src = 'https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg'
              addImageToPlaceholder(src);
              html += '<img src="'+src+'" width="100"/>';
            });
          },
          'error': function(response){
            $('#output').html('<code>error: <br>' + JSON.stringify(response));
          }
        }
        $.ajax(request);

      }
    });
  }

  $('#flickr-search-btn').on('click', function(){
    var tags = $.trim($('#flickr-tags').val());
    if(tags.length == 0){
      tags = 'kittens';
    }
    searchFlickr(tags);
  })

}


var relativePath;
if(csInterface && csInterface.evalScript){
  csInterface.evalScript("app.activeDocument.path;", function(cbResult){
    relativePath = cbResult;
  });
}

jQuery.extend({
  stringify : function stringify(obj) {
    if ("JSON" in window) {
      return JSON.stringify(obj);
    }
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
          if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.stringify(v);
          json.push((arr ? "" : '"' + n + '":') + String(v));
        }
      }
      return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
  }
});

init();
