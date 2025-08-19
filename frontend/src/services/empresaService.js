import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const empresaService = {
  searchEmpresas: async (filters, page = 1, limit = 50) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    params.append('page', page);
    params.append('limit', limit);
    
    const response = await api.get(`/empresas/search?${params}`);
    return response.data;
  },

  exportEmpresas: (data, format = 'xlsx') => {
    if (!data || data.length === 0) {
      throw new Error('Nenhum dado para exportar');
    }

    // Prepare data for export
    const exportData = data.map(company => ({
      'CNPJ': company.cnpj || '',
      'Razão Social': company.razao_social || '',
      'Nome Fantasia': company.nome_fantasia || '',
      'UF': company.uf || '',
      'Município': company.municipio || '',
      'Situação': company.situacao || '',
      'Data Situação': company.data_situacao_cadastral || '',
      'Data Início': company.data_inicio_atividades || '',
      'CNAE Principal': company.cnae_fiscal || '',
      'Descrição CNAE': company.cnae_descricao || '',
      'Natureza Jurídica': company.natureza_juridica || '',
      'Porte': company.porte_empresa || '',
      'Capital Social': company.capital_social || '',
      'Logradouro': company.logradouro || '',
      'Número': company.numero || '',
      'Bairro': company.bairro || '',
      'CEP': company.cep || '',
      'Telefone': company.telefone1 || '',
      'Email': company.correio_eletronico || '',
      'Sócios': company.socios ? company.socios.map(s => `${s.nome} (${s.qualificacao})`).join('; ') : '',
      'CNAEs Secundários': company.cnae_fiscal_secundaria || ''
    }));

    if (format === 'csv') {
      // Export as CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            const escapedValue = value.toString().replace(/"/g, '""');
            return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `empresas_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } else {
      // Export as Excel (using SheetJS from CDN)
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => {
        const ws = window.XLSX.utils.json_to_sheet(exportData);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Empresas');
        window.XLSX.writeFile(wb, `empresas_${new Date().toISOString().split('T')[0]}.xlsx`);
      };
      document.head.appendChild(script);
    }
  },

  getUFs: async () => {
    const response = await api.get('/empresas/filters/ufs');
    return response.data;
  },

  getSituacoesCadastrais: async () => {
    const response = await api.get('/empresas/filters/situacoes');
    return response.data;
  },

  getTableSchema: async () => {
    const response = await api.get('/empresas/schema');
    return response.data;
  },

  // Novos métodos para CNAEs e Segmentos
  getSegmentos: async () => {
    const response = await api.get('/empresas/segmentos');
    return response.data;
  },

  getCnaesBySegmento: async (segmento) => {
    const response = await api.get(`/empresas/cnaes/segmento/${encodeURIComponent(segmento)}`);
    return response.data;
  },

  searchCnaes: async (termo) => {
    const response = await api.get(`/empresas/cnaes/search?termo=${encodeURIComponent(termo)}`);
    return response.data;
  },

  getCnaeInfo: async (cnae) => {
    const response = await api.get(`/empresas/cnae/${cnae}`);
    return response.data;
  },

  // New filter methods
  getFilterOptions: async () => {
    const response = await api.get('/filters/options');
    return response.data;
  },

  getCnaesBySegment: async (segmentId) => {
    const response = await api.get(`/filters/segment/${segmentId}/cnaes`);
    return response.data;
  },

  getMunicipalitiesByUF: async (uf) => {
    const response = await api.get(`/filters/ufs/${uf}/municipalities`);
    return response.data;
  },

  searchCompaniesFiltered: async (filters, page = 1, companyLimit = 1000) => {
    const response = await api.post('/companies/filtered', {
      ...filters,
      page,
      companyLimit
    });
    return response.data;
  }
};

export default empresaService;