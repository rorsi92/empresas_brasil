import React from 'react';
import InstitutionalLayout from '../components/InstitutionalLayout';

const SecurityPolicy = () => {
  return (
    <InstitutionalLayout title="Segurança">
      <p><strong>Última atualização:</strong> Janeiro de 2025</p>
      
      <p>
        A <strong>Empresas Brasil</strong> leva a segurança muito a sério. Esta página detalha 
        nossas medidas de proteção e boas práticas implementadas para garantir a integridade 
        dos dados e a confiabilidade de nossos serviços.
      </p>

      <h2>1. Arquitetura de Segurança</h2>
      
      <h3>1.1 Infraestrutura</h3>
      <ul>
        <li>Servidores hospedados em data centers certificados (ISO 27001)</li>
        <li>Redundância geográfica para continuidade de negócio</li>
        <li>Monitoramento 24/7 com alertas em tempo real</li>
        <li>Backup automático e criptografado a cada 4 horas</li>
      </ul>

      <h3>1.2 Proteção de Rede</h3>
      <ul>
        <li>Firewall de aplicação web (WAF) com regras atualizadas</li>
        <li>Proteção DDoS com mitigação automática</li>
        <li>Sistema de detecção de intrusão (IDS)</li>
        <li>Análise de tráfego com machine learning</li>
      </ul>

      <h2>2. Criptografia e Proteção de Dados</h2>
      
      <h3>2.1 Dados em Trânsito</h3>
      <ul>
        <li>HTTPS/TLS 1.3 obrigatório em todas as comunicações</li>
        <li>Certificados SSL de validação estendida (EV)</li>
        <li>Perfect Forward Secrecy (PFS)</li>
        <li>HTTP Public Key Pinning (HPKP)</li>
      </ul>

      <h3>2.2 Dados em Repouso</h3>
      <ul>
        <li>Criptografia AES-256 para banco de dados</li>
        <li>Chaves gerenciadas por HSM (Hardware Security Module)</li>
        <li>Backups criptografados com chaves rotacionadas</li>
        <li>Dados pessoais com camada adicional de proteção</li>
      </ul>

      <h2>3. Controle de Acesso e Autenticação</h2>
      
      <h3>3.1 Autenticação de Usuários</h3>
      <ul>
        <li>Sistema de login seguro com token JWT</li>
        <li>Sessões com tempo limite configurável</li>
        <li>Proteção contra ataques de força bruta</li>
        <li>Logout automático em caso de inatividade</li>
      </ul>

      <h3>3.2 Controle de Acesso Interno</h3>
      <ul>
        <li>Acesso por função (RBAC - Role Based Access Control)</li>
        <li>Autenticação de dois fatores (2FA) obrigatória</li>
        <li>Logs de auditoria detalhados</li>
        <li>Revisão trimestral de permissões</li>
      </ul>

      <h2>4. Monitoramento e Detecção</h2>
      
      <h3>4.1 Monitoramento Contínuo</h3>
      <ul>
        <li>Logs centralizados com análise em tempo real</li>
        <li>Alertas automáticos para atividades suspeitas</li>
        <li>Métricas de performance e segurança</li>
        <li>Dashboard executivo com KPIs de segurança</li>
      </ul>

      <h3>4.2 Detecção de Anomalias</h3>
      <ul>
        <li>Machine Learning para identificação de padrões</li>
        <li>Análise comportamental de usuários</li>
        <li>Detecção de tentativas de SQL Injection</li>
        <li>Monitoramento de APIs com rate limiting</li>
      </ul>

      <h2>5. Desenvolvimento Seguro</h2>
      
      <h3>5.1 Ciclo de Desenvolvimento</h3>
      <ul>
        <li>Security by Design desde a concepção</li>
        <li>Code review obrigatório por pares</li>
        <li>Testes de segurança automatizados</li>
        <li>Análise estática de código (SAST)</li>
      </ul>

      <h3>5.2 Testes e Validação</h3>
      <ul>
        <li>Pentesting trimestral por empresa especializada</li>
        <li>Análise dinâmica de aplicação (DAST)</li>
        <li>Validação de inputs com sanitização</li>
        <li>Testes de regressão de segurança</li>
      </ul>

      <h2>6. Proteção Contra Ameaças Comuns</h2>
      
      <h3>6.1 OWASP Top 10</h3>
      <p>Proteções implementadas contra:</p>
      <ul>
        <li>Injection (SQL, NoSQL, OS, LDAP)</li>
        <li>Broken Authentication</li>
        <li>Sensitive Data Exposure</li>
        <li>XML External Entities (XXE)</li>
        <li>Broken Access Control</li>
        <li>Security Misconfiguration</li>
        <li>Cross-Site Scripting (XSS)</li>
        <li>Insecure Deserialization</li>
        <li>Components with Known Vulnerabilities</li>
        <li>Insufficient Logging & Monitoring</li>
      </ul>

      <h3>6.2 Medidas Específicas</h3>
      <ul>
        <li>Content Security Policy (CSP) rigorosa</li>
        <li>X-Frame-Options para prevenir clickjacking</li>
        <li>Validação de origem com SameSite cookies</li>
        <li>Rate limiting por IP e usuário</li>
      </ul>

      <h2>7. Gestão de Incidentes</h2>
      
      <h3>7.1 Plano de Resposta</h3>
      <ul>
        <li>Equipe de resposta a incidentes 24/7</li>
        <li>Procedimentos documentados e testados</li>
        <li>Comunicação com stakeholders em até 1 hora</li>
        <li>Análise forense completa pós-incidente</li>
      </ul>

      <h3>7.2 Recuperação e Continuidade</h3>
      <ul>
        <li>RTO (Recovery Time Objective): 4 horas</li>
        <li>RPO (Recovery Point Objective): 1 hora</li>
        <li>Backup geográfico com recuperação automática</li>
        <li>Testes de disaster recovery trimestrais</li>
      </ul>

      <h2>8. Compliance e Certificações</h2>
      
      <h3>8.1 Conformidade Legal</h3>
      <ul>
        <li>LGPD (Lei Geral de Proteção de Dados)</li>
        <li>Marco Civil da Internet</li>
        <li>Código de Defesa do Consumidor</li>
        <li>Regulamentações do Banco Central (quando aplicável)</li>
      </ul>

      <h3>8.2 Certificações e Auditorias</h3>
      <ul>
        <li>Auditoria anual por empresa independente</li>
        <li>Relatório SOC 2 Type II</li>
        <li>Certificação ISO 27001 (em processo)</li>
        <li>Avaliação trimestral de vulnerabilidades</li>
      </ul>

      <h2>9. Educação e Treinamento</h2>
      
      <h3>9.1 Equipe Interna</h3>
      <ul>
        <li>Treinamento mensal em segurança</li>
        <li>Simulações de phishing</li>
        <li>Certificações em segurança da informação</li>
        <li>Workshop sobre ameaças emergentes</li>
      </ul>

      <h3>9.2 Conscientização dos Usuários</h3>
      <ul>
        <li>Guias de boas práticas de senha</li>
        <li>Alertas sobre tentativas de phishing</li>
        <li>Dicas de segurança no sistema</li>
        <li>Canal direto para reportar suspeitas</li>
      </ul>

      <h2>10. Contato de Segurança</h2>
      
      <p>
        Para reportar vulnerabilidades ou questões de segurança:
      </p>
      <ul>
        <li><strong>E-mail:</strong> security@empresasbrasil.com</li>
        <li><strong>Telefone 24/7:</strong> (11) 99999-9999</li>
        <li><strong>Bug Bounty:</strong> Programa de recompensas disponível</li>
        <li><strong>Criptografia:</strong> Chave PGP disponível mediante solicitação</li>
      </ul>

      <p>
        <strong>Compromisso com a Transparência:</strong> Publicamos relatórios de transparência 
        trimestrais sobre nossa postura de segurança e eventuais incidentes (anonimizados).
      </p>

      <p>
        <strong>Melhoria Contínua:</strong> Nossa equipe de segurança trabalha constantemente 
        para identificar e implementar melhorias, mantendo-se atualizada com as últimas 
        ameaças e técnicas de proteção.
      </p>
    </InstitutionalLayout>
  );
};

export default SecurityPolicy;