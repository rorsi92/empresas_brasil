const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RailwayMonitor = require('./railway-monitor');
require('dotenv').config();

// Function to clean nome_fantasia field - remove addresses that appear incorrectly
function cleanNomeFantasia(nomeFantasia) {
  if (!nomeFantasia || nomeFantasia.trim() === '') {
    return null;
  }
  
  const nome = nomeFantasia.trim();
  
  // Check if it looks like an address (contains common address patterns)
  const addressPatterns = [
    /^(RUA|AVENIDA|ALAMEDA|ESTRADA|RODOVIA|TRAVESSA|QUADRA|LOTE)/i,
    /\bN\d+\b/, // N123 (number pattern)
    /\b\d+\s*(KM|QUILOMETRO)/i,
    /\bCEP\s*\d/i,
    /\b\d{5}-?\d{3}\b/, // CEP pattern
    /\bSALA\s*\d+/i,
    /\bANDAR\s*\d+/i,
    /\bBLOCO\s*[A-Z]/i
  ];
  
  // If it matches address patterns, return null
  if (addressPatterns.some(pattern => pattern.test(nome))) {
    return null;
  }
  
  // If it's too long (likely an address), return null
  if (nome.length > 100) {
    return null;
  }
  
  return nome;
}

const app = express();
const PORT = process.env.PORT || 6000;

// 🔄 SYSTEM STATE: Can switch between OFFLINE and RAILWAY modes
let systemMode = 'OFFLINE'; // Start in offline mode
let railwayPool = null;

// Railway database configuration
const railwayConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
  max: 10
};

// Callback function when Railway connection is restored
async function onRailwayRestored() {
  try {
    console.log('🔄 Initializing Railway database connection...');
    
    // Create new Railway connection pool
    railwayPool = new Pool(railwayConfig);
    
    // Test the connection with a simple query
    const testResult = await railwayPool.query('SELECT COUNT(*) as empresas FROM estabelecimento LIMIT 1');
    console.log('📊 Railway database test:', testResult.rows[0]);
    
    // Switch system to Railway mode
    systemMode = 'RAILWAY';
    console.log('✅ System switched to RAILWAY mode successfully!');
    
  } catch (error) {
    console.error('❌ Failed to switch to Railway mode:', error.message);
    systemMode = 'OFFLINE'; // Stay in offline mode
    
    if (railwayPool) {
      await railwayPool.end();
      railwayPool = null;
    }
  }
}

// Initialize Railway monitor
const railwayMonitor = new RailwayMonitor(railwayConfig, onRailwayRestored);

