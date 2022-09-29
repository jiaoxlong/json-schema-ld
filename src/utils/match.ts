/**
 * matches elements of an array or keys of an object against keys of a target object.
 * returns a map object contains only properties with matched keys if matching source is an array,
 * or a map object contains source.value - target.value pairs of matched properties if matching source is an object.
 * @return match_map
 */
export function match(source:any,target: {[key:string]:any}){
    const match_map = new Map<string, any>();
    if (Array.isArray(source)){
        for (const s of source) {
            if (s in target) {
                match_map.set(s, target[s]);
            }
        }
    }
    if (typeof source === 'object'){
        for (const t of Object.keys(target)) {
            if (t in source) {
                match_map.set(source[t],target[t]);
            }
        }
    }
    return match_map;
}

/**
 * merges two Map objects into one Map object
 * @return merge_map
 */
export function merge(map1:Map<string, any>, map2:Map<string,any>){
    return new Map([...map1.entries(), ...map2.entries()]);
    /**
    const merge_map = new Map<string, any>();
    //first add key-value pairs from map2 when they also exist in map1
    map2.forEach(function (value, key){
        if (map1.has(key)) merge_map.set(key, map1.get(key));
        else merge_map.set(key, value);
    });
    //then add the reminder key-value pairs from map1
    map1.forEach(function (value, key){
        if (! merge_map.has(key)) merge_map.set(key, map1.get(key));
    });

    return merge_map;
    */
}




const a ={
    title: 'dcterms:title',
    description: 'dcterms:description',
    examples: 'skos:example',
    deprecated: 'owl:deprecated',
    readonly: 'jsonsc:readOnly',
    writeonly: 'jsonsc:writeOnly',
    comment: 'rdfs:comment'
}

const b ={
    description: 'Last time the data in the feed was updated in POSIX time.',
    type: 'integer',
    minimum: 0,
    maximum: 1924988399

}

//console.log(match(a,b));
