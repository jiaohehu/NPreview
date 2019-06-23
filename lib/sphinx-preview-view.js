'use babel';

const { Emitter, CompositeDisposable } = require('atom');
const renderer = require('./sphinx-preview-renderer');

export default class SphinxPreviewView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('sphinx-preview');
    this.element.tabIndex = -1;
    this.element.innerHTML = '<h1>Header</h1><p>THis is good</p>';
    this.metadata = [];   
    this.html = '';
    this.row = -1;

    // create disposable
    this.disposables = new CompositeDisposable()
    this.registerAllCommands()

    // create emitter
    this.emitter = new Emitter();

    // get the current active editor and save it
    this.editor = atom.workspace.getActiveTextEditor();
    this.monitorEditor();

    // initialize renderer member
    this.renderer = renderer;
    this.update();
  }

  /*
  Monitor the editor
  */
  monitorEditor () {
    this.disposables.add(
      this.editor.getBuffer().onDidStopChanging(() => {
        this.update();
      })
    );
    this.disposables.add(
      this.editor.onDidChangeCursorPosition((event) => {
        this.row = event.newBufferPosition.row;
      })
    );
    if (this.editor.getCursorBufferPosition()) {
      this.row = this.editor.getCursorBufferPosition().row;
    } else {
      this.row = -1;
    }

  }

  /*
  Register all command
  */
  registerAllCommands () {
    this.disposables.add(
      /// process events sent to 'this.element': For example the 'core:move-down' event
      /// will be sent to 'this.element' when down-arrow key pressed, and atom auto-
      /// matically generates a 'core:move-down' event; another, the 'sphinx-preview:inspect'
      /// will be sent to this element because the 'menu/sphinx-preview.json' file contains
      /// an instruction to set-up a menu item that when triggered will send the 'sphinx-preview:inspect'
      /// event to 'this.element'---thus, we need to be able to capture these events sent to
      /// 'this.element' and then call the appropriate functions---this is what following
      /// code is doing.
      ///
      /// note that for 'core:move-up', 'core:move-down' events there is no-need to have 
      /// to specify an event---even though it is there but we choose not to use it. However,
      /// for 'sphinx-preview:inspect' we do need the event because since it came from a
      /// context menu entry this event's 'target' member points to the DOM element 
      /// that has received the cursor click.
      ///
      atom.commands.add(this.element, {
        'sphinx-preview:inspect': (event) => {
          this.inspect(event);
        },
        'sphinx-preview:showsource': () => {
          this.showsource();
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
    return 'Sphinx Preview';
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {

  }

  // called when sphinx-preview window is being destroyed
  destroy() {
//console.log("destroy called");
    this.disposables.dispose();
    this.element.remove();
    this.emitter.emit('did-destroy');
  }

  // called to update this view when editor content changed
  update() {
    var [html, metadata] = this.renderer.toHTML(this.editor.getBuffer().getLines());
//console.log('metadata');
//console.log(metadata);
    const { scrollTop } = this.element;
    this.loading = false
    this.loaded = true
    this.element.textContent = ''
    this.element.innerHTML = html;
    this.element.scrollTop = scrollTop
    this.metadata = metadata;
    this.html = html;

    // set the entire paragraph 'yellow' for the one
    // that contains the last cursor buffer position
    for (data of metadata) {
      const [id, row1, row2] = data;
      if (this.row >= row1 && this.row < row2) {
        var elem = document.getElementById(id);
        if (elem) {
          elem.style.backgroundColor = 'yellow';
          break;
        }
      }
    
    }
  }

  // called when a new active editor might have changed.
  assertEditor() {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor === this.editor) {
      return
    }
    this.disposables.dispose();
    this.editor = editor;
    this.registerAllCommands();
    this.monitorEditor();
    this.update();
  }

  // event function to be called by others to register
  // handler when this view is destroyed
  onDestroyed (callback) {
    return this.emitter.on('did-destroy',callback);
  }

  /// event handler
  inspect(event) {
//console.log("sphinx-preview:inspect() called");
//console.log(event);
//console.log(''+event.target.nodeName);
//console.log(''+event.target.parentNode.nodeName);
//console.log('rows:'+event.target.parentNode.getAttribute('rows'));
    var node = event.target;
    while (node) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var rows = node.getAttribute('rows');
//console.log(`nodeName:${nodeName} className:${className} rows:${rows}`);
      if (className === 'sphinx-preview') {
        break;
      }
      if (nodeName === 'DIV' && rows) {
        var [row1, row2] = rows.split(' ');
        if (row1 && row2) {
          this.editor.scrollToBufferPosition([+row1,0],{'.center': true});
          this.editor.setSelectedBufferRange([[+row1,0],[+row2,0]]);
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
    var metadata = this.metadata;
    var editor = this.editor;
    if (metadata && editor) {
      var row = editor.getCursorBufferPosition().row;
      for (data of metadata) {
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

  getMarkdownPreviewCSS() {
    return '';
  }

  /*
  Show source HTML in a new editor window
  */
  showsource () {
    console.log('showsource() called');
    /// activate the pane of the editor
    atom.workspace.paneForItem(this.editor).activate(); 
    atom.workspace.open() /// this will open an 'Untitled' editor
      .then((item) => { 
        item.setText(`<!DOCTYPE html>
                        <head>
                          <meta charset="utf-8" />
                          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                        </head>
                        <body>
                        ${this.html}
                        </body>`+'\n');

        ///optionally asking for user to save this file as
        ///this will activate the interface method 'TextEditor::saveAs(path)' 
        ///atom.workspace.paneForItem(item).saveItemAs(item);
      });
  }

  /*
  Save the HTML
  */
  saveAs (htmlFilePath) {
    var title = '';
    var htmlBody = 'Hello world';
    const html =
      `\
<!DOCTYPE html>
<html>
  <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>${this.getMarkdownPreviewCSS()}</style>
  </head>
  <body class='markdown-preview' data-use-github-style>${htmlBody}</body>
</html>` + '\n' // Ensure trailing newline

    fs.writeFile(htmlFilePath, html, {}, () => {
      return atom.workspace.open(htmlFilePath);
    });
  }


}
