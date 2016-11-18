// Best effort to gets user's preferred language translations as dictated in browser settings.
// This implements two stage fallback to the default language resource or fall through if no default.properties exists.
// Given a region specific request, e.g. 'fr-CA', the code attempts to get the region specific properties.
// If the region specific resource does not exist, the code falls back and attempts to get a language properties resource, e.g. 'fr'.
// If that fails, the code falls back to the default properties resource.
// In general, we should provide language keyed resources. And only provide region specific resources when absolutely necessary.
// Region specific resources override the base language properties to save size. If en-GB is requested and found, a call for en is made.
// If en is found, the properties are parsed into a JS object, then the the en-GB overrides are merged.
// That way if a Swiss user knows we handle French for Canada, he has a decent chance of handling French in general.
// Though not necessarily Swiss French (fr-CH).

var locale = (window.navigator.languages) ? window.navigator.languages[0] :
    (window.navigator.userLanguage || window.navigator.language);

    locale = locale.toLowerCase();
var defaultScript = 'modules/i18n/default.properties',
    scriptName = defaultScript.replace("default", locale),
    localeRegion = locale.split('-'),
    xmlhttp = new XMLHttpRequest(),
    requestedLocale = locale,
    regionalOverrides = "",
    localeData = {};

// Handle callback
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        // Failed to find preferred locale properties file
        if (xmlhttp.status === 404) {
            // I've fallen and I can't get up...
            // No default.properties, just restore and drop through. UI should show defaults or keys
            if (locale == 'default') {
                localeData['currentLocale'] = locale;
                console.log('All fallbacks failed for requested locale: ' + requestedLocale);
            } else {
                // if locale was language-region, first fallback to just language. i.e. fr-CA -> fr
                // make sure to prevent infinite loop with second locale clause
                if (localeRegion.length > 1 && locale != localeRegion[0]) {
                    locale = localeRegion[0];
                    scriptName = defaultScript.replace("default", localeRegion[0]);
                    xmlhttp.open("GET", scriptName, true);
                    xmlhttp.send();
                } else {
                    // Second fallback to default.properties
                    locale = 'default'
                    scriptName = defaultScript;
                    xmlhttp.open("GET", scriptName, true);
                    xmlhttp.send();
                }
            }
        } else { // Successful requests
            if (locale == 'default') {
                localeData = parseProperties(xmlhttp.responseText, {'currentLocale': 'default'});
                localeData['currentLocale'] = locale;
            } else {
                // language-region request
                if (localeRegion.length > 1 && regionalOverrides == "") {
                    regionalOverrides = xmlhttp.responseText; // keep override strings
                    // Get base language
                    scriptName = defaultScript.replace("default", localeRegion[0]);
                    xmlhttp.open("GET", scriptName, true);
                    xmlhttp.send();
                } else {
                    localeData = parseProperties(xmlhttp.responseText, {'currentLocale': locale});
                    if (regionalOverrides != "") {
                        localeData = parseProperties(regionalOverrides, localeData);
                    }
                    localeData['currentLocale'] = locale;
                }
            }
            if (localeData) {
              console.log('Using localizations with locale = ' + localeData['currentLocale']);
            }
        }
    }
};
// First try to get the preferred locale properties file
xmlhttp.open("GET", scriptName, true);
xmlhttp.send();

// Allow for merge by adding propertiesObj
function parseProperties(properties, propertiesObj) {
    var keyValuePairs = properties.split(/$/m);
    keyValuePairs.forEach(function(line) {
        var entry = line.split("=");
        if (entry[0] && entry[1]) {
            propertiesObj[entry[0].trim()] = entry[1].trim();
        }
    });
    return propertiesObj;
}
