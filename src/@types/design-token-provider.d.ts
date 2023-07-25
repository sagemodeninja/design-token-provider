declare module '@sagemodeninja/design-token-provider' {
    type DesignTokenTarget = HTMLElement | Document;

    type DesignTokenObserverCallback = (oldValue: any, newValue: any) => void;

    export class DesignToken<T> {
        constructor(name: string);
        setDefault(value: T): this;
        setDefault(value: T, override: boolean): this;
        setValueFor(target: DesignTokenTarget, value: T): this;
        getDefaultValue(): T;
        getValueFor(target: DesignTokenTarget): T;
        subscribe(callback: DesignTokenObserverCallback): this;
        subscribeFor(
            target: DesignTokenTarget,
            callback: DesignTokenObserverCallback
        ): this;
    }
}
