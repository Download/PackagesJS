/*****************************************************************************
 * Packages JS - Packages in Javascript                                      *
 *                                                                           *
 * version       1.0-rc1                                                     *
 * author        Stijn de Witt <StijnDeWitt-AT-hotmail.com>                  *
 * website       http://packagesinjavascript.wordpress.com/                  *
 * copyright     2009, Some rights reserved                                  *
 * license       http://creativecommons.org/licenses/by/3.0/                 *
 * credits       Alex Arnell, Dean Edwards, Tanny O'Haley Peter-Paul Koch,   *
 *               Matthias Miller, Ben Nolan, Diego Perini, John Resig,       *
 *               Ash Searle, Sam Stephenson, Dan Webb, Tino Zijdel.          *
 *               Thanks for sharing and inspiring.                           *
 *****************************************************************************/

/**
 * Package(name, dependencies, callback( [import1 [, import2 [, ... ]]]))
 *
 * Registers your package under the supplied name. Imports all packages in
 * the dependencies list and fires the callback when they have loaded. Injects
 * objects exported by the imported packages into the callback function if it
 * has arguments with names matching those of the exported objects.
 *
 * name          Name of your package. Required. [String].
 *               EG: "mypackage", "my.common.lib".
 * dependencies  List of dependencies. Optional. [String|Array].
 *               EG: "lib1", "lib1,lib2", ["lib1", "lib2"].
 * callback      Function that is called once dependencies are resolved.
 *               Required if dependencies are specified. [Function].
 *               EG: myFunc, function() { // inline function }.
 *
 * Example 1: Registration only, convenient for packaging existing code
 *   // code without dependencies...
 *   Package("my.package");
 *
 * Example 2: Import dependencies):
 *   Package("my.package", ["example.animals"], function(Cat) {
 *     // Exported object Cat is assigned to callback argument
 *     var felix = new Cat("Felix");
 *   });
 */
function Package(name, dependencies, callback) {
  Package.debug("Package(" + name +
    ((typeof dependencies == "undefined") ? ")" : ",[" + dependencies + "])"));

  // do we have a dependencies list and package callback?
  if (dependencies && callback) {
  	// yes, create a scope for this package
    var scope = Package.scope(name, true);
    // copy dependencies into a namespaces list
    var namespaces = [];
    for (var i=0, len=dependencies.length; i<len; i++)
      namespaces.push(dependencies[i]);
		// now asynchronously import the dependencies and wait for them to load.
		// once they have loaded, the callback function fires.
    Package.importDependencies(dependencies, function(name, callback, namespaces) {
    	// this is just a temporary function that returns the callback function,
    	// capturing the arguments of this temp function in a closure.

      return function() {
      	// this is the callback function.

				// capture all exported objects in a map, keyed by name
        var objs = {}, args = [], names = callback.argumentNames();
        // find exported objects in all namespaces
        for (var i=0,len=namespaces.length; i<len; i++) {
        	// grab the namespace object (the one holding the exported objects)
          var scope = Package.scope(namespaces[i]);
          // found?
          if (scope) {
          	// yes. Is it a one-class-per-file package?
          	if (scope.__object)
          		objs[scope.__object] = scope; // yes, get the single object
          	else for(var prop in scope)
              objs[prop] = scope[prop];     // no, get all contained objects
          }
        }

				// check argument names for match with exported object names
        for (var i=0, len=names.length; i<len; i++) {
          if (typeof objs[names[i]] != "undefined")
          	args.push(objs[names[i]]);
          else {
            console.error("Could not find exported object " + names[i] +
            		" in any of the listed dependencies.");
            args.push(null);
          }
        }

				// set the current package context. This allows Export to know if it
				// is being called from within a package callback. This works because
				// javascript is single-threaded.
        Package.current = name;
        // call the package callback.
        callback.apply(null, args);
        // clear the package context again.
        Package.current = null;
        // now the callback has fired, we register the package. This might in
        // turn lead to other package's dependencies being resolved, firing their
        // callbacks... et cetera
        Package.register(name);
      };
    }(name, callback, namespaces)); // <-- immediately fire the temp func
  }
  else
  	// only register the package
    Package.register(name);
}

