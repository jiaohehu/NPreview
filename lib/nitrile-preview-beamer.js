'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const unijson = require('./nitrile-preview-unicode');

class NitrilePreviewBeamer extends NitrilePreviewLatex {

  constructor(parser) {
    super(parser);
    this.frames = 0;
    this.ending = '';
  }
  to_conf_step(){
    return this.conf('latex.step','5mm');
  }
  do_starttranslate(){
    this.fnsmap = new Map();
    if(this.conf('latex.fonts')){
      var ss = this.conf('latex.fonts').split('\t');
      ss.forEach(x => {
        let [fn,fnt] = ss.split(',');
        this.fnsmap.set(fn,fnt); 
      });
    }
  }
  do_endtranslate(){
    var o = [];
    if(this.frames){
      o.push(`\\end{frame}`); 
    }
    this.ending = o.join('\n');
  }
  do_identify(block,A){
    if (!A.count) {
      A.count = 1;
      A.frames = 0;
    }
    let { sig, hdgn } = block;
    if (sig == 'HDGS' && hdgn == 1) {
      A.frames++;
      let idnum = `${A.frames}`;
      block.idnum = idnum;
    } 
  }
  do_part(block){
  }
  do_hdgs(block){
    var {hdgn,text,name,subn,idnum,label,parser} = block;
    var text = this.unmask(text);//note that it might have something like \jp
                                 //which is fine because the "bookmark" package 
                                 //will remove it

    if(hdgn == 0){
      var o = [];
      o.push('');
      o.push(`\\begin{frame}`);
      o.push(`\\begin{flushleft}`);
      o.push(`\\noindent{\\huge ${text}}`);
      o.push(`\\end{flushleft}`);
      o.push(`\\end{frame}`);
      block.latex = o.join('\n'); 
    }
    else if(hdgn == 1){
      var o = [];
      if(this.frames){
        o.push(`\\end{frame}`); 
      }
      o.push('');
      o.push(`\\begin{frame}`);
      o.push(`\\frametitle{${idnum} ${text}}`);
      block.latex = o.join('\n');
      this.frames = 1;
    }
  }
  do_mult(block){
    var {more} = block;
    var o = [];
    let n = more.length;
    let p = `${this.fix(1/n)}`
    o.push(`\\begin{columns}`);
    more.forEach((text,i) => {
      o.push(`\\begin{column}{${p}\\linewidth}`);
      o.push(this.unmask(text));
      o.push(`\\end{column}`);
    });
    o.push(`\\end{columns}`);
    block.latex = o.join('\n');
  }
  to_beamer_document() {
    var p_core_packages = this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();
    var texlines = this.parser.blocks.map(x => x.latex);
    var titlelines = this.to_titlelines();
    var toclines = this.to_toclines();
    var p_core_packages = this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();

    return     `\
%!TeX program=PdfLatex
\\documentclass{beamer}
\\usepackage[utf8x]{inputenc}
\\usepackage[T1]{fontenc}
${p_core_packages}
${p_extra_packages}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
${this.ending}
\\end{document}
`;
  }
  to_frames(blocks) {
    var top = [];
    var o = top;
    for (let block of blocks) {
      let { sig, hdgn } = block;
      if (sig == 'HDGS' && hdgn <= 1) {
        o = [];
        top.push(o);
        o.push(block);
        continue;
      }
      o.push(block);
    }
    top = top.map(o => {

      if (Array.isArray(o)) {
        o = this.to_solutions(o);
      }
      return o;
    })
    return top;
  }
  to_solutions(blocks) {
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
    return top;
  }
  to_beamer(top) {
    let d = [];
    top.forEach((o, i) => {
      if (Array.isArray(o)) {
        let data = this.to_html_frame(o);
        d.push(data);
      } else {
        d.push(o.html);
      }
    });
    return d.join('\n');
  }
  to_beamer_frame(top) {
    let my = top.shift();
    let d = [];
    d.push(`<div class='slide'>`);
    d.push(my.html);
    top.forEach((o, i) => {
      if (Array.isArray(o)) {
        var data = this.to_html_solution(o);
        d.push(data);
      } else {
        d.push(o.html);
      }
    });
    d.push(`</div>`);
    return d.join('\n');
  }
  to_beamer_solution(top) {
    let my = top.shift();
    let d = [];
    d.push(`<button style='display:block' onclick="document.getElementById('${my.idnum}').hidden^=true">${this.unmask(my.text)}</button>`);
    d.push(`<div hidden id='${my.idnum}'>`);
    top.forEach(o => {
      d.push(o.html);
    });
    d.push(`</div>`);
    return d.join('\n');
  }
}
module.exports = { NitrilePreviewBeamer }
