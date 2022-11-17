
import {
    SCHEMA_IDENTIFICATION,
    SCHEMA_ANNOTATIONS,
    SCHEMA_STRING_FORMATS,
    SCHEMA_COMPOSITIONS,
    SCHEMA_LOGICS
} from '../utils/schemaKWs';
import{
    SCHEMA_STRING_BUILDIN
} from '../utils/SchemaKWMapping'

import {match,merge} from '../utils/match';


const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
import { NamedNode,Literal, Term } from "n3/lib/N3DataFactory";
import {Config} from "./ConfigParser";
import {LD_BUILD_IN_ANNOTATION} from "../utils/LDBuildin";
import {
    blank_node_list,
    blank_node_literal,
    blank_node_namedNode,
    blank_node_node, node_node_node,
} from "../utils/n3_utils";
import {CLIArguments, SchemaOptArgs} from "../utils/types";

/**
 * An abstract base class for all JSON schemas extend.
 *
 * @category Model
 */
export abstract class Schema {
    /**
     * Schema id: source uri
     */
    id?:string;
    /**
     * A Config object contains all necessary configuration for parsing JSON schema.
     * */
    config:Config;
    /**
     * A JSON object contains data for parsing.
     */
    data:object;
    /**
     * The schema property states which dialect of JSON Schema the schema was written against.
     */
    schema?:string;
    /**
     * schema_type states what specific type of JSON Schema the schema restricts to.
     */
    schema_type:string;
    /**
     * The subject property indicates what resource has this schema as a property.
     */
    subject?:string|undefined;
    /**
     * property_name is the original property name extracted from JSON Schema document.
     */
    property_name:string;
    /**
     * The label property holds the value of the rdfs:label of a property.
     */
    label:string;
    /**
     * The annotation property holds all annotations attached to the schema.
     */
    annotation?:Map<string, string>;
    /**
     * true when a property is annotated with 'ld.existing' indicates it already exists in a vocabulary.
     */
    isExisting?:boolean;
    /**
     * true when a property is not considered to be added in RDF (both rdfs and shacl).
     */
    isIgnored?:boolean;
    /**
     * true when a property is annotated as required in the original JSON schema.
     */
    isRequired?:boolean;
    /**
     * contains predicate and object blank nodes of this Property for RDF vocabulary
     */
    rdfs?:NamedNode|any;
    /**
     * contains predicate and object blank nodes of this Property for RDF shapes
     */
    shacl?:any[];
    /**
     * The enum property is of type string array. Each string value will be converted to skos:Concept.
     */
    enum?:any;
    /**
     * An instance of a Class has this property.
     */
    domain?:string;
    /**
     * An instance of a Class is a value of this property.
     */
    range?:string;

