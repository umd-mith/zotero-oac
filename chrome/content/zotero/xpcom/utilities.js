// Zotero for Firefox Utilities

/////////////////////////////////////////////////////////////////
//
// Zotero.Utilities
//
/////////////////////////////////////////////////////////////////

Zotero.Utilities = function () {}

Zotero.Utilities.prototype.debug = function(msg) {
	Zotero.debug(msg, 4);
}

/*
 * See Zotero.Date
 */
Zotero.Utilities.prototype.formatDate = function(date) {
	return Zotero.Date.formatDate(date);
}
Zotero.Utilities.prototype.strToDate = function(date) {
	return Zotero.Date.strToDate(date);
}

/*
 * Cleans extraneous punctuation off an author name
 */
Zotero.Utilities.prototype.cleanAuthor = function(author, type, useComma) {
	if(typeof(author) != "string") {
		throw "cleanAuthor: author must be a string";
	}
	
	author = author.replace(/^[\s\.\,\/\[\]\:]+/, '');
	author = author.replace(/[\s\,\/\[\]\:\.]+$/, '');
	author = author.replace(/  +/, ' ');
	if(useComma) {
		// Add period for initials
		if(author.substr(author.length-2, 1) == " " || author.substr(author.length-2, 1) == ".") {
			author += ".";
		}
		var splitNames = author.split(/, ?/);
		if(splitNames.length > 1) {
			var lastName = splitNames[0];
			var firstName = splitNames[1];
		} else {
			var lastName = author;
		}
	} else {
		var spaceIndex = author.lastIndexOf(" ");
		var lastName = author.substring(spaceIndex+1);
		var firstName = author.substring(0, spaceIndex);
	}
	// TODO: take type into account
	return {firstName:firstName, lastName:lastName, creatorType:type};
}

/*
 * Cleans whitespace off a string and replaces multiple spaces with one
 */
Zotero.Utilities.prototype.cleanString = function(s) {
	if(typeof(s) != "string") {
		throw "cleanString: argument must be a string";
	}
	
	s = s.replace(/[\xA0\r\n\s]+/g, " ");
	s = s.replace(/^\s+/, "");
	return s.replace(/\s+$/, "");
}

/*
 * Cleans any non-word non-parenthesis characters off the ends of a string
 */
Zotero.Utilities.prototype.superCleanString = function(x) {
	if(typeof(x) != "string") {
		throw "superCleanString: argument must be a string";
	}
	
	var x = x.replace(/^[^\w(]+/, "");
	return x.replace(/[^\w)]+$/, "");
}

/*
 * Eliminates HTML tags, replacing <br>s with /ns
 */
Zotero.Utilities.prototype.cleanTags = function(x) {
	if(typeof(x) != "string") {
		throw "cleanTags: argument must be a string";
	}
	
	x = x.replace(/<br[^>]*>/gi, "\n");
	return x.replace(/<[^>]+>/g, "");
}

/*
 * Test if a string is an integer
 */
Zotero.Utilities.prototype.isInt = function(x) {
	if(parseInt(x) == x) {
		return true;
	}
	return false;
}

/*
 * Get current zotero version
 */
Zotero.Utilities.prototype.getVersion = function() {
	return Zotero.version;
}

/*
 * Get a page range, given a user-entered set of pages
 */
Zotero.Utilities.prototype._pageRangeRegexp = /^\s*([0-9]+)-([0-9]+)\s*$/;
Zotero.Utilities.prototype.getPageRange = function(pages) {
	var pageNumbers;
	var m = this._pageRangeRegexp.exec(pages);
	if(m) {
		// A page range
		pageNumbers = [m[1], m[2]];
	} else {
		// Assume start and end are the same
		pageNumbers = [pages, pages];
	}
	return pageNumbers;
}

/*
 * provide inArray function
 */
Zotero.Utilities.prototype.inArray = Zotero.inArray;

/*
 * pads a number or other string with a given string on the left
 */
Zotero.Utilities.prototype.lpad = function(string, pad, length) {
	while(string.length < length) {
		string = pad + string;
	}
	return string;
}

/*
 * returns true if an item type exists, false if it does not
 */
Zotero.Utilities.prototype.itemTypeExists = function(type) {
	if(Zotero.ItemTypes.getID(type)) {
		return true;
	} else {
		return false;
	}
}

/*
 * Cleans a title, capitalizing the proper words and replacing " :" with ":"
 */
