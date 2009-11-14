Package("example.greetingtest", ["example.hello"], function(greeting) {
	// Inside the callback, greeting is available. It has been injected
	// by Packages JS with the function exported from example.hello.
	greeting();
	// Alternatively, you can use the fully qualified name of the
	// exported object to reference it directly.
	example.hello.salute();
});
