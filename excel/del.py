import pandas as pd
import numpy as np
import json
file="E:\Documents\Year4-1\\visual\\treemap\Treemap\excel\jiguan_data.xlsx"
data=pd.read_excel(file)
#print(data)

#data.to_json("E:\Documents\Year4-1\\visual\\treemap\Treemap\excel\\jig.json",orient="records",force_ascii=False)
pt = pd.pivot_table(data, index=['s','f','x'],values=['num'],aggfunc={'num':np.sum},margins=False)
#pt.to_json("E:\Documents\Year4-1\\visual\\treemap\Treemap\excel\\jig.json",orient="records",force_ascii=False)
#print(pt)
#print(type(pt))
pt.to_excel('E:\Documents\\Year4-1\\visual\\treemap\\Treemap\\excel\jiguan_data1.xlsx')

#js = pt
js = pt.reset_index()
#print(js)
#js.to_json("E:\Documents\Year4-1\\visual\\treemap\Treemap\excel\\jig.json",orient="records",force_ascii=False)

dic = {}
dic['name'] = '籍贯'
dic['children'] = []
s_tmp = 's'
f_tmp = 'f'
x_tmp = 'x'
sum = 0
for s, s_data in js.groupby('s'):
    if s != s_tmp:
        s_tmp = s
        s_dic = {}
        s_dic['name'] = s
        s_dic['children']=[]
    for f, f_data in s_data.groupby('f'):
        if f != f_tmp:
            f_tmp = f
            f_dic={}
            f_dic['name']=f
            f_dic['children']=[]
        for x, x_data in f_data.groupby('x'):
            x_data = x_data.drop(['s','f','x'],axis=1)
            d = list(x_data.values)[0][0]
            d = int(d)
            sum += d
            f_dic['children'].append({
                'name':x,
                'value':d
            })
        s_dic['children'].append(f_dic)
    dic['children'].append(s_dic)
#sorted(dic.items(), key=lambda d: d[1]['value'])
#print(type(dic))
print(sum)
dic_json = json.dumps(dic, indent=2,ensure_ascii=False)
#parsed = json.loads(dic_json)
#print(type(dic_json))
with open('E:\Documents\Year4-1\\visual\\treemap\Treemap\data\\data.json','w',encoding='utf8') as json_file:
    json_file.write(dic_json)
#print(j)
#pt.dropna(inplace=True, axis=0, how='all')
#pt.fillna(method='ffill',inplace=True,axis=0)

#print(pt)
#parsed.to_json("E:\Documents\Year4-1\\visual\\treemap\Treemap\excel\\ji.json",orient="records",force_ascii=False)
#data.dropna(inplace=True, axis=0,how='all')
#data.fillna(method='ffill',inplace=True,axis=0)
#data=data.set_index(['省','州府','州县','县'])

#nested_dict = defaultdict(lambda : defaultdict(list))

#for keys, value in data.iteritems():
#    nested_dict[keys[0]][keys[1]].append(value)
