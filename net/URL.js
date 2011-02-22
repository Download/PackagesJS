/**
 * net.URL - URL's in Javascript	by Stijn de Witt
 *
 * Class to inspect an manipulate URL's. Divides a URL into these parts:
 * protocol, user, domain, port, path, file, querystring, reference.
 *
 * http://joe@site.com:80/home/faq/faq.php?command=search&keyword=hello#footer
 * \ _/   \_/ \__ ___/ \/\___ ____/\__ __/\   ^      ^     ^      ^   /\__ __/
 *	 |       \    |      \    |        |    \ param value param value /    |
 * protocol user domain port path   file    -------------|----------- reference
 *                                                    querystring
 *
 * Exports 		URL
 *
 * Inspired by code from Adam Vandenberg
 * http://adamv.com/dev/javascript/files/querystring.js
 */
Package("net.URL", ["lang.Class", "net.QueryString"], function(Class, QueryString) {

  /**
   * Represents a URL.
   */
	Export(Class("URL", {
		initialize: function(url) {
			this.protocol = "";
			this.user = "";
			this.domain = "";
			this.port = "";
			this.path = "";
			this.file = "";
			this.reference = "";

			var sep = url.indexOf("?");
			// Do we have a querystring indicator?
			if (sep != -1) {
				var qs = url.substring(sep);
				var idx = qs.indexOf('#');
				// Do we have a reference?
				if (idx != -1) {
					this.reference = qs.substring(idx);
					qs = qs.substring(0, idx);
				}
				this.querystring = new QueryString(qs);
				url = url.substring(0, sep);
			}
			else
				this.querystring = new QueryString("");
			
			sep = url.indexOf("://");
			// Do we have a protocol indicator?
			if (sep != -1) {
				this.protocol = url.substring(0, sep);
				url = url.substring(sep + 3);
				// If we have a protocol, we might have a domain, check path separator
				sep = url.indexOf("/");
				if (sep != -1) {
					this.domain = url.substring(0, sep);
					url = url.substring(sep);
				}
				else {
					this.domain = url;
					url = "";
				}
				// get user and port
				sep = this.domain.indexOf("@");
				if (sep != -1) {
					this.user = this.domain.substring(0, sep);
					this.domain = this.domain.substring(sep + 1);
				}
				sep = this.domain.indexOf(":");
				if (sep != -1) {
					this.port = this.domain.substring(sep + 1);
					this.domain = this.domain.substring(0, sep);
				}
			}
			// querystring, protocol and domain are chopped from url. All that's left is the path and file
			sep = url.lastIndexOf('/');
			if (sep != -1 && sep < url.length - 1) {
				this.file = url.substring(sep + 1);
				url = url.substring(0, sep + 1);
			}
			this.path = url;
		},

		toString: function() {
			var result = "";
			if (this.protocol != "") result += this.protocol + "://";
			if (this.user != "") result += this.user + "@";
			result += this.domain;
			if (this.port != "") result += ":" + this.port;
			result += this.path;
			result += this.file;
			result += this.querystring.toString();
			if (this.reference != "") result += this.reference;
			return result;
		}
	}));
});