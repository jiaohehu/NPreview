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
    this.imgs = [];
    this.my_diagram_ss_maps = new Map();
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
    }else if(block && block.style && block.style.floatname == 'Listing'){
      A.idnum++;
      block.parts=A.parts;
      block.chapters=A.chapters;
      block.style.idnum = A.idnum;
      block.style.idtext = 'Listing';
    }
  }
  to_context_document() {
    ///do translate
    let A = {};
    let block0 = null;
    this.parser.blocks.forEach(block => {
      if (!A.count) {
        A.count = 1;
        A.parts = 0;
        A.chapters = 0;
        A.sections = 0;
        A.subsections = 0;
        A.subsubsections = 0;
        A.figures = 0;
        A.tables = 0;
        A.equations = 0;
        A.parts = 0;
        A.idnum = 0;///ID for Listing
      }
      if (block.sig == 'PART') {
        A.parts++;
        block.idnum = A.parts;
        A.chapters = 0;
      } else if (block.sig == 'HDGS' && block.name == 'chapter' && block.hdgn == 0) {
        A.chapters++;
        A.idnum = 0;
      } else if (block && block.style && block.style.floatname == 'Listing') {
        A.idnum++;
        block.parts = A.parts;
        block.chapters = A.chapters;
        block.style.idnum = A.idnum;
        block.style.idtext = 'Listing';
      }
      block0 = block;
    })
    this.parser.blocks.forEach(block => {
      switch (block.sig) {
        case 'PART': this.do_PART(block); break;
        case 'HDGS': this.do_HDGS(block); break;
        case 'SAMP': this.do_SAMP(block); break;
        case 'PRIM': this.do_PRIM(block); break;
        case 'TEXT': this.do_TEXT(block); break;
        case 'PLST': this.do_PLST(block); break;
        case 'HRLE': this.do_HRLE(block); break;
        case 'FLOA': this.do_FLOA(block); break;
        default: break;
      }
    })
    ///putting them together
    var conflines = this.to_config_lines();
    if (this.conf('context.twocolumn')) {
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
    if (this.to_conf_titlepage()) {
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
    if (this.conf('context.toc')) {
      if (1) {
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
    var p_bodyfont = '';
    if (this.conf('context.papersize')) {
      var s = `\\setuppapersize[${this.conf('context.papersize')}]`;
      p_papersize = s;
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
    if (this.conf('context.layout')) {
      var s = this.conf('context.layout').split('\t');
      var s = `\\setuplayout[${s.join(',')}]`;
      p_layout = s;
    }
    //\\setupbodyfont[linuxlibertineo, ${ this.conf('bodyfontsizept') } pt]
    if (this.conf('context.bodyfont')) {
      var s = this.conf('context.bodyfont').split('\t');
      var s = `\\setupbodyfont[${s.join(',')}]`;
      p_bodyfont = s;
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

  make_line_array(math, label, gather, mainlabel) {
    if (label == '#') {
      label = '[+]';
    } else if (label) {
      label = `[${label}]`;
    } else if (mainlabel) {
      label = '[+]';
    }
    var lines = this.to_formula_math_array(math);
    lines = lines.map(pp => {
      if (gather) {
        var p = pp.join(' ');
      } else {
        var p = pp.join(' \\NC ');
      }
      var p = '\\NC ' + p + ' \\NR';
      return p;
    });
    lines[lines.length - 1] += label;
    return lines;
  }

  do_PART(block) {
    var { idnum, title } = block;
    var o = [];
    o.push(this.to_info(block));
    //var raw = text;
    var raw = this.smooth(title);
    var title = this.unmask(title);
    o.push(`\\startpart[title={${title}},reference={},bookmark={${raw}}]`);
    if(this.conf('context.partpage')){
      var s=this.conf('context.part').split('\t');
      var s=s.map(x => x.replace(/\$\{text\}/g,title));
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
      o.push(`{\\bfd ${title}}`);
      o.push(`\\stopalignment`);
      o.push(`\\page`);
    }
    o.push('');
    block.latex = o.join('\n');
  }    
  do_HDGS(block,conf){
    var {hdgn,subn,name,label,title,parser} = block;
    var o = [];
    o.push(this.to_info(block));
    //var raw = text;
    var raw = this.smooth(title);
    var title = this.unmask(title);
    subn = subn||0;
    var level = +hdgn + subn;
    ///assign this so that it can be used by toLatexDocument().
    if(level==0){
      if(name=='chapter'){
        o.push(`\\startchapter[title={${title}},reference={${label}},bookmark={${raw}}]`);
        o.push('');
      }else{
        o.push(`\\blank\\noindent {\\tfd ${title}}`);
        o.push(`\\blank`);
        o.push('');
      }
    }
    else if(level==1){
      o.push(`\\startsection[title={${title}},reference={${label}},bookmark={${raw}}]`);
      o.push('');
    } 
    else if(level==2){
      o.push(`\\startsubsection[title={${title}},reference={${label}},bookmark={${raw}}]`);
      o.push('');
    } 
    else if(level==3){
      o.push(`\\startsubsubsection[title={${title}},reference={${label}},bookmark={${raw}}]`);
      o.push('');
    }
    else {
      o.push(`\\startsubsubsubsection[title={${title}},reference={${label}},bookmark={${raw}}]`);
      o.push('');
    }
    block.latex = o.join('\n');
  }
  do_PLST(block){
    var {id,row1,row2,sig,items} = block;
    var o = [];
    o.push(this.to_info(block));
    let isbroad = 1;
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
          extra_text += `\n\n\\noindent ${this.untext(lines)}`;
        });
      }
      if(extra_text){
        extra_text = `\\blank\n${extra_text}`;
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
            let { keys, cat, desc } = ds;
            desc = this.unmask(desc);
            desc = desc || `{}`;
            keys = keys.map((key) => {
              key = this.polish(key);
              if (cat == 'quoted') {
                key = `\\quote{\\tt\\bf{}${key}}`;
              }
              else {
                key = `{\\bf{}${key}}`;
              }
              return key;
            });
            o.push(`\\item ${keys.join(', ')} ${nbsp}${desc} ${extra_text}`);
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
  do_SAMP(block){
    var {id,row1,row2,sig,body,parser} = block;
    body=body||[];
    var o = [];
    o.push(this.to_info(block));
    o.push(`\\startitemize[]`);
    o.push('\\starttyping')
    body.forEach((s) => {
      o.push(s);
    })    
    o.push('\\stoptyping')
    o.push('\\stopitemize');
    o.push('');
    block.latex = o.join('\n');
    this.needblank = 1;
  }
  do_HRLE(block){
    var {id,row1,row2,sig,title} = block;
    var o = [];
    o.push(this.to_info(block));
    title = this.unmask(title);
    o.push(`\\startformula`);
    o.push(`\\text{\\hl[10]}`);
    o.push(`\\stopformula`);
    o.push('');
    block.latex = o.join('\n');
  }
  do_PRIM(block){
    var {id,row1,row2,sig,hdgn,title,body,nspace} = block;
    var o = [];
    o.push(this.to_info(block));
    var v;
    let text;
    const indent = '~'.repeat(5);
    title = this.unmask(title);
    let s0 = body[0] || '';
    text = this.unmask(body.join('\n'));
    if (hdgn===1) {
      text = `{\\bf{}${title}}  ${s0 ? '' : '~'} ${text}`;
      o.push(`\\blank\\noindent ${text}`);
      o.push(`\\blank`);
      this.needblank = 1;
    } 
    else if (hdgn===2) {
      text = `{\\bi{}${title}}  ${s0 ? '' : '~'} ${text}`;
      o.push(`\\blank\\noindent ${text}`);
      o.push(`\\blank`);
      this.needblank = 1;
    } 
    else {
      text = `{\\bi{}${title}}  ${s0 ? '' : '~'} ${text}`;
      o.push(`\\blank\\noindent ${indent}${text}`);
      o.push(`\\blank`);
      this.needblank = 1;
    }
    o.push('');
    block.latex = o.join('\n');
  }
  do_TEXT(block){
    var {id,row1,row2,sig,hdgn,title,body,nspace} = block;
    var o = [];
    o.push(this.to_info(block));
    let text;
    if (nspace) {
      text = this.untext(body);
      o.push(`\\startitemize[]`);
      o.push(`\\blank`);
      o.push(`\\noindent`);
      o.push(text);
      o.push('\\stopitemize');
      o.push('');
    }
    else {
      text = this.untext(body);
      if (this.needblank) {
        this.needblank = 0;
        text = `\\blank ${text}`;
      }
      o.push(text);
    }
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
  do_FLOA(block) {
    var text = '';
    switch (block.floatname) {
      case 'Figure': {
        text = this.untext(block.body, block.style);
        break;
      }
      case 'Table': {
        text = this.untext(block.body, block.style);
        break;
      }
      case 'Equation': {
        text = this.untext(block.body, block.style);
        break;
      }
      case 'Vocabulary': {
        let itms = this.ss_to_vocabulary_itms(block.body, block.style, block.parser.rmap);
        itms.forEach(p => { p.text = this.unmask(p.raw); });
        text = this.itms_to_itemized(itms, block.style);
        break;
      }
      case 'Listing': {
        let caption = block.style.caption || '';
        var d = block.body.map((x, i) => {
          var line = x;
          var lineno = `${i + 1}`;
          while (lineno.length < 5) {
            lineno += '~';
          }
          var lineno = `{\\tt{}${lineno}}`;
          var line = this.polish(line);
          var line = line.replace(/\s/g, '~');
          var wholeline = `${lineno}${line}`;
          return (`${wholeline}\\hfill\\\\`);
        });
        text = d.join('\n');
        let o = [];
        o.push(`\\blank\\noindent {${block.style.idtext} ${block.style.idnum}: ${this.unmask(caption)}}`);
        o.push(`\\startlines`);
        o.push(text);
        o.push(`\\stoplines`);
        text = o.join('\n');
        break;
      }
    }
    if (1) {
      let o = [];
      o.push(this.to_info(block));
      o.push(text);
      text = o.join('\n');
    }
    block.latex = text;
  }
  do_math(block){
    var {id,row1,row2,sig,caption,label,islabeled,items} = block;
    var o = [];
    o.push(this.to_info(block));
    this.make_math(o,caption,label,islabeled,items,1);
    o.push('');
    block.latex = o.join('\n');
  }
  to_ruby (g) {
    let {rb,rt} = g;
    var s = this.phrase_to_ruby(rb,rt);
    return s;
  }
  phrase_to_ref (g){
    var { sig, label, floatname, idnum, refid, id} = g;
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

  to_uri(g) {
    return `\\hyphenatedurl{${g.href}}`
  }
  fence_to_diagram(ss,style){
    if (style.load) {
      let name0 = style.load;
      if (this.my_diagram_ss_maps.has(name0)) {
        let ss0 = this.my_diagram_ss_maps.get(name0);
        ss = ss0.concat(ss);
      }
    }
    if (style.save) {
      this.my_diagram_ss_maps.set(style.save, ss);
    }
    var {s} = this.diagram.to_diagram(ss,style);
    return s;
  }
  fence_to_framed(ss,style){
    var {s} = this.framed.to_framed(ss,'100%');
    return s;
  }
  fence_to_math(ss,style){
    if(style.floatname == 'Equation'){  
      let label = style.label || '';
      var text = this.make_line(ss.join('\n'), label, 1);
    }else{
      var text = this.make_line(ss.join('\n'), '', 0);
    }
    if (style.floatname == 'Equation') {
      let o = [];
      o.push(`\\setupformulas[align=center]`)
      o.push(text);
      text = o.join('\n');
    } else {
      let o = [];
      o.push(`\\setupformulas[align=right]`)
      o.push(text);
      text = o.join('\n');
    }
    return text;
  }
  to_math(itms,style) {
    let islabeled = (style.floatname=='Equation');
    let label = style.label||'';
    let labels = label.split(',');
    let ss = itms.map((p,i) => {
      let label = labels[i]||'';
      var line = this.make_line(p.math,label,islabeled);
      return line;
    })
    if(style.floatname=='Equation'){
      ss.unshift(`\\setupformulas[align=center]`)
    }else if(style.align=='center'){
      ss.unshift(`\\setupformulas[align=center]`)
    }else{
      ss.unshift(`\\setupformulas[align=right]`)
    }
    return ss.join('\n');
  }
  phrase_to_img(cnt) {
    let g = this.string_to_style(cnt);
    ///\externalfigure[cow.pdf][width = 1cm]
    ///\externalfigure[cow.pdf][height = 1cm]
    var src = g.src;
    var width = this.string_to_context_length(g.width);
    var height = this.string_to_context_length(g.height);
    this.imgs.push(src);
    if (width && height) {
      return `\\externalfigure[${src}][width=${width},height=${height}]`;
    } else if (width) {
      return `\\externalfigure[${src}][width=${width}]`;
    } else if (height) {
      return `\\externalfigure[${src}][height=${height}]`;
    } else {
      return `\\externalfigure[${src}]`;
    }
  }
  fence_to_tabulate(ss,style) {
    let rows = super.ss_to_tabulate_rows(ss,style);
    rows = rows.map((ss) => ss.map(s => {
      s = this.unmask(s);
      return s;
    }));
    let text = this.rows_to_tabulate(rows, style);
    if(style.floatname=='Table'){
      let o = [];
      let label = style.label||'';
      let caption = style.caption||'';
      o.push(`\\placetable`);
      o.push(`[here]`);
      o.push(`[${label}]`);
      o.push(`{${this.unmask(caption)}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
      o.push('');
      text = o.join('\n');
    }
    return text;
  }
  to_verse(ss) {
    var o = [];
    ss = ss.map(x => this.unmask(x));
    o.push('\\startlines')
    ss.forEach((s) => {
      o.push(s);
    })
    o.push('\\stoplines')
    return o.join('\n');
  }
  para_to_plaintext(ss,style) {
    let text = ss.join('\n');
    text = this.unmask(text,style);
    return text;
  }
  para_to_longtable(ss, style) {
    let itms = this.ss_to_tabulate_rows(ss,style);
    itms = itms.map(s => {
      s = this.unmask(s);
      return s;
    });
    style.caption = this.unmask(style.caption||'');
    return this.itms_to_longtable(itms, style);
  }
  para_to_multi(ss,style){
    let itms = this.para_to_multi_itms(ss);
    itms = itms.map(s => {
      s = this.unmask(s);
      return s;
    });
    return this.itms_to_multi(itms,style);
  }
  para_to_itemized(ss,style) {
    let itms = this.para_to_itemized_itms(ss);
    itms = itms.map(p => {
      let text = p.text;
      text = this.unmask(text);
      p.text = text;
      return p;
    });
    let text = this.itms_to_itemized(itms,style);
    return text;
  }
  para_to_blockquote(ss) {
    let text = ss.join('\n').trim();
    text = this.unmask(text);
    return `\\quotation{\\it{}${text}}`;
  }
  para_to_imgrid(ss,style){
    let itms = this.para_to_imgrid_itms(ss,style);
    itms.forEach(p => {
      p.sub = this.unmask(p.sub);
    })
    var text = this.imgs_to_combination(itms,style);
    if(style.floatname=='Figure'){
      let label = style.label||'';
      let caption = style.caption||'';
      let o = [];
      o.push(`\\placefigure`);
      o.push(`[here]`);
      o.push(`[${label}]`);
      o.push(`{${this.unmask(caption)}}`);
      o.push('{%');
      o.push(text);
      o.push('}');
      o.push('');
      text = o.join('\n');
    }
    return text;
  }
  to_br() {
    let text = '\\crlf';
    return text;
  }
  to_vspace(g){
    return `\\blank[${g.length}]`;
  }
  to_hspace(g){
    return `\\definehspace[hspace][${g.length}]\\hspace[${g.length}]`;
  }
  to_typeface (text,type) {
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
  
  phrase_to_ruby (base, top) {
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

  make_math(o,caption,label,islabeled,items,gather){
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
    items.forEach(x => {
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

  string_to_context_length(s) {
    /// take an input string that is 100% and convert it to '\textwidth'.
    /// take an input string that is 50% and convert it to '0.5\textwidth'.
    /// take an input string that is 10cm and returns "10cm"
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
          return `\\textwidth`;
        }
        return `${num}\\textwidth`;
      } else {
        return s;
      }
    }
    var re = /^(.*)(mm|cm|in|pt)$/;
    if (re.test(s)) {
      return s;
    }
    var num = parseFloat(s);
    if (Number.isFinite(num)) {
      return `${num.toFixed(3)}mm`;
    }
    return '';
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
  rows_to_tabulate(rows,style) {
    var border=style.border||0;
    var ncols = rows.length ? rows[0].length : 0;
    var nrows = rows.length;
    var d = [];
    var pcol = 'l'.repeat(ncols);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    d.push(`\\starttabulate[${pcol}]`);
    if(border==1){
      d.push('\\HL')
    }
    for (var j = 0; j < nrows; ++j) {
      var pp = rows[j];
      pp = pp.slice(0, ncols);
      if(this.pp_is_hline(pp)){
        d.push(`\\HL`)
        continue;
      }
      if(border==1){
        d.push(`\\VL ${pp.join(' \\VL ')} \\VL \\NR`);
        d.push('\\HL')
      }else{
        d.push(`\\NC ${pp.join(' \\NC ')} \\NC \\NR`);
      }
    }
    d.push('\\stoptabulate');
    var text = d.join('\n');
    ///style.float
    if(style.float){
      let f = (style.float=='left')?'left':'right';
      text = `\\placetable[none,${f}]{}{${text}}`;
    }
    return text;
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
  itms_to_multi(itms,style) {
    var n = parseInt(style.n);
    var n = n || itms.length;
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = 0.02;
    var frs = this.string_to_frs(style.fr, n);
    var d = [];
    var pcol = 'p'.repeat(n);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    d.push(`\\defineparagraphs[sidebyside][n=${n+n-1},before={\\blank[0pt]},after={\\blank[0pt]}]`);
    for(let i=0; i < n; i+=1){
      d.push(`\\setupparagraphs[sidebyside][${1+i+i}][width=${frs[i]*w}\\textwidth]`);
      d.push(`\\setupparagraphs[sidebyside][${1+i+i+1}][width=${gap}\\textwidth]`);
    }
    d.pop();///remove the last line for 'gap'
    for(let j=0; j < itms.length; j+=n){
      d.push(`\\startsidebyside`);
      let pp = itms.slice(j,j+n);
      for(let i=0; i < n; ++i){
        let text = pp[i] || '';
        d.push(text);
        if(i<n-1){
          d.push('\\sidebyside');
          d.push('\\sidebyside');
        }
      }
      d.push('\\stopsidebyside');
    }
    return d.join('\n');
    /*
    o.push(`\\blank`);
    o.push(`\\defineparagraphs[sidebyside][n=${ncols}]`);
    \setupparagraphs[mypar][1][width=.1\textwidth,style=bold]
    \setupparagraphs[mypar][2][width=.4\textwidth]
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
    var n = parseInt(style.n);
    var n = n || 1;
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
      if (n && n > 1) {
        return this.pp_to_multi_itemized(pp, style, 'n')
      }else{
        return (`\\startitemize[packed,n]\n${pp.join('\n')}\n\\stopitemize`);
      }
    }
    if (itms.length) {
      let pp = itms.map(p => `\\item ${p.text}`);
      if (n && n > 1) {
        return this.pp_to_multi_itemized(pp, style, '')
      } else {
        return (`\\startitemize[packed]\n${pp.join('\n')}\n\\stopitemize`);
      }
    }
    return (`\\startitemize[packed]\\item\n\\stopitemize`);
  }
  pp_to_multi_itemized(itms,style,name){
    var n = parseInt(style.n)||1;
    var m = Math.floor(itms.length / n);
    var z = itms.length - n * m;
    var k = z ? (m + 1) : (m);
    var w = (1 - (0.02 * (n - 1))) / n;
    var gap = 0.02;
    var frs = this.string_to_frs(style.fr, n);
    var d = [];
    var pcol = 'p'.repeat(n);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    d.push(`\\defineparagraphs[sidebyside][n=${n + n - 1},before={\\blank[0pt]},after={\\blank[0pt]}]`);
    for (let i = 0; i < n; i += 1) {
      d.push(`\\setupparagraphs[sidebyside][${1 + i + i}][width=${frs[i] * w}\\textwidth]`);
      d.push(`\\setupparagraphs[sidebyside][${1 + i + i + 1}][width=${gap}\\textwidth]`);
    }
    d.push(`\\startsidebyside`);
    for (let j = 0, i = 0; j < itms.length; i += 1, j += k) {
      var pp = itms.slice(j, j + k);
      d.push(`\\startitemize[packed,${name}]\n${pp.join('\n')}\n\\stopitemize`);
      if (i < n - 1) {
        d.push('\\sidebyside');
        d.push('\\sidebyside');
      }
    }
    d.push('\\stopsidebyside');
    return d.join('\n')
  }
  imgs_to_combination(itms,style){
    var frame = style.frame||0;
    var n = parseInt(style.n)||1;
    var m = Math.ceil(itms.length/n);
    var w = (1-(0.02*(n-1)))/n;
    var d = [];
    d.push(`{\\centeraligned{\\startcombination[${n}*${m}]`);
    for(var image of itms){
      var {src,width,height,sub} = image;
      var imgsrc = this.to_context_img_src(src);
      var sub_text = sub;
      let command = `\\externalfigure[${imgsrc}][width=${w}\\textwidth]`;
      if(frame){
        command = `\\framed{${command}}`;
      }
      d.push(`{${command}} {${sub_text}}`);
    }
    d.push(`\\stopcombination}}`);
    var text = d.join('\n');
    return text;
  }
  itms_to_longtable(itms, style) {
    var caption = style.caption || '';
    var label = style.label || '';
    var floatname = style.floatname || '';
    var fr = style.fr || '';
    var glue = style.glue || '';
    var hline = style.hline || 0;
    var n = parseInt(style.n);
    var n = n || itms.length;
    ///***NOTE: xltabular is percular of naming its columns
    let [t, h] = this.convert_longpadding('2 2');
    //let vlines = this.string_to_array(this.conf('general.longtable_v_lines'));
    //let hlines = this.string_to_array(this.conf('general.longtable_h_lines'));
    let vlines = this.string_to_array('*');
    let hlines = this.string_to_array('t m b r');
    var header = itms.slice(0, n);//pp could be shorter than n
    var d = [];
    /// adjust for the relative width
    var frs = this.string_to_frs(fr, n);
    var frs = this.ww_to_one(frs);
    var pp = frs.map((x, i) => `\\setupTABLE[c][${i + 1}][width=${x}\\textwidth]`);
    d.push(pp.join('\n'));
    /// setup for hlines
    d.push(`\\setupTABLE[frame=off]`);
    d.push(`\\setupTABLE[r][first][topframe=${(hlines.indexOf('t') >= 0) ? 'on' : 'off'}]`);
    d.push(`\\setupTABLE[r][first][bottomframe=${(hlines.indexOf('m') >= 0) ? 'on' : 'off'}]`);
    d.push(`\\setupTABLE[r][last][bottomframe=${(hlines.indexOf('b') >= 0) ? 'on' : 'off'}]`);
    d.push(`\\setupTABLE[r][each][bottomframe=${(hlines.indexOf('r') >= 0) ? 'on' : 'off'}]`);
    /// setup for vlines
    if (vlines.indexOf('*') >= 0) {
      d.push(`\\setupTABLE[c][each][leftframe=on]`);
      d.push(`\\setupTABLE[c][each][rightframe=on]`);
    } else {
      for (var j = 1; j <= n; j++) {
        d.push(`\\setupTABLE[c][${j}][leftframe=${vlines.indexOf(`${j - 1}`) >= 0 ? 'on' : 'off'}]`);
        if (j == n) {
          d.push(`\\setupTABLE[c][${j}][rightframe=${vlines.indexOf(`${j}`) >= 0 ? 'on' : 'off'}]`);
        }
      }
    }
    /// writing table
    d.push(`\\bTABLE[loffset=${h}pt,roffset=${h}pt,toffset=${t}pt,boffset=${t}pt,split=repeat,option=stretch]`);
    d.push(`\\bTABLEhead`);
    d.push(`\\bTR \\bTH ${header.join(' \\eTH \\bTH ')} \\eTH \\eTR`);
    d.push(`\\eTABLEhead`);
    d.push(`\\bTABLEbody`);
    for (let j = n; j < itms.length; j += n) {
      let pp = itms.slice(j, j + n);//pp could be shorter than n
      pp = pp.map(x => `{${x}}`);
      d.push(`\\bTR \\bTD ${pp.join(' \\eTD \\bTD ')} \\eTD \\eTR`);
    }
    d.push(`\\eTABLEbody`);
    d.push(`\\eTABLE`);
    var text = d.join('\n');
    if (floatname=='Table') {
      d = [];
      d.push(`\\placetable`);
      d.push(`[split]`);
      d.push(`[${label}]`);
      d.push(`{${caption}}`);
      d.push('{%');
      d.push(text);
      d.push('}');
      text = d.join('\n');
    } else {
      d = [];
      d.push(`\\placetable[split,none]{}{%`);
      d.push(text);
      d.push(`}`);
      text = d.join('\n');      
    }
    return text;
  }
  itms_to_cols(itms, n) {
    var n = parseInt(n);
    var n = n || 1;
    var m = Math.floor(itms.length / n);
    var z = itms.length - n * m;
    var k = z ? (m + 1) : (m);
    var cols = [];
    for (var j = 0; j < itms.length; j += k) {
      var pp = itms.slice(j, j + k);
      cols.push(pp);
    }
    var d = [];
    var pcol = 'l'.repeat(n);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    var h = 4;
    var t = 0;
    d.push(`\\starttabulate[${pcol}]`);
    for (var j = 0; j < k; ++j) {
      var pp = cols.map(x => x[j] || '');
      d.push(`\\NC ${pp.join(' \\NC ')} \\NC \\NR`);
    }
    d.push('\\stoptabulate');
    return d.join('\n');
  }
  itms_to_rows(itms, n) {
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
    var d = [];
    var pcol = 'l'.repeat(n);
    var pcols = pcol.split('');
    var pcol = pcols.join('|');
    var pcol = `|${pcol}|`;
    var h = 4;
    var t = 0;
    d.push(`\\starttabulate[${pcol}]`);
    for (var j = 0; j < rows.length; ++j) {
      var pp = rows[j];
      if (this.pp_is_hline(pp)) {
        d.push(`\\HL`);
        continue;
      }
      d.push(`\\NC ${pp.join(' \\NC ')} \\NC \\NR`);
    }
    d.push('\\stoptabulate');
    return d.join('\n');
  }
}

module.exports = { NitrilePreviewContext };
