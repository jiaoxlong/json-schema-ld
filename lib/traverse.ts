import {
    AnyOfSchema, AllOfSchema, NotSchema, OneOfSchema,
    BooleanSchema,
    CompositionSchema,
    IntegerSchema,
    NullSchema,
    NumberSchema, ObjectSchema,
    StringSchema, ArraySchema, ClassSchema, Schema, uri
} from "./JSONSchema";
import {SCHEMA_ANNOTATIONS, SCHEMA_COMPOSITIONS} from "../utils/schemaKWs";
import {ConfigParser} from "./ConfigParser";
import {match} from "../utils/match";
import {SchemaOptArgs} from "../utils/types";

// @ts-ignore
/**
 * The Traverse class traverses all properties in a JSON schema document using preorder traversal and creates schema instances for the latter RDF serialization.
 */
export class Traverse{
    /**
     * property node under visiting
     */
    current:string;
    /**
     * previous node recorded in order to return the pointer of next node to its previous node.
     */
    previous:string;
    /**
     * Schema instances populated for RDF serialization
     */
    schemas:Schema[] = [];
    /**
     * A JSC-LD configuration instance
     */
    config:ConfigParser;
    /**
     * A list of required properties
     */
    required:String[] = [];

    /**
     * The Traverse class constructor
     */
    constructor(id:string, data:object, config:ConfigParser){
        this.current = id;
        this.previous = id;
        this.config = config;
        this.traverse(data)

    }

