const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const fs = require('fs');
const path = require('path');
const cssrules_text = `\
.nitrile-preview {
  font-family: roman;
  font-size: 16px;
  color: #333;
  background-color: #888;
  overflow: scroll;
}
.nitrile-preview a {
  color: #337ab7;
}
.nitrile-preview code {
  background-color: inherit;
  color: inherit;
  font-size: 80%;
  padding: inherit;
}
.nitrile-preview code.INLINE {
  padding-left: 0.2em;
  padding-right: 0.2em;
}
.nitrile-preview tt {
  background-color: inherit;
  color: inherit;
  font-size: 80%;
}
.nitrile-preview table {
  border-collapse: collapse;
}
.nitrile-preview .TABB table tr {
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  padding: 2px 6px;
}
.nitrile-preview .LSTG pre {
  background-color: inherit;
  color: inherit;
  padding-left: 3em;
  font-size: inherit;
}
.nitrile-preview .LSTG pre code {
  position: relative;
}
.nitrile-preview .LSTG pre span {
  position: absolute;
  left: -2em;
  font-size: small;
}
.nitrile-preview pre {
  margin: 0;
  padding: 0;
  background-color: inherit;
  color: inherit;
  font-size: 80%;
  overflow-x: visible;
}
.nitrile-preview svg {
  box-sizing: border-box;
}
.nitrile-preview .PAGE {
  box-sizing: border-box;
  width: 8.5in;
  padding: 1.25in 1.5in 1.25in 1.5in;
  margin: 0;
  font-size: 12pt;
  background-color: white;
}
.nitrile-preview .TITLE {
  font-size: x-large;
  text-align: center;
}
.nitrile-preview .AUTHOR {
  font-size: large;
  text-align: center;
}
.nitrile-preview .DATE {
  font-size: large;
  text-align: center;
}
.nitrile-preview .PART {
  font-size: x-large;
  font-variant: small-caps;
}
.nitrile-preview h1.CHAPTER {
  font-size: 153%;
  font-weight: bold;
}
.nitrile-preview h2.SECTION {
  font-size: 140%;
  font-weight: bold;
}
.nitrile-preview h3.SUBSECTION {
  font-size: 120%;
  font-weight: bold;
}
.nitrile-preview h4.SUBSUBSECTION {
  font-size: 100%;
  font-weight: bold;
}
.nitrile-preview p,
.nitrile-preview dl,
.nitrile-preview ul,
.nitrile-preview ol,
.nitrile-preview blockquote,
.nitrile-preview table,
.nitrile-preview caption {
  line-height: 1.15;
}
.nitrile-preview dt,
.nitrile-preview dd {
  margin-top: 0;
  margin-bottom: 0;
  line-height: inherit;
}
.nitrile-preview table tr th {
  text-align: center;
}
.nitrile-preview caption figcaption {
  margin: auto;
}
`

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
    var olines = parser.translateLatex(config,xrefs,blocks,isarticle);

    /// construct the final LATEX file
    var title = config.title ? config.title : 'Untitled'
    var author = config.author ? config.author : ''
    var documentclass = config.documentclass ? config.documentclass : ''
    if (!documentclass) {
      documentclass = isarticle ? "article" : "book";
    }
    var documentclassoptions = config.documentclassoptions;
    var data = `% !TEX program = ${config.texfamily}
\\documentclass[${documentclassoptions.join(',')}]{${documentclass}}
${parser.toRequiredPackages(config.texfamily)}
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

    /// does translation with config and blocks
    blocks = parser.idenBlocks(config,blocks,isarticle);
    var xrefs = parser.idenXrefs(config,blocks,isarticle);
    let olines = parser.translateHtml(config,xrefs,blocks,isarticle,false);

    /// construct the final LATEX file
    let title = config.title ? config.title : 'Untitled'
    let author = config.author ? config.author : ''
    let data = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
${cssrules_text}
</style>
</head>
<body class='nitrile-preview'>
<div class='PAGE'>
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
</div>
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
    let olines = parser.translateHtml(config,xrefs,blocks,isarticle,false);

    /// construct the final LATEX file
    let title = config.title ? config.title : 'Untitled'
    let author = config.author ? config.author : ''
    let data = `<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<style>
${cssrules_text}
</style>
</head>
<body class='nitrile-preview'>
<div class='PAGE'>
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
</div>
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

