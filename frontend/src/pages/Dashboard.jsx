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
    linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 136, 204, 0.1) 100%),
    rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 255, 170, 0.2);
  color: #e0e0e0;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 
    0 4px 20px rgba(0, 255, 170, 0.1),
    0 0 0 1px rgba(0, 255, 170, 0.1);
  position: relative;
`;

const Title = styled.h1`
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem;
  font-weight: 700;
  color: #00ffaa;
  text-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #ff4757, #ff6b7a);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ff3742, #ff5722);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }
`;

const Content = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const SearchSection = styled.section`
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 255, 170, 0.2);
`;


const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #00ccff;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 170, 0.3);
  color: #e0e0e0;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #00ffaa;
    box-shadow: 0 0 0 2px rgba(0, 255, 170, 0.2);
  }
  
  option {
    background: #1a1a2e;
    color: #e0e0e0;
  }
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 170, 0.3);
  color: #e0e0e0;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #00ffaa;
    box-shadow: 0 0 0 2px rgba(0, 255, 170, 0.2);
  }
  
  &::placeholder {
    color: #666;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #00ffaa, #00ccff);
  border: none;
  color: #000;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 255, 170, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultsSection = styled.section`
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(0, 255, 170, 0.2);
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
  min-width: 2500px;
  font-size: 0.85rem;
`;

const Th = styled.th`
  background: rgba(0, 136, 204, 0.1);
  padding: 0.5rem;
  text-align: left;
  font-weight: bold;
  color: #00ccff;
  border-bottom: 1px solid rgba(0, 204, 255, 0.3);
  font-size: 0.8rem;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.5rem;
  border-bottom: 1px solid rgba(0, 255, 170, 0.1);
  color: #e0e0e0;
  font-size: 0.8rem;
  vertical-align: top;
`;

const Tr = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 170, 0.05);
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
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 170, 0.2);
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #00ffaa, #00ccff);
  border-radius: 10px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
  width: ${props => props.width}%;
`;

const ProgressText = styled.div`
  color: #e0e0e0;
  font-size: 1rem;
  margin-bottom: 0.5rem;
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
    
    // Format CNPJ automatically as user types
    if (name === 'cnpj') {
      const formattedCNPJ = formatCNPJ(value);
      setFilters(prev => ({
        ...prev,
        [name]: formattedCNPJ
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
      // Clean CNPJ by removing formatting characters before sending to API
      const cleanedFilters = { ...filters };
      if (cleanedFilters.cnpj) {
        cleanedFilters.cnpj = cleanedFilters.cnpj.replace(/\D/g, '');
      }
      
      const searchData = {
        ...cleanedFilters,
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
                placeholder="Digite o CNPJ (ex: 12.345.678/0001-90)"
                maxLength={18}
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
                    <Th style={{minWidth: '90px'}}>CNAE Principal</Th>
                    <Th style={{minWidth: '220px'}}>Descrição CNAE</Th>
                    <Th style={{minWidth: '180px'}}>CNAE Secundária</Th>
                    <Th style={{minWidth: '90px'}}>Data Início</Th>
                    <Th style={{minWidth: '180px'}}>Natureza Jurídica</Th>
                    <Th style={{minWidth: '100px'}}>Porte</Th>
                    <Th style={{minWidth: '120px'}}>Capital Social</Th>
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
                      <Td style={{minWidth: '90px', fontSize: '0.8rem'}}>{empresa.cnaePrincipal || '-'}</Td>
                      <Td style={{minWidth: '220px', maxWidth: '220px', fontSize: '0.8rem', wordWrap: 'break-word'}}>{empresa.cnaeDescricao || '-'}</Td>
                      <Td style={{minWidth: '180px', maxWidth: '180px', fontSize: '0.8rem'}}>
                        {empresa.cnaeSecundaria ? (
                          <div>
                            {empresa.cnaeSecundaria.split(',').map((cnae, idx) => (
                              <div key={idx} style={{marginBottom: '2px', padding: '1px 4px', backgroundColor: 'rgba(0,255,170,0.1)', borderRadius: '3px', fontSize: '0.75rem'}}>
                                {cnae.trim()}
                              </div>
                            ))}
                          </div>
                        ) : '-'}
                      </Td>
                      <Td style={{minWidth: '90px', fontSize: '0.8rem'}}>{empresa.dataInicioAtividades || '-'}</Td>
                      <Td style={{minWidth: '180px', maxWidth: '180px', fontSize: '0.8rem', wordWrap: 'break-word'}}>{empresa.naturezaJuridicaDescricao || '-'}</Td>
                      <Td style={{minWidth: '100px', fontSize: '0.8rem'}}>{empresa.porteDescricao || '-'}</Td>
                      <Td style={{minWidth: '120px', fontSize: '0.8rem', textAlign: 'right'}}>{formatCapitalSocial(empresa.capitalSocial)}</Td>
                      <Td>
                        {empresa.opcaoSimples === 'S' ? '✅ Sim' : empresa.opcaoSimples === 'N' ? '❌ Não' : '-'}
                        {empresa.dataOpcaoSimples && <div style={{fontSize: '0.7rem'}}>Desde: {empresa.dataOpcaoSimples}</div>}
                      </Td>
                      <Td>
                        {empresa.opcaoMei === 'S' ? '✅ Sim' : empresa.opcaoMei === 'N' ? '❌ Não' : '-'}
                        {empresa.dataOpcaoMei && <div style={{fontSize: '0.7rem'}}>Desde: {empresa.dataOpcaoMei}</div>}
                      </Td>
                      <Td style={{maxWidth: '250px'}}>
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
                              <div style={{marginLeft: '20px'}}>
                                {empresa.socios.map((socio, socioIndex) => (
                                  <div key={socioIndex} style={{marginBottom: '6px', fontSize: '0.8rem', borderBottom: '1px solid rgba(0,255,170,0.1)', paddingBottom: '4px'}}>
                                    <div><strong style={{color: '#00ffaa'}}>{socio.nome}</strong></div>
                                    <div>{socio.qualificacao_descricao}</div>
                                    <div>CPF: {socio.cpf_cnpj}</div>
                                    <div>Desde: {socio.data_entrada}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{color: '#666'}}>Sem dados</div>
                        )}
                      </Td>
                      <Td style={{maxWidth: '200px'}}>
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
                                    <div style={{marginLeft: '20px'}}>
                                      {representantes.map((socio, repIndex) => (
                                        <div key={repIndex} style={{marginBottom: '6px', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,170,0,0.1)', paddingBottom: '4px'}}>
                                          <div><strong style={{color: '#ffaa00'}}>{socio.representante_legal_nome}</strong></div>
                                          <div>{socio.representante_legal_qualificacao_descricao}</div>
                                          <div>CPF: {socio.representante_legal_cpf}</div>
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