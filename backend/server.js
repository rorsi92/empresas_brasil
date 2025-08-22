const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
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

// Apify configuration
const APIFY_API_KEY = process.env.APIFY_API_KEY;
const APIFY_BASE_URL = 'https://api.apify.com/v2';

// Import routes
// const stripeRoutes = require('./stripe-routes'); // ARQUIVO DELETADO
const authRoutes = require('./routes/auth');

// Import database initialization
const { createUsersTable } = require('./database/init-users');

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

// Use routes
// app.use('/api/stripe', stripeRoutes); // ARQUIVO DELETADO
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM simple_users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});

// Change password endpoint
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token de acesso requerido' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, 'your-secret-key');
    
    // Get user from database
    const userResult = await pool.query('SELECT * FROM simple_users WHERE id = $1', [decoded.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Senha atual incorreta' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password in database
    await pool.query(
      'UPDATE simple_users SET password = $1 WHERE id = $2',
      [hashedNewPassword, decoded.id]
    );
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// APIFY INTEGRATION ENDPOINTS

// Get available Apify actors
app.get('/api/apify/actors', async (req, res) => {
  try {
    const response = await axios.get(`${APIFY_BASE_URL}/acts`, {
      params: { token: APIFY_API_KEY, limit: 100 }
    });
    
    res.json({
      success: true,
      actors: response.data.data.items
    });
  } catch (error) {
    console.error('Apify actors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching Apify actors',
      error: error.message
    });
  }
});

// Run an Apify actor
app.post('/api/apify/run/:actorId', async (req, res) => {
  try {
    let { actorId } = req.params;
    const inputData = req.body;
    
    // Handle the special format for compass/crawler-google-places
    if (actorId === 'compass~crawler-google-places') {
      actorId = 'compass/crawler-google-places';
    }
    
    console.log(`🚀 Running Apify actor: ${actorId}`);
    console.log('📋 Input data:', JSON.stringify(inputData, null, 2));
    
    const response = await axios.post(
      `${APIFY_BASE_URL}/acts/${actorId}/runs`,
      inputData,
      {
        params: { token: APIFY_API_KEY },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log(`✅ Actor started successfully. Run ID: ${response.data.data.id}`);
    
    res.json({
      success: true,
      runId: response.data.data.id,
      status: response.data.data.status,
      message: 'Actor started successfully'
    });
  } catch (error) {
    console.error('❌ Apify run error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error running Apify actor',
      error: error.response?.data || error.message
    });
  }
});

// Get run status and results
app.get('/api/apify/runs/:runId', async (req, res) => {
  try {
    const { runId } = req.params;
    
    console.log(`📊 Checking status for run: ${runId}`);
    
    const response = await axios.get(`${APIFY_BASE_URL}/actor-runs/${runId}`, {
      params: { token: APIFY_API_KEY }
    });
    
    const runData = response.data.data;
    console.log(`📈 Run status: ${runData.status}`);
    
    let results = null;
    if (runData.status === 'SUCCEEDED' && runData.defaultDatasetId) {
      try {
        console.log(`📂 Fetching results from dataset: ${runData.defaultDatasetId}`);
        const resultsResponse = await axios.get(
          `${APIFY_BASE_URL}/datasets/${runData.defaultDatasetId}/items`,
          { params: { token: APIFY_API_KEY, limit: 200 } }
        );
        results = resultsResponse.data;
        console.log(`✅ Found ${results.length} results`);
      } catch (resultsError) {
        console.log('❌ Could not fetch results:', resultsError.message);
      }
    }
    
    res.json({
      success: true,
      status: runData.status,
      startedAt: runData.startedAt,
      finishedAt: runData.finishedAt,
      results: results
    });
  } catch (error) {
    console.error('❌ Apify run status error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching run status',
      error: error.response?.data || error.message
    });
  }
});

// Get popular/featured actors for the dashboard
app.get('/api/apify/featured', async (req, res) => {
  try {
    // List of business-relevant actor IDs
    const businessActors = [
      'compass/crawler-google-places',  // Google Places scraper
      'apify/google-maps-scraper',      // Google Maps data
      'apify/google-search-results-scraper', // Google Search results  
      'apify/linkedin-company-scraper', // LinkedIn companies
      'apify/web-scraper',              // General web scraper
      'drobnikj/crawler-google-places'  // Alternative Google Places
    ];
    
    const actorsData = await Promise.all(
      businessActors.map(async (actorId) => {
        try {
          const response = await axios.get(`${APIFY_BASE_URL}/acts/${actorId}`, {
            params: { token: APIFY_API_KEY }
          });
          return response.data.data;
        } catch (error) {
          console.log(`Could not fetch actor ${actorId}:`, error.message);
          return {
            id: actorId,
            name: actorId,
            description: 'Actor not available or access restricted',
            isError: true
          };
        }
      })
    );
    
    res.json({
      success: true,
      actors: actorsData
    });
  } catch (error) {
    console.error('Featured actors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured actors',
      error: error.message
    });
  }
});

