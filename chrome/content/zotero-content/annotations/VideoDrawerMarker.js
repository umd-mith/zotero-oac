var p = document.getElementById('player');
var tm = null, ui = null, oldAnnos = null;
var allShapes = [];
//var oldAudio = {"moments":[],"ranges":[]};
oldAudio = null;
var selTime = null;
var links = [];

function savable() {
	
	//  alltimes below is an array of objects each 
	//  containing moments and ranges.  The code
	//  must reflect this.
	timesArray = tm.savable();
	times = timesArray[0];
	moments = times.moments;
	ranges = times.ranges;
	
	
	_.each(moments,function(m){
		m.con="moment";
		allShapes.push(m);
	});
	_.each(ranges,function(r){
		r.con="range";
		allShapes.push(r);
	});
	
	/*for (var n in allShapes) {
		
		
			st = allShapes[n];
		txt = "";
			for (var q in st) {
				
				txt = txt +","+q+" "+st[q];
			}
			
			retArray.push(st);
			
			
			
		
	}*/
	debug("laundry: "+JSON.stringify(allShapes));
	return JSON.stringify(allShapes);
	
	
}
/*
function mode(s) {
	$("h3").draggable();
	return p.setMode(s);
}*/
function clearShapes(){
	drawer._allObjs=[];
	drawer._paper.clear();
	
}
function installHandlers(){
	
	$(".time-marker-moment>td").unbind("click");
	$(".time-marker-moment>td").bind("click",function(e,ui){
		
		clearShapes();
		$(".selectedTime").removeClass("selectedTime");
		$(this).parent().addClass("selectedTime");
		tId = parseInt($(this).parent().attr("id").substring(4));
		
		showShapes(tId);	
	});
}
function showShapes(tId){
	
	shapes = _.select(allShapes,function(st){
				
				return st.timeId == tId;
	});
	clearShapes();
	
	_.each(shapes,function(ms){
			
				drawer._allObjs.push(ms);
			
	});
	drawer._redrawShapes(drawer);

	
	
}
function saveSelectedShapes(){
	if ($(".selectedTime").length==0) {
		sId = 0;
	}
	else {
		
		sId = parseInt($(".selectedTime:first").attr("id").substring(4));
	}
		
		
		var momentShapes = drawer.savable();
		debug("from drawer:"+JSON.stringify(momentShapes) );
		
		for (n in momentShapes) {
			ms = momentShapes[n];
			
				if (ms.con) {
				
					
				
				
					ms.timeId = sId;
					
					allShapes.push(ms);
				
				
				
				}
			
		}
		if ($(".selectedTime").length>0) {
			clearShapes();
		}
	
	
	
}
function markNow() {

	/*
	if (tm._moments.length > 1) {
		var lastMoment = tm._moments[tm._moments.length - 1];
		var momentShapes = JSON.stringify(drawer.savable());
		shapeTimes.push({"momentId": lastMoment.id, "shapes": momentShapes});
	}*/
	saveSelectedShapes();
	tm.markNow();
	installHandlers();
	
	$(".selectedTime").removeClass("selectedTime");
	selMoment = tm._moments[tm._moments.length - 1];
	$("#mom_"+selMoment.id).addClass("selectedTime");
}

function markStartEnd() {
	tm.markStartEnd();
}

var inited = false;

function amReady() {
	
	if (inited) return;
	inited = true;
	ui = new PlayerUI({container: $("#player-ui-container"), player: p});
	if (tm === null) {
		
		setupTM();
		installHandlers();
	}
}

if (p.play) amReady();


//------image
function Note(old, pos) {
	this._cont = $("<div class=\"note-container\">" +
			"<div class=\"display\"></div>" +
			"<form class=\"edit\">" +
				"<textarea></textarea>" +
				"<div class=\"button-row\">" +
					"<input type=\"button\" value=\"Save\" class=\"save\" />" +
					"<input type=\"button\" value=\"Cancel\" class=\"cancel\" />" +
				"</div>" +
			"</form>" +
		"</div>");
	this._disp = $(".display", this._cont);
	this._edit = $(".edit", this._cont);
	this._area = $("textarea", this._cont);
	var save = $(".save", this._cont);
	var cancel = $(".cancel", this._cont);

	this._cont.appendTo(".vd-container");
	this._cont.css({left: pos.x, top: pos.y, position: "absolute"});
	this._disp.text(old || " ");
	this._area.val(old);

	var self = this;
	this._cont.mousedown(function (e) {e.stopPropagation();});
	this._cont.mouseup(function (e) {e.stopPropagation();});
	this._cont.keydown(function (e) {e.stopPropagation();});
	this._disp.click(function (e) {
		self._disp.css("display", "none");
		self._edit.css("display", "block");
		self._area.focus();
	});
	function awayEdit(e){
		self._disp.css("display", "block");
		self._edit.css("display", "none");
	};
	save.click(awayEdit);
	cancel.click(awayEdit);

	save.click(function (e) {
		self._disp.text(self._area.val() || " ");
		self._disp.focus();
	});
}

$.extend(Note.prototype, {
	close: function (){
		var ret = this._area.val();
		this._cont.remove();
		return ret;
	}
});

var drawer;
/*
function build(mode, scale, old) {
	drawer = new VectorDrawer(mode, scale, old, $("#player"), Note);
}
*/
function build(mode, scale,old) {
	oldAudio = {"moments": [], "ranges": []};
	allShapes =[];
	links = [];
	if (old) {
		debug("from before: "+old.length);
		_.each(old,function(o){
			 if (o) {
			 	debug("an object: "+JSON.stringify(o));
			 	if (o.con == "moment") {
			 		oldAudio.moments.push(o);
			 	}
			 	else 
			 		if (o.con == "range") {
			 			oldAudio.ranges.push(o);
			 		}
			 		else {
						
			 		   if (o.scale) {
				
					   	allShapes.push(o);
					   }
			 		//throw ("VideoDrawerMarker load error: Should not be reached.");
						}
				}
				else {
				//throw ("VideoDrawerMarker build error: Should not be reached.");
				}
			 
		});
	}
	
	setupTM();
	
	drawer = new VectorDrawer(mode, scale, [], $("#player"), Note);
	installHandlers();
}
function setupTM() {
	
	if (!ui || oldAudio == null) return;
		//if (tm === null) {
		tm = new TimeMarker({
			container: $("#time-marker-container"),
			player: p,
			initState: [oldAudio],
			formatTime: function(t){
				return ui.formatTime(t);
			}
		});
	//}
}

function scale(s) {
	drawer.scale(s);
}

function mode(m) {
	drawer.drawMode(m);
}

