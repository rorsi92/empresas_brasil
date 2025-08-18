import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import empresaService from '../services/empresaService';

const Container = styled.div`
  min-height: 100vh;
  background: transparent;
  position: relative;
`;

const Header = styled.header`
  background: 
    var(--glass-secondary),
    var(--glass-primary);
  backdrop-filter: var(--blur-heavy);
  -webkit-backdrop-filter: var(--blur-heavy);
  border-bottom: 2px solid var(--glass-border-blue);
  color: var(--text-primary);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-data);
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: hidden;
  
  /* Data flow effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent, 
      var(--electric-blue), 
      var(--data-green),
      var(--electric-purple), 
      transparent
    );
    animation: dataFlow 3s ease-in-out infinite;
  }
  
  /* Neural network overlay */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(0, 217, 255, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 35%);
    pointer-events: none;
    animation: neuralPulse var(--pulse-speed) ease-in-out infinite;
  }
`;

const Title = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 10;
  
  /* Electric gradient effect */
  background: linear-gradient(135deg, 
    var(--electric-blue) 0%,
    var(--text-primary) 30%,
    var(--electric-purple) 60%,
    var(--data-green) 100%
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: dataFlow 4s ease-in-out infinite;
  
  /* Data terminal prefix */
  &::before {
    content: 'DB://';
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: var(--data-green);
    margin-right: 0.5rem;
    opacity: 0.8;
    -webkit-text-fill-color: var(--data-green);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoutButton = styled.button`
  background: var(--glass-accent);
  backdrop-filter: var(--blur-medium);
  border: 1px solid var(--glass-border-purple);
  color: var(--text-secondary);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 10;
  overflow: hidden;
  
  /* Terminal style prefix */
  &::after {
    content: 'EXIT';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    opacity: 0;
    color: var(--neural-pink);
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    background: rgba(255, 107, 157, 0.1);
    border-color: var(--neural-pink);
    color: var(--neural-pink);
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(255, 107, 157, 0.3);
    
    &::after {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Content = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const SearchSection = styled.section`
  background: 
    var(--glass-secondary),
    var(--glass-primary);
  backdrop-filter: var(--blur-medium);
  -webkit-backdrop-filter: var(--blur-medium);
  border-radius: 12px;
  padding: 2.5rem 2rem 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--glass-border-blue);
  box-shadow: var(--shadow-data);
  position: relative;
  overflow: hidden;
  
  /* Query console header */
  &::before {
    content: 'QUERY_CONSOLE.SQL';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(90deg, var(--electric-blue), var(--electric-purple));
    color: var(--terminal-black);
    padding: 0.5rem 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--glass-border-blue);
  }
  
  /* Data connection lines */
  &::after {
    content: '';
    position: absolute;
    top: 2.5rem;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 15% 25%, rgba(0, 217, 255, 0.08) 0%, transparent 35%),
      radial-gradient(circle at 85% 75%, rgba(139, 92, 246, 0.06) 0%, transparent 30%),
      linear-gradient(135deg, transparent, rgba(0, 255, 136, 0.02), transparent);
    pointer-events: none;
    animation: neuralPulse 3s ease-in-out infinite;
  }
`;


const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 10;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  
  /* Data node connection */
  &::before {
    content: '';
    position: absolute;
    top: -0.5rem;
    left: -0.5rem;
    width: 4px;
    height: 4px;
    background: var(--electric-blue);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--electric-blue);
    animation: neuralPulse 2s ease-in-out infinite;
  }
`;

const Label = styled.label`
  color: var(--text-electric);
  margin-bottom: 0.6rem;
  font-weight: 600;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  
  /* Terminal prompt style */
  &::before {
    content: '$ ';
    color: var(--data-green);
    margin-right: 0.25rem;
  }
`;

const Select = styled.select`
  background: var(--glass-accent);
  border: 1px solid var(--glass-border-purple);
  color: var(--text-secondary);
  padding: 0.875rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  backdrop-filter: var(--blur-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-neural);
  
  &:hover {
    border-color: var(--electric-purple);
    background: rgba(139, 92, 246, 0.1);
    box-shadow: var(--shadow-glow-purple);
  }
  
  &:focus {
    border-color: var(--electric-blue);
    box-shadow: var(--shadow-glow-blue);
    background: rgba(0, 217, 255, 0.08);
  }
  
  option {
    background: var(--console-dark);
    color: var(--text-secondary);
    padding: 0.5rem;
    font-family: 'JetBrains Mono', monospace;
  }
`;

