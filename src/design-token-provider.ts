type DesignTokenTarget = HTMLElement | Document;

export class DesignTokenNode {
    private static _nodes: Map<DesignTokenTarget, DesignTokenNode> = new Map();

    private _target: DesignTokenTarget;
    private _values: Map<DesignToken<any>, any> = new Map();
    private _debounceTimer: number;

    public static defaultNode: DesignTokenNode;

    constructor(target: DesignTokenTarget) {
        this._target = target;
    }

    public static getOrCreate(target: HTMLElement): DesignTokenNode {
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
        if (!override && this._values.has(token)) return;

        this._values.delete(token);
        this._values.set(token, value);
        this.applyTokens();
    }

    private applyTokens() {
        if (this._debounceTimer) {
            window.clearTimeout(this._debounceTimer);
            this._debounceTimer = null;
        }

        const target = this._target;

        this._debounceTimer = window.setTimeout(() => {
            if (target instanceof HTMLElement) {
                this._values.forEach((value, token) => {
                    target.style.setProperty(
                        `--${token.name}`,
                        value.toString()
                    );
                });
                return;
            }

            let rulesStr = '';
            this._values.forEach((value, token) => {
                rulesStr += `--${token.name}: ${value};`;
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

export class DesignToken<T> {
    public static rootIndex: number;

    public name: string;

    constructor(name: string) {
        this.name = name;

        if (!DesignTokenNode.defaultNode)
            DesignTokenNode.defaultNode = new DesignTokenNode(document);
    }

    setDefault(value: T, override: boolean = true): this {
        DesignTokenNode.defaultNode.setTokenValue(this, value, override);
        return this;
    }

    setValueFor(target: HTMLElement, value: T): this {
        DesignTokenNode.getOrCreate(target).setTokenValue(this, value, true);
        return this;
    }
}
