import {CompositionSchema, ObjectSchema, Property, Schema} from "./JSONSchema";
import {Traverse} from "./traverse";
import {ConfigParser} from "./ConfigParser";
import {RDFS_PREFIX, SHACL_PREFIX} from "../utils/Prefix";
import * as fs from 'fs';
import * as path from "path";
import {writer} from "repl";
import {NamedNode, Quad} from "n3";
import {
    add_writer_list, blank_node_list,
    blank_node_literal,
    blank_node_node,
    node_node_list,
    node_node_literal,
    node_node_node
} from "./n3_utils";
import {SCHEMA_SHACL_ANNOTATION} from "../utils/SchemaKWMapping";
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class JSCLDSchema{
    config:ConfigParser;
    jsc:string;
    data:object;
    base_schema: Schema;
    subject:string;
    properties:Property[];
    rdf_writer:any;
    shacl_writer:any;
    constructor(jsc:string, config:ConfigParser ){
        this.config = config;
        this.jsc = jsc;
        this.data = require(jsc);
        //Base Schema
        this.base_schema = new Schema(this.data, this.config,this.data['$id'],{})
        this.subject = this.base_schema.id;
        this.rdf_writer = new N3.Writer({...RDFS_PREFIX,...{'format':this.config.format}});
        this.shacl_writer = new N3.Writer({...SHACL_PREFIX,...{'format':this.config.format}});
        let t = new Traverse(this.base_schema.id,this.data, this.config);
        this.properties = t.properties;
    }

    serialize(){

        /**
         *  Base
         */

        this.rdf_writer.addQuad(node_node_node(this.config.id, 'rdf:type', 'jsonsc-ld:Schema'));
        this.rdf_writer.addQuad(node_node_node(this.config.id,'jsonsc-ld:enriches', this.base_schema.id ));
        this.rdf_writer.addQuad(node_node_node(this.base_schema.id, 'rdf:type', 'rdfs:Class'));

        if ('ld.title' in this.data) {
            this.rdf_writer.addQuad(node_node_literal(
                this.base_schema.id,
                'rdfs:label',
                this.data['ld.title']));
        }
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

        // Shacl Shape
        let shacl_shape = this.subject+'Shape';
        this.shacl_writer.addQuad(node_node_node(shacl_shape, 'rdf:type', 'sh:NodeShape'));
        this.shacl_writer.addQuad(node_node_node(shacl_shape, 'sh:targetClass', this.subject));

        /**
         * iteration over properties
         */

        for (let p of this.properties){

            if (p.property_schema.isIgnored){
                continue;
            }
            else {
                // property/class annotations
                let shacl_annot_node=[];
                if (!p.property_schema.isExisting) {
                    for (let [k, v] of p.property_schema.annotation) {
                        this.rdf_writer.addQuad(node_node_literal(p.property_schema.id, k, v));
                        shacl_annot_node.push(blank_node_literal(SCHEMA_SHACL_ANNOTATION[k], v))

                    }
                }
                /**
                 * Classes
                 */
                if (p.property_schema.isClass){

                    if (p.property_subject.includes('#'))
                        shacl_shape = this.config.base_prefix + ':' + p.property_subject.substring(p.property_subject.lastIndexOf('#')+1)+'Shape';
                    else if (p.property_subject.includes('/')) {
                        shacl_shape = this.config.base_prefix + ':' + p.property_subject.substring(p.property_subject.lastIndexOf('/') + 1) + 'Shape';
                    }
                    else
                        shacl_shape = this.config.base_prefix + ':'+p.property_subject+'Shape'
                    // Class SHACL NodeShape
                    this.shacl_writer.addQuad(node_node_node(shacl_shape, 'rdf:type', 'sh:NodeShape'));
                    // Class Shacl targetClass
                    this.shacl_writer.addQuad(node_node_node(shacl_shape, 'sh:targetClass', p.property_subject));
                    this.rdf_writer.addQuad(p.property_schema.rdfs)
                    if (! p.property_schema.isExisting) {
                        this.rdf_writer.addQuad(node_node_literal(
                            p.property_schema.id,
                            'rdfs:label',
                            p.property_schema.label));
                        shacl_annot_node.push(blank_node_literal('sh:name', p.property_name.replace(this.config.base_url, '')))
                    }
                }
                /**
                 * Properties
                 */
                else {
                    // property type
                    let shacl_path_node = blank_node_node('sh:path', p.property_name);

                    // To do: handle non-required property which has 'minItems' or 'maxItems' attribute.

                    if (!p.property_schema.isExisting) {
                        this.rdf_writer.addQuad(
                            node_node_node(p.property_schema.id, 'rdf:type', 'rdf:Property'));
                    }
                    //property label
                    if (!p.property_schema.isExisting) {
                        this.rdf_writer.addQuad(node_node_literal(
                            p.property_schema.id,
                            'rdfs:label',
                            p.property_schema.label));

                        shacl_annot_node.push(blank_node_literal('sh:name',
                            p.property_name.replace(this.config.base_prefix + ':', '')));
                    }
                    // property domain

                    this.rdf_writer.addQuad(node_node_node(
                        p.property_schema.id,
                        'rdfs:domain',
                        p.property_subject));

                    //skos enum
                    if (p.property_schema.enum) {
                        // rdfs
                        /**
                         * When ld.id is set with full URI, captitalizeFirstLetterAfterPrefix will not work!
                         */
                        this.rdf_writer.addQuad(node_node_node(
                            capitalizeLastFragment(p.property_schema.id),
                            'rdf:type',
                            'skos:ConceptScheme'));

                        if (p.property_schema.enum instanceof Array<any>) {
                            this.rdf_writer.addQuad(
                                namedNode(p.property_schema.id),
                                namedNode('rdfs:range'),
                                this.rdf_writer.blank(
                                    [blank_node_list('owl:oneOf', this.rdf_writer.list(p.property_schema.enum))]));
                            for (const e of p.property_schema.enum) {
                                this.rdf_writer.addQuad(e,namedNode('rdf:type'), namedNode('skos:Concept'));
                                this.rdf_writer.addQuad(e,namedNode('skos:inScheme'),namedNode(capitalizeLastFragment(p.property_schema.id)));
                                this.rdf_writer.addQuad(e, namedNode('rdfs:label'),literal(e.id.replace(this.config.base_prefix + ':', '')));
                            }
                        }

                        if (p.property_schema.enum.constructor == Object){
                            this.rdf_writer.addQuad(
                                namedNode(p.property_schema.id),
                                namedNode('rdfs:range'),
                                this.rdf_writer.blank(
                                    [blank_node_list('owl:oneOf',
                                        this.rdf_writer.list(Object.keys(p.property_schema.enum).map(x => namedNode(x))))]));
                            for (const e in p.property_schema.enum) {
                                this.rdf_writer.addQuad(node_node_node(e, 'rdf:type', 'skos:Concept'));
                                this.rdf_writer.addQuad(node_node_node(e,'skos:inScheme',
                                    capitalizeLastFragment(p.property_schema.id)));
                                this.rdf_writer.addQuad(node_node_literal(e, 'rdfs:label',
                                    e.replace(this.config.base_prefix + ':', '')))
                                for (let [k, v] of p.property_schema.enum[e])
                                    this.rdf_writer.addQuad(node_node_literal(e, k, v));
                            }
                        }
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
                                namedNode(shacl_shape),
                                namedNode('sh:property'),
                                this.shacl_writer.blank([shacl_path_node,shacl_com_node])
                            )
                        )
                    }
                    // single schema
                    else {
                        if (p.property_schema.range){
                            this.rdf_writer.addQuad(quad(
                                namedNode(p.property_schema.id),
                                namedNode('rdfs:range'),
                                namedNode(p.property_schema.range)));
                        }
                        else{
                            if (!p.property_schema.enum) {
                                this.rdf_writer.addQuad(quad(
                                    namedNode(p.property_schema.id),
                                    namedNode('rdfs:range'),
                                    p.property_schema.rdfs));
                            }
                        }
                        let shacl_blank_nodes = [shacl_path_node].concat(shacl_annot_node).concat(
                            add_writer_list(p.property_schema.shacl, this.shacl_writer));

                        this.shacl_writer.addQuad(quad(
                                namedNode(shacl_shape),
                                namedNode('sh:property'),
                                this.shacl_writer.blank(shacl_blank_nodes)
                            )
                        )
                    }

                }
            }
        }
    }

    materialize(){
        const path = require('path');
        this.rdf_writer.end((error:any, result:any) =>
            fs.writeFile(path.join(this.config.out_dir, path.parse(this.jsc).name+'_rdfs.ttl'), result, (err:any) => {
                if (err) throw err;
            }));
        this.shacl_writer.end((error:any, result:any) =>
            fs.writeFile(path.join(this.config.out_dir, path.parse(this.jsc).name+'_shacl.ttl'), result, (err:any) => {
                if (err) throw err;
            }));
    }

}

/**
 * Test case
 */

// let config = new ConfigParser('../configs/config.json');
// let ld = new JSCLDSchema('../GBFS-LD/station_information.json', config);
// //let ld = new JSCLDSchema('../GBFS-LD/free_bike_status.json', config);
//
// ld.serialize();
// ld.materialize();

function capitalizeFirstLetter(s)
{
    return s[0].toUpperCase() + s.slice(1);
}
function capitalize(s){
    return s.toUpperCase();
}

function capitalizeFirstLetterAfterPrefix(s:string){
    let ind = s.indexOf(':')
    return s.slice(0, ind+1)+s[ind+1].toUpperCase()+s.slice(ind+2)
}

function capitalizeLastFragment(s:string){
    if (s.includes('http')){
        let s_index:number;
        if(s.includes('#'))
            s_index = s.lastIndexOf('#');
        else
            s_index = s.lastIndexOf('/');
        return s.substring(0,s_index+1) + (s.charAt(s_index+1).toUpperCase()) + s.substring(s_index+2, s.length)
    }
    else if (s.includes(':')){
        return capitalizeFirstLetterAfterPrefix(s)
    }
    else
        return capitalizeFirstLetter(s)
}
