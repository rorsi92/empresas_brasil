const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false }
});

async function analyzeCNAEs() {
  try {
    console.log('📊 Analyzing CNAE distribution in database...');
    
    // Get top CNAEs by company count
    const topCnaes = await pool.query(`
      SELECT 
        est.cnae_fiscal,
        cnae.descricao,
        COUNT(*) as total_empresas,
        COUNT(CASE WHEN est.situacao_cadastral = '02' THEN 1 END) as empresas_ativas
      FROM estabelecimento est
      LEFT JOIN cnae ON est.cnae_fiscal = cnae.codigo
      WHERE est.cnae_fiscal IS NOT NULL
      GROUP BY est.cnae_fiscal, cnae.descricao
      ORDER BY total_empresas DESC
      LIMIT 50
    `);
    
    console.log('\n🏆 TOP 50 CNAEs por número de empresas:');
    topCnaes.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.cnae_fiscal} - ${row.descricao}`);
      console.log(`   📈 ${row.total_empresas} empresas (${row.empresas_ativas} ativas)`);
    });
    
    // Analyze CNAE groups (first 2 digits)
    const cnaeGroups = await pool.query(`
      SELECT 
        LEFT(est.cnae_fiscal, 2) as grupo_cnae,
        COUNT(*) as total_empresas,
        COUNT(CASE WHEN est.situacao_cadastral = '02' THEN 1 END) as empresas_ativas,
        ARRAY_AGG(DISTINCT LEFT(cnae.descricao, 50)) as exemplos_atividades
      FROM estabelecimento est
      LEFT JOIN cnae ON est.cnae_fiscal = cnae.codigo
      WHERE est.cnae_fiscal IS NOT NULL
      GROUP BY LEFT(est.cnae_fiscal, 2)
      ORDER BY total_empresas DESC
      LIMIT 30
    `);
    
    console.log('\n\n🎯 GRUPOS CNAE por setor (primeiros 2 dígitos):');
    cnaeGroups.rows.forEach((row, index) => {
      console.log(`${index + 1}. Grupo ${row.grupo_cnae}** - ${row.total_empresas} empresas (${row.empresas_ativas} ativas)`);
      console.log(`   Exemplos: ${row.exemplos_atividades.slice(0, 3).join(', ')}`);
    });
    
    // Get specific business categories
    const categories = [
      { name: 'Comércio Varejista', patterns: ['47%'] },
      { name: 'Restaurantes e Alimentação', patterns: ['56%'] },
      { name: 'Construção Civil', patterns: ['42%', '43%'] },
      { name: 'Serviços Profissionais', patterns: ['69%', '70%', '71%', '72%', '73%', '74%'] },
      { name: 'Agricultura e Pecuária', patterns: ['01%', '02%', '03%'] },
      { name: 'Indústria', patterns: ['10%', '11%', '12%', '13%', '14%', '15%', '16%', '17%', '18%', '19%', '20%', '21%', '22%', '23%', '24%', '25%', '26%', '27%', '28%', '29%', '30%', '31%', '32%', '33%'] },
      { name: 'Transporte', patterns: ['49%', '50%', '51%', '52%', '53%'] },
      { name: 'Saúde', patterns: ['86%'] },
      { name: 'Educação', patterns: ['85%'] },
      { name: 'Tecnologia', patterns: ['62%', '63%'] }
    ];
    
    console.log('\n\n📋 ANÁLISE POR CATEGORIAS DE NEGÓCIO:');
    for (let category of categories) {
      const whereClause = category.patterns.map(p => `est.cnae_fiscal LIKE '${p}'`).join(' OR ');
      
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_empresas,
          COUNT(CASE WHEN est.situacao_cadastral = '02' THEN 1 END) as empresas_ativas,
          ARRAY_AGG(DISTINCT est.cnae_fiscal ORDER BY est.cnae_fiscal LIMIT 10) as cnaes_principais
        FROM estabelecimento est
        WHERE ${whereClause}
      `);
      
      const data = result.rows[0];
      console.log(`\n🏢 ${category.name}:`);
      console.log(`   📊 ${data.total_empresas} empresas (${data.empresas_ativas} ativas)`);
      console.log(`   🔢 CNAEs: ${data.cnaes_principais.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeCNAEs();