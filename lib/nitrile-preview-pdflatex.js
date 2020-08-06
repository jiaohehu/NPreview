'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');

class NitrilePreviewPdflatex extends NitrilePreviewLatex {

  constructor(parser) {
    super(parser);
    this.name='PDFLATEX';
  }
  fontify_latex (text) {
    return text;
  }

  _to_pdflatex_document() {
    var conflines = this.to_config_lines();
    var texlines = this.parser.blocks.map(x => x.latex);
    var toclines = [];
    var titlelines = [];
    var my_documentclass = this.conf('documentclass');
    var my_documentclassopt = '';
    if (!my_documentclass) {
      my_documentclass = (this.conf('ismaster'))?'report':'article';
    }
    if(this.conf('documentclassopt')){
      my_documentclassopt=this.conf('documentclassopt').split('\t').join(',');
    }
    if(this.conf('titlepage')){
      titlelines.push(`\\title{${this.unmask(this.conf('title'))}}`);
      titlelines.push(`\\author{${this.unmask(this.conf('author'))}}`);
      titlelines.push(`\\maketitle`);
    }
    if(this.conf('toc')){
      toclines.push(`\\tableofcontents`);
    } 
    var my_required_packages = '';
    if(my_documentclass==='memoir'){
      my_required_packages=this.to_required_packages_pdflatex_memoir();
    }else{
      my_required_packages=this.to_required_packages_pdflatex();
    }
    var my_extra_packages = this.to_extra_packages();
    var data = `\
%!TeX program=PdfLatex
${conflines.join('\n')}
\\documentclass[${my_documentclassopt||''}]{${my_documentclass}}
${my_required_packages}
${my_extra_packages}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
    return data;
  }

  to_pdflatex_document() {
    var conflines = this.to_config_lines();
    var texlines = this.parser.blocks.map(x => x.latex);
    var titlelines = [];
    var toclines = [];
    var documentclass = this.conf('documentclass');
    if (!documentclass) {
      documentclass = (this.parser.ismaster)?'report':'article';
    }
    if(this.conf('documentclassopt')){
      var p_documentclassopt=this.conf('documentclassopt').split('\t').join(',');
    }
    if(this.conf('titlepage')){
      titlelines.push(`\\title{${this.unmask(this.conf('title'))}}`);
      titlelines.push(`\\author{${this.unmask(this.conf('author'))}}`);
      titlelines.push(`\\maketitle`);
    }
    if(this.conf('toc')){
      toclines.push(`\\tableofcontents`);
    } 
    var packages = '';
    packages=this.to_required_packages_pdflatex();
    var extra_packages = this.to_extra_packages();
    return     `\
%!TeX program=LuaLatex
${conflines.join('\n')}
\\documentclass[${p_documentclassopt||''}]{${documentclass}}
${packages}
${extra_packages}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
  }


  to_required_packages_pdflatex () {
    var p_layout = '';
    if (this.conf('geometry')) {
      var s = this.conf('geometry');
      var s = s.split('\t').join(',');
      var p_layout = `\\usepackage[${s}]{geometry}`;
    }
    return `\\usepackage[utf8x]{inputenc}
\\usepackage[T1]{fontenc}
${p_layout}
\\usepackage{graphicx}
\\usepackage{caption}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{xfrac}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage{pifont}
\\usepackage{marvosym}
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
\\usepackage{changepage}
\\usepackage{listings}
\\usepackage{anyfontsize}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{xtab}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
\\usepackage{url}
`
  }

  to_extra_packages() {
    var extra = this.conf('extra');
    return extra.split('\t').join('\n');
  }

  to_required_packages_pdflatex_memoir() {

    return `\\usepackage[utf8x]{inputenc}
\\usepackage[T1]{fontenc}
${p_layout}
\\usepackage{graphicx}
\\usepackage{caption}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{xfrac}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage{pifont}
\\usepackage{marvosym}
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
\\usepackage{changepage}
\\usepackage{listings}
\\usepackage{anyfontsize}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{xtab}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
\\usepackage{url}
`;
  }

}

module.exports = { NitrilePreviewPdflatex };
