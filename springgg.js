//------------------------------------------------------------------------------
//                                                                         TRACE
//------------------------------------------------------------------------------
function trace(text){
    el = document.getElementById("trace");
    if(el.childNodes.length > 40) el.removeChild(el.childNodes[0]);
    el.innerHTML += "<div>"+text+"</div>";
}

//------------------------------------------------------------------------------
//                                                                     GET ANGLE
//------------------------------------------------------------------------------
function get_angle(x1,y1,x2,y2){
  var a = Math.atan2(y1 - y2, x2 - x1);
  if (a < 0 ) a += Math.PI*2;
  return(a);
}

//------------------------------------------------------------------------------
//                                                               CROSS PRODUCT Z
//------------------------------------------------------------------------------
function cross_product_z(x1, y1, x2, y2){
  return(x1*y2 - x2*y1);
}

//------------------------------------------------------------------------------
//                                                                  ON SAME SIDE
//------------------------------------------------------------------------------
function on_same_side(f1, f2, x1, y1, x2, y2){
  var vx = f1.x - f2.x;
  var vy = f1.y - f2.y;
  var z1 = cross_product_z(vx, vy, x1, y1);
  var z2 = cross_product_z(vx, vy, x2, y2);
  return((z1*z2) > 0);

}

//------------------------------------------------------------------------------
//                                                                     DRAW GRID
//------------------------------------------------------------------------------
function draw_grid() {
  var size = g_gridsize;
  ctx.beginPath();
  ctx.strokeStyle = "#eee";
  var sx = -g_transform.x;
  var sy = -g_transform.y;
  var sx2 = sx - (sx % size);
  var sy2 = sy - (sy % size);
  //vertical
  for(var i = 0; i < 600; i += size) {
      ctx.moveTo(sx2+i, sy);
      ctx.lineTo(sx2+i, sy+600);
  }
  //horizontal
  for(var i = 0; i < 600; i += size) {
      ctx.moveTo(sx, sy2+i);
      ctx.lineTo(sx+600, sy2+i);
  }
  ctx.stroke();
  ctx.closePath();
}

//------------------------------------------------------------------------------
//                                                                     DRAW_FEET
//------------------------------------------------------------------------------
function draw_feet() {
  for (var f, i = 0; f = g_feet[i]; ++i) {
    if (g_selection == i) {
      ctx.strokeStyle = "red";
    } else {
      ctx.strokeStyle = "black";
    }
    ctx.strokeRect(f.x - 10, f.y - 10, 20, 20);
    ctx.fillStyle = "black";
    ctx.fillText(f.x + ", "+ f.y, f.x + 16, f.y);
  }
}

//------------------------------------------------------------------------------
//                                                                      DRAW_COM
//------------------------------------------------------------------------------
function draw_com() {
  if (g_selection == 4) {
    ctx.strokeStyle = "red";
  } else {
    ctx.strokeStyle = "blue";
  }
  ctx.strokeRect(g_com.x-10, g_com.y -10, 20, 20);
  ctx.fillStyle = "black";
  ctx.fillText(g_com.x + ", " + g_com.y,  g_com.x + 16, g_com.y)
}

//------------------------------------------------------------------------------
//                                                                  DRAW SPRINGS
//------------------------------------------------------------------------------
function draw_springs() {
  var dx, dy, F, Fx, Fy;
  // clear forces on feet
  for (var f, i = 0; f = g_feet[i]; ++i) {
    f.Fx = 0;
    f.Fy = 0;
  }
  g_com.Fx = 0;
  g_com.Fy = 0;
  // update springs and forces (also, draw them)
  for (var s, i = 0; s = g_springs[i]; ++i) {
    ctx.beginPath();
    ctx.strokeStyle = s.c;
    ctx.moveTo(s.a.x, s.a.y);
    ctx.lineTo(s.b.x, s.b.y);
    ctx.stroke();
    dx = s.b.x - s.a.x;
    dy = s.b.y - s.a.y;
    s.x = Math.sqrt(dy*dy + dx*dx);
    // add forces to feet
    F = (s.x-s.x0) * -s.K;
    Fx = Math.cos(get_angle(0,0, dx, dy)) * F;
    Fy = Math.sin(get_angle(0,0, dx, dy)) * -F;
    s.a.Fx -= Fx;
    s.b.Fx += Fx;
    s.a.Fy -= Fy;
    s.b.Fy += Fy;
    ctx.fillStyle = s.c;
    ctx.fillText(
      Math.floor(F), s.a.x + dx*0.25 + 16, s.a.y + dy*0.25 + 18);
  }
}

