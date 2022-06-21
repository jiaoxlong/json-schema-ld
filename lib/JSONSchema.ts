
import {
    SCHEMA_IDENTIFICATION,
    SCHEMA_ANNOTATIONS,
    SCHEMA_STRING_FORMATS,
    SCHEMA_COMPOSITIONS,
    SCHEMA_LOGICS
} from './schemaKWs';
import {fetchJSON} from '../utils/fetch';
import {match} from '../utils/match';
import {traverse} from "../utils/traverse";
import {Describer} from "../utils/Describer";
import {isValidHttpUrl} from "../utils/ConfigParser"

const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
import { NamedNode,Literal, Term } from "n3/lib/N3DataFactory";
import {ConfigParser} from "../utils/ConfigParser";


export class Schema {
    annotation?:Map<string, string>;
    constructor(data: object) {
        this.annotation = match(SCHEMA_ANNOTATIONS,data);
    }

}

export class StringSchema extends Schema{
    private schema_type:string='string';
    minLength?:number;
    maxLength?:number;
    pattern?:string;
    format?:typeof SCHEMA_STRING_FORMATS[number];
    enum?:[];
    default?:any;
    const?:string;
    rdf_serialized_terms?:any[]=[];
    shacl_serializzed_terms?:any[]=[];
    constructor(data: {[key:string]: any}) {
        super(data);
        this.schema_type = 'string';
        if (! (data.minLength))this.minLength = data.minLength;
        if (! (data.maxLength))this.maxLength = data.maxLength;
        if (! (data.pattern))this.pattern = data.pattern;
        if (! (data.format))this.format = data.format;
        if (! (data.enum))this.enum = data.enum;
        if (! (data.const))this.const = data.const;
        if (! (data.default))this.default = data.default;

    }
}

export class NumericSchema extends Schema{
    multipleOf?:number;
    minimum?:number;
    exclusiveMinimum?:number;
    maximum?:number;
    exclusiveMaximum?:number;
    enum?:[];
    default?:any;
    const?:number;
    constructor(data: {[key:string]: any}) {
        super(data);
        if (!(data.multipleOf === undefined)) this.multipleOf = data.multipleOf;
        if (!(data.minimum === undefined)) this.minimum = data.minimum;
        if (!(data.exclusiveMinimum === undefined))this.exclusiveMinimum = data.exclusiveMinimum;
        if (!(data.maximum === undefined))this.maximum = data.maximum;
        if (!(data.exclusiveMaximum === undefined)) this.exclusiveMaximum = data.exclusiveMaximum;
        if (!(data.enum === undefined)) this.enum = data.enum;
        if (! (data.const === undefined))this.const= data.const;
        if (! (data.default))this.default = data.default;
    }

}

export class IntegerSchema extends NumericSchema {
    private schema_type:string='integer';
    constructor(data: {[key:string]: any}) {
        super(data);
    }
}

export class NumberSchema extends NumericSchema {
    private schema_type:string='number';
    constructor(data: {[key:string]: any}) {
        super(data);
    }
}

export class BooleanSchema extends Schema {
    private schema_type:string='boolean';
    const?:boolean;
    default?:any;
    constructor(data: {[key:string]: any}) {
        super(data);
        if (! (data.const === undefined))this.const = data.const;
        if (! (data.default))this.default = data.default;

    }
}

export class NullSchema extends Schema {
    private schema_type:string='null';
    const?:null;
    constructor(data: {[key:string]: any}) {
        super(data);
        if (! (data.const === undefined))this.const = data.const;
    }
}


export class ArraySchema extends Schema {
    private schema_type:string='array';
    items?:object|boolean;
    prefixItems?:Schema[];
    contains?:Schema;
    minContains?: number;
    maxContains?:number;

    constructor(data: {[key:string]: any}) {
        super(data);
        this.items = data.items;
        if (!(data.contains === undefined)) this.contains = data.contains;
        if (!(data.minContains === undefined)) this.minContains = data. minContains;
        if (!(data.maxContains === undefined)) this.maxContains = data.maxContains;
    }
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
 */
export class ObjectSchema extends Schema{
    minProperties?:number;
    maxProperties?:number;
    constructor(data: {[key:string]: any}){
        super(data);
        if (!(data.minProperties === undefined))this.minProperties = data['minProperties'];
        if (!(data.maxProperties === undefined)) this.maxProperties = data['maxProperties'];
    }
}

export class BaseSchema extends Schema{
    private schema_type:string='base';
    id:string;
    schema?:string;
    compositeOpt?:string[];

    constructor(data: object){
        super(data);
        if (data['id']) this.id = data['id'];
        if (data['$id']) this.id = data['$id'];
        if (data['$schema']) this.schema = data['$schema']
        }
}
export class CompositionSchema extends Schema{
    schemas:Schema[]=[];
    schema_type:string;
    constructor(data: {[key:string]: any}, composition:string) {
        super(data);
        let s_list = []
        for (let s of data[composition]) {
            if (s.type === 'string') {
                let schema = new StringSchema(s)
                // @ts-ignore
                s_list.push(schema);
            }
            if (s.type === 'integer') {
                let schema = new IntegerSchema(s)
                // @ts-ignore
                s_list.push(schema);
            }
            if (s.type === 'number') {
                let schema = new NumberSchema(s)
                // @ts-ignore
                s_list.push(schema);
            }
            if (s.type === 'boolean') {
                let schema = new BooleanSchema(s)
                // @ts-ignore
                s_list.push(schema);
            }
            if (s.type === 'null') {
                let schema = new NullSchema(s)
                // @ts-ignore
                s_list.push(schema);
            }
        }
        this.schemas = s_list;
        this.schema_type = composition;
    }
}

export class AnyOfSchema extends CompositionSchema{
    schema_type:string = 'AnyOf';
    constructor(data: {[key:string]: any}, composition:string='oneOf') {
        super(data,composition);
    }
}

export class Property{
    _property_name:string;
    _property_schema:Schema;
    _isRequired?:boolean;
    constructor(
    property_name:string,
    property_schema:Schema,
    isRequired?:boolean,
    //fragment:string,
    //dependent?:Property[],
    //dependsOn?:Property[]

    ){
        this._property_name = property_name;
        this._property_schema = property_schema;
        this._isRequired = isRequired;
    }
    property_name(){
        return this._property_name;
    }e

    /**
     *  1. how to tackle when there is a nested composition schema?
     * Example: {"allOf":[{"anyOf":[...]},{"oneOf":[]...}, {"not":{...}}}
     *
     * 2. Before 2019-09 draft dependentRequired and dependentSchemas were one keyword called dependencies.
     * To resolve the complexity among dependentRequired, dependentSchemas and dependencies, we translate the later
     * two to dependentRequired properties here.
     *
     * 3. Inconsistency before conversion and after!
     *  https://example.com/schemas/address#/properties/street_address identifies
     *  {
     *   "$id": "https://example.com/schemas/address",
     *
     *   "type": "object",
     *   "properties": {
     *     "street_address":
     *       { "type": "string" },
     *     "city": { "type": "string" },
     *     "state": { "type": "string" }
     *   },
     *  }
     *  When we introduce e.g. ex:street_address in the RDF schema,
     *  the initial URI determined in the JSON schema will be gone.
     */

}



function jscLD(config:ConfigParser){
    return function (constructor: Function){
        if ('ld.id' in config) {
            //ld.existing is true.
             constructor.prototype._property_name = config['base_prefix']+':'+ config['ld.id']

        }
    }
}
