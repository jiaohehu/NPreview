'use babel';

const { Emitter, Disposable, CompositeDisposable, File } = require('atom');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const fs = require('fs');
const path = require('path');
const pjson = require('../package.json');

class NitrilePreviewView {


  constructor(data) {
console.log('constructor of NitrilePreviewView called');

    /// initialize members
    this.re_book_flags = /^\:\s+(\w+)\s*\=\s*(.*)$/;
    this.re_book_files = /^(\>{1,})\s+(.*)$/;
    this.element = document.createElement('div');
    this.element.classList.add('nitrile-preview');
    this.editor = null;
    this.path = '';
    this.lines = [];
    this.flags = {};
    this.blocks = [];
    this.book = [];
    this.htmls = [];
    this.row = -1;
    this.highlightId = '';
    this.saveastype = '';
    this.emitter = new Emitter();
    this.disposables1 = new CompositeDisposable();
    this.disposables2 = new CompositeDisposable();
    this.registerAllCommands();

    this.disposables1.add(
      atom.packages.onDidActivateInitialPackages(() => {
console.log('EVENT: initial packages activated:');
        this.update();
      })
    )

    this.disposables1.add(
      atom.workspace.getCenter().observeActivePaneItem(item => {
        if (atom.workspace.isTextEditor(item)) {
console.log(`EVENT: text editor: '${item.getPath()}'`);
          if (item.getPath()) {
            if (path.extname(item.getPath()).toLowerCase() === '.md') {
              this.switchEditor(item);
              this.update();
            }
          } else {
            this.switchEditor(item);
            this.update();
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
        'nitrile-preview:show-highlight': (event) => {
          this.showHighlight(event);
        },
        'nitrile-preview:toggle-section-contents': (event) => {
          this.toggleSectionalContents(event);
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
            this.lines = this.editor.getBuffer().getLines();
            this.update();
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
        })
      );
      this.disposables2.add(
        editor.onDidDestroy(() => {
          this.editor = null;
        })
      );
    }
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

    if (!this.book.length) {

      var row = this.row;
      for (var block of this.blocks) {
        const [id,row1,row2] = block;
        if (row >= row1 && row < row2) {
          var node = document.getElementById(id);
          if (node) {
            node.style.outline = '5px solid yellow';
            node.style.backgroundColor = 'yellow';
            this.highlightId = id;
          }
          break;
        }
      }

      return;
    }

    /// if this is a book

    if (this.book.length) {

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
        var src = node.getAttribute('src');
        if (fname && src === fname) {
          node.style.outline = '5px solid yellow';
          node.style.backgroundColor = 'yellow';
          this.highlightId = id;
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

  async getBlocks(parser) {

    var fname = this.path ? path.basename(this.path) : '';
    var [blocks,flags,book] = parser.toBlocks(this.lines,fname,0);
    if (book.length) {
      [blocks,flags] = await parser.toBookBlocks(book,this.dirname());
    }
    return [blocks,flags,book];

  }

  update() {

    /// check the flag before update

    if (!atom.packages.hasActivatedInitialPackages()) {
      console.log('has NOT activated initial package, NOT updated!');
      return;
    }

    var parser = new NitrilePreviewHtml();
    this.getBlocks(parser).then( ([blocks,flags,book]) => {

      var isarticle = (book.length) ? false : true;
      blocks = parser.idenBlocks(blocks,isarticle);

      this.book = book;
      this.flags = flags;
      this.blocks = blocks;

      var { title = '', author = '' } = flags;
      title = title ? title : 'Untitled';

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
      this.htmls = parser.translateBlocks(this.toConfig(),blocks,isarticle,this.htmls);
      this.htmls.push(`</div>`);

      const { scrollTop } = this.element;
      this.element.textContent = ''
      this.element.innerHTML = this.htmls.join('\n');
      this.element.scrollTop = scrollTop
      this.doHilite();

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
    if (node) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var src = node.getAttribute('src');
      if (nodeName === 'MARK' && className === 'BOOK') {
        atom.workspace.open(src,{pending:true,searchAllPanes:true});
      }
    }

  }

  toggleSectionalContents (event) {

console.log('toggleSectionalContents');

    /// show or hide contents for a sectional heading, only
    /// for BOOK preview;

    /// note that the h_node.nextSibling member would
    /// still have returned a #text nodeName even if the h_node
    /// is the last heading node, thus making parent_node.insertBefore()
    /// still applicable

    var node = event.target;
    if (node) {

      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var label = node.getAttribute('label');

      if (nodeName === 'MARK' && className === 'BOOK') {
        var h_node = this.findParentHnodeById(node.parentNode,label);
        if (h_node) {
          var next_div_node = h_node.nextSibling;
          var parent_node = h_node.parentNode;
          if (parent_node && next_div_node) {
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

        if (next_div_node && !next_div_node.textContent) {
          /// expand!
          var parser = new NitrilePreviewHtml();
          var the_blocks = this.getContentsBlocksForHDGS(label);

          /// it could be zero-length array returned---and in this
          /// case we will show (empty)
          if (the_blocks.length == 0) {
            var htmls = [];
            htmls.push('<p>(empty)</p>');
            next_div_node.innerHTML = htmls.join('\n');
          } else {

            var htmls = parser.translateBlocks(this.toConfig(),the_blocks,false);
            next_div_node.innerHTML = htmls.join('\n');
          }

        } else if (next_div_node && next_div_node.textContent) {

          /// collapse!
          next_div_node.textContent = '';
        }

      } else if (nodeName === 'MARK' && className === 'ARTICLE') {
        var h_node = this.findParentHnodeById(node.parentNode,label);
        if (h_node) {
          var next_div_node = h_node.nextElementSibling;
          while (next_div_node && next_div_node.nodeName === 'DIV') {
            next_div_node.hidden = !next_div_node.hidden;
            next_div_node = next_div_node.nextElementSibling;
          }
        }
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

  showHighlight(event) {

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

    if (this.book.length) {

      this.saveastype = 'html-book';
      atom.workspace.paneForItem(this).saveItemAs(this);

    } else {

      this.saveastype = 'html-article';
      atom.workspace.paneForItem(this).saveItemAs(this);

    }

  }

  toXhtml() {

    /// called as a command by 'Save As HTML...'

    if (this.book.length) {

      this.saveastype = 'xhtml-book';
      atom.workspace.paneForItem(this).saveItemAs(this);

    } else {

      this.saveastype = 'xhtml-article';
      atom.workspace.paneForItem(this).saveItemAs(this);

    }

  }

  toLatexChapter () {

    /// Translate to LuaLATEX source code
    /// and then save it
    /// window
    this.saveastype = 'lualatex-chapter';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toLatex () {

    /// either to a book or an article depending

    if (this.book.length) {

      this.saveastype = 'lualatex-book';
      atom.workspace.paneForItem(this).saveItemAs(this);

    } else {

      this.saveastype = 'lualatex-article';
      atom.workspace.paneForItem(this).saveItemAs(this);

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
        this.update();
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
            this.update();
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
        case 'html-book':
        case 'html-article': {
          basename = path.basename(this.path + ".html");
          break;
        }
        case 'xhtml-book':
        case 'xhtml-article': {
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

        var parser = new NitrilePreviewLatex();
        var olines = parser.translateBlocks(this.toConfig(),this.blocks,true);
        var {title='',author='',documentclass=''} = this.flags;
        title = title ? title : 'Untitled';
        documentclass = documentclass ? documentclass : 'article';

        if (atom.config.get('nitrile-preview.texFamily') === 'LuaLaTeX') {

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
\\usepackage{enumitem}
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

        } else {

          data = `\% \!TEX program = pdflatex
\\documentclass{${documentclass}}
\\usepackage[utf8]{inputenc}
\\usepackage{CJKutf8,pinyin}
\\usepackage[overlap,CJK]{ruby}
\\newcommand*{\\cn}[1]{\\begin{CJK}{UTF8}{gbsn}#1\\end{CJK}}
\\newcommand*{\\tw}[1]{\\begin{CJK}{UTF8}{bsmi}#1\\end{CJK}}
\\newcommand*{\\jp}[1]{\\begin{CJK}{UTF8}{min}#1\\end{CJK}}
\\newcommand*{\\kr}[1]{\\begin{CJK}{UTF8}{mj}#1\\end{CJK}}
\\usepackage{graphicx}
\\usepackage{subcaption}
\\usepackage{caption}
\\usepackage{paralist}
\\usepackage{enumitem}
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
\\renewcommand{\\rubysize}{0.5}
\\renewcommand{\\rubysep}{0.0ex}
\\title{${title}}
\\author{${author}}
\\begin{document}
\\maketitle
${olines.join('\n')}
\\end{document}`;

        }


      } else if (this.saveastype === 'lualatex-chapter') {

        var parser = new NitrilePreviewLatex();
        var olines = parser.translateBlocks(this.toConfig(),this.blocks,false);
        data = olines.join('\n');

      } else if (this.saveastype === 'lualatex-book') {

        var parser = new NitrilePreviewLatex();
        var olines = parser.translateBlocks(this.toConfig(),this.blocks,false);
        var {title='',author='',documentclass=''} = this.flags;
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

      } else if (this.saveastype === 'xhtml-article' ||
                 this.saveastype === 'xhtml-book') {

        var parser = new NitrilePreviewHtml();
        if (this.saveastype === 'xhtml-article') {
          var isarticle = true;
        } else {
          var isarticle = false;
        }
        const olines = parser.translateBlocks(this.toConfig(),this.blocks,isarticle);

        var {title='',author='',documentclass=''} = this.flags;
        title = title ? title : 'Untitled';

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
<div class='PAGE'>
<p class='TITLE'>
${parser.escape(title)}
</p>
<p class='AUTHOR'>
${parser.escape(author)}
</p>
<p class='DATE'>
${parser.escape(new Date().toLocaleDateString())}
</p>
${olines.join('\n')}
</div>
</body>
</html>`;



      } else if (this.saveastype === 'html-article' ||
                 this.saveastype === 'html-book') {

        var parser = new NitrilePreviewHtml();
        if (this.saveastype === 'html-article') {
          var isarticle = true;
        } else {
          var isarticle = false;
        }
        const olines = parser.translateBlocks(this.toConfig(),this.blocks,isarticle);

        var {title='',author='',documentclass=''} = this.flags;
        title = title ? title : 'Untitled';

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
<div class='PAGE'>
<p class='TITLE'>
${parser.escape(title)}
</p>
<p class='AUTHOR'>
${parser.escape(author)}
</p>
<p class='DATE'>
${parser.escape(new Date().toLocaleDateString())}
</p>
${olines.join('\n')}
</div>
</body>
</html>`;

      }
      fs.writeFileSync(savefilepath, data+'\n');
      atom.notifications.addSuccess(savefilepath + ' saved, '
            + data.length + ' character(s)');
    } catch(e) {
      atom.notifications.addError(e.toString());
      console.log(e.stack);
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

  toConfig () {

    /// return an object that is the config parameters for the
    /// view
    var o = {}
    var p = pjson.configSchema;
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
        o[key] = atom.config.get(`nitrile-preview.${key}`);
      }
    }
    return o;
  }

}


module.exports = { NitrilePreviewView };
