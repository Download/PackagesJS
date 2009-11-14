/**
 * example.animals - Example package for Packages JS
 *
 * Defines some animals and eating preferences.
 */

// Create a package example.animals that uses package lang.Class.
// Place the package code in a callback function that takes as argument
// the Class objects exported by lang.Class.
Package("example.animals", ["lang.Class"], function(Class) {
	// Create a base class Animal using Class.create. The parameter is an object
	// literal holding the methods our class will get. The method 'initialize'
	// is recognized as the constructor for the class. As of prototype v1.6.0,
	// a constructor is no longer required.
	var Animal = Class.create({

		// This is actually a class-level field ('static' for Java folk)
		className: "Animal", // <-- object literal, so use comma's to separate fields

		// Recognized as constructor because it's called initialize
		initialize: function(name) {
			// all member fields should be created and initialized in the constructor
			this.name = name;
			console.info("A " + this.className + " named " + name + " is born!");
		},

		// Methods
		likes: function(food) { },

		eat: function(food) {
			if (this.likes(food))
				console.info("Yum! I like " + food + "!");
			else
				console.info("Yuk! I don't eat " + food + ".");
		},

		toString: function() {
			return "[object " + this.className + (this.name ? " \"" + this.name + "\"]" : "]");
		}
	});

	// Create a class Mouse that extends Animal. In this case we pass two
	// parameters, the second being the object literal again, but the first
	// parameter is now treated as the base class for our new class. You can
	// actually pass more than two arguments, but only the first argument
	// will be treated as a base class and only if it's a function. Any
	// subsequent arguments will be treated the same, adding any methods
	// from the object to the new class prototype.
	var Mouse = Class.create(Animal, {
		// Nice eh? In Javascript you can override 'static' fields
		className: "Mouse",

		// override likes
		likes: function(food) {
			return (food == "cheese");
		}
	});

	// Create a class Cat that extends Animal
	var Cat = Class.create(Animal, {
		className: "Cat",
		likes: function(food) {
			return (food instanceof Mouse);
		}
	});

	// Create a class HouseCat that extends Cat.
	var HouseCat = Class.create(Cat, {
		className: "HouseCat",
		// HouseCats like whiskas, and whatever Cats like.
		// Notice the use of the extra first parameter $super. This is taken out
		// by prototype and replaced with a reference to the super function.
		// client code will still call likes(food), but you see the extra param.
		likes: function($super, food) {
			return (food == "whiskas" || $super(food));
		}
	});

	// Notice that our classes are defined in local variables.
	// Using the Export function we can make them available to other packages.
	Export(Animal, "Animal");
	Export(Mouse, "Mouse");
	Export(Cat, "Cat");
	Export(HouseCat, "HouseCat");
});