import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

  /* Ultra Modern Database Techy Design System */
  :root {
    /* Electric Database Colors */
    --electric-blue: #00D9FF;
    --electric-blue-dark: #0099CC;
    --electric-purple: #8B5CF6;
    --electric-violet: #A78BFA;
    --data-green: #00FF88;
    --data-green-dark: #00CC6A;
    --neural-pink: #FF6B9D;
    --quantum-orange: #FF8C42;
    
    /* Database Grays */
    --terminal-black: #0D1117;
    --console-dark: #161B22;
    --panel-gray: #21262D;
    --border-gray: #30363D;
    --muted-gray: #656D76;
    --bright-gray: #F0F6FC;
    
    /* Advanced Backgrounds */
    --bg-database: 
      radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(0, 217, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 90%, rgba(0, 255, 136, 0.05) 0%, transparent 50%),
      linear-gradient(135deg, #0D1117 0%, #161B22 50%, #21262D 100%);
      
    /* Multi-layer Glassmorphism */
    --glass-primary: rgba(255, 255, 255, 0.1);
    --glass-secondary: rgba(0, 217, 255, 0.08);
    --glass-accent: rgba(139, 92, 246, 0.06);
    --glass-border-blue: rgba(0, 217, 255, 0.2);
    --glass-border-purple: rgba(139, 92, 246, 0.15);
    --glass-border-subtle: rgba(255, 255, 255, 0.08);
    
    /* Text Hierarchy */
    --text-primary: #F0F6FC;
    --text-secondary: #C9D1D9;
    --text-muted: #8B949E;
    --text-electric: var(--electric-blue);
    --text-accent: var(--data-green);
    
    /* Advanced Shadows */
    --shadow-data: 0 8px 32px rgba(0, 217, 255, 0.15);
    --shadow-neural: 0 8px 32px rgba(139, 92, 246, 0.12);
    --shadow-console: 0 4px 24px rgba(0, 0, 0, 0.4);
    --shadow-glow-blue: 0 0 20px rgba(0, 217, 255, 0.3);
    --shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.25);
    
    /* Advanced Blur */
    --blur-light: blur(12px);
    --blur-medium: blur(20px);
    --blur-heavy: blur(32px);
    
    /* Data Flow Animations */
    --flow-speed: 2s;
    --pulse-speed: 1.5s;
  }

  @keyframes dataFlow {
    0% { 
      background-position: 0% 0%;
      opacity: 0.3;
    }
    50% {
      opacity: 0.8;
    }
    100% { 
      background-position: 100% 100%;
      opacity: 0.3;
    }
  }

  @keyframes neuralPulse {
    0%, 100% { 
      opacity: 0.4;
      transform: scale(1);
    }
    50% { 
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  @keyframes connectionLine {
    0% { 
      stroke-dashoffset: 100;
      opacity: 0.2;
    }
    50% {
      opacity: 0.8;
    }
    100% { 
      stroke-dashoffset: 0;
      opacity: 0.2;
    }
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--bg-database);
    background-attachment: fixed;
    color: var(--text-secondary);
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.6;
    letter-spacing: -0.01em;
    position: relative;
  }

  /* Data Connection Network */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      /* Data grid */
      linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px),
      /* Neural connections */
      radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 30%),
      radial-gradient(circle at 80% 70%, rgba(0, 255, 136, 0.05) 0%, transparent 25%),
      radial-gradient(circle at 50% 10%, rgba(0, 217, 255, 0.06) 0%, transparent 35%);
    background-size: 60px 60px, 60px 60px, 400px 400px, 500px 500px, 300px 300px;
    pointer-events: none;
    z-index: 1;
    animation: dataFlow var(--flow-speed) ease-in-out infinite;
  }

  /* Floating data particles */
  body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 15% 80%, rgba(255, 107, 157, 0.04) 0%, transparent 20%),
      radial-gradient(circle at 85% 20%, rgba(255, 140, 66, 0.03) 0%, transparent 15%),
      radial-gradient(circle at 60% 60%, rgba(139, 92, 246, 0.02) 0%, transparent 25%);
    background-size: 800px 800px, 600px 600px, 1000px 1000px;
    pointer-events: none;
    z-index: 1;
    animation: neuralPulse var(--pulse-speed) ease-in-out infinite;
  }

  code {
    font-family: 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
    font-size: 0.875rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.125rem 0.25rem;
    border-radius: 4px;
  }

  .App {
    min-height: 100vh;
    position: relative;
    z-index: 2;
  }

  /* Ultra Modern Button Styling */
  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }
    
    &:hover::before {
      left: 100%;
    }
    
    &:focus-visible {
      outline: 2px solid var(--electric-blue);
      outline-offset: 2px;
      box-shadow: var(--shadow-glow-blue);
    }
  }

  /* Database Input Styling */
  input, select {
    outline: none;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 400;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:focus {
      outline: 2px solid var(--electric-blue);
      outline-offset: -2px;
      box-shadow: var(--shadow-glow-blue);
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* Database Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--console-dark);
    border-left: 1px solid var(--electric-blue);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--electric-blue), var(--electric-purple));
    border-radius: 4px;
    box-shadow: var(--shadow-glow-blue);
    
    &:hover {
      background: linear-gradient(180deg, var(--data-green), var(--electric-blue));
    }
  }

  ::-webkit-scrollbar-corner {
    background: var(--console-dark);
  }

  /* Advanced Glass Components */
  .neural-glass {
    background: 
      var(--glass-secondary),
      var(--glass-primary);
    backdrop-filter: var(--blur-medium);
    -webkit-backdrop-filter: var(--blur-medium);
    border: 1px solid var(--glass-border-blue);
    border-radius: 12px;
    box-shadow: var(--shadow-data);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(0, 217, 255, 0.05) 0%, 
        transparent 50%, 
        rgba(139, 92, 246, 0.03) 100%
      );
      pointer-events: none;
    }
  }

  .data-node {
    background: var(--glass-accent);
    backdrop-filter: var(--blur-light);
    border: 1px solid var(--glass-border-purple);
    border-radius: 8px;
    box-shadow: var(--shadow-neural);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: var(--shadow-glow-purple);
      border-color: var(--electric-purple);
    }
  }

  /* Database Button Variants */
  .btn-electric {
    background: linear-gradient(135deg, var(--electric-blue), var(--electric-purple));
    color: white;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    box-shadow: var(--shadow-data);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow-blue);
    }
  }

  .btn-data {
    background: linear-gradient(135deg, var(--data-green), var(--electric-blue));
    color: var(--terminal-black);
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    box-shadow: var(--shadow-neural);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 25px rgba(0, 255, 136, 0.4);
    }
  }
`;

export default GlobalStyles;