const Input = styled.input`
  background: var(--glass-secondary);
  border: 1px solid var(--glass-border-blue);
  color: var(--text-primary);
  padding: 0.875rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  backdrop-filter: var(--blur-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-data);
  
  &:hover {
    border-color: var(--electric-blue);
    background: rgba(0, 217, 255, 0.08);
    box-shadow: var(--shadow-glow-blue);
  }
  
  &:focus {
    border-color: var(--data-green);
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    background: rgba(0, 255, 136, 0.06);
  }
  
  &::placeholder {
    color: var(--muted-gray);
    font-style: italic;
    font-weight: 400;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, var(--data-green), var(--electric-blue));
  border: 1px solid var(--data-green);
  color: var(--terminal-black);
  padding: 1rem 2.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.875rem;
  font-family: 'Space Grotesk', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-data);
  position: relative;
  overflow: hidden;
  
  /* Execute indicator */
  &::after {
    content: 'EXECUTE';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, var(--electric-purple), var(--neural-pink));
    border-color: var(--electric-purple);
    color: var(--text-primary);
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
    
    &::after {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: var(--shadow-neural);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: var(--shadow-neural);
    
    &::after {
      opacity: 0;
    }
  }
`;

const ResultsSection = styled.section`
  background: var(--glass-bg);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
  position: relative;
  
  /* Subtle inner highlight */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.01) 0%, 
      transparent 50%, 
      rgba(16, 185, 129, 0.01) 100%
    );
    border-radius: 16px;
    pointer-events: none;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ResultsTitle = styled.h2`
  color: #00ffaa;
  margin: 0;
`;

const ResultsInfo = styled.div`
  color: #a0a0a0;
  font-size: 0.9rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 3280px;
  font-size: 0.8rem;
  table-layout: fixed;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--glass-border);
`;

const Th = styled.th`
  background: var(--glass-bg-strong);
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--glass-border);
  border-right: 1px solid var(--glass-border);
  font-size: 0.75rem;
  white-space: nowrap;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  backdrop-filter: var(--blur-sm);
  
  &:last-child {
    border-right: none;
  }
  
  &:nth-child(1) { width: 120px; } /* CNPJ */
  &:nth-child(2) { width: 200px; } /* Razão Social */
  &:nth-child(3) { width: 150px; } /* Nome Fantasia */
  &:nth-child(4) { width: 80px; } /* Matriz/Filial */
  &:nth-child(5) { width: 250px; } /* Endereço */
  &:nth-child(6) { width: 50px; } /* UF */
  &:nth-child(7) { width: 120px; } /* Município */
  &:nth-child(8) { width: 80px; } /* CEP */
  &:nth-child(9) { width: 120px; } /* Telefones */
  &:nth-child(10) { width: 150px; } /* Email */
  &:nth-child(11) { width: 80px; } /* Situação */
  &:nth-child(12) { width: 90px; } /* Data Situação */
  &:nth-child(13) { width: 80px; } /* CNAE Principal */
  &:nth-child(14) { width: 180px; } /* Descrição CNAE */
  &:nth-child(15) { width: 150px; } /* CNAE Secundária */
  &:nth-child(16) { width: 90px; } /* Data Início */
  &:nth-child(17) { width: 150px; } /* Natureza Jurídica */
  &:nth-child(18) { width: 100px; } /* Porte */
  &:nth-child(19) { width: 100px; } /* Capital Social */
  &:nth-child(20) { width: 100px; } /* Simples Nacional */
  &:nth-child(21) { width: 100px; } /* MEI */
  &:nth-child(22) { width: 320px; } /* Sócios */
  &:nth-child(23) { width: 280px; } /* Representantes */
