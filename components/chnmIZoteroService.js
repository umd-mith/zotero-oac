const SCHOLAR_CONTRACTID = '@chnm.gmu.edu/Zotero;1';
const SCHOLAR_CLASSNAME = 'Zotero';
const SCHOLAR_CID = Components.ID('{e4c61080-ec2d-11da-8ad9-0800200c9a66}');
const SCHOLAR_IID = Components.interfaces.chnmIZoteroService;

const Cc = Components.classes;
const Ci = Components.interfaces;

// Assign the global scope to a variable to passed via wrappedJSObject
var ScholarWrapped = this;


/********************************************************************
* Include the core objects to be stored within XPCOM
*********************************************************************/

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/scholar.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/db.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/schema.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/data_access.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/notifier.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/history.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/search.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/ingester.js");
	
Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/translate.js");
	
Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/cite.js");
	
Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/utilities.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/integration.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/file.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/mime.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/itemTreeView.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://scholar/content/xpcom/collectionTreeView.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://global/content/nsTransferable.js");

Cc["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Ci.mozIJSSubScriptLoader)
	.loadSubScript("chrome://global/content/nsDragAndDrop.js");

/********************************************************************/


// Initialize the Scholar service
//
// This runs when ScholarService is first requested.
// Calls to other XPCOM components must be in here rather than in top-level
// code, as other components may not have yet been initialized.
function setupService(){
	Scholar.init();
}

function ScholarService(){
	this.wrappedJSObject = ScholarWrapped.Scholar;
	setupService();
}


/**
* Convenience method to replicate window.alert()
**/
function alert(msg){
	Cc["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Ci.nsIPromptService)
		.alert(null, "", msg);
}

/**
* Convenience method to replicate window.confirm()
**/
function confirm(msg){
	return Cc["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Ci.nsIPromptService)
		.confirm(null, "", msg);
}

//
// XPCOM goop
//
ScholarService.prototype = {
	QueryInterface: function(iid){
		if (!iid.equals(Components.interfaces.nsISupports) &&
			!iid.equals(SCHOLAR_IID)){
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		return this;
	}
};


var ScholarFactory = {
	createInstance: function(outer, iid){
		if (outer != null){
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		}
		return new ScholarService().QueryInterface(iid);
	}
};


var ScholarModule = {
	_firstTime: true,
	
	registerSelf: function(compMgr, fileSpec, location, type){
		if (!this._firstTime){
			throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
		}
		this._firstTime = false;
		
		compMgr =
			compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		
		compMgr.registerFactoryLocation(SCHOLAR_CID,
										SCHOLAR_CLASSNAME,
										SCHOLAR_CONTRACTID,
										fileSpec,
										location,
										type);
	},
	
	unregisterSelf: function(compMgr, location, type){
		compMgr =
			compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.unregisterFactoryLocation(SCHOLAR_CID, location);
	},
	
	getClassObject: function(compMgr, cid, iid){
		if (!cid.equals(SCHOLAR_CID)){
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		if (!iid.equals(Components.interfaces.nsIFactory)){
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		}
		return ScholarFactory;
	},
	
	canUnload: function(compMgr){ return true; }
};

function NSGetModule(comMgr, fileSpec){ return ScholarModule; }