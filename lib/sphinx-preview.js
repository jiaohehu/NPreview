'use babel';

import SphinxPreviewView from './sphinx-preview-view';
const { CompositeDisposable } = require('atom');

export default {

  view: null,
  subscriptions: null,

  activate(state) {

    // add an opener for 'sphinx-preview' protocol
    atom.workspace.addOpener(uriToOpen => {
      let [protocol, path] = uriToOpen.split('://')
      if (protocol === 'sphinx-preview') {
        var view = new SphinxPreviewView({});
        view.onDestroyed(() => {
          console.log("sphinx-preview: received did-destroy event!");
          this.view = null;
        })
        return view;
      }
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sphinx-preview:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    console.log('sphinx-preview.deactivate called!');
    this.subscriptions.dispose();
  },

  serialize() {
    /*
    return {
      view: this.view.serialize()
    };
    */
  },

  toggle() {
    console.log('sphinx-preview was toggled!');
    if (this.view == null) {
      const options = { searchAllPanes: true, split: 'right' };
      atom.workspace
        .open('sphinx-preview://', options)
        .then( (view) => {this.view = view;} );
    } else {
      this.view.assertEditor();
    }
  },



};
