/*!
 * Copyright po-to.org All Rights Reserved.
 * https://github.com/po-to/
 * Licensed under the MIT license
 */
declare var require: (deps: string[] | string, succCallback?: (data: any) => void, failCallback?: (error: any) => void) => void;

function findInArray<T>(arr: T[], fun: (item: T) => boolean): T | undefined {
    for (let item of arr) {
        if (fun(item)) {
            return item;
        }
    }
    return undefined;
}
function findIndexInArray<T>(arr: T[], fun: (item: T) => boolean): number {
    for (let i = 0, k = arr.length; i < k; i++) {
        if (fun(arr[i])) {
            return i;
        }
    }
    return -1;
}
function assignObject<T>(target: T, ...args): T {
    for (let item of args) {
        for (let key in item) {
            if (item.hasOwnProperty(key)) {
                target[key] = item[key];
            }
        }
    }
    return target;
}

let autoID: number = 0;
export let namespace: string = 'po-to/tomato';

export const TaskCountEvent = {
    Added: "TaskCountEvent.Added",
    Completed: "TaskCountEvent.Completed",
    Busy: "TaskCountEvent.Busy",
    Free: "TaskCountEvent.Free"
}

export const ViewEvent = {
    Installed: "ViewEvent.Installed",
    Uninstalled: "ViewEvent.Uninstalled",
    ChildAppended: "ViewEvent.ChildAppended",
    ChildRemoved: "ViewEvent.ChildRemoved",
    Inited: "ViewEvent.Inited",
}

export enum PropState {
    Invalid,
    Computing,
    Updated,
}
// export const ViewTransaction = {
//     AllowInstall: "AllowInstall"
// }

export const DialogEvent = {
    Focused: "DialogEvent.Focused",
    Blured: "DialogEvent.Blured",
    Closed: "DialogEvent.Closed",
}

export const CmdEvent = {
    ItemSuccess: "CmdEvent.ItemSuccess",
    ItemFailure: "CmdEvent.ItemFailure",
    CmdSuccess: "CmdEvent.CmdSuccess",
    CmdFailure: "CmdEvent.CmdFailure",
    Failure: "CmdEvent.Failure",
    Success: "CmdEvent.Success",
    Complete: "CmdEvent.Complete",
    Overflow: "CmdEvent.Overflow"
}

export enum SizeDependOn { children, parent }

export class PEvent {
    /** 指向事件的原始派发者 */
    readonly target: PDispatcher;
    /** 如果事件具有冒泡属性，该属性指向事件的当前冒泡派发者 */
    readonly currentTarget: PDispatcher;

    /**
     * 事件构造函数
     * @param name 事件名称
     * @param data 事件要传递的数据
     * @param bubbling 事件是否向上冒泡
     */
    constructor(public readonly name: string, public readonly data?: any, public bubbling: boolean = false) {
    }
    /**
     * 设置事件的原始派发者
     */
    setTarget(target: PDispatcher){
        (this as any).target = target;
    }
    /**
     * 设置事件的当前冒泡派发者
     */
    setCurrentTarget(target: PDispatcher){
        (this as any).currentTarget = target;
    }
}
export class PError extends Error {
    constructor(public readonly name: string, public readonly note: string = "tomato.PError", public readonly data?: { file: string, line: string, detail: any }) {
        super(name + note);
    }

    getNamespace(): string {
        return namespace;
    }
}
function emptyObject<T>(obj: any): T {
    let arr: string[] = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            arr.push(key);
        }
    }
    arr.forEach(function (key) {
        delete obj[key];
    })
    return obj;
}

let _invalidLayoutTimer: number = 0;

export function invalidProp(vp: View) {
    if (!_invalidLayoutTimer) {
        _invalidLayoutTimer = setTimeout(function () {
            _invalidLayoutTimer = 0;
            application.eachChildren(function(vp){
                vp.updateProp();
            })
        }, 0) as any;
    }
}
/**
 *我们知道浏览器中的Dom对象可以派发事件，而对于一个JS对象却没有原生的事件机制，为此，tomato中的PDispatcher补充了这一点。tomato.PDispatcher是个事件派发的基类，它和所有继承于它的子类都可以实现简单的事件派发。
 */
