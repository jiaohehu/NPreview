'use babel';

const { NitrilePreviewView } = require ('./nitrile-preview-view');
const { CompositeDisposable, Disposable } = require('atom');

module.exports = { 

  subscriptions: null,

  activate(state) {

    this.subscriptions = new CompositeDisposable(
      // Add an opener for our view.
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://nitrile-preview') {
          /// we simply create a new view class
          /// without any serialized data and will
          /// rely on 'observeActivePaneItem' event
          /// being sent to this view automatically after it is created
          return new NitrilePreviewView();
        }
      }),

      // Register command that toggles this view
      atom.commands.add('atom-workspace', {
        'nitrile-preview:toggle': () => this.toggle()
      }),

      // Destroy any NitrilePreviewView when the package is deactivated.
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof NitrilePreviewView) {
            item.destroy();
          }
        });
      })
    );
  },

  deactivate() {

    this.subscriptions.dispose();
  },

  serialize() {

  },

  deserializeNitrilePreviewView(serialized) {

    return new NitrilePreviewView(serialized);
  },

  toggle() {

    atom.workspace.toggle('atom://nitrile-preview');
  },

};