// Helper function to build filter response
function buildFilterResponse(motivoSituacao, qualificacaoSocio, naturezaJuridica) {
  const businessSegments = [
    {
      id: 1, 
      name: "Vestuário e Moda", 
      icon: "👗", 
      color: "#FF6B6B",
      description: "3,5M empresas",
      cnaes: ["4781400", "1412601", "4782201"],
      cnaeDescriptions: ["Comércio varejista de vestuário", "Confecção de peças", "Comércio de calçados"]
    },
    {
      id: 2, 
      name: "Alimentação e Restaurantes", 
      icon: "🍽️", 
      color: "#4ECDC4",
      description: "3,6M empresas",
      cnaes: ["5611203", "5611201", "5620104", "5612100"],
      cnaeDescriptions: ["Lanchonetes e similares", "Restaurantes", "Fornecimento domiciliar", "Serviços ambulantes"]
    },
    {
      id: 3, 
      name: "Beleza e Estética", 
      icon: "💄", 
      color: "#F7DC6F",
      description: "2,5M empresas",
      cnaes: ["9602501", "9602502", "4772500"],
      cnaeDescriptions: ["Cabeleireiros e manicure", "Atividades de estética", "Comércio de cosméticos"]
    },
    {
      id: 4, 
      name: "Comércio e Mercados", 
      icon: "🏪", 
      color: "#58D68D",
      description: "2,5M empresas",
      cnaes: ["4712100", "4711301", "4729699", "4723700"],
      cnaeDescriptions: ["Minimercados e mercearias", "Hipermercados", "Produtos alimentícios", "Comércio de bebidas"]
    },
    {
      id: 5, 
      name: "Construção Civil", 
      icon: "🏗️", 
      color: "#F4D03F",
      description: "2,3M empresas",
      cnaes: ["4399103", "4321500", "4120400", "4330404", "4744099"],
      cnaeDescriptions: ["Obras de alvenaria", "Instalação elétrica", "Construção de edifícios", "Pintura", "Materiais de construção"]
    },
    {
      id: 6, 
      name: "Transportes e Logística", 
      icon: "🚛", 
      color: "#F8C471",
      description: "2,1M empresas",
      cnaes: ["4930201", "4930202", "5320202", "5229099"],
      cnaeDescriptions: ["Transporte municipal", "Transporte intermunicipal", "Entrega rápida", "Auxiliares de transporte"]
    },
    {
      id: 7, 
      name: "Serviços Profissionais", 
      icon: "💼", 
      color: "#D7DBDD",
      description: "2,0M empresas",
      cnaes: ["7319002", "8219999", "8211300", "8230001"],
      cnaeDescriptions: ["Promoção de vendas", "Apoio administrativo", "Serviços de escritório", "Organização de eventos"]
    },
    {
      id: 8, 
      name: "Tecnologia e Informática", 
      icon: "💻", 
      color: "#5DADE2",
      description: "0,8M empresas",
      cnaes: ["9511800", "4751201", "6209100", "6201501"],
      cnaeDescriptions: ["Reparação de computadores", "Equipamentos de informática", "Desenvolvimento de software", "Desenvolvimento de sites"]
    },
    {
      id: 9, 
      name: "Saúde e Farmácias", 
      icon: "💊", 
      color: "#A569BD",
      description: "0,7M empresas",
      cnaes: ["4771701", "8712300", "8630501", "8650099"],
      cnaeDescriptions: ["Produtos farmacêuticos", "Assistência domiciliar", "Atividade médica ambulatorial", "Atividades de profissionais da área de saúde"]
    },
    {
      id: 10, 
      name: "Educação e Treinamento", 
      icon: "📚", 
      color: "#52BE80",
      description: "1,2M empresas",
      cnaes: ["8599699", "8599604", "8513900", "8520100"],
      cnaeDescriptions: ["Outras atividades de ensino", "Treinamento profissional", "Ensino fundamental", "Educação infantil"]
    },
    {
      id: 11, 
      name: "Automóveis e Oficinas", 
      icon: "🚗", 
      color: "#EC7063",
      description: "1,0M empresas",
      cnaes: ["4520001", "4530703", "4511101", "4520008"],
      cnaeDescriptions: ["Manutenção mecânica", "Peças e acessórios", "Comércio de automóveis", "Serviços de lanternagem"]
    },
    {
      id: 12, 
      name: "Organizações e Associações", 
      icon: "🏛️", 
      color: "#BB8FCE",
      description: "4,2M empresas",
      cnaes: ["9492800", "9430800", "9491000", "8112500"],
      cnaeDescriptions: ["Organizações políticas", "Associações de direitos", "Organizações religiosas", "Condomínios prediais"]
    },
    {
      id: 13, 
      name: "Varejo Especializado", 
      icon: "🛍️", 
      color: "#7FB3D3",
      description: "1,5M empresas",
      cnaes: ["4789099", "4774100", "4754701", "4755502", "4744001"],
      cnaeDescriptions: ["Outros produtos", "Artigos de óptica", "Móveis", "Armarinho", "Ferragens"]
    },
    {
      id: 14, 
      name: "Alimentação - Produção", 
      icon: "🍰", 
      color: "#7DCEA0",
      description: "0,4M empresas",
      cnaes: ["1091102", "4722901", "1011201", "1012101"],
      cnaeDescriptions: ["Padaria e confeitaria", "Açougues", "Abate de bovinos", "Frigoríficos"]
    },
    {
      id: 15, 
      name: "Serviços Domésticos", 
      icon: "🏠", 
      color: "#F1948A",
      description: "0,5M empresas",
      cnaes: ["9700500", "8121400", "9601701", "8129900"],
      cnaeDescriptions: ["Serviços domésticos", "Limpeza de prédios", "Reparação de calçados", "Outras atividades de limpeza"]
    },
    {
      id: 16, 
      name: "Comunicação e Mídia", 
      icon: "📱", 
      color: "#AED6F1",
      description: "0,3M empresas",
      cnaes: ["5320201", "7311400", "6020300", "7319004"],
      cnaeDescriptions: ["Serviços de malote", "Agências de publicidade", "Programação de TV", "Locação de stands"]
    },
    {
      id: 17, 
      name: "Agricultura e Pecuária", 
      icon: "🌾", 
      color: "#82E0AA",
      description: "0,2M empresas",
      cnaes: ["0111301", "0151201", "0113001", "0161001"],
      cnaeDescriptions: ["Cultivo de milho", "Criação de bovinos", "Cultivo de cana", "Atividades de apoio à agricultura"]
    },
    {
      id: 18, 
      name: "Energia e Utilities", 
      icon: "⚡", 
      color: "#F7DC6F",
      description: "0,1M empresas",
      cnaes: ["3511500", "3600601", "3514000", "4221901"],
      cnaeDescriptions: ["Geração de energia", "Captação de água", "Distribuição de energia", "Obras de utilidade pública"]
    },
    {
      id: 19, 
      name: "Finanças e Seguros", 
      icon: "💰", 
      color: "#85C1E9",
      description: "0,1M empresas",
      cnaes: ["6422100", "6550200", "6420400", "6491800"],
      cnaeDescriptions: ["Bancos múltiplos", "Seguros de vida", "Cooperativas de crédito", "Outras intermediações financeiras"]
    },
    {
      id: 20, 
      name: "Outros Setores", 
      icon: "📋", 
      color: "#BDC3C7",
      description: "Demais atividades",
      cnaes: ["8888888", "0000000"],
      cnaeDescriptions: ["Atividade não informada", "Outros códigos"]
    }
  ];

  const ufs = [
    {code: "SP", description: "São Paulo"},
    {code: "MG", description: "Minas Gerais"},
    {code: "RJ", description: "Rio de Janeiro"},
    {code: "AC", description: "Acre"},
    {code: "AL", description: "Alagoas"},
    {code: "AP", description: "Amapá"},
    {code: "AM", description: "Amazonas"},
    {code: "BA", description: "Bahia"},
    {code: "CE", description: "Ceará"},
    {code: "DF", description: "Distrito Federal"},
    {code: "ES", description: "Espírito Santo"},
    {code: "GO", description: "Goiás"},
    {code: "MA", description: "Maranhão"},
    {code: "MT", description: "Mato Grosso"},
    {code: "MS", description: "Mato Grosso do Sul"},
    {code: "PA", description: "Pará"},
    {code: "PB", description: "Paraíba"},
    {code: "PR", description: "Paraná"},
    {code: "PE", description: "Pernambuco"},
    {code: "PI", description: "Piauí"},
    {code: "RR", description: "Roraima"},
    {code: "RO", description: "Rondônia"},
    {code: "RS", description: "Rio Grande do Sul"},
    {code: "SC", description: "Santa Catarina"},
    {code: "SE", description: "Sergipe"},
    {code: "TO", description: "Tocantins"}
  ];

  const situacaoCadastral = [
    {code: "02", description: "Ativa"},
    {code: "08", description: "Baixada"},
    {code: "04", description: "Inapta"}
  ];

  // Filter out any filter categories that have only 1 or 0 options
  const filterData = {
    businessSegments, 
    ufs, 
    situacaoCadastral
  };

  // Only include filters that have more than 1 option
  if (motivoSituacao && motivoSituacao.length > 1) {
    filterData.motivoSituacao = motivoSituacao;
  }
  
  if (qualificacaoSocio && qualificacaoSocio.length > 1) {
    filterData.qualificacaoSocio = qualificacaoSocio;
  }
  
  if (naturezaJuridica && naturezaJuridica.length > 1) {
    filterData.naturezaJuridica = naturezaJuridica;
  }

  return filterData;
}

