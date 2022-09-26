import {SCHEMA_STRING_FORMATS} from "./schemaKWs";

export const SHACL_STRING_MAP = {
    "minLength":"sh:minLength",
    "maxLength":"sh:maxLength",
    "pattern":"sh:pattern",
    //"format": -> not relevant for Shacl but rdf
    //"enum":"sh:in", -> complex structure
    "default":"sh:defaultValue",
    "const":"sh:hasValue" //otherwise sh:in ()
}

export const SHACL_NUM_MAP = {
    //"multipleOf":"" -> no expression for this in Shacl
/*    "minimum":""
    exclusiveMinimum
    maximum
    exclusiveMaximum*/
    //enum
    "default":"sh:defaultValue",
    "const":"sh:hasValue" //otherwise sh:in ()
}

const schacl_kw_mapping = {
    "required": "jsonsc:required",
    "propertyName": "jsonsc:propertyName", //-> {"pattern":"^[A-Za-z_][A-Za-z0-9_]*$"}
    "minProperties": "xsd:positiveInteger",
    "maxProperties": "xsd:positiveInteger",
    //"dependentRequired": "jsonsc:properties",
    //"dependentSchemas": "jsonsc:DataSchema"

    "multipleOf": "jsonsc:multipleOf",
    "mininum": "jsonsc:multipleOf",
    "exclusiveMinimum": "jsonsc:multipleOf",
    "maximum": "jsonsc:multipleOf",
    "exclusiveMaximum": "jsonsc:multipleOf",

    //"prefixItems":"jsonsc:?",
    //"contains":"jsonsc:?",
    "minContains": "xsd:positiveInteger",
    "maxContains": "xsd:positiveInteger",
    //"uniqueItems": "jsonsc:?",

    "minLength":"jsonsc:minLength",
    "maxLength":"jsonsc:maxLength",
    "pattern":"jsonsc:pattern",
    "format":"jsonsc:format",

    "enum": "jsonsc:enum",
    "const": "jsonsc:const",
    "default": "jsonsc:default",
    "contentEncoding": "jsonsc:contentEncoding",
    "contentMediaType": "jsonsc:contentMediaType",
}





