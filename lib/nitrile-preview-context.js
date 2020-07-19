'use babel';

const { NitrilePreviewDiagramMF } = require('./nitrile-preview-diagrammp');
const { NitrilePreviewCmath } = require('./nitrile-preview-cmath');
const { NitrilePreviewTranslator } = require('./nitrile-preview-translator');
const {fontmap, fontnames} = require('./nitrile-preview-fontmap');

class NitrilePreviewContext extends NitrilePreviewTranslator {

  constructor(name='CONTEX') {
    super(name);
    this.tokenizer = new NitrilePreviewCmath(this);
    this.diagram = new NitrilePreviewDiagramMF(this);
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
    this.mymapverb = [
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

  do_hdgs(block,conf){
    var o = [];
    var {id,row1,row2,sig,name,subn,hdgn,text} = block;
    o.push(this.to_info(block));
    var raw = text;
    var text = this.escape(text);
    ///note that 'subn' and 'hdgn' are guarrenteed to be
    //integers
    if(subn === undefined){
      var level=hdgn;
    }else{
      var level = subn + hdgn;
    }
    ///assign this so that it can be used by toLatexDocument().
    if(this.ismaster){
      if(name=='part'){
        o.push(`\\startpart[title={${text}},reference={${this.label_text}},bookmark={${raw}}]`);
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
        o.push('');
      }
      else if(level==0){
        o.push(`\\startchapter[title={${text}},reference={${this.label_text}},bookmark={${raw}}]`);
        o.push('');
      } 
      else if(level==1){
        o.push(`\\startsection[title={${text}},reference={${this.label_text}},bookmark={${raw}}]`);
        o.push('');
      } 
      else if(level==2){
        o.push(`\\startsubsection[title={${text}},reference={${this.label_text}},bookmark={${raw}}]`);
        o.push('');
      } 
      else {
        o.push(`\\startsubsubsection[title={${text}},reference={${this.label_text}},bookmark={${raw}}]`);
        o.push('');
      }
    }else{
      if(level==0){
        o.push(`\\blank\\noindent {\\tfd ${text}}`);
        o.push(`\\blank`);
        o.push('');
      }
      else if(level==1){
        o.push(`\\startsection[title={${text}},reference={${this.label_text}},bookmark={${raw}}]`);
        o.push('');
      } 
      else if(level==2){
        o.push(`\\startsubsection[title={${text}},reference={${this.label_text}},bookmark={${raw}}]`);
        o.push('');
      } 
      else {
        o.push(`\\startsubsubsection[title={${text}},reference={${this.label_text}},bookmark={${raw}}]`);
        o.push('');
      }
    }
    block.latex = o.join('\n');
  }
  do_dlst(block){
    var bull = String.fromCharCode(0x2022);
    bull = this.escape(bull);
    var o = [];
    var {id,row1,row2,sig,items,para,base,subrow} = block;
    o.push(this.to_info(block));
    o.push(`\\blank`);
    for (var item of items) {
      var {key,text,type,rb,rt} = item;
      text = this.unmask(text);
      text = text||`{}`;
      if(type=='text'){
        key = this.escape(key);
        o.push(`\\latexdesc{${bull} {\\bf{}${key}}} ${text} \\par`);
      }else if(type=='rmap'){
        key = `${rb}${String.fromCharCode('0xb7')}${rt}`;
        key = this.escape(key);
        o.push(`\\latexdesc{${bull} ${key}} ${text} \\par`);
      }else if(type=='math'){
        key = this.inlinemath(key);
        o.push(`\\latexdesc{${bull} ${key}} ${text} \\par`);
      }else if(type=='ruby'){
        if(rb&&rt){
          o.push(`\\latexdesc{${bull} \\switchtobodyfont[jp]{\\ruby{${rb}}{${rt}}}} ${text} \\par`);
        } else {
          o.push(`\\latexdesc{${bull} \\switchtobodyfont[jp]{${key}}} ${text} \\par`);
        }
      }else if(type=='quot'){
        key = this.escape(key);
        o.push(`\\latexdesc{${bull} \\quotation{${key}}} ${text} \\par`);
      }else if(type=='var'){
        key = this.escape(key);
        o.push(`\\latexdesc{${bull} {\\sl{}${key}}} ${text} \\par`);
      }else if(type=='code'){
        key = this.escape(key);
        o.push(`\\latexdesc{${bull} {\\tt{}${key}}} ${text} \\par`);
      }
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_nlst(block){
    var o = [];
    var {id,row1,row2,sig,items,para,base,subrow} = block;
    o.push(this.to_info(block));
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
        body = body.map( x => this.escape_tt(x) );
        body = body.map( x => this.polish_samp(x) );
        body = body.map( x => (x)?x:'~');
        body = body.map( x => `{\\tt ${x}}`);
        body = body.join('\n');
        o.push(`\\setupnarrower[left=${this.conf('step')}mm]`);
        o.push(`\\startnarrower[left]`);
        o.push(`\\startlines`);
        o.push(body);
        o.push(`\\stoplines`);
        o.push('\\stopnarrower');
        o.push('');
      }else if(type=='pass'){
        body = body.map( x => this.escape(x) );
        body = body.map( x => this.rubify(x) );
        body = body.map( x => this.polish_pass(x) );
        body = body.join('\n');
        o.push(`\\setupnarrower[left=${this.conf('step')}mm]`);
        o.push(`\\startnarrower[left]`);
        o.push(`\\startlines`);
        o.push(body);
        o.push(`\\stoplines`);
        o.push('\\stopnarrower');
        o.push('');
      }else if(type=='text'){
        o.push(`\\setupnarrower[left=${this.conf('step')}mm]`);
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
    var {id,row1,row2,sig,items,para,base,subrow} = block;
    o.push(this.to_info(block));
    o.push(`\\blank`);
    for (var item of items) {
      var {key,text} = item;
      key = this.unmask(key);
      text = this.unmask(text);
      if(text){
        o.push(`\\latexdesc{{\\bf{}${key}}} \\\\ ${text} \\par`);
      }else{
        o.push(`\\latexdesc{{\\bf{}${key}}} {} \\par`);
      }
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_plst(block){
    var o = [];
    var {id,row1,row2,sig,items,isbroad} = block;
    o.push(this.to_info(block));
    var bull0 = '';
    var packed=isbroad?'':'packed';
    o.push('\\blank');
    for (var item of items) {
      var {bull,lead,value,text} = item;
      text = text || '';
      if (bull==='OL'||bull==='UL') bull0 = bull;
      text = this.unmask(text);
      switch (bull) {
        case 'OL': {
          o.push(`\\startitemize[${packed},n]`);
          o.push(`\\sym {${value}} ${text}`);
          break;
        }
        case 'UL': {
          o.push(`\\startitemize[${packed}]`);
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
          if(lead){
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
          if(lead){
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
    var {id,row1,row2,sig,items} = block;
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
  _do_prog(block){
    var o = [];
    var {id,row1,row2,sig,body} = block;
    o.push(this.to_info(block));
    var text = body;
    var s = [];
    if(1){              
      s.push(`\\starttabulate[|l|l|]`);
    }else{
      s.push(`\\starttabulate[|l|]`);
    }
    s.push(`\\HL`);
    var linenum = 0;
    for (var k=0; k < text.length; ++k) {
      var line = text[k];
      var line = this.escape_verb(line);
      var line = this.polish_prog(line);
      if(1){              
        var lineno = `${++linenum}`;
        var lineno = this.polish_prog(lineno);
        s.push(`\\NC ${lineno} \\NC ${line} \\NC\\NR`);
      }else{
        s.push(`\\NC ${line} \\NC\\NR`);
      }
    }
    s.push(`\\HL`);
    s.push(`\\stoptabulate`);
    text = s.join('\n');
    o.push(`%VERB`);
    o.push('\\blank\\noindent');
    o.push(this.polish_caption(this.caption_text));
    o.push(text);
    o.push('');
    block.latex = o.join('\n');
  }
  do_prog(block){
    var o = [];
    var {id,row1,row2,sig,wide,body,caption,label,islabeled} = block;
    var n = 0;
    const maxn = parseInt(this.conf('maxn'));
    var cont = '';
    var mycaption = caption;
    var mylabel = label;
    while(n < body.length){
      if(1){
        var d = [];
        for(let i=0; i < maxn && n < body.length; ++i,++n){
          var line = body[n];
          var lineno = `${n+1}`;
          while(lineno.length < 5){
            lineno += '~';
          }
          var lineno = `{\\tt{}${lineno}}`;
          var line = this.escape_verb(line);
          var wholeline = `${lineno}${line}`;
          var wholeline = this.polish_prog(wholeline);
          d.push(`${wholeline}\\hfill\\\\`);
        };
      } 
      var text = d.join('\n');
      var mycaption = caption + cont;
      if(islabeled){
        o.push(`\\placefigure`);
        o.push(`[here]`);
        o.push(`[${mylabel}]`);
        o.push(`{${this.polish_caption(this.unmask(mycaption))}}`);
        o.push(`{%`);
        o.push(`\\startlines`);
        o.push(text);
        o.push(`\\stoplines`);
        o.push(`}`);
      }else if(o.length==0){
        o.push(`\\startlines`);
        o.push(text);
        o.push(`\\stoplines`);
      }else{
        o.pop();///remove the last \stoplines
        o.push(text);
        o.push(`\\stoplines`);
      }
      mylabel = '';//so that it is not used again for the second float
      cont = ' (Cont.)';
    }
    o.unshift(this.to_info(block));
    block.latex = o.join('\n');
  }
  do_samp(block){
    var o = [];
    var {id,row1,row2,sig,body} = block;
    o.push(this.to_info(block));
    body = body.map(x => this.escape_tt(x) );
    body = body.map(x => this.polish_samp(x) );
    body = body.map(x => (x)?x:'~');
    body = body.map(x => `{\\tt{}${x}}`);
    body = body.join('\n');
    o.push(`\\setupnarrower[left=${this.conf('step')}mm]`);
    o.push(`\\startnarrower[left]`);
    o.push(`\\startlines`);
    o.push(body);
    o.push(`\\stoplines`);
    o.push('\\stopnarrower');
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_pass(block){
    var o = [];
    var {id,row1,row2,sig,body} = block;
    o.push(this.to_info(block));
    body = body.map(x => this.escape(x) );
    body = body.map(x => this.rubify(x) );
    body = body.map(x => this.polish_pass(x) );
    body = body.map(x => (x)?x:'~');
    body = body.join('\n');
    o.push(`\\setupnarrower[left=${this.conf('step')}mm]`);
    o.push(`\\startnarrower[left]`);
    o.push(`\\startlines`);
    o.push(body);
    o.push(`\\stoplines`);
    o.push('\\stopnarrower');
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hrle(block){
    var o = [];
    var {id,row1,row2,sig,text} = block;
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
    var o = [];
    var {id,row1,row2,sig,leadn,lead,text} = block;
    o.push(this.to_info(block));
    var v;
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
    var o = [];
    var {id,row1,row2,sig,text} = block;
    o.push(this.to_info(block));
    text = this.unmask(text);
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push(`\\setupnarrower[left=${this.conf('step')}mm]`);
    o.push(`\\startnarrower[left]`)
    o.push('\\blank\\noindent');
    o.push(`${lq}${text}${rq}`);
    o.push(`\\stopnarrower`);
    o.push('\\blank');
    o.push('');
    block.latex = o.join('\n');
  }
  do_tabu(block){
    this.do_tabu_tabulate(block);
  }
  do_tabu_btable(block){
    var o = [];
    var {id,row1,row2,sig,cols} = block;
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
      pp = pp.map(x => this.escape_verb(x));
      pp = pp.map(x => this.polish_tabu(x));
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
    var o = [];
    var {id,row1,row2,wide,sig,cols,caption,label,islabeled} = block;
    o.push(this.to_info(block));
    var text = this.tabr_cols_to_tabulate(cols);
    if(islabeled){
      o.push(`\\placetable`);
      o.push(`[here]`);
      o.push(`[${label}]`);
      o.push(`{${this.polish_caption(this.unmask(caption))}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
    }else{
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_long(block){
    var o = [];
    var {id,row1,row2,sig,rows,ww} = block;
    o.push(this.to_info(block));
    var maxj = ww.length;
    rows = rows.map(row => row.map(x => this.unmask(x)));
    rows = rows.map((row,i) => row.map(x => (i==0)?this.polish_long_header(x):this.polish_long(x))); 
    ///***NOTE: xltabular is percular of naming its columns
    let [t,h] = this.convert_longpadding(this.conf('longpadding'));
    let vlines = this.toArray(this.conf('longvlines'));
    let hlines = this.toArray(this.conf('longhlines'));
    // let vlines = this.toArray('*');
    // let hlines = this.toArray('t m b r');
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
    this.needblank = 1;
  }
  do_tabb(block){
    var o = [];
    var {id,row1,row2,sig,rows,ww} = block;
    o.push(this.to_info(block));
    var maxj = ww.length;
    rows = rows.map(row => row.map(x => this.unmask(x)));
    rows = rows.map(row => row.map(x => this.polish_tabb(x))); 
    var d = [];
    /// turn off all frame and padding
    /// writing table
    for(var j=0; j < maxj; ++j){
      var dd = [];
      for( var row of rows ) {
        var s = row[j]||'';
        dd.push(s);
      }
      dd = dd.join('\n');
      dd = `\\startlines\n${dd}\n\\stoplines`;
      d.push(dd);
    }
    o.push(`\\blank`);
    o.push(`\\defineparagraphs[sidebyside][n=${maxj}]`);
    o.push(`\\startsidebyside`);
    o.push(d.join('\\sidebyside\n'));
    o.push(`\\stopsidebyside`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_pict(block){
    var o = [];
    var {id,row1,row2,sig,opts,images,caption,label,islabeled} = block;
    o.push(this.to_info(block));
    var d = [];
    var n = opts.grid||1;
    var m = Math.ceil(images.length/n);
    d.push(`{\\centeraligned{\\startcombination[${n}*${m}]`);
    for(var image of images){
      var {src,width,height,sub} = image;
      var imgsrc = this.toContextImageSrc(src);
      var sub_text = this.unmask(sub);
      sub_text = this.polish_caption(sub_text);
      ///calc frac 
      if(images.length == 1){
        var frac = 100;
      } else {
        var dist = this.conf('distance');
        var frac = (100-(images.length-1)*dist)/images.length;
      }
      ///to CONTEX length, such as 0.06\textwidth 
      var mywidth = this.toContexLength(`${frac}%`);
      let command = `\\externalfigure[${imgsrc}][width=${mywidth}]`;
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
      o.push(`{${this.polish_caption(this.unmask(caption))}}`);
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
    var o = [];
    var {id,row1,row2,sig,body,notes,caption,label,islabeled} = block; 
    o.push(this.to_info(block));
    var {s,xm,ym,unit} = this.diagram.toDiagram(body,notes);
    var d = [];
    d.push('\\startMPcode');
    d.push(`numeric textwidth; textwidth := \\the\\textwidth;`);
    d.push(`numeric pu; pu := textwidth/${xm};`);
    d.push(`numeric u; u := ${unit}mm;`);
    d.push(`numeric ratio; ratio := pu/u;`);
    d.push(`picture wheel;`);
    d.push(`wheel := image(`);
    d.push(s);
    d.push(`);`);
    d.push(`draw wheel scaled(ratio);`);
    d.push('\\stopMPcode');
    var text = d.join('\n');
    if(islabeled){
      o.push(`\\placefigure`);   
      o.push(`[here]`);   
      o.push(`[${label}]`);
      o.push(`{${this.polish_caption(this.unmask(caption))}}`);
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
    var o = [];
    var {id,row1,row2,sig,math,label,islabeled,more,gather} = block;
    o.push(this.to_info(block));
    this.make_math(o,math,label,islabeled,more,gather);
    o.push('');
    block.latex = o.join('\n');
  }
  do_frmd(block){
    var o = [];
    var {id,row1,row2,sig,body,caption,label,islabeled} = block;
    o.push(this.to_info(block));
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
      x = this.escape_frmd(x);
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
      o.push(`{${this.polish_caption(this.unmask(caption))}}`);
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
    var o = [];
    var {id,row1,row2,sig,data,para,base,subrow} = block;
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

  smooth (text) {
    return this.replaceSubstrings(text,this.mymap);
  }

  smooth_tt (text) {
    return this.replaceSubstrings(text,this.mymapcode);
  }

  smooth_verb(text) {
    return this.replaceSubstrings(text,this.mymapverb);
  }

  escape (text) {
    var text = this.smooth(text);
    var text = this.fontify_contex(text);
    return text;
  }

  escape_tt (text) {
    var text = this.smooth_tt(text);
    var text = this.fontify_contex(text);
    return text;
  }

  escape_verb(text) {
    text = this.smooth_verb(text);
    text = this.fontify_contex(text);
    if (text.length == 0) {
      text = '\\ ';
    }
    return text;
  }

  escape_frmd(text) {
    text = this.smooth_verb(text);
    text = this.fontify_contex(text,'12pt');
    if (text.length == 0) {
      text = '\\ ';
    }
    return text;
  }

  escape_diag(text) {
    var fs = this.conf('diagfontsizept');
    var fs = `${fs}pt`;
    text = this.smooth(text);
    text = this.fontify_contex(text,fs);
    return text;
  }

  ruby (rb,rt) {
    var s = this.to_ruby_item(rb,rt);
    return `{\\switchtobodyfont[jp]${s}}`
  }

  do_ref (sig,label,floatname,idnum){
    if(sig=='HDGS'){
      var secsign = String.fromCharCode(0xA7);
      return `${secsign}\\in[${label}]`;
    }
    else if(sig=='MATH'){
      var secsign = String.fromCharCode(0xA7);
      return `${secsign}(\\in[${label}])`;
    }
    if(floatname){  
      var secsign = String.fromCharCode(0xA7);
      return `\\in{${secsign}${floatname}}{~}[${label}]`;
    }
    return `{\\tt\\overstrike ${label}}`;
  }

  do_img (cnt) {
    return `\\externalfigure[${cnt}]`;
  }

  do_vbarchart (cnt) {
    var o = [];
    o.push('\\startMPcode');
    o.push(this.to_mp_vbarchart(cnt));
    o.push('\\stopMPcode');
    var s = o.join('\n');
    var s = `\\framed{${s}}`;
    return s;
  }

  do_xyplot (cnt) {
    var o = [];
    o.push('\\startMPcode');
    o.push(this.to_mp_xyplot(cnt));
    o.push('\\stopMPcode');
    var s = o.join('\n');
    var s = `\\framed{${s}}`;
    return s;
  }

  formulamath_array(str) {
    var d = this.tokenizer.toCmathArray(str);
    return d;
  }

  math_diag(text){
    var s = this.tokenizer.toCmath(text);
    var fs = this.conf('diagfontsizept');
    var s = `{\\switchtobodyfont[${fs}pt]${s}}`;
    return s;
  }

  inlinemath(str,dstyle) {
    var s = this.tokenizer.toCmath(str,dstyle);
    return `${s}`;
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
      case 'var': {
        text = text.trim();
        return `{\\sl ${this.escape(text)}}`
        break;
      }
      default: {
        return `{${this.escape(text)}}`
        break;
      }
    }
  }
  
  ///This is a temporary fix that the \ruby{}{}
  ///seems to be broken for CONTEX-Y2020 and does
  ///not compile
  to_ruby_item (base, top) {
    return base;
  }

  to_ruby_item_working_one (base, top) {
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

  toDocument() {
    var conflines = this.toConfigLines();
    if(this.xconfig.twocolumn){
      var texlines = this.to_twocolumn_texlines(this.xparser.blocks);
    } else {
      var texlines = this.xparser.blocks.map(x => x.latex);
    }
    /// generate title page
    var titlelines = [];
    var mytitle = this.conf('title');
    var myauthor = this.conf('author');
    var myaddr = '';
    var mydate = new Date().toLocaleDateString();
    if(mytitle){
      titlelines.push(`\\dontleavehmode`);
      titlelines.push(`\\blank[6cm]`);
      titlelines.push(`\\startalignment[center]`);
      titlelines.push(`\\tfd ${this.escape(mytitle)}`);
      titlelines.push(`\\stopalignment`);
      titlelines.push(`\\blank[2cm]`);
      titlelines.push(`\\startalignment[center]`);
      titlelines.push(`\\dontleavehmode`);
      titlelines.push(`\\tfb`);
      titlelines.push(`\\bTABLE`);
      titlelines.push(`\\setupTABLE[r][each][frame=off]`);
      titlelines.push(`\\bTR \\bTD ${this.escape(myauthor)} \\eTD \\eTR`);
      titlelines.push(`\\bTR \\bTD ${this.escape(myaddr)}   \\eTD \\eTR`);
      titlelines.push(`\\bTR \\bTD ${this.escape(mydate)}   \\eTD \\eTR`);
      titlelines.push(`\\eTABLE`);
      titlelines.push(`\\stopalignment`);
      titlelines.push(`\\page`);
      titlelines.push('');
    }

    /// toc lines
    var toclines = [];
    if(this.conf('toc')){
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
    var dist = this.conf('distance')/100;
    //var hdist = istwocol ? `${dist*2}\\textwidth` : `${dist}\\textwidth`;
    var hdist = `${dist}\\textwidth`;

    /// data

    var data = `\
% !TEX program = ConTeXt (LuaTeX)
${conflines.join('\n')}
\\enabletrackers[fonts.missing]
\\setuppapersize[${this.conf('papersize')}]
\\setuppagenumbering[location={header,right},style=]
\\setuplayout
 [width=${this.conf('width')}mm,
  backspace=${this.conf('backspace')}mm,
  cutspace=${this.conf('cutspace')}mm,
  topspace=${this.conf('topspace')}mm,
  height=${this.conf('height')}mm,
  header=${this.conf('header')}mm,
  footer=${this.conf('footer')}mm]
\\setupindenting[yes,medium]
\\setscript[hanzi] % hyphenation
\\setuphead[part][number=yes]
\\setuphead[chapter][style=${this.conf('chapter')},number=yes]
\\setuphead[section][style=${this.conf('section')},number=yes]
\\setuphead[subsection][style=${this.conf('subsection')},number=yes]
\\setuphead[subsubsection][style=${this.conf('subsubsection')},number=yes]
\\setuphead[subsubsubsection][style=${this.conf('subsubsubsection')},number=yes]
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
\\usemodule[tikz]
\\usemodule[ruby]
\\setupcaptions[minwidth=\\textwidth, align=middle, location=top]
\\setupbodyfont[linuxlibertineo,${this.conf('bodyfontsizept')}pt]
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
    var lines = this.formulamath_array(math);
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
    var lines = this.formulamath_array(math);
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
    var line = this.make_line(math,label,islabeled);
    o.push(line);
    more.forEach(x => {
      var line = this.make_line(x.math,x.label,islabeled);
      o.push(line);
    });
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

  fontify_contex (text,fontsize) {
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

  polish_caption(s){
    return this.polish(s,this.conf('nicaption'));
  }
  polish_pass(s){
    return this.polish(s,this.conf('nipass'));
  }
  polish_samp(s){
    return this.polish(s,this.conf('nisamp'));
  }
  polish_tabr(s){
    return this.polish(s,this.conf('nitabr'));
  }
  polish_tabr_header(s){
    return this.polish(s,this.conf('nitabr'),'bf');
  }
  polish_long(s){
    return this.polish(s,this.conf('nilong'));
  }
  polish_long_header(s){
    return this.polish(s,this.conf('nilong'),'bf');
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

  to_info(block) {
    var { subf, name, subn, dept, hdgn, title, sig, row1, row2 } = block;
    subf = subf || '';
    name = name || '';
    subn = subn || '';
    dept = dept || '';
    title = title || '';
    sig = sig || '';
    row1 = row1 || 0;
    row2 = row2 || 0;
    hdgn = hdgn || 0;
    return (`%${sig}:${hdgn} {subf:${subf}} {name:${name}${subn}} {dept:${dept}} {title:${title}} {row:${row1}:${row2}}`);
  }

  convert_longpadding(text){
    // given a string such as "2" return [2,2]
    // given a string such as "2 3" return [2,3]
    var v = this.toIntArray(text);
    if(v.length == 1){
      return [v[0],v[0]];
    } else if(v.length==0){
      return [0,0];
    } else {
      return [v[0],v[1]];
    }
  }

  tabr_cols_to_tabulate(cols) {
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
    s.push(`\\starttabulate[${pcol}]`);
    s.push(`\\HL`);
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      if(j==0){
        var kk = pp.map(x => x.split('\\\\'));
        var nn = kk.map(x => x.length);
        var maxn = nn.reduce((maxn, n) => Math.max(maxn, n));
        for (var n = 0; n < maxn; ++n) {
          pp = kk.map(x => x[n] || '');
          pp = pp.map(x => this.unmask(x));
          pp = pp.map(x => this.polish_tabr_header(x));
          s.push(`\\NC ${pp.join(' \\NC ')} \\NR`);
        }
        s.push(`\\HL`);
        continue;
      }
      pp = pp.map(x => this.unmask(x));
      pp = pp.map(x => this.polish_tabr(x));
      s.push(`\\NC ${pp.join(' \\NC ')} \\NR`);
    }
    s.push('\\HL');
    s.push('\\stoptabulate');
    return s.join('\n');
  }

  cols_to_btable(cols) {
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
        var kk = kk.map(k => k.map(x => this.polish_tabr_header(x)));
        var pp = kk.map(k => k.join('\\\\'));        
        s.push(`\\bTR \\bTH ${pp.join(' \\eTH \\bTH ')} \\eTH \\eTR`);
        s.push(`\\eTABLEhead`);
        s.push(`\\bTABLEbody`);
      }
      else {
        var pp = cols.map(x => x[j] || '');
        pp = pp.map(x => this.escape_verb(x));
        pp = pp.map(x => this.polish_tabu(x));
        s.push(`\\bTR \\bTH ${pp.join(' \\eTH \\bTH ')} \\eTH \\eTR`);
      }
    }
    s.push(`\\eTABLEbody`);
    s.push(`\\eTABLE`);
    return s.join('\n');
  }


  do_tabu_tabulate(block){
    var o = [];
    var {id,row1,row2,sig,cols} = block;
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
    s.push(`\\setupnarrower[left=${this.conf('step')}mm]`);
    s.push(`\\startnarrower[left]`)
    s.push(`\\starttabulate[${pcol}]`);
    for (var j = 0; j < nrows; ++j) {
      var pp = cols.map(x => x[j] || '');
      pp = pp.map(x => this.escape_verb(x));
      pp = pp.map(x => this.polish_tabu(x));
      s.push(`\\NC ${pp.join(' \\NC ')} \\NR`);
    }
    s.push(`\\stoptabulate`);
    s.push(`\\stopnarrower`)
    var text = s.join('\n');
    o.push(`\\blank`);
    o.push(text);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }

  do_tabb_btable(block){
    var o = [];
    var {id,row1,row2,sig,rows,ww} = block;
    o.push(this.to_info(block));
    var ncols = ww.length;
    rows = rows.map(row => row.map(x => this.unmask(x)));
    rows = rows.map((row,i) => row.map(x => this.polish_tabb(x))); 
    ///***NOTE: xltabular is percular of naming its columns
    var s = [];
    /// adjust for the relative width
    ww = this.wwToOne(ww);
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

  conf(key){
    return this.xconfig[key];
  }

}

module.exports = { NitrilePreviewContext };