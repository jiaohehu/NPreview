'use babel';

import NitrilePreviewView from './nitrile-preview-view';
const { CompositeDisposable, Disposable } = require('atom');

export default {

  subscriptions: null,

  activate(state) {

    this.subscriptions = new CompositeDisposable(
      // Add an opener for our view.
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://nitrile-preview') {
          return new NitrilePreviewView();
        }
      }),

      // Register command that toggles this view
      atom.commands.add('atom-workspace', {
        'nitrile-preview:toggle': () => this.toggle()
      }),

      // Destroy any ActiveEditorInfoViews when the package is deactivated.
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
    console.log('nitrile-preview.deactivate called!');
    this.subscriptions.dispose();
  },

  serialize() {
console.log('NitrilePreview::serialize called');
/*
    if (this.view) {
      return this.view.serialize();
    }
*/
  },

  deserializeNitrilePreviewView(serialized) {

    /// 'data' is whatever the 'data' field of the serialized data

console.log('deserializeNitrilePreviewView called');
console.log('serialized');
console.log(serialized);

    return new NitrilePreviewView();
  },

  toggle() {
    console.log("Toggle it!");
    atom.workspace.toggle('atom://nitrile-preview');
  },

};
