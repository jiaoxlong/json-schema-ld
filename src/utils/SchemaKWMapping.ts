export const SCHEMA_ANNOTATIONS = {
    "title": "dcterms:title",
    "description": "dcterms:description",
    "comment": "rdfs:comment",
    "example": "skos:example",
    "deprecated": "owl:deprecated",
    "readonly": "jsonsc:readOnly",
    "writeonly": "jsonsc:writeOnly",
}

export const SCHEMA_SHACL_ANNOTATION ={
    "dcterms:title":"sh:name",
    "dcterms:description":"sh:description",
    "rdfs:comment":"rdfs:comment",
    "skos:example":"skos:example",
    "owl:deprecated":"owl:deprecated",
    "jsonsc:readOnly":"jsonsc:readOnly",
    "jsonsc:writeOnly":"jsonsc:writeOnly"
}


export const SCHEMA_LITERALS = {
    "array": "jsonsc:ArraySchema",
    "boolean": "jsonsc:BooleanSchema",
    "integer": "jsonsc:IntegerSchema",
    "null": "jsonsc:NullSchema",
    "number": "jsonsc:NumberSchema",
    "object": "jsonsc:ObjectSchema",
    "string": "jsonsc:StringSchema",
}

const SCHEMA_OBJECT_PROPS = {
    "allOf": "jsonsc:allOf",
    "anyOf": "jsonsc:anyOf",
    "oneOf": "jsonsc:oneOf",
    "items": "jsonsc:items",
    "properties": "jsonsc:properties"
}

const SCHEMA_DATATYPE_PROPS = {
    "const": "sh:hasValue",
    "default": "sh:defaultValue",
    "enum": "sh:in",
    "exclusiveMaximum": "sh:maxExclusive",
    "exclusiveMinimum": "sh:minExclusive",
    "mininum": "sh:minInclusive",
    "maximum": "sh:maxInclusive",
    "maxItems": "sh:maxCount",
    "minItems": "sh:minCoun",
    "maxLength": "sh:maxLength",
    "minLength": "sh:minLength",
    "pattern": "sh:pattern", // can be only applied to a string type schema
    //"format": "jsonsc:format",
    //"multipleOf": "jsonsc:multipleOf",
    //"propertyName": "jsonsc:propertyName", //-> {"pattern":"^[A-Za-z_][A-Za-z0-9_]*$"}
    //"readonly": "jsonsc:readOnly",
    //"writeonly": "jsonsc:writeOnly",
}

const SCHEMA_DATATYPE_PROPS_NOT_IN = {

    "minProperties": "xsd:positiveInteger",
    "maxProperties": "xsd:positiveInteger",
    "minContains": "xsd:positiveInteger",
    "maxContains": "xsd:positiveInteger",
    //"prefixItems":"jsonsc:?",
    //"contains":"jsonsc:?",
    //"uniqueItems": "jsonsc:?",
    //"dependentRequired": "jsonsc:properties",
    //"dependentSchemas": "jsonsc:DataSchema"
}

export const SCHEMA_STRING_BUILDIN ={
    "date-time": "xsd:dateTime",
    "time": "xsd:time",
    "date": "xsd:date",
    "duration": "xsd:duration",
    "email": "schema:email",
    "idn-email": "schema:email", // alternative?
    "hostname": "xsd:string", // alternative?
    "idn-hostname": "xsd:string", // alternative?
    'ipv4': "xsd:string", // alternative?
    'ipv6': "xsd:string", // alternative?
    'uuid': "xsd:uuidType",
    'uri': "xsd:anyURI",
    'uri-reference': "xsd:string", // alternative?
    'iri': "xsd:string", // alternative?
    'iri-reference': "xsd:string",
    'uri-template': "xsd:string",
    'json-pointer': "xsd:string",
    'relative-json-pointer': "xsd:string",
    'regex': "jsonsc:pattern"
}












