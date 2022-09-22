import {
    AnyOfSchema, AllOfSchema, NotSchema, OneOfSchema,
    BooleanSchema,
    CompositionSchema,
    IntegerSchema,
    NullSchema,
    NumberSchema, ObjectSchema,
    StringSchema, ArraySchema, ClassSchema, Schema
} from "./JSONSchema";
import {SCHEMA_ANNOTATIONS, SCHEMA_COMPOSITIONS} from "../utils/schemaKWs";
import {ConfigParser} from "./ConfigParser";
import {match} from "./match";
import {SchemaOptArgs} from "./types";

export class Traverse{
    id:string;
    schemas:Schema[] = [];
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
                    this.createStringProperty(data.properties[property], this.config, property,
                        {subject:this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'integer')
                    this.createIntegerProperty(data.properties[property], this.config,  property,
                        {subject:this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'number')
                    this.createNumberProperty(data.properties[property], this.config, property,
                        {subject: this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'boolean')
                    this.createBooleanProperty(data.properties[property], this.config, property,
                        {subject: this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'null')
                    this.createNullProperty(data.properties[property], this.config, property,
                        {subject: this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});
                if ('anyOf' in  data.properties[property])
                    this.createAnyOfProperty(data.properties[property], this.config, property, {subject:this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if ('allOf' in  data.properties[property])
                    this.createAllOfProperty(data.properties[property], this.config, property, {subject: this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if ('oneOf' in  data.properties[property])
                    this.createOneOfProperty(data.properties[property], this.config, property, {subject: this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if ('not' in  data.properties[property])
                    this.createNotProperty(data.properties[property], this.config, property, {subject: this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

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

                        if ('ld.association' in data.properties[property]) {
                            if (data.properties[property]['ld.range'] === undefined)
                                throw new Error('Expect "ld.range" attribute when using "ld.association"');
                            const ld_blank_class = this.subject_uri(this.config.base_prefix, data.properties[property]['ld.range']);
                            if (data.properties[property]['ld.association'] == true) {
                                this.createObjectProperty(data.properties[property], this.config, property,
                                    {
                                        subject:this.subject_uri(this.config.base_prefix, this.current),
                                        isRequired: isRequired,
                                        isExisting: isExisting,
                                    })
                                this.createClassProperty({}, this.config, ld_blank_class,
                                    {subject:ld_blank_class, isClass: true});
                                this.previous = this.subject_uri(this.config.base_prefix, this.current);
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
                                this.createObjectProperty(data.properties[property], this.config, property,
                                    {
                                        subject: this.subject_uri(this.config.base_prefix, this.current),
                                        isRequired: isRequired,
                                        isExisting: isExisting,
                                        isEnum: true,
                                        ld_enum: enum_tmp
                                    });
                                continue
                            }
                        }
                        else if ('ld.class' in data.properties[property]) {
                            if (data.properties[property]['ld.id']===undefined)
                                throw new Error('"ld.class" is defined, but "ld.id" does not present. ')
                            let ld_class = this.subject_uri(this.config.base_prefix, data.properties[property]['ld.id']);
                            this.createClassProperty({}, this.config, ld_class, {subject: ld_class, isClass: true})
                            this.previous = this.subject_uri(this.config.base_prefix, this.current);
                            this.current = ld_class;
                            this.traverse(data.properties[property]);
                            this.current = this.previous;
                        }

                        else {
                            this.createObjectProperty(data.properties[property], this.config,property,
                                {subject: this.subject_uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});
                            if ((data.properties[property]['ld.geoJsonFeature'] === true) ||
                                (data.properties[property]['ld.enum'] === true)) {
                                continue
                            } else
                                this.traverse(data.properties[property]);
                        }
                    }
                }

                if (data.properties[property].type === 'array') {
                    this.previous = this.subject_uri(this.config.base_prefix, this.current);
                    // object-type schema inside an array schema
                    if ('properties' in data.properties[property].items) {

                        if (data.properties[property]['ld.class'] === true) {
                            this.current = this.subject_uri(this.config.base_prefix, data.properties[property]['ld.id']);
                            this.createArrayProperty(data.properties[property], this.config, property,
                                {
                                    subject: this.current,
                                    isClass: true, isRequired: isRequired,
                                    isExisting: isExisting,
                                    minItems: minItems,
                                    maxItems: maxItems
                                });
                            this.traverse(data.properties[property].items);
                        }
                        else if (data.properties[property]['ld.association'] === true) {
                            if (data.properties[property]['ld.range'] === undefined)
                                throw new Error('Expect "ld.range" attribute when using "ld.association"');
                            const ld_array_blank_class = this.subject_uri(this.config.base_prefix, data.properties[property]['ld.range']);
                            this.createArrayProperty(data.properties[property], this.config, property,
                                {
                                    subject: this.subject_uri(this.config.base_prefix, this.current),
                                    isRequired: isRequired,
                                    isExisting: isExisting,
                                });
                            this.createClassProperty({}, this.config, ld_array_blank_class,
                                {subject: ld_array_blank_class, isClass: true});
                            this.previous = this.subject_uri(this.config.base_prefix, this.current);
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
                    this.createStringProperty(data.items, this.config, this.subject_uri(this.config.base_prefix, this.current),
                        {subject: this.subject_uri(this.config.base_prefix, this.previous)});

                if (data.items.type === 'integer')
                    this.createIntegerProperty(data.items, this.config, this.subject_uri(this.config.base_prefix, this.current),
                        {subject: this.subject_uri(this.config.base_prefix, this.previous)});

                if (data.items.type === 'number')
                    this.createNumberProperty(data.items, this.config, this.subject_uri(this.config.base_prefix, this.current),
                        {subject: this.subject_uri(this.config.base_prefix, this.previous)});

                if (data.items.type === 'boolean')
                    this.createBooleanProperty(data.items, this.config, this.subject_uri(this.config.base_prefix, this.current),
                        {subject: this.subject_uri(this.config.base_prefix, this.previous)});

                if (data.items.type=== 'null')
                    this.createNullProperty(data.items, this.config, this.subject_uri(this.config.base_prefix, this.current),
                        {subject: this.subject_uri(this.config.base_prefix, this.previous)});

                if ('anyOf' in  data.items)
                    this.createAnyOfProperty({}, this.config, this.subject_uri(this.config.base_prefix, this.current),{subject: this.subject_uri(this.config.base_prefix, this.previous)});

                if ('allOf' in  data.items)
                    this.createAllOfProperty({}, this.config, this.subject_uri(this.config.base_prefix, this.current), {subject: this.subject_uri(this.config.base_prefix, this.previous)});

                if ('oneOf' in  data.items)
                    this.createOneOfProperty({}, this.config, this.subject_uri(this.config.base_prefix, this.current), {subject: this.subject_uri(this.config.base_prefix, this.previous)});

                if ('not' in  data.items)
                    this.createNotProperty({}, this.config, this.subject_uri(this.config.base_prefix, this.current), {subject: this.subject_uri(this.config.base_prefix, this.previous)});

            }
        }
    }
    createStringProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                         {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={} ){
        let string_schema = new StringSchema(data, config, property,
            {subject:subject,isClass:isClass, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});

        this.schemas.push(string_schema);
    }

    createIntegerProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                          {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={} ){
        let int_schema = new IntegerSchema(data, config, property,
            {subject:subject, isClass:isClass, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});
        this.schemas.push(int_schema);
    }

    createNumberProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                         {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={} ){
        let num_schema = new NumberSchema(data, config, property,
            {subject:subject, isClass:isClass, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});
        this.schemas.push(num_schema);
    }

    createBooleanProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                          {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let boolean_schema = new BooleanSchema(data, config, property,
            {subject, isClass:isClass, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});
        this.schemas.push(boolean_schema);
    }

    createObjectProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                         {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false, isEnum=false, ld_enum={}}:SchemaOptArgs={}){
        if (isEnum == false && Object.keys(ld_enum).length!=0)
            throw new Error('When "isEnum" is set to false, "ld_enum" must be an empty object.')
        if (isEnum == true && Object.keys(ld_enum).length==0)
            throw new Error('When "isEnum" is set to true, "ld_enum" must not be an empty object.')
        let obj_schema = new ObjectSchema(data, this.config, property,
            {subject:subject, isClass:isClass, isExisting:isExisting, isIgnored:isIgnored, isRequired: isRequired, isEnum:isEnum, ld_enum:ld_enum});
        this.schemas.push(obj_schema);
    }

    createArrayProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false, minItems=0, maxItems=0}:SchemaOptArgs={}){
        let array_schema = new ArraySchema(data, config, property,
            {
                subject:subject,
                isClass: isClass, isRequired: isRequired,
                isExisting: isExisting, isIgnored:isIgnored,
                minItems: minItems, maxItems: maxItems
            });
        this.schemas.push(array_schema);
    }

    createClassProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        let class_schema = new ClassSchema(data, config, property,
            {
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            });
        this.schemas.push(class_schema)
    }
    createNullProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                       {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        let null_schema = new NullSchema(data, config, property,
            {
                subject:subject,
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            });
        this.schemas.push(null_schema)
    }
    createNotProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                      {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let not_schema = new NotSchema(data, config, property, 'not',
            {
                subject:subject,
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            });
        this.schemas.push(not_schema);
    }
    createAnyOfProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let anyof_schema = new AnyOfSchema(data, config, property, 'anyOf',
            {
                subject:subject,
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            });
        this.schemas.push(anyof_schema);
    }
    createOneOfProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let oneof_schema = new OneOfSchema(data, config, property, 'oneOf',
            {
                subject:subject,
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            });
        this.schemas.push(oneof_schema);
    }
    createAllOfProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {subject=undefined, isClass=false, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let allof_schema = new AllOfSchema(data, config, property, 'allOf',
            {
                subject:subject,
                isClass: isClass, isExisting: isExisting,
                isIgnored: isIgnored, isRequired: isRequired
            });
        this.schemas.push(allof_schema);
    }

    subject_uri(prefix:string, subject:any){
        // given as a URI
        if ((subject.includes('http')) || (subject.includes(':')))
            return subject;
        // given as a string type value
        else
            return prefix + ':' + subject;

    }
}


