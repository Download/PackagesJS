Package("example.eventtest", ["dom.event"], function(addEvent, removeEvent) {

	function contentLoaded(evt) {
		console.info("DOMContentLoaded. More handlers...");

		console.log("There are " + addEvent.listeners.length + " listeners for DOMContentLoaded:");
		for (var i=0, len=addEvent.listeners.length; i<len; i++)
			console.log("[" + (i + 1) + "]: " + addEvent.listeners[i]);
		console.log("Removing this one...");
		removeEvent(document, "DOMContentLoaded", contentLoaded);
		console.log("Now " + addEvent.listeners.length + " listeners remain:");
		for (var i=0, len=addEvent.listeners.length; i<len; i++)
			console.log("[" + (i + 1) + "]: " + addEvent.listeners[i]);
	}

	addEvent(window, "load", function(evt) {
		console.info("onload. Document loaded completely. event=" + evt + "; this=" + this + ";");
	});

	addEvent(document, "DOMContentLoaded", function(evt) {
		console.info("DOMContentLoaded. Document ready. event=" + evt + "; this=" + this);
	});

	addEvent(window, "load", function(evt) {
		console.info("onload. Just another onload handler.");
	});

	addEvent(document, "DOMContentLoaded", function(evt) {
		console.info("DOMContentLoaded. Yet another handler");
	});

	addEvent(window, "load", function (evt) {
		console.info("onload. More onload handlers...");
	});

	addEvent(document, "DOMContentLoaded", contentLoaded);
});
