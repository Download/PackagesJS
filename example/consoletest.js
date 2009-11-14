Package("example.consoletest", ["dom.event", "dom.Behaviour"], function(addEvent, Behaviour) {
	var rules = {
		'#doLog': function(element){
			addEvent(element, "click", function(evt) {
				var text = document.getElementById("logtext").value;
				var level = document.getElementById("loglevel").value;
				if (level == "error")
					console.error(text);
				else if (level == "warning")
					console.warn(text);
				else if (level == "info")
					console.info(text);
				else
					console.log(text);
			});
		}
	};

	Behaviour.register(rules);
});