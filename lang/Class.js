/**
 * Class JS - Class Inheritance in Javascript
 *
 * Based on Alex Arnell's inheritance implementation and code from Prototype
 * by Sam Stephenson and others. Please credit these people if you use this.
 *
 * exports       Class, argumentNames, arrayify, bind, wrap
 * copyright     2011 by Stijn de Witt, some rights reserved.
 * license       http://creativecommons.org/licenses/by/3.0/ 
 */
Package("lang.Class", function() {

	/**
	 * Class([name] [, parent], object [, object] [, object])
	 *
	 * Creates a new class with the given name, parent and methods.
	 *
	 * name    String, Optional. The name of the new class. 
	 *         If not specified the new class will be anonymous.
	 * parent  Class object, optional. The parent class for the new class.
	 * object  Object, Required. One or more objects containing the methods 
	 *         and fields to add to the new class.
	 */
	function Class() {
		var name = "", parent = null, args = arrayify(arguments);
		if (typeof args[0] == "string" || args[0] instanceof String)
			name = args.shift();

		if (typeof args[0] == "function")
			parent = args.shift();

		function klass() {
			this.initialize.apply(this, arguments);
		}
		
		klass.name = name;
		klass.superclass = parent;
		klass.subclasses = [];

		if (parent) {
			var subclass = function() { };
			subclass.prototype = parent.prototype;
			klass.prototype = new subclass();
			parent.subclasses.push(klass);
		}

		for (var i=0, len=args.length; i<len; i++)
			addMethods(klass, args[i]);

		if (!klass.prototype.initialize)
			klass.prototype.initialize = function() { };

		klass.prototype.constructor = klass;
		return klass;
	};

	function argumentNames(fn) {
	  var i, len, names = fn.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",");
	  for (i=0, len=names.length; i<len; i++)
		  names[i] = names[i].replace(/^\s+/, '').replace(/\s+$/, '');
	  return len == 1 && !names[0] ? [] : names;
	};
	
	function arrayify(it) {
		if (!it) return [];
		if ('toArray' in Object(it)) return it.toArray();
		var len = it.length || 0, results = new Array(len);
		while (len--) results[len] = it[len];
		return results;
	}

	function bind(func) {
		if (arguments.length < 3 && arguments[1] === undefined) return func;
		var args = arrayify(arguments), obj = args.splice(0, 2)[1];
		return function() {
			return func.apply(obj, args.concat(arrayify(arguments)));
		}
	}
	
	function wrap(func, wrapper) {
		return function() {
			return wrapper.apply(this, [bind(func, this)].concat(arrayify(arguments)));
		}
	}

	/* ---------- private code below ---------- */
	
	var IS_DONTENUM_BUGGY = true;
	for (var p in { toString: 1 }) {
		if (p === 'toString') {
			IS_DONTENUM_BUGGY = false;
			break;
		}
	}

	function addMethods(klass, src) {
		function keys(obj) {
			var results = [];
			for (var key in obj)
				results.push(key);
			return results;
		};

		var ancestor = klass.superclass && klass.superclass.prototype, props = keys(src);

		if (IS_DONTENUM_BUGGY) {
			if (src.toString != Object.prototype.toString)
				props.push("toString");
			if (src.valueOf != Object.prototype.valueOf)
				props.push("valueOf");
		}
 
		for (var i=0, key; key=props[i]; i++) {
			var val = src[key];
			if (ancestor && (typeof val == "function")) {
				var argNames = argumentNames(val);
				if ((argNames.length > 0) && (argNames[0] == "$super")) {
					var method = val;
					val = wrap((function(m) {
						return function() {
							return ancestor[m].apply(this, arguments);
						};
					})(key), method);
					val.valueOf = bind(method.valueOf, method);
					val.toString = bind(method.toString, method);
				}
			}
			klass.prototype[key] = val;
		}
	}
	
	// Expose
	Export(Class);
	Export(argumentNames);
	Export(arrayify);
	Export(bind);
	Export(wrap);
});
