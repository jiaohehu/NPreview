'use babel';

class NitrilePreviewDiagram {

  constructor (parser) {
    this.re_command = /^(drawgrid|drawline|drawrect|drawtriangle|drawdot|drawcircle|save|set|label(ctr|right|left|bot|top|topleft|topright|botleft|botright))/;
    this.re_coord2 = /^\(\s*([\d\.]+),\s*([\d\.]+)\s*\)/;
    this.re_coord1 = /^\(\s*([\d\.]+)\s*\)/;
    this.width = '25';
    this.height = '10';
    this.parser = parser;
  }

  parseLine (line) {
    var v;
    var p = this.initP();
    if ((v = this.re_command.exec(line)) !== null) {
      p['command'] = v[1];
      line = line.slice(v[1].length);
      line = line.trimLeft();
    } else {
      return [p,line];
    }
    switch (p.command) {
      case 'drawgrid': {
        return this.parseDrawgrid(p,line);
        break;
      }
      case 'drawtriangle': {
        return this.parseDrawtriangle(p,line);
        break;
      }
      case 'labelctr':  
      case 'labeltop':  
      case 'labelbot':  
      case 'labelleft':  
      case 'labelright':  
      case 'labeltopleft':  
      case 'labeltopright':  
      case 'labelbotleft':  
      case 'labelbotright': {
        return this.parseLabel(p,line);
        break;
      }
      case 'drawdot': {
        var flag = true;
        while (flag) {
          [p,line,flag] = this.readCoord(p,line);
        }
        return [p,line];
        break;
      }
      default: {
        return [p,line];
        break;
      }
    }
  }

  toMetaPost (data) {
    var width = '25';
    var height = '10';
    var results = [];
    var p = null;
    var line = null;
    for (line of data) {
      [p] = this.parseLine(line);
console.log('parseLine',line,p);
      results.push(p);
    }
    var o = [];
    o.push(`u = \\mpdim{\\linewidth}/${width};`);
    for (var p of results) {
      switch (p.command) {
        case 'drawgrid': {
          var xm = parseFloat(p.coords[0][0]);
          var ym = parseFloat(p.coords[0][1]);
          o.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
          o.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
          break;
        }
        case 'drawtriangle': {
          var z0 = p.coords[0];
          var z1 = p.coords[1];
          var z2 = p.coords[2];
          o.push(`draw (${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u) -- (${z2[0]}*u,${z2[1]}*u) -- cycle;`);
          break;
        }
        case 'drawdot': {
          var z;
          for (z0 of p.coords) {
            var x = z0[0];
            var y = z0[1];
            o.push(`drawdot (${x}*u,${y}*u) withpen pencircle scaled 4pt;`);
          }
          break;
        }
        case 'labelctr': {
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelright': {
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.rt (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelleft': {
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.lft (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labeltop': {
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.top (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelbot': {
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.bot (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labeltopleft': {
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.ulft (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labeltopright': {
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.urt (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelbotleft': {
          var z0 = p.coords[0];
          var x = z0[0];
          var y = z0[1];
          var text = this.parser.unmask(p.text);
          o.push(`label.llft (btex {${text}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelbotright': {
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
    return o.join('\n');
  }

  initP () {
    var p = {};
    p.command = '';
    p.coords = [];
    p.text = '';
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
    } else {
      return [p,line,false];
    }
  }

  
}
module.exports = { NitrilePreviewDiagram };
