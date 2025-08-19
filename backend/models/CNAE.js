const fs = require('fs');
const path = require('path');

class CNAE {
  constructor() {
    // Carregar dados de CNAEs e segmentos
    this.cnaesSegmentos = this.loadCnaesSegmentos();
    this.segmentos = this.loadSegmentos();
  }

  loadCnaesSegmentos() {
    try {
      const filePath = path.join(__dirname, '../cnaes-segmentos.json');
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar CNAEs-segmentos:', error.message);
      return [];
    }
  }

  loadSegmentos() {
    try {
      const filePath = path.join(__dirname, '../segmentos.json');
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error.message);
      return [];
    }
  }

  getSegmentos() {
    return this.segmentos;
  }

  getCnaesBySegmento(segmento) {
    return this.cnaesSegmentos
      .filter(item => item.segmento === segmento)
      .map(item => ({
        cnae: item.cnae,
        descricao: item.descricao
      }));
  }

  getSegmentoByCnae(cnae) {
    const cnaeStr = cnae.toString();
    const found = this.cnaesSegmentos.find(item => item.cnae === cnaeStr);
    return found ? found.segmento : null;
  }

  searchCnaes(termo) {
    if (!termo) return [];
    
    const termoLower = termo.toLowerCase();
    return this.cnaesSegmentos
      .filter(item => 
        item.cnae.includes(termo) || 
        item.descricao.toLowerCase().includes(termoLower)
      )
      .slice(0, 50) // Limitar resultados
      .map(item => ({
        cnae: item.cnae,
        descricao: item.descricao,
        segmento: item.segmento
      }));
  }

  getCnaeInfo(cnae) {
    const cnaeStr = cnae.toString();
    return this.cnaesSegmentos.find(item => item.cnae === cnaeStr);
  }
}

module.exports = new CNAE();