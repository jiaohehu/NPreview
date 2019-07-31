'use babel';

const { Emitter, Disposable, CompositeDisposable, File } = require('atom');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewAutonum } = require('./nitrile-preview-autonum');
const { NitrilePreviewEpub } = require('./nitrile-preview-epub');
const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');
const pjson = require('./nitrile-preview-config.json');

class NitrilePreviewView {


  constructor(data) {

    /// initialize members
    this.re_book_flags = /^\:\s+(\w+)\s*\=\s*(.*)$/;
    this.re_book_files = /^(\>{1,})\s+(.*)$/;
    this.element = document.createElement('div');
    this.element.classList.add('nitrile-preview');
    this.element.style.overflow = 'scroll';
    this.parser = new NitrilePreviewHtml();
    this.editor = null;
    this.new_editor = null;
    this.path = '';
    this.lines = [];
    this.isarticle = true;
    this.flags = {};
    this.config = {};
    this.blocks = [];
    this.subs = [];
    this.filemap = new Map();
    this.flowmap = new Map();
    this.imagemap = new Map();
    this.book = [];
    this.htmls = [];
    this.chaps = [];
    this.row = -1;
    this.config = {};
    this.highlightNode = null;
    this.saveastype = '';
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    this.subscriptions = new CompositeDisposable();
    this.autonum = new NitrilePreviewAutonum();

    /// register commands
    this.disposables.add(

      atom.commands.add(this.element, {
        'nitrile-preview:jump-to-editor': (event) => {
          this.jumpToEditor(event);
        },
        'nitrile-preview:show-highlight': (event) => {
          this.scrollHilite();
        },
        'nitrile-preview:open-linked-file': (event) => {
          this.openLinkedFile(event);
        },
        'nitrile-preview:reload': () => {
          this.reload();
        },
        'nitrile-preview:copy-text': () => {
          this.copyText();
        },
        'nitrile-preview:copy-html': () => {
          this.copyHtml();
        },
        'nitrile-preview:to-html': () => {
          this.toHtml();
        },
        'nitrile-preview:to-xhtml': () => {
          this.toXhtml();
        },
        'nitrile-preview:to-latex-chapter': () => {
          this.toLatexChapter();
        },
        'nitrile-preview:to-latex': () => {
          this.toLatex();
        },
        'nitrile-preview:to-epub': () => {
          this.toEpub();
        },
        'core:move-up': () => {
          this.element.scrollTop -= document.body.offsetHeight / 20
        },
        'core:move-down': () => {
          this.element.scrollTop += document.body.offsetHeight / 20
        },
        'core:page-up': () => {
          this.element.scrollTop -= this.element.offsetHeight
        },
        'core:page-down': () => {
          this.element.scrollTop += this.element.offsetHeight
        },
        'core:move-to-top': () => {
          this.element.scrollTop = 0
        },
        'core:move-to-bottom': () => {
          this.element.scrollTop = this.element.scrollHeight
        }
      })
    )

    /// register another event
    this.disposables.add(
      atom.packages.onDidActivateInitialPackages(() => {
        this.updateBlocks();
      })
    )

    /// register another event
    this.disposables.add(
      atom.workspace.getCenter().observeActivePaneItem( (item) => {
        if (atom.workspace.isTextEditor(item)) {
          this.editor = item;
          this.setupEditor();
          this.updateBlocks();
        }
      })
    );

    /// add this view to the HTML parser
    this.parser.setView(this);

  }

