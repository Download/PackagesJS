/**
 * net.QueryString - QueryStrings in Javascript  by Stijn de Witt
 *
 * Class that represents the QueryString part of a URL.
 *
 * Exports class QueryString.
 * SEE: net.URL
 *
 * Inspired by code from Adam Vandenberg
 * http://adamv.com/dev/javascript/files/querystring.js
 */
Package("net.QueryString", ["lang.Class"], function(Class) {

	/**
	 * Represents a URL's queurystring.
	 */
	var QueryString = Class.create({
		initialize: function(qs) {
			this.symbol = "";
			this.params = {};
			if (qs instanceof QueryString) qs = qs.toString();
			var saved = qs;
			if ((qs || qs == "")) {
				if (qs.indexOf("?") == 0) {
					this.symbol = "?";
					qs = qs.substring(1);
				}
			} else {
				if (window.location.href.indexOf("?") == 0)
						this.symbol = "?";
				qs = location.search.substring(1);
				saved = location.search;
			}
			this.qs = saved;
			if (qs.length == 0) return;
			// Turn <plus> back to <space>
			// See: http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.4.1
			qs = qs.replace(/\+/g, ' ')
			// parse out name/value pairs separated via &
			var args = qs.split('&')
			// split out each name=value pair
			for (var i=0, len=args.length; i<len; i++) {
				var value = null;
				var pair = args[i].split('=');
				var name = unescape(pair[0]);
				if (name == "") continue;
				if (pair.length == 2)
					value = unescape(pair[1]);
				else if (args[i].indexOf('=') != -1)
					value = "";
				else
					value = null;
				this.set(name, value);
			}
			// this.set() clears this.qs, so set it again.
			this.qs = saved;
		},

		/**
		 * Get the value of a parameter. May return a single value or
		 * an array of values. Check for a collection using
		 * result instanceof Array
		 */
		get: function(name, def) {
			var result = this.params[name];
			return result != null ? result : (def != null ? def : null);
		},

		/**
		 * Set the value of a parameter. If parameters with the supplied name
		 * already exist, adds the value to a collection. If value is an array,
		 * replaces any existing values with those provided in the array.
		 */
		set: function(name, value) {
			this.qs = null;

			// DELETE;
			if (value == null) {
				this.params[name] = null;
				return;
			}

			this.symbol = "?"
			// SET / REPLACE
			if (value instanceof Array) {
				this.params[name] = value;
				return;
			}

			// SET / ADD
			// already a param with that name?
			if (typeof this.params[name] == "string") {
				// create a collection
				var collection = new Array();
				collection.push(this.params[name])
				collection.push(value);
				this.params[name] = collection;

			}
			// already a collection?
			else if (this.params[name] instanceof Array)
				this.params[name].push(value);
			else
				this.params[name]=value;
		},

		/** Wipes this QueryString */
		clear: function() {
			this.qs = null;
			this.params = {};
		},

    /**
     * Returns the String representation of this QueryString. If you created
     * this object with an existing querystring and you din't set any
     * parameters, QueryString respects the original string and will return
     * it unchanged.
     */
		toString: function() {
			if (this.qs) return this.qs;
			var parms = [];
			for (key in this.params) {
				var value = this.params[key];
				if (value instanceof Array)
					for (var i=0, len=value.length; i<len; i++)
						parms.push(key + "=" + escape(value[i].replace(/\x20/g, "+")));
				else
					parms.push(key + (value == null ? "" : "=" + escape(value.replace(/\x20/g, "+"))));
			}
			return this.qs = this.symbol + parms.join("&");
		}
	});

  Export(QueryString);
});