    /**
     * core method of preorder traversal
     *
     * As the 'required' keyword appears prior to the restricted property, traversal always starts with data a level lower.
     *
     * @param data json object what may be changed over time during traversal.
     */

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
            // 'required' keyword appear prior to the required properties in a JSON schema.

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
                        {subject:uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'integer')
                    this.createIntegerProperty(data.properties[property], this.config,  property,
                        {subject:uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'number')
                    this.createNumberProperty(data.properties[property], this.config, property,
                        {subject: uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'boolean')
                    this.createBooleanProperty(data.properties[property], this.config, property,
                        {subject: uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if (data.properties[property].type === 'null')
                    this.createNullProperty(data.properties[property], this.config, property,
                        {subject: uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});
                if ('anyOf' in  data.properties[property])
                    this.createAnyOfProperty(data.properties[property], this.config, property, {subject:uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if ('allOf' in  data.properties[property])
                    this.createAllOfProperty(data.properties[property], this.config, property, {subject: uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if ('oneOf' in  data.properties[property])
                    this.createOneOfProperty(data.properties[property], this.config, property, {subject: uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

                if ('not' in  data.properties[property])
                    this.createNotProperty(data.properties[property], this.config, property, {subject: uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});

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
                            if (data.properties[property]['ld.association']['ld.id'] === undefined)
                                throw new Error('Expect "ld.id" attribute when using "ld.association"');
                            const ld_blank_class = uri(this.config.base_prefix, data.properties[property]['ld.association']['ld.id']);
                            this.createObjectProperty(data.properties[property], this.config, property,
                                {
                                    subject:uri(this.config.base_prefix, this.current),
                                    isRequired: isRequired,
                                    isExisting: isExisting,
                                })
                            if(data.properties[property]['ld.association']['ld.existing'] === true)
                                this.createClassProperty(data.properties[property]['ld.association'], this.config, ld_blank_class,
                                {subject:ld_blank_class, isExisting:true});
                            else
                                this.createClassProperty(data.properties[property]['ld.association'], this.config, ld_blank_class,
                                {subject:ld_blank_class});
                            this.previous = uri(this.config.base_prefix, this.current);
                            this.current = ld_blank_class;
                            this.traverse(data.properties[property]);
                            this.current = this.previous;
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
                                        subject: uri(this.config.base_prefix, this.current),
                                        isRequired: isRequired,
                                        isExisting: isExisting,
                                        isEnum: true,
                                        ld_enum: enum_tmp
                                    });
                                continue
                            }
                        }
                        else if ('ld.class' in data.properties[property]) {
                            if (data.properties[property]['ld.class']['ld.id']===undefined)
                                throw new Error('"ld.class" is defined, but "ld.id" does not present. ')
                            let ld_class = uri(this.config.base_prefix, data.properties[property]['ld.class']['ld.id']);
                            if (data.properties[property]['ld.class']['ld.existing']===true)
                                this.createClassProperty(data.properties[property]['ld.class'], this.config, ld_class,
                                    {subject: ld_class, isExisting:true});
                            else
                                this.createClassProperty(data.properties[property]['ld.class'], this.config, ld_class, {subject: ld_class})
                            this.previous = uri(this.config.base_prefix, this.current);
                            this.current = ld_class;
                            this.traverse(data.properties[property]);
                            this.current = this.previous;
                        }

                        else {
                            this.createObjectProperty(data.properties[property], this.config,property,
                                {subject: uri(this.config.base_prefix, this.current), isRequired: isRequired, isExisting: isExisting});
                            if ((data.properties[property]['ld.geoJsonFeature'] === true) ||
                                (data.properties[property]['ld.enum'] === true)) {
                                continue
                            } else
                                this.traverse(data.properties[property]);
                        }
                    }
                }

                if (data.properties[property].type === 'array') {
                    this.previous = uri(this.config.base_prefix, this.current);
                    // object-type schema inside an array schema
                    if ('properties' in data.properties[property].items) {
                        if ('ld.class' in data.properties[property]) {
                            this.current = uri(this.config.base_prefix, data.properties[property]['ld.class']['ld.id']);
                            if(data.properties[property]['ld.class']['ld.isExisting']===true)
                                this.createClassProperty(data.properties[property], this.config, property,
                                    {
                                        subject: this.current,
                                        isExisting: true,
                                    });
                            else
                                this.createClassProperty(data.properties[property], this.config, property,
                                    {
                                        subject: this.current,
                                        isExisting: false,
                                    });
                            this.traverse(data.properties[property].items);
                        }
                        else if ('ld.association' in data.properties[property]) {
                            if (data.properties[property]['ld.association']['ld.id'] === undefined)
                                throw new Error('Expect "ld.id" attribute when using "ld.association"');
                            const ld_array_blank_class = uri(this.config.base_prefix, data.properties[property]['ld.association']['ld.id']);
                            this.createArrayProperty(data.properties[property], this.config, property,
                                {
                                    subject: uri(this.config.base_prefix, this.current),
                                    isRequired: isRequired,
                                    isExisting: isExisting,
                                });
                            if(data.properties[property]['ld.association']['ld.existing']===true)
                                this.createClassProperty(data.properties[property]['ld.association'], this.config, ld_array_blank_class,
                                {subject: ld_array_blank_class, isExisting:true})
                            else
                                this.createClassProperty(data.properties[property]['ld.association'], this.config, ld_array_blank_class,
                                {subject: ld_array_blank_class});

                            this.previous = uri(this.config.base_prefix, this.current);
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
                    this.createStringProperty(data.items, this.config, uri(this.config.base_prefix, this.current),
                        {subject: uri(this.config.base_prefix, this.previous)});

                if (data.items.type === 'integer')
                    this.createIntegerProperty(data.items, this.config, uri(this.config.base_prefix, this.current),
                        {subject: uri(this.config.base_prefix, this.previous)});

                if (data.items.type === 'number')
                    this.createNumberProperty(data.items, this.config, uri(this.config.base_prefix, this.current),
                        {subject: uri(this.config.base_prefix, this.previous)});

                if (data.items.type === 'boolean')
                    this.createBooleanProperty(data.items, this.config, uri(this.config.base_prefix, this.current),
                        {subject: uri(this.config.base_prefix, this.previous)});

                if (data.items.type=== 'null')
                    this.createNullProperty(data.items, this.config, uri(this.config.base_prefix, this.current),
                        {subject: uri(this.config.base_prefix, this.previous)});

                if ('anyOf' in  data.items)
                    this.createAnyOfProperty({}, this.config, uri(this.config.base_prefix, this.current),{subject: uri(this.config.base_prefix, this.previous)});

                if ('allOf' in  data.items)
                    this.createAllOfProperty({}, this.config, uri(this.config.base_prefix, this.current), {subject: uri(this.config.base_prefix, this.previous)});

                if ('oneOf' in  data.items)
                    this.createOneOfProperty({}, this.config, uri(this.config.base_prefix, this.current), {subject: uri(this.config.base_prefix, this.previous)});

                if ('not' in  data.items)
                    this.createNotProperty({}, this.config, uri(this.config.base_prefix, this.current), {subject: uri(this.config.base_prefix, this.previous)});

            }
        }
    }

    /**
     * creates an instance of StringSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createStringProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                         {subject=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={} ){
        let string_schema = new StringSchema(data, config, property,
            {subject:subject, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});

        this.schemas.push(string_schema);
    }

    /**
     * creates an instance of IntegerSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createIntegerProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                          {subject=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={} ){
        let int_schema = new IntegerSchema(data, config, property,
            {subject:subject, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});
        this.schemas.push(int_schema);
    }

    /**
     * creates an instance of NumberSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createNumberProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                         {subject=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={} ){
        let num_schema = new NumberSchema(data, config, property,
            {subject:subject, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});
        this.schemas.push(num_schema);
    }

    /**
     * creates an instance of BooleanSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createBooleanProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                          {subject=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let boolean_schema = new BooleanSchema(data, config, property,
            {subject, isExisting:isExisting,
                isIgnored:isIgnored, isRequired:isRequired});
        this.schemas.push(boolean_schema);
    }

    /**
     * creates an instance of ObjectSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createObjectProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                         {subject=undefined, isExisting=false, isIgnored=false, isRequired=false, isEnum=false, ld_enum={}}:SchemaOptArgs={}){
        if (isEnum == false && Object.keys(ld_enum).length!=0)
            throw new Error('When "isEnum" is set to false, "ld_enum" must be an empty object.')
        if (isEnum == true && Object.keys(ld_enum).length==0)
            throw new Error('When "isEnum" is set to true, "ld_enum" must not be an empty object.')
        let obj_schema = new ObjectSchema(data, this.config, property,
            {subject:subject, isExisting:isExisting, isIgnored:isIgnored, isRequired: isRequired, isEnum:isEnum, ld_enum:ld_enum});
        this.schemas.push(obj_schema);
    }

    /**
     * creates an instance of ArraySchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createArrayProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {subject=undefined, isExisting=false, isIgnored=false, isRequired=false, minItems=0, maxItems=0}:SchemaOptArgs={}){
        let array_schema = new ArraySchema(data, config, property,
            {
                subject:subject,
                isRequired: isRequired,
                isExisting: isExisting, isIgnored:isIgnored,
                minItems: minItems, maxItems: maxItems
            });
        this.schemas.push(array_schema);
    }

    /**
     * creates an instance of ClassSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createClassProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        let class_schema = new ClassSchema(data, config, property,
            {
                isExisting: isExisting,
                isIgnored: isIgnored,
                isRequired: isRequired
            });
        this.schemas.push(class_schema)
    }

    /**
     * creates an instance of NullSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is tagged to this property
     * @param isIgnored  when ld.ignored is tagged to this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createNullProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                       {subject=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}) {
        let null_schema = new NullSchema(data, config, property,
            {
                subject:subject,
                isExisting: isExisting,
                isIgnored: isIgnored,
                isRequired: isRequired
            });
        this.schemas.push(null_schema)
    }

    /**
     * creates an instance of NotSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createNotProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                      {subject=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let not_schema = new NotSchema(data, config, property, 'not',
            {
                subject:subject,
                isExisting: isExisting,
                isIgnored: isIgnored,
                isRequired: isRequired
            });
        this.schemas.push(not_schema);
    }

    /**
     * creates an instance of AnySchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createAnyOfProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {subject=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let anyof_schema = new AnyOfSchema(data, config, property, 'anyOf',
            {
                subject:subject,
                isExisting: isExisting,
                isIgnored: isIgnored,
                isRequired: isRequired
            });
        this.schemas.push(anyof_schema);
    }
    /**
     * creates an instance of OneOfSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createOneOfProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {subject=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let oneof_schema = new OneOfSchema(data, config, property, 'oneOf',
            {
                subject:subject,
                isExisting: isExisting,
                isIgnored: isIgnored,
                isRequired: isRequired
            });
        this.schemas.push(oneof_schema);
    }

    /**
     * creates an instance of AllOfSchema
     * @param data json object
     * @param config a JSC-LD configuration instance
     * @param property property name under visiting
     * @param subject resource instance which has the property.
     * @param isExisting when ld.existing is set to true for this property
     * @param isIgnored  when ld.ignored is set to true for this property
     * @param isRequired when a property is defined as required in the JSON schema
     */
    createAllOfProperty(data: {[key:string]: any}, config:ConfigParser, property:string,
                        {subject=undefined, isExisting=false, isIgnored=false, isRequired=false}:SchemaOptArgs={}){
        let allof_schema = new AllOfSchema(data, config, property, 'allOf',
            {
                subject:subject,
                isExisting: isExisting,
                isIgnored: isIgnored,
                isRequired: isRequired
            });
        this.schemas.push(allof_schema);
    }
}


