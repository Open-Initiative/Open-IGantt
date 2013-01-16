var one_day = 1000*60*60*24;

function GanttBar(gantt, dates, bgClass) {
    this.gantt = gantt;
    this.bardiv = null;
    this.bgdiv = null;
    this.bgClass = bgClass;
    this.dates = dates;
}
GanttBar.prototype.updateDates = function updateDates() {
    var anchor, i, scale = this.gantt.scales[this.gantt.scale];
    var startDate = new Date(this.gantt.startDate.getTime() + this.bardiv.offsetLeft * scale);
    var anchors = this.bardiv.getElementsByClassName("ganttanchor");
    for(anchor = anchors[i=0]; i < anchors.length; anchor = anchors[++i])
        this.dates[i] = new Date(startDate.getTime() + anchor.offsetLeft * scale);
}
GanttBar.prototype.createAnchor = function createAnchor() {
    var anchor = document.createElement("div");
    anchor.className = "ganttanchor";
    anchor.style.cursor = "pointer";
    anchor.bar = this;
    this.bardiv.appendChild(anchor);
    
    anchor.onmousedown = makeObjectCallback(function(event){
            this.bar.draggedPhase = this.previousSibling;
            this.bar.startX = event.clientX - (this.previousSibling?this.previousSibling.clientWidth:0);
            document.onmousemove = makeObjectCallback(this.bar.dragAnchor, this.bar);
            document.onmouseup = makeObjectCallback(this.bar.dropAnchor, this.bar);
            event.stopPropagation();
            return false;
        }, anchor);
}
GanttBar.prototype.dragAnchor = function dragAnchor(event){
    if(this.draggedPhase) this.draggedPhase.style.width = event.clientX - this.startX + "px";
    else this.bardiv.style.left = event.clientX + "px";
    event.stopPropagation();
    return false;
}
GanttBar.prototype.dropAnchor = function dropAnchor(event){
    this.draggedAnchor = null;
    document.onmousemove = null;
    document.onmouseup = null;
    this.draggedPhase = null;
    this.updateDates();
    event.stopPropagation();
    return false;
}
GanttBar.prototype.addPhase = function addPhase(begin, end, className, title) {
    var div = document.getElementById(newDiv(this.bardiv.id));
    div.style.width = (((isNaN(end) || isNaN(begin))?0:(end - begin)) / this.gantt.scales[this.gantt.scale]) + "px";
    div.className = className;
    div.title = title;
    this.createAnchor();
    return div;
}
GanttBar.prototype.draw = function draw() {
    if(this.bgdiv) this.gantt.div.removeChild(this.bgdiv);
    if(this.bardiv) this.gantt.div.removeChild(this.bardiv);
    
    this.bgdiv = document.createElement("div");
    this.bgdiv.style.position = "absolute";
    this.bgdiv.style.top = (this.gantt.bars.indexOf(this) * this.gantt.rowHeight + this.gantt.headerHeight) + "px";
    this.bgdiv.style.height = this.gantt.rowHeight + "px";
    this.bgdiv.className = this.bgClass;
    this.gantt.div.appendChild(this.bgdiv);
    
    if(this.dates.length) {
        this.bardiv = document.getElementById(newDiv(this.gantt.div.id));
        this.bardiv.style.position = "absolute";
        this.bardiv.style.left = ((isNaN(this.dates[0])?0:(this.dates[0] - this.gantt.startDate)) / this.gantt.scales[this.gantt.scale]) + "px";
        this.bardiv.style.top = (this.gantt.bars.indexOf(this) * this.gantt.rowHeight + this.gantt.headerHeight+10) + "px";
        this.bardiv.style.width = ((this.dates[this.dates.length-1] - this.dates[0]) / this.gantt.scales[this.gantt.scale] + 10) + "px";
        this.createAnchor();
        
        var i;
        for(i=0; i < this.dates.length-1; i++)
            this.addPhase(this.dates[i], this.dates[i+1], "ganttbar"+(i+1),
                gettext("Phase"+i));
    }
}

