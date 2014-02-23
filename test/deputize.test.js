/**
 * @name TEST deputize.js
 * @author Gidi Morris (c) 2014
 * @version 0.0.1
 */


$(document).ready(function () {

    var shouldHaveBeenCalled = function(){
        // simply give an always true test to signify that this function has been called
        ok(true);
    };

    var shouldntHaveBeenCalled = function(){
        // simply give an always false test to signify that this function has been called
        // though it shouldn't have been
        ok(false);
    };

    var INDEX_OF_ONCE_HANDLERS = 1;
    var INDEX_OF_WHEN_HANDLERS = 0;


    module("Initialization", {
        setup: function() {
        },
        teardown: function() {
        }
    });

    test('global Deputizer object is on the Window object', function () {
        ok(typeof window.Deputizer == 'function');
    });

    test('A conflicting Deputizer can be removed from the window while reverting the original object', function () {
        // check that the current object is the Deputizer
        ok(typeof window.Deputizer == 'function');
        ok(typeof window.Deputizer == 'function' && window.Deputizer.noConflict instanceof Function);
        // remove it from the page
        window.copyOfDeputizer = window.Deputizer.noConflict();
        // check that it had been returned properly by noConflict
        ok(typeof window.copyOfDeputizer == 'function');
        /// check that the original object has been reverted
        ok(typeof window.Deputizer == 'object' && window.Deputizer.original);

        // revert for future tests
        window.Deputizer = window.copyOfDeputizer;
        delete window.copyOfDeputizer;
    });

    test('Has the knows/define/isActive/when/once/execute/fetch interface', function () {
        ok(typeof window.Deputizer == 'function');

        var deputizer = new Deputizer();
        ok(typeof deputizer.knows == 'function');
        ok(typeof deputizer.define == 'function');
        ok(typeof deputizer.isActive == 'function');
        ok(typeof deputizer.when == 'function');
        ok(typeof deputizer.once == 'function');
        ok(typeof deputizer.execute == 'function');
        ok(typeof deputizer.fetch == 'function');
        // fetch and execute are aliases
        ok(deputizer.fetch == deputizer.execute);
    });

    test('Can recieve a configuration override through the initializer', function () {
        var deputizer = new Deputizer({
            cache:false,
            fresh:true,
            onDeputyError:null
        });
        ok(!deputizer.configuration.cache);
        ok(deputizer.configuration.fresh);
        ok(deputizer.configuration.onDeputyError === null);
    });

    test('Only the specified config values will be overridden- other remain defaulted', function () {

        var defaults = Deputizer._defaults;

        var deputizer = new Deputizer({
            cache:false
        });
        ok(!deputizer.configuration.cache);
        ok(deputizer.configuration.fresh == defaults.fresh);
        ok(deputizer.configuration.onDeputyError == defaults.onDeputyError);
    });

    test('If no config is specified the defaults will be used', function () {

        var defaults = Deputizer._defaults;
        var deputizer = new Deputizer();

        ok(deputizer.configuration.cache == defaults.cache);
        ok(deputizer.configuration.fresh == defaults.fresh);
        ok(deputizer.configuration.onDeputyError == defaults.onDeputyError);
    });

    test('If a non object is sent on init an error is thrown', function () {

        throws(function(){
            var deputizer = new Deputizer(1);
        });
        throws(function(){
            var deputizer = new Deputizer(1.5);
        });
        throws(function(){
            var deputizer = new Deputizer(200);
        });
        throws(function(){
            var deputizer = new Deputizer(true);
        });
        throws(function(){
            var deputizer = new Deputizer(false);
        });
        throws(function(){
            var deputizer = new Deputizer(function(){

            });
        });
        throws(function(){
            var deputizer = new Deputizer(null);
        });
    });

    module("Defining a deputy", {
        setup: function() {
        },
        teardown: function() {
        }
    });

    test('When a deputy is defined it is added to the deputizer\'s definitions', function () {
        var deputizer = new Deputizer();

        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);
        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
    });

    test('When a deputy is defined with an existing name it is overriden in the deputizer\'s definitions', function () {
        var deputizer = new Deputizer();

        var DEPUTY_NAME = "NAME";
        var DEPUTY_ORIGINAL = function(){

        };
        var DEPUTY_REPLACEMENT = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY_ORIGINAL);
        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY_ORIGINAL);

        deputizer.define(DEPUTY_NAME,DEPUTY_REPLACEMENT);
        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY_REPLACEMENT);
    });

    test('When a deputy is defined it\'s context may also be provided', function () {
        var deputizer = new Deputizer();

        var DEPUTY_NAME = "NAME";
        var DEPUTY_CONTEXT = {};
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY,DEPUTY_CONTEXT);
        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY && deputizer._deputies[DEPUTY_NAME].context == DEPUTY_CONTEXT);

    });

    test('When a deputy is defined without a context the window is set as the context', function () {
        var deputizer = new Deputizer();

        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);
        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY && deputizer._deputies[DEPUTY_NAME].context == window);

    });

    test('When a deputy is defined on a specific deputizer, it doesn\'t get defined on any other deputizers', function () {
        var deputizer_1 = new Deputizer();

        var deputizer_2 = new Deputizer();

        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer_1.define(DEPUTY_NAME,DEPUTY);
        ok(typeof deputizer_1._deputies[DEPUTY_NAME] == "object" && deputizer_1._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(!deputizer_2._deputies.hasOwnProperty(DEPUTY_NAME) && deputizer_2._deputies[DEPUTY_NAME] == null);

    });

    module("Evaluating defined deputies", {
        setup: function() {
        },
        teardown: function() {
        }
    });
    test('When a deputy is defined it will become known to the deputizer', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);
        ok(deputizer.knows(DEPUTY_NAME));
    });
    test('When an undefined depity won\'t be known if not defined', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        ok(!deputizer.knows(DEPUTY_NAME));
    });
    test('When a deputy is defined it will become known only to that specific deputizer', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);
        var deputizer_2 = new Deputizer();

        ok(deputizer.knows(DEPUTY_NAME));
        ok(!deputizer_2.knows(DEPUTY_NAME));
    });

    module("Binding to a dispatch event", {
        setup: function() {
        },
        teardown: function() {
        }
    });

    test('A callback can be bound to a specific deputy on a one-time successful call', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);

        var BOUND_SUCCESS = function(){

        };
        var BOUND_FAILURE = function(){

        };
        deputizer.once(DEPUTY_NAME,BOUND_SUCCESS);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][0].success == BOUND_SUCCESS);
    });

    test('Multiple callbacks can be bound to a specific deputy on a one-time successful call', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);

        var BOUND_SUCCESS = [function(){

        },function(){

        }];
        var BOUND_FAILURE = [function(){

        },function(){

        }];
        deputizer.once(DEPUTY_NAME,BOUND_SUCCESS[0],BOUND_FAILURE[0]);
        deputizer.once(DEPUTY_NAME,BOUND_SUCCESS[1],BOUND_FAILURE[1]);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS].length == 2 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][0].success == BOUND_SUCCESS[0] && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][1].success == BOUND_SUCCESS[1]);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS].length == 2 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][0].failure == BOUND_FAILURE[0] && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][1].failure == BOUND_FAILURE[1]);
    });

    test('Multiple daputies can be bound to the same callback on a one-time successful call', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY_NAME_2 = "NAME_2";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);
        deputizer.define(DEPUTY_NAME_2,DEPUTY);

        var BOUND_SUCCESS = function(){

        };
        deputizer.once(DEPUTY_NAME,BOUND_SUCCESS);
        deputizer.once(DEPUTY_NAME_2,BOUND_SUCCESS);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][0].success == BOUND_SUCCESS);

        ok(typeof deputizer._deputies[DEPUTY_NAME_2] == "object" && deputizer._deputies[DEPUTY_NAME_2].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME_2].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME_2].handlers[INDEX_OF_ONCE_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME_2].handlers[INDEX_OF_ONCE_HANDLERS][0].success == BOUND_SUCCESS);
    });

    test('A callback can be bound to a specific deputy on a one-time failure call', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);

        var BOUND_SUCCESS = function(){

        };
        var BOUND_FAILURE = function(){

        };
        deputizer.once(DEPUTY_NAME,BOUND_SUCCESS,BOUND_FAILURE);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][0].success == BOUND_SUCCESS);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][0].failure == BOUND_FAILURE);
    });

    test('A callback can be bound to a specific deputy on every successful call', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);

        var BOUND_SUCCESS = function(){

        };
        var BOUND_FAILURE = function(){

        };
        deputizer.when(DEPUTY_NAME,BOUND_SUCCESS);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][0].success == BOUND_SUCCESS);
    });

    test('Multiple callbacks can be bound to a specific deputy on every successful call', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);

        var BOUND_SUCCESS = [function(){

        },function(){

        }];
        var BOUND_FAILURE = [function(){

        },function(){

        }];
        deputizer.when(DEPUTY_NAME,BOUND_SUCCESS[0],BOUND_FAILURE[0]);
        deputizer.when(DEPUTY_NAME,BOUND_SUCCESS[1],BOUND_FAILURE[1]);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 2 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][0].success == BOUND_SUCCESS[0] && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][1].success == BOUND_SUCCESS[1]);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 2 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][0].failure == BOUND_FAILURE[0] && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][1].failure == BOUND_FAILURE[1]);
    });

    test('Multiple daputies can be bound to the same callback on every successful call', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY_NAME_2 = "NAME_2";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);
        deputizer.define(DEPUTY_NAME_2,DEPUTY);

        var BOUND_SUCCESS = function(){

        };
        deputizer.when(DEPUTY_NAME,BOUND_SUCCESS);
        deputizer.when(DEPUTY_NAME_2,BOUND_SUCCESS);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][0].success == BOUND_SUCCESS);

        ok(typeof deputizer._deputies[DEPUTY_NAME_2] == "object" && deputizer._deputies[DEPUTY_NAME_2].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME_2].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME_2].handlers[INDEX_OF_WHEN_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME_2].handlers[INDEX_OF_WHEN_HANDLERS][0].success == BOUND_SUCCESS);
    });

    test('A callback can be bound to a specific deputy on every failure call', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };
        deputizer.define(DEPUTY_NAME,DEPUTY);

        var BOUND_SUCCESS = function(){

        };
        var BOUND_FAILURE = function(){

        };
        deputizer.when(DEPUTY_NAME,BOUND_SUCCESS,BOUND_FAILURE);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][0].success == BOUND_SUCCESS);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][0].failure == BOUND_FAILURE);
    });

    test('A callback for all successful calls can be bound by chaining to a deputy definition', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };

        var BOUND_SUCCESS = function(){

        };

        deputizer.define(DEPUTY_NAME,DEPUTY).when(BOUND_SUCCESS);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][0].success == BOUND_SUCCESS);
    });

    test('A callback for a single successful call can be bound by chaining to a deputy definition', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };

        var BOUND_SUCCESS = function(){

        };

        deputizer.define(DEPUTY_NAME,DEPUTY).once(BOUND_SUCCESS);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][0].success == BOUND_SUCCESS);
    });

    test('Multiple callbacks can be bound by chaining to a deputy definition', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };

        var BOUND_SUCCESS = function(){

        };
        var BOUND_SUCCESS_2 = function(){

        };

        deputizer.define(DEPUTY_NAME,DEPUTY).when(BOUND_SUCCESS).when(BOUND_SUCCESS_2);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 2 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][0].success == BOUND_SUCCESS);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 2 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][1].success == BOUND_SUCCESS_2);
    });
    test('Multiple callbacks of different types can be bound by chaining to a deputy definition', function () {
        var deputizer = new Deputizer();
        var DEPUTY_NAME = "NAME";
        var DEPUTY = function(){

        };

        var BOUND_SUCCESS = function(){

        };
        var BOUND_SUCCESS_2 = function(){

        };

        deputizer.define(DEPUTY_NAME,DEPUTY).when(BOUND_SUCCESS).once(BOUND_SUCCESS_2);

        ok(typeof deputizer._deputies[DEPUTY_NAME] == "object" && deputizer._deputies[DEPUTY_NAME].executor == DEPUTY);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_WHEN_HANDLERS][0].success == BOUND_SUCCESS);
        ok(deputizer._deputies[DEPUTY_NAME].handlers instanceof Array && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS].length == 1 && deputizer._deputies[DEPUTY_NAME].handlers[INDEX_OF_ONCE_HANDLERS][0].success == BOUND_SUCCESS_2);
    });

    test('asd', function () {

        var dep = new Deputizer({
            onDeputyError:function(){
                console.log(arguments);
            }
        });
        dep.define('gidi',function(success,failure){
            success(this.a,this.b);
        },{
            a:1,
            b:2
        }).when(function(a,b){
                console.log(a+b);
            }).once(function(a,b){
                console.log(a-b);
            });

        dep.execute('gidi',true,function(a,b){
            console.log(a);
            console.log(b);
            ok(1 == a);
            ok(2 == b);
            throw new Error("asd");
        });
        dep.execute('gidi');

        expect(2);

    });
