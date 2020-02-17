'use babel';

class NitrilePreviewDiagram {

  constructor () {
    this.re_command = /^(drawgrid|drawline|drawrect|drawtriangle|drawdot|drawcircle|save|set)/;
    this.re_coord2 = /^\(\s*([\d\.]+),\s*([\d\.]+)\s*\)/;
    this.re_coord1 = /^\(\s*([\d\.]+)\s*\)/;
    this.width = '25';
    this.height = '10';
  }

  toMetaPost (data) {
    var width = '25';
    var height = '10';
    var results = [];
    for (var line of data) {
      var [p,line] = this.parseLine(line);
console.log('p=',p);
console.log('line=',line);
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
      }
    }
//console.log('o=',o.join('\n'));
    return o.join('\n');
  }

  initP () {
    var p = {};
    p.command = '';
    p.coords = [];
    return p;
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
      default: {
        return [p,line];
        break;
      }
    }
  }

  parseDrawgrid (p,line) {

    [p,line] = this.parseCoord(p,line);
    return [p,line];
  }

  parseDrawtriangle (p,line) {

    [p,line] = this.parseCoord(p,line);
    [p,line] = this.parseCoord(p,line);
    [p,line] = this.parseCoord(p,line);
    return [p,line];
  }

  parseCoord (p,line) {
 
    var v;
    if ((v = this.re_coord2.exec(line)) !== null) {
      p.coords.push([v[1],v[2]]);
      line = line.slice(v[0].length);
      line = line.trimLeft();
    } else if ((v = this.re_coord1.exec(line)) !== null) {
      p.coords.push([v[1],0]);
      line = line.slice(v[0].length);
      line = line.trimLeft();
    }
    return [p,line];
  }

  
}
module.exports = { NitrilePreviewDiagram };
