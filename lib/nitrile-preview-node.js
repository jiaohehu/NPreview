const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewPdflatex } = require('./nitrile-preview-pdflatex');
const { NitrilePreviewLualatex } = require('./nitrile-preview-lualatex');
const { NitrilePreviewLualatexja } = require('./nitrile-preview-lualatexja');
const { NitrilePreviewXelatex } = require('./nitrile-preview-xelatex');
const { NitrilePreviewXecjk } = require('./nitrile-preview-xecjk');
const { NitrilePreviewContext } = require('./nitrile-preview-context');
const { NitrilePreviewBeamer } = require('./nitrile-preview-beamer');
const { NitrilePreviewArticle } = require('./nitrile-preview-article');
const { NitrilePreviewReport } = require('./nitrile-preview-report');
const { NitrilePreviewMemoir } = require('./nitrile-preview-memoir');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewEpub } = require('./nitrile-preview-epub');
const { NitrilePreviewSlide } = require('./nitrile-preview-slide');
const { NitrilePreviewPage } = require('./nitrile-preview-page');
const utils = require('./nitrile-preview-utils');
const fs = require('fs');
const path = require('path');

class NitrilePreviewNode {

  async toGlyphs(fname) {
    const parser = new NitrilePreviewContex();
    return await parser.toGlyphs(fname);
  }

  async toFontmap(fnames) {
    const parser = new NitrilePreviewContex();
    return await parser.toFontmap(fnames);
  }

  async to_slide_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();

    /// translator blocks, the translation is stored with each block
    /// at its .latex meber.
    const translator = new NitrilePreviewSlide(parser);
    const data = translator.to_slide_document();

    /// construct an texfile always the same as the input + .html
    let texfile = `${filename.slice(0, filename.length - path.extname(filename).length)}.html`;
    await utils.write_file_async(texfile, data);

    /// return the name of the file
    let fullname = path.resolve(texfile);

    /// return the name of the file
    return [fullname];
  }

  async to_beamer_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewBeamer(parser);
    const data = translator.to_beamer_document();

    /// construct an texfile always the same as the input + .tex 
    let texfile = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    await utils.write_file_async(texfile, data);

    /// return the name of the file
    let dname = path.dirname(texfile);
    let fname = path.basename(texfile);

    /// latex program
    let program = translator.to_latex_program();

    return [program,dname,fname];
  }

  async to_report_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewReport(parser);
    const data = translator.to_report_document();

    /// construct an texfile always the same as the input + .tex 
    let texfile = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    await utils.write_file_async(texfile, data);

    /// return the name of the file
    let dname = path.dirname(texfile);
    let fname = path.basename(texfile);

    /// latex program
    let program = translator.to_latex_program();

    return [program,dname,fname];
  }

  async to_context_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewContext(parser);
    const data = translator.to_context_document();

    /// construct an texfile always the same as the input + .tex 
    let texfile = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    await utils.write_file_async(texfile, data);

    /// return the name of the file
    let dname = path.dirname(texfile);
    let fname = path.basename(texfile);

    return [texfile,dname,fname];
  }

  async to_page_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();

    /// translator blocks, the translation is stored with each block
    /// at its .html member.
    const translator = new NitrilePreviewPage(parser);
    const data = translator.to_page_document();
    let html = `${filename.slice(0, filename.length - path.extname(filename).length)}.html`;
    await utils.write_file_async(html, data);
    return [html];
  }

  async to_html_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewHtml(parser);
    parser.translate_blocks(translator);

    /// now construct a Context document
    const data = translator.to_html_document();
    let htmlfil = `${filename.slice(0, filename.length - path.extname(filename).length)}.html`;
    await utils.write_file_async(htmlfil, data);
    return [htmlfil];
  }

  async to_xhtml_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewHtml(parser);
    parser.translate_blocks(translator);

    /// now construct a Context document
    const data = translator.to_xhtml_document();

    /// construct an xhtmlfi always the same as the input + .tex 
    let xhtmlfi = `${filename.slice(0, filename.length - path.extname(filename).length)}.xhtml`;
    await utils.write_file_async(xhtmlfi, data);

    /// return the name of the file
    return [xhtmlfi];

  }

  async to_epub_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewEpub(parser);
    parser.translate_blocks(translator);

    /// now construct a Context document
    const data = await translator.to_epub_document_async();

    /// construct an epubfil always the same as the input + .tex 
    let epubfil = `${filename.slice(0, filename.length - path.extname(filename).length)}.epub`;
    await utils.write_file_async(epubfil, data);

    /// return the name of the file
    return [epubfil];

  }

  _getXHtmlToc (haschapter,chaps) {

    if (haschapter!=1) {

      var sections = [];
      for (var i=0; i < chaps.length; ++i) {
        let chap = chaps[i];
        const [heading,id,label,dept,text,ln] = chap;
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

  ///Needed for nih
  async runHtml(args){
   
    //console.log('args=',args);
    args = args.split(' ');
    //console.log('args=',args);
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
      //console.log(`watching ${myfile}`);
      fs.watch(myfile, (event, filename) => { 
        if (filename) { 
          //console.log(`file Changed`); 
          new NitrilePreviewNode().toHtml(filename).then(f => console.log(f)).catch(err => console.log(err)) 
        }
      }); 
    } else { 
      new NitrilePreviewNode().toHtml(myfile).then(f => console.log(f)).catch(err => console.log(err)) 
    } 

  }

  ///Needed for nic
  async runContex(args){
   
    //console.log('args=',args);
    args = args.split(' ');
    //console.log('args=',args);
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

  ///Needed for niserve
  async toHtmlDoc (fname) {

    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(fname)
    await parser.read_mode_async();
    const translator = new NitrilePreviewHtml();
    parser.translate_blocks();

    /// construct an HTML document
    var data = translator.to_html_document();

    /// return the content of the file
    return data;
  }

  parse_arg(args){

    var options = {};
    var values = [];
    var re_twodash_arg=/^\-\-(\w+)\=(\w+)$/;
    var re_twodash_noarg=/^\-\-(\w+)$/;
    var re_onedash=/^\-(\w+)$/;
    var v;
    for(var s of args){
      if((v=re_twodash_arg.exec(s))!==null){
        var key=v[1];
        var val=v[2];
        options[key]=val;
      }else if((v=re_twodash_noarg.exec(s))!==null){
        var key=v[1];
        options[key]=1;
      }else if((v=re_onedash.exec(s))!==null){
        var keys=v[1].split('');
        keys.forEach(x => options[x]=1);
      }else{
        values.push(s);
      }
    }
    return {options,values};
  }

}

module.exports = { NitrilePreviewNode };
