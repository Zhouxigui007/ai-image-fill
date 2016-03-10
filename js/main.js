/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

var csInterface = new CSInterface();
var clipped = true;
var placeholderCount = 0;
var loadedCount = 0;
var flickrURL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search';
var unsplashURL = 'https://api.unsplash.com/photos/search/';
var keys = {
  'flickr' : {
    'api_key': '2cc172fe2157ff04daeee6e8b69b7ee4'
  },
  'unsplash' : {
    'client_id': 'e1f612e4aea133cb275034e76c57b5d2e8ab17b1c2bbb367fd2fd96cc3376b96'
  }
}

// Reloads extension panel
var menuXML = '<Menu> \
  <MenuItem Id="reloadPanel" Label="Reload Panel" Enabled="true" Checked="false"/> \
  <MenuItem Id="debugPanel" Label="Debug" Enabled="true" Checked="false"/> \
</Menu>';

csInterface.setPanelFlyoutMenu(menuXML, flyoutMenuCallback);
csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", flyoutMenuCallback);
var debugPanel = false;
function flyoutMenuCallback(event){
  if (event.type === "com.adobe.csxs.events.flyoutMenuClicked") {
    if(event.data.menuId == 'reloadPanel'){
      location.reload();
    }else if(event.data.menuId == 'debugPanel'){
      debugPanel = !debugPanel;
      csInterface.updatePanelMenuItem("Debug", true, debugPanel);
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
    if(debugPanel){
      $('#output').append(url);
    }
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
          'path': downloadedFile,
          'clipped': clipped
        }
        var stringified = $.stringify(data);
        csInterface.evalScript("$.addRemoteItems("+stringified+")");

        loadedCount ++;
        if(loadedCount >= placeholderCount - 1){
          $('#output').empty();
        }

      }
    };
    xhr.send();
  };

  function addImageToPlaceholder(url){
    var n = cleanFileName(url);
    downloadAndOpenInIllustrator(url, n);
  }

  function searchFlickr(tags){
    loadedCount = 0;
    clipped = $('#clip').prop('checked');
    if(debugPanel){
      $('#output').append(tags);
    }
    csInterface.evalScript("app.activeDocument.selection.length;", function(selectionLength){
      if(selectionLength && selectionLength != 0){
        csInterface.evalScript("$.getPlaceholders();");
        $('#output').html('Requesting '+selectionLength+' Flickr Image(s)');
        var page = Math.random() * 20 >> 0 + 1;
        var data = {
          'api_key': keys.flickr.api_key,
          'format': 'json',
          'text': tags || 'kitten',
          'sort': 'interestingness-desc',
          'per_page': selectionLength,
          'page': page,
          'nojsoncallback': 1,
          'media': 'photos',
          'orientation':'square',
          'content_type': 7,
          'parse_tags': 1
        }
        var request = {
          'url': flickrURL,
          'data': data,
          'dataType': "json",
          'success': function(response){
            var count = response.photos.photo.length;
            placeholderCount = count;
            $('#output').html('Downloading '+count);
            var html = '';
            _.each(response.photos.photo, function(photo){
              var src = 'https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg'
              addImageToPlaceholder(src);
              html += src + '<br>';
            });
            if(debugPanel){
              $('#output').append(this.url+'<br>'+html+'<br>'+JSON.stringify(response));
            }
          },
          'error': function(response){
            $('#output').html(this.url+'<br>'+'<code>error: <br>' + JSON.stringify(response));
          }
        }
        $.ajax(request);

      }else {
        csInterface.evalScript("alert('Select at least one placeholder')");
      }
    });
  }

  function searchUnsplash(query){
    loadedCount = 0;
    clipped = $('#clip').prop('checked');
    if(debugPanel){
      $('#output').append(query);
    }
    csInterface.evalScript("app.activeDocument.selection.length;", function(selectionLength){
      if(selectionLength && selectionLength != 0){
        csInterface.evalScript("$.getPlaceholders();");
        $('#output').html('Requesting '+selectionLength+' Unsplash Image(s)');

        var data = {
          'client_id': keys.unsplash.client_id,
          'query': query || 'kittens',
          'per_page': selectionLength,
          'page': 1
        }
        var request = {
          'url': unsplashURL,
          'data': data,
          'dataType': "json",
          'success': function(response){
            var count = response.length;
            placeholderCount = count;
            $('#output').html('Downloading '+count);
            var html = '';
            _.each(response, function(photo){
              // var src = 'https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg'
              var src = photo.urls.thumb;
              src = src.replace('w=200&fit=max', 'w=500&h=500&fit=crop');
              addImageToPlaceholder(src);
              html += src + '<br>';
            });
            if(debugPanel){
              $('#output').append(this.url+'<br>'+html+'<br>'+JSON.stringify(response));
            }
          },
          'error': function(response){
            $('#output').html(this.url+'<br>'+'<code>error: <br>' + JSON.stringify(response));
          }
        }
        $.ajax(request);

      }else {
        csInterface.evalScript("alert('Select at least one placeholder')");
      }
    });
  }




  $('#flickr-search-btn').on('click', function(){
    var tags = $.trim($('#search-input').val());
    if(tags.length == 0){
      tags = 'kittens';
    }
    searchFlickr(tags);
  });
  $('#unsplash-search-btn').on('click', function(){
    var tags = $.trim($('#search-input').val());
    if(tags.length == 0){
      tags = 'kittens';
    }
    searchUnsplash(tags);
  });

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