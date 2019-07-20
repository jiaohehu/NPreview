'use babel';

const { Emitter, Disposable, CompositeDisposable, File } = require('atom');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const fs = require('fs');
const path = require('path');
const pjson = require('./nitrile-preview-config.json');

class NitrilePreviewView {


  constructor(data) {

    /// initialize members
    this.re_book_flags = /^\:\s+(\w+)\s*\=\s*(.*)$/;
    this.re_book_files = /^(\>{1,})\s+(.*)$/;
    this.element = document.createElement('div');
    this.element.classList.add('nitrile-preview');
    this.parser = new NitrilePreviewHtml();
    this.editor = null;
    this.path = '';
    this.lines = [];
    this.isarticle = true;
    this.flags = {};
    this.config = {};
    this.blocks = [];
    this.book = [];
    this.htmls = [];
    this.row = -1;
    this.config = {};
    this.xrefs = {};
    this.highlightId = '';
    this.saveastype = '';
    this.emitter = new Emitter();
    this.imagemap = new Map();
    this.disposables1 = new CompositeDisposable();
    this.disposables2 = new CompositeDisposable();
    this.registerAllCommands();

    this.disposables1.add(
      atom.packages.onDidActivateInitialPackages(() => {
        this.updateBlocks();
      })
    )

    this.disposables1.add(
      atom.workspace.getCenter().observeActivePaneItem(item => {
        if (atom.workspace.isTextEditor(item)) {
          if (item.getPath()) {
            if (path.extname(item.getPath()).toLowerCase() === '.md') {
              this.switchEditor(item);
              this.updateBlocks();
            }
          } else {
            this.switchEditor(item);
            this.updateBlocks();
          }
        }
      })
    )

    /// add this view to the HTML parser
    this.parser.setView(this);
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
        'nitrile-preview:show-highlight': (event) => {
          this.scrollHilite();
        },
        'nitrile-preview:open-linked-file': (event) => {
          this.openLinkedFile(event);
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
            if (atom.config.get('nitrile-preview.liveUpdate')) {
              this.lines = this.editor.getBuffer().getLines();
              this.updateBlocks();
            } else {
            }
          }
        })
      );
      this.disposables2.add(
        editor.onDidChangeCursorPosition((event) => {
          this.row = event.newBufferPosition.row;
          this.doHilite();
        })
      );
      this.disposables2.add(
        editor.onDidSave((event) => {
          this.path = event.path;
          if (this.editor) {
            this.lines = this.editor.getBuffer().getLines();
            this.updateBlocks();
          } 
        })
      );
      this.disposables2.add(
        editor.onDidDestroy(() => {
          this.editor = null;
        })
      );
    }
  }

  hasImage (src) {
    return this.imagemap.has(src);
  }

  getImage (src) {
    return this.imagemap.get(src);
  }

  requestImage (imgid,src) {

    if (!atom.packages.hasActivatedInitialPackages()) {
      return;
    }

console.log(this.dirname());
    
    var fsrc = path.join(this.dirname(),src);
    this.parser.readImageFileAsync(fsrc)
      .then( imgdata => {
          this.imagemap.set(src,imgdata);
          var node = document.querySelector(`img#${imgid}`);
          if (node) {
console.log('setting node.src to imgdata');
            node.src = imgdata;
          }
      })
      .catch( err => console.error(err) )
  }

  doHilite () {

    /// find the node that matches the row
    /// in the editor and then set the background-color
    /// of that node to 'yellow'

    // clear previous id

    var node = document.getElementById(this.highlightId);
    if (node) {
      node.style.outline = '';
      node.style.backgroundColor = '';
      this.highlightId = '';
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
            this.highlightId = id;
            if (atom.config.get('nitrile-preview.autoScroll')) {
console.log('autoScroll is on');
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
      var fname = '';
      if (row >= 0) {
        var line = this.book[row];
        if (line) {
          fname = this.getFileNameAtBookRow(line);
        }
      }

      var nodes = document.querySelectorAll('div.FILE');
      for (var node of nodes) {
        var id = ''+node.id;
        var nodeName = ''+node.nodeName;
        var className = ''+node.className;
        var fName = node.getAttribute('fName');
        if (fName && fName === fname) {
          node.style.outline = '5px solid yellow';
          node.style.backgroundColor = 'yellow';
          this.highlightId = id;
          if (atom.config.get('nitrile-preview.autoScroll')) {
            node.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
          }
          break;
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

  async getAllBlocks() {

    var fname = this.path ? path.basename(this.path) : '';
    var [blocks,flags,book] = this.parser.toBlocks(this.lines,fname,0,0);
    if (book.length) {
      [blocks,flags] = await this.parser.fetchBookBlocks(book,this.dirname());
    }
    return [blocks,flags,book];

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

  refreshView() {

    this.htmls = [];
    this.htmls.push(`<div class='PAGE'>`);
    this.htmls.push(`<p class='TITLE'>`);
    this.htmls.push(`${this.parser.escape(this.title)}`);
    this.htmls.push(`</p>`);
    this.htmls.push(`<p class='AUTHOR'>`);
    this.htmls.push(`${this.parser.escape(this.author)}`);
    this.htmls.push(`</p>`);
    this.htmls.push(`<p class='DATE'>`);
    this.htmls.push(`${this.parser.escape(new Date().toLocaleDateString())}`);
    this.htmls.push(`</p>`);
    this.htmls = this.parser.translateHtml(this.config,this.xrefs,this.blocks,this.isarticle,this.htmls);
    this.htmls.push(`</div>`);

    const { scrollTop } = this.element;
    this.element.textContent = ''
    this.element.innerHTML = this.htmls.join('\n');
    this.element.scrollTop = scrollTop
    this.doHilite();

  }

  updateBlocks() {

    /// check the flag before update

    if (!atom.packages.hasActivatedInitialPackages()) {
      return;
    }

    this.getAllBlocks().then( ([blocks,flags,book]) => {

      this.book = book;
      this.flags = flags;
      this.blocks = blocks;
      this.isarticle = (book.length) ? false : true;
      this.config = this.parser.toConfig(flags);

      /// construct the final LATEX file
      this.title = this.config.title ? this.config.title : 'Untitled'
      this.author = this.config.author ? this.config.author : ''

      /// identify blocks to assign 'P_dept', 'P_fig', and 'P_hidden' fields.
      this.blocks = this.parser.idenBlocks(this.config,this.blocks,this.isarticle);

      /// identify xrefs to assign mapping from id -> dept 
      this.xrefs = this.parser.idenXrefs(this.config,this.blocks,this.isarticle);

      /// this will translate the blocks to HTML and 
      /// then assign it as innerHTML
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

  openLinkedFile (event) {

    /// open the linked file in editor

    var node = event.target;
    var node = this.findParentDivNode(node);
    if (node) {
      var fName = node.getAttribute('fName');
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

  findParentDivNode (node) {
    while (node ) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      if (className === 'nitrile-preview') {
        return null;
      }
      if (nodeName === 'DIV') {
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

    atom.clipboard.write(this.htmls.join('\n'))

  }

  toHtml() {

    /// called as a command by 'Save As HTML...'
    this.saveastype = 'html';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toXhtml() {

    /// called as a command by 'Save As HTML...'

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

  jumpToEditor (event) {

    /// if this.editor is null, try to find active editors

    if (!this.editor) {
      var editor = this.findEditorForPath(this.path);
      if (editor) {
        this.switchEditor(editor);
        this.updateBlocks();
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
            this.updateBlocks();
        });
      return;
    }

    /// this.editor is active, this means that the editor's content is
    /// in sync with the content of the preview, this the row1 and row2
    /// are relative to what's currently in the editor
    /// 
    /// NOTE: 'row1' and 'row2' are *string* variables.

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
          ///this.editor.setSelectedBufferRange([[+row1,0],[+row2,0]]);
          atom.workspace.paneForItem(this.editor).activate();
          atom.workspace.paneForItem(this.editor).activateItem(this.editor);
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
          ///this.editor.setSelectedBufferRange([[+subrow,0],[+subrow,0]]);
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

    if (this.editor) {
      this.lines = this.editor.getBuffer().getLines();
      this.updateBlocks();
    } else if (this.path) {
      this.readFileFromPath(this.path)
        .then((out) => {
          this.lines = out.split('\n');
          this.updateBlocks();
      });
    }
  }

  switchEditor (editor) {
    this.editor = editor;
    if (this.editor) {
      this.registerEventHandlers(this.editor);
      this.path = this.editor.getPath();
      this.lines = this.editor.getBuffer().getLines();
      this.row = this.editor.getCursorBufferPosition().row;
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

      if (this.saveastype === 'latex-chapter') {

        var latex = new NitrilePreviewLatex();
        var olines = latex.translateLatex(this.config,this.xrefs,this.blocks,false);
        data = olines.join('\n');

      } else if (this.saveastype === 'latex-complete') {

        var latex = new NitrilePreviewLatex();
        var olines = latex.translateLatex(this.config,this.xrefs,this.blocks,this.isarticle);
        var texfamily = this.config.texfamily;
        var documentclass = this.config.documentclass ? this.config.documentclass : ''
        if (!documentclass) {
          documentclass = this.isarticle ? "article" : "book";
        }
        var documentclassoptions = this.config.documentclassoptions;

        data = `\% \!TEX program = ${texfamily}
\\documentclass[${documentclassoptions.join(',')}]{${documentclass}}
${latex.toRequiredPackages(texfamily)}
\\title{${this.title}}
\\author{${this.author}}
\\begin{document}
\\maketitle
${olines.join('\n')}
\\end{document}`;

      } else if (this.saveastype === 'xhtml') {

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
${this.htmls.join('\n')}
</body>
</html>`;

      } else if (this.saveastype === 'html') {

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

        data = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
${cssrules.join('\n')}
</style>
</head>
<body class='nitrile-preview'>
${this.htmls.join('\n')}
</body>
</html>`;

      }

      fs.writeFileSync(savefilepath, data+'\n');
      atom.notifications.addSuccess(savefilepath + ' saved, '
            + data.length + ' character(s)');

    } catch(e) {

      atom.notifications.addError(e.toString());
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
