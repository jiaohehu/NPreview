'use babel';

const { Emitter, Disposable, CompositeDisposable, File } = require('atom');
const { NitrilePreviewHtml } = require('./nitrile-preview-html');
const { NitrilePreviewLatex } = require('./nitrile-preview-latex');
const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const fs = require('fs');
const path = require('path');

export default class NitrilePreviewView {

  constructor(serializedState) {
    // Create root element
    this.divStyle='box-sizing:border-box;width:8.5in;padding:1in 1.25in 1in 1.5in;margin:0;font-size:12pt;background-color:white;';
    this.element = document.createElement('div');
    this.element.classList.add('nitrile-preview');
    this.element.tabIndex = -1;
    this.element.innerHTML = '<h1>No editor</h1>';
    this.lines = [];
    this.blocks = [];
    this.htmls = [];
    this.dirname = '';
    this.row = -1;
    this.highlightId = '';
    this.contentsFlags = {};
    this.contentsBlocks = [];
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable()
    this.editor = atom.workspace.getActiveTextEditor();
    this.saveastype = '';
    this.registerAllCommands()
    this.registerEventHandlers();
    this.update();

    /// testing
    //this.editor.onDidSave( () => console.log('editor saved') );
  }

  /*
  Monitor the editor
  */
  registerEventHandlers () {
    this.disposables.add(
      this.editor.getBuffer().onDidStopChanging(() => {
        this.update();
      })
    );
    this.disposables.add(
      this.editor.onDidChangeCursorPosition((event) => {
        this.row = event.newBufferPosition.row;
        this.highlightElement();
      })
    );
    this.disposables.add(
      this.editor.onDidSave((event) => {
        this.dirname = path.dirname(event.path);
        console.log(this.dirname);
      })
    );
    this.disposables.add(
      this.editor.onDidDestroy(() => {
        this.editor = null;
      })
    );
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

    this.disposables.add(

      atom.commands.add(this.element, {
        'nitrile-preview:select-source-paragraph': (event) => {
          this.selectSourceParagraph(event);
        },
        'nitrile-preview:open-linked-file': (event) => {
          this.expandHeaderContents(event);
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

  /*
  The required method for an 'item' of a Panel.
  */
  getTitle() {

    return 'Nitrile Preview';

  }

  // Returns an object that can be retrieved when package is activated
  serialize() {

  }

  // called when nitrile-preview window is being destroyed
  destroy() {

    this.disposables.dispose();
    this.element.remove();
    this.emitter.emit('did-destroy');

  }

  update() {

    /// Change the innerHTML of this element. This function is 
    /// called for both book and article contents.

    if (this.editor) {
      /// note that the parser will need to be recreated every
      /// time because it has its internal resources modified
      /// everytime something is being parsed or converted
      var parser = new NitrilePreviewHtml();
      var fname = this.editor.getPath() ?
            path.basename(this.editor.getPath()) : 'untitled';
      this.lines = this.editor.getBuffer().getLines();
      this.blocks = parser.toBLOCKS(this.lines,fname,0);
      this.blocks = parser.autoBLOCKS(this.blocks);

      /// figure out the dirname of the current editor
      var dirname = path.dirname(this.editor.getPath());
      if (path.isAbsolute(dirname)) {
        this.dirname = dirname;
      } else {
        try {
          this.dirname = atom.project.getPaths()[0];
        } catch(e) {
          this.dirname = '';
        }
      }

      /// figure if this is a book block
      this.isBookBlock = false;
      if (this.blocks.length == 1 && this.blocks[0][3] === '%!BOOK') {
        this.isBookBlock = true;
      }

      /// for article
      if (!this.isBookBlock) {
        this.htmls = [];
        this.htmls.push(`<div style='${this.divStyle}'>`);
        this.htmls = parser.translate(this.blocks,true,this.htmls);
        this.htmls.push(`</div>`);
        const { scrollTop } = this.element;
        this.element.textContent = '';
        this.element.innerHTML = this.htmls.join('\n');
        this.element.scrollTop = scrollTop;
        this.highlightElement();

      } else {
        /// for book
        this.generateContentsBlocks(this.blocks,this.dirname)
          .then((out) => {
              const [contentsFlags,contentsBlocks] = out;
              const { title = '', author = '' } = contentsFlags;
              if (contentsBlocks.length) {
                this.contentsFlags = contentsFlags;
                this.contentsBlocks = contentsBlocks;
                var parser = new NitrilePreviewHtml();
                this.htmls = [];
                this.htmls.push(`<div style='${this.divStyle}'>`);
                this.htmls = parser.translateOutline(title,author,contentsBlocks,this.htmls);
                this.htmls.push(`</div>`);
                const { scrollTop } = this.element;
                this.element.textContent = ''
                this.element.innerHTML = this.htmls.join('\n');
                this.element.scrollTop = scrollTop
              }
              });
      }
    }
  }

  async generateContentsBlocks(blocks,dirname) {
    var theblock = blocks[0];
    var documentclass = 'book';
    const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = theblock;
    var contentsFlags = {};
    var contentsBlocks = [];
    if (blocks && theblock && type === '%!BOOK') {
      ///
      /// start a new parser and a new block array
      ///
      var re_colons = /^(\:{1,})\s+(.*)$/;
      var re_flags = /^(\w+)\=(.*)$/;
      for (var line of data) {
        var v = re_colons.exec(line);
        if (v) {
          var plevel1 = v[1].length - 1;
          var fname1 = v[2].trim();
          var ffname1 = path.join(dirname,fname1);
          try {
            var data1 = await fs.readFileSync(ffname1,'utf8');
            var parser1 = new NitrilePreviewParser(); 
            contentsBlocks = parser1.toBLOCKS(data1.split('\n'),fname1,plevel1,contentsBlocks);
          } catch(e) {
            var parser1 = new NitrilePreviewParser(); 
            contentsBlocks.push( parser1.toErrorBlock( e.toString(), fname1, plevel1 ));
          }
          continue;
        }
        var v = re_flags.exec(line);
        if (v) {
          var key = v[1];
          var val = v[2].trim();
          switch (key) {
            case 'title': {
                            contentsFlags['title'] = val;
                            break;
                          }
            case 'author': {
                             contentsFlags['author'] = val;
                             break;
                           }
          }
          continue;
        }
      }
    }
    var parser1 = new NitrilePreviewParser(); 
    contentsBlocks = parser1.autoBLOCKS(contentsBlocks);
    return [contentsFlags,contentsBlocks];
  }

  // called to switch to a new active TextEditor
  clearContents() {

    this.disposables.dispose();
    this.editor = null;
    this.row = -1;
    this.highlightId = '';
    this.lines = [];
    this.blocks = [];
    this.htmls = [];
    this.element.innerHTML = '';

  }

  // called to switch to a new active TextEditor
  switchTextEditor() {

    var editor = atom.workspace.getActiveTextEditor();
    if (editor === this.editor) {
      return
    }
    if (editor) {
      this.disposables.dispose();
      this.editor = editor;
      this.registerAllCommands();
      this.registerEventHandlers();
      this.row = -1;
      this.highlightId = '';
      this.update();
    }

  }

  // event function to be called by others to register
  // handler when this view is destroyed
  onDestroyed (callback) {
    return this.emitter.on('did-destroy',callback);
  }

  selectSourceParagraph (event) {

    /// search in DOM tree for a node that is DIV and
    /// has 'rows=' attribute set.

    var node = event.target;
    var editor = this.editor;
    while (node && editor) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var rows = node.getAttribute('rows');
      if (className === 'nitrile-preview') {
        break;
      }
      if (rows) {
        var [row1, row2] = rows.split(' ');
        if (row1 && row2) {
          editor.setCursorBufferPosition([+row1,0],{'.autoscroll': true});
          editor.setSelectedBufferRange([[+row1,0],[+row2,0]]);
          atom.workspace.paneForItem(editor).activate();
          atom.workspace.paneForItem(editor).activateItem(editor);
        }
        break;
      }
      node = node.parentNode;
    }

  }

  openLinkedFile (event) {

    /// open the linked file in a new editor window.

    var node = event.target;
    var editor = this.editor;
    if (node) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var href = node.getAttribute('href');
      console.log(nodeName);
      console.log(className);
      console.log(href);
      if (nodeName === 'A' && href) {
        var re = /^file\:\/\/(.*)$/;
        var v = href.match(re);
        if (v) {
          var uri = v[1];
          console.log(uri);
          atom.workspace.open(uri,{pending:true,searchAllPanes:true});
        }
      } else if (this.isBookBlock && nodeName === 'MARK' &&
              className === 'LABEL') {
        var re = /^\[(.*)\]$/;
        var textContent = node.textContent;
        console.log(textContent);
        var v = textContent.match(re);
        if (v) {
          var id = v[1];
          var h_node = this.findHnodeById( node.parentNode, id);
          if (h_node) {
            var next_h_node = h_node.nextSibling;
            var parent_h_node = h_node.parentNode;
            if (parent_h_node && next_h_node) {
console.log('next_h_node.nodeName');
console.log(next_h_node.nodeName);
console.log('next_h_node.className');
console.log(next_h_node.className);
              if (next_h_node.nodeName === 'DIV') {
                if (!next_h_node.textContent) {
                  /// expand!
                  var translator = new NitrilePreviewHtml();
                  var the_blocks = this.getContentsBlocksForHDGS(id);
                  var htmls = translator.translate(the_blocks,false);        
                  next_h_node.innerHTML = htmls.join('\n');
                } else {
                  /// collapse!
                  next_h_node.textContent = '';
                }
              } else {
                /// expand!
                /// create a new DIV node    
                var translator = new NitrilePreviewHtml();
                var the_blocks = this.getContentsBlocksForHDGS(id);
                var html = translator.translate(the_blocks,false);        
                var new_element = document.createElement('div');
                new_element.innerHTML = html.join('\n');
                parent_h_node.insertBefore(new_element,next_h_node);
              }
            }
          }
        }
        
      }
    }

  }

  expandHeaderContents (event) {

    /// open the linked file in a new editor window.

    var node = event.target;
    var editor = this.editor;
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

          /// hide all subsequent FIGE and LSTG nodes 
          for (var node = next_div_node.nextSibling; node; node = node.nextSibling) {
console.log('node.className');
console.log(node.className);
console.log('node.nodeName');
console.log(node.nodeName);
            if (node.nodeName.match(/^H[1-6]$/)) {
              break;
            }
            if (node.className === 'FIGE' || node.className === 'LSTG') {
              node.style.visibility = 'hidden';
            } 
          }
        } else if (next_div_node && next_div_node.textContent) {
          /// collapse!
          next_div_node.textContent = '';

          /// make visible all subsequent FIGE and LSTG nodes 
          for (var node = next_div_node.nextSibling; node; node = node.nextSibling) {
            if (node.nodeName.match(/^H[1-6]$/)) {
              break;
            }
            if (node.className === 'FIGE' || node.className === 'LSTG') {
              node.style.visibility = 'visible';
            } 
          }
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

  jump() {

    /// scroll the preview window so that the selected
    /// node is shown

    var blocks = this.blocks;
    var editor = this.editor;
    if (blocks && editor) {
      var row = editor.getCursorBufferPosition().row;
      for (data of blocks) {
        const [id, row1, row2] = data;
        if (row >= row1 && row < row2) {
          var elem = document.getElementById(id);
          if (elem) {
            //elem.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
            elem.scrollIntoView();
            break;
          }
        }
      }
    }
  }

  showsource () {

    atom.workspace.open('', {pending:true})
      .then((item) => {
          item.setText(

            `<!DOCTYPE html>
            <head>
            <meta charset="utf-8" />
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body>
${this.htmls.join('\n')}
</body>`+'\n');

      });
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
    /// and then show it in a new editor
    /// window
    this.saveastype = 'lualatex-article';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toLualatexChapter () {

    /// Translate to LuaLATEX source code
    /// and then show it in a new editor
    /// window
    this.saveastype = 'lualatex-chapter';
    atom.workspace.paneForItem(this).saveItemAs(this);

  }

  toLualatexBook () {

    /// Translate to LuaLATEX source code
    /// and then show it in a new editor
    /// window

    if (this.blocks && this.blocks[0] && this.blocks[0][3] === '%!BOOK') {
      this.saveastype = 'lualatex-book';
      atom.workspace.paneForItem(this).saveItemAs(this);

    } else {
      atom.notifications.addError('No %!BOOK found!');

    }

  }

  reload () {

    /// Reload the entire content of the preview. This is necessary
    /// when previewing a BOOK content and one of the sub-document
    /// has been modified and saved and thus the contents blocks need
    /// to be re-generated.

    this.update(); 

  }

  getPath () {

    /// this function is a required as an item interface function
    /// that is called by Atom when 'core:save-as' is
    /// run. As an item, this method will return a path
    /// that atom is trying to use as the initial
    /// path for the file to be saved.

    /// note that this.editor.getPath() could return undefined
    /// if it is a 'Untitled' document

    var basename = '';
    if (this.editor && this.editor.getPath()) {
      switch (this.saveastype) {
        case 'html': {
          basename = path.basename(this.editor.getPath() + ".html");
          break;
        }
        case 'xhtml': {
          basename = path.basename(this.editor.getPath() + ".xhtml");
          break;
        }
        case 'lualatex-article':
        case 'lualatex-chapter':
        case 'lualatex-book': {
          basename = path.basename(this.editor.getPath() + ".tex");
          break;
        }
        default: {
          basename = path.basename(this.editor.getPath());
          break;
        }
      }
      if (path.isAbsolute(this.dirname)) {
        return path.resolve(this.dirname,basename);
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
        var lines1 = translator.translate(this.blocks,true);
        var title = translator.title;
        var author = translator.author;
        data = `\% \!TEX program = lualatex
\\documentclass{article}
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
\\usepackage{xtab}
\\usepackage{csquotes}
\\title{${title}}
\\author{${author}}
\\begin{document}
\\maketitle
${lines1.join('\n')}
\\end{document}`;

      } else if (this.saveastype === 'lualatex-chapter') {
        var translator = new NitrilePreviewLatex();
        var lines1 = translator.translate(this.contentsBlocks,false);
        data = lines1.join('\n');
      } else if (this.saveastype === 'lualatex-book') {
        var translator = new NitrilePreviewLatex();
        var lines1 = translator.translate(this.contentsBlocks,false);
        const { title = '', author = '' } = contentsFlags;
        data = `\% \!TEX program = lualatex
\\documentclass{book}
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
\\usepackage{xtab}
\\usepackage{csquotes}
\\title{${title}}
\\author{${author}}
\\begin{document}
\\maketitle
${lines1.join('\n')}
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
