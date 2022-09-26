import {CompositionSchema, BaseSchema, Schema, ClassSchema} from "./JSONSchema";
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
} from "../utils/n3_utils";
import {SCHEMA_SHACL_ANNOTATION} from "../utils/SchemaKWMapping";
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

/**
 * The JSCLDSchema processes schema instances parsed from JSON schema, serialize and export them to RDF.
 */
export class JSCLDSchema{
    /**
     * A ConfigParser object contains all necessary configuration for parsing JSON schema.
     */
    config:ConfigParser;
    /**
     * Path to the JSON schema document
     */
    jsc:string;
    /**
     * A JSON object parsed from the JSON schema document
     */
    data:object;
    /**
     * The base JSC-LD schema generated from JSC-LD configuration
     */
    base_schema: BaseSchema;
    /**
     * Schema instances parsed from JSON schema
     */
    schemas:Schema[];
    /**
     * The N3Writer instance writes RDF vocabulary
     */
    rdf_writer:any;
    /**
     * The N3Writer instance writes RDF shapes
     */
    shacl_writer:any;

    /**
     * The constructor of JSCLDSchema
     * @param jsc Path to the JSON schema document
     * @param config A ConfigParser object contains all necessary configuration for parsing JSON schema.
     * @param data A JSON object parsed from the JSON schema document
     * @param base_schema The base JSC-LD schema generated from JSC-LD configuration
     * @param rdf_writer The N3Writer instance writes RDF vocabulary
     * @param shacl_writer The N3Writer instance writes RDF shapes
     * @param schemas Schema instances parsed from JSON schema
     */
    constructor(jsc:string, config:ConfigParser ){
        this.config = config;
        this.jsc = path.resolve(jsc);
        this.data = require(this.jsc);
        this.base_schema = new BaseSchema(this.data, this.config,this.data['$id'])
        this.rdf_writer = new N3.Writer({...RDFS_PREFIX,...{'format':this.config.format}});
        this.shacl_writer = new N3.Writer({...SHACL_PREFIX,...{'format':this.config.format}});
        this.schemas = new Traverse(this.base_schema.id,this.data, this.config).schemas;
    }

