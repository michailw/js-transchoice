if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {

        function Translator(defaultLanguage, fallbackLanguage) {
            this.defaultLanguage = defaultLanguage;
            this.fallbackLanguage = fallbackLanguage;

            if(!this.defaultLanguage || !this.fallbackLanguage){
                throw "You have to set languages";
            }

            this.catalogues = {
                default: {}
            };
        };

        Translator.prototype._getDefaultLanguage = function(){
            if(this.defaultLanguage){
                return this.defaultLanguage;
            } else if(this.fallbackLanguage){
                return this.fallbackLanguage;
            }
            throw "You have to set languages";
        };

        Translator.prototype._getFallbackLanguage = function(){
            if(this.fallbackLanguage){
                return this.fallbackLanguage;
            }
            throw "You have to set languages";
        };

        Translator.prototype.loadCatalogue = function(messages, language, catalogue){
            if(!language){
                language = this._getDefaultLanguage();
            }
            if(!catalogue){
                catalogue = 'default';
            }
            for(var i in messages){
                if(messages.hasOwnProperty(i) && i!='length'){
                    if(!this.catalogues[catalogue][i]){
                        this.catalogues[catalogue][i] = {};
                    }
                    this.catalogues[catalogue][i][language] = messages[i];
                }
            }
        };

        Translator.prototype.setMessage = function(message, catalogue, language){
            if(!catalogue){
                catalogue = 'default';
            }
            if(!language){
                language = this._getDefaultLanguage();
            }
            if(!this.catalogues[catalogue][message]){
                this.catalogues[catalogue][message] = {};
            }
            this.catalogues[catalogue][message][language] = message;
        };

        Translator.prototype.deleteMessage = function(message, catalogue, language){
            if(!catalogue){
                catalogue = 'default';
            }
            if(this.catalogues[catalogue] && this.catalogues[catalogue][message]) {
                if (language) {
                    if (this.catalogues[catalogue][message][language]) {
                        delete this.catalogues[catalogue][message][language];
                    }
                } else {
                    delete this.catalogues[catalogue][message];
                }
            }
        };

        Translator.prototype._getMessage = function(message, catalogue, language){
            if(!language){
                language = this._getDefaultLanguage();
            }
            if(!catalogue){
                catalogue = 'default';
            }

            if(this.catalogues[catalogue][message][language]){
                message = this.catalogues[catalogue][message][language];
            } else if(
                Translator.mainLanguage(language)
                && this.catalogues[catalogue][message][Translator.mainLanguage(language)]
            ){
                message = this.catalogues[catalogue][message][Translator.mainLanguage(language)];
            } else if(this.catalogues[catalogue][message][this._getDefaultLanguage()]){
                message = this.catalogues[catalogue][message][this._getDefaultLanguage()];
            } else if(this.catalogues[catalogue][message][this._getFallbackLanguage()]){
                message = this.catalogues[catalogue][message][this._getFallbackLanguage()];
            }
            return message;
        };

        Translator.mainLanguage = function(language){
            var mainLanguage = language.split('_');
            if(mainLanguage.length){
                mainLanguage = mainLanguage[0];
            } else {
                mainLanguage = false;
            }
            return mainLanguage;
        };

        Translator.prototype.trans = function(message, variables, catalogue, language){
            message = this._getMessage(message, catalogue, language);
            if(variables){
                for(var i in variables){
                    if(variables.hasOwnProperty(i) && i!='length'){
                        message = message.replace('%'+i+'%', variables[i]);
                    }
                }
            }
            return message;
        };

        Translator.prototype.transChoice = function(message, variable, catalogue, language){
            var messages = this._getMessage(message, catalogue, language);
            messages = messages.split('|');
            var range;
            var rangeRegex = /(\{|\[|\])([0-9]+|-Inf),?([0-9]+|Inf)?(\}|\[|\])\s(.*)/gi;
            var found = false;

            for(var i in messages){
                if(messages.hasOwnProperty(i) && i!='length'){
                    message = messages[i];
                    while ((range = rangeRegex.exec(message)) !== null) {
                        if (range.index === rangeRegex.lastIndex) {
                            rangeRegex.lastIndex++;
                        }
                        var openBr = range[1];
                        var closeBr = range[4]
                        var firstNr = range[2];
                        var secondNr = range[3];

                        var middleOk = openBr=='{' && closeBr=='}' && firstNr==variable;
                        var leftOK = (firstNr=='-Inf' || (openBr=='[' ? firstNr<=variable : firstNr<variable));
                        var rightOK = (secondNr=='Inf' || (closeBr==']' ? secondNr>=variable : secondNr>variable));

                        if(middleOk || (leftOK && rightOK)){
                            found = true;
                            message = range[5];
                            break;
                        }
                    }
                    if(found){
                        break;
                    }
                }
            }
            return this.replaceMessage(message, variable);
        };

        Translator.prototype.pluralize = function(message, variable, catalogue, language){
            var messages = this._getMessage(message, catalogue, language);
            if(typeof messages === 'string'){
                return this.transChoice(message, variable, catalogue, language);
            }
            if(!language){
                language = this._getDefaultLanguage();
            }

            var pluralCondition = Translator.getPluralCondition(language);

            var index = pluralCondition(variable);
            if(messages[index]){
                message = messages[index];
                return this.replaceMessage(message, variable);
            }
            throw "There is not "+index+" message in '"+message+"'";
        };

        Translator.prototype.replaceMessage = function(message, variables){
            if(
                Object.prototype.toString.call( variables ) === '[object Array]'
                || (typeof variables === "object" && !Array.isArray(variables))
            ) {
                var regexp;
                for(var i in variables){
                    if(variables.hasOwnProperty(i) && i!='length'){
                        regexp = new RegExp("%"+i+"%");
                        message = message.replace(regexp, variables[i]);
                    }
                }
            } else {
                message = message.replace(/%count%/, variables);
            }
            return message;
        };

        Translator.setPluralConditions = function(conditions){
            for(var i in conditions){
                if(conditions.hasOwnProperty(i) && i!='length'){
                    Translator._pluralConditions[i] = conditions[i];
                }
            }
        };

        Translator.setPluralCondition = function(language, condition){
            Translator._pluralConditions[language] = condition;
        };

        Translator.deletePluralCondition = function(language){
            if(language){
                if(Translator._pluralConditions[language]){
                    delete Translator._pluralConditions[language];
                }
            } else {
                Translator._pluralConditions = {};
            }
        };

        Translator.getPluralCondition = function(language){
            if(Translator._pluralConditions[language]){
                return Translator._pluralConditions[language];
            } else if(Translator._pluralConditions[Translator.mainLanguage(language)]){
                return Translator._pluralConditions[Translator.mainLanguage(language)];
            }
            throw "There is not plural condition for language "+language+" or "+Translator.mainLanguage(language);
        };

        Translator._pluralConditions = {
            "en": function(n){return (n != 1);},
            "de": function(n){return (n != 1);},
            "fr": function(n){return (n > 1);},
            "pl": function(n){return (n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);},
            "ua": function(n){return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);},
            "rm": function(n){ return (n != 1);},
            "ro": function(n){ return (n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2);},
            "ru": function(n){ return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);}
        };

        return Translator;
    }
);