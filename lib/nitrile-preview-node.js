const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewPdflatex } = require('./nitrile-preview-pdflatex');
const { NitrilePreviewLualatex } = require('./nitrile-preview-lualatex');
const { NitrilePreviewContext } = require('./nitrile-preview-context');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewEpub } = require('./nitrile-preview-epub');
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

  async to_tex_document_async (args) {

    /// args might be '--noopen a.md'
    args = args.split(' ');
    var {options,values} = this.parse_arg(args);
    console.log('options=',options);
    console.log('values=',values);

    /// filename
    var filename = values[0];
    var program = options.program;
    var noopen = options.noopen;

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();
    parser.iden_blocks();

    /// set the program if it is empty and the document
    /// provide one
    if(!program && parser.program){
      program = parser.program;
    }

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    if(program=='context'){
      var translator = new NitrilePreviewContext();
      parser.translate_blocks(translator);
      var data = translator.to_context_document();
    }else if(program=='lualatex'){
      var translator = new NitrilePreviewLualatex();
      parser.translate_blocks(translator);
      var data = translator.to_lualatex_document();
    }else if(program=='pdflatex'){
      var translator = new NitrilePreviewPdflatex();
      parser.translate_blocks(translator);
      var data = translator.to_pdf_document();
    }else{
      program = 'context'
      var translator = new NitrilePreviewContext();
      parser.translate_blocks(translator);
      var data = translator.to_context_document();
    }
    /// construct an texfile always the same as the input + .tex 
    let texfile = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    await utils.writeFileAsync(texfile, data);
    /// return the name of the file
    return [texfile,program,noopen];
  }

  async to_context_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();
    parser.iden_blocks();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewContext();
    parser.translate_blocks(translator);

    /// now construct a Context document
    const data = translator.to_context_document();

    /// construct an texfile always the same as the input + .tex 
    let texfile = `${filename.slice(0,filename.length-path.extname(filename).length)}.tex`;
    await utils.writeFileAsync(texfile, data);

    /// return the name of the file
    return [texfile,'context'];
  }

  async to_lualatex_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();
    parser.iden_blocks();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewLualatex();
    parser.translate_blocks(translator);

    /// now construct a Context document
    const data = translator.to_lualatex_document();

    /// construct an texfile always the same as the input + .tex 
    let texfile = `${filename.slice(0, filename.length - path.extname(filename).length)}.tex`;
    await utils.writeFileAsync(texfile, data);

    /// return the name of the file
    return [texfile, 'lualatex'];
  }

  async to_pdflatex_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();
    parser.iden_blocks();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewPdflatex();
    parser.translate_blocks(translator);

    /// now construct a Context document
    const data = translator.to_pdflatex_document();

    /// construct an texfile always the same as the input + .tex 
    let texfile = `${filename.slice(0, filename.length - path.extname(filename).length)}.tex`;
    await utils.writeFileAsync(texfile, data);

    /// return the name of the file
    return [texfile, 'pdflatex'];
  }

  async to_html_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();
    parser.iden_blocks();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewHtml();
    parser.translate_blocks(translator);

    /// now construct a Context document
    const data = translator.to_html_document();

    /// construct an htmlfil always the same as the input + .tex 
    let htmlfil = `${filename.slice(0, filename.length - path.extname(filename).length)}.html`;
    await utils.writeFileAsync(htmlfil, data);

    /// return the name of the file
    return [htmlfil];
  }

  async to_xhtml_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();
    parser.iden_blocks();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewHtml();
    parser.translate_blocks(translator);

    /// now construct a Context document
    const data = translator.to_xhtml_document();

    /// construct an xhtmlfi always the same as the input + .tex 
    let xhtmlfi = `${filename.slice(0, filename.length - path.extname(filename).length)}.xhtml`;
    await utils.writeFileAsync(xhtmlfi, data);

    /// return the name of the file
    return [xhtmlfi];

  }

  async to_epub_document_async (filename) {

    /// parser blocks
    const parser = new NitrilePreviewParser();
    await parser.read_md_file_async(filename)
    await parser.read_mode_async();
    parser.iden_blocks();

    /// translator blocks, the translation is stored with each block
    /// at its .latex member.
    const translator = new NitrilePreviewEpub();
    parser.translate_blocks(translator);

    /// now construct a Context document
    const data = await translator.to_epub_document_async();

    /// construct an epubfil always the same as the input + .tex 
    let epubfil = `${filename.slice(0, filename.length - path.extname(filename).length)}.epub`;
    await utils.writeFileAsync(epubfil, data);

    /// return the name of the file
    return [epubfil];

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

  ///Needed for nih
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

  ///Needed for nic
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

  ///Needed for niserve
  async toHtmlDoc (fname) {

    const parser = new NitrilePreviewHtml();
    parser.isepub = 0;
    await parser.read_md_file_async(fname)
    await parser.read_mode_async();
    parser.iden_blocks();
    parser.translate_blocks();

    /// construct an HTML document
    var data = parser.toHtmlDocument();

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
