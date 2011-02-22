Package("example.eventtest", ["dom.event"], function(addEvent, removeEvent, log) {

	function contentLoaded(evt) {
		log().info("DOMContentLoaded. More handlers...");

		log().log("There are " + addEvent.listeners.length + " listeners for DOMContentLoaded:");
		for (var i=0, len=addEvent.listeners.length; i<len; i++)
			log().log("[" + (i + 1) + "]: " + addEvent.listeners[i]);
		log().log("Removing this one...");
		removeEvent(document, "DOMContentLoaded", contentLoaded);
		log().log("Now " + addEvent.listeners.length + " listeners remain:");
		for (var i=0, len=addEvent.listeners.length; i<len; i++)
			log().log("[" + (i + 1) + "]: " + addEvent.listeners[i]);
	}

	addEvent(window, "load", function(evt) {
		log().info("onload. Document loaded completely. event=" + evt + "; this=" + this + ";");
	});

	addEvent(document, "DOMContentLoaded", function(evt) {
		log().info("DOMContentLoaded. Document ready. event=" + evt + "; this=" + this);
	});

	addEvent(window, "load", function(evt) {
		log().info("onload. Just another onload handler.");
	});

	addEvent(document, "DOMContentLoaded", function(evt) {
		log().info("DOMContentLoaded. Yet another handler");
	});

	addEvent(window, "load", function (evt) {
		log().info("onload. More onload handlers...");
	});

	addEvent(document, "DOMContentLoaded", contentLoaded);
});
