


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

const shapeFormatTypes = <const>[
    "turtle",
    "json-ld"
]

export interface ISerializer {
    data:object;
    serialize(format:format):void,
    materialize():void,
}

export type format = typeof formats[number];
export type rdfFormatType = typeof rdfFormatTypes[number];
export type jsonFormatType = typeof jsonFormatTypes[number];
export type shapeFormatType = typeof shapeFormatTypes[number];






