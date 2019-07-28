const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewAutonum } = require('./nitrile-preview-autonum');
const fs = require('fs');
const path = require('path');

class NitrilePreviewNode {

  async getFlows(fname,parser) {
    var out = await parser.readFileAsync(fname);
    var [blocks,flags,book] = parser.toFlow(out.split('\n'),fname);
    var isarticle = (book.length == 0);
    var subs = [];
    if (book.length) {
      var  subs = parser.parseFILES(book);
      var  flags = parser.parseFLAGS(book);
      var proms = subs.map ( sub => this.getSubFlow(fname,sub,parser) );
      for (var j in proms) {    
        subs[j].flow = await proms[j];
      }
    } 
    return [blocks,flags,book,subs];
  }
  async getSubFlow (fname,sub,parser) {
    let { subfname, sublevel, subpart, subrow } = sub;
    if (sublevel < 0) {                
      var o = [];
      o.push(parser.newPARTblock (subpart));
      return [o,{},[]];
    }
    var fsubfname = path.join(path.dirname(fname),subfname);
    var flow = await this.fetchFlow(sub,fsubfname,parser);
    return flow;
  }
  async fetchFlow (sub,fsubfname,parser) {
    try {
      var out = await parser.readFileAsync(fsubfname);
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
    let [blocks,flags,book,subs] = await this.getFlows(filename,parser);
    var isarticle = (book.length === 0);
    var config = parser.toConfig(flags);
    var autonum = new NitrilePreviewAutonum();
    var olines = [];
    if (isarticle) {
      autonum.start();
      olines = parser.translateLatex(autonum,config,blocks,isarticle,0,0);
      autonum.end();
    } else {
      autonum.start();
      for (var i=0; i < subs.length; ++i) {
        olines = parser.translateLatex(autonum,config,subs[i].flow[0],isarticle,subs[i].subrow,subs[i].sublevel,olines);
      }
      autonum.end();
    }
    /// construct the final LATEX file
    var title = config.title ? config.title : 'Untitled'
    var author = config.author ? config.author : ''
    var documentclass = config.documentclass ? config.documentclass : ''
    if (!documentclass) {
      documentclass = isarticle ? "article" : "book";
    }
    var documentclassopt = config.twocolumn?"twocolumn":"";
    var data = `% !TEX program = ${config.texfamily}
\\documentclass[${documentclassopt}]{${documentclass}}
${parser.toRequiredPackages(isarticle,config)}
\\title{${parser.escape(title)}}
\\author{${parser.escape(author)}}
\\begin{document}
\\maketitle
${olines.join('\n')}
\\end{document}\n`;

    /// write to the outfile
    let outfilename = `${filename}.tex`;
    await parser.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  } 

  async toHtml (filename) {

    const parser = new NitrilePreviewHtml();
    let [blocks,flags,book,subs] = await this.getFlows(filename,parser);
    var isarticle = (book.length === 0);
    var config = parser.toConfig(flags);
    var autonum = new NitrilePreviewAutonum();
    var olines = [];
    if (isarticle) {
      autonum.start();
      olines = parser.translateHtml(autonum,config,blocks,isarticle,0,0);
      autonum.end();
    } else {
      autonum.start();
      for (var i=0; i < subs.length; ++i) {
        olines = parser.translateHtml(autonum,config,subs[i].flow[0],isarticle,subs[i].subrow,subs[i].sublevel,olines);
      }
      autonum.end();
    }
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
<main class='PAGE' style='${geometry_text}' >
<p class='TITLE' style='${parser.titlecssstyle}' >
${parser.escape(title)}
</p>
<p class='AUTHOR' style='${parser.authorcssstyle}' >
${parser.escape(author)}
</p>
<p class='DATE' style='${parser.datecssstyle}' >
${parser.escape(new Date().toLocaleDateString())}
</p>
${olines.join('\n')}
</main>
</body>
</html>`;

    /// write to the outfile
    let outfilename = `${filename}.html`;
    await parser.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  } 

  async toXHtml (filename) {

    const parser = new NitrilePreviewHtml();
    let [blocks,flags,book,subs] = await this.getFlows(filename,parser);
    var isarticle = (book.length === 0);
    var config = parser.toConfig(flags);
    var autonum = new NitrilePreviewAutonum();
    var olines = [];
    if (isarticle) {
      autonum.start();
      olines = parser.translateHtml(autonum,config,blocks,isarticle,0,0);
      autonum.end();
    } else {
      autonum.start();
      for (var i=0; i < subs.length; ++i) {
        olines = parser.translateHtml(autonum,config,subs[i].flow[0],isarticle,subs[i].subrow,subs[i].sublevel,olines);
      }
      autonum.end();
    }
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
${olines.join('\n')}
</main>
</body>
</html>`;

    /// write to the outfile
    let outfilename = `${filename}.xhtml`;
    await parser.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  } 
}

module.exports = { NitrilePreviewNode };

