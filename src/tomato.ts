/*!
 * Copyright po-to.org All Rights Reserved.
 * https://github.com/po-to/
 * Licensed under the MIT license
 */
declare var require: (deps: string[]|string, succCallback?: (data: any) => void, failCallback?: (error: any) => void) => void;
declare var define: (id: string, mod: any) => void;

function findInArray<T>(arr:T[],fun:(item:T)=>boolean):T|undefined{
    for(let item of arr){
        if(fun(item)){
            return item;
        }
    }
    return undefined;
}
function findIndexInArray<T>(arr:T[],fun:(item:T)=>boolean):number{
    for(let i=0,k=arr.length; i<k; i++){
        if(fun(arr[i])){
            return i;
        }
    }
    return -1;
}
function assignObject<T>(target:T,...args):T{
    for(let item of args){
        for(let key in item){
            if(item.hasOwnProperty(key)){
                target[key] = item[key];
            }
        }
    }
    return target;
}

let autoID: number = 0;
let namespace: string = 'po-to/tomato';

export const TaskCountEvent = {
    Added: "TaskCountEvent.Added",
    Completed: "TaskCountEvent.Completed",
    Busy: "TaskCountEvent.Busy",
    Free: "TaskCountEvent.Free"
}

export const VPresenterEvent = {
    Installed: "CPresenterEvent.Installed",
    Uninstalled: "CPresenterEvent.Uninstalled",
    ChildAppended: "CPresenterEvent.ChildAppended",
    ChildRemoved: "CPresenterEvent.ChildRemoved",
}

export const VPresenterTransaction = {
    AllowInstall: "AllowInstall"
}

export const DialogEvent = {
    Focused: "DialogEvent.Focused",
    Blured: "DialogEvent.Blured",
    Closed: "DialogEvent.Closed",
}

export const CmdEvent = {
    ItemSuccess: "CmdEvent.ItemSuccess",
    ItemFailure: "CmdEvent.ItemFailure",
    Failure: "CmdEvent.Failure",
    Success: "CmdEvent.Success",
    Complete: "CmdEvent.Complete",
    Overflow: "CmdEvent.Overflow"
}

export class PEvent {
    readonly target: PDispatcher;

    constructor(public readonly name: string, public readonly data?: any, public bubbling: boolean = false) {
    }
   
}
export class PError extends Error {
    constructor(public readonly name: string, public readonly note: string = "tomato.PError", public readonly data?: { file: string, line: string, detail: any }) {
        super(name+note);
    }

    getNamespace(): string {
        return namespace;
    }
}
function emptyObject<T>(obj: any): T {
    let arr:string[] = [];
    for(let key in obj){
        if(obj.hasOwnProperty(key)){
            arr.push(key);
        }
    }
    arr.forEach(function (key) {
        delete obj[key];
    })
    return obj;
}

export class PDispatcher {
    constructor(public readonly parent?: PDispatcher | undefined) {
    }
    protected readonly _handlers: { [key: string]: Array<(e: PEvent) => void> } = {};

