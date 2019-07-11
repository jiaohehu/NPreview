
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const pjson = require('../package.json');
const fs = require('fs');

module.exports = {

  async toLatex (filename) {
    
    const latex = new NitrilePreviewLatex();
    var out = await latex.readFileAsync(filename);
    let lines = out.split('\n');
    let [blocks,flags] = latex.toBLOCKS(lines,'my',0);

    /// get the properties from configSchema
    var config = {};
    var schema = pjson.configSchema;
    for (var key in schema) {
      if (schema.hasOwnProperty(key)) {
        config[key] = latex.getConfig(key,flags,schema);
        console.log(key+' '+config[key]);
      }
    }

    /// does translation with config and blocks
    let olines = latex.translate(config,blocks,true);

    /// construct the final LATEX file
    let title = flags.title ? flags.title : 'Untitled'
    let author = flags.author ? flags.author : ''
    let data = `% !TEX program = ${config.texFamily}
\\documentclass{article}
${latex.toRequiredPackages(config.texFamily)}
\\title{${latex.escape(title)}}
\\author{${latex.escape(author)}}
\\begin{document}
\\maketitle
${olines.join('\n')}
\\end{document}\n`;

    /// write to the outfile
    let outfilename = `${filename}.tex`;
    await latex.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  },

  async toHtml (filename) {
    
    const previewer = new NitrilePreviewHtml();
    var out = await previewer.readFileAsync(filename);
    let lines = out.split('\n');
    let [blocks,flags] = previewer.toBLOCKS(lines,'my',0);

    /// get the properties from configSchema
    var config = {};
    var schema = pjson.configSchema;
    for (var key in schema) {
      if (schema.hasOwnProperty(key)) {
        config[key] = previewer.getConfig(key,flags,schema);
        console.log(key+' '+config[key]);
      }
    }

    /// does translation with config and blocks
    let olines = previewer.translate(config,blocks,true);

    /// construct cssrules
    let cssrules_text = `\
.nitrile-preview { font-family: roman; font-size: 16px; color: rgb(51, 51, 51); background-color: rgb(136, 136, 136); overflow: scroll; }
.nitrile-preview a { color: rgb(51, 122, 183); }
.nitrile-preview code { background-color: inherit; color: inherit; font-size: 80%; padding: inherit; }
.nitrile-preview code.INLINE { padding-left: 0.2em; padding-right: 0.2em; }
.nitrile-preview tt { background-color: inherit; color: inherit; font-size: 80%; }
.nitrile-preview .VRSE, .nitrile-preview .VERB, .nitrile-preview .CODE, .nitrile-preview .TABB, .nitrile-preview .TERM, .nitrile-preview .QUOT, .nitrile-preview .SPEC, .nitrile-preview .PICT, .nitrile-preview .DESC, .nitrile-preview .PRIM, .nitrile-preview .SECO, .nitrile-preview .PLST { margin-top: 1em; margin-bottom: 1em; }
.nitrile-preview table { border-collapse: collapse; }
.nitrile-preview table, .nitrile-preview th, .nitrile-preview td { border: 1px solid rgb(51, 51, 51); padding: 2px 6px; }
.nitrile-preview .LSTG pre { background-color: inherit; color: inherit; padding-left: 3em; font-size: inherit; }
.nitrile-preview .LSTG pre code { position: relative; }
.nitrile-preview .LSTG pre span { position: absolute; left: -2em; font-size: small; }
.nitrile-preview pre { margin: 0px; padding: 0px; background-color: inherit; color: inherit; font-size: 80%; overflow-x: visible; }
.nitrile-preview .PAGE { box-sizing: border-box; width: 8.5in; padding: 1.25in 1.5in; margin: 0px; font-size: 12pt; background-color: white; }
.nitrile-preview .TITLE { font-size: x-large; text-align: center; }
.nitrile-preview .AUTHOR { font-size: large; text-align: center; }
.nitrile-preview .DATE { font-size: large; text-align: center; }
.nitrile-preview h1.CHAPTER { font-size: 153%; font-weight: bold; }
.nitrile-preview h2.SECTION { font-size: 140%; font-weight: bold; }
.nitrile-preview h3.SUBSECTION { font-size: 120%; font-weight: bold; }
.nitrile-preview h4.SUBSUBSECTION { font-size: 100%; font-weight: bold; }
.nitrile-preview p, .nitrile-preview dl, .nitrile-preview ul, .nitrile-preview ol, .nitrile-preview blockquote, .nitrile-preview table { line-height: 1.15; }
.nitrile-preview dt, .nitrile-preview dd { margin-top: 0px; margin-bottom: 0px; line-height: inherit; }
.nitrile-preview table tr th { text-align: center; }
.nitrile-preview caption figcaption { margin: auto; }
`

    /// construct the final LATEX file
    let title = flags.title ? flags.title : 'Untitled'
    let author = flags.author ? flags.author : ''
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
${previewer.escape(title)}
</p>
<p class='AUTHOR'>
${previewer.escape(author)}
</p>
<p class='DATE'>
${previewer.escape(new Date().toLocaleDateString())}
</p>
${olines.join('\n')}
</div>
</body>
</html>`;

    /// write to the outfile
    let outfilename = `${filename}.html`;
    await previewer.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  },
}
