/*
    ***** BEGIN LICENSE BLOCK *****
    
    Copyright © 2009 Center for History and New Media
                     George Mason University, Fairfax, Virginia, USA
                     http://zotero.org
    
    This file is part of Zotero.
    
    Zotero is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    Zotero is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    
    You should have received a copy of the GNU General Public License
    along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
    
    ***** END LICENSE BLOCK *****
*/

var Zotero_Bibliography_Dialog = new function () {
	var bibEditInterface;
	var itemSet;
	var _originalBibEntry;
	var _lastSelectedItem;
	
	this.load = load;
	this.treeItemSelected = treeItemSelected;
	this.listItemSelected = listItemSelected;
	this.add = add;
	this.remove = remove;
	this.accept = accept;
	
	/*
	 * initialize add citation dialog
	 */
	function load() {
		document.getElementById('editor').format = "Integration";
		
		bibEditInterface = window.arguments[0].wrappedJSObject;
		itemSet = bibEditInterface.getItemSet();
		
		// load (from selectItemsDialog.js)
		doLoad();
		
		// load bibliography entires
		_loadItems();
	}
	
	/*
	 * called when an item in the item selection tree is clicked
	 */
	function treeItemSelected() {
		var items = itemsView.getSelectedItems(true); // treeview from selectItemsDialog.js
		
		// disable add if item already in itemSet
		document.getElementById("add").disabled = !items.length || itemSet.getItemsByIds([items[0]])[0];
	}
	
	/*
	 * called when an item in the reference list is clicked
	 */
	function listItemSelected() {
		var selectedListItem = document.getElementById("item-list").getSelectedItem(0);
		
		// enable remove if item is selected
		document.getElementById("remove").disabled = !selectedListItem;
		
		if(selectedListItem) {
			_updatePreview(itemSet.getItemsByIds([selectedListItem.value])[0]);
		} else {
			_updatePreview(false);
		}
	}
	
	/*
	 * Adds a citation to the reference list
	 */
	function add() {
		var item = itemsView.getSelectedItems()[0]; // treeview from selectItemsDialog.js
		
		bibEditInterface.add(item);
		document.getElementById("add").disabled = true;
		_loadItems();
	}
	
	/*
	 * Deletes a citation from the reference list
	 */
	function remove() {
		var selectedListItem = document.getElementById("item-list").getSelectedItem(0);
		var itemID = selectedListItem.value;
		var item = itemSet.getItemsByIds([itemID])[0];
		
		if(bibEditInterface.isCited(item)) {
			var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
											.getService(Components.interfaces.nsIPromptService);
			
			var out = {};
			var regenerate = promptService.confirmEx(
				window,
				Zotero.getString('integration.deleteCitedItem.title'),
				Zotero.getString('integration.deleteCitedItem.body'),
				promptService.STD_OK_CANCEL_BUTTONS+promptService.BUTTON_POS_1_DEFAULT,
				null, null, null, null, out
			);
			
			if(regenerate != 0) return;
		}
		
		bibEditInterface.remove(item);
		_loadItems();
	}
	
	/*
	 * Called on "Accept" button
	 */
	function accept() {
		_updatePreview();
	}
	
	/*
	 * Updates the contents of the preview pane
	 */
	function _updatePreview(item) {
		var editor = document.getElementById('editor');
		
		if(_lastSelectedItem && editor.value != _originalBibEntry) {
			Zotero.debug("setting bibliography for "+_lastSelectedItem.getID()+" to "+editor.value);
			_lastSelectedItem.setProperty("bibliography-RTF", editor.value);
		}
		
		editor.readonly = !item;
		editor.value = _originalBibEntry = (item ? bibEditInterface.preview(item) : "");
		_lastSelectedItem = item;
	}
	
	/*
	 * loads items from itemSet
	 */
	function _loadItems() {
		// delete all existing items from list
		var itemList = document.getElementById("item-list");
		while(itemList.firstChild) {
			itemList.removeChild(itemList.firstChild);
		}
		
		// add new items
		for(var i=0; i<itemSet.items.length; i++) {
			var item = itemSet.items[i].zoteroItem;
			
			var itemNode = document.createElement("listitem");
			itemNode.setAttribute("value", item.getID());
			itemNode.setAttribute("label", item.getField("title"));
			itemNode.setAttribute("class", "listitem-iconic");
			itemNode.setAttribute("image", item.getImageSrc());
			itemList.appendChild(itemNode);
		}
		
		_updatePreview();
	}
}