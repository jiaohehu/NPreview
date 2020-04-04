const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewContext } = require('./nitrile-preview-context');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewEpub } = require('./nitrile-preview-epub');
const utils = require('./nitrile-preview-utils');
const fs = require('fs');
const path = require('path');

class NitrilePreviewNode {

  async toAll(fname,parser) {
    var out = await utils.readFileAsync(fname);
    var [main,config] = parser.toFlow(out.split('\n'),fname);
    var subs = parser.toSubs(main);
    var proms = subs.map ( sub => this.getSubFlow(fname,sub,parser) );
    for (var j in proms) {
      subs[j].flow = await proms[j];
    }
    main = parser.insertSubs(main,subs);
    parser.idenBlocks(main,config);
    return [main,config,subs];
  }
  async getSubFlow (fname,sub,parser) {
    let { subfname, sublevel, subpart, subrow } = sub;
    var fsubfname = path.join(path.dirname(fname),subfname);
    var flow = await this.fetchFlow(sub,sublevel,fsubfname,parser);
    return flow;
  }
  async fetchFlow (sub,sublevel,fsubfname,parser) {
    try {
      var out = await utils.readFileAsync(fsubfname);
      var [flow] = parser.toFlow(out.split('\n'),fsubfname);
      return flow;
    } catch (e) {
      var o = [];
      o.push(parser.new_hdgs_block(sublevel,0,e.toString(),fsubfname));
      var flow = o;
      return flow;
    }
  }

  async toContext (filename) {

    const parser = new NitrilePreviewContext();
    let [all,config] = await this.toAll(filename,parser);
    parser.translateBlocks(all,config);
    let texlines = all.map(x=>x.latex);

    /// construct the entire LATEX document
    var data = parser.toContextDocument(config,texlines);

    /// write to the outfile
    //let outfilename = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    let outfilename = `out.tex`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toLatex (filename) {

    const parser = new NitrilePreviewLatex();
    let [all,config] = await this.toAll(filename,parser);
    parser.translateBlocks(all,config);
    let texlines = all.map(x=>x.latex);

    /// construct the entire LATEX document
    var data = parser.toLatexDocument(config,texlines);

    /// write to the outfile
    //let outfilename = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    let outfilename = `${filename}.tex`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toHtml (filename) {

    const parser = new NitrilePreviewHtml();
    parser.isepub = 0;
    let [all,config] = await this.toAll(filename, parser);
    parser.translateBlocks(all,config);
    let title = config.ALL.title ? config.ALL.title : 'Untitled'
    let author = config.ALL.author ? config.ALL.author : ''
    let geometry_text = parser.toPageCssStyleText(config);
    let htmls = all.map(x=>x.html);
    let data = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
${parser.stylesheet}
</style>
</head>
<body class='nitrile-preview'>
<div class='PAGE' style='${geometry_text}' >

<p class='TITLE' >
${parser.escape(title)}
</p>

<p class='AUTHOR' >
${parser.escape(author)}
</p>

<p class='DATE' >
${parser.escape(new Date().toLocaleDateString())}
</p>

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
    parser.isepub = 0;
    let [all,config] = await this.toAll(filename,parser);
    parser.translateBlocks(all,config);
    var htmls = all.map(x=>x.html);
    /// construct the final LATEX file
    let title = config.ALL.title ? config.ALL.title : 'Untitled'
    let author = config.ALL.author ? config.ALL.author : ''
    let geometry_text = parser.toPageCssStyleText(config);
    let data = `<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<style>
${parser.stylesheet}
</style>
</head>
<body class='nitrile-preview'>
<div class='PAGE' style='${geometry_text}' >

<p class='TITLE'>
${parser.escape(title)}
</p>

<p class='AUTHOR'>
${parser.escape(author)}
</p>

<p class='DATE'>
${parser.escape(new Date().toLocaleDateString())}
</p>

<main>
${htmls.join('\n')}
</main>

</div>
</body>
</html>`;

    /// write to the outfile
    let outfilename = `${filename}.xhtml`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toEpub (filename) {

    /// creating blocks
    const parser = new NitrilePreviewHtml();
    parser.isepub = 1;
    var [all,config] = await this.toAll(filename,parser);
    parser.translateBlocks(all,config);

    /// now call on 'epub' module to generate a nodejs Buffer() object that is the ZIP file
    var epub = new NitrilePreviewEpub();
    var dirname = path.dirname(filename);
    var stylesheet = parser.stylesheet;
    let data = await epub.generateAsync(all,config,stylesheet,dirname);

    /// write to the outfile
    let outfilename = `${filename}.epub`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  getXHtmlToc (haschapter,chaps) {

    if (haschapter) {

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

    } else {

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

    }



  }

}

module.exports = { NitrilePreviewNode };
