define(["tomato"], function (tomato) {
	window['tomato'] = tomato;
	var rootCmd = new tomato.Cmd('/index','首页',true);
	


	var uri1 = window['uri1'] = new tomato.Cmd('/uri1/aaa?demaind=1','uri1',true);
	var uri2 = window['uri2']  = new tomato.Cmd('/uri2/bbb?demaind=2','uri2',true);
	var uri3 = window['uri3']  = new tomato.Cmd('/uri3/ccc?demaind=3','uri3',true);
	var uri4 = window['uri4']  = new tomato.Cmd('/uri4/ddd?demaind=4','uri4',true);
	var act1 = window['act1']  = new tomato.Cmd('/act1/aaa?demaind=5','act1');
	var act2 = window['act2']  = new tomato.Cmd('/act2/bbb?demaind=6','act2');
	var act3 = window['act3']  = new tomato.Cmd('/act3/ccc?demaind=7','act3');
	var act4 = window['act4']  = new tomato.Cmd('/act4/ddd?demaind=8','act4');

	// tomato.history.pushUri(uri1);
	// tomato.history.pushUri(uri2);
	// tomato.history.pushAct(act1);
	// tomato.history.pushAct(act2);
	// tomato.history.pushUri(uri3);
	// tomato.history.pushAct(act3);

	$.fn.setZIndex = function (index) {
        
    }
	tomato.setConfig({
		application: new tomato.Application({view:$(document.body),dialog:$(document.body),mask:$(document.body)},{rootUriCmd:rootCmd})
	})

	$(document.body).on("click", "button.case", function (e) {
		var caseID = e.target.getAttribute("data-case");
		switch (caseID) {
			case "1":
				ptcache.setItem("list", new ptcache.CacheContent([1, 2, 3]));
				console.log(ptcache.getItem("list"));
				break;
			case "2":
				ptcache.setItem("user", new ptcache.CacheContent({ userName: "jimmy", userId: "1", nickname: "Knight" }, "json", 10), 1);
				console.log(ptcache.getItem("user").toData());
				break;
			case "3":
				console.log(ptcache.getItem("user"));
				break;
			case "4":
				ptcache.setItem("doc", new ptcache.CacheContent("<a>test</a>", "xml", 10, "v0.1"), 1);
				console.log(ptcache.getItem("doc"));
				console.log(ptcache.getItem("doc").toData());
				break;
			case "5":
				console.log(ptcache.getItem("doc"));
				break;
			case "6":
				ptcache.setItem("ciphertext", new ptcache.CacheContent([1, 2, 3], "json", -1, '', true), 1);
				console.log(ptcache.getItem("ciphertext"));
				break;
			case "7":
				ptcache.load({ url: "ajax.json", hideLoading: true }).then(function (data) {
					console.log(data);
				});
				break;
			case "8":
				ptcache.load({ url: "ajax.json" }).then(function (data) {
					console.log(data);
				});
				break;
		}
	});

});