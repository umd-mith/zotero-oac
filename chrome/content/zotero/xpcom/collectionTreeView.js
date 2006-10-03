/*
	Zotero
	Copyright (C) 2006   Center for History and New Media, George Mason University, Fairfax, VA
	http://chnm.gmu.edu/
*/

////////////////////////////////////////////////////////////////////////////////
///
///  CollectionTreeView
///    -- handles the link between an individual tree and the data layer
///    -- displays only collections, in a hierarchy (no items)
///
////////////////////////////////////////////////////////////////////////////////

/*
 *  Constructor the the CollectionTreeView object
 */
Zotero.CollectionTreeView = function()
{
	this._treebox = null;
	this.refresh();
	
	this._unregisterID = Zotero.Notifier.registerColumnTree(this);
}

/*
 *  Called by the tree itself
 */
Zotero.CollectionTreeView.prototype.setTree = function(treebox)
{
	if(this._treebox)
		return;
	this._treebox = treebox;
	//select Library
	this.selection.select(0);
}

/*
 *  Reload the rows from the data access methods
 *  (doesn't call the tree.invalidate methods, etc.)
 */
Zotero.CollectionTreeView.prototype.refresh = function()
{
	this._dataItems = new Array();
	this.rowCount = 0;
	this._showItem(new Zotero.ItemGroup('library',null),0,1);
	
	var newRows = Zotero.getCollections();
	for(var i = 0; i < newRows.length; i++)
		this._showItem(new Zotero.ItemGroup('collection',newRows[i]),  0, this._dataItems.length); //itemgroup ref, level, beforeRow
	
	var savedSearches = Zotero.Searches.getAll();
	for(var i = 0; i < savedSearches.length; i++)
		this._showItem(new Zotero.ItemGroup('search',savedSearches[i]),  0, this._dataItems.length); //itemgroup ref, level, beforeRow
	
	this._refreshHashMap();
}

/*
 *  Redisplay everything
 */
Zotero.CollectionTreeView.prototype.reload = function()
{
	var openCollections = new Array();
	
	for(var i = 0; i < this.rowCount; i++)
		if(this.isContainer(i) && this.isContainerOpen(i))
			openCollections.push(this._getItemAtRow(i).ref.getID());
	
	var oldCount = this.rowCount;
	this._treebox.beginUpdateBatch();
	this.refresh();
	this._treebox.rowCountChanged(0,this.rowCount - oldCount);
	
	for(var i = 0; i < openCollections.length; i++)
	{
		var row = this._collectionRowMap[openCollections[i]];
		if(row != null)
			this.toggleOpenState(row);
	}
	this._treebox.invalidate();
	this._treebox.endUpdateBatch();
}

/*
 *  Called by Zotero.Notifier on any changes to collections in the data layer
 */
Zotero.CollectionTreeView.prototype.notify = function(action, type, ids)
{
	var madeChanges = false;
	var ids = Zotero.flattenArguments(ids);
	
	if(action == 'remove')
	{
		//Since a remove involves shifting of rows, we have to do it in order
		
		//sort the ids by row
		var rows = new Array();
		for (var i in ids)
		{
			switch (type)
			{
				case 'collection':
					if(this._collectionRowMap[ids[i]] != null)
					{
						rows.push(this._collectionRowMap[ids[i]]);
					}
					break;
				
				case 'search':
					if(this._searchRowMap[ids[i]] != null)
					{
						rows.push(this._searchRowMap[ids[i]]);
					}
					break;
			}
		}
		
		if(rows.length > 0)
		{
			rows.sort(function(a,b) { return a-b });
			
			for(var i=0, len=rows.length; i<len; i++)
			{
				var row = rows[i];
				this._hideItem(row-i);
				this._treebox.rowCountChanged(row-i,-1);
			}
			
			madeChanges = true;
		}		
		
	}
	else if(action == 'move')
	{
		this.reload();
	}
	else if(action == 'modify')
	{
		for (var i in ids)
		{
			switch (type)
			{
				case 'collection':
					if (this._collectionRowMap[ids[i]] != null)
					{
						this._treebox.invalidateRow(this._collectionRowMap[ids[i]]);
					}
					break;
					
				case 'search':
					if (this._searchRowMap[ids[i]] != null)
					{
						// Search rows aren't mapped to native objects, so we
						// have to pull the new data manually
						this._getItemAtRow(this._searchRowMap[ids[i]]).ref =
							Zotero.Searches.get(ids[i]);
						this._treebox.invalidateRow(this._searchRowMap[ids[i]]);
					}
					break;
			}
		}
	}
	else if(action == 'add')
	{
		// Multiple adds not currently supported
		ids = ids[0];
		
		switch (type)
		{
			case 'collection':
				var item = Zotero.Collections.get(ids);
				this._showItem(new Zotero.ItemGroup('collection',item), 0, this.rowCount);
				break;
				
			case 'search':
				var search = Zotero.Searches.get(ids);
				this._showItem(new Zotero.ItemGroup('search', search), 0, this.rowCount);
				break;
		}
		
		this._treebox.rowCountChanged(this.rowCount-1,1);
		this.selection.select(this.rowCount-1);
		madeChanges = true;
	}
	
	if(madeChanges)
		this._refreshHashMap();
}

