import {SCHEMA_LITERALS} from "./SchemaKWMapping";

const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export function shacl_data_type(type:string){
    if (type === 'string') {
        return {
            predicate: namedNode('sh:datatype'),
            object: namedNode('xsd:string')
        };
    }
    else if (type === 'integer') {
        return {
            predicate: namedNode('sh:datatype'),
            object: namedNode('xsd:integer')
        };
    }
    else if (type === 'number') {
        return {
            predicate: namedNode('sh:datatype'),
            object: namedNode('xsd:decimal')
        };
    }
    else if (type === 'boolean') {
        return {
            predicate: namedNode('sh:datatype'),
            object: namedNode('xsd:boolean')
        };
    }
    else{
        throw Error('Unknown data type.');
    }

}


export function shacl_string_minLength(minLength:number) {
    return {
        'predicate': namedNode('sh:minLength'),
        'object': literal(minLength)
    };
}

export function shacl_string_maxLength(maxLength:number) {
    return {
        'predicate': namedNode('sh:maxLength'),
        'object': literal(maxLength)
    };
}

export function shacl_string_pattern(pattern:string){
    return {
        'predicate': namedNode('sh:pattern'),
        'object': literal(pattern)
    }
}

//How and where to implement this?
export function shacl_string_format(format:string){
    return {};
}



/*

pattern))this.pattern = data.pattern;
if (! (data.format))this.format = data.format;
if (! (data.enum))this.enum = data.enum;
if (! (data.const))this.const = data.const;
if (! (data.default)*/
