// Custom cursor
const cursor = document.getElementById('cursor');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

// Create ring element
const ring = document.createElement('div');
ring.id = 'cursor-ring';
document.body.appendChild(ring);

// Styles
Object.assign(cursor.style, {
  position: 'fixed',
  width: '8px',
  height: '8px',
  background: '#c8f135',
  borderRadius: '50%',
  pointerEvents: 'none',
  zIndex: '9999',
  transform: 'translate(-50%, -50%)',
  transition: 'width 0.2s, height 0.2s, background 0.2s',
});

Object.assign(ring.style, {
  position: 'fixed',
  width: '36px',
  height: '36px',
  border: '1px solid rgba(200, 241, 53, 0.5)',
  borderRadius: '50%',
  pointerEvents: 'none',
  zIndex: '9998',
  transform: 'translate(-50%, -50%)',
  transition: 'width 0.3s, height 0.3s, border-color 0.3s',
});

// Track mouse
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

// Smooth ring follow
function animateRing() {
  ringX += (mouseX - ringX) * 0.1;
  ringY += (mouseY - ringY) * 0.1;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Hover effects - event delegation
document.body.addEventListener('mouseover', e => {
  if (e.target.closest('a, button')) {
    cursor.style.width = '12px';
    cursor.style.height = '12px';
    ring.style.width = '52px';
    ring.style.height = '52px';
    ring.style.borderColor = 'rgba(200, 241, 53, 0.9)';
  }
});

document.body.addEventListener('mouseout', e => {
  if (e.target.closest('a, button')) {
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    ring.style.width = '36px';
    ring.style.height = '36px';
    ring.style.borderColor = 'rgba(200, 241, 53, 0.5)';
  }
});