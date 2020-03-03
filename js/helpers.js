function $(id) { return document.querySelector(id); }

// FUCK JS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
String.prototype.lstrip = function(charToRemove) {
    let i = 0;
    while(this.charAt(i)==charToRemove) {
        i++;
    }
    return this.substring(i);
}

String.prototype.rstrip = function(charToRemove) {
    let i = this.length-1;
    while(this.charAt(i)==charToRemove) {
        i--;
    }
    return this.substring(0, i+1);
}

String.prototype.strip = function(charToRemove) {
    return this.rstrip(charToRemove).lstrip(charToRemove);
}
