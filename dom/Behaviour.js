/**
 * dom.Behaviour - Behaviour sheets in javascript
 * http://www.bennolan.com/behaviour/behaviour.js
 */

/*
	Behaviour v1.1 by Ben Nolan, June 2005. Based largely on the work
	of Simon Willison (see comments by Simon in dom.select).

	Description:
		Uses css selectors to apply javascript behaviours to enable
		unobtrusive javascript in html documents.

	Usage:
		var myrules = {
			'b.someclass' : function(element){
				element.onclick = function(){
					alert(this.innerHTML);
				}
			},
			'#someid u' : function(element){
				element.onmouseover = function(){
					this.innerHTML = "BLAH!";
				}
			}
		};
		Behaviour.register(myrules);

		Call Behaviour.apply() to re-apply the rules (if you update the dom, etc).

	License:
		This file is entirely BSD licensed.

	More information:
		http://ripcord.co.nz/behaviour/

*/

Package("dom.Behaviour", ["dom.event", "dom.Sizzle"], function(addEvent, Sizzle) {
	var Behaviour = {
		list : new Array,

		register: function(sheet){
			Behaviour.list.push(sheet);
			if (document.ready)
				Behaviour.apply(); // re-apply
		},

		apply: function(){
			for (h=0; sheet=Behaviour.list[h]; h++){
				for (selector in sheet){
					list = Sizzle(selector);
					if (!list) continue;
					for (i=0; element=list[i]; i++)
						sheet[selector](element);
				}
			}
		}
	};

	addEvent(document, "DOMContentLoaded", Behaviour.apply);

	Export(Behaviour);
});