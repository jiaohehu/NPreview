'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');
const { NitrilePreviewLmath } = require('./nitrile-preview-lmath');
const utils = require('./nitrile-preview-utils');
const C_textrightarrow = String.fromCharCode(8594);
const entjson = require('./nitrile-preview-entity.json');
const {fontmap, fontnames} = require('./nitrile-preview-fontmap');

class NitrilePreviewLatex extends NitrilePreviewParser {

  constructor(name) {
    super(name);
    this.tokenizer = new NitrilePreviewLmath(this);
    this.mymap = [
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
      "⁻¹" , "\\textsuperscript{-1}",
      "⁻²" , "\\textsuperscript{-2}",
      "⁻³" , "\\textsuperscript{-3}",
      "¹" , "\\textsuperscript{1}",
      "²" , "\\textsuperscript{2}",
      "³" , "\\textsuperscript{3}",
      "\\" , "\\textbackslash{}"   ,
      "|"  , "\\textbar{}"         ,
      "*"  , "{*}"                 ,
      "~"  , "\\textasciitilde{}"  ,
      "^"  , "\\textasciicircum{}" ,
      "<"  , "{$<$}"               ,
      ">"  , "{$>$}"               ,
      "∠" , "{$\\angle$}"          ,
      "\[" , "\{\[\}"              ,
      "\]" , "\{\]\}"              ,
      "$"  , "\\$"                 ,
      "#"  , "\\#"                 ,
      "&"  , "\\&"                 ,
      "_"  , "\\_"                 ,
      "%"  , "\\%"                 ,
      "\{" , "\\{"                 ,
      "\}" , "\\}"                 
    ];
    this.mymapcode = [
      " "  , "~"                   ,
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
      "⁻¹" , "\\textsuperscript{-1}",
      "⁻²" , "\\textsuperscript{-2}",
      "⁻³" , "\\textsuperscript{-3}",
      "¹" , "\\textsuperscript{1}",
      "²" , "\\textsuperscript{2}",
      "³" , "\\textsuperscript{3}",
      "\\" , "\\char92{}"          ,
      "|"  , "\\char124{}"         ,
      "*"  , "\\char42{}"          ,
      "~"  , "\\char126{}"         ,
      "^"  , "\\char94{}"          ,
      "<"  , "\\char60{}"          ,
      ">"  , "\\char62{}"          ,
      "\[" , "\\char91{}"          ,
      "\]" , "\\char93{}"          ,
      "$"  , "\\$"                 ,
      "#"  , "\\#"                 ,
      "&"  , "\\&"                 ,
      "_"  , "\\_"                 ,
      "%"  , "\\%"                 ,
      "\{" , "\\{"                 ,
      "\}" , "\\}"
    ];
    this.mymapsmpl = [
      " "  , "\\ "                 ,
      "’"  , "'"                   ,
      "“"  , "\\char34{}"          ,
      "”"  , "\\char34{}"          ,
      "\"" , "\\char34{}"          ,
      "\\" , "\\char92{}"          ,
      "|"  , "\\char124{}"         ,
      "*"  , "\\char42{}"          ,
      "~"  , "\\char126{}"         ,
      "^"  , "\\char94{}"          ,
      "<"  , "\\char60{}"          ,
      ">"  , "\\char62{}"          ,
      "\[" , "\\char91{}"          ,
      "\]" , "\\char93{}"          ,
      "$"  , "\\$"                 ,
      "#"  , "\\char35{}"          ,
      "&"  , "\\&"                 ,
      "_"  , "\\_"                 ,
      "%"  , "\\%"                 ,
      "\{" , "\\char123{}"         ,
      "\}" , "\\char125{}"
    ];
    this.mymapsmpl1 = [
      " "  , "~"                   ,
      "’"  , "'"                   ,
      "“"  , "\\char34{}"          ,
      "”"  , "\\char34{}"          ,
      "\"" , "\\char34{}"          ,
      "\\" , "\\char92{}"          ,
      "|"  , "\\char124{}"         ,
      "*"  , "\\char42{}"          ,
      "~"  , "\\char126{}"         ,
      "^"  , "\\char94{}"          ,
      "<"  , "\\char60{}"          ,
      ">"  , "\\char62{}"          ,
      "\[" , "\\char91{}"          ,
      "\]" , "\\char93{}"          ,
      "$"  , "\\$"                 ,
      "#"  , "\\char35{}"          ,
      "&"  , "\\&"                 ,
      "_"  , "\\_"                 ,
      "%"  , "\\%"                 ,
      "\{" , "\\char123{}"         ,
      "\}" , "\\char125{}"
    ];
  }
  do_hdgs(block){
    var o = [];
    var {id,row1,row2,sig,name,level,hdgn,dept,text,para,base,subrow,subfname} = block;
    o.push(this.to_info(block));
    var text = this.escape(text);
    if(this.ismaster){
      if(name=='part'){
        o.push(`\\part{${text}}`);
        o.push('');
      }
      else if(level==0){      
        o.push('\\begin{flushleft}');  
        o.push(`\\noindent{\\huge ${text}}`);
        o.push(`\\end{flushleft}`);
        o.push('');
      }
      else if(level==1){
        o.push(`\\chapter*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push(`\\addcontentsline{toc}{chapter}{${dept} ${text}}`);
        o.push('');
      }
      else if(level==2){
        o.push(`\\section*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push(`\\addcontentsline{toc}{section}{${dept} ${text}}`);
        o.push('');
      }
      else if(level==3){
        o.push(`\\subsection*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push(`\\addcontentsline{toc}{subsection}{${dept} ${text}}`);
        o.push('');
      }
      else{
        o.push(`\\subsubsection*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push('');
      }
    }else{
      if(level==0){      
        o.push('\\begin{flushleft}');  
        o.push(`\\noindent{\\huge ${text}}`);
        o.push(`\\end{flushleft}`);
        o.push('');
      }
      else if(level==1){
        o.push(`\\section*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push(`\\addcontentsline{toc}{section}{${dept} ${text}}`);
        o.push('');
      }
      else if(level==2){
        o.push(`\\subsection*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push(`\\addcontentsline{toc}{subsection}{${dept} ${text}}`);
        o.push('');
      }
      else{
        o.push(`\\subsubsection*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push('');
      }
    }
    block.latex = o.join('\n');
  }
  do_dlst(block){
    var bull = String.fromCharCode(0x2022);
    var o = [];
    var {id,row1,row2,sig,items,subfname} = block;
    var nbsp='~ ';
    o.push(this.to_info(block));
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{description}[nosep,style=unboxed,font=\\normalfont]`);
    for (var item of items) {
      var {key,text,type,rb,rt} = item;
      if(type=='text'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[{\\bfseries{}${key}}] ${nbsp}${text}`);
      }else if(type=='rmap'){
        key = `${rb}${String.fromCharCode('0xb7')}${rt}`;
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[{\\bfseries{}${key}}] ${nbsp}${text}`);
      }else if(type=='math'){
        key = this.inlinemath(key);
        text = this.unmask(text);
        o.push(`\\item[${key}] ${nbsp}${text}`);
      }else if(type=='ruby'){
        text = this.unmask(text);
        if(rb&&rt){
          o.push(`\\item[{\\jp{}\\ruby{${rb}}{${rt}}}] ${nbsp}${text}`);
        } else {
          o.push(`\\item[{\\jp{}${key}}] ${nbsp}${text}`);
        }
      }else if(type=='quot'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[\`\`${key}''] ${nbsp}${text}`);
      }else if(type=='var'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[\\textsl{${key}}] ${nbsp}${text}`);
      }else if(type=='code'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[{\\ttfamily{}${key}}] ${nbsp}${text}`);
      }
    }
    o.push(`\\end{description}`);
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_dlst_textbullet(block){
    var bull = String.fromCharCode(0x2022);
    var o = [];
    var {id,row1,row2,sig,items,subfname} = block;
    o.push(this.to_info(block));
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{description}[nosep,style=unboxed,font=\\normalfont]`);
    for (var item of items) {
      var {key,text,type,rb,rt} = item;
      if(type=='text'){
        key = this.escape(key);
        text = this.unmask(text);
        key = `\\bfseries{}${key}`;
        o.push(`\\item[\\textbullet] {\\bfseries{}${key}} ~ ${text}`);
      }else if(type=='math'){
        key = this.inlinemath(key);
        text = this.unmask(text);
        o.push(`\\item[\\textbullet]${key} ~ ${text}`);
      }else if(type=='ruby'){
        text = this.unmask(text);
        if(rb&&rt){
          o.push(`\\item[\\textbullet]{\\jp{}\\ruby{${rb}}{${rt}}} ~ ${text}`);
        } else {
          o.push(`\\item[\\textbullet]{\\jp{}${key}} ~ ${text}`);
        }
      }else if(type=='quot'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[\\textbullet]\`\`${key}'' ~ ${text}`);
      }else if(type=='emph'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[\\textbullet] {\\itshape{}${key}} ~ ${text}`);
      }else if(type=='code'){
        key = this.escape(key);
        key = this.polish(key,this.conf('nicode'));
        text = this.unmask(text);
        o.push(`\\item[\\textbullet] {\\ttfamily{}${key}} ~ ${text}`);
      }
    }
    o.push(`\\end{description}`);
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hlst(block){
    var o = [];
    var {id,row1,row2,sig,items,subfname} = block;
    o.push(this.to_info(block));
    o.push(`\\begin{flushleft}`);
    var keys = items;
    keys = keys.map( x => this.unmask(x) );
    for (var key of keys) {
      key = `{\\noindent\\bfseries ${key}}\\hfill\\\\`;
      o.push(key);
    }
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_plst(block){
    var o = [];
    var {id,row1,row2,sig,items,subfname} = block;
    o.push(this.to_info(block));
    var bull0 = '';
    o.push('\\begin{flushleft}')
    for (var item of items) {
      var {bull,bullet,value,text,dt,sep} = item;
      bullet = bullet || '';
      text = text || '';
      if (bull==='OL'||bull==='UL') bull0 = bull;
      text = this.unmask(text);
      if(dt){
        dt = this.escape(dt);
        sep = this.escape(sep);
        sep = ' ~ ';
        text = `{\\itshape ${dt}}${sep}${text}`;
      }
      switch (bull) {
        case 'OL': {
          o.push(`\\begin{enumerate}[nosep,leftmargin=${this.conf('step')}mm]`);
          o.push(`\\item\[${value}\] ${text}`);
          break;
        }
        case 'UL': {
          o.push(`\\begin{itemize}[nosep,leftmargin=${this.conf('step')}mm]`);
          o.push(`\\item ${text}`);
          break;
        }
        case 'LI': {
          if (value) {
            o.push(`\\item\[${value}\] ${text}`);
          } else {
            o.push(`\\item ${text}`);
          }
          break;
        }
        case '/OL': {
          o.push(`\\end{enumerate}`);
          if(bullet){
            if (value) {
              o.push(`\\item\[${value}\] ${text}`);
            } else {
              o.push(`\\item ${text}`);
            }
          }
          break;
        }
        case '/UL': {
          o.push(`\\end{itemize}`);
          if(bullet){
            if (value) {
              o.push(`\\item\[${value}\] ${text}`);
            } else {
              o.push(`\\item ${text}`);
            }
          }
          break;
        }
      }
    }
    o.push('\\end{flushleft}')
    o.push('');
    block.latex = o.join('\n');
  }
  do_ilst(block){
    var o = [];
    var {id,row1,row2,sig,items,subfname} = block;
    o.push(this.to_info(block));
    o.push('\\begin{flushleft}')
    o.push(`\\begin{itemize}[nosep,leftmargin=${this.conf('step')}mm]`);
    for(var item of items){
      var {dt,sep,type,text} = item;
      text = this.unmask(text);
      if(dt){
        dt = this.unmask(dt);
        if(!sep){
          sep = '~';
        }
        if(type==1){
          text = `{\\itshape ${dt}} ${sep} ${text}`;
        } else if(type==2){
          text = `{\\ttfamily ${dt}} ${sep} ${text}`;
        } else {
          text = `{\\bfseries ${dt}} ${sep} ${text}`;
        }
      }
      o.push(`\\item ${text}`);
    }
    o.push(`\\end{itemize}`);
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_nlst(block){
    ///NOTE that the begin{enumerate} will automatically allocate left padding
    ///for all items including the text item               
    ///
    var o = [];
    var {id,row1,row2,sig,items,para,base,subrow,subfname} = block;
    o.push(this.to_info(block));
    o.push(`\\begin{enumerate}[leftmargin=${this.conf('step')}mm]`);
    for (var item of items) {
      var {type,bull,text,body} = item;
      if(type=='nlst'){
        text = this.unmask(text);
        o.push(`\\item\[${bull}\] ${text}`);
        o.push('');
      }else if(type=='samp'){
        for (var i=0; i < body.length; ++i) {
          var line = body[i];
          line = this.smooth_samp(line);
          line = this.fontify_latex(line);
          line = this.polish(line,this.conf('nicode'));
          if (line.length == 0) {
            line = '~';
          } else {
            line = `{\\ttfamily{}${line}}`;
          }
          o.push(`${line}\\\\`);
        }
        if (i > 0) {
          o.pop();
          o.push(line);///get rid of the last doublebackslashes
        }
        o.push('');
      }else if(type=='pass'){
        for (var i=0; i < body.length; ++i) {
          var line = body[i];
          line = this.smooth(line);
          line = this.fontify_latex(line);
          line = this.rubify(line);
          o.push(`${line}\\\\`);
        }
        if (i > 0) {
          o.pop();
          o.push(line);///get rid of the last doublebackslashes
        }
        o.push('');
      }else if(type=='text'){
        o.push(`${text}`);
        o.push('');
      }
    }
    o.push('\\end{enumerate}');
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_prog(block){
    var o = [];
    var {id,row1,row2,sig,wide,body,caption,label,subfname} = block;
    o.push(this.to_info(block));
    var n = 0;
    const maxn = parseInt(this.conf('maxn'));
    var latexlabelcmd = this.latexlabelcmd;
    var cont = '';
    while(n < body.length){
      if(1){
        var d = [];
        for(let i=0; i < maxn && n < body.length; ++i,++n){
          var line = body[n];
          let lineno = `${n+1}`;
          line = this.escape_verb(line);
          line = this.polish_prog(line);
          lineno = this.polish_prog(lineno);
          d.push(`${lineno} & ${line}\\\\`);
        };
      } 
      var text = d.join('\n');
      var star=wide?'*':'';
      if(1){
        o.push(`\\begin{program${star}}[ht]`);
        if(this.caption_text){
          var caption_text = this.caption_text + cont;
          var caption_text = this.polish_caption(caption_text);
          o.push(`\\caption*{${caption_text}}${latexlabelcmd}`);
          latexlabelcmd = '';//so that it is not used again for the second float
          cont = ' (Cont.)';
        }
        o.push('\\begin{tabular}{@{}l l@{}}');
        o.push(text);
        o.push('\\end{tabular}');
        o.push(`\\end{program${star}}`);
        o.push('');
      }
    }
    block.latex = o.join('\n');
  }
  do_samp(block){
    var o = [];
    var {id,row1,row2,sig,body,subfname,parser} = block;
    o.push(this.to_info(block));
    var body = body.map( x => this.smooth_samp(x) );
    var body = body.map( x => this.fontify_latex(x) );
    var body = body.map( x => (x)?x:'~');
    var body = body.map( x => this.polish_samp(x) );
    var body = body.map( x => `{\\ttfamily{}${x}}`);
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{enumerate}[nosep,leftmargin=${this.conf('step')}mm]`);
    o.push(body.join('\\\\\n'));
    o.push('\\end\{enumerate\}');
    o.push('\\end\{flushleft\}')
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_pass(block){
    var o = [];
    var {id,row1,row2,sig,body,subfname,parser} = block;
    o.push(this.to_info(block));
    var body = body.map( x => this.smooth(x) );
    var body = body.map( x => this.fontify_latex(x) );
    var body = body.map( x => this.rubify(x) );
    var body = body.map( x => this.polish_pass(x) );
    var body = body.map( x => (x)?x:'~');
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin\{enumerate\}[nosep,leftmargin=${this.conf('step')}mm]`);
    o.push(body.join('\\\\\n'));
    o.push('\\end\{enumerate\}');
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hrle(block){
    var o = [];
    var {id,row1,row2,sig,text,subfname} = block;
    o.push(this.to_info(block));
    text = this.unmask(text);
    o.push(`\\begin{center}`);
    o.push(text);
    o.push(`\\end{center}`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_text(block){
    var o = [];
    var {row1,row2,sig,leadn,lead,text,subfname} = block;
    o.push(this.to_info(block));
    var v;
    const indent = '~'.repeat(5);
    if (leadn&&leadn>0) {
      lead = this.escape(lead);
      text = this.unmask(text);
      if (leadn===1) {
        text = `{\\bfseries{}${lead}} ~ ${text}`;
        o.push(`\\medskip`);
        o.push(`\\noindent ${text}`);
        o.push(`\\medskip`);
        this.needblank = 1;
      } 
      else if (leadn===2) {
        text = `{\\bfseries\\itshape{}${lead}} ~ ${text}`;
        o.push(`\\medskip`);
        o.push(`\\noindent ${text}`);
        o.push(`\\medskip`);
        this.needblank = 1;
      } 
      else {
        text = `{\\bfseries\\itshape{}${lead}} ~ ${text}`;
        o.push(`\\medskip`);
        o.push(`\\noindent ${indent}${text}`);
        o.push(`\\medskip`);
        this.needblank = 1;
      }
    } 
    else {
      text = this.unmask(text);
      /// we should not be messing with textblockcount because
      /// it will no do when we encounter IMGS or DIAG blocks
      /// which will reset this counter but in actuality we
      /// still need the indenting because the images are
      /// being shifted around as floats.
      if (this.needblank) {
        text = `\\noindent ${text}`;
        this.needblank = 0;
      }
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_quot(block){
    var o = [];
    var {id,row1,row2,sig,text,para,subfname} = block;
    o.push(this.to_info(block));
    var text = this.unmask(text);
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push('\\begin{flushleft}');
    o.push(`\\begin{quote}`);
    o.push(`${lq}${text}${rq}`);
    o.push('\\end{quote}')
    o.push('\\end{flushleft}')
    o.push('');
    block.latex = o.join('\n');
  }
  do_tabb(block){
    var o = [];
    var {id,row1,rows,ww,sig,cols,subfname} = block;
    o.push(this.to_info(block));
    var ncols = ww.length;
    var nrows = rows.length;
    var ww = '1'.repeat(ncols).split('').map(x => parseInt(x));
    var d = [];
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      pp = pp.map(x => this.unmask(x));
      pp = pp.map(x => this.polish_tabb(x));
      pp = pp.join(' \\> ');
      pp = `${pp} \\\\`;
      d.push(pp);
    }
    if(d.length==0){
      d.push(`(empty)`);
    } 
    else {
      var pp = d.pop(); ///remove the last \\\\
      pp = pp.slice(0,pp.length-2);
      d.push(pp);
    }
    ww = this.wwToOne(ww);
    ww = ww.map(x => `\\hspace{${x}\\linewidth}`);
    ww = ww.join('\\=');
    ww += '\\kill';
    o.push(`\\begin{tabbing}`);
    o.push(ww);
    o.push(d.join('\n'));
    o.push(`\\end{tabbing}`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_tabu(block){
    ///has to use tabbing because this is the only way to
    ///work across the page and across two columns
    var o = [];
    var {id,row1,row2,sig,cols,subfname} = block;
    o.push(this.to_info(block));
    var ncols = cols.length;
    var nrows = 0;
    var ww = [];
    var ss = [];
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
      var w = x.reduce((acc,s) => Math.max(acc,this.measureText(s)),0);
      ww.push(w);
      var s = x.reduce((acc,s) => (acc.length>=s.length)?acc:s,'');
      ss.push(s);
    });
    ss = ss.map(x => this.escape_verb(x));
    ss = ss.map(x => this.polish_tabu(x));
    var d = [];
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      pp = pp.map(x => this.escape_verb(x));
      pp = pp.map(x => this.polish_tabu(x));
      pp = pp.join('\\>');
      pp = `${pp}\\\\`;
      d.push(pp);
    }
    if(d.length==0){
      d.push(`(empty)`);
    } 
    else {
      var pp = d.pop(); ///remove the last \\\\
      pp = pp.slice(0,pp.length-2);
      d.push(pp);
    }
    if(0){
      var pcol='l'.repeat(ncols).split('').join('');
      o.push(`\\begin{xtabular}{@{}p{${this.conf('step')}mm}@{}${pcol}@{}}`);
      o.push(d.join('\n'));
      o.push(`\\end{xtabular}`);
      o.push('');
      block.latex = o.join('\n');
    }else{
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin{adjustwidth}{${this.conf('step')}mm}{0mm}`);
      o.push(`\\begin{tabbing}`);
      o.push(`${ss.join('\\hspace{8pt}\\=')}\\kill`);
      o.push(d.join('\n'));
      o.push(`\\end{tabbing}`);
      o.push(`\\end{adjustwidth}`);
      o.push(`\\end{flushleft}`);
      o.push('');
      block.latex = o.join('\n');
    }
  }
  do_tabr(block){
    var o = [];
    var {id,row1,row2,sig,wide,cols,subfname} = block;
    o.push(this.to_info(block));
    var text = this.cols_to_tabulary(cols);
    var star = wide?'*':'';
    if(1){
      o.push(`\\begin{table${star}}[ht]`);
      o.push(`\\centering`);
      if(this.caption_text){
        var caption_text = this.polish_caption(this.caption_text);
        o.push(`\\caption*{${caption_text}}${this.latexlabelcmd}`);
      }
      o.push(text);
      o.push(`\\end{table${star}}`);
    } 
    o.push('');
    block.latex = o.join('\n');
  }
  do_long(block){
    var o = [];
    var {id,row1,row2,sig,rows,ww,subfname} = block;
    o.push(this.to_info(block));
    var maxj = ww.length;
    rows = rows.map ( row => row.map(x => this.unmask(x)));
    rows = rows.map ((row,i) => row.map(x => (i==0)?this.polish_long_header(x):this.polish_long(x)));
    ///***NOTE: xltabular is percular of naming its columns
    var pcols = this.to_xltabular_pcols(maxj,ww);
    //var vlines = this.xfencecmd.latvlines;
    //var hlines = this.xfencecmd.lathlines;
    //var vpadding = parseInt(this.xfencecmd.latvpadding);
    var vlines = this.toArray('*');
    var hlines = this.toArray('t m b r');
    //let vpadding = 3;
    let vpadding = 0;
    var pcol = this.to_table_pcols(vlines,pcols);
    var header = rows.shift();
    o.push(`\\begin{xltabular}{\\linewidth}{${pcol}}`);
    if (hlines.indexOf('t')>=0){
      o.push('\\hline');
    }
    if (vpadding>0) {
      o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
    }
    o.push(`${header.join(' & ')}\\\\`);
    if (vpadding>0) {
      o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
    }
    if (hlines.indexOf('m')>=0){
      o.push('\\hline');
    }
    o.push(`\\endhead`);
    if (hlines.indexOf('b')>=0){
      o.push('\\hline');
    }
    o.push(`\\endfoot`);
    if (rows.length == 0) {
      o.push('(empty) ');
    } else {
      for (var k in rows) {
        var row = rows[k];

        if (k > 0) {
          if (hlines.indexOf('r') >= 0) {
            o.push('\\hline');
          }
        }
        if (vpadding > 0) {
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
        o.push(row.join(' & ') + ' \\\\\n');
        if (vpadding > 0) {
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
      }
    }
    o.push('\\end{xltabular}');
    if(this.conf('twocolumn')){
      o.unshift('\\onecolumn');
      o.push('\\twocolumn');
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_diag(block){
    var {body,wide,parser} = block;
    var mp = new NitrilePreviewDiagramMP(this,parser.notes);
    var {s} = mp.toDiagram(body);
    var ym = mp.height;
    var xm = mp.width;
    var unit = mp.unit;
    var d = [];
    d.push('\\begin{mplibcode}');
    d.push('beginfig(1)');
    d.push(`pu := \\mpdim{\\linewidth}/${xm};`);
    d.push(`u := ${unit}mm;`);
    d.push(`ratio := pu/u;`);
    d.push(`picture wheel;`);
    d.push(`wheel := image(`);
    d.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
    d.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
    d.push(s);
    d.push(`);`);
    d.push(`draw wheel scaled(ratio);`);
    d.push('endfig')
    d.push('\\end{mplibcode}')
    var text = d.join('\n');
    var star = wide?'*':'';
    var o = [];
    o.push(this.to_info(block));
    if(1){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(this.caption_text){
        var caption_text = this.polish_caption(this.caption_text);
        o.push(`\\caption*{${caption_text}}${this.latexlabelcmd}`);
      }
      o.push(text);
      o.push(`\\end{figure${star}}`);
      o.push('');
    } 
    block.latex = o.join('\n');
  }
  do_pict(block){
    var o = [];
    var {id,row1,row2,sig,wide,rows,subfname} = block;
    o.push(this.to_info(block));
    var s = [];
    for(var blk of rows){
      let {mode,images} = blk;
      var n = images.length;
      var pcols = 'C'.repeat(n).split('');
      var pcol = pcols.join('');
      if(mode && mode.width){
        s.push(`\\begin{tabulary}{${mode.width}\\linewidth}{@{}${pcol}@{}}`);
      } else {
        s.push(`\\begin{tabulary}{\\linewidth}{@{}${pcol}@{}}`);
      }
      var pp = images.map( img => {
        const {src,sub} = img;
        const imgsrc = this.toLatexImageSrc(src);
        const width = this.toLatexLength(`${100}%`);
        let graph_opt = `width=${width}`;
        if(mode && mode.frame){
          graph_opt += `,frame`;
        }
        return (`\\includegraphics[${graph_opt}]{${imgsrc}}`);
      });
      var qq = images.map( img => {
        const {src,sub} = img;
        var sub_text = this.unmask(sub);
        var sub_text = this.polish_caption(sub_text);
        return (`${sub_text}`);
      });
      s.push(pp.join(' & '));
      s.push(`\\\\`);
      s.push(qq.join(' & '));
      s.push(`\\\\`);
      s.push(`\\end{tabulary}`);
    }
    var text = s.join('\n');
    var star=wide?'*':'';
    if(1){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(this.caption_text){
        var caption_text = this.polish_caption(this.caption_text);
        o.push(`\\caption*{${caption_text}}${this.latexlabelcmd}`);
      }
      o.push(text);
      o.push(`\\end{figure${star}}`);
    } 
    o.push('');
    block.latex = o.join('\n');
  }
  do_math(block){
    var o = [];
    var {id,row1,row2,sig,math,label,more,gather,subfname} = block;
    o.push(this.to_info(block));
    this.make_math(o,math,label,more,gather);
    block.latex = o.join('\n');
  }
  do_frmd(block){
    var o = [];
    var {id,row1,row2,sig,wide,body,subfname} = block;
    o.push(this.to_info(block));;
    var s = [];
    //var [out, vw, vh] = this.toFramedLtpp(body);
    var out = this.to_frmd_mp(body);
    out = `\\fbox{${out}}`;
    out = `\\resizebox{\\linewidth}{!}{${out}}`;
    s.push(`\\begin{flushleft}`);
    s.push(`\\setlength{\\unitlength}{1pt}`);
    s.push(out);
    s.push(`\\end{flushleft}`);
    s.push('');
    var text = s.join('\n');
    var star = wide?'*':'';
    if(1){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(this.caption_text){
        var caption_text = this.polish_caption(this.caption_text);
        o.push(`\\caption*{${caption_text}}${this.latexlabelcmd}`);
      }
      o.push(text);
      o.push(`\\end{figure${star}}`);
      o.push('');
    } 
    block.latex = o.join('\n');
  }

  smooth (text) {
    return this.replaceSubstrings(text,this.mymap);
  }

  smooth_tt (text) {
    return this.replaceSubstrings(text,this.mymapcode);
  }

  smooth_samp(text){
    return this.replaceSubstrings(text,this.mymapsmpl1);
  }

  escape (text) {
    var text = this.smooth(text);
    var text = this.fontify_latex(text);
    return text;
  }

  escape_verb(text){
    var text = this.smooth_samp(text);
    var text = this.fontify_latex(text);
    return text;
  }

  escape_tt (text) {
    var text = this.smooth_tt(text);
    var text = this.fontify_latex(text);
    return text;
  }

  escape_diag(text){
    var fs = this.conf('diagfontsizept');
    var fs = `${fs}pt`;
    var text = this.smooth(text);
    var text = this.fontify_latex(text);
    var s = `{\\fontsize{${fs}}{${fs}}\\selectfont{}${text}}`;
    return s;
  }

  escape_frmd(text) {
    text = this.smooth_samp(text);
    text = this.fontify_latex(text);
    if (text.length == 0) {
      text = '\\ ';
    }
    return text;
  }

  ruby (rb,rt) {
    var s = this.to_ruby_item(rb,rt);
    return `{\\jp{}${s}}`;
  }

  do_ref (sig,label,floatname,idnum) {
    if(sig=='MATH'){
      return `${floatname}.\\ref{${label}}`;
    }
    if(sig=='HDGS'){
      var secsign = String.fromCharCode(0xA7);
      return `${secsign}{${idnum}}`;
    }
    if(sig){
      return `${floatname}.{${idnum}}`;
    }
    return `{\\ttfamily\\sout{${label}}}`;
  }

  do_img (cnt) {
    return `\\includegraphics{${cnt}}`;
  }

  math_diag(text){
    var s = this.tokenizer.toLmath(text);
    var fs = this.conf('diagfontsizept');
    var fs = `${fs}pt`;
    var s = `{\\fontsize{${fs}}{${fs}}\\selectfont{}${s}}`;
    return s;
  }

  inlinemath(text) {
    var s = this.tokenizer.toLmath(text);
    return `${s}`;
  }

  formulamath_array(text) {
    var d = this.tokenizer.toLmathArray(text);
    return d;
  }

  uri(href) {
    return `\\url{${href}}`
  }

  /*
    return the styled inline text
  */
  style (type, text) {
    type = type || '';
    switch (type) {
      case 'code': {
        text = text.trim();
        return `{\\ttfamily ${this.escape(text)}}`
        break;
      }
      case 'em': {
        text = text.trim();
        return `{\\itshape ${this.escape(text)}}`
        break;
      }
      case 'strong': {
        text = text.trim();
        return `{\\bfseries ${this.escape(text)}}`
        break;
      }
      case 'overstrike': {
        text = text.trim();
        return `\\sout{${this.escape(text)}}`
        break;
      }
      case 'var': {
        text = text.trim();
        return `\\textsl{${this.escape(text)}}`
        break;
      }
      default: {
        return `{${this.escape(text)}}`
        break;
      }
    }
  }

  _toFramedLtpp (para) {
    //var width [expr 2*([get-para-width $para]+2)]mm
    //set n [llength $para]
    //set height [expr ($n+3)*10]pt

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    var verbminwidth = 80;
    if (mpara < verbminwidth) {
      mpara = verbminwidth;
    }

    var _vw = `${6*mpara}`;
    var _vh = `${10*(npara)}`;
    var vw = `${6*mpara}pt`;
    var vh = `${10*(npara)}pt`;
    para = this.toReversedArray( para );

    var o = [];
    ///o.push(`\\setlength{\\unitlength}{1pt}`);
    o.push(`\\begin{picture}(${_vw},${_vh})`);

    var y = 0; /// 8 is a sensable number---the bigger the number the more upwards the contents shifts
    for (var line of para) {
      var x = 0;
      for (var c of line) {
        if (/\S/.test(c)) {
          c = this.escape_tt(c);
          o.push(`\\put(${x},${y}){\\ttfamily\\fontsize{10pt}{10pt}\\selectfont{}${c}}`);
        }
        x += 6;
      }
      y += 10;
    }

    o.push(`\\end{picture}`);
    return [o.join('\n'), vw, vh];
  }

  toFramedLtpp (para) {
    //var width [expr 2*([get-para-width $para]+2)]mm
    //set n [llength $para]
    //set height [expr ($n+3)*10]pt

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    var verbminwidth = 80;
    if (mpara < verbminwidth) {
      mpara = verbminwidth;
    }

    var _vw = 494;
    var _vh = `${12*(npara)}`;
    para = this.toReversedArray( para );

    var o = [];
    ///o.push(`\\setlength{\\unitlength}{1pt}`);
    o.push(`\\begin{picture}(${_vw},${_vh})`);

    var y = 0; /// used to be '8' ---the bigger the number the more upwards the contents shifts
    for (var line of para) {
      var x = 0;
      line = this.escape_tt(line);
      o.push(`\\put(${x},${y+3}){\\ttfamily\\fontsize{12pt}{12pt}\\selectfont{}${line}}`);
      y += 12;
    }

    o.push(`\\end{picture}`);
    return [o.join('\n'), _vw, _vh];
  }

  to_framed_pgf (para, config ) {
    //var width [expr 2*([get-para-width $para]+2)]mm
    //set n [llength $para]
    //set height [expr ($n+3)*10]pt

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    if (mpara < config.verbminwidth) {
      mpara = config.verbminwidth;
    }

    var vw = `${6*mpara}pt`;
    var vh = `${10*(1+npara)}pt`;
    para = this.toReversedArray( para );

    var o = [];
    o.push(`\\begin{pgfpicture}{0pt}{0pt}{${vw}}{${vh}}`);

    var y = 7; /// 7 is a sensable number---the bigger the number the more upwards the contents shifts
    for (var line of para) {
      var x = 0;
      for (var c of line) {
        if (/\S/.test(c)) {
          c = this.escape_tt(c);
          o.push(`\\pgftext[x=${x}pt,y=${y}pt,base,left]{\\ttfamily\\fontsize{10pt}{10pt}\\selectfont{}${c}}`);
        }
        x += 6;
      }
      y += 10;
    }

    o.push(`\\end{pgfpicture}`);
    return [o.join('\n'), vw, vh];
  }

  to_ruby_item (base, top) {
    var re = '';
    var rb = '';
    var rt = '';
    for (var c of base) {
      if (!/[\u3040-\u309F]/.test(c)) {
        ///not hiragana
        if (rt.length) {
          re += `(${rt})`;
          rt = '';
        }
        rb += c;
      } else {
        if (rb.length) {
          re += '(.+?)';
          rb = '';
        }
        rt += c;
      }
    }
    if (rb.length) {
      re += '(.+?)';
      rb = '';
    } else if (rt.length) {
      re += `(${rt})`;
      rt = '';
    }
    ///console.log(re);
    re = `^${re}$`;
    ///console.log(re);
    var re = new RegExp(re);
    var v = re.exec(top);
    ///console.log(v);
    var v1 = re.exec(base);
    ///console.log(v1);
    var o = '';
    if (v && v1 && v.length === v1.length) {
      /// match
      for (var j=1; j < v.length; ++j) {
        if (v1[j] === v[j]) {
          o += `\\ruby{${v1[j]}}{}`;
        } else {
          o += `\\ruby{${v1[j]}}{${v[j]}}`;
        }
      }
    } else {
      o = `\\ruby{${base}}{${top}}`;
    }
    ///console.log(o);
    return o;
  }

  toFramedFigure (text) {
    var o = [];
    for (var pp of text) {
      pp = pp.map( x => {
          var [image,width,opts,src,srcs,sub] = x;
          if (!src && srcs.length) {
            src = srcs[0];///TODO: need to change it so that it picks a right format
          }
          var { height } = opts;
          if (height) {
            return `\\begin{subfigure}[t]{${width}\\linewidth}\\includegraphics[keepaspectratio=true,height=${height},width=\\linewidth]{${src}}\\caption{${this.unmask(sub)}}\\end{subfigure}`;
          } else {
            return `\\begin{subfigure}[t]{${width}\\linewidth}\\includegraphics[keepaspectratio=true,width=\\linewidth]{${src}}\\caption{${this.unmask(sub)}}\\end{subfigure}`;
          }
      });

      var spacing = 1;
      var sep = '~'.repeat(spacing);
      o.push(pp.join(sep));
      o.push('');
    }
    return o.join('\n');
  }

  to_xltabular_pcols (maxj, ww) {

    /// given a ww that is a list of ".2 .3 .5" try to figure out
    /// the width of each p-column with an assumed gap between columns
    /// that is .01\linewidth

    /// \begin{tabularx}{\linewidth}{
    /// | >{\hsize=0.5\hsize\raggedright\arraybackslash}X
    ///  | >{\hsize=0.5\hsize\centering\arraybackslash}X
    ///  | >{\hsize=2.0\hsize\raggedleft\arraybackslash}X | }

    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*maxj );
    ww = ww.map( x => x.toFixed(6) );
    ww = ww.map(x => `>{\\hsize=${x}\\hsize\\raggedright\\arraybackslash}X`);
    return ww;
  }

  to_table_pcols(vlines,pp){
    var oo = [];
    for(var j=0; j < pp.length; ++j){
      if(vlines.indexOf(`${j}`)>=0 || vlines.indexOf('*')>=0) {
        oo.push('|');
        oo.push(pp[j]);
      } else {
        oo.push(pp[j]);
      }
    }
    if(vlines.indexOf(`${pp.length}`)>=0 || vlines.indexOf('*')>=0){
      oo.push('|');
    }
    return oo.join('');
  }

  to_shor_pcols(vlines,pp){
    return 'l'.repeat(pp.length);
  }

  make_line(math,label,gather){
    label=label||'';
    if(label) {
      label = `\\label{${label}}`;
    }
    var lines = this.formulamath_array(math);
    if(lines.length>0){
      lines = lines.map(pp => {
        var p = pp.join(' & ');
        return p;
      });
      lines = lines.filter(x => x.length?true:false);//remove empty lines
      var line = lines.join('\\\\\n');
      var line = `\\begin{split}\n${line}\n\\end{split}${label}`;
    } else {
      lines = lines.map(pp => {
        var p = pp.join(' ');
        return p;
      });
      var line = lines.join('\n');
    }
    return {line};
  }

  make_math(o,math,label,more,gather){
    ///   \begin{equation}           
    ///   \begin{split}                    
    ///   \end{split}
    ///   \end{equation}           
    ///
    ///   \begin{align}
    ///   \end{align}
    var lines = [];
    var {line} = this.make_line(math,label,gather);
    lines.push(line);
    more.forEach(x => {
      var {line} = this.make_line(x.math,x.label,gather);
      lines.push(line);
    });
    //remove lines that are empty, it can happen if people
    //put extra \\ at the last line
    lines = lines.map(x => x.trim());
    lines = lines.filter(x => x?true:false);
    if(1){
      if (label) {
        o.push(`\\begin{gather}`);
        o.push(lines.join('\\\\\n'));
        o.push(`\\end{gather}`);
      } else {
        o.push(`\\begin{gather*}`);
        o.push(lines.join('\\\\\n'));
        o.push(`\\end{gather*}`);
      } 
    }else{
      if (label){
        o.push(`\\begin{align}`);
        o.push(lines.join('\\\\\n'));
        o.push(`\\end{align}`);
      } else {
        o.push(`\\begin{align*}`);
        o.push(lines.join('\\\\\n'));
        o.push(`\\end{align*}`);
      }
    }
    o.push('');
  }

  toDisplayMath(o,id,sig,row1,row2,data,isalignequalsign) {
    if (isalignequalsign) {
      var data = data.map(x => x.join('\n'));
      data = data.map(x => { 
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(x);
        if (v) {
          var s = `${v[1]} &= ${v[2]}`;
          return s;
        } else {
          var s = `& ${x}`;
          return s;
        }
      });
      var text = data.join('\\\\');
      o.push(`\\begin{align*}`);
      o.push(text);
      o.push(`\\end{align*}`);
      o.push('');
    } else {
      var data = data.map(x => x.join('\n'));
      var text = data.join('\\\\');
      o.push(`\\begin{gather*}`);
      o.push(text);
      o.push(`\\end{gather*}`);
      o.push('');
    }
  }

  toEquation(o,id,sig,row1,row2,data,isalignequalsign) {
    var bls = data;
    var ss = [];
    var star = '';
    for(var bl of bls) {
      var s0 = bl.join(' ');
      if( isalignequalsign) {
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['',''];
          s[0] = v[1];
          s[1] = '= ' + v[2];
          var s = s.join(' & ');
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          var s = s.join(' & ');
          ss.push(s);
        }
      } else {
        var s = s0;
        ss.push(s);
      }
    }
    o.push(`\\begin{equation${star}}${this.latexlabelcmd}`);
    o.push(`\\begin{split}`);
    o.push(ss.join('\\\\\n'));
    o.push(`\\end{split}`);
    o.push(`\\end{equation${star}}`);
    o.push('');
  }

  toEquations(o,id,sig,row1,row2,data,isalignequalsign) {
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\begin{align${star}}${this.latexlabelcmd}`);
    } else {
      o.push(`\\begin{gather${star}}${this.latexlabelcmd}`);
    }
    var ss = [];
    for(var bl of bls) {
      var s0 = bl.join(' ');
      if( isalignequalsign) {
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['',''];
          s[0] = v[1];
          s[1] = '= ' + v[2];
          var s = s.join(' & ');
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          var s = s.join(' & ');
          ss.push(s);
        }
      } else {
        var s = s0;
        ss.push(s);
      }
    }
    o.push(ss.join('\\\\\n'));
    if (isalignequalsign) {
      o.push(`\\end{align${star}}`);
    } else {
      o.push(`\\end{gather${star}}`);
    }
    o.push('');
  }

  toSubequations(o,id,sig,row1,row2,data) {
    var bls = data;
    var j = 0;
    var star = '';
    o.push(`\\begin{subequations}${this.latexlabelcmd}`);
    for(var bl of bls) {
      o.push(`\\begin{equation}`);
      var s = bl.join(' ');
      o.push(s);
      o.push(`\\end{equation}`);
    }
    o.push(`\\end{subequations}`);
    o.push('');
  }

  toMultline(o,id,sig,row1,row2,data) {
    var bls = data;
    var ss = [];
    for(var bl of bls) {
      var s0 = bl.join(' ');
      ss.push(s0);
    }
    var star = this.xencecmd.star||'';
    o.push(`\\begin{multline${star}}${this.latexlabelcmd}`);
    o.push(ss.join('\\\\\n'));
    o.push(`\\end{multline${star}}`);
    o.push('');
  }

  fontify_latex (text) {
    ///
    /// fontify in the style of Latex
    ///

    //const fontnames = ['jp','tw','cn','kr'];
    var newtext = '';
    var s0 = '';
    var fns0 = 0;
    var a0 = '';
    var fn0 = '';
    let latfontsize = this.xlatfontsize;
    if(latfontsize){
      latfontsize = `\\${latfontsize}{}`;
    }

    for (var j=0; j < text.length; ++j) {

      var c = text[j];
      var cc = text.charCodeAt(j);

      if (cc >= 128 && cc <= 0xFFFF) {
        var fns = fontmap[cc];
      } else {
        var fns = 0;
      }

      // buildup ASCII text
      if(fns == 0 && fns0 == 0){
        a0 += c;
        continue;
      } else {
        if (fns0 == 0) {
          fns0 = fns;
        }
      }

      // flush ASCII text
      if(a0){
        newtext += `${a0}`;
        a0 = '';
      } 

      /// check to see if this char has the same font as the last one
      var fns0 = fns0 & fns; /// bitwise-AND
      if (fns0) {
        /// get the first font: assign 'k' according to the followin rules:
        ////  0b0001 => 0, 0b0010 => 1; 0b0011 => 0; 0b0100 => 2
        var k = 0;
        for (k=0; k < fontnames.length; ++k) {
          if (fns0 & (1 << k)) {
            break;
          }
        }
        var fn0 = fontnames[k];
        s0 += c;
        continue
      }

      /// by the time we get here the 'c' is either a CJK that does
      //// not agree with previous character in terms of the same font;
      //// or 'c' is not a CJK at all.
      newtext += `{\\${fn0} ${s0}}`;
      fns0 = 0;
      s0 = '';
      fn0 = '';

      /// it is CJK if 'fns' is not zero
      if (fns) {
        /// get the first font: assign 'k' according to the followin rules:
        ////  0b0001 => 0, 0b0010 => 1; 0b0011 => 0; 0b0100 => 2
        var k = 0;
        for (k=0; k < fontnames.length; ++k) {
          if (fns & (1 << k)) {
            break;
          }
        }
        /// pick a font name
        fns0 = fns;
        fn0 = fontnames[k];
        s0 = c;
        continue;
      }

      /// we get here if the 'c' is not a CJK
      a0 += c; // add to a0
    }

    if(a0){
      newtext += `${a0}`;
    } else if (s0){
      newtext += `{\\${fn0} ${s0}}`;
    }
    return newtext;
  }

  polish(s,fs,style){
    style=style||'';
    if(s){
      if(fs){
        s = `{${style}\\${fs}{}${s}}`; 
      }
    }
    return s;
  }

  polish_caption(s){
    return this.polish(s,this.conf('nicaption'));
  }
  polish_tabr(s){
    return this.polish(s,this.conf('nitabr'));
  }
  polish_tabr_header(s){
    return this.polish(s,this.conf('nitabr'),'\\bfseries');
  }
  polish_long(s){
    return this.polish(s,this.conf('nilong'));
  }
  polish_long_header(s){
    return this.polish(s,this.conf('nilong'),'\\bfseries');
  }
  polish_pass(s){
    return this.polish(s,this.conf('nipass'));
  }
  polish_samp(s){
    return this.polish(s,this.conf('nisamp'));
  }
  polish_tabb(s){
    return this.polish(s,this.conf('nitabb'));
  }
  polish_tabu(s){
    return this.polish(s,this.conf('nitabu'));
  }
  polish_prog(s){
    return this.polish(s,this.conf('niprog'));
  }

  to_mpcolor(color) {
    return `\\mpcolor{${color}}`;
  }

  mpfontsize(fontsize) {
    ///For now, just match the behavior of the context so that the font size
    ///for MP stays the same regardless.
    return '';
    const names = ["tiny",  "scriptsize",  "footnotesize", "small", "normalsize", "large", "Large", "LARGE", "huge", "Huge" ];
    const sizes = [6,  8,  10, 11, 12, 14, 17, 20, 25, 25];
    const len = 10;
    var sz = parseInt(fontsize);
    if (Number.isFinite(sz)) {
      if (sz < sizes[0]) {
        return `\\${names[0]}{}`;
      } else if (sz > sizes[9]) {
        return `\\${names[9]}{}`;
      } else {
        for(var i=1; i < len; ++i) {
          if (sz <= sizes[i]) {
            return `\\${names[i]}{}`;
          }
        }
      }
      return '\\normalsize{}';
    }
    else if(names.indexOf(this.fontsize) >= 0){
      return `\\${this.fontsize}{}`;
    }
    else {
      return '\\normalsize{}';
    }
  }

  toLatexLength(str) {
    /// take an input string that is 100% and convert it to '\linewidth'.
    /// take an input string that is 50% and convert it to '0.5\linewidth'.
    /// take an input string that is 10cm and returns "10cm"
    if (!str) {
      return '';
    }
    var re = /^(.*)\%$/;
    if (re.test(str)) {
      var str0 = str.slice(0,str.length-1);
      var num = parseFloat(str0)/100;
      if (Number.isFinite(num)) {
        var num = num.toFixed(3);
        if (num==1) {
          return `\\linewidth`;
        }
        return `${num}\\linewidth`;
      } 
    }
    return str;
  }

  toLatexImageSrc(src){
    if(src.endsWith('.svg')){
      return src.slice(0,src.length-4) + '.png';
    }
    return src;
  }

  to_info(block) {
    var { subfname, name, level, dept, title, sig, row1, row2 } = block;
    subfname = subfname || '';
    name = name || '';
    level = level || '0';
    dept = dept || '';
    title = title || '';
    sig = sig || '';
    row1 = row1 || 0;
    row2 = row2 || 0;
    return (`%${sig} (${subfname}) ${name}${level} ${dept} (${title}) ${row1} ${row2}`);
  }

  to_frmd_mp(body){
    var o = [];
    var n = body.length;
    var solid = '\\ '.repeat(80);
    o.push(`\\begin{mplibcode}`);
    o.push(`numeric o; o := 12pt;`);
    o.push(`draw (1*o,0)--(1*o,-${n-1}*o) withpen pencircle withcolor white;`);
    o.push(`label.rt(btex {\\ttfamily\\fontsize{12pt}{12pt}\\selectfont{}${solid}} etex, (0,0));`);
    body.forEach((x,i) => {
      x = this.escape_frmd(x);
      o.push(`label.rt(btex {\\ttfamily\\fontsize{12pt}{12pt}\\selectfont{}${x}} etex, (0,-${i}*o));`);
    });
    o.push(`endfig`);
    o.push(`\\end{mplibcode}`);
    return o.join('\n');
  }

  cols_to_tabulary(cols){
    var ncols = cols.length;
    var pcols = 'L'.repeat(ncols).split('');
    var maxn = 0;
    var pcol = pcols.join('');
    var nrows = 0;
    var vpadding = 1;
    /// find out the longest rows
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var s = [];
    s.push(`\\begin{tabulary}{\\linewidth}{${pcol}}`);
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      if (j == 0) {
        s.push('\\hline');
        s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        var kk = pp.map(x => x.split('\\\\'));
        var kk = kk.map(k => k.map(x => this.unmask(x)));
        var kk = kk.map(k => k.map(x => this.polish_tabr_header(x)));
        var maxn = kk.reduce((maxn,k) => Math.max(maxn,k.length),0);
        for(var n=0; n < maxn; ++n){
          var pp = kk.map(x => x[n]||'');
          s.push(`${pp.join(' & ')}\\\\`);
        }
        s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        s.push('\\hline');
      }
      else {
        var pp = pp.map(x => this.unmask(x));
        var pp = pp.map(x => this.polish_tabr(x));
        s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        s.push(`${pp.join(' & ')}\\\\`);
      }
    }
    s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
    s.push('\\hline');
    s.push('\\end{tabulary}');
    return s.join('\n');
  }
}

class NitrilePreviewPdflatex extends NitrilePreviewLatex {
  constructor() {
    super('PDFLATEX');
  }
  fontify_latex (text) {
    return text;
  }
  toDocument() {
    var texlines = this.blocks.map(x => x.latex);
    var conflines = this.toConfigLines();
    var documentclass = this.conf('documentclass');
    var toclines = [];
    var titlelines = [];
    var opts = [];
    if (!documentclass) {
      documentclass = (this.ismaster)?'report':'article';
    }
    if (this.conf('twocolumn')) {
      opts.push('twocolumn');
    }
    if (this.conf('bodyfontsizept')) {
      opts.push(`${this.conf('bodyfontsizept')}pt`);
    }
    if(this.conf('frontpage')){
      titlelines.push(`\\title{${this.escape(this.conf('title'))}}`);
      titlelines.push(`\\author{${this.escape(this.conf('author'))}}`);
      titlelines.push(`\\maketitle`);
    }
    if(this.conf('toc')){
      toclines.push(`\\tableofcontents`);
    } 
    var data = `\
% !TEX program = PdfLatex
${conflines.join('\n')}
\\documentclass[${opts.join(',')}]{${documentclass}}
${this.toRequiredPackages()}
${this.toExtraPackages()}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
    return data;
  }
  toRequiredPackages () {
    //for PDFLATEX
    var geometry_opts = [];
    geometry_opts.push(`left=${this.conf('leftmargin')}mm`);
    geometry_opts.push(`right=${this.conf('rightmargin')}mm`);
    geometry_opts.push(`top=${this.conf('topmargin')}mm`);
    if (this.conf('papersize')) {
      geometry_opts.push(this.conf('papersize'));
    }
    if (this.conf('twoside')) {
      geometry_opts.push('twoside');
    }
    return `\\usepackage[utf8x]{inputenc}
\\usepackage[${geometry_opts.join(',')}]{geometry}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{paralist}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{changepage}
\\DeclareMathOperator{\\sech}{sech}
\\DeclareMathOperator{\\csch}{csch}
\\DeclareMathOperator{\\arcsec}{arcsec}
\\DeclareMathOperator{\\arccot}{arccot}
\\DeclareMathOperator{\\arccsc}{arccsc}
\\DeclareMathOperator{\\arcosh}{arcosh}
\\DeclareMathOperator{\\arsinh}{arsinh}
\\DeclareMathOperator{\\artanh}{artanh}
\\DeclareMathOperator{\\arsech}{arsech}
\\DeclareMathOperator{\\arcsch}{arcsch}
\\DeclareMathOperator{\\arcoth}{arcoth}
\\DeclareMathSymbol{\\Alpha}{\\mathalpha}{operators}{"41}
\\DeclareMathSymbol{\\Beta}{\\mathalpha}{operators}{"42}
\\DeclareMathSymbol{\\Epsilon}{\\mathalpha}{operators}{"45}
\\DeclareMathSymbol{\\Zeta}{\\mathalpha}{operators}{"5A}
\\DeclareMathSymbol{\\Eta}{\\mathalpha}{operators}{"48}
\\DeclareMathSymbol{\\Iota}{\\mathalpha}{operators}{"49}
\\DeclareMathSymbol{\\Kappa}{\\mathalpha}{operators}{"4B}
\\DeclareMathSymbol{\\Mu}{\\mathalpha}{operators}{"4D}
\\DeclareMathSymbol{\\Nu}{\\mathalpha}{operators}{"4E}
\\DeclareMathSymbol{\\Omicron}{\\mathalpha}{operators}{"4F}
\\DeclareMathSymbol{\\Rho}{\\mathalpha}{operators}{"50}
\\DeclareMathSymbol{\\Tau}{\\mathalpha}{operators}{"54}
\\DeclareMathSymbol{\\Chi}{\\mathalpha}{operators}{"58}
\\DeclareMathSymbol{\\omicron}{\\mathord}{letters}{"6F}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage{xfrac}
\\usepackage{hyperref}
\\usepackage{anyfontsize}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
\\usepackage{xtab}
\\usepackage{float}
\\floatstyle{plaintop}
\\newfloat{Figure}{tbp}{lof}
\\floatstyle{plaintop}
\\newfloat{Table}{tbp}{lot}
\\floatstyle{plaintop}
\\newfloat{program}{tbp}{lop}
`
  }
  toExtraPackages() {
    var extra = this.conf('extra');
    return extra.split('\t').join('\n');
  }

}

class NitrilePreviewLualatex extends NitrilePreviewLatex {
  constructor() {
    super('LUALATEX');
  }
  toDocument() {
    var texlines = this.blocks.map(x => x.latex);
    var conflines = this.toConfigLines();
    var opts = [];
    var titlelines = [];
    var toclines = [];
    var documentclass = this.conf('documentclass');
    if (!documentclass) {
      documentclass = (this.ismaster)?'report':'article';
    }
    if (this.conf('twocolumn')) {
      opts.push('twocolumn');
    }
    if (this.conf('bodyfontsizept')) {
      opts.push(`${this.conf('bodyfontsizept')}pt`);
    }
    if(this.conf('frontpage')){
      titlelines.push(`\\title{${this.escape(this.config('title'))}}`);
      titlelines.push(`\\author{${this.escape(this.config('author'))}}`);
      titlelines.push(`\\maketitle`);
    }
    if(this.conf('toc')){
      toclines.push(`\\tableofcontents`);
    } 
    var data = `\
% !TEX program = LuaLatex
${conflines.join('\n')}
\\documentclass[${opts.join(',')}]{${documentclass}}
${this.toRequiredPackages()}
${this.toExtraPackages()}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
    return data;
  }

  toRequiredPackages () {
    //LuaLatex
    var geometry_opts = [];
    geometry_opts.push(`left=${this.conf('leftmargin')}mm`);
    geometry_opts.push(`right=${this.conf('rightmargin')}mm`);
    geometry_opts.push(`top=${this.conf('topmargin')}mm`);
    if (this.conf('papersize')) {
      geometry_opts.push(this.conf('papersize'));
    }
    if (this.conf('twoside')) {
      geometry_opts.push('twoside');
    }

    return `\\usepackage{microtype}
\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\newjfontfamily\\de{dejavusans}
\\newjfontfamily\\za{zapfdingbats}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
\\usepackage[${geometry_opts.join(',')}]{geometry}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{unicode-math}
\\usepackage{xfrac}
\\usepackage{changepage}
\\usepackage{fancyvrb}
\\DeclareMathOperator{\\sech}{sech}
\\DeclareMathOperator{\\csch}{csch}
\\DeclareMathOperator{\\arcsec}{arcsec}
\\DeclareMathOperator{\\arccot}{arccot}
\\DeclareMathOperator{\\arccsc}{arccsc}
\\DeclareMathOperator{\\arcosh}{arcosh}
\\DeclareMathOperator{\\arsinh}{arsinh}
\\DeclareMathOperator{\\artanh}{artanh}
\\DeclareMathOperator{\\arsech}{arsech}
\\DeclareMathOperator{\\arcsch}{arcsch}
\\DeclareMathOperator{\\arcoth}{arcoth}
\\DeclareMathSymbol{\\Alpha}{\\mathalpha}{operators}{"41}
\\DeclareMathSymbol{\\Beta}{\\mathalpha}{operators}{"42}
\\DeclareMathSymbol{\\Epsilon}{\\mathalpha}{operators}{"45}
\\DeclareMathSymbol{\\Zeta}{\\mathalpha}{operators}{"5A}
\\DeclareMathSymbol{\\Eta}{\\mathalpha}{operators}{"48}
\\DeclareMathSymbol{\\Iota}{\\mathalpha}{operators}{"49}
\\DeclareMathSymbol{\\Kappa}{\\mathalpha}{operators}{"4B}
\\DeclareMathSymbol{\\Mu}{\\mathalpha}{operators}{"4D}
\\DeclareMathSymbol{\\Nu}{\\mathalpha}{operators}{"4E}
\\DeclareMathSymbol{\\Omicron}{\\mathalpha}{operators}{"4F}
\\DeclareMathSymbol{\\Rho}{\\mathalpha}{operators}{"50}
\\DeclareMathSymbol{\\Tau}{\\mathalpha}{operators}{"54}
\\DeclareMathSymbol{\\Chi}{\\mathalpha}{operators}{"58}
\\DeclareMathSymbol{\\omicron}{\\mathord}{letters}{"6F}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage[unicode]{hyperref}
\\usepackage{anyfontsize}
\\usepackage{luamplib}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
%\\usepackage{supertabular}
\\usepackage{xtab}
\\usepackage[export]{adjustbox}
\\usepackage{float}
\\floatstyle{plaintop}
\\newfloat{Figure}{tbp}{lof}
\\floatstyle{plaintop}
\\newfloat{Table}{tbp}{lot}
\\floatstyle{plaintop}
\\newfloat{program}{tbp}{lop}
`
  }

  toExtraPackages() {
    var extra = this.conf('extra');
    return extra.split('\t').join('\n');
  }

}

class NitrilePreviewMemor extends NitrilePreviewLatex {
  constructor() {
    super('MEMOR');
  }
  toDocument() {
    var texlines = this.blocks.map(x => x.latex);
    var conflines = this.toConfigLines();
    var opts = [];
    if (this.conf('twocolumn')) {
      opts.push('twocolumn');
    }
    if (this.conf('bodyfontsizept')) {
      opts.push(`${this.conf('bodyfontsizept')}pt`);
    }
    var titlelines = [];
    var toclines = [];
    if(this.conf('frontpage')){
      titlelines.push(`\\title{${this.escape(this.conf('title'))}}`);
      titlelines.push(`\\author{${this.escape(this.conf('author'))}}`);
      titlelines.push(`\\maketitle`);
    }
    if(this.conf('toc')){
      toclines.push(`\\tableofcontents`);
    } 
    var data = `% !TEX program = LuaLatex
${conflines.join('\n')}
\\documentclass[${opts.join(',')}]{memoir}
${this.toRequiredPackages_lualatex()}
${this.toExtraPackages()}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
    return data;
  }
  toExtraPackages() {
    //MEMOR
    var extra = this.conf('extra');
    return extra.split('\t').join('\n');
  }
  toRequiredPackages_lualatex() {
    //MEMOR
    return `\\usepackage{microtype}
\\let\\saveprintglossary\\printglossary
\\let\\printglossary\\relax
\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\let\\printglossary\\saveprintglossary
\\let\\saveprintglossary\\relax
\\newjfontfamily\\de{dejavusans}
\\newjfontfamily\\za{zapfdingbats}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{unicode-math}
\\usepackage{xfrac}
\\usepackage{caption}
\\DeclareMathOperator{\\sech}{sech}
\\DeclareMathOperator{\\csch}{csch}
\\DeclareMathOperator{\\arcsec}{arcsec}
\\DeclareMathOperator{\\arccot}{arccot}
\\DeclareMathOperator{\\arccsc}{arccsc}
\\DeclareMathOperator{\\arcosh}{arcosh}
\\DeclareMathOperator{\\arsinh}{arsinh}
\\DeclareMathOperator{\\artanh}{artanh}
\\DeclareMathOperator{\\arsech}{arsech}
\\DeclareMathOperator{\\arcsch}{arcsch}
\\DeclareMathOperator{\\arcoth}{arcoth}
\\DeclareMathSymbol{\\Alpha}{\\mathalpha}{operators}{"41}
\\DeclareMathSymbol{\\Beta}{\\mathalpha}{operators}{"42}
\\DeclareMathSymbol{\\Epsilon}{\\mathalpha}{operators}{"45}
\\DeclareMathSymbol{\\Zeta}{\\mathalpha}{operators}{"5A}
\\DeclareMathSymbol{\\Eta}{\\mathalpha}{operators}{"48}
\\DeclareMathSymbol{\\Iota}{\\mathalpha}{operators}{"49}
\\DeclareMathSymbol{\\Kappa}{\\mathalpha}{operators}{"4B}
\\DeclareMathSymbol{\\Mu}{\\mathalpha}{operators}{"4D}
\\DeclareMathSymbol{\\Nu}{\\mathalpha}{operators}{"4E}
\\DeclareMathSymbol{\\Omicron}{\\mathalpha}{operators}{"4F}
\\DeclareMathSymbol{\\Rho}{\\mathalpha}{operators}{"50}
\\DeclareMathSymbol{\\Tau}{\\mathalpha}{operators}{"54}
\\DeclareMathSymbol{\\Chi}{\\mathalpha}{operators}{"58}
\\DeclareMathSymbol{\\omicron}{\\mathord}{letters}{"6F}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage{anyfontsize}
\\usepackage{luamplib}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
\\usepackage[unicode]{hyperref}
%%% command to define \mplibtoPDF command
\\def\\mplibtoPDF#1{\\special{pdf:literal direct #1}}
%%% create a new float called 'diagram'
\\newcommand{\\diagramname}{Diagram}
\\newcommand{\\listdiagramname}{List of Diagrams}
\\newlistof{listofdiagrams}{dgm}{\\listdiagramname}
\\newfloat{diagram}{dgm}{\\diagramname}
\\newlistentry{diagram}{dgm}{0}
%%% create a new float called 'program'
\\newcommand{\\programname}{Program}
\\newcommand{\\listprogramname}{List of Programs}
\\newlistof{listofprograms}{pgm}{\\listprogramname}
\\newfloat{program}{pgm}{\\programname}
\\newlistentry{program}{pgm}{0}
`;
  }
  toRequiredPackages_pdflatex() {
    //MEMOR
    return `\\usepackage{microtype}
\\usepackage[utf8x]{inputenc}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{xfrac}
\\usepackage{caption}
\\DeclareMathOperator{\\sech}{sech}
\\DeclareMathOperator{\\csch}{csch}
\\DeclareMathOperator{\\arcsec}{arcsec}
\\DeclareMathOperator{\\arccot}{arccot}
\\DeclareMathOperator{\\arccsc}{arccsc}
\\DeclareMathOperator{\\arcosh}{arcosh}
\\DeclareMathOperator{\\arsinh}{arsinh}
\\DeclareMathOperator{\\artanh}{artanh}
\\DeclareMathOperator{\\arsech}{arsech}
\\DeclareMathOperator{\\arcsch}{arcsch}
\\DeclareMathOperator{\\arcoth}{arcoth}
\\DeclareMathSymbol{\\Alpha}{\\mathalpha}{operators}{"41}
\\DeclareMathSymbol{\\Beta}{\\mathalpha}{operators}{"42}
\\DeclareMathSymbol{\\Epsilon}{\\mathalpha}{operators}{"45}
\\DeclareMathSymbol{\\Zeta}{\\mathalpha}{operators}{"5A}
\\DeclareMathSymbol{\\Eta}{\\mathalpha}{operators}{"48}
\\DeclareMathSymbol{\\Iota}{\\mathalpha}{operators}{"49}
\\DeclareMathSymbol{\\Kappa}{\\mathalpha}{operators}{"4B}
\\DeclareMathSymbol{\\Mu}{\\mathalpha}{operators}{"4D}
\\DeclareMathSymbol{\\Nu}{\\mathalpha}{operators}{"4E}
\\DeclareMathSymbol{\\Omicron}{\\mathalpha}{operators}{"4F}
\\DeclareMathSymbol{\\Rho}{\\mathalpha}{operators}{"50}
\\DeclareMathSymbol{\\Tau}{\\mathalpha}{operators}{"54}
\\DeclareMathSymbol{\\Chi}{\\mathalpha}{operators}{"58}
\\DeclareMathSymbol{\\omicron}{\\mathord}{letters}{"6F}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage{anyfontsize}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
\\usepackage[unicode]{hyperref}
%%% create a new float named 'diagram'
\\newcommand{\\diagramname}{Diagram}
\\newcommand{\\listdiagramname}{List of Diagrams}
\\newlistof{listofdiagrams}{dgm}{\\listdiagramname}
\\newfloat{diagram}{dgm}{\\diagramname}
\\newlistentry{diagram}{dgm}{0}
%%% create a new float named 'program'
\\newcommand{\\programname}{Program}
\\newcommand{\\listprogramname}{List of Programs}
\\newlistof{listofprograms}{pgm}{\\listprogramname}
\\newfloat{program}{pgm}{\\programname}
\\newlistentry{program}{pgm}{0}
`;
  }

}
module.exports = { NitrilePreviewPdflatex,
                   NitrilePreviewLualatex, 
                   NitrilePreviewMemor };
