var blessed = require('blessed');
 
// Create a screen object. 
var screen = blessed.screen({
  smartCSR: true
});
 
screen.title = 'my window title';
 
// Create a box perfectly centered horizontally and vertically. 
var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Hello {bold}world{/bold}!',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'magenta',
    border: {
      fg: '#f0f0f0'
    },
    hover: {
      bg: 'green'
    }
  }
});
 
// Append our box to the screen. 
screen.append(box);
 
// Add a png icon to the box 
var icon = blessed.image({
  parent: box,
  top: 0,
  left: 0,
  type: 'overlay',
  width: 'shrink',
  height: 'shrink',
  file: __dirname + '/my-program-icon.png',
  search: false
});
