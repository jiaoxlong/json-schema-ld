import {JSC_LD_PREFIX} from "../utils/Prefix";
import {N3FormatTypes} from "../utils/types";
import type {Logger} from '@treecg/types';
import {getLogger}from '@treecg/types';
import type {CLIArguments} from "../utils/types";
import fs from "fs";
import path from "path";

/**
 * The ConfigParser class parses a JSC LD configuration document
 */
export class Config{
    /**
     * CLIArguments
     */
    private readonly cliArgs:CLIArguments;
    /**
     * path to a source JSC file or a folder in the system contains source JSC files
     */
    private readonly _source:any[];
    /**
     * output directory
     */
    public out:string;
    /**
     * a namespace prefix for the project
     */
    private readonly _prefix:string;
    /**
     * The name prefix binding to an uri
     */
    private readonly _uri:string;
    /**
     * automatically resolve associated class between properties if it is set to true
     */
    public auto:boolean;
    /**
     * Serialization format. Formats to ttl.
     */
    public format:typeof N3FormatTypes[number];
    /**
     * jsc-ld logger
     */
    public logger:Logger

    constructor(cliArgs:CLIArguments, prefix:object=JSC_LD_PREFIX) {
        this.logger = getLogger('jsc-ld');
        this.cliArgs = cliArgs;
        this.format = cliArgs.format === undefined ? "Turtle" : cliArgs.format;
        if (isValidPrefix(cliArgs.prefix))
            this._prefix = cliArgs.prefix;
        else
            throw new Error(`Invalid namespace prefix ${cliArgs.prefix}`)
        if (isValidHttpURI(cliArgs.uri))
            this._uri = cliArgs.uri
        else
            throw new Error(`Invalid namespace URI ${cliArgs.uri}`)
        this.out = 'out' in cliArgs ? cliArgs.out : 'out'
        this._source = this.jsc_source_files(cliArgs.source)
        /** for the time being, we set this.auto to true */
        this.auto = true

    }
    public get source(){
        return this._source;
    }
    public get prefix(){
        return this._prefix;
    }
    public get uri(){
        return this._uri;
    }
    /**
     * collects JSC-LD file path or paths to multiple JSC-LD files from a given source directory defined by command line argument --source/-s
     *
     * @param args command line arguments
     */
    jsc_source_files(source:string){
        const source_list:string[] = [];
        const source_res = path.resolve(source)
        try {
            if (fs.statSync(source_res).isDirectory()) {
                fs.readdirSync(source_res).forEach(file => {
                    if (fs.statSync(path.join(source_res, file)).isDirectory())
                        this.logger.info('When path of a directory is passed as --source/-s argument, only .json files in the directory are expected.')
                    else if (fs.statSync(path.join(source_res, file)).isFile()){
                        if (file.endsWith('.json')) {
                            if (!file.endsWith('config.json')) {
                                source_list.push(path.join(source_res, file));
                            }
                        }
                        else
                            this.logger.info(`${fs.statSync(path.join(source_res, file))}+ is not of type json file.`);
                    }
                });
            }
            if (fs.statSync(source_res).isFile()) {
                source_list.push(source_res);
            }
            if (source_list.length === 0) {
                throw new Error('No JSON Schema files can be found!');
            }
            else
                return source_list;
        }
        catch (err:any) {
            this.logger.error("The given 'source' property neither points to a directory " +
                "nor to a file")
            this.logger.info(err)
        }
    }
}

/**
 * isValidPrefix() validates a namespace prefix
 * @param prefix
 */

export function isValidPrefix(prefix:string){
    const regex = /^\w+$/;
    return !!regex.test(prefix);
}


/**
 * isValidHttpUri() use a simple way to valid if a given string is a URL.
 *
 * @param uri namespace uri
 */
export function isValidHttpURI(uri:string) {
    return (uri.startsWith('http') || uri.startsWith('https'));
}

export function validate_path(path_to_file:string){
    try {
        return fs.statSync(path_to_file).isDirectory() || fs.statSync(path_to_file).isFile();
    }
    catch(err) {
        throw new Error(path_to_file + ' does not exist in the system');
    }
}

