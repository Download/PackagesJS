/**
 * example.animaltest - Example package for Packages JS
 *
 * Demonstrates functionality in Packages JS and Classes JS by importing some
 * animals from example.animals and setting them to work.
 *
 * Observe how the classes that were exported by example.animals can be
 * imported into the local scope by using them as callback arguments, or
 * you can Import them into local variables.
 *
 * copyright     2011 by Stijn de Witt, some rights reserved.
 * license       http://creativecommons.org/licenses/by/3.0/ 
 */
Package("example.animaltest", ["example.animals"], function(Cat, Mouse, log) {
	// function arguments for the callback with names that match objects
	// exported by packages in the dependencies list are automagically
	// populated with the exported objects by Packages JS

	// Create some cats and mice
	var felix = new Cat("Felix");
	var mickey = new Mouse("Mickey");

	// Exported objects can also be imported explicitly
	var HouseCat = Import("example.animals.HouseCat");

	var tom = new HouseCat("Tom");
	var jerry = new Mouse("Jerry");

	// Who eats what (or who)?
	console.log("felix=" + felix);
	console.log("Feeding felix some cheese...");
	felix.eat("cheese");
	console.log("Feeding felix a mouse...");
	felix.eat(mickey);
	console.log("Feeding felix some whiskas...");
	felix.eat("whiskas");

	console.log("jerry=" + jerry);
	console.log("Feeding jerry some cheese...");
	jerry.eat("cheese");
	console.log("Feeding jerry a mouse...");
	jerry.eat(mickey);
	console.log("Feeding jerry some whiskas...");
	jerry.eat("whiskas");

	console.log("tom=" + tom);
	console.log("Feeding tom some cheese...");
	tom.eat("cheese");
	console.log("Feeding tom a mouse...");
	tom.eat(jerry);
	console.log("Feeding tom some whiskas...");
	tom.eat("whiskas");
});
