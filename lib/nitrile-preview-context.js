'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const utils = require('./nitrile-preview-utils');
const C_textrightarrow = String.fromCharCode(8594);
const entjson = require('./nitrile-preview-entity.json');
const fontmap = require('./nitrile-preview-fontmap');

class NitrilePreviewContext extends NitrilePreviewParser {

  constructor() {
    super();
    this.haschapter = false;
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
      "⁻¹" , "\\textsuperscript{-1}",
      "⁻²" , "\\textsuperscript{-2}",
      "⁻³" , "\\textsuperscript{-3}",
      "¹" , "\\textsuperscript{1}",
      "²" , "\\textsuperscript{2}",
      "³" , "\\textsuperscript{3}",
      "\\" , "\\textbackslash{}"   ,
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
  }

  do_part(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    o.push(`\\part{${text}}`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_hdgs(block){
    var {id,row1,row2,sig,level,sublevel,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    text = this.escape(text);
    if (!this.haschapter) {
      switch (level) {
        case 0:
          break;///this needs to be ignore specifically otherwise it
                ///will show through 'default'
        case 1:
          o.push(`\\startsection[title={${text}},reference={${this.baselabel}}]`);
          o.push('');
          break;
        case 2:
          o.push(`\\startsubsection[title={${text}},reference={${this.baselabel}}]`);
          o.push('');
          break;
        default:
          o.push(`\\startsubsubsection[title={${text}},reference={${this.baselabel}}]`);
          o.push('');
          break;
      }
    } else {
      switch (level) {
        case 0:
          break;///this needs to be ignore specifically otherwise it
                ///will show through 'default'
        case 1:
          o.push(`\\startchapter[title={${text}},reference={${this.baselabel}}]`);
          o.push('');
          break;
        case 2:
          o.push(`\\startsection[title={${text}},reference={${this.baselabel}}]`);
          o.push('');
          break;
        case 3:
          o.push(`\\startsubsection[title={${text}},reference={${this.baselabel}}]`);
          o.push('');
          break;
        default:
          o.push(`\\startsubsubsection[title={${text}},reference={${this.baselabel}}]`);
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
    o.push('\\blank');
    for (var item of data) {
      var [lead,bullet,text] = item;
      bullet = bullet || '';
      text = text || '';
      if (bullet === '-' || bullet === '*' || bullet === '+') {
        var value = '';
      } else if (bullet.match(/^\d+\.$/)) {
        var value = bullet;
      } else if (bullet.match(/^\d+\)$/)) {
        var value = bullet;
      } else {
        var value = '';
      }
      if (bullet === '*') {
        var re = this.re_dlitem;
        var v = re.exec(text);
        if (v) {
          text = `${this.style('strong',v[1])} - ${this.unmask(v[2])}`;
        } else {
          text = this.unmask(text);
        }
      } else {
        text = this.unmask(text);
      }
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
        s.push(`\\NC {\\tfx ${++linenum}} \\NC {${ffamily}${this.xcontextfontsize}{}${line}} \\NC\\NR`);
        while (lines.length > 0) {
          var line = lines.shift();
          line = this.escapeSolid(line);
          s.push(`\\NC {} \\NC {${ffamily}${this.xcontextfontsize}{}${line}} \\NC\\NR`);
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
          s.push(`\\NC {${ffamily}${this.xcontextfontsize}{}${line}} \\NC\\NR`);
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
    o.push(`\\startnarrower[left]`);
    o.push(`\\blank\\noindent`);
    text = text.join('\n');
    text = this.unmask(text);
    text = `{${this.xcontextfontsize}{}${text}}`;
    o.push(text);
    o.push(`\\stopnarrower`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_list(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    text = text.map(x => this.unmask(x));
    text = text.map(x => `\\item ${x}`);
    text.unshift(`\\begin{itemize}[nosep,leftmargin=*,labelindent=${this.xleft},font=\\normalfont${this.xlatexfontsize}]`);
    text.push(`\\end{itemize}`);
    text = text.join('\n');
    o.push(`\\begin{flushleft}`);
    o.push(text);
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_samp(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    o.push(`%SAMP`);
    if (this.xsamptype===0) {
      text = text.map( x => this.escape(x) );
      text = text.map( x => this.solidifyLeadingBackslashSpaces(x) );
      text = text.map( x => (x.length>0)?x:'~' );
      text = text.map( x => `\\NC {\\tt ${this.xcontextfontsize}{}${x}} \\NC\\NR` );
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
      text = text.map( x => `{${this.xcontextfontsize}{}${x}}` );
      text = text.join('\\\\\n');
      o.push(`\\startnarrower[left]`);
      o.push(`\\blank\\noindent`);
      o.push(text);
      o.push('\\stopnarrower');
      o.push('');
    } 
    else if (this.xsamptype===2||this.xsamptype===3) {
      text = this.joinBackslashedLines(text);
      text = text.map( x => this.unmask(x) );
      text = text.map( x => `{${this.xcontextfontsize}{}${x}}` );
      text = text.join('\\\\');
      text = `\\item ${text}`;
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
    var text;
    text = data;
    text = this.unmask(text);
    o.push(`\\bigskip`);
    o.push(`\\begin{center}`);
    o.push(text);
    o.push(`\\end{center}`);
    o.push(`\\bigskip`);
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
    var text = para;
    o.push('\\begin{flushleft}');
    for (var s of text) {
      o.push(`${this.escape(s)} \\\\`);
    }
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_quot(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push('\\begin{flushleft}');
    o.push(`\\begin\{adjustwidth\}{${this.xleft}}{${this.xleft}}`)
    o.push(`${lq}${text}${rq}`);
    o.push('\\end{adjustwidth}')
    o.push('\\end{flushleft}')
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
    var header = header.map(x => `{\\bf ${x}}`);
    var header = header.map(x => `{${this.xcontextfontsize}{}${x}}`);
    if (1) {
      ///buid table into 's'
      var s = [];
      s.push(`\\starttabulate[|${pcols.join('|')}|]`);
      s.push(`\\HL`);
      s.push(`\\NC ${header.join(' \\NC ')} \\NC\\NR`);
      s.push(`\\HL`);
      for(var row of rows) {
        s.push(`\\TB[${vpadding}pt]`);
        s.push(`\\NC ${row.join(' \\NC ')} \\NC\\NR`);
      }
      s.push(`\\TB[${vpadding}pt]`);
      s.push(`\\HL`);
      s.push('\\stoptabulate');
    }
    if (this.caption_text) {
      /// \begin{table}[h]
      o.push(`\\begin{table}[h]`);
      o.push(`\\caption{${this.caption_text}}${this.latexlabelcmd}`);
      o.push(s.join('\n'));
      o.push(`\\end{table}`);
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
    var pcols = this.toTabularxColumns(maxj,ww);
    var vlines = fencecmd.vlines;
    var hlines = fencecmd.hlines;
    var vlines = this.toArray(vlines);
    var hlines = this.toArray(hlines);
    var vlines = vlines.map(v => parseInt(v));
    var vpadding = parseInt(fencecmd.vpadding);
    var pcol = this.insertTabularVlines(vlines,pcols);
    var header = rows.shift();
    var header = header.map(x => `{${this.xlatexfontsize}{}${x}}`);
    var s = [];
    s.push(`\\bTABLE[loffset=4pt,roffset=4pt,toffset=2pt,boffset=2pt,split=repeat,option=stretch]`);
    s.push(`\\bTABLEhead`);
    s.push(`\\bTR \\bTH ${header.join(' \\eTH \\bTH ')} \\eTH \\eTR`);
    s.push(`\\eTABLEhead`);
    s.push(`\\bTABLEbody`);
    for( var row of rows ) {
      s.push(`\\bTR \\bTD ${row.join(' \\eTD \\bTD ')} \\eTD \\eTR`);
    }
    s.push(`\\eTABLEbody`);
    s.push(`\\eTABLE`);
    if (this.caption_text) {
      o.push(`\\placetable{${this.caption_text}}`);
      o.push(s.join('\n'));
      o.push('}');
      o.push('');
    } else {
      o.push(s.join('\n'));
    }
    block.latex = o.join('\n');
  }
  do_imgs(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    var re_margin = /^margin\s+(.*)$/;
    var re_gap = /^gap\s+(.*)$/;
    var re_column = /^column\s+(.*)$/;
    var re_columns = /^columns\s+(.*)$/;
    var re_image = /^image\s+\((.*?)\)\s*(.*)$/;

    var columns = [1];
    var gap = 1;
    var margin = 0;
    var images = [];
    var column = 1;

    /// parse the input
    for( var line of data ) {
      var v;
      if((v=re_margin.exec(line))!==null) {
        margin = this.toInt(v[1],margin);
      } else if((v=re_gap.exec(line))!==null) {
        gap = this.toInt(v[1],gap);
      } else if((v=re_column.exec(line))!==null) {
        column = this.toInt(v[1],column);
        if (column < 1) column = 1;
      } else if((v=re_columns.exec(line))!==null) {
        var columns = this.toIntArray(v[1]);
        if (columns.length === 0) {
          columns = [1];
        }
      } else if ((v=re_image.exec(line))!==null) {
        images.push(['image',v[1],v[2]]);
      }
    }

    //var ww = this.toAdjustedColumns(column,adjust);
    //var pcol = this.toPcolumn2(margin,gap,ww);
    var text = this.toFramedImgs(column,images);
    if (this.caption_text) {
      o.push(`\\begin{figure}`);
      o.push(`\\caption{${this.caption_text}}${this.latexlabelcmd}`)
      o.push(`\\centering`);
      o.push(text);
      o.push('\\end{figure}');
      o.push('');
    } else {
      o.push(`\\begin{center}`);
      o.push(text);
      o.push('\\end{center}');
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
    var ww = Array(ncols);
    ww.fill(1);
    ww = this.wwToOne(ww);
    o.push(`\\begin{tabbing}`);
    var tt = ww.map(x => `\\hspace{${x}\\linewidth}`);
    tt = tt.join('\\=');
    tt += '\\kill';
    o.push(tt);
    var s = [];
    for (var j = 0; j < nrows; ++j) {
      var pp = data.map(x => x[j] || '');
      pp = pp.map(x => this.unmask(x));
      var p = pp.join(' \\> ');
      p = `${p}\\\\`;
      s.push(p);
    }
    var text = s.join('\n');
    o.push(text);
    o.push(`\\end{tabbing}`);
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
      o.push(`textwidth := ${this.config.CONTEX.width}mm;`);
      o.push(`pu := textwidth/${xm};`);
      o.push(`u := ${unit}mm;`);
      o.push(`ratio := pu/u;`);
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
    var [out, vw, vh] = this.toFramedLtpp(text);
    text = `\\resizebox{\\linewidth}{!}{${out}}`;
    if (fencecmd.frameborder==1) {
      text = `\\fbox{${text}}`;
    }
    o.push(`\\begin{flushleft}`);
    o.push(`\\setlength{\\unitlength}{1pt}`);
    o.push(text);
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_vers(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    o.push('\\begin{flushleft}')
    var text = '';
    for (text of data) {
      text = this.unmask(text);
      o.push(`${text} \\\\`);
    }
    if (data.length) {
      o.pop();
      o.push(text);
    }
    o.push('\\end{flushleft}')
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

  /*
    return an HTML entity symbol:
    'amp' -> '\&'
    'deg' -> '\textdegree{}'
  */
  entity (str) {
    var ent = entjson.entities[str];
    if (ent) {
      var v = this.re_entityi.exec(ent.latex);
      if (v !== null) {
        var s1 = v[1];
        if (s1[0] == 'x' || s1[0] == 'X') {
          s1 = `0${s1}`;
        }
        return String.fromCharCode(s1);
      }
      return ent.latex;
    } else {
      return this.escape(str);
    }
  }

  ruby (rb,rt) {
    return `\\ruby{${this.escape(rb)}}{${this.escape(rt)}}`
  }

  ref (str) {
    for (var j=0; j < this.blocks.length; ++j) {
      var block = this.blocks[j];
      var {id,fencecmd,saveas,idnum} = block;
      var baselabel = fencecmd.baselabel;
      if( str.localeCompare(baselabel)===0) {
        return `{\\goto{${idnum}}[$baselabel]}`;
        break;
      }
    }
    str = this.escape(str);
    return `{\\tt ${str}}`;
  }

  /*
    return the styled inline text
  */
  style (type, text) {
    type = type || '';
    switch (type) {
      case 'inlinemath': {
        var s = `\\math{${text}}`;
        return s;
        break;
      }
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

  toRequiredPackages (config) {

    var geometry_opts = [];
    if (config.LATEX.twoColumnEnabled) {
      geometry_opts.push(`left=${config.LATEX.leftMarginForTwoColumn}cm`);
      geometry_opts.push(`right=${config.LATEX.rightMarginForTwoColumn}cm`);
      geometry_opts.push(`top=${config.LATEX.topMarginForTwoColumn}cm`);
    } else {
      geometry_opts.push(`left=${config.LATEX.leftMargin}cm`);
      geometry_opts.push(`right=${config.LATEX.rightMargin}cm`);
      geometry_opts.push(`top=${config.LATEX.topMargin}cm`);
    }
    if (config.LATEX.A4PaperEnabled) {
      geometry_opts.push('a4paper');
    }
    if (config.LATEX.twoSideEnabled) {
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
\\DeclareMathOperator{\\arcosh}{arccosh}
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
\\usepackage{listings}
\\usepackage{quoting}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage{supertabular}
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
\\DeclareMathOperator{\\arcosh}{arccosh}
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
\\usepackage{listings}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage{supertabular}
\\usepackage[export]{adjustbox}`

    }

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

    var _vw = `${6*mpara}`;
    var _vh = `${10*(1+npara)}`;
    var vw = `${6*mpara}pt`;
    var vh = `${10*(1+npara)}pt`;
    para = this.toReversedArray( para );

    var o = [];
    ///o.push(`\\setlength{\\unitlength}{1pt}`);
    o.push(`\\begin{picture}(${_vw},${_vh})`);

    var y = 8; /// 8 is a sensable number---the bigger the number the more upwards the contents shifts
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
      line = this.replaceSubstrings(line,this.mymapcode);
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

  toFramedImgs (column,images) {
    var o = [];
    var pcol = 'L'.repeat(column);
    var pp = images.map( x => {
        var [image,src,sub] = x;
        sub = this.unmask(sub);
        return `{\\begin{minipage}{\\linewidth}\\includegraphics[width=\\linewidth,frame]{${src}}\\captionof*{figure}{\\small{}${sub}}\\end{minipage}}`;
    });

    o.push(`\\begin{tabulary}{\\linewidth}{${pcol}}`);
    var n = 0;
    pp.forEach( p => {
      n++;
      o.push(p);
      if (n == column) {
        o.push(`\\\\`);
        o.push(`\\end{tabulary}`);
        o.push(`\\medskip\\begin{tabulary}{\\linewidth}{${pcol}}`);
        n = 0;
      } else {
        o.push(' & ');
      }
    });
    if (n==0){
      o.pop();
    } else {
      while (n < column) {
        o.push('{}');
        if (n == column) {
          o.push(`\\\\`);
          o.push(`\\end{tabulary}`);
          n = 0;
        } else {
          o.push(' & ');
        }
      }
    }
    return o.join('\n');
  }

  toFramedPict (text,config) {
    var o = [];
    for (var pp of text) {
      pp = pp.map( x => {
          var [image,adjust,opts,src,srcs,sub] = x;
          if (!src && srcs.length) {
            src = srcs[0];///TODO: need to change it so that it picks a right format
          }
          var { height, width } = opts;
          height = height || '';
          width = width || '';
          var myopts = [];
          if (height) {
            myopts.push(`height=${height}`);
          }
          if (width) {
            if (width !== 'auto') {
              myopts.push(`width=${this.toLatexLength(width)}`);
            }
          } else {
            ///if user hasn't provided any width then use the one in adjust
            myopts.push(`width=${adjust}\\linewidth`);
          }
          //return `{\\includegraphics[${myopts.join(',')}]{${src}}}`;
          return `{\\begin{minipage}{${adjust}\\linewidth}\n\\includegraphics[width=\\linewidth]{${src}}\n\\captionof*{figure}{${sub}}\n\\end{minipage}}`;
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
        row = row.map(x => `{${this.xlatexfontsize}{}${x}}`);
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
          var qq = qq.map(x => `{${this.xlatexfontsize}{}${x}}`);
          o.push(`${qq.join(' & ')} \\\\`);
        }
        if(vpadding>0){
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
      }
    }
    return o.join('\n');
  }

  toContextDocument(config,texlines) {
    var mykeys = Object.keys(config);
    var mykeys = mykeys.filter(x => (typeof config[x])==='string'?true:false);
    var mylines = mykeys.map(x => `% !TEX nitrile ${x} = ${config[x]}`);
    var title = config.ALL.title ? config.ALL.title : 'Untitled'
    var author = config.ALL.author ? config.ALL.author : ''
    var documentclass = config.LATEX.documentClass ? config.LATEX.documentClass : ''
    if (!documentclass) {
      documentclass = (this.haschapter) ? "report" : "article";
    }
    var documentclassopt = config.LATEX.twoColumnEnabled?"twocolumn":"";
    var data = `\
% !TEX program = context
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
\\setuphead[chapter][style=bfd,number=yes]
\\setuphead[section][style=bfc,number=yes]
\\setuphead[subsection][style=bfb,number=yes]
\\setuphead[subsubsection][style=bfa,number=yes]
\\setuphead[subsubsubsection][style=bold,number=yes]
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
\\usemodule[tikz]
\\usemodule[ruby]
\\setupcaptions[number=no]
\\setuppagenumbering[location=footer]
\\setupbodyfont[10pt]
\\setupinteraction[state=start]
\\placebookmarks[part,chapter]
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
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
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
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[${plus}]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
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
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
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
          var s = s.join(' \\NC ');
          var s = `\\NC ${s} \\NR[+]`;
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
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

  toMultline(o,id,sig,fname,row1,row2,data,fencecmd) {
    var bls = data;
    var ss = [];
    for(var bl of bls) {
      var s0 = bl.join(' ');
      ss.push(s0);
    }
    var star = fencecmd.star||'';
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
          var s0 = `{\\switchtobodyfont[${fn}]{${c0}}}`;

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

}

module.exports = { NitrilePreviewContext };
