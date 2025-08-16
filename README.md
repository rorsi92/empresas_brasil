# 🏢 Sistema de Busca de Empresas Brasileiras

Sistema completo para busca e visualização de **+66 milhões de empresas brasileiras** com dados completos da Receita Federal via Railway PostgreSQL.

## ✨ Funcionalidades

### 🔍 Busca Avançada
- **+66 milhões de empresas** da Receita Federal
- Filtros por UF, situação cadastral, segmento de negócio
- Busca de 1.000 a 50.000 empresas por consulta
- Performance otimizada (1000 empresas em ~4-5 segundos)

### 📊 Dados Completos (23 Colunas)
- **Identificação**: CNPJ, razão social, nome fantasia, matriz/filial
- **Endereço**: Logradouro completo, município, CEP, UF
- **Contatos**: Telefones com DDD, fax, email
- **Atividade**: CNAEs com descrições, data início atividades
- **Situação**: Status cadastral, datas, motivos
- **Empresarial**: Capital social, porte, natureza jurídica
- **Tributário**: Simples Nacional, MEI com datas
- **👥 Sócios**: Nomes completos, CPFs, qualificações, datas
- **👤 Representantes Legais**: Nomes, CPFs, qualificações

### 🎯 Segmentos de Negócio
20 segmentos baseados em CNAEs reais:
- Vestuário e Moda (3,5M empresas)
- Alimentação e Restaurantes (3,6M empresas)
- Beleza e Estética (2,5M empresas)
- Comércio e Mercados (2,5M empresas)
- Construção Civil (2,3M empresas)
- E mais 15 segmentos detalhados...

## 🚀 Como Executar

### Backend (API)
```bash
cd backend
npm install
node server.js
```
**Rodando em**: http://localhost:6000

### Frontend (Interface)
```bash
cd frontend
npm install
npm run dev
```
**Rodando em**: http://localhost:4001

## 🎨 Interface

### Tabela Completa
- 23 colunas com todos os dados visíveis
- Scroll horizontal para navegação
- Formatação inteligente (telefones, valores)
- Cores diferenciadas para sócios e representantes

## 🔧 Tecnologias

- **Backend**: Node.js + Express + PostgreSQL (Railway)
- **Frontend**: React + Vite + Styled Components
- **Banco**: +66M empresas da Receita Federal (+25M sócios)

---

**Status**: ✅ Funcionando - Sistema Completo
