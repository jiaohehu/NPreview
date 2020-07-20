'use babel';

const { NitrilePreviewLatex } = require('./nitrile-preview-latex');

class NitrilePreviewLualatex extends NitrilePreviewLatex {
  constructor() {
    super('LUALATEX');
  }
  toDocument() {
    var conflines = this.toConfigLines();
    var texlines = this.xparser.blocks.map(x => x.latex);
    var opts = [];
    var titlelines = [];
    var toclines = [];
    var documentclass = this.xconfig.documentclass;
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
      packages=this.to_required_packages_lualatex_memoir();
    }else{
      packages=this.to_required_packages_lualatex();
    }
    var extra_packages = this.to_extra_packages();
    return     `\
% !TEX program = LuaLatex
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
  }

  to_required_packages_lualatex () {
    //LuaLatex
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

    return `\\usepackage{microtype}
\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\newjfontfamily\\de{dejavusans}
\\newjfontfamily\\za{zapfdingbats}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
\\usepackage[${geometry_opts.join(',')}]{geometry}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{unicode-math}
\\usepackage{xfrac}
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
\\usepackage{anyfontsize}
\\usepackage{luamplib}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{xtab}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
\\usepackage{bookmark}
`
  }

  to_extra_packages() {
    var extra = this.xconfig.extra;
    return extra.split('\t').join('\n');
  }

  to_required_packages_lualatex_memoir() {

    return `\\usepackage{microtype}
\\let\\saveprintglossary\\printglossary
\\let\\printglossary\\relax
\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\let\\printglossary\\saveprintglossary
\\let\\saveprintglossary\\relax
\\newjfontfamily\\de{dejavusans}
\\newjfontfamily\\za{zapfdingbats}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{commath}
\\usepackage{unicode-math}
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
\\usepackage{luamplib}
\\usepackage[normalem]{ulem}
\\usepackage{xltabular}
\\usepackage{xtab}
\\usepackage{tabulary}
\\usepackage{xcolor}
\\usepackage[export]{adjustbox}
\\usepackage{bookmark}
%%% command to define \mplibtoPDF command
\\def\\mplibtoPDF#1{\\special{pdf:literal direct #1}}
`;
  }

}
module.exports = { NitrilePreviewLualatex };
