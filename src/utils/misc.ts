const inflection = require('inflection');

/**
 * Capitalize the first letter of a string
 * @param s string
 */
export function capitalizeFirstLetter(s)
{
    return s[0].toUpperCase() + s.slice(1);
}

/**
 * Capitalize the first letter of a resource string in an URI with namespace prefix.
 * @param s string
 */
export function capitalizeFirstLetterAfterPrefix(s:string){
    const ind = s.indexOf(':')
    return s.slice(0, ind+1)+s[ind+1].toUpperCase()+s.slice(ind+2)
}

/**
 * get first char index of a resource in a URI
 */
export function get_resource_index(s:string){
    let s_index:number;
    if (s.includes('http')) {
        let s_index: number;
        if (s.includes('#'))
            s_index = s.lastIndexOf('#');
        else
            s_index = s.lastIndexOf('/');
        return s_index+1;
    }
    else if (s.includes(':')) {
        s_index = s.indexOf(':');
        return s_index+1;
    }
    else
        return 0;
}

/**
 * extract resource name from a URI
 * @param s string
 */
export function extract_resource_from_uri(s:string){
    const s_index = get_resource_index(s)
    if (s.includes('http'))
        return s.substring(s_index, s.length)
    else if (s.includes(':')){
        return s.substring(s_index, s.length)
    }
    else
        return s
}



/**
 * Capitalize the first letter of a resource string in a hash URI or a slash URI
 * @param s string
 */
export function capitalizeLastFragment(s:string){
    if (s.includes('http')){
        let s_index:number;
        if(s.includes('#'))
            s_index = s.lastIndexOf('#');
        else
            s_index = s.lastIndexOf('/');
        return s.substring(0,s_index+1) + (s.charAt(s_index+1).toUpperCase()) + s.substring(s_index+2, s.length)
    }
    else if (s.includes(':')){
        return capitalizeFirstLetterAfterPrefix(s)
    }
    else
        return capitalizeFirstLetter(s)
}

/**
 * transform a (verb) noun to singular form if applicable and capitalize its initial.
 */
export function inflect(str:string):string{
    return inflection.camelize(inflection.singularize(str));
}
