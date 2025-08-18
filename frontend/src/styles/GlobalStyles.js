import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap');

  /* Clean Tech Design System */
  :root {
    /* Silicon Valley Color Palette */
    --primary-blue: #0066CC;
    --primary-blue-hover: #0052A3;
    --primary-blue-dark: #004080;
    
    /* Modern Grays */
    --gray-50: #F8FAFC;
    --gray-100: #F1F5F9;
    --gray-200: #E2E8F0;
    --gray-300: #CBD5E1;
    --gray-400: #94A3B8;
    --gray-500: #64748B;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1E293B;
    --gray-900: #0F172A;
    
    /* Tech Accents */
    --accent-green: #10B981;
    --accent-green-light: #34D399;
    --accent-emerald: #059669;
    
    /* Clean Backgrounds */
    --bg-dark: linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%);
    --bg-gradient: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%);
    
    /* Glassmorphism */
    --glass-bg: rgba(255, 255, 255, 0.08);
    --glass-bg-strong: rgba(255, 255, 255, 0.12);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-border-strong: rgba(255, 255, 255, 0.15);
    
    /* Text Colors */
    --text-primary: #FFFFFF;
    --text-secondary: #F3F4F6;
    --text-muted: #9CA3AF;
    --text-accent: var(--primary-blue);
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.15);
    --shadow-xl: 0 20px 64px rgba(0, 0, 0, 0.25);
    
    /* Blur Effects */
    --blur-sm: blur(8px);
    --blur-md: blur(16px);
    --blur-lg: blur(24px);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--bg-gradient);
    background-attachment: fixed;
    color: var(--text-secondary);
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.5;
    letter-spacing: -0.025em;
  }

  /* Subtle noise texture for depth */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 25% 25%, rgba(102, 102, 204, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: 1;
    opacity: 0.6;
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

  /* Professional Button Styling */
  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 8px;
    
    &:focus-visible {
      outline: 2px solid var(--primary-blue);
      outline-offset: 2px;
    }
  }

  /* Clean Input Styling */
  input, select {
    outline: none;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:focus {
      outline: 2px solid var(--primary-blue);
      outline-offset: -2px;
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* Professional Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--gray-600);
    border-radius: 3px;
    
    &:hover {
      background: var(--gray-500);
    }
  }

  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* Glassmorphism Utility Classes */
  .glass-container {
    background: var(--glass-bg);
    backdrop-filter: var(--blur-md);
    -webkit-backdrop-filter: var(--blur-md);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
  }

  .glass-strong {
    background: var(--glass-bg-strong);
    border: 1px solid var(--glass-border-strong);
  }

  /* Modern Button Styles */
  .btn-primary {
    background: var(--primary-blue);
    color: white;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    
    &:hover {
      background: var(--primary-blue-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 102, 204, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
`;

export default GlobalStyles;