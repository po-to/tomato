declare var require: (deps:string[],succCallback:(data:any)=>void,failCallback:(error:any)=>void)=>void;
declare var define : (id:string, mod:any)=>void;

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

export class PEvent {
    readonly target: PDispatcher;
    constructor(public readonly name: string, public readonly data?: any, public bubbling: boolean = false) {
    }
    _setTarget(target: PDispatcher): this {
        (this as any).target = target;
        return this;
    }
}
export class PError {
    constructor(public readonly name: string, public readonly note: string = "tomato.PError", public readonly data?: { file: string, line: string, detail: any }) {

    }
    getNamespace(): string {
        return namespace;
    }
}
function emptyObject<T>(obj: any): T {
    Object.keys(obj).forEach(function (key) {
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
            e._setTarget(this);
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
    addItem(promise: Promise<any>, note: string): this {
        if (!this.list.find((item) => item.promise === promise)) {
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
        return this;
    }
    private _completeItem(promise: Promise<any>): this {
        let i = this.list.findIndex((item) => item.promise === promise);
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

export interface VPView extends View{
    getVPID(): string|string[];
    getVPCON(id?:string): string;
    getSUBS(): VPView[];
}

let createVPView:(html:string)=>VPView = function(html:string):VPView{
    return {} as VPView;
};

export class VPresenter extends PDispatcher {
    public readonly parent: VPresenter | undefined;
    constructor(public readonly view: VPView, parent?: VPresenter, public readonly vpid?:string) {
        super(parent);
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
    protected _installTo(parent: VPresenter): void {
        super.setParent(parent);
        this.dispatch(new PEvent(VPresenterEvent.Installed));
    }

    protected _uninstallTo(parent: VPresenter): void {
        super.setParent(undefined);
        this.dispatch(new PEvent(VPresenterEvent.Uninstalled));
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
        member._uninstallTo(this);
        this._afterRemoveChild(member);
        this.dispatch(new PEvent(VPresenterEvent.ChildRemoved));
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
    getParentDialog():Dialog{
        let parent:VPresenter|undefined = this.parent;
        while(parent){
            if(parent instanceof Dialog){
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
        member._installTo(this);
        this._afterAppendChild(member);
        this.dispatch(new PEvent(VPresenterEvent.ChildAppended));
        return true;
    }
    _update(): Promise<this> {
        return Promise.resolve(this);
    }
    destroy():void{
        if(this.vpid){
            delete VPresenterStore[this.vpid];
        }
    }
}

let VPresenterStore: { [key: string]: VPresenter | Promise<VPresenter> } = {}

export function getVPresenter<T>(data: string | VPView, successCallback?: (vp: T) => void, failueCallback?: (error: Error) => void): T | Promise<T> {
    let id: string;
    let view:VPView|null;
    if (typeof data != "string") {
        view = data;
        let ids = data.getVPID();
        id = typeof(ids)=="string"?ids:ids[0];
    } else {
        view = null;
        id = data;
    }
    let cacheData: Promise<T> | T | null = VPresenterStore[id] as any;
    if (cacheData instanceof VPresenter) {
        return cacheData as T;
    } else if (cacheData instanceof Promise) {
        let success: (vp: any) => void = successCallback || function (VP: any) { };
        let failue: (error: Error) => void = failueCallback || function (error: Error) { };
        cacheData.then(success, failue);
        return cacheData;
    }
    let onError = function(error:Error,reject:(error:Error)=>void){
        delete VPresenterStore[id];
        failueCallback && failueCallback(error);
        reject(error);
    }
    let onSuccess = function(con:Function,dom:VPView,resolve:(vp:T)=>void,reject:(error:Error)=>void){
        let vp:VPresenter|null = null;
        try{
            vp = new (con as any)(dom,undefined,id);
        }catch(e){
            onError(e,reject);
        }
        if(vp){
            Promise.all(dom.getSUBS().map(function(dom){
                return getVPresenter(dom);
            })).then(
                function(){
                    successCallback && successCallback(vp as any);
                    resolve(vp as any);
                },
                function(e){
                    onError(e,reject);
                }
            )
        }
    }
    
    let promise = new Promise<T>(function (resolve, reject) {
        let init = function(dom:VPView){
            let conPath = dom.getVPCON(id);
            if(conPath){
                require([conPath], function (con: Function) {
                    onSuccess(con,dom,resolve,reject);
                },function(err){
                    onError(err,reject);
                })
            }else{
                onSuccess(VPresenter,dom,resolve,reject);
            }
        }
        if(view){
            init(view);
        }else{
            require([id], function (obj: string | VPView) {
                if (typeof obj == "string") {
                    view = createVPView(obj);
                }else{
                    view = obj;
                }
                init(view);
            }, function (err) {
                onError(err,reject);
            })
        }
        
    });
    VPresenterStore[id] = promise as any;
    return promise;
}

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
    }
    setConfig(config: DialogConfigOptions) {
        let oldConfig = this.config;
        (this as any).config = Object.assign({}, this.config, config);
        this._afterConfigChange(oldConfig);
    }
    getZIndex(): number {
        return this._zindex;
    }
    getFocusedChild():Dialog{
        let list = this._dialogList;
        let dialog:Dialog = this;
        while(list.length){
            dialog = list[list.length-1];
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
        if (this == application) { return true; }
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
    focus(checked?: boolean): boolean {
        /* 三种调用场景：1.由close()上文调用；2.当前为closed状态; 3.当前为blured状态 */
        //if (this.state == DialogState.Focused) { return false; }
        if (!checked && !this._checkFocus()) { return false; }
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
            parentDialog.focus();
        }
        if (this.state != DialogState.Focused) {
            blurDialog && blurDialog._blur();
            let curState = this.state;
            this._setState(DialogState.Focused);
            if (curState == DialogState.Closed) {
                this.refreshSize();
                this.refreshPosition();
                this.refreshLayout();
            }
            this._afterFocus();
            this.dispatch(new PEvent(DialogEvent.Focused));
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
        this.refreshSize();
        this.refreshPosition();
        this.refreshLayout();
        this._afterClose();
        this.dispatch(new PEvent(DialogEvent.Closed));
        focusDialog && focusDialog.focus(true);
        return true;
    }

    private _blur(): void {
        if (this.state == DialogState.Blured) { return; }
        this._beforeBlur();
        this._setState(DialogState.Blured);
        this._afterBlur();
        this.dispatch(new PEvent(DialogEvent.Blured));
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
            let oldContent = this.content;
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
            if (this.body) {
                this.body.appendChild(member.view)
            } else {
                this.dialog.appendChild(member.view)
            }
            if (member instanceof WholeVPresenter) {
                let view = member.getHeader();
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
            if (this.body) {
                this.body.removeChild(member.view)
            } else {
                this.dialog.removeChild(member.view)
            }
            if (member instanceof WholeVPresenter) {
                let view = member.getHeader();
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
    }
    refreshSize(): void {

    }
    refreshPosition(): void {

    }
    refreshLayout(): void {

    }
}

export class WholeVPresenter extends VPresenter {
    getHeader(): View | null { return null; }
    getFooter(): View | null { return null; }
    getAside(): View | null { return null; }
}

export class Application extends Dialog {

    constructor(els: { view: LayerView, dialog: View, mask: View, body?: View, header?: View, footer?: View, aside?: View }, config?: DialogConfigOptions) {
        super(els, config);
        this._setZIndex(0);
        this._setState(DialogState.Focused);
        taskCounter.addListener(TaskCountEvent.Added, e => {
            this.mask.removeClass("pt-hide").addClass("pt-show");
        }).addListener(TaskCountEvent.Busy, e => {
            this.mask.addClass("pt-busy");
        }).addListener(TaskCountEvent.Free, e => {
            this.mask.removeClass("pt-show pt-busy").addClass("pt-hide");
        })
    }
    close(): boolean {
        return false;
    }
    focus(checked?: boolean): boolean {
        return false;
    }

}

let application: Application = {} as any;

export function setConfig(data: {
    namespace?: string,
    renderer?: { [key: string]: (tpl: string, data: any) => void },
    createVPView?: (html: string) => VPView;
}): void {
    if (data.namespace) {
        namespace = data.namespace;
    }
    if (data.createVPView) {
        createVPView = data.createVPView;
    }
    if (data.renderer) {
        if(!data.renderer['__parse__']){
            data.renderer['__parse__'] = function (result:any,namespace:string){
                for(let i in result.data){
                    if(result.hasOwnProperty(i) && result[i] && result[i].type==namespace){
                        result[i] = this.__parse__(result[i]);
                    }
                }
                return this[result.renderer](result.template, result.data);
            }
        }
        define("rendererManager", data.renderer as any);
    }
}

export function getFocusedChild():Dialog{
    return application.getFocusedChild();
}
export function bootstrap(application: Application){
    application = application;
}
export { application, namespace, taskCounter };