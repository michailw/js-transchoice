if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {

        function Translator(defaultLanguage, fallbackLanguage) {
            this.defaultLanguage = defaultLanguage;
            this.fallbackLanguage = fallbackLanguage;

            this.catalogues = {
                default: {}
            };
        };

        Translator.prototype.loadCatalogue = function(messages, language, catalogue){
            if(!language){
                language = this.defaultLanguage;
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

        Translator.prototype.setMessage = function(message, catalogue){
            if(!catalogue){
                catalogue = 'default';
            }
            this.catalogues[catalogue][message] = message;
        };

        Translator.prototype.deleteMessage = function(message, catalogue){
            if(!catalogue){
                catalogue = 'default';
            }
            delete this.catalogues[catalogue][message];
        };

        Translator.prototype._getMessage = function(message, catalogue, language){
            if(!language){
                language = this.defaultLanguage;
            }
            if(!catalogue){
                catalogue = 'default';
            }

            if(this.catalogues[catalogue][message][language]){
                message = this.catalogues[catalogue][message][language];
            } else if(this.catalogues[catalogue][message][this.defaultLanguage]){
                message = this.catalogues[catalogue][message][this.defaultLanguage];
            } else if(this.catalogues[catalogue][message][this.fallbackLanguage]){
                message = this.catalogues[catalogue][message][this.fallbackLanguage];
            }
            return message;
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
            return message.replace('%count%', variable);
        };

        return Translator;
    }
);