/**
 * Export(obj, name)
 *
 * Exports an object for use within other packages.
 *
 * obj        Object to export for use in other packages. Required. [Any]
 *            EG: Cat.
 * name       Name of the object to export. Optional. [String]
 *            EG: "Cat".
 *
 * A fully qualified name consists of the package name and the object
 * name separated by a dot. This form can always be used and is convenient
 * for overriding the default location of the exported object, or for
 * using this function from outside the context of a package callback.
 * Short names or no name at all can only be used if this function is
 * called from within the context of an executing package callback function
 * (i.e. from within your package). The object will be exported to your
 * package's scope. This is the recomended form.
 * When the name argument is not supplied, the one-class-per-file
 * form is assumed to be used. In this case the object is exported AT
 * the package instead of IN it.
 *
 * Example
 *
 * An object, function or class exported in one package...
 *
 *  Package ("example.animals", ["lang.classes"], function(Class) {
 *    var Cat = Class.create(..);
 *    Export(Cat, "Cat");
 *  });
 *
 * ...becomes available to other packages in the global scope, under it's
 * fully qualified name:
 *
 *  Package("example.animaltest", ["example.animals"], function() {
 *    var Cat = example.animals.Cat;
 *    var felix = new Cat("Felix");
 *  });
 *
 * ...but can also be injected into the local scope by Packages JS:
 *
 *  Package("yet.another.package", ["example.animals"], function(Cat) {
 *    var felix = new Cat("Felix");
 *  });
 *
 * In the code above, note how Cat is injected as an argument to the package
 * callback function.
 *
 * If you leave out the optional name argument, the object will be exported
 * AT the package scope instead of IN it. This variation can only be used
 * from within the context of a package callback, and only once per
 * package (obviously). This syntax is convenient for creating a
 * one-class-per-file package structure:
 *
 *  Package("example.animals.Dog", ["lang.Class"], function(Class) {
 *    var Dog = Class.Create({ ... });
 *    Export(Dog);
 *  });
 *
 * In the above example, Dog becomes available at example.animals.Dog,
 * not at example.animals.Dog.Dog, but can still be imported in the
 * same way as other exported objects:
 *
 *  Package("some.package", ["example.animals", "example.animals.Dog"], function(Cat, Dog) {
 *    var felix = new Cat("Felix");
 *    var lassie = new Dog("Lassie");
 *  });
 */
function Export(obj, name) {
	if (!name && !Package.current) {
		console.error("Export: Must supply a name for object when not within package callback.");
		return null;
	}
  var packageName, prop;
  var search = name ? name : Package.current;
  var idx = search.lastIndexOf('.');
  if (idx > 0) {
    packageName = search.substring(0, idx);
    prop = search.substring(idx + 1);
  }
  else if (Package.current) {
  	packageName = name ? Package.current : "";
  	prop = name;
  }

  var scope = Package.scope(packageName, true);
  scope[prop] = obj;
  scope[prop].__object = name ? null : prop;
  Package.debug("Export(" + name + "," + (typeof obj == "function" ?
  		"function(" + obj.argumentNames() + ")" : obj) + ")");
  return obj;
}

/* =================== PRIVATE METHODS BELOW ============================= */

/**
 * Tries to find the script element whose src attribute points at url,
 * in the head element of the current document.
 *
 * @param url Url of the script to find (case sensitive)
 * @return    The script element, or null
 */
Package.find = function(url) {
  var head = document.getElementsByTagName("head")[0];
  for (var i=0, len=head.childNodes.length; i<len; i++) {
    if (head.childNodes[i].nodeName.toLowerCase() == "script") {
      var script = head.childNodes[i], idx = script.src.indexOf(url);
      // does the script point at url?
      if ((idx >= 0) && (idx ==	script.src.length - url.length))
        return script; // found it
    }
  }
  return null; // didn't find it
};

/**
 * Loads the script located at url, only if necesary.
 * Determines if the script has already been loaded using Package.find() and if
 * not, inserts a script element in the head element of the current document.
 *
 * url       The url of the script to load (case sensitive).
 * type      Script's mime type. Default is "text/javascript".
 * charset   Charset for the script. Default is undefined.
 */
Package.load = function(url, mimeType, charset) {
  // Already loaded?
  var script = this.find(url);
  if (script != null) return script;

  // Not loaded, insert a new script element
  Package.debug("Package.load(" + url + ")");
  script = document.createElement("script");
  script.src = url;
  script.type = mimeType || "text/javascript";
  if (charset)  script.charset = charset;
  document.getElementsByTagName("head")[0].appendChild(script);
  return script;
};

