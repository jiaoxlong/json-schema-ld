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
}

/**
 * searches element in an array against a key set of a dictionary
 * @return matched
 */

export function find(arr:string[], obj:Record<string, unknown>){
    const matched:string[]=[];
    arr.forEach((ele) =>{
        if (ele in obj)
            matched.push(ele)
    });
    return matched
}
