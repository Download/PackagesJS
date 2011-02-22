/**
 * example.animals - Example package for Packages JS
 *
 * Demonstrates the use of the Class function in Packages JS by defining 
 * some animals and eating preferences.
 *
 * exports       Animal, Mouse, Cat, HouseCat
 * copyright     2011 by Stijn de Witt, some rights reserved.
 * license       http://creativecommons.org/licenses/by/3.0/ 
 */
Package("example.animals", ["lang.Class"], function(Class, log) {
	// Create a base class Animal. The first parameter is the name for the new 
	// class and the second parameter is an object literal holding the methods 
	// our class will get. The method 'initialize' is invoked when a new 
	// instance object is created from the class.
	var Animal = Class("Animal", {
		// Recognized as constructor because it's called initialize
		initialize: function(name) {
			// all member fields should be created and initialized in the constructor
			this.name = name;
			// this.constructor.name gives access to the classname.
			log().info("A " + this.constructor.name + " named " + name + " is born!");
		},

		// Methods
		likes: function(food) { /* semi-abstract method */ },

		// Calls the 'abstract' likes method to determine whether the animal 
		// will eat the given food.
		// Generic Animals don't like any food, but specific animals (like Cats) 
		// may override likes to indicate their feeding preference.
		eat: function(food) {
			if (this.likes(food))
				log().info("Yum! I like " + food + "!");
			else
				log().info("Yuk! I don't eat " + food + ".");
		},

		// Print the type and instance name of this object
		toString: function() {
			return "[object " + this.constructor.name + (this.name ? " \"" + this.name + "\"]" : "]");
		}
	});

	// Create a class Mouse that extends Animal. In this case we pass three
	// parameters, the third being the object literal again, but the second
	// parameter is now treated as the base class for our new class. You can
	// actually pass more than three arguments, but only the second argument
	// will be treated as a base class and only if it's a function. Any
	// subsequent arguments will be treated the same, adding any methods
	// from the object to the new class prototype.
	var Mouse = Class("Mouse", Animal, {
		// override likes
		likes: function(food) {
			return (food == "cheese");
		}
	});

	// Create a class Cat that extends Animal
	var Cat = Class("Cat", Animal, {
		likes: function(food) {
			return (food instanceof Mouse);
		}
	});
	
	// Notice that our classes are defined in local variables.
	// Using the Export function we can make them available to other packages.
	Export(Animal);
	Export(Mouse);
	Export(Cat);

	// We can also export directly without first assigning to a local variable.
	// Create a class HouseCat that extends Cat.
	Export(Class("HouseCat", Cat, {
		// HouseCats like whiskas, and whatever Cats like.
		// Notice the use of the extra first parameter $super. 
		// This is taken out and replaced with a reference to the super function.
		// client code will still call likes(food).
		likes: function($super, food) {
			return (food == "whiskas" || $super(food));
		}
	}));

	// An alternative export could have been:
	// Export("HouseCat", Class(Cat, { /* ... */	}));
	// However, this has the disadvantage that the HouseCat class will not 
	// 'know' it's own name.
});