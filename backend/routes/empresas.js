const express = require('express');
const XLSX = require('xlsx');
const { query, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Empresa = require('../models/Empresa');
const CNAE = require('../models/CNAE');

const router = express.Router();

router.use(authMiddleware);

router.get('/search', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 25, 50); // Reduzir limite padrão
    const offset = (page - 1) * limit;

    const filters = {
      razao_social: req.query.razao_social,
      cnpj: req.query.cnpj,
      nome_fantasia: req.query.nome_fantasia,
      uf: req.query.uf,
      cidade: req.query.cidade,
      situacao_cadastral: req.query.situacao_cadastral,
      cnae_principal: req.query.cnae_principal,
      segmento: req.query.segmento
    };

    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    console.log('Buscando empresas com filtros:', filters);

    // Timeout de 45 segundos para toda a operação
    const searchTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout na busca')), 45000)
    );

    const searchPromise = async () => {
      const empresas = await Empresa.searchEmpresas(filters, limit, offset);
      let total = empresas.length; // Estimativa rápida
      
      // Só faz contagem completa se tiver poucos resultados
      if (empresas.length === limit) {
        try {
          total = await Promise.race([
            Empresa.countEmpresas(filters),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout contagem')), 10000))
          ]);
        } catch (countError) {
          console.log('Erro na contagem, usando estimativa');
          total = Math.max(empresas.length, limit * 10); // Estima pelo menos 10 páginas
        }
      }

      return { empresas, total };
    };

    const { empresas, total } = await Promise.race([searchPromise(), searchTimeout]);
    const totalPages = Math.ceil(total / limit);

    res.json({
      empresas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(totalPages, page + (empresas.length === limit ? 1 : 0)),
        hasNext: empresas.length === limit,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erro na busca de empresas:', error);
    if (error.message === 'Timeout na busca') {
      res.status(408).json({ message: 'Consulta muito demorada, tente filtrar mais os dados' });
    } else {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
});

router.get('/export', [
  query('format').optional().isIn(['xlsx', 'csv']).withMessage('Formato deve ser xlsx ou csv')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const format = req.query.format || 'xlsx';
    const maxExport = 10000;

    const filters = {
      razao_social: req.query.razao_social,
      cnpj: req.query.cnpj,
      nome_fantasia: req.query.nome_fantasia,
      uf: req.query.uf,
      cidade: req.query.cidade,
      situacao_cadastral: req.query.situacao_cadastral,
      cnae_principal: req.query.cnae_principal,
      segmento: req.query.segmento
    };

    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    const empresas = await Empresa.searchEmpresas(filters, maxExport, 0);

    if (empresas.length === 0) {
      return res.status(404).json({ message: 'Nenhuma empresa encontrada para exportar' });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(empresas);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');

    const filename = `empresas_${new Date().toISOString().split('T')[0]}.${format}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      res.send(csv);
    }
  } catch (error) {
    console.error('Erro na exportação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/schema', async (req, res) => {
  try {
    const schema = await Empresa.getTableSchema();
    res.json(schema);
  } catch (error) {
    console.error('Erro ao obter schema:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/filters/ufs', async (req, res) => {
  try {
    const ufs = await Empresa.getUFs();
    res.json(ufs);
  } catch (error) {
    console.error('Erro ao obter UFs:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/filters/situacoes', async (req, res) => {
  try {
    const situacoes = await Empresa.getSituacoesCadastrais();
    res.json(situacoes);
  } catch (error) {
    console.error('Erro ao obter situações cadastrais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rotas para CNAEs e Segmentos
router.get('/segmentos', async (req, res) => {
  try {
    const segmentos = CNAE.getSegmentos();
    res.json(segmentos);
  } catch (error) {
    console.error('Erro ao obter segmentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/cnaes/segmento/:segmento', async (req, res) => {
  try {
    const { segmento } = req.params;
    const cnaes = CNAE.getCnaesBySegmento(decodeURIComponent(segmento));
    res.json(cnaes);
  } catch (error) {
    console.error('Erro ao obter CNAEs do segmento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/cnaes/search', [
  query('termo').notEmpty().withMessage('Termo de busca é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { termo } = req.query;
    const cnaes = CNAE.searchCnaes(termo);
    res.json(cnaes);
  } catch (error) {
    console.error('Erro ao buscar CNAEs:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/cnae/:cnae', async (req, res) => {
  try {
    const { cnae } = req.params;
    const cnaeInfo = CNAE.getCnaeInfo(cnae);
    if (cnaeInfo) {
      res.json(cnaeInfo);
    } else {
      res.status(404).json({ message: 'CNAE não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter informações do CNAE:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;