Package("example.hello", [], function() {
	// Create a function greeting...
	function greeting() {
		console.info("Hello world!");
	};

	// ...then export it for use by other packages
	Export(greeting);

   // Alternatively, use inline function syntax
	Export(function salute() {
		console.info("Those who are about to die salute you!");
	});
	
	// You need to supply a name for anonymous functions...
	Export("goodbye", function() {
		console.info("Goodbye cruel world!");
	});
});
