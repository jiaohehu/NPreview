'use babel';

const N_Max_Array = 400;
class NitrilePreviewDiagram {

  constructor (parser) {
    this.parser = parser;
    /// regular expression
    this.re_word = /\w+/;
    this.re_commentline = /^\%/;
    this.re_assignment  = /^(\w+)\s*\:\=\s*(.*)$/;
    this.re_command = /^(\w+)\s*(.*)$/;
    this.re_missing_x = /^\(\s*,\s*([\d\.\-\+]+)\s*\)/;
    this.re_missing_y = /^\(\s*([\d\.\-\+]+)\s*,\s*\)/;
    this.re_offset = /^\s*\<\s*([\d\.\-\+]*)\s*,\s*([\d\.\-\+]*)\s*\>/;
    this.re_coord2 = /^\s*\(\s*([\d\.\-\+]+)\s*,\s*([\d\.\-\+]+)\s*\)/;
    this.re_coord1 = /^\s*\(\s*([\d\.\-\+]+)\s*\)/;
    this.re_coord0 = /^\s*([\d\.\-\+]+)/;
    this.re_prop = /^\s*(\w+)\s*(.*)$/;
    this.re_func = /^\s*\$(\w+)\((.*)\)\s*/;
    this.re_var = /^\s*(\w+)\s*/;
    this.re_drawtext = /^\s*(.*)\{(.*)\}\s*/;
    this.re_text = /\s*\{(.*)\}\s*(.*)$/;
    ///following is a map storing all the symbols
    this.variables = {};
    ///following stores the last array of coords
    /// note that each time an new array must be created
    /// because there might be existing symbols pointing at it
    this.lastcoords = null;
    ///Following is a list of shapes. Each shape is also a list of points,
    /// just like a coords.
    this.shapes = {};
    /// following are command options for drawing
    this.width = 25;  // the total number of grid units of the width
    this.height = 10; // the total number of grid units of the height
    this.unit = '4mm';  // the length each grid unit entails
    this.refx = 0;
    this.refy = 0;
    this.refsx = 1;
    this.refsy = 1;
    this.fontsize = '';
    this.slant = 0.3;
    this.anglearcradius = 0.5;
    this.text = '';
    this.align = '';
    this.linecolor = '';
    this.dotcolor = '';
    this.dotsize = '';
    ///This is to create build-in shapes, each shape must draw within a bounding
    ///box of 1x1. It consists of a series of drawing command, with each command
    ///either draw(0)/fill(1)/filldraw(2) a path expression.
    var shape = [];
    shape.push(['fill', '0.5white', [0,0], [1,0], [1,0.5], [0,0.5], []]);
    shape.push(['draw', '',         [0,0], [1,0], [1,0.5], [0,0.5], []]);
    this.shapes['brick'] = shape;
    shape = [];
    shape.push(['draw','',[4,0],[0,0],[0,-2],[-0.25,-1.5],[-0.5,-1.75]]); ///<-0.25,0.50> <-0.25,-0.25>
    this.shapes['radical4'] = shape;
  }

