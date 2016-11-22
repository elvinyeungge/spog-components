window.localeData = window.localeData || (function() {
    "use strict";

    window.localeData = {};

var locale = (window.navigator.languages) ? window.navigator.languages[0]
              : (window.navigator.userLanguage||window.navigator.language);//gets user's preffered language as dictated in settings
var defaultScript = 'modules/i18n/default.properties';
var language = locale.split("-")[0];
var target = locale;

var xmlhttp =  new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  window.localeData = window.localeData || {};
  if(xmlhttp.readyState == XMLHttpRequest.DONE){
    if(xmlhttp.status === 404){
      target = (target == language) ? 'default' : language;
      xmlhttp.open("GET",getScriptName(target),true);
      xmlhttp.send();
    } else{
      window.localeData = parseProperties(xmlhttp.responseText);
      window.localeData['currentLocale'] = locale;
      console.log('Localized using ' + getScriptName(target));
    }
  }
};
if(Object.keys(window.localeData).length === 0){
  xmlhttp.open("GET", getScriptName(target), true);
  xmlhttp.send();
}


function getScriptName(file){
  return ('modules/i18n/' + file + '.properties').toLowerCase();
}

function parseProperties(properties){
  var keyValuePairs = properties.split(/$/m);
  var propertiesObj={};
  keyValuePairs.forEach(function(line){
    var entry = line.split("=");
    if(entry[0] && entry[1]){
      propertiesObj[entry[0].trim()] = entry[1].trim();
    }
  });
  return propertiesObj;
}

})();
