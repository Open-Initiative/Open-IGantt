function gettext(x) {
    dict = {
        "x10":"S",
        "x11":"M",
        "x12":"T",
        "x13":"W",
        "x14":"T",
        "x15":"F",
        "x16":"S",
        "x201":"January",
        "x202":"February",
        "x203":"March",
        "x204":"April",
        "x205":"May",
        "x206":"June",
        "x207":"July",
        "x208":"August",
        "x209":"September",
        "x210":"October",
        "x211":"November",
        "x212":"December",
    };
    return dict[x] || x;
}
function makeObjectCallback(method, object) {
    return function() {method.apply(object, arguments)};
}
Date.prototype.add = function add(timedelta) {
    return new Date(this.getTime() + timedelta);
}
Date.prototype.dateFormat = function dateFormat(format) {
    var fullYear = this.getFullYear();
    var year = this.getYear() % 100;
    var hour = this.getHours();
    var date = this.getDate();
    var day = this.getDay();
    var month = this.getMonth() + 1;
    var minute = this.getMinutes();
    var seconde = this.getSeconds();
    var milliSeconde = this.getMilliseconds();
    var reg = new RegExp('(d|w|m|y|Y|H|i|s)', 'g');
    var replacement = new Array();
    replacement['d'] = date < 10 ? '0' + date : date;
    replacement['w'] = day;
    replacement['m'] = month < 10 ? '0' + month : month;
    replacement['y'] = year;
    replacement['Y'] = fullYear;
    replacement['H'] = hour < 10 ? '0' + hour : hour;
    replacement['i'] = minute < 10 ? '0' + minute : minute;
    replacement['s'] = seconde < 10 ? '0' + seconde : seconde;
    return format.replace(reg, function($0) {
        return ($0 in replacement) ? replacement[$0] : $0.slice(1, $0.length - 1);
    });
}
