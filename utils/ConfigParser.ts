import {Schema} from '../lib/JSONSchema';
import {ConfigMapping} from "../lib/ConfigMapping";
import {match} from './match';
import {JSC_LD_PREFIX} from "../lib/Prefix";
import * as fs from "fs";

export class ConfigParser{
    id:string;
    source:any[];
    out_dir:string;
    base_prefix:string;
    base_url:string;
    annot:Map<string,any>;
    data:object;
    constructor(config_path:string, prefix:object=JSC_LD_PREFIX) {
        if (isValidHttpUrl(config_path)){
            // Todo: fetch a json config from web
            // utils/fetch.ts
        }
        else{
            // local config
            this.data = require(config_path);
            this.annot = match(ConfigMapping,this.data);
            if ('$id' in this.data) this.id = this.data['$id'];
            else throw Error('Unknown JSON Schema extension format. An "$id" attribute is expected!');
            if ('source' in this.data) {
                let source = [];
                if (fs.statSync(this.data['source']).isDirectory()){
                    fs.readdirSync(this.data['source']).forEach(file => {
                        source.push(file);
                    });

                }
                else if (fs.statSync(this.data['source']).isFile()) {
                    source.push(this.data['source']);
                }
                else throw Error("The 'source' given in the JSON Schema extension file neither points to a directory " +
                        "nor to a file");
                this.source = source;
            }
            else throw Error('Unknown JSON Schema extension format. A "ref" attribute is expected!');
            if ('base_prefix' in this.data) this.base_url = this.data['base_prefix'];
            else throw Error('Unknown JSON Schema extension format. A "base_prefix" attribute is expected!');
            if ('base_url' in this.data) this.base_url = this.data['base_url'];
            else throw Error('Unknown JSON Schema extension format. A "base_url" attribute is expected!');
            if ('out_dir' in this.data) this.out_dir = this.data['out_dir'];
            else this.out_dir = 'out';
        }
    }
}


/**
 * isValidHttpUrl() use a simple and naive way to valid if a given string is a URL.
 *
 * @param string
 */
export function isValidHttpUrl(string) {
    return (string.startsWith('http') || string.startsWith('https'));
}

let config  = new ConfigParser('../configs/config.json');
//console.log(config.annot);

