'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewDiagramMP } = require('./nitrile-preview-diagrammp');
const utils = require('./nitrile-preview-utils');
const C_textrightarrow = String.fromCharCode(8594);
const entjson = require('./nitrile-preview-entity.json');

class NitrilePreviewLatex extends NitrilePreviewParser {

  constructor() {
    super();
    this.mymap = [
      "’"  , "'"                   ,
      "“"  , "\""                  ,
      "”"  , "\""                  ,
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

  translateLatex (all,config) {

    /// the 'blocks' argument is an array of blocks; the 'isarticle'
    /// is a Boolean type set to true only when generating an 'article'
    /// document type, such that HDGS/0 will be treated as the title
    /// of the document and not a chapter.

    var o = [];
    this.block = [];
    this.config = config;
    this.isarticle = this.getBool(config.latex.isArticle);
    for (var block of all) {
      const [id,row1,row2,sig,n,data,para,_fencecmd,star,base,_label,fname] = block;
      this.block = block;
      this.base = base;
      this.row1 = row1;
      this.row2 = row2;
      this.fname = fname;
      var fencecmd = this.updateFenceOpt(_fencecmd,sig,config);
      const label_text = (fencecmd.label)?`${base}:${fencecmd.label}`:'';
      const label_cmd = `\\label{${label_text}}`;
      const caption_text = (fencecmd.caption)?this.unmask(fencecmd.caption):'';
      switch (sig) {
        case 'PART': {
          var text = data;
          o.push(`\\part{${text}}`);
          o.push('');
          break;
        }
        case 'ERRO': {
          var [hdgn,text] = data;
          var text = this.escape(text);
          if (this.isarticle) {
            switch (hdgn) {
              case 0:
                break;///this needs to be ignore specifically otherwise it
                      ///will show through 'default'
              case 1:
                o.push(`\\section{${text}}${label_cmd}`);
                o.push('');
                break;
              case 2:
                o.push(`\\subsection{${text}}${label_cmd}`);
                o.push('');
                break;
              default:
                o.push(`\\subsubsection{${text}}${label_cmd}`);
                o.push('');
                break;
            }
          } else {
            switch (hdgn) {
              case 0:
                break;///this needs to be ignore specifically otherwise it
                      ///will show through 'default'
              case 1:
                o.push(`\\chapter{${text}}${label_cmd}`);
                o.push('');
                break;
              case 2:
                o.push(`\\section{${text}}${label_cmd}`);
                o.push('');
                break;
              case 3:
                o.push(`\\subsection{${text}}${label_cmd}`);
                o.push('');
                break;
              default:
                o.push(`\\subsubsection{${text}}${label_cmd}`);
                o.push('');
                break;
            }
          }
          break;
        }
        case 'HDGS': {
          var [hdgn,text] = data;
          text = this.escape(text);
          if (this.isarticle) {
            switch (hdgn) {
              case 0:
                break;///this needs to be ignore specifically otherwise it
                      ///will show through 'default'
              case 1:
                o.push(`\\section{${text}}${label_cmd}`);
                o.push('');
                break;
              case 2:
                o.push(`\\subsection{${text}}${label_cmd}`);
                o.push('');
                break;
              default:
                o.push(`\\subsubsection{${text}}${label_cmd}`);
                o.push('');
                break;
            }
          } else {
            switch (hdgn) {
              case 0:
                break;///this needs to be ignore specifically otherwise it
                      ///will show through 'default'
              case 1:
                o.push(`\\chapter{${text}}${label_cmd}`);
                o.push('');
                break;
              case 2:
                o.push(`\\section{${text}}${label_cmd}`);
                o.push('');
                break;
              case 3:
                o.push(`\\subsection{${text}}${label_cmd}`);
                o.push('');
                break;
              default:
                o.push(`\\subsubsection{${text}}${label_cmd}`);
                o.push('');
                break;
            }
          }
          break;
        }
        case 'LIST': {
          o.push('\\begin{flushleft}');
          o.push(`\\begin{itemize}[nosep,leftmargin=${config.latex.stepMargin}cm]`);
          for (var text of data) {
            var text = this.unmask(text);
            o.push(`\\item ${text}`);
          }
          if (data.length == 0) {
            o.push('\\item (empty)');
          }
          o.push('\\end{itemize}');
          o.push('\\end{flushleft}');
          o.push('');
          break;
        }
        case 'DESC': {
          var [cat,keys,text,xn] = data;
          text = this.unmask(text);
          const xleft = xn*config.latex.stepMargin;
          ///const xleft = 0;
          var bullet = '';
          try {
            if (config.latex.itemBullet) {
              bullet = String.fromCodePoint(config.latex.itemBullet);
              bullet += ' ';
            }
          } catch(e) {
          }
          o.push(`\\begin{flushleft}`);
          o.push(`\\begin{description}\[nosep,style=unboxed,leftmargin=${xleft}cm,font=\\normalfont]`);
          for (var key of keys) {
            key  = this.unmask(key );
            key = `${bullet}\\bfseries{}${key}`;
            o.push(`\\item\[${key}\]`);
          }
          if (text) {
            o.push('\\hfill\\break');
            o.push(text);
          }
          o.push(`\\end{description}`);
          o.push(`\\end{flushleft}`);
          o.push('');
          break;
        }
        case 'PLST': {
          o.push('\\begin\{flushleft\}')
          for (var item of data) {
            var [lead,bullet,text] = item;
            bullet = bullet || '';
            text = text || '';
            if (bullet === '-' || bullet === '*' || bullet === '+') {
              text = this.unmask(text);
              bullet = '';
            } else if (bullet.match(/^\d+\.$/)) {
              bullet = this.chomp(bullet);
              text = this.unmask(text);
            } else {
              bullet = '';
              text = this.unmask(text);
            }
            if (item.length === 3) {
              switch (lead) {
                case 'OL': {
                  o.push(`\\begin{enumerate}[nosep,leftmargin=${config.latex.stepMargin}cm]`);
                  o.push(`\\item\[${bullet}.\] ${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`\\begin{itemize}[nosep,leftmargin=${config.latex.stepMargin}cm]`);
                  o.push(`\\item ${text}`);
                  break;
                }
                case 'LI': {
                  if (bullet) {
                    o.push(`\\item\[${bullet}.\] ${text}`);
                  } else {
                    o.push(`\\item ${text}`);
                  }
                  break;
                }
                case '/OL': {
                  o.push(`\\end{enumerate}`);
                  if (bullet) {
                    o.push(`\\item\[${bullet}.\] ${text}`);
                  } else {
                    o.push(`\\item ${text}`);
                  }
                  break;
                }
                case '/UL': {
                  o.push(`\\end{itemize}`);
                  if (bullet) {
                    o.push(`\\item\[${bullet}.\] ${text}`);
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
          break;
        }
        case 'ITEM': {
          var [fence,text] = data;
          const xleft = config.latex.stepMargin;
          if (fence) {
            o.push(`\\begin{flushleft}`);
            o.push(`\\begin\{adjustwidth\}{${xleft}cm}{}`)
            for (var line of text) {
              line = this.replaceSubstrings(line,this.mymapcode);
              line = this.fontifyLATEX(line);
              line = `{\\ttfamily{}${line}}\\\\`;
              o.push(line);
            }
            if (text.length) {
              /// remove the last line's double-backslash
              line = o.pop();
              line = line.slice(0,line.length-2);
              o.push(line);
            }
            o.push(`\\end\{adjustwidth\}`)
            o.push(`\\end{flushleft}`);
            o.push('');
          } else {
            o.push(`\\begin{flushleft}`);
            o.push(`\\begin\{adjustwidth\}{${xleft}cm}{}`)
            text = this.unmask(text.join('\n'));
            o.push(text);
            o.push(`\\end\{adjustwidth\}`)
            o.push(`\\end{flushleft}`);
            o.push('');
          }
          break;
        }
        case 'SAMP': {
          var text = data;
          const xleft = config.SAMP.margin;
          const xsize = config.SAMP.fontsize;
          o.push(`\\begin{flushleft}`);
          o.push(`\\begin\{adjustwidth\}{${xleft}cm}{}`)
          if (config.SAMP.wrap) {
            var text = this.wrapSample(text,config.SAMP.wrap);
          }
          for (var i=0; i < text.length; ++i) {
            var line = text[i];
            line = this.replaceSubstrings(line,this.mymapsmpl);
            line = this.solidifyLeadingBackslashSpaces(line);
            line = this.fontifyLATEX(line);
            if (config.latex.autoRubyEnabled) {
              line = this.rubify(line);
            }
            if (line.length == 0) {
              line = '~';
            }
            var s = `{\\ttfamily{}\\${xsize}{}${line}}`;
            o.push(`${s}\\\\`);
          }
          if (i > 0) {
            o.pop();
            o.push(s);
          }
          o.push('\\end\{adjustwidth\}');
          o.push('\\end\{flushleft\}')
          o.push('');
          break;
        }
        case 'PARA': {
          var text;
          text = data;
          text = this.unmask(text);
          o.push('\\bigskip');
          o.push('\\noindent');
          o.push(text);
          o.push('');
          break;
        }
        case 'PRIM': {
          var lead;
          var text;
          [lead,text] = data;
          lead = this.unmask(lead);
          text = this.unmask(text);
          o.push(`\\paragraph{${lead}}`);
          o.push(text);
          o.push('');
          break;
        }
        case 'SECO': {
          var lead;
          var text;
          [lead,text] = data;
          lead = this.unmask(lead);
          text = this.unmask(text);
          o.push(`\\subparagraph{${lead}}`);
          o.push(text);
          o.push('');
          break;
        }
        case 'TEXT': {
          var text = data;
          text = this.unmask(text);
          o.push(text);
          o.push('');
          break;
        }
        case 'CITE': {
          var text = data;
          o.push('\\begin{flushleft}');
          for (var s of text) {
            o.push(`${this.escape(s)} \\\\`);
          }
          o.push(`\\end{flushleft}`);
          o.push('');
          break;
        }
        ///***NOTE: following are fenced blocks
        case 'imgs': {

          var column = 1;
          if (fencecmd.column) {
            column = fencecmd.column;
          }
          var adjust = '1 '.repeat(column);
          if (fencecmd.adjust) {
            adjust = fencecmd.adjust;
          }
          var margin = 0.0;
          if (fencecmd.margin) {
            margin = fencecmd.margin;
          }
          var gap = 0.0;
          if (fencecmd.gap) {
            gap = fencecmd.gap;
          }
          var ww = this.toAdjustedColumns(column,adjust);
          var pcol = this.toPcolumn2(margin,gap,ww);
          var text = this.toFramedImgs(column,data,pcol);
          if (caption_text) {
            o.push(`\\begin{figure}`);
            o.push(`\\caption{${caption_text}}${label_cmd}`)
            o.push(`\\centering`);
            o.push(text);
            o.push('\\end{figure}');
            o.push('');
          } else {
            o.push(`\\begin{flushleft}`);
            o.push(text);
            o.push('\\end{flushleft}');
            o.push('');
          }
          break;
        }
        case 'tabbing': {
          var [text,maxj,ww] = data;
          if (fencecmd.adjust) {
            ww = this.toAdjustedColumns(maxj,fencecmd.adjust);
          }
          text = text.map ( row => {
            row = row.map(x => x.split('\n'));
            row = row.map(x => x.map(y => this.unmask(y)));
            return row;
          });
          o.push(`\\begin{tabbing}`);
          var tt = ww.map(x => `\\hspace{${x}\\linewidth}`);
          tt = tt.join('\\=');
          tt += '\\kill';
          o.push(tt);
          for (var row of text) {
            var nn = row.map(x => x.length);
            var maxn = nn.reduce((acc,cur) => Math.max(acc,cur));
            for (var i=0; i < maxn; ++i) {
              var qq = row.map(x => x[i]);
              o.push(`${qq.join(' \\> ')}\\\\`);
            }
          }
          if (text.length == 0) {
            o.push(`(empty)`);
          } else {
            var s = o.pop(); ///remove the last \\\\
            s = s.slice(0,s.length-2);
            o.push(s);
          }
          o.push(`\\end{tabbing}`);
          o.push('');
          break;
        }
        case 'tabular': {
          var [rows,maxj,ww] = data;
            ///***NOTE: do not need to adjust ww as tabulary
            ///adjust table columns automatically
            ///However, it still support \newline macro
          rows = rows.map ( row => {
            row = row.map(x => x.split('\n'));
            row = row.map(x => x.map(y => this.unmask(y)));
            return row;
          });
          var fs = fencecmd.fontsize;
          var pcols = 'L'.repeat(maxj).split('');
          var vlines = fencecmd.vlines;
          var hlines = fencecmd.hlines;
          var vlines = this.toArray(vlines);
          var hlines = this.toArray(hlines);
          var vlines = vlines.map(v => parseInt(v));
          var vpadding = parseInt(fencecmd.vpadding);
          pcol = this.insertTabularVlines(vlines,pcols);
          var header = rows.shift();
          var header = header.map(x => `\\textbf{${x}}`);
          var header = header.map(x => `{\\${fs}{}${x}}`);
          o.push(`\\begin{center}`);
          o.push(`\\begin{tabulary}{\\linewidth}{${pcol}}`);
          if (hlines.indexOf('t')>=0){
            o.push('\\hline');
          }
          if(vpadding>0){
            o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
          }
          o.push(`${header.join(' & ')}\\\\`);
          if(vpadding>0){
            o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
          }
          if (hlines.indexOf('m')>=0){
            o.push('\\hline');
          }
          o.push(this.toSingleLineRows(hlines,vpadding,fs,rows));
          if(hlines.indexOf('b')>=0){
            o.push('\\hline');
          }
          o.push('\\end{tabulary}');
          o.push(`\\end{center}`);
          o.push('');
          break;
        }
        case 'longtable': {
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
          var fs = fencecmd.fontsize;
          var pcols = this.toTabularxColumns(maxj,ww);
          var vlines = fencecmd.vlines;
          var hlines = fencecmd.hlines;
          var vlines = this.toArray(vlines);
          var hlines = this.toArray(hlines);
          var vlines = vlines.map(v => parseInt(v));
          var vpadding = parseInt(fencecmd.vpadding);
          var pcol = this.insertTabularVlines(vlines,pcols);
          var header = rows.shift();
          var header = header.map(x => `\\textbf{${x}}`);
          var header = header.map(x => `{\\${fs}{}${x}}`);
          o.push(`\\begin{xltabular}{\\linewidth}{${pcol}}`);
          if (caption_text) {
            o.push(`\\caption{${caption_text}}${label_cmd}\\\\`);
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
          o.push(this.toParagraphRows(hlines,vpadding,fs,rows));
          o.push('\\end{xltabular}');
          o.push('');
          break;
        }
        case 'quot': {
          var text = data;
          var text = text.map( x => this.unmask(x) );
          var text = text.map( x => `{\\small{}${x}}` );
          var xleft = config.SAMP.margin;
          o.push('\\begin{flushleft}');
          o.push(`\\begin\{adjustwidth\}{${xleft}cm}{${xleft}cm}`)
          o.push(text.join('\n\n\\medskip\n\n'));
          o.push('\\end{adjustwidth}')
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'center': {
          o.push('\\begin{center}');
          var text = this.unmask(data);
          o.push(text);
          o.push('\\end{center}')
          o.push('');
          break;
        }
        case 'flushright': {
          o.push('\\begin{flushright}');
          var text = this.unmask(data);
          o.push(text);
          o.push('\\end{flushright}')
          o.push('');
          break;
        }
        case 'flushleft': {
          o.push('\\begin{flushleft}');
          var text = this.unmask(data);
          o.push(text);
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'diagram': {
          var [text] = new NitrilePreviewDiagramMP(this).parse(data);
          o.push('\\begin{mplibcode}');
          o.push('beginfig(1)');
          o.push(text);
          o.push('endfig')
          o.push('\\end{mplibcode}')
          o.push('');
          break;
        }
        case 'dt': {
          var text = data;
          o.push('\\begin{flushleft}');
          o.push(`\\begin{description}\[nosep,style=unboxed,font=\\normalfont\\bfseries]`);
          for (var i=0; i < text.length; i+=2) {
            var dt = text[i];
            var dd = text[i+1];
            dt = this.unmask(dt);
            dd = this.unmask(dd);
            o.push(`\\item\[${dt}\] `);
            if (dd.length) {
              o.push(`\\hfill\\break{}${dd}`);
            }
          }
          if (text.length == 0) {
            o.push(`\\item\[(empty)\]`);
          }
          o.push('\\end{description}');
          o.push('\\end{flushleft}')
          o.push('');
          break;
        }
        case 'math': {
          var text = data;
          var ss = [];
          for (var j in text) {
            var s0 = text[j];
            if( fencecmd.alignequalsign) {
              var re_equalsign = /^(.*?)\=(.*)$/;
              var v = re_equalsign.exec(s0);
              if (v) {
                var s = ['',''];
                s[0] = v[1];
                s[1] = '= ' + v[2];
              } else {
                var s = ['',''];
                s[0] = s0;
              }
            } else {
              var s = [''];
              s[0] = s0;
            }
            ss.push(s);
          }
          var count = ss.length;
          ss = ss.map(x => x.join(' '));
          o.push(`\\begin{subequations}${label_cmd}`);
          for(let s of ss){
            o.push(`\\begin{equation*}`);
            o.push(s);
            o.push(`\\end{equation*}`);
          }
          o.push(`\\end{subequations}`);
          o.push('');
          break;
        }
        case 'equation': {
          var text = data;
          var ss = [];
          for (var j in text) {
            var s0 = text[j];
            if( fencecmd.alignequalsign) {
              var re_equalsign = /^(.*?)\=(.*)$/;
              var v = re_equalsign.exec(s0);
              if (v) {
                var s = ['',''];
                s[0] = v[1];
                s[1] = '= ' + v[2];
              } else {
                var s = ['',''];
                s[0] = s0;
              }
            } else {
              var s = [''];
              s[0] = s0;
            }
            ss.push(s);
          }
          var count = ss.length;
          if (count == 1) {
            o.push(`\\begin{equation}${label_cmd}`);
            o.push(ss[0].join(' '));
            o.push(`\\end{equation}`);
            o.push('');
          } else {
            if (fencecmd.alignequalsign) {
              ss = ss.map(x => x.join(' & '));
              o.push(`\\begin{equation}${label_cmd}`);
              o.push(`\\begin{split}`);
              o.push(ss.join('\\\\\n'));
              o.push(`\\end{split}`);
              o.push(`\\end{equation}`);
              o.push('');
            } else {
              ss = ss.map(x => x.join(' '));
              o.push(`\\begin{equation}${label_cmd}`);
              o.push(`\\begin{split}`);
              o.push(ss.join('\\\\\n'));
              o.push(`\\end{split}`);
              o.push(`\\end{equation}`);
              o.push('');
            }
          }
          break;
        }
        case 'equations': {
          var bls = data;
          var j = 0;
          var mylabeltext = label_text;
          if (fencecmd.alignequalsign) {
            o.push(`\\begin{align${star}}\\label{${mylabeltext}}`);
          } else {
            o.push(`\\begin{gather${star}}\\label{${mylabeltext}}`);
          }
          var ss = [];
          for(var bl of bls) {
            var s0 = bl.join(' ');
            if( fencecmd.alignequalsign) {
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
          if (fencecmd.alignequalsign) {
            o.push(`\\end{align${star}}`);
          } else {
            o.push(`\\end{gather${star}}`);
          }
          o.push('');
          break;

        }
        case 'subequations': {
          var bls = data;
          var j = 0;
          var mylabeltext = label_text;
          o.push(`\\begin{subequations}\\label{${mylabeltext}}`);
          for(var bl of bls) {
            o.push(`\\begin{equation${star}}`);
            var s = bl.join(' ');
            o.push(s);
            o.push(`\\end{equation${star}}`);
          }
          o.push(`\\end{subequations}`);
          o.push('');
          break;

        }
        case 'multline': {
          var bls = data;
          var j = 0;
          var mylabeltext = label_text;
          for(var bl of bls) {
            o.push(`\\begin{multline${star}}\\label{${mylabeltext}}`);
            var s = bl.join('\\\\\n');
            o.push(s);
            o.push(`\\end{multline${star}}`);
            mylabeltext = mylabeltext+':'+(j++);
          }
          o.push('');
          break;
        }
        case 'listing': {
          var myopts=[];
          var fs = config.listing.fontsize;
          var onecolumn = fencecmd.onecolumn;
          myopts.push(`basicstyle=\\ttfamily\\${fs}`);
          myopts.push('numberstyle=\\tiny');
          myopts.push('breaklines=true');
          myopts.push('postbreak=\\textrightarrow\\space');
          myopts.push(`numbers=left`);
          myopts.push('numbersep=1pt');
          myopts.push('xleftmargin=12pt');
          if (caption_text) {
            myopts.push(`caption={${caption_text}}`);
          }
          if (label_text) {
            myopts.push(`label={${label_text}}`);
          }
          var text = data;
          if (onecolumn && config.latex.twoColumnEnabled) {
            o.push('\\onecolumn');
          }
          o.push(`\\begin{lstlisting}[${myopts.join(',')}]`);
          for (var k=0; k < text.length; ++k) {
            var line = text[k];
            o.push(line);
          }
          o.push('\\end{lstlisting}');
          if (onecolumn && config.latex.twoColumnEnabled) {
            o.push('\\twocolumn');
          }
          o.push('');
          break;
        }
        case 'verb': {
          var text = data;
          var [out, vw, vh] = this.toFramedLtpp(text,config);
          o.push(`\\begin{flushleft}`);
          o.push(`\\setlength{\\unitlength}{1pt}`);
          o.push(`{\\resizebox{\\linewidth}{!}{${out}} }`);
          o.push(`\\end{flushleft}`);
          o.push('');
          break;
        }
        case 'verse': {
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
          break;
        }
      }
    }
    return o;
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

  ruby (str) {
    const dotchar = '0x30fb';
    const sep = String.fromCodePoint(dotchar);
    const [rb,rt] = str.split(sep);
    if (rb && rt) {
      return `\\ruby{${this.escape(rb)}}{${this.escape(rt)}}`
    }
    return this.escape(str);
  }

  ref (str) {
    var segs = str.split(':');
    segs = segs.map(x => x.trim());
    if (segs.length>=2) {
      if (segs[0]=='') {
        segs[0] = this.base;
      }
      str = segs.join(':');
    } else {
      str = `${str}:1`;
    }
    return `\\underline{\\ref{${str}}}`;
  }

  /*
    return the styled inline text
  */
  style (type, text) {
    type = type || '';
    switch (type) {
      case 'inlinemath': {
        var s = `\\( ${text} \\)`;
        return s;
        break;
      }
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
    if (config.latex.twoColumnEnabled) {
      geometry_opts.push(`left=${config.latex.leftMarginForTwoColumn}cm`);
      geometry_opts.push(`right=${config.latex.rightMarginForTwoColumn}cm`);
      geometry_opts.push(`top=${config.latex.topMarginForTwoColumn}cm`);
    } else {
      geometry_opts.push(`left=${config.latex.leftMargin}cm`);
      geometry_opts.push(`right=${config.latex.rightMargin}cm`);
      geometry_opts.push(`top=${config.latex.topMargin}cm`);
    }
    if (config.latex.A4PaperEnabled) {
      geometry_opts.push('a4paper');
    }
    if (config.latex.twoSideEnabled) {
      geometry_opts.push('twoside');
    }

    var geometry_text = `\\usepackage[${geometry_opts.join(',')}]{geometry}`;

    if (config.latex.engine == 'pdflatex') {
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
\\usepackage{changepage}
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
\\usepackage{tikz}
\\usepackage[normalem]{ulem}
\\usepackage{listings}
\\usepackage{quoting}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
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
\\usepackage[unicode]{hyperref}
\\usepackage{anyfontsize}
\\usepackage{tikz}
\\usepackage{luamplib}
\\usepackage[normalem]{ulem}
\\usepackage{listings}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}`

    }

  }

  toFramedLtpp (para, config ) {
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

  toFramedImgs (column,text,pcol) {
///console.log(column);
    var o = [];
    o.push(`\\begin{tabular}{${pcol}}`);
    var n = 0;
    var pp = text.map( x => {
        var [image,srcs,sub] = x;
        var src = '';
        if (srcs.length) {
          src = srcs[0];///TODO: need to change it so that it picks a right format
        }
	sub = this.unmask(sub);
        return `{\\begin{minipage}{\\linewidth}\\includegraphics[width=\\linewidth,frame]{${src}}\\captionof*{figure}{\\small{}${sub}}\\end{minipage}}`;
    });

    while (pp.length) {
///console.log(n);
      if (n == 0) {
        var p = pp.shift();
        n = 1;
        o.push(`{} & ${p} &`);
        continue;
      }
      if (n == column) {
        o.push(`{} \\\\`);
        o.push(`\\end{tabular}`);
        o.push(`\\bigskip`);
        o.push(`\\begin{tabular}{${pcol}}`);
        n = 0;
        continue;
      }
      var p = pp.shift();
      o.push(`{} & ${p} &`);
      n += 1;
    }
    while (n < column) {
      o.push(`{} & {} &`);
      n += 1;
    }
    o.push(`{} `);
    o.push(`\\end{tabular}`);
    n = 0;
///console.log(o);
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

  toParagraphRows(hlines,vpadding,fs,rows) {
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
        row = row.map(x => `{\\${fs}{}${x}}`);
        o.push(row.join(' & ') + ' \\\\');
        if(vpadding>0){
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
      }
    }
    return o.join('\n');
  }

  toSingleLineRows(hlines,vpadding,fs,rows) {
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
          var qq = qq.map(x => `{\\${fs}{}${x}}`);
          o.push(`${qq.join(' & ')} \\\\`);
        }
        if(vpadding>0){
          o.push(`\\noalign{\\vspace{${vpadding}pt}}`);
        }
      }
    }
    return o.join('\n');
  }

  toLatexDocument(config,texlines) {
    var mykeys = Object.keys(config);
    var mykeys = mykeys.filter(x => (typeof config[x])==='string'?true:false);
    var mylines = mykeys.map(x => `% !TEX nitrile ${x} = ${config[x]}`);
    var title = config.title ? config.title : 'Untitled'
    var author = config.author ? config.author : ''
    var documentclass = config.latex.documentClass ? config.latex.documentClass : ''
    if (!documentclass) {
      documentclass = (config.latex.isArticle==='1') ? "article" : "report";
    }
    var documentclassopt = config.latex.twoColumnEnabled?"twocolumn":"";
    var data = `% !TEX program = ${(config.latex.engine==='pdflatex')?'pdflatex':'lualatex'}
${mylines.join('\n')}
\\documentclass[${documentclassopt}]{${documentclass}}
${this.toRequiredPackages(config)}
\\title{${this.escape(title)}}
\\author{${this.escape(author)}}
\\begin{document}
\\maketitle
${(config.latex.tocEnabled)?'\\tableofcontents':''}
\\bigskip
${texlines.join('\n')}
\\end{document}\n`;
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

}

module.exports = { NitrilePreviewLatex };
