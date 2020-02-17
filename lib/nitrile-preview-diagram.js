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
    this.re_saveas = /^\s*(\w+)\s*/;
    this.re_func = /^\s*\$(\w+)\((\S*)\)\s*/;
    ///following is a map storing all the symbols
    this.variables = {};
    ///following stores the last array of coords
    /// note that each time an new array must be created
    /// because there might be existing symbols pointing at it
    this.lastp = null;
    /// following are command options for drawing
    this.width = 25;  // the total number of grid units of the width
    this.height = 10; // the total number of grid units of the height
    this.unit = '4mm';  // the length each grid unit entails
    this.refx = 0;
    this.refy = 0;
    this.refscalarx = 1;
    this.refscalary = 1;
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
       
      case 'saveas': 
        [p,line] = this.getSaveas(p,line);
        break;
       
      default:
        var flag = true;
        while (flag) {
          [p,line,flag] = this.readNextCoord(p,line);
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
          if (key === 'width'   )  { this.width = this.assertInt(val,10,100); } ///such as 25   
          if (key === 'height'  )  { this.height = this.assertInt(val,4,100); } ///such as 10   
          if (key === 'unit'    )  { this.unit = val; }/// such as '4mm'  
          if (key === 'refx'    )  { this.refx = this.assertFloat(val,0,this.width); } ///such as 12.5
          if (key === 'refy'    )  { this.refy = this.assertFloat(val,0,this.height); } ///such as 12.5
          if (key === 'refscalar') { this.refscalarx = this.assertFloat(val,0.1,10); this.refscalary = this.refscalarx; } ///such as 1.5
          if (key === 'refscalarx'){ this.refscalarx = this.assertFloat(val,0.1,10); } ///such as 1.5
          if (key === 'refscalary'){ this.refscalary = this.assertFloat(val,0.1,10); } ///such as 1.5
          if (key === 'fontsize')  { this.fontsize = val; }/// such as '14pt'
          if (key === 'slant'   )  { this.slant = this.this.assertFloat(val,0.1,0.9); } 
          if (key === 'anglearcradius' ) { this.anglearcradius = this.assertFloat(val,0.1,1); } ///such as '0.5'
          if (key === 'label'   )  { this.label = val; } ///such as 'Points'
          break;
        }
        case 'saveas': {
          var symbol;
          for (symbol of p.symbols) {
 console.log('saveas symbol=',symbol,'this.lastp.coords=',this.lastp.coords);
            this.variables[symbol] = this.lastp.coords;
          }
          break;
        }
        case 'drawarrow': {
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
          o.push(`drawarrow ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u));`);
          break;
        }
        case 'drawdblarrow': {
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
          o.push(`drawdblarrow ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u));`);
          break;
        }
        case 'drawtriangle': {
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
          var z2 = this.getCoordAt(p,2);
          o.push(`draw ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u) -- (${z2[0]}*u,${z2[1]}*u) -- cycle);`);
          break;
        }
        case 'drawrect': {
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
          var w  = z1[0]-z0[0];
          var h  = z1[1]-z0[1];
          var x = z0[0];
          var y = z0[1];
          o.push(`draw unitsquare scaled(u) xscaled(${w}) yscaled(${h}) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawparallelgram': {
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
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
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
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
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
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
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
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
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
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
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
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
          var z0 = this.getCoordAt(p,0);
          var z1 = this.getCoordAt(p,1);
          var z2 = this.getCoordAt(p,2);
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
          var r = this.anglearcradius;
          var diameter = r+r;
          o.push(`draw subpath (${ang1/45},${ang2/45}) of fullcircle scaled(u) scaled(${diameter}) shifted(${x}*u,${y}*u);`);
          break;
        }
        case 'drawline': {
          var z0;
          var segs = [];
          var i;
          for (i in p.coords) {
            z0 = this.getCoordAt(p,i);
            var x = z0[0];
            var y = z0[1];
            segs.push(`(${x}*u,${y}*u)`);
          }
          o.push(`draw (${segs.join('--')});`);
          break;
        }
        case 'drawdot': {
          var z0;
          var i;
          for (i in p.coords) {
            z0 = this.getCoordAt(p,i);
            var x = z0[0];
            var y = z0[1];
            o.push(`drawdot (${x}*u,${y}*u) withpen pencircle scaled 4pt;`);
          }
          break;
        }
        case 'label': {
          var z0 = this.getCoordAt(p,0);
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
          var z0 = this.getCoordAt(p,0);
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
          var z0 = this.getCoordAt(p,0);
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
          var z0 = this.getCoordAt(p,0);
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
          var z0 = this.getCoordAt(p,0);
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
          var z0 = this.getCoordAt(p,0);
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
          var z0 = this.getCoordAt(p,0);
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
          var z0 = this.getCoordAt(p,0);
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
          var z0 = this.getCoordAt(p,0);
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
      /// save the previous p so that we can find out the last
      /// set of coordinates
      this.lastp = p;
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
    p.symbols = [];
    return p;
  }

  readNextCoord (p,line) {
 
    var v;
    if ((v = this.re_func.exec(line)) !== null) {
      p.coords.push(v[0]);
      line = line.slice(v[0].length);
      line = line.trimLeft();
      return [p,line,true];
    } else if ((v = this.re_coord2.exec(line)) !== null) {
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

  getSaveas (p,line) {
 
    var v;
    while ((v = this.re_saveas.exec(line)) !== null) {
      var symbol = v[1];
      line = line.slice(v[0].length);
      line = line.trimLeft();
      p.symbols.push(symbol);
    } 
    return [p,line];
  }

  fixRef (t) {
    if (this.re_func.test(t)) {
      var v = this.re_func.exec(t);
      var coords = this.execFunc(v[1],v[2]);
      if (coords.length) {
        t = coords[0];
      } else {
        t = [0,0];
      }
    }
    ///***important: must return a new array
    var x = parseFloat(t[0]);
    var y = parseFloat(t[1]);
    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      x *= this.refscalarx;
      y *= this.refscalary;
      x += this.refx;
      y += this.refy;
      return [x,y];
    } else {
      return [0,0];
    }
  }

  getCoordAt (p, i) {
    var t = p.coords[i];
    if (!t) {
      t = [0,0];
    }
    return this.fixRef(t); 
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
  
  execFunc (fun_str,arg_str) {
    var ret_val = [];
    switch (fun_str) {
      case 'midpoint':
        if (this.variables.hasOwnProperty(arg_str)) {
          var coords = this.variables[arg_str];
          var z0 = coords[0];
          var z1 = coords[1];
          if (z0 && z1) {
            var z0x = parseFloat(z0[0]);
            var z0y = parseFloat(z0[1]);
            var z1x = parseFloat(z1[0]);
            var z1y = parseFloat(z1[1]);
            var midx = (z0x + z1x)*0.5;
            var midy = (z0y + z1y)*0.5;
            ret_val.push([midx,midy]);
            return ret_val;
          }
        }
        break;
      default:
        break;
    }
    return [];
  }

  argsToCoords (args) {

    var pp = args.split(',');
    if (pp.length == 1) {
      var pp0 = pp[0];
      if (pp0[0] == '$') {
        pp0 = pp0.slice(1);
        if (this.variables.hasOwnProperty(pp0)) {
          return this.variables[pp0];
        }
      }
    }
    return [];
  }

}
module.exports = { NitrilePreviewDiagram };