export class PDispatcher {
    /**
     * 事件构造函数
     * @param parent PDispatcher是有父子层级关系的，类似于Dom事件，当一个事件对象具有“bubbling冒泡”属性时，在其本身派发完事件之后，如果存在parent，则parent继续派发此事件
     */
    constructor(public readonly parent?: PDispatcher | undefined) {
    }
    /** 该对象所有侦听函数的集合 */
    protected readonly _handlers: { [key: string]: Array<(e: PEvent) => void> } = {};
    /**
     * 类似于Dom物件的addEventListener，添加ename事件的侦听函数
     * @param ename 要侦听的事件名
     * @param handler 事件回调函数
     */
    addListener(ename: string, handler: (e: PEvent) => void): this {
        let dictionary = this._handlers[ename];
        if (!dictionary) {
            this._handlers[ename] = dictionary = [];
        }
        dictionary.push(handler);
        return this;
    }
    /**
     * 类似于Dom物件的removeEventListener，移除该物件上侦听ename的指定handler
     * @param ename 要移除侦听的事件名，如果不传ename表示移除该物件上所有侦听函数
     * @param handler 要移除侦听的事件回调函数，如果不传handler表示移除该物件上ename的所有侦听函数
     */
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
    /**
     * 派发指定的事件
     * @param evt 要派发的事件
     */
    dispatch(evt: PEvent): this {
        if (!evt.target) {
            evt.setTarget(this);
        }
        evt.setCurrentTarget(this);
        let dictionary = this._handlers[evt.name];
        if (dictionary) {
            for (let i = 0, k = dictionary.length; i < k; i++) {
                dictionary[i](evt);
            }
        }
        if (this.parent && evt.bubbling) {
            this.parent.dispatch(evt);
        }
        return this;
    }
    /** parent属性为readonly的，要设置parent请使用此方法 */
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
                        (this as any).state = TaskCounterState.Busy;
                        this.dispatch(new PEvent(TaskCountEvent.Busy));
                    }
                }, this.deferSecond * 1000);
            }
        }
        return promise;
    }
    private _completeItem(promise: Promise<any>): this {
        let i = findIndexInArray(this.list, (item) => item.promise === promise);
        if (i > -1) {
            this.list.splice(i, 1);
            this.dispatch(new PEvent(TaskCountEvent.Completed));
            if (this.list.length == 0) {
                if (this._timer) {
                    clearTimeout(this._timer);
                    this._timer = 0;
                }
                if (this.state == TaskCounterState.Busy) {
                    (this as any).state = TaskCounterState.Free;
                    this.dispatch(new PEvent(TaskCountEvent.Free));
                }
            }
        }
        return this;
    }
}
export let taskCounter: TaskCounter = new TaskCounter(3);

export interface IComponent {
    removeChild(component: IComponent): any;
    appendChild(component: IComponent): any;
    removeClass(className: string): any;
    addClass(className: string): any;
}

export interface IViewComponent extends IComponent {
    getVID(): string;
    getVCON(): string;
    setVID(id: string): void;
    getSUBS(): IViewComponent[];
}
function isViewComponent(data: any): data is IViewComponent {
    return (typeof data.getVID == "function") && (typeof data.getVCON == "function") && (typeof data.setVID == "function") && (typeof data.getSUBS == "function") && (typeof data.removeChild == "function") && (typeof data.appendChild == "function") && (typeof data.removeClass == "function") && (typeof data.addClass == "function")
}
let createViewComponent: (data: any) => IViewComponent = function (data: any): IViewComponent {
    return {} as IViewComponent;
};
export class View extends PDispatcher {
    public readonly parent: View | undefined;
    public readonly children: View[] = [];
    public readonly vid:string = "";
    public readonly initialization:Promise<this>|null;

    protected _propState:{[prop:string]:PropState} = {};
    protected _propValue:{[prop:string]:any} = {};
    protected _widthDependOn: SizeDependOn | undefined;
    protected _heightDependOn: SizeDependOn | undefined;
    protected _eventToAction:{[evt:string]:Function}|null = null;