`;

const Td = styled.td`
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--glass-border);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: 0.8rem;
  vertical-align: top;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:last-child {
    border-right: none;
  }
  
  &:nth-child(1) { width: 120px; } /* CNPJ */
  &:nth-child(2) { width: 200px; } /* Razão Social */
  &:nth-child(3) { width: 150px; } /* Nome Fantasia */
  &:nth-child(4) { width: 80px; } /* Matriz/Filial */
  &:nth-child(5) { width: 250px; } /* Endereço */
  &:nth-child(6) { width: 50px; } /* UF */
  &:nth-child(7) { width: 120px; } /* Município */
  &:nth-child(8) { width: 80px; } /* CEP */
  &:nth-child(9) { width: 120px; } /* Telefones */
  &:nth-child(10) { width: 150px; } /* Email */
  &:nth-child(11) { width: 80px; } /* Situação */
  &:nth-child(12) { width: 90px; } /* Data Situação */
  &:nth-child(13) { width: 80px; } /* CNAE Principal */
  &:nth-child(14) { width: 180px; } /* Descrição CNAE */
  &:nth-child(15) { width: 150px; } /* CNAE Secundária */
  &:nth-child(16) { width: 90px; } /* Data Início */
  &:nth-child(17) { width: 150px; } /* Natureza Jurídica */
  &:nth-child(18) { width: 100px; } /* Porte */
  &:nth-child(19) { width: 100px; } /* Capital Social */
  &:nth-child(20) { width: 100px; } /* Simples Nacional */
  &:nth-child(21) { width: 100px; } /* MEI */
  &:nth-child(22) { width: 320px; } /* Sócios */
  &:nth-child(23) { width: 280px; } /* Representantes */
`;

const Tr = styled.tr`
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:nth-child(even) {
    background: rgba(255, 255, 255, 0.015);
  }
  
  &:hover {
    background: rgba(0, 102, 204, 0.08);
    transform: scale(1.001);
  }
`;

const SegmentFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CnaeCard = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 170, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 255, 170, 0.2);
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CnaeTitle = styled.h4`
  color: #00ffaa;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
`;

const CnaeList = styled.div`
  color: #e0e0e0;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const CnaeItem = styled.div`
  margin-bottom: 0.3rem;
  padding: 0.2rem 0;
  border-left: 2px solid rgba(0, 255, 170, 0.3);
  padding-left: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ProgressContainer = styled.div`
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 255, 170, 0.3);
  text-align: center;
`;

const ProgressTitle = styled.h3`
  color: #00ffaa;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: var(--glass-bg);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  margin-bottom: 1rem;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--primary-blue), var(--accent-green));
  border-radius: 6px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  width: ${props => props.width}%;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    border-radius: 6px;
  }
`;

const ProgressText = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
`;

const ProgressSubtext = styled.div`
  color: #a0a0a0;
  font-size: 0.9rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 170, 0.2);