  registerEventHandlers (editor) {

    this.subscriptions.add(
      editor.getBuffer().onDidStopChanging(() => {
        if (editor === this.editor) {
          if (atom.config.get('nitrile-preview.liveUpdate')) {
            this.lines = editor.getBuffer().getLines();
            this.updateBlocks();
          }
        }
      })
    );
    this.subscriptions.add(
      editor.onDidChangeCursorPosition((event) => {
        if (editor === this.editor) {
          this.row = event.newBufferPosition.row;
          this.doHilite();
        }
      })
    );
    this.subscriptions.add(
      editor.onDidSave((event) => {
        if (editor === this.editor) {
          this.path = event.path;
          this.lines = editor.getBuffer().getLines();
          this.updateBlocks();
        }
      })
    );
    this.subscriptions.add(
      editor.onDidDestroy(() => {
        if (editor === this.editor) {
          /// change the id only.
          /// this is so that when the original editor
          /// is closed then the id will not be serialized
          /// and when refreshed late it will pick up
          /// a new source editor
          this.editor = null;
          this.setupEditor();
          this.updateBlocks();
        }
      })
    );
  }

  hasImage (imgid) {
    return this.imagemap.has(imgid);
  }

  getImage (imgid) {
    return this.imagemap.get(imgid);
  }

  requestImage (imgid,src) {

    if (!atom.packages.hasActivatedInitialPackages()) {
      return;
    }

    if ( this.imagemap.has(src) ) {
///console.log(`load image from imagemap: ${imgid}, ${src}`);
      setTimeout( () => {

        if (this.imagemap.has(src)) {
          let imgbuff = this.imagemap.get(src);
          var node = document.querySelector(`img#nitrile-preview-img-${imgid}`);
          if (node) {
            node.src = `data:image/png;base64,${imgbuff.toString('base64')}`;///TODO: harded coded to PNG,
          }
        }

      }, 0);

    } else {

///console.log(`load image from file: ${imgid}, ${src}`);
      var fsrc = path.join(this.dirname(),src);
      this.parser.readImageFileAsync(fsrc)
        .then( imgbuff => {
            this.imagemap.set(src,imgbuff);
            var node = document.querySelector(`img#nitrile-preview-img-${imgid}`);
            if (node) {
              node.src = `data:image/png;base64,${imgbuff.toString('base64')}`;///TODO: harded coded to PNG,
            }
        })
        .catch( err => console.error(err) )
    }
  }

  doHilite () {

    /// find the node that matches the row
    /// in the editor and then set the background-color
    /// of that node to 'yellow'

    // clear previous id

    if (this.highlightNode) {
      var node = this.highlightNode;
      node.style.outline = '';
      node.style.backgroundColor = '';
      this.highlightNode = null;
    }

    /// if this is an article

    if (this.isarticle  ) {

      var row = this.row;
      for (var block of this.blocks) {
        const [id,row1,row2] = block;
        if (row >= row1 && row < row2) {
          var node = document.getElementById(id);
          if (node) {
            node.style.outline = '5px solid yellow';
            node.style.backgroundColor = 'yellow';
            this.highlightNode = node;
            if (atom.config.get('nitrile-preview.autoScroll')) {
              node.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
            }
          }
          break;
        }
      }

      return;

    } else {

      /// This is a !BOOK block
      /// Find the file name underneath this row

      var row = this.row;
      var node = document.querySelector(`[subrow='${row}']`);
      if (node) {
        node.style.outline = '5px solid yellow';
        node.style.backgroundColor = 'yellow';
        this.highlightNode = node;
        if (atom.config.get('nitrile-preview.autoScroll')) {
          node.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
        }
      }

      return;
    }

  }

  getElement() {
    return this.element;
  }

  getTitle() {
    // Used by Atom for tab text
    return 'Nitrile Preview';
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return 'atom://nitrile-preview';
  }

  getDefaultLocation() {
    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'right';
  }

