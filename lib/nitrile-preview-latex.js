'use babel';

const { NitrilePreviewTranslator } = require('./nitrile-preview-translator');
const { NitrilePreviewDiagramTikz } = require('./nitrile-preview-diagramtikz');
const { NitrilePreviewFramedTikz } = require('./nitrile-preview-framedtikz');
const { NitrilePreviewLmath } = require('./nitrile-preview-lmath');
const {fontmap, fontnames} = require('./nitrile-preview-fontmap');
const unijson = require('./nitrile-preview-unicode');

class NitrilePreviewLatex extends NitrilePreviewTranslator {

  constructor(parser) {
    super(parser);
    this.name='LATEX';
    this.tokenizer = new NitrilePreviewLmath(this);
    this.diagram = new NitrilePreviewDiagramTikz(this);
    this.framed = new NitrilePreviewFramedTikz(this);
    this.num_chapters = 0;
    this.fnsmap = new Map();
  }
  to_conf_step(){
    return this.conf('latex.step','5mm');
  }
  do_starttranslate(){
    this.fnsmap = new Map();
    if(this.conf('latex.fonts')){
      var ss = this.conf('latex.fonts').split('\t');
      ss.forEach(x => {
        let [fn,fnt] = ss.split(',');
        this.fnsmap.set(fn,fnt); 
      });
    }
  }
  do_endtranslate(){
  }
  do_identify(block,A){
  }
  do_part(block){
    var {text} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var text = this.unmask(text);//note that it might have something like \jp
                                 //which is fine because the "bookmark" package
                                 //will remove it
    o.push(`\\part{${text}}`);
    block.latex = o.join('\n');
  }
  do_hdgs(block){
    var {hdgn,text,name,subn,label,parser} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var raw = text;
    var text = this.unmask(text);//note that it might have something like \jp
                                 //which is fine because the "bookmark" package 
                                 //will remove it
    //note that 'subn' and 'hdgn' are guarrenteed to be integers
    subn = subn||0;
    var level = +hdgn + subn;
    var star='';
    if(level==0){
      if(name=='chapter'){              
        o.push(`\\chapter${star}{${text}}${this.to_latexlabelcmd(label)}`);
        if(star) o.push(`\\addcontentsline{toc}{chapter}{${raw}}`);
        this.num_chapters++;
      }else{
        o.push(`\\begin{flushleft}`);
        o.push(`\\noindent{\\huge ${text}}`);
        o.push(`\\end{flushleft}`);
      }
    }
    else if(level==1){
      o.push(`\\section${star}{${text}}${this.to_latexlabelcmd(label)}`);
      if(star) o.push(`\\addcontentsline{toc}{section}{${raw}}`);
    }
    else if(level==2){
      o.push(`\\subsection${star}{${text}}${this.to_latexlabelcmd(label)}`);
      if(star) o.push(`\\addcontentsline{toc}{subsection}{${raw}}`);
    }
    else{
      o.push(`\\subsubsection${star}{${text}}${this.to_latexlabelcmd(label)}`);
    }
    block.latex = o.join('\n');
  }
  do_plst(block){
    var o = [];
    var {id,row1,row2,sig,items,isbroad} = block;
    o.push('');
    o.push(this.to_info(block));
    var bull0 = '';
    //var nosep=isbroad?'':'nosep';
    o.push('\\begin{flushleft}')
    for (var item of items) {
      var {bull,bullet,value,text,ds,dl,more} = item;
      text = text || '';
      if (bull==='OL'||bull==='UL') bull0 = bull;
      let extra_text = '';
      if(more && more.length){
        more.forEach((p) => {
          let {lines} = p;
          extra_text+=`\\begin{flushleft}\n${this.untext(lines.join('\n'))}\n\\end{flushleft}\n`;
        });
      }
      switch (bull) {
        case 'OL': {
          o.push(`\\begin{enumerate}`);
          break;
        }
        case 'UL': {
          o.push(`\\begin{itemize}`);
          break;
        }
        case 'DL': {
          o.push(`\\begin{description}`)
          break;
        }
        case 'LI': {
          if (dl){
            let key = this.unmask(dl.dt);
            let desc = this.unmask(dl.dd);
            if(desc){
              desc = `\\hfill\\\\${desc}`;
            }else{
              desc = `\\hfill\\\\`;
            }
            if (isbroad) {
              o.push(`\\item[${key}] ${desc} \n\n${extra_text}`);
            } else {
              o.push(`\\item[${key}] ${desc}`);
            }
          } else if (ds) {
            let { keys, desc } = ds;
            desc = this.unmask(desc);
            var nbsp = '\\ ';
            keys = keys.map((key) => {
              let {word,cat,rb,rt} = key;
              if (cat == 'rmap') {
                word = `${rb}${String.fromCharCode('0xb7')}${rt}`;
                word = this.polish(word);
                word = `\\textbf{${word}}`;
              }
              else if (cat == 'quoted') {
                word = this.polish(word);
                word = `\\texttt{\\textbf{${word}}}`;
              }
              else {
                word = this.polish(word);
                word = `\\textbf{${word}}`;
              }
              return word;
            });
            o.push(`\\item ${keys.join(',')} ${nbsp}${desc} ${extra_text}`);

          } else if (value) {
            text = this.unmask(text);
            o.push(`\\item\[${value}\] ${text} ${extra_text}`);
          } else {
            text = this.unmask(text);
            o.push(`\\item ${text} ${extra_text}`);
          }
          break;
        }
        case '/OL': {
          o.push(`\\end{enumerate}`);
          break;
        }
        case '/UL': {
          o.push(`\\end{itemize}`);
          break;
        }
        case '/DL': {
          o.push(`\\end{description}`);
          break;
        }
      }
    }
    o.push('\\end{flushleft}')
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
    var {id,row1,row2,sig,lines} = block;
    lines=lines||[];
    var o = []; 
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    /*
    var lines = lines.map( x => this.polish(x) );
    var lines = lines.map( x => x.replace(/\s/g,'~'));
    var lines = lines.map( x => (x)?x:'~');
    var lines = lines.map( x => `{\\ttfamily{}${x}}`);
    */
    var text = this.to_verbatim(lines);
    o.push(`\\begin{flushleft}`)
    o.push(`\\begin{enumerate}`);
    o.push(text);
    o.push('\\end{enumerate}')
    o.push('\\end{flushleft}')
    block.latex = o.join('\n');
    this.needblank = 0;
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
    var {row1,row2,sig,leadn,lead,text,nspace} = block;
    o.push('');
    o.push(this.to_info(block));
    var v;
    const indent = '~'.repeat(5);
    if (leadn&&leadn>0) {
      lead = this.unmask(lead);
      text = this.unmask(text);
      if (leadn===1) {
        text = `{\\bfseries{}${lead}}  ${text}`;
        o.push(`\\bigskip`);
        o.push(`\\noindent ${text}`);
      } 
      else if (leadn===2) {
        text = `{\\bfseries\\itshape{}${lead}}  ${text}`;
        o.push(`\\bigskip`);
        o.push(`\\noindent ${text}`);
      } 
      else {
        text = `{\\bfseries\\itshape{}${lead}}  ${text}`;
        o.push(`\\bigskip`);
        o.push(`\\noindent ${indent}${text}`);
      }
    } 
    else if (nspace) {
      text = this.untext(text);
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin{enumerate}`);
      o.push(text);
      o.push('\\end{enumerate}');
      o.push('\\end{flushleft}')

    }
    else {
      text = this.untext(text);
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
  _do_mult(block) {
    var { more } = block;
    var o = [];
    let n = more.length;
    let p = `${this.fix(1 / n)}`
    o.push('\\begin{flushleft}');
    o.push(`\\begin{xltabular}[l]{\\linewidth}{@{}XX@{}}`);
    more.forEach((text, i) => {
      o.push(`\\begin{minipage}[c]{\\linewidth}`);
      o.push(this.untext(text));
      o.push(`\\end{minipage}`);
      if(i==n-1){
        o.push('\\\\');
      }else{
        o.push('&');
      }
    });
    o.push(`\\end{xltabular}`);
    o.push(`\\end{flushleft}`);
    block.latex = o.join('\n');
  }
  do_mult(block) {
    var { more } = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    let nn = more.map(pp => pp.length);
    let n = nn.reduce((acc,cur) => Math.max(acc,cur),0);
    o.push('\\begin{flushleft}');
    for(let j=0; j < more.length; ++j){
      let pp = more[j];//pp could be shorter than n
      var w = (1-(0.02*(n-1)))/n;
      var gap = `@{\\hspace{0.02\\linewidth}}`;
      var col = `p{${w}\\linewidth}`;
      var pcol = 'x'.repeat(n).split('').map(x => col).join(gap);
      o.push(`\\begin{tabular}{@{}${pcol}@{}}`);
      for(let i=0; i < n; ++i){
        let text = pp[i]||'';
        o.push(`\\begin{minipage}[c]{\\linewidth}`);
        o.push(this.untext(text));
        o.push(`\\end{minipage}`);
        if(i==n-1){
          o.push('\\\\');
        }else{
          o.push('&');
        }
      }
      o.push(`\\end{tabular}`);
    }
    o.push(`\\end{flushleft}`);
    block.latex = o.join('\n');
  }
  do_tabb(block){
    var o = [];
    var {id,row1,ww,sig,more} = block;
    o.push('');
    o.push(this.to_info(block));
    var ncols = more.length;
    var nrows = 0;
    more.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var d = [];
    for (var j = 0; j < nrows; ++j) {
      var pp = more.map(x => x[j] || '');
      pp = pp.map(x => this.unmask(x));
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
    var ww = '1'.repeat(ncols).split('').map(x => parseInt(x));
    ww = this.ww_to_one(ww);
    ww = ww.map(x => `\\hspace{${x}\\linewidth}`);
    ww = ww.join('\\=');
    ww += '\\kill';
    o.push(`\\begin{tabbing}`);
    o.push(ww);
    o.push(d.join('\n'));
    o.push(`\\end{tabbing}`);
    block.latex = o.join('\n');
    this.needblank = 0;
  }
  do_data(block){
    ///has to use tabbing because this is the only way to
    ///work across the page and across two columns
    var o = [];
    var {id,row1,row2,sig,rows,islabeled,label,caption} = block;
    var rows = rows.map( pp => pp.map(x => this.polish(x) ));
    o.push('');
    o.push(this.to_info(block));
    o.push(this.rows_to_xltabular(rows,islabeled,label,caption));
    block.latex = o.join('\n');
  }
  to_data_xltabular(cols){
    ///has to use tabbing because this is the only way to
    ///work across the page and across two columns
    var d = [];
    var ncols = cols.length;
    var nrows = 0;
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var pcol='l'.repeat(ncols).split('').join('');
    var w = this.to_conf_step();
    d.push(`\\begin{xltabular}[l]{\\linewidth}{@{\\hspace{${w}}}${pcol}@{}}`);
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      pp = pp.map(x => this.polish(x));
      pp = pp.join(' & ');
      pp = `${pp}\\\\`;
      d.push(pp);
    }
    if(nrows==0){
      d.push(`(empty)`);
    } 
    else {
      var pp = d.pop(); ///remove the last \\\\
      pp = pp.slice(0,pp.length-2);
      d.push(pp);
    }
    d.push(`\\end{xltabular}`);
    return d.join('\n');
  }
  to_data_tabbing(cols){
    ///has to use tabbing because this is the only way to
    ///work across the page and across two columns
    var d = [];
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
    ss = ss.map(x => this.polish(x));
    var d = [];
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      pp = pp.map(x => this.polish(x));
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
    if(1){
      d.push(`\\begin{flushleft}`);
      d.push(`\\begin{adjustwidth}{${this.to_conf_step()}}{0}`);
      d.push(`\\begin{tabbing}`);
      //d.push(`${ss.join('\\hspace{8pt}\\=')}\\kill`);
      d.push(`${ss.join('~\\=')}\\kill`);
      d.push(d.join('\n'));
      d.push(`\\end{tabbing}`);
      d.push(`\\end{adjustwidth}`);
      d.push(`\\end{flushleft}`);
      return d.join('\n');
    }
  }
  do_tabr(block){
    var {wide,rows,ww,caption,label,islabeled,style} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    rows = rows.map((ss) => ss.map(s => {
      s = this.unmask(s);
      return s;
    }));
    var text = this.rows_to_tabular(rows,ww,style,1);
    var star = wide?'*':'';
    if(islabeled){
      o.push(`\\begin{table${star}}[ht]`);
      o.push(`\\centering`);
      if(1){
        var caption_text = (this.unmask(caption));
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
    var {id,row1,row2,sig,rows,ww,islabeled,label,caption} = block;
    o.push('');
    o.push(this.to_info(block));
    var maxj = ww.length;
    rows = rows.map ( row => row.map(x => this.unmask(x)));
    rows = rows.map ((row,i) => row.map(x => (i==0)?`\\textbf{${x}}`:(x)));
    ///***NOTE: xltabular is percular of naming its columns
    var pcols = this.to_xltabular_pcols(maxj,ww);
    var vlines = this.string_to_array('*');
    var hlines = this.string_to_array('t m b r');
    //let vpadding = 3;
    let vpadding = 0;
    var pcol = this.to_table_pcols(vlines,pcols);
    var header = rows.shift();
    o.push(`\\begin{xltabular}{\\linewidth}{${pcol}}`);
    if(islabeled){
      if(label){
        o.push(`\\caption{${this.unmask(caption)}\\label{${label}}}\\\\`);
      }else{
        o.push(`\\caption{${this.unmask(caption)}}\\\\`)
      }
    }
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
    var {lines,wide,notes,style,caption,label,islabeled} = block;
    lines=lines||[];
    style=style||{};
    style.width = '100%';
    var {s} = this.diagram.to_diagram(lines,style);
    var text = s;
    var star = wide?'*':'';
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    if(islabeled){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(1){
        var caption_text = (this.unmask(caption));
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
  do_pict(block){
    var {id,row1,row2,sig,wide,opts,images,caption,label,islabeled} = block;
    opts=opts||{};
    images=images||[];
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var text = this.images_to_tabular(opts,images);
    var star=wide?'*':'';
    if(islabeled){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(1){
        var caption_text = (this.unmask(caption));
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
  do_quat(block){
    this.do_math(block);
  }
  do_frmd(block){
    var o = [];
    var {id,row1,row2,sig,wide,lines,caption,label,style,islabeled} = block;
    style=style||{};
    style.width='100%';
    o.push('');
    o.push(this.to_info(block));;
    var {s} = this.framed.to_framed(lines,style);
    var text = s;
    var star = wide?'*':'';
    if(islabeled){
      o.push(`\\begin{figure${star}}[ht]`);
      o.push(`\\centering`);
      if(1){
        var caption_text = (this.unmask(caption));
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
  to_frmd_mp(lines){
    var o = [];
    var n = lines.length;
    var solid = '\\ '.repeat(80);
    o.push(`\\begin{mplibcode}`);
    o.push(`numeric o; o := 12pt;`);
    o.push(`draw (1*o,0)--(1*o,-${n-1}*o) withpen pencircle withcolor white;`);
    o.push(`label.rt(btex {\\ttfamily\\fontsize{12pt}{12pt}\\selectfont{}${solid}} etex, (0,0));`);
    lines.forEach((x,i) => {
      x = this.polish(x);
      o.push(`label.rt(btex {\\ttfamily\\fontsize{12pt}{12pt}\\selectfont{}${x}} etex, (0,-${i}*o));`);
    });
    o.push(`endfig`);
    o.push(`\\end{mplibcode}`);
    return o.join('\n');
  }


  do_ruby (rb,rt) {
    var s = this.to_ruby_item(rb,rt);
    return s;
  }

  do_ref (sig,label,floatname,idnum) {
    var secsign = String.fromCharCode(0xA7);
    if(sig=='HDGS'){
      return `Section~${secsign}\\ref{${label}}`;
    }
    if(floatname){
      return `${floatname}~${secsign}\\ref{${label}}`;
    }
    return `${secsign}\\ref{${label}}`;
  }

  do_img (g) {
    var img=g.data;    
    var width=g.width;   
    var height=g.height;
    if(width&&height){
      return `\\includegraphics[width=${width}mm,height=${height}mm]{${img}}`;
    }else if(width){
      return `\\includegraphics[width=${width}mm]{${img}}`;
    }else if(height){
      return `\\includegraphics[height=${height}mm]{${img}}`;
    }else{
      return `\\includegraphics{${img}}`;
    }
  }
  do_dia (cnt) {
    var lines = cnt.split(';;');
    lines = lines.map(x => x.trim());
    this.diagram.is_dia = 1;
    var {s,xm,ym,unit,definedcolors} = this.diagram.to_diagram(lines);
    this.diagram.is_dia = 0;
    var d = [];
    if(definedcolors.length){
      d.push(definedcolors.join('\n'));
    }
    d.push('\\begin{tikzpicture}');
    d.push(s);
    d.push('\\end{tikzpicture}')
    var text = d.join('\n');
    return text;
  }

  do_vbarchart (g) {
    var o = [];
    o.push(`\\begin{mplibcode}`);
    o.push(`beginfig(1)`);
    o.push(this.diagram.to_mp_vbarchart(g));
    o.push(`endfig`);
    o.push(`\\end{mplibcode}`);
    var s = o.join('\n');
    var s = `\\fbox{${s}}`;
    return s;
  }

  do_xyplot (g) {
    var o = [];
    o.push(`\\begin{mplibcode}`);
    o.push(`beginfig(1)`);
    o.push(this.diagram.to_mp_xyplot(g));
    o.push(`endfig`);
    o.push(`\\end{mplibcode}`);
    var s = o.join('\n');
    var s = `\\fbox{${s}}`;
    return s;
  }

  do_colorbox (g) {
    var o = [];
    o.push(`\\begin{mplibcode}`);
    o.push(`beginfig(1)`);
    o.push(this.diagram.to_mp_colorbox(g));
    o.push(`endfig`);
    o.push(`\\end{mplibcode}`);
    var s = o.join('\n');
    var s = `\\fbox{${s}}`;
    return s;
  }

  to_inlinemath(text,dstyle) {
    var s = this.tokenizer.to_lmath(text,dstyle);
    return `${s}`;
  }

  to_formula_math_array(text) {
    var d = this.tokenizer.to_lmath_array(text);
    return d;
  }

  do_uri(href) {
    return `\\url{${href}}`
  }
  to_diagram(ss,style){
    var { s } = this.diagram.to_diagram(ss,style);
    return s;
  }
  to_framed(ss,style){
    var {s} = this.framed.to_framed(ss,style);
    return s;
  }
  to_verbatim(ss){
    var o = [];
    ss = ss.map(s => {
      s = this.polish(s);
      s = s.replace(/\s/g,"~");
      if(!s){
        s = "~";
      }
      s = `{\\ttfamily{}${s}}`;
      return s;
    });
    var text = ss.join('\\hfill\\\\\n');
    o.push(text);
    return o.join('\n');
  }
  to_verse(ss) {
    ss = ss.map(x => this.unmask(x));
    ss = ss.map(x => this.rubify(x));
    let text = ss.join('\\\\');
    var o = [];
    return text;
  }
  to_story(ss) {
    let text = ss.join('\n');
    text = this.unmask(text);
    text = this.rubify(text);
    return text;
  }
  to_cols(cols) {
    cols = cols.map((ss) => ss.map(s => {
      s = this.unmask(s);
      s = this.rubify(s);
      return s;
    }));
    let text = this.cols_to_tabu(cols);
    return text;
  }
  to_rows(rows) {
    rows = rows.map((ss) => ss.map(s => {
      s = this.unmask(s);
      s = this.rubify(s);
      return s;
    }));
    let text = this.rows_to_tabu(rows);
    return text;
  }
  to_multi(cols){
    cols = cols.map(text => {
      text = this.unmask(text);
      text = this.rubify(text);
      return text;
    });
    return this.cols_to_multi(cols);
  }
  to_list(itms) {
    itms = itms.map(text => {
      text = this.unmask(text);
      text = this.rubify(text);
      return text;
    });
    let text = this.itms_to_itemize(itms);
    return text;
  }
  to_blockquote(ss) {
    let text = ss.join('\n').trim();
    text = this.unmask(text);
    text = this.rubify(text);
    var lq = String.fromCharCode(96);
    var rq = String.fromCharCode(39);
    return `${lq}${lq}{\\itshape{}${text}}${rq}${rq}`;
  }
  to_math(s){
    var { line } = this.make_line(s, '', 0, 1);
    let o = [];
    o.push(`\\begin{flalign*}`);
    o.push(line);
    o.push(`&&`);
    o.push(`\\end{flalign*}`);
    return o.join('\n');
  }
  to_br() {
    let text = '\\hfill\\break{}';
    return text;
  }
  to_style (text,type) {
    type = type || '';
    switch (type) {
      case 'verb': {
        return `\\,{}\\texttt{${text}}\\,{}`;
        break;
      }
      case 'code': {
        return `\\texttt{${text}}`
        break;
      }
      case 'em': {
        return `\\emph{${text}}`
        break;
      }
      case 'b': {
        return `\\textbf{${text}}`
        break;
      }
      case 'overstrike': {
        return `\\sout{${(text)}}`
        break;
      }
      case 'var': {
        return `\\textsl{${text}}`
        break;
      }
      default: {
        return `${text}`
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
          c = this.polish(c);
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
      line = this.polish(line);
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
          c = this.polish(c);
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
    var lines = this.to_formula_math_array(math);
    if(lines.length>0){
      lines = lines.map(pp => {
        var p = pp.join(' & ');
        return p;
      });
      lines = lines.filter(x => x.length?true:false);//remove empty lines
      var line = lines.join('\\\\\n');
      var line = `\\begin{alignedat}{1}\n${line}\n\\end{alignedat}${label}`;
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
    //var {line} = this.make_line(math,label,islabeled,gather);
    //lines.push(line);
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

      //if (cc >= 256 && cc <= 0xFFFF) {
      if(this.is_cjk_cc(cc)){
       var fns = fontmap[cc];
      } else {
        var fns = 0;
      }

      ///console.log('c=',c,'cjk=',this.is_cjk_cc(cc))

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
      if(this.fnsmap.has(fn0)){
        newtext += `{\\${fn0}{${s0}}}`;
      }else{
        newtext += s0;
      }
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
      if(this.fnsmap.has(fn0)){
        newtext += `{\\${fn0}{${s0}}}`;
      }else{
        newtext += s0;
      }
    }
    return newtext;
  }

  polish_verb(unsafe){
    unsafe = this.polish(unsafe);
    unsafe = unsafe.replace(/\s/g, "~")
    return unsafe;
  }

  polish(unsafe){
    unsafe = ''+unsafe;
    unsafe = unsafe.replace(/’/g, "\0char39\0")
    unsafe = unsafe.replace(/“/g, "\0char34\0")
    unsafe = unsafe.replace(/”/g, "\0char34\0")
    unsafe = unsafe.replace(/"/g, "\0char34\0")
    unsafe = unsafe.replace(/\|/g, "\0char124\0")
    unsafe = unsafe.replace(/\*/g, "\0char42\0")
    unsafe = unsafe.replace(/~/g, "\0char126\0")
    unsafe = unsafe.replace(/</g, "\0char60\0")
    unsafe = unsafe.replace(/>/g, "\0char62\0")
    unsafe = unsafe.replace(/\[/g, "\0char91\0")
    unsafe = unsafe.replace(/\]/g, "\0char93\0")
    unsafe = unsafe.replace(/\*/g, "\0char36\0")
    unsafe = unsafe.replace(/#/g, "\0char35\0")
    unsafe = unsafe.replace(/&/g, "\0char38\0")
    unsafe = unsafe.replace(/%/g, "\0char37\0")
    unsafe = unsafe.replace(/\$/g, "\0char36\0")
    unsafe = unsafe.replace(/_/g, "\0char95\0") 
    unsafe = unsafe.replace(/\^/g, "\0char94\0")
    unsafe = unsafe.replace(/\{/g, "\0char123\0")
    unsafe = unsafe.replace(/\}/g, "\0char125\0")
    unsafe = unsafe.replace(/\\/g, "\0char92\0")
    unsafe = unsafe.replace(/\0(.*?)\0/g, (match, p1) => {
      return `{\\${p1}}`;
    })
    unsafe = this.fontify_latex(unsafe);
    return unsafe;
  }

  smooth (unsafe) {

    var T1 = String.fromCharCode(0x1); // caret
    var T2 = String.fromCharCode(0x2); // underscore
    var T3 = String.fromCharCode(0x3); // left-brace
    var T4 = String.fromCharCode(0x4); // right-brace
    var T5 = String.fromCharCode(0x5); // backslash  
    var T6 = String.fromCharCode(0x6); // dollar-sign
    unsafe = '' + unsafe; /// force it to be a string when it can be a interger
    unsafe = unsafe.replace(this.re_all_sups, (match,p1,p2) => {
          // I^1
          return  `${T6}${p1}${T1}${p2}${T6}`;  // octal code \01 is for caret
      })
    unsafe = unsafe.replace(this.re_all_subs, (match,p1,p2) => {
          // I_1
          return `${T6}${p1}${T2}${p2}${T6}`;  // octal code \02 is for underscore
      })
    unsafe = unsafe.replace(this.re_all_diacritics, (match,p1,p2) => {
          // a~dot, a~ddot    
          return `${T6}\0${p2}${T3}${p1}${T4}\0${T6}`;
      })
    unsafe = unsafe.replace(this.re_all_mathvariants, (match,p1,p2) => {
          // a~mathbf, a~mathbb    
          return `${T6}\0${p2}${T3}${p1}${T4}\0${T6}`;
      })
    unsafe = unsafe.replace(this.re_all_symbols, (match,p1) => {
          // symbol
          try{
            var v = this.tokenizer.get_tex_symbol(p1);
            v = v.replace(/\$/g,T6).replace(/\\/g,T5).replace(/\{/g,T3).replace(/\}/g,T4).replace(/\^/g,T1).replace(/_/g,T2);
            return v;
          }catch(e){
            return match;
          }
      })
    unsafe = unsafe.replace(this.re_all_symbol_comments, (match,p1) => {
          // symbol
          try{
            var v = this.tokenizer.get_symbol_comment(p1);
            return v;
          }catch(e){
            return match;
          }
      })
    unsafe = unsafe.replace(/’/g,     "\0char39\0")
    unsafe = unsafe.replace(/“/g,     "\0char34\0")
    unsafe = unsafe.replace(/”/g,     "\0char34\0")
    unsafe = unsafe.replace(/"/g,     "\0char34\0")
    unsafe = unsafe.replace(/\|/g,    "\0char124\0")
    unsafe = unsafe.replace(/\*/g,    "\0char42\0")
    unsafe = unsafe.replace(/~/g,     "\0char126\0")
    unsafe = unsafe.replace(/</g,     "\0char60\0")
    unsafe = unsafe.replace(/>/g,     "\0char62\0")
    unsafe = unsafe.replace(/\[/g,    "\0char91\0")
    unsafe = unsafe.replace(/\]/g,    "\0char93\0")
    unsafe = unsafe.replace(/\*/g,    "\0char36\0")
    unsafe = unsafe.replace(/#/g,     "\0char35\0")
    unsafe = unsafe.replace(/&/g,     "\0char38\0")
    unsafe = unsafe.replace(/%/g,     "\0char37\0")
    unsafe = unsafe.replace(/\$/g,    "\0char36\0")
    unsafe = unsafe.replace(/_/g,     "\0char95\0") 
    unsafe = unsafe.replace(/\^/g,    "\0char94\0")
    unsafe = unsafe.replace(/\{/g,    "\0char123\0")
    unsafe = unsafe.replace(/\}/g,    "\0char125\0")
    unsafe = unsafe.replace(/\\/g,    "\0char92\0")
    unsafe = unsafe.replace(/⁻¹/g,    `\0textsuperscript${T3}-1${T4}\0`)
    unsafe = unsafe.replace(/⁻²/g,    `\0textsuperscript${T3}-2${T4}\0`)
    unsafe = unsafe.replace(/⁻³/g,    `\0textsuperscript${T3}-3${T4}\0`)
    unsafe = unsafe.replace(/¹/g,     `\0textsuperscript${T3}1${T4}\0`)
    unsafe = unsafe.replace(/²/g,     `\0textsuperscript${T3}2${T4}\0`)
    unsafe = unsafe.replace(/³/g,     `\0textsuperscript${T3}3${T4}\0`)
    unsafe = unsafe.replace(/\0(.*?)\0/g, (match,p1) => {
          return `{\\${p1}}`;
      })
    unsafe = unsafe.replace(/\01/g,'^')
    unsafe = unsafe.replace(/\02/g,'_')
    unsafe = unsafe.replace(/\03/g,'{')
    unsafe = unsafe.replace(/\04/g,'}')
    unsafe = unsafe.replace(/\05/g,'\\')
    unsafe = unsafe.replace(/\06/g,'$')
    unsafe = this.fontify_latex(unsafe);
    return unsafe;
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

  str_to_latex_length(str) {
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
    var { subf, name, subn, dept, hdgn, title, sig, row1, row2 } = block;
    subf = subf || '';
    name = name || '';
    subn = subn || '';
    sig = sig || '';
    row1 = row1 || '';
    row2 = row2 || '';
    hdgn = hdgn || '';
    return (`%{sig:${sig}} {hdgn:${hdgn}} {subf:${subf}} {name:${name}:${subn}} {row:${row1}:${row2}}`);
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
        s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        s.push(`${pp.join(' & ')}\\\\`);
      }
    }
    s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
    s.push('\\hline');
    s.push('\\end{tabulary}');
    return s.join('\n');
  }
  cols_to_tabu(cols){
    var ncols = cols.length;
    var nrows = 0;
    cols.forEach(x => {
      var n = x ? x.length : 0;
      nrows = Math.max(n, nrows);
    });
    var pcol = 'l'.repeat(ncols);
    var d = [];
    d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      d.push(`${pp.join(' & ')}\\\\`);      
    }
    d.push('\\end{tabular}');
    return d.join('\n');
  }
  rows_to_tabu(rows){
    var ncols = rows.length ? rows[0].length : 0;
    var nrows = rows.length;
    var pcol = 'l'.repeat(ncols);
    var d = [];
    d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      pp = pp.slice(0,ncols);
      if(this.pp_is_hline(pp)){
        d.push(`\\hline`);
        continue;
      }
      d.push(`${pp.join(' & ')}\\\\`);      
    }
    d.push('\\end{tabular}');
    return d.join('\n');
  }
  cols_to_multi(cols){
    let n = cols.length;
    var d = [];
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = `@{\\hspace{0.02\\linewidth}}`;
    var col = `p{${w}\\linewidth}`;
    var pcol = 'x'.repeat(n).split('').map(x => col).join(gap);
    d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    cols.forEach((text, i) => {
      d.push(`\\begin{minipage}[c]{\\linewidth}`);
      d.push(text);
      d.push(`\\end{minipage}`);
      if (i == n - 1) {
        d.push('\\\\');
      } else {
        d.push('&');
      }
    });
    d.push(`\\end{tabular}`);
    return d.join('\n');
  }
  rows_to_tabular(rows,ww,style,isheader){
    ///this function is assuming all texts has been escaped
    var ncols = ww.length;
    var pcols = 'l'.repeat(ncols).split('');
    var maxn = 0;
    var pcol = pcols.join('');
    var nrows = rows.length;
    var vpadding = style.vpadding||0;
    var d = [];
    if(isheader){
      d.push(`\\begin{tabular}{${pcol}}`);
    }else{
      d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    }
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      if (isheader && j == 0) {
        d.push('\\hline');
      }
      if(vpadding>0){
        d.push(`\\noalign{\\vspace{${vpadding}pt}}`);
      }      
      d.push(`${pp.join(' & ')}\\\\`);
      if(vpadding>0){
        d.push(`\\noalign{\\vspace{${vpadding}pt}}`);
      }
      if(isheader && j==0){
        d.push('\\hline');
      }
    }
    if(isheader){
      d.push('\\hline');
    }
    d.push('\\end{tabular}');
    return d.join('\n');
  }

  images_to_tabular(opts,images){
    var n = this.assert_int(opts.grid,1,1);
    var d = [];
    var w = (1-(0.02*(n-1)))/n;
    var gap = `@{\\hspace{0.02\\linewidth}}`;
    var col = `>{\\centering}p{${w}\\linewidth}`;
    var pcol = 'x'.repeat(n).split('').map(x => col).join(gap);
    d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    var all = images.map(x => {
      var {src,width,height,sub} = x;
      const imgsrc = this.toLatexImageSrc(src);
      var mygraphopts = [];
      mygraphopts.push(`width=\\linewidth`);
      if(opts && opts.frame){
        mygraphopts.push(`frame`);
      }
      var img=`\\includegraphics[${mygraphopts.join(',')}]{${imgsrc}}`;
      var sub = this.unmask(sub);
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
      d.push(`\\tabularnewline`);
      d.push(subs.join(' & '));
      d.push(`\\tabularnewline`);
    }
    d.push(`\\end{tabular}`);
    return d.join('\n');
  }

  to_colors(color){
    return this.diagram.to_colors(color);
  }

  rows_to_xltabular(rows,islabeled,label,caption){
    var d = [];
    var ncols = rows[0].length;
    var nrows = rows.length;
    var pcol='l'.repeat(ncols).split('').join('');
    d.push(`\\begin{xltabular}{\\linewidth}{@{}${pcol}@{}}`);
    if(islabeled){
      if(label){
        d.push(`\\caption{${this.unmask(caption)}\\label{${label}}}\\\\`);
      }else{
        d.push(`\\caption{${this.unmask(caption)}}\\\\`);
      }
    }
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      pp = pp.join(' & ');
      pp = `${pp}\\tabularnewline`;
      d.push(pp);
    }
    if(nrows==0){
      d.push(`(empty)`);
    } 
    else {
      d.pop(); 
      d.push(pp);
    }
    d.push(`\\end{xltabular}`);
    return d.join('\n');
  }
  to_core_packages () {
    return `
\\usepackage{graphicx}
\\usepackage{caption}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{xfrac}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage{pifont}
\\usepackage{marvosym}
\\usepackage{MnSymbol}
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
\\usepackage{changepage}
\\usepackage{listings}
\\usepackage{anyfontsize}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{xtab}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage[export]{adjustbox}
\\usepackage{url}
`
  }
  to_extra_packages() {
    var extra = this.conf('latex.extra');
    return extra.split('\t').join('\n');
  }
  to_titlelines(){
    var titlelines = [];
    var block = this.parser.blocks[0];
    if(block && block.sig=='FRNT'){
      let data = block.data;
      for(let t of data){
        let [key,val] = t;
        if(key=='title'){
          titlelines.push(`\\title{${this.unmask(val)}}`);
        }
        else if(key=='author'){
          titlelines.push(`\\author{${this.unmask(val)}}`);
        }
      }
    }
    return titlelines;
  }
  to_toclines(){
    var toclines = [];
    if(this.conf('latex.toc')){
      toclines.push(`\\tableofcontents`);
    } 
    return toclines;
  }
  to_documentclass(){
    var p_documentclass='';
    if (!p_documentclass) {
      var p_documentclass = (this.num_chapters>0)?'report':'article';
    }
    return p_documentclass;
  }
  to_documentclassopt(){
    var p_documentclassopt='';
    if(this.conf('latex.documentclassopt')){
      p_documentclassopt=this.conf('latex.documentclassopt').split('\t').join(',');
    }
    return p_documentclassopt;
  }
  to_geometry_layout(){
    var p_layout = '';
    if (this.conf('latex.geometry')) {
      var s = this.conf('latex.geometry');
      var s = s.split('\t').join(',');
      p_layout = `\\usepackage[${s}]{geometry}`;
    }
    return p_layout;
  }
  is_fontname_defined(fn){
    ///fn is one of the strings that is specified by the array name 'fontnames'
    
  }
  is_cjk_cc(cc){
    var i = 0;
    var j = unijson.blocks.length-1;
    return this.binary_search_unijson(cc,i,j);
  }
  binary_search_unijson(num,i,j){
    if(i > j){
      return 0;
    }
    if(i==j){
      var m = i;
    }else{
      var m = Math.floor((i+j)/2);
    }
    var block = unijson.blocks[m];
    if(num >= block.start && num <= block.stop){
      return block.cjk;
    }
    if(i == j){
      return 0;
    }
    if(num < block.start){
      return this.binary_search_unijson(num,i,m-1);
    }else{
      return this.binary_search_unijson(num,m+1,j);
    }
  }
  itms_to_itemize(itms){
    let pp = itms.map(x => `\\item ${x}`);
    return `\\begin{itemize}\n${pp.join('\n')}\n\\end{itemize}`;
  }
}

module.exports = { NitrilePreviewLatex }
