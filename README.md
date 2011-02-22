Packages JS 1.0 RC2
====================

_Modular Javascript with Packages JS._

Packages JS is a small Javascript library for Javascript 1.6+ that introduces 
the concept of 'packages' into the language, thus enabling authors to write 
more modular and maintainable code.

Features
--------
* Isolation: Code in packages is isolated from the outside world by wrapping it
  in a function, preventing namespace pollution / namespace collisions.
* [Transitive dependencies](http://en.wikipedia.org/wiki/Transitive_dependency):
  Packages can have dependencies on other packages so that when such a package 
  is included in a page the packages it depends on are automatically loaded, 
  causing the packages they in turn depend on to be loaded as well, until all 
  dependencies are resolved.
* Small footprint: Both in API and in code size, Packages JS is small. It 
  exposes just three functions, Package, Export and Import, and the fully
  documented source is less than 300 lines.

Example
-------
Creating a package example.greeting in file example/greeting.js:

	Package("example.greeting", function() {
		// Create a function hello...
		function hello() {
			return "Hello world!";
		};

		// ...then export it for use by other packages
		Export(hello);
		
		// You need to supply a name for anonymous functions...
		Export("goodbye", function() {
			return "Goodbye cruel world!";
		});
	});

Using it from example.greetingtest in file example/greetingtest.js:

	Package("example.greetingtest", ["example.greeting"], function(hello, log) {
		// log is an implicit (exported by Packages JS) helper function that
		// returns the log console when available, or a void object otherwise.

		// Inside the callback, function hello is available. It has been injected
		// by Packages JS with the function exported from example.greeting.
		log().info(hello());

		// Alternatively, you can Import objects from the dependencies.
		var goodbye = Import("goodbye");
		log().info(goodbye());
	});
	
Further reading
---------------
Check out the blog dedicated to this project:
[http://packagesinjavascript.wordpress.com](http://packagesinjavascript.wordpress.com)