  toMetaPost (para) {
    var p = null;
    var line = null;
    var o = [];
    var v = null;
    for (line of para) {
      var coords = [];
      if ((v = this.re_commentline.exec(line)) !== null) {
        continue;
      }
      if ((v = this.re_command.exec(line)) !== null) {
        var command = v[1];
        var line = v[2];

        switch (command) {
          case 'set': {
            if ((v = this.re_prop.exec(line)) !== null) {
              var key = v[1];
              var val = v[2];
              if (key === 'width'   )  { this.width = this.assertInt(val,10,100); } ///such as 25   
              if (key === 'height'  )  { this.height = this.assertInt(val,4,100); } ///such as 10   
              if (key === 'unit'    )  { this.unit = val; }/// such as '4mm'  
              if (key === 'refx'    )  { 
                ///
                /// /3 - from left
                /// 3/ - from right
                ///
                if (val[0] === '/') { /// '/3'
                  val = val.slice(1);
                  val = this.assertFloat(val,0,this.width); 
                } else if (val[val.length-1] === '/') { /// '3/'
                  val = val.slice(0,val.length-1);
                  val = this.width - this.assertFloat(val,0,this.width); 
                } else {
                  val = this.assertFloat(val,0,this.width); 
                }
                this.refx = val;
              } ///such as 12.5
              if (key === 'refy'    )  { 
                ///
                /// /3 - from top
                /// 3/ - from bottom
                ///
                ///if it is "/3" then it specifies a distance from the top side of the diagram
                if (val[0] === '/') { /// '/3'
                  val = val.slice(1);
                  val = this.height - this.assertFloat(val,0,this.height); 
                } else if (val[val.length-1] === '/') { /// '3/'
                  val = val.slice(0,val.length-1);
                  val = this.assertFloat(val,0,this.height); 
                } else {
                  val = this.assertFloat(val,0,this.height); 
                }
                this.refy = val;
              } ///such as 12.5
              if (key === 'refsx'   )  { this.refsx = this.assertFloat(val,0.1,10); } ///such as 1.5
              if (key === 'refsy'   )  { this.refsy = this.assertFloat(val,0.1,10); } ///such as 1.5
              if (key === 'fontsize')  { this.fontsize = val; }/// such as '14pt'
              if (key === 'slant'   )  { this.slant = this.this.assertFloat(val,0.1,0.9); } 
              if (key === 'anglearcradius' ) { this.anglearcradius = this.assertFloat(val,0.1,1); } ///such as '0.5'
              if (key === 'text'      ){ this.text = val; } ///such as 'Points'
              if (key === 'align'     ){ this.align = val; } ///such as 'lft'
              if (key === 'linecolor' ){ this.linecolor = val; } ///such as 'red'
              if (key === 'linewidth' ){ this.linewidth = val; } ///such as '4pt'
              if (key === 'dotcolor'  ){ this.dotcolor = val; } ///such as 'red'
              if (key === 'dotsize'   ){ this.dotsize = val; } ///such as '4pt' or '4mm'
              if (key === 'curve'     ){ this.curve   = val; } ///such as 'up' or 'down'
              if (key === 'arrow'     ){ this.arrow   = val; } ///such as 'arrow' or 'dblarrow'
            }
            break;
          }
          case 'save': {
            var symbols = line.split(' ');
            var symbol;
            for (symbol of symbols) {
              symbol = symbol.trim();
              if (this.re_word.test(symbol)) {
                this.variables[symbol] = this.lastcoords;
              }
            }
            break;
          }
          case 'drawarrow': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
            o.push(`drawarrow ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u));`);
            break;
          }
          case 'drawdblarrow': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
            o.push(`drawdblarrow ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u));`);
            break;
          }
          case 'drawtriangle': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
            var z2 = this.getCoordAt(coords,2);
            o.push(`draw ((${z0[0]}*u,${z0[1]}*u) -- (${z1[0]}*u,${z1[1]}*u) -- (${z2[0]}*u,${z2[1]}*u) -- cycle);`);
            break;
          }
          case 'drawrect': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
            var w  = z1[0]-z0[0];
            var h  = z1[1]-z0[1];
            var x = z0[0];
            var y = z0[1];
            o.push(`draw unitsquare scaled(u) xscaled(${w}) yscaled(${h}) shifted(${x}*u,${y}*u);`);
            break;
          }
          case 'drawparallelgram': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
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
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
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
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
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
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
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
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
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
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
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
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var z1 = this.getCoordAt(coords,1);
            var z2 = this.getCoordAt(coords,2);
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
          case 'drawdot': {
            var coords = this.parseCoordsLine(line);
            var z0;
            var i;
            var ss = [];
            if (this.dotsize) {
              ss.push(`scaled ${this.dotsize}`);
            } else {
              ss.push(`scaled 4pt`);
            }
            if (this.dotcolor) {
              ss.push(`withcolor ${this.dotcolor}`)
            } 
            for (i in coords) {
              z0 = this.getCoordAt(coords,i);
              var x = z0[0];
              var y = z0[1];
              o.push(`drawdot (${x}*u,${y}*u) withpen pencircle ${ss.join(' ')};`);
            }
            break;
          }
          case 'drawline': {
            var coords = this.parseCoordsLine(line);
            var z0;
            var x;
            var y;
            var i;
            var ss = [];
            var gg = [];
            var aa = '';
            var cc = '--';
            if (this.arrow == 'dblarrow') {
              aa = 'drawdblarrow';
            } else if (this.arrow == 'arrow') {
              aa = 'drawarrow';
            } else {
              aa = 'draw';
            }
            if (this.linewidth) {
              ss.push(` withpen pencircle scaled ${this.linewidth}`)
            } 
            if (this.linecolor) {
              ss.push(` withcolor ${this.linecolor}`)
            } 
            for (i=0; i < coords.length; i++) {
              z0 = this.getCoordAt(coords,i);
              x = z0[0];
              y = z0[1];
              gg.push(`(${x}*u,${y}*u)`);
            }
            if (this.curve) {
              var g = gg.shift();
              g = `${g}{${this.curve}}`;
              gg.unshift(g);
              cc = '..';
            }
            o.push(`${aa} (${gg.join(cc)})${ss.join('')};`);
            break;
          }
          case 'drawvdot': {
            var coords = this.parseCoordsLine(line);
            var z0;
            var i;
            for (i in coords) {
              z0 = this.getCoordAt(coords,i);
              var x = z0[0];
              var y = z0[1];
              o.push(`draw (${x}*u,${y+0.5}*u) -- (${x}*u,${y-0.5}*u) withpen pencircle scaled 1pt;`);
            }
            break;
          }
          case 'drawlvdot': {
            var coords = this.parseCoordsLine(line);
            var z0;
            var i;
            for (i in coords) {
              z0 = this.getCoordAt(coords,i);
              var x = z0[0];
              var y = z0[1];
              o.push(`draw (${x}*u,${y}*u) -- (${x}*u,${y-0.5}*u) withpen pencircle scaled 1pt;`);
            }
            break;
          }
          case 'drawuvdot': {
            var coords = this.parseCoordsLine(line);
            var z0;
            var i;
            for (i in coords) {
              z0 = this.getCoordAt(coords,i);
              var x = z0[0];
              var y = z0[1];
              o.push(`draw (${x}*u,${y}*u) -- (${x}*u,${y+0.5}*u) withpen pencircle scaled 1pt;`);
            }
            break;
          }
          case 'drawhdot': {
            var coords = this.parseCoordsLine(line);
            var z0;
            var i;
            for (i in coords) {
              z0 = this.getCoordAt(coords,i);
              var x = z0[0];
              var y = z0[1];
              o.push(`draw (${x-0.5}*u,${y}*u) -- (${x+0.5}*u,${y}*u) withpen pencircle scaled 1pt;`);
            }
            break;
          }
          case 'drawshape': {
            /// draw shape is to draw a desired shape at the given location.
            /// the name of the shape is stored with the 'text' property
            var coords = this.parseCoordsLine(line);
            var text0 = '';
            var text = '';
            var align = '';
            var texts = this.text.split('\\\\');
            var aligns = this.align.split('\\\\');
            for (i in coords) {
              z0 = this.getCoordAt(coords,i);
              var x = z0[0];
              var y = z0[1];
              if (texts[i] && texts[i].trim()) {
                text = texts[i].trim();
              }
              if (aligns[i] && aligns[i].trim()) {
                align = aligns[i].trim();
              }
              if (!this.shapes.hasOwnProperty(text)) {
                text = 'brick';///this entry has to exist!!!
              }
              var shape = this.shapes[text];
              for (var pp of shape) {
                /// for each shape path, the first is draw/fill
                /// and the second is the filled color, if any
                var s = [];
                var cmd = pp[0];
                var withcolor = '';
                if (pp[1]) {
                  withcolor = `withcolor ${pp[1]}`;
                } 
                for (var i=2; i < pp.length; ++i) {
                  var p = pp[i];
                  if (!p || p.length < 2) {
                    s.push('cycle');
                    break;
                  } else {
                    s.push(`(${p[0]}*u,${p[1]}*u)`);
                  }
                }
                o.push(`${cmd} (${s.join('--')})  shifted (${x}*u,${y}*u) ${withcolor};`);
              }
            }
            break;
          }
          case 'drawtext': {
            var coords = this.parseCoordsLine(line);
            var z0;
            var i;
            var text = 'text';
            var align = '';
            var texts = this.text.split('\\\\');
            var aligns = this.align.split('\\\\');
            for (i in coords) {
              z0 = this.getCoordAt(coords,i);
              var x = z0[0];
              var y = z0[1];
              if (texts[i] && texts[i].trim()) {
                text = texts[i].trim();
              }
              if (aligns[i] && aligns[i].trim()) {
                align = aligns[i].trim();
              }
              var cmd = 'label';
              if (align && this.isValidAlign(align)) {
                cmd = `label.${align}`;
              }
              var textext = this.parser.unmask(text);
              if (this.fontsize) {
                textext = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${textext}`;
              } 
              o.push(`${cmd} (btex {${textext}} etex, (${x}*u,${y}*u));`);
            }
            break;
          }
          case 'label': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var x = z0[0];
            var y = z0[1];
            var label = this.parser.unmask(this.text);
            if (!label) { label = 'unassigned'; }
            if (this.fontsize) {
              label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
            } 
            o.push(`label (btex {${label}} etex, (${x}*u,${y}*u));`);
            break;
          }
          case 'labelright': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var x = z0[0];
            var y = z0[1];
            var label = this.parser.unmask(this.text);
            if (!label) { label = 'unassigned'; }
            if (this.fontsize) {
              label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
            } 
            o.push(`label.rt (btex {${label}} etex, (${x}*u,${y}*u));`);
            break;
          }
          case 'labelleft': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var x = z0[0];
            var y = z0[1];
            var label = this.parser.unmask(this.text);
            if (!label) { label = 'unassigned'; }
            if (this.fontsize) {
              label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
            } 
            o.push(`label.lft (btex {${label}} etex, (${x}*u,${y}*u));`);
            break;
          }
          case 'labeltop': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var x = z0[0];
            var y = z0[1];
            var label = this.parser.unmask(this.text);
            if (!label) { label = 'unassigned'; }
            if (this.fontsize) {
              label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
            } 
            o.push(`label.top (btex {${label}} etex, (${x}*u,${y}*u));`);
            break;
          }
          case 'labelbot': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var x = z0[0];
            var y = z0[1];
            var label = this.parser.unmask(this.text);
            if (!label) { label = 'unassigned'; }
            if (this.fontsize) {
              label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
            } 
            o.push(`label.bot (btex {${label}} etex, (${x}*u,${y}*u));`);
            break;
          }
          case 'labeltopleft': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var x = z0[0];
            var y = z0[1];
            var label = this.parser.unmask(this.text);
            if (!label) { label = 'unassigned'; }
            if (this.fontsize) {
              label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
            } 
            o.push(`label.ulft (btex {${label}} etex, (${x}*u,${y}*u));`);
            break;
          }
          case 'labeltopright': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var x = z0[0];
            var y = z0[1];
            var label = this.parser.unmask(this.text);
            if (!label) { label = 'unassigned'; }
            if (this.fontsize) {
              label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
            } 
            o.push(`label.urt (btex {${label}} etex, (${x}*u,${y}*u));`);
            break;
          }
          case 'labelbotleft': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var x = z0[0];
            var y = z0[1];
            var label = this.parser.unmask(this.text);
            if (!label) { label = 'unassigned'; }
            if (this.fontsize) {
              label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
            } 
            o.push(`label.llft (btex {${label}} etex, (${x}*u,${y}*u));`);
            break;
          }
          case 'labelbotright': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            var x = z0[0];
            var y = z0[1];
            var label = this.parser.unmask(this.text);
            if (!label) { label = 'unassigned'; }
            if (this.fontsize) {
              label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${label}`;
            } 
            o.push(`label.lrt (btex {${label}} etex, (${x}*u,${y}*u));`);
            break;
          }
        }

