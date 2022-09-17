/**Obsolete
 * JSON schema draft identifiers and common names
 * Specification:
 *   - https://json-schema.org/specification-links.html
 *   - https://json-schema.org/understanding-json-schema/reference/schema.html
 */

const SCHEMA_DIALECTS = [
    'https://json-schema.org/draft/2020-12/schema',
    'https://json-schema.org/draft/2019-09/schema',
    'http://json-schema.org/draft-07/schema#',
    'http://json-schema.org/draft-06/schema#',
    'http://json-schema.org/draft-04/schema#',
    'http://json-schema.org/schema#'
]

/**
 * JSON schema identification
 * Specification: https://json-schema.org/understanding-json-schema/structuring.html
 */

const SCHEMA_IDENTIFICATION = [
    'schema',
    '$id',
    'id',
    '$anchor',
    '$ref',
    '$defs'
]

/**
 * JSON schema keywords - annotations, comment, enumerated and constant values.
 * Specification: https://json-schema.org/understanding-json-schema/reference/generic.html
 */

const SCHEMA_GENERIC_KEYWORDS = [
    'title',
    'description',
    'default',
    'examples',
    'deprecated',
    'readonly',
    'writeonly',
    'comment',
    'enum',
    'const'
]
type T_SCHEMA_GENERIC_KEYWORDS = {
    'title': string,
    'description': string,
    'default': any,
    'examples': Array<any>,
    'deprecated': boolean,
    'readonly': boolean,
    'writeonly': boolean,
    'comment': string,
    'enum': Array<any>,
    'const': string | number | boolean | null
}
type SCHEMA_ANNOT = ['title','description','default','examples','deprecated','readonly','writeonly']

/**
 * JSON schema type-specific keywords
 * Specification: https://json-schema.org/understanding-json-schema/reference/type.html
 */



const SCHEMA_TYPES = ['null','boolean','object','array','number','string', 'integer']

export interface I_SCHEMA_TYPES  {
    'null':null,
    'boolean':boolean,
    'object':object,
    'array':Array<any>,
    'number':number,
    'string':string,
    'integer':number
}

/**
 * JSON schema string type
 * Specification: https://json-schema.org/understanding-json-schema/reference/string.html
 */

const SCHEMA_STRING_CONSTRAINTS = ['minLength','maxLength','pattern','format']

export type T_SCHEMA_STRING_CONSTRAINTS = {
    'minLength':number,
    'maxLength':number,
    'pattern':string,
    'format':string,
}

const SCHEMA_STRING_FORMATS = [
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
]

export type T_SCHEMA_STRING_FORMATS = {
    'date-time': string,
    'time':string,
    'date':string,
    'duration':string,
    'email':string,
    'idn-email':string,
    'hostname':string,
    'idn-hostname':string,
    'ipv4':string,
    'ipv6':string,
    'uuid':string,
    'uri':string,
    'uri-reference':string,
    'iri':string,
    'iri-reference':string,
    'uri-template':string,
    'json-pointer':string,
    'relative-json-pointer':string,
    'regex':string
}

/**
 * JSON schema numeric types
 * Specification: https://json-schema.org/understanding-json-schema/reference/numeric.html#number
 * Notes:
 *   - Draft 4 declares exclusiveMinimum and exclusiveMaximum are boolean values,
 *   that indicate whether minimum and maximum are exclusive of the value
 */

const SCHEMA_NUMBER_CONSTRAINTS = ['multipleOf','mininum','exclusiveMinimum','maximum', 'exclusiveMaximum']

export type T_SCHEMA_NUMBER_CONSTRAINTS = {
    'multipleOf':number,
    'mininum':number,
    'exclusiveMinimum':number|boolean,
    'maximum':number,
    'exclusiveMaximum':number|boolean
}

/**
 * JSON schema object properties
 * Specification:
 *   - https://json-schema.org/understanding-json-schema/reference/object.html
 *   - https://json-schema.org/understanding-json-schema/reference/conditionals.html
 * Notes:
 *   - addtionalProperties only recognizes properties declared in the same subschema and can an restrict you from
 *   “extending” a schema using Schema Composition keywords such as allOf.
 *   - In Draft 4, required must contain at least one string.
 */

