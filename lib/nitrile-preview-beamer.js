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
    super.do_starttranslate();
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
    ///do translate
    this.do_starttranslate();
    let A = {};
    let block0 = null;
    this.parser.blocks.forEach(block => {
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
      else if (sig == 'FLOA' && block.floatname == 'Equation' && block0 && block0.floatname == 'Equation'){
        block0.style.no_end = 1;
        block.style.no_begin = 1;
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
    this.do_endtranslate();
    ///start putting together
    var titlelines = this.to_titlelines();
    var toclines = this.to_toclines();
    var p_latex_program = this.to_latex_program();
    var p_locale_packages = this.to_locale_packages();
    var p_core_packages = this.to_core_packages();
    var p_extra_packages = this.to_extra_packages();
    var p_fonts_layout = this.to_fonts_layout();
    var p_post_setups = this.to_post_setups();
    var top = this.to_tops(this.parser.blocks);
    var tex = this.to_beamer(top);
    return     `\
%!TeX program=${p_latex_program}
\\documentclass{beamer}
${p_locale_packages}
${p_core_packages}
${p_extra_packages}
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
  to_tops(blocks) {
    var tops = [];
    var o = null;
    for (let block of blocks) {
      let { sig, hdgn } = block;
      if (sig == 'FRNT'){
        tops.push(block);
      }
      if (sig == 'HDGS' && hdgn == 1) {
        o = [];
        tops.push(o);
        o.push(block);
        continue;
      }
      if(o){
        o.push(block);
      }
    }
    tops = tops.map(o => {

      if (Array.isArray(o)) {
        o = this.to_solutions(o);
      }
      return o;
    })
    return tops;
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
    d.push(`\\frametitle{${my.idnum} ${this.unmask(my.title)}}`);
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
        if(j==-1){
          all.push(`\\frametitle{${my.idnum} ${this.unmask(my.title)}}`);
        }else{
          all.push(`\\frametitle{${my.idnum} ${this.unmask(my.title)} (Cont.)}`);
        }
        if(w.length){
          all.push(`\\begin{itemize}`);
          w.forEach(({title,data},i) => {
            let sym = (i==j)?'$\\CheckedBox$':'$\\Square$';
            all.push(`\\item[${sym}] ${title}`);
            if(i>=0 && i==j){
              all.push('');
              let {title,data,body} = w[i];
              all.push(body.join('\n'));
              all.push('');
            }
          });
          all.push(`\\end{itemize}`);
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
        d[0] =(`\\frametitle{${my.idnum} ${this.unmask(my.title)} (${title})}`);
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
    d.push(`$\\CheckedBox$ {${this.unmask(my.title)}}`);
    d.push(`\\end{flushleft}`)
    d.push(``)
    top.forEach((o,i) => {
      d.push(o.latex);
    });
    let data = d;
    let title = this.unmask(my.title);
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
