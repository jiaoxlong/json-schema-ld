

export interface I_SCHEMA_GENERIC_KWS {
    title?: string,
    description?: string,
    default?: any,
    examples?: Array<any>,
    deprecated?: boolean,
    readonly?: boolean,
    writeonly?: boolean,
    comment?: string,
    enum?: Array<any>,
    const?: string | number | boolean | null
}
