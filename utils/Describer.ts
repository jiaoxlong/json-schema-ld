export class Describer {
    static describe(instance:any): Array<string> {
        return Object.getOwnPropertyNames(instance);
    }
}
