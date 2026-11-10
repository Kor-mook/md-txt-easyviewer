// A small, self-contained TeX-to-MathML renderer. Unknown syntax falls back to source text.
function renderMath(source,display=false,nesting=0){
 const raw=String(source);let pos=0,depth=0;
 const sym={alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',varepsilon:'ϵ',zeta:'ζ',eta:'η',theta:'θ',vartheta:'ϑ',iota:'ι',kappa:'κ',lambda:'λ',mu:'μ',nu:'ν',xi:'ξ',pi:'π',varpi:'ϖ',rho:'ρ',sigma:'σ',tau:'τ',upsilon:'υ',phi:'φ',varphi:'ϕ',chi:'χ',psi:'ψ',omega:'ω',Gamma:'Γ',Delta:'Δ',Theta:'Θ',Lambda:'Λ',Xi:'Ξ',Pi:'Π',Sigma:'Σ',Upsilon:'Υ',Phi:'Φ',Psi:'Ψ',Omega:'Ω',infty:'∞',partial:'∂',nabla:'∇',ell:'ℓ',hbar:'ℏ',Re:'ℜ',Im:'ℑ',aleph:'ℵ',emptyset:'∅',varnothing:'∅',infty:'∞',prime:'′',vert:'|',Vert:'‖',langle:'⟨',rangle:'⟩',lvert:'|',rvert:'|',lVert:'‖',rVert:'‖',mapsto:'↦',longrightarrow:'⟶',longleftarrow:'⟵',Longrightarrow:'⟹',iff:'⟺',therefore:'∴',because:'∵',cong:'≅',simeq:'≃',otimes:'⊗',oplus:'⊕',bullet:'∙',ast:'∗',times:'×',cdot:'⋅',div:'÷',pm:'±',mp:'∓',le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',approx:'≈',sim:'∼',equiv:'≡',propto:'∝',in:'∈',notin:'∉',subset:'⊂',subseteq:'⊆',supset:'⊃',supseteq:'⊇',cup:'∪',cap:'∩',to:'→',rightarrow:'→',leftarrow:'←',leftrightarrow:'↔',Rightarrow:'⇒',Leftarrow:'⇐',Leftrightarrow:'⇔',sum:'∑',prod:'∏',int:'∫',iint:'∬',oint:'∮',infty:'∞',forall:'∀',exists:'∃',neg:'¬',land:'∧',lor:'∨',degree:'°',circ:'∘',perp:'⊥',angle:'∠',ldots:'…',cdots:'⋯',vdots:'⋮',ohm:'Ω'};
 const operators=new Set(['times','cdot','div','pm','mp','le','leq','ge','geq','ne','neq','approx','sim','equiv','propto','in','notin','subset','subseteq','supset','supseteq','cup','cap','to','rightarrow','leftarrow','leftrightarrow','Rightarrow','Leftarrow','Leftrightarrow','sum','prod','int','iint','oint','forall','exists','mapsto','longrightarrow','longleftarrow','Longrightarrow','iff','therefore','because','cong','simeq','otimes','oplus','bullet','ast','neg','land','lor','circ','perp','angle']);
 const functions=new Set(['sin','cos','tan','cot','sec','csc','arcsin','arccos','arctan','sinh','cosh','tanh','log','ln','exp','lim','min','max','det','gcd']);
 function whitespace(){while(/\s/.test(raw[pos]||'')&&pos<raw.length)pos++}
 function group(){whitespace();if(raw[pos]==='{'){pos++;const content=sequence('}');if(raw[pos]!=='}')throw Error('unclosed group');pos++;return '<mrow>'+content+'</mrow>'}return atom()}
 function textGroup(){whitespace();if(raw[pos]!=='{')throw Error('missing text');let start=++pos,level=1;while(pos<raw.length&&level){if(raw[pos]==='{')level++;if(raw[pos]==='}')level--;if(level)pos++}if(level)throw Error('unclosed text');const text=raw.slice(start,pos++);return '<mtext>'+esc(text)+'</mtext>'}
 function environment(){
  whitespace();if(raw[pos]!=='{')throw Error('missing environment');const match=raw.slice(pos).match(/^\{([A-Za-z]+\*?)\}/);if(!match)throw Error('invalid environment');const name=match[1];pos+=match[0].length;
  const supported=['matrix','pmatrix','bmatrix','Bmatrix','vmatrix','Vmatrix','cases','aligned','align','align*','gathered','smallmatrix','array'];if(!supported.includes(name)||nesting>=16)throw Error('unsupported environment');if(name==='array'){whitespace();const columns=raw.slice(pos).match(/^\{[lcr| ]{1,80}\}/);if(!columns)throw Error('invalid columns');pos+=columns[0].length;}
  let rows=[[]],cell='',brace=0,level=0,closed=false;
  while(pos<raw.length){
   const token=raw.slice(pos).match(/^\\(begin|end)\{([A-Za-z]+\*?)\}/);
   if(token){if(token[1]==='begin'){level++;cell+=token[0];pos+=token[0].length;continue}if(level){level--;cell+=token[0];pos+=token[0].length;continue}if(token[2]!==name||brace!==0)throw Error('mismatched environment');pos+=token[0].length;rows[rows.length-1].push(cell);closed=true;break}
   if(raw[pos]==='\\'&&raw[pos+1]==='\\'&&brace===0&&level===0){rows[rows.length-1].push(cell);rows.push([]);cell='';pos+=2;continue}
   if(raw[pos]==='&'&&brace===0&&level===0){rows[rows.length-1].push(cell);cell='';pos++;continue}
   if(raw[pos]==='\\'&&pos+1<raw.length){cell+=raw.slice(pos,pos+2);pos+=2;continue}
   if(raw[pos]==='{')brace++;else if(raw[pos]==='}')brace--;if(brace<0)throw Error('unexpected group');cell+=raw[pos++];
  }
  if(!closed||rows.length>100||rows.some(r=>r.length>40))throw Error('invalid environment');
  if(rows.length>1&&rows[rows.length-1].length===1&&!rows[rows.length-1][0].trim())rows.pop();
  const body=rows.map(row=>'<mtr>'+row.map(value=>{if(!value.trim())return '<mtd><mrow/></mtd>';const rendered=renderMath(value,false,nesting+1);if(!rendered.startsWith('<math '))throw Error('invalid cell');const content=rendered.slice(rendered.indexOf('<mrow>'),-7);return '<mtd>'+content+'</mtd>'}).join('')+'</mtr>').join('');
  const matrix='<mtable columnalign="'+(['cases','aligned','align','align*','gathered'].includes(name)?'left':'center')+'" columnspacing="1em" rowspacing=".35em">'+body+'</mtable>';
  const delimiters={pmatrix:['(',')'],bmatrix:['[',']'],Bmatrix:['{','}'],vmatrix:['|','|'],Vmatrix:['‖','‖'],cases:['{','']};const pair=delimiters[name];return pair?'<mrow><mo stretchy="true">'+esc(pair[0])+'</mo>'+matrix+(pair[1]?'<mo stretchy="true">'+esc(pair[1])+'</mo>':'')+'</mrow>':matrix;
 }
 function atom(){whitespace();if(pos>=raw.length)throw Error('missing operand');const ch=raw[pos++];if(ch==='{'){const result=sequence('}');if(raw[pos]!=='}')throw Error('unclosed group');pos++;return '<mrow>'+result+'</mrow>'}if(ch==='}')throw Error('unexpected group');if(ch==='\\'){const match=raw.slice(pos).match(/^[A-Za-z]+|^./);if(!match)throw Error('missing command');const cmd=match[0];pos+=cmd.length;
 if(cmd==='begin')return environment();
 if(cmd==='binom'||cmd==='dbinom'||cmd==='tbinom')return '<mrow><mo>(</mo><mfrac linethickness="0">'+group()+group()+'</mfrac><mo>)</mo></mrow>';
 if(cmd==='frac'||cmd==='dfrac'||cmd==='tfrac')return '<mfrac>'+group()+group()+'</mfrac>';
 if(cmd==='sqrt'){whitespace();let index='';if(raw[pos]==='['){pos++;index=sequence(']');if(raw[pos]!==']')throw Error('missing root index');pos++}const operand=group();return index?'<mroot>'+operand+'<mrow>'+index+'</mrow></mroot>':'<msqrt>'+operand+'</msqrt>'}
 if(cmd==='text'||cmd==='textrm'||cmd==='textnormal'||cmd==='operatorname')return textGroup();
 if(['mathrm','mathbf','mathit','mathsf','mathtt','mathbb','mathcal','mathfrak'].includes(cmd)){const variant={mathrm:'normal',mathbf:'bold',mathit:'italic',mathsf:'sans-serif',mathtt:'monospace',mathbb:'double-struck',mathcal:'script',mathfrak:'fraktur'}[cmd];return '<mstyle mathvariant="'+variant+'">'+group()+'</mstyle>'}
 if(['overline','bar','hat','widehat','vec','dot','ddot','tilde','widetilde'].includes(cmd)){const mark={overline:'¯',bar:'¯',hat:'^',widehat:'^',vec:'→',dot:'˙',ddot:'¨',tilde:'~',widetilde:'~'}[cmd];return '<mover accent="true">'+group()+'<mo>'+mark+'</mo></mover>'}
 if(cmd==='overbrace'||cmd==='underbrace')return '<'+(cmd==='overbrace'?'mover':'munder')+'>'+group()+'<mo stretchy="true">'+(cmd==='overbrace'?'⏞':'⏟')+'</mo></'+(cmd==='overbrace'?'mover':'munder')+'>';
 if(cmd==='left'||cmd==='right'){whitespace();if(raw[pos]==='.') {pos++;return ''}return atom()}
 if(cmd==='!' )return '<mspace width="-0.15em"/>';
 if(cmd==='limits'||cmd==='nolimits'||cmd==='displaystyle'||cmd==='textstyle')return '';
 if(cmd===','||cmd===';'||cmd===':'||cmd===' '||cmd==='quad'||cmd==='qquad')return '<mspace width="'+(cmd==='qquad'?'2em':cmd==='quad'?'1em':'.25em')+'"/>';
 if(functions.has(cmd))return '<mi mathvariant="normal">'+cmd+'</mi>';
 if(Object.prototype.hasOwnProperty.call(sym,cmd)){let tag=operators.has(cmd)?'mo':'mi';return '<'+tag+'>'+sym[cmd]+'</'+tag+'>'}
 if('{}$%_&#|'.includes(cmd))return '<mo>'+esc(cmd)+'</mo>';
 throw Error('unsupported command');}
 if(/[0-9]/.test(ch)){let n=ch;while(/[0-9.]/.test(raw[pos]||'')&&pos<raw.length)n+=raw[pos++];return '<mn>'+esc(n)+'</mn>'}
 if(/[A-Za-z\p{L}]/u.test(ch))return '<mi>'+esc(ch)+'</mi>';
 return '<mo>'+esc(ch)+'</mo>'}
 function sequence(end){if(++depth>64)throw Error('too deeply nested');let out='';while(pos<raw.length){whitespace();if(pos>=raw.length||raw[pos]===end)break;let base=atom();whitespace();let sub=null,sup=null;while(raw[pos]==='_'||raw[pos]==='^'){const which=raw[pos++];if(which==='_'&&sub!==null||which==='^'&&sup!==null)throw Error('duplicate script');const value=group();if(which==='_')sub=value;else sup=value;whitespace()}if(sub!==null&&sup!==null)base='<msubsup>'+base+sub+sup+'</msubsup>';else if(sub!==null)base='<msub>'+base+sub+'</msub>';else if(sup!==null)base='<msup>'+base+sup+'</msup>';out+=base}depth--;return out}
 try{if(raw.length>20000)throw Error('too long');const result=sequence('');if(pos!==raw.length||!result)throw Error('invalid expression');return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="'+(display?'block':'inline')+'" aria-label="'+esc(raw)+'"><mrow>'+result+'</mrow></math>'}catch{return '<span class="math-fallback" title="Unsupported or invalid equation">'+esc(display?'$$'+raw+'$$':'$'+raw+'$')+'</span>'}
}
