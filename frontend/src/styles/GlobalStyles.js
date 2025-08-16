import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Orbitron:wght@400;700;900&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
      linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    background-attachment: fixed;
    color: #e0e0e0;
    min-height: 100vh;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(0, 255, 200, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 200, 0.02) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 1;
  }

  code {
    font-family: 'JetBrains Mono', source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  .App {
    min-height: 100vh;
    position: relative;
    z-index: 2;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: 'JetBrains Mono', monospace;
    transition: all 0.3s ease;
  }

  input, select {
    outline: none;
    font-family: 'JetBrains Mono', monospace;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(15, 15, 35, 0.8);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #00ffaa, #0088cc);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #00cc88, #0066aa);
  }
`;

export default GlobalStyles;