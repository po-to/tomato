var __requireJS = function(path){
    document.write('<script src="libs'+path+'"><\/script>');
}
var jquery = "/jquery3.js";
if(!Object.create){
    jquery = "/jquery1.js";
    __requireJS('/es5-shim.js');
    __requireJS('/es5-sham.js');
}
if(!Object.assign){
    __requireJS('/polyfill.js');
}
__requireJS(jquery);
