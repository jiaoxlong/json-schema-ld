import {
    BooleanSchema,
    CompositionSchema,
    IntegerSchema,
    NullSchema,
    NumberSchema, ObjectSchema,
    Property,
    StringSchema
} from "../lib/JSONSchema";
import {SCHEMA_COMPOSITIONS} from "../lib/schemaKWs";

export let properties:Property[] = []
export function traverse(data){
    for (let property of Object.keys(data.properties)) {
        let isRequired = data.required.includes(property) ? true : false;
        if(data.properties[property].type === 'string'){
            let string_schema = new StringSchema(data.properties[property]);

            let p_ins = new Property(property, string_schema, isRequired);
            properties.push(p_ins);
        }
        if(data.properties[property].type === 'integer'){
            let int_schema = new IntegerSchema(data.properties[property]);
            let p_ins = new Property(property, int_schema, isRequired);
            properties.push(p_ins);
        }
        if(data.properties[property].type === 'number'){
            let number_schema = new NumberSchema(data.properties[property]);
            let p_ins = new Property(property, number_schema, isRequired);
            properties.push(p_ins);

        }
        if(data.properties[property].type === 'boolean'){
            let boolean_schema = new BooleanSchema(data.properties[property]);
            let p_ins = new Property(property, boolean_schema, isRequired);
            properties.push(p_ins);
        }
        if(data.properties[property].type === 'null'){
            let null_schema = new NullSchema(data.properties[property]);
            let p_ins = new Property(property, null_schema, isRequired);
            properties.push(p_ins);
        }
        if(data.properties[property].type === 'object'){
            let obj_schema = new ObjectSchema(data.properties[property]);
            let p_ins = new Property(property, obj_schema,isRequired);
            traverse(data.properties[property]);
        }

        if(data.properties[property].type === 'array'){
            traverse(data.properties[property].items)
        }
        for (let composition of SCHEMA_COMPOSITIONS){
            if (composition in data.properties[property]){
                let com_schema = new CompositionSchema(data.properties[property], composition);
                let p_ins = new Property(property, com_schema, isRequired);
                properties.push(p_ins)
            }
        }
    }
}
