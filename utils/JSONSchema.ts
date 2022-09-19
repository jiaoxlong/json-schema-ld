
import {
    SCHEMA_IDENTIFICATION,
    SCHEMA_ANNOTATIONS,
    SCHEMA_STRING_FORMATS,
    SCHEMA_COMPOSITIONS,
    SCHEMA_LOGICS
} from '../lib/schemaKWs';
import{
    SCHEMA_STRING_BUILDIN
} from '../lib/SchemaKWMapping'
import {fetchJSON} from './fetch';
import {match,merge} from './match';
import {Traverse} from "./traverse";
import {isValidHttpUrl} from "./ConfigParser"

const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
import { NamedNode,Literal, Term } from "n3/lib/N3DataFactory";
import {ConfigParser} from "./ConfigParser";
import {LD_BUILD_IN_ANNOTATION} from "../lib/LDBuildin";
import {Quad} from "n3";
import {
    blank_node_list,
    blank_node_literal,
    blank_node_namedNode,
    blank_node_node, node_node_node,
} from "./n3_utils";
import {SchemaOptArgs} from "./types";


export class Schema {
    id?:string;
    config:ConfigParser;
    data:object;
    schema?:string;
    schema_type:string;
    property_name:string;
    label:string;
    annotation?:Map<string, string>;
    isClass?:boolean;
    isExisting?:boolean;
    isIgnored?:boolean;
    isRequired?:boolean;
    rdfs?:NamedNode|any;
    shacl?:any[];
    enum?:any;
    domain?:string;
    range?:string;
    constructor(data: {[key:string]: any}, config, property_name:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        this.config = config;
        this.property_name = property_name;
        this.isClass = isClass;
        this.isExisting = isExisting;
        this.isIgnored = isIgnored;
        this.isRequired = isRequired;

        if('ld.ignore' in data)
            if (data['ld.ignore']===true)
                this.isIgnored = true;
        if ('id' in data) this.id = data['id'];
        if ('$id' in data) this.id = data['$id'];

        if ('ld.id' in data){
            if (data['ld.class']===true){
                this.isClass = true;
                this.id = data['ld.id']

            }
            else{
                if ('ld.existing' in data){
                    this.isExisting = true;
                    this.id = data['ld.id'];
                }
                else{
                    if (data['ld.id'].includes('http')){
                        this.id = data['ld.id'];
                    }
                    else
                        this.id = this.config?.base_prefix + ':' + data['ld.id'];
                }
            }
        }
        if(this.id === undefined){
            // when id or $id is not defined in the base schema
            if  (property_name === undefined)
                this.id = config.base_prefix+ ':json';
            else
                if (property_name.includes('http'))
                    this.id = property_name;
                else
                    this.id = config.base_prefix + ':' + property_name;

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
        if ('$schema' in data) this.schema = data['$schema']
        if (('ld.geoJsonFeature' in data) && (data['ld.geoJsonFeature'] === true)) {
            if (! this.range) this.range = 'http://www.opengis.net/ont/geosparql#Geometry';
        }
        let ld_annotation = match(LD_BUILD_IN_ANNOTATION, data)
        let annotation = match(SCHEMA_ANNOTATIONS,data);
        this.annotation = merge(ld_annotation, annotation);

        /**
         * default, const, enum may appear in any valued JSON schema except for Null, Array and Object Schema.
         */
        let blank_list = []
        if ('default' in data) blank_list.push(blank_node_literal('sh:defaultValue', data.default));
        if ('const' in data) blank_list.push(blank_node_literal('sh:hasValue', data.const));
        if ('enum' in data) {
            let enum_list = []
            for (let ele of data['enum']){
                if (data['enum'] instanceof Array<string>)
                    enum_list.push(namedNode(this.config.base_prefix+':'+ ele));
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

export class StringSchema extends Schema{
    constructor(data: {[key:string]: any}, config, property_name:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {isClass, isExisting,isIgnored, isRequired});
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
        if ('format' in data)
            this.shacl.push(blank_node_literal('sh:datatype', SCHEMA_STRING_BUILDIN[data.format]));
        else
            if (!this.enum)
                this.shacl.push(blank_node_namedNode('sh:datatype', this.rdfs));
        this.schema_type = 'string'
    }

}

export class NumericSchema extends Schema{
    constructor(data: {[key:string]: any}, config, property_name:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {isClass, isExisting,isIgnored, isRequired});
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

export class IntegerSchema extends NumericSchema {
    constructor(data: {[key:string]: any}, config, property_name:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {isClass, isExisting,isIgnored, isRequired});
        this.rdfs = namedNode('xsd:integer');
        this.shacl.push(blank_node_namedNode('sh:datatype', this.rdfs));
        this.schema_type = 'integer';
    }
}

export class NumberSchema extends NumericSchema {
    constructor(data: {[key:string]: any}, config, property_name:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {isClass, isExisting,isIgnored, isRequired});
        this.rdfs = namedNode('xsd:decimal');
        this.shacl.push(blank_node_namedNode('sh:datatype', this.rdfs));
        this.schema_type = 'decimal'
    }
}

export class BooleanSchema extends Schema {
    constructor(data: {[key:string]: any}, config, property_name:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {isClass, isExisting,isIgnored, isRequired});
        this.schema_type = 'boolean';
        this.rdfs = namedNode('xsd:boolean');
        this.shacl.push(blank_node_namedNode('sh:datatype', this.rdfs));

    }
}
// Use case?
export class NullSchema extends Schema {
    constructor(data: {[key:string]: any}, config, property_name:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {isClass, isExisting,isIgnored, isRequired});
        this.schema_type = 'null';
    }
}

export class ArraySchema extends Schema {
    /**
     * In general, keywords defined in an Array schema do not hold any information except for the one tagged with ld.id.
     * When an array schema tagged with ld.id, it is interpreted as a RDFs class.
     *     items?:object|boolean;
     *     prefixItems?:Schema[];
     *     contains?:Schema;
     *     minContains?: number;
     *     maxContains?:number;
     */
    minItems?:number;
    maxItems?:number;

