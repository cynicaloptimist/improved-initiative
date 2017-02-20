interface Array<T> {
    remove: (item: T) => void;
}

interface String {
    format: (...arguments: any[]) => string;
}

interface Number {
    toModifierString: () => string;
}

interface Function {
    with: (...params: any[]) => ((...params: any[]) => any)
}

Array.prototype.remove = function (item) {
    const index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
    }
}

Number.prototype.toModifierString = function() {
    if (this >= 0) {
        return `+${this}`
    }
    return this
}

String.prototype.format = function() {
    var args;
    if (arguments[0] instanceof Array) {
        args = arguments[0];
    } else {
        args = arguments;
    }
    return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function(m, n) {
        if (m == "{{") { return "{"; }
        if (m == "}}") { return "}"; }
        if (args[n] === null || args[n] === undefined) {
            return "{" + n + "}";
        }
        return args[n];
    });
};

Function.prototype.with = function(...params: any[]) {
    if (typeof this !== "function") {
        throw new TypeError("Function.prototype.with needs to be called on a function");
    }
    var slice = Array.prototype.slice,
        args = slice.call(arguments),
        fn = this,
        partial = function() {
            return fn.apply(this, args.concat(slice.call(arguments)));
        };
    partial.prototype = Object.create(this.prototype);
    return partial;
};

var PostJSON = (url: string, data: any, success: (data: any) => void) =>
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(data),
        success: success,
        dataType: "json",
        contentType: "application/json"
    });

var probablyUniqueString = (): string => {
    var chars = '1234567890abcdefghijkmnpqrstuvxyz';
    var probablyUniqueString = ''
    for (var i = 0; i < 8; i++) {
        var index = Math.floor(Math.random() * chars.length);
        probablyUniqueString += chars[index];
    }
    
    return probablyUniqueString;
}