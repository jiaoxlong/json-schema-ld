export const SCHEMA_IDENTIFICATION = [
    'schema',
    '$id',
    'id',
]

export const SCHEMA_ANNOTATIONS = {
    'title':'dcterms:title',
    'description':'dcterms:description',
    'examples':'skos:example',
    'deprecated':'owl:deprecated',
    'readonly':'jsonsc:readOnly',
    'writeonly':'jsonsc:writeOnly',
    'comment':'rdfs:comment',
    //'enum':'jsonsc:enum', -> need to be attached to a property
    //'const':'jsonsc:const', -> need to be attached to a property
    //'default':'jsonsc:default', -> need to be attached to a property
}

export const SCHEMA_COMPOSITIONS = ['allOf', 'anyOf', 'oneOf', 'not']
export const SCHEMA_LOGICS = ['if', 'then', 'else'];

//export const SCHEMA_TYPES = ['null','boolean','object','array','number','string', 'integer'] as const

export const SCHEMA_STRING_FORMATS = [
    'date-time',
    'time',
    'date',
    'duration',
    'email',
    'idn-email',
    'hostname',
    'idn-hostname',
    'ipv4',
    'ipv6',
    'uuid',
    'uri',
    'uri-reference',
    'iri',
    'iri-reference',
    'uri-template',
    'json-pointer',
    'relative-json-pointer',
    'regex'
] as const;


//    '$anchor', '$ref', '$defs'