  getAllowedLocations() {
    // The locations into which the item can be moved.
    return ['left', 'right', 'bottom'];
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      deserializer: 'nitrile-preview/NitrilePreviewView'
    };
  }

  // called when nitrile-preview window is being destroyed
  destroy() {

    this.disposables.dispose();
    this.subscriptions.dispose();
    this.element.remove();
    this.emitter.emit('did-destroy');

  }

  dirname () {
    /// figure out the dirname of the current editor
    var dirname = path.dirname(this.path);
    if (path.isAbsolute(dirname)) {
      return dirname;
    } else {
      try {
        dirname = atom.project.getPaths()[0];
      } catch(e) {
        dirname = '';
      }
      return dirname;
    }
  }

  async getFlows() {


    var fname = this.path ? path.basename(this.path) : '';
    var [blocks,flags,book] = this.parser.toFlow(this.lines,fname);
    var isarticle = (book.length == 0);
    var subs = [];
    if (book.length) {
      var  subs = this.parser.parseFILES(book);
      var  flags = this.parser.parseFLAGS(book);
      var proms = subs.map ( sub => this.getSubFlow(sub) );
      for (var j in proms) {
        subs[j].flow = await proms[j];
      }
    }

    return [blocks,flags,book,subs];
  }

  async getSubFlow (sub) {
    let { subfname, sublevel, subpart, subrow } = sub;
    if (sublevel < 0) {
      var o = [];
      o.push(this.parser.newPARTblock (subpart));
      return [o,{},[]];
    }

    var fsubfname = path.join(this.dirname(),subfname);

    if (this.flowmap.has(fsubfname)) {
      return this.flowmap.get(fsubfname);

    }

    var flow = await this.fetchFlow(sub,fsubfname);


    return flow;
  }

  async fetchFlow (sub,fsubfname) {
    try {
      var out = await this.readFileAsync(fsubfname);
      var flow = this.parser.toFlow(out.split('\n'),sub.subfname);
      return flow;
    } catch (e) {
      var o = [];
      o.push(this.parser.newHDGSblock(e.toString(),sub.subfname));
      var flow = [o,{},[]];
      return flow;
    }
  }

  getBool (val) {

    ///
    /// given a string, return a boolean value
    ///
    /// getBool("1"); //true
    /// getBool("0"); //false
    /// getBool("true"); //true
    /// getBool("false"); //false
    /// getBool("TRUE"); //true
    /// getBool("FALSE"); //false
    ///

    var num = +val;
    return !isNaN(num) ? !!num : !!String(val).toLowerCase().replace(!!0,'');
  }

  isEqual ( x, y ) {
    if ( x === y ) return true;
      // if both x and y are null or undefined and exactly the same

    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
      // if they are not strictly equal, they both need to be Objects

    if ( x.constructor !== y.constructor ) return false;
      // they must have the exact same prototype chain, the closest we can do is
      // test there constructor.

    for ( var p in x ) {
      if ( ! x.hasOwnProperty( p ) ) continue;
        // other properties were tested using x.constructor === y.constructor

      if ( ! y.hasOwnProperty( p ) ) return false;
        // allows to compare x[ p ] and y[ p ] when set to undefined

      if ( x[ p ] === y[ p ] ) continue;
        // if they have the same strict value or identity then they are equal

      if ( typeof( x[ p ] ) !== "object" ) return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal

      if ( ! this.isEqual( x[ p ],  y[ p ] ) ) return false;
        // Objects and Arrays must be tested recursively
    }

    for ( p in y ) {
      if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
        // allows x[ p ] to be set to undefined
    }
    return true;
  }

  refreshView() {

    this.updateFlag = false;
    var geometry_text = this.parser.toPageCssStyleText(this.config);

    this.htmls = [];
    this.chaps = [];
    var ispreview = true;/// ispreview flag is true

    this.autonum.start();
    if (this.isarticle) {
      [this.htmls,this.chaps] = this.parser.translateHtml(this.autonum,this.config,this.blocks,this.isarticle,ispreview,0,0,this.htmls,this.chaps);
    } else {
      for (var i=0; i < this.subs.length; ++i) {
        [this.htmls,this.chaps] = this.parser.translateHtml(this.autonum,this.config,this.subs[i].flow[0],this.isarticle,ispreview,this.subs[i].subrow,this.subs[i].sublevel,this.htmls,this.chaps);
      }
    }
    this.autonum.end();

    this.htmls = this.parser.replaceRef(this.htmls,this.chaps);

    this.innerHTMLs = [];
    this.innerHTMLs.push(`<main class='PAGE' style='${geometry_text}' >`);
    this.innerHTMLs.push(`<p class='TITLE' style='${this.parser.titlecssstyle}' >`);
    this.innerHTMLs.push(`${this.parser.escape(this.title)}`);
    this.innerHTMLs.push(`</p>`);
    this.innerHTMLs.push(`<p class='AUTHOR' style='${this.parser.authorcssstyle}' >`);
    this.innerHTMLs.push(`${this.parser.escape(this.author)}`);
    this.innerHTMLs.push(`</p>`);
    this.innerHTMLs.push(`<p class='DATE' style='${this.parser.datecssstyle}' >`);
    this.innerHTMLs.push(`${this.parser.escape(new Date().toLocaleDateString())}`);
    this.innerHTMLs.push(`</p>`);
    this.innerHTMLs = this.innerHTMLs.concat(this.htmls);
    this.innerHTMLs.push(`</main>`);

    const { scrollTop } = this.element;
    this.element.textContent = ''
    this.element.innerHTML = this.innerHTMLs.join('\n');
    this.element.scrollTop = scrollTop
    this.highlightNode = null;
    this.doHilite();

  }

  updateBlocks() {

    /// check the flag before update

    this.getFlows().then( ([blocks,flags,book,subs]) => {

        this.isarticle = (book.length == 0);
        this.blocks = blocks;
        this.flags = flags;
        this.book = book;
        this.subs = subs;

        this.config = this.parser.toConfig(this.flags);

        this.title = this.config.title ? this.config.title : 'Untitled'
        this.author = this.config.author ? this.config.author : ''

        this.subs.map( sub => {
            let {subfname,flow} = sub;
            let fsubfname = path.join(this.dirname(),subfname);
            if (!this.filemap.has(fsubfname)) {
              var file = new File(fsubfname);
              this.filemap.set(fsubfname,file);

              this.disposables.add(
                file.onDidChange( () => {
                    this.flowmap.delete(fsubfname);
                    this.updateBlocks();
                })
              );
            }
            if (!this.flowmap.has(fsubfname)) {
              this.flowmap.set(fsubfname,flow);
            }
        });

        this.refreshView();
    });

  }

  async openEditorAsync(data) {
    var editor = await atom.workspace.open(data,{pending:true,searchAllPanes:true,activatePane:false,activateItem:false})
    return editor;
  }

  async readFileFromPath(data) {

    var data1 = await fs.readFileSync(data,'utf8');
    return data1;
  }

  async readFileAsync (filename) {

    /// Returns a Promise that resolves to a string of
    /// the entire file content being read

    return new Promise((resolve, reject)=>{
        fs.readFile(filename, "utf8", function(err, data) {
                if (err) {
                  reject(err.toString());
                } else {
                  resolve(data.toString());
                }
        });
    });
  }

  onDestroyed (callback) {

    /// called when this view is destroyed.

    return this.emitter.on('did-destroy',callback);
  }

  openLinkedFile (event) {

    /// open the linked file in editor

    var node = event.target;
    var [node,fName] = this.findFnameNode(node);
    if (node) {
      if (fName) {
        atom.workspace.open(fName,{pending:true,searchAllPanes:true});
      }
    }

  }

  findParentHnodeById (node, id) {
    while (node ) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var idName = ''+node.id;
      if (className === 'nitrile-preview') {
        return null;
      }
      if (nodeName.match(/^H[1-6]$/) && idName === id) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  findFnameNode (node) {
    while (node ) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var fName = node.getAttribute('fName');
      if (className === 'nitrile-preview') {
        return [null,null];
      }
      if (fName) {
        return [node,fName];
      }
      node = node.parentNode;
    }
    return [null,null];
  }

  getContentsBlocksForHDGS (id) {

    /// returns a range of blocks that is the content of
    /// a HDGS block with the given id

    var j = -1;
    var k = -1;
    for (var j=0; j < this.blocks.length; ++j) {
      var block1 = this.blocks[j];
      var id1 = block1[0];
      var type1 = block1[3];
      if (type1 === 'HDGS' && id1 === id) {
        j += 1;
        for (var k=j; k < this.blocks.length; ++k) {
          var block2 = this.blocks[k];
          var type2 = block2[3];
          if (type2 === 'HDGS') {
            break;
          }
        }
        break;
      }
    }
    if (j >= 0 && k >= 0) {
      return this.blocks.slice(j,k);
    }
    return [];
  }

  scrollHilite() {

    /// scroll the preview window so that the selected
    /// node is shown

    var elem = document.getElementById(this.highlightId);
    if (elem) {
      elem.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
      //elem.scrollIntoView();
    }

  }

  copyText () {

    /// copy the selected text (if any)

    const selection = window.getSelection()
    const selectedText = selection.toString()
    const selectedNode = selection.baseNode

    // Use default copy event handler if there is selected text inside this view
    if (
      selectedText &&
      selectedNode != null &&
      (this.element === selectedNode || this.element.contains(selectedNode))
    ) {
      atom.clipboard.write(selectedText)
    }

  }

  copyHtml () {

    /// copy the entire HTML

    atom.clipboard.write(this.innerHTMLs.join('\n'))

  }

  toHtml() {


    /// called as a command by 'Save As HTML...'
    this.saveastype = 'html';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toXhtml() {


    this.saveastype = 'xhtml';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toLatexChapter () {

    this.saveastype = 'latex-chapter';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toLatex () {

    /// either to a book or an article depending

    this.saveastype = 'latex-complete';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toEpub () {


    this.saveastype = 'epub';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  findEditorByPath (path) {
    /// try to find amoung active editors for the one
    /// that matches the given path
    for (const editor of atom.workspace.getTextEditors()) {
      if (editor.getPath() && path && editor.getPath() === path) {
        return editor;
      }
    }
    return null;
  }

  jumpToEditor (event) {

    if (!this.editor ) {
      atom.workspace.open(this.path,{pending:true,searchAllPanes:true})
          .then((item) => {
            this.editor = item;
            this.setupEditor();
            this.updateBlocks();
          });
      return;
    }

    if (this.isarticle) {
      var node = event.target;
      while (node) {
        var nodeName = ''+node.nodeName;
        var className = ''+node.className;
        var rows = node.getAttribute('rows');
        if (className === 'nitrile-preview') {
          break;
        }
        if (rows) {
          [row1, row2] = rows.split(' ');
          this.editor.setCursorBufferPosition([+row1,0],{'.autoscroll': true});
          return;
        }
        node = node.parentNode;
      }

    } else {

      var node = event.target;
      while (node) {
        var nodeName = ''+node.nodeName;
        var className = ''+node.className;
        var subrow = node.getAttribute('subrow');
        if (className === 'nitrile-preview') {
          break;
        }
        if (subrow) {
          this.editor.setCursorBufferPosition([+subrow,0],{'.autoscroll': true});
          atom.workspace.paneForItem(this.editor).activate();
          atom.workspace.paneForItem(this.editor).activateItem(this.editor);
          return;
        }
        node = node.parentNode;
      }


    }

  }

  reload () {

    /// Reload the entire content of the preview. This is necessary
    /// when previewing a BOOK content and one of the sub-document
    /// has been modified and saved and thus the contents blocks need
    /// to be re-generated.

    /// clear the imagemap
    this.imagemap.clear();
    this.filemap.clear();
    this.flowmap.clear();
    this.lines = [];

    if (this.editor) {
      this.lines = this.editor.getBuffer().getLines();
      this.updateBlocks();
    }
  }

  setupEditor () {
    this.lines = [];
    this.blocks = [];
    this.flags = {};
    this.config = {};
    this.subs = [];
    this.path = '';
    this.subscriptions.dispose();
    this.imagemap.clear();
    this.filemap.clear();
    this.flowmap.clear();
    this.row = -1;
    if (this.editor) {
      this.lines = this.editor.getBuffer().getLines();
      this.path = this.editor.getPath();
      this.row = this.editor.getCursorBufferPosition().row;
      this.registerEventHandlers(this.editor);
    }
  }

  getPath () {

    /// this function is a required as an item interface function
    /// that is called by Atom when 'core:save-as' is
    /// run. As an item, this method will return a path
    /// that atom is trying to use as the initial
    /// path for the file to be saved.

    var basename = '';
    if (this.path) {
      switch (this.saveastype) {
        case 'html':
          basename = path.basename(this.path + ".html");
          break;
        case 'xhtml':
          basename = path.basename(this.path + ".xhtml");
          break;
        case 'latex-chapter':
        case 'latex-complete':
          basename = path.basename(this.path + ".tex");
          break;
        case 'epub':
          basename = path.basename(this.path + ".epub");
          break;
        default:
          basename = path.basename(this.path);
          break;
      }
      if (path.isAbsolute(this.dirname())) {
        return path.resolve(this.dirname(),basename);
      }
    }

  }

  async saveAs (savefilepath) {

    /// this function is required as an item interface
    /// function that will be called by Atom after it
    /// has confirmed a save-path with user and it
    /// this function is then called to actually save
    /// whatever needs to be saved to this path.

    try {
      var data = '';
      var datatype = '';

      if (this.saveastype === 'latex-chapter') {

        var latex = new NitrilePreviewLatex();
        var autonum = new NitrilePreviewAutonum();

        var olines = latex.translateLatex(autonum,this.config,this.blocks,false,0,0,[]);
        data = `${olines.join('\n')}
`;

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');


      } else if (this.saveastype === 'latex-complete') {

        var latex = new NitrilePreviewLatex();
        var autonum = new NitrilePreviewAutonum();

        if (this.isarticle) {
          var olines = latex.translateLatex(autonum,this.config,this.blocks,this.isarticle,0,0,[]);
        } else {
          var olines = [];
          for (var i=0; i < this.subs.length; ++i) {
            olines = latex.translateLatex(autonum,this.config,this.subs[i].flow[0],this.isarticle,this.subs[i].subrow,this.subs[i].sublevel,olines);
          }
        }

        var latexfamily = this.config.latexfamily;
        var documentclass = this.config.documentclass ? this.config.documentclass : ''
        if (!documentclass) {
          documentclass = this.isarticle ? "article" : "book";
        }
        var documentclassopt = [];
        if (this.config.latextwocolumn) { documentclassopt.push('twocolumn'); }

        data = `\% \!TEX program = ${latexfamily}
\\documentclass[${documentclassopt.join(',')}]{${documentclass}}
${latex.toRequiredPackages(this.isarticle,this.config)}
\\title{${latex.escape(this.title)}}
\\author{${latex.escape(this.author)}}
\\begin{document}
\\maketitle
${olines.join('\n')}
\\end{document}
`;

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');


      } else if (this.saveastype === 'xhtml') {

        /// regenerate HTML without 'ispreview'

        var htmls = [];
        var chaps = [];
        var ispreview = false;/// ispreview flag is false
        this.autonum.start();
        if (this.isarticle) {
          [htmls,chaps] = this.parser.translateHtml(this.autonum,this.config,this.blocks,this.isarticle,ispreview,0,0,htmls,chaps);
        } else {
          for (var i=0; i < this.subs.length; ++i) {
            [htmls,chaps] = this.parser.translateHtml(this.autonum,this.config,this.subs[i].flow[0],this.isarticle,ispreview,this.subs[i].subrow,this.subs[i].sublevel,htmls,chaps);
          }
        }
        this.autonum.end();

        htmls = this.parser.replaceRef(htmls,chaps);

        const cssrules = []
        const re = /\.nitrile-preview/
        for (const stylesheet of document.styleSheets) {
          if (stylesheet.rules != null) {
            for (const rule of stylesheet.rules) {
              // We only need '.nitrile-review' css
              if (rule.selectorText && rule.selectorText.match(re)) {
                cssrules.push(rule.cssText)
              }
            }
          }
        }

        var geometry_text = this.parser.toPageCssStyleText(this.config);

        data = `<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<style>
${cssrules.join('\n')}
</style>
</head>
<body class='nitrile-preview'>
<main class='PAGE' style='${geometry_text}' >
<p class='TITLE' style='${this.parser.titlecssstyle}' >
${this.parser.escape(this.title)}
</p>
<p class='AUTHOR' style='${this.parser.authorcssstyle}' >
${this.parser.escape(this.author)}
</p>
<p class='DATE' style='${this.parser.datecssstyle}' >
${this.parser.escape(new Date().toLocaleDateString())}
</p>
${htmls.join('\n')}
</main>
</body>
</html>
`;

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');


      } else if (this.saveastype === 'html') {

        /// regenerate HTML without 'ispreview'

        var htmls = [];
        var chaps = [];
        var ispreview = false;
        this.autonum.start();
        if (this.isarticle) {
          [htmls,chaps] = this.parser.translateHtml(this.autonum,this.config,this.blocks,this.isarticle,ispreview,0,0,htmls,chaps);
        } else {
          for (var i=0; i < this.subs.length; ++i) {
            [htmls,chaps] = this.parser.translateHtml(this.autonum,this.config,this.subs[i].flow[0],this.isarticle,ispreview,this.subs[i].subrow,this.subs[i].sublevel,htmls,chaps);
          }
        }
        this.autonum.end();

        htmls = this.parser.replaceRef(htmls,chaps);

        const cssrules = []
        const re = /\.nitrile-preview/
        for (const stylesheet of document.styleSheets) {
          if (stylesheet.rules != null) {
            for (const rule of stylesheet.rules) {
              // We only need '.nitrile-review' css
              if (rule.selectorText && rule.selectorText.match(re)) {
                cssrules.push(rule.cssText)
              }
            }
          }
        }

        var geometry_text = this.parser.toPageCssStyleText(this.config);

        data = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
${cssrules.join('\n')}
</style>
</head>
<body class='nitrile-preview'>
<main class='PAGE' style='${geometry_text}' >
<p class='TITLE' style='${this.parser.titlecssstyle}' >
${this.parser.escape(this.title)}
</p>
<p class='AUTHOR' style='${this.parser.authorcssstyle}' >
${this.parser.escape(this.author)}
</p>
<p class='DATE' style='${this.parser.datecssstyle}' >
${this.parser.escape(new Date().toLocaleDateString())}
</p>
${htmls.join('\n')}
</main>
</body>
</html>
`;

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');

      } else if (this.saveastype === 'epub') {

        /// regenerate HTML without 'ispreview' flag

        var htmls = [];
        var chaps = [];
        var ispreview = false;
        this.autonum.start();
        if (this.isarticle) {
          [htmls,chaps] = this.parser.translateHtml(this.autonum,this.config,this.blocks,this.isarticle,ispreview,0,0,htmls,chaps);
        } else {
          for (var i=0; i < this.subs.length; ++i) {
            [htmls,chaps] = this.parser.translateHtml(this.autonum,this.config,this.subs[i].flow[0],this.isarticle,ispreview,this.subs[i].subrow,this.subs[i].sublevel,htmls,chaps);
          }
        }
        this.autonum.end();

        /// now call on 'epub' module to generate a nodejs Buffer() object

        var epub = new NitrilePreviewEpub();
        data = await epub.generateAsync(this.parser,this.parser.escape(this.title),this.parser.escape(this.author),htmls,chaps,this.imagemap,this.isarticle,this.dirname());
          ///...data is a Nodejs Buffer
        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' byte(s)');


      }

    } catch(e) {

      atom.notifications.addError(e.toString());
      console.error(e.stack);
    }

  }

  _onDidChangeModified (callback) {

    // No op to suppress deprecation warning
    return new Disposable()

  }

  getFileNameAtBookRow (line) {
    var v = this.re_book_files.exec(line);
    if (v) {
      return v[2];
    }
    return '';
  }

}


module.exports = { NitrilePreviewView };