    constructor(public readonly viewComponent: IViewComponent, parent?: View, vid?: string) {
        super(parent);
        if(vid){
            this.vid = vid.split("?")[0].replace(/\/+$/, "");
        }
        if (this.vid) {
            ViewStore[this.vid] = this;
        }
        this.initialization = this._init();
    }
    protected _init(): Promise<this> | null {
        let hasPromise:boolean = false;
        let list = this.viewComponent.getSUBS().map((component) => {
            let result = getAnyView(component,this,true);
            if (!hasPromise && result instanceof Promise) {
                hasPromise = true;
            }
            return result;
        });
        if (!list.length || !hasPromise) {
            (this.children as any).push(...list);
            this._inited();
            return null;
        } else {
            return Promise.all(list).then(
                (list) => {
                    (this.children as any).push(...list);
                    this._inited();
                    return this;
                }
            )
        }
    }
    protected _inited(){
        this.dispatch(new PEvent(ViewEvent.Inited));
    }
    protected _triggerEvent(evtName: string, data:any, target:{hit:object,target:object,type:string}):boolean{
        let mapping = this._eventToAction || this;
        let handler:Function = mapping[evtName];
        if(typeof(handler)=="function"){
            return handler.call(this, data, target)?true:false;
        }else{
            return true;
        }
    }
    
    protected _allowInstallTo(parent: View,  options:any): boolean {
        return true;
    }
    protected _allowUninstallTo(parent: View,  options:any): boolean {
        return true;
    }
    protected _allowAppendChild(child: View,  options:any): boolean {
        if(child instanceof Dialog){
             if(!(this instanceof Dialog)){
                return false;
            }else if(child.state != DialogState.Closed){
                return false;
            }
        }
        return true;
    }
    protected _allowRemoveChild(child: View,  options:any): boolean {
        return true;
    }
    protected _beforeInstallTo(parent: View,  options:any): void {
    }
    protected _beforeUninstallTo(parent: View,  options:any): void {
    }
    protected _afterInstallTo(parent: View,  options:any): void {
    }
    protected _afterUninstallTo(parent: View,  options:any): void {
    }
    protected _afterRemoveChild(member: View,  options:any): void {
    }
    protected _afterAppendChild(member: View,  options:any): void {
    }
    protected _beforeRemoveChild(member: View,  options:any): void {
    }
    protected _beforeAppendChild(member: View,  options:any): void {
    }
    protected _appendViewComponent(member: View,  options:any) {
        this.viewComponent.appendChild(member.viewComponent);
    }
    protected _removeViewComponent(member: View,  options:any) {
        this.viewComponent.removeChild(member.viewComponent);
    }