    /**
     * The constructor of the Schema class
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config:Config, property_name:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        this.config = config;
        this.subject = subject;
        this.range = range;
        this.property_name = property_name;
        this.isExisting = isExisting;
        this.isIgnored = isIgnored;
        this.isRequired = isRequired;

        if('ld.ignore' in data)
            if (data['ld.ignore']===true)
                this.isIgnored = true;
        if ('id' in data) this.id = data['id'];
        if ('$id' in data) this.id = data['$id'];

        if ('ld.id' in data)
            this.id = uri(this.config.prefix, data['ld.id'])
        if ('ld.existing' in data)
            this.isExisting = true;
        if(this.id === undefined){
            // when id or $id is not defined in the base schema or a schema is of type class.
            if  (property_name === undefined)
                this.id = config.prefix+ ':json';
            else
                this.id = uri(this.config.prefix,property_name)
        }

        // rdfs:label
        // 1. when ld.id is defined as an URIr
        if(this.id.includes('http'))
        {
            if (this.id.includes('#'))
                this.label = this.id.substring(this.id.lastIndexOf('#') + 1)
            else
                this.label = this.id.substring(this.id.lastIndexOf('/') + 1)
        }
        // 2. when ld.id is introduced with based_prefix
        else if (this.id.includes(':'))
            this.label = this.id.substring(this.id.lastIndexOf(':')+1)

        // 3. when schema id is just property_name
        else
            this.label = this.id


        if ('ld.domain' in data){
            this.domain = data['ld.domain']
        }
        if ('ld.range' in data){
            this.range = data['ld.range']
        }
        if('ld.association' in data)
            this.range = uri(this.config.prefix, data['ld.association']['ld.id'])
        if ('ld.class' in data)
            this.range = uri(this.config.prefix,data['ld.class']['ld.id'])
        if ('$schema' in data) this.schema = data['$schema']
        if (('ld.geoJsonFeature' in data) && (data['ld.geoJsonFeature'] === true)) {
            if (! this.range) this.range = 'http://www.opengis.net/ont/geosparql#Geometry';
        }
        const ld_annotation = match(LD_BUILD_IN_ANNOTATION, data)
        const annotation = match(SCHEMA_ANNOTATIONS,data);
        this.annotation = merge(ld_annotation, annotation);

        /**
         * default, const, enum may appear in any valued JSON schema except for Null, Array and Object Schema.
         */
        const blank_list = []
        if ('default' in data) blank_list.push(blank_node_literal('sh:defaultValue', data.default));
        if ('const' in data) blank_list.push(blank_node_literal('sh:hasValue', data.const));
        if ('enum' in data) {
            const enum_list = []
            for (const ele of data['enum']){
                if (data['enum'] instanceof Array<string>)
                    enum_list.push(namedNode(this.config.prefix+':'+ ele));
                else
                    enum_list.push(literal(ele));
            }
            // can this be implemented by .map?
            blank_list.push(blank_node_list('sh:in',enum_list ))
            this.enum = enum_list
        }
        if (this.isRequired) {

            blank_list.push(blank_node_literal('sh:minCount', 1))
            blank_list.push(blank_node_literal('sh:maxCount', 1))

        }
        else{
            // When a property schema is not required and one or both of 'minItems' or 'maxItems' attributes of it are
            // defined, we have to handle it differently.
            // For example, the 'gbfs:rental_methods' is not required but its 'minItems' attribute is set to 1.
            // sh:or ([sh:path gbfs:rental_methods; sh:maxCount 0 ;] [sh:path gbfs:rental_methods; sh:minCount 1;])

            // Both blank and list functions in N3 requires to use an instance of N3.Writer as a parameter. We have to
            // leave the implementation during serialization.

        }
        this.shacl = blank_list;
    }

}

/**
 * StringSchema that extends {@link Schema | `Schema`}.
 *
 * Note that sh:pattern can be only applied to string datatype property in Shacl.
 */
export class StringSchema extends Schema{
    /**
     * The constructor of StringSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config,  property_name:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {subject, range, isExisting,isIgnored, isRequired});
        this.schema_type = 'string';
        /* RDFS */
        if (('format' in data) && (SCHEMA_STRING_FORMATS.includes(data['format']))){
            this.rdfs = namedNode(SCHEMA_STRING_BUILDIN[data.format]);
        }
        else this.rdfs = namedNode('xsd:string');
        /** SHACL */
        /* SHACL minLength */
        if ('minLength' in data)
            this.shacl.push(blank_node_literal('sh:minLength', data.minLength));
        /* SHACL maxLength */
        if ('maxLength' in data)
            this.shacl.push(blank_node_literal('sh:maxLength',data.maxLength));
        /* SHACL pattern */
        if ('pattern' in data)
            this.shacl.push(blank_node_literal('sh:pattern', data.pattern));
        /* SHACL datatype */
        if ('format' in data) {
            this.shacl.push(blank_node_namedNode('sh:datatype', namedNode(SCHEMA_STRING_BUILDIN[data.format])));

        }
        else {
            if (!this.enum)
                this.shacl.push(blank_node_namedNode('sh:datatype', this.rdfs));
        }
        this.schema_type = 'string'
    }

}

