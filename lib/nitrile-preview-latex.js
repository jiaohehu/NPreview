'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const utils = require('./nitrile-preview-utils');
const C_textrightarrow = String.fromCharCode(8594);
const entjson = require('./nitrile-preview-entity.json');
const fontmap = require('./nitrile-preview-fontmap');

class NitrilePreviewLatex extends NitrilePreviewParser {

  constructor() {
    super();
    this.tokenizer = new NitrilePreviewTokenizer(this);
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
    var {id,row1,row2,sig,part,hdgn,dept,text,para,base,subrow,subfname} = block;
    row1=row1||''; row2=row2||'';
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var text = this.escape(text);
    if(subfname && this.config.LATEX.trace){
      text += ` {\\scriptsize\\itshape ${subfname}}`;
    }
    var use_chap=0;
    if(this.config.LATEX.docstyle==0){
      if(this.ismaster){
        use_chap=1;
      } 
    } else if (this.config.LATEX.docstyle==1){
      use_chap=0;
    } else if (this.config.LATEX.docstyle==2){
      use_chap=1;
    }
    ///assign this so that it can be used by toLatexDocument().
    this.use_chap=use_chap;
    if(part){
      part = this.escape(part);
      o.push(`\\part{${part}}`);
      o.push('');
    }
    else if(hdgn==0){
      if(this.frontpage){
      }else{
        o.push(`\\noindent{\\huge ${text}}`);
        o.push(`\\bigskip`);
        o.push('');
      }
    }
    else if(hdgn==1){
      if(use_chap){
        o.push(`\\chapter*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push(`\\addcontentsline{toc}{chapter}{${dept} ${text}}`);
      } else {
        o.push(`\\section*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push(`\\addcontentsline{toc}{section}{${dept} ${text}}`);
      }
      o.push('');
    }else if(hdgn==2){
      if(use_chap){
        o.push(`\\section*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push(`\\addcontentsline{toc}{section}{${dept} ${text}}`);
      } else {
        o.push(`\\subsection*{${dept}~~${text}}${this.latexlabelcmd}`);
        o.push(`\\addcontentsline{toc}{subsection}{${dept} ${text}}`);
      }
      o.push('');
    }else if(hdgn==3){
      if(use_chap){
        o.push(`\\subsection*{${dept}~~${text}}${this.latexlabelcmd}`);
      } else {
        o.push(`\\subsubsection*{${dept}~~${text}}${this.latexlabelcmd}`);
      }
      o.push('');
    }else{
      o.push(`\\subsubsection*{${dept}~~${text}}${this.latexlabelcmd}`);
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_dlst(block){
    var o = [];
    var {id,row1,row2,sig,items,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{description}[nosep,style=unboxed,font=\\normalfont]`);
    for (var item of items) {
      var {key,text,type} = item;
      if(type==1){
        key = this.escape(key);
        text = this.unmask(text);
        key = `\\bfseries{}${key}`;
        o.push(`\\item[${key}] ${text}`);
      }else if(type==2){
        key = key.substring(1,key.length-1);
        key = this.escape(key);
        text = this.unmask(text);
        key = `\\bfseries{}${key}`;
        o.push(`\\item[${key}] ${text}`);
      }else if(type==3){
        key = this.unmask(key);
        text = this.unmask(text);
        o.push(`\\item[] ${key} ~ ${text}`);
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
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
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
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
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
          o.push(`\\begin{enumerate}[nosep,leftmargin=${this.config.LATEX.step}mm]`);
          o.push(`\\item\[${value}\] ${text}`);
          break;
        }
        case 'UL': {
          o.push(`\\begin{itemize}[nosep,leftmargin=${this.config.LATEX.step}mm]`);
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
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    o.push('\\begin{flushleft}')
    o.push(`\\begin{itemize}[nosep,leftmargin=${this.config.LATEX.step}mm]`);
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
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{enumerate}[nosep,leftmargin=${this.config.LATEX.step}mm]`);
    for (var item of items) {
      var {type,bull,text,body} = item;
      if(type=='nlst'){
        text = this.unmask(text);
        o.push(`\\item\[${bull}\] ${text}`);
        o.push('');
      }else if(type=='samp'){
        o.push(`\\begin{flushleft}`);
        for (var i=0; i < body.length; ++i) {
          var line = body[i];
          line = this.smoothSAMP(line);
          line = this.fontifyLATEX(line);
          line = this.polish(line,this.config.LATEX.fscode);
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
        o.push('\\end\{flushleft\}')
        o.push('');
      }else if(type=='text'){
        o.push('\\begin{flushleft}');
        o.push(`${text}`);
        o.push('\\end{flushleft}')
        o.push('');
      }
    }
    o.push('\\end{enumerate}');
    o.push('\\end{flushleft}');
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_verb(block){
    var o = [];
    var {id,row1,row2,sig,body,caption,label,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var s = [];
    if(1){
      s.push(`\\begin{xltabular}{\\linewidth}{@{}l@{~}l}`);
      if(this.floatname){
        s.push(`\\caption*{${this.caption_text}}${this.latexlabelcmd}\\\\`);
      }
      s.push('\\hline');
      var linenum = 0;
      for (var k=0; k < body.length; ++k) {
        var line = body[k];
        line = this.smoothSAMP(line);
        line = this.fontifyLATEX(line);
        line = this.polish(line,this.config.LATEX.fslisting);
        var lineno = `${++linenum}`;
        lineno = this.polish(lineno,this.config.LATEX.fslisting);
        s.push(`${lineno} & ${line}\\\\`);
      }
      s.push('\\hline');
      s.push('\\end{xltabular}');
    } 
    var text = s.join('\n');
    //o.push('\\begin{flushleft}');
    //if(this.floatname){
      //o.push(`\\phantomsection${this.latexlabelcmd}`);
      //o.push(`${this.caption_text}\\hfill\\\\`);
    //} 
    //o.push('\\hrulefill\\\\');
    //o.push(`${text} \\hfill\\\\`);
    //o.push('\\hrulefill');
    //o.push('\\end{flushleft}');
    o.push(text);
    o.push('');
    block.latex = o.join('\n');
  }
  do_samp(block){
    var o = [];
    var {id,row1,row2,sig,body,subfname,parser} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    if(parser.samp==1){
      var body = this.to_samp1_body(body);
      var body = body.map( x => this.smooth(x) );
      var body = body.map( x => this.fontifyLATEX(x) );
      var body = body.map( x => this.rubify(x) );
      var body = body.map( x => (x)?x:'~');
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin\{enumerate\}[nosep,leftmargin=${this.config.LATEX.step}mm]`);
      o.push(body.join('\\\\'));
      o.push('\\end\{enumerate\}');
      o.push('\\end\{flushleft\}')
      o.push('');
    }
    else if(parser.samp==2){
      var text = this.joinPara(body);
      var text = this.smooth(text);
      var text = this.fontifyLATEX(text);
      var text = this.rubify(text);
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin{enumerate}[nosep,leftmargin=${this.config.LATEX.step}mm]`);
      o.push(text);
      o.push(`\\end{enumerate}`);
      o.push(`\\end{flushleft}`);
      o.push('');
    }else{
      var body = body.map( x => this.smoothSAMP(x) );
      var body = body.map( x => this.fontifyLATEX(x) );
      var body = body.map( x => this.rubify(x) );
      var body = body.map( x => (x)?x:'~');
      var body = body.map( x => this.polish(x,this.config.LATEX.fscode));
      var body = body.map( x => `{\\ttfamily{}${x}}`);
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin{enumerate}[nosep,leftmargin=${this.config.LATEX.step}mm]`);
      o.push(body.join('\\\\'));
      o.push('\\end\{enumerate\}');
      o.push('\\end\{flushleft\}')
      o.push('');
    }
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hrle(block){
    var o = [];
    var {id,row1,row2,sig,text,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
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
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
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
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
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
    var {id,row1,row2,sig,cols,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var ncols = cols.length;
    var nrows = 0;
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var s = [];
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      pp = pp.map(x => this.unmask(x));
      pp = pp.map(x => this.polish(x,this.config.LATEX.fstabular));
      var p = pp.join(' & ');
      p = `${p} \\\\`;
      s.push(p);
    }
    var text = s.join('\n');
    var pcol = 'l'.repeat(ncols);
    //o.push(`\\medskip`);
    o.push(`\\begin{xltabular}{\\linewidth}{@{}${pcol}}`);
    o.push(text);
    o.push(`\\end{xltabular}`);
    //o.push(`\\medskip`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_tabr(block){
    var o = [];
    var {id,row1,row2,sig,cols,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var s = [];
    var ncols = cols.length;
    var pcols = 'L'.repeat(ncols).split('');
    var vlines = this.toArray('');
    var hlines = this.toArray('t m b');
    const vpadding = 1;
    var maxn = 0;
    var pcol = this.insertTabularVlines(vlines,pcols);
    var nrows = 0;
    /// find out the longest rows
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n,nrows);
    });
    /// pp is a list of table cells of the current row j
    s.push(`\\begin{tabulary}{\\linewidth}{${pcol}}`);
    for(var j=0; j<nrows; ++j){
      var pp = cols.map(x => x[j]||'');
      if(j==0){
        s.push('\\hline');
        s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        var kk = pp.map(x => x.split('\\\\'));
        var nn = kk.map(x => x.length);
        var maxn = nn.reduce(n => Math.max(maxn,n));
        if(maxn > 1){
          s.push(`\\HL`);
          for(var n=0; n<maxn; ++n){
            var pp = kk.map(x => x[n]||'');
            var pp = pp.map(x => this.unmask(x));
            var pp = pp.map(x => this.polish(x,this.config.LATEX.fstabular,'\\bfseries'));
            s.push(`${pp.join(' & ')}\\\\`);
          }
          s.push(`\\HL`);
        } else {
          var pp = pp.map(x => this.unmask(x));
          var pp = pp.map(x => this.polish(x,this.config.LATEX.fstabular,'\\bfseries'));
          s.push(`${pp.join(' & ')}\\\\`);
        }
        s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        s.push('\\hline');
      } 
      else {
        var pp = pp.map(x => this.unmask(x));
        var pp = pp.map(x => this.polish(x,this.config.LATEX.fstabular));
        s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        s.push(`${pp.join(' & ')}\\\\`);
      }
    }
    s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
    s.push('\\hline');
    s.push('\\end{tabulary}');
    var text = s.join('\n');
    if(this.floatname){
      o.push(`\\begin{table}[ht]`);
      o.push(`\\centering`);
      o.push(`\\caption*{${this.caption_text}}${this.latexlabelcmd}`);
      o.push(text);
      o.push(`\\end{table}`);
    } else {
      o.push('\\begin{center}');
      o.push(text);
      o.push('\\end{center}');
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_long(block){
    var o = [];
    var {id,row1,row2,sig,rows,ww,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var maxj = ww.length;
    rows = rows.map ( row => row.map(x => this.unmask(x)));
    rows = rows.map ((row,i) => row.map(x => (i==0)?this.polish(x,this.config.LATEX.fstabular,'\\bfseries'):this.polish(x,this.config.LATEX.fstabular)));
    ///***NOTE: xltabular is percular of naming its columns
    var pcols = this.toTabularxColumns(maxj,ww);
    //var vlines = this.xfencecmd.latvlines;
    //var hlines = this.xfencecmd.lathlines;
    //var vpadding = parseInt(this.xfencecmd.latvpadding);
    var vlines = this.toArray('*');
    var hlines = this.toArray('t m b r');
    let vpadding = 3;
    var pcol = this.insertTabularVlines(vlines,pcols);
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
    o.push(this.toParagraphRows(hlines,vpadding,rows));
    o.push('\\end{xltabular}');
    o.push('');
    block.latex = o.join('\n');
  }
  do_diag(block){
    var o = [];
    var {id,row1,row2,sig,body,parser,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var mp = new NitrilePreviewDiagramMP(this,parser.notes);
    var [text] = mp.parse(body);
    var ym = mp.height;
    var xm = mp.width;
    var unit = mp.unit;
    var s = [];
    s.push('\\begin{mplibcode}');
    s.push('beginfig(1)');
    s.push(`pu := \\mpdim{\\linewidth}/${xm};`);
    s.push(`u := ${unit}mm;`);
    s.push(`ratio := pu/u;`);
    s.push(`picture wheel;`);
    s.push(`wheel := image(`);
    s.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
    s.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
    s.push(text);
    s.push(`);`);
    s.push(`draw wheel scaled(ratio);`);
    s.push('endfig')
    s.push('\\end{mplibcode}')
    var text = s.join('\n');
    if(this.floatname){
      o.push(`\\begin{figure}[ht]`);
      o.push(`\\centering`);
      o.push(`\\caption*{${this.caption_text}}${this.latexlabelcmd}`);
      o.push(text);
      o.push('\\end{figure}');
    } else {
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_pict(block){
    var o = [];
    var {id,row1,row2,sig,rows,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
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
        return (`${sub_text}`);
      });
      s.push(pp.join(' & '));
      s.push(`\\\\`);
      s.push(qq.join(' & '));
      s.push(`\\\\`);
      s.push(`\\end{tabulary}`);
    }
    var text = s.join('\n');
    if(this.floatname){
      o.push(`\\begin{figure}[ht]`);
      o.push(`\\centering`);
      o.push(`\\caption*{${this.caption_text}}${this.latexlabelcmd}`);
      o.push(text);
      o.push('\\end{figure}');
    } else {
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_math(block){
    var o = [];
    var {id,row1,row2,sig,maths,label,more,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    this.make_math(o,maths,label,more);
    block.latex = o.join('\n');
  }
  do_frmd(block){
    var o = [];
    var {id,row1,row2,sig,body,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var s = [];
    var [out, vw, vh] = this.toFramedLtpp(body);
    body = `\\resizebox{\\linewidth}{!}{${out}}`;
    if (this.xfencecmd.frameborder==1) {
      body = `\\fbox{${body}}`;
    }
    s.push(`\\begin{flushleft}`);
    s.push(`\\setlength{\\unitlength}{1pt}`);
    s.push(body);
    s.push(`\\end{flushleft}`);
    s.push('');
    var text = s.join('\n');
    if(this.floatname){
      o.push(`\\begin{figure}[ht]`);
      o.push(`\\centering`);
      o.push(`\\caption*{${this.caption_text}}${this.latexlabelcmd}`);
      o.push(text);
      o.push('\\end{figure}');
    } else {
      o.push(text);
    }
    block.latex = o.join('\n');
  }
  /*
    smooth the text
  */
  smooth (text) {
    return this.replaceSubstrings(text,this.mymap);
  }

  /*
    smooth the text
  */
  smoothTT (text) {
    return this.replaceSubstrings(text,this.mymapcode);
  }

  smoothSAMP(text){
    return this.replaceSubstrings(text,this.mymapsmpl1);
  }

  /*
    escape the text
  */
  escape (text) {
    var text = this.smooth(text);
    var text = this.fontifyLATEX(text);
    return text;
  }

  /*
    escape the text to be used with \ttfamily font
  */
  escapeTT (text) {
    var text = this.smoothTT(text);
    var text = this.fontifyLATEX(text);
    return text;
  }

  ruby (rb,rt) {
    var s = this.extractRubyItems(rb,rt);
    if(this.xlatfontsize){
      return `{\\jp\\${this.xlatfontsize}{}${s}}`;
    }else{
      return `{\\jp ${s}}`;
    }
  }

  ref (str) {
    for (var j=0; j < this.blocks.length; ++j) {
      var block = this.blocks[j];
      var {id,sig,label,saveas,idnum,more} = block;
      label = label||'';
      if(sig=='MATH'){
        if( str.localeCompare(label)===0) {
          return `\\ref{${str.slice(1)}}`;
          break;
        }
        if(more&&more.length){
          for(let k=0; k < more.length; k++){
            let x = more[k];
            if(str.localeCompare(x.label)===0){
              return `\\ref{${str.slice(1)}}`;
              break;
            }
          }
        }
      }else{
        if( str.localeCompare(label)===0) {
          return `\\hyperref[${str.slice(1)}]{${idnum}}`;
          break;
        }
      }
    }
    str = this.escape(str);
    return `{\\ttfamily\\sout{${str}}}`;
  }

  inlinemath(str) {
    var s = `\\( ${str} \\)`;
    return s;
  }

  displaymath(str) {
    var s = `\\[ ${str} \\]`;
    return s;
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
      default: {
        return `{${this.escape(text)}}`
        break;
      }
    }
  }

  normalizeLL (ll) {
    var re_p = /^p\{(.*)\}$/;
    for (var s of ll) {
      var v = re_p.exec(s);
      if (s === 'l') {
        o.push('l');
      } else if (s === 'r') {
        o.push('r');
      } else if (s === 'c') {
        o.push('c');
      } else if (v) {
        o.push(s);
      } else {
        o.push('X');
      }
    }
    return o;
  }

  toXtabularAligns (ll,ww) {

    // count the number of "L"s
    var x_count = 0;
    for (var s of ll) {
      if (s === 'L') {
        x_count += 1;
      }
    }

    var n = x_count;
    var def_w = 1;
    var acc_w = 0;
    var o = [];
    var re_p = /^p\{(.*)\}$/;
    var k = 0;
    for (var j in ll) {
      var s = ll[j];
      var v = re_p.exec(s);
      if (s === 'l') {
        o.push('l');
      } else if (s === 'r') {
        o.push('r');
      } else if (s === 'c') {
        o.push('c');
      } else if (v) {
        o.push(`p{${v[1]}}`);
      } else if (s === 'L') {
        var w = ww[k];
        if (!w) {
          if (n > 0) {
            def_w = (1.0 - acc_w)/n;
            n = 0;
          }
          w = def_w;
          if (w == 1) {
            w = 'p{\\linewidth}';
          } else {
            w = `p{${w}\\linewidth}`;
          }
        } else {
          w = ''+w;
          w = parseFloat(w);
          acc_w += w;
          if (w == 1) {
            w = 'p{\\linewidth}';
          } else {
            w = `p{${w}\\linewidth}`;
          }
          n -= 1;
          k += 1;
        }
        o.push(w);
      } else {
        o.push('l');
      }
    }
    return o;
  }

  columnsToLongTableCellStyles (ll,ww) {

    // count the number of "L"s
    var x_count = 0;
    for (var s of ll) {
      if (s === 'L') {
        x_count += 1;
      }
    }

    var n = x_count;
    var def_w = 1;
    var acc_w = 0;
    var o = [];
    var re_p = /^p\{(.*)\}$/;
    var k = 0;
    for (var j in ll) {
      var s = ll[j];
      var v = re_p.exec(s);
      if (s === 'l') {
        o.push('l');
      } else if (s === 'r') {
        o.push('r');
      } else if (s === 'c') {
        o.push('c');
      } else if (v) {
        o.push(`p{${v[1]}}`);
      } else if (s === 'L') {
        var w = ww[k];
        if (!w) {
          if (n > 0) {
            def_w = (1.0 - acc_w)/n;
            n = 0;
          }
          w = def_w;
          w *= x_count;
          if (w == 1) {
            w = '';
          } else {
            w = `\\hsize=${w}\\hsize\\linewidth=\\hsize`;
          }
        } else {
          w = ''+w;
          w = parseFloat(w);
          acc_w += w;
          w *= x_count;
          if (w == 1) {
            w = '';
          } else {
            w = `\\hsize=${w}\\hsize\\linewidth=\\hsize`;
          }
          n -= 1;
          k += 1;
        }
        o.push(`>{\\raggedright\\arraybackslash${w}}X`);
      } else {
        o.push('l');
      }
    }
    return o;
  }

  columnsToTableCellStyles (ll) {
    var o = [];
    var re_p = /^p\{(.*)\}$/;
    for (var s of ll) {
      if (s === 'l') {
        o.push('l');
      } else if (s === 'r') {
        o.push('r');
      } else if (s === 'c') {
        o.push('c');
      } else if (s === 'L') {
        o.push('L');
      } else {
        var v = re_p.exec(s);
        if (v) {
          o.push(`p{${v[1]}}`);
        } else {
          o.push('l');
        }
      }
    }
    return o;
  }

  toRequiredPackages (config) {

    var geometry_opts = [];
    geometry_opts.push(`left=${config.LATEX.leftmargin}mm`);
    geometry_opts.push(`right=${config.LATEX.rightmargin}mm`);
    geometry_opts.push(`top=${config.LATEX.topmargin}mm`);
    if (config.LATEX.papersize) {
      geometry_opts.push(config.LATEX.papersize);
    }
    if (config.LATEX.twoside) {
      geometry_opts.push('twoside');
    }

    var geometry_text = `\\usepackage[${geometry_opts.join(',')}]{geometry}`;

    if (config.LATEX.engine == 'pdflatex') {
      return `\\usepackage[utf8]{inputenc}
\\usepackage{CJKutf8,pinyin}
\\usepackage[overlap,CJK]{ruby}
\\newcommand*{\\cn}[1]{\\begin{CJK}{UTF8}{gbsn}#1\\end{CJK}}
\\newcommand*{\\tw}[1]{\\begin{CJK}{UTF8}{bsmi}#1\\end{CJK}}
\\newcommand*{\\jp}[1]{\\begin{CJK}{UTF8}{min}#1\\end{CJK}}
\\newcommand*{\\kr}[1]{\\begin{CJK}{UTF8}{mj}#1\\end{CJK}}
${geometry_text}
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
\\usepackage{fancevrb}
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
\\usepackage[unicode]{hyperref}
\\usepackage{anyfontsize}
\\usepackage{fancyvrb}
\\usepackage[normalem]{ulem}
%\\usepackage{quoting}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
%\\usepackage{supertabular}
\\usepackage[export]{adjustbox}
\\renewcommand{\\rubysize}{0.5}
\\renewcommand{\\rubysep}{0.0ex}`

    } else {

      return `\\usepackage{microtype}
\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
${geometry_text}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{unicode-math}
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
\\usepackage{changepage}
\\usepackage{fancyvrb}
\\usepackage[unicode]{hyperref}
\\usepackage{anyfontsize}
\\usepackage{luamplib}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
%\\usepackage{supertabular}
\\usepackage[export]{adjustbox}`

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
          c = this.escapeTT(c);
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
      line = this.escapeTT(line);
      o.push(`\\put(${x},${y+3}){\\ttfamily\\fontsize{12pt}{12pt}\\selectfont{}${line}}`);
      y += 12;
    }

    o.push(`\\end{picture}`);
    return [o.join('\n'), _vw, _vh];
  }

  toFramedPgfp (para, config ) {
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
          c = this.escapeTT(c);
          o.push(`\\pgftext[x=${x}pt,y=${y}pt,base,left]{\\ttfamily\\fontsize{10pt}{10pt}\\selectfont{}${c}}`);
        }
        x += 6;
      }
      y += 10;
    }

    o.push(`\\end{pgfpicture}`);
    return [o.join('\n'), vw, vh];
  }

  toFramedTikz (para, config ) {
    //var width [expr 2*([get-para-width $para]+2)]mm
    //set n [llength $para]
    //set height [expr ($n+3)*10]pt

    var mpara = this.getParaMaxWidth(para);
    var npara = para.length;

    if (mpara < config.verbminwidth) {
      mpara = config.verbminwidth;
    }

    var width = `${5.4*(mpara+1)}pt`;
    var height = `${(npara+1)*10}pt`;

    var o = [];
    o.push(`\\begin{tikzpicture}`);

    o.push(`\\draw[color=black] (0,0) rectangle (${width},${height});`);

    para = this.toReversedArray( para );
    var i = 0;
    for (var line of para) {
      i += 1;
      line = this.smoothTT(line);
      line = this.fontifyLATEX(line);
      o.push( `\\draw (0pt,${i*10}pt) node\[right\]\
        {\\ttfamily\\fontsize{10pt}{10pt}\\selectfont{}${line}};` );
    }
    o.push(`\\end{tikzpicture}`);
    return [o.join('\n'), width, height];
  }

  ///In this <longtable> environment all columns are 'p{}'
  toFramedTabl (text) {
    var text = text.map ( row => {
      row = row.map(x => x.split('\n'));
      row = row.map(x => x.map(y => this.unmask(y)));
      row = row.map(x => x.join(' \\newline '));
      return row;
    });

    var o = [];
    if (text.length == 0) {
      o.push('\\hline');
      o.push('(empty) ');
      o.push('\\hline');
    } else {

      var n = 0;
      for (var row of text) {
        n++;
        if (n == 1) {
          o.push('\\hline');
        } else if (n == 2) {
          o.push('\\hline');
        }
        o.push(row.join(' & & ') + ' \\\\');
      }
      /// now add the last \hline
      o.push('\\hline');

    }
    return o.join('\n');

  }

  extractRubyItems (base, top) {
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

  toPcolumn (ww, tablestyle) {

    /// given a ww that is a list of ".2 .3 .5" try to figure out
    /// the width of each p-column with an assumed gap between columns
    /// that is .01\linewidth

    var num_gaps = ww.length - 1;
    var gap_w = num_gaps * 0.01;
    var remain_w = 1.0 - gap_w;
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*remain_w );
    var o = [];
    for (var w of ww) {
      o.push(w);
      o.push(0.01);
    }
    o.pop();
    o = o.map(x => `p{${x}\\linewidth}`);
    if (tablestyle == 'boxed') {
      return `@{}|${o.join('@{}')}|@{}`
    } else if (tablestyle == 'full') {
      for (let i in o) {
        let j = i % 2;
        if (j == 0) { //this is data column, not gap column
          o[i]= `|${o[i]}`;
        }
      }
      return `@{}${o.join('@{}')}|@{}`
    } else {
      return `@{}${o.join('@{}')}@{}`
    }
  }

  toPcolumn2 (margin, gap, ww) {

    /// This version is similar to toPcolumn() except that it expects
    /// two additional arguments. First one is the margin, and the second
    /// one gap.  Both of them should be a number between 0-1 which expresses
    /// the fraction of \linewidth.

    if (!utils.isNumber(margin)) {
      margin = 0.0;
    }

    if (!utils.isNumber(gap)) {
      gap = 0.1;
    }

    var total_w = 1.0;
    total_w -= margin;
    total_w -= margin;
    var num_gaps = ww.length - 1;
    var gap_w = num_gaps * gap ;
    var remain_w = total_w - gap_w;
    var sum = ww.reduce( (acc,num) => acc += parseFloat(num), 0 );
    ww = ww.map( x => x/sum );
    ww = ww.map( x => x*remain_w );
    var o = [];
    o.push(margin);
    for (var w of ww) {
      o.push(w);
      o.push(gap );
    }
    o.pop();
    o.push(margin);
    o = o.map(x => `p{${x}\\linewidth}`);
    return `@{}${o.join('@{}')}@{}`
  }

  solidifyLeadingBackslashSpaces(line) {

    var re = /^(\\\s)+/;
    var v = re.exec(line);
    if (v) {
      var num = v[0].length/2;
      var rep = '~'.repeat(num);
      return `${rep}${line.slice(num*2)}`;
    }
    return line;
  }

  toLatexTableRows(text,tablestyle) {
    var o = [];
    if (tablestyle == '' || tablestyle == 'plain' || tablestyle == 'standard' || tablestyle == 'boxed') {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        for (var row of text) {
          o.push(row.join(' & & ') + ' \\\\');
        }
      }

    } else if (tablestyle == 'full') {
      if (text.length == 0) {
        o.push('(empty) ');
      } else {
        let myn = 0;
        for (var row of text) {
          if (myn) {
            o.push('\\hline');
          }
          o.push(row.join(' & & ') + ' \\\\');
          myn++;
        }
      }
    }
    return o.join('\n');
  }

  toTabularxColumns (maxj, ww) {

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

  toParagraphRows(hlines,vpadding,rows) {
    var o = [];
    if (rows.length == 0) {
      o.push('(empty) ');
    } else {
      for (var k in rows){
        var row = rows[k];

        if(k > 0){
          if(hlines.indexOf('r')>=0){
            o.push('\\hline');
          }
        }
        if(vpadding>0){
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
        o.push(row.join(' & ') + ' \\\\');
        if(vpadding>0){
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
      }
    }
    return o.join('\n');
  }

  toSingleLineRows(hlines,vpadding,rows) {
    var o = [];
    if (rows.length == 0) {
      o.push('(empty) ');
    } else {
      for (var k in rows){
        var row = rows[k];

        if(k > 0){
          if(hlines.indexOf('r')>=0){
            o.push('\\hline');
          }
        }
        if(vpadding>0){
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
        ///NOTE: add content of the row
        var nn = row.map(x => x.length);
        var maxn = nn.reduce((acc,cur) => Math.max(acc,cur));
        for (var i=0; i < maxn; ++i) {
          var qq = row.map(x => x[i]);
          o.push(`${qq.join(' & ')} \\\\`);
        }
        if(vpadding>0){
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
      }
    }
    return o.join('\n');
  }

  toLatexDocument() {
    var config = this.config;
    var texlines = this.blocks.map(x => x.latex);
    var mylines = this.toConfigLines();
    var title = config.ALL.title||'Untitled';
    var author = config.ALL.author||'';
    var documentclass = config.LATEX.documentclass;
    if (!documentclass) {
      documentclass = (this.use_chap)?'report':'article';
    }
    var opts = [];
    if (config.LATEX.twocolumns) {
      opts.push('twocolumn');
    }
    if (config.LATEX.bodyfontsizept) {
      opts.push(`${config.LATEX.bodyfontsizept}pt`);
    }
    var latexengine = config.LATEX.latexengine||'lualatex';
    var titlelines = [];
    if(this.config.LATEX.frontpage){
      titlelines.push(`\\title{${this.escape(title)}}`);
      titlelines.push(`\\author{${this.escape(author)}}`);
      titlelines.push(`\\maketitle`);
      if(this.config.LATEX.toc){
        titlelines.push(`\\tableofcontents`);
      } 
    }
    var data = `\
% !TEX program = ${latexengine}
${mylines.join('\n')}
\\documentclass[${opts.join(',')}]{${documentclass}}
${this.toRequiredPackages(config)}
\\begin{document}
${titlelines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
    return data;
  }

  insertTabularVlines(vlines,pp){
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

  toLatexFontsize(fs){
    return this.tokenizer.toLatexFontsize(fs);
  }

  make_line(maths,label){
    var line;
    if(maths.length > 1){
      line = maths.join(' &');
      if(label) {
        line += `\\label{${label}}`;
      }
    }else{
      line = maths.join(' ');
      if(label) {
        line += `\\label{${label}}`;
      }
    }
    return line;
  }

  make_math(o,maths,label,more){
    ///   \begin{equation}           
    ///   \begin{split}                    
    ///   \end{split}
    ///   \end{equation}           
    ///
    ///   \begin{align}
    ///   \end{align}
    var data = [];
    var line = '';
    var n=0;
    line = this.make_line(maths,label);
    data.push(line);
    for(let i=0; i < more.length; ++i){
      let x = more[i];
      line = this.make_line(x.maths,x.label);
      data.push(line);
      if(x.label){
        n++;
      }
    }
    if(!label&&data.length==1){
      o.push(`\\begin{equation*}`);
      o.push(data.join('\\\\\n'));
      o.push(`\\end{equation*}`);
    } else if(!label){
      o.push(`\\begin{equation*}`);
      o.push(`\\begin{split}`);
      o.push(data.join('\\\\\n'));
      o.push(`\\end{split}`);
      o.push(`\\end{equation*}`);
    } else if (label && n==0){
      o.push(`\\begin{equation}`);
      o.push(`\\begin{split}`);
      o.push(data.join('\\\\\n'));
      o.push(`\\end{split}`);
      o.push(`\\end{equation}`);
    } else {
      o.push(`\\begin{align}`);
      o.push(data.join('\\\\\n'));
      o.push(`\\end{align}`);
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

  escapeSolid(line) {
    line = this.replaceSubstrings(line,this.mymapsmpl);
    line = this.solidifyLeadingBackslashSpaces(line);
    line = this.fontifyLATEX(line);
    if (line.length == 0) {
      line = '~';
    }
    return line;
  }

  fontifyLATEX (text) {
    ///
    /// fontify in the style of Latex
    ///

    const fontnames = ['jp','tw','cn','kr'];
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

  mpcolor(color) {
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

}

module.exports = { NitrilePreviewLatex };
