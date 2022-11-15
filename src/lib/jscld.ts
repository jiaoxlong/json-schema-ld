#!/usr/bin/env node

import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import {JSCLDSchema} from "./JSCLDParser";
import {Config} from "./ConfigParser";

const args = [
    { name: 'source', alias: 's', type: String},
    { name: 'out', alias: 'o', type:String},
    { name: 'prefix', alias: 'p', type:String},
    { name: 'uri', alias: 'u', type:String},
    { name: 'help', alias: 'h', type:Boolean},
]

const cli_args = commandLineArgs(args)

const usage = commandLineUsage([
    {
        header: 'JSC-LD',
        content: 'JSON Schema LD is a syntactic sugar for JSON Schema to enable generative interoperability by means of representing JSON schema in RDF vocabularies (RDF Scheme) and RDF shapes in SHACL.'
    },
    {
        header:"Synopsis",
        content: [
            '$ jsc-ld --source json_schema.js --out out --prefix example --url "http://example.com/"',
            '$ jsc-ld --source json_schema.js -p example -u "http://example.com"',
        ]
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'source',
                alias: 's',
                typeLabel: '{underline path/to/source/file|directory}',
                description: 'Path to a JSON schema file or a directory contains JSON schema files',
                type: String
            },
            {
                name: 'prefix',
                alias: 'p',
                typeLabel: '{underline prefix}',
                description: 'JSC-LD predefined namespace prefix',
                type: String
            },
            {
                name: 'format',
                alias: 'f',
                typeLabel: '{underline format}',
                description: 'RDF serialization format: Turtle, application/trig, N-Triples, or N-Quads. It defaults to Turtle.',
                type: String
            },
            {
                name: 'uri',
                alias: 'u',
                typeLabel: '{underline uri}',
                description: 'JSC-LD predefined namespace URI',
                type: String
            },
            {
                name: 'out',
                alias: 'o',
                typeLabel: '{underline path/to/directory}',
                description: 'Path to output directory defaults to "out"',
                type: String
            },
            {
                name: 'help',
                alias: 'h',
                description: 'Display this usage guide',
                type: Boolean
            }

        ]
    },
    {
        content: 'Project home: {underline https://github.com/jiaoxlong/jsc-ld}'
    }
]);

let cp:Config;

try {
    cp = new Config(cli_args);
}
catch(e) {
    console.log(e)
    console.log(usage)
    process.exit(1)
}

for (const jsc of cp.source){
    const ld = new JSCLDSchema(jsc, cp);
    ld.serialize();
    ld.materialize();
}






