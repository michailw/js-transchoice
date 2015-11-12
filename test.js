var Translator = require('./src/translator.js');
var translator = new Translator('en_EN', 'pl_PL');

var messages = {
    "Yes" : "Tak",
    "No" : "Nie",
    "Horses count": "]-Inf,0] Jest %count% koni|{1} Jest %count% koń|[2,5[ Są %count% konie|[5,Inf[ Jest %count% koni",
    "Pigs count": [
        "Jest %count% świnia",
        "Są %count% świnie",
        "Jest %count% świni"
    ]
};

translator.loadCatalogue(messages);
var a = [];
a.push(translator.pluralize("Horses count", 0));
a.push(translator.pluralize("Pigs count", 1));
a.push(translator.pluralize("Pigs count", 2));
a.push(translator.pluralize("Pigs count", 3));
a.push(translator.pluralize("Pigs count", 83));
console.log(a);

var Exporter = require('./src/export.js');
var exporter = new Exporter('pl_PL', 'en_EN');
exporter.loadCatalogue(messages);
exporter.xliff();