//------------------------------------------------------------------------------
//                                                                   DRAW FORCES
//------------------------------------------------------------------------------
function draw_forces() {
  ctx.fillStyle = "red";
  for (var f, i = 0; f = g_feet[i]; ++i) {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(f.x, f.y);
    ctx.lineTo(f.Fx+f.x, f.Fy+f.y);
    ctx.stroke();
    ctx.fillText(
      Math.floor(f.Fx) + ", " + Math.floor(f.Fy), f.x+f.Fx+16, f.y+f.Fy-18);
  }
  // also draw com force
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.moveTo(g_com.x, g_com.y);
  ctx.lineTo(g_com.x + g_com.Fx, g_com.y + g_com.Fy);
  ctx.stroke();
  ctx.fillText(
    Math.floor(g_com.Fx) + ", " + Math.floor(g_com.Fy),
    g_com.x+g_com.Fx+16, g_com.y+g_com.Fy-18);
}

//------------------------------------------------------------------------------
//                                                                         CLEAR
//------------------------------------------------------------------------------
function clear() {
  ctx.clearRect(-g_transform.x, -g_transform.y, 600, 600);
}

//------------------------------------------------------------------------------
//                                                                        REDRAW
//------------------------------------------------------------------------------
function redraw() {
  clear();
  draw_grid();
  draw_springs();
  draw_feet();
  draw_com();
  draw_forces();
}

//------------------------------------------------------------------------------
//                                                                      CV CLICK
//------------------------------------------------------------------------------
function cv_click(ev) {
  var x = ev.clientX - cv.offsetLeft - g_transform.x;
  var y = ev.clientY - cv.offsetTop - g_transform.y;
  if (g_selection == -1) {
    // nothing selected, check feet and com
    if (x > g_feet[0].x - 10 && x < g_feet[0].x + 10 &&
        y > g_feet[0].y - 10 && y < g_feet[0].y + 10) {
        g_selection = 0;
    } else if (x > g_feet[1].x - 10 && x < g_feet[1].x + 10 &&
        y > g_feet[1].y - 10 && y < g_feet[1].y + 10) {
        g_selection = 1;
    } else if (x > g_feet[2].x - 10 && x < g_feet[2].x + 10 &&
        y > g_feet[2].y - 10 && y < g_feet[2].y + 10) {
        g_selection = 2;
    } else if (x > g_feet[3].x - 10 && x < g_feet[3].x + 10 &&
        y > g_feet[3].y - 10 && y < g_feet[3].y + 10) {
        g_selection = 3;
    } else if (x > g_com.x - 10 && x < g_com.x + 10 &&
        y > g_com.y - 10 && y < g_com.y + 10) {
        g_selection = 4;
    }
    if (g_selection != -1) {
      g_move_listener = cv.addEventListener('mousemove', cv_move, false);
    }
  } else {
    g_selection = -1;
    cv.removeEventListener('mousemove', cv_move, false);
  }
  redraw();
}

//------------------------------------------------------------------------------
//                                                             ROUND TO GRIDSIZE
//------------------------------------------------------------------------------
function round_to_gridsize(v) {
  var a = Math.abs(v);
  if (a % g_gridsize > 0.5 * g_gridsize) {
    a = Math.ceil(a / g_gridsize) * g_gridsize;
  } else {
    a = Math.floor(a / g_gridsize) * g_gridsize;
  }
  return v>0? a : -a;
}

//------------------------------------------------------------------------------
//                                                                       cv_move
//------------------------------------------------------------------------------
function cv_move(ev) {
  var x = ev.clientX - cv.offsetLeft - g_transform.x;
  var y = ev.clientY - cv.offsetTop - g_transform.y;
  // drop selected at pos
  if (g_selection < 4) {
    g_feet[g_selection].x = round_to_gridsize(x) ;
    g_feet[g_selection].y = round_to_gridsize(y);
  } else if (g_selection == 4) {
    g_com.x = round_to_gridsize(x);
    g_com.y = round_to_gridsize(y);
  }
  redraw();
  //cycle();
}

//------------------------------------------------------------------------------
//                                                                      KEYBOARD
//------------------------------------------------------------------------------
function keyboard(ev) {
  trace(ev.keyCode);
  trace(ev.key);
  if (ev.keyCode == 97 || ev.key == 'a') { // a
    g_transform.x -= g_gridsize;
    ctx.transform(1, 0, 0, 1, -g_gridsize, 0);
  } else if (ev.keyCode == 100 || ev.key == 'd') { // d
    g_transform.x += g_gridsize;
    ctx.transform(1, 0, 0, 1, g_gridsize, 0);
  } else if (ev.keyCode == 119 || ev.key == 'w') { // w
    g_transform.y -= g_gridsize;
    ctx.transform(1, 0, 0, 1, 0, -g_gridsize);
  } else if (ev.keyCode == 115 || ev.key == 's') { // s
    g_transform.y += g_gridsize;
    ctx.transform(1, 0, 0, 1, 0, g_gridsize);
  } else if (ev.keyCode == 118 || ev.key == 'v') { // v
    g_com.x += g_gridsize;
  } else if (ev.keyCode == 98 || ev.key == 'b') { // b
    redraw();
    cycle();
  } else if (ev.keyCode == 122 || ev.key == 'z') {
    for (var s, i = 0; s = g_springs[i]; ++i) { zero_force(s); }
    redraw();
  }
  redraw();
}

