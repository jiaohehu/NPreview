'use babel';

const N_Max_Array = 400;
class NitrilePreviewDiagram {

  constructor (parser) {
    this.parser = parser;
    /// regular expression
    this.re_word = /\w+/;
    this.re_commentline = /^\%/;
    this.re_path_command  = /^(\w+)\s+\:\=\s+(.*)$/;
    this.re_set_command = /^set\s+(\w+)\s+(.*)$/;
    this.re_save_command = /^save\s+(.*)$/;
    this.re_showvar_command = /^showvar\s+(.*)$/;
    this.re_exit_command = /^exit/;
    this.re_label_command = /^label(\.\w+|)\s+(.*)$/;
    this.re_shape_command = /^shape(\.\w+|)\s+(.*)$/;
    this.re_stroke_command = /^stroke(\.\w+|)\s+(.*)$/;
    this.re_circle_command = /^circle(\.\w+|)\s+(.*)$/;
    this.re_rect_command = /^rect(\.\w+|)\s+(.*)$/;
    this.re_dot_command = /^dot(\.\w+|)\s+(.*)$/;
    this.re_tick_command = /^tick(\.\w+|)\s+(.*)$/;
    this.re_angle_command = /^angle(\.\w+|)\s+(.*)$/;
    this.re_draw_command = /^(\w+)\s*(.*)$/;
    this.re_dashdot = /^(\-{2,}|\.{2,})\s*(.*)$/;
    this.re_symbol_withopt = /^(\{[^\{\}]*?\}|)(\w+)(\{.*?\}|)\s*(.*)$/;
    this.re_coord_withopt =  /^(\{[^\{\}]*?\}|)\((.*?)\)(\{.*?\}|)\s*(.*)$/;
    this.re_coord = /^\((.*?)\)\s*(.*)$/;
    this.re_offset = /^\<(.*?)\>\s*(.*)$/;
    this.re_relative = /^\[(.*?)\]\s*(.*)$/;
    this.re_prop = /^\s*(\w+)\s*(.*)$/;
    this.re_func = /^\s*\$(\w+)\((.*)\)\s*/;
    this.re_label_arg = /\s*\{(.*)\}\s*(.*)$/;
    ///following is a map of my path, such as 'octant'
    this.mypath_list = [];
    ///following is a map storing all the symbols
    this.variables = {};
    ///following stores the last array of coords
    /// note that each time an new array must be created
    /// because there might be existing symbols pointing at it
    this.lastcoords = [];
    ///Following is a list of shapes. Each shape is also a list of points,
    /// just like a coords.
    this.shapes = {};
    /// following are command options for drawing
    this.def_width = this.width = 25;  // the total number of grid units of the width
    this.def_height = this.height = 10; // the total number of grid units of the height
    this.def_unit = this.unit = '4mm';  // the length each grid unit entails
    this.def_refx = this.refx = 0;
    this.def_refy = this.refy = 0;
    this.def_refsx = this.refsx = 1;
    this.def_refsy = this.refsy = 1;
    this.def_fontsize = this.fontsize = '';
    this.def_slant = this.slant = 0.3;
    this.def_linecolor = this.linecolor = '';
    this.def_linewidth = this.linewidth = '';
    this.def_fillcolor = this.fillcolor = '';
    this.def_dotcolor = this.dotcolor = '';
    this.def_dotsize = this.dotsize = '4pt';
    this.def_tickcolor = this.tickcolor = '';
    this.def_ticksize = this.ticksize = '1pt';
    this.def_ticklength = this.ticklength = 0.33;
    this.def_curve = this.curve = '';
    this.def_arrow = this.arrow = '';
    this.def_rectw = this.rectw = 3;
    this.def_recth = this.recth = 2;
    this.def_diameter = this.diameter = 1;
    this.def_angle1 = this.angle1 = 0;
    this.def_angle2 = this.angle2 = 45;
    this.def_side1 = this.side1 = 3;
    this.def_side2 = this.side2 = 3;
    this.def_filldraw = this.filldraw = 0x1;///draw only
    ///This is to create build-in shapes, each shape must draw within a bounding
    ///box of 1x1. It consists of a series of drawing command, with each command
    ///either draw(0)/fill(1)/filldraw(2) a path expression.
    var shape = [];
    ///*** brick    
    shape.push(['fill', '0.5white', [0,0,0], [1,0,0], [1,0.5,0], [0,0.5,0], []]);
    shape.push(['draw', '',         [0,0,0], [1,0,0], [1,0.5,0], [0,0.5,0], []]);
    this.shapes['brick'] = shape;
    ///*** radical4
    shape = []; /// radical4
    shape.push(['draw','',[4,0,0],[0,0,0],[0,-2,0],[-0.25,-1.5,0],[-0.5,-1.75]]); ///<-0.25,0.50> <-0.25,-0.25>
    this.shapes['radical4'] = shape;
    ///*** protractor7
    shape = []; /// protractor7
    shape.push(['draw','',[-3.5,0,0],[3.5,0,1],[0,3.5,1],[]]);
    shape.push(['draw','',[-2.5100, 0.8500,0],[2.5100, 0.8500,1],[0,2.65,1],[]]);
    shape.push(['draw','',[ 3.4468, 0.6078,0],[3.0529, 0.5383]]);                  
    shape.push(['draw','',[ 3.2889, 1.1971,0],[2.9130, 1.0603]]);                   
    shape.push(['draw','',[ 3.0311, 1.7500,0],[2.6847, 1.5500]]);                   
    shape.push(['draw','',[ 2.6812, 2.2498,0],[2.3747, 1.9926]]);                   
    shape.push(['draw','',[ 2.2498, 2.6812,0],[1.9926, 2.3747]]);                   
    shape.push(['draw','',[ 1.7500, 3.0311,0],[1.5500, 2.6847]]);                   
    shape.push(['draw','',[ 1.1971, 3.2889,0],[1.0603, 2.9130]]);                   
    shape.push(['draw','',[ 0.6078, 3.4468,0],[0.5383, 3.0529]]);                   
    shape.push(['draw','',[ 0.0000, 3.5000,0],[0.0000, 3.1000]]);                   
    shape.push(['draw','',[-3.4468, 0.6078,0],[-3.0529, 0.5383]]);                  
    shape.push(['draw','',[-3.2889, 1.1971,0],[-2.9130, 1.0603]]);                   
    shape.push(['draw','',[-3.0311, 1.7500,0],[-2.6847, 1.5500]]);                   
    shape.push(['draw','',[-2.6812, 2.2498,0],[-2.3747, 1.9926]]);                   
    shape.push(['draw','',[-2.2498, 2.6812,0],[-1.9926, 2.3747]]);                   
    shape.push(['draw','',[-1.7500, 3.0311,0],[-1.5500, 2.6847]]);                   
    shape.push(['draw','',[-1.1971, 3.2889,0],[-1.0603, 2.9130]]);                   
    shape.push(['draw','',[-0.6078, 3.4468,0],[-0.5383, 3.0529]]);                   
    shape.push(['draw','',[ 0.0000, 0.0000,0],[ 0.0000, 0.8500]]);                   
    shape.push(['drawdot','3pt',[ 0.0000, 0.0000]]);                   
    this.shapes['protractor7'] = shape;
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
      if ((v = this.re_path_command.exec(line)) !== null) {
        var symbol = v[1];
        line = v[2];
        var coords = this.parseCoordsLine(line);
        this.variables[symbol] = coords;
        o.push(`path ${symbol}; ${symbol} := ${this.coordsToString(coords)};`);
        continue;
      }
      if ((v = this.re_set_command.exec(line)) !== null) {
        var key = v[1];
        var val = v[2];
        if (key === 'width'   )  { this.width = this.assertInt(val,this.def_width,10,100); } ///such as 25   
        if (key === 'height'  )  { this.height = this.assertInt(val,this.def_height,4,100); } ///such as 10   
        if (key === 'unit'    )  { this.unit = this.toString(val,this.def_unit); }/// such as '4mm'  
        if (key === 'refx'    )  { 
          ///
          /// /3 - from left
          /// 3/ - from right
          ///
          if (val[0] === '/') { /// '/3'
            val = val.slice(1);
            val = this.assertFloat(val,this.def_refx,0,this.width); 
          } else if (val[val.length-1] === '/') { /// '3/'
            val = val.slice(0,val.length-1);
            val = this.width - this.assertFloat(val,this.def_refx,0,this.width); 
          } else {
            val = this.assertFloat(val,this.def_refx,0,this.width); 
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
            val = this.height - this.assertFloat(val,this.def_refy,0,this.height); 
          } else if (val[val.length-1] === '/') { /// '3/'
            val = val.slice(0,val.length-1);
            val = this.assertFloat(val,this.def_refy,0,this.height); 
          } else {
            val = this.assertFloat(val,this.def_refy,0,this.height); 
          }
          this.refy = val;
        } ///such as 12.5
        if (key === 'refsx'   )  { this.refsx = this.assertFloat(val,this.def_refsx,0.1,10); } ///such as 1.5
        if (key === 'refsy'   )  { this.refsy = this.assertFloat(val,this.def_refsy,0.1,10); } ///such as 1.5
        if (key === 'fontsize')  { this.fontsize = this.toString(val,this.def_fontsize); }/// such as '14pt'
        if (key === 'slant'   )  { this.slant = this.assertFloat(val,this.def_slant,0.1,0.9); } 
        if (key === 'linecolor' ){ this.linecolor = this.toString(val,this.def_linecolor); } ///such as 'red'
        if (key === 'linewidth' ){ this.linewidth = this.toString(val,this.def_linewidth); } ///such as '4pt'
        if (key === 'fillcolor' ){ this.fillcolor = this.toString(val,this.def_fillcolor); } ///such as 'red'
        if (key === 'dotcolor'  ){ this.dotcolor = this.toString(val,this.def_dotcolor);  } ///such as 'red'
        if (key === 'dotsize'   ){ this.dotsize = this.toString(val,this.def_dotsize); } ///such as '4pt' or '4mm'
        if (key === 'tickcolor' ){ this.tickcolor = this.toString(val,this.def_tickcolor);  } ///such as 'red'
        if (key === 'ticksize'  ){ this.ticksize = this.toString(val,this.def_ticksize); } ///such as '1pt' or '1mm'
        if (key === 'ticklength'){ this.ticklength = this.assertFloat(val,this.def_ticklength,0.1,1.0); } ///such as '0.33'
        if (key === 'curve'     ){ this.curve   = this.toString(val,this.def_curve);   } ///such as 'up' or 'down'
        if (key === 'arrow'     ){ this.arrow   = this.toString(val,this.def_arrow);   } ///such as 'arrow' or 'dblarrow'
        if (key === 'rectw'     ){ this.rectw   = this.assertFloat(val,this.def_rectw,-100,100);    } ///such as '12.5'
        if (key === 'recth'     ){ this.recth   = this.assertFloat(val,this.def_recth,-100,100);    } ///such as '12.5'
        if (key === 'diameter'  ){ this.diameter= this.toFloat(val,this.def_diameter); } ///such as '12.5'
        if (key === 'angle1'    ){ this.angle1  = this.assertFloat(val,this.def_angle1,0,360);   } ///such as '90'  
        if (key === 'angle2'    ){ this.angle2  = this.assertFloat(val,this.def_angle2,0,360);   } //suchas '180' 
        if (key === 'side1'     ){ this.side1   = this.toFloat(val,this.def_side1);    } ///such as '4'  
        if (key === 'side2'     ){ this.side2   = this.toFloat(val,this.def_side2);    } //suchas '3' 
        if (key === 'filldraw'  ){ this.filldraw= this.toFilldraw(val,this.def_filldraw); } //suchas 'filldraw' 
        continue;
      }
      if ((v = this.re_save_command.exec(line)) !== null) {
        var symbols = v[1];
        var symbols = symbols.split(' ');
        var symbol;
        for (symbol of symbols) {
          symbol = symbol.trim();
          if (this.re_word.test(symbol)) {
            this.variables[symbol] = this.lastcoords;
          }
        }
        continue;
      }
      if ((v = this.re_showvar_command.exec(line)) !== null) {
        var symbols = v[1];
        var symbols = symbols.split(' ');
        var symbol;
        for (symbol of symbols) {
          symbol = symbol.trim();
          if (this.re_word.test(symbol)) {
            if (this.variables.hasOwnProperty(symbol)) {
              console.log(`showvar: ${symbol}=`,this.variables[symbol]);
            } else if (symbol === 'all') {
              console.log(`showvar: all=`,this.lastcoords);
            }
          }
        }
        continue;
      }
      if ((v = this.re_exit_command.exec(line)) !== null) {
        break;
      }
      if ((v = this.re_label_command.exec(line)) !== null) {
        var label_alignment = this.assertAlignLabelAlignment(v[1]);
        var line = v[2];
        if ((v = this.re_label_arg.exec(line)) !== null) {
          var label = v[1].trim();
          line = v[2];
        } else {
          var label = '';
        }
        if (!label) {
          label = 'unassigned';
        }
        var coords = this.parseCoordsLine(line);
        var all_labels = label.split('\\\\');
        var all_labels = all_labels.map(x => x.trim());
        for (var i=0; i < coords.length; ++i) {
          var z0 = this.getCoordAt(coords,i);
          if (!z0) { break; }
          var x = z0[0];
          var y = z0[1];
          var label = this.toString(all_labels[i],label);
          var tex_label = this.parser.unmask(label);
          if (this.fontsize) {
            tex_label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${tex_label}`;
          } 
          o.push(`label${label_alignment} (btex {${tex_label}} etex, (${x}*u,${y}*u));`);
        }
        continue;
      }
      if ((v = this.re_shape_command.exec(line)) !== null) {
        var shape_alignment = this.assertAlignLabelAlignment(v[1]);
        var line = v[2];
        if ((v = this.re_label_arg.exec(line)) !== null) {
          var label = v[1].trim();
          line = v[2];
        } else {
          var label = '';
        }
        var coords = this.parseCoordsLine(line);
        var all_labels = label.split('\\\\');
        var all_labels = all_labels.map(x => x.trim());
        for (var i in coords) {
          z0 = this.getCoordAt(coords,i);
          if (!z0) { break; }
          var x = z0[0];
          var y = z0[1];
          var label = this.toString(all_labels[i],label);
          if (!this.shapes.hasOwnProperty(label)) {
            var shape = this.shapes['brick'];///this entry has to exist!!!
          } else {
            var shape = this.shapes[label];
          }
          for (var pp of shape) {
            /// for each shape path, the first is draw/fill
            /// and the second is the filled color, if any
            var s = [];
            var cmd = pp[0];
            var withpen = '';   
            var withcolor = '';
            if (pp[0] === 'fill') {
              withcolor = `withcolor ${pp[1]}`;
            } else if (pp[0] === 'drawdot') {
              withpen = `withpen pencircle scaled ${pp[1]}`;
            }
            for (var i=2; i < pp.length; ++i) {
              var p = pp[i];
              if (!p || p.length < 2) {
                s.push('cycle');
                break;
              } else {
                if (p.length == 3 && p[2]) {
                  /// curve
                  s.push(`(${p[0]}*u,${p[1]}*u)`);
                  s.push('..');
                } else if (p.length == 3 && !p[2]) {
                  /// line
                  s.push(`(${p[0]}*u,${p[1]}*u)`);
                  s.push('--');
                } else {
                  /// the last point
                  s.push(`(${p[0]}*u,${p[1]}*u)`);
                  break;
                }
              }
            }
            o.push(`${cmd} (${s.join('')})  shifted (${x}*u,${y}*u) ${withpen} ${withcolor};`);
          }
        }
        continue;
      }
      if ((v = this.re_stroke_command.exec(line)) !== null) {
        var stroke_opt = v[1].trim();
        var line = v[2];
        var coords = this.parseCoordsLine(line);
        if (stroke_opt == '.dblarrow') {
          o.push(`drawdblarrow ${this.coordsToString(coords)} ${this.draws()};`);
        } else if (stroke_opt == '.arrow') {
          o.push(`drawarrow ${this.coordsToString(coords)} ${this.draws()};`);
        } else if (stroke_opt == '.fill') {
          o.push(`fill ${this.coordsToString(coords)} ${this.fills()};`);
        } else {
          o.push(`draw (${this.coordsToString(coords)}) scaled(u) ${this.draws()};`);
        }
        continue;
      }
      if ((v = this.re_circle_command.exec(line)) !== null) {
        var circle_opt = v[1].trim();
        var line = v[2];
        var coords = this.parseCoordsLine(line);
        for (var i=0; i < coords.length; i++) {
          z0 = this.pointAt(coords,i);
          if (!z0) {
            break;
          }
          var x = z0[0];
          var y = z0[1];
          if (circle_opt==='') {
            if (this.filldraw & 0x10) {
              //o.push(`fill fullcircle scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.fills()};`);
              o.push(`fill fullcircle shifted(${x},${y}) scaled(${this.diameter}) scaled(u) ${this.fills()};`);
            }
            if (this.filldraw & 0x01) {
              //o.push(`draw fullcircle scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.draws()};`);
              o.push(`draw fullcircle shifted(${x},${y}) scaled(${this.diameter}) scaled(u) ${this.draws()};`);
            }
          } else if (circle_opt==='.top' ||
                     circle_opt==='.bot' ||
                     circle_opt==='.rt'  ||
                     circle_opt==='.lft' ) {
            var rot = 0;
            if (circle_opt==='.bot') { rot=180; }
            if (circle_opt==='.rt' ) { rot=270; }
            if (circle_opt==='.lft') { rot= 90; }
            if (this.filldraw & 0x10) {
              //o.push(`fill (halfcircle--cycle) scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.fills()};`);
              o.push(`fill (halfcircle--cycle) rotated(${rot}) shifted(${x},${y}) scaled(${this.diameter}) scaled(u) ${this.fills()};`);
            }
            if (this.filldraw & 0x01) {
              //o.push(`draw (halfcircle--cycle) scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.draws()};`);
              o.push(`draw (halfcircle--cycle) rotated(${rot}) shifted(${x},${y}) scaled(${this.diameter}) scaled(u) ${this.draws()};`);
            }
          } else if (circle_opt==='.q1' ||
                     circle_opt==='.q2' ||
                     circle_opt==='.q3' ||
                     circle_opt==='.q4' ) {
            var rot = circle_opt.slice(2);
            var rot = parseInt(rot);
            var rot = rot - 1; 
            var rot = rot*90;
            if (this.filldraw & 0x10) {
              o.push(`fill (quartercircle--(0,0)--cycle) rotated(${rot}) shifted(${x},${y}) scaled(${this.diameter}) scaled(u) ${this.fills()};`);
            }
            if (this.filldraw & 0x01) {
              o.push(`draw (quartercircle--(0,0)--cycle) rotated(${rot}) shifted(${x},${y}) scaled(${this.diameter}) scaled(u) ${this.draws()};`);
            }
          } else if (circle_opt==='.o1' ||
                     circle_opt==='.o2' ||
                     circle_opt==='.o3' ||
                     circle_opt==='.o4' ||
                     circle_opt==='.o5' ||
                     circle_opt==='.o6' ||
                     circle_opt==='.o7' ||
                     circle_opt==='.o8' ) {
            var rot = circle_opt.slice(2);
            var rot = parseInt(rot);
            var rot = rot - 1; 
            var rot = rot*45;
            if (this.filldraw & 0x10) {
              o.push(`fill (octantcircle--(0,0)--cycle) rotated(${rot}) shifted(${x},${y}) scaled(${this.diameter}) scaled(u) ${this.fills()};`);
            }
            if (this.filldraw & 0x01) {
              o.push(`draw (octantcircle--(0,0)--cycle) rotated(${rot}) shifted(${x},${y}) scaled(${this.diameter}) scaled(u) ${this.draws()};`);
            }
          } else if ( circle_opt==='.chord' ) {
            var x1 = 0.5*Math.cos(this.angle1/180*Math.PI);
            var y1 = 0.5*Math.sin(this.angle1/180*Math.PI);
            var x2 = 0.5*Math.cos(this.angle2/180*Math.PI);
            var y2 = 0.5*Math.sin(this.angle2/180*Math.PI);
            x1 = this.toFixed(x1);
            y1 = this.toFixed(y1);
            x2 = this.toFixed(x2);
            y2 = this.toFixed(y2);
            o.push(`draw ((${x1},${y1})--(${x2},${y2})) scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.draws()};`);
          } else if ( circle_opt==='.arc' ) {
            var x1 = 0.5*Math.cos(this.angle1/180*Math.PI);
            var y1 = 0.5*Math.sin(this.angle1/180*Math.PI);
            var x2 = 0.5*Math.cos(this.angle2/180*Math.PI);
            var y2 = 0.5*Math.sin(this.angle2/180*Math.PI);
            if (this.angle2 >= this.angle1) {
              var my_angle = this.angle2 - this.angle1;
              var my_angle = this.angle1 + my_angle/2;
            } else {
              var my_angle = this.angle2 - this.angle1 + 360;
              var my_angle = this.angle1 + my_angle/2;
              if (my_angle > 360) {
                my_angle -= 360;
              }
            }
            var xm = 0.5*Math.cos(my_angle/180*Math.PI);
            var ym = 0.5*Math.sin(my_angle/180*Math.PI);
            x1 = this.toFixed(x1);
            y1 = this.toFixed(y1);
            x2 = this.toFixed(x2);
            y2 = this.toFixed(y2);
            xm = this.toFixed(xm);
            ym = this.toFixed(ym);
            o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})) scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.draws()};`);
          } else if ( circle_opt==='.cseg' ) {
            var x1 = 0.5*Math.cos(this.angle1/180*Math.PI);
            var y1 = 0.5*Math.sin(this.angle1/180*Math.PI);
            var x2 = 0.5*Math.cos(this.angle2/180*Math.PI);
            var y2 = 0.5*Math.sin(this.angle2/180*Math.PI);
            if (this.angle2 >= this.angle1) {
              var my_angle = this.angle2 - this.angle1;
              var my_angle = this.angle1 + my_angle/2;
            } else {
              var my_angle = this.angle2 - this.angle1 + 360;
              var my_angle = this.angle1 + my_angle/2;
              if (my_angle > 360) {
                my_angle -= 360;
              }
            }
            var xm = 0.5*Math.cos(my_angle/180*Math.PI);
            var ym = 0.5*Math.sin(my_angle/180*Math.PI);
            x1 = this.toFixed(x1);
            y1 = this.toFixed(y1);
            x2 = this.toFixed(x2);
            y2 = this.toFixed(y2);
            xm = this.toFixed(xm);
            ym = this.toFixed(ym);
            if (this.filldraw & 0x10) {
              o.push(`fill ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.fills()};`);
            }
            if (this.filldraw & 0x01) {
              o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.draws()};`);
            }
          }
        }
        continue;
      }
      if ((v = this.re_rect_command.exec(line)) !== null) {
        var rect_opt = v[1].trim();
        var line = v[2];
        var coords = this.parseCoordsLine(line);
        for (var i=0; i < coords.length; i++) {
          z0 = this.getCoordAt(coords,i);
          if (!z0) {
            break;
          }
          var x = z0[0];
          var y = z0[1];
          if (rect_opt==='') {
            if (this.filldraw & 0x10) {
              o.push(`fill unitsquare xscaled(${this.rectw}*u) yscaled(${this.recth}*u) shifted(${x}*u,${y}*u) ${this.fills()};`);
            }
            if (this.filldraw & 0x01) {
              o.push(`draw unitsquare xscaled(${this.rectw}*u) yscaled(${this.recth}*u) shifted(${x}*u,${y}*u) ${this.draws()};`);
            }
          } else if (rect_opt==='.parallelgram') {
            var s  = this.rectw*this.slant/this.recth;
            var w  = this.rectw*(1-this.slant);
            var h  = this.recth;
            s = this.toFixed(s);
            w = this.toFixed(w);
            h = this.toFixed(h);
            if (this.filldraw & 0x10) {
              o.push(`fill unitsquare scaled(u) xscaled(${w}) yscaled(${h}) slanted(${s}) shifted(${x}*u,${y}*u) ${this.fills()};`);
            }
            if (this.filldraw & 0x01) {
              o.push(`draw unitsquare scaled(u) xscaled(${w}) yscaled(${h}) slanted(${s}) shifted(${x}*u,${y}*u) ${this.draws()};`);
            }
          }
        }
        continue;
      }
      if ((v = this.re_dot_command.exec(line)) !== null) {
        var dot_opt = v[1].trim();
        var line = v[2];
        var coords = this.parseCoordsLine(line);
        for (var i=0; i < coords.length; i++) {
          z0 = this.getCoordAt(coords,i);
          if (!z0) {
            break;
          }
          var x = z0[0];
          var y = z0[1];
          if (dot_opt==='') {
            var withcolor = (this.dotcolor) ? `withcolor ${this.dotcolor}` : '';
            var withpen = `withpen pencircle scaled ${this.dotsize}`;
            o.push(`drawdot (${x}*u,${y}*u) ${withpen} ${withcolor};`);
          } 
        }
        continue;
      }
      if ((v = this.re_tick_command.exec(line)) !== null) {
        var tick_opt = v[1].trim();
        var line = v[2];
        var coords = this.parseCoordsLine(line);
        for (var i=0; i < coords.length; i++) {
          z0 = this.getCoordAt(coords,i);
          if (!z0) {
            break;
          }
          var x = z0[0];
          var y = z0[1];
          var len = this.ticklength;
          if (tick_opt==='.top') {
            var withcolor = (this.tickcolor) ? `withcolor ${this.tickcolor}` : '';
            var withpen = `withpen pensquare scaled ${this.ticksize}`;
            o.push(`draw (${x}*u,${y}*u) -- (${x}*u,${y+len}*u) ${withpen} ${withcolor};`);
          } else if (tick_opt==='.bot') {
            var withcolor = (this.tickcolor) ? `withcolor ${this.tickcolor}` : '';
            var withpen = `withpen pensquare scaled ${this.ticksize}`;
            o.push(`draw (${x}*u,${y}*u) -- (${x}*u,${y-len}*u) ${withpen} ${withcolor};`);
          } else if (tick_opt==='.rt') {
            var withcolor = (this.tickcolor) ? `withcolor ${this.tickcolor}` : '';
            var withpen = `withpen pensquare scaled ${this.ticksize}`;
            o.push(`draw (${x}*u,${y}*u) -- (${x+len}*u,${y}*u) ${withpen} ${withcolor};`);
          } else if (tick_opt==='.lft') {
            var withcolor = (this.tickcolor) ? `withcolor ${this.tickcolor}` : '';
            var withpen = `withpen pensquare scaled ${this.ticksize}`;
            o.push(`draw (${x}*u,${y}*u) -- (${x-len}*u,${y}*u) ${withpen} ${withcolor};`);
          }
        }
        continue;
      }
      if ((v = this.re_angle_command.exec(line)) !== null) {
        var angle_opt = v[1].trim();
        var line = v[2];
        var coords = this.parseCoordsLine(line);
        if (angle_opt === '.arc') {
          var coords = this.parseCoordsLine(line);
          var z0 = this.getCoordAt(coords,0);
          var z1 = this.getCoordAt(coords,1);
          var z2 = this.getCoordAt(coords,2);
          if (z0 && z1 && z2) {
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
            var r = 0.5;
            ///***NEW: when the ang2-ang1 is too small the arc is barely visible!!!
            ///thus we gradually increase r to a maximum of 2 when angle delta is 45 degree or less
            var angledelta = ang2-ang1;
            const max_angle = 60.0;
            if (angledelta < max_angle) {
              var dd = (max_angle-angledelta)/max_angle; // range from 0-1
              var increase_length = this.toFixed(dd*dd*2.0);///use a polobra curve
              r = r + increase_length;
            }
            var diameter = r+r;
            o.push(`draw subpath (${ang1/45},${ang2/45}) of fullcircle scaled(u) scaled(${diameter}) shifted(${x}*u,${y}*u);`);
          }
        } else if (angle_opt === '.sq') {
          var coords = this.parseCoordsLine(line);
          var z0 = this.getCoordAt(coords,0);
          var z1 = this.getCoordAt(coords,1);
          var z2 = this.getCoordAt(coords,2);
          if (z0 && z1 && z2) {
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
            var r = 0.5;
            o.push(`draw subpath (0,4) of unitsquare rotated(${ang1}) scaled(u) scaled(${r}) shifted(${x}*u,${y}*u);`);
          }
        }
        continue;
      }
      if ((v = this.re_draw_command.exec(line)) !== null) {
        var command = v[1];
        var line = v[2];
        var coords = [];

        switch (command) {
          case 'set': {
            if ((v = this.re_prop.exec(line)) !== null) {
              var key = v[1];
              var val = v[2];
              if (key === 'width'   )  { this.width = this.assertInt(val,this.def_width,10,100); } ///such as 25   
              if (key === 'height'  )  { this.height = this.assertInt(val,this.def_height,4,100); } ///such as 10   
              if (key === 'unit'    )  { this.unit = this.toString(val,this.def_unit); }/// such as '4mm'  
              if (key === 'refx'    )  { 
                ///
                /// /3 - from left
                /// 3/ - from right
                ///
                if (val[0] === '/') { /// '/3'
                  val = val.slice(1);
                  val = this.assertFloat(val,this.def_refx,0,this.width); 
                } else if (val[val.length-1] === '/') { /// '3/'
                  val = val.slice(0,val.length-1);
                  val = this.width - this.assertFloat(val,this.def_refx,0,this.width); 
                } else {
                  val = this.assertFloat(val,this.def_refx,0,this.width); 
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
                  val = this.height - this.assertFloat(val,this.def_refy,0,this.height); 
                } else if (val[val.length-1] === '/') { /// '3/'
                  val = val.slice(0,val.length-1);
                  val = this.assertFloat(val,this.def_refy,0,this.height); 
                } else {
                  val = this.assertFloat(val,this.def_refy,0,this.height); 
                }
                this.refy = val;
              } ///such as 12.5
              if (key === 'refsx'   )  { this.refsx = this.assertFloat(val,this.def_refsx,0.1,10); } ///such as 1.5
              if (key === 'refsy'   )  { this.refsy = this.assertFloat(val,this.def_refsy,0.1,10); } ///such as 1.5
              if (key === 'fontsize')  { this.fontsize = this.toString(val,this.def_fontsize); }/// such as '14pt'
              if (key === 'slant'   )  { this.slant = this.assertFloat(val,this.def_slant,0.1,0.9); } 
              if (key === 'linecolor' ){ this.linecolor = this.toString(val,this.def_linecolor); } ///such as 'red'
              if (key === 'linewidth' ){ this.linewidth = this.toString(val,this.def_linewidth); } ///such as '4pt'
              if (key === 'fillcolor' ){ this.fillcolor = this.toString(val,this.def_fillcolor); } ///such as 'red'
              if (key === 'dotcolor'  ){ this.dotcolor = this.toString(val,this.def_dotcolor);  } ///such as 'red'
              if (key === 'dotsize'   ){ this.dotsize = this.toString(val,this.def_dotsize); } ///such as '4pt' or '4mm'
              if (key === 'tickcolor' ){ this.tickcolor = this.toString(val,this.def_tickcolor);  } ///such as 'red'
              if (key === 'ticksize'  ){ this.ticksize = this.toString(val,this.def_ticksize); } ///such as '1pt' or '1mm'
              if (key === 'ticklength'){ this.ticklength = this.assertFloat(val,this.def_ticklength,0.1,1.0); } ///such as '0.33'
              if (key === 'curve'     ){ this.curve   = this.toString(val,this.def_curve);   } ///such as 'up' or 'down'
              if (key === 'arrow'     ){ this.arrow   = this.toString(val,this.def_arrow);   } ///such as 'arrow' or 'dblarrow'
              if (key === 'rectw'     ){ this.rectw   = this.assertFloat(val,this.def_rectw,0.1,100);    } ///such as '12.5'
              if (key === 'recth'     ){ this.recth   = this.assertFloat(val,this.def_recth,0.1,100);    } ///such as '12.5'
              if (key === 'diameter'  ){ this.diameter= this.toFloat(val,this.def_diameter); } ///such as '12.5'
              if (key === 'angle1'    ){ this.angle1  = this.assertFloat(val,this.def_angle1,0,360);   } ///such as '90'  
              if (key === 'angle2'    ){ this.angle2  = this.assertFloat(val,this.def_angle2,0,360);   } //suchas '180' 
              if (key === 'side1'     ){ this.side1   = this.toFloat(val,this.def_side1);    } ///such as '4'  
              if (key === 'side2'     ){ this.side2   = this.toFloat(val,this.def_side2);    } //suchas '3' 
              if (key === 'filldraw'  ){ this.filldraw= this.toFilldraw(val,this.def_filldraw); } //suchas 'filldraw' 
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
          case 'showall': {
            console.log('showall: all=',this.lastcoords);
            break;
          }
          case 'drawrect': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill unitsquare scaled(u) xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw unitsquare scaled(u) xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x}*u,${y}*u)             ;`);
            }
            break;
          }
          case 'drawparallelgram': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              var s  = this.rectw*this.slant/this.recth;
              var w  = this.rectw*(1-this.slant);
              var h  = this.recth;
              if (withcolor) {
              o.push(`fill unitsquare scaled(u) xscaled(${w}) yscaled(${h}) slanted(${s}) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw unitsquare scaled(u) xscaled(${w}) yscaled(${h}) slanted(${s}) shifted(${x}*u,${y}*u) ;`);
            }
            break;
          }
          case 'drawfullcircle': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill fullcircle scaled(u) scaled(${this.diameter}) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw fullcircle scaled(u) scaled(${this.diameter}) shifted(${x}*u,${y}*u) ;`);
            }
            break;
          }
          case 'drawupperhalfcircle': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill (halfcircle--cycle) scaled(u) scaled(${this.diameter}) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw (halfcircle--cycle) scaled(u) scaled(${this.diameter}) shifted(${x}*u,${y}*u) ;`);
            }
            break;
          }
          case 'drawlowerhalfcircle': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill (halfcircle--cycle) scaled(u) scaled(${this.diameter}) rotated(180) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw (halfcircle--cycle) scaled(u) scaled(${this.diameter}) rotated(180) shifted(${x}*u,${y}*u) ;`);
            }
            break;
          }
          case 'drawlefthalfcircle': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill (halfcircle--cycle) scaled(u) scaled(${this.diameter}) rotated(90) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw (halfcircle--cycle) scaled(u) scaled(${this.diameter}) rotated(90) shifted(${x}*u,${y}*u) ;`);
            }
            break;
          }
          case 'drawrighthalfcircle': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill (halfcircle--cycle) scaled(u) scaled(${this.diameter}) rotated(270) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw (halfcircle--cycle) scaled(u) scaled(${this.diameter}) rotated(270) shifted(${x}*u,${y}*u)             ;`);
            }
            break;
          }
          case 'drawquadrantonecircle': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill (quartercircle--(0,0)--cycle) scaled(u) scaled(${this.diameter}) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw (quartercircle--(0,0)--cycle) scaled(u) scaled(${this.diameter}) shifted(${x}*u,${y}*u)             ;`);
            }
            break;
          }
          case 'drawquadranttwocircle': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill (quartercircle--(0,0)--cycle) scaled(u) scaled(${this.diameter}) rotated(90) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw (quartercircle--(0,0)--cycle) scaled(u) scaled(${this.diameter}) rotated(90) shifted(${x}*u,${y}*u)             ;`);
            }
            break;
          }
          case 'drawquadrantthreecircle': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill (quartercircle--(0,0)--cycle) scaled(u) scaled(${this.diameter}) rotated(180) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw (quartercircle--(0,0)--cycle) scaled(u) scaled(${this.diameter}) rotated(180) shifted(${x}*u,${y}*u)             ;`);
            }
            break;
          }
          case 'drawquadrantfourcircle': {
            var coords = this.parseCoordsLine(line);
            var withcolor = (this.fillcolor) ? `withcolor ${this.fillcolor}` : '';
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              if (withcolor) {
              o.push(`fill (quartercircle--(0,0)--cycle) scaled(u) scaled(${this.diameter}) rotated(270) shifted(${x}*u,${y}*u) ${withcolor};`);
              }
              o.push(`draw (quartercircle--(0,0)--cycle) scaled(u) scaled(${this.diameter}) rotated(270) shifted(${x}*u,${y}*u)             ;`);
            }
            break;
          }
          case 'drawcirclechord': {
            var coords = this.parseCoordsLine(line);
            for (var i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              var x1 = 0.5*Math.cos(this.angle1/180*Math.PI);
              var y1 = 0.5*Math.sin(this.angle1/180*Math.PI);
              var x2 = 0.5*Math.cos(this.angle2/180*Math.PI);
              var y2 = 0.5*Math.sin(this.angle2/180*Math.PI);
              x1 = this.toFixed(x1);
              y1 = this.toFixed(y1);
              x2 = this.toFixed(x2);
              y2 = this.toFixed(y2);
              o.push(`draw ((${x1},${y1})--(${x2},${y2})) scaled(u) scaled(${this.diameter}) shifted(${x}*u,${y}*u);`);
            }
            break;
          }
          case 'drawanglearc': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            if (!z0) { break; }
            var z1 = this.getCoordAt(coords,1);
            if (!z1 || !z1.length) { break; }
            var z2 = this.getCoordAt(coords,2);
            if (!z2 || !z2.length) { break; }
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
            var r = 0.5;
            ///***NEW: when the ang2-ang1 is too small the arc is barely visible!!!
            ///thus we gradually increase r to a maximum of 2 when angle delta is 45 degree or less
            var angledelta = ang2-ang1;
            const max_angle = 60.0;
            if (angledelta < max_angle) {
              var dd = (max_angle-angledelta)/max_angle; // range from 0-1
              var increase_length = this.toFixed(dd*dd*2.0);///use a polobra curve
              r = r + increase_length;
            }
            var diameter = r+r;
            o.push(`draw subpath (${ang1/45},${ang2/45}) of fullcircle scaled(u) scaled(${diameter}) shifted(${x}*u,${y}*u);`);
            break;
          }
          case 'drawrightanglearc': {
            var coords = this.parseCoordsLine(line);
            var z0 = this.getCoordAt(coords,0);
            if (!z0) { break; }
            var z1 = this.getCoordAt(coords,1);
            if (!z1 || !z1.length) { break; }
            var z2 = this.getCoordAt(coords,2);
            if (!z2 || !z2.length) { break; }
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
            var r = 0.5;
            o.push(`draw subpath (0,4) of unitsquare rotated(${ang1}) scaled(u) scaled(${r}) shifted(${x}*u,${y}*u);`);
            break;
          }
          case 'drawdot': {
            var coords = this.parseCoordsLine(line);
            var z0;
            var i;
            var withcolor = (this.dotcolor) ? `withcolor ${this.dotcolor}` : '';
            var scaled = `scaled ${this.dotsize}`;
            for (i in coords) {
              z0 = this.getCoordAt(coords,i);
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              o.push(`drawdot (${x}*u,${y}*u) withpen pencircle ${scaled} ${withcolor};`);
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
              if (!z0) {
                gg.push('cycle');
                break;
              }
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
              if (!z0) { break; }
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
              if (!z0) { break; }
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
              if (!z0) { break; }
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
              if (!z0) { break; }
              var x = z0[0];
              var y = z0[1];
              o.push(`draw (${x-0.5}*u,${y}*u) -- (${x+0.5}*u,${y}*u) withpen pencircle scaled 1pt;`);
            }
            break;
          }
        }

        /// save the previous p so that we can find out the last
        /// set of coordinates
        if (coords.length) {
        }
        continue;
      }
    }
    o.push(`);`);
    o.push(`draw wheel scaled(ratio);`);

    ///now we need to add customized path suchas 'octantcircle' 
    //o.unshift('path octantcircle; octantcircle := (1,0)..(0.923879,0.382683)..(0.7071,0.7071);');
    o.unshift('path octantcircle; octantcircle := (0.5,0)..(0.4619395,0.1913415)..(0.35355,0.35355);');

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
    ///***NOTE: this function is to return the coord
    /// after it has been applied the refx, refy, refsx and refsy;
    /// it is only intended to be used to access each path
    /// point as an individual, and not considered the join, pre and post
    /// part of each path point; it might return null; 
    ///   
    ///***NOTE: it also needs to take into consideration of whether any
    /// path point is a path variable ; thus, if the first element is a 
    /// path variable then the i will apply to the element within that variable;
    ///
    var pt = coords[i];
    if (!pt) {
      return null;
    } 
    ///***important: must return a new array
    ///   because we want to leave the original
    ///   coords var that is declared in toMetaPost
    ///   intact as each of it might be saved to a 
    ///   variable, its original value must be kept.
    var x = pt[0];
    var y = pt[1];
