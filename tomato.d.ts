export declare let namespace: string;
export declare const TaskCountEvent: {
    Added: string;
    Completed: string;
    Busy: string;
    Free: string;
};
export declare const ViewEvent: {
    Installed: string;
    Uninstalled: string;
    ChildAppended: string;
    ChildRemoved: string;
    Inited: string;
};
export declare enum PropState {
    Invalid = 0,
    Computing = 1,
    Updated = 2,
}
export declare const DialogEvent: {
    Focused: string;
    Blured: string;
    Closed: string;
};
export declare const CmdEvent: {
    ItemSuccess: string;
    ItemFailure: string;
    CmdSuccess: string;
    CmdFailure: string;
    Failure: string;
    Success: string;
    Complete: string;
    Overflow: string;
};
export declare enum SizeDependOn {
    children = 0,
    parent = 1,
}
export declare class PEvent {
    readonly name: string;
    readonly data: any;
    bubbling: boolean;
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
    constructor(name: string, data?: any, bubbling?: boolean);
    /**
     * 设置事件的原始派发者
     */
    setTarget(target: PDispatcher): void;
    /**
     * 设置事件的当前冒泡派发者
     */
    setCurrentTarget(target: PDispatcher): void;
}
export declare class PError extends Error {
    readonly name: string;
    readonly note: string;
    readonly data: {
        file: string;
        line: string;
        detail: any;
    };
    constructor(name: string, note?: string, data?: {
        file: string;
        line: string;
        detail: any;
    });
    getNamespace(): string;
}
export declare function invalidProp(vp: View): void;
/**
 *我们知道浏览器中的Dom对象可以派发事件，而对于一个JS对象却没有原生的事件机制，为此，tomato中的PDispatcher补充了这一点。tomato.PDispatcher是个事件派发的基类，它和所有继承于它的子类都可以实现简单的事件派发。
 */
