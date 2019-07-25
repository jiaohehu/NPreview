const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const fs = require('fs');
const path = require('path');

class NitrilePreviewNode {

  async toLatex (filename) {

    const parser = new NitrilePreviewLatex();
    var out = await parser.readFileAsync(filename);
    let lines = out.split('\n');
    let [blocks,flags,book] = parser.toBlocks(lines,path.basename(filename),0,0);
    if (book.length) {
      [blocks,flags] = await parser.fetchBookBlocks(book,path.dirname(filename));
      var isarticle = false;
    } else {
      var isarticle = true;
    }

    /// get the properties from configSchema
    var config = parser.toConfig(flags);

    /// does translation with config and blocks
    blocks = parser.idenBlocks(config,blocks,isarticle);
    var xrefs = parser.idenXrefs(config,blocks,isarticle);
console.log(xrefs);
    var olines = parser.translateLatex(config,xrefs,blocks,isarticle);

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
    var out = await parser.readFileAsync(filename);
    let lines = out.split('\n');
    var [blocks,flags,book] = parser.toBlocks(lines,path.basename(filename),0,0);
    if (book.length) {
      [blocks,flags] = await parser.fetchBookBlocks(book,path.dirname(filename));
      var isarticle = false;
    } else {
      var isarticle = true;
    }

    /// get the properties from configSchema
    var config = parser.toConfig(flags);
console.log(config);

    /// does translation with config and blocks
    blocks = parser.idenBlocks(config,blocks,isarticle);
    var xrefs = parser.idenXrefs(config,blocks,isarticle);
console.log(xrefs);
    let olines = parser.translateHtml(config,xrefs,blocks,isarticle,false);

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
    var out = await parser.readFileAsync(filename);
    let lines = out.split('\n');
    var [blocks,flags,book] = parser.toBlocks(lines,path.basename(filename),0,0);
    if (book.length) {
      [blocks,flags] = await parser.fetchBookBlocks(book,path.dirname(filename));
      var isarticle = false;
    } else {
      var isarticle = true;
    }

    /// get the properties from configSchema
    var config = parser.toConfig(flags);

    /// does translation with config and blocks
    blocks = parser.idenBlocks(config,blocks,isarticle);
    var xrefs = parser.idenXrefs(config,blocks,isarticle);
console.log(xrefs);
    let olines = parser.translateHtml(config,xrefs,blocks,isarticle,false);

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