    addListener(ename: string, handler: (e: PEvent) => void): this {
        let dictionary = this._handlers[ename];
        if (!dictionary) {
            this._handlers[ename] = dictionary = [];
        }
        dictionary.push(handler);
        return this;
    }
    removeListener(ename?: string, handler?: (e: PEvent) => void): this {
        if (!ename) {
            emptyObject(this._handlers);
        } else {
            let handlers = this._handlers;
            if (handlers.propertyIsEnumerable(ename)) {
                let dictionary = handlers[ename];
                if (!handler) {
                    delete handlers[ename];
                } else {
                    let n = dictionary.indexOf(handler);
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
    }
    dispatch(e: PEvent): this {
        if (!e.target) {
            (e as any).target = this;
        }
        let dictionary = this._handlers[e.name];
        if (dictionary) {
            for (let i = 0, k = dictionary.length; i < k; i++) {
                dictionary[i](e);
            }
        }
        if (this.parent && e.bubbling) {
            this.parent.dispatch(e);
        }
        return this;
    }
    setParent(parent?: PDispatcher): this {
        (this as any).parent = parent;
        return this;
    }
}

export enum TaskCounterState { Free, Busy };

export class TaskCounter extends PDispatcher {
    public readonly list: Array<{ promise: Promise<any>, note: string }> = [];
    public readonly state: TaskCounterState = TaskCounterState.Free;
    private _timer: number;
    constructor(public deferSecond: number) {
        super();
    }
    addItem(promise: Promise<any>, note: string = ''): Promise<any> {
        if (!this.list.some((item) => item.promise === promise)) {
            this.list.push({ promise: promise, note: note });
            promise.then(value => this._completeItem(promise), reason => this._completeItem(promise));
            this.dispatch(new PEvent(TaskCountEvent.Added));
            if (!this._timer) {
                this._timer = window.setTimeout(() => {
                    this._timer = 0;
                    if (this.list.length > 0 && this.state == TaskCounterState.Free) {
                        (this as any).state = TaskCountEvent.Busy;
                        this.dispatch(new PEvent(TaskCountEvent.Busy));
                    }
                }, this.deferSecond * 1000);
            }
        }
        return promise;
    }
    private _completeItem(promise: Promise<any>): this {
        let i = findIndexInArray(this.list,(item) => item.promise === promise);
        if (i > -1) {
            this.list.splice(i, 1);
            this.dispatch(new PEvent(TaskCountEvent.Completed));
            if (this.list.length == 0) {
                if (this._timer) {
                    clearTimeout(this._timer);
                    this._timer = 0;
                }
                if (this.state == TaskCounterState.Busy) {
                    (this as any).state = TaskCountEvent.Free;
                    this.dispatch(new PEvent(TaskCountEvent.Free));
                }
            }
        }
        return this;
    }
}
let taskCounter: TaskCounter = new TaskCounter(3);

export interface View {
    removeChild(view: View): any;
    appendChild(view: View): any;
    removeClass(className: string): any;
    addClass(className: string): any;
}

export interface VPView extends View {
    getVPID(): string;
    getVPCON(): string;
    setVPID(id: string): void;
    getSUBS(): VPView[];
}
function isVPView(data:any):data is VPView{
    return (typeof data.getVPID == "function") && (typeof data.getVPCON == "function") && (typeof data.setVPID == "function")  && (typeof data.getSUBS == "function") && (typeof data.removeChild == "function") && (typeof data.appendChild == "function") && (typeof data.removeClass == "function") && (typeof data.addClass == "function")
}
let createVPView: (html: string) => VPView = function (html: string): VPView {
    return {} as VPView;
};
export class VPresenter extends PDispatcher {
    public readonly parent: VPresenter | undefined;
    constructor(public readonly view: VPView, parent?: VPresenter, public vpid?: string) {
        super(parent);
    }
    isWholeVPresenter(): this is WholeVPresenter {
        return typeof (this['getHeader']) == 'function' && typeof (this['getFooter']) == 'function' && typeof (this['getAside']) == 'function';
    }
    init(subs: VPresenter[]): Promise<this> | this {
        return this;
    }
    protected _allowInstallTo(parent: VPresenter): boolean {
        return true;
    }
    protected _allowUninstallTo(parent: VPresenter): boolean {
        return true;
    }
    protected _allowAppendChild(child: VPresenter): boolean {
        return true;
    }
    protected _allowRemoveChild(child: VPresenter): boolean {
        return true;
    }
    protected _beforeInstallTo(parent: VPresenter): void {
    }
    protected _beforeUninstallTo(parent: VPresenter): void {
    }
    protected _afterInstallTo(parent: VPresenter): void {
    }
    protected _afterUninstallTo(parent: VPresenter): void {
    }
    protected _afterRemoveChild(member: VPresenter): void {
        this.view.removeChild(member.view);
    }
    protected _afterAppendChild(member: VPresenter): void {
        this.view.appendChild(member.view);
    }
    protected _beforeRemoveChild(member: VPresenter): void {
    }
    protected _beforeAppendChild(member: VPresenter): void {
    }
    protected _checkRemoveChild(member: VPresenter): boolean {
        if (member.parent != this) { return true; }
        if (
            !member._allowUninstallTo(this) ||
            !this._allowRemoveChild(member)
        ) { return false; }
        return true;
    }
    removeChild(member: VPresenter, checked?: boolean): boolean {
        if (member.parent != this) { return false; }
        if (!checked && !this._checkRemoveChild(member)) {
            return false;
        }
        this._beforeRemoveChild(member);
        member._beforeUninstallTo(this);
        member.setParent(undefined);
        this._afterRemoveChild(member);
        member._afterUninstallTo(this);
        this.dispatch(new PEvent(VPresenterEvent.ChildRemoved));
        member.dispatch(new PEvent(VPresenterEvent.Uninstalled));
        return true;
    }
    protected _checkAppendChild(member: VPresenter): boolean {
        if (member.parent == this) { return true; }
        if (
            !member._allowInstallTo(this) ||
            !this._allowAppendChild(member) ||
            (member.parent && (!member._allowUninstallTo(this) || !member.parent._allowRemoveChild(member)))
        ) { return false; }
        return true;
    }
    getParentDialog(): Dialog {
        let parent: VPresenter | undefined = this.parent;
        while (parent) {
            if (parent instanceof Dialog) {
                return parent;
            }
            parent = parent.parent;
        }
        return application;
    }
    appendChild(member: VPresenter, checked?: boolean): boolean {
        if (member.parent == this) { return false; }
        if (!checked && !this._checkAppendChild(member)) {
            return false;
        }
        if (member.parent) { member.parent.removeChild(member, true) }
        this._beforeAppendChild(member);
        member._beforeInstallTo(this);
        member.setParent(this);
        this._afterAppendChild(member);
        member._afterInstallTo(this);
        this.dispatch(new PEvent(VPresenterEvent.ChildAppended));
        member.dispatch(new PEvent(VPresenterEvent.Installed));
        return true;
    }
    _update(): Promise<this> {
        return Promise.resolve(this);
    }
    destroy(): void {
        if (this.vpid) {
            delete VPresenterStore[this.vpid.substr(0, this.vpid.indexOf("?")).replace(/\/+$/, "")];
        }
    }
    getDialogClassName(): string {
        return "";
    }
}

let VPresenterStore: { [key: string]: VPresenter | Promise<VPresenter> } = {}

function syncRequire(path:string):any|Promise<any>{
    try{
        return require(path);
    }catch(e){
        return new Promise(function(resolve,reject){
            require([path],function(data){
                resolve(data);
            },function(error){
                reject(error);
            });
        })
    }
}

export let getVPresenter = (function(VPresenterStore){

    function buildView(data:any):VPView{
        let vpview:VPView;
        if(typeof data == "string"){
            return createVPView(data);
        }else{
            return data;
        }
    }
    function initVPresenter(con: Function, view: VPView, url:string) : VPresenter | Promise<VPresenter> {
        let vp: VPresenter = new (con as any)(view, undefined, url);
        let hasPromise :boolean = false;
        let list = view.getSUBS().map(function (view) {
            let arr = view.getVPID().split("?");
            let id = arr[0].replace(/\/+$/, "");
            let result = getVPresenter(view);
            if(!hasPromise && result instanceof Promise){
                hasPromise = true;
            }
            return result;
            // if (VPresenterStore[id]) {
            //     arr[0] += "/" + (++autoID);
            //     view.setVPID(arr.join("?"));
            // }
            
        });
        if(!list.length || !hasPromise){
            return vp.init(list as any);
        }else{
            return Promise.all(list).then(
                function (list) {
                    return vp.init(list as any);
                }
            )
        }
    }
    function buildVPresenter(view:VPView,url:string):VPresenter | Promise<VPresenter>{
        if(!isVPView(view)){
            console.log(view);
            throw "is not a VPView";
        }
        let conPath = view.getVPCON();
        if (conPath) {
            let result = syncRequire(conPath);
             if(result instanceof Promise){
                return result.then(function(data){
                    return initVPresenter(data,view,url);
                })
            }else{
                return initVPresenter(result,view,url);
            }
        } else {
            return initVPresenter(VPresenter,view,url);
        }
    }

    function returnResult(view:VPView | null, url:string): VPresenter | Promise<VPresenter>{
        if (view) {
            return buildVPresenter(view,url);
        } else if(url){
            let result = syncRequire(url);
            if(result instanceof Promise){
                return result.then(function(data){
                    return buildVPresenter(buildView(data),url);
                })
            }else{
                return buildVPresenter(buildView(result),url);
            }
        }else{
            throw 'not found view and url !'
        }
    }
    return function(data: string | VPView): VPresenter | Promise<VPresenter>{
        let url: string;
        let id: string;
        let view: VPView | null;
        if (typeof data != "string") {
            view = data;
            id = data.getVPID();
        } else {
            view = null;
            id = data;
        }
        url = id;
        id = id.substr(0, id.indexOf("?")).replace(/\/+$/, "");
        let cacheData: Promise<VPresenter> | VPresenter | null = VPresenterStore[id];
        if (cacheData instanceof VPresenter) {
            return cacheData;
        } else if (cacheData instanceof Promise) {
            return cacheData;
        }else{
            let result = returnResult(view, url);
            VPresenterStore[id] = result;
            if(result instanceof Promise){
                taskCounter.addItem(result, 'load:' + url);
                result['catch'](function(error){
                    delete VPresenterStore[id];
                    console.log(url+ ":" +error);
                })
            }
            return result;
        }
    }

})(VPresenterStore)

export function syncGetVPresenter<T>(data: string | VPView):T{
    return getVPresenter(data) as any;
}
export function asyncGetVPresenter<T>(data: string | VPView):Promise<T>{
    let result = getVPresenter(data);
    if(result instanceof Promise){
        return result as any;
    }else{
        return Promise.resolve(result as any);
    }
}
// export function getVPresenter<T>(data: string | VPView, successCallback?: (vp: T) => void, failueCallback?: (error: Error) => void): T | Promise<T> {
//     let url: string;
//     let id: string;
//     let view: VPView | null;
//     if (typeof data != "string") {
//         view = data;
//         id = data.getVPID();
//     } else {
//         view = null;
//         id = data;
//     }
//     url = id;
//     id = id.substr(0, id.indexOf("?")).replace(/\/+$/, "");
//     let cacheData: Promise<T> | T | null = VPresenterStore[id] as any;
//     if (cacheData instanceof VPresenter) {
//         return cacheData as T;
//     } else if (cacheData instanceof Promise) {
//         let success: (vp: any) => void = successCallback || function (VP: any) { };
//         let failue: (error: Error) => void = failueCallback || function (error: Error) { };
//         cacheData.then(success, failue);
//         return cacheData;
//     }
//     let onError = function (error: Error, reject: (error: Error) => void) {
//         delete VPresenterStore[id];
//         failueCallback && failueCallback(error);
//         console.log(error);
//         reject(error);
//     }
//     let onSuccess = function (con: Function, dom: VPView, resolve: (vp: T) => void, reject: (error: Error) => void) {
//         let vp: VPresenter | null = null;
//         try {
//             vp = new (con as any)(dom, undefined, url);
//         } catch (e) {
//             onError(e, reject);
//         }
//         if (vp) {
//             Promise.all(dom.getSUBS().map(function (dom) {
//                 let arr = dom.getVPID().split("?");
//                 let id = arr[0].replace(/\/+$/, "");
//                 if (VPresenterStore[id]) {
//                     arr[0] += "/" + (++autoID);
//                     dom.setVPID(arr.join("?"));
//                 }
//                 return getVPresenter(dom);
//             })).then(
//                 function (list) {
//                     return vp && vp.init(list as any);
//                 }
//                 ).then(
//                 function () {
//                     successCallback && successCallback(vp as any);
//                     resolve(vp as any);
//                 }
//                 )['catch'](function (e) {
//                     onError(e, reject);
//                 })
//         }
//     }

//     let promise = new Promise<T>(function (resolve, reject) {
//         let init = function (dom: VPView) {
//             let conPath = dom.getVPCON();
//             if (conPath) {
//                 require([conPath], function (con: Function) {
//                     onSuccess(con, dom, resolve, reject);
//                 }, function (err) {
//                     onError(err, reject);
//                 })
//             } else {
//                 onSuccess(VPresenter, dom, resolve, reject);
//             }
//         }
//         if (view) {
//             init(view);
//         } else {
//             require([url], function (obj: string | VPView) {
//                 if (typeof obj == "string") {
//                     view = createVPView(obj);
//                 } else {
//                     view = obj;
//                 }
//                 init(view);
//             }, function (err) {
//                 onError(err, reject);
//             })
//         }

//     });
//     VPresenterStore[id] = promise as any;
//     taskCounter.addItem(promise, 'load:' + url);
//     return promise;
// }

export enum DialogState { Focused, Blured, Closed };
export enum DialogPosition { Left, Center, Right, Top, Middle, Bottom }
export enum DialogSize { Content, Full }

export interface LayerView extends VPView {
    setZIndex(index: number): void;
}

export type DialogRefer = string | number | Object | [Object, string] | ((dialog: Dialog) => number);
export interface DialogConfig {
    className: string;
    masked: boolean;
    fixed: boolean;
    position: { x: DialogPosition | DialogRefer, y: DialogPosition | DialogRefer };
    size: { width: DialogSize | DialogRefer, height: DialogSize | DialogRefer };
    offset: { x: DialogRefer, y: DialogRefer };
    effect: string;
    asideOnRight: boolean;
    asideInBody: boolean;
    headerEffect: string | undefined;
    footerEffect: string | undefined;
    asideEffect: string | undefined;
    bodyEffect: string | undefined;
}
export interface DialogConfigOptions {
    className?: string;
    masked?: boolean;
    fixed?: boolean;
    position?: { x: DialogPosition | DialogRefer, y: DialogPosition | DialogRefer };
    size?: { width: DialogSize | DialogRefer, height: DialogSize | DialogRefer };
    offset?: { x: DialogRefer, y: DialogRefer };
    effect?: string;
    asideOnRight?: boolean;
    asideInBody?: boolean;
    headerEffect?: string;
    footerEffect?: string;
    asideEffect?: string;
    bodyEffect?: string;
}

export abstract class Dialog extends VPresenter {
    public readonly history = new History();
    public readonly parent: Dialog | undefined;
    public readonly view: LayerView;
    public readonly state: DialogState = DialogState.Closed;
    public readonly content: VPresenter | null = null;
    public readonly dialog: View;
    public readonly mask: View;
    public readonly body: View | undefined;
    public readonly header: View | undefined;
    public readonly footer: View | undefined;
    public readonly aside: View | undefined;

    protected readonly _dialogList: Dialog[] = [];
    private _zindex: number = -1;
    private _contentClassName: string;
    protected _contentHeader: View | null;
    protected _contentFooter: View | null;
    protected _contentAside: View | null;

    public readonly config: DialogConfig = {
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
    }

    constructor(els: { view: LayerView, dialog: View, mask: View, body?: View, header?: View, footer?: View, aside?: View }, config?: DialogConfigOptions) {
        super(els.view, undefined);
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
        this.history.addListener(CmdEvent.Overflow, (e) => {
            this._onHistoryOverflow(e);
        })
    }
    protected _onHistoryOverflow(e) {
        this.close();
    }
    setConfig(config: DialogConfigOptions) {
        let oldConfig = this.config;
        (this as any).config = assignObject({}, this.config, config);
        this._afterConfigChange(oldConfig);
    }
    getZIndex(): number {
        return this._zindex;
    }
    getFocusedChild(): Dialog {
        let list = this._dialogList;
        let dialog: Dialog = this;
        while (list.length) {
            dialog = list[list.length - 1];
            list = dialog._dialogList;
        }
        return dialog;
    }
    protected _afterConfigChange(oldConfig: DialogConfig) {
        this.view.removeClass([oldConfig.className, oldConfig.effect, oldConfig.masked ? "pt-masked" : "", oldConfig.asideOnRight ? "pt-asideOnRight" : "pt-asideOnLeft", oldConfig.asideInBody ? "pt-asideInBody" : "pt-asideOutBody"].join(" "));
        this.view.addClass([this.config.className, this.config.effect, this.config.masked ? "pt-masked" : "", this.config.asideOnRight ? "pt-asideOnRight" : "pt-asideOnLeft", this.config.asideInBody ? "pt-asideInBody" : "pt-asideOutBody"].join(" "));
    }
    protected _setZIndex(i: number): void {
        this._zindex = i;
        this.view.setZIndex(i);
    }
    protected _countIndex(): void {
        this._dialogList.forEach(function (dialog, index) {
            dialog._setZIndex(index);
        })
    }
    protected _beforeFocus(): void {

    }
    protected _afterFocus(): void {

    }
    protected _beforeClose(): void {
    }
    protected _afterClose(): void {
    }
    protected _beforeBlur(): void {

    }
    protected _afterBlur(): void {

    }
    protected _allowFocus(closeAction?: boolean): boolean {
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
    }
    protected _allowBlur(): boolean {
        return true;
    }
    protected _allowClose(): boolean {
        return true;
    }
    private _checkFocus(): boolean {
        if ((this as any) == application) { return true; }
        if (!this.parent) { return false; }
        let parentDialog: Dialog = this.parent;
        if (this.state != DialogState.Focused) {
            if (!this._allowFocus()) { return false; }
            let list = parentDialog._dialogList;
            let dialog: Dialog | null = list[list.length - 1];
            if (dialog && dialog != this && !dialog._allowBlur()) { return false; }
        }
        return parentDialog._checkFocus();
    }
    private _checkClose(): boolean {
        if (this.state == DialogState.Closed) { return true; }
        if (!this.parent) { return false; }
        if (!this._allowClose()) { return false; }
        let parentDialog: Dialog = this.parent;
        if (this.state == DialogState.Focused) {
            let list = parentDialog._dialogList;
            let dialog: Dialog | undefined = list[list.length - 2];
            if (dialog && !dialog._allowFocus()) {
                return false;
            }
        }
        return true;
    }
    refresh() {
        this.refreshSize();
        this.refreshLayout();
        this.refreshPosition();
    }
    focus(_checked?: boolean, _parentCall?: boolean): boolean {
        /* 三种调用场景：1.由close()上文调用；2.当前为closed状态; 3.当前为blured状态 */
        //if (this.state == DialogState.Focused) { return false; }
        if (!_checked && !this._checkFocus()) { return false; }
        let parentDialog: Dialog = this.parent as Dialog;
        let list = parentDialog._dialogList;
        let blurDialog: Dialog | undefined = list[list.length - 1];
        let initiative: boolean = true;

        if (this.state != DialogState.Focused) {
            if (blurDialog == this) {//由close()调用
                blurDialog = undefined;
                initiative = false;
            }
            this._beforeFocus();
            if (initiative) {
                if (this.state == DialogState.Blured) {
                    let i = list.indexOf(this);
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
            let curState = this.state;
            this._setState(DialogState.Focused);
            if (curState == DialogState.Closed) {
                this.refresh();
            }
            this._afterFocus();
            if (!_parentCall) {
                setTopDialog(this);
            }
            this.dispatch(new PEvent(DialogEvent.Focused));
            if (this.content) {
                this.content.dispatch(new PEvent(DialogEvent.Focused));
            }

        }
        return true;
    }
    close(): boolean {
        if (this.state == DialogState.Closed || !this._checkClose()) { return false; }
        this._beforeClose();
        let parentDialog: Dialog = this.parent as Dialog;
        let list = parentDialog._dialogList;
        let focusDialog: Dialog | null = null;
        if (list[list.length - 1] == this) {
            list.pop();
            focusDialog = list[list.length - 1];
        } else {
            let i = list.indexOf(this);
            (i > -1) && list.splice(i, 1);
            this._countIndex();
        }
        this._setZIndex(-1);
        this._setState(DialogState.Closed);
        this.refresh();
        this._afterClose();
        this.dispatch(new PEvent(DialogEvent.Closed));
        if (this.content) {
            this.content.dispatch(new PEvent(DialogEvent.Closed));
        }
        focusDialog && focusDialog.focus(true);
        !focusDialog && setTopDialog(parentDialog);
        return true;
    }

    private _blur(): void {
        if (this.state == DialogState.Blured) { return; }
        this._beforeBlur();
        this._setState(DialogState.Blured);
        this._afterBlur();
        this.dispatch(new PEvent(DialogEvent.Blured));
        if (this.content) {
            this.content.dispatch(new PEvent(DialogEvent.Blured));
        }
    }
    protected _setState(state: DialogState): void {
        this.view.removeClass("pt-" + DialogState[this.state]);
        (this as any).state = state;
        this.view.addClass("pt-" + DialogState[this.state]);
    }
    protected _allowAppendChild(member: VPresenter): boolean {
        if (member instanceof Dialog) {
            if (member.state != DialogState.Closed) { return false; }
        }
        return true;
    }
    appendChild(child: VPresenter): boolean {
        if (child.parent == this) { return false; }
        if (!this._checkAppendChild(child)) {
            return false;
        }
        if (!(child instanceof Dialog)) {
            if (this.content) {
                let member = this.content;
                if (member.parent != this) { return false; }
                if (!this._checkRemoveChild(member)) {
                    return false;
                }
                this.removeChild(member, true);
            }
            (this as any).content = child;
        }
        return super.appendChild(child, true);
    }
    protected _afterAppendChild(member: VPresenter): void {
        if (member instanceof Dialog) {
            this.view.appendChild(member.view);
        } else {
            this._contentClassName = member.getDialogClassName();
            this.view.addClass(this._contentClassName);
            if (this.body) {
                this.body.appendChild(member.view);
            } else {
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
                    this.refresh();
                } else {
                    this.refreshLayout();
                }
            }
        }
    }
    protected _afterRemoveChild(member: VPresenter): void {
        if (member instanceof Dialog) {
            this.view.removeChild(member.view);
        } else {
            if (this._contentClassName) {
                this.view.removeClass(this._contentClassName);
                this._contentClassName = "";
            }
            if (this.body) {
                this.body.removeChild(member.view)
            } else {
                this.dialog.removeChild(member.view)
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
    }
    refreshSize(): void {

    }
    refreshPosition(): void {

    }
    refreshLayout(): void {

    }
}

export interface WholeVPresenter extends VPresenter {
    getHeader(): View | null;
    getFooter(): View | null;
    getAside(): View | null;
}

export class Application extends Dialog {

    public initTime = Date.now();
    constructor(rootUri: Cmd | null, els: { view: LayerView, dialog: View, mask: View, body?: View, header?: View, footer?: View, aside?: View }, config?: DialogConfigOptions) {
        super(els, config);
        this._setZIndex(0);
        this._setState(DialogState.Focused);
        this.view.addClass("pt-topDialog");
        taskCounter.addListener(TaskCountEvent.Added, e => {
            this.mask.addClass("pt-show");
        }).addListener(TaskCountEvent.Completed, e => {
            this.mask.removeClass("pt-show");
        }).addListener(TaskCountEvent.Busy, e => {
            this.mask.addClass("pt-busy");
        }).addListener(TaskCountEvent.Free, e => {
            this.mask.removeClass("pt-busy");
        })
        if (rootUri) {
            this._initHistory(this.initTime, rootUri);
        }
    }
    private _initHistory(initTime: number, rootUri: Cmd) {
        let supportState = window.history.pushState ? true : false;
        let _trigger: boolean | (() => void);
        let history = this.history;

        function pushState(code: string, title: string, url: string, isUri: boolean) {
            window.history.pushState(code, title, isUri ? url : "#" + encodeURI(url));
        }
        function addState(code: string, title?: string, url?: string) {
            window.history.replaceState(initTime + "." + code, title || document.title, url || window.location.href);
        }
        history._syncHistory = function (change: { move?: number, moveTitle?: string, push?: { code: string, url: string, title: string, isUri: boolean } }, callback: () => void) {
            let execute = function () {
                if (change.push) {
                    pushState(initTime + '.' + change.push.code, change.push.title, change.push.url, change.push.isUri);
                    document.title = change.push.title;
                }
                setTimeout(callback, 1);
            }
            if (change.move) {
                _trigger = function () {
                    document.title = change.moveTitle || '';
                    execute();
                };
                window.history.go(change.move);
            } else {
                execute();
            }
        }
        function handlerHistory(str: string) {
            let [flag, uri, act] = str.split(".").map(function (val) {
                return parseInt(val);
            });
            if (flag == initTime) {
                let cmd = history.getCmdByCode(uri + '.' + act);
                if (cmd) {
                    let [curUri, curAct] = history.getCode();
                    let n = curUri - uri + curAct - act;
                    if (n != 0) {
                        let title = document.title;
                        document.title = cmd.title;
                        _trigger = function () {
                            document.title = title;
                            setTimeout(function () {
                                getTopDialog().history.go(-n);
                            }, 1);//异步触发
                        };
                        window.history.go(n);
                    }
                } else {
                    window.location.reload();
                }
            } else {
                window.location.reload();
            }
        }
        function handlerChange(e: { state: string }) {
            if (_trigger) {
                if (typeof _trigger == "function") {
                    _trigger();
                }
                _trigger = false;
            } else {
                if (history.getLength()) {
                    if (e.state) {
                        handlerHistory(e.state);
                    } else {
                        history.added(new Cmd(window.location.href, document.title, false));
                        addState(history.getCode().join("."));
                    }
                }
            }
        }
        if (supportState) {
            bindEventListener(window, 'popstate', handlerChange);
        } else {
            bindEventListener(window, 'hashchange', function (e) {
                console.log('hash', window.location.hash, e);
            });
        }
        document.title = rootUri.title;
        addState("1.0", rootUri.title, rootUri.url);
        this.history.added(rootUri);
    }
    close(): boolean {
        return false;
    }
    focus(checked?: boolean): boolean {
        return false;
    }

}

let application: Application = {} as any;

export class Cmd extends PDispatcher {
    constructor(public readonly url: string, public readonly title: string, public readonly isUri: boolean = false) {
        super();
    }
    success() {
        this.dispatch(new PEvent(CmdEvent.ItemSuccess, this, true))
    }
    failure() {
        this.dispatch(new PEvent(CmdEvent.ItemFailure, this, true))
    }
    execute() {
        console.log('execute()', this.url);
        this.success();
    }
    redo() {
        console.log('redo()', this.url);
        this.success();
    }
    undo() {
        console.log('undo()', this.url);
        this.success();
    }
    abort_undo() {
    }
}

class openDialogCmd extends Cmd {
    constructor() {
        super('dialog', document.title);
    }
    execute() {
        this.success();
    }
    redo() {
        this.failure();
    }
    undo() {
        this.success();
    }
}

function bindEventListener(tag, type, fun) {
    if (window.addEventListener) {
        tag.addEventListener(type, fun, false);
    } else {
        tag.attachEvent("on" + type, fun);
    }
};
function unbindEventListener(tag, type, fun) {
    if (window.addEventListener) {
        tag.removeEventListener(type, fun, false);
    } else {
        tag.detachEvent("on" + type, fun);
    }
};

export class History extends PDispatcher {
    private _list: { code: string, cmd: Cmd }[] = [];
    private _cache: Array<Cmd | number | string> = [];
    //cmd:当前正在执行的命令，cur:执行成功后指向的命令
    private _curItem?: { cmd: Cmd, cur: [number, number] | null, curCmd: Cmd | null, go: number };
    private _cur: [number, number] = [0, 0];
    private _goto: [number, number] = [0, 0];
    private _first: [number, number] = [0, 0];
    private _last: [number, number] = [0, 0];

    constructor(public maxStep: number = 50) {
        super(undefined);
        this.addListener(CmdEvent.ItemSuccess, (pevent: PEvent) => {
            let cmd: Cmd = pevent.target as Cmd;
            cmd.setParent(undefined);
            let callback = () => {
                this._curItem = undefined;
                this.next();
            }
            let item = this._curItem;
            if (item) {
                if (!item.cur) {
                    this._syncHistory(this._addHistoryItem(item.cmd), callback);
                } else {
                    this._cur = item.cur;
                    this._syncHistory({ move: item.go, moveTitle: (item.curCmd as Cmd).title }, callback);
                }
            }
        }).addListener(CmdEvent.ItemFailure, (pevent: PEvent) => {
            let cmd: Cmd = pevent.target as Cmd;
            cmd.setParent(undefined);
            if (this._curItem) {
                this._goto = [this._cur[0], this._cur[1]];
                this._cache = [];
            }
            this._curItem = undefined;
            // this.cache.length = 0;
            // this.goto = this.cur;
            // this.curItem = undefined;
            // this.dispatch(new PEvent(CmdEvent.Failure));
            // this.dispatch(new PEvent(CmdEvent.Complete));
        })
    }
    getLength() {
        return this._list.length;
    }
    getCode() {
        return [this._cur[0], this._cur[1]];
    }
    private _pushState(code: string, url: string, isUri: boolean) {
        window.history.pushState(code, "", isUri ? url : "#" + encodeURI(url));
    }
    public _syncHistory(change: { move?: number, moveTitle?: string, push?: { code: string, url: string, title: string, isUri: boolean } }, callback: () => void) {
        callback();
    }
    private _addHistoryItem(cmd: Cmd): { move?: number, moveTitle?: string, push?: { code: string, url: string, title: string, isUri: boolean } } {
        //此时_cur必定等于_goto，因为只有在_cur==_goto时才会执行新的命令
        let moveIndex: number = 0, moveTitle: string = "";
        if (this._cur.join('.') != this._first.join('.')) {
            let del = this._list.splice(0, this._first[0] - this._cur[0] + this._first[1] - this._cur[1]);
            this._first = [this._cur[0], this._cur[1]];
        }
        if (cmd.isUri) {
            if (this._cur[1] != 0) {
                let del = this._list.splice(0, this._cur[1]);
                moveIndex -= this._cur[1];
                this._cur[1] = 0;
                this._goto[1] = 0;
                let moveCmd: Cmd = this.getCmdByCode(this._cur.join(".")) as Cmd;
                moveTitle = moveCmd.title;
            }
            this._cur[0]++;
            this._goto[0]++;
        } else {
            this._cur[1]++;
            this._goto[1]++;
        }
        let item = {
            code: this._cur.join('.'),
            cmd: cmd
        }
        this._list.unshift(item);
        if (this._list.length > this.maxStep) {
            this._list.length = this.maxStep;
        }
        this._first = [this._cur[0], this._cur[1]];
        let last = this._list[this._list.length - 1];
        let arr = last.code.split('.');
        this._last = [parseInt(arr[0]), parseInt(arr[1])];
        return { move: moveIndex, moveTitle: moveTitle, push: { code: item.code, url: cmd.url, title: cmd.title, isUri: cmd.isUri } };
    }
    getCmdByCode(code: string): Cmd | undefined {
        let item = findInArray(this._list,function (item) {
            return item.code == code;
        })
        return item ? item.cmd : undefined;
    }
    go(n: number | string) {
        this._cache.push(n);
        this.next();
    }
    push(cmd: Cmd | Cmd[]) {
        let arr = Array.isArray(cmd) ? cmd : [cmd];
        this._cache.push(...arr);
        this.next();
    }
    added(cmd: Cmd) {
        this._addHistoryItem(cmd);
    }
    private _executeGoto() {
        let g = this._goto;
        let c = this._cur;
        let uriN = g[0] - c[0];
        if (uriN == 0) {//同uri内
            if (g[1] < c[1]) {//后退一条
                this._curItem = {
                    cmd: this.getCmdByCode(c.join('.')) as Cmd,
                    cur: [c[0], c[1] - 1],
                    curCmd: this.getCmdByCode([c[0], c[1] - 1].join('.')) as Cmd,
                    go: -1
                }
                this._curItem.cmd.setParent(this);
                this._curItem.cmd.undo();
            } else {//前进一条
                this._curItem = {
                    cmd: this.getCmdByCode([c[0], c[1] + 1].join('.')) as Cmd,
                    cur: [c[0], c[1] + 1],
                    curCmd: null,
                    go: 1
                }
                this._curItem.curCmd = this._curItem.cmd;
                this._curItem.cmd.setParent(this);
                this._curItem.cmd.redo();
            }
        } else {//跨uri
            this._curItem = {
                cmd: this.getCmdByCode([g[0], 0].join('.')) as Cmd,
                cur: [g[0], 0],
                curCmd: null,
                go: uriN - c[1]
            }
            this._curItem.curCmd = this._curItem.cmd;
            this._curItem.cmd.setParent(this);
            this._curItem.cmd.redo();
        }
    }
    private _checkGoto(item: number | string): [number, number] | null {
        let gotoCode: [number, number] = [this._goto[0], this._goto[1]];
        if (typeof item == "number") {
            if (item < 0) {
                let n = this._cur[1] + item;
                if (n < 0) {
                    gotoCode[0] += n;
                    gotoCode[1] = 0;
                } else {
                    gotoCode[1] = n;
                }
            } else if (item > 0) {
                let n = gotoCode[0] + item - this._first[0];
                if (n >= 0) {
                    gotoCode[0] = this._first[0];
                    gotoCode[1] += n;
                } else {
                    gotoCode = [gotoCode[0] + item, 0];
                }
            }
        } else {
            let arr = item.split('.');
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
            } else if (gotoCode[1] < this._last[1]) {
                gotoCode[1] = this._last[1];
            }
        } else {
            gotoCode[1] = 0;
        }
        return gotoCode;
    }
    next() {
        if (this._curItem) { return; }
        if (this._cur.join('.') != this._goto.join('.')) {
            this._executeGoto();
        } else {
            let item = this._cache.shift();
            if (item instanceof Cmd) {
                this._curItem = {
                    cmd: item,
                    cur: null,
                    curCmd: null,
                    go: 0
                }
                item.setParent(this);
                item.execute();
            } else if (item) {
                let arr = this._checkGoto(item);
                if (arr) {
                    this._goto = arr;
                    this.next();
                } else {
                    this._cache = [];
                    this.dispatch(new PEvent(CmdEvent.Overflow));
                }
            } else {
                //console.log("Complete", this._cur, this._goto, this._list);
            }
        }
    }

}

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


export function initHistory() {
    let supportState = window.history.pushState ? true : false;
    let cid = Date.now();
    let undoUrl = "#undo@" + cid;
    let redoUrl = "#redo@" + cid;
    let curHash = window.location.hash;
    curHash = curHash ? curHash : "#";
    let ready = false;
    if (supportState) {
        window.history.replaceState("", "back", undoUrl);
        window.history.pushState("", "", curHash);
        window.history.pushState("", "forward", redoUrl);
    } else {
        window.location.replace(undoUrl);
        window.location.href = curHash;
        window.location.href = redoUrl;
    }
    var dispatchEvent = function (e) {
        window.setTimeout(function () {//避免在dispatch过程中再次引起hashchange事件
            // potato.dispatch(new potato.Event(e));
            // if(e=="historyReady"){
            //     SetReadOnly(potato, "historyReady", true);
            // }
        }, 0);
    };

    window.setTimeout(function () {//fix ie8下触发多次
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

export function setConfig(data: {
    namespace?: string,
    renderer?: { [key: string]: (tpl: string, data: any) => void },
    application?: Application,
    createVPView?: (html: string) => VPView;
}): void {
    if (data.namespace) {
        namespace = data.namespace;
    }
    if (data.createVPView) {
        createVPView = data.createVPView;
    }
    if (data.application) {
        application = data.application;
        setTopDialog(application);
    }
    if (data.renderer) {
        if (!data.renderer['__parse__']) {
            data.renderer['__parse__'] = function (result: any, namespace: string) {
                for (let i in result.data) {
                    if (result.hasOwnProperty(i) && result[i] && result[i].type == namespace) {
                        result[i] = this.__parse__(result[i]);
                    }
                }
                return this[result.renderer](result.template, result.data);
            }
        }
        define("rendererManager", data.renderer as any);
    }
}

let _topDialog: Dialog;

function setTopDialog(dialog: Dialog) {
    if (_topDialog != dialog) {
        if (_topDialog == application) {
            application.history.push(new openDialogCmd());
            application.history.go(-1);
        }
        _topDialog && _topDialog.view.removeClass("pt-topDialog");
        _topDialog = dialog;
        _topDialog.view.addClass("pt-topDialog");
    }
}
export function getTopDialog(): Dialog {
    return _topDialog;
}
export function bootstrap(application: Application) {
    application = application;
}
export { application, namespace, taskCounter };