`;

const PageButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #00ffaa, #00ccff)' : 'rgba(0, 255, 170, 0.1)'};
  border: 1px solid rgba(0, 255, 170, 0.3);
  color: ${props => props.active ? '#000' : '#00ffaa'};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : '500'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #00ffaa, #00ccff)' : 'rgba(0, 255, 170, 0.2)'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  const [filters, setFilters] = useState({
    segmentoNegocio: '',
    uf: '',
    situacaoCadastral: '',
    motivoSituacao: '',
    qualificacaoSocio: '',
    naturezaJuridica: '',
    cnpj: '',
    razaoSocial: '',
    nomeSocio: '',
    cnaePrincipal: '',
    matrizFilial: '',
    temContato: '',
    capitalSocial: '',
    porteEmpresa: ''
  });
  
  const [companyLimit, setCompanyLimit] = useState(1000);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedSocios, setExpandedSocios] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    businessSegments: [],
    ufs: [],
    situacaoCadastral: [],
    motivoSituacao: [],
    qualificacaoSocio: [],
    naturezaJuridica: []
  });

  useEffect(() => {
    loadFiltersData();
  }, []);

  const loadFiltersData = async () => {
    try {
      const data = await empresaService.getFilterOptions();
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
      toast.error('Erro ao carregar opções de filtros');
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSearch = async (page = 1) => {
    // Validate at least one filter is selected
    const hasFilter = Object.values(filters).some(value => value && value.trim() !== '');
    if (!hasFilter) {
      toast.error('Selecione pelo menos um filtro para buscar');
      return;
    }

    setLoading(true);
    setEmpresas([]);
    let progressInterval = null;
    
    // Progress bar for large queries
    if (companyLimit >= 10000) {
      setShowProgress(true);
      setProgress(5);
      toast.info(`Buscando ${companyLimit.toLocaleString()} empresas...`);

      // Simulate realistic progress
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            return Math.min(prev + 1, 95);
          }
          return Math.min(prev + Math.random() * 10 + 2, 85);
        });
      }, 800);
    }

    try {
      const searchData = {
        ...filters,
        companyLimit,
        page
      };

      // Timeout customizado para consultas grandes
      const timeoutMs = companyLimit >= 25000 ? 180000 : 120000; // 3min para 25k+, 2min para outros
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch('/api/companies/filtered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      
      // Clear progress interval FIRST
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgress(100);
      }
      
      if (data.success) {
        
        if (page === 1) {
          setEmpresas(data.data);
        } else {
          setEmpresas(prev => [...prev, ...data.data]);
        }
        
        setCurrentPage(page);
        setTotalPages(Math.ceil(companyLimit / 1000));
        
        console.log('📊 Dados recebidos:', {
          empresasCount: data.data.length,
          currentPage: page,
          totalPages: Math.ceil(companyLimit / 1000)
        });
        
        if (page === 1) {
          toast.success(`✅ Página ${page}/${Math.ceil(companyLimit / 1000)} carregada - ${data.data.length} empresas`);
        } else {
          toast.success(`✅ Página ${page} carregada - ${data.data.length} empresas`);
        }
        
        // Hide progress bar after showing success
        setTimeout(() => {
          setShowProgress(false);
          setProgress(0);
        }, 2000);
      } else {
        console.error('API Error:', data);
        toast.error(data.message || 'Erro na busca');
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        setShowProgress(false);
        setProgress(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      if (error.name === 'AbortError') {
        toast.error(`Consulta cancelada - limite de tempo excedido (${companyLimit >= 25000 ? '3' : '2'} minutos). Tente filtros mais específicos.`);
      } else {
        toast.error('Erro na busca: ' + (error.message || 'Erro desconhecido'));
      }
      
      setShowProgress(false);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const toggleSocios = (empresaIndex) => {
    setExpandedSocios(prev => ({
      ...prev,
      [empresaIndex]: !prev[empresaIndex]
    }));
  };

  const [expandedRepresentantes, setExpandedRepresentantes] = useState({});
  
  const toggleRepresentantes = (empresaIndex) => {
    setExpandedRepresentantes(prev => ({
      ...prev,
      [empresaIndex]: !prev[empresaIndex]
    }));
  };

  const formatCapitalSocial = (valor) => {
    if (!valor) return '-';
    try {
      const num = parseFloat(valor);
      if (isNaN(num)) return '-';
      return num.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      });
    } catch (error) {
      return '-';
    }
  };


  return (
    <Container>
      <Header>
        <Title>🏢 Empresas Brasil</Title>
        <UserInfo>
          <span>Olá, {user?.email}</span>
          <LogoutButton onClick={logout}>Sair</LogoutButton>
        </UserInfo>
      </Header>

      <Content>
        <SearchSection>
          <h3 style={{ color: '#00ffaa', marginBottom: '1.5rem' }}>Filtros de Busca</h3>
          
          <FiltersGrid>
            <FormGroup>
              <Label>Segmento de Negócio</Label>
              <Select
                name="segmentoNegocio"
                value={filters.segmentoNegocio}
                onChange={handleInputChange}
              >
                <option value="">Todos os segmentos</option>
                {filterOptions.businessSegments && filterOptions.businessSegments.map(segment => (
                  <option key={segment.id} value={segment.id}>
                    {segment.icon} {segment.name} - {segment.description}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Estado (UF)</Label>
              <Select
                name="uf"
                value={filters.uf}
                onChange={handleInputChange}
              >
                <option value="">Todos os estados</option>
                {filterOptions.ufs && filterOptions.ufs.map(uf => (
                  <option key={uf.code} value={uf.code}>
                    {uf.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Situação Cadastral</Label>
              <Select
                name="situacaoCadastral"
                value={filters.situacaoCadastral}
                onChange={handleInputChange}
              >
                <option value="">Todas as situações</option>
                {filterOptions.situacaoCadastral && filterOptions.situacaoCadastral.map(situacao => (
                  <option key={situacao.code} value={situacao.code}>
                    {situacao.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Motivo da Situação</Label>
              <Select
                name="motivoSituacao"
                value={filters.motivoSituacao}
                onChange={handleInputChange}
              >
                <option value="">Todos os motivos</option>
                {filterOptions.motivoSituacao && filterOptions.motivoSituacao.map(motivo => (
                  <option key={motivo.code} value={motivo.code}>
                    {motivo.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Qualificação do Sócio</Label>
              <Select
                name="qualificacaoSocio"
                value={filters.qualificacaoSocio}
                onChange={handleInputChange}
              >
                <option value="">Todas as qualificações</option>
                {filterOptions.qualificacaoSocio && filterOptions.qualificacaoSocio.map(qualificacao => (
                  <option key={qualificacao.code} value={qualificacao.code}>
                    {qualificacao.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Natureza Jurídica</Label>
              <Select
                name="naturezaJuridica"
                value={filters.naturezaJuridica}
                onChange={handleInputChange}
              >
                <option value="">Todas as naturezas</option>
                {filterOptions.naturezaJuridica && filterOptions.naturezaJuridica.map(natureza => (
                  <option key={natureza.code} value={natureza.code}>
                    {natureza.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>CNPJ</Label>
              <Input
                type="text"
                name="cnpj"
                value={filters.cnpj}
                onChange={handleInputChange}
                placeholder="Digite o CNPJ"
              />
            </FormGroup>

            <FormGroup>
              <Label>Razão Social</Label>
              <Input
                type="text"
                name="razaoSocial"
                value={filters.razaoSocial}
                onChange={handleInputChange}
                placeholder="Digite a razão social"
              />
            </FormGroup>

            <FormGroup>
              <Label>Nome do Sócio</Label>
              <Input
                type="text"
                name="nomeSocio"
                value={filters.nomeSocio}
                onChange={handleInputChange}
                placeholder="Digite o nome do sócio"
              />
            </FormGroup>

            <FormGroup>
              <Label>CNAE Principal</Label>
              <Input
                type="text"
                name="cnaePrincipal"
                value={filters.cnaePrincipal}
                onChange={handleInputChange}
                placeholder="Digite o código CNAE"
              />
            </FormGroup>

            <FormGroup>
              <Label>Matriz/Filial</Label>
              <Select
                name="matrizFilial"
                value={filters.matrizFilial}
                onChange={handleInputChange}
              >
                <option value="">Todos</option>
                <option value="1">Matriz</option>
                <option value="2">Filial</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Tem Contato</Label>
              <Select
                name="temContato"
                value={filters.temContato}
                onChange={handleInputChange}
              >
                <option value="">Todos</option>
                <option value="sim">📞 Com Telefone/Email</option>
                <option value="nao">❌ Sem Contato</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Porte da Empresa</Label>
              <Select
                name="porteEmpresa"
                value={filters.porteEmpresa}
                onChange={handleInputChange}
              >
                <option value="">Todos os portes</option>
                <option value="01">🏢 Micro Empresa</option>
                <option value="03">🏭 Empresa de Pequeno Porte</option>
                <option value="05">🏗️ Demais</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Capital Social Mínimo</Label>
              <Input
                type="number"
                name="capitalSocial"
                value={filters.capitalSocial}
                onChange={handleInputChange}
                placeholder="Valor mínimo"
              />
            </FormGroup>

            <FormGroup>
              <Label>Limite de Empresas</Label>
              <Select
                value={companyLimit}
                onChange={(e) => setCompanyLimit(Number(e.target.value))}
              >
                <option value="1000">1.000 empresas</option>
                <option value="5000">5.000 empresas</option>
                <option value="10000">10.000 empresas</option>
                <option value="25000">25.000 empresas</option>
                <option value="50000">50.000 empresas</option>
              </Select>
            </FormGroup>
          </FiltersGrid>

          <SearchButton onClick={() => {
            setCurrentPage(1);
            setEmpresas([]);
            handleSearch(1);
          }} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar Empresas'}
          </SearchButton>
        </SearchSection>

        {showProgress && (
          <ProgressContainer>
            <ProgressTitle>🔍 Processando Consulta</ProgressTitle>
            <ProgressBarContainer>
              <ProgressBar width={progress} />
            </ProgressBarContainer>
            <ProgressText>
              {progress < 100 
                ? `Processando... ${Math.round(progress)}%`
                : 'Finalizando consulta...'
              }
            </ProgressText>
            <ProgressSubtext>
              Buscando {companyLimit.toLocaleString()} empresas na base de dados
            </ProgressSubtext>
          </ProgressContainer>
        )}

        {empresas.length > 0 && (
          <ResultsSection>
            <ResultsHeader>
              <ResultsTitle>Resultados da Busca</ResultsTitle>
              <ResultsInfo>
                {empresas.length} empresas encontradas 
                {totalPages > 1 && `(Página ${currentPage}/${totalPages})`}
              </ResultsInfo>
            </ResultsHeader>

            <div style={{ overflowX: 'auto' }}>
              <Table>
                <thead>
                  <tr>
                    <Th>CNPJ</Th>
                    <Th>Razão Social</Th>
                    <Th>Nome Fantasia</Th>
                    <Th>Matriz/Filial</Th>
                    <Th>Endereço Completo</Th>
                    <Th>UF</Th>
                    <Th>Município</Th>
                    <Th>CEP</Th>
                    <Th>Telefones</Th>
                    <Th>Email</Th>
                    <Th>Situação</Th>
                    <Th>Data Situação</Th>
                    <Th>CNAE Principal</Th>
                    <Th>Descrição CNAE</Th>
                    <Th>CNAE Secundária</Th>
                    <Th>Data Início</Th>
                    <Th>Natureza Jurídica</Th>
                    <Th>Porte</Th>
                    <Th>Capital Social</Th>
                    <Th>Simples Nacional</Th>
                    <Th>MEI</Th>
                    <Th>Sócios/Diretores</Th>
                    <Th>Representantes Legais</Th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa, index) => (
                    <Tr key={empresa.cnpj || index}>
                      <Td>{formatCNPJ(empresa.cnpj)}</Td>
                      <Td>{empresa.razaoSocial || '-'}</Td>
                      <Td>{empresa.nomeFantasia || '-'}</Td>
                      <Td>{empresa.matrizFilial || '-'}</Td>
                      <Td>
                        {empresa.tipoLogradouro} {empresa.logradouro}
                        {empresa.numero && `, ${empresa.numero}`}
                        {empresa.complemento && ` - ${empresa.complemento}`}
                        <br />{empresa.bairro}
                      </Td>
                      <Td>{empresa.uf}</Td>
                      <Td>{empresa.municipioDescricao || empresa.municipio || '-'}</Td>
                      <Td>{empresa.cep || '-'}</Td>
                      <Td>
                        {empresa.telefone1 && <div>📞 ({empresa.ddd1}) {empresa.telefone1}</div>}
                        {empresa.telefone2 && <div>📞 ({empresa.ddd2}) {empresa.telefone2}</div>}
                        {empresa.fax && <div>📠 ({empresa.dddFax}) {empresa.fax}</div>}
                      </Td>
                      <Td>{empresa.email || '-'}</Td>
                      <Td>{empresa.situacaoDescricao || '-'}</Td>
                      <Td>{empresa.dataSituacao || '-'}</Td>
                      <Td>{empresa.cnaePrincipal || '-'}</Td>
                      <Td>{empresa.cnaeDescricao || '-'}</Td>
                      <Td>{empresa.cnaeSecundaria || '-'}</Td>
                      <Td>{empresa.dataInicioAtividades || '-'}</Td>
                      <Td>{empresa.naturezaJuridicaDescricao || '-'}</Td>
                      <Td>{empresa.porteDescricao || '-'}</Td>
                      <Td>{formatCapitalSocial(empresa.capitalSocial)}</Td>
                      <Td>
                        {empresa.opcaoSimples === 'S' ? '✅ Sim' : empresa.opcaoSimples === 'N' ? '❌ Não' : '-'}
                        {empresa.dataOpcaoSimples && <div style={{fontSize: '0.7rem'}}>Desde: {empresa.dataOpcaoSimples}</div>}
                      </Td>
                      <Td>
                        {empresa.opcaoMei === 'S' ? '✅ Sim' : empresa.opcaoMei === 'N' ? '❌ Não' : '-'}
                        {empresa.dataOpcaoMei && <div style={{fontSize: '0.7rem'}}>Desde: {empresa.dataOpcaoMei}</div>}
                      </Td>
                      <Td>
                        {empresa.socios && empresa.socios.length > 0 ? (
                          <div>
                            <div 
                              style={{
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                marginBottom: expandedSocios[index] ? '8px' : '0'
                              }}
                              onClick={() => toggleSocios(index)}
                            >
                              <span style={{fontSize: '12px', color: '#00ffaa'}}>
                                {expandedSocios[index] ? '▼' : '▶'}
                              </span>
                              <div style={{fontSize: '0.8rem'}}>
                                <div><strong style={{color: '#00ffaa'}}>{empresa.socios[0].nome}</strong></div>
                                <div style={{fontSize: '0.7rem', color: '#999'}}>
                                  {empresa.socios.length > 1 && `+${empresa.socios.length - 1} sócio${empresa.socios.length > 2 ? 's' : ''}`}
                                </div>
                              </div>
                            </div>
                            {expandedSocios[index] && (
                              <div style={{marginLeft: '20px', maxHeight: '200px', overflowY: 'auto'}}>
                                {empresa.socios.map((socio, socioIndex) => (
                                  <div key={socioIndex} style={{
                                    marginBottom: '8px', 
                                    fontSize: '0.75rem', 
                                    borderBottom: '1px solid rgba(0,255,170,0.1)', 
                                    paddingBottom: '6px',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.3'
                                  }}>
                                    <div><strong style={{color: '#00ffaa'}}>{socio.nome}</strong></div>
                                    <div style={{color: '#ccc', marginTop: '2px'}}>{socio.qualificacao_descricao}</div>
                                    <div style={{color: '#999', marginTop: '1px'}}>CPF: {socio.cpf_cnpj}</div>
                                    <div style={{color: '#999', marginTop: '1px'}}>Desde: {socio.data_entrada}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{color: '#666'}}>Sem dados</div>
                        )}
                      </Td>
                      <Td>
                        {empresa.socios && empresa.socios.some(s => s.representante_legal_nome) ? (
                          <div>
                            {(() => {
                              const representantes = empresa.socios.filter(s => s.representante_legal_nome);
                              return (
                                <>
                                  <div 
                                    style={{
                                      cursor: 'pointer', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '8px',
                                      marginBottom: expandedRepresentantes[index] ? '8px' : '0'
                                    }}
                                    onClick={() => toggleRepresentantes(index)}
                                  >
                                    <span style={{fontSize: '12px', color: '#ffaa00'}}>
                                      {expandedRepresentantes[index] ? '▼' : '▶'}
                                    </span>
                                    <div style={{fontSize: '0.8rem'}}>
                                      <div><strong style={{color: '#ffaa00'}}>{representantes[0].representante_legal_nome}</strong></div>
                                      <div style={{fontSize: '0.7rem', color: '#999'}}>
                                        {representantes.length > 1 && `+${representantes.length - 1} rep.`}
                                      </div>
                                    </div>
                                  </div>
                                  {expandedRepresentantes[index] && (
                                    <div style={{marginLeft: '20px', maxHeight: '200px', overflowY: 'auto'}}>
                                      {representantes.map((socio, repIndex) => (
                                        <div key={repIndex} style={{
                                          marginBottom: '8px', 
                                          fontSize: '0.75rem', 
                                          borderBottom: '1px solid rgba(255,170,0,0.1)', 
                                          paddingBottom: '6px',
                                          wordBreak: 'break-word',
                                          lineHeight: '1.3'
                                        }}>
                                          <div><strong style={{color: '#ffaa00'}}>{socio.representante_legal_nome}</strong></div>
                                          <div style={{color: '#ccc', marginTop: '2px'}}>{socio.representante_legal_qualificacao_descricao}</div>
                                          <div style={{color: '#999', marginTop: '1px'}}>CPF: {socio.representante_legal_cpf}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div style={{color: '#666'}}>Sem dados</div>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <PaginationContainer>
                <PageButton
                  onClick={() => handleSearch(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                >
                  ← Anterior
                </PageButton>
                
                <PageInfo>
                  Página {currentPage} de {totalPages}
                </PageInfo>
                
                <PageButton
                  onClick={() => handleSearch(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                >
                  Próxima →
                </PageButton>
              </PaginationContainer>
            )}
          </ResultsSection>
        )}
      </Content>
    </Container>
  );
};

export default Dashboard;