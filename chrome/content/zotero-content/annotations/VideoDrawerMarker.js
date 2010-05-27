var p = document.getElementById('player');
var tm = null, ui = null, oldAnnos = null;
var shapeTimes = [];



function savable() {
	
	//  alltimes below is an array of objects each 
	//  containing moments and ranges.  The code
	//  must reflect this.
	retValue = tm.savable();
	alltimes = retValue[0];
	
	times = alltimes.moments;
	_.each(shapeTimes,function(sT){
		matchMoment = _.detect(times,function(aMoment){
			return (aMoment.id == sT.mId);
			
		});
		matchMoment.shapes = sT.shapes;
		
	});
 
	debug("match moments: "+JSON.stringify(retValue));
	return JSON.stringify(retValue);
}
/*
function mode(s) {
	$("h3").draggable();
	return p.setMode(s);
}*/
function clearShapes(){
	drawer._allObjs=[];
	$(drawer._paper.canvas).remove();
	drawer._buildCanvas();
}
function markNow() {

	tm.markNow();
	if (tm._moments.length > 0) {
		var newMoment = tm._moments[tm._moments.length - 1];
		var momentShapes = JSON.stringify(drawer.savable());
		shapeTimes.push({"mId": newMoment.id, "shapes": momentShapes});
	}
	clearShapes();
}

function markStartEnd() {
	tm.markStartEnd();
}

var inited = false;

function amReady() {
	if (inited) return;
	inited = true;
	ui = new PlayerUI({container: $("#player-ui-container"), player: p});
	setupTM();
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
	oldAnnos = old;
	alert(JSON.stringify(old));
	moments = old[0].moments;
	oldAnnos.shapes=moments[moments.length-1].shapes;
	alert(oldAnnos.shapes);
	drawer = new VectorDrawer(mode, scale, oldAnnos, $("#player"), Note);
	setupTM();
}
function setupTM() {
	if (tm || !ui || oldAnnos === null) return;
	
	tm = new TimeMarker({
		container: $("#time-marker-container"),
		player: p,
		initState: oldAnnos,
		formatTime: function (t) {return ui.formatTime(t);}
	});
}

function scale(s) {
	drawer.scale(s);
}

function mode(m) {
	drawer.drawMode(m);
}

