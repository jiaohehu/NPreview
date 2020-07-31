'use babel';

const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const utils = require('./nitrile-preview-utils');
const JSZip = require('jszip');
const path = require('path');

class NitrilePreviewEpub extends NitrilePreviewHtml {

  constructor(parser) {
    super(parser);
    this.name='EPUB';
  }

  async to_epub_document_async () {

    var this_zip = new JSZip();
    var this_toc_string = '';
    var this_contents = [];
    var this_images = [];
    var this_toptocs = [];

    var blocks = this.parser.blocks;
    var stylesheet = [];
    var dirname = this.parser.dirname;

    var mytitle = this.conf('title');
    var myauthor = this.conf('author');

    ///get the stylesheet from 'css' property
    stylesheet = this.conf('css');

    /// build this_images
    var imgid = 0;
    var imageidmap = new Map();
    var imagemap = new Map();///TODO: need to remove it later
    this.imgs.forEach(src => {
      imageidmap.set(src,imgid++);
      console.log('image',src);
    });
    var it = imageidmap.keys();
    var item = it.next();
    while (!item.done) {
      var src = item.value;
      var imgid = imageidmap.get(src);
      if (imagemap.has(src)) {
        var [imgbuff,mime] = imagemap.get(src);
      } else {
        var fsrc = (path.join(dirname,src));
        try {
          var [imgbuff,mime] = await utils.utils.read_image_file_async(fsrc);
        } catch (e) {
          console.log(e.toString());
          var imgbuff = Buffer.alloc(0);
          mime = '';
        }
      }
      this_images.push([`image${imgid}`,src,mime,imgbuff]);
      item = it.next();
    }

    ///:build 'this_contents'
    var o = new Map();
    for (var j=0; j < blocks.length; ++j) {
      var block = blocks[j];
      var {refid,html} = block;
      if(refid){
      }else{
        refid=0;
      }
      var saveas=`${refid}.xhtml`;
      console.log('refid=',refid,'saveas=',saveas);
      block.refid=refid;
      block.saveas=saveas;
      if(o.has(refid)){
        var me=o.get(refid);
        me.htmls.push(html);
        o.set(refid,me);
      }else{
        var htmls=[];
        var me = {htmls,refid,saveas};
        me.htmls.push(html);
        o.set(refid,me);
      }
    }
    for(var my of o.keys()){
      var {htmls,refid,saveas}=o.get(my);
      this_contents.push([`${refid}`, `${saveas}`, 'application/xhtml+xml', htmls]);
      
    }

    ///:figure if there is 'part'
    var this_ispart=0;
    for (var j = 0; j < blocks.length; ++j) {
      var block = blocks[j];
      let { saveas, sig, hdgn, idnum, name, refid, html, text } = block;
      if(sig=='HDGS'&&name=='part'){
        this_ispart=1;
      }
    }

    ///:build 'this_toptocs'
    /// note that 'tocs' is a variable that points to the toc being built
    /// it could be the 'this_toptocs', and it could also be a sub topic
    var tocs = this_toptocs;
    for (var j = 0; j < blocks.length; ++j) {
      var block = blocks[j];
      var { id, saveas, sig, hdgn, idnum, name, refid, html, text } = block;
      console.log('sig=',sig,'refid=',refid,'saveas=',saveas,'text=',text);
      if(this.parser.ismaster){
        if (sig=='HDGS' && name=='part') {
          var title = `Part ${idnum} ${this.escape(text)}`;
          tocs = [];
          this_toptocs.push(tocs);
          tocs.push({id,saveas,title});
        } else if(sig=='HDGS'&&hdgn==0){
          var title = `${idnum} ${this.escape(text)}`;
          tocs.push({id,saveas,title});
        }
      }else{
        if(sig=='HDGS'&&hdgn==1){
          var title = `${idnum} ${this.escape(text)}`;
          tocs.push({id,saveas,title});
        }
      }
    }

    /// add a titlepage.xhtml to this_contents
    if (mytitle) {
      var o=[];
      o.push(`<p style='font-size:175%; text-align:center; margin:1em 0; ' >${mytitle}</p>`);
      o.push(`<p style='font-size:125%; text-align:center; margin:1em 0; ' >${myauthor}</p>`);
      this_contents.unshift(['titlepage', 'titlepage.xhtml', 'application/xhtml+xml', o]);
      /// Add PNG files to 'this_images'...
    }

    /// now construct the this_toc
    this_toc_string = this.build_toc(this_toptocs); 
    console.log('this_toc_string=');
    console.log(this_toc_string);
  
    /// generate META-INF/container.xml

    this_zip.file('META-INF/container.xml',`\
<?xml version='1.0' encoding='utf-8'?>
<container xmlns='urn:oasis:names:tc:opendocument:xmlns:container'
version='1.0'>
<rootfiles>
<rootfile full-path='package.opf'
media-type='application/oebps-package+xml'/>
</rootfiles>
</container>
`);

    /// generate 'mimetype' file

    this_zip.file('mimetype',`\
application/epub+zip
`);

    /// generate toc.xhtml
    this_zip.file('toc.xhtml',`\
<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<link href='style.css' rel='stylesheet' type='text/css'/>
</head>
<body>
<nav epub:type='toc'>
<h1>Contents</h1>
${this_toc_string}
</nav>
</body>
</html>
`);

    /// add content*.xhtml files to zip

    for (var content of this_contents) {
      var [id,href,mediatype,htmls] = content;
      this_zip.file(href,`\
<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<link href='style.css' rel='stylesheet' type='text/css'/>
</head>
<body>
${htmls.join('\n')}
</body>
</html>
`);
    }


    /// add all image*.png files to zip

    for (var image of this_images) {
      let [id,href,mediatype,imgdata] = image;
      this_zip.file(href,imgdata);
    }

    /// generate style.css

    this_zip.file('style.css',stylesheet);
    //console.log(stylesheet);

    /// generate a unique id to be set for 'pub-id'

    let uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);

