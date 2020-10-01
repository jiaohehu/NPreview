'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const unijson = require('./nitrile-preview-unicode');

class NitrilePreviewReport extends NitrilePreviewLatex {

  constructor(parser) {
    super(parser);
    this.frames = 0;
    this.ending = '';
    this.num_parts = 0;
    this.num_chapters = 0;
  }
  to_conf_step(){
    return this.conf('latex.step','5mm');
  }
  do_starttranslate(){
    super.do_starttranslate();
  }
  do_endtranslate(){
    var o = [];
    this.ending = o.join('\n');
  }
  do_identify(block,A){
    if (!A.count) {
      A.count = 1;
      A.frames = 0;
    }
    let { sig, hdgn } = block;
    if (sig == 'HDGS' && hdgn == 0) {
      block.idnum = '';
    }
    else if (sig == 'HDGS' && hdgn == 1) {
      A.frames++;
      let idnum = `${A.frames}`;
      block.idnum = idnum;
    } 
  }
  to_report_document() {
    var top = this.to_top_part(this.parser.blocks);
    var tex = this.to_report(top);
    var titlelines = this.to_titlelines();
    var toclines = this.to_toclines();
    var p_latex_program = this.to_latex_program();
    var p_locale_packages = this.to_locale_packages();
    var p_core_packages = this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();
    var p_geometry_layout = this.to_geometry_layout();
    var p_fonts_layout = this.to_fonts_layout();
    var p_post_setups = this.to_post_setups();
    var p_report_class = this.to_report_class();
    var p_report_opt = this.to_report_opt();
    return     `\
%!TeX program=${p_latex_program}
\\documentclass[${p_report_opt}]{${p_report_class}}
${p_locale_packages}
${p_core_packages}
${p_extra_packages}
${p_geometry_layout}
${p_fonts_layout}
${p_post_setups}
\\begin{document}
${titlelines.join('\n')}
${titlelines.length?'\\maketitle':''}
${toclines.join('\n')}
${tex}
${this.ending}
\\end{document}
`;
  }
  to_top_part(blocks) {
    var top = [];
    var o = top;
    for (let block of blocks) {
      let { sig, hdgn } = block;
      if (sig == 'FRNT'){
        top.push(block);
      }
      if (sig == 'PART') {
        this.num_parts += 1;
        o = [];
        top.push(o);
        o.push(block);
        continue;
      }
      if(o){
        o.push(block);
      }
    }
    top = top.map(o => {
      if (Array.isArray(o)) {
        o = this.to_top_chapter(o);
      }
      return o;
    })
    return top;
  }
  to_top_chapter(blocks) {
    var top = [];
    var o = top;
    for (let block of blocks) {
      let { sig, hdgn } = block;
      if (sig == 'FRNT'){
        top.push(block);
      }
      if (sig == 'HDGS' && hdgn == 0) {
        this.num_chapters += 1;
        o = [];
        top.push(o);
        o.push(block);
        continue;
      }
      if(o){
        o.push(block);
      }
    }
    top = top.map(o => {
      if (Array.isArray(o)) {
        o = this.to_top_section(o);
      }
      return o;
    })
    return top;
  }
  to_top_section(blocks) {
    var top = [];
    var o = top;
    for (let block of blocks) {
      let { sig, hdgn } = block;
      if (sig == 'FRNT'){
        top.push(block);
      }
      if (sig == 'HDGS' && hdgn == 1) {
        o = [];
        top.push(o);
        o.push(block);
        continue;
      }
      if(o){
        o.push(block);
      }
    }
    top = top.map(o => {
      if (Array.isArray(o)) {
        o = this.to_top_subsection(o);
      }
      return o;
    })
    return top;
  }
  to_top_subsection(blocks) {
    var top = [];
    var o = top;
    for (let block of blocks) {
      let { sig, hdgn } = block;
      if (sig == 'HDGS' && hdgn == 2) {
        o = [];
        top.push(o);
        o.push(block);
        continue;
      }
      o.push(block);
    }
    top = top.map(o => {
      if (Array.isArray(o)) {
        o = this.to_top_subsubsection(o);
      }
      return o;
    })
    return top;
  }
  to_top_subsubsection(blocks) {
    var top = [];
    var o = top;
    for (let block of blocks) {
      let { sig, hdgn } = block;
      if (sig == 'HDGS' && hdgn >= 3) {
        o = [];
        top.push(o);
        o.push(block);
        continue;
      }
      o.push(block);
    }
    return top;
  }
  to_report(top) {
    let all = [];
    top.forEach((o, i) => {
      if (Array.isArray(o)) {
        let data = this.to_report_part(o);
        all.push(data);
      } else {
        all.push(o.latex);
      }
    });
    return all.join('\n');
  }
  to_report_part(top) {
    let my = top.shift();
    let all = [];
    all.push('');
    all.push(`\\part{${this.unmask(my.title)}}`);
    top.forEach((o, i) => {
      if (Array.isArray(o)) {
        var data = this.to_report_chapter(o);
        all.push(data);
      } else {
        all.push(o.latex);
      }
    });
    return all.join('\n');
  }
  to_report_chapter(top) {
    let my = top.shift();
    let all = [];
    all.push('');
    all.push(`\\chapter{${this.unmask(my.title)}}`);
    top.forEach((o, i) => {
      if (Array.isArray(o)) {
        var data = this.to_report_section(o);
        all.push(data);
      } else {
        all.push(o.latex);
      }
    });
    return all.join('\n');
  }
  to_report_section(top) {
    let my = top.shift();
    let all = [];
    all.push('');
    all.push(`\\section{${this.unmask(my.title)}}`);
    top.forEach((o, i) => {
      if (Array.isArray(o)) {
        var data = this.to_report_subsection(o);
        all.push(data);
      } else {
        all.push(o.latex);
      }
    });
    return all.join('\n');
  }
  to_report_subsection(top) {
    let my = top.shift();
    let all = [];
    all.push('');
    all.push(`\\subsection{${this.unmask(my.title)}}`);
    top.forEach((o,i) => {
      if(Array.isArray(o)){
        var data = this.to_report_subsubsection(o);
        all.push(data);
      }else{
        all.push(o.latex);
      }
    });
    return all.join('\n');
  }
  to_report_subsubsection(top) {
    let my = top.shift();
    let all = [];
    all.push('');
    all.push(`\\subsubsection{${this.unmask(my.title)}}`);
    top.forEach((o,i) => {
      if(Array.isArray(o)){
      }else{
        all.push(o.latex);
      }
    });
    return all.join('\n');
  }
  to_titlelines(){
    var titlelines = [];
    var block = this.parser.blocks[0];
    if (block && block.sig == 'FRNT') {
      let data = block.data;
      for (let t of data) {
        let [key, val] = t;
        if (key == 'title') {
          titlelines.push(`\\title{${this.unmask(val)}}`);
        }
        else if (key == 'author') {
          titlelines.push(`\\author{${this.unmask(val)}}`);
        }
      }
    }
    return titlelines;
  }
}
module.exports = { NitrilePreviewReport }
