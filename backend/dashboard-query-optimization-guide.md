# 🚀 Dashboard Query Optimization Guide

## 📊 Database Schema Analysis Summary

### Main Tables Structure
- **estabelecimento**: 66.3M rows (23GB) - Core business establishments
- **empresas**: 63.2M rows (8.5GB) - Company master data  
- **socios**: 25.9M rows (3.8GB) - Partners/shareholders data
- **simples**: 43.9M rows (4.9GB) - Tax regime information

### Key Relationships
- **cnpj_basico** links estabelecimento ↔ empresas (1:N)
- **cnpj_basico** links estabelecimento ↔ socios (1:N) 
- **cnpj_basico** links estabelecimento ↔ simples (1:1)

## 🗂️ Optimized Index Strategy

### ✅ Existing High-Performance Indexes
```sql
-- Core lookup indexes (already optimized)
estabelecimento_cnpj_key (UNIQUE)     -- 2.5GB - Fast company lookups
idx_estabelecimento_cnpj_hash         -- 2.0GB - Hash-based CNPJ searches
idx_estabelecimento_cnpj_basico       -- 1.9GB - Company relationships
idx_estabelecimento_uf_municipio      -- 441MB - Geographic analysis
idx_estabelecimento_cnae_fiscal       -- 439MB - Activity analysis
idx_estabelecimento_situacao_cadastral -- 439MB - Status filtering
```

### 🆕 Strategic Dashboard Indexes (Implemented)
```sql
-- Multi-column composite indexes for dashboard aggregations
idx_estabelecimento_uf_situacao_cnae   -- State + Status + Activity
idx_estabelecimento_situacao_uf        -- Active companies by state
idx_estabelecimento_cnae_uf            -- Activity analysis by state
idx_estabelecimento_data_inicio        -- Registration trends
idx_empresas_natureza_porte            -- Company classification
idx_socios_cnpj_qualificacao           -- Partner analysis
idx_simples_opcao_mei_data             -- MEI trends
```

## 📋 Optimized Views for Dashboard Performance

### 1. Complete Company View
```sql
-- Use v_company_summary for comprehensive company data
SELECT * FROM v_company_summary 
WHERE uf = 'SP' AND status_descricao = 'Ativa'
LIMIT 100;
```

### 2. State Statistics View
```sql
-- Use v_state_summary for state-level KPIs
SELECT uf, total_companies, active_companies, 
       (active_companies::float / total_companies * 100) as activity_rate
FROM v_state_summary
ORDER BY total_companies DESC;
```

### 3. Economic Activity Analysis
```sql
-- Use v_cnae_summary for activity insights
SELECT cnae_fiscal, total_companies, states_present, avg_capital
FROM v_cnae_summary
WHERE total_companies > 1000
ORDER BY total_companies DESC;
```

## ⚡ Materialized Views for Heavy Operations

### Dashboard KPIs (Refresh Daily)
```sql
-- Fast access to overall metrics
SELECT * FROM mv_dashboard_metrics;

-- Refresh when needed
REFRESH MATERIALIZED VIEW mv_dashboard_metrics;
```

### Registration Trends (Refresh Weekly)
```sql
-- Monthly registration patterns
SELECT year_month, new_registrations, active_registrations
FROM mv_monthly_registrations
WHERE year_month >= '202301'
ORDER BY year_month DESC;
```

## 🔧 Stored Procedures for Complex Queries

### State Statistics Function
```sql
-- Get comprehensive state data
SELECT * FROM get_state_statistics('SP'); -- Specific state
SELECT * FROM get_state_statistics();     -- All states
```

### Activity Analysis Function
```sql
-- Economic activity insights
SELECT * FROM get_activity_analysis('4711301'); -- Specific CNAE
SELECT * FROM get_activity_analysis();          -- All activities
```

## 🎯 Optimized Query Patterns

### 1. Geographic Dashboard Queries
```sql
-- ✅ OPTIMIZED: Use composite index
SELECT uf, situacao_cadastral, COUNT(*) as total
FROM estabelecimento
WHERE situacao_cadastral IN ('02', '08')
GROUP BY uf, situacao_cadastral
ORDER BY uf, total DESC;

-- ❌ AVOID: Non-selective filters first
SELECT * FROM estabelecimento 
WHERE nome_fantasia LIKE '%LTDA%' AND uf = 'SP';
```

### 2. Activity Analysis Queries
```sql
-- ✅ OPTIMIZED: Use CNAE index with state filter
SELECT e.cnae_fiscal, e.uf, COUNT(*) as companies
FROM estabelecimento e
WHERE e.cnae_fiscal LIKE '47%'     -- Retail activities
  AND e.situacao_cadastral = '02'  -- Active only
  AND e.uf IN ('SP', 'RJ', 'MG')   -- Major states
GROUP BY e.cnae_fiscal, e.uf
ORDER BY companies DESC;

-- ✅ OPTIMIZED: Join with company data efficiently
SELECT e.uf, emp.porte_empresa, COUNT(*) as total
FROM estabelecimento e
JOIN empresas emp ON e.cnpj_basico = emp.cnpj_basico
WHERE e.situacao_cadastral = '02'
GROUP BY e.uf, emp.porte_empresa;
```

