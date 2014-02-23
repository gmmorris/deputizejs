/**
 * @name deputize.js
 * @author Gidi Meir Morris, 2014
 * @version 0.1
 * 
 *
 * 
 */
(function (window,undefined) {
    'use strict';

    // Save the previous value of the `deputizer` variable.
    var conflictedDeputizer = window.Deputizer;

    /**
     * The top-level namespace
     * @namespace deputizerJS.
     */
    var Deputizer;

    var deputizerConfig = {
        /***
         * cache (boolean): Should responses be cached by default?
         */
        cache:true,
        /***
         * fresh (boolean): Should requests skip the cache by default?
         */
        fresh:false,
        /***
         * A callback to be called when an error occurs inside a deputy handler
         */
        onDeputyError:false

    };

    /***
     *
     */
    Deputizer = window.Deputizer = function(configuration){

        /**
         * Merge the specific configuration for this object with the global Deputizer configuration
         * so that we can inherit the defaults.
         */
        if(typeof configuration == 'object') {
            this.configuration = extendTopDown(configuration,deputizerConfig);
        } else if(configuration === undefined) {
            this.configuration = extendTopDown({},deputizerConfig);
        } else {
            throw new DeputizerError("Deputizer.constructor","Invalid configuration argument. Configuration is optional but must be an object, not a " + (typeof configuration));
        }

        // Current version of the utility.
        this.VERSION = '0.1.0';

        // A map of deputies by their key
        var deputyDefinitions = {};

        /***
         * Checks whether the Deputizer has an executor definition for the specified Unique ID
         * @param deputyUniqueID
         * @returns {boolean}
         */
        this.knows = function (deputyUniqueID) {
            if(typeof deputyUniqueID != 'string' || deputyUniqueID.trim() === '') {
                throw new DeputizerError("Deputizer.knows","An invalid Deputy Unique ID has been specified");
            }
            return (deputyDefinitions.hasOwnProperty(deputyUniqueID));
        };

        /***
         * Checks whether the Deputizer is currently executing a deputy with the specified Unique ID
         * @param deputyUniqueID
         * @returns {boolean}
         */
        this.isActive = function (deputyUniqueID) {
            if(typeof deputyUniqueID != 'string' || deputyUniqueID.trim() === '') {
                throw new DeputizerError("Deputizer.isActive","An invalid Deputy Unique ID has been specified");
            } else if(!deputyDefinitions.hasOwnProperty(deputyUniqueID)) {
                throw new DeputizerError("Deputizer.isActive","Deputizer doesn't have a definition for the ID " + deputyUniqueID);
            }
            return deputyDefinitions[deputyUniqueID].isActive;
        };


        this.define=function (deputyUniqueID, executor, context) {
            // check params
            if(typeof deputyUniqueID != 'string' || deputyUniqueID.trim() === '') {
                throw new DeputizerError("Deputizer.define","An invalid Deputy Unique ID has been specified");
            } else if(typeof executor != 'function') {
                throw new DeputizerError("Deputizer.define","An invalid executor has been specified - it must be a function");
            }

            // check if there already is a deputy with this ID and validate we can replace it
            if(deputyDefinitions.hasOwnProperty(deputyUniqueID)) {
                if(this.isActive(deputyUniqueID)) {
                    throw new DeputizerError("Deputizer.define","A deputy is already defined by the specified unique key and cannot be replaced as it is currently active.");
                }

                // remove the existing deputy
                delete deputyDefinitions[deputyUniqueID];
            }

            var deputy = deputyDefinitions[deputyUniqueID] = new Deputy(deputyUniqueID,executor,context,this);
            return deputy;
        };

        /***
         * Define a handler which executes everytime a fresh value is fetched for this deputy
         * @param success
         * @param failure
         * @param context
         * @returns {*}
         */
        this.when = function(deputyUniqueID,success,failure,context){
            if(typeof deputyUniqueID != 'string' || deputyUniqueID.trim() === '') {
                throw new DeputizerError("Deputizer.when","deputyUniqueID must be a string value.");
            } else if(!this.knows(deputyUniqueID)) {
                throw new DeputizerError("Deputizer.when","Deputizer doesn't have a definition for the ID " + deputyUniqueID);
            }

            deputyDefinitions[deputyUniqueID].when(success,failure,context);
            return this;
        };

        /***
         * Define a handler which executes only once
         * @param success
         * @param failure
         * @param context
         * @returns {*}
         */
        this.once = function(deputyUniqueID,success,failure,context){
            if(typeof deputyUniqueID != 'string' || deputyUniqueID.trim() === '') {
                throw new DeputizerError("Deputizer.once","deputyUniqueID must be a string value.");
            } else if(!this.knows(deputyUniqueID)) {
                throw new DeputizerError("Deputizer.once","Deputizer doesn't have a definition for the ID " + deputyUniqueID);
            }

            deputyDefinitions[deputyUniqueID].once(success,failure,context);
            return this;
        };

        // Alias Execute & Fetch, just so code looks more logical when refering to actions vs. data fetching
        this.execute = this.fetch = function(deputyUniqueID,fresh, success,failure,context){
            if(typeof deputyUniqueID != 'string' || deputyUniqueID.trim() === '') {
                throw new DeputizerError("Deputizer.do","deputyUniqueID must be a string value.");
            } else if(!this.knows(deputyUniqueID)) {
                throw new DeputizerError("Deputizer.do","Deputizer doesn't have a definition for the ID " + deputyUniqueID);
            }

            deputyDefinitions[deputyUniqueID].execute(fresh,success,failure,context);
            return this;
        };

        /***
         * FOR TESTING
         * */
        if(window && typeof window.deputizerTesting == 'boolean' && window.deputizerTesting) {
            this._deputies = deputyDefinitions;
        }

        return this;
    };

    /**
     * Revert the global window.Deputizer variable to it's original value and return this Deputizer object.
     * This allows users to include multiple versions of Deputizer objects on a single page or another global variable named "Deputizer".
     * @example
     <code><pre>
     Deputizer.noConflict();
     </pre></code>
     */
    Deputizer.noConflict = function () {
        window.Deputizer = conflictedDeputizer;
        return this;
    };

    /***
     * An error which takes place inside the Deputizer will always be a DeputizerError object
     * @type {Function}
     */
    var DeputizerError = Deputizer.Error = function(src,message,error){
        this.name = "DeputizerError";
        this.src = src;
        this.message = src + ":"+ message;
        this.error = error;
        return this;
    };
    DeputizerError.prototype = Error.prototype;

    /****
     * INTERNAL OBJECTS AND FUNCITONS
     */

    var HANDLERS_STICKY = 0;
    var HANDLERS_ONCE = 1;

    /***
     * A deputy describes a particular resource by it's string ID
     * @param RequestUniqueID (string) The unique ID for this deputy
     * @param executor (function) The callback that actually executes the deputy's logic
     * @param context (object | optional) An object to use asa context for the executor
     * @constructor
     */
    var Deputy = function(deputyUniqueID, executor, context,deputizer){
        if(typeof deputyUniqueID != 'string' || deputyUniqueID.trim() === '') {
            throw new DeputizerError("Deputizer [Deputy::constructor]","deputyUniqueID must be a string value.");
        }
        if(typeof executor != 'function') {
            throw new DeputizerError("Deputizer [Deputy::constructor]","executor must be a function.");
        }

        this.id = deputyUniqueID;
        this.deputizer = deputizer;
        this.executor = executor;
        this.context = context || window;

        // marker to be used when a deputy is active
        this.isActive = false;

        this.cache = null;

        this.handlers = [];
        var allHandlers = this.handlers[HANDLERS_STICKY] = [];
        var onceHandlers = this.handlers[HANDLERS_ONCE] = [];

        /***
         * Define a handler which executes everytime a fresh value is fetched for this deputy
         * @param success
         * @param failure
         * @param context
         * @returns {*}
         */
        this.when = function(success,failure,context){
            allHandlers.push(wrapHandler(success,failure,context));
            return this;
        };

        /***
         * Define a handler which executes only once
         * @param success
         * @param failure
         * @param context
         * @returns {*}
         */
        this.once = function(success,failure,context){
            onceHandlers.push(wrapHandler(success,failure,context));
            return this;
        };

        // Alias Execute & Fetch, just so code looks more logical when refering to actions vs. data fetching
        this.execute = this.fetch = function(fresh,success,failure,context){

            // check the arguments for the Do method
            var args = checkDoParams(fresh,success,failure,context,this.deputizer.configuration);

            // if a fresh value has been requested or no cache is available - execute
            var shouldExecute = (args.fresh || this.cache === null);

            if(args.success && !shouldExecute) {
                // use cache and call success
                args.success.apply(args.context,this.cache);
            } else if(shouldExecute) {
                if(args.success) {
                    // if this deputy is active just adding the specified callbacks as handler
                    // is enough as it will get called when the response arrives
                    this.once(args.success,args.failure,args.context);
                }
                if(!this.isActive) {
                    // not active? Set as active and call
                    this.isActive = true;

                    // call the executer with the specified context and two arguments - a success callback and a failure callback
                    this.executor.call(this.context,processResponse(this,'success'),processResponse(this,'failure'));

                }
            }
        };

        return this;
    };

    /***
     * A helper function which checks that the params for When and Once are valid
     * and wraps them in an object to be placed in the right handler queue
     * @param success
     * @param failure
     * @param context
     * @returns {{success: *, failure: *, context: *}}
     */
    var wrapHandler = function(success,failure,context){
        // success is mandatory and must be a function
        if(typeof success != 'function') {
            throw new DeputizerError("Deputizer [Deputy::when]","Success must be a function.");
        }
        // failure isn't mandatory and can be skipped
        // so if it isn't a function but rather an object we assume
        // it is supposed to be the context
        if(typeof failure != 'function') {
            if(typeof failure == 'object') {
                context = failure;
            }
            failure = false;
        }
        context = context || window;
        return {
            success:success,
            failure:failure,
            context: context
        };
    };

    /***
     * Internal code for checking the params sent to the do methos - moved here to clean up the code
     * @param fresh
     * @param success
     * @param failure
     * @param context
     * @param configuration
     * @returns {{fresh: *, success: *, failure: *, context: *}}
     */
    var checkDoParams = function(fresh,success,failure,context,configuration){
        // Fresh can be skipped while still specifying the success etc.
        // so we make sure the params are right
        if(typeof fresh != 'boolean') {
            if(typeof fresh == 'function') {
                context = failure;
                failure = success;
                success = fresh;
            }
            fresh = configuration.fresh;
        }
        // make sure the success argument is valid
        if(typeof success != 'function') {
            if(success === undefined) {
                success = false;
                context = false;
                failure = false;
            }
        } else {
            // make sure the failure argument isn't actually he context
            if(typeof failure != 'function') {
                context = failure;
                failure = false;
            }
            context = context || window;
        }

        if(typeof fresh != 'boolean') {
            throw new DeputizerError("Deputizer [internal]","A non boolean freshness has been specified.");
        }

        if(success !== false && context !== false) {
            // success is mandatory and must be a function
            if(typeof success != 'function') {
                throw new DeputizerError("Deputizer [internal]","Success must be a function.");
            }
        }

        return {
            fresh:fresh,
            success:success,
            failure:failure,
            context:context
        };
    };

    /***
     * Create a closure which knows a specific deputy and knows
     * to call all of that deputy's handlers of a specific type (success/failure)
     * @param deputy
     * @param type
     * @returns {Function}
     */
    var processResponse = function (deputy,type) {
        return function () {
            var responseArgs = Deputy.cache = arguments;

            var once = deputy.handlers[HANDLERS_ONCE];
            var all = deputy.handlers[HANDLERS_STICKY];

            var index = once.length,handler;
            while(index > 0) {
                // remove from handlers array, as these execute only once
                handler = once.shift();
                index--;
                if(typeof handler[type] == 'function') {
                    try {
                        handler[type].apply(handler[type].context,responseArgs);
                    } catch (o_O) {
                        // error thrown in deputy's handlers
                        if(typeof deputy.deputizer.configuration.onDeputyError == 'function') {
                            deputy.deputizer.configuration.onDeputyError(new DeputizerError('Deputy handler for "' + deputy.id + '"','Error ocured while a handler was being executed',o_O));
                        }
                    }
                }
            }

            for(index = 0;index < all.length;index++) {
                // remove from handlers array, as these execute only once
                handler = all[index];
                if(typeof handler[type] == 'function') {

                    try {
                        handler[type].apply(handler[type].context,responseArgs);
                    } catch (o_O) {
                        // error thrown in deputy's handlers
                        if(typeof deputy.deputizer.configuration.onDeputyError == 'function') {
                            deputy.deputizer.configuration.onDeputyError(new DeputizerError('Deputy handler for "' + deputy.id + '"','Error ocured while a handler was being executed',o_O));
                        }
                    }
                }
            }

            // no longer flagged as active
            deputy.isActive = false;
        };
    };


    /***
     * Borrowed from Underscore++ ( https://github.com/gmmorris/underscorepp ) as I didn't want to make birdwatcher dependant on Underscore++
     * ===========================
     * Merge objects in such a way that the preceding properties take precedence over the following properties.
     * This is similar to Underscore's extend method, but Underscore's extend method would give precedence to the following
     * properties, rather than the preceding ones.
     * @param obj (object) The object to extend
     * @param (objects) An unlimited number of parameters can be provided. Each parameter must be an object and it's properties
     *                  will be added to the first parameter (he object to be extended)
     * @returns {*}
     */
    var extendTopDown = function (obj) {
        /**
         * Cycle through the arguments from second to last and add their properties to
         * the first argument
         */
        for (var idx = 1; idx < arguments.length; idx++) {
            var objFrom = arguments[idx];
            if (typeof objFrom == 'object') {
                for (var prop in objFrom) {
                    if (objFrom.hasOwnProperty(prop) && !obj.hasOwnProperty(prop)) {
                        if(typeof objFrom[prop] == "function") {
                            // use a closure to call the function within the context of the object
                            // being extended
                            obj[prop] = rebindFunction(objFrom[prop],obj);
                        } else if(typeof objFrom[prop] == "object") {
                            // if this property is an object, then extend it using this method as well
                            obj[prop] = extendTopDown({},objFrom[prop]);
                        } else {
                            obj[prop] = objFrom[prop];
                        }
                    }
                }
            } else {
                throw new Error("Underscore++[extendTopDown method]: All parameters must be Objects, but parameter #" + (index+1) + " is of type " + typeof objFrom);
            }
        }
        return obj;
    };

    /***
     * FOR TESTING
     * */
    if(window && typeof window.deputizerTesting == 'boolean' && window.deputizerTesting) {
        Deputizer._defaults = deputizerConfig;
    }


})(this);