    protected _checkRemoveChild(member: View,  options:any): boolean {
        if (member.parent != this) { return true; }
        if (
            !member._allowUninstallTo(this,options) ||
            !this._allowRemoveChild(member,options)
        ) { return false; }
        return true;
    }
    removeChild(member: View, options?:any, checked?: boolean): boolean {
        if (member.parent != this) { return false; }
        if (!checked && !this._checkRemoveChild(member,options)) {
            return false;
        }
        this._beforeRemoveChild(member,options);
        member._beforeUninstallTo(this,options);
        this.children.splice(this.children.indexOf(member), 1);
        this._removeViewComponent(member,options);
        member.setParent(undefined);
        this._afterRemoveChild(member,options);
        member._afterUninstallTo(this,options);
        this.dispatch(new PEvent(ViewEvent.ChildRemoved,options));
        member.dispatch(new PEvent(ViewEvent.Uninstalled,options));
        return true;
    }
    protected _checkAppendChild(member: View,options:any): boolean {
        if (member.parent == this) { return true; }
        if (
            !member._allowInstallTo(this,options) ||
            !this._allowAppendChild(member,options) ||
            (member.parent && (!member._allowUninstallTo(this,options) || !member.parent._allowRemoveChild(member,options)))
        ) { return false; }
        return true;
    }
    getDialog(): Dialog {
        let parent: View | undefined = this.parent;
        while (parent) {
            if (parent instanceof Dialog) {
                return parent;
            }
            parent = parent.parent;
        }
        return application;
    }
    appendChild(member: View, options?:any, checked?: boolean): boolean {
        if (member.parent == this) { return false; }
        if (!checked && !this._checkAppendChild(member,options)) {
            return false;
        }
        if (member.parent) { 
            member.parent.removeChild(member, options ,true) 
        }
        this._beforeAppendChild(member,options);
        member._beforeInstallTo(this,options);
        member.setParent(this);
        this.children.push(member);
        this._appendViewComponent(member,options);
        this._afterAppendChild(member,options);
        member._afterInstallTo(this,options);
        this.dispatch(new PEvent(ViewEvent.ChildAppended,options));
        member.dispatch(new PEvent(ViewEvent.Installed,options));
        return true;
    }
    replaceChild(newChild: View, oChild?:View, options?:any, checked?: boolean): boolean {
        if (newChild.parent == this) { return false; }
        if (!checked && !this._checkAppendChild(newChild,options)) {
            return false;
        }
        if (oChild && oChild.parent == this) { 
            if (!checked && !this._checkRemoveChild(oChild,options)) {
                return false;
            }
            this.removeChild(oChild, options, true);
        }
        return this.appendChild(newChild, options, true);
    }
    destroy(): void {
        if (this.vid) {
            delete ViewStore[this.vid];
        }
    }
    eachChildren(callback: (item: View) => void, andSelf?: boolean) {
        if (andSelf) {
            callback(this);
        }
        if (this.children.length) {
            this.children.forEach(function (child) {
                child.eachChildren(callback, true);
            });
        }
    }
    invalidProp(prop:string){
        if (this._propState[prop] == PropState.Invalid) {
            return;
        }
        this._propState[prop] = PropState.Invalid;
        invalidProp(this);
    }
    getProp(prop:string, ovalue?:boolean):any{
        let value = this._propState[prop];
        if(value==PropState.Invalid){
            if(ovalue){
                return this._propValue[prop];
            }else{
                throw this.vid+'.'+prop+' is invalid';
            }
        }else if(value==PropState.Computing){
            if(ovalue){
                return this._propValue[prop];
            }else{
                throw this.vid+'.'+prop+' is loop dependency';
            }
        }else if(value==PropState.Updated){
            this._propState[prop] = PropState.Computing;
            this._propValue[prop]  = this._computeProp(prop);
            delete this._propState[prop];
            return this._propValue[prop];
        }else{
            return this._propValue[prop];
        }
    }
    protected _computeProp(prop:string):any{
        return '';
    }
    public updateProp() {
        for(let key in this._propState){
            if(this._propState[key] == PropState.Invalid){
                this._propState[key] = PropState.Updated;
            }
        }
    }
    // protected _resizeX(target: View = this) {
    //     if (this._internalSize.x == LayoutState.Invalid) {
    //         return;
    //     }
    //     if (target == this) {
    //         invalidLayout(this);
    //         this._internalSize.x = LayoutState.Invalid;
    //         this.parent && this.parent._resizeX(this);
    //     } else if (target == this.parent) {

    //     } else if (target.parent == this) {
    //         if (this._widthDependOn == SizeDependOn.children) {
    //             this._resizeWidth(target);
    //         }
    //     }
    // }
    // protected _resizeY(target: View = this) {
    //     if (this._internalSize.y == LayoutState.Invalid) {
    //         return;
    //     }
    //     if (target == this) {
    //         invalidLayout(this);
    //         this._internalSize.y = LayoutState.Invalid;
    //         this.parent && this.parent._resizeY(this);
    //     } else if (target == this.parent) {

