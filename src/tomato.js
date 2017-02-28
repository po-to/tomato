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
            _super.call(this, name);
            this.name = name;
            this.note = note;
            this.data = data;
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
    (function (TaskCounterState) {
        TaskCounterState[TaskCounterState["Free"] = 0] = "Free";
        TaskCounterState[TaskCounterState["Busy"] = 1] = "Busy";
    })(exports.TaskCounterState || (exports.TaskCounterState = {}));
    var TaskCounterState = exports.TaskCounterState;
    ;
    var TaskCounter = (function (_super) {
        __extends(TaskCounter, _super);
        function TaskCounter(deferSecond) {
            _super.call(this);
            this.deferSecond = deferSecond;
            this.list = [];
            this.state = TaskCounterState.Free;
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
            _super.call(this, parent);
            this.view = view;
            this.vpid = vpid;
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
    (function (DialogState) {
        DialogState[DialogState["Focused"] = 0] = "Focused";
        DialogState[DialogState["Blured"] = 1] = "Blured";
        DialogState[DialogState["Closed"] = 2] = "Closed";
    })(exports.DialogState || (exports.DialogState = {}));
    var DialogState = exports.DialogState;
    ;
    (function (DialogPosition) {
        DialogPosition[DialogPosition["Left"] = 0] = "Left";
        DialogPosition[DialogPosition["Center"] = 1] = "Center";
        DialogPosition[DialogPosition["Right"] = 2] = "Right";
        DialogPosition[DialogPosition["Top"] = 3] = "Top";
        DialogPosition[DialogPosition["Middle"] = 4] = "Middle";
        DialogPosition[DialogPosition["Bottom"] = 5] = "Bottom";
    })(exports.DialogPosition || (exports.DialogPosition = {}));
    var DialogPosition = exports.DialogPosition;
    (function (DialogSize) {
        DialogSize[DialogSize["Content"] = 0] = "Content";
        DialogSize[DialogSize["Full"] = 1] = "Full";
    })(exports.DialogSize || (exports.DialogSize = {}));
    var DialogSize = exports.DialogSize;
    var Dialog = (function (_super) {
        __extends(Dialog, _super);
        function Dialog(els, config) {
            _super.call(this, els.view, undefined);
            this.state = DialogState.Closed;
            this.content = null;
            this._dialogList = [];
            this._zindex = -1;
            this.config = {
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
            this.dialog = els.dialog;
            this.mask = els.mask;
            this.body = els.body;
            this.header = els.header;
            this.footer = els.footer;
            this.aside = els.aside;
            this.view.addClass("pt-" + DialogState[this.state]);
            if (config) {
                this.setConfig(config);
            }
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
        function Application(els, config) {
            var _this = this;
            _super.call(this, els, config);
            this._setZIndex(0);
            this._setState(DialogState.Focused);
            this.view.addClass("pt-topDialog");
            taskCounter.addListener(exports.TaskCountEvent.Added, function (e) {
                _this.mask.addClass("pt-show");
            }).addListener(exports.TaskCountEvent.Completed, function (e) {
                _this.mask.removeClass("pt-show");
            })
                .addListener(exports.TaskCountEvent.Busy, function (e) {
                _this.mask.addClass("pt-busy");
            }).addListener(exports.TaskCountEvent.Free, function (e) {
                _this.mask.removeClass("pt-busy");
            });
        }
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
    var CmdQueue = (function (_super) {
        __extends(CmdQueue, _super);
        function CmdQueue(historyMax, isUri, parent) {
            var _this = this;
            _super.call(this, parent);
            this.historyMax = historyMax;
            this.isUri = isUri;
            this.history = []; //[旧...新]
            this.cache = []; //[旧...新]
            this.cur = -1; //同history的index
            this.goto = -1; //同history的index
            this.addListener(exports.CmdEvent.ItemSuccess, function (pevent) {
                var cmd = pevent.target;
                cmd.setParent(undefined);
                if (_this.curItem) {
                    _this.curItem.callback();
                    _this.next();
                }
            }).addListener(exports.CmdEvent.ItemFailure, function (pevent) {
                var cmd = pevent.target;
                cmd.setParent(undefined);
                _this.cache.length = 0;
                _this.goto = _this.cur;
                _this.curItem = undefined;
                _this.dispatch(new PEvent(exports.CmdEvent.Failure));
                _this.dispatch(new PEvent(exports.CmdEvent.Complete));
            });
        }
        CmdQueue.prototype.push = function (cmd) {
            var cache = this.cache;
            var list = Array.isArray(cmd) ? cmd : [cmd];
            if (this.isUri) {
                cache.length = 0;
                cache[0] = list.pop();
            }
            else {
                cache.push.apply(cache, list);
            }
            if (!this.curItem) {
                this.next();
            }
        };
        CmdQueue.prototype.empty = function () {
            this.cancel();
            this.curItem = undefined;
            this.history.length = 0;
            this.cache.length = 0;
            this.cur = -1;
            this.goto = -1;
        };
        CmdQueue.prototype.cancel = function () {
            if (this.curItem) {
                var cmd = this.curItem.cmd;
                var method = "abort_" + this.curItem.method;
                cmd[method]();
            }
        };
        CmdQueue.prototype.to = function (n) {
            var arr = [this.goto, 0];
            if (n == 0) {
                return arr;
            }
            n = this.goto + n;
            var l = this.history.length - 1;
            if (n < -1) {
                arr[0] = -1;
                arr[1] = n + 1;
            }
            else if (n > l) {
                arr[0] = l;
                arr[1] = n - l;
            }
            else {
                arr[0] = n;
                arr[1] = 0;
            }
            return arr;
        };
        CmdQueue.prototype.go = function (n) {
            var l = this.history.length - 1;
            if (n < -1) {
                n = -1;
            }
            else if (n > l) {
                n = l;
            }
            if (n == -1 && this.goto == -1) {
                this.dispatch(new PEvent(exports.CmdEvent.Overflow));
                return false;
            }
            this.goto = n;
            if (!this.curItem) {
                this.next();
            }
        };
        CmdQueue.prototype.next = function () {
            var _this = this;
            var history = this.history;
            var h = history.length;
            var c = this.cur;
            var g = this.goto;
            var m = this.historyMax;
            var cmd, del, index;
            if (c != g) {
                if (g < c) {
                    if (this.isUri) {
                        cmd = history[g + 1];
                        index = g;
                    }
                    else {
                        cmd = history[c];
                        index = c - 1;
                    }
                    this.curItem = { cmd: cmd, method: "undo", callback: function () { _this.cur = index; } };
                    cmd.setParent(this);
                    cmd.undo();
                }
                else {
                    if (this.isUri) {
                        cmd = history[g];
                        index = g;
                    }
                    else {
                        cmd = history[c + 1];
                        index = c + 1;
                    }
                    this.curItem = { cmd: cmd, method: "redo", callback: function () { _this.cur = index; } };
                    cmd.setParent(this);
                    cmd.redo();
                }
            }
            else if (this.cache.length) {
                cmd = this.cache[0];
                this.curItem = { cmd: cmd, method: "execute", callback: function () {
                        _this.cache.shift();
                        if (c < (h - 1)) {
                            del = history.slice(c + 1);
                            history.length = h = c + 1;
                        }
                        history.push(cmd);
                        if (m < (h + 1)) {
                            del = [history.shift()];
                            _this.cur = c - 1;
                        }
                        else {
                            _this.goto = g + 1;
                        }
                        _this.cur = _this.goto;
                    } };
                cmd.setParent(this);
                cmd.execute();
            }
            else {
                this.curItem = undefined;
                this.dispatch(new PEvent(exports.CmdEvent.Success));
                this.dispatch(new PEvent(exports.CmdEvent.Complete));
            }
        };
        return CmdQueue;
    }(PDispatcher));
    exports.CmdQueue = CmdQueue;
    var ViewHistory = (function () {
        function ViewHistory(uriMax, actMax) {
            var _this = this;
            this.uriCache = [];
            this.actCache = [];
            this.uriQueue = new CmdQueue(uriMax, true);
            this.actQueue = new CmdQueue(actMax);
            this.uriQueue.addListener(exports.CmdEvent.Complete, function () {
                _this.actQueue.empty();
                if (_this.actCache.length) {
                    _this.actQueue.push(_this.actCache);
                    _this.actCache.length = 0;
                }
            });
            this.actQueue.addListener(exports.CmdEvent.Complete, function () {
                if (_this.uriCache.length) {
                    _this.uriQueue.push(_this.uriCache);
                    _this.uriCache.length = 0;
                }
            });
            this.uriQueue.addListener(exports.CmdEvent.Overflow, function () {
                //exitCallback();
            });
        }
        ViewHistory.prototype.uriPush = function (cmd) {
            this.actQueue.cancel();
            this.uriQueue.cancel();
            this.actCache.length = 0;
            if (this.actQueue.curItem) {
                // 如果当前有act在运行，先将新uri存起来，act执行完后会执行uri cache
                this.uriCache.length = 0;
                this.uriCache[0] = cmd;
            }
            else {
                this.uriQueue.push(cmd);
            }
        };
        ViewHistory.prototype.actPush = function (cmd) {
            if (this.uriQueue.curItem || this.uriCache.length) {
                //如果当前uri在运行或等待运行，则先将act存起来，uri执行完后会执行act cache
                this.actCache.push(cmd);
            }
            else {
                this.actQueue.push(cmd);
            }
        };
        ViewHistory.prototype.go = function (n) {
            var arr = this.actQueue.to(n);
            if (arr[1]) {
                arr = this.uriQueue.to(arr[1]);
                this.uriQueue.go(arr[0]);
            }
            else {
                this.actQueue.go(arr[0]);
            }
        };
        ViewHistory.prototype.uriGo = function (n) {
            var arr = this.uriQueue.to(n);
            this.uriQueue.go(arr[0]);
        };
        ViewHistory.prototype.empty = function () {
            this.actQueue.empty();
            this.uriQueue.empty();
        };
        return ViewHistory;
    }());
    exports.ViewHistory = ViewHistory;
    var Cmd = (function (_super) {
        __extends(Cmd, _super);
        function Cmd() {
            _super.call(this);
        }
        Cmd.prototype.success = function () {
            this.dispatch(new PEvent(exports.CmdEvent.ItemSuccess, this, true));
        };
        Cmd.prototype.failure = function () {
            this.dispatch(new PEvent(exports.CmdEvent.ItemFailure, this, true));
        };
        Cmd.prototype.execute = function () {
        };
        Cmd.prototype.abort_execute = function () {
        };
        Cmd.prototype.redo = function () {
        };
        Cmd.prototype.abort_redo = function () {
        };
        Cmd.prototype.undo = function () {
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
    exports.history = (function () {
        var supportState = window.history.pushState ? true : false;
        var cid = Date.now();
        var undoHash = "undo@" + cid;
        var redoHash = "redo@" + cid;
        var curUrl = window.location.href;
        function pushState(url) {
            if (supportState) {
                window.history.pushState("", "", url);
            }
            else {
                window.location.href = "#" + encodeURI(url);
            }
        }
        return {
            push: function (url) {
                pushState(url);
                pushState(redoHash);
            },
            init: function () {
                if (supportState) {
                    bindEventListener(window, 'popstate', function (e) {
                        console.log('state', window.location.href, e);
                    });
                    window.history.replaceState("", "back", undoHash);
                    window.history.pushState("", "", curUrl);
                    window.history.pushState("", "forward", redoHash);
                }
                else {
                    bindEventListener(window, 'hashchange', function (e) {
                        console.log('hash', window.location.hash, e);
                    });
                    window.location.replace(undoHash);
                    window.location.href = curUrl;
                    window.location.href = redoHash;
                }
                window.history.go(-1);
                // window.setTimeout(function(){//fix ie8下触发多次
                //     bindEventListener(window, 'hashchange', function(e){
                //         console.log('hash',window.location.hash);
                //         console.log(e);
                //         // if(ready){
                //         //     ready = false;
                //         //     dispatchEvent("historyReady");
                //         //     return true;
                //         // }
                //         // if(disableChange){
                //         //     disableChange--;
                //         //     if(evt){
                //         //         dispatchEvent(evt);
                //         //         evt = null;
                //         //     }
                //         //     return true;
                //         // }
                //         // var hash = window.location.hash;
                //         // hash = hash?hash:"#";
                //         // if(hash == undoHash){
                //         //     disableChange++;
                //         //     window.history.go(1);
                //         //     evt = "historyUndo";
                //         // }else if(hash == redoHash){
                //         //     disableChange++;
                //         //     window.history.go(-1);
                //         //     evt = "historyRedo";
                //         // }else{
                //         //     potato.alert(potato.errors.a10);
                //         //     potato.setHash(redoHash.substr(1));
                //         //     disableChange++;
                //         //     window.history.go(-1);
                //         // }
                //     });
                //     //ready = true;
                // },0);
            }
        };
    })();
    function initHistory() {
        var supportState = window.history.pushState ? true : false;
        var cid = Date.now();
        var undoHash = "#undo@" + cid;
        var redoHash = "#redo@" + cid;
        var curHash = window.location.hash;
        curHash = curHash ? curHash : "#";
        var ready = false;
        if (supportState) {
            window.history.replaceState("", "back", undoHash);
            window.history.pushState("", "", curHash);
            window.history.pushState("", "forward", redoHash);
        }
        else {
            window.location.replace(undoHash);
            window.location.href = curHash;
            window.location.href = redoHash;
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
                // if(hash == undoHash){
                //     disableChange++;
                //     window.history.go(1);
                //     evt = "historyUndo";
                // }else if(hash == redoHash){
                //     disableChange++;
                //     window.history.go(-1);
                //     evt = "historyRedo";
                // }else{
                //     potato.alert(potato.errors.a10);
                //     potato.setHash(redoHash.substr(1));
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
