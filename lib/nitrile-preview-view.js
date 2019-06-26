'use babel';

const { Emitter, Disposable, CompositeDisposable, File } = require('atom');
const renderer = require('./nitrile-preview-renderer');
const latexparser  = require('./nitrile-preview-latex');
const htmlparser   = require('./nitrile-preview-html');
const { NitrilePreviewParser } = require('./nitrile-preview-parser');
const fs = require('fs');
const path = require('path');

export default class NitrilePreviewView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('nitrile-preview');
    this.element.tabIndex = -1;
    this.element.innerHTML = '<h1>Header</h1><p>THis is good</p>';
    this.parser = new NitrilePreviewParser();
    this.lines = [];
    this.blocks = [];
    this.html = '';
    this.row = -1;
    this.highlightId = '';
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable()
    this.editor = atom.workspace.getActiveTextEditor();
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
    /// this will be called whenever user has moved the cursor
    this.disposables.add(
      this.editor.onDidChangeCursorPosition((event) => {
        this.row = event.newBufferPosition.row;
        this.highlight();
      })
    );
    /// this will be called whenever the editor has been destroyed
    this.disposables.add(
      this.editor.onDidDestroy(() => {
        this.editor = null;
      })
    );
  }

  /*
   Highlight the last cursor block
  */
  highlight () {
    var elem = document.getElementById(this.highlightId);
    if (elem) {
      elem.style.outline = '';
      elem.style.backgroundColor = '';
      this.highlightId = '';
    }
    var row = this.row;
    for (data of this.blocks) {
      const [id,row1,row2] = data;
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

  /*
  Register all command
  */
  registerAllCommands () {
    this.disposables.add(
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
      ///
      atom.commands.add(this.element, {
        'nitrile-preview:inspect': (event) => {
          this.inspect(event);
        },
        'nitrile-preview:showsource': () => {
          this.copyToClipboard();
        },
        'nitrile-preview:tolualatexarticle': () => {
          this.tolualatexarticle();
        },
        'nitrile-preview:tolualatexchapter': () => {
          this.tolualatexchapter();
        },
        'nitrile-preview:tolualatexbook': () => {
          this.tolualatexbook();
        },
        'nitrile-preview:toxhtml': () => {
          this.toxhtml();
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

  // called to update this view when editor content changed
  update() {
    var editor = this.editor;
    if (editor) {
      var lines = this.editor.getBuffer().getLines();
      var blocks = this.parser.toBLOCKS(lines);
      var html = htmlparser.toPREVIEW(blocks);
      const { scrollTop } = this.element;
      this.loading = false
      this.loaded = true
      this.element.textContent = ''
      this.element.innerHTML = html;
      this.element.scrollTop = scrollTop
      this.lines = lines;
      this.blocks = blocks;
      this.html = html;

      /// highlight the last cursor block
      this.highlight();
    }
  }

  // called to switch to a new active TextEditor
  clearContents() {
    this.disposables.dispose();
    this.editor = null;
    this.row = -1;
    this.highlightId = '';
    this.lines = [];
    this.blocks = [];
    this.html = '';
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

  /// event handler
  inspect(event) {
    var node = event.target;
    var editor = this.editor;
    while (node && editor) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var rows = node.getAttribute('rows');
      if (className === 'nitrile-preview') {
        break;
      }
      if (nodeName === 'DIV' && rows) {
        var [row1, row2] = rows.split(' ');
        if (row1 && row2) {
          editor.setCursorBufferPosition([+row1,0],{'.autoscroll': true});
          editor.setSelectedBufferRange([[+row1,0],[+row2,0]]);
        }
        break;
      }
      node = node.parentNode;
    }
  }

  /// scroll the view so that it makes visible the node
  /// that renders the paragraph that contains the
  /// last cursor position
  jump() {
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
${this.html}
</body>`+'\n');

      });
  }

  copyToClipboard () {

    /// see if there is any selected node
    ///  if there is only copy the selected html;
    ///  otherwise copy the entire html
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
    } else {
      atom.clipboard.write(this.html)
    }
  }

  tolualatexarticle () {

    /// Translate to LuaLATEX source code
    /// and then show it in a new editor
    /// window

    atom.workspace.paneForItem(this).saveItemAs(this);
    return;

    if (!this.editor) {
      return;
    }
    latexparser.toARTICLE(this.blocks)
      .then((out) => {
        atom.workspace.paneForItem(this.editor).activate();
        atom.workspace.open().then((item) => item.setText(out));
      });
  }

  tolualatexchapter () {

    /// Translate to LuaLATEX source code
    /// and then show it in a new editor
    /// window

    if (!this.editor) {
      return;
    }
    latexparser.toCHAPTER(this.blocks)
      .then((out) => {
        atom.workspace.paneForItem(this.editor).activate();
        atom.workspace.open().then((item) => item.setText(out));
      });
  }

  tolualatexbook () {

    /// Translate to LuaLATEX source code
    /// and then show it in a new editor
    /// window

    if (!this.editor) {
      return;
    }
    var dirnames = atom.project.getPaths();
    var dirname = dirnames[0];
    console.log(dirname);
    latexparser.toBOOK(this.blocks,dirname)
      .then((out) => {
        atom.workspace.paneForItem(this.editor).activate();
        atom.workspace.open().then((item) => item.setText(out));
      });
  }

  toxhtml () {

    /// Translate to XHTML source code
    /// and then show it in a new editor
    /// window

    if (!this.editor) {
      return;
    }
    htmlparser.toXHTML(this.lines)
      .then((out) => {
        atom.workspace.paneForItem(this.editor).activate();
        atom.workspace.open().then((item) => item.setText(out));
      });
  }

  getPath () {

    /// this function is a required as an item interface function
    /// that is called by Atom when 'core:save-as' is
    /// run. As an item, this method will return a path
    /// that atom is trying to use as the initial
    /// path for the file to be saved.

    if (this.editor) {
      var fpath = this.editor.getPath();
      if (path.isAbsolute(fpath)) {
        return fpath + ".html";
      }
    }
  }

  async saveAs (htmlFilePath) {

    /// this function is required as an item interface
    /// function that will be called by Atom after it
    /// has confirmed a save-path with user and it
    /// this function is then called to actually save
    /// whatever needs to be saved to this path.

    console.log('async saveAs is called');
    console.log(htmlFilePath);
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
    console.log(cssrules);
    var title = '';
    var css = cssrules.join('\n');
    var html = this.html;
    const data =
`\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>${css}</style>
</head>
<body class='nitrile-preview' data-use-github-style>
${html}
</body>
</html>\n`;

    try {
      fs.writeFileSync(htmlFilePath, data);
      atom.notifications.addSuccess('write file success');
    } catch(e) {
      atom.notifications.addError('write file error: '+e.toString());
    }
  }

  onDidChangeModified (callback) {
    // No op to suppress deprecation warning
    return new Disposable()
  }


}
