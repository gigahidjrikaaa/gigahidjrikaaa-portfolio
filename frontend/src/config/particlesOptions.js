// src/config/particlesOptions.js (or define directly in Hero.js)

// Use your theme colors defined in tailwind.config.js
// const primaryColor = '#1E3A8A';
const secondaryColor = '#4B5563'; 
// const accentColor = '#10B981'; 

const particlesOptions = {
  // background: { // Optional: Set background color here if not on the section
  //   color: {
  //     value: '#ffffff', // Match your site background
  //   },
  // },
  fpsLimit: 60, // Lower if performance is an issue (e.g., 30)
  interactivity: {
    detect_on: 'canvas', // Use 'canvas' for better performance
    events: {
      onHover: {
        enable: true,
        mode: 'grab', // Or 'bubble', 'repulse'
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 140,
        line_linked: { // Use line_linked or links property based on library version
          opacity: 0.8,
        },
        links: { // Newer property name
           opacity: 0.8,
           color: secondaryColor
        }
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3
      },
      repulse: {
        distance: 200,
        duration: 0.4
      }
    },
  },
  particles: {
    color: {
      value: secondaryColor, // Particle color
    },
    links: {
      color: secondaryColor, // Line color
      distance: 150,
      enable: true,
      opacity: 0.4, // Make lines subtle
      width: 1,
    },
    collisions: {
      enable: false, // Usually disable for performance unless needed
    },
    move: {
      direction: 'none', // 'top', 'bottom', 'left', 'right', or 'none'
      enable: true,
      outModes: { // Use outModes or out_mode based on library version
        default: 'bounce',
      },
       out_mode: 'bounce', // Older property name
      random: false,
      speed: 1, // Slow movement speed
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800, // Use value_area or area based on library version
        value_area: 800, // Adjust density
      },
      value: 50, // Number of particles (adjust for performance)
    },
    opacity: {
      value: 0.5, // Particle opacity
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 1, max: 3 }, // Random particle size
      random: true, // Older boolean property name
      anim: { // Older animation property name
         enable: false
      }
    },
  },
  detectRetina: true,
};

export default particlesOptions;