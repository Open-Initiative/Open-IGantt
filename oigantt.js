var one_day = 1000*60*60*24;

function dateFormat(format, date) {
    if (date == undefined) {
        date = new Date();
    }
    if (typeof date == 'number') {
        time = new Date();
        time.setTime(date);
        date = time;
    } else if (typeof date == 'string') {
        date = new Date(date);
    }
    var fullYear = date.getYear();
    if (fullYear < 1000) {
        fullYear = fullYear + 1900;
    }
    var hour = date.getHours();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var minute = date.getMinutes();
    var seconde = date.getSeconds();
    var milliSeconde = date.getMilliseconds();
    var reg = new RegExp('(d|m|Y|H|i|s)', 'g');
    var replacement = new Array();
    replacement['d'] = day < 10 ? '0' + day : day;
    replacement['m'] = month < 10 ? '0' + month : month;
    replacement['Y'] = fullYear;
    replacement['H'] = hour < 10 ? '0' + hour : hour;
    replacement['i'] = minute < 10 ? '0' + minute : minute;
    replacement['s'] = seconde < 10 ? '0' + seconde : seconde;
    return format.replace(reg, function($0) {
        return ($0 in replacement) ? replacement[$0] : $0.slice(1,
                $0.length - 1);
    });
}
function GanttBar(gantt, dates, bgClass) {
    this.gantt = gantt;
    this.bardiv = null;
    this.bgdiv = null;
    this.bgClass = bgClass;
    this.dates = dates;
}
GanttBar.prototype.addPhase = function(bardiv, begin, end, className, title) {
    var div = document.getElementById(newDiv(this.bardiv.id));
    div.style.width = (((isNaN(end) || isNaN(begin))?0:(end - begin)) / this.gantt.scales[this.gantt.scale]) + "px";
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
        this.bardiv.style.left = ((isNaN(this.dates[0])?0:(this.dates[0] - this.gantt.startDate)) / this.gantt.scales[this.gantt.scale]) + "px";
        this.bardiv.style.top = (this.gantt.bars.indexOf(this) * this.gantt.rowHeight + this.gantt.headerHeight+10) + "px";
        
        var i;
        for(i=0; i < this.dates.length-1; i++)
            this.addPhase(this.bardiv, this.dates[i], this.dates[i+1], "ganttbar"+(i+1),
                gettext("Phase"+i));
    }
}

function OIGantt(divid, startDate, endDate) {
    this.scales = [1000*60*5, 1000*60*60, 1000*60*60*24, 1000*60*60*24*7, "month", "year"];
    this.unitFormats = ["i", "H", "d", "d", "m", "Y"];
    this.periodFormats = ["H:i", "H:i", "d/m/Y", "d/m/Y", "m/Y", "Y"];
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
    if(this.startDate.getDate() < 29) this.header.innerHTML = dateFormat(this.periodFormats[this.scale+2], this.startDate);
    this.graph.style.width = (this.endDate - this.startDate + this.scales[this.scale+1]) / this.scales[this.scale]+"px";
    
    var periodWidth = (this.scales[this.scale+1]/this.scales[this.scale]-1)+"px";
    for(var period = new Date(this.startDate); period<this.endDate; period.setTime(period.getTime()+this.scales[this.scale+1])) {
//        if(period.getDate()==1) this.graph.innerHTML += '<div style="float: left;position: relative;top: -'+this.headerHeight+'px;width:0">'+period.dateFormat("d/m/Y")+'</div>';
        var periodDiv = document.createElement("div");
        periodDiv.className = "ganttperiod";
        periodDiv.style.width = periodWidth;
        periodDiv.innerHTML = dateFormat(this.unitFormats[this.scale+1], period);
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
