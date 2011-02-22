/**
 * example.greeting - Example package for Packages JS
 *
 * Basic 'Hello World!' example, producer part.
 *
 * exports       hello, salute, goodbye
 * copyright     2011 by Stijn de Witt, some rights reserved.
 * license       http://creativecommons.org/licenses/by/3.0/ 
 */
Package("example.greeting", function() {
	// Create a function hello...
	function hello() {
		return "Hello world!";
	};

	// ...then export it for use by other packages
	Export(hello);

   // Alternatively, use inline function syntax
	Export(function salute() {
		return "Those who are about to die salute you!";
	});
	
	// You need to supply a name for anonymous functions...
	Export("goodbye", function() {
		return "Goodbye cruel world!";
	});
});
