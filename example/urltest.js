Package("example.urltest", ["net.URL","net.QueryString"], function(URL, QueryString, log) {
	log().info("Testing URL's...");

	var testurls = [
		new URL(location.href),
		new URL("file:///C:/downloads/packages/packages.html?test=hello+world"),
		new URL("http://company.com:80/home/faq?command=search&keyword=hello#ref"),
		new URL("ftp://paul@ftp.cs.uu.nl/mirror/apache.org/dist/"),
		new URL("mailto://john.doe@company.com")
	];

	for (var i=0, len=testurls.length; i<len; i++) {
		var url = testurls[i];
	  log().info("url=\"" + url + "\";\n" +
			  	"url.protocol=" + url.protocol + ";\n" +
			  	"url.user=" + url.user + ";\n" +
			  	"url.domain=" + url.domain + ";\n" +
			  	"url.port=" + url.port + ";\n" +
			  	"url.path=" + url.path + ";\n" +
			  	"url.file=" + url.file + ";\n" +
			  	"url.querystring=" + url.querystring + ";\n" +
			  	"url.reference=" + url.reference + ";\n" +
			  	"url.querystring.get(\"test\")=" + url.querystring.get("test") + ";\n");
	}
});