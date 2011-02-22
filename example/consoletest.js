Package("example.consoletest", ["dom.event", "dom.Behaviour"], function(addEvent, Behaviour, log) {
	var rules = {
		'#doLog': function(element){
			addEvent(element, "click", function(evt) {
				var text = document.getElementById("logtext").value;
				var level = document.getElementById("loglevel").value;
				if (level == "error")
					log().error(text);
				else if (level == "warning")
					log().warn(text);
				else if (level == "info")
					log().info(text);
				else
					log().log(text);
			});
		}
	};

	Behaviour.register(rules);
});