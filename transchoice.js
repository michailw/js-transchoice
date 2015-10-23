var languages = ['pl_PL', 'en_US', 'en_GB'];


define('translator',
    [],
    function () {
        function Translator() {
            this.defaultLanguage = null;
            this.fallbackLanguage = null;

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
                    if(!this.catalogues[catalogue][messages[i]]){
                        this.catalogues[catalogue][messages[i]] = {};
                    }
                    this.catalogues[catalogue][messages[i]][language] = messages[i];
                }
            }
            this.catalogues[catalogue] = messages;

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

        Translator.prototype.trans = function(message, variables, catalogue, language){
            if(!language){
                language = this.defaultLanguage;
            }
            if(!catalogue){
                catalogue = 'default';
            }
            if(this.catalogues[catalogue][language][message]){
                message = this.catalogues[catalogue][language][message];
                if(variables){
                    for(var i in variables){
                        if(variables.hasOwnProperty(i) && i!='length'){
                            message = message.replace('%'+i+'%', variables[i]);
                        }
                    }
                }
            }
            return message;
        };

        return new Translator();
    });