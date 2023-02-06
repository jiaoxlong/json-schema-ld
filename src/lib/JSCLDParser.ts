import {CompositionSchema, BaseSchema, Schema, ClassSchema} from "./JSONSchema";
import {Traverse} from "./traverse";
import {Config} from "./ConfigParser";
import {RDFS_PREFIX, SHACL_PREFIX} from "../utils/Prefix";
import * as fs from 'fs';
import * as path from "path";
import {
    add_writer_list, blank_node_list,
    blank_node_literal,
    blank_node_node,
    node_node_literal,
    node_node_node
} from "../utils/n3_utils";
import {extract_resource_from_uri, capitalizeLastFragment} from "../utils/misc";
import {SCHEMA_SHACL_ANNOTATION} from "../utils/SchemaKWMapping";
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, quad } = DataFactory;

/**
 * The JSCLDSchema processes schema instances parsed from JSON schema, serialize and export them to RDF.
 */
export class JSCLDSchema{
    /**
     * A ConfigParser object contains all necessary configuration for parsing JSON schema.
     */
    config:Config;
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
     * Shacl prefix URI for named shapes
     */
    shacl_shape_uri:string;

    /**
     * Base resource name
     */
    base_resource_name:string;
    private stats: string;

    /**
     * The constructor of JSCLDSchema
     * @param jsc Path to the JSON schema document
     * @param config A ConfigParser object contains all necessary configuration for parsing JSON schema.
     */
    constructor(jsc:string, config:Config ){
        this.config = config;
        this.jsc = path.resolve(jsc);
        /** data A JSON object parsed from the JSON schema document */
        this.data = require(this.jsc);
        /** stats */
        this.stats = '';
        /** The base JSC-LD schema */
        this.base_schema = new BaseSchema(this.data, this.config,this.data['$id'])
        /** The N3Writer instance that writes RDF vocab */
        this.rdf_writer = new N3.Writer({...this.config.rdfs_prefix,...{'format':this.config.format}});
        this.base_resource_name = extract_resource_from_uri(this.base_schema.id)
        //when base_url is ended with either '#' or '/'
        const base_shacl_shape_uri = this.config.uri.slice(0,-1)+'/shapes/'+ this.base_resource_name + '#';
        this.shacl_shape_uri = base_shacl_shape_uri;
        const shacl_prefix = SHACL_PREFIX
        shacl_prefix.prefixes[this.config.prefix+'shape']= base_shacl_shape_uri
        /** The N3Writer instance writes RDF shapes */
        this.shacl_writer = new N3.Writer({...this.config.shacl_prefix,...{'format':this.config.format}});
        /** Schema instances parsed from JSON schema */
        this.schemas = new Traverse(this.base_schema.id,this.data, this.config).schemas;
    }

    /**
     * serialize JSC-LD (Base) schema and schema instances parsed from JSON Schema document to RDF
     */
    serialize(){

        /** meta schema obsolete

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
                const namedNodeList:any[] = [];
                for (const t of value){
                    this.rdf_writer.addQuad(node_node_node(this.config.id, key, t));
                }
            }
        });
         */

        /** Base schema */

        //Schema annotation
        for (const [key, value] of this.base_schema.annotation) {
            this.rdf_writer.addQuad(node_node_literal(this.base_schema.id, key, value));
        }

        // Shacl Shape
        let shacl_shape_uri:string = this.shacl_shape_uri+ this.base_resource_name+'Shape';
        this.shacl_writer.addQuad(node_node_node(shacl_shape_uri, 'rdf:type', 'sh:NodeShape'));
        this.shacl_writer.addQuad(node_node_node(shacl_shape_uri, 'sh:targetClass',  this.base_schema.id));

        /**
         * iteration over properties
         */

        for (const s of this.schemas){
            if (!(s instanceof ClassSchema)) {
                this.stats += extract_resource_from_uri(s.property_name) + '\n'
            }
            if (s.isIgnored){
                continue;
            }
            else {
                // property/class annotations
                const shacl_annot_node=[];
                for (const [k, v] of s.annotation) {
                    shacl_annot_node.push(blank_node_literal(SCHEMA_SHACL_ANNOTATION[k], v));
                    if (!s.isExisting)
                        this.rdf_writer.addQuad(node_node_literal(s.id, k, v));
                }

                /**
                 * Classes
                 */
                if (s instanceof ClassSchema){
                    if ((s.id.includes('#')) || (s.id.includes('/')) || (s.id.includes(':'))){
                        shacl_shape_uri = this.config.prefix + ':' + extract_resource_from_uri(s.id)+'Shape';
                    }
                    else
                        shacl_shape_uri = this.config.prefix + ':'+s.id+'Shape'
                    // Class SHACL NodeShape
                    this.shacl_writer.addQuad(node_node_node(shacl_shape_uri, 'rdf:type', 'sh:NodeShape'));
                    // Class Shacl targetClass
                    this.shacl_writer.addQuad(node_node_node(shacl_shape_uri, 'sh:targetClass', s.id));
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
                    const shacl_path_node = blank_node_node('sh:path', s.id);

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
                                this.rdf_writer.addQuad(e, namedNode('rdfs:label'),literal(e.id.replace(this.config.prefix + ':', '')));
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
                                    e.replace(this.config.prefix + ':', '')))
                                for (const [k, v] of s.enum[e])
                                    this.rdf_writer.addQuad(node_node_literal(e, k, v));
                            }
                        }
                    }

                    //composition schema
                    if (s instanceof CompositionSchema) {
                        const shacl_com_blank_nodes = []
                        for (const schema of s.schemas){

                            if(schema.annotation!== undefined) {
                                for (const [k, v] of schema.annotation) {
                                    schema.shacl.push(
                                        blank_node_literal(SCHEMA_SHACL_ANNOTATION[k], v));
                                }
                            }
                            shacl_com_blank_nodes.push(
                                this.shacl_writer.blank(add_writer_list(schema.shacl, this.shacl_writer)))

                        }
                        const shacl_com_node = {
                            'predicate':namedNode(s.logical_opt),
                            'object':this.shacl_writer.list(shacl_com_blank_nodes)
                        }
                        this.shacl_writer.addQuad(quad(
                                namedNode(shacl_shape_uri),
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
                        const shacl_blank_nodes = [shacl_path_node].concat(shacl_annot_node).concat(
                            add_writer_list(s.shacl, this.shacl_writer));

                        this.shacl_writer.addQuad(quad(
                                namedNode(shacl_shape_uri),
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
        if(!fs.existsSync(path.resolve(this.config.out)))
            fs.mkdirSync(path.resolve(this.config.out), {recursive: true})
        fs.writeFile(path.join(this.config.out, path.parse(this.jsc).name+'_stats.txt'), this.stats, (err:any) =>{
            if (err) throw err;
        });
        this.rdf_writer.end((error:any, result:any) =>
            fs.writeFile(path.join(this.config.out, path.parse(this.jsc).name+'_rdfs.ttl'), result, (err:any) => {
                if (err) throw err;
            }));
        this.shacl_writer.end((error:any, result:any) =>
            fs.writeFile(path.join(this.config.out, path.parse(this.jsc).name+'_shacl.ttl'), result, (err:any) => {
                if (err) throw err;
            }));
    }

}

