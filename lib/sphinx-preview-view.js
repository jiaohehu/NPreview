'use babel';

const renderer = require('./sphinx-preview-renderer');
const { Emitter, CompositeDisposable } = require('atom');

export default class SphinxPreviewView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('sphinx-preview');
    this.element.tabIndex = -1;
    this.element.innerHTML = '<h1>Header</h1><p>THis is good</p>';

    // create disposable
    this.disposables = new CompositeDisposable()
    this.registerAllCommands()
    //this.registerContextMenuCommands() 

    // create emitter
    this.emitter = new Emitter();

    // get the current active editor and save it
    this.editor = atom.workspace.getActiveTextEditor();
    this.disposables.add(
      this.editor.getBuffer().onDidStopChanging(() => {
        this.update();
      })
    );

    // initialize renderer member
    this.renderer = renderer;
    this.update();
  }

  /*
  Register context menu
  */
  registerContextMenuCommands() {

    atom.commands.add(this.element, {
      'sphinx-preview:inspect': () => {
        this.inspect();
      }
    });

    atom.contextMenu.add({
      'div.sphinx-preview': [{label: 'Inspect', command: 'sphinx-preview:inspect'}]
    });

  }

  /*
  Register scroll command
  */
  registerAllCommands () {
    this.disposables.add(
      atom.commands.add(this.element, {
        'sphinx-preview:inspect': (event) => {
          this.inspect(event);
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
    console.log("destroy called");
    this.disposables.dispose();
    this.element.remove();
    this.emitter.emit('did-destroy');
  }

  // called to update this view when editor content changed
  update() {
    const { scrollTop } = this.element;
    //console.log(`this.update: scrollTop:${scrollTop}`);
    this.loading = false
    this.loaded = true
    this.element.textContent = ''
    this.element.innerHTML = this.renderer.toHTML(this.editor.getBuffer().getLines());
    this.element.scrollTop = scrollTop
  }

  // called when a new active editor might have changed.
  assertEditor() {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor === this.editor) {
      return
    }
    this.editor = editor;
    this.disposables.dispose();
    this.registerAllCommands();
    this.disposables.add(
      this.editor.getBuffer().onDidStopChanging(() => {
        this.update();
      })
    );
    this.update();
  }

  // event function to be called by others to register
  // handler when this view is destroyed
  onDestroyed (callback) {
    return this.emitter.on('did-destroy',callback);
  }

  /// event handler
  inspect(event) {
    console.log("sphinx-preview:inspect() called");
    console.log(event);
    console.log(''+event.target.nodeName);
    console.log(''+event.target.parentNode.nodeName);
    console.log('row:'+event.target.parentNode.getAttribute('row'));
    var node = event.target;
    while (node) {
      var nodeName = ''+node.nodeName;
      var className = ''+node.className;
      var row = node.getAttribute('row');
console.log(`nodeName:${nodeName} className:${className} row:${row}`);
      if (className === 'sphinx-preview') {
        break;
      }
      if (nodeName === 'DIV' && row) {
        this.editor.scrollToBufferPosition([+row,0],{'.center': true});
        this.editor.setSelectedBufferRange([[+row,0],[+row+1,0]]);
        break;
      }
      node = node.parentNode;
    }
  }

}
