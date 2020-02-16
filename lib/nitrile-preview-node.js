const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewAutonum } = require('./nitrile-preview-autonum');
const { NitrilePreviewEpub } = require('./nitrile-preview-epub');
const utils = require('./nitrile-preview-utils');
const fs = require('fs');
const path = require('path');

class NitrilePreviewNode {

  async getFlows(fname,parser) {
    var out = await utils.readFileAsync(fname);
    var [blocks,flags] = parser.toFlow(out.split('\n'),fname);
    var isarticle = !utils.getBool(flags.book);
    var subs = [];
    if (!isarticle) {
      var subs = parser.toSubs(blocks);
      var proms = subs.map ( sub => this.getSubFlow(fname,sub,parser) );
      for (var j in proms) {
        subs[j].flow = await proms[j];
      }
    }
    return [blocks,flags,isarticle,subs];
  }
  async getSubFlow (fname,sub,parser) {
    let { subfname, sublevel, subpart, subrow } = sub;
    if (sublevel < 0) {
      var o = [];
      o.push(parser.newPARTblock (subrow,subpart));
      return [o,{},[]];
    }
    var fsubfname = path.join(path.dirname(fname),subfname);
    var flow = await this.fetchFlow(sub,fsubfname,parser);
    return flow;
  }
  async fetchFlow (sub,fsubfname,parser) {
    try {
      var out = await utils.readFileAsync(fsubfname);
      var flow = parser.toFlow(out.split('\n'),fsubfname);
      return flow;
    } catch (e) {
      var o = [];
      o.push(parser.newHDGSblock(e.toString(),fsubfname));
      var flow = [o,{},[]];
      return flow;
    }
  }

