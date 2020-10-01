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
    this.num_parts = 0;
    this.num_chapters = 0;
    this.fnsmap = new Map();
    this.imgs = [];
  }
  to_conf_step(){
    return this.conf('latex.step','5mm');
  }
  do_starttranslate(){
    this.fnsmap = new Map();
    if(this.conf('latex.fonts')){
      var ss = this.conf('latex.fonts').split('\n');
      ss.forEach(x => {
        let [fn,fnt] = x.split(',');
        this.fnsmap.set(fn,fnt); 
      });
    }
  }
  do_endtranslate(){
  }
  do_identify(block,A){
  }
  do_PART(block){
    var {title} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var title = this.unmask(title);//note that it might have something like \jp
                                 //which is fine because the "bookmark" package
                                 //will remove it
    o.push(`\\part{${title}}`);
    block.latex = o.join('\n');
  }
  do_HDGS(block){
    var {hdgn,title,name,subn,label,parser} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var raw = title;
    var title = this.unmask(title);//note that it might have something like \jp
                                 //which is fine because the "bookmark" package 
                                 //will remove it
    //note that 'subn' and 'hdgn' are guarrenteed to be integers
    subn = subn||0;
    var level = +hdgn + subn;
    var star='';
    if(level==0){
      if(name=='chapter'){              
        o.push(`\\chapter${star}{${title}}${this.to_latexlabelcmd(label)}`);
        if(star) o.push(`\\addcontentsline{toc}{chapter}{${raw}}`);
      }else{
        o.push(`\\begin{flushleft}`);
        o.push(`\\noindent{\\huge ${title}}`);
        o.push(`\\end{flushleft}`);
      }
    }
    else if(level==1){
      o.push(`\\section${star}{${title}}${this.to_latexlabelcmd(label)}`);
      if(star) o.push(`\\addcontentsline{toc}{section}{${raw}}`);
    }
    else if(level==2){
      o.push(`\\subsection${star}{${title}}${this.to_latexlabelcmd(label)}`);
      if(star) o.push(`\\addcontentsline{toc}{subsection}{${raw}}`);
    }
    else{
      o.push(`\\subsubsection${star}{${title}}${this.to_latexlabelcmd(label)}`);
    }
    block.latex = o.join('\n');
  }
  do_PLST(block){
    var o = [];
    var {id,row1,row2,sig,items} = block;
    o.push('');
    o.push(this.to_info(block));
    var bull0 = '';
    //var nosep=isbroad?'':'nosep';
    for (var item of items) {
      var {bull,bullet,value,text,ds,dl,more} = item;
      text = text || '';
      if (bull==='OL'||bull==='UL') bull0 = bull;
      let extra_text = '';
      if(more && more.length){
        more.forEach((p) => {
          let {lines} = p;
          extra_text+=`\n\n${this.untext(lines)}`;
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
            o.push(`\\item[${key}] ${desc} \n\n${extra_text}`);
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
    block.latex = o.join('\n');
  }
  do_LLST(block){
    var {caption,label,islabeled,body} = block;
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
    body.forEach(x => o.push(x));
    o.push(`\\end{lstlisting}`);
    block.latex = o.join('\n');
  }
  do_SAMP(block){
    var {id,row1,row2,sig,body} = block;
    body=body||[];
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
    var text = this.fence_to_verbatim(body,{});
    o.push(`\\begin{flushleft}`)
    o.push(`\\begin{adjustwidth}{5mm}{}`);
    o.push(text);
    o.push('\\end{adjustwidth}')
    o.push('\\end{flushleft}')
    block.latex = o.join('\n');
    this.needblank = 0;
  }
  do_HRLE(block){
    var o = [];
    var {id,row1,row2,sig,title} = block;
    o.push('');
    o.push(this.to_info(block));
    title = this.unmask(title);
    o.push(`\\begin{center}`);
    o.push(`\\rule{0.75\\linewidth}{0.5pt}`);
    o.push(`\\end{center}`);
    block.latex = o.join('\n');
  }
  do_PRIM(block){
    var o = [];
    var {hdgn,title,body} = block;
    o.push('');
    o.push(this.to_info(block));
    var v;
    const indent = '~'.repeat(5);
    title = this.unmask(title);
    let s0 = body[0]||'';
    let text = this.unmask(body.join('\n'));
    if (hdgn===1) {
      text = `{\\bfseries{}${title}} ${s0 ? '' : '~'} ${text}`;
      o.push(`\\bigskip`);
      o.push(`\\noindent ${text}`);
    } 
    else if (hdgn===2) {
      text = `{\\bfseries\\itshape{}${title}} ${s0 ? '' : '~'} ${text}`;
      o.push(`\\bigskip`);
      o.push(`\\noindent ${text}`);
    } 
    else {
      text = `{\\bfseries\\itshape{}${title}} ${s0 ? '' : '~'} ${text}`;
      o.push(`\\bigskip`);
      o.push(`\\noindent ${indent}${text}`);
    }
    block.latex = o.join('\n');
  }
  do_TEXT(block){
    var o = [];
    var {body,nspace} = block;
    o.push('');
    o.push(this.to_info(block));
    let text = this.untext(body);
    if (nspace) {
      text = text.trim();
      o.push(`\\begin{flushleft}`)
      o.push(`\\begin{adjustwidth}{5mm}{}`);
      o.push(text);
      o.push('\\end{adjustwidth}');
      o.push('\\end{flushleft}');
    }
    else {
      if (this.needblank) {
        text = `\\noindent ${text}`;
        this.needblank = 0;
      }
      o.push(text);
    }
    block.latex = o.join('\n');
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
  do_FIGE(block){
    var {wide,caption,label,islabeled,style,body} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var text = this.untext(body);
    var star = wide?'*':'';
    o.push(`\\begin{figure${star}}[ht]`);
    o.push(`\\centering`);
    var caption_text = (this.unmask(caption));
    o.push(`\\caption{${caption_text}}`);
    if(label){
      o.push(`${this.to_latexlabelcmd(label)}`);
    }
    o.push(text);
    o.push(`\\end{figure${star}}`);
    block.latex = o.join('\n');
  }
  do_TABR(block){
    var {wide,caption,label,islabeled,style,body} = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var text = this.untext(body);
    var star = wide?'*':'';
    o.push(`\\begin{table${star}}[ht]`);
    o.push(`\\centering`);
    var caption_text = (this.unmask(caption));
    o.push(`\\caption{${caption_text}}`);
    if(label){
      o.push(`${this.to_latexlabelcmd(label)}`);
    }
    o.push(text);
    o.push(`\\end{table${star}}`);
    block.latex = o.join('\n');
  }
  do_LONG(block){
    var o = [];
    var {id,row1,row2,sig,rows,ww,islabeled,floatname,label,caption,body} = block;
    o.push('');
    o.push(this.to_info(block));
    var style = {label,caption,floatname};
    var text = this.untext(body,style);
    o.push(text);
    block.latex = o.join('\n');
  }
  do_QUAT(block){
    var { floatname, idnum, caption, style, islabeled, label, body } = block;
    var o = [];
    o.push(this.to_info(block));
    var style = { floatname, idnum, label, islabeled };
    var text = this.untext(body, style);
    o.push(text);
    block.latex = o.join('\n');
  }
  do_VOCB(block){
    var { floatname, idnum, caption, style, islabeled, label, body, items } = block;
    var o = [];
    o.push(this.to_info(block));
    let itms = items.map(p => {
      let text = p.raw;
      text = this.unmask(text);
      p.text = text;
      return p;
    });
    let text = this.itms_to_itemized(itms, style);
    o.push(text);
    block.latex = o.join('\n');
  }
  to_ruby (g) {
    let {rb,rt} = g;
    var s = this.to_ruby_item(rb,rt);
    return s;
  }
  to_ref (g) {
    var { sig, label, floatname, idnum} = g;
    var secsign = String.fromCharCode(0xA7);
    if(sig=='HDGS'){
      return `Section~${secsign}\\ref{${label}}`;
    }
    if(floatname){
      return `${floatname}~${secsign}\\ref{${label}}`;
    }
    return `${secsign}\\ref{${label}}`;
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

  to_uri(g) {
    return `\\url{${g.href}}`
  }
  fence_to_diagram(ss,style){
    var { s } = this.diagram.to_diagram(ss,style);
    return s;
  }
  fence_to_framed(ss,style){
    var {s} = this.framed.to_framed(ss,'100%');
    return s;
  }
  fence_to_math(ss, style) {
    var { line } = this.make_line(ss.join('\n'), '', 0, 1);
    return `\\(${line}\\)`;
  }
  to_math(itms,style) {
    let islabeled = (style.floatname == 'Equation');
    let label = style.label||'';
    let labels = label.split(',');
    let ss = itms.map((p,i) => {
      let label = labels[i]||'';
      var { line } = this.make_line(p.math,label,islabeled,1);
      return line;
    });
    let o = [];
    if(style.floatname == 'Equation'){
      o.push(`\\begin{gather}`);
      o.push(ss.join('\\\\\n'))
      o.push(`\\end{gather}`);  
    }else if(style.align=='center'){
      o.push(`\\noindent\\begin{gather}`);
      o.push(ss.join('\\\\\n'))
      o.push(`\\end{gather}`);     
    }else{
      o.push(`\\noindent\\begin{flalign*}`);
      o.push(ss.join('\\\\\n'))    
      o.push(`&&`);
      o.push(`\\end{flalign*}`);
    }
    return o.join('\n');
  }
  to_img(g) {
    var src = g.src;
    var width = this.string_to_latex_length(g.width);
    var height = this.string_to_latex_length(g.height);
    this.imgs.push(src);
    if (width && height) {
      return `\\includegraphics[width=${width},height=${height}]{${src}}`;
    } else if (width) {
      return `\\includegraphics[width=${width}]{${src}}`;
    } else if (height) {
      return `\\includegraphics[height=${height}]{${src}}`;
    } else {
      return `\\includegraphics{${src}}`;
    }
  }
  fence_to_verbatim(ss,style){
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
    var o = [];
    o.push('\\noindent')
    o.push(text);
    return o.join('\n');
  }
  to_verse(ss,style) {
    ss = ss.map(x => this.unmask(x));
    ss = ss.map(x => this.rubify(x));
    let glue = this.glue_to_glue(style.glue);
    let text = ss.join(`${glue}\\hfill\\break\n`);
    var o = [];
    o.push('\\noindent');
    o.push(text);
    return o.join('\n');
  }
  to_cols(itms,style) {
    itms = itms.map(s => {
      s = this.unmask(s);
      s = this.rubify(s);
      return s;
    });
    let text = this.itms_to_cols(itms,style.glue,style.n);
    var o = [];
    o.push('\\noindent');
    o.push(text);
    return o.join('\n');
  }
  to_rows(itms,style) {
    itms = itms.map(s => {
      s = this.unmask(s);
      s = this.rubify(s);
      return s;
    });
    let text = this.itms_to_rows(itms,style.glue,style.n);
    var o = [];
    o.push('\\noindent');
    o.push(text);
    return o.join('\n');
  }
  para_to_tabulate(ss,style) {
    let rows = super.para_to_tabulate_rows(ss);
    rows = rows.map((ss) => ss.map(s => {
      s = this.unmask(s);
      s = this.rubify(s);
      return s;
    }));
    let text = this.rows_to_tabulate(rows,style);
    return text;
  }
  to_longtable(itms,style){
    itms = itms.map(s => {
      s = this.unmask(s);
      return s;
    });
    var caption = style.caption || '';
    var label = style.label || '';
    var floatname = style.floatname || '';
    caption = this.unmask(caption);
    let text = this.itms_to_longtable(itms,style.fr,style.hline,style.glue,style.n,caption,label,floatname);
    var o = [];
    o.push('\\noindent');
    o.push(text);
    return o.join('\n');
  }
  para_to_multi(ss,style){
    let itms = this.para_to_multi_itms(ss);
    itms = itms.map(s => {
      s = this.unmask(s);
      s = this.rubify(s);
      return s;
    });
    let text = this.itms_to_multi(itms,style);
    var o = [];
    o.push('\\noindent');
    o.push(text);
    return o.join('\n');
  }
  to_itemized(itms,style) {
    itms = itms.map(p => {
      let text = p.text;
      text = this.unmask(text);
      text = this.rubify(text);
      p.text = text;
      return p;
    });
    let text = this.itms_to_itemized(itms,style);
    return text;
  }
  to_blockquote(ss) {
    let text = ss.join('\n').trim();
    text = this.unmask(text);
    text = this.rubify(text);
    var lq = String.fromCharCode(96);
    var rq = String.fromCharCode(39);
    text = `${lq}${lq}{\\itshape{}${text}}${rq}${rq}`;
    var o = [];
    o.push('\\noindent');
    o.push(text);
    return o.join('\n');
  }
  to_imgrid(imgs,style) {
    imgs.forEach(p => {
      p.sub = this.unmask(p.sub);
    })
    var text = this.imgs_to_tabular(imgs,style.frame,style.n);
    return text;
  }
  to_plaintext(ss,style) {
    let text = ss.join('\n');
    text = this.unmask(text);
    return text;
  }
  to_story(ss,style) {
    let text = ss.join('\n');
    text = this.unmask(text);
    text = this.rubify(text);
    return text;
  }
  to_br() {
    let text = '\\hfill\\break{}';
    return text;
  }
  to_vspace(g){
    return `\\vspace{${g.length}}`;
  }
  to_hspace(g){
    return `\\hspace*{${g.length}}`;
  }
  to_typeface (text,type) {
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

  make_math(o,caption,label,islabeled,items,gather){
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
    items.forEach(x => {
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
      if (islabeled){
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
    var T7 = String.fromCharCode(0x7); // \text{}
    var T8 = String.fromCharCode(0x8); // \text{}
    unsafe = '' + unsafe; /// force it to be a string when it can be a interger
    unsafe = unsafe.replace(this.re_all_sups, (match,p1,p2) => {
          // I^1
          return  `${T6}${T7}${p1}${T8}${T1}${p2}${T6}`;  // octal code \01 is for caret
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
    unsafe = unsafe.replace(/\07/g,'\\text\{')
    unsafe = unsafe.replace(/\010/g,'\}')
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

  string_to_latex_length(s) {
    /// take an input string that is 100% and convert it to '\linewidth'.
    /// take an input string that is 50% and convert it to '0.5\linewidth'.
    /// take an input string that is 10cm and returns "10cm"
    /// take an input string that is 10 and returns "10mm"
    if (!s) {
      return '';
    }
    var re = /^(.*)\%$/;
    if (re.test(s)) {
      var str0 = s.slice(0,s.length-1);
      var num = parseFloat(str0)/100;
      if (Number.isFinite(num)) {
        var num = num.toFixed(3);
        if (num==1) {
          return `\\linewidth`;
        }
        return `${num}\\linewidth`;
      } 
    }
    var re = /^(.*)(mm|cm|in|pt)$/;
    if(re.test(s)){
      return s;
    }
    var num = parseFloat(s);
    if(Number.isFinite(num)){
      return `${num.toFixed(3)}mm`;
    }
    return '';
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
    hdgn = (typeof hdgn == 'number') ? hdgn : '';
    return (`%{sig:${sig}} {hdgn:${hdgn}} {subf:${subf}} {name:${name}:${subn}} {row:${row1}:${row2}}`);
  }
  itms_to_cols(itms,glue,n){
    var n = parseInt(n);
    var n = n || 1;
    var m = Math.floor(itms.length/n);
    var z = itms.length - n*m;
    var k = z ? (m+1) : (m);
    var pp = itms.slice(0,k);
    var cols = [];
    for (var j = 0; j < itms.length; j+=k) {
      var pp = itms.slice(j,j+k);
      cols.push(pp);
    }
    var pcol = 'l'.repeat(n);
    var glue = this.glue_to_glue(glue);
    var d = [];
    d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    for (var j = 0; j < k; ++j) {
      var pp = cols.map(x => x[j] || '');
      d.push(`${glue}${pp.join(' & ')}\\\\${glue}`);
    }
    d.push('\\end{tabular}');
    return d.join('\n');
  }
  itms_to_rows(itms,glue,n){
    var n = parseInt(n);
    var n = n || 1;
    var rows = [];
    var k = 0;
    for (var j = 0; j < itms.length; j++) {
      let p = itms[j];
      if (this.p_is_hline(p)) {
        rows.push('-'.repeat(n).split(''));
        k = 0;
        continue;
      }
      if (k == 0) {
        rows.push([p]);
      } else {
        let pp = rows.pop();
        pp.push(p);
        rows.push(pp);
      }
      k++;
      k %= n;
    }
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = `@{\\hspace{0.02\\linewidth}}`;
    var col = `p{${w}\\linewidth}`;
    var pcol = 'x'.repeat(n).split('').map(x => col).join(gap);
    var glue = this.glue_to_glue(glue);
    var d = [];
    d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    for (var j = 0; j < rows.length; ++j) {
      var pp = rows[j];
      if(this.pp_is_hline(pp)){
        d.push(`${glue}\\hline${glue}`);
        continue;
      }
      d.push(`${glue}${pp.join(' & ')}\\\\${glue}`);
    }
    d.push('\\end{tabular}');
    return d.join('\n');
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
  rows_to_tabulate(rows,style){
    var border = style.border || 0;
    var glue = this.glue_to_glue(style.glue);
    var ncols = rows.length ? rows[0].length : 0;
    var nrows = rows.length;
    var d = [];
    if(border==1){
      var pcol = 'l'.repeat(ncols).split('').join('|');
      d.push(`\\begin{tabular}{@{}|${pcol}|@{}}`);
      d.push('\\hline')
    }else{
      var pcol = 'l'.repeat(ncols);
      d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    }
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      if (this.pp_is_hline(pp)) {
        d.push(`${glue}\\hline${glue}`);
        continue;
      }
      d.push(`${glue}${pp.join(' & ')}\\\\${glue}`);
      if(border==1){
        d.push('\\hline')
      }
    }
    d.push('\\end{tabular}');
    var text = d.join('\n');
    if(style.width){
      let w = style.width;
      w = this.string_to_latex_length(w);
      text = `\\resizebox{${w}}{!}{${text}}`
    }
    if(style.float) {
      let f = (style.float == 'left') ? 'l' : 'r';
      text = `\\begin{wraptable}{${f}}{0pt}\n${text}\n\\end{wraptable}`;
    }else{
      text = `\\noindent\n${text}`
    }
    return text;
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
  _rows_to_tabular(rows, ww, style, isheader) {
    ///this function is assuming all texts has been escaped
    var ncols = ww.length;
    var pcols = 'l'.repeat(ncols).split('');
    var maxn = 0;
    var pcol = pcols.join('');
    var nrows = rows.length;
    var vpadding = style.vpadding || 0;
    var d = [];
    if (isheader) {
      d.push(`\\begin{tabular}{${pcol}}`);
    } else {
      d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    }
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      if (isheader && j == 0) {
        d.push('\\hline');
      }
      if (vpadding > 0) {
        d.push(`\\noalign{\\vspace{${vpadding}pt}}`);
      }
      d.push(`${pp.join(' & ')}\\\\`);
      if (vpadding > 0) {
        d.push(`\\noalign{\\vspace{${vpadding}pt}}`);
      }
      if (isheader && j == 0) {
        d.push('\\hline');
      }
    }
    if (isheader) {
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
  to_latex_program() {
    let latex_locale = this.conf('latex.locale');
    if(latex_locale=='lualatex'){
      return 'lualatex';
    }else if(latex_locale=='xelatex'){
      return 'xelatex';
    }else if(latex_locale=='xecjk'){
      return 'xelatex';
    }else{
      return 'pdflatex';
    }
  }
  to_locale_packages() {
    let latex_locale = this.conf('latex.locale');
    if(latex_locale=='lualatex'){
      return `\
\\usepackage{fontspec}
\\usepackage{ruby}
`
    }else if(latex_locale=='xelatex'){
      return `\
\\usepackage{ucs}
\\usepackage[utf8x]{inputenc}
\\usepackage{fontspec}
\\usepackage{ruby}
`
    }else if(latex_locale=='xecjk'){
      return `\
\\usepackage{ucs}
\\usepackage[utf8x]{inputenc}
\\usepackage{fontspec}
\\usepackage{xeCJK}
\\usepackage{ruby}
`
    }else{///default to 'pdflatex'
    return `\
\\usepackage[utf8x]{inputenc}
\\usepackage[T1]{fontenc}
`
    }
  }
  to_core_packages () {
    let latex_locale = this.conf('latex.locale');
    let unicode_math='';
    if(latex_locale=='lualatex'||
    latex_locale=='xelatex'||
    latex_locale=='xecjk'){
      unicode_math='\\usepackage{unicode-math}'
    }
    return `\
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
\\usepackage{wrapfig}
${unicode_math}
`
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
  to_report_class(){
    var p_report=this.conf('latex.report','report');
    return (this.num_chapters>0)?p_report:'article';
  }
  to_report_opt(){
    if(this.conf('latex.reportopt')){
      return this.conf('latex.reportopt').split('\n').join(',');
    }
    return '';
  }
  to_geometry_layout(){
    if (this.conf('latex.geometry')) {
      var s = this.conf('latex.geometry');
      var s = s.split('\n').join(',');
      return `\\usepackage[${s}]{geometry}`;
    }
    return '';
  }
  to_fonts_layout(){
    let locale = this.conf('latex.locale');
    if(locale=='xecjk'){
      let all=[];
      ///mainfont, sansfont, and monofont
      /// \setCJKmainfont{UnGungseo.ttf}
      /// \setCJKsansfont{UnGungseo.ttf}
      /// \setCJKmonofont{gulim.ttf}
      var p_mainfont = this.conf('latex.mainfont');
      var p_sansfont = this.conf('latex.sansfont');
      var p_monofont = this.conf('latex.monofont');
      if (p_mainfont) { p_mainfont = `\\setCJKmainfont{${p_mainfont}}`; }
      if (p_sansfont) { p_sansfont = `\\setCJKsansfont{${p_sansfont}}`; }
      if (p_monofont) { p_monofont = `\\setCJKmonofont{${p_monofont}}`; }
      var p = [p_mainfont, p_sansfont, p_monofont];
      p = p.filter(x => x.length);
      all = all.concat(p);
      ///extra fonts
      var ss = this.conf('latex.fonts');
      if (ss) {
        ss = ss.split('\n');
        ss = ss.map(s => {
          let [fn, fnt] = s.split(',');
          ///\newCJKfontfamily[kr]\kr{AppleGothic}
          return `\\newCJKfontfamily[${fn}]\\${fn}{${fnt}}`;
        });
        ss = ss.filter(x => x.length);
        all = all.concat(ss);
      }
      return all.join('\n');
    }
    return '';
  }
  to_extra_packages(){
    let s = this.conf('latex.extra');
    if (s) {
      let ss = s.split('\n');
      return ss.join('\n');
    }
    return '';
  }
  to_post_setups(){
    let s = this.conf('latex.setup');
    if(s){
      let ss = s.split('\n');
      return ss.join('\n');
    }
    return '';
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
  itms_to_itemized(itms,style){
    if(itms.length && itms[0].bull=='UL'){
      let pp = itms.map(p => `\\item ${p.text}`);
      if(style && style.n && style.n > 1){
        return this.pp_to_multi_itemized(pp,style.fr,style.n);
      }
      return `\\begin{list}{\\textbullet}{\\setlength\\parsep{0ex}\n\\setlength\\itemsep{0ex}}\n${pp.join('\n')}\n\\end{list}`;
    }
    if(itms.length){
      let pp = itms.map((p,i) => {
        if(p.type == 'A'){
          return `\\item[${this.to_A_letter(p.value)}${p.ending}] ${p.text}`;
        }
        if(p.type == 'a'){
          return `\\item[${this.to_a_letter(p.value)}${p.ending}] ${p.text}`;
        }
        if(p.type == 'I'){
          return `\\item[${this.to_I_letter(i + 1)}${p.ending}] ${p.text}`;
        }
        if(p.type == 'i'){
          return `\\item[${this.to_i_letter(i + 1)}${p.ending}] ${p.text}`;
        }
        if(typeof p.value == 'number'){
          return `\\item[${p.value}${p.ending}] ${p.text}`
        }
        return `\\item[\\textbullet] ${p.text}`
      });
      if(style && style.n && style.n > 1){
        return this.pp_to_multi_itemized(pp,style.fr,style.n);
      }
      return `\\begin{list}{\\textbullet}{\\setlength\\parsep{0ex}\n\\setlength\\itemsep{0ex}}\n${pp.join('\n')}\n\\end{list}`;
    }
    return `\\begin{list}{\\textbullet}{\\setlength\\parsep{0ex}\n\\setlength\\itemsep{0ex}}\n\\item\n\\end{list}`;
  }
  pp_to_multi_itemized(itms,fr,n){
    var d = [];
    var m = Math.floor(itms.length / n);
    var z = itms.length - n * m;
    var k = z ? (m + 1) : (m);
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = `@{\\hspace{0.02\\linewidth}}`;
    var frs = this.string_to_frs(fr, n);
    var pcol = 'x'.repeat(n).split('').map((x, i) => `p{${frs[i] * w}\\linewidth}`).join(gap);
    d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    for (let j = 0, i = 0; j < itms.length; i += 1, j += k) {
      var pp = itms.slice(j, j + k);
      d.push(`\\begin{list}{\\textbullet}{\\setlength\\topsep{0ex}\\setlength\\parsep{0ex}\\setlength\\itemsep{0ex}}\n${pp.join('\n')}\n\\end{list}`);
      if(i==n-1){
        d.push('\\\\')
      }else{
        d.push(' & ')
      }
    }
    d.push(`\\end{tabular}`);
    return d.join('\n')
  }
  itms_to_longtable(itms,fr,hline,glue,n,caption,label,floatname) {
    ///all row data has been unmasked
    var caption = caption || '';
    var label = label || '';
    var floatname = floatname || '';
    var fr = fr || '';
    var glue = glue || '';
    var hline = hline||0;
    var n = parseInt(n);
    var n = n || itms.length;
    var d = [];
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = `@{\\hspace{0.02\\linewidth}}`;
    var frs = this.string_to_frs(fr, n);
    var pcols = this.to_xltabular_pcols(n, frs);
    var vlines = this.string_to_array('*');
    var hlines = this.string_to_array('t m b r');
    //let vpadding = 3;
    let vpadding = 0;
    var pcol = this.to_table_pcols(vlines, pcols);
    let header = itms.slice(0, n);//pp could be shorter than n
    d.push(`\\begin{xltabular}{\\linewidth}{${pcol}}`);
    if(floatname == 'Table'){
      if (label) {
        d.push(`\\caption{${caption}\\label{${label}}}\\\\`);
      } else {
        d.push(`\\caption{${caption}}\\\\`)
      }
    }
    if (hlines.indexOf('t') >= 0) {
      d.push('\\hline');
    }
    if (vpadding > 0) {
      d.push(`\\noalign{\\vspace{${vpadding}pt}}`);
    }
    d.push(`${header.join(' & ')}\\\\`);
    if (vpadding > 0) {
      d.push(`\\noalign{\\vspace{${vpadding}pt}}`);
    }
    if (hlines.indexOf('m') >= 0) {
      d.push('\\hline');
    }
    d.push(`\\endhead`);
    if (hlines.indexOf('b') >= 0) {
      d.push('\\hline');
    }
    d.push(`\\endfoot`);
    if (itms.length == 0) {
      d.push('(empty) ');
    } else {
      for (let j = n; j < itms.length; j += n) {
        let pp = itms.slice(j, j + n);//pp could be shorter than n
        if (j > n) {
          if (hlines.indexOf('r') >= 0) {
            d.push('\\hline');
          }
        }
        if (vpadding > 0) {
          d.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
        d.push(pp.join(' & ') + ' \\\\');
        if (vpadding > 0) {
          d.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
      }
    }
    d.push('\\end{xltabular}');
    return d.join('\n');
  }
  itms_to_multi(itms,style) {
    ///all row data has been unmasked
    var border = style.border||0;
    var fr = style.fr || '';
    var glue = this.glue_to_vspace(style.glue);
    var n = parseInt(style.n)||1;
    var d = [];
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = `@{\\hspace{0.02\\linewidth}}`;
    var gaph = `@{\\hspace{0.01\\linewidth}}|@{\\hspace{0.01\\linewidth}}`;
    var frs = this.string_to_frs(fr, n);
    if(border==1){
      var pcol = 'x'.repeat(n).split('').map((x, i) => `p{${frs[i] * w}\\linewidth}`).join(gaph);
      var pcol = `|${pcol}|`;
    }else{
      var pcol = 'x'.repeat(n).split('').map((x,i) => `p{${frs[i]*w}\\linewidth}`).join(gap);
    }
    d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    if(border==1){
      d.push('\\hline')
    }
    for (let j = 0; j < itms.length; j+=n) {
      let pp = itms.slice(j,j+n);//pp could be shorter than n
      let ss = pp.map(text => {
        return `\\begin{minipage}{\\linewidth}\n${glue}{}${text}${glue}\\end{minipage}`;
      }); 
      d.push(`${ss.join(' & ')}\\\\`);      
      if(border==1){
        d.push('\\hline')
      }
    }
    d.push(`\\end{tabular}`);
    var text = d.join('\n');
    if(style.width){
      let w = style.width;
      w = this.string_to_latex_length(w);
      text = `\\resizebox{${w}}{!}{${text}}`
    }
    return text;
  }  
  _itms_to_multi(itms,style) {
    ///all row data has been unmasked
    var fr = style.fr || '';
    var glue = this.glue_to_glue(style.glue);
    var n = parseInt(style.n)||1;
    var d = [];
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = `@{\\hspace{0.02\\linewidth}}`;
    var frs = this.string_to_frs(fr, n);
    var pcol = 'x'.repeat(n).split('').map((x,i) => `p{${frs[i]*w}\\linewidth}`).join(gap);
    for (let j = 0; j < itms.length; j+=n) {
      let pp = itms.slice(j,j+n);//pp could be shorter than n
      d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
      let ss = pp.map(text => {
        return `\\begin{minipage}{\\linewidth}\n${text}\\end{minipage}`;
      }); 
      d.push(`${glue}${ss.join(' & ')}\\\\${glue}`);      
      d.push(`\\end{tabular}`);
      d.push('\\hfill\\\\');
    }
    d.pop();///remove the last hfill
    return d.join('\n');
  }
  imgs_to_tabular(imgs,frame,n) {
    var n = parseInt(n);
    var n = n || imgs.length;
    var d = [];
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = `@{\\hspace{0.02\\linewidth}}`;
    var col = `>{\\centering}p{${w}\\linewidth}`;
    var pcol = 'x'.repeat(n).split('').map(x => col).join(gap);
    var all = imgs.map(x => {
      var { src, width, height, sub } = x;
      this.imgs.push(src);///store in global database
      const imgsrc = this.toLatexImageSrc(src);
      var mygraphopts = [];
      mygraphopts.push(`width=\\linewidth`);
      if (frame) {
        mygraphopts.push(`frame`);
      }
      var img = `\\includegraphics[${mygraphopts.join(',')}]{${imgsrc}}`;
      return { img, sub };
    });
    d.push(`\\begin{tabular}{@{}${pcol}@{}}`);
    while (all.length) {
      var pp = all.slice(0, n);
      all = all.slice(n);
      //ensure imgs and subs is at least n
      var imgs = pp.map(x => x.img);
      var subs = pp.map(x => x.sub);
      while (imgs.length < n) imgs.push('');
      while (subs.length < n) subs.push('');
      d.push(imgs.join(' & '));
      d.push(`\\tabularnewline`);
      d.push(subs.join(' & '));
      d.push(`\\tabularnewline`);
    }
    d.push(`\\end{tabular}`);
    return d.join('\n');
  }
  glue_to_glue(glue){
    var glue = glue || '';
    if (glue) {
      glue = `\\noalign{\\vskip ${glue}}`
    }
    return glue;
  }  
  glue_to_vspace(glue){
    var glue = glue || '';
    if (glue) {
      glue = `\\vspace{${glue}}`
    }
    return glue;
  }
}

module.exports = { NitrilePreviewLatex }
