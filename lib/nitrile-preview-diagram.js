'use babel';

class NitrilePreviewDiagram {

  constructor () {
    this.re_command = /^(drawgrid|drawline|drawrect|drawtriangle|drawdot|drawcircle|save|set)/;
    this.re_coord2 = /^\(\s*([\d\.]+),\s*([\d\.]+)\s*\)/;
    this.re_coord1 = /^\(\s*([\d\.]+)\s*\)/;
  }

  toMetaPost (data) {
    var unit = '4';
    var cmds = [];
    for (var line of data) {
      var [p,line] = this.parseLine(line);
console.log('p=',p);
console.log('line=',line);
      cmds.push(p);
    }
    var o = [];
    o.push(`u = ${unit}mm;`);
    for (var p of cmds) {
      if (p.command == 'drawgrid') {
        var xm = parseFloat(p.coords[0][0]);
        var ym = parseFloat(p.coords[0][1]);
        o.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
        o.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
      }
    }
console.log('o=',o.join('\n'));
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
      default: {
        return [p,line];
        break;
      }
    }
  }

  parseDrawgrid (p,line) {

    var [p,line] = this.parseCoord(p,line);
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
