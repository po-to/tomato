var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function findInArray(arr, fun) {
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var item = arr_1[_i];
            if (fun(item)) {
                return item;
            }
        }
        return undefined;
    }
    function findIndexInArray(arr, fun) {
        for (var i = 0, k = arr.length; i < k; i++) {
            if (fun(arr[i])) {
                return i;
            }
        }
        return -1;
    }
    function assignObject(target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
            var item = args_1[_a];
            for (var key in item) {
                if (item.hasOwnProperty(key)) {
                    target[key] = item[key];
                }
            }
        }
        return target;
    }
    var autoID = 0;
    exports.namespace = 'po-to/tomato';
    exports.TaskCountEvent = {
        Added: "TaskCountEvent.Added",
        Completed: "TaskCountEvent.Completed",
        Busy: "TaskCountEvent.Busy",
        Free: "TaskCountEvent.Free"
    };
    exports.ViewEvent = {
        Installed: "ViewEvent.Installed",
        Uninstalled: "ViewEvent.Uninstalled",
        ChildAppended: "ViewEvent.ChildAppended",
        ChildRemoved: "ViewEvent.ChildRemoved",
        Inited: "ViewEvent.Inited",
    };
    var PropState;
    (function (PropState) {
        PropState[PropState["Invalid"] = 0] = "Invalid";
        PropState[PropState["Computing"] = 1] = "Computing";
        PropState[PropState["Updated"] = 2] = "Updated";
    })(PropState = exports.PropState || (exports.PropState = {}));
    // export const ViewTransaction = {
    //     AllowInstall: "AllowInstall"
    // }
    exports.DialogEvent = {
        Focused: "DialogEvent.Focused",
        Blured: "DialogEvent.Blured",
        Closed: "DialogEvent.Closed",
    };
    exports.CmdEvent = {
        ItemSuccess: "CmdEvent.ItemSuccess",
        ItemFailure: "CmdEvent.ItemFailure",
        CmdSuccess: "CmdEvent.CmdSuccess",
        CmdFailure: "CmdEvent.CmdFailure",
        Failure: "CmdEvent.Failure",
        Success: "CmdEvent.Success",
        Complete: "CmdEvent.Complete",
        Overflow: "CmdEvent.Overflow"
    };
    var SizeDependOn;
    (function (SizeDependOn) {
        SizeDependOn[SizeDependOn["children"] = 0] = "children";
        SizeDependOn[SizeDependOn["parent"] = 1] = "parent";
    })(SizeDependOn = exports.SizeDependOn || (exports.SizeDependOn = {}));
    var PEvent = (function () {
        /**
         * 事件构造函数
         * @param name 事件名称
         * @param data 事件要传递的数据
         * @param bubbling 事件是否向上冒泡
         */
        function PEvent(name, data, bubbling) {
            if (bubbling === void 0) { bubbling = false; }
            this.name = name;
            this.data = data;
            this.bubbling = bubbling;
        }
        /**
         * 设置事件的原始派发者
         */
        PEvent.prototype.setTarget = function (target) {
            this.target = target;
        };
        /**
         * 设置事件的当前冒泡派发者
         */
        PEvent.prototype.setCurrentTarget = function (target) {
            this.currentTarget = target;
        };
        return PEvent;
    }());
    exports.PEvent = PEvent;
    var PError = (function (_super) {
        __extends(PError, _super);
        function PError(name, note, data) {
            if (note === void 0) { note = "tomato.PError"; }
            var _this = _super.call(this, name + note) || this;
            _this.name = name;
            _this.note = note;
            _this.data = data;
            return _this;
        }
        PError.prototype.getNamespace = function () {
            return exports.namespace;
        };
        return PError;
    }(Error));
    exports.PError = PError;
    function emptyObject(obj) {
        var arr = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(key);
            }
        }
        arr.forEach(function (key) {
            delete obj[key];
        });
        return obj;
    }
    var _invalidLayoutTimer = 0;
    function invalidProp(vp) {
        if (!_invalidLayoutTimer) {
            _invalidLayoutTimer = setTimeout(function () {
                _invalidLayoutTimer = 0;
                exports.application.eachChildren(function (vp) {
                    vp.updateProp();
                });
            }, 0);
        }
    }
    exports.invalidProp = invalidProp;
    /**
     *我们知道浏览器中的Dom对象可以派发事件，而对于一个JS对象却没有原生的事件机制，为此，tomato中的PDispatcher补充了这一点。tomato.PDispatcher是个事件派发的基类，它和所有继承于它的子类都可以实现简单的事件派发。
     */
    var PDispatcher = (function () {
        /**
         * 事件构造函数
         * @param parent PDispatcher是有父子层级关系的，类似于Dom事件，当一个事件对象具有“bubbling冒泡”属性时，在其本身派发完事件之后，如果存在parent，则parent继续派发此事件
         */
        function PDispatcher(parent) {
            this.parent = parent;
            /** 该对象所有侦听函数的集合 */
            this._handlers = {};
        }
        /**
         * 类似于Dom物件的addEventListener，添加ename事件的侦听函数
         * @param ename 要侦听的事件名
         * @param handler 事件回调函数
         */
        PDispatcher.prototype.addListener = function (ename, handler) {
            var dictionary = this._handlers[ename];
            if (!dictionary) {
                this._handlers[ename] = dictionary = [];
            }
            dictionary.push(handler);
            return this;
        };
        /**
         * 类似于Dom物件的removeEventListener，移除该物件上侦听ename的指定handler
         * @param ename 要移除侦听的事件名，如果不传ename表示移除该物件上所有侦听函数
         * @param handler 要移除侦听的事件回调函数，如果不传handler表示移除该物件上ename的所有侦听函数
         */
        PDispatcher.prototype.removeListener = function (ename, handler) {
            if (!ename) {
                emptyObject(this._handlers);
            }
            else {
                var handlers = this._handlers;
                if (handlers.propertyIsEnumerable(ename)) {
                    var dictionary = handlers[ename];
                    if (!handler) {
                        delete handlers[ename];
                    }
                    else {
                        var n = dictionary.indexOf(handler);
                        if (n > -1) {
                            dictionary.splice(n, 1);
                        }
                        if (dictionary.length == 0) {
                            delete handlers[ename];
                        }
                    }
                }
            }
            return this;
        };
        /**
         * 派发指定的事件
         * @param evt 要派发的事件
         */
        PDispatcher.prototype.dispatch = function (evt) {
            if (!evt.target) {
                evt.setTarget(this);
            }
            evt.setCurrentTarget(this);
            var dictionary = this._handlers[evt.name];
            if (dictionary) {
                for (var i = 0, k = dictionary.length; i < k; i++) {
                    dictionary[i](evt);
                }
            }
            if (this.parent && evt.bubbling) {
                this.parent.dispatch(evt);
            }
            return this;
        };
        /** parent属性为readonly的，要设置parent请使用此方法 */
        PDispatcher.prototype.setParent = function (parent) {
            this.parent = parent;
            return this;
        };
        return PDispatcher;
    }());
    exports.PDispatcher = PDispatcher;
    var TaskCounterState;
    (function (TaskCounterState) {
        TaskCounterState[TaskCounterState["Free"] = 0] = "Free";
        TaskCounterState[TaskCounterState["Busy"] = 1] = "Busy";
    })(TaskCounterState = exports.TaskCounterState || (exports.TaskCounterState = {}));
    ;
    var TaskCounter = (function (_super) {
        __extends(TaskCounter, _super);
        function TaskCounter(deferSecond) {
            var _this = _super.call(this) || this;
            _this.deferSecond = deferSecond;
            _this.list = [];
            _this.state = TaskCounterState.Free;
            return _this;
        }
        TaskCounter.prototype.addItem = function (promise, note) {
            var _this = this;
            if (note === void 0) { note = ''; }
            if (!this.list.some(function (item) { return item.promise === promise; })) {
                this.list.push({ promise: promise, note: note });
                promise.then(function (value) { return _this._completeItem(promise); }, function (reason) { return _this._completeItem(promise); });
                this.dispatch(new PEvent(exports.TaskCountEvent.Added));
                if (!this._timer) {
                    this._timer = window.setTimeout(function () {
                        _this._timer = 0;
                        if (_this.list.length > 0 && _this.state == TaskCounterState.Free) {
                            _this.state = TaskCounterState.Busy;
                            _this.dispatch(new PEvent(exports.TaskCountEvent.Busy));
                        }
                    }, this.deferSecond * 1000);
                }
            }
            return promise;
        };
        TaskCounter.prototype._completeItem = function (promise) {
            var i = findIndexInArray(this.list, function (item) { return item.promise === promise; });
            if (i > -1) {
                this.list.splice(i, 1);
                this.dispatch(new PEvent(exports.TaskCountEvent.Completed));
                if (this.list.length == 0) {
                    if (this._timer) {
                        clearTimeout(this._timer);
                        this._timer = 0;
                    }
                    if (this.state == TaskCounterState.Busy) {
                        this.state = TaskCounterState.Free;
                        this.dispatch(new PEvent(exports.TaskCountEvent.Free));
                    }
                }
            }
            return this;
        };
        return TaskCounter;
    }(PDispatcher));
    exports.TaskCounter = TaskCounter;
    exports.taskCounter = new TaskCounter(3);
    function isViewComponent(data) {
        return (typeof data.getVID == "function") && (typeof data.getVCON == "function") && (typeof data.setVID == "function") && (typeof data.getSUBS == "function") && (typeof data.removeChild == "function") && (typeof data.appendChild == "function") && (typeof data.removeClass == "function") && (typeof data.addClass == "function");
    }
    var createViewComponent = function (data) {
        return {};
    };
    var View = (function (_super) {
        __extends(View, _super);
        function View(viewComponent, parent, vid) {
            var _this = _super.call(this, parent) || this;
            _this.viewComponent = viewComponent;
            _this.children = [];
            _this.vid = "";
            _this._propState = {};
            _this._propValue = {};
            _this._eventToAction = null;
            if (vid) {
                _this.vid = vid.split("?")[0].replace(/\/+$/, "");
            }
            if (_this.vid) {
                ViewStore[_this.vid] = _this;
            }
            _this.initialization = _this._init();
            return _this;
        }
        View.prototype._init = function () {
            var _this = this;
            var hasPromise = false;
            var list = this.viewComponent.getSUBS().map(function (component) {
                var result = getAnyView(component, _this, true);
                if (!hasPromise && result instanceof Promise) {
                    hasPromise = true;
                }
                return result;
            });
            if (!list.length || !hasPromise) {
                (_a = this.children).push.apply(_a, list);
                this._inited();
                return null;
            }
            else {
                return Promise.all(list).then(function (list) {
                    (_a = _this.children).push.apply(_a, list);
                    _this._inited();
                    return _this;
                    var _a;
                });
            }
            var _a;
        };
        View.prototype._inited = function () {
            this.dispatch(new PEvent(exports.ViewEvent.Inited));
        };
        View.prototype._triggerEvent = function (evtName, data, target) {
            var mapping = this._eventToAction || this;
            var handler = mapping[evtName];
            if (typeof (handler) == "function") {
                return handler.call(this, data, target) ? true : false;
            }
            else {
                return true;
            }
        };
        View.prototype._allowInstallTo = function (parent, options) {
            return true;
        };
        View.prototype._allowUninstallTo = function (parent, options) {
            return true;
        };
        View.prototype._allowAppendChild = function (child, options) {
            if (child instanceof Dialog) {
                if (!(this instanceof Dialog)) {
                    return false;
                }
                else if (child.state != DialogState.Closed) {
                    return false;
                }
            }
            return true;
        };
        View.prototype._allowRemoveChild = function (child, options) {
            return true;
        };
        View.prototype._beforeInstallTo = function (parent, options) {
        };
        View.prototype._beforeUninstallTo = function (parent, options) {
        };
        View.prototype._afterInstallTo = function (parent, options) {
        };
        View.prototype._afterUninstallTo = function (parent, options) {
        };
        View.prototype._afterRemoveChild = function (member, options) {
        };
        View.prototype._afterAppendChild = function (member, options) {
        };
        View.prototype._beforeRemoveChild = function (member, options) {
        };
        View.prototype._beforeAppendChild = function (member, options) {
        };
        View.prototype._appendViewComponent = function (member, options) {
            this.viewComponent.appendChild(member.viewComponent);
        };
        View.prototype._removeViewComponent = function (member, options) {
            this.viewComponent.removeChild(member.viewComponent);
        };
        View.prototype._checkRemoveChild = function (member, options) {
            if (member.parent != this) {
                return true;
            }
            if (!member._allowUninstallTo(this, options) ||
                !this._allowRemoveChild(member, options)) {
                return false;
            }
            return true;
        };
        View.prototype.removeChild = function (member, options, checked) {
            if (member.parent != this) {
                return false;
            }
            if (!checked && !this._checkRemoveChild(member, options)) {
                return false;
            }
            this._beforeRemoveChild(member, options);
            member._beforeUninstallTo(this, options);
            this.children.splice(this.children.indexOf(member), 1);
            this._removeViewComponent(member, options);
            member.setParent(undefined);
            this._afterRemoveChild(member, options);
            member._afterUninstallTo(this, options);
            this.dispatch(new PEvent(exports.ViewEvent.ChildRemoved, options));
            member.dispatch(new PEvent(exports.ViewEvent.Uninstalled, options));
            return true;
        };
        View.prototype._checkAppendChild = function (member, options) {
            if (member.parent == this) {
                return true;
            }
            if (!member._allowInstallTo(this, options) ||
                !this._allowAppendChild(member, options) ||
                (member.parent && (!member._allowUninstallTo(this, options) || !member.parent._allowRemoveChild(member, options)))) {
                return false;
            }
            return true;
        };
        View.prototype.getDialog = function () {
            var parent = this.parent;
            while (parent) {
                if (parent instanceof Dialog) {
                    return parent;
                }
                parent = parent.parent;
            }
            return exports.application;
        };
        View.prototype.appendChild = function (member, options, checked) {
            if (member.parent == this) {
                return false;
            }
            if (!checked && !this._checkAppendChild(member, options)) {
                return false;
            }
            if (member.parent) {
                member.parent.removeChild(member, options, true);
            }
            this._beforeAppendChild(member, options);
            member._beforeInstallTo(this, options);
            member.setParent(this);
            this.children.push(member);
            this._appendViewComponent(member, options);
            this._afterAppendChild(member, options);
            member._afterInstallTo(this, options);
            this.dispatch(new PEvent(exports.ViewEvent.ChildAppended, options));
            member.dispatch(new PEvent(exports.ViewEvent.Installed, options));
            return true;
        };
        View.prototype.replaceChild = function (newChild, oChild, options, checked) {
            if (newChild.parent == this) {
                return false;
            }
            if (!checked && !this._checkAppendChild(newChild, options)) {
                return false;
            }
            if (oChild && oChild.parent == this) {
                if (!checked && !this._checkRemoveChild(oChild, options)) {
                    return false;
                }
                this.removeChild(oChild, options, true);
            }
            return this.appendChild(newChild, options, true);
        };
        View.prototype.destroy = function () {
            if (this.vid) {
                delete ViewStore[this.vid];
            }
        };
        View.prototype.eachChildren = function (callback, andSelf) {
            if (andSelf) {
                callback(this);
            }
            if (this.children.length) {
                this.children.forEach(function (child) {
                    child.eachChildren(callback, true);
                });
            }
        };
        View.prototype.invalidProp = function (prop) {
            if (this._propState[prop] == PropState.Invalid) {
                return;
            }
            this._propState[prop] = PropState.Invalid;
            invalidProp(this);
        };
        View.prototype.getProp = function (prop, ovalue) {
            var value = this._propState[prop];
            if (value == PropState.Invalid) {
                if (ovalue) {
                    return this._propValue[prop];
                }
                else {
                    throw this.vid + '.' + prop + ' is invalid';
                }
            }
            else if (value == PropState.Computing) {
                if (ovalue) {
                    return this._propValue[prop];
                }
                else {
                    throw this.vid + '.' + prop + ' is loop dependency';
                }
            }
            else if (value == PropState.Updated) {
                this._propState[prop] = PropState.Computing;
                this._propValue[prop] = this._computeProp(prop);
                delete this._propState[prop];
                return this._propValue[prop];
            }
            else {
                return this._propValue[prop];
            }
        };
        View.prototype._computeProp = function (prop) {
            return '';
        };
        View.prototype.updateProp = function () {
            for (var key in this._propState) {
                if (this._propState[key] == PropState.Invalid) {
                    this._propState[key] = PropState.Updated;
                }
            }
        };
        return View;
    }(PDispatcher));
    exports.View = View;
    var ViewStore = {};
    function syncRequire(path) {
        try {
            return require(path);
        }
        catch (e) {
            return new Promise(function (resolve, reject) {
                require([path], function (data) {
                    resolve(data);
                }, function (error) {
                    reject(error);
                });
            });
        }
    }
    var getAnyView = (function (ViewStore) {
        function buildViewComponent(data) {
            return createViewComponent(data);
        }
        function initView(con, component, url, parent, inited) {
            var vp = new con(component, parent, url);
            if (inited) {
                if (vp.initialization) {
                    return vp.initialization;
                }
                else {
                    return vp;
                }
            }
            else {
                return vp;
            }
        }
        function buildView(component, url, parent, inited) {
            if (!isViewComponent(component)) {
                console.log(component);
                throw "is not a IViewComponent";
            }
            var conPath = component.getVCON();
            if (conPath) {
                var result = syncRequire(conPath);
                if (result instanceof Promise) {
                    return result.then(function (data) {
                        return initView(data, component, url, parent, inited);
                    });
                }
                else {
                    return initView(result, component, url, parent, inited);
                }
            }
            else {
                return initView(View, component, url, parent, inited);
            }
        }
        function returnResult(component, url, parent, inited) {
            if (component) {
                return buildView(component, url, parent, inited);
            }
            else if (url) {
                var result = syncRequire(url);
                if (result instanceof Promise) {
                    return result.then(function (data) {
                        return buildView(buildViewComponent(data), url, parent, inited);
                    });
                }
                else {
                    return buildView(buildViewComponent(result), url, parent, inited);
                }
            }
            else {
                throw 'not found component and url !';
            }
        }
        return function (data, parent, inited) {
            if (parent === void 0) { parent = undefined; }
            if (inited === void 0) { inited = true; }
            var url;
            var id;
            var component;
            if (typeof data != "string") {
                component = data;
                id = data.getVID();
            }
            else {
                component = null;
                id = data;
            }
            url = id;
            id = id.split("?")[0].replace(/\/+$/, "");
            var cacheData = ViewStore[id];
            if (cacheData instanceof View) {
                return cacheData;
            }
            else if (cacheData instanceof Promise) {
                return cacheData;
            }
            else {
                var result = returnResult(component, url, parent, inited);
                if (result instanceof Promise) {
                    ViewStore[id] = result;
                    result['catch'](function (error) {
                        delete ViewStore[id];
                        console.log(url + ":" + error);
                    });
                    exports.taskCounter.addItem(result, 'load:' + url);
                }
                return result;
            }
        };
    })(ViewStore);
    function syncGetView(data, parent, inited) {
        if (parent === void 0) { parent = undefined; }
        if (inited === void 0) { inited = true; }
        return getAnyView(data, parent, inited);
    }
    exports.syncGetView = syncGetView;
    function asyncGetView(data, parent, inited) {
        if (parent === void 0) { parent = undefined; }
        if (inited === void 0) { inited = true; }
        var result = getAnyView(data, parent, inited);
        if (result instanceof Promise) {
            return result;
        }
        else {
            return Promise.resolve(result);
        }
    }
    exports.asyncGetView = asyncGetView;
    function getView(data, parent, inited) {
        if (parent === void 0) { parent = undefined; }
        if (inited === void 0) { inited = true; }
        return getAnyView(data, parent, inited);
    }
    exports.getView = getView;
    var DialogState;
    (function (DialogState) {
        DialogState[DialogState["Focused"] = 0] = "Focused";
        DialogState[DialogState["Blured"] = 1] = "Blured";
        DialogState[DialogState["Closed"] = 2] = "Closed";
    })(DialogState = exports.DialogState || (exports.DialogState = {}));
    ;
    exports.DialogEffect = {
        scale: "scale"
    };
    exports.DialogPosition = {
        left: "left",
        right: "right",
        center: "center",
        top: "top",
        bottom: "bottom",
        middle: "middle",
    };
    var DialogConfig = {
        className: '',
        masked: false,
        fixedBackground: true,
        x: exports.DialogPosition.center,
        y: exports.DialogPosition.middle,
        width: "50%",
        height: "50%",
        offsetX: "",
        offsetY: "",
        effect: exports.DialogEffect.scale
    };
    var Dialog = (function (_super) {
        __extends(Dialog, _super);
        function Dialog(els, config) {
            var _this = _super.call(this, els.viewComponent, undefined) || this;
            _this.history = new History();
            _this.state = DialogState.Closed;
            _this._dialogList = [];
            _this._zindex = -1;
            _this.config = DialogConfig;
            _this.dialog = els.dialog;
            _this.mask = els.mask;
            _this.body = els.body;
            _this.viewComponent.addClass("pt-layer pt-" + DialogState[_this.state]);
            _this.dialog.addClass("pt-dialog");
            _this.mask.addClass("pt-mask");
            _this.body.addClass("pt-body");
            if (config) {
                _this.setConfig(config);
            }
            _this.history.addListener(exports.CmdEvent.Overflow, function (e) {
                _this._onHistoryOverflow(e);
            });
            return _this;
        }
        Dialog.prototype._onHistoryOverflow = function (e) {
            this.close();
        };
        Dialog.prototype.setConfig = function (config) {
            var oldConfig = this.config;
            this.config = assignObject({}, this.config, config);
            this._afterConfigChange(oldConfig);
        };
        Dialog.prototype.getZIndex = function () {
            return this._zindex;
        };
        Dialog.prototype.getFocusedChild = function () {
            var list = this._dialogList;
            var dialog = this;
            while (list.length) {
                dialog = list[list.length - 1];
                list = dialog._dialogList;
            }
            return dialog;
        };
        Dialog.prototype.eachDialogChildren = function (callback, andSelf) {
            if (andSelf) {
                callback(this);
            }
            if (this._dialogList.length) {
                this._dialogList.forEach(function (child) {
                    child.eachDialogChildren(callback, true);
                });
            }
        };
        Dialog.prototype._afterConfigChange = function (oldConfig) {
            this.dialog.removeClass(oldConfig.className);
            this.mask.removeClass(oldConfig.className);
            this.viewComponent.removeClass(["pt-" + oldConfig.effect, (oldConfig.masked ? "pt-masked" : "")].join(" "));
            var config = this.config;
            this.dialog.addClass(config.className);
            this.mask.addClass(config.className);
            this.viewComponent.addClass(["pt-" + config.effect, (config.masked ? "pt-masked" : "")].join(" "));
        };
        Dialog.prototype._setZIndex = function (i) {
            this._zindex = i;
            this.viewComponent.setZIndex(i);
        };
        Dialog.prototype._countIndex = function () {
            this._dialogList.forEach(function (dialog, index) {
                dialog._setZIndex(index);
            });
        };
        Dialog.prototype._beforeFocus = function () {
        };
        Dialog.prototype._afterFocus = function () {
        };
        Dialog.prototype._beforeClose = function () {
        };
        Dialog.prototype._afterClose = function () {
        };
        Dialog.prototype._beforeBlur = function () {
        };
        Dialog.prototype._afterBlur = function () {
        };
        Dialog.prototype._allowFocus = function (closeAction) {
            /*
            close{
                需要将第2个focus{
                    不需要将第1个blur
                    不需要将父focus
                }
                不需要将第2个focus
            }
            focus{
                新加入的{
                    将第一个blur
                    将父focus
                }
                已存在的{
                    将第一个blur
                    将父focus
                }
            }
            */
            return true;
        };
        Dialog.prototype._allowBlur = function () {
            return true;
        };
        Dialog.prototype._allowClose = function () {
            return true;
        };
        Dialog.prototype._checkFocus = function () {
            if (this == exports.application) {
                return true;
            }
            if (!this.parent) {
                return false;
            }
            var parentDialog = this.parent;
            if (this.state != DialogState.Focused) {
                if (!this._allowFocus()) {
                    return false;
                }
                var list = parentDialog._dialogList;
                var dialog = list[list.length - 1];
                if (dialog && dialog != this && !dialog._allowBlur()) {
                    return false;
                }
            }
            return parentDialog._checkFocus();
        };
        Dialog.prototype._checkClose = function () {
            if (this.state == DialogState.Closed) {
                return true;
            }
            if (!this.parent) {
                return false;
            }
            if (!this._allowClose()) {
                return false;
            }
            var parentDialog = this.parent;
            if (this.state == DialogState.Focused) {
                var list = parentDialog._dialogList;
                var dialog = list[list.length - 2];
                if (dialog && !dialog._allowFocus(true)) {
                    return false;
                }
            }
            return true;
        };
        Dialog.prototype.focus = function (_checked, _parentCall) {
            /* 三种调用场景：1.由close()上文调用；2.当前为closed状态; 3.当前为blured状态 */
            //if (this.state == DialogState.Focused) { return false; }
            if (!_checked && !this._checkFocus()) {
                return false;
            }
            var parentDialog = this.parent;
            var list = parentDialog._dialogList;
            var blurDialog = list[list.length - 1];
            var initiative = true;
            if (this.state != DialogState.Focused) {
                if (blurDialog == this) {
                    blurDialog = undefined;
                    initiative = false;
                }
                this._beforeFocus();
                if (initiative) {
                    if (this.state == DialogState.Blured) {
                        var i = list.indexOf(this);
                        (i > -1) && list.splice(i, 1);
                    }
                    list.push(this);
                    parentDialog._countIndex();
                }
            }
            if (initiative) {
                parentDialog.focus(false, true);
            }
            if (this.state != DialogState.Focused) {
                blurDialog && blurDialog._blur();
                var curState = this.state;
                this._setState(DialogState.Focused);
                if (curState == DialogState.Closed) {
                }
                this._afterFocus();
                if (!_parentCall) {
                    setTopDialog(this);
                }
                this.dispatch(new PEvent(exports.DialogEvent.Focused));
                this.children.forEach(function (child) {
                    if (!(child instanceof Dialog)) {
                        child.eachChildren(function (child) {
                            child.dispatch(new PEvent(exports.DialogEvent.Focused));
                        }, true);
                    }
                });
            }
            return true;
        };
        Dialog.prototype.close = function () {
            if (this.state == DialogState.Closed || !this._checkClose()) {
                return false;
            }
            this._beforeClose();
            var parentDialog = this.parent;
            var list = parentDialog._dialogList;
            var focusDialog = null;
            if (list[list.length - 1] == this) {
                list.pop();
                focusDialog = list[list.length - 1];
            }
            else {
                var i = list.indexOf(this);
                (i > -1) && list.splice(i, 1);
                this._countIndex();
            }
            this._setZIndex(-1);
            this._setState(DialogState.Closed);
            this._afterClose();
            this.dispatch(new PEvent(exports.DialogEvent.Closed));
            this.children.forEach(function (child) {
                if (!(child instanceof Dialog)) {
                    child.eachChildren(function (child) {
                        child.dispatch(new PEvent(exports.DialogEvent.Closed));
                    }, true);
                }
            });
            focusDialog && focusDialog.focus(true);
            !focusDialog && setTopDialog(parentDialog);
            return true;
        };
        Dialog.prototype._blur = function () {
            if (this.state == DialogState.Blured) {
                return;
            }
            this._beforeBlur();
            this._setState(DialogState.Blured);
            this._afterBlur();
            this.dispatch(new PEvent(exports.DialogEvent.Blured));
            this.children.forEach(function (child) {
                if (!(child instanceof Dialog)) {
                    child.eachChildren(function (child) {
                        child.dispatch(new PEvent(exports.DialogEvent.Blured));
                    }, true);
                }
            });
        };
        Dialog.prototype._setState = function (state) {
            this.viewComponent.removeClass("pt-" + DialogState[this.state]);
            this.state = state;
            this.viewComponent.addClass("pt-" + DialogState[this.state]);
        };
        Dialog.prototype.onWindowResize = function (e) {
        };
        Dialog.prototype._appendViewComponent = function (member, options) {
            if (member instanceof Dialog) {
                this.viewComponent.appendChild(member.viewComponent);
            }
            else {
                this.body.appendChild(member.viewComponent);
            }
        };
        Dialog.prototype._removeViewComponent = function (member, options) {
            if (member instanceof Dialog) {
                this.viewComponent.removeChild(member.viewComponent);
            }
            else {
                this.body.removeChild(member.viewComponent);
            }
        };
        return Dialog;
    }(View));
    exports.Dialog = Dialog;
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application(rootUri, els, config) {
            var _this = _super.call(this, els, config) || this;
            _this.initTime = Date.now();
            _this.viewComponent.removeClass("pt-layer").addClass("pt-application");
            _this._setZIndex(0);
            _this._setState(DialogState.Focused);
            _this.viewComponent.addClass("pt-topDialog");
            exports.taskCounter.addListener(exports.TaskCountEvent.Added, function (e) {
                _this.mask.addClass("pt-show");
            }).addListener(exports.TaskCountEvent.Completed, function (e) {
                _this.mask.removeClass("pt-show");
            }).addListener(exports.TaskCountEvent.Busy, function (e) {
                _this.mask.addClass("pt-busy");
            }).addListener(exports.TaskCountEvent.Free, function (e) {
                _this.mask.removeClass("pt-busy");
            });
            if (rootUri) {
                _this._initHistory(_this.initTime, rootUri);
            }
            return _this;
        }
        Application.prototype._initHistory = function (initTime, rootUri) {
            /*
                浏览器历史记录和tomato历史记录是解耦独立运行的，tomato历史记录是主动执行者，执行成功后会通过_syncHistory同步浏览器历史记录。
                当用户主动操作浏览器历史记录时，浏览器历史记录将转换为tomato历史记录，并且立即恢复到操作前，然后执行操作tomato历史记录，再由tomato历史记录通过_syncHistory同步
             */
            var supportState = window.history.pushState ? true : false;
            var _trigger;
            var history = this.history;
            var skipHashEvent;
            function pushState(code, title, url, isUri) {
                if (supportState) {
                    window.history.pushState(code, title, isUri ? url : "#" + encodeURI(url));
                }
                else {
                    skipHashEvent = true;
                    window.location.href = "#" + exports.namespace + "@" + code + "@" + encodeURI(url);
                }
            }
            function addState(code, title, url) {
                if (supportState) {
                    window.history.replaceState(initTime + "." + code, title || document.title, url || window.location.href);
                }
                else {
                    skipHashEvent = true;
                    window.location.replace("#" + exports.namespace + "@" + initTime + "." + code + "@" + encodeURI(url || window.location.href));
                }
            }
            history._syncHistory = function (change, callback) {
                //历史记录是独立的，通过此方法关联到浏览器的历史记录
                var execute = function () {
                    if (change.push) {
                        pushState(initTime + '.' + change.push.code, change.push.title, change.push.url, change.push.isUri);
                        document.title = change.push.title;
                    }
                    setTimeout(callback, 1);
                };
                if (change.move) {
                    _trigger = function () {
                        document.title = change.moveTitle || '';
                        execute();
                    };
                    window.history.go(change.move);
                }
                else {
                    execute();
                }
            };
            function handlerHistory(str) {
                var _a = str.split(".").map(function (val) {
                    return parseInt(val);
                }), flag = _a[0], uri = _a[1], act = _a[2];
                if (flag == initTime) {
                    var cmd = history.getCmdByCode(uri + '.' + act);
                    if (cmd) {
                        var _b = history.getCode(), curUri = _b[0], curAct = _b[1];
                        var n_1 = curUri - uri + curAct - act;
                        if (n_1 != 0) {
                            var title_1 = document.title;
                            document.title = cmd.title;
                            _trigger = function () {
                                document.title = title_1;
                                setTimeout(function () {
                                    //恢复到操作前完毕后才开始真正执行history
                                    getTopDialog().history.go(-n_1);
                                }, 1);
                            };
                            window.history.go(n_1); //为了恢复到操作前
                        }
                    }
                    else {
                        window.location.reload();
                    }
                }
                else {
                    window.location.reload();
                }
            }
            function handlerChange(e) {
                if (_trigger) {
                    if (typeof _trigger == "function") {
                        _trigger();
                    }
                    _trigger = false;
                }
                else {
                    if (history.getLength()) {
                        if (e.state) {
                            handlerHistory(e.state);
                        }
                        else {
                            /*
                                尽量将历史记录交由tomato历史记录管理，由tomato历史记录来推进浏览器历史记录，浏览器历史记录是个被动者。
                                但是，有的情况下，用户主动输入了一个网址，而又没有刷新页面，比如hash#，此时浏览器会有自动scroll到描点的行为，此时浏览器是主动执行者。
                                这种情况下，tomato将产生一条空CMD来同步浏览器的历史记录
                             */
                            history.added(new Cmd(window.location.href, document.title, false));
                            addState(history.getCode().join("."));
                        }
                    }
                }
            }
            if (supportState) {
                bindEventListener(window, 'popstate', handlerChange);
            }
            else {
                bindEventListener(window, 'hashchange', function (e) {
                    if (skipHashEvent) {
                        skipHashEvent = false;
                    }
                    else {
                        var arr = window.location.hash.split("@");
                        if (arr[0] == "#" + exports.namespace && arr[1] && arr[2]) {
                            handlerChange({ state: arr[1] });
                        }
                        else {
                            handlerChange({ state: "" });
                        }
                    }
                });
            }
            document.title = rootUri.title;
            addState("1.0", rootUri.title, rootUri.url);
            this.history.added(rootUri);
        };
        Application.prototype.close = function () {
            return false;
        };
        Application.prototype.focus = function (checked) {
            return false;
        };
        return Application;
    }(Dialog));
    exports.Application = Application;
    exports.application = {};
    var Cmd = (function (_super) {
        __extends(Cmd, _super);
        function Cmd(url, title, isUri) {
            if (isUri === void 0) { isUri = false; }
            var _this = _super.call(this) || this;
            _this.url = url;
            _this.title = title;
            _this.isUri = isUri;
            return _this;
        }
        Cmd.prototype.success = function () {
            this.dispatch(new PEvent(exports.CmdEvent.ItemSuccess, this, true));
        };
        Cmd.prototype.failure = function () {
            this.dispatch(new PEvent(exports.CmdEvent.ItemFailure, this, true));
        };
        Cmd.prototype.execute = function () {
            console.log('execute()', this.url);
            this.success();
        };
        Cmd.prototype.redo = function () {
            console.log('redo()', this.url);
            this.success();
        };
        Cmd.prototype.undo = function () {
            console.log('undo()', this.url);
            this.success();
        };
        return Cmd;
    }(PDispatcher));
    exports.Cmd = Cmd;
    var openDialogCmd = (function (_super) {
        __extends(openDialogCmd, _super);
        function openDialogCmd() {
            return _super.call(this, 'dialog', document.title) || this;
        }
        openDialogCmd.prototype.execute = function () {
            this.success();
        };
        openDialogCmd.prototype.redo = function () {
            this.failure();
        };
        openDialogCmd.prototype.undo = function () {
            this.success();
        };
        return openDialogCmd;
    }(Cmd));
    function bindEventListener(tag, type, fun) {
        if (window.addEventListener) {
            tag.addEventListener(type, fun, false);
        }
        else {
            tag.attachEvent("on" + type, fun);
        }
    }
    ;
    function unbindEventListener(tag, type, fun) {
        if (window.addEventListener) {
            tag.removeEventListener(type, fun, false);
        }
        else {
            tag.detachEvent("on" + type, fun);
        }
    }
    ;
    var History = (function (_super) {
        __extends(History, _super);
        function History(maxStep) {
            if (maxStep === void 0) { maxStep = 50; }
            var _this = _super.call(this, undefined) || this;
            _this.maxStep = maxStep;
            _this._list = [];
            _this._cache = [];
            _this._cur = [0, 0];
            _this._goto = [0, 0];
            _this._first = [0, 0];
            _this._last = [0, 0];
            _this.addListener(exports.CmdEvent.ItemSuccess, function (pevent) {
                var cmd = pevent.target;
                cmd.setParent(undefined);
                var callback = function () {
                    _this._curItem = undefined;
                    _this.dispatch(new PEvent(exports.CmdEvent.CmdSuccess));
                    _this.next();
                };
                var item = _this._curItem;
                if (item) {
                    if (!item.cur) {
                        _this._syncHistory(_this._addHistoryItem(item.cmd), callback);
                    }
                    else {
                        _this._cur = item.cur;
                        _this._syncHistory({ move: item.go, moveTitle: item.curCmd.title }, callback);
                    }
                }
            }).addListener(exports.CmdEvent.ItemFailure, function (pevent) {
                var cmd = pevent.target;
                cmd.setParent(undefined);
                if (_this._curItem) {
                    _this._goto = [_this._cur[0], _this._cur[1]];
                    _this._cache = [];
                }
                _this._curItem = undefined;
                _this.dispatch(new PEvent(exports.CmdEvent.CmdFailure));
                // this.cache.length = 0;
                // this.goto = this.cur;
                // this.curItem = undefined;
                // this.dispatch(new PEvent(CmdEvent.Failure));
                // this.dispatch(new PEvent(CmdEvent.Complete));
            });
            return _this;
        }
        History.prototype.getLength = function () {
            return this._list.length;
        };
        History.prototype.getCode = function () {
            return [this._cur[0], this._cur[1]];
        };
        History.prototype._syncHistory = function (change, callback) {
            //通过应用类重写此方法，可以同步应用类的历史记录堆栈
            callback();
        };
        History.prototype._addHistoryItem = function (cmd) {
            //此时_cur必定等于_goto，因为只有在_cur==_goto时才会执行新的命令
            var moveIndex = 0, moveTitle = "";
            if (this._cur.join('.') != this._first.join('.')) {
                var del = this._list.splice(0, this._first[0] - this._cur[0] + this._first[1] - this._cur[1]);
                this._first = [this._cur[0], this._cur[1]];
            }
            if (cmd.isUri) {
                if (this._cur[1] != 0) {
                    var del = this._list.splice(0, this._cur[1]);
                    moveIndex -= this._cur[1];
                    this._cur[1] = 0;
                    this._goto[1] = 0;
                    var moveCmd = this.getCmdByCode(this._cur.join("."));
                    moveTitle = moveCmd.title;
                }
                this._cur[0]++;
                this._goto[0]++;
            }
            else {
                this._cur[1]++;
                this._goto[1]++;
            }
            var item = {
                code: this._cur.join('.'),
                cmd: cmd
            };
            this._list.unshift(item);
            if (this._list.length > this.maxStep) {
                this._list.length = this.maxStep;
            }
            this._first = [this._cur[0], this._cur[1]];
            var last = this._list[this._list.length - 1];
            var arr = last.code.split('.');
            this._last = [parseInt(arr[0]), parseInt(arr[1])];
            return { move: moveIndex, moveTitle: moveTitle, push: { code: item.code, url: cmd.url, title: cmd.title, isUri: cmd.isUri } };
        };
        History.prototype.getCmdByCode = function (code) {
            var item = findInArray(this._list, function (item) {
                return item.code == code;
            });
            return item ? item.cmd : undefined;
        };
        History.prototype.go = function (n) {
            this._cache.push(n);
            this.next();
        };
        History.prototype.push = function (cmd) {
            var arr = Array.isArray(cmd) ? cmd : [cmd];
            (_a = this._cache).push.apply(_a, arr);
            this.next();
            var _a;
        };
        History.prototype.added = function (cmd) {
            this._addHistoryItem(cmd);
        };
        History.prototype._executeGoto = function () {
            var g = this._goto;
            var c = this._cur;
            var uriN = g[0] - c[0];
            if (uriN == 0) {
                if (g[1] < c[1]) {
                    this._curItem = {
                        cmd: this.getCmdByCode(c.join('.')),
                        cur: [c[0], c[1] - 1],
                        curCmd: this.getCmdByCode([c[0], c[1] - 1].join('.')),
                        go: -1
                    };
                    this._curItem.cmd.setParent(this);
                    this._curItem.cmd.undo();
                }
                else {
                    this._curItem = {
                        cmd: this.getCmdByCode([c[0], c[1] + 1].join('.')),
                        cur: [c[0], c[1] + 1],
                        curCmd: null,
                        go: 1
                    };
                    this._curItem.curCmd = this._curItem.cmd;
                    this._curItem.cmd.setParent(this);
                    this._curItem.cmd.redo();
                }
            }
            else {
                this._curItem = {
                    cmd: this.getCmdByCode([g[0], 0].join('.')),
                    cur: [g[0], 0],
                    curCmd: null,
                    go: uriN - c[1]
                };
                this._curItem.curCmd = this._curItem.cmd;
                this._curItem.cmd.setParent(this);
                this._curItem.cmd.redo();
            }
        };
        History.prototype._checkGoto = function (item) {
            var gotoCode = [this._goto[0], this._goto[1]];
            if (typeof item == "number") {
                if (item < 0) {
                    var n = this._cur[1] + item;
                    if (n < 0) {
                        gotoCode[0] += n;
                        gotoCode[1] = 0;
                    }
                    else {
                        gotoCode[1] = n;
                    }
                }
                else if (item > 0) {
                    var n = gotoCode[0] + item - this._first[0];
                    if (n >= 0) {
                        gotoCode[0] = this._first[0];
                        gotoCode[1] += n;
                    }
                    else {
                        gotoCode = [gotoCode[0] + item, 0];
                    }
                }
            }
            else {
                var arr = item.split('.');
                gotoCode = [parseInt(arr[0]), parseInt(arr[1])];
            }
            if (this._cur.join(".") == this._last.join(".") && (gotoCode[0] < this._last[0] || gotoCode[1] < this._last[1])) {
                return null;
            }
            if (gotoCode[0] > this._first[0]) {
                gotoCode[0] = this._first[0];
            }
            if (gotoCode[0] < this._last[0]) {
                gotoCode[0] = this._last[0];
            }
            if (gotoCode[0] == this._first[0]) {
                if (gotoCode[1] > this._first[1]) {
                    gotoCode[1] = this._first[1];
                }
                else if (gotoCode[1] < this._last[1]) {
                    gotoCode[1] = this._last[1];
                }
            }
            else {
                gotoCode[1] = 0;
            }
            return gotoCode;
        };
        History.prototype.next = function () {
            if (this._curItem) {
                return;
            }
            if (this._cur.join('.') != this._goto.join('.')) {
                this._executeGoto();
            }
            else {
                var item = this._cache.shift();
                if (item instanceof Cmd) {
                    this._curItem = {
                        cmd: item,
                        cur: null,
                        curCmd: null,
                        go: 0
                    };
                    item.setParent(this);
                    item.execute();
                }
                else if (item) {
                    var arr = this._checkGoto(item);
                    if (arr) {
                        this._goto = arr;
                        this.next();
                    }
                    else {
                        this._cache = [];
                        this.dispatch(new PEvent(exports.CmdEvent.Overflow));
                    }
                }
                else {
                    this.dispatch(new PEvent(exports.CmdEvent.Complete));
                    //console.log("Complete", this._cur, this._goto, this._list);
                }
            }
        };
        return History;
    }(PDispatcher));
    exports.History = History;
    // export let history = (function () {
    //     let history = new History();
    //     return history;
    // let supportState = window.history.pushState?true:false;
    // let initTime = Date.now();
    // let initId = initTime+'.0';
    // let redoUrlInit = "/redo@"+initId;
    // let undoUrlInit = "/undo@"+initId;
    // let undoUrl:string;
    // let redoUrl:string; 
    // let curUrl:string = window.location.href;
    // let historyList:string[] = [];
    // let historyMap:{[key:string]:any} = {};
    // let curIndex:string = initId;
    // let gotoN:number=0;
    // let gotoCmd:Cmd;
    // function parseIndex(str:string):[number,number]{
    //     let arr = str.split('.');
    //     return [parseInt(arr[0]),parseInt(arr[1])];
    // }
    // function pushState(code:string,url:string,data:any):string{
    //     if(supportState){
    //         window.history.pushState(code,"","#"+encodeURI(url+'/'+code));
    //     }else{
    //         window.location.href = "#"+ encodeURI(url+'@'+code);
    //     }
    //     historyList.push(code);
    //     historyMap[code] = data;
    //     return window.location.href;
    // }
    // return {
    //     back: function(){
    //     },
    //     pushUri : function(url:string,cmd:any={}){
    //         let [curUriIndex,curActIndex] = parseIndex(curIndex);
    //         if(curActIndex>0){
    //             window.history.go(-curActIndex);
    //         }
    //         curUriIndex++;
    //         curIndex = curUriIndex+'.'+0;
    //         pushState(curIndex,url,[url]);
    //     },
    //     init : function(){
    //         this.pushUri('init');
    //         if(supportState){
    //             bindEventListener(window, 'popstate', function(e){
    //                 let code = e.state;
    //                 if(code){
    //                     let [uriIndex,actIndex] = parseIndex(code);
    //                     let [curUriIndex,curActIndex] = parseIndex(curIndex);
    //                     if(initTime <= uriIndex){
    //                         let n = (curActIndex-actIndex)+(curUriIndex-uriIndex);
    //                         console.log('go ',n);
    //                         if(n!=0 && historyMap[code]){
    //                             gotoN = -n;
    //                             if(gotoN<0){//undo
    //                                 if(curActIndex>0){
    //                                     curActIndex
    //                                 }
    //                                 gotoCmd = historyMap[code];
    //                             }
    //                             gotoCmd = historyMap[code];
    //                             window.history.go(n);
    //                         }else if(gotoN){
    //                             console.log(gotoCmd, gotoN>0?'redo':'undo', gotoN);
    //                             //gotoCmd.execute();
    //                             gotoN = 0;
    //                         }
    //                         //window.history.go(curIndex - index);
    //                     }
    //                 }
    //                 // let url:string = window.location.href;
    //                 // let index = historys.indexOf(url);
    //                 // if(index > -1){
    //                 //     console.log(curIndex - index);
    //                 //     window.history.go(curIndex - index);
    //                 // }
    //                 // console.log('state',url);
    //                 // if(url==redoUrl){
    //                 //     window.history.go(-1);
    //                 //     console.log("=== redo ===");
    //                 // }else if(url==undoUrl){
    //                 //     window.history.go(1);
    //                 //     console.log("=== undo ===");
    //                 // }else{
    //                 //     console.log("=== change ===");
    //                 // }
    //             });
    //         }else{
    //             bindEventListener(window, 'hashchange', function(e){
    //                 console.log('hash',window.location.hash,e);
    //             });
    //         }
    //         // window.setTimeout(function(){//fix ie8下触发多次
    //         //     bindEventListener(window, 'hashchange', function(e){
    //         //         console.log('hash',window.location.hash);
    //         //         console.log(e);
    //         //         // if(ready){
    //         //         //     ready = false;
    //         //         //     dispatchEvent("historyReady");
    //         //         //     return true;
    //         //         // }
    //         //         // if(disableChange){
    //         //         //     disableChange--;
    //         //         //     if(evt){
    //         //         //         dispatchEvent(evt);
    //         //         //         evt = null;
    //         //         //     }
    //         //         //     return true;
    //         //         // }
    //         //         // var hash = window.location.hash;
    //         //         // hash = hash?hash:"#";
    //         //         // if(hash == undoUrl){
    //         //         //     disableChange++;
    //         //         //     window.history.go(1);
    //         //         //     evt = "historyUndo";
    //         //         // }else if(hash == redoUrl){
    //         //         //     disableChange++;
    //         //         //     window.history.go(-1);
    //         //         //     evt = "historyRedo";
    //         //         // }else{
    //         //         //     potato.alert(potato.errors.a10);
    //         //         //     potato.setHash(redoUrl.substr(1));
    //         //         //     disableChange++;
    //         //         //     window.history.go(-1);
    //         //         // }
    //         //     });
    //         //     //ready = true;
    //         // },0);
    //     }
    // }
    // })();
    function initHistory() {
        var supportState = window.history.pushState ? true : false;
        var cid = Date.now();
        var undoUrl = "#undo@" + cid;
        var redoUrl = "#redo@" + cid;
        var curHash = window.location.hash;
        curHash = curHash ? curHash : "#";
        var ready = false;
        if (supportState) {
            window.history.replaceState("", "back", undoUrl);
            window.history.pushState("", "", curHash);
            window.history.pushState("", "forward", redoUrl);
        }
        else {
            window.location.replace(undoUrl);
            window.location.href = curHash;
            window.location.href = redoUrl;
        }
        var dispatchEvent = function (e) {
            window.setTimeout(function () {
                // potato.dispatch(new potato.Event(e));
                // if(e=="historyReady"){
                //     SetReadOnly(potato, "historyReady", true);
                // }
            }, 0);
        };
        window.setTimeout(function () {
            bindEventListener(window, 'hashchange', function (e) {
                console.log('hash', window.location.hash);
                console.log(e);
                if (ready) {
                    ready = false;
                    dispatchEvent("historyReady");
                    return true;
                }
                // if(disableChange){
                //     disableChange--;
                //     if(evt){
                //         dispatchEvent(evt);
                //         evt = null;
                //     }
                //     return true;
                // }
                // var hash = window.location.hash;
                // hash = hash?hash:"#";
                // if(hash == undoUrl){
                //     disableChange++;
                //     window.history.go(1);
                //     evt = "historyUndo";
                // }else if(hash == redoUrl){
                //     disableChange++;
                //     window.history.go(-1);
                //     evt = "historyRedo";
                // }else{
                //     potato.alert(potato.errors.a10);
                //     potato.setHash(redoUrl.substr(1));
                //     disableChange++;
                //     window.history.go(-1);
                // }
            });
            ready = true;
            window.history.go(-1);
        }, 0);
    }
    exports.initHistory = initHistory;
    var resizeTimer;
    bindEventListener(window, 'resize', function (e) {
        if (!resizeTimer) {
            resizeTimer = setTimeout(function () {
                resizeTimer = null;
                exports.application.eachDialogChildren(function (item) {
                    item.onWindowResize(e);
                }, true);
            }, 100);
        }
    });
    function setConfig(data) {
        if (data.namespace) {
            exports.namespace = data.namespace;
        }
        if (data.createViewComponent) {
            createViewComponent = data.createViewComponent;
        }
        if (data.application) {
            exports.application = data.application;
            setTopDialog(exports.application);
        }
    }
    exports.setConfig = setConfig;
    var _topDialog;
    function setTopDialog(dialog) {
        if (_topDialog != dialog) {
            if (_topDialog == exports.application) {
                exports.application.history.push(new openDialogCmd());
                exports.application.history.go(-1);
            }
            _topDialog && _topDialog.viewComponent.removeClass("pt-topDialog");
            _topDialog = dialog;
            _topDialog.viewComponent.addClass("pt-topDialog");
        }
    }
    function getTopDialog() {
        return _topDialog;
    }
    exports.getTopDialog = getTopDialog;
});
