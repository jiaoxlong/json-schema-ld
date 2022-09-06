import {
    AnyOfSchema, AllOfSchema, NotSchema, OneOfSchema,
    BooleanSchema,
    CompositionSchema,
    IntegerSchema,
    NullSchema,
    NumberSchema, ObjectSchema,
    Property,
    StringSchema, ArraySchema
} from "../lib/JSONSchema";
import {SCHEMA_ANNOTATIONS, SCHEMA_COMPOSITIONS} from "../lib/schemaKWs";
import {ConfigParser} from "./ConfigParser";
import {match} from "./match";

export class Traverse{
    id:string;
    properties:Property[] = [];
    config:ConfigParser;
    current:string;
    previous:string;
    required:String[] = [];
    constructor(id:string, data:object, config:ConfigParser){
        this.id = id;
        this.current = this.id;
        this.previous = this.id;
        this.config = config;
        this.traverse(data)

    }

    traverse(data){

        if ('required' in data){
            this.required  = [...this.required, ...data['required']]
        }
        let minItems:number = 0;
        let maxItems:number = 0;
        if ('minItems' in data) minItems = data.minItems;
        if ('maxItems' in data) maxItems = data.maxItems;
        if ('properties' in data){
            // 'required' keyword appear priors to the required properties in a JSON schema.
            for (const property in data['properties']) {
                let isRequired:boolean = false;
                if (this.required.indexOf(property) > -1) {
                    isRequired = true;
                }
                if (data.properties[property].type === 'string') {
                    let string_schema = new StringSchema(data.properties[property], this.config, property,
                        {isRequired:isRequired});
                    let p_ins = new Property(this.config, this.current, property, string_schema);
                    this.properties.push(p_ins);
                }
                if (data.properties[property].type === 'integer') {
                    let int_schema = new IntegerSchema(data.properties[property], this.config, property,
                        {isRequired:isRequired});
                    let p_ins = new Property(this.config, this.current, property, int_schema);
                    this.properties.push(p_ins);
                }
                if (data.properties[property].type === 'number') {
                    let number_schema = new NumberSchema(data.properties[property], this.config, property,
                        {isRequired:isRequired});
                    let p_ins = new Property(this.config, this.current, property, number_schema);
                    this.properties.push(p_ins);

                }
                if (data.properties[property].type === 'boolean') {
                    let boolean_schema = new BooleanSchema(data.properties[property], this.config, property,
                        {isRequired:isRequired});
                    let p_ins = new Property(this.config, this.current, property, boolean_schema);
                    this.properties.push(p_ins);
                }
                if (data.properties[property].type === 'null') {
                    let null_schema = new NullSchema(data.properties[property], this.config, property,
                        {isRequired:isRequired});
                    let p_ins = new Property(this.config, this.current, property, null_schema);
                    this.properties.push(p_ins);
                }
                if (data.properties[property].type === 'object') {
                    if (data.properties[property]['ld.included']===true){
                        this.traverse(data.properties[property]);
                    }
                    else{

                        // ld.enum Object schema only
                        if ('ld.enum' in data.properties[property]){
                            if (data.properties[property]['ld.enum'] == true){
                                let enum_tmp = {};
                                for (const p in data.properties[property].properties){
                                    let annotation = match(SCHEMA_ANNOTATIONS,data.properties[property].properties[p]);
                                    enum_tmp[p] = annotation;
                                }
                                let obj_schema = new ObjectSchema(data.properties[property], this.config, property,
                                    {
                                        isRequired: isRequired,
                                        isEnum:true,
                                        ld_enum:enum_tmp});
                                let p_ins = new Property(this.config, this.current, property, obj_schema);
                                this.properties.push(p_ins);
                                continue
                            }
                        }
                        else {
                            let obj_schema = new ObjectSchema(data.properties[property], this.config, property,
                                {isRequired: isRequired});
                            let p_ins = new Property(this.config, this.current, property, obj_schema);
                            this.properties.push(p_ins);
                            if ((data.properties[property]['ld.geoJsonFeature'] === true) ||
                                (data.properties[property]['ld.enum'] === true)) {
                                continue
                            } else
                                this.traverse(data.properties[property]);
                        }
                    }
                }

                if (data.properties[property].type === 'array') {
                    this.previous = this.current;
                    // object-type schema inside an array schema
                    if ('properties' in data.properties[property].items) {
                        if (data.properties[property]['ld.class'] === true) {
                            this.current = data.properties[property]['ld.id'];
                            let array_schema = new ArraySchema(data.properties[property], this.config, property,
                                {isClass:true, isRequired:isRequired,
                                    minItems:minItems, maxItems:maxItems});
                            let p_ins = new Property(this.config,this.current, property, array_schema);
                            this.properties.push(p_ins)
                            this.traverse(data.properties[property].items);
                        }
                    }
                    // non-object-type schema inside an array schema
                    else{
                        this.current = property
                        this.traverse(data.properties[property]);

                    }
                    this.current = this.previous;
                }

                if ('anyOf' in data.properties[property]) {
                    let p_ins = new Property(
                        this.config,
                        this.id,
                        property,
                        new AnyOfSchema(data.properties[property], this.config, property, 'anyOf'));
                    this.properties.push(p_ins)
                }
                if ('allOf' in data.properties[property]) {
                    let p_ins = new Property(
                        this.config,
                        this.id,
                        property,
                        new AnyOfSchema(data.properties[property], this.config, property, 'allOf'));
                    this.properties.push(p_ins)
                }
                if ('oneOf' in data.properties[property]) {
                    let p_ins = new Property(
                        this.config,
                        this.id,
                        property,
                        new AnyOfSchema(data.properties[property], this.config, property, 'oneOf'));
                    this.properties.push(p_ins)
                }
                if ('not' in data.properties[property]) {
                    let p_ins = new Property(
                        this.config,
                        this.id,
                        property,
                        new AnyOfSchema(data.properties[property], this.config, property, 'not'));
                    this.properties.push(p_ins)
                }

            }
        }
        else{
            //When an array schema contains non-object schema
            if ('items' in data) {
                if (data.items.type === 'string') {
                    let string_schema = new StringSchema(data.items, this.config, this.current,
                        { minItems:minItems, maxItems:maxItems});
                    let p_ins = new Property(this.config, this.previous, this.current, string_schema);
                    this.properties.push(p_ins);
                }
                if (data.type === 'integer') {
                    let int_schema = new IntegerSchema(data.items, this.config, this.current,
                        { minItems:minItems, maxItems:maxItems});
                    let p_ins = new Property(this.config, this.previous, this.current, int_schema);
                    this.properties.push(p_ins);
                }
                if (data.type === 'number') {
                    let number_schema = new NumberSchema(data.items, this.config, this.current,
                        { minItems:minItems, maxItems:maxItems});;
                    let p_ins = new Property(this.config, this.previous, this.current, number_schema);
                    this.properties.push(p_ins);

                }
                if (data.type === 'boolean') {
                    let boolean_schema = new BooleanSchema(data.items, this.config, this.current,
                        { minItems:minItems, maxItems:maxItems});
                    let p_ins = new Property(this.config, this.previous, this.current, boolean_schema);
                    this.properties.push(p_ins);
                }

                if ('anyOf' in data.items) {
                    let p_ins = new Property(
                        this.config,
                        this.previous,
                        this.current,
                        new AnyOfSchema(data.items, this.config, this.current, 'anyOf',
                            { minItems:minItems, maxItems:maxItems}));
                    this.properties.push(p_ins);
                }
                if ('allOf' in data.items) {
                    let p_ins = new Property(
                        this.config,
                        this.previous,
                        this.current,
                        new AllOfSchema(data.items, this.config, this.current,'allOf',
                            { minItems:minItems, maxItems:maxItems}));
                    this.properties.push(p_ins);
                }
                if ('oneOf' in data.items) {
                    let p_ins = new Property(
                        this.config,
                        this.previous,
                        this.current,
                        new OneOfSchema(data.items, this.config, this.current, 'oneOf',
                            { minItems:minItems, maxItems:maxItems}));
                    this.properties.push(p_ins);
                }
                if ('not' in data.items) {
                    let p_ins = new Property(
                        this.config,
                        this.previous,
                        this.current,
                        new NotSchema(data.items, this.config, this.current,'not',
                            { minItems:minItems, maxItems:maxItems}));
                    this.properties.push(p_ins);
                }
            }
        }
    }

}


