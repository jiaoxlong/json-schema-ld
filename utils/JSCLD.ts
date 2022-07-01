import { CompositionSchema, Property, Schema} from "../lib/JSONSchema";
import {Traverse} from "./traverse";
import {ConfigParser} from "./ConfigParser";
import {RDFS_PREFIX, SHACL_PREFIX} from "../lib/Prefix";
import * as fs from 'fs';
import * as path from "path";
import {writer} from "repl";
import {NamedNode} from "n3";
import {add_writer_list, blank_node_node, node_node_list, node_node_literal, node_node_node} from "./n3_utils";
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class JSCLDSchema{
    config:ConfigParser;
    data:object;
    base_schema: Schema;
    subject:string;
    properties:Property[];
    rdf_writer:any;
    shacl_writer:any;
    shacl_shape:string;
    constructor(jsc:string, config:ConfigParser ){
        this.config = config;
        this.data = require(jsc);
        //Base Schema
        this.base_schema = new Schema(this.data, this.config,this.data['$id'])
        this.subject = this.base_schema.id
        this.rdf_writer = new N3.Writer(RDFS_PREFIX);
        this.shacl_writer = new N3.Writer(SHACL_PREFIX);
        this.shacl_shape = this.config.base_prefix+':'+capitalize(this.config.base_prefix)+'Shape';
        let t = new Traverse(this.base_schema.id,this.data, this.config);
        this.properties = t.properties;
        //console.log(this.properties);
    }

    serialize(){

        //  Base schema
        this.rdf_writer.addQuad(node_node_node(this.config.id, 'rdf:type', 'jsonsc-ld:Schema'));
        this.rdf_writer.addQuad(node_node_node(this.config.id,'jsonsc-ld:enriches', this.base_schema.id ));
        this.rdf_writer.addQuad(node_node_node(this.base_schema.id, 'rdf:type', 'rdfs:Class'));
        this.config.annot.forEach((value:any, key:string) => {
            if (typeof (value)== 'string'){
                this.rdf_writer.addQuad(node_node_literal(this.config.id, key, value));
            }
            if (Array.isArray(value)){
                let namedNodeList:any[] = [];
                for (let t of value){
                    this.rdf_writer.addQuad(node_node_node(this.config.id, key, t));
                }
            }
        });

        //Schema annotation
        for (let [key, value] of this.base_schema.annotation) {
            this.rdf_writer.addQuad(node_node_literal(this.base_schema.id, key, value));
        }

        // SHACL NodeShape
        this.shacl_writer.addQuad(
            node_node_node(this.shacl_shape,'rdf:type', 'sh:NodeShape')
        )
        // Shacl targetClass
        this.shacl_writer.addQuad(
            node_node_node(this.shacl_shape, 'sh:targetClass', this.subject ) )

        /**
         * iteration over properties
         */

        for (let p of this.properties){

            if (p.property_schema.isIgnored){
                continue;
            }
            else {
                // property type
                this.rdf_writer.addQuad(
                    node_node_node(p.property_schema.id, 'rdf:type','rdf:Property'));
                // property annotations
                for (let [k, v] of p.property_schema.annotation){
                    this.rdf_writer.addQuad(node_node_literal(p.property_schema.id, k, v));
                }
                // property domain
                this.rdf_writer.addQuad(node_node_node(
                    p.property_schema.id,
                    'rdfs:domain',
                    p.property_subject));

                let shacl_path_node = blank_node_node('sh:path', p.property_name);

                //skos enum
                if(p.property_schema.enum !== undefined){
                    this.rdf_writer.addQuad(node_node_node(p._property_subject,
                        p.property_schema.id,
                        p.config.base_prefix+':conceptscheme'));

                    this.rdf_writer.addQuad(namedNode(p.config.base_prefix+':conceptscheme'),
                            namedNode('skos:hasTopConcept'), this.rdf_writer.list(p.property_schema.enum));
                }

                //composition schema
                if (p.property_schema instanceof CompositionSchema) {

                    let shacl_com_blank_nodes = []

                    for (let schema of p.property_schema.schemas){
                        let shacl_temp = schema.shacl;
                        shacl_com_blank_nodes.push(
                            this.shacl_writer.blank(add_writer_list(schema.shacl, this.shacl_writer)))
                    }
                    let shacl_com_node = {
                        'predicate':namedNode('sh:or'),
                        'object':this.shacl_writer.list(shacl_com_blank_nodes)
                    }
                    this.shacl_writer.addQuad(quad(
                            namedNode(this.shacl_shape),
                            namedNode('sh:property'),
                            this.shacl_writer.blank([shacl_path_node,shacl_com_node])
                        )
                    )
                }
                // single schema
                else {
                    // rdfs:range
                    this.rdf_writer.addQuad(quad(
                        namedNode(p.property_schema.id),
                        namedNode('rdfs:range'),
                        p.property_schema.rdfs));

                    let shacl_blank_nodes = [shacl_path_node].concat(
                        add_writer_list(p.property_schema.shacl, this.shacl_writer));

                    this.shacl_writer.addQuad(quad(
                            namedNode(this.shacl_shape),
                            namedNode('sh:property'),
                            this.shacl_writer.blank(shacl_blank_nodes)
                        )
                    )

                }
            }
        }
    }

    materialize(){
        this.rdf_writer.end((error:any, result:any) =>
            fs.writeFile(path.join(config.out_dir, 'rdfs.ttl'), result, (err:any) => {
                if (err) throw err;
            }));
        this.shacl_writer.end((error:any, result:any) =>
            fs.writeFile(path.join(config.out_dir, 'shacl.ttl'), result, (err:any) => {
                if (err) throw err;
            }));
    }

}


let config = new ConfigParser('../configs/config.json');
let ld = new JSCLDSchema('../GBFS-LD/station_information.json', config);
//let ld = new JSCLDSchema('../GBFS-LD/free_bike_status.json', config);
//let ld = new JSCLDSchema('../GBFS-LD/minecraft.json', config);
ld.serialize();
ld.materialize();

function capitalizeFirstLetter(s)
{
    return s[0].toUpperCase() + s.slice(1);
}
function capitalize(s){
    return s.toUpperCase();
}