/**
 * NumericSchema that extends {@link Schema | `Schema`}.
 */
export class NumericSchema extends Schema{
    /**
     * The constructor of NumericSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config, property_name:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {subject, range, isExisting,isIgnored, isRequired});
        /** SHACL */
        /* SHACL minInclusive */
        if ('minimum' in data) this.shacl.push(blank_node_literal('sh:minInclusive', data.minimum));
        /* SHACL exclusiveMinimum */
        if ('exclusiveMinimum' in data) this.shacl.push(blank_node_literal('sh:minExclusive', data.exclusiveMinimum));
        /* SHACL maximum */
        if ('maximum' in data) this.shacl.push(blank_node_literal('sh:maxInclusive', data.maximum));
        /* SHACL exclusiveMaximum */
        if ('exclusiveMaximum' in data) this.shacl.push(blank_node_literal('sh:maxExclusive', data.exclusiveMaximum));

    }

}

/**
 * IntegerSchema that extends {@link NumericSchema | `NumericSchema`}.
 */
export class IntegerSchema extends NumericSchema {
    /**
     * The constructor of IntegerSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config, property_name:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {subject, range, isExisting,isIgnored, isRequired});
        this.rdfs = namedNode('xsd:integer');
        this.shacl.push(blank_node_namedNode('sh:datatype', this.rdfs));
        this.schema_type = 'integer';
    }
}

/**
 * NumberSchem that extends {@link NumericSchema | `NumericSchema`}.
 */
export class NumberSchema extends NumericSchema {
    /**
     * The constructor of NumberSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config, property_name:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {subject, range, isExisting,isIgnored, isRequired});
        this.rdfs = namedNode('xsd:decimal');
        this.shacl.push(blank_node_namedNode('sh:datatype', this.rdfs));
        this.schema_type = 'decimal'
    }
}

/**
 * BooleanSchema that extends {@link Schema | `Schema`}.
 */
export class BooleanSchema extends Schema {
    /**
     * The constructor of BooleanSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config, property_name:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {subject, range, isExisting,isIgnored, isRequired});
        this.schema_type = 'boolean';
        this.rdfs = namedNode('xsd:boolean');
        this.shacl.push(blank_node_namedNode('sh:datatype', this.rdfs));

    }
}

/**
 * NullSchema that extends {@link Schema | `Schema`}.
 */
export class NullSchema extends Schema {
    /**
     * The constructor of NullSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config, property_name:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {subject, range, isExisting,isIgnored, isRequired});
        this.schema_type = 'null';
    }
}

/**
 * ArraySchema that extends {@link Schema | `Schema`}.
 */
export class ArraySchema extends Schema {
    /**
     * minItems of an array schema
     */
    minItems?:number;
    /**
     * maxItems of an array schema
     */
    maxItems?:number;
    /**
     * The constructor of ArraySchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     * @param minItems the minimal number of elements that are allowed
     * @param maxItems the maximal number of element that are allow
     */
    constructor(data: {[key:string]: any}, config, property_name:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false,
                    minItems=0, maxItems=0}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {subject, range, isExisting,isIgnored, isRequired});
        this.schema_type = 'array';
        this.minItems = minItems;
        this.maxItems = maxItems;
        if (this.minItems > 0 )
            this.shacl.push(blank_node_literal('sh:minCount', this.minItems))

        if (this.maxItems > 0 )
            this.shacl.push(blank_node_literal('sh:maxCount', this.maxItems))
    }
}

/**
 * ObjectSchema that extends {@link Schema | `Schema`}.
 *
 * Note that
 *
 * 1. additionalRequired?:boolean|object, minProperties?:number and maxProperties?:number are not (necessary to be) implemented.
 *
 * 2. when isEnum is set to true, all the sub **Object** type properties will be considered as skos:Concept in a skos:ConceptSchema that is a value of this property.
 */
export class ObjectSchema extends Schema{
    isEnum:boolean;