    /// generate package.opf

    this_zip.file('package.opf',`\
<?xml version='1.0' encoding='UTF-8'?>
<package xmlns='http://www.idpf.org/2007/opf' version='3.0' xml:lang='en' unique-identifier='pub-id'>
<metadata xmlns:dc='http://purl.org/dc/elements/1.1/'>
<dc:identifier id='pub-id'>${uniqueId}</dc:identifier>
<dc:language>en</dc:language>
<dc:title id='title'>${mytitle||'Untitled'}</dc:title>
<dc:subject> </dc:subject>
<dc:creator>${myauthor}</dc:creator>
</metadata>
<manifest>
<item id='toc' properties='nav' href='toc.xhtml' media-type='application/xhtml+xml'/>
<item id='stylesheet' href='style.css' media-type='text/css'/>
${this_contents.map(x => `<item id='${x[0]}' href='${x[1]}' media-type='${x[2]}' />`).join('\n')}
${this_images.map(x => `<item id='${x[0]}' href='${x[1]}' media-type='${x[2]}' />`).join('\n')}
</manifest>
<spine>
${this_contents.map(x => `<itemref idref='${x[0]}' />`).join('\n')}
</spine>
</package>
`);

    return await this_zip.generateAsync({type: 'nodebuffer'});
  }

  build_toc(tocs){
    tocs = tocs.map(x => {
      if(Array.isArray(x)){
        ///the first one is part, it needs to stay at the toplist
        var x0 = x.shift();
        var nl = this.build_toc(x);
        return `<li><a href='${x0.saveas}#${x0.id}'>${x0.title}</a>${nl}</li>`;
      }
      return `<li><a href='${x.saveas}#${x.id}'>${x.title}</a></li>`;
    })
    tocs = tocs.join('\n');
    tocs = `<ol style='list-style-type:none;' epub:type='list'>\n ${tocs} \n</ol>`;
    return tocs;
  }

  svg_to_img(text){
    text = `<img alt='diagram' src="data:image/svg+xml;charset=UTF-8,${encodeURIComponent(text)}" />`;
    return text;
  }

  do_ref(sig, label, floatname, idnum, refid, id, chapters) {
    if (refid) {
      var saveas = `${refid}.xhtml`;
    } else {
      var saveas = `0.xhtml`;
    }

    if (sig == 'HDGS') {
      var secsign = String.fromCharCode(0xA7);
      return `<a class='niref' href='${saveas}#${id}'>${secsign}${idnum}</a>`;
    }
    else if (sig == 'MATH') {
      var secsign = String.fromCharCode(0xA7);
      return `<a class='niref' href='${saveas}#${id}'>${secsign}(${idnum})</a>`;
    }
    if (floatname) {
      var secsign = String.fromCharCode(0xA7);
      return `<a class='niref' href='${saveas}#${id}'>${floatname}&#160;${secsign}${idnum}</a>`;
    }
    return `<tt><s>${label}</s></tt>`;
  }


}

module.exports = { NitrilePreviewEpub };
