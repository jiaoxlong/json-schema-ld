import {
    AnyOfSchema, AllOfSchema, NotSchema, OneOfSchema,
    BooleanSchema,
    CompositionSchema,
    IntegerSchema,
    NullSchema,
    NumberSchema, ObjectSchema,
    Property,
    StringSchema, ArraySchema, ClassSchema
} from "../lib/JSONSchema";
import {SCHEMA_ANNOTATIONS, SCHEMA_COMPOSITIONS} from "../lib/schemaKWs";
import {ConfigParser} from "./ConfigParser";
import {match} from "./match";
import {SchemaOptArgs} from "./types";

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

    traverse(data) {
        if ('required' in data) {
            if (data['required'] instanceof Array)
                this.required = [...this.required, ...data['required']]
        }
        let minItems: number = 0;
        let maxItems: number = 0;
        if ('minItems' in data) minItems = data.minItems;
        if ('maxItems' in data) maxItems = data.maxItems;
        if ('properties' in data) {
            // 'required' keyword appear priors to the required properties in a JSON schema.

            for (const property in data['properties']) {
                let isRequired: boolean = false;
                let isExisting: boolean = false;
                if (this.required.indexOf(property) > -1) {
                    isRequired = true;
                }
                if ('ld.existing' in data.properties[property]) {
                    isExisting = true;
                }
                if (data.properties[property].type === 'string')
                    this.createStringProperty(data.properties[property], this.config, this.current, property,
                        {isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'integer')
                    this.createIntegerProperty(data.properties[property], this.config, this.current, property,
                        {isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'number')
                    this.createNumberProperty(data.properties[property], this.config, this.current, property,
                        {isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'boolean')
                    this.createBooleanProperty(data.properties[property], this.config, this.current, property,
                        {isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'null')
                    this.createNullProperty(data.properties[property], this.config, this.current, property,
                        {isRequired: isRequired, isExisting: isExisting});
                if ('anyOf' in  data.properties[property])
                    this.createAnyOfProperty(data.properties[property], this.config, this.current, property, {isRequired: isRequired, isExisting: isExisting});

                if ('allOf' in  data.properties[property])
                    this.createAllOfProperty(data.properties[property], this.config, this.current, property, {isRequired: isRequired, isExisting: isExisting});

                if ('oneOf' in  data.properties[property])
                    this.createOneOfProperty(data.properties[property], this.config, this.current, property, {isRequired: isRequired, isExisting: isExisting});

                if ('not' in  data.properties[property])
                    this.createNotProperty(data.properties[property], this.config, this.current, property, {isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'object') {
                    if (data.properties[property]['ld.included'] === true) {
                        // handling patterProperties inside an object schema
                        if ('patternProperties' in data.properties[property]) {
                            for (const pp in data.properties[property].patternProperties) {
                                this.traverse(data.properties[property].patternProperties[pp])
                            }
                        } else
                            this.traverse(data.properties[property]);
                    } else {

                        if ('ld.blank' in data.properties[property]) {
                            if (data.properties[property]['ld.range'] === undefined)
                                throw new Error('Except "ld.blank" attribute when using "ld.blank"');
                            const ld_blank_class = data.properties[property]['ld.range']
                            if (data.properties[property]['ld.blank'] == true) {
                                this.createObjectProperty(data.properties[property], this.config,this.current,property,
                                    {
                                        isRequired: isRequired,
                                        isExisting: isExisting,
                                    })
                                this.createClassProperty({}, this.config, ld_blank_class,ld_blank_class,
                                    {isClass: true});
                                this.previous = this.current;
                                this.current = ld_blank_class;
                                this.traverse(data.properties[property]);
                                this.current = this.previous;
                            }
                        }
                        // ld.enum Object schema only
                        else if ('ld.enum' in data.properties[property]) {
                            if (data.properties[property]['ld.enum'] == true) {
                                let enum_tmp = {};
                                for (const p in data.properties[property].properties) {
                                    enum_tmp[p]  = match(SCHEMA_ANNOTATIONS, data.properties[property].properties[p]);
                                }
                                this.createObjectProperty(data.properties[property], this.config, this.current,property,
                                    {
                                        isRequired: isRequired,
                                        isExisting: isExisting,
                                        isEnum: true,
                                        ld_enum: enum_tmp
                                    });
                                continue
                            }
                        } else {
                            this.createObjectProperty(data.properties[property], this.config, this.current,property,
                                {isRequired: isRequired, isExisting: isExisting});
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
                            this.createArrayProperty(data.properties[property], this.config, this.current,property,
                                {
                                    isClass: true, isRequired: isRequired,
                                    isExisting: isExisting,
                                    minItems: minItems,
                                    maxItems: maxItems
                                });
                            this.traverse(data.properties[property].items);
                        }
                        else if (data.properties[property]['ld.blank'] === true) {
                            if (data.properties[property]['ld.range'] === undefined)
                                throw new Error('Except "ld.blank" attribute when using "ld.blank"');
                            const ld_array_blank_class = data.properties[property]['ld.range']
                            this.createArrayProperty(data.properties[property], this.config, this.current,property,
                                {
                                    isRequired: isRequired,
                                    isExisting: isExisting,
                                });
                            this.createClassProperty({}, this.config,  ld_array_blank_class, ld_array_blank_class,
                                {isClass: true});
                            this.previous = this.current;
                            this.current = ld_array_blank_class;
                            this.traverse(data.properties[property].items);
                            this.current = this.previous;
                        }
                        // non-object-type schema inside an array schema
                        else {
                            this.current = property
                            this.traverse(data.properties[property]);

                        }
                        this.current = this.previous;
                    }
                    // when an array schema does not have "properties"
                    else{

                        this.current = property;
                        this.traverse(data.properties[property]);
                        this.current = this.previous;


                    }
                }
            }
        }
        else {
            //When an array schema contains non-object schema
            // isRequired and isExisting are not considered here.
            if ('items' in data) {
                if (data.items.type === 'string')
                    this.createStringProperty(data.items, this.config, this.previous, this.current,
                        {});

                if (data.items.type === 'integer')
                    this.createIntegerProperty(data.items, this.config, this.previous, this.current,
                        {});

                if (data.items.type === 'number')
                    this.createNumberProperty(data.items, this.config, this.previous, this.current,
                        {});

                if (data.items.type === 'boolean')
                    this.createBooleanProperty(data.items, this.config,this.previous, this.current,
                        {});

                if (data.items.type=== 'null')
                    this.createNullProperty(data.items, this.config, this.previous, this.current,
                        {});

                if ('anyOf' in  data.items)
                    this.createAnyOfProperty({}, this.config, this.previous, this.current, {});

                if ('allOf' in  data.items)
                    this.createAllOfProperty({}, this.config, this.previous, this.current, {});

                if ('oneOf' in  data.items)
                    this.createOneOfProperty({}, this.config, this.previous, this.current, {});

                if ('not' in  data.items)
                    this.createNotProperty({}, this.config, this.previous, this.current, {});

            }
        }
    }
    createStringProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                         {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={} ){
        let string_schema = new StringSchema(data, config, property,
            {isClass:isClass, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});

        let p_ins = new Property(config, subject, property, string_schema);
        this.properties.push(p_ins);
    }

    createIntegerProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                          {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={} ){
        let int_schema = new IntegerSchema(data, config, property,
            {isClass:isClass, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});
        let p_ins = new Property(config, subject, property, int_schema);
        this.properties.push(p_ins);
    }

    createNumberProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                         {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={} ){
        let num_schema = new NumberSchema(data, config, property,
            {isClass:isClass, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});
        let p_ins = new Property(config, subject, property, num_schema);
        this.properties.push(p_ins);
    }

    createBooleanProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                          {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let boolean_schema = new BooleanSchema(data, config, property,
            {isClass:isClass, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});
        let p_ins = new Property(config, subject, property, boolean_schema);
        this.properties.push(p_ins);
    }

    createObjectProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                         {isClass=false, isExisting=false, isIgnored=false, isRequired=false, isEnum=false, ld_enum={}}:SchemaOptArgs={}){
        if (isEnum == false && Object.keys(ld_enum).length!=0)
            throw new Error('When "isEnum" is set to false, "ld_enum" must be an empty object.')
        if (isEnum == true && Object.keys(ld_enum).length==0)
            throw new Error('When "isEnum" is set to true, "ld_enum" must not be an empty object.')
        let obj_schema = new ObjectSchema(data, this.config, property,
            {isClass:isClass, isExisting:isExisting, isIgnored:isIgnored, isRequired: isRequired, isEnum:isEnum, ld_enum:ld_enum});

        let p_ins = new Property(this.config, subject, property, obj_schema);
        this.properties.push(p_ins);
    }

    createArrayProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                        {isClass=false, isExisting=false, isIgnored=false, isRequired=false, minItems=0, maxItems=0}:SchemaOptArgs={}){
        let array_schema = new ArraySchema(data, config, property,
            {
                isClass: isClass, isRequired: isRequired,
                isExisting: isExisting, isIgnored:isIgnored,
                minItems: minItems, maxItems: maxItems
            });
        let p_ins = new Property(config, subject, property, array_schema);
        this.properties.push(p_ins)
    }

    createClassProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                        {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        let class_schema = new ClassSchema(data, config, property,
            {
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            });
        let p_ins = new Property(config, subject, property, class_schema);
        this.properties.push(p_ins)
    }
    createNullProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                       {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        let null_schema = new NullSchema(data, config, property,
            {
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            });
        let p_ins = new Property(config, subject, property, null_schema);
        this.properties.push(p_ins)
    }
    createNotProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                      {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let p_ins = new Property(config, subject, property, new NotSchema(data, config, property, 'not',
            {
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            }));
        this.properties.push(p_ins);
    }
    createAnyOfProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                        {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let p_ins = new Property(config, subject, property, new AnyOfSchema(data, config, property, 'anyOf',
            {
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            }));
        this.properties.push(p_ins);
    }
    createOneOfProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                        {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let p_ins = new Property(config, subject, property, new OneOfSchema(data, config, property, 'oneOf',
            {
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            }));
        this.properties.push(p_ins);
    }
    createAllOfProperty(data: {[key:string]: any}, config:ConfigParser, subject:string, property:string,
                        {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let p_ins = new Property(config, subject, property, new AllOfSchema(data, config, property, 'allOf',
            {
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            }));
        this.properties.push(p_ins);
    }
}