        /// save the previous p so that we can find out the last
        /// set of coordinates
        if (coords.length) {
          this.lastcoords = coords;
        }
        continue;
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

  getCoordAt (coords, i) {
    /// this function is to compute the coord
    /// at global coord
    var t = coords[i];
    if (!t) {
      t = [0,0];
    }
    ///***important: must return a new array
    ///   because we want to leave the original
    ///   coords var that is declared in toMetaPost
    ///   intact as each of it might be saved to a 
    ///   variable, its original value must be kept.
    var x = parseFloat(t[0]);
    var y = parseFloat(t[1]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      x *= this.refsx;
      y *= this.refsy;
      x += this.refx;
      y += this.refy;
      return [x,y];
    } else {
      return [0,0];
    }
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
    if (Number.isFinite(val)) {
    } else {
      val = 0;
    }
    if( val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }

  fetchVariable (a) {

    /// if it is null then we return an empty path
    if (!a) {
      return [];
    }

    if (this.variables.hasOwnProperty(a)) {
      return this.variables[a];
    }
    /// 'all' 
    if (a === 'all') {
      if (this.lastcoords.length) {
        return this.lastcoords;
      }
      return [];
    }
    /// 'last' 
    if (a === 'last') {
      if (this.lastcoords.length) {
        return [this.lastcoords[this.lastcoords.length-1]];
      }
      return [];
    }
    /// 'first' 
    if (a === 'first') {
      if (this.lastcoords.length) {
        return [this.lastcoords[0]];
      }
      return [];
    }
    /// 'second' 
    if (a === 'second') {
      if (this.lastcoords.length >= 2) {
        return [this.lastcoords[1]];
      }
      return [];
    }
    /// 'third' 
    if (a === 'third') {
      if (this.lastcoords.length >= 3) {
        return [this.lastcoords[2]];
      }
      return [];
    }
    /// 'forth' 
    if (a === 'forth') {
      if (this.lastcoords.length >= 4) {
        return [this.lastcoords[3]];
      }
      return [];
    }
    /// 'fifth' 
    if (a === 'fifth') {
      if (this.lastcoords.length >= 5) {
        return [this.lastcoords[4]];
      }
      return [];
    }
    /// 'ogigin'
    if (a === 'origin') {
      return [[0,0]];
    }

    return [];
  }
  
  execFunction (fun_str,arg_str) {

    var args = arg_str.split(',');
    args = args.map(x => x.trim());
    switch (fun_str) {

      case 'midpoint':

        var coords = this.fetchVariable(args[0]);
        var z0 = coords[0];
        var z1 = coords[1];
        if (z0 && z1) {
          var z0x = parseFloat(z0[0]);
          var z0y = parseFloat(z0[1]);
          var z1x = parseFloat(z1[0]);
          var z1y = parseFloat(z1[1]);
          var midx = (z0x + z1x)*0.5;
          var midy = (z0y + z1y)*0.5;
          var ret_val = [];
          ret_val.push([midx,midy]);
          return ret_val;/// always returns a single point in the coords
        }
        break;

      case 'somepoint':

        if (args.length == 2) {
          var a = args[0];
          var b = args[1];
          if (!this.variables.hasOwnProperty(a)) {
            break;
          }
          var coords = this.variables[a];
          var fraction = parseFloat(args[1]);
          if (!Number.isFinite(fraction)) {
            break;
          }
          var z0 = coords[0];
          var z1 = coords[1];
          if (!z0 || !z1) {
            break;
          }
          var z0x = parseFloat(z0[0]);
          var z0y = parseFloat(z0[1]);
          var z1x = parseFloat(z1[0]);
          var z1y = parseFloat(z1[1]);
          var ptx = z0x + (z1x - z0x)*fraction;
          var pty = z0y + (z1y - z0y)*fraction;
          var ret_val = [];
          ret_val.push([ptx ,pty ]);
          return ret_val;/// always returns a single point in the coords    
        }
        break;

      case 'scatterpoints':

        var sx = parseFloat(args[0]);
        var sy = parseFloat(args[1]);
        var tx = parseFloat(args[2]);
        var ty = parseFloat(args[3]);
        var n = parseFloat(args[4]);
        if (Number.isFinite(sx) &&
            Number.isFinite(sy) &&
            Number.isFinite(tx) &&
            Number.isFinite(ty) &&
            Number.isFinite(n) ) {
         
          if (n > N_Max_Array) {
            n = N_Max_Array;
          }
          var p = [];
          var pt = [sx,sy];
          var dx = tx - sx;
          var dy = ty - sy;
          p.push(pt);
          for (let i=1; i < n; i++) {
            var frac = i/(n-1);
            p.push([sx+frac*dx,sy+frac*dy]);
          }
          return p;
        }
        break;

      case 'shiftpoints':

        /// shiftpoints(a,0,-2) 
        /// shiftpoints(a,2,-1) 

        var coords = this.fetchVariable(args[0]);
        var dx = parseFloat(args[1]);
        var dy = parseFloat(args[2]);
        if (coords &&
            Number.isFinite(dx) &&
            Number.isFinite(dy) ) {
         
          var p = [];
          for (let i=0; i < coords.length; i++) {
            var pt = coords[i];
            var x = pt[0] + dx;
            var y = pt[1] + dy;
            p.push([x,y]);
          }
          return p;
        }
        break;

      case 'onepoint':

        /// onepoint(a,0) 
        /// onepoint(a,2) 

        var coords = this.fetchVariable(args[0]);
        var k  = parseFloat(args[1]);
        if (coords &&
            Number.isFinite(k) ) {
         
          var p = [];
          if (k < coords.length) {
            p.push(coords[k]);
          }
          return p;
        }
        break;

      case 'somepoints':

        /// somepoints(a,0,2) 
        /// somepoints(a,3,5) 
        /// somepoints(a,3) 

        var coords = this.fetchVariable(args[0]);
        var j   = parseFloat(args[1]);
        var k   = parseFloat(args[2]);
        if (coords &&
            Number.isFinite(j) &&
            Number.isFinite(k) ) {
         
          var p = [];
          var i;
          if (k >= j) {
            for (i=j; i <= k && i >= 0 && i < coords.length; ++i) {
              p.push(coords[i]);
            }
          } else {
            for (i=j; i >= k && i >= 0 && i < coords.length; --i) {
              p.push(coords[i]);
            }
          }
          return p;
        }
        if (coords &&
            Number.isFinite(j) ) {
          var p = [];
          if (j >= 0 && j < coords.length) {
            p.push(coords[j]);
          }
          return p;
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

  parseCoordsLine (line) {

    /// $midpoint(a)
    /// $somepoint(a,0.2)
    /// a              
    /// b              
    /// last           
    /// (1,2) (3,4) (5,6) ...
    /// (1,2) (3) (4) ...
    /// (1,2) 3 (4,5) ...
    /// (1,2) 3 (4,5) ...
    /// (1,2) 3 <4,5> (9,10) ...

    /// Also if the line starts with a left curly bracket, then 
    /// we will scan for text.
    /// drawshape { brick } (0,0) (0,1) ...

    /// Note that the entire line is going to be
    /// either a function, a variable, or a
    /// list of coordinates. 
    
    /// ***IMPORTANT***: 
    /// If a function is detected, then the entire
    /// line is assumed to be of only that function;
    /// if a variable is detected, then the entire line
    /// if of that variable; if a list of numbers (with parenthesized
    /// pairs, then the entire line will be scanned for all literal
    /// points until something non-number is detected and then the scan
    /// stops.

    /// not that for the literal number input, each individual
    /// coordinate is considered to be either in pairs, in which case
    /// the parentheses must be detected. Of within the parenthesis
    /// only a single number is detected and there is no comma, then
    /// only the x/coordinate will be initialized to this number,
    /// and the y/coordinate will be reset to zero. If a number without
    /// parenthesis is detected then only the x-coordinate will be set
    /// that number, and the its y/coordinate is left to zero.

    var lastpt = [0,0];

    if (this.re_text.test(line)) {
      var v = this.re_text.exec(line);
      this.text = v[1];
      line = v[2];
    }

    if (this.re_func.test(line)) {
      var v = this.re_func.exec(line);

      /// $midpoint(a)
      /// $somepoint(a,0.2)
      /// $scatterpoints(0,0,0.5,0,10)

      return this.execFunction(v[1],v[2]);

    } else if (this.re_var.test(line)) {
      var v = this.re_var.exec(line);

      /// a              
      /// b              
      /// last           

      var a = v[1];
      return this.fetchVariable(a);

    } else {

      /// (1,2) (3,4) (5,6) ...
      /// (1,2) (3) (4) ...
      /// (1,2) 3 (4,5) ...

      var coords = [];
      while (line.length) {

        var v;
        if ((v = this.re_missing_x.exec(line)) !== null) {
          var x = lastpt[0];
          var y = parseFloat(v[1]);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            coords.push([x,y]);
            lastpt[1] = y;
          }
          line = line.slice(v[0].length);
          line = line.trimLeft();
        } else if ((v = this.re_missing_y.exec(line)) !== null) {
          var y = lastpt[1];
          var x = parseFloat(v[1]);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            coords.push([x,y]);
            lastpt[0] = x;
          }
          line = line.slice(v[0].length);
          line = line.trimLeft();
        } else if ((v = this.re_offset.exec(line)) !== null) {
          /// <1,2>, or <1,>, or <,2>
          var dx = parseFloat(v[1]);
          var dy = parseFloat(v[2]);
          if (!Number.isFinite(dx)) { dx = 0; }
          if (!Number.isFinite(dy)) { dy = 0; }
          var x = lastpt[0] + dx;          
          var y = lastpt[1] + dy;          
          line = line.slice(v[0].length);
          line = line.trimLeft();
          lastpt[0] = x; 
          lastpt[1] = y; 
          coords.push([x,y]);
        } else if ((v = this.re_coord2.exec(line)) !== null) {
          /// (1, 2)
          var x = parseFloat(v[1]);
          var y = parseFloat(v[2]);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            coords.push([x,y]);
            lastpt[0] = x;
            lastpt[1] = y;
          }
          line = line.slice(v[0].length);
          line = line.trimLeft();
        } else if ((v = this.re_coord1.exec(line)) !== null) {
          /// (1)
          var x = parseFloat(v[1]);
          var y = 0;
          if (Number.isFinite(x) && Number.isFinite(y)) {
            coords.push([x,y]);
            lastpt[0] = x;
            lastpt[1] = y;
          }
          line = line.slice(v[0].length);
          line = line.trimLeft();
        } else if ((v = this.re_coord0.exec(line)) !== null) {
          /// 1
          var x = parseFloat(v[1]);
          var y = 0;
          if (Number.isFinite(x) && Number.isFinite(y)) {
            coords.push([x,y]);
            lastpt[0] = x;
            lastpt[1] = y;
          }
          line = line.slice(v[0].length);
          line = line.trimLeft();
        } else {
          /// blah
          break;
        }
      }

      return coords;
    }
  }

  isValidAlign (str) {

    if (str.localeCompare('lft') == 0 || 
        str.localeCompare('rt') == 0 || 
        str.localeCompare('top') == 0 || 
        str.localeCompare('bot') == 0 || 
        str.localeCompare('ulft') == 0 || 
        str.localeCompare('urt') == 0 || 
        str.localeCompare('llft') == 0 || 
        str.localeCompare('lrt') == 0 ) {
      return true;
    }
    return false;
  }

}
module.exports = { NitrilePreviewDiagram };
