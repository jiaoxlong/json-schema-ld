import csv, sys, os, requests, re, time


lov_api = "https://lov.linkeddata.es/dataset/lov/api/v2/term/search?q={}&type=property"
with open(sys.argv[1]+'_stats.txt', 'w') as jsc_prop_stats:
    props = {}
    for file in [f for f in os.listdir(sys.argv[1]) if re.match(r'.*\.txt', f)]:
        with open(os.path.join(sys.argv[1],file)) as jsc_file:
            for line in jsc_file:
                prop = line.strip()
                if prop not in props:
                    props[prop] = 1
                else:
                    props[prop] += 1
    print(len(props))
    i = 0
    for p in props:
        i += 1
        if i % 100 != 0:
            res = requests.get(lov_api.format(p), verify=False).json()['results']
            if (res):
                jsc_prop_stats.write('{}\t{}\t{}\t{}\t{}\n'.format(p, props[p], res[0]['uri'], res[0]['prefixedName'], res[0]['score']))
            else:
                jsc_prop_stats.write('{}\t{}\t\t\t\n'.format(p, props[p]))
        else:
                print('{} properties were mapped!'.format(i))
                time.sleep(60)

