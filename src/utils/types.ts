
export const cli_args = [
    { name: 'source', alias: 's', type: String},
    { name: 'out', alias: 'o', type:String},
    { name: 'config', alias: 'c', type:String}
]

const objectTypes = <const>[
    "identifier",
    "assertion",
    "annotation",
    "applicator",
    "reservedLocation",
];

const formats = <const>[
    "turtle",
    "trig",
    "n-triples",
    "n-quads",
    "RDF",
    "n3",
    "json-ld",
    "json-schema",
]

const jsonFormatTypes = <const>[
    "json-schema",
    //"json-ld", #currently this is not in the scope.
]
const rdfFormatTypes =  <const>[
    "turtle",
    "trig",
    "n-triples",
    "n-quads",
    "RDF",
    "n3",
]

export const N3FormatTypes = <const>[
    "Turtle",
    "application/trig",
    "N-Triples",
    "N-Quads",
]

const shapeFormatTypes = <const>[
    "turtle",
    "json-ld"
]

export interface ISerializer {
    data:object;
    serialize(format:format):void,
    materialize():void,
}

export interface SchemaOptArgs{
    subject?:undefined|string,
    isClass?:boolean,
    isExisting?:boolean,
    isIgnored?:boolean,
    isRequired?:boolean,
    minItems?:number,
    maxItems?:number,
    isEnum?:boolean,
    ld_enum?:Record<string, unknown>
}
``
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

export interface I_JSONLD_CONFIG {
    $id:string,
    prefix:string,
    base_url:string,
    title:string
    format?:string,
    description?:string,
    creators:string[],
    license?:string,
    rights?:string,
    modified?:string

}

export type CLIArguments = {
    /** path to JSON Schema documents or folder */
    source: string,
    /** namespace URI */
    uri: string,
    /** namespace prefix */
    prefix: string,
    /** serialization format */
    format?: typeof N3FormatTypes[number]
    /** output path */
    out?: string
};

export type format = typeof formats[number];
export type rdfFormatType = typeof rdfFormatTypes[number];
export type jsonFormatType = typeof jsonFormatTypes[number];
export type shapeFormatType = typeof shapeFormatTypes[number];






