function gettext(x) {
    return x;
}
function makeObjectCallback(method, object) {
    return function() {method.apply(object, arguments)};
}
Date.prototype.dateFormat = function dateFormat(format) {
    var fullYear = this.getYear();
    if (fullYear < 100) fullYear = fullYear + 1900;
    var hour = this.getHours();
    var date = this.getDate();
    var day = this.getDay();
    var month = this.getMonth() + 1;
    var minute = this.getMinutes();
    var seconde = this.getSeconds();
    var milliSeconde = this.getMilliseconds();
    var reg = new RegExp('(d|w|m|Y|H|i|s)', 'g');
    var replacement = new Array();
    replacement['d'] = date < 10 ? '0' + date : date;
    replacement['w'] = day;
    replacement['m'] = month < 10 ? '0' + month : month;
    replacement['Y'] = fullYear;
    replacement['H'] = hour < 10 ? '0' + hour : hour;
    replacement['i'] = minute < 10 ? '0' + minute : minute;
    replacement['s'] = seconde < 10 ? '0' + seconde : seconde;
    return format.replace(reg, function($0) {
        return ($0 in replacement) ? replacement[$0] : $0.slice(1, $0.length - 1);
    });
}
