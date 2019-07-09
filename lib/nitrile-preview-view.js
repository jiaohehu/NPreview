'use babel';

const { Emitter, Disposable, CompositeDisposable, File } = require('atom');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const fs = require('fs');
const path = require('path');

export default class NitrilePreviewView {

  constructor(data) {
console.log('constructor of NitrilePreviewView called');

    /// initialize members
    this.divStyle='box-sizing:border-box;width:8.5in;padding:1in 1.25in 1in 1.5in;margin:0;font-size:12pt;background-color:white;';
    this.element = document.createElement('div');
    this.element.classList.add('nitrile-preview');
    this.element.tabIndex = -1;
    this.editor = null;
    this.path = ''; 
    this.lines = [];
    this.flags = {};
    this.blocks = [];
    this.htmls = [];
    this.row = -1;
    this.highlightId = '';
    this.saveastype = '';
    this.contentsFlags = {};
    this.contentsBlocks = [];
    this.emitter = new Emitter();
    this.disposables1 = new CompositeDisposable();
    this.disposables2 = new CompositeDisposable();
    this.registerAllCommands();

    this.disposables1.add(
      atom.packages.onDidActivateInitialPackages(() => {
console.log('on did activate initial packages called:');
        this.update();
      })
    )

    this.disposables1.add(
      atom.packages.onDidLoadInitialPackages(() => {
console.log('on did load initial packages called:');
      })
    )

    this.disposables1.add(
      atom.workspace.getCenter().observeActivePaneItem(item => {
        if (atom.workspace.isTextEditor(item)) {
console.log('observe active pane item called:');
console.log(item.getPath());
          if (item.getPath()) {
            if (path.extname(item.getPath()).toLowerCase() === '.md') {
              this.switchEditor(item);
            }
          } else {
            this.switchEditor(item);
          }
        }
      })
    )
  }

