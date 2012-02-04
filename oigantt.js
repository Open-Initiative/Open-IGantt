var one_day = 1000*60*60*24;

function GanttBar(gantt, dates, bgClass) {
    this.gantt = gantt;
    this.bardiv = null;
    this.bgdiv = null;
    this.bgClass = bgClass;
    this.dates = dates;
}
GanttBar.prototype.addPhase = function(bardiv, begin, end, className, title) {
    var div = document.getElementById(newDiv(this.bardiv.id));
    div.style.width = (((isNaN(end) || isNaN(begin))?0:(end - begin)) / this.gantt.scale) + "px";
    div.className = className;
    div.title = title;
    return div;
}
GanttBar.prototype.draw = function() {
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
        this.bardiv.style.left = ((isNaN(this.dates[0])?0:(this.dates[0] - this.gantt.startDate)) / this.gantt.scale) + "px";
        this.bardiv.style.top = (this.gantt.bars.indexOf(this) * this.gantt.rowHeight + this.gantt.headerHeight) + "px";
        
        var i;
        for(i=0; i < this.dates.length-1; i++)
            this.addPhase(this.bardiv, this.dates[i], this.dates[i+1], "ganttbar"+(i+1),
                gettext("Phase"+i));
    }
}

function OIGantt(divid, startDate, endDate) {
    this.periods = [1000*60*5, 1000*60*60, 1000*60*60*24, 1000*60*60*24*7, "month", "year"];
    this.scale = 1000*60*60;
    this.period = 1000*60*60*24;
    this.rowHeight = 20;
    this.headerHeight = 31;
    this.space = null;
    
    parentdiv = document.getElementById(divid);
    this.startDate = startDate || new Date();
    this.endDate = new Date(Math.max(endDate, new Date(this.scale*parentdiv.style.width+(this.startDate.getTime()))));;
    this.bars = [];
    this.barids = {};
    this.space = null;

    this.div = document.getElementById(newDiv(divid));
    this.header = document.getElementById(newDiv(this.div.id));
    this.graph = document.getElementById(newDiv(this.div.id));
    this.div.className = "ganttbg";
    this.div.style.width = ((this.endDate - this.startDate) / this.scale) + "px";
    this.header.style.height = this.headerHeight + "px";
    
    this.drawTimeline();
}
OIGantt.prototype.drawTimeline = function drawTimeline() {
    if(this.startDate.getDate() < 29) this.header.innerHTML = this.startDate.dateFormat("d/m/Y");
    this.graph.style.width = (this.endDate - this.startDate + this.period) / this.scale+"px";
    
    for(var day = new Date(this.startDate); day<this.endDate; day.setDate(day.getDate()+1)) {
        if(day.getDate()==1) this.graph.innerHTML += '<div style="float: left;position: relative;top: -'+this.headerHeight+'px;width:0">'+day.dateFormat("d/m/Y")+'</div>';
        var daydiv = document.createElement("div");
        daydiv.className = "ganttperiod";
        daydiv.style.width = (one_day/this.scale-1)+"px";
        daydiv.innerHTML = day.getDate();
        this.graph.appendChild(daydiv);
    }
    if(new Date() > this.startDate && new Date() < this.endDate) {
        var today = document.getElementById(newDiv(this.graph.id));
        today.className = "gantttoday";
        today.style.left = (new Date() - this.startDate) / this.scale + "px";
    }
}
OIGantt.prototype.redraw = function redraw(barNb) {
    this.graph.style.height = (this.rowHeight * this.bars.length + this.headerHeight)+"px";
    if(!barNb || barNb==-1) barNb = 0;
    for(var i=barNb; i<this.bars.length; i++) 
        this.bars[i].draw();
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