    /**
     * serialize JSC-LD (Base) schema and schema instances parsed from JSON Schema document to RDF
     */
    serialize(){

        /** Base schema */

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
        let shacl_shape =  this.base_schema.id+'Shape';
        this.shacl_writer.addQuad(node_node_node(shacl_shape, 'rdf:type', 'sh:NodeShape'));
        this.shacl_writer.addQuad(node_node_node(shacl_shape, 'sh:targetClass',  this.base_schema.id));

        /**
         * iteration over properties
         */

        for (let s of this.schemas){
            if (s.isIgnored){
                continue;
            }
            else {
                // property/class annotations
                let shacl_annot_node=[];
                if (!s.isExisting) {
                    for (let [k, v] of s.annotation) {
                        this.rdf_writer.addQuad(node_node_literal(s.id, k, v));
                        shacl_annot_node.push(blank_node_literal(SCHEMA_SHACL_ANNOTATION[k], v))
                    }
                }
                /**
                 * Classes
                 */
                if (s instanceof ClassSchema){
                    if (s.id.includes('#'))
                        shacl_shape = this.config.base_prefix + ':' + s.id.substring(s.id.lastIndexOf('#')+1)+'Shape';
                    else if (s.id.includes('/')) {
                        shacl_shape = this.config.base_prefix + ':' + s.id.substring(s.id.lastIndexOf('/') + 1) + 'Shape';
                    }
                    else
                        shacl_shape = this.config.base_prefix + ':'+s.id+'Shape'
                    // Class SHACL NodeShape
                    this.shacl_writer.addQuad(node_node_node(shacl_shape, 'rdf:type', 'sh:NodeShape'));
                    // Class Shacl targetClass
                    this.shacl_writer.addQuad(node_node_node(shacl_shape, 'sh:targetClass', s.id));
                    this.rdf_writer.addQuad(s.rdfs)
                    if (! s.isExisting) {
                        this.rdf_writer.addQuad(node_node_literal(
                            s.id,
                            'rdfs:label',
                            s.label));
                        shacl_annot_node.push(blank_node_literal('sh:name', s.label))
                    }
                }
                /**
                 * Properties
                 */
                else {
                    // property type
                    let shacl_path_node = blank_node_node('sh:path', s.id);

                    // To do: handle non-required property which has 'minItems' or 'maxItems' attribute.

                    this.rdf_writer.addQuad(node_node_node(s.id, 'rdf:type', 'rdf:Property'));

                    //property label and property domain
                    if (!s.isExisting) {
                        this.rdf_writer.addQuad(node_node_literal(
                            s.id,
                            'rdfs:label',
                            s.label));

                        shacl_annot_node.push(blank_node_literal('sh:name',
                            s.label));
                        this.rdf_writer.addQuad(node_node_node(
                            s.id,
                            'rdfs:domain',
                            s.subject));
                    }
                    //skos enum
                    if (s.enum) {
                        // rdfs
                        /**
                         * When ld.id is set with full URI, captitalizeFirstLetterAfterPrefix will not work!
                         */
                        this.rdf_writer.addQuad(node_node_node(
                            capitalizeLastFragment(s.id),
                            'rdf:type',
                            'skos:ConceptScheme'));

                        if (s.enum instanceof Array<any>) {
                            this.rdf_writer.addQuad(
                                namedNode(s.id),
                                namedNode('rdfs:range'),
                                this.rdf_writer.blank(
                                    [blank_node_list('owl:oneOf', this.rdf_writer.list(s.enum))]));
                            for (const e of s.enum) {
                                this.rdf_writer.addQuad(e,namedNode('rdf:type'), namedNode('skos:Concept'));
                                this.rdf_writer.addQuad(e,namedNode('skos:inScheme'),namedNode(capitalizeLastFragment(s.id)));
                                this.rdf_writer.addQuad(e, namedNode('rdfs:label'),literal(e.id.replace(this.config.base_prefix + ':', '')));
                            }
                        }

                        if (s.enum.constructor == Object){
                            this.rdf_writer.addQuad(
                                namedNode(s.id),
                                namedNode('rdfs:range'),
                                this.rdf_writer.blank(
                                    [blank_node_list('owl:oneOf',
                                        this.rdf_writer.list(Object.keys(s.enum).map(x => namedNode(x))))]));
                            for (const e in s.enum) {
                                this.rdf_writer.addQuad(node_node_node(e, 'rdf:type', 'skos:Concept'));
                                this.rdf_writer.addQuad(node_node_node(e,'skos:inScheme',
                                    capitalizeLastFragment(s.id)));
                                this.rdf_writer.addQuad(node_node_literal(e, 'rdfs:label',
                                    e.replace(this.config.base_prefix + ':', '')))
                                for (let [k, v] of s.enum[e])
                                    this.rdf_writer.addQuad(node_node_literal(e, k, v));
                            }
                        }
                    }

                    //composition schema
                    if (s instanceof CompositionSchema) {

                        let shacl_com_blank_nodes = []

                        for (let schema of s.schemas){
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
                        if (s.range){
                            this.rdf_writer.addQuad(quad(
                                namedNode(s.id),
                                namedNode('rdfs:range'),
                                namedNode(s.range)));
                        }
                        else{
                            if ((!s.enum) && (!s.isExisting)) {
                                this.rdf_writer.addQuad(quad(
                                    namedNode(s.id),
                                    namedNode('rdfs:range'),
                                    s.rdfs));
                            }
                        }
                        let shacl_blank_nodes = [shacl_path_node].concat(shacl_annot_node).concat(
                            add_writer_list(s.shacl, this.shacl_writer));

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

    /**
     * exports RDF vocabulary and shapes
     */
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
 * Capitalize the first letter of a string
 * @param s string
 */
function capitalizeFirstLetter(s)
{
    return s[0].toUpperCase() + s.slice(1);
}

/**
 * Capitalize the first letter of a resource string in an URI with namespace prefix.
 * @param s string
 */
function capitalizeFirstLetterAfterPrefix(s:string){
    let ind = s.indexOf(':')
    return s.slice(0, ind+1)+s[ind+1].toUpperCase()+s.slice(ind+2)
}

/**
 * Capitalize the first letter of a resource string in a hash URI or a slash URI
 * @param s string
 */
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
