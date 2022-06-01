import {SCHEMA_LITERALS} from "./SchemaKWMapping";

const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export function schema_type_map(schema_type:string) {
    return {
        'predicate': namedNode('rdf:type'),
        'object': namedNode(SCHEMA_LITERALS[schema_type])
    };
}



//"format": "jsonsc:format",




