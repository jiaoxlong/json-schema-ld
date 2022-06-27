import {Property, Schema} from "./JSONSchema";
import {Traverse} from "../utils/traverse";
import {ConfigParser} from "../utils/ConfigParser";
import {RDFS_PREFIX, SHACL_PREFIX} from "./Prefix";
import * as fs from 'fs';
import * as path from "path";
import {writer} from "repl";
import {NamedNode} from "n3";
import {node_node_list, node_node_literal, node_node_node} from "../utils/n3_utils";
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class JSCLDSchema{
    config:ConfigParser;
    data:object;
    base_schema: Schema;
    properties:Property[];
    rdf_writer:any;
    shacl_writer:any;
    shacl_shape:string;
    constructor(jsc:string, config:ConfigParser ){
        this.config = config;
        this.data = require(jsc);
        //Base Schema
        this.base_schema = new Schema(this.data, this.config,this.data['$id'])
        this.rdf_writer = new N3.Writer(RDFS_PREFIX);
        this.shacl_writer = new N3.Writer(SHACL_PREFIX);
        this.shacl_shape = this.config.base_prefix+':'+capitalize(this.config.base_prefix)+'Shape';
        let t = new Traverse(this.base_schema.id,this.data, this.config);
        this.properties = t.properties;
        //console.log(this.properties);
    }

    serialize(){

         /** JSON LD
         A-LD rdf:type jsonsc-ld:Schema;
         jsonsc-ld:enriches jsonsc:DataSchema;
         dcterms:title A.title;
         dcterms:description A.description;
         dcterms:creator A.creator[];
         dcterms:license A.license;
         dcterms:rights A.rights;
         dcterms:modified xsd:DateTime.

         */
        this.rdf_writer.addQuad(node_node_node(this.config.id, 'rdf:type', 'jsonsc-ld:Schema'));
        this.rdf_writer.addQuad(node_node_node(this.config.id,'jsonsc-ld:enriches', this.base_schema.id ));
        this.config.annot.forEach((value:any, key:string) => {
            if (typeof (value)== 'string'){
                this.rdf_writer.addQuad(node_node_literal(this.config.id, key, value));
            }
            if (Array.isArray(value)){
                let namedNodeList:any[] = [];
                for (let t of value){
                    namedNodeList.push(namedNode(t));
                }
                this.rdf_writer.addQuad(node_node_list(this.rdf_writer,this.config.id, key, namedNodeList));
            }
        });
        for (let [key, value] of this.base_schema.annotation) {
            this.rdf_writer.addQuad(node_node_literal(this.base_schema.id, key, value));
        }
        this.shacl_writer.addQuad(
            node_node_node(this.shacl_shape,'rdf:type', 'sh:NodeShape')
        )
        for (let p of this.properties){
            if (p.property_schema.isIgnored){
                continue;
            }
            else {
                this.rdf_writer.addQuad(quad(namedNode(p.property_subject),
                    namedNode(p.property_schema.id),
                    p.property_schema.rdfs));
                this.rdf_writer.addQuad(
                    node_node_node(p.property_schema.id, 'rdf:type','owl:DatatypeProperty'))
                //console.log(p.shacl);
                //console.log(p.property_schema.shacl)
                this.shacl_writer.addQuad(quad(
                        namedNode(this.shacl_shape),
                        namedNode('sh:property'),
                        this.shacl_writer.blank(p.shacl)
                    )
                )
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
ld.serialize();
ld.materialize();

function capitalizeFirstLetter(s)
{
    return s[0].toUpperCase() + s.slice(1);
}
function capitalize(s){
    return s.toUpperCase();
}