    //     } else if (target.parent == this) {
    //         if (this._heightDependOn == SizeDependOn.children) {
    //             this._resizeHeight(target);
    //         }
    //     }
    // }
    // protected _resizeWidth(target: View = this) {
    //     if (this._internalSize.width == LayoutState.Invalid) {
    //         return;
    //     }
    //     if (target == this) {
    //         invalidLayout(this);
    //         this._internalSize.width = LayoutState.Invalid;
    //         this.parent && this.parent._resizeWidth(this);
    //         this.children.length && this.children.forEach(function (child) {
    //             child._resizeWidth(this);
    //         })
    //     } else if (target == this.parent) {
    //         if (this._widthDependOn = SizeDependOn.parent) {
    //             invalidLayout(this);
    //             this._internalSize.width = LayoutState.Invalid;
    //             this.children.length && this.children.forEach(function (child) {
    //                 child._resizeWidth(this);
    //             })
    //         }
    //     } else if (target.parent == this) {
    //         if (this._widthDependOn == SizeDependOn.children) {
    //             invalidLayout(this);
    //             this._internalSize.width = LayoutState.Invalid;
    //             this.parent && this.parent._resizeWidth(this);
    //         }
    //     }
    // }
    // protected _resizeHeight(target: View = this) {
    //     if (this._internalSize.height == LayoutState.Invalid) {
    //         return;
    //     }
    //     if (target == this) {
    //         invalidLayout(this);
    //         this._internalSize.height = LayoutState.Invalid;
    //         this.parent && this.parent._resizeHeight(this);
    //         this.children.length && this.children.forEach(function (child) {
    //             child._resizeHeight(this);
    //         })
    //     } else if (target == this.parent) {
    //         if (this._widthDependOn = SizeDependOn.parent) {
    //             invalidLayout(this);
    //             this._internalSize.height = LayoutState.Invalid;
    //             this.children.length && this.children.forEach(function (child) {
    //                 child._resizeHeight(this);
    //             })
    //         }
    //     } else if (target.parent == this) {
    //         if (this._heightDependOn == SizeDependOn.children) {
    //             invalidLayout(this);
    //             this._internalSize.height = LayoutState.Invalid;
    //             this.parent && this.parent._resizeHeight(this);
    //         }
    //     }
    // }
    // protected _computeX(): number {
    //     return 0;
    // }
    // protected _computeY(): number {
    //     return 0;
    // }
    // protected _computeWidth(): number {
    //     return 0;
    // }
    // protected _computeHeight(): number {
    //     return 0;
    // }
    // public getX(): number {
    //     let size = this._internalSize;
    //     if(size.x==LayoutState.Computing){
    //         throw this.vid+'.x is loop dependency';
    //     }else if(size.x==LayoutState.Invalid || size.x==LayoutState.Updated){
    //         size.x = LayoutState.Computing;
    //         size.x = this._computeX();
    //     }
    //     return size.y as number;
    // }
    // public getY(original:boolean=false): number {
    //     let size = this._internalSize;
    //     if(size.y==LayoutState.Computing){
    //         throw this.vid+'.y is loop dependency';
    //     }else if(size.y==LayoutState.Invalid || size.y==LayoutState.Updated){
    //         size.y = LayoutState.Computing;
    //         size.y = this._computeY();
    //     }
    //     return size.y as number;
    // }
    // public getWidth(original:boolean=false): number {
    //     let size = this._internalSize;
    //     if(size.width==LayoutState.Computing){
    //         throw this.vid+'.width is loop dependency';
    //     }else if(size.width==LayoutState.Invalid || size.width==LayoutState.Updated){
    //         size.width = LayoutState.Computing;
    //         size.width = this._computeWidth();
    //     }
    //     return size.width as number;
    // }
    // public getHeight(original:boolean=false): number {
    //     let size = this._internalSize;
    //     if(size.height==LayoutState.Computing){
    //         throw this.vid+'.height is loop dependency';
    //     }else if(size.height==LayoutState.Invalid || size.height==LayoutState.Updated){
    //         size.height = LayoutState.Computing;
    //         size.height = this._computeHeight();
    //     }
    //     return size.height as number;
    // }
    
}

let ViewStore: { [key: string]: View | Promise<View> } = {}

function syncRequire(path: string): any | Promise<any> {
    try {
        return require(path);
    } catch (e) {
        return new Promise(function (resolve, reject) {
            require([path], function (data) {
                resolve(data);
            }, function (error) {
                reject(error);
            });
        })
    }
}

