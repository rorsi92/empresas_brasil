// Mock service para quando o backend não funciona
const mockData = {
  users: [
    { id: 1, email: 'teste@teste.com', password: '123456' }
  ],
  userCounter: 1,
  empresas: [
    {
      cnpj_basico: '12345678',
      razao_social: 'TECH SOLUTIONS BRASIL LTDA',
      nome_fantasia: 'TechSol',
      cnpj: '12345678000195',
      situacao_cadastral: '02',
      uf: 'SP',
      municipio: 'São Paulo',
      cnae_principal: '6201500'
    },
    {
      cnpj_basico: '87654321',
      razao_social: 'COMERCIO EXEMPLO LTDA',
      nome_fantasia: 'Exemplo Corp',
      cnpj: '87654321000154',
      situacao_cadastral: '02',
      uf: 'RJ',
      municipio: 'Rio de Janeiro',
      cnae_principal: '4781400'
    },
    {
      cnpj_basico: '11223344',
      razao_social: 'INDUSTRIA PAULISTA SA',
      nome_fantasia: 'IndPaul',
      cnpj: '11223344000133',
      situacao_cadastral: '02',
      uf: 'SP',
      municipio: 'Campinas',
      cnae_principal: '2511000'
    }
  ]
};

// Simula delay de rede
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockEmpresaService = {
  searchEmpresas: async (filters = {}, page = 1, limit = 25) => {
    await delay(300);
    
    let result = [...mockData.empresas];
    
    // Aplicar filtros
    if (filters.uf) {
      result = result.filter(e => e.uf === filters.uf);
    }
    
    if (filters.cidade) {
      result = result.filter(e => e.municipio.toLowerCase().includes(filters.cidade.toLowerCase()));
    }
    
    if (filters.razao_social) {
      result = result.filter(e => e.razao_social.toLowerCase().includes(filters.razao_social.toLowerCase()));
    }
    
    return {
      empresas: result,
      pagination: {
        page,
        limit,
        total: result.length,
        totalPages: Math.ceil(result.length / limit),
        hasNext: false,
        hasPrev: false
      }
    };
  },

  getUFs: async () => {
    await delay(100);
    const ufs = [...new Set(mockData.empresas.map(e => e.uf))];
    return ufs.sort();
  },

  getSituacoesCadastrais: async () => {
    await delay(100);
    return ['02', '03', '04', '08'];
  },

  getSegmentos: async () => {
    await delay(100);
    return [
      'Tecnologia da Informação',
      'Comércio',
      'Indústria de Transformação',
      'Serviços'
    ];
  },

  getCnaesBySegmento: async (segmento) => {
    await delay(100);
    
    const cnaes = {
      'Tecnologia da Informação': [
        { cnae: '6201500', descricao: 'Desenvolvimento de programas de computador sob encomenda' }
      ],
      'Comércio': [
        { cnae: '4781400', descricao: 'Comércio varejista de artigos do vestuário e acessórios' }
      ],
      'Indústria de Transformação': [
        { cnae: '2511000', descricao: 'Fabricação de estruturas metálicas' }
      ]
    };
    
    return cnaes[segmento] || [];
  }
};

export const mockAuthService = {
  login: async (email, password) => {
    await delay(300);
    
    const user = mockData.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      const error = new Error('Email ou senha incorretos');
      error.response = { data: { message: 'Email ou senha incorretos' } };
      throw error;
    }
    
    const token = `mock-token-${user.id}-${Date.now()}`;
    
    return {
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, email: user.email }
    };
  },

  register: async (email, password) => {
    await delay(300);
    
    if (mockData.users.find(u => u.email === email)) {
      const error = new Error('Usuário já existe');
      error.response = { data: { message: 'Usuário já existe' } };
      throw error;
    }
    
    mockData.userCounter++;
    const user = {
      id: mockData.userCounter,
      email,
      password
    };
    
    mockData.users.push(user);
    
    const token = `mock-token-${user.id}-${Date.now()}`;
    
    return {
      message: 'Usuário criado com sucesso',
      token,
      user: { id: user.id, email: user.email }
    };
  }
};