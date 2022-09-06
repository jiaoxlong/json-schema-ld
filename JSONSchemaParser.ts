import {ConfigParser} from "./utils/ConfigParser";
import {JSCLDSchema} from "./utils/JSCLD";
const fs = require('fs');
import * as path from "path";

let config = new ConfigParser('../configs/config.json');

for (let jsc of config.source){
    let ld = new JSCLDSchema(path.join('..', jsc), config);
    ld.serialize();
    ld.materialize();

}