if (typeof x !== 'number') { console.error('x not a number:',x); console.error('coords=',coords); }
if (typeof y !== 'number') { console.error('y not a number:',y); console.error('coords=',coords); }
    x *= this.refsx;
    y *= this.refsy;
    x += this.refx;
    y += this.refy;
    x = this.toFixed(x);
    y = this.toFixed(y);
    return [x,y,pt[2],pt[3],pt[4]];
  }

  pointAt (coords, i, nlevel=0) {
    ///***NOTE: because each point of a path can also be a varible,
    ///which denotes a subpath, thus the pointAt() method will recursively
    ///call pointAt() to dig deep into the subpath. Thus we need a nlevel
    ///to guard against too many nested calls;
    if (nlevel>10) {
      return null;
    }
    ///***NOTE: this function is to return the coord
    /// after it has been applied the refx, refy, refsx and refsy;
    /// it is only intended to be used to access each path
    /// point as an individual, and not considered the join, pre and post
    /// part of each path point; it might return null; 
    ///   
    ///***NOTE: it also needs to take into consideration of whether any
    /// path point is a path variable ; thus, if the first element is a 
    /// path variable then the i will apply to the element within that variable;
    ///
    ///***important: must return a new array
    ///   because we want to leave the original
    ///   coords var that is declared in toMetaPost
    ///   intact as each of it might be saved to a 
    ///   variable, its original value must be kept.
    if (!coords) { return null; }
    var pt = coords[i];
    if (!pt) { return null; } 
    var x = pt[0];
    var y = pt[1];
    if (typeof x == 'number' && typeof y == 'number') { 
      x *= this.refsx;
      y *= this.refsy;
      x += this.refx;
      y += this.refy;
      x = this.toFixed(x);
      y = this.toFixed(y);
      return [x,y];
    }
    /// variable
    if (typeof x == 'string') {
      coords = this.fetchVariable(x);
      return this.pointAt(coords,0,nlevel+1);
    }
    return null;
  }

  assertInt (val,def_v,min,max) {
    if (!val) {
      return def_v;
    }
    val = parseInt(val);
    if( val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }
  
  assertFloat (val,def_v,min,max) {
    if (!val) {
      return def_v;
    }
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

  toFilldraw (v,def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
      if (v === 'filldraw') {
        return 0x11;
      }
      if (v === 'fill') {
        return 0x10;
      }
    }
    return def_v;
  }

  toFloat (v,def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
    }
    return parseFloat(v);
  }

  toString (v,def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
      return v;
    }
    return ''+v;
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
      return this.lastcoords;
    }
    /// 'last' 
    if (a === 'last') {
      var n = this.lastcoords.length;
      var pt = this.lastcoords[n-1];
      if (pt) { return [pt]; }
    }
    /// 'first' 
    if (a === 'first') {
      var pt = this.lastcoords[0];
      if (pt) { return [pt]; }
    }
    /// 'second' 
    if (a === 'second') {
      var pt = this.lastcoords[1];
      if (pt) { return [pt]; }
    }
    /// 'third' 
    if (a === 'third') {
      var pt = this.lastcoords[2];
      if (pt) { return [pt]; }
    }
    /// 'forth' 
    if (a === 'forth') {
      var pt = this.lastcoords[3];
      if (pt) { return [pt]; }
    }
    /// 'fifth' 
    if (a === 'fifth') {
      var pt = this.lastcoords[4];
      if (pt) { return [pt]; }
    }
    /// 'ogigin'
    if (a === 'origin') {
      return [[0,0]];
    }

    return [];
  }
  
  execFunction (fun_str,arg_str) {

    var ret_val = [];
    var args = arg_str.split(',');
    args = args.map(x => x.trim());
    switch (fun_str) {

      case 'midpoint':

        if (args.length == 2) {
          var coords = this.fetchVariable(args[0]);
          var fraction = parseFloat(args[1]);
          if (coords && Number.isFinite(fraction)) {
            var z0 = coords[0];
            var z1 = coords[1];
            if (z0 && z1) {
              var z0x = parseFloat(z0[0]);
              var z0y = parseFloat(z0[1]);
              var z1x = parseFloat(z1[0]);
              var z1y = parseFloat(z1[1]);
              var ptx = z0x + (z1x - z0x)*fraction;
              var pty = z0y + (z1y - z0y)*fraction;
              ptx = this.toFixed(ptx);
              pty = this.toFixed(pty);
              ret_val.push([ptx,pty,0,'','' ]);///must return 5-elem array
              return ret_val;/// always returns a single point in the coords    
            }
          }

        } else if (args.length == 1) {

          var coords = this.fetchVariable(args[0]);
          if (coords) {    
            var z0 = coords[0];
            var z1 = coords[1];
            if (z0 && z1) {
              var z0x = parseFloat(z0[0]);
              var z0y = parseFloat(z0[1]);
              var z1x = parseFloat(z1[0]);
              var z1y = parseFloat(z1[1]);
              var midx = (z0x + z1x)*0.5;
              var midy = (z0y + z1y)*0.5;
              midx = this.toFixed(midx);
              midy = this.toFixed(midy);
              ret_val.push([midx,midy,0,'','']);
              return ret_val;/// always returns a single point in the coords
            }
          }
        }
        break;

      case 'scatterpoints':

        if (args.length == 5) {
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
            var pt = [sx,sy,0,'',''];
            var dx = tx - sx;
            var dy = ty - sy;
            ret_val.push(pt);
            for (let i=1; i < n; i++) {
              var frac = i/(n-1);
              var px = sx+frac*dx;
              var py = sy+frac*dy;
              px = this.toFixed(px);
              py = this.toFixed(py);
              ret_val.push([px,py,0,'','']);
            }
            return ret_val;
          }
        }
        break;

      case 'shiftpoints':

        /// shiftpoints(a,0,-2) 
        /// shiftpoints(a,2,-1) 

        if (args.length == 3) {
          var coords = this.fetchVariable(args[0]);
          var dx = parseFloat(args[1]);
          var dy = parseFloat(args[2]);
          if (coords &&
              Number.isFinite(dx) &&
              Number.isFinite(dy) ) {
           
            for (let i=0; i < coords.length; i++) {
              var pt = coords[i];
              if (pt) {
                var x = pt[0] + dx;
                var y = pt[1] + dy;
                ret_val.push([x,y,pt[2],pt[3],pt[4]]);
              }
            }
            return ret_val;
          }
        }
        break;

      case 'somepoints':

        /// somepoints(a,0,2) - all points between 0 and 2, including 0 and 2
        /// somepoints(a,3,5) - all points between 3 and 5, including 3 and 5
        /// somepoints(a,3)   - a single point in 3

        if (args.length == 3) {
          var coords = this.fetchVariable(args[0]);
          var j   = parseFloat(args[1]);
          var k   = parseFloat(args[2]);
        } else if (args.length == 2) {
          var coords = this.fetchVariable(args[0]);
          var j   = parseFloat(args[1]);
          var k   = parseFloat(args[1]);
        } else {
          break;
        }

        if (coords &&
            Number.isFinite(j) &&
            Number.isFinite(k) ) {
         
          var i;
          if (k >= j) {
            for (i=j; i <= k && i >= 0 && i < coords.length; ++i) {
              var pt = coords[i];
              if (pt) {
                ret_val.push(pt);        
              }
            }
          } else {
            for (i=j; i >= k && i >= 0 && i < coords.length; --i) {
              var pt = coords[i];
              if (pt) {
                ret_val.push(pt);      
              }
            }
          }
          return ret_val;
        }
        break;

      case 'allpoints':

        /// allpoints(a,b,c) - all points from a,b,and c,

        for (var i in args) {
          var coords = this.fetchVariable(args[i]);
          if (coords) {
            for (var j in coords) {
              var pt = coords[j];
              if (!pt) {
                break;
              }
              ret_val.push(pt);
            }
          }
        }
        return ret_val;
        break;

      case 'rectpoints':

        /// rectpoints(0,2,4,3)  - returns a path that expresses the rectangle with
        ///                        its lower left at (0,2) and with a width of 4 and a
        ///                        height of 3; the path is closed with the last point
        ///                        a cycle; 

        if (args.length == 4) {
          var x   = parseFloat(args[0]);
          var y   = parseFloat(args[1]);
          var w    =parseFloat(args[2]);
          var h    =parseFloat(args[3]);
          if( Number.isFinite(x) &&
              Number.isFinite(y) &&  
              Number.isFinite(w) &&  
              Number.isFinite(h) ) {
            ret_val.push([x,y]);
            var nx = x + w;
            var ny = y;
            ret_val.push([x,y]);
            var nx = x + w;
            var ny = y + h;
            ret_val.push([x,y]);
            var nx = x;
            var ny = y + h;
            ret_val.push([x,y]);
            ret_val.push([]);
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
    /// (1,2) 3 <4,5> (9,10) ()
    /// (1,2) 3 [angledist:10,4] (9,10) ()

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


    if (this.re_func.test(line)) {
      var v = this.re_func.exec(line);

      /// $midpoint(a)
      /// $somepoint(a,0.2)
      /// $scatterpoints(0,0,0.5,0,10)

      return this.execFunction(v[1],v[2]);

    } 

    /// (1,2) (3,4) (5,6) ...
    /// (1,2) (3) (4) ...
    /// (1,2) a (4,5) ...
    /// (1,2) a (4,5) ()
    /// (1,2) -- a .. (4,5) -- (4,4) -- ()

    var coords = [];
    var lastpt = [0,0];
    var dx = 0;
    var dy = 0;
    var x = 0;
    var y = 0;
    var v;
    var lastjoin = '';
    while (line.length) {

      if ((v = this.re_dashdot.exec(line)) !== null) {
        var d = v[1].trim();
        line = v[2];
        if (d[0] === '.') {
          lastjoin = '..';
        } else if (d[0] === '-') {
          lastjoin = '--';
        } else {
          lastjoin = '';
        }
        continue;
      } 

      if ((v = this.re_symbol_withopt.exec(line)) !== null) {
        var pre = v[1].trim();
        var d = v[2].trim();
        var post = v[3].trim();
        line = v[4];
        coords.push([d,'',lastjoin,pre,post]);
        continue;
      } 

      if ((v = this.re_coord_withopt.exec(line)) !== null) {
        var pre = v[1].trim();
        var d = v[2].trim();
        var post = v[3].trim();
        line = v[4];
        d = d.split(',');  
        d = d.map( x => x.trim() );
        if (d.length<2) {
          coords.push(['cycle','',lastjoin,pre,post]);
          break;
        }
        var d0 = d[0];
        var d1 = d[1];
        if (!d0) {
          x = lastpt[0];
        } else {
          x = parseFloat(d0);
        }
        if (!d1) {
          y = lastpt[1];
        } else {
          y = parseFloat(d1);
        }
        if (Number.isFinite(x) && Number.isFinite(y)) {
          coords.push([x,y,0,pre,post]);
          lastpt[0] = x;
          lastpt[1] = y;
        }
        continue;
      } 

      if ((v = this.re_offset.exec(line)) !== null) {
        /// <1,2>, or <1,>, or <,2>
        var d = v[1].trim();
        line = v[2];
        if (!d) {
          continue; ///d is an empty string
        }
        d = d.split(',');
        d = d.map( x => x.trim() );
        if (d.length==2) {
          dx = parseFloat(d[0]);
          dy = parseFloat(d[1]);
          if (!Number.isFinite(dx)) { dx = 0; }
          if (!Number.isFinite(dy)) { dy = 0; }
          x = lastpt[0] + dx;          
          y = lastpt[1] + dy;          
          lastpt[0] = x; 
          lastpt[1] = y; 
          coords.push([x,y,0,'','']);
        }
        continue;
      } 

      if ((v = this.re_relative.exec(line)) !== null) {
        /// [angledist:10,4]
        var d = v[1].trim();
        line = v[2];
        d = d.split(':');
        d = d.map( x => x.trim() );
        if (d.length==2) { 
          var key = d[0];
          var val = d[1];
          if (key === 'angledist') {
            var val = val.split(',');  
            var val = val.map( x => x.trim() );  
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var dist  = parseFloat(val[1]);
              dx = dist * Math.cos(angle/180*Math.PI);    
              dy = dist * Math.sin(angle/180*Math.PI);    
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              dx = this.toFixed(dx);
              dy = this.toFixed(dy);
            }
          }
          x = lastpt[0] + dx;          
          y = lastpt[1] + dy;          
          lastpt[0] = x; 
          lastpt[1] = y; 
          coords.push([x,y,0,'','']);
        }
        continue;
      } 

      ///***NOTE: it is important to get out of for-loop
      ///because we do not know how to skip to the next coord
      break;
    }

    this.lastcoords = coords;
    return coords;
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

  assertAlign (v) {

    if (typeof v == 'string') {
      if (v.localeCompare('lft') == 0 || 
          v.localeCompare('rt') == 0 || 
          v.localeCompare('top') == 0 || 
          v.localeCompare('bot') == 0 || 
          v.localeCompare('ulft') == 0 || 
          v.localeCompare('urt') == 0 || 
          v.localeCompare('llft') == 0 || 
          v.localeCompare('lrt') == 0 ) {
        return v;
      }
    }
    return '';
  }

  assertAlignLabelAlignment (v) {

    if (typeof v == 'string') {
      if (v.localeCompare('.lft') == 0 || 
          v.localeCompare('.rt') == 0 || 
          v.localeCompare('.top') == 0 || 
          v.localeCompare('.bot') == 0 || 
          v.localeCompare('.ulft') == 0 || 
          v.localeCompare('.urt') == 0 || 
          v.localeCompare('.llft') == 0 || 
          v.localeCompare('.lrt') == 0 ) {
        return v;
      }
    }
    return '';
  }

  toFixed (v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(6));
  }

  fills () {
    var s = [];
    if (this.fillcolor) {
      s.push(`withcolor ${this.fillcolor}`);
    }
    return s.join(' ');
  }

  draws() {
    var s = [];
    if (this.linewidth) {
      s.push(`withpen pencircle scaled ${this.linewidth}`);
    }
    if (this.linecolor) {
      s.push(`withcolor ${this.linecolor}`);
    }
    return s.join(' ');
  }

  addMyPath(name) {
    for (var v of this.mypath_list) {
      if (v.localeCompare(name) == 0 ) {
        ///already added
        break;
      }
    }
    this.mypath_list.push(name);
  }

  coordsToString(coords) {
    ///***EXAMPLE: (1,1)..(2,2)..(3,4)..cycle
    ///**NOTE: ie. (1,2){up}
    /// [0]: 1  <- typeof is 'number'
    /// [1]: 2
    /// [2]: ''  <- join, set to the join before the point
    /// [3]: ''  <- pre modifier
    /// [4]: '{up}'  <- post modifier
    ///***NOTE: i.e: ..a{up}
    /// [0]: 'a'  <- typeof is 'string'
    /// [1]: ''   <- ignored
    /// [2]: '..'    <- join type
    /// [3]: ''      <- pre modifier   
    /// [4]: '{up}'  <- post modifier
    ///***NOTE: i.e: --{up}cycle
    /// [0]: 'cycle'  <- typeof is 'string'
    /// [1]: ''       <- ignored
    /// [2]: '--'     <- join type
    /// [3]: '{up}'   <- pre modifier
    /// [4]: ''       <- post modifier
    ///***NOTE: i.e: (1,2)..(2,3)--{up}cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','{up}','']
    var o = [];
    for (var i in coords) {
      var pt = coords[i];       
      var x =    pt[0];       
      var y =    pt[1];       
      var join = pt[2];       
      var pre =  pt[3];       
      var post = pt[4];       
      ///doing some fixes
      join = join||'';
      pre = pre||'';
      post = post||'';
      if (i==0) {
        join = '';
      } else {
        if (!join) {
          join = '--';
        }
      }
      ///output
      if (typeof x == 'number') {
        o.push(`${join}${pre}(${x},${y})${post}`);
      } else if (typeof x == 'string') {
        o.push(`${join}${pre}${x}${post}`);
      } else {
        o.push(`${join}${pre}${x}${post}`);
      }
    }
    return o.join('');
  }

}
module.exports = { NitrilePreviewDiagram };
