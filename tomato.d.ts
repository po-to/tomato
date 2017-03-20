export interface IViewSource {
    namespace: string;
    source: string;
}
export declare const IViewSourceNamespace: string;
export declare function isIViewSource(data: Object): data is IViewSource;
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
};
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
export declare class PEvent {
    readonly name: string;
    readonly data: any;
    bubbling: boolean;
    readonly target: PDispatcher;
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
    vpid: string;
    readonly parent: VPresenter | undefined;
    constructor(view: VPView, parent?: VPresenter, vpid?: string);
    isWholeVPresenter(): this is WholeVPresenter;
    init(subs: VPresenter[]): Promise<this> | this;
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
    protected _checkRemoveChild(member: VPresenter): boolean;
    removeChild(member: VPresenter, checked?: boolean): boolean;
    protected _checkAppendChild(member: VPresenter): boolean;
    getParentDialog(): Dialog;
    appendChild(member: VPresenter, checked?: boolean): boolean;
    _update(): Promise<this>;
    destroy(): void;
    getDialogClassName(): string;
}
export declare let getVPresenter: (data: string | VPView) => VPresenter | Promise<VPresenter>;
export declare function syncGetVPresenter<T>(data: string | VPView): T;
export declare function asyncGetVPresenter<T>(data: string | VPView): Promise<T>;
export declare enum DialogState {
    Focused = 0,
    Blured = 1,
    Closed = 2,
}
export declare enum DialogPosition {
    Left = 0,
    Center = 1,
    Right = 2,
    Top = 3,
    Middle = 4,
    Bottom = 5,
}
export declare enum DialogSize {
    Content = 0,
    Full = 1,
}
export interface LayerView extends VPView {
    setZIndex(index: number): void;
}
export declare type DialogRefer = string | number | Object | [Object, string] | ((dialog: Dialog) => number);
export interface DialogConfig {
    className: string;
    masked: boolean;
    fixed: boolean;
    position: {
        x: DialogPosition | DialogRefer;
        y: DialogPosition | DialogRefer;
    };
    size: {
        width: DialogSize | DialogRefer;
        height: DialogSize | DialogRefer;
    };
    offset: {
        x: DialogRefer;
        y: DialogRefer;
    };
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
    position?: {
        x: DialogPosition | DialogRefer;
        y: DialogPosition | DialogRefer;
    };
    size?: {
        width: DialogSize | DialogRefer;
        height: DialogSize | DialogRefer;
    };
    offset?: {
        x: DialogRefer;
        y: DialogRefer;
    };
    effect?: string;
    asideOnRight?: boolean;
    asideInBody?: boolean;
    headerEffect?: string;
    footerEffect?: string;
    asideEffect?: string;
    bodyEffect?: string;
}
export declare abstract class Dialog extends VPresenter {
    readonly history: History;
    readonly parent: Dialog | undefined;
    readonly view: LayerView;
    readonly state: DialogState;
    readonly content: VPresenter | null;
    readonly dialog: View;
    readonly mask: View;
    readonly body: View | undefined;
    readonly header: View | undefined;
    readonly footer: View | undefined;
    readonly aside: View | undefined;
    protected readonly _dialogList: Dialog[];
    private _zindex;
    private _contentClassName;
    protected _contentHeader: View | null;
    protected _contentFooter: View | null;
    protected _contentAside: View | null;
    readonly config: DialogConfig;
    constructor(els: {
        view: LayerView;
        dialog: View;
        mask: View;
        body?: View;
        header?: View;
        footer?: View;
        aside?: View;
    }, config?: DialogConfigOptions);
    protected _onHistoryOverflow(e: any): void;
    setConfig(config: DialogConfigOptions): void;
    getZIndex(): number;
    getFocusedChild(): Dialog;
    protected _afterConfigChange(oldConfig: DialogConfig): void;
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
    refresh(): void;
    focus(_checked?: boolean, _parentCall?: boolean): boolean;
    close(): boolean;
    private _blur();
    protected _setState(state: DialogState): void;
    protected _allowAppendChild(member: VPresenter): boolean;
    appendChild(child: VPresenter): boolean;
    protected _afterAppendChild(member: VPresenter): void;
    protected _afterRemoveChild(member: VPresenter): void;
    refreshSize(): void;
    refreshPosition(): void;
    refreshLayout(): void;
}
export interface WholeVPresenter extends VPresenter {
    getHeader(): View | null;
    getFooter(): View | null;
    getAside(): View | null;
}
export declare class Application extends Dialog {
    initTime: number;
    constructor(rootUri: Cmd | null, els: {
        view: LayerView;
        dialog: View;
        mask: View;
        body?: View;
        header?: View;
        footer?: View;
        aside?: View;
    }, config?: DialogConfigOptions);
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
    renderer?: {
        [key: string]: (tpl: string, data: any) => void;
    };
    application?: Application;
    createVPView?: (html: string) => VPView;
}): void;
export declare function getTopDialog(): Dialog;
export declare function bootstrap(application: Application): void;
export { application, namespace, taskCounter };
