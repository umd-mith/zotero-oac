$("#mark-moment").click(function () {markNow();});
var mr = $("#mark-range");
mr.click(function () {markStartEnd();});
mr.toggle(
  function () {mr.text("...End range");},
  function () {mr.text("Start a range...");}
);


function changeNote(obj, isRange, txt, num){
	
	$(obj).replaceWith("<span id='editingSpan'><input type='text' value='"+txt+"' size='20'/></span>");
	newobj = $("#editingSpan>input:first");
	newobj.bind("blur",{"isRange": isRange,"num":num},function(e){
		
		txt = e.target.value;
		recordNote(e.target,e.data.isRange,txt,e.data.num);
		});
	newobj.select();
	
	$("#editingSpan").parent().next().find("img:first").replaceWith("<img alt='save' src='chrome://zotero-content/skin/annotations/images/annotate-audio-save.png'>");
	if (drawer) {
			drawer.disableKeyListener();
	}


}
function recordNote(obj, isRange, txt, num ){
	objParent = $(obj).parent();
	$(obj).replaceWith("<span>"+txt+"</span>").bind("mousedown",{"txt":txt,"isRange":isRange,"num":num},function(e){
		changeNote(e.target,e.data.isRange,e.data.txt,e.data.num);
	});
	
	objParent.next().find("img:first").replaceWith("<img alt='edit' src='chrome://zotero-content/skin/annotations/images/annotate-audio-edit.png'>");
	if (drawer) {
			drawer.enableKeyListener();
	}
	objParent.trigger('saveNoteEvent',[isRange,num,txt]);
	/*
	txt = content.value;
	var cpn = $(content.parentNode);
	cpn.html("<span onmousedown='changeNote(this,"+isRange+","+num+")'>"+txt+"</span>");
	if (drawer) {
			drawer.enableKeyListener();
		}
	$(cpn[0].parentNode.nextSibling.firstChild).html("<img alt='edit' src='chrome://zotero-content/skin/annotations/images/annotate-audio-edit.png'>");

	cpn.trigger('saveNoteEvent',[isRange,num,txt]);
	*/
}
function deleteNote(content,isRange,num){
	// TODO: We'll want a prompt to ensure intent eventually - DLR
	var row = $(content.parentNode.parentNode);
	row.trigger('deleteNoteEvent',[isRange,num]);
	row[0].parentNode.removeChild(row[0]);

}


