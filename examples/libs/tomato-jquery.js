(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@po-to/tomato"));
	else if(typeof define === 'function' && define.amd)
		define(["@po-to/tomato"], factory);
	else if(typeof exports === 'object')
		exports["tomato-jquery"] = factory(require("@po-to/tomato"));
	else
		root["tomato-jquery"] = factory(root["@po-to/tomato"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__(1), __webpack_require__(2), __webpack_require__(6), __webpack_require__(7)], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, tomato, css, tpl_CommonDialog, tpl_TurnContainer) {
	    "use strict";
	    //tomato.include(css, tpl_CommonDialog);
	    var emptyFun = function (data) { };
	    emptyFun(css);
	    var autoID = 0;
	    var jdomMethods = {
	        groupBy: function (attr) {
	            var dlist = {};
	            var key, i, k, o;
	            attr = attr || "data-dom";
	            for (i = 0, k = this.length; i < k; i++) {
	                o = this[i];
	                key = o.getAttribute(attr);
	                if (key) {
	                    if (dlist[key]) {
	                        dlist[key].push(o);
	                    }
	                    else {
	                        dlist[key] = [o];
	                    }
	                }
	            }
	            return dlist;
	        },
	        removeChild: function (child) {
	            child.detach();
	        },
	        appendChild: $.fn.append,
	        setZIndex: function (index) {
	            this.css('z-index', index + dialogZIndexStart);
	        },
	        getVPID: function () {
	            var str = this.attr("data-vpid");
	            if (!str) {
	                str = "vp" + (autoID++);
	                this.setVPID(str);
	            }
	            return str;
	        },
	        setVPID: function (id) {
	            this.attr("data-vpid", id);
	        },
	        getVPCON: function () {
	            return this.attr("data-vpcon") || "";
	        },
	        getSUBS: function () {
	            return this.find("[data-vpid]").get().map(function (o) { return $(o); });
	        }
	    };
	    for (var p in jdomMethods) {
	        if ($.fn.hasOwnProperty(p)) {
	            console.log(p + " is override!");
	        }
	        else {
	            $.fn[p] = jdomMethods[p];
	        }
	    }
	    var dialogZIndexStart = 1000;
	    // let commandTemplate = tomato.includeResource('html!./tpl.html') ;
	    // console.log(commandTemplate);
	    // export interface $View extends JQuery {
	    //     removeChild(view: $View): void;
	    //     appendChild(view: $View): void;
	    // }
	    // export interface $Layer extends $View {
	    //     
	    // }
	    // export function view(...args): $View {
	    //     let result: $View = ($ as any)(...args);
	    //     (result as any).removeChild = function (view: $View) { view.remove(); };
	    //     (result as any).appendChild = result.append;
	    //     return result;
	    // }
	    // export function layer(...args): $Layer {
	    //     let result: $Layer = ($ as any)(...args);
	    //     (result as any).removeChild = function (view: $View) { view.remove(); };
	    //     (result as any).appendChild = result.append;
	    //     (result as any).setZIndex = function (index: number): void {
	    //         $(this).css('z-index', index);
	    //     }
	    //     return result;
	    // }
	    exports.DialogEffect = {
	        scale: "tdom-scale",
	        swipeUp: "tdom-swipeUp",
	        swipeDown: "tdom-swipeDown",
	        swipeLeft: "tdom-swipeLeft",
	        swipeRight: "tdom-swipeRight",
	        slideUp: "tdom-slideUp",
	        slideDown: "tdom-slideDown",
	        slideLeft: "tdom-slideLeft",
	        slideRight: "tdom-slideRight",
	    };
	    exports.TurnEffect = {
	        slid: "tdom-slid",
	        cover: "tdom-cover",
	    };
	    var AnimationEnd = (function () {
	        var style = document.documentElement.style;
	        if ('animation' in style) {
	            return 'animationend';
	        }
	        if ('WebkitAnimation' in style) {
	            return 'webkitAnimationEnd';
	        }
	        return '';
	    })();
	    function getWindowSize() {
	        return { width: window.innerWidth || $(window).width(), height: window.innerHeight || $(window).height() };
	        //var zoomLevel:number = document.documentElement.clientWidth / window.innerWidth;
	        //return {width:document.documentElement.clientWidth,height:zoomLevel?Math.round(window.innerHeight * zoomLevel):document.documentElement.clientHeight};
	    }
	    exports.getWindowSize = getWindowSize;
	    var CommonPageApplication = (function (_super) {
	        __extends(CommonPageApplication, _super);
	        function CommonPageApplication() {
	            return _super.call(this, { view: $(document.body), dialog: $(document.body.children[0]), mask: $('') }) || this;
	        }
	        return CommonPageApplication;
	    }(tomato.Application));
	    exports.CommonPageApplication = CommonPageApplication;
	    var SinglePageApplication = (function (_super) {
	        __extends(SinglePageApplication, _super);
	        function SinglePageApplication(config, els) {
	            var _this = this;
	            if (!els) {
	                var view = $(tpl_CommonDialog).appendTo(document.body);
	                var comps = view.find("[data-dom]").groupBy();
	                comps['mask'][0].innerHTML = '<div class="tdom-loading"></div>';
	                els = { view: view, dialog: $(comps['dialog']), mask: $(comps['mask']), body: $(comps['body']), header: $(comps['header']), footer: $(comps['footer']), aside: $(comps['aside']) };
	            }
	            config = Object.assign({}, {
	                className: "tdom-application",
	                headerEffect: exports.TurnEffect.cover,
	                footerEffect: exports.TurnEffect.cover,
	                bodyEffect: exports.TurnEffect.cover,
	                asideEffect: exports.TurnEffect.slid,
	                size: { width: tomato.DialogSize.Full, height: tomato.DialogSize.Full }
	            }, config);
	            _this = _super.call(this, els, config) || this;
	            if (_this.config.headerEffect && _this.header) {
	                turnContainer(_this.header).addClass(_this.config.headerEffect);
	            }
	            if (_this.config.footerEffect && _this.footer) {
	                turnContainer(_this.footer).addClass(_this.config.footerEffect);
	            }
	            if (_this.config.asideEffect && _this.aside) {
	                turnContainer(_this.aside).addClass(_this.config.asideEffect);
	            }
	            if (_this.config.bodyEffect && _this.body) {
	                turnContainer(_this.body).addClass(_this.config.bodyEffect);
	            }
	            $(window).on("resize", function () {
	                if (_this.state != tomato.DialogState.Closed) {
	                    _this.refreshLayout();
	                }
	            });
	            return _this;
	        }
	        SinglePageApplication.prototype.refreshLayout = function () {
	            if (this.state == tomato.DialogState.Closed) {
	                return;
	            }
	            var headerHeight = 0, footerHeight = 0, asideWidth = 0;
	            if (this.content && this.content.isWholeVPresenter()) {
	                if (this._contentHeader) {
	                    headerHeight = Math.ceil(this._contentHeader.outerHeight(true));
	                }
	                if (this._contentFooter) {
	                    footerHeight = Math.ceil(this._contentFooter.outerHeight(true));
	                }
	                if (this._contentAside) {
	                    asideWidth = Math.ceil(this._contentAside.outerWidth(true));
	                }
	            }
	            this.header && (headerHeight ? this.header.height(headerHeight).show() : this.header.hide());
	            this.footer && (footerHeight ? this.footer.height(footerHeight).show() : this.footer.hide());
	            this.aside && (asideWidth ? this.aside.width(asideWidth).show() : this.aside.hide());
	            var width = this.dialog.width();
	            var height = this.dialog.height();
	            if (this.config.asideInBody) {
	                this.body && this.body.css({ width: width - asideWidth, height: height - headerHeight - footerHeight, marginLeft: this.config.asideOnRight ? 0 : asideWidth });
	                this.aside && this.aside.height(height - headerHeight - footerHeight);
	            }
	            else {
	                this.header && this.header.css(this.config.asideOnRight ? "margin-right" : "margin-left", asideWidth);
	                this.footer && this.footer.css(this.config.asideOnRight ? "margin-right" : "margin-left", asideWidth);
	                this.body && this.body.css(this.config.asideOnRight ? "margin-right" : "margin-left", asideWidth).height(height - headerHeight - footerHeight);
	            }
	        };
	        return SinglePageApplication;
	    }(tomato.Application));
	    exports.SinglePageApplication = SinglePageApplication;
	    var VPresenter = (function (_super) {
	        __extends(VPresenter, _super);
	        function VPresenter(view, parent, vpid) {
	            var _this = _super.call(this, view, parent, vpid) || this;
	            _this._els = {};
	            return _this;
	        }
	        VPresenter.prototype.find = function (str) {
	            return this.view.find(str);
	        };
	        VPresenter.prototype._evt_open = function (data) {
	            var options;
	            if (typeof data == "string") {
	                options = { url: data };
	            }
	            else {
	                options = data;
	            }
	            var target = options.target || exports.DialogTarget.Blank;
	            if (options.target == exports.DialogTarget.Self) {
	                target = this.getParentDialog();
	            }
	            tomato.getVPresenter(options.url, function (vp) {
	                open(vp, target);
	            });
	            return false;
	        };
	        VPresenter.prototype._getElements = function () {
	            return this.find("[dom]").groupBy("dom");
	        };
	        VPresenter.prototype._watchEvent = function (funs, jdom) {
	            var _this = this;
	            var actions = funs || this;
	            var view = jdom || this.view;
	            var callAction = function (action, type, target, hit) {
	                //console.log(type,target,hit);
	                var arr = action.split("@");
	                action = arr[0];
	                var data = arr[1];
	                var fun = actions["_evt_" + action];
	                if (fun) {
	                    if (data) {
	                        var s = data.substr(0, 1);
	                        var e = data.substr(data.length - 1, 1);
	                        if ((s == "{" && e == "}") || (s == "[" && e == "]")) {
	                            data = JSON.parse(data);
	                        }
	                    }
	                    //project.addActive(target);
	                    return fun.call(_this, data, target, hit);
	                }
	                else {
	                    return true;
	                }
	            };
	            view.on("click", function (e) {
	                var type = e.type;
	                var hit = e.target;
	                var target = e.target;
	                var nodeName = target.nodeName;
	                var propagation = true;
	                var root = this;
	                if (type == "focusin" && nodeName != "INPUT" && nodeName != "TEXTARE") {
	                    return true;
	                }
	                if (type == "click" && (nodeName == "FORM" || nodeName == "SELECT" || nodeName == "OPTION" || nodeName == "TEXTARE" || nodeName == "INPUT" || (nodeName == "LABEL" && target.htmlFor))) {
	                    return true;
	                }
	                if (type == "change" && (nodeName == "FORM" || nodeName == "TEXTARE" || nodeName == "INPUT")) {
	                    return true;
	                }
	                while (target && target != root) {
	                    var actions_1 = target.getAttribute("evt");
	                    if (actions_1 && (!target.hasAttribute("disabled") || target.getAttribute("disabled") == 'false')) {
	                        actions_1.split("|").forEach(function (action) {
	                            propagation = (callAction(action, type, target, hit) ? true : false) && propagation;
	                        });
	                        return propagation;
	                    }
	                    if (target.nodeName == "FORM") {
	                        return true;
	                    }
	                    target = target.parentNode;
	                }
	                return true;
	            });
	        };
	        return VPresenter;
	    }(tomato.VPresenter));
	    exports.VPresenter = VPresenter;
	    var CommonDialog = (function (_super) {
	        __extends(CommonDialog, _super);
	        function CommonDialog(config, els) {
	            var _this = this;
	            if (!els) {
	                var view = $(tpl_CommonDialog);
	                var comps = view.find("[data-dom]").groupBy();
	                els = { view: view, dialog: $(comps['dialog']), mask: $(comps['mask']), body: $(comps['body']), header: $(comps['header']), footer: $(comps['footer']), aside: $(comps['aside']) };
	            }
	            _this = _super.call(this, els, config) || this;
	            if (_this.config.headerEffect && _this.header) {
	                turnContainer(_this.header).addClass(_this.config.headerEffect);
	            }
	            if (_this.config.footerEffect && _this.footer) {
	                turnContainer(_this.footer).addClass(_this.config.footerEffect);
	            }
	            if (_this.config.asideEffect && _this.aside) {
	                turnContainer(_this.aside).addClass(_this.config.asideEffect);
	            }
	            if (_this.config.bodyEffect && _this.body) {
	                turnContainer(_this.body).addClass(_this.config.bodyEffect);
	            }
	            $(window).on("resize", function () {
	                if (_this.state != tomato.DialogState.Closed) {
	                    _this.refreshSize();
	                    _this.refreshPosition();
	                    _this.refreshLayout();
	                }
	            });
	            _this.mask && _this.mask.on("click", function () {
	                _this.close();
	            });
	            var that = _this;
	            AnimationEnd && _this.view.on(AnimationEnd, function () {
	                that._animationEnd();
	            });
	            return _this;
	        }
	        CommonDialog.prototype._animationEnd = function () {
	            this.view.removeClass("tdom-transiting");
	            if (this.state == tomato.DialogState.Closed) {
	                this.view.hide();
	                if (this._removeAfterClosed) {
	                    this.parent && this.parent.removeChild(this);
	                }
	            }
	        };
	        CommonDialog.prototype._afterConfigChange = function (oldConfig) {
	            _super.prototype._afterConfigChange.call(this, oldConfig);
	            this.dialog.css({
	                position: this.config.fixed ? "fixed" : "absolute"
	            });
	        };
	        CommonDialog.prototype._setState = function (state) {
	            if (this.state == tomato.DialogState.Closed) {
	                this.view.show();
	                this.view[0].offsetHeight;
	            }
	            _super.prototype._setState.call(this, state);
	            this.view.addClass("tdom-transiting");
	            !AnimationEnd && this._animationEnd();
	        };
	        CommonDialog.prototype._parseExpr = function (value, worh) {
	            var target = undefined, expr = '';
	            var els, multiple, multipleNum, increment, incrementNum;
	            if (typeof value == "function") {
	                return value(this);
	            }
	            else if (typeof value == "number") {
	                return value;
	            }
	            else if (Array.isArray(value)) {
	                target = value[0], expr = value[1];
	                expr = 'target' + expr;
	            }
	            else if (typeof value == "object") {
	                target = value;
	            }
	            else if (typeof value == "string") {
	                if (/^\d+.*$/.test(value)) {
	                    return parseInt(value);
	                }
	                else {
	                    expr = value;
	                }
	            }
	            if (expr) {
	                var arr = expr.match(/^([^*/+-]+)(([*/])([\d.]+))?(([+-])(\d+))?$/);
	                if (arr) {
	                    els = arr[1], multiple = arr[3], multipleNum = arr[4], increment = arr[6], incrementNum = arr[7];
	                    if (!target) {
	                        target = $(els);
	                    }
	                }
	            }
	            if (target && target.length) {
	                var methon = { "width": "outerWidth", "height": "outerHeight" };
	                var outerWorH = methon[worh];
	                var value_1 = (worh == "width" || worh == "height") ? target[outerWorH]() : target.offset()[worh];
	                if (multiple) {
	                    multipleNum = parseFloat(multipleNum);
	                    if (multiple == '*') {
	                        value_1 *= multipleNum;
	                    }
	                    else {
	                        value_1 /= multipleNum;
	                    }
	                }
	                if (increment) {
	                    incrementNum = parseInt(incrementNum);
	                    if (increment == '+') {
	                        value_1 += incrementNum;
	                    }
	                    else {
	                        value_1 -= incrementNum;
	                    }
	                }
	                return value_1;
	            }
	            else {
	                return NaN;
	            }
	        };
	        CommonDialog.prototype.refreshSize = function () {
	            var _this = this;
	            if (this.state == tomato.DialogState.Closed) {
	                return;
	            }
	            var dialogSize = { width: 0, height: 0 };
	            var obj = getWindowSize();
	            ['width', 'height'].forEach(function (worh) {
	                var value = _this.config.size[worh];
	                if (typeof value == "number") {
	                    if (value == tomato.DialogSize.Full) {
	                        dialogSize[worh] = obj[worh];
	                        return;
	                    }
	                    else if (value == tomato.DialogSize.Content) {
	                        if (_this.content) {
	                            dialogSize[worh] = _this.content.view[worh == 'width' ? 'outerWidth' : 'outerHeight'](true);
	                        }
	                        return;
	                    }
	                }
	                else if (typeof value == "string" && /^-?\d{1,3}%$/.test(value)) {
	                    dialogSize[worh] = parseInt(value) / 100 * obj[worh];
	                    return;
	                }
	                dialogSize[worh] = _this._parseExpr(value, worh);
	            });
	            this._setSize(dialogSize.width || 100, dialogSize.height || 100);
	        };
	        CommonDialog.prototype._setSize = function (width, height) {
	            this.dialog.css({ width: Math.round(width), height: Math.round(height) });
	        };
	        CommonDialog.prototype.refreshLayout = function () {
	            if (this.state == tomato.DialogState.Closed) {
	                return;
	            }
	            var headerHeight = 0, footerHeight = 0, asideWidth = 0;
	            if (this.content && this.content.isWholeVPresenter()) {
	                if (this._contentHeader) {
	                    headerHeight = Math.ceil(this._contentHeader.outerHeight(true));
	                }
	                if (this._contentFooter) {
	                    footerHeight = Math.ceil(this._contentFooter.outerHeight(true));
	                }
	                if (this._contentAside) {
	                    asideWidth = Math.ceil(this._contentAside.outerWidth(true));
	                }
	            }
	            this.header && (headerHeight ? this.header.height(headerHeight).show() : this.header.hide());
	            this.footer && (footerHeight ? this.footer.height(footerHeight).show() : this.footer.hide());
	            this.aside && (asideWidth ? this.aside.width(asideWidth).show() : this.aside.hide());
	            var width = this.dialog.width();
	            var height = this.dialog.height();
	            if (this.config.asideInBody) {
	                this.body && this.body.css({ width: width - asideWidth, height: height - headerHeight - footerHeight, marginLeft: this.config.asideOnRight ? 0 : asideWidth });
	                this.aside && this.aside.height(height - headerHeight - footerHeight);
	            }
	            else {
	                this.header && this.header.css(this.config.asideOnRight ? "margin-right" : "margin-left", asideWidth);
	                this.footer && this.footer.css(this.config.asideOnRight ? "margin-right" : "margin-left", asideWidth);
	                this.body && this.body.css(this.config.asideOnRight ? "margin-right" : "margin-left", asideWidth).height(height - headerHeight - footerHeight);
	            }
	        };
	        CommonDialog.prototype.refreshPosition = function () {
	            var _this = this;
	            if (this.state == tomato.DialogState.Closed) {
	                return;
	            }
	            var obj = getWindowSize();
	            var dialogSize = { x: this.dialog.outerWidth(), y: this.dialog.outerHeight() };
	            var windowSize = { x: obj.width, y: obj.height };
	            var offset = this.config.offset;
	            var dialogPos = { x: 0, y: 0 };
	            var offsetPos = { x: 0, y: 0 };
	            var minPos = { x: 0, y: 0 };
	            var maxPos = { x: windowSize.x - dialogSize.x, y: windowSize.y - dialogSize.y };
	            var dialogOffset;
	            var dialogPosition;
	            var parentOffset;
	            var pageScroll = { x: $(window).scrollLeft(), y: $(window).scrollTop() };
	            ;
	            if (!this.config.fixed) {
	                dialogOffset = this.dialog.offset();
	                dialogPosition = this.dialog.position();
	                parentOffset = { x: dialogOffset.left - dialogPosition.left, y: dialogOffset.top - dialogPosition.top };
	                minPos = { x: -parentOffset.x, y: -parentOffset.y };
	                maxPos = { x: NaN, y: NaN };
	            }
	            ['x', 'y'].forEach(function (xory) {
	                var lort = xory == "x" ? "left" : "top";
	                var positionValue = _this.config.position[xory];
	                var element = null;
	                if (typeof positionValue == "number") {
	                    if (_this.config.fixed) {
	                        switch (positionValue) {
	                            case tomato.DialogPosition.Left:
	                                dialogPos.x = 0;
	                                return;
	                            case tomato.DialogPosition.Right:
	                                dialogPos.x = windowSize.x - dialogSize.x;
	                                return;
	                            case tomato.DialogPosition.Center:
	                                dialogPos.x = (windowSize.x - dialogSize.x) / 2;
	                                return;
	                            case tomato.DialogPosition.Top:
	                                dialogPos.y = 0;
	                                return;
	                            case tomato.DialogPosition.Bottom:
	                                dialogPos.y = windowSize.y - dialogSize.y;
	                                return;
	                            case tomato.DialogPosition.Middle:
	                                dialogPos.y = (windowSize.y - dialogSize.y) / 2;
	                                return;
	                        }
	                    }
	                    else {
	                        switch (positionValue) {
	                            case tomato.DialogPosition.Left:
	                                dialogPos.x = pageScroll.x - parentOffset.x;
	                                return;
	                            case tomato.DialogPosition.Right:
	                                dialogPos.x = pageScroll.x - parentOffset.x + windowSize.x - dialogSize.x;
	                                return;
	                            case tomato.DialogPosition.Center:
	                                dialogPos.x = pageScroll.x - parentOffset.x + (windowSize.x - dialogSize.x) / 2;
	                                return;
	                            case tomato.DialogPosition.Top:
	                                dialogPos.y = pageScroll.y - parentOffset.y;
	                                return;
	                            case tomato.DialogPosition.Bottom:
	                                dialogPos.y = pageScroll.y - parentOffset.y + windowSize.y - dialogSize.y;
	                                return;
	                            case tomato.DialogPosition.Middle:
	                                dialogPos.y = pageScroll.y - parentOffset.y + (windowSize.y - dialogSize.y) / 2;
	                                return;
	                        }
	                    }
	                }
	                else if (typeof positionValue == "string" && /^-?\d{1,3}%$/.test(positionValue)) {
	                    if (_this.config.fixed) {
	                        dialogPos[xory] = parseInt(positionValue) / 100 * windowSize[xory];
	                    }
	                    else {
	                        dialogPos[xory] = parseInt(positionValue) / 100 * windowSize[xory] + pageScroll[xory] - parentOffset[xory];
	                    }
	                    return;
	                }
	                var value = _this._parseExpr(positionValue, lort);
	                if (_this.config.fixed) {
	                    dialogPos[xory] = value - pageScroll[xory];
	                }
	                else {
	                    dialogPos[xory] = value - parentOffset[xory];
	                }
	            });
	            ['x', 'y'].forEach(function (xory) {
	                var offsetValue = _this.config.offset[xory];
	                var worh = xory == "x" ? "width" : "height";
	                if (typeof offsetValue == "string" && /^-?\d{1,3}%$/.test(offsetValue)) {
	                    offsetPos[xory] = dialogSize[xory] * parseInt(offsetValue) / 100;
	                    return;
	                }
	                offsetPos[xory] = _this._parseExpr(offsetValue, worh);
	            });
	            ['x', 'y'].forEach(function (xory) {
	                dialogPos[xory] += offsetPos[xory];
	                if (!isNaN(minPos[xory]) && dialogPos[xory] < minPos[xory]) {
	                    dialogPos[xory] = minPos[xory];
	                }
	                if (!isNaN(maxPos[xory]) && (dialogPos[xory] > maxPos[xory])) {
	                    dialogPos[xory] = maxPos[xory];
	                }
	            });
	            this._setPosition(dialogPos.x, dialogPos.y);
	        };
	        CommonDialog.prototype._setPosition = function (left, top) {
	            this.dialog.css({ left: left, top: top });
	        };
	        CommonDialog.prototype.close = function (removeAfterClosed) {
	            if (removeAfterClosed === void 0) { removeAfterClosed = true; }
	            if (_super.prototype.close.call(this)) {
	                this._removeAfterClosed = removeAfterClosed;
	                return true;
	            }
	            else {
	                return false;
	            }
	        };
	        return CommonDialog;
	    }(tomato.Dialog));
	    exports.CommonDialog = CommonDialog;
	    function turnContainer(container) {
	        var comps = container.html(tpl_TurnContainer).addClass("tdom-turnContainer").find("[data-dom]").groupBy();
	        var content;
	        container.removeChild = function (view) {
	        };
	        container.appendChild = function (view) {
	            var pos, page, panel, scroller, inOrOut = "tdom-in", outOrIn = "tdom-out";
	            if (content) {
	                if (content[0] == view[0]) {
	                    //this.reload();
	                    return;
	                }
	                page = content.parent();
	                scroller = page[0];
	                content.attr("data-pos", scroller.scrollLeft + "," + scroller.scrollTop);
	            }
	            else {
	                page = $(comps['page'][0]);
	            }
	            page.removeClass("tdom-current").addClass("tdom-previous");
	            pos = (view.attr("data-pos") || "0,0").split(",");
	            page = comps['page'][0] == page[0] ? $(comps['page'][1]) : $(comps['page'][0]);
	            panel = $(comps['panel']);
	            var oview = page[0].firstChild;
	            if (view.attr("data-back")) {
	                inOrOut = "tdom-out";
	                outOrIn = "tdom-in";
	            }
	            if (oview) {
	                $(oview).detach();
	            }
	            page.append(view);
	            content = view;
	            page.removeClass("tdom-previous").addClass("tdom-current");
	            panel.removeClass(outOrIn).addClass(inOrOut + " tdom-transform");
	            panel[0].offsetWidth;
	            panel.removeClass("tdom-transform");
	            scroller = page[0];
	            scroller.scrollLeft = parseInt(pos[0]);
	            scroller.scrollTop = parseInt(pos[1]);
	        };
	        return container;
	    }
	    exports.turnContainer = turnContainer;
	    var hideDiv = $("<div style='position:absolute;width:100%;height:100%;left:-100%;top:-100%;overflow: hidden;'></div>").appendTo(document.body);
	    tomato.setConfig({
	        createVPView: function (str) {
	            return $(str).appendTo(hideDiv);
	        }
	    });
	    function setConfig(data) {
	        if (data.dialogZIndexStart) {
	            dialogZIndexStart = data.dialogZIndexStart;
	        }
	    }
	    exports.setConfig = setConfig;
	    exports.DialogTarget = {
	        "Blank": "_blank",
	        "Self": "_self",
	        "Root": "_root",
	        "Top": "_top"
	    };
	    function open(content, target, dialogOptions) {
	        var dialog = tomato.application;
	        if (!target) {
	            target = exports.DialogTarget.Blank;
	        }
	        if (target == exports.DialogTarget.Self || target == exports.DialogTarget.Top) {
	            dialog = tomato.getTopDialog();
	            dialogOptions && dialog.setConfig(dialogOptions);
	        }
	        else if (target == exports.DialogTarget.Blank) {
	            dialog = new CommonDialog(dialogOptions || { masked: true, effect: exports.DialogEffect.scale });
	            tomato.application.appendChild(dialog);
	        }
	        else {
	            dialog = target;
	            dialogOptions && dialog.setConfig(dialogOptions);
	        }
	        dialog.appendChild(content);
	        dialog.focus();
	        return dialog;
	    }
	    exports.open = open;
	    ;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(3);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/.0.26.1@css-loader/index.js!./../node_modules/.4.1.1@sass-loader/index.js!./css.scss", function() {
				var newContent = require("!!./../node_modules/.0.26.1@css-loader/index.js!./../node_modules/.4.1.1@sass-loader/index.js!./css.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, ".tdom-commonDialog.tdom-slideDown > .tdom-dialog, .tdom-commonDialog.tdom-slideUp > .tdom-dialog, .tdom-commonDialog.tdom-slideLeft > .tdom-dialog, .tdom-commonDialog.tdom-slideRight > .tdom-dialog {\n  -webkit-transition: none;\n  transition: none; }\n\n.tdom-commonDialog {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 1px;\n  height: 1px; }\n  .tdom-commonDialog.pt-masked {\n    left: 0;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    width: auto;\n    height: auto; }\n    .tdom-commonDialog.pt-masked > .tdom-mask {\n      display: block; }\n  .tdom-commonDialog.pt-asideOnRight > .tdom-dialog > .tdom-container > .tdom-aside {\n    right: 0; }\n  .tdom-commonDialog.pt-asideOnLeft > .tdom-dialog > .tdom-container > .tdom-aside {\n    left: 0; }\n  .tdom-commonDialog.pt-Closed {\n    display: none; }\n    .tdom-commonDialog.pt-Closed.tdom-scale > .tdom-dialog {\n      -webkit-transform: scale(0, 0);\n      transform: scale(0, 0);\n      opacity: 0;\n      filter: alpha(opacity=0) \\0; }\n    .tdom-commonDialog.pt-Closed.tdom-swipeDown > .tdom-dialog {\n      -webkit-transform: translateY(-50%);\n      transform: translateY(-50%);\n      opacity: 0;\n      filter: alpha(opacity=0) \\0; }\n    .tdom-commonDialog.pt-Closed.tdom-swipeUp > .tdom-dialog {\n      -webkit-transform: translateY(50%);\n      transform: translateY(50%);\n      opacity: 0;\n      filter: alpha(opacity=0) \\0; }\n    .tdom-commonDialog.pt-Closed.tdom-swipeLeft > .tdom-dialog {\n      -webkit-transform: translateX(50%);\n      transform: translateX(50%);\n      opacity: 0;\n      filter: alpha(opacity=0) \\0; }\n    .tdom-commonDialog.pt-Closed.tdom-swipeRight > .tdom-dialog {\n      -webkit-transform: translateX(-50%);\n      transform: translateX(-50%);\n      opacity: 0;\n      filter: alpha(opacity=0) \\0; }\n    .tdom-commonDialog.pt-Closed.tdom-slideDown > .tdom-dialog > .tdom-container {\n      -webkit-transform: translateY(-100%);\n      transform: translateY(-100%); }\n    .tdom-commonDialog.pt-Closed.tdom-slideUp > .tdom-dialog > .tdom-container {\n      -webkit-transform: translateY(100%);\n      transform: translateY(100%); }\n    .tdom-commonDialog.pt-Closed.tdom-slideLeft > .tdom-dialog > .tdom-container {\n      -webkit-transform: translateX(100%);\n      transform: translateX(100%); }\n    .tdom-commonDialog.pt-Closed.tdom-slideRight > .tdom-dialog > .tdom-container {\n      -webkit-transform: translateX(-100%);\n      transform: translateX(-100%); }\n    .tdom-commonDialog.pt-Closed > .tdom-mask {\n      opacity: 0; }\n  .tdom-commonDialog.pt-asideOutBody > .tdom-dialog > .tdom-container > .tdom-aside {\n    top: 0; }\n  .tdom-commonDialog.tdom-transiting {\n    -webkit-animation: dialogEffect 200ms;\n    animation: dialogEffect 200ms; }\n  .tdom-commonDialog.tdom-application {\n    width: 100%;\n    height: 100%; }\n    .tdom-commonDialog.tdom-application > .tdom-dialog {\n      width: 100%;\n      height: 100%;\n      position: absolute; }\n    .tdom-commonDialog.tdom-application > .tdom-mask {\n      display: none;\n      z-index: 9999999999;\n      opacity: 0;\n      filter: alpha(opacity=0) \\0; }\n      .tdom-commonDialog.tdom-application > .tdom-mask.pt-show {\n        display: block; }\n      .tdom-commonDialog.tdom-application > .tdom-mask.pt-busy {\n        opacity: 0.5;\n        filter: alpha(opacity=50) \\0; }\n  .tdom-commonDialog > .tdom-mask {\n    display: none;\n    position: fixed;\n    width: 100%;\n    height: 100%;\n    background: #000;\n    left: 0;\n    top: 0;\n    text-align: center;\n    opacity: 0.5;\n    filter: alpha(opacity=50) \\0;\n    -webkit-transition: opacity 200ms ease-out;\n    transition: opacity 200ms ease-out; }\n    .tdom-commonDialog > .tdom-mask > .tdom-loading {\n      position: absolute;\n      top: 50%;\n      left: 50%; }\n      .tdom-commonDialog > .tdom-mask > .tdom-loading:after {\n        width: 50px;\n        height: 50px;\n        line-height: 50px;\n        overflow: hidden;\n        background: #666;\n        content: 'loading.';\n        display: block;\n        margin-top: -50%;\n        margin-left: -50%;\n        border-radius: 5px;\n        font-size: 9px;\n        color: #000;\n        text-align: center; }\n  .tdom-commonDialog > .tdom-dialog {\n    position: fixed;\n    -webkit-transition: opacity 200ms ease-out;\n    transition: opacity 200ms ease-out;\n    -webkit-transition-property: transform, opacity;\n    transition-property: transform, opacity;\n    -webkit-box-shadow: 0 0 5px 0;\n    box-shadow: 0 0 5px 0;\n    background: transparent;\n    overflow: hidden;\n    width: 100%;\n    height: 100%; }\n    .tdom-commonDialog > .tdom-dialog > .tdom-container {\n      height: 100%;\n      width: 100%;\n      position: relative;\n      -webkit-transition: transform 200ms ease-out;\n      transition: transform 200ms ease-out; }\n      .tdom-commonDialog > .tdom-dialog > .tdom-container > .tdom-component {\n        overflow: hidden;\n        position: relative;\n        background: #FFF;\n        -webkit-overflow-scrolling: touch; }\n      .tdom-commonDialog > .tdom-dialog > .tdom-container > .tdom-aside {\n        height: 100%;\n        position: absolute; }\n\n@-webkit-keyframes dialogEffect {\n  to {\n    opacity: 1; } }\n\n@keyframes dialogEffect {\n  to {\n    opacity: 1; } }\n\n.tdom-turnContainer {\n  position: relative; }\n  .tdom-turnContainer.tdom-cover > .tdom-panel > .tdom-page {\n    -webkit-transition: transform 300ms ease-in;\n    transition: transform 300ms ease-in;\n    -webkit-transition-property: transform, opacity;\n    transition-property: transform, opacity; }\n  .tdom-turnContainer.tdom-cover > .tdom-panel > .tdom-current {\n    opacity: 1;\n    filter: alpha(opacity=100) \\0;\n    z-index: 2; }\n  .tdom-turnContainer.tdom-cover > .tdom-panel > .tdom-previous {\n    opacity: 0;\n    filter: alpha(opacity=0) \\0;\n    z-index: 1; }\n  .tdom-turnContainer.tdom-cover > .tdom-in.tdom-transform > .tdom-current {\n    -webkit-transition: none;\n    transition: none;\n    -webkit-transform: translateX(50%);\n    transform: translateX(50%); }\n  .tdom-turnContainer.tdom-cover > .tdom-out.tdom-transform > .tdom-current {\n    -webkit-transition: none;\n    transition: none;\n    -webkit-transform: translateX(-50%);\n    transform: translateX(-50%); }\n  .tdom-turnContainer.tdom-slid {\n    overflow: hidden; }\n    .tdom-turnContainer.tdom-slid > .tdom-panel {\n      position: absolute;\n      width: 200%;\n      height: 100%;\n      -webkit-transition: transform 300ms ease-in;\n      transition: transform 300ms ease-in; }\n      .tdom-turnContainer.tdom-slid > .tdom-panel > .tdom-page {\n        width: 50%; }\n    .tdom-turnContainer.tdom-slid > .tdom-in {\n      left: -100%; }\n      .tdom-turnContainer.tdom-slid > .tdom-in > .tdom-current {\n        left: 50%; }\n      .tdom-turnContainer.tdom-slid > .tdom-in.tdom-transform {\n        -webkit-transition: none;\n        transition: none;\n        -webkit-transform: translateX(50%);\n        transform: translateX(50%); }\n    .tdom-turnContainer.tdom-slid > .tdom-out > .tdom-previous {\n      left: 50%; }\n    .tdom-turnContainer.tdom-slid > .tdom-out.tdom-transform {\n      -webkit-transition: none;\n      transition: none;\n      -webkit-transform: translateX(-50%);\n      transform: translateX(-50%); }\n  .tdom-turnContainer > .tdom-panel > .tdom-page {\n    position: absolute;\n    overflow-x: hidden;\n    overflow-y: hidden;\n    width: 100%;\n    height: 100%;\n    left: 0;\n    top: 0;\n    -webkit-overflow-scrolling: touch; }\n\n.pt-topDialog .tdom-turnContainer > .tdom-panel > .tdom-page {\n  overflow-y: auto; }\n\n.tdom-transiting.tdom-commonDialog > .tdom-dialog {\n  -webkit-box-shadow: none !important;\n  box-shadow: none !important; }\n\n.tdom-transiting .tdom-transition {\n  -webkit-transition: none !important;\n  transition: none !important; }\n", ""]);

	// exports


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "<div class=\"tdom-commonDialog\">\r\n\t<div class=\"tdom-mask\" data-dom=\"mask\"></div>\r\n\t<div class=\"tdom-dialog\" data-dom=\"dialog\">\r\n\t\t<div class=\"tdom-container\">\r\n\t\t\t<div class=\"tdom-header tdom-component\" data-dom=\"header\"></div>\r\n\t\t\t<div class=\"tdom-aside tdom-component\" data-dom=\"aside\"></div>\r\n\t\t\t<div class=\"tdom-body tdom-component\" data-dom=\"body\"></div>\r\n\t\t\t<div class=\"tdom-footer tdom-component\" data-dom=\"footer\"></div>\r\n\t\t</div>\r\n\t</div>\r\n</div>";

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = "<div data-dom=\"panel\" class=\"tdom-panel tdom-transition\">\r\n\t<div data-dom=\"page\" class=\"tdom-page tdom-current tdom-transition\"></div>\r\n\t<div data-dom=\"page\" class=\"tdom-page tdom-previous tdom-transition\"></div>\r\n</div>";

/***/ }
/******/ ])
});
;