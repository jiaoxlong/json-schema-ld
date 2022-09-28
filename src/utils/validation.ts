import fs from "fs";
import path from "path";

export function validate_path(path_to_file:string){
    return fs.statSync(path_to_file).isDirectory() || fs.statSync(path_to_file).isFile();
}

export function jsc_source_files(args:any){
    const source_list = [];
    if (fs.statSync(args['source']).isDirectory()){
        fs.readdirSync(args['source']).forEach(file => {
            source_list.push(path.join(args['source'], file));
        });
    }
    else if (fs.statSync(args['source']).isFile()) {
        source_list.push(args['source']);
    }
    else throw Error("The 'source' given in the JSON Schema extension file neither points to a directory " +
            "nor to a file");
    return source_list;

}

export function hasKeys(object, keys){
    return keys.every(function (key) {
        return object.hasOwn(key);
    });
}
