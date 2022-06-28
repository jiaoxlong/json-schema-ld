import {
    AnyOfSchema,
    BooleanSchema,
    CompositionSchema,
    IntegerSchema,
    NullSchema,
    NumberSchema, ObjectSchema,
    Property,
    StringSchema
} from "../lib/JSONSchema";
import {SCHEMA_COMPOSITIONS} from "../lib/schemaKWs";
import {ConfigParser} from "./ConfigParser";

export class Traverse{
    id:string;
    _properties:Property[] = [];
    config:ConfigParser;
    constructor(id:string, data:object, config:ConfigParser){
        this.id = id;
        this.config = config;
        this.traverse(data)
    }
    public get properties(){
        return this._properties;
    }

    traverse(data){
        for (let property in data['properties']) {
            let isRequired = data.required?.includes(property) ? true : false;
            if (data.properties[property].type === 'string') {
                let string_schema = new StringSchema(data.properties[property], this.config, property);
                let p_ins = new Property(this.config, this.id, property, string_schema, isRequired);
                this._properties.push(p_ins);
            }
            if (data.properties[property].type === 'integer') {
                let int_schema = new IntegerSchema(data.properties[property], this.config, property);
                let p_ins = new Property(this.config,this.id, property, int_schema, isRequired);
                this._properties.push(p_ins);
            }
            if (data.properties[property].type === 'number') {
                let number_schema = new NumberSchema(data.properties[property], this.config, property);
                let p_ins = new Property(this.config,this.id, property, number_schema, isRequired);
                this._properties.push(p_ins);

            }
            if (data.properties[property].type === 'boolean') {
                let boolean_schema = new BooleanSchema(data.properties[property], this.config, property);
                let p_ins = new Property(this.config,this.id, property, boolean_schema, isRequired);
                this._properties.push(p_ins);
            }
            if (data.properties[property].type === 'null') {
                let null_schema = new NullSchema(data.properties[property], this.config, property);
                let p_ins = new Property(this.config,this.id, property, null_schema, isRequired);
                this._properties.push(p_ins);
            }
            if (data.properties[property].type === 'object') {
                let obj_schema = new ObjectSchema(data.properties[property], this.config, property);
                let p_ins = new Property(this.config,this.id, property, obj_schema, isRequired);
                this.traverse(data.properties[property]);
            }

            if (data.properties[property].type === 'array') {
                this.traverse(data.properties[property].items)
            }

            if ('anyOf' in data.properties[property]) {
                let p_ins = new Property(
                    this.config,
                    this.id,
                    property,
                    new AnyOfSchema(data.properties[property], this.config, property, 'anyOf'),
                    isRequired);
                this._properties.push(p_ins)
            }
            if ('allOf' in data.properties[property]) {
                let p_ins = new Property(
                    this.config,
                    this.id,
                    property,
                    new AnyOfSchema(data.properties[property], this.config, property, 'allOf'),
                    isRequired);
                this._properties.push(p_ins)
            }
            if ('oneOf' in data.properties[property]) {
                let p_ins = new Property(
                    this.config,
                    this.id,
                    property,
                    new AnyOfSchema(data.properties[property], this.config, property, 'oneOf'),
                    isRequired);
                this._properties.push(p_ins)
            }
            if ('not' in data.properties[property]) {
                let p_ins = new Property(
                    this.config,
                    this.id,
                    property,
                    new AnyOfSchema(data.properties[property], this.config, property, 'not'),
                    isRequired);
                this._properties.push(p_ins)
            }

        }
    }

}


