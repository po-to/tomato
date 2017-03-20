define(["tomato"], function (tomato,aaa,bbb) {
	window['tomato'] = tomato;
	var rootCmd = new tomato.Cmd('/index','首页',true);

	$.fn.setZIndex = function (index) {
        
    }
	tomato.setConfig({
		application: new tomato.Application(rootCmd,{view:$(document.body),dialog:$(document.body),mask:$(document.body)})
	})


	var uri1 = window['uri1'] = new tomato.Cmd('/uri1/aaa?demaind=1','uri1',true);
	var uri2 = window['uri2']  = new tomato.Cmd('/uri2/bbb?demaind=2','uri2',true);
	var uri3 = window['uri3']  = new tomato.Cmd('/uri3/ccc?demaind=3','uri3',true);
	var uri4 = window['uri4']  = new tomato.Cmd('/uri4/ddd?demaind=4','uri4',true);

	var act1 = window['act1']  = new tomato.Cmd('/act1','act1');
	var act2 = window['act2']  = new tomato.Cmd('/act2','act2');
	var act3 = window['act3']  = new tomato.Cmd('/act3','act3');
	var act4 = window['act4']  = new tomato.Cmd('/act4','act4');
	

	// tomato.history.pushUri(uri1);
	// tomato.history.pushUri(uri2);
	// tomato.history.pushAct(act1);
	// tomato.history.pushAct(act2);
	// tomato.history.pushUri(uri3);
	// tomato.history.pushAct(act3);
});