/**
 * Imports all listed packages.
 * Registers dependencies and loads the related scrips if necessary. Calls
 * the callback functions of any packages whose dependencies had been
 * resolved in the meantime.
 *
 * dependencies  Array of String listing the names of packages to import.
 * callback      Function that will be called when your dependencies
 *               have been resolved. Only within that function should
 *               you use imported functionality.
 */
Package.importDependencies = function(dependencies, callback) {
  // remove packages that are already registered
  for (var i=dependencies.length-1; i>=0; i--) {
    for (var r=0, rlen=this.registered.length; r<rlen; r++) {
      if (dependencies[i] == Package.registered[r]) {
      	Package.debug(dependencies[i] + " is already registered.");
        dependencies.splice(i, 1);
        break;
      }
    }
  }
  // load remaining dependencies and resolve waiting imports
  this.imports.push({packs: dependencies, func: callback});
  for (var i=0, len=dependencies.length; i<len; i++)
    this.load(this.url + dependencies[i].replace(/\./g, "/") + ".js");
  this.resolve();
};

/**
 * Registers the supplied package.
 *
 * name     Name of package to register.
 */
Package.register = function(name) {
  Package.registered.push(name);
  if (this.imports.length > 0)
    this.resolve();
};

/**
 * For all registered packages, checks all waiting imports and removes
 * dependencies to the registered package. It then removes all import requests
 * that have been fully resolved, saving their callback handlers. Finally it
 * fires all the collected callbacks.
 *
 * After a callback has fired, the callback handler will call register
 * which in turn will lead to more calls to this method until finally all
 * dependencies are resolved.
 */
Package.resolve = function() {
  // to contain the callbacks we should call
  var callbacks = new Array();
  // for all registered packages
  for (var r=0; r<this.registered.length; r++) {
    // for all import requests
    for (var i=0; i<this.imports.length; i++) {
      var imp = this.imports[i];
      // for all dependencies, backwards
      for (var p=imp.packs.length -1; p>=0; p--) {
        if (imp.packs[p] == this.registered[r]) { // resolved?
          // remove it from the dependency list
          imp.packs.splice(p, 1);
        }
      }
    }
  }

  // for all import requests, backwards
  for (var i=this.imports.length -1; i>=0; i--) {
    var imp = this.imports[i];
    // All dependencies resolved?
    if (imp.packs.length == 0) {
      // Ok, remove and add to callbacks list
      this.imports.splice(i, 1);
      callbacks.push(imp.func);
    }
  }

  // call callback functions
  for (var i=callbacks.length-1; i>=0; i--)
    callbacks[i]();
};

/**
 * Gets and optionally creates the scope associated with the supplied name
 */
Package.scope = function(name, create) {
	if (!name || name == "") return window;

  var scope = window;
  var found = true;
  var parts = name.split(".");
  for (var i=0, len=parts.length; i<len; i++) {
    if (typeof scope[parts[i]] != "undefined")
      scope = scope[parts[i]];
    else if (create)
      scope = scope[parts[i]] = {};
    else
      found = false;
  }
  return found ? scope : null;
};

/**
 * Sends a debug message to the log if debug is enabled
 */
Package.debug = function() {
  if (Package.debugEnabled()) console.log.apply(console, arguments);
};

/**
 * Checks if debug is enabled by looking at the querystring
 */
Package.debugEnabled = function() {
  return ((location.search.indexOf("?debug=true") >= 0) || (location.search.indexOf("&debug=true") >= 0));
};

// Initializes Packages JS
Package.init = function() {
  this.registered = [];
  this.imports = [];
  this.file = "packages.js";
  this.script = this.find(this.file);
  this.url = this.script.src.substring(0, this.script.src.indexOf(this.file));
};

// Call Init
Package.init();

// Gets the argument names of a function, thanks to http://www.prototypejs.org/
Function.prototype.argumentNames = function() {
  var names = this.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",");
  for (var i=0, len=names.length; i<len; i++)
     names[i] = names[i].replace(/^\s+/, '').replace(/\s+$/, '');
  return len == 1 && !names[0] ? [] : names;
};

// Creates a blank console object, courtesy of firebugx.js
(function() {
	// anonymous function forms a closure

  if (!("console" in window) || !("firebug" in console)) {
  	// names of all methods in the Firebug log API
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
        "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
		// create a dummy console object and give it all methods in the API
		if (!("console" in window))
			window.console = {};
    for (var i = 0; i < names.length; ++i)
      if (! (names[i] in console))
      	console[names[i]] = function() {};
  }
})(); // <-- immediately call it