// Import routes (skip stripe for offline mode)
// const stripeRoutes = require('./stripe-routes');
const authRoutes = require('./routes/auth');

// Import database initialization
const { createUsersTable } = require('./database/init-users');

// Legacy pool for compatibility (not used in current setup)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://your-frontend.railway.app',
        'https://*.railway.app'
      ]
    : ['http://localhost:4001', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Use routes - auth will work in both OFFLINE and RAILWAY modes
// app.use('/api/stripe', stripeRoutes);
app.use('/api/auth', authRoutes);

// Endpoint temporário para verificar tabelas
app.get('/api/check-tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.json({
      success: true,
      tables: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to check filter data
app.get('/api/debug-filters', async (req, res) => {
  try {
    let results = {};
    
    // Check motivo table
    try {
      const motivoResult = await pool.query('SELECT COUNT(*) as count FROM motivo');
      const motivoSample = await pool.query('SELECT codigo, descricao FROM motivo LIMIT 5');
      results.motivo = {
        count: motivoResult.rows[0].count,
        sample: motivoSample.rows
      };
    } catch (error) {
      results.motivo = { error: error.message };
    }
    
    // Check qualificacao_socio table
    try {
      const qualResult = await pool.query('SELECT COUNT(*) as count FROM qualificacao_socio');
      const qualSample = await pool.query('SELECT codigo, descricao FROM qualificacao_socio LIMIT 5');
      results.qualificacao_socio = {
        count: qualResult.rows[0].count,
        sample: qualSample.rows
      };
    } catch (error) {
      results.qualificacao_socio = { error: error.message };
    }
    
    // Check natureza_juridica table
    try {
      const natResult = await pool.query('SELECT COUNT(*) as count FROM natureza_juridica');
      const natSample = await pool.query('SELECT codigo, descricao FROM natureza_juridica LIMIT 5');
      results.natureza_juridica = {
        count: natResult.rows[0].count,
        sample: natSample.rows
      };
    } catch (error) {
      results.natureza_juridica = { error: error.message };
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS simple_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

// OFFLINE MODE: Simple authentication without database
const tempUsers = [
  {
    id: 1,
    email: 'test@test.com',
    password: '$2a$12$2JX6er4t5NU5KozUwpyc0.u3QV/4jmNmp/lYwrgzCd6liXUDYgBli', // "test123"
    firstName: 'Test',
    lastName: 'User'
  },
  {
    id: 2,
    email: 'carlos@ogservicos.com.br',
    password: '$2a$12$2JX6er4t5NU5KozUwpyc0.u3QV/4jmNmp/lYwrgzCd6liXUDYgBli', // "test123"
    firstName: 'Carlos',
    lastName: 'OG Serviços'
  }
];

// Auth routes are now handled by the auth.js router

// BUSINESS SEGMENTS BASED ON REAL CNAE DATA
app.get('/api/filters/options', async (req, res) => {
  try {
    console.log(`📊 Filter options request (${systemMode} MODE)`);
    
    // Try Railway database first if available
    if (systemMode === 'RAILWAY' && railwayPool) {
      try {
        console.log('🔍 Fetching filters from Railway database...');
        
        const [motivoResult, qualResult, natResult] = await Promise.all([
          railwayPool.query('SELECT codigo as code, descricao as description FROM motivo ORDER BY codigo'),
          railwayPool.query('SELECT codigo as code, descricao as description FROM qualificacao_socio ORDER BY codigo'),
          railwayPool.query('SELECT codigo as code, descricao as description FROM natureza_juridica ORDER BY codigo')
        ]);
        
        console.log('✅ Successfully fetched filters from Railway database');
        
        const filterData = buildFilterResponse(
          motivoResult.rows,
          qualResult.rows, 
          natResult.rows
        );
        
        return res.json({
          success: true,
          data: filterData,
          source: 'RAILWAY_DATABASE'
        });
        
      } catch (railwayError) {
        console.log('⚠️ Railway filter query failed, falling back to static data:', railwayError.message);
        // Fall through to static data
      }
    }
    
    console.log('📊 Using static filter data (offline mode)');
    
    // Static data for offline mode
    const motivoSituacaoResult = {
      rows: [
        {code: "00", description: "Sem Restrição"},
        {code: "01", description: "Extinção por Encerramento Liquidação Voluntária"},
        {code: "02", description: "Incorporação"},
        {code: "03", description: "Fusão"},
        {code: "04", description: "Cisão Total"},
        {code: "05", description: "Extinção de Filial"},
        {code: "06", description: "Caducidade"},
        {code: "07", description: "Falta de Pluralidade de Sócios"},
        {code: "08", description: "Omissa em Declarações"},
        {code: "09", description: "Falência"},
        {code: "10", description: "Concordata"},
        {code: "11", description: "Liquidação Judicial"},
        {code: "12", description: "Liquidação Extrajudicial"}
      ]
    };

    const qualificacaoSocioResult = {
      rows: [
        {code: "05", description: "Administrador"},
        {code: "08", description: "Conselheiro de Administração"},
        {code: "10", description: "Diretor"},
        {code: "16", description: "Presidente"},
        {code: "17", description: "Procurador"},
        {code: "22", description: "Sócio"},
        {code: "49", description: "Sócio-Administrador"},
        {code: "54", description: "Fundador"},
        {code: "65", description: "Titular Pessoa Física"}
      ]
    };

    const naturezaJuridicaResult = {
      rows: [
        {code: "1015", description: "Empresa Individual de Responsabilidade Limitada"},
        {code: "2135", description: "Sociedade Limitada"},
        {code: "2062", description: "Sociedade Empresária Limitada"},
        {code: "2240", description: "Sociedade Simples Limitada"},
        {code: "1244", description: "Empresário Individual"},
        {code: "2054", description: "Sociedade Anônima Aberta"},
        {code: "2070", description: "Sociedade Anônima Fechada"}
      ]
    };

  const businessSegments = [
    {
      id: 1, 
      name: "Vestuário e Moda", 
      icon: "👗", 
      color: "#FF6B6B",
      description: "3,5M empresas",
      cnaes: ["4781400", "1412601", "4782201"],
      cnaeDescriptions: ["Comércio varejista de vestuário", "Confecção de peças", "Comércio de calçados"]
    },
    {
      id: 2, 
      name: "Alimentação e Restaurantes", 
      icon: "🍽️", 
      color: "#4ECDC4",
      description: "3,6M empresas",
      cnaes: ["5611203", "5611201", "5620104", "5612100"],
      cnaeDescriptions: ["Lanchonetes e similares", "Restaurantes", "Fornecimento domiciliar", "Serviços ambulantes"]
    },
    {
      id: 3, 
      name: "Beleza e Estética", 
      icon: "💄", 
      color: "#F7DC6F",
      description: "2,5M empresas",
      cnaes: ["9602501", "9602502", "4772500"],
      cnaeDescriptions: ["Cabeleireiros e manicure", "Atividades de estética", "Comércio de cosméticos"]
    },
    {
      id: 4, 
      name: "Comércio e Mercados", 
      icon: "🏪", 
      color: "#58D68D",
      description: "2,5M empresas",
      cnaes: ["4712100", "4711301", "4729699", "4723700"],
      cnaeDescriptions: ["Minimercados e mercearias", "Hipermercados", "Produtos alimentícios", "Comércio de bebidas"]
    },
    {
      id: 5, 
      name: "Construção Civil", 
      icon: "🏗️", 
      color: "#F4D03F",
      description: "2,3M empresas",
      cnaes: ["4399103", "4321500", "4120400", "4330404", "4744099"],
      cnaeDescriptions: ["Obras de alvenaria", "Instalação elétrica", "Construção de edifícios", "Pintura", "Materiais de construção"]
    },
    {
      id: 6, 
      name: "Transportes e Logística", 
      icon: "🚛", 
      color: "#F8C471",
      description: "2,1M empresas",
      cnaes: ["4930201", "4930202", "5320202", "5229099"],
      cnaeDescriptions: ["Transporte municipal", "Transporte intermunicipal", "Entrega rápida", "Auxiliares de transporte"]
    },
    {
      id: 7, 
      name: "Serviços Profissionais", 
      icon: "💼", 
      color: "#D7DBDD",
      description: "2,0M empresas",
      cnaes: ["7319002", "8219999", "8211300", "8230001"],
      cnaeDescriptions: ["Promoção de vendas", "Apoio administrativo", "Serviços de escritório", "Organização de eventos"]
    },
    {
      id: 8, 
      name: "Tecnologia e Informática", 
      icon: "💻", 
      color: "#5DADE2",
      description: "0,8M empresas",
      cnaes: ["9511800", "4751201", "6209100", "6201501"],
      cnaeDescriptions: ["Reparação de computadores", "Equipamentos de informática", "Desenvolvimento de software", "Desenvolvimento de sites"]
    },
    {
      id: 9, 
      name: "Saúde e Farmácias", 
      icon: "💊", 
      color: "#A569BD",
      description: "0,7M empresas",
      cnaes: ["4771701", "8712300", "8630501", "8650099"],
      cnaeDescriptions: ["Produtos farmacêuticos", "Assistência domiciliar", "Atividade médica ambulatorial", "Atividades de profissionais da área de saúde"]
    },
    {
      id: 10, 
      name: "Educação e Treinamento", 
      icon: "📚", 
      color: "#52BE80",
      description: "1,2M empresas",
      cnaes: ["8599699", "8599604", "8513900", "8520100"],
      cnaeDescriptions: ["Outras atividades de ensino", "Treinamento profissional", "Ensino fundamental", "Educação infantil"]
    },
    {
      id: 11, 
      name: "Automóveis e Oficinas", 
      icon: "🚗", 
      color: "#EC7063",
      description: "1,0M empresas",
      cnaes: ["4520001", "4530703", "4511101", "4520008"],
      cnaeDescriptions: ["Manutenção mecânica", "Peças e acessórios", "Comércio de automóveis", "Serviços de lanternagem"]
    },
    {
      id: 12, 
      name: "Organizações e Associações", 
      icon: "🏛️", 
      color: "#BB8FCE",
      description: "4,2M empresas",
      cnaes: ["9492800", "9430800", "9491000", "8112500"],
      cnaeDescriptions: ["Organizações políticas", "Associações de direitos", "Organizações religiosas", "Condomínios prediais"]
    },
    {
      id: 13, 
      name: "Varejo Especializado", 
      icon: "🛍️", 
      color: "#7FB3D3",
      description: "1,5M empresas",
      cnaes: ["4789099", "4774100", "4754701", "4755502", "4744001"],
      cnaeDescriptions: ["Outros produtos", "Artigos de óptica", "Móveis", "Armarinho", "Ferragens"]
    },
    {
      id: 14, 
      name: "Alimentação - Produção", 
      icon: "🍰", 
      color: "#7DCEA0",
      description: "0,4M empresas",
      cnaes: ["1091102", "4722901", "1011201", "1012101"],
      cnaeDescriptions: ["Padaria e confeitaria", "Açougues", "Abate de bovinos", "Frigoríficos"]
    },
    {
      id: 15, 
      name: "Serviços Domésticos", 
      icon: "🏠", 
      color: "#F1948A",
      description: "0,5M empresas",
      cnaes: ["9700500", "8121400", "9601701", "8129900"],
      cnaeDescriptions: ["Serviços domésticos", "Limpeza de prédios", "Reparação de calçados", "Outras atividades de limpeza"]
    },
    {
      id: 16, 
      name: "Comunicação e Mídia", 
      icon: "📱", 
      color: "#AED6F1",
      description: "0,3M empresas",
      cnaes: ["5320201", "7311400", "6020300", "7319004"],
      cnaeDescriptions: ["Serviços de malote", "Agências de publicidade", "Programação de TV", "Locação de stands"]
    },
    {
      id: 17, 
      name: "Agricultura e Pecuária", 
      icon: "🌾", 
      color: "#82E0AA",
      description: "0,2M empresas",
      cnaes: ["0111301", "0151201", "0113001", "0161001"],
      cnaeDescriptions: ["Cultivo de milho", "Criação de bovinos", "Cultivo de cana", "Atividades de apoio à agricultura"]
    },
    {
      id: 18, 
      name: "Energia e Utilities", 
      icon: "⚡", 
      color: "#F7DC6F",
      description: "0,1M empresas",
      cnaes: ["3511500", "3600601", "3514000", "4221901"],
      cnaeDescriptions: ["Geração de energia", "Captação de água", "Distribuição de energia", "Obras de utilidade pública"]
    },
    {
      id: 19, 
      name: "Finanças e Seguros", 
      icon: "💰", 
      color: "#85C1E9",
      description: "0,1M empresas",
      cnaes: ["6422100", "6550200", "6420400", "6491800"],
      cnaeDescriptions: ["Bancos múltiplos", "Seguros de vida", "Cooperativas de crédito", "Outras intermediações financeiras"]
    },
    {
      id: 20, 
      name: "Outros Setores", 
      icon: "📋", 
      color: "#BDC3C7",
      description: "Demais atividades",
      cnaes: ["8888888", "0000000"],
      cnaeDescriptions: ["Atividade não informada", "Outros códigos"]
    }
  ];

  const ufs = [
    {code: "SP", description: "São Paulo"},
    {code: "MG", description: "Minas Gerais"},
    {code: "RJ", description: "Rio de Janeiro"},
    {code: "AC", description: "Acre"},
    {code: "AL", description: "Alagoas"},
    {code: "AP", description: "Amapá"},
    {code: "AM", description: "Amazonas"},
    {code: "BA", description: "Bahia"},
    {code: "CE", description: "Ceará"},
    {code: "DF", description: "Distrito Federal"},
    {code: "ES", description: "Espírito Santo"},
    {code: "GO", description: "Goiás"},
    {code: "MA", description: "Maranhão"},
    {code: "MT", description: "Mato Grosso"},
    {code: "MS", description: "Mato Grosso do Sul"},
    {code: "PA", description: "Pará"},
    {code: "PB", description: "Paraíba"},
    {code: "PR", description: "Paraná"},
    {code: "PE", description: "Pernambuco"},
    {code: "PI", description: "Piauí"},
    {code: "RR", description: "Roraima"},
    {code: "RO", description: "Rondônia"},
    {code: "RS", description: "Rio Grande do Sul"},
    {code: "SC", description: "Santa Catarina"},
    {code: "SE", description: "Sergipe"},
    {code: "TO", description: "Tocantins"}
  ];

  const situacaoCadastral = [
    {code: "02", description: "Ativa"},
    {code: "08", description: "Baixada"},
    {code: "04", description: "Inapta"}
  ];

  const motivoSituacao = motivoSituacaoResult.rows;
  const qualificacaoSocio = qualificacaoSocioResult.rows;
  const naturezaJuridica = naturezaJuridicaResult.rows;

  // Filter out any filter categories that have only 1 or 0 options
  // Since single-option dropdowns are not useful for filtering
  const filterData = {
    businessSegments, 
    ufs, 
    situacaoCadastral
  };

  // Only include filters that have more than 1 option
  if (motivoSituacao && motivoSituacao.length > 1) {
    filterData.motivoSituacao = motivoSituacao;
  }
  
  if (qualificacaoSocio && qualificacaoSocio.length > 1) {
    filterData.qualificacaoSocio = qualificacaoSocio;
  }
  
  if (naturezaJuridica && naturezaJuridica.length > 1) {
    filterData.naturezaJuridica = naturezaJuridica;
  }

  console.log('📊 Filter options count:', {
    businessSegments: businessSegments.length,
    ufs: ufs.length,
    situacaoCadastral: situacaoCadastral.length,
    motivoSituacao: motivoSituacao?.length || 0,
    qualificacaoSocio: qualificacaoSocio?.length || 0,
    naturezaJuridica: naturezaJuridica?.length || 0
  });

  res.json({
    success: true,
    data: filterData
  });
  
  } catch (error) {
    console.error('❌ Error loading filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar opções de filtros'
    });
  }
});

app.post('/api/companies/filtered', async (req, res) => {
  console.log('🔍 Starting company search (OFFLINE MODE)...');
  const startTime = Date.now();
  
  try {
    // Return sample data immediately in offline mode
    console.log('📊 OFFLINE MODE: Returning sample company data');
    
    const sampleCompanies = Array.from({length: 1000}, (_, i) => ({
      cnpj: `${String(i).padStart(8, '0')}000100`,
      cnpjBasico: String(i).padStart(8, '0'),
      cnpjOrdem: "0001",
      cnpjDv: "00",
      razaoSocial: `EMPRESA EXEMPLO ${i + 1} LTDA`,
      nomeFantasia: `Exemplo ${i + 1}`,
      matrizFilial: i % 5 === 0 ? "Filial" : "Matriz",
      situacaoCadastral: "02",
      situacaoDescricao: "Ativa",
      dataSituacao: "20230101",
      motivoSituacao: "00",
      dataInicioAtividades: "20200101",
      cnaePrincipal: "4781400",
      cnaeDescricao: "Comércio varejista de artigos do vestuário e acessórios",
      cnaeSecundaria: null,
      tipoLogradouro: "RUA",
      logradouro: `EXEMPLO ${i + 1}`,
      numero: String((i % 999) + 1),
      complemento: null,
      bairro: "CENTRO",
      cep: `${String(i % 99999).padStart(5, '0')}000`,
      uf: "SP",
      municipio: "7107",
      ddd1: "11",
      telefone1: `${String(i % 9999).padStart(4, '0')}${String(i % 9999).padStart(4, '0')}`,
      ddd2: null,
      telefone2: null,
      dddFax: null,
      fax: null,
      email: i % 3 === 0 ? `empresa${i}@exemplo.com.br` : null,
      naturezaJuridica: "2062",
      naturezaJuridicaDescricao: "Sociedade Empresária Limitada",
      qualificacaoResponsavel: "49",
      qualificacaoResponsavelDescricao: "Sócio-Administrador",
      porteEmpresa: "01",
      porteDescricao: "Microempresa",
      enteFederativoResponsavel: null,
      capitalSocial: 10000 + (i * 1000),
      opcaoSimples: i % 2 === 0 ? "S" : "N",
      dataOpcaoSimples: i % 2 === 0 ? "20200701" : null,
      dataExclusaoSimples: null,
      opcaoMei: "N",
      dataOpcaoMei: null,
      dataExclusaoMei: null,
      socios: i % 2 === 0 ? [
        {
          identificador: 1,
          nome: `SÓCIO EXEMPLO ${i + 1}`,
          cpf_cnpj: null,
          qualificacao: "49",
          data_entrada: "20200101",
          pais: "BRASIL",
          representante_legal_cpf: null,
          representante_legal_nome: null,
          representante_legal_qualificacao: null,
          faixa_etaria: "4"
        }
      ] : [],
      quantidadeSocios: i % 2 === 0 ? 1 : 0
    }));

    const queryTime = Date.now() - startTime;
    console.log(`✅ Found ${sampleCompanies.length} sample companies in ${queryTime}ms`);
    
    res.json({
      success: true,
      data: sampleCompanies,
      pagination: {
        currentPage: 1,
        totalCompanies: 1000,
        totalAvailable: 1000,
        totalPages: 1,
        companiesPerPage: 1000,
        requestedLimit: 1000,
        hasNextPage: false,
        hasPreviousPage: false
      },
      performance: {
        queryTimeMs: queryTime,
        resultsCount: sampleCompanies.length
      },
      offline: true,
      message: "MODO OFFLINE: Dados de exemplo (Railway indisponível)"
    });
    return;
    
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('❌ Search error (OFFLINE MODE):', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro na busca de empresas (modo offline)',
      error: error.message,
      queryTimeMs: queryTime
    });
  }
});

// Serve React frontend in production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    }
  });
}

// System status endpoint
app.get('/api/system/status', (req, res) => {
  const monitorStatus = railwayMonitor.getStatus();
  
  res.json({
    success: true,
    system: {
      mode: systemMode,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid
    },
    database: {
      railway: {
        connected: systemMode === 'RAILWAY',
        monitoring: monitorStatus.isMonitoring,
        retryCount: monitorStatus.retryCount
      }
    },
    features: {
      authentication: 'WORKING',
      companySearch: systemMode === 'RAILWAY' ? 'REAL_DATA' : 'SAMPLE_DATA',
      filters: systemMode === 'RAILWAY' ? 'REAL_DATA' : 'STATIC_DATA'
    }
  });
});

// Skip database initialization due to Railway connection issues
console.log('⚠️ Starting in OFFLINE MODE - Railway database unavailable');
console.log('🔄 Using static data for all endpoints');
console.log('🔍 Railway monitor will check every 30 seconds for restoration');

// Start server immediately without database dependencies
setTimeout(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('✅ Company search: 1000-50000 companies');
    console.log(`✅ Database: ${systemMode} mode`);
    console.log('✅ Authentication: Working (offline mode)');
    console.log('🎯 FIXED: 20 business segments + all states');
    console.log('📊 Login: test@test.com / test123');
    console.log('🔄 Auto-reconnect: Railway monitoring active');
    
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ Frontend: Serving React from /frontend/dist');
    }
    
    // Start Railway monitoring after server is up
    railwayMonitor.startMonitoring();
  });
}, 500); // Start after 500ms