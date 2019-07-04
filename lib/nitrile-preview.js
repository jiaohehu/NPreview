'use babel';

import NitrilePreviewView from './nitrile-preview-view';
const { CompositeDisposable } = require('atom');

export default {

  view: null,
  subscriptions: null,

  initialize () {
    console.log('initialize called');
  },

  activate(state) {

  console.log('activate called');
  console.log('state');
  console.log(state);

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
console.log('serialize of NitrilePreview called');
    if (this.view) {
      return this.view.serialize();
    }
  },

  deserializeNitrilePreviewView({data}) {
console.log('deserializeNitrilePreviewView called');
console.log(data);
    return new NitrilePreviewView(data);
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
      /// Note: the switchTextEditor() here must be the first
      /// while the current editor is still active as switchTextEdditor()
      /// will call atom.workspace.getActiveEditor() 
      this.view.switchEditor(atom.workspace.getActiveTextEditor());
      atom.workspace.paneForItem(this.view).activate();
      atom.workspace.paneForItem(this.view).activateItem(this.view);
      this.view.jump();

    }
  },

};
