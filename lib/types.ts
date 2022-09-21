


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
    isClass?:boolean,
    isExisting?:boolean,
    isIgnored?:boolean,
    isRequired?:boolean,
    minItems?:number,
    maxItems?:number,
    isEnum?:boolean,
    ld_enum?:{}
}

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


export type format = typeof formats[number];
export type rdfFormatType = typeof rdfFormatTypes[number];
export type jsonFormatType = typeof jsonFormatTypes[number];
export type shapeFormatType = typeof shapeFormatTypes[number];






