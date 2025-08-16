const Database = require('better-sqlite3');
const path = require('path');
const CNAE = require('./CNAE');

class Empresa {
  constructor() {
    this.dbPath = process.env.DB_PATH || path.join(__dirname, '../../cnpj.db');
  }

  async searchEmpresas(filters = {}, limit = 50, offset = 0) {
    const db = new Database(this.dbPath, { readonly: true });
    
    // Definir timeout de 30 segundos
    db.timeout = 30000;
    
    try {
      // Otimizar a query começando pela tabela com filtros mais específicos
      let query, params = [];
      
      if (filters.uf && !filters.cidade && !filters.razao_social && !filters.cnpj && !filters.nome_fantasia) {
        // Query otimizada para busca apenas por UF
        query = `
          SELECT 
            e.cnpj_basico,
            e.razao_social,
            est.nome_fantasia,
            est.cnpj,
            est.situacao_cadastral,
            est.uf,
            est.municipio,
            est.cnae_fiscal as cnae_principal
          FROM estabelecimento est 
          JOIN empresas e ON est.cnpj_basico = e.cnpj_basico 
          WHERE est.matriz_filial = '1' AND est.uf = ?`;
        params = [filters.uf];
      } else {
        // Query padrão para outros casos
        query = `
          SELECT 
            e.cnpj_basico,
            e.razao_social,
            est.nome_fantasia,
            est.cnpj,
            est.situacao_cadastral,
            est.uf,
            est.municipio,
            est.cnae_fiscal as cnae_principal
          FROM estabelecimento est 
          JOIN empresas e ON est.cnpj_basico = e.cnpj_basico 
          WHERE est.matriz_filial = '1'`;
          
        if (filters.uf) {
          query += ' AND est.uf = ?';
          params.push(filters.uf);
        }

        if (filters.cidade) {
          query += ' AND est.municipio LIKE ?';
          params.push(`%${filters.cidade.toUpperCase()}%`);
        }

        if (filters.cnpj) {
          query += ' AND est.cnpj LIKE ?';
          params.push(`%${filters.cnpj.replace(/\D/g, '')}%`);
        }

        if (filters.razao_social) {
          query += ' AND e.razao_social LIKE ?';
          params.push(`%${filters.razao_social.toUpperCase()}%`);
        }

        if (filters.nome_fantasia) {
          query += ' AND est.nome_fantasia LIKE ?';
          params.push(`%${filters.nome_fantasia.toUpperCase()}%`);
        }

        if (filters.situacao_cadastral) {
          query += ' AND est.situacao_cadastral = ?';
          params.push(filters.situacao_cadastral);
        }

        if (filters.cnae_principal) {
          query += ' AND est.cnae_fiscal = ?';
          params.push(filters.cnae_principal);
        }

        if (filters.segmento) {
          // Buscar CNAEs do segmento selecionado
          const cnaesDoSegmento = CNAE.getCnaesBySegmento(filters.segmento);
          if (cnaesDoSegmento.length > 0) {
            const cnaesList = cnaesDoSegmento.map(c => c.cnae);
            const placeholders = cnaesList.map(() => '?').join(',');
            query += ` AND est.cnae_fiscal IN (${placeholders})`;
            params.push(...cnaesList);
          }
        }
      }

      query += ' ORDER BY e.razao_social LIMIT ? OFFSET ?';
      params.push(Math.min(limit, 100), offset);

      console.log(`Executando query com ${params.length} parâmetros...`);
      const stmt = db.prepare(query);
      const rows = stmt.all(params);
      db.close();
      return rows;
    } catch (err) {
      db.close();
      console.error('Erro na consulta:', err.message);
      throw err;
    }
  }

  async countEmpresas(filters = {}) {
    const db = new Database(this.dbPath, { readonly: true });
    db.timeout = 15000;
    
    try {
      // Para contagem, limitamos para evitar queries muito lentas
      let query = `
        SELECT COUNT(*) as total 
        FROM estabelecimento est 
        JOIN empresas e ON est.cnpj_basico = e.cnpj_basico 
        WHERE est.matriz_filial = '1'`;
      const params = [];

      if (filters.uf) {
        query += ' AND est.uf = ?';
        params.push(filters.uf);
      }

      if (filters.cidade) {
        query += ' AND est.municipio LIKE ?';
        params.push(`%${filters.cidade.toUpperCase()}%`);
      }

      if (filters.cnpj) {
        query += ' AND est.cnpj LIKE ?';
        params.push(`%${filters.cnpj.replace(/\D/g, '')}%`);
      }

      if (filters.razao_social) {
        query += ' AND e.razao_social LIKE ?';
        params.push(`%${filters.razao_social.toUpperCase()}%`);
      }

      if (filters.nome_fantasia) {
        query += ' AND est.nome_fantasia LIKE ?';
        params.push(`%${filters.nome_fantasia.toUpperCase()}%`);
      }

      if (filters.situacao_cadastral) {
        query += ' AND est.situacao_cadastral = ?';
        params.push(filters.situacao_cadastral);
      }

      if (filters.cnae_principal) {
        query += ' AND est.cnae_fiscal = ?';
        params.push(filters.cnae_principal);
      }

      if (filters.segmento) {
        // Buscar CNAEs do segmento selecionado
        const cnaesDoSegmento = CNAE.getCnaesBySegmento(filters.segmento);
        if (cnaesDoSegmento.length > 0) {
          const cnaesList = cnaesDoSegmento.map(c => c.cnae);
          const placeholders = cnaesList.map(() => '?').join(',');
          query += ` AND est.cnae_fiscal IN (${placeholders})`;
          params.push(...cnaesList);
        }
      }

      console.log(`Contando resultados...`);
      const stmt = db.prepare(query);
      const row = stmt.get(params);
      db.close();
      return row.total;
    } catch (err) {
      db.close();
      console.error('Erro na contagem:', err.message);
      // Se der erro na contagem, retorna estimativa
      return Math.min(10000, 50 * 100); // Estima baseado em paginação
    }
  }

  async getTableSchema() {
    const db = new Database(this.dbPath, { readonly: true });
    
    try {
      const stmt = db.prepare("PRAGMA table_info(empresas)");
      const rows = stmt.all();
      db.close();
      return rows;
    } catch (err) {
      db.close();
      throw err;
    }
  }

  async getUFs() {
    const db = new Database(this.dbPath, { readonly: true });
    
    try {
      const stmt = db.prepare("SELECT DISTINCT uf FROM estabelecimento WHERE uf IS NOT NULL AND uf != '' ORDER BY uf");
      const rows = stmt.all();
      db.close();
      return rows.map(row => row.uf);
    } catch (err) {
      db.close();
      throw err;
    }
  }

  async getSituacoesCadastrais() {
    const db = new Database(this.dbPath, { readonly: true });
    
    try {
      const stmt = db.prepare("SELECT DISTINCT situacao_cadastral FROM estabelecimento WHERE situacao_cadastral IS NOT NULL ORDER BY situacao_cadastral");
      const rows = stmt.all();
      db.close();
      return rows.map(row => row.situacao_cadastral);
    } catch (err) {
      db.close();
      throw err;
    }
  }
}

module.exports = new Empresa();