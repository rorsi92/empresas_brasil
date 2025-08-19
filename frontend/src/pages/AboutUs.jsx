import React from 'react';
import InstitutionalLayout from '../components/InstitutionalLayout';

const AboutUs = () => {
  return (
    <InstitutionalLayout title="Sobre Nós">
      <p>
        A <strong>Empresas Brasil</strong> é a plataforma líder em consulta de dados empresariais 
        no Brasil, oferecendo acesso à maior base de informações corporativas do país com mais de 
        <strong> 66 milhões de empresas</strong> cadastradas.
      </p>

      <h2>Nossa Missão</h2>
      <p>
        Democratizar o acesso à informação empresarial brasileira, fornecendo dados precisos, 
        atualizados e organizados para profissionais, empresas e pesquisadores que precisam 
        de informações confiáveis sobre o mercado corporativo nacional.
      </p>

      <h2>Diferenciais</h2>
      <ul>
        <li><strong>Maior base de dados:</strong> 66+ milhões de empresas brasileiras</li>
        <li><strong>Dados oficiais:</strong> Informações da Receita Federal atualizadas</li>
        <li><strong>Performance superior:</strong> 50.000 empresas processadas em 2,5 minutos</li>
        <li><strong>Segmentação inteligente:</strong> 20 setores da economia mapeados</li>
        <li><strong>Exportação profissional:</strong> Excel e CSV formatados</li>
        <li><strong>Dados completos:</strong> Empresa + sócios + representantes legais</li>
      </ul>

      <h2>Tecnologia</h2>
      <p>
        Nossa plataforma utiliza tecnologia de ponta para garantir consultas rápidas e precisas:
      </p>
      <ul>
        <li>Sistema de busca otimizado para grandes volumes</li>
        <li>Filtros avançados com múltiplos critérios</li>
        <li>Interface moderna e intuitiva</li>
        <li>Exportação em tempo real</li>
        <li>Segurança de dados certificada</li>
      </ul>

      <h2>Cobertura Nacional</h2>
      <p>
        Cobrimos <strong>todos os 27 estados brasileiros</strong> e mais de 5.500 municípios, 
        oferecendo uma visão completa do mercado empresarial nacional em todos os segmentos 
        da economia.
      </p>

      <h2>Compromisso com a Qualidade</h2>
      <p>
        Trabalhamos continuamente para manter nossos dados atualizados e precisos, 
        sincronizando regularmente com as bases oficiais da Receita Federal e outros 
        órgãos governamentais para garantir a veracidade das informações fornecidas.
      </p>

      <p>
        <strong>Empresas Brasil</strong> - Conectando você ao mercado corporativo brasileiro 
        com precisão, velocidade and confiabilidade.
      </p>
    </InstitutionalLayout>
  );
};

export default AboutUs;