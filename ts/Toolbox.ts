interface String {
  format: (...arguments: any[]) => string;
}

interface Number {
  toModifierString: () => string; 
}

Number.prototype.toModifierString = function(){
  if(this >= 0){
    return `+${this}`
  }
  return this
}

String.prototype.format = function () {
  var args;
  if(arguments[0] instanceof Array){
    args = arguments[0];  
  } else {
    args = arguments;
  }
  return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
    if (m == "{{") { return "{"; }
    if (m == "}}") { return "}"; }
    if(args[n] === null || args[n] === undefined)
    {
      return "{" + n + "}";
    }
    return args[n];
  });
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