  async toLatex (filename) {

    const parser = new NitrilePreviewLatex();
    let [blocks,flags,isarticle,subs] = await this.getFlows(filename,parser);
    var config = parser.toConfig(flags);
    var autonum = new NitrilePreviewAutonum();
    var texlines = [];
    if (isarticle) {
      autonum.start();
      texlines = parser.translateLatex(autonum,config,blocks,isarticle,0,0);
      autonum.end();
    } else {
      autonum.start();
      for (var i=0; i < subs.length; ++i) {
        texlines = parser.translateLatex(autonum,config,subs[i].flow[0],isarticle,subs[i].subrow,subs[i].sublevel,texlines);
      }
      autonum.end();
    }
    /// construct the final LATEX file
    var title = config.title ? config.title : 'Untitled'
    var author = config.author ? config.author : ''
    var documentclass = config.latexDocumentClass ? config.latexDocumentClass : ''
    if (!documentclass) {
      documentclass = isarticle ? "article" : "book";
    }
    var documentclassopt = config.latexTwoColumnEnabled?"twocolumn":"";
    var data = `% !TEX program = ${config.latexFamily}
\\documentclass[${documentclassopt}]{${documentclass}}
${parser.toRequiredPackages(isarticle,config)}
\\title{${parser.escape(title)}}
\\author{${parser.escape(author)}}
\\begin{document}
\\maketitle
\\tableofcontents
\\bigskip       
${texlines.join('\n')}
\\end{document}\n`;

    /// write to the outfile
    //let outfilename = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    let outfilename = `${filename}.tex`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toHtml (filename) {

    const parser = new NitrilePreviewHtml();
    let [blocks,flags,isarticle,subs] = await this.getFlows(filename,parser);
    var ispreview = false;
    var config = parser.toConfig(flags);
    var autonum = new NitrilePreviewAutonum();
    var htmls = [];
    var chaps = [];
    if (isarticle) {
      autonum.start();
      let subrow = 0;
      let sublevel = 0;
      [htmls,chaps] = parser.translateHtml(autonum,config,blocks,isarticle,ispreview,subrow,sublevel);
      autonum.end();
    } else {
      autonum.start();
      for (var i=0; i < subs.length; ++i) {
        [htmls,chaps] = parser.translateHtml(autonum,config,subs[i].flow[0],isarticle,ispreview,subs[i].subrow,subs[i].sublevel,htmls,chaps);
      }
      autonum.end();
    }
    /// replace all REFS
    htmls = parser.replaceRef(htmls,chaps);
    /// get TOC
    var toc = this.getXHtmlToc(isarticle,chaps);
    /// construct the final LATEX file
    let title = config.title ? config.title : 'Untitled'
    let author = config.author ? config.author : ''
    let geometry_text = parser.toPageCssStyleText(config);
    let data = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
</head>
<body class='nitrile-preview'>
<div class='PAGE' style='${geometry_text}' >
<p class='TITLE' style='${parser.titlecssstyle}' >
${parser.escape(title)}
</p>
<p class='AUTHOR' style='${parser.authorcssstyle}' >
${parser.escape(author)}
</p>
<p class='DATE' style='${parser.datecssstyle}' >
${parser.escape(new Date().toLocaleDateString())}
</p>
<nav style='position:absolute; top:0; left:21.5cm;'>
${toc}
</nav>
<main>
${htmls.join('\n')}
</main>
</div>
</body>
</html>`;

    /// write to the outfile
    let outfilename = `${filename}.html`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toXHtml (filename) {

    const parser = new NitrilePreviewHtml();
    let [blocks,flags,isarticle,subs] = await this.getFlows(filename,parser);
    var ispreview = false;
    var config = parser.toConfig(flags);
    var autonum = new NitrilePreviewAutonum();
    var htmls = [];
    var chaps = [];
    if (isarticle) {
      autonum.start();
      let subrow = 0;
      let sublevel = 0;
      [htmls,chaps] = parser.translateHtml(autonum,config,blocks,isarticle,ispreview,subrow,sublevel);
      autonum.end();
    } else {
      autonum.start();
      for (var i=0; i < subs.length; ++i) {
        [htmls,chaps] = parser.translateHtml(autonum,config,subs[i].flow[0],isarticle,ispreview,subs[i].subrow,subs[i].sublevel,htmls,chaps);
      }
      autonum.end();
    }
    /// replace all REFS
    htmls = parser.replaceRef(htmls,chaps);
    /// construct the final LATEX file
    let title = config.title ? config.title : 'Untitled'
    let author = config.author ? config.author : ''
    let geometry_text = parser.toPageCssStyleText(config);
    let data = `<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
</head>
<body class='nitrile-preview'>
<main class='PAGE' style='${geometry_text}' >
<p class='TITLE'>
${parser.escape(title)}
</p>
<p class='AUTHOR'>
${parser.escape(author)}
</p>
<p class='DATE'>
${parser.escape(new Date().toLocaleDateString())}
</p>
${htmls.join('\n')}
</main>
</body>
</html>`;

    /// write to the outfile
    let outfilename = `${filename}.xhtml`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toEpub (filename) {

    /// regenerate HTML without 'ispreview' flag

    const parser = new NitrilePreviewHtml();
    let [blocks,flags,isarticle,subs] = await this.getFlows(filename,parser);
    var ispreview = false;
    var config = parser.toConfig(flags);
    var autonum = new NitrilePreviewAutonum();
    var htmls = [];
    var chaps = [];
    if (isarticle) {
      autonum.start();
      let subrow = 0;
      let sublevel = 0;
      [htmls,chaps] = parser.translateHtml(autonum,config,blocks,isarticle,ispreview,subrow,sublevel);
      autonum.end();
    } else {
      autonum.start();
      for (var i=0; i < subs.length; ++i) {
        [htmls,chaps] = parser.translateHtml(autonum,config,subs[i].flow[0],isarticle,ispreview,subs[i].subrow,subs[i].sublevel,htmls,chaps);
      }
      autonum.end();
    }

    /// replace all REFS

    htmls = parser.replaceRef(htmls,chaps);

    /// get the title and author

    let title = config.title ? config.title : 'Untitled'
    let author = config.author ? config.author : ''

    /// now call on 'epub' module to generate a nodejs Buffer() object that is the ZIP file

    var epub = new NitrilePreviewEpub();
    var imagemap = new Map();///empty imagemap
    var dirname = path.dirname(filename);
    let data = await epub.generateAsync(parser,parser.escape(title),parser.escape(author),htmls,chaps,imagemap,isarticle,dirname);

    /// write to the outfile
    let outfilename = `${filename}.epub`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  getXHtmlToc (isarticle,chaps) {

    /// genenerate contents

    if (isarticle) {

      /// extract only 'SECTION' entries

      var sections = [];
      for (var i=0; i < chaps.length; ++i) {
        let chap = chaps[i];
        const [heading,id,label,dept,text,ln,fn] = chap;
        if (heading === 'SECTION') {
          sections.push([id,dept,text]);
        }
      }
      var toc = sections.map(x => `<li><a href='#${x[0]}'>${x[1]} ${x[2]}</a></li>`).join('\n');
      var toc = `<ol style='list-style-type:none;' epub:type='list'> ${toc} </ol>`;
      return toc;
    } else {

      var sections = [];
      for (var i=0; i < chaps.length; ++i) {
        let chap = chaps[i];
        const [heading,id,label,dept,text,ln,_saveas] = chap;
        if (heading === 'PART' || heading === 'CHAPTER') {
          sections.push([id,dept,text]);
        }
      }
      var toc = sections.map(x => `<li><a href='#${x[0]}'>${x[1]} ${x[2]}</a></li>`).join('\n');
      var toc = `<ol style='list-style-type:none;' epub:type='list'> ${toc} </ol>`;
      return toc;
    }
  }

}

module.exports = { NitrilePreviewNode };