//------------------------------------------------------------------------------
//                                                                         CYCLE
//------------------------------------------------------------------------------
function cycle() {
  // movdir = x
  highF = 0;
  A = -1;
  for (var f, i = 0; f = g_feet[i]; ++i) {
    if (f.Fx > highF) {
      highF = f.Fx;
      A = i;
    }
  }
  if (highF > 0) {
    if (can_lift(A)) {
      while (g_feet[A].Fx > -50) {
        g_feet[A].x += g_gridsize;
        redraw();
      }
    } else {
      // ... do we even need this?
    }
  }
}

//------------------------------------------------------------------------------
//                                                                      CAN LIFT
//------------------------------------------------------------------------------
function can_lift(index) {
  feet = new Array();
  for (var i = 0; i < 4; ++i) {
    if ( i != index) feet.push(g_feet[i]);
  }
  return is_inside(g_com.x, g_com.y, feet[0], feet[1], feet[2]);
}

//------------------------------------------------------------------------------
//                                                                     IS INSIDE
//------------------------------------------------------------------------------
function is_inside(x, y, f1, f2, f3) {
  // f1 --> f2 and f1 --> xy
  var z1 = cross_product_z(f2.x - f1.x, f2.y - f1.y, x - f1.x, y - f1.y);
  // f1 --> f3 and f1 --> xy
  var z2 = cross_product_z(f3.x - f1.x, f3.y - f1.y, x - f1.x, y - f1.y);
  // f2 --> f1 and f2 --> xy
  var z3 = cross_product_z(f1.x - f2.x, f1.y - f2.y, x - f2.x, y - f2.y);
  // f2 --> f3 and f2 --> xy
  var z4 = cross_product_z(f3.x - f2.x, f3.y - f2.y, x - f2.x, y - f2.y);
  return ((z1*z2) < 0 && (z3*z4 < 0))
}

//------------------------------------------------------------------------------
//                                                                    ZERO FORCE
//------------------------------------------------------------------------------
// set spring x0 to current state
function zero_force(s) {
    s.x0 = Math.sqrt(Math.pow(s.b.x - s.a.x, 2) + Math.pow(s.b.y - s.a.y, 2));
}



//------------------------------------------------------------------------------
//                                                                         START
//------------------------------------------------------------------------------
function start() {
    cv = document.getElementById("cv");
        cv.addEventListener('click', cv_click, false);
    ctx = cv.getContext("2d");
        ctx.transform(1, 0, 0, 1, 300, 300);
        ctx.font = "16px sans-serif";
    window.addEventListener("keypress", keyboard, false);
    trace("start");
    redraw();
}

//------------------------------- global stuff ---------------------------------
var cv, ctx;
var g_feet = [
  {"x":150, "y":150, "Fx":0, "Fy":0},
  {"x":-150, "y":150, "Fx":0, "Fy":0},
  {"x":-150, "y":-150, "Fx":0, "Fy":0},
  {"x":150, "y":-150, "Fx":0, "Fy":0}];
var g_com = {"x":0, "y":0, "Fx":0, "Fy":0};
var g_springs = [
  {"a":g_feet[0], "b":g_feet[2], "K":1, "x0":0, "c":"green"},
  {"a":g_feet[1], "b":g_feet[3], "K":1, "x0":0, "c":"green"},
  {"a":g_feet[0], "b":g_feet[1], "K":1, "x0":0, "c":"green"},
  {"a":g_feet[1], "b":g_feet[2], "K":1, "x0":0, "c":"green"},
  {"a":g_feet[2], "b":g_feet[3], "K":1, "x0":0, "c":"green"},
  {"a":g_feet[3], "b":g_feet[0], "K":1, "x0":0, "c":"green"},
  {"a":g_com, "b":g_feet[0], "K":1, "x0":0, "c":"blue"},
  {"a":g_com, "b":g_feet[1], "K":1, "x0":0, "c":"blue"},
  {"a":g_com, "b":g_feet[2], "K":1, "x0":0, "c":"blue"},
  {"a":g_com, "b":g_feet[3], "K":1, "x0":0, "c":"blue"}];
for (var s, i = 0; s = g_springs[i]; ++i) { zero_force(s); }
var g_transform = {"x":300, "y":300};
var g_gridsize = 10;
var g_selection = -1;
var g_move_listener = -1;
var g_previous = -1;


