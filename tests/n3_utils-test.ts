import {validate_path} from "../src/utils/validation";
import path from "path";
import {
    add_writer_list,
    blank_node_list,
    blank_node_literal, blank_node_namedNode,
    blank_node_node,
    node_node_list,
    node_node_literal,
    node_node_node
} from "../src/utils/n3_utils";
import {writer} from "repl";
import {DataFactory} from "n3";
import namedNode = DataFactory.namedNode;

describe('N3 utility functions', ()=> {

    const subject = 'subject'
    const predicate = 'predicate';
    const literal = 'literal';
    const object = 'object';
    const N3 = require('n3');
    const writer = new N3.Writer({ prefixes: { c: 'http://example.org/cartoons#',
            foaf: 'http://xmlns.com/foaf/0.1/' } });
    const writer_list = writer.list([
        namedNode('http://example.org/cartoons#Tom'),
        namedNode('http://example.org/cartoons#Jerry'),
    ])
    const writer_arr = [
        'http://example.org/cartoons#Tom',
        'http://example.org/cartoons#Jerry'
    ]
    test('tests N3 utility functions', () => {
        expect(node_node_node(subject, predicate, object).termType).toEqual("Quad");
        expect(node_node_literal(subject, predicate, literal).termType).toEqual("Quad");
        expect(node_node_list(writer, subject, predicate, writer_list).termType).toEqual("Quad");
        expect(Object.keys(blank_node_node(predicate, object))).toEqual([ "predicate", "object"]);
        expect(Object.keys(blank_node_literal(predicate, literal))).toEqual([ "predicate", "object"]);
        expect(Object.keys(blank_node_list(predicate,writer_list))).toEqual([ "predicate", "object"]);
        expect(Object.keys(blank_node_namedNode(predicate, namedNode(object)))).toEqual([ "predicate", "object"]);
        expect(add_writer_list(writer_arr,writer)).toEqual(writer_arr)
    });
});



//add_writer_list