/*
 *  Unregisters view from Zotero.Notifier (called on window close)
 */
Zotero.CollectionTreeView.prototype.unregister = function()
{
	Zotero.Notifier.unregisterColumnTree(this._unregisterID);
}

Zotero.CollectionTreeView.prototype.isLibrary = function(row)
{
	return this._getItemAtRow(row).isLibrary();
}

Zotero.CollectionTreeView.prototype.isCollection = function(row)
{
	return this._getItemAtRow(row).isCollection();
}

Zotero.CollectionTreeView.prototype.isSearch = function(row)
{
	return this._getItemAtRow(row).isSearch();
}


////////////////////////////////////////////////////////////////////////////////
///
///  nsITreeView functions
///  http://www.xulplanet.com/references/xpcomref/ifaces/nsITreeView.html
///
////////////////////////////////////////////////////////////////////////////////

Zotero.CollectionTreeView.prototype.getCellText = function(row, column)
{
	var obj = this._getItemAtRow(row);
	
	if(column.id == "name_column")
		return obj.getName();
	else
		return "";
}

Zotero.CollectionTreeView.prototype.getImageSrc = function(row, col)
{
	var collectionType = this._getItemAtRow(row).type;
	return "chrome://zotero/skin/treesource-" + collectionType + ".png";
}

Zotero.CollectionTreeView.prototype.isContainer = function(row)
{
	return this._getItemAtRow(row).isCollection();
}

Zotero.CollectionTreeView.prototype.isContainerOpen = function(row)
{
	return this._dataItems[row][1];
}

Zotero.CollectionTreeView.prototype.isContainerEmpty = function(row)
{
	//NOTE: this returns true if the collection has no child collections
	
	var itemGroup = this._getItemAtRow(row);
	if(itemGroup.isCollection())
		return !itemGroup.ref.hasChildCollections();
	else
		return true;
}

Zotero.CollectionTreeView.prototype.getLevel = function(row)
{
	return this._dataItems[row][2];
}

Zotero.CollectionTreeView.prototype.getParentIndex = function(row)
{
	var thisLevel = this.getLevel(row);
	if(thisLevel == 0) return -1;
	for(var i = row - 1; i >= 0; i--)
		if(this.getLevel(i) < thisLevel)
			return i;
	return -1;
}

Zotero.CollectionTreeView.prototype.hasNextSibling = function(row, afterIndex)
{
	var thisLevel = this.getLevel(row);
	for(var i = afterIndex + 1; i < this.rowCount; i++)
	{	
		var nextLevel = this.getLevel(i);
		if(nextLevel == thisLevel) return true;
		else if(nextLevel < thisLevel) return false;
	}
}

/*
 *  Opens/closes the specified row
 */
