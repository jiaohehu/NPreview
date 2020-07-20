'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');

class NitrilePreviewPdflatex extends NitrilePreviewLatex {

  constructor(name='PDFLATEX') {
    super(name);
  }

  fontify_latex (text) {
    return text;
  }

  toDocument() {
    var conflines = this.toConfigLines();
    var texlines = this.xparser.blocks.map(x => x.latex);
    var documentclass = this.xconfig.documentclass;
    var toclines = [];
    var titlelines = [];
    var opts = [];
    if (!documentclass) {
      documentclass = (this.ismaster)?'report':'article';
    }
    if (this.xconfig.twocolumn) {
      opts.push('twocolumn');
    }
    if (this.xconfig.bodyfontsizept) {
      opts.push(`${this.xconfig.bodyfontsizept}pt`);
    }
    if(this.xconfig.frontpage){
      titlelines.push(`\\title{${this.escape(this.xconfig.title)}}`);
      titlelines.push(`\\author{${this.escape(this.xconfig.author)}}`);
      titlelines.push(`\\maketitle`);
    }
    if(this.xconfig.toc){
      toclines.push(`\\tableofcontents`);
    } 
    var packages = '';
    if(documentclass==='memoir'){
      packages=this.to_required_packages_pdflatex_memoir();
    }else{
      packages=this.to_required_packages_pdflatex();
    }
    var extra_packages = this.to_extra_packages();
    var data = `\
% !TEX program = PdfLatex
${conflines.join('\n')}
\\documentclass[${opts.join(',')}]{${documentclass}}
${packages}
${extra_packages}
\\begin{document}
${titlelines.join('\n')}
${toclines.join('\n')}
${texlines.join('\n')}
\\end{document}
`;
    return data;
  }

  to_required_packages_pdflatex () {

    var geometry_opts = [];
    geometry_opts.push(`left=${this.xconfig.leftmargin}mm`);
    geometry_opts.push(`right=${this.xconfig.rightmargin}mm`);
    geometry_opts.push(`top=${this.xconfig.topmargin}mm`);
    if (this.xconfig.papersize) {
      geometry_opts.push(this.xconfig.papersize);
    }
    if (this.xconfig.twoside) {
      geometry_opts.push('twoside');
    }
    return `\\usepackage[utf8x]{inputenc}
\\usepackage[${geometry_opts.join(',')}]{geometry}
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
\\usepackage{bookmark}
\\usepackage{anyfontsize}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{xtab}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
`
  }

  to_extra_packages() {
    var extra = this.xconfig.extra;
    return extra.split('\t').join('\n');
  }

  to_required_packages_pdflatex_memoir() {

    return `\\usepackage{microtype}
\\usepackage[utf8x]{inputenc}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{xfrac}
\\usepackage{caption}
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
\\usepackage{anyfontsize}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
\\usepackage{bookmark}
`;
  }

}

module.exports = { NitrilePreviewPdflatex };
