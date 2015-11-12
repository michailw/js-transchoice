if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {
        var Translator = require('./translator.js');

        function Exporter(sourceLanguage, destinationLanguage) {
            this.sourceLanguage = sourceLanguage;
            this.destinationLanguage = destinationLanguage;

            if(!this.sourceLanguage || !this.destinationLanguage){
                throw "You have to set languages";
            }

            this.catalogues = {
                default: {}
            };
        };

        Exporter.prototype._getDefaultLanguage = function(){
            if(this.destinationLanguage){
                return this.destinationLanguage;
            }
            throw "You have to set languages";
        };

        Exporter.prototype._getSourceLanguage = function(){
            if(this.sourceLanguage){
                return this.sourceLanguage;
            }
            throw "You have to set languages";
        };

        Exporter.prototype.loadCatalogue = Translator.prototype.loadCatalogue;

    Exporter.prototype.xliff = function(){
        var builder = require('xmlbuilder');
        //xliff
        var xliff = builder.create('xliff');
        xliff.att('xmlns', 'urn:oasis:names:tc:xliff:document:2.0');
        xliff.att('version', '2.0');
        xliff.att('srcLang', this._getSourceLanguage());
        xliff.att('trgLang', this._getDefaultLanguage());

        console.log(xliff.end({ pretty: true}));
    };

        return Exporter;
    }
);