'use babel';

class NitrilePreviewDiagram {

  constructor (parser) {
    this.parser = parser;
    /// regular expression
    this.re_command = /^(\w+)/;
    this.re_coord2 = /^\(\s*([\d\.\-\+]+),\s*([\d\.\-\+]+)\s*\)/;
    this.re_coord1 = /^\(\s*([\d\.\-\+]+)\s*\)/;
    this.re_coord0 = /^\s*([\d\.\-\+]+)\s*/;
    this.re_prop = /^\s*(\w+)\s*/;
    /// following are command options for drawing
    this.width = 25;  // the total number of grid units of the width
    this.height = 10; // the total number of grid units of the height
    this.unit = '4mm';  // the length each grid unit entails
    this.refx = 0;
    this.refy = 0;
    this.fontsize = '';
    this.slant = 0.3;
    this.anglearcradius = 0.5;
    this.label = '';
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

      case 'set': 
        [p,line] = this.getProp(p,line);
        break;
       
      default:
        var flag = true;
        while (flag) {
          [p,line,flag] = this.getNextCoord(p,line);
        }
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
//console.log('parseLine',line,p);
      results.push(p);
    }
    var o = [];
    for (var p of results) {
      switch (p.command) {
        case 'set': {
          var key = p.prop[0];
          var val = p.prop[1];
          if (key === 'width'   ) { this.width = this.assertInt(val,10,100); } ///such as 25   
          if (key === 'height'  ) { this.height = this.assertInt(val,4,100); } ///such as 10   
          if (key === 'unit'    ) { this.unit = val; }/// such as '4mm'  
          if (key === 'refx'    ) { this.refx = this.assertFloat(val,0,this.width); } ///such as 12.5
          if (key === 'refy'    ) { this.refy = this.assertFloat(val,0,this.height); } ///such as 12.5
          if (key === 'fontsize') { this.fontsize = val; }/// such as '14pt'
          if (key === 'slant'   ) { this.slant = this.this.assertFloat(val,0.1,0.9); } 
          if (key === 'anglearcradius' ) { this.anglearcradius = this.assertFloat(val,0.1,1); } ///such as '0.5'
          if (key === 'label'          ) { this.label = val; } ///such as 'Points'
          break;
        }
        case 'drawarrow': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          o.push(`drawarrow ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u));`);
          break;
        }
        case 'drawdblarrow': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          o.push(`drawdblarrow ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u));`);
          break;
        }
        case 'drawtriangle': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          var z2 = this.assertCoord(p,2);
          o.push(`draw ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u) -- (${z2[0]}*u,${z2[1]}*u) -- cycle);`);
          break;
        }
        case 'drawrect': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          if (!z0) { z0 = [0,0]; }
          if (!z1) { z1 = [1,1]; }
          var w  = z1[0]-z0[0];
          var h  = z1[1]-z0[1];
          var x = z0[0];
          var y = z0[1];
          o.push(`draw unitsquare scaled(u) xscaled(${w}) yscaled(${h}) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawparallelgram': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          if (!z0) { z0 = [0,0]; }
          if (!z1) { z1 = [1,1]; }
          var sx = this.slant;
          var w  = z1[0]-z0[0];
          var h  = z1[1]-z0[1];
          var s  = w*sx/h;
          var w  = w*(1-sx);
          var x = z0[0];
          var y = z0[1];
          o.push(`draw unitsquare scaled(u) xscaled(${w}) yscaled(${h}) slanted(${s}) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawupperhalfcircle': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          var x = z0[0];
          var y = z0[1];
          var dx = z1[0]-z0[0];
          var dy = z1[1]-z0[1];
          var r = Math.sqrt(dx*dx + dy*dy);
          var diameter = r+r;
          o.push(`draw halfcircle scaled(u) scaled(${diameter}) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawlowerhalfcircle': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          var x = z0[0];
          var y = z0[1];
          var dx = z1[0]-z0[0];
          var dy = z1[1]-z0[1];
          var r = Math.sqrt(dx*dx + dy*dy);
          var diameter = r+r;
          o.push(`draw halfcircle scaled(u) scaled(${diameter}) rotated(180) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawlefthalfcircle': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          var x = z0[0];
          var y = z0[1];
          var dx = z1[0]-z0[0];
          var dy = z1[1]-z0[1];
          var r = Math.sqrt(dx*dx + dy*dy);
          var diameter = r+r;
          o.push(`draw halfcircle scaled(u) scaled(${diameter}) rotated(90) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawrighthalfcircle': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          var x = z0[0];
          var y = z0[1];
          var dx = z1[0]-z0[0];
          var dy = z1[1]-z0[1];
          var r = Math.sqrt(dx*dx + dy*dy);
          var diameter = r+r;
          o.push(`draw halfcircle scaled(u) scaled(${diameter}) rotated(270) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawfullcircle': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          var x = z0[0];
          var y = z0[1];
          var dx = z1[0]-z0[0];
          var dy = z1[1]-z0[1];
          var r = Math.sqrt(dx*dx + dy*dy);
          var diameter = r+r;
          o.push(`draw fullcircle scaled(u) scaled(${diameter}) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawanglearc': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var z1 = this.assertCoord(p,1);
          var z2 = this.assertCoord(p,2);
          var x = z0[0];
          var y = z0[1];
          var dx1 = z1[0]-z0[0];
          var dy1 = z1[1]-z0[1];
          var dx2 = z2[0]-z0[0];
          var dy2 = z2[1]-z0[1];
          var ang1 = Math.atan2(dy1,dx1) / Math.PI * 180;
          var ang2 = Math.atan2(dy2,dx2) / Math.PI * 180;
          if (ang1 < 0) { ang1 += 360; }
          if (ang2 < 0) { ang2 += 360; }
          if (ang2 < ang1) { ang2 += 360; }
//console.log('dx1=',dx1);
//console.log('dy1=',dy1);
//console.log('dx2=',dx2);
//console.log('dy2=',dy2);
//console.log('ang1=',ang1);
//console.log('ang2=',ang2);
          var r = this.anglearcradius;
          var diameter = r+r;
          o.push(`draw subpath (${ang1/45},${ang2/45}) of fullcircle scaled(u) scaled(${diameter}) shifted(${x}*u,${y}*u);`);
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
        case 'label': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var x = z0[0];
          var y = z0[1];
          var label = this.parser.unmask(this.label);
          if (this.fontsize) {
            label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
          } 
          o.push(`label (btex {${label}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelright': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var x = z0[0];
          var y = z0[1];
          var label = this.parser.unmask(this.label);
          if (this.fontsize) {
            label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
          } 
          o.push(`label.rt (btex {${label}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelleft': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var x = z0[0];
          var y = z0[1];
          var label = this.parser.unmask(this.label);
          if (this.fontsize) {
            label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
          } 
          o.push(`label.lft (btex {${label}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labeltop': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var x = z0[0];
          var y = z0[1];
          var label = this.parser.unmask(this.label);
          if (this.fontsize) {
            label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
          } 
          o.push(`label.top (btex {${label}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelbot': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var x = z0[0];
          var y = z0[1];
          var label = this.parser.unmask(this.label);
          if (this.fontsize) {
            label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
          } 
          o.push(`label.bot (btex {${label}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labeltopleft': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var x = z0[0];
          var y = z0[1];
          var label = this.parser.unmask(this.label);
          if (this.fontsize) {
            label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
          } 
          o.push(`label.ulft (btex {${label}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labeltopright': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var x = z0[0];
          var y = z0[1];
          var label = this.parser.unmask(this.label);
          if (this.fontsize) {
            label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
          } 
          o.push(`label.urt (btex {${label}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelbotleft': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var x = z0[0];
          var y = z0[1];
          var label = this.parser.unmask(this.label);
          if (this.fontsize) {
            label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
          } 
          o.push(`label.llft (btex {${label}} etex, (${x}*u,${y}*u));`);
          break;
        }
        case 'labelbotright': {
          this.fixCoords(p);
          var z0 = this.assertCoord(p,0);
          var x = z0[0];
          var y = z0[1];
          var label = this.parser.unmask(this.label);
          if (this.fontsize) {
            label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
          } 
          o.push(`label.lrt (btex {${label}} etex, (${x}*u,${y}*u));`);
          break;
        }
      }
    }
    o.push(`);`);
    o.push(`draw wheel scaled(ratio);`);

    ///now we need to add new items at the beginning
    /// these items needs to be constracted after all
    /// previous p's have been processed because it needs
    /// to be dependant on some of the command line options
    /// settings such as width and height.
    var ym = this.height;
    var xm = this.width;
    var a1=`pu := \\mpdim{\\linewidth}/${xm};`;
    var a2=`u := ${this.unit};`;
    var a3=`ratio := pu/u;`;
    var a4=`picture wheel;`;
    var a5=`wheel := image(`;
    var a6=`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`;
    var a7=`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`;
    o.unshift(a1,a2,a3,a4,a5,a6,a7);
    return o.join('\n');
  }

  initP () {
    var p = {};
    p.command = '';
    p.coords = [];
    p.text = '';
    p.line = '';
    p.prop = ['',''];
    return p;
  }

  getNextCoord (p,line) {
 
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

  getProp (p,line) {
 
    var v;
    if ((v = this.re_prop.exec(line)) !== null) {
      var prop = v[1];
      line = line.slice(v[0].length);
      line = line.trimLeft();
      p.prop = [prop,line];
      return [p,line,true];
    } 
    return [p,line,false];
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

  assertCoord (p, i) {
    ///Fetch a coord in this location, 
    /// and ensure it always returns a (0,0) when it does not exist
    var c = p.coords[i];
    if (!c) {
      return [0,0];
    }
    return c;  
  }

  assertInt (val,min,max) {
    val = parseInt(val);
    if( val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }
  
  assertFloat (val,min,max) {
    val = parseFloat(val);
    if( val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }
  
}
module.exports = { NitrilePreviewDiagram };