Zotero.CollectionTreeView.prototype.toggleOpenState = function(row)
{
	var count = 0;		//used to tell the tree how many rows were added/removed
	var thisLevel = this.getLevel(row);

	this._treebox.beginUpdateBatch();
	if(this.isContainerOpen(row))
	{
		while((row + 1 < this._dataItems.length) && (this.getLevel(row + 1) > thisLevel))
		{
			this._hideItem(row+1);
			count--;	//count is negative when closing a container because we are removing rows
		}
	}
	else
	{
		var newRows = Zotero.getCollections(this._getItemAtRow(row).ref.getID()); //Get children
		
		for(var i = 0; i < newRows.length; i++)
		{
			count++;
			this._showItem(new Zotero.ItemGroup('collection',newRows[i]), thisLevel+1, row+i+1); //insert new row
		}
	}
	this._dataItems[row][1] = !this._dataItems[row][1];  //toggle container open value

	this._treebox.rowCountChanged(row+1, count); //tell treebox to repaint these
	this._treebox.invalidateRow(row);
	this._treebox.endUpdateBatch();	
	this._refreshHashMap();
}

////////////////////////////////////////////////////////////////////////////////
///
///  Additional functions for managing data in the tree
///
////////////////////////////////////////////////////////////////////////////////

/*
 *  Delete the selection
 */
Zotero.CollectionTreeView.prototype.deleteSelection = function()
{
	if(this.selection.count == 0)
		return;

	//collapse open collections
	for(var i=0; i<this.rowCount; i++)
		if(this.selection.isSelected(i) && this.isContainer(i) && this.isContainerOpen(i))
			this.toggleOpenState(i);
	this._refreshHashMap();
	
	//create an array of collections
	var rows = new Array();
	var start = new Object();
	var end = new Object();
	for (var i=0, len=this.selection.getRangeCount(); i<len; i++)
	{
		this.selection.getRangeAt(i,start,end);
		for (var j=start.value; j<=end.value; j++)
			if(!this._getItemAtRow(j).isLibrary())
				rows.push(j);
	}
	
	//iterate and erase...
	this._treebox.beginUpdateBatch();
	for (var i=0; i<rows.length; i++)
	{
		//erase collection from DB:
		var group = this._getItemAtRow(rows[i]-i);
		if(group.isCollection())
		{
			group.ref.erase();
		}
		else if(group.isSearch())
		{
			Zotero.Searches.erase(group.ref['id']);
		}
	}
	this._treebox.endUpdateBatch();
	
	if(end.value < this.rowCount)
		this.selection.select(end.value);
	else
		this.selection.select(this.rowCount-1);
}

/*
 *  Called by various view functions to show a row
 * 
 *  	itemGroup:	reference to the ItemGroup
 *  	level:	the indent level of the row
 *      beforeRow:	row index to insert new row before
 */
Zotero.CollectionTreeView.prototype._showItem = function(itemGroup, level, beforeRow)
{
	this._dataItems.splice(beforeRow, 0, [itemGroup, false, level]); this.rowCount++;
}

/*
 *  Called by view to hide specified row
 */
Zotero.CollectionTreeView.prototype._hideItem = function(row)
{
	this._dataItems.splice(row,1); this.rowCount--;
}

/*
 *  Returns a reference to the collection at row (see Zotero.Collection in data_access.js)
 */
Zotero.CollectionTreeView.prototype._getItemAtRow = function(row)
{
	return this._dataItems[row][0];
}

/*
 * Creates hash map of collection and search ids to row indexes
 * e.g., var rowForID = this._collectionRowMap[]
 */
