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
	if ($(".selectedTime").length==0) {
		sId = 0;
		}
		else {
		
		sId = $(".selectedTime:first").attr("id");
		}
	saveSelectedShapes(sId);
	
	timesArray = tm.savable();
	
	times = timesArray[0];
	moments = times.moments;
	ranges = times.ranges;
	if (moments.length > 0) {
		_.each(moments, function(m){
			m.con = "moment";
			allShapes.push(m);
			
			
		});
	}
	if (ranges.length > 0) {
		_.each(ranges, function(r){
			r.con = "range";
			allShapes.push(r);
			
			
			
		});
	}
	
	return JSON.stringify(allShapes);
	
	
}

function timeClick(clicked){
		
		if ($(".selectedTime").length==0) {
		sId = 0;
		}
		else {
		
		sId = $(".selectedTime:first").attr("id");
		}
		
		//tm._player.seekTo()
		saveSelectedShapes(sId);
	
		drawer.clearObjs();
		drawer._paper.clear();
		$(".selectedTime").removeClass("selectedTime");
		$(clicked).parent().addClass("selectedTime");
		time = $(clicked).parent().find("td:first").text();
		if (time.indexOf("to")>0){
			time = time.substring(time.indexOf("to"))
		}
		var realTime = parseTime(time);
		
		tm._player.seekTo(realTime);
		tm._player.play();
		tm._player.pause();
		tId = $(clicked).parent().attr("id");
		showShapes(tId);	
}
function installHandlers(){
	
	$(".time-marker-moment>td").unbind("click");
	$(".time-marker-range>td").unbind("click");
	$(".time-marker-moment>td").bind("click",function(e,ui){
		timeClick(this);
	});
	$(".time-marker-range>td").bind("click",function(e,ui){
		timeClick(this);
	});
}
function showShapes(tId){
	drawer.clearObjs();
	drawer._paper.clear();
	var shapes = [];
	for (var i=0;i<allShapes.length;i++){
		st = allShapes[i];
		if ((st.timeId) == (tId)){
			drawer._allObjs.push(_.clone(st));
			shapes.push(i);
		}
	}
	for (var i = shapes.length-1; i>=0;i--) {

		allShapes.splice(parseInt(shapes[i]),1);
	}
	drawer._redrawShapes(drawer);

	
}
function saveSelectedShapes(sId){
	if (drawer) {
		var momentShapes = [];
		momentShapes = drawer.savable();
		for (var n = 0; n < momentShapes.length; n++) {
			ms = momentShapes[n];
			
			if (ms.con) {
				ms.timeId = sId;
				allShapes.push(ms);
			}
			
		}
		if ($(".selectedTime").length > 0) {
			drawer.clearObjs();
			drawer._paper.clear();
		}
		drawer._allObjs = [];
	}
		return;
	
}
function markNow() {

	if ($(".selectedTime").length==0) {
		sId = "mom_"+0;
		}
		else {
		
		sId = $(".selectedTime:first").attr("id");
	}
	saveSelectedShapes(sId);
	tm.markNow();
	installHandlers();
	
	$(".selectedTime").removeClass("selectedTime");
	selMoment = tm._moments[tm._moments.length - 1];
	$("#"+selMoment.id).addClass("selectedTime");
}

function markStartEnd() {
	if (self._start !== null) {
		if ($(".selectedTime").length == 0) {
			sId = 0;
		}
		else {
		
			sId = $(".selectedTime:first").attr("id");
		}
		saveSelectedShapes(sId);
	}
	tm.markStartEnd();
	if (self._start !== null) {
		installHandlers();
		
		$(".selectedTime").removeClass("selectedTime");
		selRange = tm._ranges[tm._ranges.length - 1];
		$("#" + selRange.id).addClass("selectedTime");
	}

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
		if (drawer) {
			drawer.disableKeyListener();
		}
		self._disp.css("display", "none");
		self._edit.css("display", "block");
		self._area.focus();
	});
	function awayEdit(e){
		if (drawer) {
			
			drawer.enableKeyListener();
		}
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
		_.each(old,function(o){
			 if (o) {
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

