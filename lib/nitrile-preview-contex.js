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
    this.haschapter = false;
    this.tokenizer = new NitrilePreviewCmath(this);
    this.mymap = [
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
      "#"  , "\\#"                 ,
      "&"  , "\\&"                 ,
      "_"  , "\\_"                 ,
      "%"  , "\\%"                 ,
      "\{" , "\\{"                 ,
      "\}" , "\\}"
    ];
    this.mymapsmpl = [
      C_textrightarrow, "\\textrightarrow{}",
      " "  , "\\ "                 ,
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
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
      "#"  , "\\#"                 ,
      "&"  , "\\&"                 ,
      "_"  , "\\_"                 ,
      "%"  , "\\%"                 ,
      "\{" , "\\{"                 ,
      "\}" , "\\}"
    ];
  }

  do_part(block){
    var {id,row1,row2,sig,dept,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    var raw = this.smooth(text);
    var text = this.escape(text);
    o.push(`\\startpart[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
    o.push(`\
\\dontleavehmode
\\blank[6cm]
\\startalignment[right]
\{\\bfa Part ${dept}.}
\\stopalignment
\\blank[1cm]
\\startalignment[right]
\{\\bfd ${text}}
\\stopalignment
\\page`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_hdgs(block){
    var {id,row1,row2,sig,level,sublevel,dept,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    var raw = this.smooth(text);
    var text = this.escape(text);
    if (!this.haschapter) {
      switch (level) {
        case 0:
          break;///this needs to be ignore specifically otherwise it
                ///will show through 'default'
        case 1:
          o.push(`\\startsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
        case 2:
          o.push(`\\startsubsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
        case 3:
          o.push(`\\startsubsubsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
        default:
          o.push(`\\startsubsubsubject[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
      }
    } else {
      switch (level) {
        case 0:
          break;///this needs to be ignore specifically otherwise it
                ///will show through 'default'
        case 1:
          o.push(`\\startchapter[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
        case 2:
          o.push(`\\startsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
        case 3:
          o.push(`\\startsubsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
        case 4:
          o.push(`\\startsubsubsection[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
        default:
          o.push(`\\startsubsubsubject[title={${dept}~~${text}},reference={${this.xbaselabel}},bookmark={${dept} ${raw}}]`);
          o.push('');
          break;
      }
    }
    block.latex = o.join('\n');
  }
  do_dlst(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    o.push(`\\blank`);
    for (var item of data) {
      var [keys,text] = item;
      keys = keys.map( x => this.escape(x) );
      text = this.unmask(text);
      keys = keys.map( x => `\\bf{}${x}` );
      keys = keys.map( x => `\\noindent{${x}}` );
      o.push(keys.join('\\\\'));
      o.push(`\\setupnarrower[left=${fencecmd.left}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push(text);
      o.push(`\\stopnarrower`);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_plst(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var lead0 = '';
    o.push('\\blank');
    for (var item of data) {
      var [lead,bullet,text] = item;
      bullet = bullet || '';
      text = text || '';
      if (lead==='OL'||lead==='UL') lead0 = lead;
      if (lead0 === 'OL') {
        var value = bullet;
      } else {
        var value = '';
      }
      text = this.unmask(text);
      if (item.length === 3) {
        switch (lead) {
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
            if (value) {
              o.push(`\\sym {${value}} ${text}`);
            } else {
              o.push(`\\item ${text}`);
            }
            break;
          }
          case '/UL': {
            o.push(`\\stopitemize`);
            if (value) {
              o.push(`\\sym {${value}} ${text}`);
            } else {
              o.push(`\\item ${text}`);
            }
            break;
          }
        }
      } else {
        if (lead === '/OL') {
          o.push('\\stopitemize');
        } else if (lead === '/UL') {
          o.push('\\stopitemize');
        }
      }
    }
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
      var linenum = 0;
      for (var k=0; k < text.length; ++k) {
        var line = text[k];
        var lines = [line];
        if (this.xwraplines > 0) {
          lines = this.wrapSample(lines,this.xwraplines);
        }
        var line = lines.shift();
        line = this.escapeSolid(line);
        s.push(`\\NC {\\tfxx ${++linenum}} \\NC {${ffamily}${this.xconfontsize} ${line}} \\NC\\NR`);
        while (lines.length > 0) {
          var line = lines.shift();
          line = this.escapeSolid(line);
          s.push(`\\NC {} \\NC {${ffamily}${this.xconfontsize} ${line}} \\NC\\NR`);
        }
      }
      s.push('\\stoptabulate');
    } else {
      s.push(`\\starttabulate[|l|]`);
      for (var k=0; k < text.length; ++k) {
        var line = text[k];
        var lines = [line];
        if (this.xwraplines > 0) {
          lines = this.wrapSample(lines,this.xwraplines);
        }
        while (lines.length > 0) {
          var line = lines.shift();
          line = this.escapeSolid(line);
          s.push(`\\NC {${ffamily}${this.xconfontsize} ${line}} \\NC\\NR`);
        }
      }
      s.push(`\\stoptabulate`);
    }
    text = s.join('\n');
    var o = [];
    if (this.xname === 'listing') {
      o.push('\\blank\\noindent');
      o.push(`Listing ${this.xidnum} : ${this.caption_text}`);
      o.push(text);
      o.push('');
    } else {
      o.push('\\blank\\noindent');
      o.push(text);
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_item(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    o.push(`\\setupnarrower[left=${fencecmd.left}mm]`);
    o.push(`\\startnarrower[left]`);
    o.push(`\\blank\\noindent`);
    text = this.unmask(text);
    o.push(text);
    o.push(`\\stopnarrower`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_samp(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    o.push(`%SAMP`);
    if (this.xsamptype===0) {
      text = text.map( x => this.escapeSolid(x) );
      text = text.map( x => `\\NC {\\tt${this.xconfontsize} ${x}} \\NC\\NR` );
      o.push(`\\setupnarrower[left=${fencecmd.left}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push(`\\starttabulate[|l|]`);
      o.push(text.join('\n'));
      o.push(`\\stoptabulate`);
      o.push('\\stopnarrower');
      o.push('');
    }
    else if (this.xsamptype===1) {
      text = this.joinBackslashedLines(text);
      text = text.map( x => this.unmask(x) );
      text = text.map( x => (x.length>0)?x:'~' );
      text = text.map( x => `{${this.xconfontsize} ${x}}` );
      text = text.join('\\\\\n');
      o.push(`\\setupnarrower[left=${fencecmd.left}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push(`\\blank\\noindent`);
      o.push(text);
      o.push('\\stopnarrower');
      o.push('');
    } 
    else if (this.xsamptype===2||this.xsamptype===3) {
      text = this.joinBackslashedLines(text);
      text = text.map( x => this.unmask(x) );
      text = text.map( x => `{${this.xconfontsize} ${x}}` );
      text = text.join('\\\\');
      text = `\\item ${text}`;
      o.push(`\\setupnarrower[left=${fencecmd.left}mm]`);
      o.push(`\\startnarrower[left]`);
      o.push(`\\blank\\noindent`);
      o.push(`\\startitemize[packed]`);
      o.push(text);
      o.push(`\\stopitemize`);
      o.push(`\\stopnarrower`);
      o.push('');
    }
    block.latex = o.join('\n');
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
    var {id,row1,row2,sig,lead,leadn,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    text = this.unmask(text);
    if (leadn&&leadn>0) {
      lead = this.escape(lead);
      if (leadn===1) {
        const indent = '';
        text = `${indent}{\\bf{}${lead}} ~ ${text}`;
        o.push(`\\blank\\noindent{}${text}`);
      } 
      else if (leadn===2) {
        const indent = '';
        text = `${indent}{\\bi{}${lead}} ~ ${text}`;
        o.push(`\\blank\\noindent{}${text}`);
      } 
      else {
        const indent = '~'.repeat(5);
        text = `${indent}{\\bi{}${lead}} ~ ${text}`;
        o.push(`\\blank\\noindent{}${text}`);
      }
    } else {
      if (this.textblockcount===1) {
        text = `\\blank\\noindent{}${text}`;
      }
      o.push(text);
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_incl(block){
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
    var text = this.unmask(text);
    var text = `{${this.xconfontsize} ${text}}`;
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push(`\\setupnarrower[left=${fencecmd.left}mm,right=${fencecmd.right}mm]`);
    o.push(`\\startnarrower[left,right]`)
    o.push('\\blank\\noindent');
    o.push(`${lq}${text}${rq}`);
    o.push(`\\stopnarrower`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_tblr(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var [rows,maxj,ww] = data;
      ///***NOTE: do not need to adjust ww as tabulary
      ///adjust table columns automatically
      ///However, it still support \newline macro
    rows = rows.map ( row => {
      row = row.map(x => x.split('\n'));
      row = row.map(x => x.map(y => this.unmask(y)));
      row = row.map(x => x.join(' '));
      return row;
    });
    var pcols = 'l'.repeat(maxj).split('');
    var vlines = fencecmd.vlines;
    var hlines = fencecmd.hlines;
    var vlines = this.toArray(vlines);
    var hlines = this.toArray(hlines);
    var vlines = vlines.map(v => parseInt(v));
    var vpadding = parseInt(fencecmd.vpadding);
    var pcol = this.insertTabularVlines(vlines,pcols);
    var header = rows.shift();
    var header = header.map(x => `{${this.xconfontsize}\\bf ${x}}`);
    if (1) {
      ///buid table into 's'
      var s = [];
      s.push(`\\starttabulate[|${pcols.join('|')}|]`);
      s.push(`\\HL`);
      s.push(`\\NC ${header.join(' \\NC ')} \\NC\\NR`);
      s.push(`\\HL`);
      for(var row of rows) {
        row = row.map(x => `{${this.xconfontsize} ${x}}`);
        s.push(`\\TB[${vpadding}pt]`);
        s.push(`\\NC ${row.join(' \\NC ')} \\NC\\NR`);
      }
      s.push(`\\TB[${vpadding}pt]`);
      s.push(`\\HL`);
      s.push('\\stoptabulate');
    }
    if (this.xname==='table') {
      o.push(`\\blank`);
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
      o.push(`\\placetable[force,none]{}{%`);
      o.push(s.join('\n'));
      o.push('}');
      o.push('');
    }
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
    var vlines = fencecmd.vlines;
    var hlines = fencecmd.hlines;
    var vlines = this.toArray(vlines);
    var hlines = this.toArray(hlines);
    var vlines = vlines.map(v => parseInt(v));
    var vpadding = fencecmd.vpadding;
    var vpadding = parseInt(vpadding);
    var hpadding = fencecmd.hpadding;
    var hpadding = parseInt(hpadding);
    var t = (vpadding>0)?vpadding:0;
    var h = (hpadding>0)?hpadding:0;
    var header = rows.shift();
    var header = header.map(x => `{${this.xconfontsize}\\bf ${x}}`);
    var s = [];
    /// adjust for the relative width
    ww = this.wwToOne(ww);
    var pp = ww.map((x,i) => `\\setupTABLE[c][${i+1}][width=${x}\\textwidth]`);
    s.push(pp.join('\n'));
    /// adjust for the vlines
    s.push(`\\setupTABLE[frame=off]`);
    s.push(`\\setupTABLE[r][first][topframe=${(hlines.indexOf('t')>=0)?'on':'off'}]`);
    s.push(`\\setupTABLE[r][first][bottomframe=${(hlines.indexOf('m')>=0)?'on':'off'}]`);
    s.push(`\\setupTABLE[r][last][bottomframe=${(hlines.indexOf('b')>=0)?'on':'off'}]`);
    s.push(`\\setupTABLE[r][each][bottomframe=${(hlines.indexOf('r')>=0)?'on':'off'}]`);
    /// writing table
    s.push(`\\bTABLE[loffset=${h}pt,roffset=${h}pt,toffset=${t}pt,boffset=${t}pt,split=repeat,option=stretch]`);
    s.push(`\\bTABLEhead`);
    s.push(`\\bTR \\bTH ${header.join(' \\eTH \\bTH ')} \\eTH \\eTR`);
    s.push(`\\eTABLEhead`);
    s.push(`\\bTABLEbody`);
    for( var row of rows ) {
      row = row.map(x => `{${this.xconfontsize} ${x}}`);
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
  do_imgs(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];

    if (this.xname==='figure') {
      o.push(`\\placefloat`);   
      o.push(`[here]`);   
      o.push(`[${this.xbaselabel}]`);
      o.push(`{Figure ${this.xidnum} : ${this.caption_text}}`);
      o.push('{');
      for(var blk of data){
        o.push(`{\\centeraligned{\\startcombination[${blk.length}*1]`);
        var n = blk.length;
        for(var img of blk){
          const {srcs,opts,sub} = img;
          var width = this.toContexLength(opts.width);
          var height = this.toContexLength(opts.height);
          var sub_text = this.unmask(sub);
          if (!width) {
            width = this.toContexLength(`${100/n}%`);
          }
          o.push(`{\\externalfigure[${srcs[0]}][width=${width},height=${height}]} {${sub_text}}`);
        }
        o.push(`\\stopcombination}}`);
      }
      o.push('}');
      o.push('');
    } else {
      o.push('{');
      for(var blk of data){
        o.push(`{\\centeraligned{\\startcombination[${blk.length}*1]`);
        var n = blk.length;
        for(var img of blk){
          const {srcs,opts,sub} = img;
          var width = this.toContexLength(opts.width);
          var height = this.toContexLength(opts.height);
          var sub_text = this.unmask(sub);
          if (!width) {
            width = this.toContexLength(`${100/n}%`);
          }
          o.push(`{\\externalfigure[${srcs[0]}][width=${width},height=${height}]} {${sub_text}}`);
        }
        o.push(`\\stopcombination}}`);
      }
      o.push('}');
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_tabb(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var ncols = data.length;
    var nrows = 0;
    data.forEach(x => {
      var n = x.length;
      nrows = Math.max(n, nrows);
    });
    o.push(`\\blank`);
    o.push(`\\bTABLE[split=yes,option=stretch,frame=no]`);
    var s = [];
    for (var j = 0; j < nrows; ++j) {
      var pp = data.map(x => x[j] || '');
      pp = pp.map(x => this.unmask(x));
      pp = pp.map(x => `\\bTD ${x} \\eTD`);
      var p = pp.join('');
      p = `\\bTR ${p} \\eTR`;
      s.push(p);
    }
    var text = s.join('\n');
    o.push(`\\bTABLEbody`);
    o.push(text);
    o.push(`\\eTABLEbody`);
    o.push(`\\eTABLE`);
    o.push('');
    block.latex = o.join('\n');
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
      o.push('\\startMPcode');
      o.push(`numeric textwidth; textwidth := \\the\\textwidth;`);
      o.push(`numeric pu; pu := textwidth/${xm};`);
      o.push(`numeric u; u := ${unit}mm;`);
      o.push(`numeric ratio; ratio := pu/u;`);
      o.push(`picture wheel;`);
      o.push(`wheel := image(`);
      o.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
      o.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
      o.push(text);
      o.push(`);`);
      o.push(`draw wheel scaled(ratio);`);
      o.push('\\stopMPcode');
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_math(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var name = fencecmd.name;
    var isalignequalsign = fencecmd.isalignequalsign;
    o.push(`%MATH ${name} ${isalignequalsign}`);
    name = name||'';
    name = name.toLowerCase();
    if (name === 'equations') {
      this.toEquations(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign);
    } 
    else if (name === 'subequations') {
      this.toSubequations(o,id,sig,fname,row1,row2,data,fencecmd);
    } 
    else if (name === 'equation') {
      this.toEquation(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign);
    } 
    else {
      this.toDisplayMath(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign);
    }
    block.latex = o.join('\n');
  }
  do_frmd(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    var text = text.map( x => this.escapeSolid(x) );
    var text = text.map((x,i) => `label.rt(btex {${x}} etex, (5,-${i}*o));`);
    var solid = '~'.repeat(80);
    o.push(`\\blank`);
    o.push(`\\defineMPinstance[tt][metafun][textstyle=tt]`);
    o.push(`\\startMPcode{tt}`);
    o.push(`numeric o; o := BodyFontSize;`);
    o.push(`picture p; p := image(`);
    o.push(`label.rt(btex {${solid}} etex, (5,0));`);
    o.push(text.join('\n'));
    o.push(`);`);
    o.push(`textwidth := \\the\\textwidth;`);
    o.push(`numeric w; w :=  bbwidth(p);`);
    o.push(`draw p scaled(textwidth/w);`);
    o.push(`\\stopMPcode`);
    o.push('');
    block.latex = o.join('\n');
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
    return `{\\switchtobodyfont[jp]\\ruby{${rb}}{${rt}}}`
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
    return `{\\tt ${str}}`;
  }

  inlinemath(str) {
    var s = this.tokenizer.parse(str);
    return `\\math{${s}}`;
  }

  /*
    return the styled inline text
  */
  style (type, text) {
    type = type || '';
    switch (type) {
      case 'code': {
        return `{\\tt ${this.escape(text)}}`
        break;
      }
      case 'em': {
        return `{\\it ${this.escape(text)}}`
        break;
      }
      case 'strong': {
        return `{\\bf ${this.escape(text)}}`
        break;
      }
      case 'overstrike': {
        return `{\\overstrike ${this.escape(text)}}`
        break;
      }
      case 'uri': {
        const [cnt,href] = text;
        if (cnt) {
          return `${this.escape(cnt)} (\\hyphenatedurl{${href}})`
        } else {
          return `\\hyphenatedurl{${href}}`
        }
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
\\ssd ${title}
\\stopalignment
\\blank[10cm]
\\startalignment[flushright]
\\dontleavehmode
\\ssb
\\bTABLE
\\setupTABLE[r][each][frame=off]
\\bTR \\bTD ${author} \\eTD \\eTR
\\bTR \\bTD ${addr}   \\eTD \\eTR
\\bTR \\bTD ${date}   \\eTD \\eTR
\\eTABLE
\\stopalignment
\\page
  `;
    var data = `\
% !TEX program = ConTeXt (LuaTeX)
${mylines.join('\n')}
\\setuppapersize[${config.CONTEX.papersize}]
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
\\setupcaptions[number=no]
\\setuppagenumbering[location=footer]
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
\\starttext
${(config.CONTEX.coverpage)?coverpage:''}
${texlines.join('\n')}
\\stoptext
    `;
    return data;
  }

  insertTabularVlines(vlines,pp){
    var oo = [];
    for(var j=0; j < pp.length; ++j){
      if(vlines.indexOf(j)>=0) {
        oo.push('|');
        oo.push(pp[j]);
      } else {
        oo.push(pp[j]);
      }
    }
    if(vlines.indexOf(pp.length)>=0){
      oo.push('|');
    }
    return oo.join('');
  }

  toLatexFontsize(fs){
    return this.tokenizer.toLatexFontsize(fs);
  }

  toDisplayMath(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\startformula \\startalign`);
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
          s = s.map(x => this.inlinemath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          s = s.map(x => this.inlinemath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopalign \\stopformula`);
      o.push('');
    }
    else {
      o.push(`\\startformula \\startalign`);
      var ss = [];
      for(var bl of bls) {
        j++;
        var plus = ''
        var s0 = bl.join(' ');
        var s0 = this.inlinemath(s0);
        var s = s0;
        if (1) {
          var s = `\\NC ${s} \\NC\\NR[${plus}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopalign \\stopformula`);
      o.push('');
    }
  }

  toEquation(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
    ///   \placeformula
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[+]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[+]
    ///   \stopalign \stopformula
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\placeformula`);
      o.push(`\\startformula \\startalign`);
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
          s = s.map(x => this.inlinemath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          s = s.map(x => this.inlinemath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopalign \\stopformula`);
      o.push('');
    }
    else {
      o.push(`\\placeformula`);
      o.push(`\\startformula \\startalign`);
      var ss = [];
      for(var bl of bls) {
        j++;
        var plus = (j==1)?'+':'';
        var s0 = bl.join(' ');
        var s0 = this.inlinemath(s0);
        var s = s0;
        if (1) {
          var s = `\\NC ${s} \\NC\\NR[${plus}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopalign \\stopformula`);
      o.push('');
    }
  }

  toEquations(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
    ///   \placeformula
    ///   \startformula \startalign
    ///   \NC a_1 x + b_1 y \NC = c_1 \NR[+]
    ///   \NC a_2 x + b_2 y \NC = c_2 \NR[+]
    ///   \stopalign \stopformula
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\placeformula`);
      o.push(`\\startformula \\startalign`);
      var ss = [];
      for(var bl of bls) {
        var s0 = bl.join(' ');
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['',''];
          s[0] = v[1];
          s[1] = '= ' + v[2];
          s = s.map(x => this.inlinemath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          s = s.map(x => this.inlinemath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopalign \\stopformula`);
      o.push('');
    }
    else {
      o.push(`\\placeformula`);
      o.push(`\\startformula \\startalign`);
      var ss = [];
      for(var bl of bls) {
        var s0 = bl.join(' ');
        var s0 = this.inlinemath(s0);
        var s = s0;
        if (1) {
          var s = `\\NC ${s} \\NC\\NR[+]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopalign \\stopformula`);
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
    ///   \stopalign \stopformula
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\placesubformula`);
      o.push(`\\startformula \\startalign`);
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
          s = s.map(x => this.inlinemath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          s = s.map(x => this.inlinemath(x));
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+][${subnum}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopalign \\stopformula`);
      o.push('');
    }
    else {
      o.push(`\\placesubformula`);
      o.push(`\\startformula \\startalign`);
      var ss = [];
      for(var bl of bls) {
        j++;
        var subnum = this.toSubfigNum(j-1);
        var s0 = bl.join(' ');
        var s0 = this.inlinemath(s0);
        var s = s0;
        if (1) {
          var s = `\\NC ${s} \\NC\\NR[+][${subnum}]`;
          ss.push(s);
        }
      }
      o.push(ss.join('\n'));
      o.push(`\\stopalign \\stopformula`);
      o.push('');
    }
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
    var c0 = ''
    var s0 = '';
    var fns0 = 0;

    for (var j=0; j < text.length; ++j) {

      var c = text[j];
      var cc = text.charCodeAt(j);

      if (cc >= 128 && cc <= 0xFFFF) {
        var fns = fontmap[cc];
      } else {
        var fns = 0
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
          var s0 = `{\\switchtobodyfont[${fn}]${this.xconfontsize} ${c0}}`;

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
        var s0 = `{\\switchtobodyfont[${fn}]{${c0}}}`;
        continue;
      }

      /// we get here if the 'c' is not a CJK
      newtext += c;
    }

    newtext += s0;
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

}

module.exports = { NitrilePreviewContex };
