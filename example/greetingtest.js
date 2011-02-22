/**
 * example.greetingtest - Example package for Packages JS
 *
 * Basic 'Hello World!' example, consumer part.
 *
 * copyright     2011 by Stijn de Witt, some rights reserved.
 * license       http://creativecommons.org/licenses/by/3.0/ 
 */
Package("example.greetingtest", ["example.greeting"], function(hello, log) {
	// log is an implicit (exported by Packages JS) helper function that
	// returns the log console when available, or a void object otherwise.

	// Inside the callback, function hello is available. It has been injected
	// by Packages JS with the function exported from example.greeting.
	log().info(hello());
	
	// Alternatively, you can Import objects from the dependencies.
	var salute = Import("salute");
	log().info(salute());
	
	// You can use fully qualified names to resolve any ambiguities.
	var goodbye = Import("example.greeting.goodbye");
	log().info(goodbye());
});
