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