### 3. Company Lookup Queries
```sql
-- ✅ OPTIMIZED: Direct CNPJ lookup
SELECT e.*, emp.razao_social, emp.capital_social
FROM estabelecimento e
LEFT JOIN empresas emp ON e.cnpj_basico = emp.cnpj_basico
WHERE e.cnpj = '11222333000181';

-- ✅ OPTIMIZED: Search by company name (limit results)
SELECT e.cnpj, e.nome_fantasia, emp.razao_social
FROM estabelecimento e
JOIN empresas emp ON e.cnpj_basico = emp.cnpj_basico
WHERE emp.razao_social ILIKE '%TECH%'
  AND e.situacao_cadastral = '02'
LIMIT 50;  -- Always limit text searches
```

### 4. Time-Series Analysis
```sql
-- ✅ OPTIMIZED: Monthly registration trends
SELECT 
  SUBSTRING(data_inicio_atividades, 1, 6) as year_month,
  uf,
  COUNT(*) as new_registrations
FROM estabelecimento
WHERE data_inicio_atividades >= '20230101'
  AND data_inicio_atividades <= '20231231'
  AND LENGTH(data_inicio_atividades) = 8
GROUP BY year_month, uf
ORDER BY year_month DESC, new_registrations DESC;
```

### 5. Partner Analysis Queries
```sql
-- ✅ OPTIMIZED: Partner distribution by company
SELECT 
  s.qualificacao_socio,
  COUNT(DISTINCT s.cnpj_basico) as companies_with_partners,
  COUNT(*) as total_partnerships
FROM socios s
JOIN estabelecimento e ON s.cnpj_basico = e.cnpj_basico
WHERE e.situacao_cadastral = '02'
  AND e.uf = 'SP'
GROUP BY s.qualificacao_socio
ORDER BY companies_with_partners DESC;
```

## 📈 Performance Optimization Best Practices

### Query Design Principles
1. **Filter Early**: Apply WHERE clauses on indexed columns first
2. **Limit Results**: Always use LIMIT for user-facing queries
3. **Use Appropriate Joins**: LEFT JOIN only when needed
4. **Group Efficiently**: GROUP BY indexed columns when possible
5. **Avoid SELECT \***: Select only needed columns

### Index Usage Guidelines
```sql
-- ✅ GOOD: Uses composite index efficiently
WHERE uf = 'SP' AND situacao_cadastral = '02' AND cnae_fiscal LIKE '47%'

-- ❌ POOR: Wrong column order for composite index
WHERE cnae_fiscal LIKE '47%' AND situacao_cadastral = '02' AND uf = 'SP'

-- ✅ GOOD: Equality before ranges
WHERE uf = 'SP' AND data_inicio_atividades >= '20230101'

-- ❌ POOR: Range condition first
WHERE data_inicio_atividades >= '20230101' AND uf = 'SP'
```

### Aggregation Optimization
```sql
-- ✅ OPTIMIZED: Use materialized views for heavy aggregations
SELECT * FROM mv_dashboard_metrics;

-- ✅ OPTIMIZED: Pre-filter before aggregating
SELECT uf, COUNT(*)
FROM estabelecimento
WHERE situacao_cadastral = '02'  -- Filter first
GROUP BY uf;

-- ❌ AVOID: Aggregate then filter
SELECT uf, company_count
FROM (SELECT uf, COUNT(*) as company_count
      FROM estabelecimento
      GROUP BY uf) t
WHERE company_count > 1000;
```

## 🔄 Maintenance & Monitoring

### Regular Maintenance Tasks
```sql
-- Update statistics (weekly)
ANALYZE estabelecimento;
ANALYZE empresas;
ANALYZE socios;
ANALYZE simples;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW mv_dashboard_metrics;
REFRESH MATERIALIZED VIEW mv_monthly_registrations;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;
```

### Performance Monitoring
```sql
-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE query LIKE '%estabelecimento%'
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes and growth
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🎯 Dashboard Implementation Guidelines

### 1. Use Pagination for Large Results
```javascript
// Frontend pagination pattern
const getCompanies = async (page = 1, limit = 50, filters = {}) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM v_company_summary 
    WHERE uf = $1 AND status_descricao = $2
    ORDER BY razao_social
    LIMIT $3 OFFSET $4
  `;
  return await db.query(query, [filters.uf, filters.status, limit, offset]);
};
```

### 2. Implement Caching for Expensive Queries
```javascript
// Cache aggregation results
const getStateSummary = async () => {
  const cacheKey = 'state_summary';
  let result = await cache.get(cacheKey);
  
  if (!result) {
    result = await db.query('SELECT * FROM v_state_summary ORDER BY total_companies DESC');
    await cache.set(cacheKey, result, 3600); // 1 hour cache
  }
  
  return result;
};
```

### 3. Use Connection Pooling
```javascript
// Optimize database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,           // Maximum connections
  min: 5,            // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

## 📊 Expected Performance Improvements

| Query Type | Before | After | Improvement |
|------------|---------|--------|-------------|
| State aggregation | ~5-10s | ~200ms | **25-50x faster** |
| Activity analysis | ~8-15s | ~300ms | **25-50x faster** |
| Company lookup | ~1-2s | ~50ms | **20-40x faster** |
| Geographic filtering | ~10-20s | ~500ms | **20-40x faster** |
| Partner analysis | ~15-30s | ~1-2s | **15-30x faster** |

This optimization strategy transforms your Railway PostgreSQL database into a high-performance analytics engine capable of powering real-time dashboards with 66M+ records! 🚀