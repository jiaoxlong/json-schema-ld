/*
import {ObjectType,NumberType,IntegerType, StringType, BooleanType, NullType, ArrayType } from '../lib/JSONSchema';

export function serialize(schema:object){
    const N3 = require('n3');
    let rdf_writer = N3.writer();
    let shacl_writer = N3.writer();



}

function traverse(schema:{[key:string]:any}){
    if (!schema){
        return;
    }
    if (schema.type != undefined){
        if (schema.type==='string'){
           let obj_type = new ObjectType(schema,rdf_writer,shacl_writer)
        }
        if (schema.type==='integer'){
            let int_type = new IntegerType(schema,rdf_writer,shacl_writer)
        }
        if (schema.type==='number'){
            let number_type = new NumberType(schema,rdf_writer,shacl_writer)
        }
        if (schema.type==='object'){
            let int_type = new ObjectType(schema,rdf_writer,shacl_writer)
        }
        if (schema.type==='null'){
            let null_type = new NullType(schema,rdf_writer,shacl_writer)
        }
        if (schema.type==='array'){
            //While the items schema must be valid for every item in the array,
            //items -> tuple type array or boolean
            // the contains schema only needs to validate against one or more items in the array.
            //minContains / maxContains not in scope
            //miniItems/maxItem not in scope?
            //uniqueItems:boolean

            //list type array
            if(schema.items = undefined){

                //contains
                if (schema.items.contains = undefined){

                }
                //contains
                else{
                    if (schema.items.contains instanceof Object){

                        for (let item_c of schema.items.contains){

                            traverse(schema.items.contains);

                            if (schema.items.minContains = undefined){
                                //pass
                            }
                            else{
                                // define isInteger(val) !
                                if  (schema.items.minContains instanceof Number){
                                    //control minContains
                                }
                                else{
                                    //type error only number
                                }

                            }
                            if (schema.items.maxContains = undefined){
                                //pass
                            }
                            else{
                                // define isInteger(val) !
                                if  (schema.items.maxContains instanceof Number){
                                    //control maxContains
                                }
                                else{
                                    //type error only number
                                }
                            }
                        }

                    }


                }




            }
            //"contains":{"type":"number"}

            //tuple type array
            else{
                if(schema.items =='boolean'){
                    //only valid with prefixItems
                    //true allows additional items excluded in prefixItems
                    if (schema.prefixItems === undefined){
                        //pass or throw error
                    }
                    else{
                        //positional jsonsc types + enum check Additional items for more details
                        for (let pi of schema.prefixItems){
                            // do
                        }
                    }
                }

                // additional items
                else if (Array.isArray(schema.items))
                {
                    traverse(schema.items)
                }
                for (let item of Object.keys(schema)){
                    traverse(schema.item);
                }

            }

        }
    }
}
*/
