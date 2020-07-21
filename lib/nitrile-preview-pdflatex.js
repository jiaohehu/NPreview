'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');

class NitrilePreviewPdflatex extends NitrilePreviewLatex {

  constructor() {
    super();
    this.name='PDFLATEX';
    /// All the layout dimensions are in 'mm'
    this.xconfig.title = '';
    this.xconfig.author = '';
    this.xconfig.leftmargin = 40;
    this.xconfig.rightmargin = 40;
    this.xconfig.topmargin = 20;
    this.xconfig.bodyfontsizept = '';
    this.xconfig.diagfontsizept = 12;
    this.xconfig.papersize = 'a4paper';
    this.xconfig.twoside = 0;///set to '1' to enable
    this.xconfig.twocolumn = 0;///set to '1' to enable
    this.xconfig.toc = 0;///when set to 1 '\tableofcontents' will be inserted
    this.xconfig.documentclass = '';///set to 'book','scrbook', etc.
    this.xconfig.docstyle = 0;///0=auto;1=article;2=report
    this.xconfig.frontpage = 0;//1=title page will be generated
    this.xconfig.maxn = 44;//maximum line number for each "float" Program
    this.xconfig.step = 5;//5mm left-padding for some
    this.xconfig.nipass = 'small';
    this.xconfig.nisamp = 'small';
    this.xconfig.nitabr = 'small';
    this.xconfig.nilong = 'small';
    this.xconfig.nitabb = 'small';
    this.xconfig.nitabu = 'small';
    this.xconfig.nicaption = 'small';
    this.xconfig.niprog = 'footnotesize';
    this.xconfig.extra = '';
    this.xconfig.autonum = 0;
  }

  fontify_latex (text) {
    return text;
  }

  to_pdf_document() {
    var conflines = this.to_config_lines();
    var texlines = this.xparser.blocks.map(x => x.latex);
    var documentclass = this.xconfig.documentclass;
    var toclines = [];
    var titlelines = [];
    var opts = [];
    if (!documentclass) {
      documentclass = (this.xconfig.ismaster)?'report':'article';
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
