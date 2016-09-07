var locale = (window.navigator.languages) ? window.navigator.languages[0]
              : (window.navigator.userLanguage||window.navigator.language);//gets user's preffered language as dictated in settings
var supportedLocales = ['en','en-US','es-ES', 'fr-FR'];
var defaultScript = 'modules/i18n/default.properties';
var scriptName ="modules/i18n/";
//locale = 'te-st';
if(!supportedLocales.includes(locale)){
  if(supportedLocales.includes(locale.substring(2))){
    //set to generic locale e.g. en-US becomes en
      locale = locale.substring(0,2);
  } else{
      scriptName = defaultScript;
  }
}
scriptName += locale;
scriptName = scriptName.toLowerCase();
scriptName +=  ".properties";

var localeData;
var xmlhttp =  new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if(xmlhttp.readyState == XMLHttpRequest.DONE){
    if(xmlhttp.status === 404){
      scriptName = defaultScript;
      xmlhttp.open("GET",scriptName,true);
      xmlhttp.send();
    } else{
      localeData = parseProperties(xmlhttp.responseText);
      localeData['currentLocale'] = locale;
      // console.log(properties);
    }
  }
};
xmlhttp.open("GET", scriptName, true);
xmlhttp.send();




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
