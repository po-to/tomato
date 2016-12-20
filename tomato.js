define(["require", "exports"], function (require, exports) {
    "use strict";
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
    var PError = (function () {
        function PError(name, note, data) {
            if (note === void 0) { note = "tomato.PError"; }
            this.name = name;
            this.note = note;
            this.data = data;
        }
        PError.prototype.getNamespace = function () {
            return namespace;
        };
        return PError;
    }());
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
            return this;
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
        VPresenter.prototype._installTo = function (parent) {
            _super.prototype.setParent.call(this, parent);
            this.dispatch(new PEvent(exports.VPresenterEvent.Installed));
        };
        VPresenter.prototype._uninstallTo = function (parent) {
            _super.prototype.setParent.call(this, undefined);
            this.dispatch(new PEvent(exports.VPresenterEvent.Uninstalled));
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
            member._uninstallTo(this);
            this._afterRemoveChild(member);
            this.dispatch(new PEvent(exports.VPresenterEvent.ChildRemoved));
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
            member._installTo(this);
            this._afterAppendChild(member);
            this.dispatch(new PEvent(exports.VPresenterEvent.ChildAppended));
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
        return VPresenter;
    }(PDispatcher));
    exports.VPresenter = VPresenter;
    var VPresenterStore = {};
    function getVPresenter(data, successCallback, failueCallback) {
        var id;
        var view;
        if (typeof data != "string") {
            view = data;
            var ids = data.getVPID();
            id = typeof (ids) == "string" ? ids : ids[0];
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
                    return getVPresenter(dom);
                })).then(function () {
                    successCallback && successCallback(vp);
                    resolve(vp);
                }, function (e) {
                    onError(e, reject);
                });
            }
        };
        var promise = new Promise(function (resolve, reject) {
            var init = function (dom) {
                var conPath = dom.getVPCON(id);
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
        Dialog.prototype.focus = function (checked) {
            if (!checked && !this._checkFocus()) {
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
                parentDialog.focus();
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
                this.dispatch(new PEvent(exports.DialogEvent.Focused));
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
            focusDialog && focusDialog.focus(true);
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
                var oldContent = this.content;
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
                if (this.body) {
                    this.body.appendChild(member.view);
                }
                else {
                    this.dialog.appendChild(member.view);
                }
                if (member instanceof WholeVPresenter) {
                    var view = member.getHeader();
                    if (view && this.header) {
                        this.header.appendChild(view);
                    }
                    view = member.getFooter();
                    if (view && this.footer) {
                        this.footer.appendChild(view);
                    }
                    view = member.getAside();
                    if (view && this.aside) {
                        this.aside.appendChild(view);
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
                if (this.body) {
                    this.body.removeChild(member.view);
                }
                else {
                    this.dialog.removeChild(member.view);
                }
                if (member instanceof WholeVPresenter) {
                    var view = member.getHeader();
                    if (view && this.header) {
                        this.header.removeChild(view);
                    }
                    view = member.getFooter();
                    if (view && this.footer) {
                        this.footer.removeChild(view);
                    }
                    view = member.getAside();
                    if (view && this.aside) {
                        this.aside.removeChild(view);
                    }
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
    var WholeVPresenter = (function (_super) {
        __extends(WholeVPresenter, _super);
        function WholeVPresenter() {
            return _super.apply(this, arguments) || this;
        }
        WholeVPresenter.prototype.getHeader = function () { return null; };
        WholeVPresenter.prototype.getFooter = function () { return null; };
        WholeVPresenter.prototype.getAside = function () { return null; };
        return WholeVPresenter;
    }(VPresenter));
    exports.WholeVPresenter = WholeVPresenter;
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application(els, config) {
            var _this = _super.call(this, els, config) || this;
            _this._setZIndex(0);
            _this._setState(DialogState.Focused);
            taskCounter.addListener(exports.TaskCountEvent.Added, function (e) {
                _this.mask.removeClass("pt-hide").addClass("pt-show");
            }).addListener(exports.TaskCountEvent.Busy, function (e) {
                _this.mask.addClass("pt-busy");
            }).addListener(exports.TaskCountEvent.Free, function (e) {
                _this.mask.removeClass("pt-show pt-busy").addClass("pt-hide");
            });
            return _this;
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
    function setConfig(data) {
        if (data.namespace) {
            exports.namespace = namespace = data.namespace;
        }
        if (data.createVPView) {
            createVPView = data.createVPView;
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
    function getFocusedChild() {
        return application.getFocusedChild();
    }
    exports.getFocusedChild = getFocusedChild;
    function bootstrap(application) {
        application = application;
    }
    exports.bootstrap = bootstrap;
});
