const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewContex } = require('./nitrile-preview-contex');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewEpub } = require('./nitrile-preview-epub');
const utils = require('./nitrile-preview-utils');
const fs = require('fs');
const path = require('path');

class NitrilePreviewNode {

  async toContex (fname) {

    const parser = new NitrilePreviewContex();
    await parser.readFromFileAsync(fname)
    var subs = parser.getSubs();
    await parser.readSubsAsync(subs,path.dirname(fname));
    parser.mergeSubs(subs);
    parser.idenBlocks();
    parser.translateBlocks();

    /// construct the entire CONTEX document
    var data = parser.toContexDocument();

    /// write to the outfile
    //let outfilename = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    let outfilename = `a.tex`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toLatex (fname) {

    const parser = new NitrilePreviewLatex();
    await parser.readFromFileAsync(fname)
    var subs = parser.getSubs();
    await parser.readSubsAsync(subs,path.dirname(fname));
    parser.mergeSubs(subs);
    parser.idenBlocks();
    parser.translateBlocks();
    var data = parser.toLatexDocument();

    /// write to the outfile
    //let outfilename = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    let outfilename = `a.tex`;
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toHtml (fname) {

    const parser = new NitrilePreviewHtml();
    parser.isepub = 0;
    await parser.readFromFileAsync(fname)
    var subs = parser.getSubs();
    await parser.readSubsAsync(subs,path.dirname(fname));
    parser.mergeSubs(subs);
    parser.idenBlocks();
    parser.translateBlocks();

    /// construct an HTML document
    var data = parser.toHtmlDocument();

    /// write to the outfile
    let outfilename = 'a.html';
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toXhtml (fname) {

    const parser = new NitrilePreviewHtml();
    parser.isepub = 0;
    await parser.readFromFileAsync(fname)
    var subs = parser.getSubs();
    await parser.readSubsAsync(subs,path.dirname(fname));
    parser.mergeSubs(subs);
    parser.idenBlocks();
    parser.translateBlocks();

    /// construct a XHTML document
    var data = parser.toXhtmlDocument();

    /// write to the outfile
    let outfilename = 'a.xhtml';
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  async toEpub (fname) {

    const parser = new NitrilePreviewHtml();
    parser.isepub = 1;
    await parser.readFromFileAsync(fname)
    var subs = parser.getSubs();
    await parser.readSubsAsync(subs,path.dirname(fname));
    parser.mergeSubs(subs);
    parser.idenBlocks();
    parser.translateBlocks();

    /// invoke epub processing
    var epub = new NitrilePreviewEpub();
    var dirname = path.dirname(fname);
    let data = await epub.generateAsync(parser,dirname);

    /// write to the outfile
    let outfilename = 'a.epub';
    await utils.writeFileAsync(outfilename, data);

    /// return the name of the file
    return outfilename;
  }

  _getXHtmlToc (haschapter,chaps) {

    if (haschapter!=1) {

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

  async toHtmlDoc (fname) {

    const parser = new NitrilePreviewHtml();
    parser.isepub = 0;
    await parser.readFromFileAsync(fname)
    var subs = parser.getSubs();
    await parser.readSubsAsync(subs,path.dirname(fname));
    parser.mergeSubs(subs);
    parser.idenBlocks();
    parser.translateBlocks();

    /// construct an HTML document
    var data = parser.toHtmlDocument();

    /// return the content of the file
    return data;
  }

  async runHtml(args){
   
    console.log('args=',args);
    args = args.split(' ');
    console.log('args=',args);
    var myopts = {};
    var myfile = '';
    while(args.length){
      let item = args.shift();
      if(item.startsWith('--')){
        myopts[item] = 1;
      }
      else {
        myfile = item;
      }
    }
    if(myopts['--watch']){
      new NitrilePreviewNode().toHtml(myfile).then(f => console.log(f)).catch(err => console.log(err)) 
      console.log(`watching ${myfile}`);
      fs.watch(myfile, (event, filename) => { 
        if (filename) { 
          console.log(`file Changed`); 
          new NitrilePreviewNode().toHtml(filename).then(f => console.log(f)).catch(err => console.log(err)) 
        }
      }); 
    } else { 
      new NitrilePreviewNode().toHtml(myfile).then(f => console.log(f)).catch(err => console.log(err)) 
    } 

  }

  async runContex(args){
   
    console.log('args=',args);
    args = args.split(' ');
    console.log('args=',args);
    var myopts = {};
    var myfile = '';
    while(args.length){
      let item = args.shift();
      if(item.startsWith('--')){
        myopts[item] = 1;
      }
      else {
        myfile = item;
      }
    }
    if(myopts['--watch']){
      new NitrilePreviewNode().toContex(myfile).then(f => console.log(f)).catch(err => console.log(err)) 
      console.log(`watching ${myfile}`);
      fs.watch(myfile, (event, filename) => { 
        if (filename) { 
          console.log(`file Changed`); 
          new NitrilePreviewNode().toContex(filename).then(f => {
              console.log(f);
              const context  = require('child_process').spawn('context', ['--interaction=nonstopmode', f]); 
              context.stdout.on('data',(data) => process.stdout.write(data)); 
              context.on('close',(code) => console.log('context process finished')); 
          }).catch(err => console.log(err));
        }
      }); 
    } else { 
          new NitrilePreviewNode().toContex(myfile).then(f => {
              console.log(f);
              const context  = require('child_process').spawn('context', ['--interaction=nonstopmode', f]); 
              context.stdout.on('data',(data) => process.stdout.write(data)); 
              context.on('close',(code) => console.log('context process finished')); 
          }).catch(err => console.log(err));
    } 

  }

}

module.exports = { NitrilePreviewNode };