let getAnyView = (function (ViewStore) {

    function buildViewComponent(data: any): IViewComponent {
        return createViewComponent(data);
    }
    function initView(con: Function, component: IViewComponent, url: string, parent:View|undefined,inited:boolean): View | Promise<View> {
        let vp: View = new (con as any)(component, parent, url);
        if(inited){
            if(vp.initialization){
                return vp.initialization;
            }else{
                return vp;
            }
        }else{
            return vp;
        }
    }
    function buildView(component: IViewComponent, url: string, parent:View|undefined,inited:boolean): View | Promise<View> {
        if (!isViewComponent(component)) {
            console.log(component);
            throw "is not a IViewComponent";
        }
        let conPath = component.getVCON();
        if (conPath) {
            let result = syncRequire(conPath);
            if (result instanceof Promise) {
                return result.then(function (data) {
                    return initView(data, component, url,parent,inited);
                })
            } else {
                return initView(result, component, url,parent,inited);
            }
        } else {
            return initView(View, component, url,parent,inited);
        }
    }

    function returnResult(component: IViewComponent | null, url: string, parent:View|undefined,inited:boolean): View | Promise<View> {
        if (component) {
            return buildView(component, url, parent, inited);
        } else if (url) {
            let result = syncRequire(url);
            if (result instanceof Promise) {
                return result.then(function (data) {
                    return buildView(buildViewComponent(data), url, parent, inited);
                })
            } else {
                return buildView(buildViewComponent(result), url, parent, inited);
            }
        } else {
            throw 'not found component and url !'
        }
    }
    return function (data: string | IViewComponent, parent:View|undefined = undefined, inited:boolean=true): View | Promise<View> {
        let url: string;
        let id: string;
        let component: IViewComponent | null;
        if (typeof data != "string") {
            component = data;
            id = data.getVID();
        } else {
            component = null;
            id = data;
        }
        url = id;
        id = id.split("?")[0].replace(/\/+$/, "");
        let cacheData: Promise<View> | View | null = ViewStore[id];
        if (cacheData instanceof View) {
            return cacheData;
        } else if (cacheData instanceof Promise) {
            return cacheData;
        } else {
            let result = returnResult(component, url, parent, inited);
            if (result instanceof Promise) {
                ViewStore[id] = result;
                result['catch'](function (error) {
                    delete ViewStore[id];
                    console.log(url + ":" + error);
                })
                taskCounter.addItem(result, 'load:' + url);
            }
            return result;
        }
    }

})(ViewStore)

export function syncGetView<T>(data: string | IViewComponent, parent:View|undefined = undefined, inited:boolean=true): T {
    return getAnyView(data, parent, inited) as any;
}
export function asyncGetView<T>(data: string | IViewComponent, parent:View|undefined = undefined, inited:boolean=true): Promise<T> {
    let result = getAnyView(data, parent, inited);
    if (result instanceof Promise) {
        return result as any;
    } else {
        return Promise.resolve(result as any);
    }
}
export function getView(data: string | IViewComponent, parent:View|undefined = undefined, inited:boolean=true): View | Promise<View> {
    return getAnyView(data, parent, inited);
}

export interface ILayerComponent extends IViewComponent {
    setZIndex(index: number): void;
}

export enum DialogState { Focused, Blured, Closed };

export interface IDialogEffect{
    scale : string;
}
export interface IDialogPosition{
    left : string,
    right : string,
    center : string,
    top : string,
    bottom : string,
    middle : string,
}
export interface IDialogConfig {
    className: string;
    masked: boolean;
    fixedBackground: boolean;
    x: string;
    y: string;
    width: string;
    height: string;
    offsetX: string;
    offsetY: string;
    effect: string;
}
export interface IDialogConfigOptions {
    className?: string;
    masked?: boolean;
    fixedBackground?: boolean;
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    offsetX?: string;
    offsetY?: string;
    effect?: string;
}
export let  DialogEffect:IDialogEffect = {
    scale : "scale"
}
export let  DialogPosition:IDialogPosition = {
    left : "left",
    right : "right",
    center : "center",
    top : "top",
    bottom : "bottom",
    middle : "middle",
}
let DialogConfig:IDialogConfig = {
    className: '',
    masked: false,
    fixedBackground: true,
    x: DialogPosition.center,
    y: DialogPosition.middle,
    width: "50%",
    height: "50%",
    offsetX: "",
    offsetY: "",
    effect: DialogEffect.scale
}
export abstract class Dialog extends View {
    public readonly history = new History();
    public readonly parent: Dialog | undefined;
    public readonly viewComponent: ILayerComponent;
    public readonly state: DialogState = DialogState.Closed;
    public readonly dialog: IComponent;
    public readonly mask: IComponent;
    public readonly body: IComponent;
    protected readonly _dialogList: Dialog[] = [];
    private _zindex: number = -1;


