/*!
 * Copyright po-to.org All Rights Reserved.
 * https://github.com/po-to/
 * Licensed under the MIT license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    var autoID = 0;
    var namespace = 'po-to/tomato';
    exports.namespace = namespace;
    exports.TaskCountEvent = {
        Added: "TaskCountEvent.Added",
        Completed: "TaskCountEvent.Completed",
        Busy: "TaskCountEvent.Busy",
        Free: "TaskCountEvent.Free"
    };
    exports.VPresenterEvent = {
        Installed: "CPresenterEvent.Installed",
        Uninstalled: "CPresenterEvent.Uninstalled",
        ChildAppended: "CPresenterEvent.ChildAppended",
        ChildRemoved: "CPresenterEvent.ChildRemoved",
    };
    exports.VPresenterTransaction = {
        AllowInstall: "AllowInstall"
    };
    exports.DialogEvent = {
        Focused: "DialogEvent.Focused",
        Blured: "DialogEvent.Blured",
        Closed: "DialogEvent.Closed",
    };
    exports.CmdEvent = {
        ItemSuccess: "CmdEvent.ItemSuccess",
        ItemFailure: "CmdEvent.ItemFailure",
        Failure: "CmdEvent.Failure",
        Success: "CmdEvent.Success",
        Complete: "CmdEvent.Complete",
        Overflow: "CmdEvent.Overflow"
    };
    var PEvent = (function () {
        function PEvent(name, data, bubbling) {
            if (bubbling === void 0) { bubbling = false; }
            this.name = name;
            this.data = data;
            this.bubbling = bubbling;
        }
        PEvent.prototype._setTarget = function (target) {
            this.target = target;
            return this;
        };
        return PEvent;
    }());
    exports.PEvent = PEvent;
    var PError = (function (_super) {
        __extends(PError, _super);
        function PError(name, note, data) {
            if (note === void 0) { note = "tomato.PError"; }
            var _this = _super.call(this, name) || this;
            _this.name = name;
            _this.note = note;
            _this.data = data;
            return _this;
        }
        PError.prototype.getNamespace = function () {
            return namespace;
        };
        return PError;
    }(Error));
    exports.PError = PError;
    function emptyObject(obj) {
        Object.keys(obj).forEach(function (key) {
            delete obj[key];
        });
        return obj;
    }
    var PDispatcher = (function () {
        function PDispatcher(parent) {
            this.parent = parent;
            this._handlers = {};
        }
        PDispatcher.prototype.addListener = function (ename, handler) {
            var dictionary = this._handlers[ename];
            if (!dictionary) {
                this._handlers[ename] = dictionary = [];
            }
            dictionary.push(handler);
            return this;
        };
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
        PDispatcher.prototype.dispatch = function (e) {
            if (!e.target) {
                e._setTarget(this);
            }
            var dictionary = this._handlers[e.name];
            if (dictionary) {
                for (var i = 0, k = dictionary.length; i < k; i++) {
                    dictionary[i](e);
                }
            }
            if (this.parent && e.bubbling) {
                this.parent.dispatch(e);
            }
            return this;
        };
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
            if (!this.list.find(function (item) { return item.promise === promise; })) {
                this.list.push({ promise: promise, note: note });
                promise.then(function (value) { return _this._completeItem(promise); }, function (reason) { return _this._completeItem(promise); });
                this.dispatch(new PEvent(exports.TaskCountEvent.Added));
                if (!this._timer) {
                    this._timer = window.setTimeout(function () {
                        _this._timer = 0;
                        if (_this.list.length > 0 && _this.state == TaskCounterState.Free) {
                            _this.state = exports.TaskCountEvent.Busy;
                            _this.dispatch(new PEvent(exports.TaskCountEvent.Busy));
                        }
                    }, this.deferSecond * 1000);
                }
            }
            return promise;
        };
        TaskCounter.prototype._completeItem = function (promise) {
            var i = this.list.findIndex(function (item) { return item.promise === promise; });
            if (i > -1) {
                this.list.splice(i, 1);
                this.dispatch(new PEvent(exports.TaskCountEvent.Completed));
                if (this.list.length == 0) {
                    if (this._timer) {
                        clearTimeout(this._timer);
                        this._timer = 0;
                    }
                    if (this.state == TaskCounterState.Busy) {
                        this.state = exports.TaskCountEvent.Free;
                        this.dispatch(new PEvent(exports.TaskCountEvent.Free));
                    }
                }
            }
            return this;
        };
        return TaskCounter;
    }(PDispatcher));
    exports.TaskCounter = TaskCounter;
    var taskCounter = new TaskCounter(3);
    exports.taskCounter = taskCounter;
    var createVPView = function (html) {
        return {};
    };
    var VPresenter = (function (_super) {
        __extends(VPresenter, _super);
        function VPresenter(view, parent, vpid) {
            var _this = _super.call(this, parent) || this;
            _this.view = view;
            _this.vpid = vpid;
            return _this;
        }
        VPresenter.prototype.isWholeVPresenter = function () {
            return typeof (this['getHeader']) == 'function' && typeof (this['getFooter']) == 'function' && typeof (this['getAside']) == 'function';
        };
        VPresenter.prototype.init = function (subs) {
            return null;
        };
        VPresenter.prototype._allowInstallTo = function (parent) {
            return true;
        };
        VPresenter.prototype._allowUninstallTo = function (parent) {
            return true;
        };
        VPresenter.prototype._allowAppendChild = function (child) {
            return true;
        };
        VPresenter.prototype._allowRemoveChild = function (child) {
            return true;
        };
        VPresenter.prototype._beforeInstallTo = function (parent) {
        };
        VPresenter.prototype._beforeUninstallTo = function (parent) {
        };
        VPresenter.prototype._afterInstallTo = function (parent) {
        };
        VPresenter.prototype._afterUninstallTo = function (parent) {
        };
        VPresenter.prototype._afterRemoveChild = function (member) {
            this.view.removeChild(member.view);
        };
        VPresenter.prototype._afterAppendChild = function (member) {
            this.view.appendChild(member.view);
        };
        VPresenter.prototype._beforeRemoveChild = function (member) {
        };
        VPresenter.prototype._beforeAppendChild = function (member) {
        };
        VPresenter.prototype._checkRemoveChild = function (member) {
            if (member.parent != this) {
                return true;
            }
            if (!member._allowUninstallTo(this) ||
                !this._allowRemoveChild(member)) {
                return false;
            }
            return true;
        };
        VPresenter.prototype.removeChild = function (member, checked) {
            if (member.parent != this) {
                return false;
            }
            if (!checked && !this._checkRemoveChild(member)) {
                return false;
            }
            this._beforeRemoveChild(member);
            member._beforeUninstallTo(this);
            member.setParent(undefined);
            this._afterRemoveChild(member);
            member._afterUninstallTo(this);
            this.dispatch(new PEvent(exports.VPresenterEvent.ChildRemoved));
            member.dispatch(new PEvent(exports.VPresenterEvent.Uninstalled));
            return true;
        };
        VPresenter.prototype._checkAppendChild = function (member) {
            if (member.parent == this) {
                return true;
            }
            if (!member._allowInstallTo(this) ||
                !this._allowAppendChild(member) ||
                (member.parent && (!member._allowUninstallTo(this) || !member.parent._allowRemoveChild(member)))) {
                return false;
            }
            return true;
        };
        VPresenter.prototype.getParentDialog = function () {
            var parent = this.parent;
            while (parent) {
                if (parent instanceof Dialog) {
                    return parent;
                }
                parent = parent.parent;
            }
            return application;
        };
        VPresenter.prototype.appendChild = function (member, checked) {
            if (member.parent == this) {
                return false;
            }
            if (!checked && !this._checkAppendChild(member)) {
                return false;
            }
            if (member.parent) {
                member.parent.removeChild(member, true);
            }
            this._beforeAppendChild(member);
            member._beforeInstallTo(this);
            member.setParent(this);
            this._afterAppendChild(member);
            member._afterInstallTo(this);
            this.dispatch(new PEvent(exports.VPresenterEvent.ChildAppended));
            member.dispatch(new PEvent(exports.VPresenterEvent.Installed));
            return true;
        };
        VPresenter.prototype._update = function () {
            return Promise.resolve(this);
        };
        VPresenter.prototype.destroy = function () {
            if (this.vpid) {
                delete VPresenterStore[this.vpid];
            }
        };
        VPresenter.prototype.getDialogClassName = function () {
            return "";
        };
        return VPresenter;
    }(PDispatcher));
    exports.VPresenter = VPresenter;
    var VPresenterStore = {};
    function getVPresenter(data, successCallback, failueCallback) {
        var id;
        var view;
        if (typeof data != "string") {
            view = data;
            id = data.getVPID();
        }
        else {
            view = null;
            id = data;
        }
        var cacheData = VPresenterStore[id];
        if (cacheData instanceof VPresenter) {
            return cacheData;
        }
        else if (cacheData instanceof Promise) {
            var success = successCallback || function (VP) { };
            var failue = failueCallback || function (error) { };
            cacheData.then(success, failue);
            return cacheData;
        }
        var onError = function (error, reject) {
            delete VPresenterStore[id];
            failueCallback && failueCallback(error);
            console.log(error);
            reject(error);
        };
        var onSuccess = function (con, dom, resolve, reject) {
            var vp = null;
            try {
                vp = new con(dom, undefined, id);
            }
            catch (e) {
                onError(e, reject);
            }
            if (vp) {
                Promise.all(dom.getSUBS().map(function (dom) {
                    var id = dom.getVPID();
                    if (VPresenterStore[id]) {
                        dom.setVPID(id + "#" + (++autoID));
                    }
                    return getVPresenter(dom);
                })).then(function (list) {
                    return vp && vp.init(list);
                }).then(function () {
                    successCallback && successCallback(vp);
                    resolve(vp);
                })['catch'](function (e) {
                    onError(e, reject);
                });
            }
        };
        var promise = new Promise(function (resolve, reject) {
            var init = function (dom) {
                var conPath = dom.getVPCON();
                if (conPath) {
                    require([conPath], function (con) {
                        onSuccess(con, dom, resolve, reject);
                    }, function (err) {
                        onError(err, reject);
                    });
                }
                else {
                    onSuccess(VPresenter, dom, resolve, reject);
                }
            };
            if (view) {
                init(view);
            }
            else {
                require([id], function (obj) {
                    if (typeof obj == "string") {
                        view = createVPView(obj);
                    }
                    else {
                        view = obj;
                    }
                    init(view);
                }, function (err) {
                    onError(err, reject);
                });
            }
        });
        VPresenterStore[id] = promise;
        taskCounter.addItem(promise, 'load:' + id);
        return promise;
    }
    exports.getVPresenter = getVPresenter;
    var DialogState;
    (function (DialogState) {
        DialogState[DialogState["Focused"] = 0] = "Focused";
        DialogState[DialogState["Blured"] = 1] = "Blured";
        DialogState[DialogState["Closed"] = 2] = "Closed";
    })(DialogState = exports.DialogState || (exports.DialogState = {}));
    ;
    var DialogPosition;
    (function (DialogPosition) {
        DialogPosition[DialogPosition["Left"] = 0] = "Left";
        DialogPosition[DialogPosition["Center"] = 1] = "Center";
        DialogPosition[DialogPosition["Right"] = 2] = "Right";
        DialogPosition[DialogPosition["Top"] = 3] = "Top";
        DialogPosition[DialogPosition["Middle"] = 4] = "Middle";
        DialogPosition[DialogPosition["Bottom"] = 5] = "Bottom";
    })(DialogPosition = exports.DialogPosition || (exports.DialogPosition = {}));
    var DialogSize;
    (function (DialogSize) {
        DialogSize[DialogSize["Content"] = 0] = "Content";
        DialogSize[DialogSize["Full"] = 1] = "Full";
    })(DialogSize = exports.DialogSize || (exports.DialogSize = {}));
    var Dialog = (function (_super) {
        __extends(Dialog, _super);
        function Dialog(els, config) {
            var _this = _super.call(this, els.view, undefined) || this;
            _this.history = new History();
            _this.state = DialogState.Closed;
            _this.content = null;
            _this._dialogList = [];
            _this._zindex = -1;
            _this.config = {
                className: '',
                masked: false,
                position: { x: DialogPosition.Center, y: DialogPosition.Middle },
                size: { width: "50%", height: "50%" },
                fixed: true,
                offset: { x: 0, y: 0 },
                effect: "",
                asideOnRight: false,
                asideInBody: false,
                headerEffect: undefined,
                footerEffect: undefined,
                asideEffect: undefined,
                bodyEffect: undefined
            };
            _this.dialog = els.dialog;
            _this.mask = els.mask;
            _this.body = els.body;
            _this.header = els.header;
            _this.footer = els.footer;
            _this.aside = els.aside;
            _this.view.addClass("pt-" + DialogState[_this.state]);
            if (config) {
                _this.setConfig(config);
            }
            return _this;
        }
        Dialog.prototype.setConfig = function (config) {
            var oldConfig = this.config;
            this.config = Object.assign({}, this.config, config);
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
        Dialog.prototype._afterConfigChange = function (oldConfig) {
            this.view.removeClass([oldConfig.className, oldConfig.effect, oldConfig.masked ? "pt-masked" : "", oldConfig.asideOnRight ? "pt-asideOnRight" : "pt-asideOnLeft", oldConfig.asideInBody ? "pt-asideInBody" : "pt-asideOutBody"].join(" "));
            this.view.addClass([this.config.className, this.config.effect, this.config.masked ? "pt-masked" : "", this.config.asideOnRight ? "pt-asideOnRight" : "pt-asideOnLeft", this.config.asideInBody ? "pt-asideInBody" : "pt-asideOutBody"].join(" "));
        };
        Dialog.prototype._setZIndex = function (i) {
            this._zindex = i;
            this.view.setZIndex(i);
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
            if (this == application) {
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
                if (dialog && !dialog._allowFocus()) {
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
                    this.refreshSize();
                    this.refreshPosition();
                    this.refreshLayout();
                }
                this._afterFocus();
                if (!_parentCall) {
                    setTopDialog(this);
                }
                this.dispatch(new PEvent(exports.DialogEvent.Focused));
                if (this.content) {
                    this.content.dispatch(new PEvent(exports.DialogEvent.Focused));
                }
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
            this.refreshSize();
            this.refreshPosition();
            this.refreshLayout();
            this._afterClose();
            this.dispatch(new PEvent(exports.DialogEvent.Closed));
            if (this.content) {
                this.content.dispatch(new PEvent(exports.DialogEvent.Closed));
            }
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
            if (this.content) {
                this.content.dispatch(new PEvent(exports.DialogEvent.Blured));
            }
        };
        Dialog.prototype._setState = function (state) {
            this.view.removeClass("pt-" + DialogState[this.state]);
            this.state = state;
            this.view.addClass("pt-" + DialogState[this.state]);
        };
        Dialog.prototype._allowAppendChild = function (member) {
            if (member instanceof Dialog) {
                if (member.state != DialogState.Closed) {
                    return false;
                }
            }
            return true;
        };
        Dialog.prototype.appendChild = function (child) {
            if (child.parent == this) {
                return false;
            }
            if (!this._checkAppendChild(child)) {
                return false;
            }
            if (!(child instanceof Dialog)) {
                if (this.content) {
                    var member = this.content;
                    if (member.parent != this) {
                        return false;
                    }
                    if (!this._checkRemoveChild(member)) {
                        return false;
                    }
                    this.removeChild(member, true);
                }
                this.content = child;
            }
            return _super.prototype.appendChild.call(this, child, true);
        };
        Dialog.prototype._afterAppendChild = function (member) {
            if (member instanceof Dialog) {
                this.view.appendChild(member.view);
            }
            else {
                this._contentClassName = member.getDialogClassName();
                this.view.addClass(this._contentClassName);
                if (this.body) {
                    this.body.appendChild(member.view);
                }
                else {
                    this.dialog.appendChild(member.view);
                }
                if (member.isWholeVPresenter()) {
                    this._contentHeader = member.getHeader();
                    if (this._contentHeader && this.header) {
                        this.header.appendChild(this._contentHeader);
                    }
                    this._contentFooter = member.getFooter();
                    if (this._contentFooter && this.footer) {
                        this.footer.appendChild(this._contentFooter);
                    }
                    this._contentAside = member.getAside();
                    if (this._contentAside && this.aside) {
                        this.aside.appendChild(this._contentAside);
                    }
                }
                if (this.state != DialogState.Closed) {
                    if (this.config.size.width == DialogSize.Content || this.config.size.height == DialogSize.Content) {
                        this.refreshSize();
                        this.refreshPosition();
                        this.refreshLayout();
                    }
                    else {
                        this.refreshLayout();
                    }
                }
            }
        };
        Dialog.prototype._afterRemoveChild = function (member) {
            if (member instanceof Dialog) {
                this.view.removeChild(member.view);
            }
            else {
                if (this._contentClassName) {
                    this.view.removeClass(this._contentClassName);
                    this._contentClassName = "";
                }
                if (this.body) {
                    this.body.removeChild(member.view);
                }
                else {
                    this.dialog.removeChild(member.view);
                }
                if (this._contentHeader && this.header) {
                    this.header.removeChild(this._contentHeader);
                    this._contentHeader = null;
                }
                if (this._contentFooter && this.footer) {
                    this.footer.removeChild(this._contentFooter);
                    this._contentFooter = null;
                }
                if (this._contentAside && this.aside) {
                    this.aside.removeChild(this._contentAside);
                    this._contentAside = null;
                }
            }
        };
        Dialog.prototype.refreshSize = function () {
        };
        Dialog.prototype.refreshPosition = function () {
        };
        Dialog.prototype.refreshLayout = function () {
        };
        return Dialog;
    }(VPresenter));
    exports.Dialog = Dialog;
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application(els, config, rootUriCmd) {
            var _this = _super.call(this, els, config) || this;
            _this.initTime = Date.now();
            _this._setZIndex(0);
            _this._setState(DialogState.Focused);
            _this.view.addClass("pt-topDialog");
            taskCounter.addListener(exports.TaskCountEvent.Added, function (e) {
                _this.mask.addClass("pt-show");
            }).addListener(exports.TaskCountEvent.Completed, function (e) {
                _this.mask.removeClass("pt-show");
            }).addListener(exports.TaskCountEvent.Busy, function (e) {
                _this.mask.addClass("pt-busy");
            }).addListener(exports.TaskCountEvent.Free, function (e) {
                _this.mask.removeClass("pt-busy");
            });
            if (rootUriCmd) {
                _this._initHistory(_this.initTime, rootUriCmd);
            }
            return _this;
        }
        Application.prototype._initHistory = function (initTime, rootUriCmd) {
            var supportState = window.history.pushState ? true : false;
            var _trigger;
            var history = this.history;
            function pushState(code, title, url, isUri) {
                window.history.pushState(code, title, isUri ? url : "#" + encodeURI(url));
            }
            function addState(code) {
                window.history.replaceState(initTime + "." + code, document.title, window.location.href);
            }
            history._syncHistory = function (change, callback) {
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
                                setTimeout(function () { history.go(-n_1); }, 1); //异步触发
                            };
                            window.history.go(n_1);
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
                    console.log('hash', window.location.hash, e);
                });
            }
            history.added(rootUriCmd);
            addState("1.0");
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
    var application = {};
    exports.application = application;
    var Cmd = (function (_super) {
        __extends(Cmd, _super);
        function Cmd(url, title, isUri) {
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
            console.log(this.url, 'execute');
            this.success();
        };
        Cmd.prototype.abort_execute = function () {
        };
        Cmd.prototype.redo = function () {
            console.log(this.url, 'redo');
            this.success();
        };
        Cmd.prototype.abort_redo = function () {
        };
        Cmd.prototype.undo = function () {
            console.log(this.url, 'undo');
            this.success();
        };
        Cmd.prototype.abort_undo = function () {
        };
        return Cmd;
    }(PDispatcher));
    exports.Cmd = Cmd;
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
        History.prototype._pushState = function (code, url, isUri) {
            window.history.pushState(code, "", isUri ? url : "#" + encodeURI(url));
        };
        History.prototype._syncHistory = function (change, callback) {
            callback();
        };
        History.prototype._addHistoryItem = function (cmd) {
            //此时_cur必定等于_goto，因为只有在_cur==_goto时才会执行新的命令
            var moveIndex = 0, moveTitle = "";
            if (this._cur.join('.') != this._first.join('.')) {
                var del = this._list.splice(0, this._first[0] - this._cur[0] + this._first[0] - this._cur[1]);
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
            var item = this._list.find(function (item) {
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
                    this._goto = this._checkGoto(item);
                    this.next();
                }
                else {
                    console.log("Complete", this._cur, this._goto, this._list);
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
    function setConfig(data) {
        if (data.namespace) {
            exports.namespace = namespace = data.namespace;
        }
        if (data.createVPView) {
            createVPView = data.createVPView;
        }
        if (data.application) {
            exports.application = application = data.application;
            setTopDialog(application);
        }
        if (data.renderer) {
            if (!data.renderer['__parse__']) {
                data.renderer['__parse__'] = function (result, namespace) {
                    for (var i in result.data) {
                        if (result.hasOwnProperty(i) && result[i] && result[i].type == namespace) {
                            result[i] = this.__parse__(result[i]);
                        }
                    }
                    return this[result.renderer](result.template, result.data);
                };
            }
            define("rendererManager", data.renderer);
        }
    }
    exports.setConfig = setConfig;
    var _topDialog;
    function setTopDialog(dialog) {
        if (_topDialog != dialog) {
            _topDialog && _topDialog.view.removeClass("pt-topDialog");
            _topDialog = dialog;
            _topDialog.view.addClass("pt-topDialog");
        }
    }
    function getTopDialog() {
        return _topDialog;
    }
    exports.getTopDialog = getTopDialog;
    function bootstrap(application) {
        application = application;
    }
    exports.bootstrap = bootstrap;
});
