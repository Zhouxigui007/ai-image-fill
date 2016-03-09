# ai-flickr-fill
Simple Adobe Illustrator Panel to generate placeholder image content from Flickr

#### Download and copy folder into the shared extensions folder on disk:

**Win:** `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions`  
**Mac:** `/Library/Application Support/Adobe/CEP/extensions`

or

**Win:** `C:\<username>\AppData\Roaming\Adobe\CEP\extensions`  
**Mac:** `~/Library/Application Support/Adobe/CEP/extensions`

*you may have to create folder if it doesn't already exist*

#### Set `PlayerDebugMode` to 1

**Win:** regedit > HKEY_CURRENT_USER/Software/Adobe/CSXS.6, then add a new entry PlayerDebugMode of type "string" with the value of "1".  
**Mac:** In the terminal, type: defaults write com.adobe.CSXS.6 PlayerDebugMode 1 (The plist is also located at /Users/USERNAME/Library/Preferences/com.adobe.CSXS.6.plist)

[More info here: Adobe CEP Cookbok Repo](https://github.com/Adobe-CEP/CEP-Resources/wiki/CEP-6-HTML-Extension-Cookbook-for-CC-2015#where-are-the-extensions)
