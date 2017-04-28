declare let namespace: string;
export declare const TaskCountEvent: {
    Added: string;
    Completed: string;
    Busy: string;
    Free: string;
};
export declare const VPresenterEvent: {
    Installed: string;
    Uninstalled: string;
    ChildAppended: string;
    ChildRemoved: string;
    Resized: string;
};
export declare enum PropState {
    Invalid = 0,
    Computing = 1,
    Updated = 2,
}
export declare const VPresenterTransaction: {
    AllowInstall: string;
};
export declare const DialogEvent: {
    Focused: string;
    Blured: string;
    Closed: string;
};
export declare const CmdEvent: {
    ItemSuccess: string;
    ItemFailure: string;
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
    readonly target: PDispatcher;
    readonly currentTarget: PDispatcher;
    constructor(name: string, data?: any, bubbling?: boolean);
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
export declare function invalidProp(vp: VPresenter): void;
export declare class PDispatcher {
    readonly parent: PDispatcher | undefined;
    constructor(parent?: PDispatcher | undefined);
    protected readonly _handlers: {
        [key: string]: Array<(e: PEvent) => void>;
    };
    addListener(ename: string, handler: (e: PEvent) => void): this;
    removeListener(ename?: string, handler?: (e: PEvent) => void): this;
    dispatch(e: PEvent): this;
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
declare let taskCounter: TaskCounter;
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
export declare class VPresenter extends PDispatcher {
    readonly view: VPView;
    readonly parent: VPresenter | undefined;
    readonly children: VPresenter[];
    readonly vpid: string;
    readonly initialization: Promise<this> | null;
    protected _propState: {
        [prop: string]: PropState;
    };
    protected _propValue: {
        [prop: string]: any;
    };
    protected _widthDependOn: SizeDependOn | undefined;
    protected _heightDependOn: SizeDependOn | undefined;
    constructor(view: VPView, parent?: VPresenter, vpid?: string);
    protected _init(): Promise<this> | null;
    protected _allowInstallTo(parent: VPresenter): boolean;
    protected _allowUninstallTo(parent: VPresenter): boolean;
    protected _allowAppendChild(child: VPresenter): boolean;
    protected _allowRemoveChild(child: VPresenter): boolean;
    protected _beforeInstallTo(parent: VPresenter): void;
    protected _beforeUninstallTo(parent: VPresenter): void;
    protected _afterInstallTo(parent: VPresenter): void;
    protected _afterUninstallTo(parent: VPresenter): void;
    protected _afterRemoveChild(member: VPresenter): void;
    protected _afterAppendChild(member: VPresenter): void;
    protected _beforeRemoveChild(member: VPresenter): void;
    protected _beforeAppendChild(member: VPresenter): void;
    protected _appendView(member: VPresenter): void;
    protected _removeView(member: VPresenter): void;
    protected _checkRemoveChild(member: VPresenter): boolean;
    removeChild(member: VPresenter, checked?: boolean): boolean;
    protected _checkAppendChild(member: VPresenter): boolean;
    getDialog(): Dialog;
    appendChild(member: VPresenter, checked?: boolean): boolean;
    destroy(): void;
    eachChildren(callback: (item: VPresenter) => void, andSelf?: boolean): void;
    invalidProp(prop: string): void;
    getProp(prop: string, ovalue?: boolean): any;
    protected _computeProp(prop: string): any;
    updateProp(): void;
}
export declare let getVPresenter: (data: string | VPView, parent?: VPresenter | undefined, inited?: boolean) => VPresenter | Promise<VPresenter>;
export declare function syncGetVPresenter<T>(data: string | VPView, parent?: VPresenter | undefined, inited?: boolean): T;
export declare function asyncGetVPresenter<T>(data: string | VPView, parent?: VPresenter | undefined, inited?: boolean): Promise<T>;
export interface ILayerView extends VPView {
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
export declare abstract class Dialog extends VPresenter {
    readonly history: History;
    readonly parent: Dialog | undefined;
    readonly view: ILayerView;
    readonly state: DialogState;
    readonly content: VPresenter | null;
    readonly dialog: View;
    readonly mask: View;
    readonly body: View;
    protected readonly _dialogList: Dialog[];
    private _zindex;
    readonly config: IDialogConfig;
    constructor(els: {
        view: ILayerView;
        dialog: View;
        mask: View;
        body: View;
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
    protected _allowAppendChild(member: VPresenter): boolean;
    onWindowResize(e: Event): void;
    appendChild(child: VPresenter): boolean;
    protected _appendView(member: VPresenter): void;
    protected _removeView(member: VPresenter): void;
}
export declare class Application extends Dialog {
    initTime: number;
    constructor(rootUri: Cmd | null, els: {
        view: ILayerView;
        dialog: View;
        mask: View;
        body: View;
    }, config?: IDialogConfigOptions);
    private _initHistory(initTime, rootUri);
    close(): boolean;
    focus(checked?: boolean): boolean;
}
declare let application: Application;
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
    abort_undo(): void;
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
    private _pushState(code, url, isUri);
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
    createVPView?: (data: any) => VPView;
}): void;
export declare function getTopDialog(): Dialog;
export { application, namespace, taskCounter };
