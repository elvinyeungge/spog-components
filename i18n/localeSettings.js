var locale = (window.navigator.languages) ? window.navigator.languages[0]
              : (window.navigator.userLanguage||window.navigator.language);//gets user's preffered language as dictated in settings
var defaultScript = 'modules/i18n/default.properties';
var language = locale.split("-")[0];
var target = locale;

var localeData;
var xmlhttp =  new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if(xmlhttp.readyState == XMLHttpRequest.DONE){
    if(xmlhttp.status === 404){
      target = (target == language) ? 'default' : language;
      xmlhttp.open("GET",getScriptName(target),true);
      xmlhttp.send();
    } else{
      localeData = parseProperties(xmlhttp.responseText);
      localeData['currentLocale'] = locale;
      console.log('Localized using ' + getScriptName(target));
    }
  }
};
if(!localeData){
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
