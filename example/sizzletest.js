Package("example.sizzletest", ["dom.Sizzle", "dom.event"], function(Sizzle, addEvent, log) {
	// Use it here...
	addEvent(document, "DOMContentLoaded", function() {
		// This function fires on DOMContentLoaded, so now we can count spans...
		var spans = Sizzle("div.test p span");
		log().info("Sizzle found " + spans.length + " spans: " + spans);
	});
	
});