  registerAllCommands () {

    /// process events sent to 'this.element': For example the 'core:move-down' event
    /// will be sent to 'this.element' when down-arrow key pressed, and atom auto-
    /// matically generates a 'core:move-down' event; another, the 'nitrile-preview:inspect'
    /// will be sent to this element because the 'menu/nitrile-preview.json' file contains
    /// an instruction to set-up a menu item that when triggered will send the 'nitrile-preview:inspect'
    /// event to 'this.element'---thus, we need to be able to capture these events sent to
    /// 'this.element' and then call the appropriate functions---this is what following
    /// code is doing.
    ///
    /// note that for 'core:move-up', 'core:move-down' events there is no-need to have
    /// to specify an event---even though it is there but we choose not to use it. However,
    /// for 'nitrile-preview:inspect' we do need the event because since it came from a
    /// context menu entry this event's 'target' member points to the DOM element
    /// that has received the cursor click.

    this.disposables1.add(

      atom.commands.add(this.element, {
        'nitrile-preview:jump-to-editor': (event) => {
          this.jumpToEditor(event);
        },
        'nitrile-preview:scroll-to-cursor': (event) => {
          this.scrollToCursor(event);
        },
        'nitrile-preview:toggle-section-contents': (event) => {
          this.toggleSectionContents(event);
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
        'nitrile-preview:to-lualatex-article': () => {
          this.toLualatexArticle();
        },
        'nitrile-preview:to-lualatex-chapter': () => {
          this.toLualatexChapter();
        },
        'nitrile-preview:to-lualatex-book': () => {
          this.toLualatexBook();
        },
        'nitrile-preview:reload': () => {
          this.reload();
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

  }

  registerEventHandlers (editor) {

    /// for editor

    this.disposables2.dispose();

    if (editor) {
      this.disposables2.add(
        editor.getBuffer().onDidStopChanging(() => {
          if (this.editor) {
            this.lines = this.editor.getBuffer().getLines();
            this.update();
          }
        })
      );
      this.disposables2.add(
        editor.onDidChangeCursorPosition((event) => {
          this.row = event.newBufferPosition.row;
          this.highlightElement();
        })
      );
      this.disposables2.add(
        editor.onDidSave((event) => {
          this.path = event.path;
          console.log(this.path);
        })
      );
      this.disposables2.add(
        editor.onDidDestroy(() => {
          this.editor = null;
        })
      );
    }
  }

  highlightElement () {

    /*
    Highlight the last cursor block
    */

    var elem = document.getElementById(this.highlightId);
    if (elem) {
      elem.style.outline = '';
      elem.style.backgroundColor = '';
      this.highlightId = '';
    }
    var row = this.row;
    for (var block of this.blocks) {
      const [id,row1,row2] = block;
      if (row >= row1 && row < row2) {
        var elem = document.getElementById(id);
        if (elem) {
          elem.style.outline = '5px solid yellow';
          elem.style.backgroundColor = 'yellow';
          this.highlightId = id;
        }
        break;
      }
    }

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
console.log('NitrilePreviewView::serialize called');
    return {
      deserializer: 'nitrile-preview/NitrilePreviewView'
    };
  }

  // called when nitrile-preview window is being destroyed
  destroy() {

console.log('NitrilePreviewView::destroy() called');

    this.disposables1.dispose();
    this.disposables2.dispose();
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

  update() {

    /// Change the innerHTML of this element. This function is 
    /// called for both book and article contents.

    /// note that the parser will need to be recreated every
    /// time because it has its internal resources modified
    /// everytime something is being parsed or converted
    var parser = new NitrilePreviewHtml();
    var fname = this.path ? path.basename(this.path) : 'untitled';
    var bookBlock = null;
    [this.blocks,this.flags] = parser.toBLOCKS(this.lines,fname,0);

    /// figure if this is a book block
    this.isBookBlock = false;
    if (this.blocks.length == 1 && this.blocks[0][3] === '!BOOK') {
      this.isBookBlock = true;
      bookBlock = this.blocks[0];
    }

    /// for article
    if (!this.isBookBlock) {
      this.blocks = parser.idenBLOCKS(this.blocks,true);
      this.htmls = [];
      this.htmls.push(`<div class='PAGE'>`);
console.log(this.flags);
      var {title='',author='',documentclass=''} = this.flags;
      title = title ? title : 'Untitled';
      this.htmls.push(`<p class='TITLE'>`);
      this.htmls.push(`${parser.escape(title)}`);
      this.htmls.push(`</p>`);
      this.htmls.push(`<p class='AUTHOR'>`);
      this.htmls.push(`${parser.escape(author)}`);
      this.htmls.push(`</p>`);
      this.htmls.push(`<p class='DATE'>`);
      this.htmls.push(`${parser.escape(new Date().toLocaleDateString())}`);
      this.htmls.push(`</p>`);
      this.htmls = parser.translate(this.blocks,true,this.htmls);
      this.htmls.push(`</div>`);
      const { scrollTop } = this.element;
      this.element.textContent = '';
      this.element.innerHTML = this.htmls.join('\n');
      this.element.scrollTop = scrollTop;

      /// note that the highlight of element is based on the
      /// this.row. It works by finding the DOM element that
      /// has a rows attribute set that points to this row.
      /// It might now work as the first update as the DOM
      /// has not yet been built
      this.highlightElement();

    } else {
      /// for !BOOK
      this.generateContentsBlocks(bookBlock,this.dirname())
        .then((out) => {
            const [contentsFlags,contentsBlocks] = out;
            var { title = '', author = '' } = contentsFlags;
            title = title ? title : 'Untitled';
            this.contentsFlags = contentsFlags;
            this.contentsBlocks = contentsBlocks;
            var parser = new NitrilePreviewHtml();
            this.contentsBlocks = parser.idenBLOCKS(this.contentsBlocks,false);
            this.htmls = [];
            this.htmls.push(`<div class='PAGE'>`);
            this.htmls.push(`<p class='TITLE'>`);
            this.htmls.push(`${parser.escape(title)}`);
            this.htmls.push(`</p>`);
            this.htmls.push(`<p class='AUTHOR'>`);
            this.htmls.push(`${parser.escape(author)}`);
            this.htmls.push(`</p>`);
            this.htmls.push(`<p class='DATE'>`);
            this.htmls.push(`${parser.escape(new Date().toLocaleDateString())}`);
            this.htmls.push(`</p>`);
            this.htmls = parser.translateOutlineOnly(this.contentsBlocks,this.htmls);
            this.htmls.push(`</div>`);
            const { scrollTop } = this.element;
            this.element.textContent = ''
            this.element.innerHTML = this.htmls.join('\n');
            this.element.scrollTop = scrollTop
            });
    }
  }

  async generateContentsBlocks(bookBlock,dirname) {

    /// 
    /// Generate a new list of blocks consists of all the
    /// sub-documents mentioned in the !BOOK block
    ///

    var documentclass = 'book';
    const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = bookBlock;
    var contentsFlags = {};
    var contentsBlocks = [];
    var re_flags = /^\:\s+(\w+)\s*\=\s*(.*)$/;
    var re_files = /^(\>{1,})\s+(.*)$/;
    for (var line of data) {
      var v = re_flags.exec(line);
      if (v) {
        var key = v[1];
        var val = v[2];
        contentsFlags[key] = val;
        continue;
      }
      var v = re_files.exec(line);
      if (v) {
        var sublevel = v[1].length - 1;
        var subfname = v[2].trim();
        if (dirname && subfname) { 
          var fsubfname = path.join(dirname,subfname);
          var subdata = '';
          try {
            await fs.statSync(fsubfname);
            var subdata = await fs.readFileSync(fsubfname,'utf8');
          } catch(e) {
            var subparser = new NitrilePreviewParser(); 
            contentsBlocks.push(subparser.toErrorBlock(`No file: '${subfname}'`,subfname,sublevel));
            console.log(e.stack);
            continue;
          }
          var subparser = new NitrilePreviewParser(); 
          [contentsBlocks] = subparser.toBLOCKS(subdata.split('\n'),subfname,sublevel,contentsBlocks);
        }
        continue;
      }
    }
    return [contentsFlags,contentsBlocks];
  }

  async openEditorAsync(data) {
    var editor = await atom.workspace.open(data,{pending:true,searchAllPanes:true,activatePane:false,activateItem:false})
    return editor;
  }

  async readFileFromPath(data) {

    var data1 = await fs.readFileSync(data,'utf8');
    return data1;
  }

  onDestroyed (callback) {

    /// called when this view is destroyed.

    return this.emitter.on('did-destroy',callback);
  }

  findEditorForPath (path) {
    /// try to find amoung active editors for the one
    /// that matches the given path
    for (var editor of atom.workspace.getTextEditors()) {
      if (!editor.getPath() && editor.getPath() === path) {
        return editor;
      }
    }
    return null;
  }

  toggleSectionContents (event) {

    /// show or hide contents for a sectional heading, only 
    /// for BOOK preview

    var node = event.target;
    if (node) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var href = node.getAttribute('href');
      console.log(nodeName);
      console.log(className);
      console.log(href);
      if (nodeName === 'MARK' && className === 'LABEL') {
        var re = /^\[(.*)\]$/;
        var textContent = node.textContent;
        var v = textContent.match(re);
        var next_div_node = null;
        if (v) {
          var id = v[1];
          var h_node = this.findHnodeById( node.parentNode, id);
          if (h_node) {
            var next_div_node = h_node.nextSibling;
            var parent_node = h_node.parentNode;
            if (parent_node && next_div_node) {
console.log('next_div_node.nodeName');
console.log(next_div_node.nodeName);
console.log('next_div_node.className');
console.log(next_div_node.className);
              if (next_div_node.nodeName === 'DIV') {
                /// good!
              } else {
                /// need to create a new DIV
                var new_div_node = document.createElement('div');
                parent_node.insertBefore(new_div_node,next_div_node);
                next_div_node = new_div_node;
              }
            }
          }
        }
        if (next_div_node && !next_div_node.textContent) {
          /// expand!
          var translator = new NitrilePreviewHtml();
          var the_blocks = this.getContentsBlocksForHDGS(id);
          var htmls = translator.translate(the_blocks,false);        
          next_div_node.innerHTML = htmls.join('\n');

        } else if (next_div_node && next_div_node.textContent) {

          /// collapse!
          next_div_node.textContent = '';
        }
        
      }
    }

  }

  findHnodeById (node, id) {
    while (node ) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var idName = ''+node.id;
      if (className === 'nitrile-preview') {
        return null;
      }
console.log(nodeName);
console.log(idName);
      if (nodeName.match(/^H[1-4]$/) && idName === id) {
        return node;
      }
      node = node.parentNode;
    }
    return null;  
  }

  getContentsBlocksForHDGS (id) {

    /// returns a range of blocks that is the content of
    /// a HDGS block with the given id
    
    var j = -1;
    var k = -1;
console.log(this.contentsBlocks.length);
console.log('this.contentsBlocks.length');
    for (var j=0; j < this.contentsBlocks.length; ++j) {
      var block1 = this.contentsBlocks[j];
      var id1 = block1[0];
      var type1 = block1[3];
      if (type1 === 'HDGS' && id1 === id) {
        j += 1;
        for (var k=j; k < this.contentsBlocks.length; ++k) {
          var block2 = this.contentsBlocks[k];
          var type2 = block2[3];
          if (type2 === 'HDGS') {
            break;
          }
        }
        break;
      }
    }      
console.log('j');
console.log(j);
console.log('k');
console.log(k);
    if (j >= 0 && k >= 0) {
      return this.contentsBlocks.slice(j,k);
    }
    return [];
  }

  scrollToCursor(event) {

    /// scroll the preview window so that the selected
    /// node is shown

    var blocks = this.blocks;
    var editor = this.editor;
    if (blocks && editor) {
      var row = editor.getCursorBufferPosition().row;
      for (const data of blocks) {
        const [id, row1, row2] = data;
        if (row >= row1 && row < row2) {
          var elem = document.getElementById(id);
          if (elem) {
            elem.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
            //elem.scrollIntoView();
            break;
          }
        }
      }
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

    atom.clipboard.write(this.htmls.join('\n'))

  }

  toHtml() {

    /// called as a command by 'Save As HTML...'

    this.saveastype = 'html';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toXHTML() {

    /// called as a command by 'Save As HTML...'

    this.saveastype = 'xhtml';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toLualatexArticle () {

    /// Translate to LuaLATEX source code
    /// and then save it
    /// window
    this.saveastype = 'lualatex-article';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toLualatexChapter () {

    /// Translate to LuaLATEX source code
    /// and then save it
    /// window
    this.saveastype = 'lualatex-chapter';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toLualatexBook () {

    /// Translate to LuaLATEX source code
    /// and then save it
    /// window

    if (this.blocks && this.blocks[0] && this.blocks[0][3] === '!BOOK') {
      this.saveastype = 'lualatex-book';
      atom.workspace.paneForItem(this).saveItemAs(this);

    } else {
      atom.notifications.addError('Not a !BOOK block');

    }

  }

  jumpToEditor (event) {

    /// go back to source editor and select the lines
    /// for the current DOM node      

    var node = event.target;
    var row1 = '';
    var row2 = '';
    while (node) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var rows = node.getAttribute('rows');
      if (className === 'nitrile-preview') {
        break;
      }
      if (rows) {
        [row1, row2] = rows.split(' ');
        break;
      }
      node = node.parentNode;
    }

    /// if this.editor is null, try to find active editors

    if (!this.editor) {
      var editor = this.findEditorForPath(this.path);
      if (editor) {
        this.switchEditor(editor);
        atom.workspace.paneForItem(this.editor).activate();
        atom.workspace.paneForItem(this.editor).activateItem(this.editor);
        return;
      }
    }

    /// if this.editor is null and no existing editor found, 
    /// we need to create one

    if (!this.editor) {
      atom.workspace.open(this.path,{pending:true,searchAllPanes:true})
        .then((editor) => {
            this.switchEditor(editor);
        });
      return;
    }

    /// this.editor is active, this means that the editor's content is 
    /// in sync with the content of the preview, this the row1 and row2
    /// are relative to what's currently in the editor

    if (row1 && row2) {
      this.editor.setCursorBufferPosition([+row1,0],{'.autoscroll': true});
      this.editor.setSelectedBufferRange([[+row1,0],[+row2,0]]);
      atom.workspace.paneForItem(this.editor).activate();
      atom.workspace.paneForItem(this.editor).activateItem(this.editor);
    }

  }

  reload () {

    /// Reload the entire content of the preview. This is necessary
    /// when previewing a BOOK content and one of the sub-document
    /// has been modified and saved and thus the contents blocks need
    /// to be re-generated.

    if (this.editor) {
      this.lines = this.editor.getBuffer().getLines();
      this.update(); 
    } else if (this.path) {
      this.readFileFromPath(this.path)
        .then((out) => {
          this.lines = out.split('\n');
          this.update();
      });
    }
  }

  switchEditor (editor) {
console.log('switchEditor called');
    this.editor = editor;
    if (this.editor) {
      this.registerEventHandlers(this.editor);
      this.path = this.editor.getPath();
      this.lines = this.editor.getBuffer().getLines();
      this.row = this.editor.getCursorBufferPosition().row;
      if (atom.packages.hasActivatedInitialPackages()) {
console.log('switchEditor, has activated initial packages');
        this.update();
      } else {
console.log('switchEditor, has NOT activated initial packages');
      } 
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
        case 'html': {
          basename = path.basename(this.path + ".html");
          break;
        }
        case 'xhtml': {
          basename = path.basename(this.path + ".xhtml");
          break;
        }
        case 'lualatex-article':
        case 'lualatex-chapter':
        case 'lualatex-book': {
          basename = path.basename(this.path + ".tex");
          break;
        }
        default: {
          basename = path.basename(this.path);
          break;
        }
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
      if (this.saveastype === 'lualatex-article') {
        var translator = new NitrilePreviewLatex();
        this.blocks = translator.idenBLOCKS(this.blocks,true);
        var olines = translator.translate(this.blocks,true);
        var {title='',author='',documentclass=''} = this.flags;
        title = title ? title : 'Untitled';
        documentclass = documentclass ? documentclass : 'article';
data = `\% \!TEX program = lualatex
\\documentclass{${documentclass}}
\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{paralist}
\\usepackage{enumitem}
\\usepackage{longtable,tabu}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{mathrsfs}
\\usepackage{changepage}
\\DeclareMathOperator{\\sech}{sech}
\\DeclareMathOperator{\\csch}{csch}
\\DeclareMathOperator{\\arcsec}{arcsec}
\\DeclareMathOperator{\\arccot}{arccot}
\\DeclareMathOperator{\\arccsc}{arccsc}
\\DeclareMathOperator{\\arcosh}{arccosh}
\\DeclareMathOperator{\\arsinh}{arsinh}
\\DeclareMathOperator{\\artanh}{artanh}
\\DeclareMathOperator{\\arsech}{arsech}
\\DeclareMathOperator{\\arcsch}{arcsch}
\\DeclareMathOperator{\\arcoth}{arcoth}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage{xfrac}
\\usepackage[unicode]{hyperref}
\\usepackage{anyfontsize}
\\usepackage{fancyvrb}
\\usepackage{tikz}
\\usepackage[normalem]{ulem}
\\usepackage{listings}
\\usepackage{quoting}
\\usepackage{booktabs}
\\usepackage{xtab}
\\usepackage{ltablex}
\\usepackage{tabulary}
\\usepackage{csquotes}
\\title{${title}}
\\author{${author}}
\\begin{document}
\\maketitle
${olines.join('\n')}
\\end{document}`;

      } else if (this.saveastype === 'lualatex-chapter') {
        var translator = new NitrilePreviewLatex();
        var olines = translator.translate(this.contentsBlocks,false);
        data = olines.join('\n');
      } else if (this.saveastype === 'lualatex-book') {
        var translator = new NitrilePreviewLatex();
        var olines = translator.translate(this.contentsBlocks,false);
        var {title='',author='',documentclass=''} = this.contentsFlags;
        title = title ? title : 'Untitled';
        documentclass = documentclass ? documentclass : 'book';
data = `\% \!TEX program = lualatex
\\documentclass{${documentclass}}
\\usepackage{luatexja-fontspec}
\\usepackage{luatexja-ruby}
\\newjfontfamily\\cn{arplsungtilgb}
\\newjfontfamily\\tw{arplmingti2lbig5}
\\newjfontfamily\\jp{ipaexmincho}
\\newjfontfamily\\kr{baekmukbatang}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{paralist}
\\usepackage{enumitem}
\\usepackage{longtable,tabu}
\\usepackage{mathtools}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{mathrsfs}
\\usepackage{changepage}
\\DeclareMathOperator{\\sech}{sech}
\\DeclareMathOperator{\\csch}{csch}
\\DeclareMathOperator{\\arcsec}{arcsec}
\\DeclareMathOperator{\\arccot}{arccot}
\\DeclareMathOperator{\\arccsc}{arccsc}
\\DeclareMathOperator{\\arcosh}{arccosh}
\\DeclareMathOperator{\\arsinh}{arsinh}
\\DeclareMathOperator{\\artanh}{artanh}
\\DeclareMathOperator{\\arsech}{arsech}
\\DeclareMathOperator{\\arcsch}{arcsch}
\\DeclareMathOperator{\\arcoth}{arcoth}
\\usepackage{stmaryrd}
\\usepackage{wasysym}
\\usepackage{textcomp}
\\usepackage{xfrac}
\\usepackage[unicode]{hyperref}
\\usepackage{anyfontsize}
\\usepackage{fancyvrb}
\\usepackage{tikz}
\\usepackage[normalem]{ulem}
\\usepackage{listings}
\\usepackage{quoting}
\\usepackage{booktabs}
\\usepackage{xtab}
\\usepackage{ltablex}
\\usepackage{tabulary}
\\usepackage{csquotes}
\\title{${title}}
\\author{${author}}
\\begin{document}
\\maketitle
${olines.join('\n')}
\\end{document}`;

      } else if (this.saveastype === 'xhtml') {
        data = this.prepareXHTMLData();
      } else {
        data = this.prepareHTMLData();
      }
      fs.writeFileSync(savefilepath, data+'\n');
      atom.notifications.addSuccess(savefilepath + ' saved, '
            + data.length + ' character(s)');
    } catch(e) {
      atom.notifications.addError(e.toString());
      console.log(e.stack);
    }

  }

  prepareHTMLData () {

    /// Prepare a complete HTML source document with
    /// headers and CSS style sheet and body tags,
    /// that is for saving as a .html file.

    const cssrules = []
    const re = /\.nitrile-preview/
    //const cssUrlRegExp = /url\(atom:\/\/markdown-preview\/assets\/(.*)\)/

    for (const stylesheet of document.styleSheets) {
      if (stylesheet.rules != null) {
        for (const rule of stylesheet.rules) {
          // We only need `.nitrile-review` css
          if (rule.selectorText && rule.selectorText.match(re)) {
            cssrules.push(rule.cssText)
          }
        }
      }
    }
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
${cssrules.join('\n')}
</style>
</head>
<body class='nitrile-preview' data-use-github-style>
${this.htmls.join('\n')}
</body>
</html>`;

  }

  prepareXHTMLData () {

    /// Prepare a complete HTML source document with
    /// headers and CSS style sheet and body tags,
    /// that is for saving as a .html file.

    const cssrules = []
    const re = /\.nitrile-preview/
    //const cssUrlRegExp = /url\(atom:\/\/markdown-preview\/assets\/(.*)\)/

    for (const stylesheet of document.styleSheets) {
      if (stylesheet.rules != null) {
        for (const rule of stylesheet.rules) {
          // We only need `.nitrile-review` css
          if (rule.selectorText && rule.selectorText.match(re)) {
            cssrules.push(rule.cssText)
          }
        }
      }
    }
    return `<?xml version='1.0' encoding='UTF-8'?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>
<head>
<meta http-equiv='default-style' content='text/html' charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<style>
${cssrules.join('\n')}
</style>
</head>
<body class='nitrile-preview' data-use-github-style>
${this.htmls.join('\n')}
</body>
</html>`;

  }

  _onDidChangeModified (callback) {

    // No op to suppress deprecation warning
    return new Disposable()

  }


}
