/**
 * example.ambiguous - Example package for Packages JS
 *
 * Example demonstrating two packages exporting a function with the same name.
 *
 * exports       hello, salute, goodbye
 * copyright     2011 by Stijn de Witt, some rights reserved.
 * license       http://creativecommons.org/licenses/by/3.0/ 
 */
Package("example.ambiguity", function() {
	// functions hello and goodbye are also in example.greeting, making it ambiguous which
	// one is intended when using the unqualified name.
	function hello() {
		return "Hello ambiguity!";
	};

	function goodbye() {
		return "Goodbye ambiguity!";
	};

	// export for use by other packages
	Export(hello);
	Export(goodbye);
});
