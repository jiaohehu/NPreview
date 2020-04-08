'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const utils = require('./nitrile-preview-utils');
const C_textrightarrow = String.fromCharCode(8594);
const entjson = require('./nitrile-preview-entity.json');
const fontmap = require('./nitrile-preview-fontmap');

class NitrilePreviewLatex extends NitrilePreviewParser {

  constructor() {
    super();
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
      C_textrightarrow, "\\textrightarrow{}",
      " "  , "\\ "                 ,
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
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
    var {id,row1,row2,sig,level,sublevel,dept,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    text = this.escape(text);
    if (!this.config.haschapter) {
      switch (level) {
        case 0:
          break;///this needs to be ignore specifically otherwise it
                ///will show through 'default'
        case 1:
          o.push(`\\section{${text}}${this.latexlabelcmd}`);
          o.push('');
          break;
        case 2:
          o.push(`\\subsection{${text}}${this.latexlabelcmd}`);
          o.push('');
          break;
        case 3:
          o.push(`\\subsubsection{${text}}${this.latexlabelcmd}`);
          o.push('');
          break;
        default:
          o.push(`\\subsubsection*{${dept}~~${text}}${this.latexlabelcmd}`);
          o.push('');
          break;
      }
    } else {
      switch (level) {
        case 0:
          break;///this needs to be ignore specifically otherwise it
                ///will show through 'default'
        case 1:
          o.push(`\\chapter{${text}}${this.latexlabelcmd}`);
          o.push('');
          break;
        case 2:
          o.push(`\\section{${text}}${this.latexlabelcmd}`);
          o.push('');
          break;
        case 3:
          o.push(`\\subsection{${text}}${this.latexlabelcmd}`);
          o.push('');
          break;
        default:
          o.push(`\\subsubsection*{${dept}~~${text}}${this.latexlabelcmd}`);
          o.push('');
          break;
      }
    }
    block.latex = o.join('\n');
  }
  do_dlst(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    o.push(`\\begin{flushleft}`);
    o.push(`\\begin{description}\[nosep,style=unboxed,leftmargin=${fencecmd.left}mm,font=\\normalfont]`);
    for (var item of data) {
      var [keys,text] = item;
      keys = keys.map( x => this.escape(x) );
      text = this.unmask(text);
      for (var key of keys) {
        key = `\\bfseries{}${key}`;
        o.push(`\\item\[${key}\]`);
      }
      if (text) {
        o.push('\\hfill\\break');
        o.push(text);
      }
    }
    o.push(`\\end{description}`);
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_plst(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var lead0 = '';
    o.push('\\begin\{flushleft\}')
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
            o.push(`\\begin{enumerate}[nosep,leftmargin=*]`);
            o.push(`\\item\[${value}\] ${text}`);
            break;
          }
          case 'UL': {
            o.push(`\\begin{itemize}[nosep,leftmargin=*]`);
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
            if (value) {
              o.push(`\\item\[${value}\] ${text}`);
            } else {
              o.push(`\\item ${text}`);
            }
            break;
          }
          case '/UL': {
            o.push(`\\end{itemize}`);
            if (value) {
              o.push(`\\item\[${value}\] ${text}`);
            } else {
              o.push(`\\item ${text}`);
            }
            break;
          }
        }
      } else {
        if (lead === '/OL') {
          o.push('\\end{enumerate}');
        } else if (lead === '/UL') {
          o.push('\\end{itemize}');
        }
      }
    }
    o.push('\\end\{flushleft\}')
    o.push('');
    block.latex = o.join('\n');
  }
  do_verb(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var text = data;
    var s = [];
    var ffamily = '';
    if (fencecmd.monospace) {
      ffamily = '\\ttfamily';
    }
    if (this.xnumbers) {
      s.push(`\\begin{supertabular}{@{}l@{\\hskip ${this.xnumbersep}}l}`);
      var linenum = 0;
      for (var k=0; k < text.length; ++k) {
        var line = text[k];
        var lines = [line];
        if (this.xwraplines > 0) {
          lines = this.wrapSample(lines,this.xwraplines);
        }
        var line = lines.shift();
        line = this.escapeSolid(line);
        s.push(`{\\scriptsize{}${++linenum}} & {${ffamily}${this.xlatfontsize}{}${line}}\\\\`);
        while (lines.length > 0) {
          var line = lines.shift();
          line = this.escapeSolid(line);
          s.push(`& {${ffamily}${this.xlatfontsize}{}${line}}\\\\`);
        }
      }
      s.push('\\end{supertabular}');
    } else {
      s.push(`\\begin{supertabular}{@{}l}`);
      for (var k=0; k < text.length; ++k) {
        var line = text[k];
        var lines = [line];
        if (this.xwraplines > 0) {
          lines = this.wrapSample(lines,this.xwraplines);
        }
        while (lines.length > 0) {
          var line = lines.shift();
          line = this.escapeSolid(line);
          s.push(`{${ffamily}${this.xlatfontsize}{}${line}}\\\\`);
        }
      }
      s.push('\\end{supertabular}');
    }
    text = s.join('\n');
    var o = [];
    if (this.xname === 'listing') {
      o.push('\\begin{flushleft}');
      o.push(`\\phantomsection${this.latexlabelcmd}`);
      o.push(`Listing ${this.xidnum} : ${this.caption_text}`);
      o.push('\\end{flushleft}');
      o.push(text);
    } else {
      o.push('\\begin{flushleft}');
      o.push(text);
      o.push('\\end{flushleft}');
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_list(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    text = text.map(x => this.unmask(x));
    text = text.map(x => `\\item ${x}`);
    text.unshift(`\\begin{itemize}[nosep,leftmargin=*,labelindent=${this.xleft}mm]`);
    text.push(`\\end{itemize}`);
    text = text.join('\n');
    o.push(`\\begin{flushleft}`);
    o.push(text);
    o.push(`\\end{flushleft}`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_samp(block){
    var {id,row1,row2,sig,rmap,mode,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    o.push(`%SAMP`);
    if (!mode) {
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin\{adjustwidth\}{${fencecmd.left}mm}{}`)
      for (var i=0; i < text.length; ++i) {
        var line = text[i];
        line = this.replaceSubstrings(line,this.mymapsmpl);
        line = this.solidifyLeadingBackslashSpaces(line);
        line = this.fontifyLATEX(line);
        line = this.rubify(line,rmap);
        if (line.length == 0) {
          line = '~';
        }
        var s = `{\\ttfamily${this.xlatfontsize}{}${line}}`;
        o.push(`${s}\\\\`);
      }
      if (i > 0) {
        o.pop();
        o.push(s);
      }
      o.push('\\end\{adjustwidth\}');
      o.push('\\end\{flushleft\}')
      o.push('');
    }
    else if (mode==1) {
      text = this.joinPara(text);
      text = this.escape(text);
      if (rmap.length>0) { text = this.rubify(text,rmap); }
      text = `{${this.xlatfontsize}{}${text}}`;
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin\{adjustwidth\}{${fencecmd.left}mm}{}`)
      o.push(text);
      o.push('\\end\{adjustwidth\}');
      o.push(`\\end{flushleft}`);
      o.push('');
    } 
    else if (mode==3) {
      text = this.joinBackslashedLines(text);
      text = text.map( x => this.unmask(x) );
      if (rmap.length>0) { text = text.map(x => this.rubify(x,rmap)); }
      text = text.map( x => `{${this.xlatfontsize}{}${x}}` );
      text = text.join('\\\\');
      text = `\\item ${text}`;
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin{itemize}[nosep,leftmargin=*,labelindent=${fencecmd.left}mm]`);
      o.push(text);
      o.push(`\\end{itemize}`);
      o.push(`\\end{flushleft}`);
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
    var {id,row1,row2,sig,standalone,lead,leadn,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var text = data;
    text = this.unmask(text);
    if(standalone){
      o.push(`\\begin{flushleft}`);
      o.push(`\\begin\{adjustwidth\}{${fencecmd.left}mm}{}`)
      o.push(text);
      o.push(`\\end\{adjustwidth\}`)
      o.push(`\\end{flushleft}`);
    }
    else if (leadn&&leadn>0) {
      lead = this.escape(lead);
      if (leadn===1) {
        const indent = '';
        text = `${indent}{\\bfseries{}${lead}} ~ ${text}`;
        o.push(`\\medskip`);
        o.push(`\\noindent ${text}`);
      } 
      else if (leadn===2) {
        const indent = '';
        text = `${indent}{\\bfseries\\itshape{}${lead}} ~ ${text}`;
        o.push(`\\medskip`);
        o.push(`\\noindent ${text}`);
      } 
      else {
        const indent = '~'.repeat(5);
        text = `${indent}{\\bfseries\\itshape{}${lead}} ~ ${text}`;
        o.push(`\\medskip`);
        o.push(`\\noindent ${text}`);
      }
    } 
    else {
      if (this.textblockcount===1) {
        text = `\\noindent ${text}`;
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
    var text = this.unmask(text);
    var text = `{${this.xlatfontsize}{}${text}}`;
    var lq = String.fromCharCode('0x201C');
    var rq = String.fromCharCode('0x201D');
    o.push('\\begin{flushleft}');
    o.push(`\\begin\{adjustwidth\}{${fencecmd.left}mm}{${fencecmd.right}mm}`)
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
      return row;
    });
    var pcols = 'L'.repeat(maxj).split('');
    var vlines = fencecmd.vlines;
    var hlines = fencecmd.hlines;
    var vlines = this.toArray(vlines);
    var hlines = this.toArray(hlines);
    var vpadding = parseInt(fencecmd.vpadding);
    var pcol = this.insertTabularVlines(vlines,pcols);
    var header = rows.shift();
    var header = header.map(x => `\\textbf{${x}}`);
    var header = header.map(x => `{${this.xlatfontsize}{}${x}}`);
    if (1) {
      ///buid table into 's'
      var s = [];
      s.push(`\\begin{tabulary}{\\linewidth}{${pcol}}`);
      if (hlines.indexOf('t')>=0){
        s.push('\\hline');
      }
      if(vpadding>0){
        s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
      }
      s.push(`${header.join(' & ')}\\\\`);
      if(vpadding>0){
        s.push(`\\noalign{\\vspace{${vpadding}pt}}`);
      }
      if (hlines.indexOf('m')>=0){
        s.push('\\hline');
      }
      s.push(this.toSingleLineRows(hlines,vpadding,rows));
      if(hlines.indexOf('b')>=0){
        s.push('\\hline');
      }
      s.push('\\end{tabulary}');
    }
    if (this.caption_text) {
      /// \begin{table}[h]
      o.push(`\\begin{table}[h]`);
      o.push(`\\caption{${this.caption_text}}${this.latexlabelcmd}`);
      o.push(s.join('\n'));
      o.push(`\\end{table}`);
    } else {
      o.push(`\\begin{center}`);
      o.push(s.join('\n'));
      o.push(`\\end{center}`);
    }
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
      row = row.map(x => x.join(' \\newline '));
      return row;
    });
    ///***NOTE: xltabular is percular of naming its columns
    var pcols = this.toTabularxColumns(maxj,ww);
    var vlines = fencecmd.vlines;
    var hlines = fencecmd.hlines;
    var vlines = this.toArray(vlines);
    var hlines = this.toArray(hlines);
    var vpadding = parseInt(fencecmd.vpadding);
    var pcol = this.insertTabularVlines(vlines,pcols);
    var header = rows.shift();
    var header = header.map(x => `\\textbf{${x}}`);
    var header = header.map(x => `{${this.xlatfontsize}{}${x}}`);
    o.push(`\\begin{xltabular}{\\linewidth}{${pcol}}`);
    if (this.caption_text) {
      o.push(`\\caption{${this.caption_text}}${this.latexlabelcmd}\\\\`);
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
    o.push(this.toParagraphRows(hlines,vpadding,rows));
    o.push('\\end{xltabular}');
    o.push('');
    block.latex = o.join('\n');
  }
  do_imgs(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var ss = data.map(blk => this.toFramedImgs(blk));
    var text = ss.join('\n');
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
      o.push('\\begin{mplibcode}');
      o.push('beginfig(1)');
      o.push(`pu := \\mpdim{\\linewidth}/${xm};`);
      o.push(`u := ${unit}mm;`);
      o.push(`ratio := pu/u;`);
      o.push(`picture wheel;`);
      o.push(`wheel := image(`);
      o.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
      o.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
      o.push(text);
      o.push(`);`);
      o.push(`draw wheel scaled(ratio);`);
      o.push('endfig')
      o.push('\\end{mplibcode}')
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_math(block){
    var {id,row1,row2,sig,data,para,fencecmd,base,subrow,fname} = block;
    var o = [];
    var name = fencecmd.name;
    var isalignequalsign = fencecmd.isalignequalsign;
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

  ruby (rb,rt) {
    return `\\ruby{${this.escape(rb)}}{${this.escape(rt)}}`
  }

  ref (str) {
    for (var j=0; j < this.blocks.length; ++j) {
      var block = this.blocks[j];
      var {id,fencecmd,saveas,idnum} = block;
      var baselabel = fencecmd.baselabel;
      if( str.localeCompare(baselabel)===0) {
        return `\\hyperref[${str}]{${idnum}}`;
        break;
      }
    }
    str = this.escape(str);
    return `\\texttt{${str}}`;
  }

  inlinemath(str) {
    var s = `\\( ${str} \\)`;
    return s;
  }

  /*
    return the styled inline text
  */
  style (type, text) {
    type = type || '';
    switch (type) {
      case 'displaymath': {
        var s = `\\[ ${text} \\]`;
        return s;
        break;
      }
      case 'code': {
        return `\\texttt{${this.escape(text)}}`
        break;
      }
      case 'em': {
        return `\\textit{${this.escape(text)}}`
        break;
      }
      case 'strong': {
        return `\\textbf{${this.escape(text)}}`
        break;
      }
      case 'overstrike': {
        return `\\sout{${this.escape(text)}}`
        break;
      }
      case 'uri': {
        const [cnt,href] = text;
        if (cnt) {
          return `${this.escape(cnt)} (\\url{${href}})`
        } else {
          return `\\url{${href}}`
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
    geometry_opts.push(`left=${config.LATEX.leftmargin}mm`);
    geometry_opts.push(`right=${config.LATEX.rightmargin}mm`);
    geometry_opts.push(`top=${config.LATEX.topmargin}mm`);
    if (config.LATEX.papersize) {
      geometry_opts.push(config.LATEX.papersize);
    }
    if (config.LATEX.twoside) {
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

  toFramedImgs (images) {
    var o = [];
    var maxj = images.length;
    var pcol = 'L'.repeat(maxj);
    var pp = images.map( x => {
      var {opts,srcs,sub} = x;
      var src = srcs[0];
      sub = this.unmask(sub);
      var width = this.toLatexLength(opts.width);
      var height = this.toLatexLength(opts.height);
      var sub_text = this.unmask(sub);
      if (!width) {
        width = this.toLatexLength(`${100/maxj}%`);
      }
      return `{\\begin{minipage}{\\linewidth}\\includegraphics[width=\\linewidth]{${src}}\\captionof*{figure}{\\small{}${sub}}\\end{minipage}}`;
    });

    o.push(`\\begin{tabulary}{\\linewidth}{${pcol}}`);
    var n = 0;
    pp.forEach( p => {
      n++;
      o.push(p);
      if (n == maxj) {
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
      while (n < maxj) {
        o.push('{}');
        if (n == maxj) {
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
        row = row.map(x => `{${this.xlatfontsize}{}${x}}`);
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
          var qq = qq.map(x => `{${this.xlatfontsize}{}${x}}`);
          o.push(`${qq.join(' & ')} \\\\`);
        }
        if(vpadding>0){
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
      }
    }
    return o.join('\n');
  }

  toLatexDocument() {
    var config = this.config;
    var texlines = this.blocks.map(x => x.latex);
    var mylines = this.toConfigLines();
    var title = config.title ? config.title : 'Untitled'
    var author = config.author ? config.author : ''
    var documentclass = (config.LATEX.documentclass)?config.LATEX.documentclass:'';
    if (!documentclass) {
      documentclass = (config.haschapter)?'report':'article';
    }
    var opts = [];
    if (config.LATEX.twocolumn) {
      opts.push('twocolumn');
    }
    if (config.LATEX.bodyfontsizept) {
      opts.push(`${config.LATEX.bodyfontsizept}pt`);
    }
    var latexengine = config.LATEX.latexengine||'lualatex';
    var data = `\
% !TEX program = ${latexengine}
${mylines.join('\n')}
\\documentclass[${opts.join(',')}]{${documentclass}}
${this.toRequiredPackages(config)}
\\title{${this.escape(title)}}
\\author{${this.escape(author)}}
\\begin{document}
\\maketitle
${(config.LATEX.tableofcontents)?'\\tableofcontents':''}
\\bigskip
${texlines.join('\n')}
\\end{document}\n`;
    return data;
  }

  insertTabularVlines(vlines,pp){
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

  toLatexFontsize(fs){
    return this.tokenizer.toLatexFontsize(fs);
  }

  toDisplayMath(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
    if (isalignequalsign) {
      var data = data.map(x => x.join('\n'));
      data = data.map(x => { 
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(x);
        if (v) {
          var s = `${v[1]} &= ${v[2]}`;
          return s;
        } else {
          var s = `& ${x}`;
          return s;
        }
      });
      var text = data.join('\\\\');
      o.push(`\\begin{align*}`);
      o.push(text);
      o.push(`\\end{align*}`);
      o.push('');
    } else {
      var data = data.map(x => x.join('\n'));
      var text = data.join('\\\\');
      o.push(`\\begin{gather*}`);
      o.push(text);
      o.push(`\\end{gather*}`);
      o.push('');
    }
  }

  toEquation(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
    var bls = data;
    var ss = [];
    var star = '';
    for(var bl of bls) {
      var s0 = bl.join(' ');
      if( isalignequalsign) {
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['',''];
          s[0] = v[1];
          s[1] = '= ' + v[2];
          var s = s.join(' & ');
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          var s = s.join(' & ');
          ss.push(s);
        }
      } else {
        var s = s0;
        ss.push(s);
      }
    }
    o.push(`\\begin{equation${star}}${this.latexlabelcmd}`);
    o.push(`\\begin{split}`);
    o.push(ss.join('\\\\\n'));
    o.push(`\\end{split}`);
    o.push(`\\end{equation${star}}`);
    o.push('');
  }

  toEquations(o,id,sig,fname,row1,row2,data,fencecmd,isalignequalsign) {
    var bls = data;
    var j = 0;
    var star = '';
    if (isalignequalsign) {
      o.push(`\\begin{align${star}}${this.latexlabelcmd}`);
    } else {
      o.push(`\\begin{gather${star}}${this.latexlabelcmd}`);
    }
    var ss = [];
    for(var bl of bls) {
      var s0 = bl.join(' ');
      if( isalignequalsign) {
        var re_equalsign = /^(.*?)\=(.*)$/;
        var v = re_equalsign.exec(s0);
        if (v) {
          var s = ['',''];
          s[0] = v[1];
          s[1] = '= ' + v[2];
          var s = s.join(' & ');
          ss.push(s);
        } else {
          var s = ['',''];
          s[1] = s0;
          var s = s.join(' & ');
          ss.push(s);
        }
      } else {
        var s = s0;
        ss.push(s);
      }
    }
    o.push(ss.join('\\\\\n'));
    if (isalignequalsign) {
      o.push(`\\end{align${star}}`);
    } else {
      o.push(`\\end{gather${star}}`);
    }
    o.push('');
  }

  toSubequations(o,id,sig,fname,row1,row2,data,fencecmd) {
    var bls = data;
    var j = 0;
    var star = '';
    o.push(`\\begin{subequations}${this.latexlabelcmd}`);
    for(var bl of bls) {
      o.push(`\\begin{equation}`);
      var s = bl.join(' ');
      o.push(s);
      o.push(`\\end{equation}`);
    }
    o.push(`\\end{subequations}`);
    o.push('');
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
          var s0 = `\\${fn}{${c0}}`;
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
        var s0 = `\\${fn}{${c0}}`;
        continue;
      }

      /// we get here if the 'c' is not a CJK
      newtext += c;
    }

    newtext += s0;
    return newtext;
  }

  mpcolor(color) {
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

}

module.exports = { NitrilePreviewLatex };