//
//    test('should be able to birdwatcher object with multiple functions without interfering', function () {
//
//        var twoTrickPony = {
//            trick : function(){
//                // make sure the method is called as usual
//                ok(true);
//            },
//            trickier : function(){
//                // make sure the method is called as usual
//                ok(true);
//            }
//        };
//        birdwatcher(twoTrickPony);
//
//        twoTrickPony.trick();
//        twoTrickPony.trickier();
//
//        expect(2);
//    });
//
//    test('should call onError using global config and let error bubble up', function () {
//
//        var msg = "OneTrickPony failed";
//
//        birdwatcher.configuration({
//            onError:function(){
//                ok(true);
//            }
//        });
//
//        var oneTrickPony = {
//            trick : function(){
//                throw new Error(msg);
//            }             §§§
//        };
//        birdwatcher(oneTrickPony);
//
//        throws(function(){
//            oneTrickPony.trick();
//        },msg);
//
//        expect(2);
//    });
//
//    test('should call onError using global config for multiple methods and let error bubble up', function () {
//
//        var msg = "TwoTrickPony failed ";
//
//        birdwatcher.configuration({
//            onError:function(){
//                ok(true);
//            }
//        });
//
//        var twoTrickPony = {
//            trick : function(){
//                throw new Error(msg + "1");
//            },
//            trickier : function(){
//                throw new Error(msg + "2");
//            }
//        };
//        birdwatcher(twoTrickPony);
//
//        throws(function(){
//            twoTrickPony.trick();
//        },msg + "1");
//
//        throws(function(){
//            twoTrickPony.trickier();
//        },msg + "2");
//
//        expect(4);
//    });
//
//    test('should call onError using global config for multiple methods and prevent error from bubbling up', function () {
//
//        var msg = "TwoTrickPony failed ";
//
//        birdwatcher.configuration({
//            rethrow:false,
//            onError:function(){
//                ok(true);
//            }
//        });
//
//        var twoTrickPony = {
//            trick : function(){
//                throw new Error(msg + "1");
//            },
//            trickier : function(){
//                throw new Error(msg + "2");
//            }
//        };
//        birdwatcher(twoTrickPony);
//
//        twoTrickPony.trick();
//        twoTrickPony.trickier();
//
//        expect(2);
//    });
//
//    test('should call onError using global config for multiple methods, call prerethrow callback and then let error from bubble up', function () {
//
//        var msg = "TwoTrickPony failed ";
//
//        birdwatcher.configuration({
//            onRethrow:function(){
//                ok(true);
//            },
//            onError:function(){
//                ok(true);
//            }
//        });
//
//        var twoTrickPony = {
//            trick : function(){
//                throw new Error(msg + "1");
//            },
//            trickier : function(){
//                throw new Error(msg + "2");
//            }
//        };
//        birdwatcher(twoTrickPony);
//
//        throws(function(){
//            twoTrickPony.trick();
//        },msg + "1");
//
//        throws(function(){
//            twoTrickPony.trickier();
//        },msg + "2");
//
//        expect(6);
//    });
//
//    test('should call onError using global config for multiple objects', function () {
//
//        birdwatcher.configuration({
//            onError:function(){
//                ok(true);
//            }
//        });
//
//        var twoTrickPony = {
//            trick : function(){
//                throw new Error();
//            },
//            trickier : function(){
//                throw new Error();
//            }
//        };
//        var oneTrickPony = {
//            trick : function(){
//                throw new Error();
//            }
//        };
//
//        birdwatcher(oneTrickPony);
//        birdwatcher(twoTrickPony);
//
//        throws(function(){
//            twoTrickPony.trick();
//        });
//
//        throws(function(){
//            twoTrickPony.trickier();
//        });
//
//        throws(function(){
//            oneTrickPony.trick();
//        });
//
//        expect(6);
//    });
//
//    module("Object specific configuration");
//
//    test('should be used for single object', function () {
//
//        birdwatcher.configuration({
//            onError:function(){
//                ok(false);
//            }
//        });
//
//        var oneTrickPony = {
//            trick : function(){
//                throw new Error();
//            }
//        };
//
//        birdwatcher(oneTrickPony,{
//            onError:function(){
//                ok(true);
//            }
//        });
//
//        throws(function(){
//            oneTrickPony.trick();
//        });
//
//        expect(2);
//    });
//
//    test('should be used for single object but default for others', function () {
//
//        birdwatcher.configuration({
//            onError:function(exp,method){
//                if(method == "shouldCall") {
//                    ok(true);
//                } else {
//                    ok(false);
//                }
//            }
//        });
//
//        var oneTrickPony = {
//            trick : function(){
//                throw new Error();
//            }
//        };
//
//        var secondOneTrickPony = {
//            shouldCall : function(){
//                throw new Error();
//            }
//        };
//
//        birdwatcher(oneTrickPony,{
//            onError:function(exp,method){
//                if(method == "trick") {
//                    ok(true);
//                } else {
//                    ok(false);
//                }
//            }
//        });
//
//        birdwatcher(secondOneTrickPony);
//
//        throws(function(){
//            oneTrickPony.trick();
//        });
//        throws(function(){
//            secondOneTrickPony.shouldCall();
//        });
//
//        expect(4);
//    });
//
//    test('should bubble errors for all object except the specific one', function () {
//
//        birdwatcher.configuration({
//            onRethrow:function(exp,method){
//                ok(true);
//            },
//            onError:function(exp,method){
//                ok(true);
//            }
//        });
//
//        var oneTrickPony = {
//            trick : function(){
//                throw new Error();
//            }
//        };
//
//        var secondOneTrickPony = {
//            shouldCall : function(){
//                throw new Error();
//            }
//        };
//
//        birdwatcher(oneTrickPony,{
//            rethrow:false
//        });
//
//        birdwatcher(secondOneTrickPony);
//
//        oneTrickPony.trick();
//        throws(function(){
//            secondOneTrickPony.shouldCall();
//        });
//
//        expect(4);
//    });
//
//    test('should wrap thrown objects in a custom Error object when configured to errorize', function () {
//
//        birdwatcher.configuration({
//            errorize:true,
//            rethrow:true,
//            onRethrow:false,
//            onError:function(exp,method){
//                if(method == "donterrorize") {
//                    ok(exp instanceof Error);
//                } else if(method == "errorize") {
//                    ok(exp instanceof birdwatcher.Error);
//                    ok(typeof exp.error == "object");
//                    ok(exp.error.isError);
//                }
//            }
//        });
//
//        var oneTrickPony = {
//            donterrorize : function(){
//                throw new Error();
//            }
//        };
//
//        var secondOneTrickPony = {
//            errorize : function(){
//                throw { isError:true };
//            }
//        };
//
//        birdwatcher(oneTrickPony);
//        birdwatcher(secondOneTrickPony);
//
//        throws(function(){
//            oneTrickPony.donterrorize();
//        });
//
//        throws(function(){
//            secondOneTrickPony.errorize();
//        });
//
//        expect(6);
//    });
//
//    test('should not wrap thrown objects in a custom Error object when configured not to errorize', function () {
//
//        birdwatcher.configuration({
//            errorize:false,
//            rethrow:true,
//            onRethrow:false,
//            onError:function(exp,method){
//                if(method == "originalerror") {
//                    ok(exp instanceof Error);
//                } else if(method == "donterrorize") {
//                    ok(typeof exp == "object");
//                    ok(exp.isError);
//                }
//            }
//        });
//
//        var oneTrickPony = {
//            originalerror : function(){
//                throw new Error();
//            }
//        };
//
//        var secondOneTrickPony = {
//            donterrorize : function(){
//                throw { isError:true };
//            }
//        };
//
//        birdwatcher(oneTrickPony);
//        birdwatcher(secondOneTrickPony);
//
//        throws(function(){
//            oneTrickPony.originalerror();
//        });
//
//        throws(function(){
//            secondOneTrickPony.donterrorize();
//        });
//
//        expect(5);
//    });
//
//    test('should be work on a function variable', function () {
//
//        birdwatcher.configuration({
//            onError:function(){
//                ok(true);
//            }
//        });
//
//        var oneTrickPony = {
//            trick : function(){
//                throw new Error();
//            }
//        };
//		var secondTrickPony = function(){
//            throw new Error();
//		};
//
//        oneTrickPony.trick = birdwatcher(oneTrickPony.trick);
//        secondTrickPony = birdwatcher(secondTrickPony);
//
//        throws(function(){
//            oneTrickPony.trick();
//        });
//
//        throws(function(){
//            secondTrickPony();
//        });
//
//        expect(4);
//    });
})