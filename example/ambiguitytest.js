/**
 * example.ambiguitytest - Example package for Packages JS
 *
 * Basic ambiguity example.
 *
 * copyright     2011 by Stijn de Witt, some rights reserved.
 * license       http://creativecommons.org/licenses/by/3.0/ 
 */
Package("example.ambiguitytest", ["example.ambiguity", "example.greeting"], function(hello, log) {
	// Which hello did we get? The one from example.ambiguity or from example.greeting?
	log().info(hello());
	// We will get the first one found, so the one from example.ambiguity in this case.
	
	// Use fully qualified names to resolve any ambiguities.
	var goodbye1 = Import("example.greeting.goodbye");
	var goodbye2 = Import("example.ambiguity.goodbye");
	log().info(goodbye1());
	log().info(goodbye2());
});
