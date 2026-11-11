"""CES 2020 CC20_327a ("Expand Medicare to a single comprehensive public health
care coverage program that would cover all Americans"), weighted by commonweight.
Codes: 1 support, 2 oppose; anything else (skipped/not asked) dropped.
States by inputstate FIPS. Party by pid3 (1 D, 2 R, 3 Ind). Output CSV to data/derived."""
import sys, pandas as pd
src = sys.argv[1]; out = sys.argv[2]
d = pd.read_csv(src, usecols=['commonweight','inputstate','CC20_327a','pid3'], low_memory=False)
d = d[d['CC20_327a'].isin([1,2])].copy()
d['sup'] = (d['CC20_327a']==1).astype(float)
def w(g): return pd.Series({'support_pct': 100*(g.sup*g.commonweight).sum()/g.commonweight.sum(), 'n': len(g)})
rows=[]
r=w(d); rows.append(('All adults', *r))
for k,lab in [(1,'Democrats'),(2,'Republicans'),(3,'Independents')]:
    r=w(d[d.pid3==k]); rows.append((lab,*r))
for f,lab in [(19,'Iowa'),(45,'South Carolina'),(48,'Texas'),(13,'Georgia'),(23,'Maine'),(26,'Michigan'),(20,'Kansas'),(39,'Ohio')]:
    r=w(d[d.inputstate==f]); rows.append((lab,*r))
o=pd.DataFrame(rows,columns=['group','support_pct','n']); o['support_pct']=o.support_pct.round(1); o['n']=o.n.astype(int)
o.to_csv(out,index=False); print(o.to_string(index=False))
