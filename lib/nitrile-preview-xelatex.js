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
    this.num_chapters = 0;
  }
  to_conf_step(){
    return this.conf('latex.step',5);
  }
  do_starttranslate(){
  }
  do_identify(block,A){
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
    var {subn,hdgn,name,text,label} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var raw = text;
    var text = this.unmask(text);//note that it might have something like \jp
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
        this.num_chapters++;
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
    //bull = this.polish(bull);
    bull = '';
    var o = [];
    var {id,row1,row2,sig,items} = block;
    var nbsp='\\ ';
    o.push('');
    o.push(this.to_info(block));
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{itemize}[nosep,style=unboxed,font=\\normalfont]`);
    for (var item of items) {
      var {key,text,type,rb,rt,quote} = item;
      if(type=='rmap'){
        key = `${rb}${String.fromCharCode('0xb7')}${rt}`;
        key = this.polish(key);
        text = this.unmask(text);
        o.push(`\\item \\textbf{${key}}  ${nbsp}${text}`);
      }
      else if(type=='quoted'){
        key = this.polish(key);
        key = `${quote}${key}${quote}`;
        text = this.unmask(text);
        o.push(`\\item \\texttt{\\textbf{${key}}}  ${nbsp}${text}`);
      }
      else {
        key = this.polish(key);
        text = this.unmask(text);
        o.push(`\\item \\textbf{${key}}  ${nbsp}${text}`);
      }
    }
    o.push(`\\end{itemize}`);
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
      var {bull,bullet,value,text} = item;
      text = text || '';
      if (bull==='OL'||bull==='UL') bull0 = bull;
      text = this.unmask(text);
      switch (bull) {
        case 'OL': {
          o.push(`\\begin{enumerate}[${nosep},leftmargin=${this.to_conf_step()}mm]`);
          o.push(`\\item\[${value}\] ${text}`);
          break;
        }
        case 'UL': {
          o.push(`\\begin{itemize}[${nosep},leftmargin=${this.to_conf_step()}mm]`);
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
    block.latex = o.join('\n');
  }
  do_ilst(block){
    var o = [];
    var {id,row1,row2,sig,items} = block;
    o.push('');
    o.push(this.to_info(block));
    o.push('\\begin{flushleft}')
    o.push(`\\begin{itemize}[nosep,leftmargin=${this.to_conf_step()}mm]`);
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
    if(parser.sample==1){
      if(this.is_line_indented(lines[0])){
        o.push('');
        o.push(this.to_info(block));
        var line = this.join_para(lines);
        lines = [line];
        var lines = lines.map( x => this.polish(x) );
        var lines = lines.map( x => this.rubify(x) );
        var lines = lines.map( x => (x)?x:'~');
        o.push(`\\begin{flushleft}`);
        o.push(`\\begin\{enumerate\}[nosep,leftmargin=${this.to_conf_step()}mm]`);
        o.push(lines.join('\\\\\n'));
        o.push('\\end\{enumerate\}');
        o.push(`\\end{flushleft}`);
        block.latex = o.join('\n');
      }else if(this.is_para_array(lines)){
        o.push('');
        o.push(this.to_info(block));
        var rows = this.to_para_array(lines);
        var rows = rows.map( pp => pp.map(x => this.polish(x) ));
        var rows = rows.map( pp => pp.map(x => this.rubify(x) ));
        var text = this.rows_to_table(rows); 
        o.push(text);
        block.latex = o.join('\n');
      }else{
        o.push('');
        o.push(this.to_info(block));
        lines = this.join_backslashed_lines(lines);
        var lines = lines.map( x => this.polish(x) );
        var lines = lines.map( x => this.rubify(x) );
        var lines = lines.map( x => (x)?x:'~');
        o.push(`\\begin{flushleft}`);
        o.push(`\\begin\{enumerate\}[nosep,leftmargin=${this.to_conf_step()}mm]`);
        o.push(lines.join('\\\\\n'));
        o.push('\\end\{enumerate\}');
        o.push(`\\end{flushleft}`);
        block.latex = o.join('\n');
      }
      block.latex = o.join('\n');
    }else{
      ///SAMPLE=0
      var o = [];
      o.push('');
      o.push(this.to_info(block));
      var lines = lines.map( x => this.polish(x) );
      var lines = lines.map( x => x.replace(/\s/g,'~'));
      var lines = lines.map( x => (x)?x:'~');
      var lines = lines.map( x => `{\\ttfamily{}${x}}`);
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin{enumerate}[nosep,leftmargin=${this.to_conf_step()}mm]`);
      o.push(lines.join('\\\\\n'));
      o.push('\\end\{enumerate\}');
      o.push('\\end\{flushleft\}')
      block.latex = o.join('\n');
    }
    this.needblank = 1;
  }
  do_pass(block){
    var o = [];
    var {id,row1,row2,sig,lines,parser} = block;
    lines=lines||[];
    o.push('');
    o.push(this.to_info(block));
    var lines = lines.map( x => this.polish(x) );
    var lines = lines.map( x => this.rubify(x) );
    var lines = lines.map( x => (x)?x:'~');
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin\{enumerate\}[nosep,leftmargin=${this.to_conf_step()}mm]`);
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
      lead = this.unmask(lead);
      text = this.unmask(text);
      if (leadn===1) {
        text = `{\\bfseries{}${lead}}  ${text}`;
        o.push(`\\medskip`);
        o.push(`\\noindent ${text}`);
        o.push(`\\medskip`);
        this.needblank = 1;
      } 
      else if (leadn===2) {
        text = `{\\bfseries\\itshape{}${lead}}  ${text}`;
        o.push(`\\medskip`);
        o.push(`\\noindent ${text}`);
        o.push(`\\medskip`);
        this.needblank = 1;
      } 
      else {
        text = `{\\bfseries\\itshape{}${lead}}  ${text}`;
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
    var {id,row1,cols,ww,sig,cols} = block;
    o.push('');
    o.push(this.to_info(block));
    var ncols = cols.length;
    var nrows = 0;
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var d = [];
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
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
    this.needblank = 1;
  }
  do_data(block){
    ///has to use tabbing because this is the only way to
    ///work across the page and across two columns
    var o = [];
    var {id,row1,row2,sig,rows} = block;
    var rows = rows.map( pp => pp.map(x => this.polish(x) ));
    o.push('');
    o.push(this.to_info(block));
    o.push(this.rows_to_table(rows));
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
    d.push(`\\begin{xltabular}[l]{\\linewidth}{@{\\hspace{${w}mm}}${pcol}@{}}`);
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
      d.push(`\\begin{adjustwidth}{${this.to_conf_step()}mm}{0mm}`);
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
    var {wide,rows,ww,caption,label,islabeled} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var text = this.rows_to_tabular(rows,ww);
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
    var {id,row1,row2,sig,rows,ww} = block;
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
    //var secsign = String.fromCharCode(0xA7);
    var secsign = this.tokenizer.get_tex_symbol('S');
    if(sig=='HDGS'){
      return `${secsign}\\ref{${label}}`;
    }
    else if(sig=='MATH'){
      return `${secsign}(\\ref{${label}})`;
    }
    if(floatname){
      return `${floatname}~${secsign}\\ref{${label}}`;
    }
    return `{\\ttfamily\\sout{${label}}}`;
  }

  do_img (cnt) {
    var pp = cnt.split(';');
    var img=pp[0]||'';
    var width=pp[1]||'';
    var height=pp[2]||'';
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

  do_colorbox (cnt) {
    var o = [];
    var pp = cnt.split(';');
    pp = pp.map(x => x.trim());
    o.push(`\\begin{mplibcode}`);
    o.push(`beginfig(1)`);
    o.push(this.to_mp_colorbox(cnt));
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
      case 'strong': {
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

  cols_to_tabular(cols){
    var ncols = cols.length;
    var pcols = 'l'.repeat(ncols).split('');
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
    s.push(`\\begin{tabular}{${pcol}}`);
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
    s.push('\\end{tabular}');
    return s.join('\n');
  }

  rows_to_tabular(rows,ww){
    var ncols = ww.length;
    var pcols = 'l'.repeat(ncols).split('');
    var maxn = 0;
    var pcol = pcols.join('');
    var nrows = rows.length;
    var vpadding = 1;
    var s = [];
    s.push(`\\begin{tabular}{${pcol}}`);
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
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
    s.push('\\end{tabular}');
    return s.join('\n');
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

  rows_to_table(rows){
    var d = [];
    var ncols = rows[0].length;
    var nrows = rows.length;
    var pcol='l'.repeat(ncols).split('').join('');
    var w = this.to_conf_step();
    d.push(`\\begin{xltabular}[l]{\\linewidth}{@{\\hspace{${w}mm}}${pcol}@{}}`);
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

  to_pdflatex_document() {
    var conflines = this.to_config_lines();
    var texlines = this.parser.blocks.map(x => x.latex);
    var titlelines = [];
    var toclines = [];
    var documentclass = this.conf('latex.documentclass');
    if (!documentclass) {
      documentclass = (this.num_chapters>0)?'report':'article';
    }
    if(this.conf('latex.documentclassopt')){
      var p_documentclassopt=this.conf('latex.documentclassopt').split('\t').join(',');
    }
    if(this.conf('latex.titlepage')){
      titlelines.push(`\\title{${this.unmask(this.conf('general.title'))}}`);
      titlelines.push(`\\author{${this.unmask(this.conf('general.author'))}}`);
      titlelines.push(`\\maketitle`);
    }
    if(this.conf('latex.toc')){
      toclines.push(`\\tableofcontents`);
    } 
    var packages = '';
    packages=this.to_required_packages_pdflatex();
    var extra_packages = this.to_extra_packages();
    return     `\
%!TeX program=LuaLatex
${conflines.join('\n')}
\\documentclass[${p_documentclassopt||''}]{${documentclass}}
${packages}
${extra_packages}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
  }

  to_lualatex_document() {
    var conflines = this.to_config_lines();
    var texlines = this.parser.blocks.map(x => x.latex);
    var titlelines = [];
    var toclines = [];
    var documentclass = this.conf('latex.documentclass');
    if (!documentclass) {
      documentclass = (this.parser.ismaster)?'report':'article';
    }
    if(this.conf('latex.documentclassopt')){
      var p_documentclassopt=this.conf('latex.documentclassopt').split('\t').join(',');
    }
    if(this.conf('latex.titlepage')){
      titlelines.push(`\\title{${this.unmask(this.conf('general.title'))}}`);
      titlelines.push(`\\author{${this.unmask(this.conf('general.author'))}}`);
      titlelines.push(`\\maketitle`);
    }
    if(this.conf('latex.toc')){
      toclines.push(`\\tableofcontents`);
    } 
    var packages = '';
    packages=this.to_required_packages_lualatex();
    var extra_packages = this.to_extra_packages();
    return     `\
%!TeX program=LuaLatex
${conflines.join('\n')}
\\documentclass[${p_documentclassopt||''}]{${documentclass}}
${packages}
${extra_packages}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
  }

  to_extra_packages() {
    var extra = this.conf('latex.extra');
    return extra.split('\t').join('\n');
  }

  to_required_packages_pdflatex () {
    var p_layout = '';
    if (this.conf('latex.geometry')) {
      var s = this.conf('latex.geometry');
      var s = s.split('\t').join(',');
      var p_layout = `\\usepackage[${s}]{geometry}`;
    }
    return `\\usepackage[utf8x]{inputenc}
\\usepackage[T1]{fontenc}
${p_layout}
\\usepackage{graphicx}
\\usepackage{caption}
\\usepackage{enumitem}
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
\\usepackage[export]{adjustbox}
\\usepackage{url}
`
  }

  to_required_packages_lualatex () {
    var p_layout='';
    if(this.conf('latex.geometry')){
      var s=this.conf('latex.geometry');
      var s= s.split('\t').join(',');
      var p_layout=`\\usepackage[${s}]{geometry}`;
    }
    return `
\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\newjfontfamily\\de{dejavusans}
\\newjfontfamily\\za{zapfdingbats}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
${p_layout}
\\usepackage{graphicx}
\\usepackage{caption}
\\usepackage{enumitem}
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
\\usepackage{changepage}
\\usepackage{listings}
\\usepackage{anyfontsize}
\\usepackage{luamplib}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{xtab}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
\\usepackage{url}
`
  }

}

module.exports = { NitrilePreviewXelatex }