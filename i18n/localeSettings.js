var locale = (window.navigator.languages) ? window.navigator.languages[0]
              : (window.navigator.userLanguage||window.navigator.language);//gets user's preffered language as dictated in settings
var supportedLocales = ['en','en-US','es-ES', 'fr-FR'];
var defaultLocale = 'en';
var localeScript = document.createElement("script");
localeScript.type = "application/javascript";
var scriptName ="modules/i18n/wip-";
//locale = 'te-st';
if(!supportedLocales.includes(locale)){
  if(supportedLocales.includes(locale.substring(2))){
    //set to generic locale e.g. en-US becomes en
      scriptName += locale.substring(2) + ".js";
  } else{
      scriptName += defaultLocale + ".js";
  }
} else{
  scriptName += locale + ".js";
}
localeScript.src = scriptName.toLowerCase();
document.body.appendChild(localeScript);
