declare module '@sagemodeninja/design-token-provider' {
    export class DesignToken<T> {
        constructor (name: string);
        setDefault(value: T, override: boolean): DesignToken<any>;
        setValueFor(target: HTMLElement, value: T): DesignToken<any>;
    }
}