export declare class PDispatcher {
    readonly parent: PDispatcher | undefined;
    /**
     * 事件构造函数
     * @param parent PDispatcher是有父子层级关系的，类似于Dom事件，当一个事件对象具有“bubbling冒泡”属性时，在其本身派发完事件之后，如果存在parent，则parent继续派发此事件
     */
    constructor(parent?: PDispatcher | undefined);
    /** 该对象所有侦听函数的集合 */
    protected readonly _handlers: {
        [key: string]: Array<(e: PEvent) => void>;
    };
    /**
     * 类似于Dom物件的addEventListener，添加ename事件的侦听函数
     * @param ename 要侦听的事件名
     * @param handler 事件回调函数
     */
    addListener(ename: string, handler: (e: PEvent) => void): this;
    /**
     * 类似于Dom物件的removeEventListener，移除该物件上侦听ename的指定handler
     * @param ename 要移除侦听的事件名，如果不传ename表示移除该物件上所有侦听函数
     * @param handler 要移除侦听的事件回调函数，如果不传handler表示移除该物件上ename的所有侦听函数
     */
    removeListener(ename?: string, handler?: (e: PEvent) => void): this;
    /**
     * 派发指定的事件
     * @param evt 要派发的事件
     */
    dispatch(evt: PEvent): this;
    /** parent属性为readonly的，要设置parent请使用此方法 */
    setParent(parent?: PDispatcher): this;
}
export declare enum TaskCounterState {
    Free = 0,
    Busy = 1,
}
export declare class TaskCounter extends PDispatcher {
    deferSecond: number;
    readonly list: Array<{
        promise: Promise<any>;
        note: string;
    }>;
    readonly state: TaskCounterState;
    private _timer;
    constructor(deferSecond: number);
    addItem(promise: Promise<any>, note?: string): Promise<any>;
    private _completeItem(promise);
}
export declare let taskCounter: TaskCounter;
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
export declare class View extends PDispatcher {
    readonly viewComponent: IViewComponent;
    readonly parent: View | undefined;
    readonly children: View[];
    readonly vid: string;
    readonly initialization: Promise<this> | null;
    protected _propState: {
        [prop: string]: PropState;
    };
    protected _propValue: {
        [prop: string]: any;
    };
    protected _widthDependOn: SizeDependOn | undefined;
    protected _heightDependOn: SizeDependOn | undefined;
    protected _eventToAction: {
        [evt: string]: Function;
    } | null;
    constructor(viewComponent: IViewComponent, parent?: View, vid?: string);
    protected _init(): Promise<this> | null;
    protected _inited(): void;
    protected _triggerEvent(evtName: string, data: any, target: {
        hit: object;
        target: object;
        type: string;
    }): boolean;
    protected _allowInstallTo(parent: View, options: any): boolean;
    protected _allowUninstallTo(parent: View, options: any): boolean;
    protected _allowAppendChild(child: View, options: any): boolean;
    protected _allowRemoveChild(child: View, options: any): boolean;
    protected _beforeInstallTo(parent: View, options: any): void;
    protected _beforeUninstallTo(parent: View, options: any): void;
    protected _afterInstallTo(parent: View, options: any): void;
    protected _afterUninstallTo(parent: View, options: any): void;
    protected _afterRemoveChild(member: View, options: any): void;
    protected _afterAppendChild(member: View, options: any): void;
    protected _beforeRemoveChild(member: View, options: any): void;
    protected _beforeAppendChild(member: View, options: any): void;
    protected _appendViewComponent(member: View, options: any): void;
    protected _removeViewComponent(member: View, options: any): void;
    protected _checkRemoveChild(member: View, options: any): boolean;
    removeChild(member: View, options?: any, checked?: boolean): boolean;
    protected _checkAppendChild(member: View, options: any): boolean;
    getDialog(): Dialog;
    appendChild(member: View, options?: any, checked?: boolean): boolean;
    replaceChild(newChild: View, oChild?: View, options?: any, checked?: boolean): boolean;
    destroy(): void;
    eachChildren(callback: (item: View) => void, andSelf?: boolean): void;
    invalidProp(prop: string): void;
    getProp(prop: string, ovalue?: boolean): any;
    protected _computeProp(prop: string): any;
    updateProp(): void;
}
export declare function syncGetView<T>(data: string | IViewComponent, parent?: View | undefined, inited?: boolean): T;
export declare function asyncGetView<T>(data: string | IViewComponent, parent?: View | undefined, inited?: boolean): Promise<T>;
export declare function getView(data: string | IViewComponent, parent?: View | undefined, inited?: boolean): View | Promise<View>;
export interface ILayerComponent extends IViewComponent {
    setZIndex(index: number): void;
}
export declare enum DialogState {
    Focused = 0,
    Blured = 1,
    Closed = 2,
}
export interface IDialogEffect {
    scale: string;
}
export interface IDialogPosition {
    left: string;
    right: string;
    center: string;
    top: string;
    bottom: string;
    middle: string;
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
export declare let DialogEffect: IDialogEffect;
export declare let DialogPosition: IDialogPosition;
export declare abstract class Dialog extends View {
    readonly history: History;
    readonly parent: Dialog | undefined;
    readonly viewComponent: ILayerComponent;
    readonly state: DialogState;
    readonly dialog: IComponent;
    readonly mask: IComponent;
    readonly body: IComponent;
    protected readonly _dialogList: Dialog[];
    private _zindex;
    readonly config: IDialogConfig;
    constructor(els: {
        viewComponent: ILayerComponent;
        dialog: IComponent;
        mask: IComponent;
        body: IComponent;
    }, config?: IDialogConfigOptions);
    protected _onHistoryOverflow(e: any): void;
    setConfig(config: IDialogConfigOptions): void;
    getZIndex(): number;
    getFocusedChild(): Dialog;
    eachDialogChildren(callback: (item: Dialog) => void, andSelf?: boolean): void;
    protected _afterConfigChange(oldConfig: IDialogConfig): void;
    protected _setZIndex(i: number): void;
    protected _countIndex(): void;
    protected _beforeFocus(): void;
    protected _afterFocus(): void;
    protected _beforeClose(): void;
    protected _afterClose(): void;
    protected _beforeBlur(): void;
    protected _afterBlur(): void;
    protected _allowFocus(closeAction?: boolean): boolean;
    protected _allowBlur(): boolean;
    protected _allowClose(): boolean;
    private _checkFocus();
    private _checkClose();
    focus(_checked?: boolean, _parentCall?: boolean): boolean;
    close(): boolean;
    private _blur();
    protected _setState(state: DialogState): void;
    onWindowResize(e: Event): void;
    protected _appendViewComponent(member: View, options: any): void;
    protected _removeViewComponent(member: View, options: any): void;
}
export declare class Application extends Dialog {
    initTime: number;
    constructor(rootUri: Cmd | null, els: {
        viewComponent: ILayerComponent;
        dialog: IComponent;
        mask: IComponent;
        body: IComponent;
    }, config?: IDialogConfigOptions);
    private _initHistory(initTime, rootUri);
    close(): boolean;
    focus(checked?: boolean): boolean;
}
export declare let application: Application;
export declare class Cmd extends PDispatcher {
    readonly url: string;
    readonly title: string;
    readonly isUri: boolean;
    constructor(url: string, title: string, isUri?: boolean);
    success(): void;
    failure(): void;
    execute(): void;
    redo(): void;
    undo(): void;
}
export declare class History extends PDispatcher {
    maxStep: number;
    private _list;
    private _cache;
    private _curItem?;
    private _cur;
    private _goto;
    private _first;
    private _last;
    constructor(maxStep?: number);
    getLength(): number;
    getCode(): number[];
    _syncHistory(change: {
        move?: number;
        moveTitle?: string;
        push?: {
            code: string;
            url: string;
            title: string;
            isUri: boolean;
        };
    }, callback: () => void): void;
    private _addHistoryItem(cmd);
    getCmdByCode(code: string): Cmd | undefined;
    go(n: number | string): void;
    push(cmd: Cmd | Cmd[]): void;
    added(cmd: Cmd): void;
    private _executeGoto();
    private _checkGoto(item);
    next(): void;
}
export declare function initHistory(): void;
export declare function setConfig(data: {
    namespace?: string;
    application?: Application;
    createViewComponent?: (data: any) => IViewComponent;
}): void;
export declare function getTopDialog(): Dialog;