    /**
     * The constructor of ObjectSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     * @param isEnum true when 'ld.enum' is annotated on a property
     * @param ld_enum a list of sub **Object** type properties considered as skos:Concept in a skos:ConceptSchema that is a value of this property in RDF vocabulary and shapes
     */
    constructor(data: {[key:string]: any}, config, property_name:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false, isEnum=false, ld_enum={}}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {subject, range, isExisting,isIgnored, isRequired});
        this.isEnum = isEnum;
        this.schema_type = 'object';
        if (this.isEnum){
            const enum_tmp= {};
            for (const k in ld_enum){
                enum_tmp[this.config.prefix+':'+ k] = ld_enum[k];
            }
            this.enum = enum_tmp;
            this.shacl.push(blank_node_list('sh:in', Object.keys(this.enum).map(x => namedNode(x))));
        }
    }
}

/**
 * BaseSchema {@link Schema | `Schema`}.
 *
 */
export class BaseSchema extends Schema{
    /**
     * The constructor of BaseSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config:Config, property_name:string){
        super(data,config, property_name, {});
        this.schema_type = 'base'
        }
}

/**
 * ClassSchema {@link Schema | `Schema`}.
 *
 */
export class ClassSchema extends Schema{
    /**
     * The constructor of ClassSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config:Config, property_name:string, { isExisting=false,
        isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        super(data,config, property_name, {isExisting,isIgnored,
            isRequired} );
        this.schema_type = 'class';
        this.rdfs = node_node_node(this.id, 'rdf:type', 'rdfs:Class');
        this.annotation = match(LD_BUILD_IN_ANNOTATION, data)
    }
}

/**
 *  1. how to tackle when there is a nested composition schema?
 * Example: {"allOf":[{"anyOf":[...]},{"oneOf":[]...}, {"not":{...}}}
 */

/**
 * CompositionSchema that extends {@link Schema | `Schema`}.
 */
export abstract class CompositionSchema extends Schema{
    /**
     * a list of Schema instances
     */
    schemas:Schema[]=[];
    /**
     * Logical Constraint Components aka. sh:or, sh:not, sh:xone and sh:and in Shacl
     */
    logical_opt:string;
    /**
     * One of composition schema types: oneOf, anyOf, AllOf, not.
     */
    composition:string;

    /**
     * The constructor of CompositionSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param composition composition type: not, allof, oneof, noneof.
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any}, config, property_name:string, composition:string,
                {subject=undefined, range=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {subject, range, isExisting,isIgnored, isRequired});
        for (const s of data[composition]) {
            let schema;
            if (s.type === 'string')  schema = new StringSchema(s, config, property_name);
            if (s.type === 'integer') schema = new IntegerSchema(s, config, property_name );
            if (s.type === 'number')  schema = new NumberSchema(s, config, property_name);
            if (s.type === 'boolean') schema = new BooleanSchema(s, config, property_name);
            if (s.type === 'null') schema = new NullSchema(s, config, property_name);
            if (schema instanceof Schema)
                this.schemas.push(schema);
        }
        this.schema_type = composition;
        /**
         * Composition schema shacl: a list of blank nodes
         * ex:Shape sh:property [sh:path ex:prop; sh:and ([sh:datatype xsd:xxx; sh:xxx xxx ], [])) .
         */
        this.shacl = []
    }
}

/**
 * AnyOfSchema that extends {@link CompositionSchema | `CompositionSchema`}.
 */
export class AnyOfSchema extends CompositionSchema{

    /**
     * The constructor of AnyOfSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param composition composition type: anyOf
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any},
                config:Config,
                property_name:string,
                composition='anyOf',
                {
                    subject=undefined,
                    range=undefined,
                    isExisting=false,
                    isIgnored=false,
                    isRequired=false,
                }:SchemaOptArgs={}
                ) {
        super(data,config, property_name,composition,
            {subject, range, isExisting,isIgnored, isRequired});
        this.logical_opt = 'sh:or';
        this.composition = composition;
    }
}

/**
 * OneOfSchema that extends {@link CompositionSchema | `CompositionSchema`}.
 */
export class OneOfSchema extends CompositionSchema{

