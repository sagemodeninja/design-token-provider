type DesignTokenTarget = HTMLElement | Document;

type DesignTokenObserverCallback = (oldValue: any, newValue: any) => void;

export class DesignTokenNode {
    private static _nodes: Map<DesignTokenTarget, DesignTokenNode> = new Map();

    private _target: DesignTokenTarget;
    private _values: Map<string, any> = new Map();
    private _debounceTimer: number;

    constructor(target: DesignTokenTarget) {
        this._target = target;
    }

    public static getOrCreate(target: DesignTokenTarget): DesignTokenNode {
        if (DesignTokenNode._nodes.has(target))
            return DesignTokenNode._nodes.get(target);

        const node = new DesignTokenNode(target);
        DesignTokenNode._nodes.set(target, node);

        return node;
    }

    public setTokenValue(
        token: DesignToken<any>,
        value: any,
        override: boolean
    ) {
        if (!override && this._values.has(token.name)) return;

        const oldValue = this._values.get(token.name);
        this._values.set(token.name, value);

        DesignTokenObserver.notify(token, this._target, oldValue, value);
        this.applyTokens();
    }

    public getTokenValue(token: DesignToken<any>) {
        console.log(this, this._values, token);
        return this._values.get(token.name);
    }

    private applyTokens() {
        if (this._debounceTimer) window.clearTimeout(this._debounceTimer);

        const target = this._target;

        this._debounceTimer = window.setTimeout(() => {
            this._debounceTimer = null;

            if (target instanceof HTMLElement) {
                this._values.forEach((value, token) => {
                    target.style.setProperty(`--${token}`, value.toString());
                });
                return;
            }

            let rulesStr = '';
            this._values.forEach((value, token) => {
                rulesStr += `--${token}: ${value};`;
            });

            const styleSheet = target.styleSheets[0];
            const rootIndex = DesignToken.rootIndex;

            if (rootIndex) {
                styleSheet.deleteRule(rootIndex);
            }

            const rootRule = `:root {${rulesStr}}`;
            DesignToken.rootIndex = styleSheet.insertRule(
                rootRule,
                rootIndex ?? styleSheet.cssRules.length
            );
        }, 50);
    }
}

export class DesignTokenObserver {
    private static _observers: Map<
        string,
        Map<DesignTokenTarget, DesignTokenObserverCallback>
    > = new Map();

    public static observe(
        token: DesignToken<any>,
        target: DesignTokenTarget,
        callback: DesignTokenObserverCallback
    ) {
        let innerMap = DesignTokenObserver._observers.get(token.name);

        if (!innerMap) {
            innerMap = new Map();
            DesignTokenObserver._observers.set(token.name, innerMap);
        }

        innerMap.set(target, callback);
    }

    public static notify(
        token: DesignToken<any>,
        target: DesignTokenTarget,
        oldValue: any,
        newValue: any
    ) {
        const innerMap = DesignTokenObserver._observers.get(token.name);
        const callback = innerMap?.get(target);

        if (callback) callback(oldValue, newValue);
    }
}

export class DesignToken<T> {
    public static rootIndex: number;

    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    setDefault(value: T, override: boolean = true): this {
        DesignTokenNode.getOrCreate(document).setTokenValue(
            this,
            value,
            override
        );
        return this;
    }

    setValueFor(target: HTMLElement, value: T): this {
        DesignTokenNode.getOrCreate(target).setTokenValue(this, value, true);
        return this;
    }

    getDefaultValue() {
        return this.getValueFor(document);
    }

    getValueFor(target: DesignTokenTarget) {
        return DesignTokenNode.getOrCreate(target).getTokenValue(this);
    }

    subscribe(callback: DesignTokenObserverCallback) {
        return this.subscribeFor(document, callback);
    }

    subscribeFor(
        target: DesignTokenTarget,
        callback: DesignTokenObserverCallback
    ) {
        DesignTokenObserver.observe(this, target ?? document, callback);
        return this;
    }
}