Zotero.CollectionTreeView.prototype._refreshHashMap = function()
{	
	this._collectionRowMap = [];
	this._searchRowMap = [];
	for(var i=0; i < this.rowCount; i++){
		if (this.isCollection(i)){
			this._collectionRowMap[this._getItemAtRow(i).ref.getID()] = i;
		}
		else if (this.isSearch(i)){
			this._searchRowMap[this._getItemAtRow(i).ref.id] = i;
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
///
///  Command Controller:
///		for Select All, etc.
///
////////////////////////////////////////////////////////////////////////////////

Zotero.CollectionTreeCommandController = function(tree)
{
	this.tree = tree;
}

Zotero.CollectionTreeCommandController.prototype.supportsCommand = function(cmd)
{
}

Zotero.CollectionTreeCommandController.prototype.isCommandEnabled = function(cmd)
{
}

Zotero.CollectionTreeCommandController.prototype.doCommand = function(cmd)
{
}

Zotero.CollectionTreeCommandController.prototype.onEvent = function(evt)
{
}

////////////////////////////////////////////////////////////////////////////////
///
///  Drag-and-drop functions:
///		canDrop() and drop() are for nsITreeView
///		onDragStart(), getSupportedFlavours(), and onDrop() for nsDragAndDrop.js + nsTransferable.js
///
////////////////////////////////////////////////////////////////////////////////

/*
 *  Called while a drag is over the tree.
 */
Zotero.CollectionTreeView.prototype.canDrop = function(row, orient)
{
	if(typeof row == 'object')	//workaround... two different services call canDrop (nsDragAndDrop, and the tree)
		return false;
		
	try
	{
		var dataSet = nsTransferable.get(this.getSupportedFlavours(),nsDragAndDrop.getDragData, true);
	}
	catch (e)
	{
		//a work around a limitation in nsDragAndDrop.js -- the mDragSession is not set until the drag moves over another control.
		//(this will only happen if the first drag is from the collection list)
		nsDragAndDrop.mDragSession = nsDragAndDrop.mDragService.getCurrentSession();
		return false;
	}
	
	var data = dataSet.first.first;
	var dataType = data.flavour.contentType;
	
	//Highlight the rows correctly on drag:
	if(orient == 1 && row == 0 && dataType == 'zotero/collection') //for dropping collections into root level
	{
		return true;
	}
	else if(orient == 0)	//directly on a row...
	{
		var rowCollection = this._getItemAtRow(row).ref; //the collection we are dragging over
		
		if(dataType == 'zotero/item' || dataType == "text/x-moz-url")
		{
			var ids = data.data.split(',');
			for each(var id in ids)
			{
				var item = Zotero.Items.get(id);
				// Can only drag top-level items into collections
				if (item.isRegularItem() || !item.getSource())
				{
					// Make sure there's at least one item that's not already
					// in this collection
					if (!rowCollection.hasItem(id))
					{
						return true;
					}
				}
			}
			return false;
		}
		else if(dataType='zotero/collection' && data.data != rowCollection.getID() && !Zotero.Collections.get(data.data).hasDescendent('collection',rowCollection.getID()) )
			return true;	//collections cannot be dropped on themselves, nor in their children
	}
	return false;
}

/*
 *  Called when something's been dropped on or next to a row
 */
Zotero.CollectionTreeView.prototype.drop = function(row, orient)
{
	var dataSet = nsTransferable.get(this.getSupportedFlavours(),nsDragAndDrop.getDragData, true);
	var data = dataSet.first.first;
	var dataType = data.flavour.contentType;
	
	if(dataType == 'zotero/collection')
	{
		var oldCount = this.rowCount;
		
		var targetCollectionID;
		if(this._getItemAtRow(row).isCollection())
			targetCollectionID = this._getItemAtRow(row).ref.getID();
		var droppedCollection = Zotero.Collections.get(data.data);
		droppedCollection.changeParent(targetCollectionID);
		
		var selectRow = this._collectionRowMap[data.data];
		if(selectRow == null)
			selectRow = this._collectionRowMap[targetCollectionID];
		
		this.selection.selectEventsSuppressed = true;
		this.selection.clearSelection();
		this.selection.select(selectRow);
		this.selection.selectEventsSuppressed = false;
			
	}
	else if(dataType == 'zotero/item' && this.canDrop(row, orient))
	{
		var ids = data.data.split(',');
		var targetCollection = this._getItemAtRow(row).ref;
		for each(var id in ids)
		{
			var item = Zotero.Items.get(id);
			// Only accept top-level items
			if (item.isRegularItem() || !item.getSource())
			{
				targetCollection.addItem(id);
			}
		}
	}
	else if(dataType == 'text/x-moz-url' && this.canDrop(row, orient))
	{
		var url = data.data.split("\n")[0];
		
		/* WAITING FOR INGESTER SUPPORT
		var newItem = Zotero.Ingester.scrapeURL(url);
		
		if(newItem)
			this._getItemAtRow(row).ref.addItem(newItem.getID());
		*/
	}
}

/*
 *  Begin a drag
 */
Zotero.CollectionTreeView.prototype.onDragStart = function(evt,transferData,action)
{
	transferData.data=new TransferData();
	
	//attach ID
	transferData.data.addDataForFlavour("zotero/collection",this._getItemAtRow(this.selection.currentIndex).ref.getID());
}

/*
 *  Returns the supported drag flavors
 */
Zotero.CollectionTreeView.prototype.getSupportedFlavours = function () 
{ 
	var flavors = new FlavourSet();
	flavors.appendFlavour("text/x-moz-url");
	flavors.appendFlavour("zotero/item");
	flavors.appendFlavour("zotero/collection");
	return flavors; 
}

/*
 *  Called by nsDragAndDrop.js for any sort of drop on the tree
 */
Zotero.CollectionTreeView.prototype.onDrop = function (evt,dropdata,session) { }

////////////////////////////////////////////////////////////////////////////////
///
///  Functions for nsITreeView that we have to stub out.
///
////////////////////////////////////////////////////////////////////////////////

Zotero.CollectionTreeView.prototype.isSorted = function() 							{ return false; }
Zotero.CollectionTreeView.prototype.isSeparator = function(row) 					{ return false; }
Zotero.CollectionTreeView.prototype.isEditable = function(row, idx) 				{ return false; }
Zotero.CollectionTreeView.prototype.getRowProperties = function(row, prop) 		{ }
Zotero.CollectionTreeView.prototype.getColumnProperties = function(col, prop) 		{ }
Zotero.CollectionTreeView.prototype.getCellProperties = function(row, col, prop) 	{ }
Zotero.CollectionTreeView.prototype.performAction = function(action) 				{ }
Zotero.CollectionTreeView.prototype.performActionOnCell = function(action, row, col)	{ }
Zotero.CollectionTreeView.prototype.getProgressMode = function(row, col) 			{ }
Zotero.CollectionTreeView.prototype.cycleHeader = function(column)					{ }

////////////////////////////////////////////////////////////////////////////////
///
///  Zotero ItemGroup -- a sort of "super class" for collection, library,
///  	and saved search
///
////////////////////////////////////////////////////////////////////////////////

Zotero.ItemGroup = function(type, ref)
{
	this.type = type;
	this.ref = ref;
}

Zotero.ItemGroup.prototype.isLibrary = function()
{
	return this.type == 'library';
}

Zotero.ItemGroup.prototype.isCollection = function()
{
	return this.type == 'collection';
}

Zotero.ItemGroup.prototype.isSearch = function()
{
	return this.type == 'search';
}

Zotero.ItemGroup.prototype.getName = function()
{
	if(this.isCollection())
		return this.ref.getName();
	else if(this.isLibrary())
		return Zotero.getString('pane.collections.library');
	else if(this.isSearch())
		return this.ref['name'];
	else
		return "";
}

Zotero.ItemGroup.prototype.getChildItems = function()
{
	if(this.searchText)
	{
		var s = new Zotero.Search();
		if (this.isCollection())
		{
			s.addCondition('collectionID', 'is', this.ref.getID(), true);
		}
		else if (this.isSearch())
		{
			s.addCondition('savedSearchID', 'is', this.ref['id'], true);
		}
		s.addCondition('quicksearch', 'contains', this.searchText);
		return Zotero.Items.get(s.search());
	}
	else
	{
		if(this.isCollection())
			return Zotero.getItems(this.ref.getID());
		else if(this.isLibrary())
			return Zotero.getItems();
		else if(this.isSearch())
		{
			var s = new Zotero.Search();
			s.load(this.ref['id']);
			return Zotero.Items.get(s.search());
		}
		else
			return null;
	}
}

Zotero.ItemGroup.prototype.setSearch = function(searchText)
{
	this.searchText = searchText;
}