Zotero.Utilities.capitalizeSkipWords = ["but", "or", "yet", "so", "for", "and",
"nor", "a", "an", "the", "at", "by", "from", "in", "into", "of", "on", "to",
"with", "up", "down"];
Zotero.Utilities.prototype.capitalizeTitle = function(title) {
	title = this.cleanString(title);
	title = title.replace(/ : /g, ": ");	
	var words = title.split(" ");
	
	// always capitalize first
	words[0] = words[0][0].toUpperCase() + words[0].substr(1);
	if(words.length > 1) {
		var lastWordIndex = words.length-1;
		// always capitalize last
		words[lastWordIndex] = words[lastWordIndex][0].toUpperCase() + words[lastWordIndex].substr(1);
		
		if(words.length > 2) {
			for(var i=1; i<lastWordIndex; i++) {
				// if not a skip word
				if(Zotero.Utilities.capitalizeSkipWords.indexOf(words[i].toLowerCase()) == -1 ||
				   (words[i-1].length && words[i-1][words[i-1].length-1] == ":")) {
					words[i] = words[i][0].toUpperCase() + words[i].substr(1);
				} else {
					words[i] = words[i].toLowerCase();
				}
			}
		}
	}
	
	return words.join(" ");
}

/*
 * END ZOTERO FOR FIREFOX EXTENSIONS
 */

/////////////////////////////////////////////////////////////////
//
// Zotero.Utilities.Ingester
//
/////////////////////////////////////////////////////////////////
// Zotero.Utilities.Ingester extends Zotero.Utilities, offering additional
// classes relating to data extraction specifically from HTML documents.

Zotero.Utilities.Ingester = function(translate, proxiedURL) {
	this.translate = translate;
}

Zotero.Utilities.Ingester.prototype = new Zotero.Utilities();

// Takes an XPath query and returns the results
Zotero.Utilities.Ingester.prototype.gatherElementsOnXPath = function(doc, parentNode, xpath, nsResolver) {
	var elmts = [];
	
	var iterator = doc.evaluate(xpath, parentNode, nsResolver, Components.interfaces.nsIDOMXPathResult.ANY_TYPE,null);
	var elmt = iterator.iterateNext();
	var i = 0;
	while (elmt) {
		elmts[i++] = elmt;
		elmt = iterator.iterateNext();
	}
	return elmts;
}

/*
 * Gets a given node as a string containing all child nodes
 */
Zotero.Utilities.Ingester.prototype.getNodeString = function(doc, contextNode, xpath, nsResolver) {
	var elmts = this.gatherElementsOnXPath(doc, contextNode, xpath, nsResolver);
	var returnVar = "";
	for(var i=0; i<elmts.length; i++) {
		returnVar += elmts[i].nodeValue;
	}
	return returnVar;
}

/*
 * Grabs items based on URLs
 */
Zotero.Utilities.Ingester.prototype.getItemArray = function(doc, inHere, urlRe, rejectRe) {
	var availableItems = new Object();	// Technically, associative arrays are objects
	
	// Require link to match this
	if(urlRe) {
		if(urlRe.exec) {
			var urlRegexp = urlRe;
		} else {
			var urlRegexp = new RegExp();
			urlRegexp.compile(urlRe, "i");
		}
	}
	// Do not allow text to match this
	if(rejectRe) {
		if(rejectRe.exec) {
			var rejectRegexp = rejectRe;
		} else {
			var rejectRegexp = new RegExp();
			rejectRegexp.compile(rejectRe, "i");
		}
	}
	
	if(!inHere.length) {
		inHere = new Array(inHere);
	}
	
	for(var j=0; j<inHere.length; j++) {
		var links = inHere[j].getElementsByTagName("a");
		for(var i=0; i<links.length; i++) {
			if(!urlRe || urlRegexp.test(links[i].href)) {
				var text = links[i].textContent;
				if(text) {
					text = this.cleanString(text);
					if(!rejectRe || !rejectRegexp.test(text)) {
						if(availableItems[links[i].href]) {
							if(text != availableItems[links[i].href]) {
								availableItems[links[i].href] += " "+text;
							}
						} else {
							availableItems[links[i].href] = text;
						}
					}
				}
			}
		}
	}
	
	return availableItems;
}

Zotero.Utilities.Ingester.prototype.lookupContextObject = function(co, done, error) {
	return Zotero.OpenURL.lookupContextObject(co, done, error);
}

Zotero.Utilities.Ingester.prototype.parseContextObject = function(co, item) {
	return Zotero.OpenURL.parseContextObject(co, item);
}

