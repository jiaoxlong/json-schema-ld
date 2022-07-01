// Create quads of different shape
import {DataFactory} from "n3";
import quad = DataFactory.quad;
import namedNode = DataFactory.namedNode;
import literal = DataFactory.literal;
import { NamedNode,Literal, Term } from "n3/lib/N3DataFactory";

export function node_node_literal (subj: string, pred:string, obj:string|number) {
    return quad( namedNode(subj), namedNode(pred), literal(obj));
}
export function node_node_node (subj: string, pred:string, obj:string) {
    return quad( namedNode(subj), namedNode(pred), namedNode(obj));
}
export function node_node_list (writer:any, subj: string, pred:string, writerList:any[]) {
    return quad( namedNode(subj), namedNode(pred), writer.list(writerList));
}

export function blank_node_node(p:string,o:string){
    let blank_node = {}
    blank_node['predicate'] = namedNode(p);
    blank_node['object'] = namedNode(o);
    return blank_node;
}

export function blank_node_literal(p:string,o:string|number){
    let blank_node = {}
    blank_node['predicate'] = namedNode(p);
    blank_node['object'] = literal(o);
    return blank_node;
}

export function blank_node_list( p:string,o:any[]){
    let blank_node = {}
    blank_node['predicate'] = namedNode(p);
    blank_node['object'] = o;
    return blank_node;
}

export function add_writer_list(li:any[], writer:any){
    let li_tmp = li;
    for (let i in li_tmp){
        if (li_tmp[i]['object'] instanceof Array){
            li_tmp[i]['object'] = writer.list(li_tmp[i]['object']);
        }
    }
    return li_tmp;
}

export function blank_node_namedNode(p:string,o:NamedNode){
    let blank_node = {}
    blank_node['predicate'] = namedNode(p);
    blank_node['object'] = o;
    return blank_node;
}