// Test Apify connection and Google Places actor specifically
app.get('/api/apify/test', async (req, res) => {
  try {
    // Test basic connection
    const connectionTest = await axios.get(`${APIFY_BASE_URL}/acts`, {
      params: { token: APIFY_API_KEY, limit: 1 }
    });
    
    // Test Google Places actor specifically
    let googlePlacesActor = null;
    try {
      const actorResponse = await axios.get(`${APIFY_BASE_URL}/acts/compass~crawler-google-places`, {
        params: { token: APIFY_API_KEY }
      });
      googlePlacesActor = actorResponse.data.data;
    } catch (actorError) {
      console.log('Google Places actor test failed:', actorError.message);
    }
    
    res.json({
      success: true,
      message: 'Apify connection successful',
      totalActors: connectionTest.data.data.total,
      googlePlacesActor: googlePlacesActor ? {
        id: googlePlacesActor.id,
        name: googlePlacesActor.name,
        username: googlePlacesActor.username,
        isPublic: googlePlacesActor.isPublic
      } : 'Not accessible',
      apiKey: APIFY_API_KEY ? 'Configured' : 'Missing'
    });
  } catch (error) {
    console.error('Apify test error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Apify connection failed',
      error: error.response?.data || error.message
    });
  }
});

// BUSINESS SEGMENTS BASED ON REAL CNAE DATA
app.get('/api/filters/options', async (req, res) => {
  try {
    // Buscar motivos de situação cadastral da tabela 'motivo'
    let motivoSituacaoResult;
    try {
      motivoSituacaoResult = await pool.query(`
        SELECT codigo as code, descricao as description 
        FROM motivo 
        ORDER BY codigo
      `);
    } catch (error) {
      console.log('Using static motivo data due to:', error.message);
      motivoSituacaoResult = {
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
    }

    // Buscar qualificações de sócio da tabela 'qualificacao_socio'
    let qualificacaoSocioResult;
    try {
      qualificacaoSocioResult = await pool.query(`
        SELECT codigo as code, descricao as description 
        FROM qualificacao_socio 
        ORDER BY codigo
      `);
    } catch (error) {
      console.log('Using static qualificacao_socio data due to:', error.message);
      qualificacaoSocioResult = {
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
    }

    // Buscar naturezas jurídicas da tabela 'natureza_juridica'
    let naturezaJuridicaResult;
    try {
      naturezaJuridicaResult = await pool.query(`
        SELECT codigo as code, descricao as description 
        FROM natureza_juridica 
        ORDER BY codigo
      `);
    } catch (error) {
      console.log('Using static natureza_juridica data due to:', error.message);
      naturezaJuridicaResult = {
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
    }

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
  console.log('🔍 Starting company search...');
  const startTime = Date.now();
  
  try {
    const filters = req.body;
    const page = filters.page || 1;
    let companyLimit = filters.companyLimit || 1000;
    const searchMode = filters.searchMode || 'normal';

    // Set timeout for this request based on company limit
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Query timeout - consulta muito demorada. Tente filtros mais específicos.'
        });
      }
    }, companyLimit >= 50000 ? 300000 : companyLimit >= 25000 ? 240000 : 120000); // 5min for 50k, 4min for 25k+, 2min others
    
    console.log('Filters:', filters);
    
    // Allow up to 50000 companies as requested
    if (companyLimit > 50000) {
      console.log(`⚠️ Very large query detected (${companyLimit}), limiting to 50000 for performance`);
      companyLimit = 50000;
    }
    
    // When searching by specific CNPJ, automatically set limit to 1
    const isSpecificSearch = filters.cnpj && filters.cnpj.trim();
    if (isSpecificSearch) {
      companyLimit = 1;
      console.log(`🎯 CNPJ search detected, setting limit to 1`);
    } else {
      // For general searches, enforce minimum of 1000
      if (companyLimit < 1000 || companyLimit > 50000) {
        clearTimeout(timeoutId);
        return res.status(400).json({
          success: false,
          message: `O limite deve estar entre 1.000 e 50.000 empresas`
        });
      }
    }
    
    const conditions = [];
    const params = [];
    
    if (filters.uf) {
      conditions.push(`est.uf = $${params.length + 1}`);
      params.push(filters.uf);
    }
    
    if (filters.situacaoCadastral) {
      conditions.push(`est.situacao_cadastral = $${params.length + 1}`);
      params.push(filters.situacaoCadastral);
    }
    
    if (filters.segmentoNegocio) {
      // Mapear segmento para CNAEs (usando dados do businessSegments)
      const segmentId = parseInt(filters.segmentoNegocio);
      const businessSegments = [
        { id: 1, cnaes: ["4781400", "1412601", "4782201"] },
        { id: 2, cnaes: ["5611203", "5611201", "5620104", "5612100"] },
        { id: 3, cnaes: ["9602501", "9602502", "4772500"] },
        { id: 4, cnaes: ["4530703", "4530705", "4541205"] },
        { id: 5, cnaes: ["4511102", "4512901", "4520001"] },
        { id: 6, cnaes: ["4930201", "4930202", "5320202", "5229099"] },
        { id: 7, cnaes: ["6202300", "6201501", "6204000"] },
        { id: 8, cnaes: ["7020400", "7319002", "7319001"] },
        { id: 9, cnaes: ["4771701", "8712300", "8630501", "8650099"] },
        { id: 10, cnaes: ["8599699", "8599604", "8513900", "8520100"] },
        { id: 11, cnaes: ["4520008", "4541209", "4530703"] },
        { id: 12, cnaes: ["1011201", "1011202", "1012101"] },
        { id: 13, cnaes: ["4211101", "4212000", "4213800"] },
        { id: 14, cnaes: ["6421200", "6422100", "6423900"] },
        { id: 15, cnaes: ["5510801", "5510802", "5590699"] },
        { id: 16, cnaes: ["9001901", "9001902", "9002701"] },
        { id: 17, cnaes: ["7490104", "7490199", "8299799"] },
        { id: 18, cnaes: ["4110700", "4120400", "4291000"] },
        { id: 19, cnaes: ["8630501", "8630503", "8640205"] },
        { id: 20, cnaes: ["4661300", "4662200", "4669999"] }
      ];
      
      const segment = businessSegments.find(s => s.id === segmentId);
      console.log(`🔍 DEBUG SEGMENT: ID=${segmentId}, Found=${!!segment}`);
      if (segment) {
        console.log(`📋 SEGMENT CNAEs: ${JSON.stringify(segment.cnaes)}`);
        conditions.push(`est.cnae_fiscal = ANY($${params.length + 1})`);
        params.push(segment.cnaes);
        console.log(`🎯 FILTER APPLIED: est.cnae_fiscal = ANY([${segment.cnaes.join(',')}])`);
      } else {
        console.log(`❌ SEGMENT NOT FOUND: ${segmentId}`);
      }
    }
    
    if (filters.motivoSituacao) {
      conditions.push(`est.motivo_situacao_cadastral = $${params.length + 1}`);
      params.push(filters.motivoSituacao);
    }
    
    if (filters.naturezaJuridica) {
      conditions.push(`emp.natureza_juridica = $${params.length + 1}`);
      params.push(filters.naturezaJuridica);
    }
    
    if (filters.cnpj) {
      // For CNPJ searches, use exact match for much better performance
      conditions.push(`est.cnpj = $${params.length + 1}`);
      params.push(filters.cnpj);
    }
    
    if (filters.razaoSocial) {
      conditions.push(`emp.razao_social ILIKE $${params.length + 1}`);
      params.push(`%${filters.razaoSocial}%`);
    }
    
    if (filters.matrizFilial && filters.matrizFilial !== '') {
      conditions.push(`est.matriz_filial = $${params.length + 1}`);
      params.push(filters.matrizFilial);
    }
    
    if (filters.porteEmpresa) {
      conditions.push(`emp.porte_empresa = $${params.length + 1}`);
      params.push(filters.porteEmpresa);
    }
    
    if (filters.capitalSocial) {
      conditions.push(`emp.capital_social >= $${params.length + 1}`);
      params.push(parseFloat(filters.capitalSocial));
    }
    
    if (filters.temContato === 'sim') {
      conditions.push(`(est.correio_eletronico IS NOT NULL AND est.correio_eletronico != '' OR est.telefone1 IS NOT NULL AND est.telefone1 != '')`);
    } else if (filters.temContato === 'nao') {
      conditions.push(`(est.correio_eletronico IS NULL OR est.correio_eletronico = '') AND (est.telefone1 IS NULL OR est.telefone1 = '')`);
    }
    
    if (conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pelo menos um filtro é obrigatório'
      });
    }
    
    const whereClause = 'WHERE ' + conditions.join(' AND ');
    
    // Paginação SEMPRE 1000 empresas por página
    const perPage = 1000;
    const offset = (page - 1) * perPage;
    const limitPerPage = perPage;
    
    // Dynamic ORDER BY based on search mode
    let orderByClause = 'ORDER BY est.cnpj_basico'; // default
    switch (searchMode) {
      case 'random':
        orderByClause = 'ORDER BY RANDOM()';
        break;
      case 'alphabetic':
        orderByClause = 'ORDER BY est.razao_social ASC';
        break;
      case 'alphabetic_desc':
        orderByClause = 'ORDER BY est.razao_social DESC';
        break;
      case 'newest':
        orderByClause = 'ORDER BY est.data_inicio_atividades DESC NULLS LAST';
        break;
      case 'largest':
        orderByClause = 'ORDER BY COALESCE(est.capital_social::NUMERIC, 0) DESC';
        break;
      case 'reverse':
        orderByClause = 'ORDER BY est.cnpj_basico DESC';
        break;
      default:
        orderByClause = 'ORDER BY est.cnpj_basico';
    }
    
    // Complete query with all data including Simples Nacional
    const query = `
      SELECT 
        est.cnpj,
        est.cnpj_basico,
        est.cnpj_ordem,
        est.cnpj_dv,
        est.nome_fantasia,
        est.matriz_filial,
        est.situacao_cadastral,
        est.data_situacao_cadastral,
        est.motivo_situacao_cadastral,
        est.data_inicio_atividades,
        est.cnae_fiscal,
        est.cnae_fiscal_secundaria,
        est.tipo_logradouro,
        est.logradouro,
        est.numero,
        est.complemento,
        est.bairro,
        est.cep,
        est.uf,
        est.municipio,
        est.ddd1,
        est.telefone1,
        est.ddd2,
        est.telefone2,
        est.ddd_fax,
        est.fax,
        est.correio_eletronico,
        est.situacao_especial,
        est.data_situacao_especial,
        emp.razao_social,
        emp.natureza_juridica,
        emp.qualificacao_responsavel,
        emp.porte_empresa,
        emp.ente_federativo_responsavel,
        emp.capital_social,
        simples.opcao_simples,
        simples.data_opcao_simples,
        simples.data_exclusao_simples,
        simples.opcao_mei,
        simples.data_opcao_mei,
        simples.data_exclusao_mei
      FROM estabelecimento est
      LEFT JOIN empresas emp ON est.cnpj_basico = emp.cnpj_basico
      LEFT JOIN simples ON est.cnpj_basico = simples.cnpj_basico
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limitPerPage, offset);
    
    console.log(`🔧 PAGINAÇÃO DEBUG:`);
    console.log(`   Page: ${page}, CompanyLimit: ${companyLimit}, PerPage: ${perPage}`);
    console.log(`   SearchMode: ${searchMode}, Offset: ${offset}, LimitPerPage: ${limitPerPage}`);
    console.log(`   OrderBy: ${orderByClause}`);
    console.log(`   Query: LIMIT ${limitPerPage} OFFSET ${offset}`);
    console.log(`🔍 FINAL QUERY CONDITIONS: ${JSON.stringify(conditions)}`);
    console.log(`🔍 FINAL QUERY PARAMS: ${JSON.stringify(params.slice(0, -2))}`); // Exclude limit/offset
    console.log(`🔍 WHERE CLAUSE: ${whereClause}`);
    console.log('Executing query...');
    const result = await pool.query(query, params);
    
    // For performance, skip socios query for large result sets
    const cnpjBasicos = result.rows.map(row => row.cnpj_basico).filter(Boolean);
    let sociosData = {};
    
    // Optimized socios fetch - limit per company for better performance on large queries
    if (cnpjBasicos.length > 0) {
      console.log(`Fetching socios data for ${cnpjBasicos.length} companies...`);
      // Ultra-aggressive limits for 50k queries to prevent timeout
      let maxSociosPerCompany = 5;
      let totalSociosLimit = 50000;
      
      if (companyLimit >= 50000) {
        maxSociosPerCompany = 1; // Only 1 socio per company for 50k+ queries  
        totalSociosLimit = 25000; // Max 25k total socios
      } else if (companyLimit >= 25000) {
        maxSociosPerCompany = 2; // Max 2 socios per company for 25k+ queries
        totalSociosLimit = 50000;
      }
      
      console.log(`📊 Max ${maxSociosPerCompany} socios per company, total limit: ${totalSociosLimit}`);
      
      // Ultra-fast query for large volumes - minimal processing
      const sociosQuery = companyLimit >= 50000 ? `
        SELECT 
          cnpj_basico,
          identificador_de_socio,
          nome_socio,
          qualificacao_socio
        FROM socios s
        WHERE cnpj_basico = ANY($1)
          AND nome_socio IS NOT NULL
          AND nome_socio != ''
        ORDER BY cnpj_basico, identificador_de_socio
        LIMIT $2
      ` : `
        SELECT DISTINCT ON (socios.cnpj_basico, socios.identificador_de_socio)
          socios.cnpj_basico,
          socios.identificador_de_socio,
          socios.nome_socio,
          socios.cnpj_cpf_socio,
          socios.qualificacao_socio,
          socios.data_entrada_sociedade,
          socios.pais,
          socios.representante_legal,
          socios.nome_representante,
          socios.qualificacao_representante_legal,
          socios.faixa_etaria
        FROM (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY cnpj_basico ORDER BY identificador_de_socio) as rn
          FROM socios
          WHERE cnpj_basico = ANY($1)
          AND nome_socio IS NOT NULL
          AND nome_socio != ''
        ) socios
        WHERE rn <= $2
        ORDER BY socios.cnpj_basico, socios.identificador_de_socio
        LIMIT $3
      `;
      
      try {
        // Different parameters for optimized vs full query
        const queryParams = companyLimit >= 50000 
          ? [cnpjBasicos, totalSociosLimit] // Simple query: only array and limit
          : [cnpjBasicos, maxSociosPerCompany, totalSociosLimit]; // Full query: array, per-company limit, total limit
          
        const sociosResult = await pool.query(sociosQuery, queryParams);
        console.log(`📊 Found ${sociosResult.rows.length} socios records`);
        
        // Group socios by cnpj_basico - handle different query structures
        sociosResult.rows.forEach(socio => {
          if (!sociosData[socio.cnpj_basico]) {
            sociosData[socio.cnpj_basico] = [];
          }
          
          // For 50k+ queries (simplified structure) vs normal queries (full structure)
          const socioData = companyLimit >= 50000 ? {
            identificador: socio.identificador_de_socio || 1,
            nome: socio.nome_socio,
            cpf_cnpj: null, // Not available in fast query
            qualificacao: socio.qualificacao_socio,
            data_entrada: null, // Not available in fast query
            pais: null, // Not available in fast query
            representante_legal_cpf: null,
            representante_legal_nome: null,
            representante_legal_qualificacao: null,
            faixa_etaria: null
          } : {
            identificador: socio.identificador_de_socio,
            nome: socio.nome_socio,
            cpf_cnpj: socio.cnpj_cpf_socio,
            qualificacao: socio.qualificacao_socio,
            data_entrada: socio.data_entrada_sociedade,
            pais: socio.pais,
            representante_legal_cpf: socio.representante_legal,
            representante_legal_nome: socio.nome_representante,
            representante_legal_qualificacao: socio.qualificacao_representante_legal,
            faixa_etaria: socio.faixa_etaria
          };
          
          sociosData[socio.cnpj_basico].push(socioData);
        });
      } catch (sociosError) {
        console.log('⚠️ Socios query failed, continuing without socios data:', sociosError.message);
      }
    }
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Found ${result.rows.length} companies in ${queryTime}ms`);
    
    const companies = result.rows.map(row => ({
      // IDENTIFICAÇÃO
      cnpj: row.cnpj,
      cnpjBasico: row.cnpj_basico,
      cnpjOrdem: row.cnpj_ordem,
      cnpjDv: row.cnpj_dv,
      razaoSocial: row.razao_social || row.nome_fantasia || 'Não informado',
      nomeFantasia: cleanNomeFantasia(row.nome_fantasia),
      
      // SITUAÇÃO
      matrizFilial: row.matriz_filial === '1' ? 'Matriz' : row.matriz_filial === '2' ? 'Filial' : 'Não informado',
      situacaoCadastral: row.situacao_cadastral,
      situacaoDescricao: row.situacao_cadastral === '02' ? 'Ativa' : 
                        row.situacao_cadastral === '08' ? 'Baixada' : 
                        row.situacao_cadastral === '04' ? 'Inapta' : 'Outros',
      dataSituacao: row.data_situacao_cadastral,
      motivoSituacao: row.motivo_situacao_cadastral,
      motivoDescricao: row.motivo_descricao,
      dataInicioAtividades: row.data_inicio_atividades,
      situacaoEspecial: row.situacao_especial,
      dataSituacaoEspecial: row.data_situacao_especial,
      
      // ATIVIDADE ECONÔMICA
      cnaePrincipal: row.cnae_fiscal,
      cnaeDescricao: row.cnae_fiscal || 'Não informado',
      cnaeSecundaria: row.cnae_fiscal_secundaria,
      
      // ENDEREÇO COMPLETO
      tipoLogradouro: row.tipo_logradouro,
      logradouro: row.logradouro,
      numero: row.numero,
      complemento: row.complemento,
      bairro: row.bairro,
      cep: row.cep,
      uf: row.uf,
      municipio: row.municipio,
      municipioDescricao: row.municipio_descricao,
      
      // CONTATOS
      ddd1: row.ddd1,
      telefone1: row.telefone1,
      ddd2: row.ddd2,
      telefone2: row.telefone2,
      dddFax: row.ddd_fax,
      fax: row.fax,
      email: row.correio_eletronico,
      
      // DADOS DA EMPRESA
      naturezaJuridica: row.natureza_juridica,
      naturezaJuridicaDescricao: row.natureza_juridica || 'Não informado',
      qualificacaoResponsavel: row.qualificacao_responsavel,
      qualificacaoResponsavelDescricao: row.qualificacao_responsavel || 'Não informado',
      porteEmpresa: row.porte_empresa,
      porteDescricao: row.porte_empresa === '01' ? 'Microempresa' :
                     row.porte_empresa === '03' ? 'Empresa de Pequeno Porte' :
                     row.porte_empresa === '05' ? 'Demais' : 'Não informado',
      enteFederativoResponsavel: row.ente_federativo_responsavel,
      capitalSocial: row.capital_social ? parseFloat(row.capital_social) : null,
      
      // SIMPLES NACIONAL / MEI - Include all data as requested
      opcaoSimples: row.opcao_simples,
      dataOpcaoSimples: row.data_opcao_simples,
      dataExclusaoSimples: row.data_exclusao_simples,
      opcaoMei: row.opcao_mei,
      dataOpcaoMei: row.data_opcao_mei,
      dataExclusaoMei: row.data_exclusao_mei,
      
      // SÓCIOS E ADMINISTRADORES
      socios: sociosData[row.cnpj_basico] || [],
      quantidadeSocios: sociosData[row.cnpj_basico] ? sociosData[row.cnpj_basico].length : 0
    }));
    
    const countQuery = `SELECT COUNT(*) as total FROM estabelecimento est ${whereClause}`;
    const countParams = params.slice(0, -2);
    const countResult = await pool.query(countQuery, countParams);
    const totalCompanies = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      data: companies,
      pagination: {
        currentPage: page,
        totalCompanies: Math.min(totalCompanies, companyLimit),
        totalAvailable: totalCompanies,
        totalPages: Math.ceil(Math.min(totalCompanies, companyLimit) / perPage),
        companiesPerPage: perPage,
        requestedLimit: companyLimit,
        hasNextPage: (page * perPage) < Math.min(totalCompanies, companyLimit),
        hasPreviousPage: page > 1
      },
      performance: {
        queryTimeMs: queryTime,
        resultsCount: companies.length
      }
    });
    
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro na busca de empresas',
      error: error.message,
      queryTimeMs: queryTime
    });
  }
});

