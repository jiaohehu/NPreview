'use babel';

const { NitrilePreviewDiagramMF } = require('./nitrile-preview-diagrammf');
const { NitrilePreviewFramedMF } = require('./nitrile-preview-framedmf');
const { NitrilePreviewCmath } = require('./nitrile-preview-cmath');
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const {fontmap, fontnames} = require('./nitrile-preview-fontmap');

class NitrilePreviewContext extends NitrilePreviewLatex {

  constructor(parser) {
    super(parser);
    this.name='CONTEXT';
    this.tokenizer = new NitrilePreviewCmath(this);
    this.diagram = new NitrilePreviewDiagramMF(this);
    this.framed = new NitrilePreviewFramedMF(this);
    /// All the layout dimensions are in 'mm'
    //this.config.padding = '1 3';
    //this.config.vlines = '*';
    //this.config.hlines = 't m b r';
  }
  to_conf_titlepage(){
    return this.conf('context.titlepage',0);
  }
  to_conf_step(){
    return this.conf('context.step','5mm');
  }
  to_conf_padding(){
    return this.conf('context.padding','1 3');
  }
  to_conf_vlines(){
    return this.conf('context.vlines','*');
  }
  to_conf_hlines(){
    return this.conf('context.hlines','t m b r');
  }
  to_conf_chapter(){
    return this.conf('context.chapter','\\bfd');
  }
  to_conf_section(){
    return this.conf('context.section','\\bfa');
  }
  to_conf_subsection(){
    return this.conf('context.subsection','\\bf');
  }
  to_conf_subsubsection(){
    return this.conf('context.subsubsection','\\bf');
  }
  to_conf_subsubsubsection(){
    return this.conf('context.subsubsubsection','\\bf');
  }
  do_identify(block,A){
    if(!A.count){
      A.count=1;
      A.parts=0;
      A.chapters=0;
      A.sections=0;
      A.subsections=0;
      A.subsubsections=0;
      A.figures=0;
      A.tables=0;
      A.equations=0;
      A.parts=0;
      A.idnum=0;///ID for Listing
    }
    if(block.sig=='PART'){
      A.parts++;
      block.idnum=A.parts;
      A.chapters=0;
    }else if(block.sig=='HDGS'&&block.name=='chapter'&&block.hdgn==0){
      A.chapters++;
      A.idnum=0;
    }else if(block.sig == 'LLST' && block.islabeled){
      A.idnum++;
      block.idnum=A.idnum;
      block.parts=A.parts;
      block.chapters=A.chapters;
      if (A.chapters) {
        block.idnum = `${A.chapters}.${A.idnum}`;
      } else {
        block.idnum = `${A.idnum}`;
      }
    }
  }
  do_part(block) {
    var { idnum, text } = block;
    var o = [];
    o.push(this.to_info(block));
    //var raw = text;
    var raw = this.smooth(text);
    var text = this.unmask(text);
    o.push(`\\startpart[title={${text}},reference={},bookmark={${raw}}]`);
    if(this.conf('context.partpage')){
      var s=this.conf('context.part').split('\t');
      var s=s.map(x => x.replace(/\$\{text\}/g,text));
      var s=s.map(x => x.replace(/\$\{i\}/g,x=>this.to_i_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{I\}/g,x=>this.to_I_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{a\}/g,x=>this.to_a_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{A\}/g,x=>this.to_A_letter(idnum)));
      var s=s.map(x => x.replace(/\$\{1\}/g,x=>this.to_1_letter(idnum)));
      var s=s.join('\n');
      o.push(s);
    }else{
      o.push(`\\dontleavehmode`);
      o.push(`\\blank[60mm]`);
      o.push(`\\startalignment[flushleft]`);
      o.push(`{\\bfb Part}`);
      o.push(`\\stopalignment`);
      o.push(`\\blank[8mm]`);
      o.push(`\\startalignment[flushleft]`);
      o.push(`{\\bfd ${text}}`);
      o.push(`\\stopalignment`);
      o.push(`\\page`);
    }
    o.push('');
    block.latex = o.join('\n');
  }    
  do_hdgs(block,conf){
    var {hdgn,subn,name,label,text,parser} = block;
    var o = [];
    o.push(this.to_info(block));
    //var raw = text;
    var raw = this.smooth(text);
    var text = this.unmask(text);
    subn = subn||0;
    var level = +hdgn + subn;
    ///assign this so that it can be used by toLatexDocument().
    if(level==0){
      if(name=='chapter'){
        o.push(`\\startchapter[title={${text}},reference={${label}},bookmark={${raw}}]`);
        o.push('');
      }else{
        o.push(`\\blank\\noindent {\\tfd ${text}}`);
        o.push(`\\blank`);
        o.push('');
      }
    }
    else if(level==1){
      o.push(`\\startsection[title={${text}},reference={${label}},bookmark={${raw}}]`);
      o.push('');
    } 
    else if(level==2){
      o.push(`\\startsubsection[title={${text}},reference={${label}},bookmark={${raw}}]`);
      o.push('');
    } 
    else if(level==3){
      o.push(`\\startsubsubsection[title={${text}},reference={${label}},bookmark={${raw}}]`);
      o.push('');
    }
    else {
      o.push(`\\startsubsubsubsection[title={${text}},reference={${label}},bookmark={${raw}}]`);
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_plst(block){
    var {id,row1,row2,sig,items,isbroad} = block;
    var o = [];
    o.push(this.to_info(block));
    const packed=isbroad?'':'packed';
    const nbsp = '\\ ';
    o.push('\\blank');
    for (var item of items) {
      var {bull,bullet,value,text,dl,ds,more} = item;
      text = text || '';
      let extra_text = '';
      if (more && more.length) {
        more.forEach((p) => {
          let { lines } = p;
          extra_text += `\n\n\\blank\\noindent ${this.untext(lines.join('\n'))}`;
        });
      }
      switch (bull) {
        case 'OL': {
          o.push(`\\startitemize[${packed},n]`);
          break;
        }
        case 'UL': {
          o.push(`\\startitemize[${packed}]`);
          break;
        }
        case 'DL': {
          break;
        }
        case 'LI': {
          if(dl){
            let key = this.unmask(dl.dt);
            let desc = this.unmask(dl.dd);
            let cmd = `\\latexdesc`;
            if(isbroad){
              cmd = `\\latexdescbroad`;
            }
            if (desc) {
              o.push(`${cmd}{${key}} \\\\ ${desc} ${extra_text} \\par`);
            } else {
              o.push(`${cmd}{${key}} {} \\par`);
            }
          } else if (ds) {
            let { keys, desc } = ds;
            desc = this.unmask(desc);
            desc = desc || `{}`;
            keys = keys.map((key) => {
              let { word, cat, rb, rt } = key;
              if (cat == 'rmap') {
                word = `${rb}${String.fromCharCode('0xb7')}${rt}`;
                word = this.polish(word);
                word = `{\\bf{}${word}}`;
              }
              else if (cat == 'quoted') {
                word = this.polish(word);
                word = `{\\tt\\bf{}${word}}`;
              }
              else {
                word = this.polish(word);
                word = `{\\bf{}${word}}`;
              }
              return word;
            });
            o.push(`\\item ${keys.join(',')} ${nbsp}${desc} ${extra_text}`);

          } else if (value) {
            text = this.unmask(text);
            o.push(`\\sym {${value}} ${text} ${extra_text}`);
          } else {
            text = this.unmask(text);
            o.push(`\\item ${text} ${extra_text}`);
          }
          break;
        }
        case '/OL': {
          o.push(`\\stopitemize`);
          break;
        }
        case '/UL': {
          o.push(`\\stopitemize`);
          break;
        }
        case '/DL': {
          break;
        }
      }
    }
    o.push('\\blank');
    o.push('');
    block.latex = o.join('\n');
  }
  do_ilst(block){
    var {id,row1,row2,sig,items} = block;
    var o = [];
    o.push(this.to_info(block));
    o.push(`\\startitemize[packed]`);
    for(var item of items){
      var {dt,sep,type,text} = item;
      text = this.unmask(text);
      if(dt){
        dt = this.unmask(dt);
        if(!sep){
          sep = '~';
        }
        if(type==1){
          text = `{\\it ${dt}} ${sep} ${text}`;
        } else if(type==2){
          text = `{\\tt ${dt}} ${sep} ${text}`;
        } else {
          text = `{\\bf ${dt}} ${sep} ${text}`;
        }
      }
      o.push(`\\item ${text}`);
    }
    o.push(`\\stopitemize`);
    o.push('');
    block.latex = o.join('\n');
    block.needblank = 1;
  }
  do_llst(block){
    var {id,row1,row2,sig,wide,lines,idnum,floatname,caption,label,islabeled} = block;
    lines=lines||[];
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    var d = lines.map((x,i) => {
      var line = x;
      var lineno = `${i+1}`;
      while(lineno.length < 5){
        lineno += '~';
      }
      var lineno = `{\\tt{}${lineno}}`;
      var line = this.polish(line);
      var line = line.replace(/\s/g,'~');
      var wholeline = `${lineno}${line}`;
      return(`${wholeline}\\hfill\\\\`);
    });
    var text = d.join('\n');
    if(islabeled){
      o.push(`\\blank\\noindent {${floatname} ${idnum}: ${this.unmask(caption)}}`);
    }
    o.push(`\\startlines`);
    o.push(text);
    o.push(`\\stoplines`);
    block.latex = o.join('\n');
  }
  do_vbtm(block){
    var {id,row1,row2,sig,wide,lines,caption,label,islabeled} = block;
    lines=lines||[];
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    o.push(`\\starttyping`);
    lines.forEach(x => o.push(x));
    o.push(`\\stoptyping`);
    block.latex = o.join('\n');
  }
  do_samp(block){
    var {id,row1,row2,sig,lines,parser} = block;
    lines=lines||[];
    var o = [];
    o.push(this.to_info(block));
    var text = this.to_verbatim(lines);
    o.push(`\\startitemize[]`);
    o.push(text );
    o.push('\\stopitemize');
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hrle(block){
    var {id,row1,row2,sig,text} = block;
    var o = [];
    o.push(this.to_info(block));
    text = this.unmask(text);
    o.push(`\\blank[1em]`);
    o.push(`\\startalignment[center]`);
    o.push(text);
    o.push(`\\stopalignment`);
    o.push(`\\blank[1em]`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_text(block){
    var {id,row1,row2,sig,leadn,lead,text,nspace} = block;
    var o = [];
    o.push(this.to_info(block));
    var v;
    const indent = '~'.repeat(5);
    if (leadn&&leadn>0) {
      lead = this.unmask(lead);
      text = this.unmask(text);
      if (leadn===1) {
        text = `{\\bf{}${lead}}   ${text}`;
        o.push(`\\blank\\noindent ${text}`);
        o.push(`\\blank`);
        this.needblank = 1;
      } 
      else if (leadn===2) {
        text = `{\\bi{}${lead}}   ${text}`;
        o.push(`\\blank\\noindent ${text}`);
        o.push(`\\blank`);
        this.needblank = 1;
      } 
      else {
        text = `{\\bi{}${lead}}   ${text}`;
        o.push(`\\blank\\noindent ${indent}${text}`);
        o.push(`\\blank`);
        this.needblank = 1;
      }
    } 
    else if (nspace) {
      text = this.untext(text);
      o.push(`\\startitemize[]`);
      o.push(`\\blank`);
      o.push(`\\noindent`);
      o.push(text);
      o.push('\\stopitemize');
      o.push('');
    }
    else {
      text = this.untext(text);
      if (this.needblank) {
        this.needblank = 0;
        text = `\\blank ${text}`;
      }
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_quot(block){
    var {id,row1,row2,sig,text} = block;
    var o = [];
    o.push(this.to_info(block));
    text = this.unmask(text);
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push(`\\setupnarrower[left=${this.to_conf_step()}]`);
    o.push(`\\startnarrower[left]`)
    o.push('\\blank\\noindent');
    o.push(`${lq}${text}${rq}`);
    o.push(`\\stopnarrower`);
    o.push('\\blank');
    o.push('');
    block.latex = o.join('\n');
  }
  do_data(block){
    var {rows,islabeled,label,caption} = block;
    rows = rows.map(pp => pp.map(x => this.polish(x)));
    var o = [];
    o.push(this.to_info(block));
    let text = this.rows_to_table(rows);
    if(islabeled){
      o.push(`\\placetable`);
      o.push(`[split]`);
      o.push(`[${label}]`);
      o.push(`{${this.unmask(caption)}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
    }else{
      o.push(`\\placetable[split,none]{}{%`);
      o.push(text);
      o.push(`}`);
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_data_tabulate(block){
    var {id,row1,row2,sig,cols} = block;
    var o = [];
    o.push(this.to_info(block));
    var ncols = cols.length;
    var nrows = 0;
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var s = [];
    var pcol = 'l'.repeat(ncols);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    var h=4;
    var t=0;
    s.push(`\\starttabulate[${pcol}]`);
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      pp = pp.map(x => this.polish(x));
      s.push(`\\NC ${pp.join(' \\NC ')} \\NR`);
    }
    s.push(`\\stoptabulate`);
    var text = s.join('\n');
    o.push(`\\blank`);
    o.push(text);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_data_btable(block){
    var {id,row1,row2,sig,cols} = block;
    var o = [];
    o.push(this.to_info(block));
    var ncols = cols.length;
    var nrows = 0;
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var s = [];
    var pcol = 'l'.repeat(ncols);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    var h=4;
    var t=0;
    s.push(`\\setupTABLE[frame=off]`);
    s.push(`\\setupTABLE[c][1][width=5mm]`);
    s.push(`\\bTABLE[loffset=${0}pt,roffset=${h*2}pt,toffset=${t}pt,boffset=${t}pt,split=yes]`);
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      pp = pp.map(x => this.polish(x));
      pp = pp.map(x => `\\bTD ${x} \\eTD`);
      s.push(`\\bTR \\bTD \\eTD ${pp.join(' ')} \\eTR`);
    }
    s.push(`\\eTABLE`);
    var text = s.join('\n');
    o.push(`\\blank`);
    o.push(text);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_tabr(block){
    var {rows,ww,caption,label,islabeled,style} = block;
    var o = [];
    o.push(this.to_info(block));
    rows = rows.map((ss) => ss.map(s => {
      s = this.unmask(s);
      return s;
    }));
    var text = this.rows_to_tabulate(rows,ww,style,1);
    if(islabeled){
      o.push(`\\placetable`);
      o.push(`[here]`);
      o.push(`[${label}]`);
      o.push(`{${this.unmask(caption)}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
    }else{
      o.push(`\\placetable[force,none]{}{%`);
      o.push(text);
      o.push(`}`);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_long(block){
    var {id,row1,row2,sig,rows,ww,islabeled,label,caption} = block;
    var o = [];
    o.push(this.to_info(block));
    var maxj = ww.length;
    rows = rows.map(row => row.map(x => this.unmask(x)));
    rows = rows.map((row,i) => row.map(x => (i==0)?`{\\bf ${x}}`:x)); 
    ///***NOTE: xltabular is percular of naming its columns
    let [t,h] = this.convert_longpadding(this.conf('general.longtable_padding'));
    //let vlines = this.string_to_array(this.conf('general.longtable_v_lines'));
    //let hlines = this.string_to_array(this.conf('general.longtable_h_lines'));
    let vlines = this.string_to_array('*');
    let hlines = this.string_to_array('t m b r');
    var header = rows.shift();
    var s = [];
    /// adjust for the relative width
    ww = this.ww_to_one(ww);
    var pp = ww.map((x,i) => `\\setupTABLE[c][${i+1}][width=${x}\\textwidth]`);
    s.push(pp.join('\n'));
    /// setup for hlines
    s.push(`\\setupTABLE[frame=off]`);
    s.push(`\\setupTABLE[r][first][topframe=${(hlines.indexOf('t')>=0)?'on':'off'}]`);
    s.push(`\\setupTABLE[r][first][bottomframe=${(hlines.indexOf('m')>=0)?'on':'off'}]`);
    s.push(`\\setupTABLE[r][last][bottomframe=${(hlines.indexOf('b')>=0)?'on':'off'}]`);
    s.push(`\\setupTABLE[r][each][bottomframe=${(hlines.indexOf('r')>=0)?'on':'off'}]`);
    /// setup for vlines
    if(vlines.indexOf('*')>=0) {
      s.push(`\\setupTABLE[c][each][leftframe=on]`);
      s.push(`\\setupTABLE[c][each][rightframe=on]`);
    } else {
      for(var j=1; j <= maxj; j++){
        s.push(`\\setupTABLE[c][${j}][leftframe=${vlines.indexOf(`${j-1}`)>=0?'on':'off'}]`);
        if (j==maxj) {
          s.push(`\\setupTABLE[c][${j}][rightframe=${vlines.indexOf(`${j}`)>=0?'on':'off'}]`);
        }
      }
    }
    /// writing table
    s.push(`\\bTABLE[loffset=${h}pt,roffset=${h}pt,toffset=${t}pt,boffset=${t}pt,split=repeat,option=stretch]`);
    s.push(`\\bTABLEhead`);
    s.push(`\\bTR \\bTH ${header.join(' \\eTH \\bTH ')} \\eTH \\eTR`);
    s.push(`\\eTABLEhead`);
    s.push(`\\bTABLEbody`);
    for( var row of rows ) {
      row = row.map(x => `{${x}}`);
      s.push(`\\bTR \\bTD ${row.join(' \\eTD \\bTD ')} \\eTD \\eTR`);
    }
    s.push(`\\eTABLEbody`);
    s.push(`\\eTABLE`);
    let text = s.join('\n');
    o.push(`\\blank`);
    if(islabeled){
      o.push(`\\placetable`);   
      o.push(`[split]`);
      o.push(`[${label}]`);
      o.push(`{${this.unmask(caption)}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
    }else{
      o.push(`\\placetable[split,none]{}{%`);   
      o.push(text);
      o.push(`}`);   
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  _do_mult(block) {
    var { more } = block;
    var o = [];
    o.push('');
    o.push(this.to_info(block));
    let nn = more.map(pp => pp.length);
    let n = nn.reduce((acc, cur) => Math.max(acc, cur), 0);
    for (let j = 0; j < more.length; ++j) {
      let pp = more[j];//pp could be shorter than n
      let w = `${this.fix(1 / n)}`
      o.push(`\\defineparagraphs[mult][n=${n},before={\\blank},after={\\blank}]`);
      for (let i = 0; i < n; ++i) {
        let text = pp[i] || '';
        o.push(`\\setupparagraphs[mult][${i+1}][width=${w}\\textwidth]`)
      }
      o.push(`\\startmult`)
      for (let i = 0; i < n; ++i) {
        let text = pp[i] || '';
        o.push(this.untext(text));
        o.push(`\\mult`);
      }
      o.pop();
      o.push(`\\stopmult`)
    }
    block.latex = o.join('\n');
  }
  do_mult(block) {
    var { more } = block;
    var d = [];
    d.push('');
    d.push(this.to_info(block));
    let nn = more.map(pp => pp.length);
    let n = nn.reduce((acc, cur) => Math.max(acc, cur), 0);
    var pcol = 'p'.repeat(n);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    d.push(`\\starttabulate[${pcol}]`);
    for (let j = 0; j < more.length; ++j) {
      let pp = more[j];//pp could be shorter than n
      for (let i = 0; i < n; ++i) {
        let text = pp[i] || '';
        text = this.untext(text);
        text = text||'';
        d.push(`\\NC`);
        d.push(text);
      }
      d.push('\\NC \\NR');
    }
    d.push('\\stoptabulate');
    block.latex = d.join('\n');
  }
  do_tabb(block){
    var {more} = block;
    var o = [];
    o.push(this.to_info(block));
    var ncols = more.length;
    var nrows = 0;
    more.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var d = [];
    /// turn off all frame and padding
    /// writing table
    for(var j=0; j < ncols; ++j){
      var dd = [];
      for(var i=0; i < more[j].length; ++i){
        var s = more[j][i]||'';
        dd.push(s);
      }
      dd = dd.map(x => this.unmask(x));
      dd = dd.join(' \\crlf\n');
      d.push(dd);
    }
    o.push(`\\blank`);
    o.push(`\\defineparagraphs[sidebyside][n=${ncols}]`);
    o.push(`\\startsidebyside`);
    o.push(d.join('\\sidebyside\n'));
    o.push(`\\stopsidebyside`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_pict(block){
    var {id,row1,row2,sig,opts,images,caption,label,islabeled} = block;
    opts=opts||{};
    images=images||[];
    var o = [];
    o.push(this.to_info(block));
    var d = [];
    var n = this.assert_int(opts.grid,1,1);
    var m = Math.ceil(images.length/n);
    d.push(`{\\centeraligned{\\startcombination[${n}*${m}]`);
    for(var image of images){
      var {src,width,height,sub} = image;
      var imgsrc = this.to_context_img_src(src);
      var sub_text = this.unmask(sub);
      ///calc frac 
      if(images.length == 1){
        var w = '';
      } else {
        var w = (1-(0.02*(n-1)))/n;
      }
      ///to CONTEX length, such as 0.06\textwidth 
      let command = `\\externalfigure[${imgsrc}][width=${w}\\textwidth]`;
      if(opts && opts.frame){
        command = `\\framed{${command}}`;
      }
      d.push(`{${command}} {${sub_text}}`);
    }
    d.push(`\\stopcombination}}`);
    var text = d.join('\n');
    if(islabeled){
      o.push(`\\placefigure`);   
      o.push(`[here]`);
      o.push(`[${label}]`);
      o.push(`{${this.unmask(caption)}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
    }else{
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_diag(block){
    var {id,row1,row2,sig,lines,notes,style,caption,label,islabeled} = block; 
    lines=lines||[];
    style=style||{};
    style.width='100%';
    var o = [];
    o.push(this.to_info(block));
    var {s} = this.diagram.to_diagram(lines,style);
    var text = s;
    if(islabeled){
      o.push(`\\placefigure`);   
      o.push(`[here]`);   
      o.push(`[${label}]`);
      o.push(`{${this.unmask(caption)}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
    }else{
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_math(block){
    var {id,row1,row2,sig,math,label,islabeled,more,gather} = block;
    var o = [];
    o.push(this.to_info(block));
    this.make_math(o,math,label,islabeled,more,gather);
    o.push('');
    block.latex = o.join('\n');
  }
  do_quat(block){
    this.do_math(block);
  }
  do_frmd(block){
    var {id,row1,row2,sig,lines,caption,label,islabeled} = block;
    lines=lines||[];
    var o = [];
    o.push(this.to_info(block));
    var n = lines.length;
    var solid = '\\ '.repeat(80);
    var s = [];
    s.push(`\\blank`);
    s.push(`\\startMPcode`);
    s.push(`numeric o; o := 12pt;`);
    ///This draw command is necessary to expand the bounding box of the 
    ///MetaPost vertically so that it is just as high as the number of
    ///lines. Removing it will likely cause the 
    ///rest of the MP code to stop compile.
    s.push(`draw (1*o,0)--(1*o,-${n-1}*o) withpen pencircle withcolor white;`);
    s.push(`label.rt(btex {\\tt\\switchtobodyfont[12pt]${solid}} etex, (0,0));`);
    lines.forEach((x,i) => {
      x = this.polish(x);
      x = x.replace(/\s/g,'~');
      s.push(`label.rt(btex {\\tt{}${x}} etex, (0,-${i}*o));`);
    });
    s.push(`numeric tw; tw := \\the\\textwidth;`);
    s.push(`numeric pw; pw := bbwidth(currentpicture);`);
    s.push(`numeric ratio; ratio := tw/pw;`);
    s.push(`currentpicture := currentpicture scaled ratio;`);
    s.push(`draw bbox currentpicture;`);
    s.push(`\\stopMPcode`);
    s.push('');
    var text = s.join('\n');
    if(islabeled){
      o.push(`\\placefigure`);   
      o.push(`[here]`);
      o.push(`[${label}]`);//get rid of #
      o.push(`{${this.unmask(caption)}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
    }else{
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_vers(block){
    var {id,row1,row2,sig,data,para,base,subrow} = block;
    var o = [];
    o.push(this.to_info(block));
    o.push('\\blank');
    o.push('\\startlines')
    var text = data;
    text = text.map(x => this.unmask(x));
    o.push(text.join('\n'));
    o.push('\\stoplines');
    o.push('');
    block.latex = o.join('\n');
  }

  do_ruby (rb,rt) {
    var s = this.to_ruby_item(rb,rt);
    return s;
  }

  do_ref (sig,label,floatname,idnum,refid,id){
    var secsign = String.fromCharCode(0xA7);
    if(sig=='HDGS'){
      return `Section~\\in[${label}]`;
    }
    else if(sig=='LLST'){
      return `${floatname}~${secsign}${idnum}`;
    }
    if(floatname){  
      return `${floatname}~${secsign}\\in[${label}]`;
    }
    return `${secsign}\\in[${label}]`;
  }

  do_img (g) {
    return `\\externalfigure[${g.data}]`;
  }

  do_vbarchart (cnt) {
    var o = [];
    o.push('\\startMPcode');
    o.push(this.diagram.to_mp_vbarchart(cnt));
    o.push('\\stopMPcode');
    var s = o.join('\n');
    var s = `\\framed{${s}}`;
    return s;
  }

  do_xyplot (cnt) {
    var o = [];
    o.push('\\startMPcode');
    o.push(this.diagram.to_mp_xyplot(cnt));
    o.push('\\stopMPcode');
    var s = o.join('\n');
    var s = `\\framed{${s}}`;
    return s;
  }

  do_colorbox (cnt) {
    var o = [];
    o.push('\\startMPcode');
    o.push(this.diagram.to_mp_colorbox(cnt));
    o.push('\\stopMPcode');
    var s = o.join('\n');
    var s = `\\framed{${s}}`;
    return s;
  }

  to_formula_math_array(str) {
    var d = this.tokenizer.to_cmath_array(str);
    return d;
  }

  to_inlinemath(str,dstyle) {
    var s = this.tokenizer.to_cmath(str,dstyle);
    return `${s}`;
  }

  do_uri(href) {
    return `\\hyphenatedurl{${href}}`
  }
  to_diagram(ss,style){
    var {s} = this.diagram.to_diagram(ss,style);
    return s;
  }
  to_framed(ss,style){
    var {s} = this.framed.to_framed(ss,style);
    return s;
  }
  to_math(ss,style) {
    let s = ss.join(' ');
    var line = this.make_line(s, '', 0);
    return line;
  }
  to_verbatim(ss,style) {
    var o = [];
    o.push('\\starttyping')
    ss.forEach((s) => {
      o.push(s);
    })
    o.push('\\stoptyping')
    return o.join('\n');
  }
  to_verse(ss) {
    var o = [];
    ss = ss.map(x => this.unmask(x));
    ss = ss.map(x => this.rubify(x));
    o.push('\\startlines')
    ss.forEach((s) => {
      o.push(s);
    })
    o.push('\\stoplines')
    return o.join('\n');
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
  to_multi(rows){
    rows = rows.map((ss) => ss.map(s => {
      s = this.unmask(s);
      s = this.rubify(s);
      return s;
    }));
    return this.rows_to_multi(rows);
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
    return `\\quotation{\\it{}${text}}`;
  }

  to_br() {
    let text = '\\crlf';
    return text;
  }
  to_style (text,type) {
    // text is to be treated as is
    type = type || '';
    switch (type) {
      case 'verb': {
        return `{\\tt ${text}}`
        break;
      }
      case 'code': {
        return `{\\tt ${text}}`
        break;
      }
      case 'em': {
        return `{\\it ${text}}`
        break;
      }
      case 'b': {
        return `{\\bf ${text}}`
        break;
      }
      case 'overstrike': {
        return `{\\overstrike ${text}}`
        break;
      }
      case 'var': {
        return `{\\sl ${text}}`
        break;
      }
      default: {
        return text;
        break;
      }
    }
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

  to_twocolumn_texlines(blocks){
    var texlines = [];
    var my_chapters = [];
    for(var i=0; i < blocks.length; ++i){
      var block = blocks[i];
      var {sig,name,hdgn,latex} = block;
      if(sig=='HDGS' && name=='part'){      
        if(my_chapters.length){
          my_chapters.pop();
          texlines.push(`\\stopcolumns`);
        }
        texlines.push(latex);
        continue;
      }
      if(sig=='HDGS' && hdgn==0){
        if(my_chapters.length){
          texlines.push(`\\stopcolumns`);
          texlines.push(`\\startcolumns[balance=no]`);
        } else {
          my_chapters.push('chapter');
          texlines.push(`\\startcolumns[balance=no]`);
        }
        texlines.push(latex);
        continue;
      } 
      if(my_chapters.length==0){
        my_chapters.push('chapter');
        texlines.push(`\\startcolumns[balance=no]`);
        texlines.push(latex);
        continue;
      }
      texlines.push(latex);
      continue;
    }
    ///finish-off
    if(my_chapters.length){
      my_chapters.pop();
      texlines.push(`\\stopcolumns`);
    }
    return texlines;
  }

  to_context_document() {
    var conflines = this.to_config_lines();
    if(this.conf('context.twocolumn')){
      var texlines = this.to_twocolumn_texlines(this.parser.blocks);
    } else {
      var texlines = this.parser.blocks.map(x => x.latex);
    }
    /// generate title page
    var titlelines = [];
    var mytitle = this.conf('general.title');
    var myauthor = this.conf('general.author');
    var myaddr = '';
    var mydate = new Date().toLocaleDateString();
    if(this.to_conf_titlepage()){
      titlelines.push(`\\dontleavehmode`);
      titlelines.push(`\\blank[6cm]`);
      titlelines.push(`\\startalignment[center]`);
      titlelines.push(`\\tfd ${this.unmask(mytitle)}`);
      titlelines.push(`\\stopalignment`);
      titlelines.push(`\\blank[2cm]`);
      titlelines.push(`\\startalignment[center]`);
      titlelines.push(`\\dontleavehmode`);
      titlelines.push(`\\tfb`);
      titlelines.push(`\\bTABLE`);
      titlelines.push(`\\setupTABLE[r][each][frame=off]`);
      titlelines.push(`\\bTR \\bTD ${this.unmask(myauthor)} \\eTD \\eTR`);
      titlelines.push(`\\bTR \\bTD ${this.unmask(myaddr)}   \\eTD \\eTR`);
      titlelines.push(`\\bTR \\bTD ${this.unmask(mydate)}   \\eTD \\eTR`);
      titlelines.push(`\\eTABLE`);
      titlelines.push(`\\stopalignment`);
      titlelines.push(`\\page`);
      titlelines.push('');
    }

    /// toc lines
    var toclines = [];
    if(this.conf('context.toc')){
      if(1){
        toclines.push(`\\setupcombinedlist[content][list={part,chapter,section}]`);
        toclines.push(`\\completecontent[criterium=all]`);
        toclines.push('');
      } else {
        toclines.push(`\\setupcombinedlist[content][list={part,section,subsection}]`);
        toclines.push(`\\placecontent`);
        toclines.push('');
      }
    }

    /// inter-image gaps
    var dist = 0.02;
    //var hdist = istwocol ? `${dist*2}\\textwidth` : `${dist}\\textwidth`;
    var hdist = `0.02\\textwidth`;
    ///layout
    var p_papersize = '';
    var p_layout = '';
    var p_bodyfont='';
    if(this.conf('context.papersize')){
      var s=`\\setuppapersize[${this.conf('context.papersize')}]`;
      p_papersize=s;
    }
    /*
    var s_layout = `\\setuplayout[width = ${ this.conf('width') }mm,
                      backspace = ${ this.conf('backspace') }mm,
                      cutspace = ${ this.conf('cutspace') }mm,
                      topspace = ${ this.conf('topspace') }mm,
                      height = ${ this.conf('height') }mm,
                      header = ${ this.conf('header') }mm,
                      footer = ${ this.conf('footer') }mm]`;
                      */
    if(this.conf('context.layout')){    
      var s=this.conf('context.layout').split('\t');
      var s=`\\setuplayout[${s.join(',')}]`;
      p_layout=s;
    } 
    //\\setupbodyfont[linuxlibertineo, ${ this.conf('bodyfontsizept') } pt]
    if(this.conf('context.bodyfont')){
      var s=this.conf('context.bodyfont').split('\t');
      var s=`\\setupbodyfont[${s.join(',')}]`;
      p_bodyfont=s;
    }
    var data = `\
% !TEX program = ConTeXt (LuaTeX)
${conflines.join('\n')}
\\enabletrackers[fonts.missing]
${p_papersize}
${p_layout}
${p_bodyfont}
\\setuppagenumbering[location={header,right},style=]
\\setupindenting[yes,medium]
\\setscript[hanzi] % hyphenation
\\setuphead[part][number=yes]
\\setuphead[chapter][style=${this.to_conf_chapter()},number=yes]
\\setuphead[section][style=${this.to_conf_section()},number=yes]
\\setuphead[subsection][style=${this.to_conf_subsection()},number=yes]
\\setuphead[subsubsection][style=${this.to_conf_subsubsection()},number=yes]
\\setuphead[subsubsubsection][style=${this.to_conf_subsubsubsection()},number=yes]
\\setupinteraction[state=start,color=,contrastcolor=]
\\enableregime[utf] % enable unicode fonts
\\definefontfamily[de][serif][dejavusans]
\\definefontfamily[za][serif][zapfdingbats]
\\definefontfamily[cn][serif][arplsungtilgb]
\\definefontfamily[tw][serif][arplmingti2lbig5]
\\definefontfamily[jp][serif][ipaexmincho]
\\definefontfamily[kr][serif][baekmukbatang]
\\definefontfamily[de][sans][dejavusans]
\\definefontfamily[za][sans][zapfdingbats]
\\definefontfamily[cn][sans][arplsungtilgb]
\\definefontfamily[tw][sans][arplmingti2lbig5]
\\definefontfamily[jp][sans][ipaexmincho]
\\definefontfamily[kr][sans][baekmukbatang]
\\definemathcommand [arccot] [nolop] {\\mfunction{arccot}}
\\definemathcommand [arsinh] [nolop] {\\mfunction{arsinh}}
\\definemathcommand [arcosh] [nolop] {\\mfunction{arcosh}}
\\definemathcommand [artanh] [nolop] {\\mfunction{artanh}}
\\definemathcommand [arcoth] [nolop] {\\mfunction{arcoth}}
\\definemathcommand [sech]   [nolop] {\\mfunction{sech}}
\\definemathcommand [csch]   [nolop] {\\mfunction{csch}}
\\definemathcommand [arcsec] [nolop] {\\mfunction{arcsec}}
\\definemathcommand [arccsc] [nolop] {\\mfunction{arccsc}}
\\definemathcommand [arsech] [nolop] {\\mfunction{arsech}}
\\definemathcommand [arcsch] [nolop] {\\mfunction{arcsch}}
\\usemodule[ruby]
\\setupcaptions[minwidth=\\textwidth, align=middle, location=top]
\\setupinteraction[state=start]
\\placebookmarks[part,chapter,section]
\\definecolor[cyan][r=0,g=1,b=1] % a RGB color
\\definecolor[magenta][r=1,g=0,b=1] % a RGB color
\\definecolor[darkgray][r=.35,g=.35,b=.35] % a RGB color
\\definecolor[gray][r=.5,g=.5,b=.5] % a RGB color
\\definecolor[lightgray][r=.75,g=.75,b=.75] % a RGB color
\\definecolor[brown][r=.72,g=.52,b=.04] % a RGB color
\\definecolor[lime][r=.67,g=1,b=.18] % a RGB color
\\definecolor[olive][r=.5,g=.5,b=0] % a RGB color
\\definecolor[orange][r=1,g=.5,b=0] % a RGB color
\\definecolor[pink][r=1,g=.75,b=.79] % a RGB color
\\definecolor[teal][r=0,g=.5,b=.5] % a RGB color
\\definecolor[purple][r=.8,g=.13,b=.13] % a RGB color
\\definecolor[violet][r=.5,g=0,b=.5] % a RGB color
\\definedescription[latexdesc][
  headstyle=normal, style=normal, align=flushleft, 
  alternative=hanging, width=fit, before=, after=]
\\definedescription[latexdescbroad][
  headstyle=normal, style=normal, align=flushleft, 
  alternative=hanging, width=fit]
\\definefontsize[sm]
\\definefontsize[xsm]
\\definefontsize[xxsm]
\\definefontsize[xxxsm]
\\definefontsize[big]
\\definefontsize[xbig]
\\definefontsize[xxbig]
\\definefontsize[huge]
\\definefontsize[xhuge]
\\definebodyfontenvironment
  [default]
  [sm=.9,xsm=.8,xxsm=.7,xxxsm=.5,
   big=1.2,xbig=1.4,xxbig=1.7,huge=2.0,xhuge=2.3]
\\setupcombinations[distance=${hdist}]
\\starttext
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\stoptext
    `;
    return data;
  }

  make_line_array(math,label,gather,mainlabel){
    if (label == '#') {
      label = '[+]';
    } else if (label) {
      label = `[${label}]`;
    } else if (mainlabel) {
      label = '[+]';
    } 
    var lines = this.to_formula_math_array(math);
    lines = lines.map(pp => {
      if(gather){
        var p = pp.join(' ');
      }else{
        var p = pp.join(' \\NC ');
      }
      var p = '\\NC ' + p + ' \\NR';
      return p;
    });
    lines[lines.length-1] += label;
    return lines;
  }

  make_line(math,label,islabeled){
    if (label == '#') {
      label = '[+]';
      var islabel=1;
    } else if (label) {
      label = `[${label}]`;
      var islabel=1;
    } else if (islabeled) {
      label = '[+]';
      var islabel=1;
    } else {
      label = '';
      var islabel=0;
    }
    var lines = this.to_formula_math_array(math);
    if(lines.length>0){
      lines = lines.map(pp => {
        var p = pp.join(' \\NC ');
        var p = '\\NC ' + p + ' \\NR';
        return p;
      });
      lines[lines.length-1] += label;
      lines.unshift('\\startmathalignment[n=2]');
      lines.push('\\stopmathalignment');
    }else{
      lines = lines.map(pp => {
        var p = pp.join(' ');
        return p;
      });
    }
    lines.unshift(`\\startformula`);
    lines.push('\\stopformula');
    if(islabel){
      lines.unshift('\\placeformula');
    } 
    return lines.join('\n');
  }

  make_math_array(o,math,label,more,gather){
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR
    ///   \stopmathalignment \stopformula
    ///
    ///   \placeformula
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[+]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[eq:a]
    ///   \stopmathalignment \stopformula
    if(gather){
      o.push(`\\startformula \\startmathalignment[n=1,distance=2pt]`);
    }else{
      o.push(`\\startformula \\startmathalignment[n=2,distance=2pt]`);
    }
    var line_arr = this.make_line_array(math,label,gather,label);
    line_arr.forEach(x => o.push(x));
    for(let k=0; k < more.length; k++){
      let x = more[k];
      var line_arr = this.make_line_array(x.math,x.label,gather,label);
      line_arr.forEach(x => o.push(x));
    }
    o.push(`\\stopmathalignment \\stopformula`);
    o.push('');
  }

  make_math(o,math,label,islabeled,more,gather){
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR
    ///   \stopmathalignment \stopformula
    ///
    ///   \placeformula
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[+]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[eq:a]
    ///   \stopmathalignment \stopformula
    //var line = this.make_line(math,label,islabeled);
    //o.push(line);
    more.forEach(x => {
      var line = this.make_line(x.math,x.label,islabeled);
      o.push(line);
    });
  }

  fontify_context (text,fontsize) {
    fontsize=fontsize||'';
    //const fontnames = ['za','jp','tw','cn','kr'];
    var newtext = '';
    var s0 = '';
    var fns0 = 0;
    var a0 = '';
    var fn0 = '';

    for (var j=0; j < text.length; ++j) {

      var c = text[j];
      var cc = text.charCodeAt(j);

      if(this.is_cjk_cc(cc)){
        var fns = fontmap[cc]; 
      } else {
        var fns = 0;
      }

      // buildup ASCII text
      if(fns == 0 && fns0 == 0){
        a0 += c;
        continue;
      } else {
        // if first CJK char, then init 'fns0' with 'fns'
        if(fns0 == 0){
          fns0 = fns;
        }
      }

      // flush ASCII text
      if(a0){
        if(fontsize){
          newtext += `{\\switchtobodyfont[${fontsize}]${a0}}`;
        }else{
          newtext += `${a0}`;
        }
        a0 = '';
      }

      /// check to see if this char has the same font as the last one
      /// if it is the first time a CJK char is encountered

      var fns0 = fns0 & fns; /// bitwise-AND
      if (fns0) {
        /// get the first font: assign 'k' according to the followinlrules:
        ////  0b0001 => 0, 0b0010 => 1; 0b0011 => 0; 0b0100 => 2
        var k = 0;
        for (k=0; k < fontnames.length; ++k) {
          if (fns0 & (1 << k)) {
            break;
          }
        }
        ///note that fn here could be different everytime so we need to 
        ///save it to fn0 if it is still not '', when it is '', then
        ///the CJK font has swiched, or it is no longer a CJK
        var fn = fontnames[k];
        if (fn) {
          fn0 = fn;
          /// building up CJK s0 by combining with previous 'c0' and 's0'
          s0 += c;
          continue
        }
      }

      /// flush CJK
      /// by the time we get here the 'c' is either a CJK that does
      //// not agree with previous character in terms of the same font;
      //// or 'c' is not a CJK at all.
      newtext += `{\\switchtobodyfont[${fn0},${fontsize}]{${s0}}}`;
      fns0 = 0;///a list of available fonts
      s0 = '';///the CJK string
      fn0 = '';///the font chosen for use with switchbodyfont

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
        fn0 = fontnames[k];
        /// save the current font map infor for this char
        var fns0 = fns;
        var s0 = c;
        continue;
      }

      /// we get here if the 'c' is not a CJK
      a0 += c; // add to a0
    }

    if(a0){
      ///ascii
      if(fontsize){
        newtext += `{\\switchtobodyfont[${fontsize}]${a0}}`;
      }else{
        newtext += `${a0}`;
      }
    } else if (s0){
      ///cjk
      newtext += `{\\switchtobodyfont[${fn0},${fontsize}]${s0}}`;
    }
    return newtext;
  }

  to_mpcolor(color) {
    return `\\MPcolor{${color}}`;
  }

  mpfontsize(fontsize) {
    /// current in CONTEXT it is not easy to change to a different fontsize
    /// when generating text in MP, so this method returns an empty string
    /// meaning we will just use the default font size, which is the body font.
    return '';
  }

  to_context_length(str) {
    /// take an input string that is 100% and convert it to '\textwidth'.
    /// take an input string that is 50% and convert it to '0.5\textwidth'.
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
          return `\\textwidth`;
        }
        return `${num}\\textwidth`;
      } else {
        return str;
      }
    }
    return str;
  }

  to_context_img_src(src){
    if(src.endsWith('.svg')){
      return src.slice(0,src.length-4) + '.png';
    } 
    return src;
  }

  convert_longpadding(text){
    // given a string such as "2" return [2,2]
    // given a string such as "2 3" return [2,3]
    var v = this.string_to_int_array(text);
    if(v.length == 1){
      return [v[0],v[0]];
    } else if(v.length==0){
      return [0,0];
    } else {
      return [v[0],v[1]];
    }
  }
  cols_to_tabu(cols) {
    var ncols = cols.length;
    var nrows = 0;
    cols.forEach(x => {
      var n = x ? x.length : 0;
      nrows = Math.max(n, nrows);
    });
    var s = [];
    var pcol = 'l'.repeat(ncols);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    var h = 4;
    var t = 0;
    s.push(`\\starttabulate[${pcol}]`);
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      s.push(`\\NC ${pp.join(' \\NC ')} \\NC \\NR`);
    }
    s.push('\\stoptabulate');
    return s.join('\n');
  }
  rows_to_tabu(rows) {
    var ncols = rows.length ? rows[0].length : 0;
    var nrows = rows.length;
    var d = [];
    var pcol = 'l'.repeat(ncols);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    d.push(`\\starttabulate[${pcol}]`);
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      pp = pp.slice(0, ncols);
      if(this.pp_is_hline(pp)){
        d.push(`\\HL`)
        continue;
      }
      d.push(`\\NC ${pp.join(' \\NC ')} \\NC \\NR`);
    }
    d.push('\\stoptabulate');
    return d.join('\n');
  }
  rows_to_multi(rows) {
    let ncols = rows.length && rows[0].length;
    let nrows = rows.length;
    let n = ncols;
    var d = [];
    var pcol = 'p'.repeat(n);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    d.push(`\\defineparagraphs[sidebyside][n=${n}]`);
    for(let j=0; j < nrows; ++j){
      d.push(`\\startsidebyside`);
      let pp = rows[j];
      pp = pp.slice(0,n);
      for(let i=0; i < n; ++i){
        let text = pp[i] || '';
        d.push(text);
        if(i<n-1){
          d.push('\\sidebyside');
        }
      }
      d.push('\\stopsidebyside');
    }
    return d.join('\n');
    /*
    o.push(`\\blank`);
    o.push(`\\defineparagraphs[sidebyside][n=${ncols}]`);
    o.push(`\\startsidebyside`);
    o.push(d.join('\\sidebyside\n'));
    o.push(`\\stopsidebyside`);
    o.push('');
    */
  }
  cols_to_multi(cols) {
    let n = cols.length;
    var d = [];
    var pcol = 'p'.repeat(n);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    d.push(`\\starttabulate[${pcol}]`);
    cols.forEach(text => {
      d.push(`\\NC`);
      d.push(text);
    });
    d.push('\\NC \\NR');
    d.push('\\stoptabulate');
    return d.join('\n');
  }
  rows_to_tabulate(rows,ww,style,isheader) {
    //this function assumes all texts has been escaped
    var ncols = ww.length;
    var nrows = rows.length;
    var d = [];
    var pcol = 'l'.repeat(ncols);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    var h = 4;
    var t = 0;
    d.push(`\\starttabulate[${pcol}]`);
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      if(isheader&&j==0){
        d.push('\\HL');
      }
      d.push(`\\NC ${pp.join(' \\NC ')} \\NR`);
      if (isheader && j == 0) {
        d.push('\\HL');
      }
    }
    if(isheader){
      d.push('\\HL');
    }
    d.push('\\stoptabulate');
    return d.join('\n');
  }

  tabr_cols_to_btable(cols) {
    var ncols = cols.length;
    var nrows = 0;
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var s = [];
    var pcol = 'l'.repeat(ncols);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    var h = 4;
    var t = 0;
    s.push(`\\bTABLE`);
    s.push(`\\setupTABLE[frame=off]`)
    s.push(`\\setupTABLE[r][first][topframe=on]`);
    s.push(`\\setupTABLE[r][first][bottomframe=on]`);
    s.push(`\\setupTABLE[r][last][bottomframe=on]`);
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      if (j == 0) {
        s.push(`\\bTABLEhead`);
        var kk = pp.map(x => x.split('\\\\'));
        var kk = kk.map(k => k.map(x => this.unmask(x)));
        var pp = kk.map(k => k.join('\\\\'));        
        s.push(`\\bTR \\bTH ${pp.join(' \\eTH \\bTH ')} \\eTH \\eTR`);
        s.push(`\\eTABLEhead`);
        s.push(`\\bTABLEbody`);
      }
      else {
        var pp = cols.map(x => x[j] || '');
        pp = pp.map(x => this.unmask(x));
        s.push(`\\bTR \\bTD ${pp.join(' \\eTD \\bTD ')} \\eTD \\eTR`);
      }
    }
    s.push(`\\eTABLEbody`);
    s.push(`\\eTABLE`);
    return s.join('\n');
  }



  do_tabb_btable(block){
    var {id,row1,row2,sig,rows,ww} = block;
    var o = [];
    o.push(this.to_info(block));
    var ncols = ww.length;
    rows = rows.map(row => row.map(x => this.unmask(x)));
    ///***NOTE: xltabular is percular of naming its columns
    var s = [];
    /// adjust for the relative width
    ww = this.ww_to_one(ww);
    var pp = ww.map((x,i) => `\\setupTABLE[c][${i+1}][width=${x}\\textwidth]`);
    s.push(pp.join('\n'));
    /// turn off all frame and padding
    s.push(`\\setupTABLE[frame=off]`);
    /// writing table
    s.push(`\\bTABLE[loffset=${0}pt,roffset=${0}pt,toffset=${0}pt,boffset=${0}pt,split=yes,option=stretch]`);
    s.push(`\\bTABLEhead`);
    s.push(`\\eTABLEhead`);
    s.push(`\\bTABLEbody`);
    for( var row of rows ) {
      row = row.map(x => `\\bTD ${x} \\eTD`);
      s.push(`\\bTR ${row.join(' ')} \\eTR`);
    }
    s.push(`\\eTABLEbody`);
    s.push(`\\eTABLE`);
    o.push(`\\blank`);
    o.push(s.join('\n'));
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }

  to_colors(color){
    return this.diagram.to_colors(color);
  }

  rows_to_table(rows){
    var ncols = rows[0].length;
    var nrows = rows.length;;
    var d = [];
    var pcol = 'l'.repeat(ncols);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    d.push(`\\starttabulate[${pcol}]`);
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      d.push(`\\NC ${pp.join(' \\NC ')} \\NR`);
    }
    d.push(`\\stoptabulate`);
    let text = d.join('\n');
    return text;
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
            var v = this.tokenizer.get_cex_symbol(p1);
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
    unsafe = unsafe.replace(/⁻¹/g,    `\0high${T3}-1${T4}\0`)
    unsafe = unsafe.replace(/⁻²/g,    `\0high${T3}-2${T4}\0`)
    unsafe = unsafe.replace(/⁻³/g,    `\0high${T3}-3${T4}\0`)
    unsafe = unsafe.replace(/¹/g,     `\0high${T3}1${T4}\0`)
    unsafe = unsafe.replace(/²/g,     `\0high${T3}2${T4}\0`)
    unsafe = unsafe.replace(/³/g,     `\0high${T3}3${T4}\0`)
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
  itms_to_itemized(itms,style){
    if(itms.length && itms[0].bull == 'UL'){
      let pp = itms.map(p => `\\item ${p.text}`);
      if(style && style.n && style.n > 1){
        return this.pp_to_multi_itemized(pp,style.fr,style.n,'')
      }
      return(`\\startitemize[packed]\n${pp.join('\n')}\n\\stopitemize`);
    }
    if(itms.length && itms[0].bull == 'OL'){
      let pp = itms.map(p => {
        if (p.type == 'A') {
          return `\\sym {${this.to_A_letter(p.value)}${p.ending}} ${p.text}`;
        }
        if (p.type == 'a') {
          return `\\sym {${this.to_a_letter(p.value)}${p.ending}} ${p.text}`;
        }
        if (p.type == 'I') {
          return `\\sym {${this.to_I_letter(i + 1)}${p.ending}} ${p.text}`;
        }
        if (p.type == 'i') {
          return `\\sym {${this.to_i_letter(i + 1)}${p.ending}} ${p.text}`;
        }
        if(typeof p.value == 'number'){
          return `\\sym {${p.value}${p.ending}} ${p.text}`
        }
        return `\\item ${p.text}`
      });
      if (style && style.n && style.n > 1) {
        return this.pp_to_multi_itemized(pp, style.fr, style.n, 'n')
      }
      return (`\\startitemize[packed,n]\n${pp.join('\n')}\n\\stopitemize`);
    }
    return (`\\startitemize[packed]\\item\n\\stopitemize`);
  }
  pp_to_multi_itemized(pp,fr,n,name){
    var d = [];
    var k = Math.floor(pp.length / n);
    var z = pp.length - k * n;
    var t1 = 0;
    var tn = k + z;
    var frs = this.string_to_frs(fr, n);
    var pcol = 'p'.repeat(n);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    d.push(`\\defineparagraphs[sidebyside][n=${n}]`);
    d.push(`\\startsidebyside`);
    for (let i = 0; i < n; ++i) {
      var kk = pp.slice(t1, t1 + tn);
      t1 += tn;
      tn = k;
      let fr = frs[i];
      d.push(`\\startitemize[packed,${name}]\n${kk.join('\n')}\n\\stopitemize`);
      if (i < n - 1) {
        d.push('\\sidebyside');
      }
    }
    d.push('\\stopsidebyside');
    return d.join('\n')
  }
}

module.exports = { NitrilePreviewContext };