    constructor(data: {[key:string]: any}, config, property_name:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false,
                    minItems=0, maxItems=0}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {isClass, isExisting,isIgnored, isRequired});
        this.schema_type = 'array';
        this.minItems = minItems;
        this.maxItems = maxItems;
        if(this.isClass===true)
            this.rdfs = node_node_node(this.id, 'rdf:type', 'rdfs:Class')
        if (this.minItems > 0 )
            this.shacl.push(blank_node_literal('sh:minCount', this.minItems))

        if (this.maxItems > 0 )
            this.shacl.push(blank_node_literal('sh:maxCount', this.maxItems))
    }
}

export class ObjectSchema extends Schema{
    /**
     * similarly as Array schema, an object schema will be considered as a predicate except for the base one.
     *     minProperties?:number;
     *     maxProperties?:number;
     */
    additionalRequired?:boolean|object;
    isEnum?:boolean;
    ld_enum?:{};
    constructor(data: {[key:string]: any}, config, property_name:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false, isEnum=false, ld_enum={}}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {isClass, isExisting,isIgnored, isRequired});
        this.schema_type = 'object';
        if (isEnum){
            let enum_tmp= {};

            for (const k in ld_enum){
                enum_tmp[this.config.base_prefix+':'+ k] = ld_enum[k];
            }
            this.enum = enum_tmp;
            this.shacl.push(blank_node_list('sh:in', Object.keys(this.enum).map(x => namedNode(x))));
        }
    }
}

export class BaseSchema extends Schema{
    compositeOpt?:string[];
    constructor(data: {[key:string]: any}, config:ConfigParser, property_name:string){
        super(data,config, property_name, {});
        this.schema_type = 'base'
        }
}

