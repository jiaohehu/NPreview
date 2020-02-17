'use babel';

class NitrilePreviewDiagram {

  constructor (parser) {
    //this.re_command = /^(drawgrid|drawarrow|drawdblarrow|drawline|drawrect|drawtriangle|drawdot|drawfullcircle|save|set|label(ctr|right|left|bot|top|topleft|topright|botleft|botright))/;
    this.re_command = /^(\w+)/;
    this.re_coord2 = /^\(\s*([\d\.\-\+]+),\s*([\d\.\-\+]+)\s*\)/;
    this.re_coord1 = /^\(\s*([\d\.\-\+]+)\s*\)/;
    this.re_coord0 = /^\s*([\d\.\-\+]+)\s*/;
    this.width = '25';
    this.height = '10';
    this.unit = '4mm';
    this.parser = parser;
    this.fontsize = '';
    this.refx = '';
    this.refy = '';
  }

  parseLine (line) {
    var v;
    var p = this.initP();
    if ((v = this.re_command.exec(line)) !== null) {
      p.command = v[1];
      line = line.slice(v[1].length);
      line = line.trimLeft();
    } 
    switch (p.command) {
      case 'refx': 
      case 'refy': 
      case 'fontsize': 
        p.line = line;
        break;
       
      case 'drawtext':  
      case 'labelctr':  
      case 'labeltop':  
      case 'labelbot':  
      case 'labelleft':  
      case 'labelright':  
      case 'labeltopleft':  
      case 'labeltopright':  
      case 'labelbotleft':  
      case 'labelbotright':  
        [p,line] = this.readCoord(p,line);
        p.text = line;
        break;
       
      case 'drawarrow': 
      case 'drawdblarrow': 
      case 'drawtriangle': 
      case 'drawupperhalfcircle': 
      case 'drawlowerhalfcircle': 
      case 'drawfullcircle': 
      case 'drawline': 
      case 'drawdot':  
        var flag = true;
        while (flag) {
          [p,line,flag] = this.readCoord(p,line);
        }
        break;
       
      default:  
        break;
    }
    return [p,line];
  }

  toMetaPost (data) {
    var results = [];
    var p = null;
    var line = null;
    for (line of data) {
      [p] = this.parseLine(line);
console.log('parseLine',line,p);
      results.push(p);
    }
    var o = [];
    o.push(`pu := \\mpdim{\\linewidth}/${this.width};`);
    o.push(`u := ${this.unit};`);
    o.push(`ratio := pu/u;`);
    o.push(`picture wheel;`);
    o.push(`wheel := image(`);
    var ym = this.height;
    var xm = this.width;
    o.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
    o.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
    for (var p of results) {
      switch (p.command) {
        case 'refx': {
          this.refx = p.line; 
          break;
        }
        case 'refy': {
          this.refy = p.line; 
          break;
        }
        case 'fontsize': {
          this.fontsize = p.line;
          break;
        }
        case 'drawarrow': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var z1 = p.coords[1];
          o.push(`drawarrow ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u));`);
          break;
        }
        case 'drawdblarrow': {
console.log('before=',p.coords);
          this.fixCoords(p);
console.log('after=',p.coords);
          var z0 = p.coords[0];
          var z1 = p.coords[1];
          o.push(`drawdblarrow ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u));`);
          break;
        }
        case 'drawtriangle': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var z1 = p.coords[1];
          var z2 = p.coords[2];
          o.push(`draw ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u) -- (${z2[0]}*u,${z2[1]}*u) -- cycle);`);
          break;
        }
        case 'drawupperhalfcircle': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var z1 = p.coords[1];
          var r = z0[0];
          var x = z1[0];
          var y = z1[1];
          o.push(`draw halfcircle scaled(${r}u) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawlowerhalfcircle': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var z1 = p.coords[1];
          var r = z0[0];
          var x = z1[0];
          var y = z1[1];
          o.push(`draw halfcircle scaled(${r}u) rotated(180) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawfullcircle': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var z1 = p.coords[1];
          var r = z0[0];
          var x = z1[0];
          var y = z1[1];
          o.push(`draw fullcircle scaled(${r}u) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawline': {
          this.fixCoords(p);
          var z0;
          var myo = [];
          for (z0 of p.coords) {
            var x = z0[0];
            var y = z0[1];
            myo.push(`(${x}*u,${y}*u)`);
          }
          o.push(`draw (${myo.join('--')});`);
          break;
        }
        case 'drawdot': {
          this.fixCoords(p);
          var z0;
          for (z0 of p.coords) {
            var x = z0[0];
            var y = z0[1];
            o.push(`drawdot (${x}*u,${y}*u) withpen pencircle scaled 4pt;`);
          }
          break;
        }
        case 'drawtext': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          if (this.fontsize) {
            var fs = this.fontsize;
            o.push(`label (btex {\\fontsize{${fs}}{${fs}}\\selectfont{}${text}} etex, (${x}*u,${y}*u));`);
          } else {
            o.push(`label (btex {${text}} etex, (${x}*u,${y}*u));`);
          }
          break;
        }
        case 'labelctr': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelright': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.rt (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelleft': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.lft (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labeltop': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.top (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelbot': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.bot (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labeltopleft': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.ulft (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labeltopright': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.urt (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelbotleft': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.llft (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelbotright': {
          this.fixCoords(p);
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.lrt (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
      }
    }
//console.log('o=',o.join('\n'));
    o.push(`);`);
    o.push(`draw wheel scaled(ratio);`);
    return o.join('\n');
  }

  initP () {
    var p = {};
    p.command = '';
    p.coords = [];
    p.text = '';
    p.line = '';
    return p;
  }

  parseDrawgrid (p,line) {

    [p,line] = this.readCoord(p,line);
    return [p,line];
  }

  parseDrawtriangle (p,line) {

    [p,line] = this.readCoord(p,line);
    [p,line] = this.readCoord(p,line);
    [p,line] = this.readCoord(p,line);
    return [p,line];
  }

  parseLabel (p,line) {

    [p,line] = this.readCoord(p,line);
    p.text = line;
    return [p,line];
  }

  readCoord (p,line) {
 
    var v;
    if ((v = this.re_coord2.exec(line)) !== null) {
      p.coords.push([v[1],v[2]]);
      line = line.slice(v[0].length);
      line = line.trimLeft();
      return [p,line,true];
    } else if ((v = this.re_coord1.exec(line)) !== null) {
      p.coords.push([v[1],0]);
      line = line.slice(v[0].length);
      line = line.trimLeft();
      return [p,line,true];
    } else if ((v = this.re_coord0.exec(line)) !== null) {
      p.coords.push([v[1],0]);
      line = line.slice(v[0].length);
      line = line.trimLeft();
      return [p,line,true];
    } else {
      return [p,line,false];
    }
  }

  fixCoords (p) {
    var t;
    for (t of p.coords) {
      this.fromLocal(t); 
    }
  }

  fromLocal (t) {
    ///t must be an array of two elements
    if (this.refx) {
      t[0] = parseFloat(t[0]) + parseFloat(this.refx);
    }
    if (this.refy) {
      t[1] = parseFloat(t[1]) + parseFloat(this.refy);
    }
    return t;
  }

  
}
module.exports = { NitrilePreviewDiagram };
