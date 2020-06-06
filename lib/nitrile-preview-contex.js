'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');
const { NitrilePreviewCmath } = require('./nitrile-preview-cmath');
const utils = require('./nitrile-preview-utils');
const C_textrightarrow = String.fromCharCode(8594);
const fontmap = require('./nitrile-preview-fontmap');

class NitrilePreviewContex extends NitrilePreviewParser {

  constructor() {
    super();
    this.tokenizer = new NitrilePreviewCmath(this);
    this.mymap = [
      "‘"  , "'"                   ,
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
      "⁻¹" , "\\high{-1}",
      "⁻²" , "\\high{-2}",
      "⁻³" , "\\high{-3}",
      "¹" ,  "\\high{1}",
      "²" ,  "\\high{2}",
      "³" ,  "\\high{3}",
      "\\" , "\\textbackslash{}"   ,
      "|"  , "\\textbar{}"         ,
      "*"  , "{*}"                 ,
      "~"  , "\\textasciitilde{}"  ,
      "^"  , "\\textasciicircum{}" ,
      "<"  , "{$<$}"               ,
      ">"  , "{$>$}"               ,
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
      "⁻¹" , "\\high{-1}",
      "⁻²" , "\\high{-2}",
      "⁻³" , "\\high{-3}",
      "¹" ,  "\\high{1}",
      "²" ,  "\\high{2}",
      "³" ,  "\\high{3}",
      "\\" , "\\textbackslash{}"   ,
      "|"  , "\\char124{}"         ,
      "*"  , "\\char42{}"          ,
      "~"  , "\\char126{}"         ,
      "^"  , "\\char94{}"          ,
      "<"  , "\\char60{}"          ,
      ">"  , "\\char62{}"          ,
      "\[" , "{[}"                 ,
      "\]" , "{]}"                 ,
      "$"  , "\\$"                 ,
      "#"  , "\\char35{}"          ,
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
      "\[" , "{[}"                 ,
      "\]" , "{]}"                 ,
      "$"  , "\\$"                 ,
      "#"  , "\\char35{}"          ,
      "&"  , "\\&"                 ,
      "_"  , "\\_"                 ,
      "%"  , "\\%"                 ,
      "\{" , "\\char123{}"          ,
      "\}" , "\\char125{}"
    ];
  }

