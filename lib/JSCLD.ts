import {BaseSchema, Property} from "./JSONSchema";
import {ConfigParser} from "../utils/ConfigParser";
import {JSC_LD_PREFIX} from "./Prefix";
import * as fs from 'fs';
import * as path from "path";
const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class JSCLDSchema{
    config:ConfigParser;
    data:object;
    base_schema: BaseSchema;
    writer:any;
    properties:Property[];
    constructor(config:ConfigParser, source){
        this.config = config;
        this.data = require(source);
        this.base_schema = new BaseSchema(this.data);
        this.writer = new N3.Writer(JSC_LD_PREFIX);
        //this.properties = traverse(data);

    }

    serialize(){
        /*
         A-LD rdf:type jsonsc-ld:Schema;
             jsonsc-ld:enriches jsonsc:DataSchema;
             dcterms:title A.title;
             dcterms:description A.description;
             dcterms:creator A.creator[];
             dcterms:license A.license;
             dcterms:rights A.rights;
             dcterms:modified xsd:DateTime.

         */
        this.writer.addQuad(
            namedNode(this.config.id),
            namedNode('rdf:type'),
            namedNode('jsonsc-ld:Schema')
        );
        this.writer.addQuad(
            namedNode(this.config.id),
            namedNode('jsonsc-ld:enriches'),
            namedNode(this.base_schema.id)
        );


        this.config.annot.forEach((value:any, key:string) => {
            if (typeof (value)== 'string'){
                this.writer.addQuad(
                    namedNode(this.config.id),
                    namedNode(key),
                    literal(value)
                )
            }
            if (Array.isArray(value)){
                let namedNodeList = [];
                for (let t of value){
                    namedNodeList.push(namedNode(t));
                }
                this.writer.addQuad(
                    namedNode(this.config.id),
                    namedNode(key),
                    this.writer.list(namedNodeList)
                )
            }
        });
    }
}



let config = new ConfigParser('../configs/config.json');
let ld = new JSCLDSchema(config,'../GBFS-LD/station_information.json');
ld.serialize();
ld.writer.end((error:any, result:any) =>
    fs.writeFile(path.join(config.out_dir, 'out.ttl'), result, (err:any) => {
    if (err) throw err;
}));

