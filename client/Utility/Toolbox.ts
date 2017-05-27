export const toModifierString = function(val: number) {
    if (val >= 0) {
        return `+${val}`;
    }
    return `${val}`;
}

export const PostJSON = (url: string, data: any, success: (data: any) => void) =>
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(data),
        success: success,
        dataType: "json",
        contentType: "application/json"
    });

export const probablyUniqueString = (): string => {
    var chars = '1234567890abcdefghijkmnpqrstuvxyz';
    var probablyUniqueString = ''
    for (var i = 0; i < 8; i++) {
        var index = Math.floor(Math.random() * chars.length);
        probablyUniqueString += chars[index];
    }
    
    return probablyUniqueString;
}