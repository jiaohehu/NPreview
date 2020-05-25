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
      "\}" , "\\}"                 ,
      "-" , "-{}"
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

  do_part(block){
    var {id,row1,row2,sig,dept,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    var raw = text;
    var text = this.escape(text);
    o.push(`\\startpart[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
    if(this.config.CONTEX.pages){
      o.push(`\
\\dontleavehmode
\\blank[60mm]
\\startalignment[right]
\{\\bfb Part ${dept}}
\\stopalignment
\\blank[2mm]
\\startalignment[right]
\{\\bfd ${text}}
\\stopalignment
\\page
`);
      o.push('');
    } else {
      o.push(`\
\\startalignment[right]
\{\\bfb Part ${dept}}
\\stopalignment
\\blank[2mm]
\\startalignment[right]
\{\\bfd ${text}}
\\stopalignment
`);
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_hdgs(block){
    var {id,row1,row2,sig,part,level,sublevel,dept,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    if(part) {
      var text = data;
      var raw = text;
      var text = this.escape(text);
      o.push(`\\startpart[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
      if(this.config.CONTEX.pages){
        o.push(`\
\\dontleavehmode
\\blank[60mm]
\\startalignment[flushleft]
\{\\bfb Part ${dept}}
\\stopalignment
\\blank[2mm]
\\startalignment[flushleft]
\{\\bfd ${text}}
\\stopalignment
\\page
`);
        o.push('');
      } else {
        o.push(`\
\\startalignment[flushleft]
\{\\bfb Part ${dept}}
\\stopalignment
\\blank[2mm]
\\startalignment[flushleft]
\{\\bfd ${text}}
\\stopalignment
`);
      }
    } else {
      var text = data;
      var raw = text;
      var text = this.escape(text);
      switch (level) {
        case 0:
          if(this.config.CONTEX.pages){
            var title = this.config.title ? this.config.title : 'Untitled'
            var author = this.config.author ? this.config.author : ''
            var addr = '';
            var date = new Date().toLocaleDateString();
            o.push(`\
\\dontleavehmode
\\blank[6cm]
\\startalignment[center]
\\tfd ${this.escape(title)}
\\stopalignment
\\blank[2cm]
\\startalignment[center]
\\dontleavehmode
\\tfb
\\bTABLE
\\setupTABLE[r][each][frame=off]
\\bTR \\bTD ${this.escape(author)} \\eTD \\eTR
\\bTR \\bTD ${this.escape(addr)}   \\eTD \\eTR
\\bTR \\bTD ${this.escape(date)}   \\eTD \\eTR
\\eTABLE
\\stopalignment
\\page
`);
            o.push('');
          }else{
            o.push(`\\blank\\noindent{\\tfd ${text}}`);
            o.push(`\\blank`);
            o.push('');
          }
          break;
        case 1:
          if(this.config.CONTEX.pages){
            o.push(`\\startchapter[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
            o.push('');
          } else {
            o.push(`\\startsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
            o.push('');
          }
          break;
        case 2:
          if(this.config.CONTEX.pages){
            o.push(`\\startsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
            o.push('');
          } else {
            o.push(`\\startsubsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
            o.push('');
          }
          break;
        case 3:
          if(this.config.CONTEX.pages){
            o.push(`\\startsubsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
            o.push('');
          } else {
            o.push(`\\startsubsubsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
            o.push('');
          }
          break;
        case 4:
          o.push(`\\startsubsubsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
        default:
          o.push(`\\startsubsubsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
      }
    }
    block.latex = o.join('\n');
  }
  do_dlst(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    o.push(`%DLST`);
    o.push(`\\blank`);
    for (var item of data) {
      var [keys,text] = item;
      keys = keys.map( x => this.escape(x) );
      text = this.unmask(text);
      var key = keys.join('\\\\');
      o.push(`\\latexdesc{${key}} ${text} \\par`);
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_topi(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    o.push(`%TOPI`);
    o.push(`\\blank`);
    for (var item of data) {
      var keys = item;
      keys = keys.map( x => this.escape(x) );
      keys = keys.map( x => `\\bf{}${x}` );
      keys = keys.map( x => `\\noindent{${x}}` );
      o.push(keys.join('\\\\'));
    }
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_plst(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var bull0 = '';
    o.push('\\blank');
    for (var item of data) {
      var {bull,bullet,value,text,dt,sep} = item;
      bullet = bullet || '';
      text = text || '';
      if (bull==='OL'||bull==='UL') bull0 = bull;
      text = this.unmask(text);
      if(dt){
        dt = this.escape(dt);
        sep = this.escape(sep);
        sep = ' ~ ';
        text = `{\\it ${dt}}${sep}${text}`;
      }
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
  do_verb(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var text = data;
    var s = [];
    var ffamily = '';
    if (fencecmd.monospace) {
      ffamily = '\\tt';
    }
    if (this.xnumbers) {
      s.push(`\\starttabulate[|l|l|]`);
      s.push(`\\HL`);
      var linenum = 0;
      for (var k=0; k < text.length; ++k) {
        var line = text[k];
        var lines = [line];
        if (this.xwraplines > 0) {
          lines = this.wrapSample(lines,this.xwraplines);
        }
        var line = lines.shift();
        line = this.escapeSolid(line);
        var lineno = `${++linenum}`;
        lineno = this.escape(lineno);///this will have the fontsize configuratoin
        s.push(`\\NC {\\small ${lineno}} \\NC {${ffamily} ${line}} \\NC\\NR`);
        while (lines.length > 0) {
          var line = lines.shift();
          line = this.escapeSolid(line);
          s.push(`\\NC {} \\NC {${ffamily} ${line}} \\NC\\NR`);
        }
      }
      s.push(`\\HL`);
      s.push('\\stoptabulate');
    } else {
      s.push(`\\starttabulate[|l|]`);
      s.push(`\\HL`);
      for (var k=0; k < text.length; ++k) {
        var line = text[k];
        var lines = [line];
        if (this.xwraplines > 0) {
          lines = this.wrapSample(lines,this.xwraplines);
        }
        while (lines.length > 0) {
          var line = lines.shift();
          line = this.escapeSolid(line);
          s.push(`\\NC {${ffamily} ${line}} \\NC\\NR`);
        }
      }
      s.push(`\\HL`);
      s.push(`\\stoptabulate`);
    }
    text = s.join('\n');
    var o = [];
    if (this.xname === 'listing') {
      o.push(`%VERB`);
      o.push('\\blank\\noindent');
      o.push(`Listing ${this.xidnum} : ${this.caption_text}`);
      o.push(text);
      o.push('');
    } else {
      o.push(`%VERB`);
      o.push(text);
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_samp(block){
    var {id,row1,row2,sig,rmap,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    text = this.trimSampPara(text);
    o.push(`%SAMP`);
    if(fencecmd.style==1){
      text = this.trimSampPara(text);
      text = this.getMode1SampPara(text);
      text = text.map( x => this.escape(x) );
      text = text.map( x => this.rubify(x,rmap) );
      text = text.map(x => {
        if(!x){
          return '~';
        }
        if(fencecmd.monospace){
          return (`{\\tt ${x}}`);
        }else{
          return (`{${x}}`);
        }
      });
      text = text.join('\n');
      o.push(`\\setupnarrower[left=${fencecmd.left}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push(`\\startlines`);
      o.push(text);
      o.push(`\\stoplines`);
      o.push('\\stopnarrower');
      o.push('');
    }
    else{
      text = this.trimSampPara(text);
      text = text.map( x => this.escapeTT(x) );
      text = text.map( x => this.rubify(x,rmap) );
      text = text.map(x => {
        if(!x){
          return '~';
        }
        if(fencecmd.monospace){
          return (`{\\tt ${x}}`);
        }else{
          return (`{${x}}`);
        }
      });
      text = text.join('\n');
      o.push(`\\setupnarrower[left=${fencecmd.left}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push(`\\startlines`);
      o.push(text);
      o.push(`\\stoplines`);
      o.push('\\stopnarrower');
      o.push('');
    }
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_hrle(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
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
    var {id,row1,row2,sig,standalone,lead,leadn,data,para,fencecmd,base,subrow,fname} = block;
    var v;
    var o = [];
    var text = data;
    const indent = '~'.repeat(5);
    if(standalone){
      text = this.unmask(text);
      o.push(`\\setupnarrower[left=${fencecmd.left}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push(`\\blank\\noindent ${text}`);
      o.push(`\\stopnarrower`);
    }
    else if (leadn&&leadn>0) {
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
  do_sbdc(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    o.push('\\blank');
    o.push('\\startlines')
    var text = para;
    text = text.map(x => this.unmask(x));
    o.push(text.join('\n'));
    o.push('\\stoplines');
    o.push('');
    block.latex = o.join('\n');
  }
  do_quot(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    text = this.unmask(text);
    var text = `{${text}}`;
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push(`\\setupnarrower[left=${fencecmd.left}mm,right=${fencecmd.right}mm]`);
    o.push(`\\startnarrower[left,right]`)
    o.push('\\blank\\noindent');
    o.push(`${lq}${text}${rq}`);
    o.push(`\\stopnarrower`);
    o.push('\\blank');
    o.push('');
    block.latex = o.join('\n');
  }
  do_long(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var [rows,maxj,ww] = data;
    if (fencecmd.adjust) {
      ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
    }
    rows = rows.map ( row => {
      row = row.map(x => x.split('\n'));
      row = row.map(x => x.map(y => this.unmask(y)));
      row = row.map(x => x.join(' '));
      return row;
    });
    ///***NOTE: xltabular is percular of naming its columns
    var vlines = fencecmd.convlines;
    var hlines = fencecmd.conhlines;
    var vpadding = fencecmd.convpadding;
    var hpadding = fencecmd.conhpadding;
    var vlines = this.toArray(vlines);
    var hlines = this.toArray(hlines);
    var vpadding = parseInt(vpadding);
    var hpadding = parseInt(hpadding);
    var t = (vpadding>0)?vpadding:0;
    var h = (hpadding>0)?hpadding:0;
    var header = rows.shift();
    var header = header.map(x => `{\\bf ${x}}`);
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
    if (this.xname=='table') {
      o.push(`\\placefloat`);
      o.push(`[here]`);
      o.push(`[${this.xbaselabel}]`);
      o.push(`{Table ${this.xidnum} : ${this.caption_text}}`);
      o.push('{%');
      o.push(s.join('\n'));
      o.push('}');
      o.push('');
    } else {
      o.push(`\\blank`);
      o.push(s.join('\n'));
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_tabr(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var s = [];
    var maxj = data.length;
    var pcols = 'l'.repeat(maxj).split('');
    var vlines = fencecmd.convlines;
    var hlines = fencecmd.conhlines;
    var vpadding = parseInt(fencecmd.convpadding);
    var hpadding = parseInt(fencecmd.conhpadding);
    var hlines = this.toArray(hlines);
    var vlines = this.toArray(vlines);
    var pcol = this.insertTabularVlines(vlines,pcols);
    var ncols = data.length;
    var nrows = 0;
    /// find out the longest rows
    data.forEach(x => {
      var n = x.length;
      nrows = Math.max(n,nrows);
    });
    s.push(`\\starttabulate[|${pcols.join('|')}|]`);
    /// pp is a list of table cells of the current row j
    for(var j=0; j<nrows; ++j){
      var pp = data.map(x => x[j]||'');
      pp = pp.map(x => this.unmask(x));
      if(j==0){
        pp = pp.map(x => `{\\bf ${x}}`);
        s.push(`\\HL`);
        s.push(`\\NC ${pp.join(' \\NC ')} \\NC\\NR`);
        s.push(`\\HL`);
      } else {
        pp = pp.map(x => `{${x}}`);
        s.push(`\\TB[${vpadding}pt]`);
        s.push(`\\NC ${pp.join(' \\NC ')} \\NC\\NR`);
      }
    }
    s.push(`\\TB[${vpadding}pt]`);
    s.push(`\\HL`);
    s.push('\\stoptabulate');
    var text = s.join('\n');
    if (this.xname==='table') {
      o.push(`\\placefloat`);
      o.push(`[here]`);
      o.push(`[${this.xbaselabel}]`);
      o.push(`{Table ${this.xidnum} : ${this.caption_text}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
      o.push('');
    } else {
      o.push(`\\blank`);
      o.push(`\\placetable[force,none]{}{%`);
      o.push(text);
      o.push('}');
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_pict(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var s = [];
    for(var blk of data){
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
        s.push(`{\\externalfigure[${imgsrc}][width=${mywidth}]} {${sub_text}}`);
      }
      s.push(`\\stopcombination}}`);
    }
    var text = s.join('\n');
    if (this.xname==='figure') {
      o.push(`\\placefloat`);   
      o.push(`[here]`);   
      o.push(`[${this.xbaselabel}]`);
      o.push(`{Figure ${this.xidnum} : ${this.caption_text}}`);
      o.push('{');
      o.push(text);
      o.push('}');
      o.push('');
    } else {
      o.push('{');
      o.push(text);
      o.push('}');
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_tabb(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var ncols = data.length;
    var nrows = 0;
    data.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    var s = [];
    for (var j = 0; j < nrows; ++j) {
      var pp = data.map(x => x[j] || '');
      pp = pp.map(x => this.unmask(x));
      pp = pp.map(x => `{${x}}`);
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
    o.push(`\\setupnarrower[left=${fencecmd.left}mm,right=${fencecmd.right}mm]`);
    o.push(`\\startnarrower[left,right]`)
    o.push(`\\starttabulate[${pcol}]`);
    o.push(text);
    o.push(`\\stoptabulate`);
    o.push(`\\stopnarrower`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_diag(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    if (fencecmd.star) {
      (new NitrilePreviewDiagramMP(this)).def_pic(data);
    } else {
      var mp = new NitrilePreviewDiagramMP(this);
      var [text] = mp.parse(data);
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
      if (this.xname==='figure') {
        o.push(`\\placefloat`);   
        o.push(`[here]`);   
        o.push(`[${this.xbaselabel}]`);
        o.push(`{Figure ${this.xidnum} : ${this.caption_text}}`);
        o.push('{');
        o.push(text);
        o.push('}');
        o.push('');
      }else{
        o.push(text);
        o.push('');
      }
    }
    block.latex = o.join('\n');
  }
  do_math(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var name = fencecmd.name||'';
    o.push(`%MATH ${name}`);
    this.toMath(o,data,fencecmd);
    block.latex = o.join('\n');
  }
  do_frmd(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var n = data.length;
    var solid = '\\ '.repeat(80);
    o.push(`%FRMD`);
    o.push(`\\blank`);
    o.push(`\\startMPcode`);
    o.push(`numeric o; o := 12pt;`);
    ///This draw command is necessary to expand the bounding box of the 
    ///MetaPost vertically so that it is just as high as the number of
    ///lines. Removing it will likely cause the 
    ///rest of the MP code to stop compile.
    o.push(`draw (1*o,0)--(1*o,-${n-1}*o) withpen pencircle withcolor white;`);
    o.push(`label.rt(btex {\\tt ${solid}} etex, (0,0));`);
    data.forEach((x,i) => {
      x = this.escapeFramed(x);
      o.push(`label.rt(btex {\\tt ${x}} etex, (0,-${i}*o));`);
    });
    o.push(`numeric tw; tw := \\the\\textwidth;`);
    o.push(`numeric pw; pw := bbwidth(currentpicture);`);
    o.push(`numeric ratio; ratio := tw/pw;`);
    o.push(`currentpicture := currentpicture scaled ratio;`);
    o.push(`draw bbox currentpicture;`);
    o.push(`\\stopMPcode`);
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_vers(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
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

  /*
    escape the text
  */
  escape (text) {
    var text = this.smooth(text);
    var text = this.fontifyLATEX(text,this.xconfontsize);
    return text;
  }

  /*
    escape the text to be used with \ttfamily font
  */
  escapeTT (text) {
    var text = this.smoothTT(text);
    var text = this.fontifyLATEX(text,this.xconfontsize);
    return text;
  }

  ruby (rb,rt) {
    var s = this.extractRubyItems(rb,rt);
    return `{\\switchtobodyfont[jp]${s}}`
  }

  ref (str) {
    for (var j=0; j < this.blocks.length; ++j) {
      var block = this.blocks[j];
      var {id,fencecmd,saveas,idnum} = block;
      var baselabel = fencecmd.baselabel;
      if( str.localeCompare(baselabel)===0) {
        return `{\\goto{${idnum}}[${baselabel}]}`;
        break;
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
        return `{\\tt ${this.escape(text)}}`
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
    var texlines = this.blocks.map(x => x.latex);
    var mylines = this.toConfigLines();
    var title = config.title ? config.title : 'Untitled'
    var author = config.author ? config.author : ''
    var addr = '';
    var date = new Date().toLocaleDateString();
    var coverpage=`\
\\dontleavehmode
\\blank[6cm]
\\startalignment[center]
\\tfd ${this.escape(title)}
\\stopalignment
\\blank[2cm]
\\startalignment[center]
\\dontleavehmode
\\tfb
\\bTABLE
\\setupTABLE[r][each][frame=off]
\\bTR \\bTD ${this.escape(author)} \\eTD \\eTR
\\bTR \\bTD ${this.escape(addr)}   \\eTD \\eTR
\\bTR \\bTD ${this.escape(date)}   \\eTD \\eTR
\\eTABLE
\\stopalignment
\\page
  `;
    var data = `\
% !TEX program = ConTeXt (LuaTeX)
${mylines.join('\n')}
\\setuppapersize[${config.CONTEX.papersize}]
\\setuppagenumbering[location={header,right},style=\\bfa]
\\setuplayout
 [width=${config.CONTEX.width}mm,
  backspace=${config.CONTEX.backspace}mm,
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
alternative=hanging, 
width=fit, margin=${config.DLST.left}mm, before=, after=]
\\starttext
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

  toMath(o,data,fencecmd) {
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[]
    ///   \stopmathalignment \stopformula
    ///
    ///   \placeformula
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[+]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[]
    ///   \stopmathalignment \stopformula
    var s = [];
    var data = data.map( row => row.map((x,i) => {
        x = this.formulamath(x);
        return x;
    }));
    if(fencecmd.isalignequalsign){
      var data = data.map( row => row.join(' \\NC '));
    } else {
      var data = data.map( row => `${row[0]} \\NC `);
    }
    if(fencecmd.name=='equation'){
      var data = data.map( (row,i) => `\\NC ${row} \\NR[${(i==0)?'+':''}]` );
    }else{
      var data = data.map( (row,i) => `\\NC ${row} \\NR` );
    }
    data.unshift(`\\startformula \\startmathalignment[distance=2pt]`);
    data.push(`\\stopmathalignment \\stopformula`);
    if(fencecmd.name=='equation'){
      data.unshift(`\\placeformula`);
    }
    data.push('');
    o.push(data.join('\n'));
  }

  toDisplayMath(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
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

  toEquation(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
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

  toEquations(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
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

  toSubequations(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
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

  escapeSolid(line) {
    line = this.replaceSubstrings(line,this.mymapsmpl);
    line = this.solidifyLeadingBackslashSpaces(line);
    line = this.fontifyLATEX(line,this.xconfontsize);
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

  fontifyLATEX (text,confontsize) {
    ///
    /// fontify in the style of Latex
    ///

    const fontnames = ['jp','tw','cn','kr'];
    var newtext = '';
    var c0 = ''
    var s0 = '';
    var fns0 = 0;
    var a0 = '';

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
      }

      // flush ASCII text
      if(a0){
        if(this.iscaption){
          newtext += `${a0}`;
        } else if(!confontsize){
          newtext += `${a0}`;
        } else {
          newtext += `{\\switchtobodyfont[${confontsize}]{${a0}}}`;
        }
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
        var fn = fontnames[k];
        if (fn) {
          /// building up s0 by combining with previous 'c0' and 's0'
          var c0 = c0 + c;
          if(this.iscaption){
            var s0 = `{\\switchtobodyfont[${fn}]{${c0}}}`;
          } else if(!confontsize) {
            var s0 = `{\\switchtobodyfont[${fn}]{${c0}}}`;
          } else {
            var s0 = `{\\switchtobodyfont[${fn},${confontsize}]{${c0}}}`;
          }

          continue
        }
      }

      /// by the time we get here the 'c' is either a CJK that does
      //// not agree with previous character in terms of the same font;
      //// or 'c' is not a CJK at all.
      newtext += s0;
      fns0 = 0;
      c0 = '';
      s0 = '';

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
        var fn = fontnames[k];
        /// save the current font map infor for this char
        var fns0 = fns;
        var c0 = c;
        if(this.iscaption){
          var s0 = `{\\switchtobodyfont[${fn}]{${c0}}}`;
        } else if (!confontsize){
          var s0 = `{\\switchtobodyfont[${fn}]{${c0}}}`;
        } else {
          var s0 = `{\\switchtobodyfont[${fn},${confontsize}]{${c0}}}`;
        }
        continue;
      }

      /// we get here if the 'c' is not a CJK
      a0 += c; // add to a0

      //newtext += c;
    }

    if(a0){
      if(this.iscaption){
        newtext += `${a0}`;
      } else if(!confontsize){
        newtext += `${a0}`;
      } else {
        newtext += `{\\switchtobodyfont[${confontsize}]{${a0}}}`;
      }
    } else if (s0){
      newtext += s0;
    }
    return newtext;
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
