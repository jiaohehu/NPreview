'use babel';

import NitrilePreviewView from './nitrile-preview-view';
const { CompositeDisposable } = require('atom');

export default {

  view: null,
  subscriptions: null,

  activate(state) {

    // add an opener for 'nitrile-preview' protocol
    atom.workspace.addOpener(uriToOpen => {
      let [protocol, path] = uriToOpen.split('://')
      if (protocol === 'nitrile-preview') {
        var view = new NitrilePreviewView({});
        view.onDestroyed(() => {
          console.log("nitrile-preview: received did-destroy event!");
          this.view = null;
        })
        return view;
      }
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'nitrile-preview:toggle': () => this.toggle(),
    }));
  },

  deactivate() {
    console.log('nitrile-preview.deactivate called!');
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
    if (this.view == null) {
      //const options = { searchAllPanes: true, split: 'right' };
      const options = { searchAllPanes: true };
      atom.workspace
        .open('nitrile-preview://', options)
        .then(
          (view) => {
            this.view = view;
          }
        );

    } else {
      this.view.switchTextEditor();
      this.view.jump();
      atom.workspace.paneForItem(this.view).activate();
      atom.workspace.paneForItem(this.view).activateItem(this.view);

    }
  },

};
