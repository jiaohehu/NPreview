'use babel';

const { Emitter, Disposable, CompositeDisposable, File } = require('atom');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewContex } = require('./nitrile-preview-contex');
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
    this.parser = new NitrilePreviewHtml();
    this.editor = null;
    this.new_editor = null;
    this.path = '';
    this.lines = [];
    this.filemap = new Map();
    this.imagemap = new Map();
    this.htmls = [];
    this.chaps = [];
    this.row = -1;
    this.column = -1;
    this.openflag = 0;///set to 1 if one of the subdocument is enabled
    this.highlightNode = null;
    this.saveastype = '';
    this.isfullpage = 0;
    this.last_active_pane_item = null;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    this.subscriptions = new CompositeDisposable();
    this.title = '';
    this.author = '';
    this.subs = [];

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

    /// add this view to the HTML parser
    this.parser.setView(this);

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
          if (atom.config.get('nitrile-preview.liveUpdate')) {
            this.lines = editor.getBuffer().getLines();
            this.updateBlocks();
          }
        }
      })
    );
    this.subscriptions.add(
      editor.onDidChangeCursorPosition((event) => {

        /// This function is to watch for movement of cursor,
        /// one thing we need to do is to highlight the section
        /// of the preview with orange outline to highlight the block
        /// that corresponds to the source block. 

        /// The other thing is to show the content of entire one 
        /// child document as preview if the cursor is inside the INCL 
        /// block and it is the first column of the line. This is a hidden
        /// feature that allows a child document corresponds to that file
        /// to be shown in its entirety. Once the cursor leaves the INCL 
        /// block, or is not at the first column position, the content
        /// of the child document disappears.

        /// The current implementation has set it so that all the block's
        /// DOM element nodes would have its rows= attribute set to the exact line
        /// number where its file name is referenced in the master document.
        /// Thus rows='5 6' will be the same for ALL blocks of the child document.
        /// As a result, moving the cursor to that line of the source document where the
        /// file name is triggeres the highligh of the DOM element. However, since we
        /// only search for the first DOM element that matches that rows='' attribute
        /// the end result is that the heading block gets highlighted. 

        /// The this.openflag is set to 1 when one of the child document is shown.
        /// This allows us to go back to hide it when the cursor moves out of the
        /// INCL section.

        if (editor === this.editor) {
          var openflag = 0;
          this.row = event.newBufferPosition.row;
          this.column = event.newBufferPosition.column;
          for (var sub of this.subs) {
            let { subrow } = sub;
            if (subrow === this.row && this.column === 0) {
              openflag = 1;
              break;
            }
          }
          if (openflag) {
            this.refreshView();
            this.openflag = 1;
          } else if (this.openflag) {
            ///If previous open, then we close it
            this.refreshView();
            this.openflag = 0;
          } else {
            this.doHilite();
          }
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

  ///hasImage (imgid) {
    ///return this.imagemap.has(imgid);
  ///}

  ///getImage (imgid) {
    ///return this.imagemap.get(imgid);
  ///}

  requestImage (imgid,src) {

    if (!atom.packages.hasActivatedInitialPackages()) {
      return;
    }

    if ( this.imagemap.has(src) ) {
///console.log(`load image from imagemap: ${imgid}, ${src}`);
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

///console.log(`load image from file: ${imgid}, ${src}`);
      var fsrc = path.join(this.dirname(),src);
      utils.readImageFileAsync(fsrc)
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

  doHilite () {

    /// The goal of this function is to find ONE particular
    /// DOM node whose rows='' attribute comprises the editor
    /// row number that was sent over by the cursor movement
    /// event (this.row).

    /// Note that in the case of a parent document with subdocuments,
    /// all the blocks from subdocument will have its rows='' attribute
    /// set to point to the same line number as the INCL block row
    /// that loads the subdocument, ie. row='5 6', if line 5 of editor 
    /// is where the name of the file is.

    if (this.highlightNode) {
      ///NOTE: clear previous highlight
      var node = this.highlightNode;
      ///node.style.outline = '';
      ///node.style.backgroundColor = '';
      node.style.boxShadow = '';
      this.highlightNode = null;
    }

    var row = this.row;
    for (var block of this.parser.blocks) {
      const {id,row1,row2} = block;
      if (row >= row1 && row < row2) {
        var node = document.getElementById(id);
        if (node) {
          ///NOTE: set to orange for now. May offset as an option
          ///for NitrilePreview.
          ///node.style.outline = '1px solid orange';
          ///node.style.backgroundColor = 'yellow';
          node.style.boxShadow = '-15px 0px 0px 0px gray';
          this.highlightNode = node;
          //if (atom.config.get('nitrile-preview.autoScroll')) {
          //  node.scrollIntoView({block:'nearest'});
          //}
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

  _getDefaultLocation() {
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

  ///NOTE: should've been the same as the node.js
  async toAll() {
    var fname = this.path ? path.basename(this.path) : '';
    this.parser.readFromLines(this.lines,fname);
    var subs = this.parser.getSubs();
    await this.parser.readSubsAsync(subs,path.dirname(this.path));
    this.parser.mergeSubs(subs);
    this.parser.idenBlocks();
    return subs;
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
    var fontsize = atom.config.get('nitrile-preview.fontSizePt');

    if (1||this.isfullpage) {
      var geometry_opts = [];
      geometry_opts.push(`padding-left:1em`);
      geometry_opts.push(`padding-right:1em`);
      geometry_opts.push(`padding-top:1em`);
      geometry_opts.push(`padding-bottom:1em`);
      geometry_opts.push(`background-color:white`);
      geometry_opts.push(`color:#333`);
      geometry_opts.push(`margin:0`);
      geometry_opts.push(`box-sizing:border-box`);
      geometry_opts.push(`font-family:roman`);
      geometry_opts.push(`font-size:${fontsize}pt`);
      var fullpage_style = geometry_opts.join(';');
    } else {
      var fullpage_style = '';
    }

    this.parser.idname = 'nitrile-preview';
    this.parser.ispreview = 1;
    this.parser.editorrow = this.row;
    this.parser.editorcolumn = this.column;
    this.parser.translateBlocks();
    this.htmls = this.parser.blocks.map(x=>x.html);
    this.innerHTMLs = [];
    this.innerHTMLs.push(`<style>${this.parser.stylesheet_preview}</style>`);
    this.innerHTMLs.push(`<main class='PAGE' style='${fullpage_style}' >`);
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

    this.toAll().then( (subs) => {

        this.subs = subs;

        const config = this.parser.config;
        if (config) {
          this.title = this.parser.config.title||'Untitled';
          this.author = this.parser.config.author||'';
        }

        subs.map( sub => {
            let {subfname} = sub;
            let fsubfname = path.join(this.dirname(),subfname);
            if (!this.filemap.has(fsubfname)) {
              var file = new File(fsubfname);
              this.filemap.set(fsubfname,file);

              this.subscriptions.add(
                file.onDidChange( () => {
                    this.updateBlocks();
                })
              );
            }
        });

        this.refreshView();
    });

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
    this.isfullpage = !this.isfullpage;
    this.refreshView();
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

    var elem = this.highlightNode;
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
    /// This is guarentted by the 'translateBlocks()' function.
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

        var fname = this.path ? path.basename(this.path) : '';
        const parser = new NitrilePreviewLatex();
        await parser.readFromLines(this.lines,fname)
        var subs = parser.getSubs();
        await parser.readSubsAsync(subs,path.dirname(this.path));
        parser.mergeSubs(subs);
        parser.idenBlocks();
        parser.translateBlocks();
        var data = parser.toLatexDocument();

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');

      } 
      else if (this.saveastype === 'contex') {

        var fname = this.path ? path.basename(this.path) : '';
        const parser = new NitrilePreviewContex();
        await parser.readFromLines(this.lines,fname)
        var subs = parser.getSubs();
        await parser.readSubsAsync(subs,path.dirname(this.path));
        parser.mergeSubs(subs);
        parser.idenBlocks();
        parser.translateBlocks();
        var data = parser.toContexDocument();

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');

      } 
      else if (this.saveastype === 'xhtml') {

        var fname = this.path ? path.basename(this.path) : '';
        const parser = new NitrilePreviewHtml();
        await parser.readFromLines(this.lines,fname)
        var subs = parser.getSubs();
        await parser.readSubsAsync(subs,path.dirname(this.path));
        parser.mergeSubs(subs);
        parser.idenBlocks();
        parser.translateBlocks();
        var data = parser.toXhtmlDocument();

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');

      } else if (this.saveastype === 'html') {

        var fname = this.path ? path.basename(this.path) : '';
        const parser = new NitrilePreviewHtml();
        await parser.readFromLines(this.lines,fname)
        var subs = parser.getSubs();
        await parser.readSubsAsync(subs,path.dirname(this.path));
        parser.mergeSubs(subs);
        parser.idenBlocks();
        parser.translateBlocks();
        var data = parser.toHtmlDocument();

        fs.writeFileSync(savefilepath, data);
        atom.notifications.addSuccess(savefilepath + ' saved, '
              + data.length + ' character(s)');

      } 
      else if (this.saveastype === 'epub') {

        var fname = this.path ? path.basename(this.path) : '';
        const parser = new NitrilePreviewHtml();
        parser.isepub = 1;
        await parser.readFromLines(this.lines,fname)
        var subs = parser.getSubs();
        await parser.readSubsAsync(subs,path.dirname(this.path));
        parser.mergeSubs(subs);
        parser.idenBlocks();
        parser.translateBlocks();

        var epub = new NitrilePreviewEpub();
        data = await epub.generateAsync(parser,this.dirname());

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