const SCHEMA_OBJ_PROPS = ['properties','additionalProperties','patternProperties','unevaluatedProperties']

export type T_SCHEMA_OBJ_PROPS = {
    'properties':object,
    'additionalProperties':boolean|object,
    'patternProperties':object,
    'unevaluatedProperties':boolean,
}

const SCHEMA_OBJECT_PROPS_CONSTRAINTS = [
    'required',
    'propertyNames', //-> {"pattern":"^[A-Za-z_][A-Za-z0-9_]*$"},
    'minProperties',
    'maxProperties',
    'dependentRequired',
    'dependentSchemas'
]

export type T_SCHEMA_OBJECT_PROPS_CONSTRAINTS = {
    'required':Array<string>,
    'propertyNames':object, //-> {"pattern":"^[A-Za-z_][A-Za-z0-9_]*$"},
    'minProperties':number,
    'maxProperties':number,
    'dependentRequired':object,
    'dependentSchemas':object
}

/**
 * JSON schema array
 * Specification: https://json-schema.org/understanding-json-schema/reference/array.html
 * notes:
 *   - When 'items' is a type of boolean, t uses in combination with 'prefixItems' to valid addtional in a tuple beyond
 *   what is defined in prefixItems
 */

const SCHEMA_ARRAY = [
    'items',
    'prefixItems',
    'contains',
    'minContains',
    'maxContains',
    'minItems',
    'maxItems',
    'uniqueItems'
]

export type T_SCHEMA_ARRAY = {
    'items':object | boolean,
    'prefixItems':Array<object>,
    'contains':object,
    'minContains':number,
    'maxContains':number,
    'minItems':number,
    'maxItems':number,
    'uniqueItems':boolean
}

/**
 * JSON schema composition
 * Specification: https://json-schema.org/understanding-json-schema/reference/combining.html
 * Notes:
 *   - keywords to combine schemas:
 *     - allOf: (AND) Must be valid against all of the subschemas
 *     - anyOf: (OR) Must be valid against any of the subschemas
 *     - oneOf: (XOR) Must be valid against exactly one of the subschemas
 *     - not: (NOT) Must not be valid against the given schema
 */

const SCHEMA_COMPOSITION = ['allOf','anyOf','oneOf', 'not']

export type T_SCHEMA_COMPOSITION = {
    'allOf':Array<object>,
    'anyOf':Array<object>,
    'oneOf':Array<object>,
    'not':object
}

/**
 * JSON schema If-Then-Else
 * Specification: https://json-schema.org/understanding-json-schema/reference/conditionals.html#id6
 */

const SCHEMA_OBJECT_PROPERTIES_LOGIC = ['if', 'then', 'else']

export type T_SCHEMA_OBJECT_PROPERTIES_LOGIC = {
    'if':object,
    'then':object,
    'else':object
}

/**
 * JSON schema media that are string-endocing and non JSON data stored inside JSON strings
 * Specification: https://json-schema.org/understanding-json-schema/reference/non_json_data.html
 * Notes:
 *   - contentMedia keyword specifies the MIME type of the contents of a string.
 *   The set of types supported will be application and operating system dependent.
 *     - a full MIME list (IANA): https://www.iana.org/assignments/media-types/media-types.xhtml
 *     - a short MIME list (Mozilla):
 *     https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
 */

const SCHEMA_MEDIA = [
    'contentMedia',
    'contentEncoding'
]

export type T_SCHEMA_MEDIA = {
    'contentMedia':typeof contentMediaTypes[number],
    'contentEncoding':typeof contentEncodingTypes[number]
}

// Here only lists a few examples.
const contentMediaTypes = <const>[
    'text/csv',
    'text/html',
    'application/json',
    'application/ld+json',
    'text/plain',
    'application/xhtml+xml',
]

const contentEncodingTypes =  <const>[
    '7bit',
    '8bit',
    'binary',
    'quoted-printable',
    'base16',
    'base32',
    'base64'
]