function OIGantt(divid, startDate, endDate) {
    this.scales = [1000*60*5, 1000*60*60, 1000*60*60*6, 1000*60*60*24, 1000*60*60*24*7, "month", "year"];
    this.unitFormats = ["i", "H:i", "H:i", "d", "d", "m", "Y"];
    this.periodFormats = ["H:i", "H:i", "H:i", "d/m/Y", "d/m/Y", "m/Y", "Y"];
    this.scale = 1;
    this.rowHeight = 25;
    this.headerHeight = 31;
    this.space = null;
    
    parentdiv = document.getElementById(divid);
    this.startDate = startDate || new Date();
    this.endDate = new Date(Math.max(endDate, new Date(this.scales[this.scale]*parentdiv.style.width+(this.startDate.getTime()))));;
    this.bars = [];
    this.barids = {};
    this.space = null;

    this.div = document.getElementById(newDiv(divid));
    this.header = document.getElementById(newDiv(this.div.id));
    this.graph = document.getElementById(newDiv(this.div.id));
    this.div.className = "ganttbg";
    this.div.style.width = ((this.endDate - this.startDate) / this.scales[this.scale]) + "px";
    this.header.style.height = this.headerHeight + "px";
}
OIGantt.prototype.drawTimeline = function drawTimeline() {
    this.graph.innerHTML = "";
//    if(this.startDate.getDate() < 29) this.header.innerHTML = dateFormat(this.periodFormats[this.scale+2], this.startDate);
    this.graph.style.width = (this.endDate - this.startDate + this.scales[this.scale+2]) / this.scales[this.scale]+"px";
    
    var periodWidth = (this.scales[this.scale+2]/this.scales[this.scale]-1)+"px";
    for(var period = new Date(this.startDate); period<this.endDate; period.setTime(period.getTime()+this.scales[this.scale+2])) {
//        if(period.getDate()==1) this.graph.innerHTML += '<div style="float: left;position: relative;top: -'+this.headerHeight+'px;width:0">'+period.dateFormat("d/m/Y")+'</div>';
        var periodDiv = document.createElement("div");
        periodDiv.className = "ganttperiod";
        periodDiv.style.width = periodWidth;
        periodDiv.innerHTML = dateFormat(this.unitFormats[this.scale+2], period);
        this.graph.appendChild(periodDiv);
    }
    if(new Date() > this.startDate && new Date() < this.endDate) {
        var today = document.getElementById(newDiv(this.graph.id));
        today.className = "gantttoday";
        today.style.left = (new Date() - this.startDate) / this.scales[this.scale] + "px";
    }
}
OIGantt.prototype.redraw = function redraw(barNb) {
    this.drawTimeline();
    this.graph.style.height = (this.rowHeight * this.bars.length + this.headerHeight)+"px";
    if(!barNb || barNb==-1) barNb = 0;
    for(var i=barNb; i<this.bars.length; i++) 
        this.bars[i].draw();
}
OIGantt.prototype.unzoom = function unzoom() {
    if(this.scale < 3) this.scale++;
    this.redraw();
}
OIGantt.prototype.zoom = function zoom() {
    if(this.scale > 0) this.scale--;
    this.redraw();
}
OIGantt.prototype.addBar = function addBar(id, dates, afterid, bgClass) {
    var newBar = new GanttBar(this, dates, "ganttbg"+(bgClass || 0));
    var pos = this.bars.indexOf(this.barids[afterid]) + 1;
    this.bars.splice(pos, 0, newBar);
    this.barids[id] = newBar;
}
OIGantt.prototype.addSpace = function addSpace(afterid) {
    if(this.space) this.bars.splice(this.bars.indexOf(this.space), 1);
    var pos = this.bars.indexOf(this.barids[afterid]) + 1
    this.bars.splice(pos, 0, new GanttBar(this, [], "ganttspace"));
    this.redraw();
    this.space = this.bars[pos];
    document.getElementById("ganttspace").style.top = (this.space.bgdiv.offsetTop+this.div.offsetTop) + "px";
}
OIGantt.prototype.hideLine = function hideLine(id, nbnext) {
    var bar = this.barids[id];
    var pos = this.bars.indexOf(bar);
    this.div.removeChild(bar.bardiv);
    this.div.removeChild(bar.bgdiv);
    bar.bardiv = null;
    bar.bgdiv = null;
    this.bars.splice(pos, 1 + nbnext);
}
OIGantt.prototype.showLine = function showLine(id, afterid) {
    var pos = this.bars.indexOf(this.barids[afterid]) + 1;
    this.bars.splice(pos, 0, this.barids[id]);
}
OIGantt.prototype.highlight = function highlight(id) {
    this.barids[id].bardiv.className = "gantthighlight";
}
OIGantt.prototype.unhighlight = function unhighlight(id) {
    this.barids[id].bardiv.className = "";
}
