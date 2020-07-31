'use babel';

const { Emitter, Disposable, CompositeDisposable, File } = require('atom');
const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const { NitrilePreviewPeek } = require('./nitrile-preview-peek');
const { NitrilePreviewLualatex } = require('./nitrile-preview-lualatex');
const { NitrilePreviewPdflatex } = require('./nitrile-preview-pdflatex');
const { NitrilePreviewContext } = require('./nitrile-preview-context');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewEpub } = require('./nitrile-preview-epub');
const utils = require('./nitrile-preview-utils');
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
    this.parser = new NitrilePreviewParser();
    this.editor = null;
    this.new_editor = null;
    this.path = '';
    this.lines = [];
    this.innerHTML = '';
    this.filemap = new Map();
    this.imagemap = new Map();
    this.chaps = [];
    this.row = -1;
    this.column = -1;
    this.openflag = 0;///set to 1 if one of the subdocument is enabled
    this.saveastype = '';
    this.isfullpage = 0;
    this.last_active_pane_item = null;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    this.subscriptions = new CompositeDisposable();
    this.subs = [];
    this.scroll_id = 0;

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
        'nitrile-preview:toggle-full-page': (event) => {
          this.toggleFullPage();
        },
        'nitrile-preview:do-reload': () => {
          this.doReload();
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
        'nitrile-preview:to-contex': () => {
          this.toContex();
        },
        'nitrile-preview:to-latex': () => {
          this.toLatex();
        },
        'nitrile-preview:to-epub': () => {
          this.toEpub();
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
        this.last_active_pane_item = item;
        if (atom.workspace.isTextEditor(item)) {
          this.editor = item;
          this.setupEditor();
          this.updateBlocks();
        }
      })
    );

    this.disposables.add(
      atom.commands.add('atom-workspace', {
        'core:copy': (event) => { event.stopPropagation(); this.copyText(); },
        'core:move-up': () => { this.element.scrollTop -= document.body.offsetHeight / 20 },
        'core:move-down': () => { this.element.scrollTop += document.body.offsetHeight / 20 },
        'core:page-up': () => { this.element.scrollTop -= this.element.offsetHeight },
        'core:page-down': () => { this.element.scrollTop += this.element.offsetHeight },
        'core:move-to-top': () => { this.element.scrollTop = 0 },
        'core:move-to-bottom': () => { this.element.scrollTop = this.element.scrollHeight }
      })
    );


  }

  doReload () {

    /// find the current active editor and set it up
    /// instead
    var item = this.last_active_pane_item;
    if (atom.workspace.isTextEditor(item)) {
      this.editor = item;
      this.setupEditor();
      this.updateBlocks();
    }
  }

  registerEventHandlers (editor) {

    this.subscriptions.add(
      editor.getBuffer().onDidStopChanging(() => {
        if (editor === this.editor) {
          this.ismodified = 1;
          //if (atom.config.get('nitrile-preview.liveUpdate')) {
          if(!this.issaved){ // before saved we do live-update, afterwards we demands on save first
            this.lines = editor.getBuffer().getLines();
            this.updateBlocks();
          }
        }
      })
    );
    this.subscriptions.add(
      editor.onDidChangeCursorPosition((event) => {
        if (editor === this.editor) {
          //if(!this.issaved || !this.ismodified){
          if(1){
            this.row = event.newBufferPosition.row;
            this.column = event.newBufferPosition.column;
            this.doHilite(false);
          }
        }
      })
    );
    this.subscriptions.add(
      editor.getElement().onDidChangeScrollTop((event) => {
        if (editor === this.editor) {
          if(1){
            //console.log('onDidChangeScrollTop','event=',event);
            //console.log('getFirstVisibleScreenRow()',editor.getElement().getFirstVisibleScreenRow());
            var x    = editor.getElement().getFirstVisibleScreenRow();
            var y    = 0;
            var point = editor.bufferPositionForScreenPosition([x,y]);
            //console.log('bufferPositionForScreenPosition()',point.row,point.column);
            this.doScrollTop(point.row,point.column);
          }
        }
      })
    );
    this.subscriptions.add(
      editor.onDidSave((event) => {
        if (editor === this.editor) {
          this.path = event.path;
          this.issaved = 1;
          this.lines = editor.getBuffer().getLines();
          this.updateBlocks();
        }
      })
    );
    this.subscriptions.add(
      editor.onDidDestroy(() => {
        if (editor === this.editor) {
          /// need to check to see if it is the current.
          /// It could happen that when observe new editor
          /// event is received first we would have switched
          /// over to the new editor, and then we will
          /// receive a destroy event for the old editor.
          /// If we don't check we will destroy the newly created
          /// editor.
          this.editor = null;
          this.setupEditor();
          this.updateBlocks();
        }
      })
    );
  }

  query_imagemap_info(src){

    if (this.imagemap.has(src)) {
      var [imgbuf, mime] = this.imagemap.get(src);
      var imgsrc = `data:${mime};base64,${imgbuf.toString('base64')}`;
      var imgid = '';
      return {imgsrc,imgid};
    }

    if(!this.imgid){
      this.imgid=1;
    }else{
      this.imgid+=1;
    }
    var imgid=this.imgid;
    console.log(`load image from file: ${imgid}, ${src}`);
    var fsrc = path.join(this.dirname(), src);
    utils.read_image_file_async(fsrc)
      .then(data => {
        this.imagemap.set(src, data);
        var [imgbuf, mime] = data;
        var node = document.querySelector(`img#imgid${imgid}`);
        if (node) {
          node.src = `data:${mime};base64,${imgbuf.toString('base64')}`;///TODO: harded coded to PNG,
          console.log(`replaced node with datauri: ${node.src.substr(0,80)}...`);
        }
      })
      .catch(err => console.error(err))

    var imgsrc=fsrc;
    imgid = `imgid${imgid}`;
    return {imgsrc,imgid};
  }

  requestImage (src) {


    if (!src) {
      return;
    }

    if(!this.imgid){
      this.imgid = 1;
    }else{
      this.imgid += 1;
    }

    if (!atom.packages.hasActivatedInitialPackages()) {
      return;
    }

    if ( this.imagemap.has(src) ) {
console.log(`load image from imagemap: ${imgid}, ${src}`);
      setTimeout( () => {

        if (this.imagemap.has(src)) {
          var [imgbuf,mime] = this.imagemap.get(src);
          var node = document.querySelector(`img#nitrileimg-${imgid}`);
          if (node) {
            node.src = `data:${mime};base64,${imgbuf.toString('base64')}`;///TODO: harded coded to PNG,
          }
        }

      }, 0);

    } else {

console.log(`load image from file: ${imgid}, ${src}`);
      var fsrc = path.join(this.dirname(),src);
      utils.read_image_file_async(fsrc)
        .then( data => {
            this.imagemap.set(src,data);
            var [imgbuf,mime] = data;
            var node = document.querySelector(`img#nitrileimg-${imgid}`);
            if (node) {
              node.src = `data:${mime};base64,${imgbuf.toString('base64')}`;///TODO: harded coded to PNG,
            }
        })
        .catch( err => console.error(err) )

      /// add file watch

      if (!this.filemap.has(fsrc)) {
///console.log(`add image ${fsrc} to watch`);
        var file = new File(fsrc);
        this.filemap.set(fsrc,file);

        this.subscriptions.add(
          file.onDidChange( () => {
///console.log(`image ${fsrc} changed`);
              this.imagemap.delete(src);
              this.refreshView();
          })
        );
      }

    }

  }

  doScrollTop (row,column) {

    var isscroll = 0;
    for (var block of this.parser.blocks) {
      const {id,row1,row2} = block;
      if (row >= row1 && row < row2) {
        var node = document.getElementById(id);
        if (node) {
          //console.log('doScrollTop','found node',node.id);
          if(this.scroll_id == node.id){
            //console.log('doScrollTop',this.scroll_id,node.id);           
              //dont do anything, this is for the situation where the user has scroll the
              //preview pane for some reason, and then went back to the editor, to edit
              //additional texts---in this case we don't want to have to re-scroll the
              //pane if the editor has been scrolled but still on the same node
          }else{
            //console.log('doScrollTop',this.scroll_id,node.id);           
              //node.scrollIntoView({block:'center'});
            node.scrollIntoView(true);//scroll so that the top of the element aligns with the top of the view
            this.scroll_id = node.id;
          }
        }
        break;
      }
    }

  }

  doHilite (needscroll) {

    var isscroll = 0;
    var row = this.row;
    for (var block of this.parser.blocks) {
      const {id,row1,row2} = block;
      if (row >= row1 && row < row2) {
        var node = document.getElementById(id);
        if (node) {
          ///NOTE: set to orange for now. May offset as an option
          ///for NitrilePreview.
          if(this.hilite_node){
            if(this.hilite_node == node){
              // same node
            } else {
              // different node
              this.hilite_node.style.outline = '0px solid orange';
              node.style.outline = '1px solid orange';
              isscroll = 1;
              this.hilite_node = node;
            }
          } else {
            // no previous hilited node
            this.hilite_node = node;
            node.style.outline = '1px solid orange';
          }
          if(needscroll && isscroll){
            //node.scrollIntoView({block:'center'});
            node.scrollIntoView(true);
          }
        }
        break;
      }
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
    return ['left', 'right', 'bottom' ];
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

  updateBlocks() {

    this.parser.read_md_lines(this.lines);
    this.refreshView();
    
  }
  
  
  refreshView() {
    
    //var fontsize = this.parser.config.HTML.bodyfontsizept;
    var fontsize = atom.config.get('nitrile-preview.fontSizePt');
    var fontsize = parseFloat(fontsize);
    if (Number.isFinite(fontsize)){
      fontsize = 12;
    } else if(fontsize < 12) {
      fontsize = 12;
    }

    // This function will call translateBlock() because it will 
    // look for loaded image and then rebuild the HTML to
    // embed the loaded image as data URI

    var opts = [];
    opts.push(`font-size:12pt`);
    opts.push(`font-family:roman`);
    opts.push(`color:black`);
    opts.push(`background-color:white`);
    opts.push(`width:8.5in`);
    opts.push(`padding-left:1.5in`);
    opts.push(`padding-right:1.5in`);
    opts.push(`padding-top:1in`);
    opts.push(`padding-bottom:1in`);
    opts.push(`margin:0`);
    opts.push(`box-sizing:border-box`);

    var translator = new NitrilePreviewPeek(this.parser);
    translator.set_view(this);

    this.parser.idname = 'nitrile-preview';
    translator.translate_blocks();
    var htmls = this.parser.blocks.map(x=>x.html);

    var html = `<main style='${opts.join(';')}'> ${htmls.join('\n')} </main>`;

    const { scrollTop } = this.element;
    this.element.textContent = ''
    this.element.innerHTML = html;
    this.element.scrollTop = scrollTop

    this.doHilite(false);
  }


  async openEditorAsync(data) {
    var editor = await atom.workspace.open(data,{pending:true,searchAllPanes:true,activatePane:false,activateItem:false})
    return editor;
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

  toggleFullPage() {
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

  scrollHilite() {

    /// scroll the preview window so that the selected
    /// node is shown

    var elem = this.hilite_node;
    if (elem) {
      elem.scrollIntoView({block: 'nearest'});
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

    atom.clipboard.write(this.innerHTML);

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

    this.saveastype = 'latex';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toContex () {

    /// either to a book or an article depending

    this.saveastype = 'contex';
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

    ///NOTE: if the editor is set, then we basically the 'event.target'
    ///which is a HTML Element node reference (see DOM for more information)
    ///Since each DOM node has a nodeName, nodeClass which are the standard
    ///members of the Element class. This gives you the chance to search
    ///DOM for a node up until you have hit the 'nitrile-preview'---this is
    ///the topmost node for our entire app---which means we should not go outside
    /// of this boundary because outside of it is no longer our App.
    /// 
    ///The goal is to search for a node that has the 'rows=' attribute set. 
    /// This is guarentted by the 'translate_blocks()' function.
    ///
    ///Once we've found it, we retrieve the 'rows' attribute of this node,
    ///which tells us which block we have clicked on, and this matches back
    ///to the source ID file and the particular line number that has constributed
    ///to this particular block. 
    ///
    ///It is pretty easy to ask the editor to jump to a particular line number
    ///which is to simply call the editor.setCursorBufferPosition().
    ///

    if (this.editor) {
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
          //this.editor.setSelectedBufferRange(new Range([+row1,0],[+row2,0]));
          return;
        }
        node = node.parentNode;
      }

    } 
  }

  setupEditor () {
    this.lines = [];
    this.path = '';
    this.subscriptions.dispose();
    this.imagemap.clear();
    this.filemap.clear();
    this.row = -1;
    this.column = -1;
    if (this.editor) {
      this.lines = this.editor.getBuffer().getLines();
      this.path = this.editor.getPath();
      this.row = this.editor.getCursorBufferPosition().row;
      this.column = this.editor.getCursorBufferPosition().column;
      this.registerEventHandlers(this.editor);
    }
  }

  getPath () {

    /// this function is a required as an item interface function
    /// that is called by Atom when it needs to find out the
    /// path of the current file.
    ///
    /// When saveItemAs() is called this method is also called to
    /// ask user to generate a new file name, and the new filename is
    /// returned based on the 'this.saveastype' parameter that was
    /// previously set.
    ///
    /// This method is required to return a string
    /// denoting the name of the file to be saved, such as 'myfile.md.tex'

    var outname  = '';
    if (this.path) {
      switch (this.saveastype) {
        case 'html':
          outname = 'a.html';
          break;
        case 'xhtml':
          outname = 'a.xhtml';
          break;
        case 'latex':
          outname = 'a.tex';
          break;
        case 'contex':
          outname = 'a.tex';
          break;
        case 'epub':
          outname = 'a.epub';
          break;
        default:
          outname = 'a.txt';
          break;
      }
      if (path.isAbsolute(this.dirname())) {
        return path.resolve(this.dirname(),outname);
      } else {
        return outname;
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

      if (this.saveastype === 'latex') {

        const translator = new NitrilePreviewLualatex(this.parser);
        translator.translate_blocks();
        var data = translator.to_lualatex_document();

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');

      } 
      else if (this.saveastype === 'contex') {

        const translator = new NitrilePreviewContext(this.parser);
        translator.translate_blocks();
        var data = translator.to_contex_document();

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');

      } 
      else if (this.saveastype === 'xhtml') {

        const translator = new NitrilePreviewHtml(this.parser);
        translator.translate_blocks();
        var data = translator.to_xhtml_document();

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');

      } else if (this.saveastype === 'html') {

        const translator = new NitrilePreviewHtml(this.parser);
        translator.translate_blocks();
        var data = translator.to_html_document();

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');

      } 
      else if (this.saveastype === 'epub') {

        const translator = new NitrilePreviewEpub(this.parser);
        translator.translate_blocks();
        var data = await translator.to_epub_document_async(this.dirname());

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

  toHeadings (chaps,isarticle) {

    var pp = [];
    if (isarticle) {
      for (var i=0; i < chaps.length; ++i) {
        let chap = chaps[i];
        const [heading,id,label,dept,text,ln,saveas] = chap;
        if (heading === 'SECTION') {
          pp.push([id,dept,text]);
        }
      }
    }

    var tt = pp.map( x => `<li><a href='#${x[0]}'>${x[1]} &#160; ${this.parser.escape(x[2])}</a></li>` );
    var out = tt.join('\n');
    var out = `<ul>${out}</ul>`;
    var out = `<nav style='position:fixed;right:0;'>${out}</nav>`;
    return out;
  }

}


module.exports = { NitrilePreviewView };
