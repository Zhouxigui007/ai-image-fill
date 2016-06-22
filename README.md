# ai-image-fill
Simple Adobe Illustrator Panel to generate placeholder image content from Flickr or Unsplash
![image](https://cloud.githubusercontent.com/assets/444309/13677314/5f96db08-e6b7-11e5-9f07-f279ccaf8091.png)

## Installation
Adobe doesn't make this very straightforward, and I've never had much success packaging and signing extensions. 

#### 1. Download repo, unzip and move folder into the extensions folder
[Download](https://github.com/majman/ai-image-fill/archive/master.zip)

**Win:** `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions`  
**Mac:** `/Library/Application Support/Adobe/CEP/extensions`

or

**Win:** `C:\<username>\AppData\Roaming\Adobe\CEP\extensions`  
**Mac:** `~/Library/Application Support/Adobe/CEP/extensions`

*you may have to create folder if it doesn't already exist*

#### 2. Set PlayerDebugMode to 1

**Win:** `regedit > HKEY_CURRENT_USER/Software/Adobe/CSXS.7`,  
then add a new entry PlayerDebugMode of type "string" with the value of "1".

**Mac:** In the terminal, type: `defaults write com.adobe.CSXS.7 PlayerDebugMode 1`  
(The plist is also located at /Users/USERNAME/Library/Preferences/com.adobe.CSXS.7.plist)

**May require restart or log-out/in**

[More info here: Adobe CEP Cookbok Repo](https://github.com/Adobe-CEP/CEP-Resources/wiki/CEP-6-HTML-Extension-Cookbook-for-CC-2015#where-are-the-extensions)