    public readonly config: IDialogConfig = DialogConfig;

    constructor(els: { viewComponent: ILayerComponent, dialog: IComponent, mask: IComponent, body: IComponent }, config?: IDialogConfigOptions) {
        super(els.viewComponent, undefined);
        this.dialog = els.dialog;
        this.mask = els.mask;
        this.body = els.body;

        this.viewComponent.addClass("pt-layer pt-" + DialogState[this.state]);
        this.dialog.addClass("pt-dialog");
        this.mask.addClass("pt-mask");
        this.body.addClass("pt-body");

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
    setConfig(config: IDialogConfigOptions) {
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
    eachDialogChildren(callback: (item: Dialog) => void, andSelf?: boolean) {
        if (andSelf) {
            callback(this);
        }
        if (this._dialogList.length) {
            this._dialogList.forEach(function (child) {
                child.eachDialogChildren(callback, true);
            });
        }
    }
    protected _afterConfigChange(oldConfig: IDialogConfig) {
        this.dialog.removeClass(oldConfig.className);
        this.mask.removeClass(oldConfig.className);
        this.viewComponent.removeClass(["pt-"+oldConfig.effect,(oldConfig.masked?"pt-masked":"")].join(" "));
        let config = this.config;
        this.dialog.addClass(config.className);
        this.mask.addClass(config.className);
        this.viewComponent.addClass(["pt-"+config.effect,(config.masked?"pt-masked":"")].join(" "));
    }
    protected _setZIndex(i: number): void {
        this._zindex = i;
        this.viewComponent.setZIndex(i);
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
            if (dialog && !dialog._allowFocus(true)) {
                return false;
            }
        }
        return true;
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
                
            }
            this._afterFocus();
            if (!_parentCall) {
                setTopDialog(this);
            }
            this.dispatch(new PEvent(DialogEvent.Focused));
            this.children.forEach(function(child){
               if(!(child instanceof Dialog)){
                    child.eachChildren(function (child) {
                        child.dispatch(new PEvent(DialogEvent.Focused));
                    }, true);
               }
            });
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
        this._afterClose();
        this.dispatch(new PEvent(DialogEvent.Closed));
        this.children.forEach(function(child){
            if(!(child instanceof Dialog)){
                child.eachChildren(function (child) {
                    child.dispatch(new PEvent(DialogEvent.Closed));
                }, true);
            }
        });
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
        this.children.forEach(function(child){
            if(!(child instanceof Dialog)){
                child.eachChildren(function (child) {
                    child.dispatch(new PEvent(DialogEvent.Blured));
                }, true);
            }
        });
    }
    protected _setState(state: DialogState): void {
        this.viewComponent.removeClass("pt-" + DialogState[this.state]);
        (this as any).state = state;
        this.viewComponent.addClass("pt-" + DialogState[this.state]);
    }
    
    onWindowResize(e:Event){

    }
    protected _appendViewComponent(member: View,options:any): void {
        if (member instanceof Dialog) {
            this.viewComponent.appendChild(member.viewComponent);
        } else {
            this.body.appendChild(member.viewComponent);
        }
    }
    protected _removeViewComponent(member: View,options:any): void {
        if (member instanceof Dialog) {
            this.viewComponent.removeChild(member.viewComponent);
        } else {
            this.body.removeChild(member.viewComponent);
        }
    }
    
}



export class Application extends Dialog {

