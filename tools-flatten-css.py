import re,sys
css=open('surgimaster.css').read()
blocks=[]
def scan(s,start,end,ctx):
    i=start
    while i<end:
        if s[i:i+2]=='/*':
            j=s.find('*/',i+2);i=(j+2) if j>=0 else end;continue
        if s[i]=='{':
            k=i-1
            while k>=0 and s[k] not in '{};':k-=1
            sel=s[k+1:i];depth=1;j=i+1
            while j<end and depth:
                if s[j]=='{':depth+=1
                elif s[j]=='}':depth-=1
                j+=1
            # The backtrack can land inside a preceding /* comment */, dragging
            # prose into the "selector". Analyse the comment-stripped text, and
            # for whole-rule deletion start after the comment so documentation
            # is never removed with the rule.
            cpos=sel.rfind('*/')
            real=k+1+(cpos+2 if cpos>=0 else 0)
            csel=s[real:i]
            if csel.strip().startswith('@'):scan(s,i+1,j-1,ctx+[csel.strip()])
            else:blocks.append(('||'.join(ctx),real,i,i+1,j-1))
            i=j;continue
        i+=1
scan(css,0,len(css),[])
def split_top(sel):
    out=[];d=0;cur=''
    for ch in sel:
        if ch=='(':d+=1
        elif ch==')':d-=1
        if ch==',' and d==0: out.append(cur);cur=''
        else: cur+=ch
    out.append(cur);return out
def add(a,b):return (a[0]+b[0],a[1]+b[1],a[2]+b[2])
def specificity(sel):
    s=sel.strip();total=(0,0,0)
    while True:
        m=re.search(r':(is|not|has|where)\(',s)
        if not m:break
        start=m.start();open_i=m.end()-1;d=0;i=open_i
        while i<len(s):
            if s[i]=='(':d+=1
            elif s[i]==')':
                d-=1
                if d==0:break
            i+=1
        inner=s[open_i+1:i]
        if m.group(1)!='where':
            best=(0,0,0)
            for arg in split_top(inner):
                sp=specificity(arg)
                if sp>best:best=sp
            total=add(total,best)
        s=s[:start]+' '+s[i+1:]
    total=add(total,(len(re.findall(r'#[\w-]+',s)),0,0))
    total=add(total,(0,len(re.findall(r'\.[\w-]+',s))+len(re.findall(r'\[[^\]]+\]',s))
                       +len(re.findall(r'(?<!:):(?!:)[a-zA-Z-]+',s)),0))
    s2=re.sub(r'#[\w-]+|\.[\w-]+|\[[^\]]+\]','',s)
    total=add(total,(0,0,len(re.findall(r'(?:^|[\s>+~])([a-zA-Z][\w-]*)',s2))+len(re.findall(r'::[a-zA-Z-]+',s2))))
    return total
SCOPE=re.compile(r'^\s*(?:body\.dm-ui33\.dm-v34|body\.dm-ui33|body\.dm-v34|body)\s+')
def norm(s):
    s=s.strip();p=None
    while p!=s:p=s;s=SCOPE.sub('',s)
    return re.sub(r'\s+',' ',s.strip())
def decls(b):
    return [(m.group(1).strip().lower(),bool(m.group(3)),m.start(),m.end())
            for m in re.finditer(r'([-a-zA-Z]+)\s*:\s*([^;]+?)(\s*!important)?\s*(?=;|$)',b)]
LIMIT=int(sys.argv[1]) if len(sys.argv)>1 else 10**9
parts_of={};groups={}
for idx,(ctx,ss,se,bs,be) in enumerate(blocks):
    for part in split_top(css[ss:se]):
        if not part.strip():continue
        key=(ctx,norm(part))
        groups.setdefault(key,[]).append((idx,specificity(part)))
        parts_of.setdefault(idx,set()).add(key)
loses={}
for key,members in groups.items():
    props={}
    for idx,sp in members:
        ctx,ss,se,bs,be=blocks[idx]
        for prop,imp,a,b in decls(css[bs:be]):
            props.setdefault(prop,[]).append(((1 if imp else 0),sp,idx,a,b))
    for prop,lst in props.items():
        if len(lst)<2:continue
        lst.sort()
        for _,_,idx,a,b in lst[:-1]:loses.setdefault((idx,a,b),set()).add(key)
cand=sorted(d for d,lost in loses.items() if parts_of.get(d[0]) and parts_of[d[0]]<=lost)
shadow=set(cand[:LIMIT])
sys.stderr.write('candidates=%d applying=%d\n'%(len(cand),len(shadow)))
edits=[]
for idx,(ctx,ss,se,bs,be) in enumerate(blocks):
    rem=sorted([(a,b) for (i2,a,b) in shadow if i2==idx],reverse=True)
    if not rem:continue
    nb=css[bs:be]
    for a,b in rem:nb=nb[:a]+' '*(b-a)+nb[b:]
    nb=re.sub(r';\s*;+',';',nb);nb=re.sub(r'\s+',' ',nb).strip().strip(';')
    edits.append((ss,be+1,'') if not nb else (bs,be,nb))
out=css
for a,b,rep in sorted(edits,key=lambda e:-e[0]):out=out[:a]+rep+out[b:]
out=re.sub(r'\n{3,}','\n\n',out)
sys.stderr.write('bytes %d -> %d (-%.1f%%)\n'%(len(css),len(out),100*(len(css)-len(out))/len(css)))
open('/tmp/flatN.css','w').write(out)
