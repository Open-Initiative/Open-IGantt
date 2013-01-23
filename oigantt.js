var one_day = 1000*60*60*24;

function GanttBar(gantt, id, dates, bgClass) {
    this.gantt = gantt;
    this.id = id;
    this.bardiv = null;
    this.bgdiv = null;
    this.bgClass = bgClass;
    this.dates = dates;
}
GanttBar.prototype.updateDates = function updateDates() {
    var anchor, i, scale = this.gantt.scales[this.gantt.scale];
    var startDate = this.gantt.startDate.add(this.bardiv.offsetLeft * scale);
    var anchors = this.bardiv.getElementsByClassName("ganttanchor");
    for(anchor = anchors[i=0]; i < anchors.length; anchor = anchors[++i]) {
        this.dates[i] = startDate.add(anchor.offsetLeft * scale);
        if(this.gantt.onUpdate) this.gantt.onUpdate(this.id, i, this.dates[i]);
    }
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
    if(this.draggedPhase) {
        var newPhaseWidth = event.clientX - this.startX;
        var newBarWidth = this.bardiv.clientWidth + newPhaseWidth - this.draggedPhase.clientWidth;
        this.bardiv.style.width = newBarWidth + "px";
        this.draggedPhase.style.width = newPhaseWidth + "px";
    }
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
    var div = this.bardiv.appendChild(document.createElement("div"));
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
        this.bardiv = this.gantt.div.appendChild(document.createElement("div"));
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
    this.unitFormats = ["i", "H:i", "H:i", "w", "d/m/Y", "m", "Y"];
//    this.periodFormats = ["H:i", "H:i", "H:i", "d/m", "d/m", "m/Y", "Y"];
    this.scale = 1;
    this.rowHeight = 25;
    this.headerHeight = 31;
    this.space = null;
    
    this.parentdiv = document.getElementById(divid);
    this.parentdiv.onscroll = makeObjectCallback(this.drawTimeline, this);
    this.startDate = startDate || new Date();
    this.endDate = endDate || this.startDate.add(this.scales[this.scale]*parentdiv.style.width());
    this.bars = [];
    this.barids = {};
    this.space = null;

    this.timeline = document.getElementById(divid).appendChild(document.createElement("canvas"));
    this.timeline.style.position = "fixed";
    this.div = document.getElementById(divid).appendChild(document.createElement("div"));
    this.div.className = "ganttbg";
    this.div.style.width = Math.max(this.parentdiv.clientWidth, (this.endDate-this.startDate)/this.scales[this.scale]);
}
OIGantt.prototype.getPeriodName = function getPeriodName(offset, formatIndex) {
    var date = this.startDate.add((this.parentdiv.scrollLeft+offset)*this.scales[this.scale]);
    return date.dateFormat(this.unitFormats[this.scale+formatIndex]);
}
OIGantt.prototype.strokePeriods = function strokePeriods(ctx, color, scaleoffset) {
    var drawStartDate = this.startDate.add(this.parentdiv.scrollLeft*this.scales[this.scale]);
    var offsetLeft = (drawStartDate.getTime() % this.scales[this.scale+scaleoffset]) / this.scales[this.scale];
    var offsetTop = 40 - 10*scaleoffset;
    var period = this.scales[this.scale+scaleoffset] / this.scales[this.scale];
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(.5,0); //disable antialiasing for odd width lines
    for(var x=offsetLeft; x < ctx.canvas.width; x += period) {
        ctx.strokeText(this.getPeriodName(x, scaleoffset), x+2, offsetTop);
        ctx.moveTo(x,offsetTop);
        ctx.lineTo(x,99);
    }
    ctx.stroke();
}
OIGantt.prototype.drawTimeline = function drawTimeline() {
    this.timeline.width = this.parentdiv.clientWidth;
    this.timeline.height = this.rowHeight*this.bars.length + this.headerHeight;
    var ctx = this.timeline.getContext("2d");
    this.strokePeriods(ctx, "#ddd", 2); //draw light lines
    this.strokePeriods(ctx, "black", 3); //draw dark lines
    
    if(new Date() > this.startDate && new Date() < this.endDate) { //line for today
        ctx.beginPath();
        ctx.strokeStyle = "red";
        var x = (new Date() - this.startDate) / this.scales[this.scale]
        ctx.moveTo(x,1);
        ctx.lineTo(x,99);
        ctx.stroke();
    }
}
OIGantt.prototype.redraw = function redraw(barNb) {
    this.drawTimeline();
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
    var newBar = new GanttBar(this, id, dates, "ganttbg"+(bgClass || 0));
    var pos = this.bars.indexOf(this.barids[afterid]) + 1;
    this.bars.splice(pos, 0, newBar);
    this.barids[id] = newBar;
    this.div.style.height = this.rowHeight*this.bars.length + this.headerHeight;
}
OIGantt.prototype.addSpace = function addSpace(afterid) {
    if(this.space) this.bars.splice(this.bars.indexOf(this.space), 1);
    var pos = this.bars.indexOf(this.barids[afterid]) + 1
    this.bars.splice(pos, 0, new GanttBar(this, id, [], "ganttspace"));
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
