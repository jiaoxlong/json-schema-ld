/**
 * verifies if an object contains all elements (keys) of a String array.
 * @param object an json object
 * @param keys a list of string values
 */
export function hasKeys(object, keys){
    return keys.every(function (key) {
        // eslint-disable-next-line no-prototype-builtins
        return object.hasOwnProperty(key);
    });
}

/**
 * validates namespace URL
 * @param url string
 */

export function isValidURL(url:string){
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(url);
}

