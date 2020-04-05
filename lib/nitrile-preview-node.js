const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewContex } = require('./nitrile-preview-contex');
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

  async toContex (filename) {

    const parser = new NitrilePreviewContex();
    let [all,config] = await this.toAll(filename,parser);
    parser.translateBlocks(all,config);
    let texlines = all.map(x=>x.latex);

    /// construct the entire CONTEX document
    var data = parser.toContexDocument(config,texlines);

    /// write to the outfile
    //let outfilename = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    let outfilename = `a.tex`;
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
    let outfilename = `a.tex`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toHtml (filename) {

    const parser = new NitrilePreviewHtml();
    parser.isepub = 0;
    let [blocks,config] = await this.toAll(filename, parser);
    parser.translateBlocks(blocks,config);
    let htmlines = blocks.map(x=>x.html);
    var stylesheet_html = parser.stylesheet_html;
    var data = parser.toHtmlDocument(parser, config,htmlines,stylesheet_html);

    /// write to the outfile
    let outfilename = 'a.html';
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toXHtml (filename) {

    const parser = new NitrilePreviewHtml();
    parser.isepub = 0;
    let [blocks,config] = await this.toAll(filename, parser);
    parser.translateBlocks(blocks,config);
    let htmlines = blocks.map(x=>x.html);
    var stylesheet_html = parser.stylesheet_html;
    var data = parser.toXhtmlDocument(parser, config,htmlines,stylesheet_html);

    /// write to the outfile
    let outfilename = 'a.xhtml';
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toEpub (filename) {

    /// creating blocks
    const parser = new NitrilePreviewHtml();
    parser.isepub = 1;
    var [blocks,config] = await this.toAll(filename,parser);
    parser.translateBlocks(blocks,config);
    var epub = new NitrilePreviewEpub();
    var dirname = path.dirname(filename);
    var stylesheet_epub = parser.stylesheet_epub;
    let data = await epub.generateAsync(blocks,config,stylesheet_epub,dirname);

    /// write to the outfile
    let outfilename = 'a.epub';
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
