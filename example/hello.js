Package("example.hello", [], function() {
	// Create a function greeting...
	function greeting() {
		console.info("Hello world!");
	};

	// ...then export it for use by other packages
	Export(greeting, "greeting");

  // Alternatively, use inline function syntax
	Export(function() {
		console.info("Those who are about to die salute you!");
	}, "salute");
});
