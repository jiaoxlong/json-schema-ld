/**
 * matches elements of an array or keys of an object against keys of a target object.
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

/**
 * merges two Map objects into one and removes.
 * When there are keys present in both maps, it only keeps the ones from map1
 * @return merge_map
 */
export function merge(map1:Map<string, any>, map2:Map<string,any>){
    let merge_map = new Map<string, any>();
    //overwrite
    map2.forEach(function (value, key){
        if (map1.has(key)) merge_map.set(key, map1.get(key));
        else merge_map.set(key, value);
    });
    //new
    map1.forEach(function (value, key){
        if (! merge_map.has(key)) merge_map.set(key, map1.get(key));
    });
    return merge_map;
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
