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
    try {
      const searchData = {
        ...filters,
        companyLimit,
        page
      };

      const response = await fetch('/api/companies/filtered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData)
      });

      const data = await response.json();
      
      if (data.success) {
        setEmpresas(data.data);
        toast.success(`${data.data.length} empresas encontradas`);
      } else {
        toast.error(data.message || 'Erro na busca');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro na busca');
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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

          <SearchButton onClick={() => handleSearch(1)} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar Empresas'}
          </SearchButton>
        </SearchSection>

        {empresas.length > 0 && (
          <ResultsSection>
            <ResultsHeader>
              <ResultsTitle>Resultados da Busca</ResultsTitle>
              <ResultsInfo>{empresas.length} empresas encontradas</ResultsInfo>
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
                      <Td style={{maxWidth: '200px', fontSize: '0.8rem'}}>{empresa.cnaeDescricao || '-'}</Td>
                      <Td style={{maxWidth: '150px', fontSize: '0.8rem'}}>{empresa.cnaeSecundaria || '-'}</Td>
                      <Td>{empresa.dataInicioAtividades || '-'}</Td>
                      <Td style={{maxWidth: '150px', fontSize: '0.8rem'}}>{empresa.naturezaJuridicaDescricao || '-'}</Td>
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
                      <Td style={{maxWidth: '250px'}}>
                        {empresa.socios && empresa.socios.length > 0 ? (
                          <div>
                            {empresa.socios.map((socio, socioIndex) => (
                              <div key={socioIndex} style={{marginBottom: '6px', fontSize: '0.8rem', borderBottom: '1px solid rgba(0,255,170,0.1)', paddingBottom: '4px'}}>
                                <div><strong style={{color: '#00ffaa'}}>{socio.nome}</strong></div>
                                <div>{socio.qualificacao_descricao}</div>
                                <div>CPF: {socio.cpf_cnpj}</div>
                                <div>Desde: {socio.data_entrada}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{color: '#666'}}>Sem dados</div>
                        )}
                      </Td>
                      <Td style={{maxWidth: '200px'}}>
                        {empresa.socios && empresa.socios.some(s => s.representante_legal_nome) ? (
                          <div>
                            {empresa.socios.filter(s => s.representante_legal_nome).map((socio, repIndex) => (
                              <div key={repIndex} style={{marginBottom: '6px', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,170,0,0.1)', paddingBottom: '4px'}}>
                                <div><strong style={{color: '#ffaa00'}}>{socio.representante_legal_nome}</strong></div>
                                <div>{socio.representante_legal_qualificacao_descricao}</div>
                                <div>CPF: {socio.representante_legal_cpf}</div>
                              </div>
                            ))}
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
          </ResultsSection>
        )}
      </Content>
    </Container>
  );
};

export default Dashboard;