// Ingester adapters for Zotero.Utilities.HTTP to handle proxies

Zotero.Utilities.Ingester.prototype.loadDocument = function(url, succeeded, failed) {
	this.processDocuments([ url ], succeeded, null, failed);
}

Zotero.Utilities.Ingester._protocolRe = new RegExp();
Zotero.Utilities.Ingester._protocolRe.compile("^(?:(?:http|https|ftp):|[^:]*/)", "i");
Zotero.Utilities.Ingester.prototype.processDocuments = function(urls, processor, done, exception) {
	if(this.translate.locationIsProxied) {
		for(var i in urls) {
			if(this.translate.locationIsProxied) {
				urls[i] = Zotero.Ingester.ProxyMonitor.properToProxy(urls[i]);
			}
			// check for a protocol colon
			if(!Zotero.Utilities.Ingester._protocolRe.test(urls[i])) {
				throw("invalid URL in processDocuments");
			}
		}
	}
	
	// unless the translator has proposed some way to handle an error, handle it
	// by throwing a "scraping error" message
	if(!exception) {
		var translate = this.translate;
		exception = function(e) {
			translate._translationComplete(false, e);
		}
	}
	
	Zotero.Utilities.HTTP.processDocuments(null, urls, processor, done, exception);
}

Zotero.Utilities.Ingester.HTTP = function(translate) {
	this.translate = translate;
}

Zotero.Utilities.Ingester.HTTP.prototype.doGet = function(url, onDone) {
	if(this.translate.locationIsProxied) {
		url = Zotero.Ingester.ProxyMonitor.properToProxy(url);
	}
	if(!Zotero.Utilities.Ingester._protocolRe.test(url)) {
		throw("invalid URL in processDocuments");
	}
	
	var translate = this.translate;
	Zotero.Utilities.HTTP.doGet(url, function(xmlhttp) {
		try {
			onDone(xmlhttp.responseText, xmlhttp);
		} catch(e) {
			translate._translationComplete(false, e);
		}
	})
}

Zotero.Utilities.Ingester.HTTP.prototype.doPost = function(url, body, onDone) {
	if(this.translate.locationIsProxied) {
		url = Zotero.Ingester.ProxyMonitor.properToProxy(url);
	}
	if(!Zotero.Utilities.Ingester._protocolRe.test(url)) {
		throw("invalid URL in processDocuments");
	}
	
	var translate = this.translate;
	Zotero.Utilities.HTTP.doPost(url, body, function(xmlhttp) {
		try {
			onDone(xmlhttp.responseText, xmlhttp);
		} catch(e) {
			translate._translationComplete(false, e);
		}
	})
}

// These are front ends for XMLHttpRequest. XMLHttpRequest can't actually be
// accessed outside the sandbox, and even if it could, it wouldn't let scripts
// access across domains, so everything's replicated here.
Zotero.Utilities.HTTP = new function() {
	this.doGet = doGet;
	this.doPost = doPost;
	this.doHead = doHead;
	this.doOptions = doOptions;
	this.browserIsOffline = browserIsOffline;
	
	
	/**
	* Send an HTTP GET request via XMLHTTPRequest
	*
	* Returns false if browser is offline
	*
	* doGet can be called as:
	* Zotero.Utilities.HTTP.doGet(url, onDone)
	**/
	function doGet(url, onDone, onError) {
		Zotero.debug("HTTP GET "+url);
		if (this.browserIsOffline()){
			return false;
		}
		
		var xmlhttp = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
						.createInstance();
		
		var test = xmlhttp.open('GET', url, true);
		
		xmlhttp.onreadystatechange = function(){
			_stateChange(xmlhttp, onDone);
		};
		
		xmlhttp.send(null);
		
		return true;
	}
	
	
	/**
	* Send an HTTP POST request via XMLHTTPRequest
	*
	* Returns false if browser is offline
	*
	* doPost can be called as:
	* Zotero.Utilities.HTTP.doPost(url, body, onDone)
	**/
	function doPost(url, body, onDone) {
		Zotero.debug("HTTP POST "+body+" to "+url);
		if (this.browserIsOffline()){
			return false;
		}
		
		var xmlhttp = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
					.createInstance();
		
		xmlhttp.open('POST', url, true);
		xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		
		xmlhttp.onreadystatechange = function(){
			_stateChange(xmlhttp, onDone);
		};
		
		xmlhttp.send(body);
		
		return true;
	}
	
	
	function doHead(url, onDone) {
		Zotero.debug("HTTP HEAD "+url);
		if (this.browserIsOffline()){
			return false;
		}
		
		var xmlhttp = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
						.createInstance();
		
		var test = xmlhttp.open('HEAD', url, true);
		
		xmlhttp.onreadystatechange = function(){
			_stateChange(xmlhttp, onDone);
		};
		
		xmlhttp.send(null);
		
		return true;
	}
	
	
	/**
	* Send an HTTP OPTIONS request via XMLHTTPRequest
	*
	* doOptions can be called as:
	* Zotero.Utilities.HTTP.doOptions(url, body, onDone)
	*
	* The status handler, which doesn't really serve a very noticeable purpose
	* in our code, is required for compatiblity with the Piggy Bank project
	**/
	function doOptions(url, body, onDone) {
		Zotero.debug("HTTP OPTIONS "+url);
		if (this.browserIsOffline()){
			return false;
		}
		
		var xmlhttp = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
					.createInstance();
		
		xmlhttp.open('OPTIONS', url, true);
		
		xmlhttp.onreadystatechange = function(){
			_stateChange(xmlhttp, onDone);
		};
		
		xmlhttp.send(body);
		
		return true;
	}
	
	
	function browserIsOffline() { 
		return Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService).offline;
	}
	
	
	function _stateChange(xmlhttp, onDone){
		switch (xmlhttp.readyState){
			// Request not yet made
			case 1:
			break;
	
			// Called multiple while downloading in progress
			case 3:
			break;
	
			// Download complete
			case 4:
				if(onDone){
					onDone(xmlhttp);
				}
			break;
		}
	}
	
	
}

