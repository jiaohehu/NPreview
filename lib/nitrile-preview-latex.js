'use babel';

const { NitrilePreviewTranslator } = require('./nitrile-preview-translator');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');
const { NitrilePreviewLmath } = require('./nitrile-preview-lmath');
const {fontmap, fontnames} = require('./nitrile-preview-fontmap');

class NitrilePreviewLatex extends NitrilePreviewTranslator {

  constructor(parser) {
    super(parser);
    this.name='LATEX';
    this.tokenizer = new NitrilePreviewLmath(this);
    this.diagram = new NitrilePreviewDiagramMP(this);
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
    /// All the layout dimensions are in 'mm'
    this.config.title = '';
    this.config.author = '';
    this.config.bodyfontsizept = '';
    this.config.diagfontsizept = 12;
    this.config.papersize = 'a4paper';
    this.config.layout = 0;///set to '1' to enable layout
    this.config.geometry = ''///should use += to add individual options
    this.config.toc = 0;///when set to 1 '\tableofcontents' will be inserted
    this.config.documentclass = '';///set to 'book','scrbook', etc.
    this.config.documentclassopt = '';///for += document class options  
    this.config.titlepage = 0;//1=title page will be generated
    this.config.maxn = 44;//maximum line number for each "float" Program
    this.config.step = 5;//5mm left-padding for some
    this.config.nipass = 'small';
    this.config.nisamp = 'small';
    this.config.nitabr = 'small';
    this.config.nilong = 'small';
    this.config.nitabb = 'small';
    this.config.nitabu = 'small';
    this.config.nicaption = 'small';
    this.config.niprog = 'footnotesize';
    this.config.extra = '';///should use += to add individual options
    this.config.autonum = 0;
  }
  do_identify(block,A){

  }
  do_part(block){
    var {text} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var text = this.smooth(text);//note that we can't use escape here because it might add \jp
    o.push(`\\part{${text}}`);
    block.latex = o.join('\n');
  }
  do_hdgs(block){
    var {subn,hdgn,name,text,label} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var raw = text;
    var text = this.escape(text);//note that it might have something like \jp
                                 //which is fine because the "bookmark" package 
                                 //will remove it
    //note that 'subn' and 'hdgn' are guarrenteed to be integers
    subn=subn||0;
    hdgn+=subn;
    var star='';
    if(hdgn==0){
      if(name=='h'){              
        o.push(`\\chapter${star}{${text}}${this.to_latexlabelcmd(label)}`);
        if(star) o.push(`\\addcontentsline{toc}{chapter}{${raw}}`);
      }else{
        o.push(`\\begin{flushleft}`);
        o.push(`\\noindent{\\huge ${text}}`);
        o.push(`\\end{flushleft}`);
      }
    }
    else if(hdgn==1){
      o.push(`\\section${star}{${text}}${this.to_latexlabelcmd(label)}`);
      if(star) o.push(`\\addcontentsline{toc}{section}{${raw}}`);
    }
    else if(hdgn==2){
      o.push(`\\subsection${star}{${text}}${this.to_latexlabelcmd(label)}`);
      if(star) o.push(`\\addcontentsline{toc}{subsection}{${raw}}`);
    }
    else{
      o.push(`\\subsubsection${star}{${text}}${this.to_latexlabelcmd(label)}`);
    }
    block.latex = o.join('\n');
  }
  do_dlst(block){
    var bull = String.fromCharCode(0xb7);
    bull = this.escape(bull);
    var o = [];
    var {id,row1,row2,sig,items} = block;
    var nbsp='~';
    o.push('');
    o.push(this.to_info(block));
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{description}[nosep,style=unboxed,font=\\normalfont]`);
    for (var item of items) {
      var {key,text,type,rb,rt} = item;
      if(type=='text'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[${bull} {\\bfseries{}${key}}] ${nbsp}${text}`);
      }else if(type=='rmap'){
        key = `${rb}${String.fromCharCode('0xb7')}${rt}`;
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[${bull} {\\bfseries{}${key}}] ${nbsp}${text}`);
      }else if(type=='math'){
        key = this.inlinemath(key);
        text = this.unmask(text);
        o.push(`\\item[${bull} ${key}] ${nbsp}${text}`);
      }else if(type=='quot'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[${bull} \`\`${key}''] ${nbsp}${text}`);
      }else if(type=='var'){
        key = this.escape_for_var(key);
        text = this.unmask(text);
        o.push(`\\item[${bull} \\textsl{${key}}] ${nbsp}${text}`);
      }else if(type=='code'){
        key = this.escape(key);
        text = this.unmask(text);
        o.push(`\\item[${bull} {\\ttfamily{}${key}}] ${nbsp}${text}`);
      }
    }
    o.push(`\\end{description}`);
    o.push(`\\end{flushleft}`);
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hlst(block){
    var o = [];
    var {id,row1,row2,sig,items} = block;
    o.push('');
    o.push(this.to_info(block));
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{description}[nosep,style=unboxed,font=\\normalfont]`);
    for (var item of items) {
      var {key,text} = item;
      key = this.unmask(key);
      text = this.unmask(text);
      if(text){
        o.push(`\\item[{\\bfseries{}${key}}] \\hfill\\\\${text}`);
      }else{
        o.push(`\\item[{\\bfseries{}${key}}]`);
      }
    }
    o.push(`\\end{description}`);
    o.push(`\\end{flushleft}`);
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_plst(block){
    var o = [];
    var {id,row1,row2,sig,items,isbroad} = block;
    o.push('');
    o.push(this.to_info(block));
    var bull0 = '';
    var nosep=isbroad?'':'nosep';
    o.push('\\begin{flushleft}')
    for (var item of items) {
      var {bull,lead,value,text} = item;
      text = text || '';
      if (bull==='OL'||bull==='UL') bull0 = bull;
      text = this.unmask(text);
      switch (bull) {
        case 'OL': {
          o.push(`\\begin{enumerate}[${nosep},leftmargin=${this.conf('step')}mm]`);
          o.push(`\\item\[${value}\] ${text}`);
          break;
        }
        case 'UL': {
          o.push(`\\begin{itemize}[${nosep},leftmargin=${this.conf('step')}mm]`);
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
          if(lead){
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
          if(lead){
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
    block.latex = o.join('\n');
  }
  do_ilst(block){
    var o = [];
    var {id,row1,row2,sig,items} = block;
    o.push('');
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
    block.latex = o.join('\n');
  }
  do_prog(block){
    var o = [];
    var {id,row1,row2,sig,wide,lines,caption,label,islabeled} = block;
    o.push('');
    o.push(this.to_info(block));
    var n = 0;
    const maxn = parseInt(this.conf('maxn'));
    var mylabel = label;
    var cont = '';
    if(!islabeled){
      o.push('');
      o.push('\\noindent');
    } 
    while(n < lines.length){
      if(1){
        var d = [];
        for(let i=0; i < maxn && n < lines.length; ++i,++n){
          var line = lines[n];
          var lineno = `${n+1}`;
          while(lineno.length < 5){
            lineno += '~';
          }
          var lineno = `{\\ttfamily{}${lineno}}`;
          var line = this.escape_verb(line);
          var wholeline = `${lineno}${line}`;
          var wholeline = this.polish_prog(wholeline);
          d.push(`${wholeline}\\hfill\\\\`);
        };
      } 
      var text = d.join('\n');
      var star=wide?'*':'';
      if(islabeled){
        o.push(`\\begin{figure${star}}[ht]`);
        if(1){
          var caption_text = caption + cont;
          var caption_text = this.polish_caption(this.unmask(caption_text));
          o.push(`\\caption{${caption_text}}`);
          cont = ' (Cont.)';
        }
        if(mylabel){
          o.push(`${this.to_latexlabelcmd(mylabel)}`);
          mylabel = '';
        }
      } 
      o.push(text);
      if(islabeled){
        o.push(`\\end{figure${star}}`);
      } 
    }
    block.latex = o.join('\n');
  }
  do_llst(block){
    var {lines,caption,label,islabeled} = block;
    lines=lines||[];
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var opts=[];
    if(islabeled){
      opts.push(`caption={${caption}}`);
      if(label){
        opts.push(`label={${label}}`);
      }
    }
    opts=opts.join(',');
    if(opts) opts=`[${opts}]`;
    o.push(`\\begin{lstlisting}${opts}`);
    lines.forEach(x => o.push(x));
    o.push(`\\end{lstlisting}`);
    block.latex = o.join('\n');
  }
  do_vbtm(block){
    var {id,row1,row2,sig,wide,lines,caption,label,islabeled} = block;
    lines=lines||[];
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    o.push(`\\begin{verbatim}`);
    lines.forEach(x => o.push(x));
    o.push(`\\end{verbatim}`);
    block.latex = o.join('\n');
  }
  do_samp(block){
    var {id,row1,row2,sig,lines,parser} = block;
    lines=lines||[];
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var lines = lines.map( x => this.smooth_samp(x) );
    var lines = lines.map( x => this.fontify_latex(x) );
    var lines = lines.map( x => (x)?x:'~');
    var lines = lines.map( x => this.polish_samp(x) );
    var lines = lines.map( x => `{\\ttfamily{}${x}}`);
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{enumerate}[nosep,leftmargin=${this.conf('step')}mm]`);
    o.push(lines.join('\\\\\n'));
    o.push('\\end\{enumerate\}');
    o.push('\\end\{flushleft\}')
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_pass(block){
    var o = [];
    var {id,row1,row2,sig,lines,parser} = block;
    lines=lines||[];
    o.push('');
    o.push(this.to_info(block));
    var lines = lines.map( x => this.smooth(x) );
    var lines = lines.map( x => this.fontify_latex(x) );
    var lines = lines.map( x => this.rubify(x) );
    var lines = lines.map( x => this.polish_pass(x) );
    var lines = lines.map( x => (x)?x:'~');
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin\{enumerate\}[nosep,leftmargin=${this.conf('step')}mm]`);
    o.push(lines.join('\\\\\n'));
    o.push('\\end\{enumerate\}');
    o.push(`\\end{flushleft}`);
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hrle(block){
    var o = [];
    var {id,row1,row2,sig,text} = block;
    o.push('');
    o.push(this.to_info(block));
    text = this.unmask(text);
    o.push(`\\begin{center}`);
    o.push(text);
    o.push(`\\end{center}`);
    block.latex = o.join('\n');
  }
  do_text(block){
    var o = [];
    var {row1,row2,sig,leadn,lead,text} = block;
    o.push('');
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
    block.latex = o.join('\n');
  }
  do_quot(block){
    var o = [];
    var {id,row1,row2,sig,text,para} = block;
    o.push('');
    o.push(this.to_info(block));
    var text = this.unmask(text);
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push('\\begin{flushleft}');
    o.push(`\\begin{quote}`);
    o.push(`${lq}${text}${rq}`);
    o.push('\\end{quote}')
    o.push('\\end{flushleft}')
    block.latex = o.join('\n');
  }
  do_tabb(block){
    var o = [];
    var {id,row1,rows,ww,sig,cols} = block;
    o.push('');
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
    ww = this.ww_to_one(ww);
    ww = ww.map(x => `\\hspace{${x}\\linewidth}`);
    ww = ww.join('\\=');
    ww += '\\kill';
    o.push(`\\begin{tabbing}`);
    o.push(ww);
    o.push(d.join('\n'));
    o.push(`\\end{tabbing}`);
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_tabu(block){
    ///has to use tabbing because this is the only way to
    ///work across the page and across two columns
    var o = [];
    var {id,row1,row2,sig,cols} = block;
    o.push('');
    o.push(this.to_info(block));
    var ncols = cols.length;
    var nrows = 0;
    var ww = [];
    var ss = [];
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
      var w = x.reduce((acc,s) => Math.max(acc,this.measure_text_length(s)),0);
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
      block.latex = o.join('\n');
    }
  }
  do_tabr(block){
    var {id,row1,row2,sig,wide,cols,caption,label,islabeled} = block;
    cols=cols||[];
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var text = this.cols_to_tabulary(cols);
    var star = wide?'*':'';
    if(islabeled){
      o.push(`\\begin{table${star}}[ht]`);
      o.push(`\\centering`);
      if(1){
        var caption_text = this.polish_caption(this.unmask(caption));
        o.push(`\\caption{${caption_text}}`);
      }
      if(label){
        o.push(`${this.to_latexlabelcmd(label)}`);
      }
    }else{
      o.push('\\begin{center}');
    }
    o.push(text);
    if(islabeled){
      o.push(`\\end{table${star}}`);
    }else{
      o.push('\\end{center}');
    }
    block.latex = o.join('\n');
  }
  do_long(block){
    var o = [];
    var {id,row1,row2,sig,rows,ww} = block;
    o.push('');
    o.push(this.to_info(block));
    var maxj = ww.length;
    rows = rows.map ( row => row.map(x => this.unmask(x)));
    rows = rows.map ((row,i) => row.map(x => (i==0)?this.polish_long_header(x):this.polish_long(x)));
    ///***NOTE: xltabular is percular of naming its columns
    var pcols = this.to_xltabular_pcols(maxj,ww);
    var vlines = this.string_to_array('*');
    var hlines = this.string_to_array('t m b r');
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
    block.latex = o.join('\n');
  }
  do_diag(block){
    var {lines,wide,notes,caption,label,islabeled} = block;
    lines=lines||[];
    var {s,xm,ym,unit} = this.diagram.to_diagram(lines,notes);
    var d = [];
    d.push('\\begin{mplibcode}');
    d.push('beginfig(1)');
    d.push(`pu := \\mpdim{\\linewidth}/${xm};`);
    d.push(`u := ${unit}mm;`);
    d.push(`ratio := pu/u;`);
    d.push(`picture wheel;`);
    d.push(`wheel := image(`);
    d.push(s);
    d.push(`);`);
    d.push(`draw wheel scaled(ratio);`);
    d.push('endfig')
    d.push('\\end{mplibcode}')
    var text = d.join('\n');
    var star = wide?'*':'';
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    if(islabeled){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(1){
        var caption_text = this.polish_caption(this.unmask(caption));
        o.push(`\\caption{${caption_text}}`);
      }
      if(label){
        o.push(`${this.to_latexlabelcmd(label)}`);
      }
    }else{
      o.push(`\\begin{center}`);
    }
    o.push(text);
    if(islabeled){
      o.push(`\\end{figure${star}}`);
    }else{
      o.push(`\\end{center}`);
    }
    block.latex = o.join('\n');
  }
  do_pict(block){
    var {id,row1,row2,sig,wide,opts,images,caption,label,islabeled} = block;
    opts=opts||{};
    images=images||[];
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var d = [];
    var n = opts.grid||1;
    var pcols = 'L'.repeat(n).split('');
    var pcol = pcols.join('');
    d.push(`\\begin{tabulary}{\\linewidth}{@{}${pcol}@{}}`);
    var all = images.map(x => {
      var {src,width,height,sub} = x;
      const imgsrc = this.toLatexImageSrc(src);
      var mygraphopts = [];
      if(width){
        width = this.toLatexLength(width);
        mygraphopts.push(`width=${width}`);
      }else{
        width = this.toLatexLength(`${100}%`);
        mygraphopts.push(`width=${width}`);
      }
      if(opts && opts.frame){
        mygraphopts.push(`frame`);
      }
      var img=`\\includegraphics[${mygraphopts.join(',')}]{${imgsrc}}`;
      var sub = this.unmask(sub);
      var sub = this.polish_caption(sub);
      return {img,sub};
    });
    while(all.length){
      var pp = all.slice(0,n);
      all = all.slice(n);
      //ensure imgs and subs is at least n
      var imgs = pp.map(x => x.img);
      var subs = pp.map(x => x.sub);
      while(imgs.length < n) imgs.push('');
      while(subs.length < n) subs.push('');
      d.push(imgs.join(' & '));
      d.push(`\\\\`);
      d.push(subs.join(' & '));
      d.push(`\\\\`);
    }
    d.push(`\\end{tabulary}`);
    var text = d.join('\n');
    var star=wide?'*':'';
    if(islabeled){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(1){
        var caption_text = this.polish_caption(this.unmask(caption));
        o.push(`\\caption{${caption_text}}`);
      }
      if(label){
        o.push(`${this.to_latexlabelcmd(label)}`);
      }
    }else{
      o.push(`\\begin{center}`);
    }
    o.push(text);
    if(islabeled){
      o.push(`\\end{figure${star}}`);
    }else{ 
      o.push(`\\end{center}`);
    }
    block.latex = o.join('\n');
  }
  do_math(block){
    var o = [];
    var {id,row1,row2,sig,math,label,islabeled,more,gather} = block;
    o.push(this.to_info(block));
    this.make_math(o,math,label,islabeled,more,gather);
    block.latex = o.join('\n');
  }
  do_frmd(block){
    var o = [];
    var {id,row1,row2,sig,wide,lines,caption,label,islabeled} = block;
    o.push('');
    o.push(this.to_info(block));;
    var s = [];
    var out = this.to_frmd_mp(lines);
    out = `\\fbox{${out}}`;
    out = `\\resizebox{\\linewidth}{!}{${out}}`;
    s.push(`\\begin{flushleft}`);
    s.push(`\\setlength{\\unitlength}{1pt}`);
    s.push(out);
    s.push(`\\end{flushleft}`);
    s.push('');
    var text = s.join('\n');
    var star = wide?'*':'';
    if(islabeled){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(1){
        var caption_text = this.polish_caption(this.unmask(caption));
        o.push(`\\caption{${caption_text}}`);
      }
      if(label){
        o.push(`${this.to_latexlabelcmd(label)}`);
      }
    }
    o.push(text);
    if(islabeled){
      o.push(`\\end{figure${star}}`);
    }
    block.latex = o.join('\n');
  }

  smooth (text) {
    return this.replace_sub_strings(text,this.mymap);
  }

  smooth_tt (text) {
    return this.replace_sub_strings(text,this.mymapcode);
  }

  smooth_samp(text){
    return this.replace_sub_strings(text,this.mymapsmpl1);
  }

  smooth_for_diag(s){
    var re_sup = /^(\w)\^(\d)/; 
    var re_sub = /^(\w)_(\d)/; 
    var v;
    var t;
    var out='';
    while(s.length){
      if((v=re_sup.exec(s))!==null){
        var p0=v[0];
        var p1=v[1];
        var p2=v[2];
        switch(p2){//superscript 0-9
          case '0': t=  `${p1}^{0}$`; break;
          case '1': t=  `${p1}^{1}$`; break;
          case '2': t=  `${p1}^{2}$`; break;
          case '3': t=  `${p1}^{3}$`; break;
          case '4': t=  `${p1}^{4}$`; break;
          case '5': t=  `${p1}^{5}$`; break;
          case '6': t=  `${p1}^{6}$`; break;
          case '7': t=  `${p1}^{7}$`; break;
          case '8': t=  `${p1}^{8}$`; break;
          case '9': t=  `${p1}^{9}$`; break;
          default: t= p2; break;
        }
        out += t;
        s=s.substring(p0.length);
      }else if((v=re_sub.exec(s))!==null){
        var p0=v[0];
        var p1=v[1];
        var p2=v[2];
        switch(p2){//subscript 0-9
          case '0': t= `$${p1}_0$`; break;
          case '1': t= `$${p1}_1$`; break;
          case '2': t= `$${p1}_2$`; break;
          case '3': t= `$${p1}_3$`; break;
          case '4': t= `$${p1}_4$`; break;
          case '5': t= `$${p1}_5$`; break;
          case '6': t= `$${p1}_6$`; break;
          case '7': t= `$${p1}_7$`; break;
          case '8': t= `$${p1}_8$`; break;
          case '9': t= `$${p1}_9$`; break;
          default: t= p2; break;
        }
        out += t;
        s=s.substring(p0.length);
      }else{
        var flag=0;
        for(var j=0; j < this.mymap.length; j+=2){
          var p1=this.mymap[j];
          var p2=this.mymap[j+1];
          if(s.startsWith(p1)){
            out += p2;
            s=s.substring(p1.length);
            flag=1;
            break;
          }
        }
        if(!flag){
          //take the next char out of s
          out += s.charAt(0);
          s=s.substring(1);
        }
      }
    }
    return out;
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

  escape_for_var(text){
    var text = this.smooth_for_diag(text);
    var text = this.fontify_latex(text);
    var s = `${text}`;
    return s;
  }

  escape_for_diag(text){
    var fs = this.conf('diagfontsizept');
    var fs = `${fs}pt`;
    var text = this.smooth_for_diag(text);
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
    return s;
  }

  do_ref (sig,label,floatname,idnum) {
    if(sig=='HDGS'){
      var secsign = String.fromCharCode(0xA7);
      return `${secsign}\\ref{${label}}`;
    }
    else if(sig=='MATH'){
      var secsign = String.fromCharCode(0xA7);
      return `${secsign}(\\ref{${label}})`;
    }
    if(floatname){
      var secsign = String.fromCharCode(0xA7);
      return `${floatname}~${secsign}\\ref{${label}}`;
    }
    return `{\\ttfamily\\sout{${label}}}`;
  }

  do_img (cnt) {
    return `\\includegraphics{${cnt}}`;
  }

  do_vbarchart (cnt) {
    var o = [];
    o.push(`\\begin{mplibcode}`);
    o.push(`beginfig(1)`);
    o.push(this.to_mp_vbarchart(cnt));
    o.push(`endfig`);
    o.push(`\\end{mplibcode}`);
    var s = o.join('\n');
    var s = `\\fbox{${s}}`;
    return s;
  }

  do_xyplot (cnt) {
    var o = [];
    o.push(`\\begin{mplibcode}`);
    o.push(`beginfig(1)`);
    o.push(this.to_mp_xyplot(cnt));
    o.push(`endfig`);
    o.push(`\\end{mplibcode}`);
    var s = o.join('\n');
    var s = `\\fbox{${s}}`;
    return s;
  }

  math_diag(text){
    var s = this.tokenizer.toLmath(text);
    var fs = this.conf('diagfontsizept');
    var fs = `${fs}pt`;
    var s = `{\\fontsize{${fs}}{${fs}}\\selectfont{}${s}}`;
    return s;
  }

  inlinemath(text,dstyle) {
    var s = this.tokenizer.toLmath(text,dstyle);
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
        return `\\textsl{${this.escape_for_var(text)}}`
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

    var mpara = 80;
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

    var mpara = 80;
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

  to_latexlabelcmd(label){
    var s = label?`\\label{${label}}`:'';
    return s;
  }

  to_framed_pgf (para, config ) {
    //var width [expr 2*([get-para-width $para]+2)]mm
    //set n [llength $para]
    //set height [expr ($n+3)*10]pt

    var mpara = 80;
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

  make_line(math,label,islabeled,gather){
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

  make_math(o,math,label,islabeled,more,gather){
    ///   \begin{equation}           
    ///   \begin{split}                    
    ///   \end{split}
    ///   \end{equation}           
    ///
    ///   \begin{align}
    ///   \end{align}
    var lines = [];
    var {line} = this.make_line(math,label,islabeled,gather);
    lines.push(line);
    more.forEach(x => {
      var {line} = this.make_line(x.math,x.label,islabeled,gather);
      lines.push(line);
    });
    //remove lines that are empty, it can happen if people
    //put extra \\ at the last line
    lines = lines.map(x => x.trim());
    lines = lines.filter(x => x?true:false);
    if(1){
      if (islabeled) {
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

    for (var j=0; j < text.length; ++j) {

      var c = text[j];
      var cc = text.charCodeAt(j);

      if (cc >= 256 && cc <= 0xFFFF) {
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
    var { subf, subn, hdgn, sig, row1, row2 } = block;
    subf = subf || '';
    subn = subn || '';
    sig = sig || '';
    row1 = row1 || 0;
    row2 = row2 || 0;
    hdgn = hdgn || 0;
    return (`%${sig}:${hdgn} {subf:${subf}:${subn}} {row:${row1}:${row2}}`);
  }

  to_frmd_mp(lines){
    var o = [];
    var n = lines.length;
    var solid = '\\ '.repeat(80);
    o.push(`\\begin{mplibcode}`);
    o.push(`numeric o; o := 12pt;`);
    o.push(`draw (1*o,0)--(1*o,-${n-1}*o) withpen pencircle withcolor white;`);
    o.push(`label.rt(btex {\\ttfamily\\fontsize{12pt}{12pt}\\selectfont{}${solid}} etex, (0,0));`);
    lines.forEach((x,i) => {
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
      var n = x ? x.length : 0;
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

module.exports = { NitrilePreviewLatex }
