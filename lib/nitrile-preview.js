'use babel';

import NitrilePreviewView from './nitrile-preview-view';
const { CompositeDisposable } = require('atom');

export default {

  view: null,
  subscriptions: null,

  initialize (state) {
    console.log('initialize called');
    console.log('state');
    console.log(state);

    /// Events subscribed to in atom's system can be easily 
    /// cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'nitrile-preview:toggle': () => this.toggle(),
    }));

    /// add an opener for 'nitrile-preview' protocol
    atom.workspace.addOpener(uriToOpen => {
      let [protocol, path] = uriToOpen.split('://')
console.log('atom.workspace.addOpener');
console.log('protocol');
console.log(protocol);
console.log('path');
console.log(path);
      if (protocol === 'nitrile-preview') {
        var view = new NitrilePreviewView(path);
        view.onDestroyed(() => {
          console.log("nitrile-preview: received did-destroy event!");
          this.view = null;
        })
        return view;
      }
    });

  },

  activate(state) {

console.log('activate of NitrilePreview called');
console.log('state');
console.log(state);

    if (state) {
      atom.deserializers.deserialize(state);
    }

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

    /// 'data' is whatever the 'data' field of the serialized data

console.log('deserializeNitrilePreviewView called');
console.log('data');
console.log(data);

    ///this.openPreview(data);
    this.view = new NitrilePreviewView(data);
    return this.view;
  },

  openPreview (data) {

console.log('openPreview called');
console.log('data');
console.log(data);

    /// data is the path string

    if (!data) {
      return;
    }

    if (this.view) {
      this.view.switchPath(data);
    } else {
      const options = { searchAllPanes: true };
      atom.workspace.open(`nitrile-preview://${data}`, options)
        .then( (view) => {
          this.view = view;
        });
    }
  },

  toggle() {
console.log('nitrile-preview.toggle called');
console.log('this.view');
console.log(this.view);

    var editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      var data = editor.getPath();
      this.openPreview(data);
    }
    return;

/*
    if (this.view === null) {

      var editor = atom.workspace.getActiveEditor();
      if (editor) {
        var data = editor.getPath();
        this.openPreview(data);
      }

    } else {

      /// Note: the switchTextEditor() here must be the first
      /// while the current editor is still active as switchTextEdditor()
      /// will call atom.workspace.getActiveEditor() 
      this.view.switchEditor(atom.workspace.getActiveTextEditor());
      atom.workspace.paneForItem(this.view).activate();
      atom.workspace.paneForItem(this.view).activateItem(this.view);
      this.view.jump();

    }
*/

  },

};
