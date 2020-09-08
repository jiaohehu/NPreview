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
    if (sig == 'HDGS' && hdgn == 0) {
      block.idnum = '';
    }
    else if (sig == 'HDGS' && hdgn == 1) {
      A.frames++;
      let idnum = `${A.frames}`;
      block.idnum = idnum;
    } 
  }
  to_beamer_document() {
    var p_core_packages = this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();
    var top = this.to_tops(this.parser.blocks);
    var tex = this.to_beamer(top);
    //var texlines = this.parser.blocks.map(x => x.latex);
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
${titlelines.length?'\\maketitle':''}
${toclines.join('\n')}
${tex}
${this.ending}
\\end{document}
`;
  }
  to_tops(blocks) {
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
        let data = this.to_beamer_frame(o);
        d.push(data);
      }
    });
    return d.join('\n');
  }
  to_beamer_frame(top) {
    let my = top.shift();
    let d = [];
    let w = [];
    let all = [];
    d.push(`\\frametitle{${my.idnum} ${this.unmask(my.text)}}`);
    top.forEach((o, i) => {
      if (Array.isArray(o)) {
        var data = this.to_beamer_solution(o);
        w.push(data);
      } else {
        d.push(o.latex);
      }
    });
    if(d.length==1){
      ///multiply choices
      ///the titles of w is the title of the choice
      for(let j=-1; j < w.length; ++j){        
        all.push(`\\begin{frame}[t]`);
        all.push(d.join('\n'));
        all.push(`\\begin{itemize}`);
        w.forEach(({title,data},i) => {
          let sym = (i==j)?'$\\CheckedBox$':'$\\Square$';
          all.push(`\\item[${sym}] ${title}`);
        });
        all.push(`\\end{itemize}`);
        if(j>=0){
          let {title,data,body} = w[j];
          all.push(body.join('\n'));
        }
        all.push(`\\end{frame}`);
        all.push('');
      }
    }else{
      ///multiple solutions
      let problem = d.join('\n');
      all.push(`\\begin{frame}[t]`)
      all.push(problem);
      if(w.length){
        all.push(``)
        all.push('\\begin{flushleft}');
        w.forEach((o,i) => {
          let {title,data} = o;
          all.push(`$\\Square$ {${title}}`);//already unmasked
          if(i < w.length-1){
            all.push(`\\hfill\\break`)
          }
        })
        all.push('\\end{flushleft}')
        all.push(``)
      }
      all.push(`\\end{frame}`);
      w.forEach(o => {
        let {title,data} = o;
        all.push(`\\begin{frame}[t]`);
        d[0] =(`\\frametitle{${my.idnum} ${this.unmask(my.text)} }`);
        let problem = d.join('\n');
        all.push(problem);
        all.push('');
        all.push(data.join('\n'));
        all.push(`\\end{frame}`);
      })
    }
    return all.join('\n');
  }
  to_beamer_solution(top) {
    let my = top.shift();
    let d = [];
    d.push(``)
    d.push(`\\begin{flushleft}`)
    d.push(`$\\CheckedBox$ {${this.unmask(my.text)}}`);
    d.push(`\\end{flushleft}`)
    d.push(``)
    top.forEach((o,i) => {
      d.push(o.latex);
    });
    let data = d;
    let title = this.unmask(my.text);
    let body = data.slice(5);
    return {title,data,body};
  }
  to_titlelines(){
    var titlelines = [];
    var block = this.parser.blocks[0];
    if(block && block.sig=='FRNT'){
      let data = block.data;
      for(let t of data){
        let [key,val] = t;
        if(key=='title'){
          titlelines.push(`\\title{${this.unmask(val)}}`);
        }
        else if(key=='subtitle'){
          titlelines.push(`\\subtitle{${this.unmask(val)}}`);
        }
        else if(key=='author'){
          titlelines.push(`\\author{${this.unmask(val)}}`);
        }
        else if(key=='institute'){
          titlelines.push(`\\institute{${this.unmask(val)}}`);
        }
      }
    }
    return titlelines;
  }
}
module.exports = { NitrilePreviewBeamer }