    public initTime = Date.now();
    constructor(rootUri: Cmd | null, els: { viewComponent: ILayerComponent, dialog: IComponent, mask: IComponent, body: IComponent }, config?: IDialogConfigOptions) {
        super(els, config);
        this.viewComponent.removeClass("pt-layer").addClass("pt-application");
        this._setZIndex(0);
        this._setState(DialogState.Focused);
        this.viewComponent.addClass("pt-topDialog");
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
        /*
            浏览器历史记录和tomato历史记录是解耦独立运行的，tomato历史记录是主动执行者，执行成功后会通过_syncHistory同步浏览器历史记录。
            当用户主动操作浏览器历史记录时，浏览器历史记录将转换为tomato历史记录，并且立即恢复到操作前，然后执行操作tomato历史记录，再由tomato历史记录通过_syncHistory同步
         */
        let supportState = window.history.pushState ? true : false;
        let _trigger: boolean | (() => void);
        let history = this.history;
        let skipHashEvent:boolean;

        function pushState(code: string, title: string, url: string, isUri: boolean) {
            if(supportState){
                 window.history.pushState(code, title, isUri ? url : "#" + encodeURI(url));
            }else{
                skipHashEvent = true;
                window.location.href = "#"+namespace+"@"+code+"@"+encodeURI(url);
            }
        }
        function addState(code: string, title?: string, url?: string) {
            if(supportState){
                window.history.replaceState(initTime + "." + code, title || document.title, url || window.location.href);
            }else{
                skipHashEvent = true;
                window.location.replace("#"+namespace+"@"+initTime + "." + code+"@"+encodeURI(url || window.location.href));
            }
        }
        history._syncHistory = function (change: { move?: number, moveTitle?: string, push?: { code: string, url: string, title: string, isUri: boolean } }, callback: () => void) {
            //历史记录是独立的，通过此方法关联到浏览器的历史记录
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
            if (flag == initTime) {//如果该命令是本页种下的
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
                                //恢复到操作前完毕后才开始真正执行history
                                getTopDialog().history.go(-n);
                            }, 1);
                        };
                        window.history.go(n);//为了恢复到操作前
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
        } else {
            bindEventListener(window, 'hashchange', function (e) {
                if(skipHashEvent){
                    skipHashEvent = false;
                }else{
                    let arr = window.location.hash.split("@");
                    if(arr[0] == "#"+namespace && arr[1] && arr[2]){
                        handlerChange({state:arr[1]});
                    }else{
                        handlerChange({state:""});
                    }
                }
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

export let application: Application = {} as any;

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
                this.dispatch(new PEvent(CmdEvent.CmdSuccess));
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
            this.dispatch(new PEvent(CmdEvent.CmdFailure));
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
    public _syncHistory(change: { move?: number, moveTitle?: string, push?: { code: string, url: string, title: string, isUri: boolean } }, callback: () => void) {
        //通过应用类重写此方法，可以同步应用类的历史记录堆栈
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
        let item = findInArray(this._list, function (item) {
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
                this.dispatch(new PEvent(CmdEvent.Complete));
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

let resizeTimer:any;
bindEventListener(window, 'resize', function (e) {
    if(!resizeTimer){
        resizeTimer = setTimeout(function(){
            resizeTimer = null;
            application.eachDialogChildren(function(item){
                item.onWindowResize(e);
            },true)
        },100);
    }
})

export function setConfig(data: {
    namespace?: string,
    application?: Application,
    createViewComponent?: (data: any) => IViewComponent;
}): void {
    if (data.namespace) {
        namespace = data.namespace;
    }
    if (data.createViewComponent) {
        createViewComponent = data.createViewComponent;
    }
    if (data.application) {
        application = data.application;
        setTopDialog(application);
    }
}

let _topDialog: Dialog;

function setTopDialog(dialog: Dialog) {
    if (_topDialog != dialog) {
        if (_topDialog == application) {
            application.history.push(new openDialogCmd());
            application.history.go(-1);
        }
        _topDialog && _topDialog.viewComponent.removeClass("pt-topDialog");
        _topDialog = dialog;
        _topDialog.viewComponent.addClass("pt-topDialog");
    }
}
export function getTopDialog(): Dialog {
    return _topDialog;
}