// Downloads and processes documents with processor()
// firstDoc - the first document to process with the processor (if null, 
//            first document is processed without processor)
// urls - an array of URLs to load
// processor - a function to execute to process each document
// done - a function to execute when all document processing is complete
// exception - a function to execute if an exception occurs (exceptions are
//             also logged in the Zotero for Firefox log)
// saveBrowser - whether to save the hidden browser object; usually, you don't
//               want to do this, because it makes it easier to leak memory
Zotero.Utilities.HTTP.processDocuments = function(firstDoc, urls, processor, done, exception, saveBrowser) {
	var hiddenBrowser = Zotero.Browser.createHiddenBrowser();
	hiddenBrowser.docShell.allowImages = false;
	var prevUrl, url;

	if (urls.length == 0) {
		if(firstDoc) {
			processor(firstDoc, done);
		} else {
			done();
		}
		return;
	}
	var urlIndex = -1;
	
	var removeListeners = function() {
		hiddenBrowser.removeEventListener("load", onLoad, true);
		if(!saveBrowser) {
			Zotero.Browser.deleteHiddenBrowser(hiddenBrowser);
		}
	}
	var doLoad = function() {
		urlIndex++;
		if (urlIndex < urls.length) {
			url = urls[urlIndex];
			try {
				Zotero.debug("loading "+url);
				hiddenBrowser.loadURI(url);
			} catch (e) {
				removeListeners();
				if(exception) {
					exception(e);
					return;
				} else {
					throw(e);
				}
			}
		} else {
			removeListeners();
			if(done) {
				done();
			}
		}
	};
	var onLoad = function() {
		Zotero.debug(hiddenBrowser.contentDocument.location.href+" has been loaded");
		if(hiddenBrowser.contentDocument.location.href != prevUrl) {	// Just in case it fires too many times
			prevUrl = hiddenBrowser.contentDocument.location.href;
			try {
				processor(hiddenBrowser.contentDocument);
			} catch (e) {
				removeListeners();
				if(exception) {
					exception(e);
					return;
				} else {
					throw(e);
				}
			}
			doLoad();
		}
	};
	var init = function() {
		hiddenBrowser.addEventListener("load", onLoad, true);
		
		if (firstDoc) {
			processor(firstDoc, doLoad);
		} else {
			doLoad();
		}
	}
	
	init();
}


/*
 * This would probably be better as a separate XPCOM service
 */
Zotero.Utilities.AutoComplete = new function(){
	this.getResultComment = getResultComment;
	
	function getResultComment(textbox){
		var controller = textbox.controller;
		
		for (var i=0; i<controller.matchCount; i++)
		{
			if (controller.getValueAt(i) == textbox.value)
			{
				return controller.getCommentAt(i);
			}
		}
		return false;
	}
}