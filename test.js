var Translator = require('./translator.js');
var translator = new Translator('pl_PL', 'en_EN');

var messages = {
    "Yes" : "Tak",
    "No" : "Nie",
    "Horses count": "]-Inf,0] Jest %count% koni|{1} Jest %count% koń|[2,5[ Są %count% konie|[5,Inf[ Jest %count% koni"
};

translator.loadCatalogue(messages);
var a = translator.transChoice("Horses count", 3);
var b = translator.trans("Yes");
console.log(a, b);