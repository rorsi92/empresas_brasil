const express = require('express');
const router = express.Router();
const DashboardFiltersAPI = require('../dashboard-filters-api');

const filtersAPI = new DashboardFiltersAPI();

/**
 * GET /api/filters/options
 * Get all filter options for dashboard initialization
 */
router.get('/options', async (req, res) => {
  try {
    const result = await filtersAPI.getAllFilterOptions();
    res.json(result);
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor ao carregar opções de filtros'
    });
  }
});

/**
 * GET /api/filters/segment/:segmentId/cnaes
 * Get CNAEs by business segment for automatic selection
 */
router.get('/segment/:segmentId/cnaes', async (req, res) => {
  try {
    const { segmentId } = req.params;
    const result = await filtersAPI.getCNAEsBySegment(parseInt(segmentId));
    res.json(result);
  } catch (error) {
    console.error('Error getting CNAEs by segment:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR', 
      message: 'Erro interno do servidor ao carregar CNAEs do segmento'
    });
  }
});

/**
 * POST /api/companies/filtered
 * Apply filters and get companies with mandatory validation
 */
router.post('/filtered', async (req, res) => {
  try {
    const { page = 1, companyLimit = 100, ...filters } = req.body;
    
    const result = await filtersAPI.getCompaniesByFilters(
      filters, 
      page, 
      companyLimit
    );
    
    // If validation failed, return error with appropriate status
    if (!result.success) {
      const statusCode = result.code === 'FILTER_VALIDATION_ERROR' ? 400 :
                        result.code === 'LIMIT_VALIDATION_ERROR' ? 400 : 500;
      return res.status(statusCode).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error filtering companies:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor ao buscar empresas'
    });
  }
});

/**
 * GET /api/filters/suggestions
 * Get filter suggestions based on current selection
 */
router.post('/suggestions', async (req, res) => {
  try {
    const filters = req.body;
    const result = await filtersAPI.getFilterSuggestions(filters);
    res.json(result);
  } catch (error) {
    console.error('Error getting filter suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor ao carregar sugestões'
    });
  }
});

/**
 * GET /api/filters/ufs/:uf/municipalities
 * Get municipalities by UF
 */
router.get('/ufs/:uf/municipalities', async (req, res) => {
  try {
    const { uf } = req.params;
    const result = await filtersAPI.getMunicipiosByUF(uf.toUpperCase());
    res.json(result);
  } catch (error) {
    console.error('Error getting municipalities by UF:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor ao carregar municípios'
    });
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Dashboard filters route error:', error);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Erro interno do servidor nos filtros do dashboard'
  });
});

module.exports = router;