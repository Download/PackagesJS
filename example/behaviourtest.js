Package("example.behaviourtest", ["dom.event", "dom.Behaviour"], function(addEvent, Behaviour) {
	console.log("Behaviour example: creating rules...");
	var rules = {
		'.MessageBox' : function(element){
			addEvent(element, "click", function(evt){
				alert(this.innerHTML);
			});
		},
		'.ToolTip' : function(element){
			addEvent(element, "mouseover", function(evt) {
				this.oldInnerHTML = this.innerHTML;
				this.innerHTML = this.title;
			});
			addEvent(element, "mouseout", function(evt) {
				if (this.oldInnerHTML) {
					this.innerHTML = this.oldInnerHTML;
				}
			});
		}
	};

	console.log("Behaviour example: registering rules...");
	Behaviour.register(rules);
});