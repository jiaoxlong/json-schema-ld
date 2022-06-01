/**
 * matches elements of an array or keys of an object against keys of a target objects.
 * returns a map object contains only properties with matched keys if matching source is an array,
 * or a map object contains source.value - target.value pairs of matched properties if matching source is an object.
 * @return match_map
 */

export function match(source:any,target: {[key:string]:any}){
    let match_map = new Map<string, any>();
    if (Array.isArray(source)){
        for (let s of source) {
            if (s in Object.keys(target)) {
                match_map.set(s, target.s);
            }
        }
    }
    else if (typeof source === 'object'){
        for (let t of Object.keys(target)) {
            if (t in source) {
                match_map.set(source[t],target[t]);
            }
        }
    }
    else{
        throw Error('Unknown source datatype!')
    }
    return match_map;
}


let a ={
    title: 'dcterms:title',
    description: 'dcterms:description',
    examples: 'skos:example',
    deprecated: 'owl:deprecated',
    readonly: 'jsonsc:readOnly',
    writeonly: 'jsonsc:writeOnly',
    comment: 'rdfs:comment'
}

let b ={
    description: 'Last time the data in the feed was updated in POSIX time.',
    type: 'integer',
    minimum: 0,
    maximum: 1924988399

}

//console.log(match(a,b));
