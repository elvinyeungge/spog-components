
//gets user's preferred language as dictated in settings
var locale = (window.navigator.languages) ? window.navigator.languages[0]
              : (window.navigator.userLanguage || window.navigator.language);

var defaultScript = 'modules/i18n/default.properties',
    scriptName = defaultScript.replace("default", locale),
    xmlhttp = new XMLHttpRequest(),
    localeData;

// Handle callback
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == XMLHttpRequest.DONE) {
    // Failed to find preferred locale properties file
    if (xmlhttp.status === 404) {
      scriptName = defaultScript;
      xmlhttp.open("GET", defaultScript, true);
      xmlhttp.send();
    } else {
      // Success with preferred locale
      localeData = parseProperties(xmlhttp.responseText);
      localeData['currentLocale'] = locale;
      console.log('Localized using ' + scriptName);
    }
  }
};
// First try to get the preferred locale properties file
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