export class ClassSchema extends Schema{
    constructor(data: {[key:string]: any}, config:ConfigParser, property_name:string, {isClass=true, isExisting=false,
        isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        super(data,config, property_name, {isClass, isExisting,isIgnored,
            isRequired} );
        this.schema_type = 'class';
        this.rdfs = node_node_node(this.id, 'rdf:type', 'rdfs:Class');
    }
}

/**
 *  1. how to tackle when there is a nested composition schema?
 * Example: {"allOf":[{"anyOf":[...]},{"oneOf":[]...}, {"not":{...}}}
 */
export class CompositionSchema extends Schema{
    schemas:Schema[]=[];
    schema_type:string;
    logical_opt:string;
    shacl:any[];
    constructor(data: {[key:string]: any}, config, property_name:string, composition:string,
                {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        super(data,config, property_name,
            {isClass, isExisting,isIgnored, isRequired});
        for (const s of data[composition]) {
            let schema;
            if (s.type === 'string')  schema = new StringSchema(s, config, property_name);
            if (s.type === 'integer') schema = new IntegerSchema(s, config, property_name );
            if (s.type === 'number')  schema = new NumberSchema(s, config, property_name);
            if (s.type === 'boolean') schema = new BooleanSchema(s, config, property_name);
            if (s.type === 'null') schema = new NullSchema(s, config, property_name);
            this.schemas.push(schema);
        }
        this.schema_type = composition;
        /**
         * Composition schema shacl: a list of blank nodes
         * ex:Shape sh:property [sh:path ex:prop; sh:and ([sh:datatype xsd:xxx; sh:xxx xxx ], [])) .
         */
        let shacl_com_list = []
        this.shacl = shacl_com_list
    }
}

export class AnyOfSchema extends CompositionSchema{
    logical_opt:string;
    constructor(data: {[key:string]: any},
                config:ConfigParser,
                property_name:string,
                composition:string='anyOf',
                {
                    isClass=false,
                    isExisting=false,
                    isIgnored=false,
                    isRequired=false,
                }:SchemaOptArgs={}
                ) {
        super(data,config, property_name,composition,
            {isClass, isExisting,isIgnored, isRequired});
        this.logical_opt = 'sh:or'
    }
}
export class OneOfSchema extends CompositionSchema{
    logical_opt:string;
    constructor(data: {[key:string]: any},
                config:ConfigParser,
                property_name:string,
                composition:string='oneOf',
                {
                    isClass=false,
                    isExisting=false,
                    isIgnored=false,
                    isRequired=false,
                }:SchemaOptArgs={}
    ) {
        super(data,config, property_name,composition,
            {isClass, isExisting,isIgnored, isRequired});
        this.logical_opt = 'sh:xone';
    }
}

export class AllOfSchema extends CompositionSchema{
    logical_opt:string;
    constructor(data: {[key:string]: any},
                config:ConfigParser,
                property_name:string,
                composition:string='allOf',
                {
                    isClass=false,
                    isExisting=false,
                    isIgnored=false,
                    isRequired=false,
                }:SchemaOptArgs={}
    ) {
        super(data,config, property_name,composition,
            {isClass, isExisting,isIgnored, isRequired});
        this.logical_opt = 'sh:and';
    }
}

export class NotSchema extends CompositionSchema{
    logical_opt:string;
    constructor(data: {[key:string]: any},
                config:ConfigParser,
                property_name:string,
                composition:string='notOf',
                {
                    isClass=false,
                    isExisting=false,
                    isIgnored=false,
                    isRequired=false,
                }:SchemaOptArgs={}
    ) {
        super(data,config, property_name,composition,
            {isClass, isExisting,isIgnored, isRequired});
        this.logical_opt = 'sh:not';
    }
}

export class Property{
    config:ConfigParser;
    _property_subject:string;
    _property_name:string;
    _property_schema:Schema|CompositionSchema;

    constructor(
        config:ConfigParser,
        subject:string,
        property_name:string,
        property_schema:Schema|CompositionSchema,
        //fragment:string,
        //dependent?:Property[],
        //dependsOn?:Property[]
    )
    {
        this.config = config;
        this._property_subject = subject;
        this._property_schema = property_schema;
        if (this._property_schema.id){
            this._property_name = this._property_schema.id;
        }
        else
            this._property_name = config.base_prefix+':'+property_name;


    }
    get property_subject(){
        return this._property_subject;
}

    get property_name(){
        return this._property_name;
    }
    get property_schema(){
        return this._property_schema;
    }
}

function schema_label(s:string){

    return isValidURL(s) ? '' : s;
}

export function isValidURL(s:string) {
    //https://www.freecodecamp.org/news/check-if-a-javascript-string-is-a-url/
    let urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(s)
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
