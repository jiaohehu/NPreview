
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const pjson = require('../package.json');
const fs = require('fs');

module.exports = {

  async toLatex (filename) {
    
    const latex = new NitrilePreviewLatex();
    var out = await latex.readFileAsync('my.md');
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
\\title{${title}}
\\author{${author}}
\\begin{document}
\\maketitle
${olines.join('\n')}
\\end{document}\n`;

    /// write to the outfile
    let outfilename = `${filename}.tex`;
    await latex.writeFileAsync(outfilename, data);
    console.log(`write to ${outfilename}`);

  }
}
