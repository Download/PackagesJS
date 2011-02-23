/*****************************************************************************
 * Packages JS - Packages in Javascript                                      *
 *                                                                           *
 * version       1.0-rc2                                                     *
 * author        Stijn de Witt <StijnDeWitt-AT-hotmail.com>                  *
 * website       http://packagesinjavascript.wordpress.com/                  *
 * copyright     2011, Some rights reserved                                  *
 * license       http://creativecommons.org/licenses/by/3.0/                 *
 * credits       Alex Arnell, Dean Edwards, Tanny O'Haley Peter-Paul Koch,   *
 *               Matthias Miller, Ben Nolan, Diego Perini, John Resig,       *
 *               Ash Searle, Sam Stephenson, Dan Webb, Tino Zijdel.          *
 *               Thanks for sharing and inspiring.                           *
 *****************************************************************************/
(function() {
	// Change this if you rename the file
	var THISFILE = "packages.js";
	
	/**
	 * Package(name, dependencies, code( [import1 [, import2 [, ... ]]]))
	 *
	 * Registers your package under the supplied name. Loads all packages in
	 * the dependencies list and runs the given code when they have loaded. 
	 * Injects objects exported by the dependencies into the code if it has 
	 * arguments with names matching those of the exported objects.
	 *
	 * name          Name of your package. Required. [String].
	 *               EG: "mypackage", "my.common.lib".
	 * dependencies  List of dependencies. Optional. [Array].
	 *               EG: ["lib1", "lib2"].
	 * code          Called once dependencies are resolved. Required. [Function].
	 *               EG: myFunc, function() { }.
	 */
	window.Package = function(name, dependencies, code) {
		if (this == window) { // Package called as normal function
			if (! code) {
				code = dependencies;
				dependencies = [];
			}
			if (logLevel() >= DEBUG) log().debug("Package(" + name + (dependencies && dependencies.length ? ", [" + dependencies + "]" : "") + ")");
			register(name, dependencies, code);
		} else {	// Package called as constructor
			assign(this, {
				name: name,
				dependencies: dependencies || [],
				dependants: [],
				code: code,
				exports: {},
				script: null,
				state: INITIAL,
				toString: function() { return this.name; }
			});
		}
	};

	/**
	 * Export([name], object)
	 *
	 * Exports the given object under the given name for use by other packages.
	 * 
	 * name    Name of the object to export. Optional. [String]. If not supplied, 
	 *         the name will be determined from the given object itself.
	 * object  The object to export for use by other packages. 
	 *         Required. [Any].
	 */
	window.Export = function(name, object) {
		if (typeof object == "undefined") {
			object = name;
			name = null;
		}
		if (! name) {
			var n = nameOf(object);
			if (n) name = n;
			else {
				var sep = context.name.lastIndexOf(".");
				name = sep >= 0 ? context.name.substring(sep + 1) : context.name;
			}
		}
		if (logLevel() >= DEBUG) log().debug("Export(" + name + ", " + (typeof object == "function" ? (typeof object['superclass'] != "undefined" ? "class" : "function") : object) + ")");
		context.exports[name] = object;
	};

	/**
	 * Import(name)
	 *
	 * Imports the object with the given name from one of the dependencies.
	 *
	 * name  The name of the object to import. Required. [String].
	 *       Supply a fully qualified name if you need to disambiguate
	 *       between two dependencies exporting an object with the same name.
	 */
	window.Import = function(name) {
		var pkg, sep = name.lastIndexOf(".");
		if (sep >= 0) {
			pkg = name.substring(0, sep);
			name = name.substring(sep + 1);
		}
		for (var i=0,d; d=context.dependencies[i]; i++) {
			if ((pkg && d == pkg) || !pkg) {
				var dep = lookup(d, !CREATE);
				if (dep && (typeof dep.exports[name] != "undefined")) {
					if (logLevel() >= DEBUG) log().debug("Import(" + name + ")");
					return dep.exports[name];
				}
			}
		}
		// Implicit objects
		if (typeof implicit[name] != "undefined")
			return implicit[name];
	}

	// Implicit objects may be imported from any package
	var implicit = {log: log};
// --------------------------------private--------------------------------
	
	// State model for packages (sequential).
	var INITIAL = "INITIAL", LOADING = "LOADING", LOADED = "LOADED", 
			RESOLVED = "RESOLVED", EXECUTING = "EXECUTING", AVAILABLE = "AVAILABLE";
	var CREATE = true;
	var context = null;
	var script = find(THISFILE);
	var url = script.src.substring(0, script.src.indexOf(THISFILE));

	Package.Loader = function() {
		this.packages = {};
	};
	
	mixin(Package.Loader, {
		get: function(name) {
			return this.packages[name];
		},
		put: function(pkg) {
			this.packages[pkg.name] = pkg;
		}
	});
	
	Package.rootLoader = new Package.Loader;
	Package.currentLoader = Package.rootLoader;
	
	function defaultLocator(name) {
		return url + name.replace(/\./g, "/") + ".js";
	}
	
	Package.locators = [];
	Package.addLocator = function(locator) {
		Package.locators.push(locator);
	}
	
	function register(name, dependencies, code) {
		var p = lookup(name, CREATE);
		p.dependencies = dependencies || [];
		p.code = code;
		p.state = dependencies.length ? LOADED : RESOLVED;
		resolve(p);
	}
	
	function lookup(name, create) {
		var result = Package.currentLoader.get(name);
		if (create && !result) {
			result = new Package(name);
			Package.currentLoader.put(result);
		}
		return result;
	}

	function resolve(pkg) {
		// Is package loaded? 
		if (pkg.state == LOADED) {
			// Yes, it may be executed once it's dependencies are available.
			var resolved = true;
			// check it's dependencies
			for (var j=0,d; d=pkg.dependencies[j]; j++) {
				var dep = lookup(d, CREATE);
				// Register current package as a dependant of the dependency.
				if (dep.dependants.indexOf(pkg.name) < 0)
					dep.dependants.push(pkg.name);
				// If the dependency is not yet available, the package is not resolved.
				if (dep.state != AVAILABLE) {
					if (dep.state == INITIAL)
						resolve(dep);
					resolved = false;
				}
			}
			if (resolved) pkg.state = RESOLVED;
		}
		else if (pkg.state == INITIAL) {
			// Load the dependency if necessary.
			pkg.state = LOADING;
			var location = locate(pkg.name);
			pkg.script = load(location);
		}
		if (pkg.state == RESOLVED)	execute(pkg);
		if (pkg.state == AVAILABLE) 
			for (var i=0, dep; dep=pkg.dependants[i]; i++) 
				resolve(lookup(pkg.dependants[i]));
	}

	function execute(pkg) {
		if (logLevel() >= DEBUG) log().debug("execute(" + pkg + ")");
		var args = [];
		if (pkg.code) {
			var orgContext = context;
			context = pkg;
			// Gather the callback arguments amongst the dependencies' exported objects
			var names = argumentNames(pkg.code);
			for (var j=0,name; name=names[j]; j++) {
				var obj = Import(name);
				args.push(obj);
				if ((obj == undefined) && console && (typeof console.error == "function"))
					console.error("Package: Could not find any object named '" + name + "' " + 
							"in the dependencies listed for package '" + pkg + "'.");
			}
			// Execute the package callback
			pkg.state = EXECUTING;
			pkg.code.apply(pkg, args);
			context = orgContext;
		}
		pkg.state = AVAILABLE;
	}

	function find(url) {
		for (var i=0,s; s=document.getElementsByTagName("head")[0].childNodes[i]; i++) {
			if (s.nodeName.toLowerCase() == "script") {
				var idx = s.src.indexOf(url);
				if ((idx >= 0) && (idx == s.src.length - url.length)) // Does the script point at url?
					return s; // found it
			}
		}
	}

	function load(url) {
	  // Already loaded?
	  var s = find(url);
	  if (s) return s;
	  // Not loaded, insert a new script element
	  if (logLevel() >= DEBUG) log().debug("load(" + url + ")");
	  s = document.createElement("script");
	  s.type = "text/javascript";
	  s.src = url;
	  document.getElementsByTagName("head")[0].appendChild(s);
	  return s;
	}

	function locate(name) {
		if (Package.locators) { 
			var loc = null;
			for (var i=0,locator; locator=Package.locators[i]; i++) {
				if ((typeof locator == "function") && (loc = locator(name)))
					return loc;
			}
		}
		return defaultLocator(name);
	}

	function nameOf(obj) {
		if (typeof obj.name == "string") return obj.name;
		if (typeof obj == "function") {
			var s = fn.toString().substr("function ".length);
			return s.substr(0, s.indexOf("("));
		}
	}
	
	function argumentNames(fn) {
	  var i, len, names = fn.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",");
	  for (i=0, len=names.length; i<len; i++) names[i] = names[i].replace(/^\s+/, '').replace(/\s+$/, '');
	  return len == 1 && !names[0] ? [] : names;
	};
	
	function assign(obj, src) {
		for (var key in src) obj[key] = src[key];
	}
	
	function mixin(obj, src) {
		assign(obj.prototype, src)
	}
	
  	// names of all methods in the Firebug log API
	var voidconsole = {}, logapi = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
	for (var i=0, name; name=logapi[i]; i++) voidconsole[name] = function() {};
	
	function log() {
		if (typeof window['console'] == "object" && typeof window.console['info'] != "undefined") 
			return console;
		return voidconsole;
	}
	
	var DEBUG = 4, INFO = 3, WARN = 2, ERROR = 1, DISABLED = 0;
	
	function logLevel() {
		var level = window.location.search.replace(/^.*[\?\&]debug=(debug|true|4|info|3|warn|warning|2|error|1)(&.*)??$/, "$1").toLowerCase();
		if ((level == "debug") || (level == "true") || (level == "4"))	return DEBUG;
		else if ((level == "info") || (level == "3")) return INFO;
		else if ((level == "warn") || (level == "warning") || (level == "2")) return WARN;
		else if ((level == "error") || (level == "1")) return ERROR;
		else return DISABLED;
	};
})();