  do_hdgs(block){
    var o = [];
    var {id,row1,row2,sig,part,hdgn,dept,text,subfname} = block;
    subfname=subfname||'';
    o.push(`%HDGS ${subfname} ${1+row1} ${1+row2}`);
    var text = this.escape(text);
    var raw = text;
    if(this.config.CONTEX.trace){
      text += ` {\\small\\it ${subfname}}`;
    }
    var use_chap=0;
    if(this.config.CONTEX.docstyle==0){
      if(this.ismaster){
        use_chap=1;
      } 
    } else if (this.config.CONTEX.docstyle==1){
      use_chap=0;
    } else if (this.config.CONTEX.docstyle==2){
      use_chap=1;
    }
    ///assign this so that it can be used by toLatexDocument().
    this.use_chap=use_chap;
    if(part){
      var text = this.escape(part);
      var raw = part;
      o.push(`\\startpart[title={${dept}~~${text}},reference={${this.label_text}},bookmark={${dept} ${raw}}]`);
      o.push(`\\dontleavehmode`);
      o.push(`\\blank[60mm]`);
      o.push(`\\startalignment[flushleft]`);
      o.push(`{\\bfb Part ${dept}}`);
      o.push(`\\stopalignment`);
      o.push(`\\blank[8mm]`);
      o.push(`\\startalignment[flushleft]`);
      o.push(`{\\bfd ${text}}`);
      o.push(`\\stopalignment`);
      o.push(`\\page`);
      o.push('');
    }
    else if(hdgn == 0) {
      if(this.config.CONTEX.frontpage){
      }else{
        o.push(`\\blank\\noindent{\\tfd ${text}}`);
        o.push(`\\blank`);
      }
    } 
    else if(hdgn == 1){
      if(use_chap){
        o.push(`\\startchapter[title={${dept}~~${text}},reference={${this.label_text}},bookmark={${dept} ${raw}}]`);
        o.push('');
      } else {
        o.push(`\\startsection[title={${dept}~~${text}},reference={${this.label_text}},bookmark={${dept} ${raw}}]`);
        o.push('');
      }
    } else if(hdgn == 2){
      if(use_chap){
        o.push(`\\startsection[title={${dept}~~${text}},reference={${this.label_text}},bookmark={${dept} ${raw}}]`);
        o.push('');
      } else {
        o.push(`\\startsubsection[title={${dept}~~${text}},reference={${this.label_text}},bookmark={${dept} ${raw}}]`);
        o.push('');
      }
    } else if(hdgn == 3){
      if(use_chap){
        o.push(`\\startsubsection[title={${dept}~~${text}},reference={${this.label_text}},bookmark={${dept} ${raw}}]`);
        o.push('');
      } else {
        o.push(`\\startsubsubsection[title={${dept}~~${text}},reference={${this.label_text}},bookmark={${dept} ${raw}}]`);
        o.push('');
      }
    } else if(hdgn == 4){
      o.push(`\\startsubsubsection[title={${dept}~~${text}},reference={${this.label_text}},bookmark={${dept} ${raw}}]`);
      o.push('');
    } else {
      o.push(`\\startsubsubsection[title={${dept}~~${text}},reference={${this.label_text}},bookmark={${dept} ${raw}}]`);
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_dlst(block){
    var o = [];
    var {id,row1,row2,sig,items,para,base,subrow,subfname} = block;
    subfname=subfname||'';
    o.push(`%DLST ${subfname} ${1+row1} ${1+row2}`);
    o.push(`\\blank`);
    for (var item of items) {
      var {key,text,type} = item;
      if(type==1){
        key = this.escape(key);
        text = this.unmask(text);
        key = this.polish(key);
        text = this.polish(text);
        o.push(`\\latexdesc{${key}} ${text} \\par`);
      }else if(type==2){
        key = key.substring(1,key.length-1);
        key = this.escape(key);
        text = this.unmask(text);
        key = this.polish(key);
        text = this.polish(text);
        o.push(`\\latexdesc{${key}} ${text} \\par`);
      }else if(type==3){
        key = this.unmask(key);
        text = this.unmask(text);
        key = this.polish(key);
        text = this.polish(text);
        o.push(`\\noindent {${key}} ~ ${text} \\par`);
      }
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_nlst(block){
    var o = [];
    var {id,row1,row2,sig,items,para,base,subrow,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    o.push(`\\blank`);
    for (var item of items) {
      var {type,bull,text,body} = item;
      if(type=='nlst'){
        text = this.unmask(text);
        o.push(`\\startitemize[packed,n]`);
        o.push(`\\sym {${bull}} ${text}`);
        o.push(`\\stopitemize`);
        o.push('');
      }else if(type=='samp'){
        body = body.map( x => this.escapeTT(x) );
        body = body.map( x => this.rubify(x) );
        body = body.map( x => this.polish(x) );
        body = body.map( x => (x)?x:'~');
        body = body.map( x => `{\\tt ${x}}`);
        body = body.join('\n');
        o.push(`\\setupnarrower[left=${this.config.CONTEX.step}mm]`);
        o.push(`\\startnarrower[left]`);
        o.push(`\\startlines`);
        o.push(body);
        o.push(`\\stoplines`);
        o.push('\\stopnarrower');
        o.push('');
      }else if(type=='text'){
        o.push(`\\setupnarrower[left=${this.config.CONTEX.step}mm]`);
        o.push(`\\startnarrower[left]`)
        o.push('\\blank\\noindent');
        o.push(`${text}`);
        o.push(`\\stopnarrower`);
        o.push('\\blank');
        o.push('');
      }
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hlst(block){
    var o = [];
    var {id,row1,row2,sig,items,para,base,subrow,subfname} = block;
    subfname=subfname||'';
    o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    o.push(`\\blank`);
    var keys = items;
    keys = keys.map( x => this.unmask(x) );
    keys = keys.map( x => `{\\bf ${x}}` );
    keys = keys.map( x => `\\noindent{${x}}` );
    o.push(keys.join('\\\\'));
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_plst(block){
    var o = [];
    var {id,row1,row2,sig,items,subfname} = block;
    subfname=subfname||''; o.push(`%PLST ${subfname} ${1+row1} ${1+row2}`);
    var bull0 = '';
    o.push('\\blank');
    for (var item of items) {
      var {bull,bullet,value,text} = item;
      bullet = bullet || '';
      text = text || '';
      if (bull==='OL'||bull==='UL') bull0 = bull;
      text = this.unmask(text);
      switch (bull) {
        case 'OL': {
          o.push(`\\startitemize[packed,n]`);
          o.push(`\\sym {${value}} ${text}`);
          break;
        }
        case 'UL': {
          o.push(`\\startitemize[packed]`);
          o.push(`\\item ${text}`);
          break;
        }
        case 'LI': {
          if (value) {
            o.push(`\\sym {${value}} ${text}`);
          } else {
            o.push(`\\item ${text}`);
          }
          break;
        }
        case '/OL': {
          o.push(`\\stopitemize`);
          if(bullet){
            if (value) {
              o.push(`\\sym {${value}} ${text}`);
            } else {
              o.push(`\\item ${text}`);
            }
          }
          break;
        }
        case '/UL': {
          o.push(`\\stopitemize`);
          if(bullet){
            if (value) {
              o.push(`\\sym {${value}} ${text}`);
            } else {
              o.push(`\\item ${text}`);
            }
          }
          break;
        }
      }
    }
    o.push('\\blank');
    o.push('');
    block.latex = o.join('\n');
  }
  do_ilst(block){
    var o = [];
    var {id,row1,row2,sig,items,subfname} = block;
    subfname=subfname||'';
    o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
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
  do_verb(block){
    var {id,row1,row2,sig,body} = block;
    var text = body;
    var s = [];
    if(this.xnumbers){
      s.push(`\\starttabulate[|l|l|]`);
    }else{
      s.push(`\\starttabulate[|l|]`);
    }
    s.push(`\\HL`);
    var linenum = 0;
    for (var k=0; k < text.length; ++k) {
      var line = text[k];
      var line = this.escape_solid(line);
      var line = this.polish(line,this.config.CONTEX.fslisting);
      if(this.xnumbers){
        var lineno = `${++linenum}`;
        var lineno = this.polish(lineno,this.config.CONTEX.fslineno);
        s.push(`\\NC ${lineno} \\NC ${line} \\NC\\NR`);
      }else{
        s.push(`\\NC ${line} \\NC\\NR`);
      }
    }
    s.push(`\\HL`);
    s.push(`\\stoptabulate`);
    text = s.join('\n');
    var o = [];
    o.push(`%VERB`);
    o.push('\\blank\\noindent');
    o.push(this.caption_text);
    o.push(text);
    o.push('');
    block.latex = o.join('\n');
  }
  do_samp(block){
    var o = [];
    var {id,row1,row2,sig,body,subfname,parser} = block;
    subfname=subfname||'';
    o.push(`%SAMP ${subfname} ${1+row1} ${1+row2}`);
    if(parser.samp==1){
      body = this.to_samp1_body(body);
      body = body.map( x => this.escape(x) );
      body = body.map( x => this.rubify(x) );
      body = body.map(x => {
        if(!x){
          return '~';
        }
        return x;
      });
      body = body.join('\n');
      o.push(`\\setupnarrower[left=${this.config.CONTEX.step}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push(`\\startlines`);
      o.push(body);
      o.push(`\\stoplines`);
      o.push('\\stopnarrower');
      o.push('');
    } 
    else if(parser.samp==2){
      var text = this.joinPara(body);
      var text = this.escape(text);
      var text = this.rubify(text);
      o.push(`\\setupnarrower[left=${this.config.CONTEX.step}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push('\\blank\\noindent');
      o.push(text);
      o.push('\\stopnarrower');
      o.push('\\blank');
      o.push('');
    }
    else{
      body = body.map( x => this.escapeTT(x) );
      body = body.map( x => this.rubify(x) );
      body = body.map( x => this.polish(x,this.config.CONTEX.fscode) );
      body = body.map(x => {
        if(!x){
          x = '~';
        }else{
          x = `{\\tt{}${x}}`
        }
        return x;
      });
      body = body.join('\n');
      o.push(`\\setupnarrower[left=${this.config.CONTEX.step}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push(`\\startlines`);
      o.push(body);
      o.push(`\\stoplines`);
      o.push('\\stopnarrower');
      o.push('');
    }
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hrle(block){
    var {id,row1,row2,sig,data,para,base,subrow} = block;
    var o = [];
    var text = data;
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
    var {id,row1,row2,sig,leadn,lead,text} = block;
    var v;
    var o = [];
    const indent = '~'.repeat(5);
    if (leadn&&leadn>0) {
      lead = this.escape(lead);
      text = this.unmask(text);
      if (leadn===1) {
        text = `{\\bf{}${lead}} ~ ${text}`;
        o.push(`\\blank\\noindent ${text}`);
        o.push(`\\blank`);
        this.needblank = 1;
      } 
      else if (leadn===2) {
        text = `{\\bi{}${lead}} ~ ${text}`;
        o.push(`\\blank\\noindent ${text}`);
        o.push(`\\blank`);
        this.needblank = 1;
      } 
      else {
        text = `{\\bi{}${lead}} ~ ${text}`;
        o.push(`\\blank\\noindent ${indent}${text}`);
        o.push(`\\blank`);
        this.needblank = 1;
      }
    } 
    else {
      text = this.unmask(text);
      if (this.needblank) {
        this.needblank = 0;
        text = `\\blank\\noindent ${text}`;
      }
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_quot(block){
    var {id,row1,row2,sig,text} = block;
    var o = [];
    text = this.unmask(text);
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push(`\\setupnarrower[left=${this.config.CONTEX.step}mm]`);
    o.push(`\\startnarrower[left]`)
    o.push('\\blank\\noindent');
    o.push(`${lq}${text}${rq}`);
    o.push(`\\stopnarrower`);
    o.push('\\blank');
    o.push('');
    block.latex = o.join('\n');
  }
  do_tabb(block){
    var {id,row1,row2,sig,cols} = block;
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
      pp = pp.map(x => this.polish(x,this.config.CONTEX.fstabular));
      pp = pp.map(x => `\\NC ${x}`);
      var p = pp.join(' ');
      p = `${p} \\NC\\NR`;
      s.push(p);
    }
    var text = s.join('\n');
    var pcol = 'l'.repeat(ncols);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    var o = [];
    o.push(`\\blank`);
    o.push(`\\setupnarrower[left=${this.config.CONTEX.step}mm]`);
    o.push(`\\startnarrower[left]`)
    o.push(`\\starttabulate[${pcol}]`);
    o.push(text);
    o.push(`\\stoptabulate`);
    o.push(`\\stopnarrower`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_tabr(block){
    var o = [];
    var {id,row1,row2,sig,cols,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var s = [];
    var maxj = cols.length;
    var pcols = 'l'.repeat(maxj).split('');
    let vlines='';
    let vpadding=1;
    var nrows = 0;
    /// find out the longest rows
    cols.forEach(x => {
      var n = x.length;
      nrows = Math.max(n,nrows);
    });
    s.push(`\\starttabulate[|${pcols.join('|')}|]`);
    /// pp is a list of table cells of the current row j
    for(var j=0; j<nrows; ++j){
      var pp = cols.map(x => x[j]||'');
      var nn = [];
      var kk = [];
      var maxn = 0;
      if(j==0){
        kk = pp.map(x => x.split('\\\\'));
        nn = kk.map(x => x.length);
        maxn = nn.reduce(n => Math.max(maxn,n));
        if(maxn > 1){
          s.push(`\\HL`);
          for(var n=0; n<maxn; ++n){
            pp = kk.map(x => x[n]||'');
            pp = pp.map(x => this.unmask(x));
            pp = pp.map(x => this.polish(x,this.config.CONTEX.fstabular,'bf'));
            s.push(`\\NC ${pp.join(' \\NC ')} \\NC\\NR`);
          }
          s.push(`\\HL`);
        } else {
          pp = pp.map(x => this.unmask(x));
          pp = pp.map(x => this.polish(x,this.config.CONTEX.fstabular,'bf'));
          s.push(`\\HL`);
          s.push(`\\NC ${pp.join(' \\NC ')} \\NC\\NR`);
          s.push(`\\HL`);
        }
      } else {
        pp = pp.map(x => this.unmask(x));
        pp = pp.map(x => this.polish(x,this.config.CONTEX.fstabular));
        s.push(`\\TB[${vpadding}pt]`);
        s.push(`\\NC ${pp.join(' \\NC ')} \\NC\\NR`);
      }
    }
    s.push(`\\TB[${vpadding}pt]`);
    s.push(`\\HL`);
    s.push('\\stoptabulate');
    var text = s.join('\n');
    if(this.floatname){
      o.push(`\\placefloat`);
      o.push(`[here]`);
      o.push(`[${this.label_text}]`);//get rid of #
      o.push(`{${this.caption_text}}`);//already unmasked
      o.push('{%');
      o.push(text);
      o.push('}');
    } else {
      o.push(`\\blank`);
      o.push(`\\startalignment[middle]`);
      o.push(`{\\centeraligned ${text}}`);
      o.push(`\\stopalignment`);
      this.needblank = 1;
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_long(block){
    var {id,row1,row2,sig,rows,ww} = block;
    var o = [];
    var maxj = ww.length;
    rows = rows.map(row => row.map(x => this.unmask(x)));
    rows = rows.map((row,i) => row.map(x => (i==0)?this.polish(x,this.config.CONTEX.fstabular,'bf'):this.polish(x,this.config.CONTEX.fstabular))); 
    ///***NOTE: xltabular is percular of naming its columns
    let t = 3;
    let h = 6;
    let vlines = this.toArray('*');
    let hlines = this.toArray('t m b r');
    var header = rows.shift();
    var s = [];
    /// adjust for the relative width
    ww = this.wwToOne(ww);
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
        s.push(`\\setupTABLE[c][${j}][leftframe=${vlines.indexOf(`${j-1}`)?'on':'off'}]`);
        if (j==maxj) {
          s.push(`\\setupTABLE[c][${j}][rightframe=${vlines.indexOf(`${j}`)?'on':'off'}]`);
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
    o.push(`\\blank`);
    o.push(s.join('\n'));
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
      s.push(`{\\centeraligned{\\startcombination[${n}*1]`);
      for(var img of images){
        const {src,sub} = img;
        const imgsrc = this.toContextImageSrc(src);
        const sub_text = this.unmask(sub);
        if(mode && mode.width){
          var mywidth = this.toContexLength(`${mode.width*100/n}%`);
        }else{
          var mywidth = this.toContexLength(`${100/n}%`);
        }
        let command = `\\externalfigure[${imgsrc}][width=${mywidth}]`;
        if(mode && mode.frame){
          command = `\\framed{${command}}`;
        }
        s.push(`{${command}} {${sub_text}}`);
      }
      s.push(`\\stopcombination}}`);
    }
    var text = s.join('\n');
    if(this.floatname){
      o.push(`\\placefloat`);   
      o.push(`[here]`);   
      o.push(`[${this.labeltext}]`);//get rid of #
      o.push(`{${this.caption_text}}`);//already unmasked
      o.push('{%');
      o.push(text);
      o.push('}');
    } else {
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_diag(block){
    var o = [];
    var {id,row1,row2,sig,body,parser,subfname} = block; 
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var mp = new NitrilePreviewDiagramMP(this,parser.notes);///use the native parser of the block
    var [text] = mp.parse(body);
    var ym = mp.height;
    var xm = mp.width;
    var unit = mp.unit;
    var s = [];
    s.push('\\startMPcode');
    s.push(`numeric textwidth; textwidth := \\the\\textwidth;`);
    s.push(`numeric pu; pu := textwidth/${xm};`);
    s.push(`numeric u; u := ${unit}mm;`);
    s.push(`numeric ratio; ratio := pu/u;`);
    s.push(`picture wheel;`);
    s.push(`wheel := image(`);
    s.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
    s.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
    s.push(text);
    s.push(`);`);
    s.push(`draw wheel scaled(ratio);`);
    s.push('\\stopMPcode');
    var text = s.join('\n');
    if(this.floatname){
      o.push(`\\placefloat`);   
      o.push(`[here]`);   
      o.push(`[${this.label_text}]`);
      o.push(`{${this.caption_text}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
    } else {
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_math(block){
    var o = [];
    var {id,row1,row2,sig,maths,more,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    if(this.xlabel){
      o.push(`\\placeformula`);
    }
    this.make_math(o,maths,this.label_text,more);
    block.latex = o.join('\n');
  }
  do_frmd(block){
    var o = [];
    var {id,row1,row2,sig,body,subfname} = block;
    subfname=subfname||''; o.push(`%${sig} ${subfname} ${1+row1} ${1+row2}`);
    var n = body.length;
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
    body.forEach((x,i) => {
      x = this.escapeFramed(x);
      s.push(`label.rt(btex {\\tt\\switchtobodyfont[12pt]${x}} etex, (0,-${i}*o));`);
    });
    s.push(`numeric tw; tw := \\the\\textwidth;`);
    s.push(`numeric pw; pw := bbwidth(currentpicture);`);
    s.push(`numeric ratio; ratio := tw/pw;`);
    s.push(`currentpicture := currentpicture scaled ratio;`);
    s.push(`draw bbox currentpicture;`);
    s.push(`\\stopMPcode`);
    s.push('');
    var text = s.join('\n');
    if(this.floatname){
      o.push(`\\placefloat`);   
      o.push(`[here]`);   
      o.push(`[${this.label_text}]`);//get rid of #
      o.push(`{${this.caption_text}}`);//already unmasked
      o.push('{%');
      o.push(text);
      o.push('}');
    } else {
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_vers(block){
    var {id,row1,row2,sig,data,para,base,subrow} = block;
    var o = [];
    o.push('\\blank');
    o.push('\\startlines')
    var text = data;
    text = text.map(x => this.unmask(x));
    o.push(text.join('\n'));
    o.push('\\stoplines');
    o.push('');
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

  solidify (s) {
    var ns = '';
    for( var c of s ) {
      if(c === ' '){
        ns += '&#160;';
      }else{
        ns += c;
      }
    }
    return ns;
  }

  escape (text) {
    var text = this.smooth(text);
    var text = this.fontifyLATEX(text);
    return text;
  }

  escapeTT (text) {
    var text = this.smoothTT(text);
    var text = this.fontifyLATEX(text);
    return text;
  }

  escape_solid(line) {
    line = this.replaceSubstrings(line,this.mymapsmpl);
    line = this.solidifyLeadingBackslashSpaces(line);
    line = this.fontifyLATEX(line);
    if (line.length == 0) {
      line = '\\ ';
    }
    return line;
  }

  escapeFramed(line) {
    line = this.replaceSubstrings(line,this.mymapsmpl);
    line = this.solidifyLeadingBackslashSpaces(line);
    line = this.fontifyLATEX(line,'12pt');
    if (line.length == 0) {
      line = '\\ ';
    }
    return line;
  }

  ruby (rb,rt) {
    var s = this.extractRubyItems(rb,rt);
    return `{\\switchtobodyfont[jp]${s}}`
  }

  ref (str) {
    for (var j=0; j < this.blocks.length; ++j) {
      var block = this.blocks[j];
      var {id,sig,label,saveas,idnum,more} = block;
      label = label||'';
      if(sig=='MATH'){
        if( str.localeCompare(label)===0) {
          return `\\in[${str}]`;
          break;
        }
        if(more&&more.length){
          for(let k=0; k < more.length; k++){
            let x = more[k];
            if(str.localeCompare(x.label)===0){
              return `\\in[${str}]`;
              break;
            }
          }
        }
      }else{
        if( str.localeCompare(label)===0) {
          return `{\\goto{${idnum}}[${label}]}`;
          break;
        }
      }
    }
    str = this.escape(str);
    return `{\\tt\\overstrike ${str}}`;
  }

  formulamath(str) {
    var s = this.tokenizer.parse(str);
    return `${s}`;
  }

  inlinemath(str) {
    var s = this.tokenizer.parse(str);
    return `\\math{${s}}`;
  }

  displaymath(str) {
    var s = this.tokenizer.parse(str,true);
    return `{\\startformula ${s} \\stopformula}`;
  }

  uri(href) {
    return `\\hyphenatedurl{${href}}`
  }

  /*
    return the styled inline text
  */
  style (type, text) {
    type = type || '';
    switch (type) {
      case 'code': {
        text = text.trim();
        return `\\type{${text}}`
        break;
      }
      case 'em': {
        text = text.trim();
        return `{\\it ${this.escape(text)}}`
        break;
      }
      case 'strong': {
        text = text.trim();
        return `{\\bf ${this.escape(text)}}`
        break;
      }
      case 'overstrike': {
        text = text.trim();
        return `{\\overstrike ${this.escape(text)}}`
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

  toContexDocument() {
    var config = this.config;
    var texlines = [];
    var my_chapters = [];

    ///insert \startcolumns and \stopcolumns

    for(var i=0; i < this.blocks.length; ++i){
      var block = this.blocks[i];
      var {sig,part,hdgn,latex} = block;
      if(this.config.CONTEX.twocolumns && sig=='HDGS' && hdgn==1){
        if(my_chapters.length){
          my_chapters.pop();
          texlines.push(`\\stopcolumns`);
        } 
        if(!part){
          ///this is a chapter
          my_chapters.push('chapter');
          texlines.push(`\\startcolumns[balance=no]`);
          texlines.push(latex);
        } else {
          texlines.push(latex);
        }
      } else {
        texlines.push(latex);
      }
    }
    if(this.config.CONTEX.twocolumns && my_chapters.length){
      my_chapters.pop();
      texlines.push(`\\stopcolumns`);
    }
  
    /// generate title page

    var titlelines = [];
    if(this.config.CONTEX.frontpage){
      var title = this.config.ALL.title||'Untitled';
      var author = this.config.ALL.author||'';
      var addr = '';
      var date = new Date().toLocaleDateString();
      titlelines.push(`\\dontleavehmode`);
      titlelines.push(`\\blank[6cm]`);
      titlelines.push(`\\startalignment[center]`);
      titlelines.push(`\\tfd ${this.escape(title)}`);
      titlelines.push(`\\stopalignment`);
      titlelines.push(`\\blank[2cm]`);
      titlelines.push(`\\startalignment[center]`);
      titlelines.push(`\\dontleavehmode`);
      titlelines.push(`\\tfb`);
      titlelines.push(`\\bTABLE`);
      titlelines.push(`\\setupTABLE[r][each][frame=off]`);
      titlelines.push(`\\bTR \\bTD ${this.escape(author)} \\eTD \\eTR`);
      titlelines.push(`\\bTR \\bTD ${this.escape(addr)}   \\eTD \\eTR`);
      titlelines.push(`\\bTR \\bTD ${this.escape(date)}   \\eTD \\eTR`);
      titlelines.push(`\\eTABLE`);
      titlelines.push(`\\stopalignment`);
      titlelines.push(`\\page`);
      titlelines.push('');
    }

    /// title lines

    var toclines = [];
    if(this.config.CONTEX.toc){
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

    /// configuration setting lines

    var configlines = this.toConfigLines();

    /// data

    var data = `\
% !TEX program = ConTeXt (LuaTeX)
${configlines.join('\n')}
\\setuppapersize[${config.CONTEX.papersize}]
\\setuppagenumbering[location={header,right},style=]
\\setuplayout
 [width=${config.CONTEX.width}mm,
  backspace=${config.CONTEX.backspace}mm,
  cutspace=${config.CONTEX.cutspace}mm,
  topspace=${config.CONTEX.topspace}mm,
  height=${config.CONTEX.height}mm,
  header=${config.CONTEX.header}mm,
  footer=${config.CONTEX.footer}mm]
\\setupindenting[yes,medium]
\\setscript[hanzi] % hyphenation
\\setuphead[part][number=no]
\\setuphead[chapter][style=${config.CONTEX.chapter},number=no]
\\setuphead[section][style=${config.CONTEX.section},number=no]
\\setuphead[subsection][style=${config.CONTEX.subsection},number=no]
\\setuphead[subsubsection][style=${config.CONTEX.subsubsection},number=no]
\\setuphead[subsubsubsection][style=${config.CONTEX.subsubsubsection},number=no]
\\setupinteraction[state=start,color=,contrastcolor=]
\\enableregime[utf] % enable unicode fonts
\\definefontfamily[cn][serif][arplsungtilgb]
\\definefontfamily[tw][serif][arplmingti2lbig5]
\\definefontfamily[jp][serif][ipaexmincho]
\\definefontfamily[kr][serif][baekmukbatang]
\\definemathcommand [arccot] [nolop] {\mfunction{arccot}}
\\definemathcommand [arsinh] [nolop] {\mfunction{arsinh}}
\\definemathcommand [arcosh] [nolop] {\mfunction{arcosh}}
\\definemathcommand [artanh] [nolop] {\mfunction{artanh}}
\\definemathcommand [arcoth] [nolop] {\mfunction{arcoth}}
\\definemathcommand [sech] [nolop] {\mfunction{sech}}
\\definemathcommand [csch] [nolop] {\mfunction{csch}}
\\definemathcommand [arcsec] [nolop] {\mfunction{arcsec}}
\\definemathcommand [arccsc] [nolop] {\mfunction{arccsc}}
\\definemathcommand [arsech] [nolop] {\mfunction{arsech}}
\\definemathcommand [arcsch] [nolop] {\mfunction{arcsch}}
\\usemodule[tikz]
\\usemodule[ruby]
\\setupcaptions[number=no,location=top]
\\setupbodyfont[${config.CONTEX.bodyfontsizept}pt]
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
  headstyle=bold, style=normal, align=flushleft, 
  alternative=hanging, width=fit, before=, after=]
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
\\starttext
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\stoptext
    `;
    return data;
  }

  insertTabularVlines(vlines,pp){
    if(vlines.indexOf('*')>=0) {
      return `|${pp.join('|')}|`;
    } else {
      var oo = [];
      for(var j=0; j < pp.length; ++j){
        if(vlines.indexOf(`${j}`)>=0) {
          oo.push('|');
          oo.push(pp[j]);
        } else {
          oo.push(pp[j]);
        }
      }
      if(vlines.indexOf(`${pp.length}`)>=0){
        oo.push('|');
      }
      return oo.join('');
    }
  }

  toLatexFontsize(fs){
    return this.tokenizer.toLatexFontsize(fs);
  }

  make_line(maths,label,mainlabel){
    maths = maths.map(x => this.formulamath(x));
    if(maths.length > 1){
      var line = maths.join(' \\NC ');
    } else {
      var line = maths.join(' \\NC ');
      var line = `${line} \\NC`;
    }
    if(label){
      line = `\\NC ${line} \\NR[${label}]`;
    } else if (mainlabel){
      line = `\\NC ${line} \\NR[+]`;
    } else {
      line = `\\NC ${line} \\NR`;
    }
    return line;
  }

  make_math(o,maths,label,more){
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
    o.push(`\\startformula \\startmathalignment[distance=2pt]`);
    var line = this.make_line(maths,label,label);
    o.push(line);
    if(more){
      for(let k=0; k < more.length; k++){
        let x = more[k];
        var line = this.make_line(x.maths,x.label,label);
        o.push(line);
      }
    }
    o.push(`\\stopmathalignment \\stopformula`);
    o.push('');
  }

  toDisplayMath(o,id,sig,row1,row2,data,isalignequalsign) {
    ///   \placeformula
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[]
    ///   \stopmathalignment \stopformula
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\startformula \\startmathalignment[n=2,distance=2pt]`);
      var ss = [];
      for(var bl of bls) {
        j++;
        var plus = '';
        var s0 = bl.join(' ');
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['',''];
          s[0] = v[1];
          s[1] = '= ' + v[2];
          s = s.map(x => this.formulamath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          s = s.map(x => this.formulamath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopmathalignment \\stopformula`);
      o.push('');
    }
    else {
      o.push(`\\startformula \\startmathalignment[n=1]`);
      var ss = [];
      for(var bl of bls) {
        j++;
        var plus = ''
        var s0 = bl.join(' ');
        var s0 = this.formulamath(s0);
        var s = s0;
        if (1) {
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopmathalignment \\stopformula`);
      o.push('');
    }
  }

  toEquation(o,id,sig,row1,row2,data,isalignequalsign) {
    ///   \placeformula
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[+]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[+]
    ///   \stopmathalignment \stopformula
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\placeformula`);
      o.push(`\\startformula \\startmathalignment[n=2,distance=2pt]`);
      var ss = [];
      for(var bl of bls) {
        j++;
        var plus = (j==1)?'+':'';
        var s0 = bl.join(' ');
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['',''];
          s[0] = v[1];
          s[1] = '= ' + v[2];
          s = s.map(x => this.formulamath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          s = s.map(x => this.formulamath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopmathalignment \\stopformula`);
      o.push('');
    }
    else {
      o.push(`\\placeformula`);
      o.push(`\\startformula \\startmathalignment[n=1]`);
      var ss = [];
      for(var bl of bls) {
        j++;
        var plus = (j==1)?'+':'';
        var s0 = bl.join(' ');
        var s0 = this.formulamath(s0);
        var s = s0;
        if (1) {
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopmathalignment \\stopformula`);
      o.push('');
    }
  }

  toEquations(o,id,sig,row1,row2,data,isalignequalsign) {
    ///   \placeformula
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[+]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[+]
    ///   \stopmathalignment \stopformula
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\placeformula`);
      o.push(`\\startformula \\startmathalignment[n=2,distance=2pt]`);
      var ss = [];
      for(var bl of bls) {
        var s0 = bl.join(' ');
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['',''];
          s[0] = v[1];
          s[1] = '= ' + v[2];
          s = s.map(x => this.formulamath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          s = s.map(x => this.formulamath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopmathalignment \\stopformula`);
      o.push('');
    }
    else {
      o.push(`\\placeformula`);
      o.push(`\\startformula \\startmathalignment[n=1]`);
      var ss = [];
      for(var bl of bls) {
        var s0 = bl.join(' ');
        var s0 = this.formulamath(s0);
        var s = s0;
        if (1) {
          var s = `\\NC ${s} \\NR[+]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopmathalignment \\stopformula`);
      o.push('');
    }
  }

  toSubequations(o,id,sig,row1,row2,data,isalignequalsign) {
    var bls = data;
    var j = 0;
    var star = '';
    ///   \placesubformula
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[+]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[+]
    ///   \stopmathalignment \stopformula
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\placesubformula`);
      o.push(`\\startformula \\startmathalignment[n=2,distance=2pt]`);
      var ss = [];
      for(var bl of bls) {
        j++;
        var subnum = this.toSubfigNum(j-1);
        var s0 = bl.join(' ');
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['',''];
          s[0] = v[1];
          s[1] = '= ' + v[2];
          s = s.map(x => this.formulamath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          s = s.map(x => this.formulamath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+][${subnum}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopmathalignment \\stopformula`);
      o.push('');
    }
    else {
      o.push(`\\placesubformula`);
      o.push(`\\startformula \\startmathalignment[n=1]`);
      var ss = [];
      for(var bl of bls) {
        j++;
        var subnum = this.toSubfigNum(j-1);
        var s0 = bl.join(' ');
        var s0 = this.formulamath(s0);
        var s = s0;
        if (1) {
          var s = `\\NC ${s} \\NR[+][${subnum}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopmathalignment \\stopformula`);
      o.push('');
    }
  }

  fontifyLATEX (text,fontsize) {
    fontsize=fontsize||'';
    const fontnames = ['jp','tw','cn','kr'];
    var newtext = '';
    var s0 = '';
    var fns0 = 0;
    var a0 = '';
    var fn0 = '';

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
        /// get the first font: assign 'k' according to the followin rules:
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

  polish(s,fs,pre){
    if(!pre){
      pre = 'tf'
    }
    if(s){
      if(fs){
        s= `{\\${pre}${fs}{}${s}}`;
      }
    }
    return s;
  }

  mpcolor(color) {
    return `\\MPcolor{${color}}`;
  }

  mpfontsize(fontsize) {
    /// current in CONTEXT it is not easy to change to a different fontsize
    /// when generating text in MP, so this method returns an empty string
    /// meaning we will just use the default font size, which is the body font.
    return '';
  }

  toContexLength(str) {
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

  toContextImageSrc(src){
    if(src.endsWith('.svg')){
      return src.slice(0,src.length-4) + '.png';
    } 
    return src;
  }

}

module.exports = { NitrilePreviewContex };
