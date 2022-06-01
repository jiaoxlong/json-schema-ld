import {BaseSchema, StringSchema} from './lib/JSONSchema'
import {properties, traverse} from './utils/traverse';
import {Describer} from './utils/Describer';
import * as fs from "fs";
import {RDFS_PREFIX,SHACL_PREFIX} from "./lib/Prefix";
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;



/**
 * 1. Load JSON Schema
 */
const json_schema = './GBFS/free_bike_status.json'
const schema = require(json_schema);
let rdf_prefix = RDFS_PREFIX;
let shacl_prefix = SHACL_PREFIX;
const rdf_file_path = './out/rdf.ttl';
const shacl_file_path = './out/shacl.ttl';
let rdf_writer = new N3.Writer(rdf_prefix);
let shacl_writer = new N3.Writer(shacl_prefix);

/**
 * 2. Initialize an Object Schema
 */


let s = new BaseSchema(schema);


traverse(schema);

rdf_writer.addQuad(
    namedNode(s.id),
    namedNode('rdf:type'),
    namedNode('jsonsc:DataSchema')
);

for (let base_annot of s.annotation.keys()) {
    rdf_writer.addQuad(
        namedNode(s.id),
        namedNode(base_annot),
        literal(s.annotation.get(base_annot))
    );
}

for (let p of properties){

    rdf_writer.addQuad(
        namedNode('gbfs:'+ p._property_name),
        namedNode('rdf:type'),
        namedNode('owl:ObjectProperty')
    );
    rdf_writer.addQuad(
        namedNode('gbfs:'+ p._property_name),
        namedNode('rdfs:domain'),
        namedNode(s.id)
    )
    for (let prop_annot of p._property_schema.annotation.keys()){
        rdf_writer.addQuad(
            namedNode(p._property_name),
            namedNode(prop_annot),
            literal(p._property_schema.annotation.get(prop_annot))
        );
    }
}

rdf_writer.end((error:any, result:any) => fs.writeFile(rdf_file_path, result, (err:any) => {
    if (err) throw err;
}));


/*
shacl_writer.addQuad(
    namedNode('gbfs:GBFSShape'), // To be defined in a config
    namedNode('sh:property'),
    shacl_writer.blank([{}]);

);
*/


