import {ISerializer, format, rdfFormatType, shapeFormatType, jsonFormatType} from '../utils/types'
import {IncomingMessage} from "http";

// not in use yet

abstract class Serializer implements ISerializer {
    /**
     * the baseclass which all (sub) Serializer classes inherit from
     */
    public readonly data: object = {};
    protected constructor(data:object) {
        this.data = data;
    }
    abstract serialize():void;
    abstract materialize():void;

}

export abstract class RDFSerializer extends Serializer {

    private serialFormat: rdfFormatType = "turtle";
    private shapeFormat: shapeFormatType = 'turtle';
    private toMaterialize: boolean = true;
    private outFolder?: string = __dirname;

    constructor(data: object,
                serialFormat: rdfFormatType,
                shapeFormat: shapeFormatType,
                toMaterialize: boolean,
                outFolder?: string) {
        super(data);
        this.serialFormat = serialFormat;
        this.shapeFormat = shapeFormat;
        this.toMaterialize = toMaterialize;

        const fs = require('fs').promises;
        try{
            if (fs.existsSync(outFolder) && fs.lstatSync(outFolder).isDirectory()){
                this.outFolder = outFolder;
            }
            else{
                    fs.mkdirSync(this.outFolder);
                }
            }
        catch (error:any){
            console.error(error);
        }
    }

    abstract serialize(): void ;

    abstract materialize(): void;
}

export abstract class JSONSchemaSerializer extends Serializer {

    private serialFormat: jsonFormatType = "json-schema";
    private toMaterialize: boolean = true;
    private outFolder?: string = __dirname;

    constructor(data: object,
                serialFormat: jsonFormatType,
                toMaterialize: boolean,
                outFolder?: string) {
        super(data);
        this.serialFormat = serialFormat;
        this.toMaterialize = toMaterialize;
        this.outFolder = outFolder;
    }

    abstract serialize(): void ;
    abstract materialize(): void;
}

function traverse(jsonSchema:object):void{

}

async function fetchRefSchema(url:string) {
    const response = await fetch(url);
    const res = await response.json();
    return await res;
}
console.log(fetchRefSchema('https://smart-data-models.github.io/data-models/common-schema.json#/definitions/GSMA-Commons'));