// Get total company count with filters (without returning data)
app.post('/api/companies/count', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { uf, segmentoNegocio, situacaoCadastral, porteEmpresa } = req.body;
    
    let whereConditions = ['1=1'];
    let queryParams = [];
    let paramCount = 0;

    // UF filter
    if (uf && uf.trim() !== '') {
      paramCount++;
      whereConditions.push(`e.uf = $${paramCount}`);
      queryParams.push(uf.trim());
    }

    // Business segment filter (CNAE mapping)
    if (segmentoNegocio) {
      const segmentCnaes = getSegmentCnaes(segmentoNegocio);
      if (segmentCnaes.length > 0) {
        const placeholders = segmentCnaes.map((_, index) => `$${paramCount + index + 1}`).join(',');
        whereConditions.push(`e.cnae_fiscal_principal IN (${placeholders})`);
        queryParams.push(...segmentCnaes);
        paramCount += segmentCnaes.length;
      }
    }

    // Build count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM empresa e
      WHERE ${whereConditions.join(' AND ')}
    `;

    console.log('🔍 Count query:', countQuery);
    console.log('📊 Parameters:', queryParams);

    const countResult = await pool.query(countQuery, queryParams);
    const totalCompanies = parseInt(countResult.rows[0].total);
    const queryTime = Date.now() - startTime;

    console.log(`📊 Total companies found: ${totalCompanies.toLocaleString()}`);

    res.json({
      success: true,
      totalCompanies,
      filters: {
        uf: uf || null,
        segmentoNegocio: segmentoNegocio || null,
        situacaoCadastral: situacaoCadastral || null,
        porteEmpresa: porteEmpresa || null
      },
      queryTimeMs: queryTime
    });

  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('❌ Count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao contar empresas',
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

Promise.all([initDB(), createUsersTable()]).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('✅ Company search: 1000-50000 companies');
    console.log('✅ Database: Railway PostgreSQL');
    console.log('✅ Authentication: Email verification enabled');
    console.log('🎯 FIXED: 20 business segments + all states');
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ Frontend: Serving React from /frontend/dist');
    }
  });
});