    /**
     * The constructor of OneOfSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param composition composition type: oneOf
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any},
                config:Config,
                property_name:string,
                composition='oneOf',
                {
                    subject=undefined,
                    range=undefined,
                    isExisting=false,
                    isIgnored=false,
                    isRequired=false,
                }:SchemaOptArgs={}
    ) {
        super(data,config, property_name,composition,
            {subject, range, isExisting,isIgnored, isRequired});
        this.logical_opt = 'sh:xone';
        this.composition = composition;
    }
}

/**
 * AllOfSchema that extends {@link CompositionSchema | `CompositionSchema`}.
 */
export class AllOfSchema extends CompositionSchema{

    /**
     * The constructor of AllOfSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param composition composition type: allOf
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any},
                config:Config,
                property_name:string,
                composition='allOf',
                {
                    subject=undefined,
                    range=undefined,
                    isExisting=false,
                    isIgnored=false,
                    isRequired=false,
                }:SchemaOptArgs={}
    ) {
        super(data,config, property_name,composition,
            {subject, range, isExisting,isIgnored, isRequired});
        this.logical_opt = 'sh:and';
        this.composition = composition;
    }
}

/**
* NotSchema that extends {@link CompositionSchema | `CompositionSchema`}.
*/
export class NotSchema extends CompositionSchema{

    /**
     * The constructor of NotSchema
     * @param data  json object
     * @param config configuration
     * @param property_name property name in the original JSON Schema
     * @param composition composition type: not
     * @param subject rdfs:domain
     * @param isExisting true when the property exists in another vocabulary
     * @param isIgnored true when the property is considered not to be added in RDF vocabulary
     * @param isRequired true when the property is annotated as required in the original JSON schema
     */
    constructor(data: {[key:string]: any},
                config:Config,
                property_name:string,
                composition='not',
                {
                    subject=undefined,
                    range=undefined,
                    isExisting=false,
                    isIgnored=false,
                    isRequired=false,
                }:SchemaOptArgs={}
    ) {
        super(data,config, property_name,composition,
            {subject, range, isExisting,isIgnored, isRequired});
        this.logical_opt = 'sh:not';
        this.composition = composition;
    }
}

/**
 * evaluates whether a given string is a valid URI
 * @param a string object
 * @returns boolean
 */
export function isValidURL(s:string) {
    //https://www.freecodecamp.org/news/check-if-a-javascript-string-is-a-url/
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(s)
}

/**
 * converts the value of 'ld.id' to uri when it is given as a name.
 * @param prefix base prefix defined in the configuration
 * @param subject property name
 */
export function uri(prefix:string, s:any){
    // given as a URI
    if ((s.includes('http')) || (s.includes(':')))
        return s;
    // given as a string type value
    else
        return prefix + ':' + s;
}

/**
 * 1. patternProperties*, -> Property?
 * 2. additionalProperties
 * 3. unevaluatedProperties
 * 4. propertyNames
 * 5. minProperties
 * 6. MaxProperties
 * 7. dependentRequired -> Property
 * 8. dependentSchemas -> Property
 * 9. required  -> Property
 *
 * Notes:
 * - sh:pattern is only applied to value nodes.
 * Thus, the equivalent expression of patternProperties in Shacl do not exist.
 *
 * - The same applies to 2-6
 *
 * - 7-9 are implemented in the Property class.
 *
 * - The sub-object type schemas server as associated blank nodes.
 * Except for their annotation e.g. description, they do not hold any useful information.
 *
 * Before 2019-09 draft dependentRequired and dependentSchemas were one keyword called dependencies.
 * To resolve the complexity among dependentRequired, dependentSchemas and dependencies, we translate the later
 * two to dependentRequired properties here.
 */
