function newDiv(id) {
    var div = document.createElement("div");
    document.getElementById(id).appendChild(div);
    div.id = "oi" + (""+Math.random()).slice(5);
    return div.id;
}
function gettext(x) {
    return x;
}
function makeObjectCallback(method, object) {
    return function() {method.apply(object, arguments)};
}
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
