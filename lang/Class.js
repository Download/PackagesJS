/**
 * Class JS - Class Inheritance in Javascript
 *
 * Based on Alex Arnell's inheritance implementation.
 * Shamelessly stolen from Prototype 1.6.0, by Sam Stephenson and others.
 * http://www.prototypejs.org/
 *
 * Class JS is just the class subsytem from prototype 1.6.0, with some
 * minor changes to decouple it from prototype. This means it's compatible with
 * Prototype, and that any packages you create that use lang.Class will also
 * run without problems if you use framework.prototype instead. In fact, the
 * version of prototype bundled with Packages JS will register lang.Class and
 * framework.prototype, making it a drop-in replacement for this package.
 *
 * Exported: Class
 * Modified: Object(extend), Function(argumentNames, bind, wrap)
 */
Package("lang.Class", [], function() {
	var Class = {
	   create: function() {
	      var parent = null, properties = $A(arguments);
	      if (typeof properties[0] == "function")
	         parent = properties.shift();

	      function klass() {
	         this.initialize.apply(this, arguments);
	      }

	      Object.extend(klass, Class.Methods);
	      klass.superclass = parent;
	      klass.subclasses = [];

	      if (parent) {
	         var subclass = function() { };
	         subclass.prototype = parent.prototype;
	         klass.prototype = new subclass;
	         parent.subclasses.push(klass);
	      }

	      for (var i=0, len=properties.length; i<len; i++)
	         klass.addMethods(properties[i]);

	      if (!klass.prototype.initialize)
	         klass.prototype.initialize = function() { };

	      klass.prototype.constructor = klass;
	      return klass;
	   }
	};

	Class.Methods = {
	   addMethods: function(source) {
	      var ancestor = this.superclass && this.superclass.prototype;

	      function keys(obj) {
	         var ret = [];
	         for (var prop in obj)
	            ret.push(prop);
	         return ret;
	      };

	      var properties = keys(source);

	      if (!keys({ toString: true }).length)
	         properties.push("toString", "valueOf");

	      for (var i=0, len=properties.length; i<len; i++) {
	         var property = properties[i], value = source[property];
	         if (ancestor && (typeof value == "function")) {
	            if ((value.argumentNames().length > 0) && (value.argumentNames()[0] == "$super")) {
	               var method = value;
	               value = Object.extend((function(m) {
	                  return function() {
	                     return ancestor[m].apply(this, arguments);
	                  };
	               })(property).wrap(method), {
	                  valueOf:  function() { return method },
	                  toString: function() { return method.toString() }
	               });
	            }
	         }
	         this.prototype[property] = value;
	      }
	      return this;
	   }
	};

	Object.extend = function(destination, source) {
	   for (var property in source)
	      destination[property] = source[property];
	   return destination;
	};

	Object.extend(Function.prototype, {
	   bind: function() {
	      if (arguments.length < 2 && arguments[0] === undefined) return this;
	      var __method = this, args = $A(arguments), object = args.shift();
	      return function() {
	      return __method.apply(object, args.concat($A(arguments)));
	      }
	   },

	   wrap: function(wrapper) {
	      var __method = this;
	      return function() {
	         return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
	      }
	   }
	});

	function $A(iterable) {
	   if (!iterable) return [];
	   if (iterable.toArray) return iterable.toArray();
	   var length = iterable.length, results = new Array(length);
	   while (length--) results[length] = iterable[length];
	   return results;
	}

	if (navigator.userAgent.indexOf('AppleWebKit/') > -1) {
	  function $A(iterable) {
	    if (!iterable) return [];
	    if (!((typeof iterable == "function") && iterable == '[object NodeList]') &&
	        iterable.toArray) return iterable.toArray();
	    var length = iterable.length, results = new Array(length);
	    while (length--) results[length] = iterable[length];
	    return results;
	  }
	}

	// Export Class using Object-as-Package technique. The object will
	// become available AT the package scope, not IN it
	Export(Class);
	// You can now reach the object at lang.Class, eg:
	// lang.Class.create()
});
