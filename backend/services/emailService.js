const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { Resend } = require('resend');

class EmailService {
  constructor() {
    // Configurar Resend se API key disponível (PRIORIDADE 1)
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'COLOQUE_AQUI_A_CHAVE_DO_RESEND') {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.resendEnabled = true;
      console.log('✅ Resend configurado (PRIORIDADE)');
    } else {
      this.resendEnabled = false;
    }

    // Configurar Twilio se credenciais disponíveis
    if (process.env.TWILIO_ACCOUNT_SID && 
        process.env.TWILIO_AUTH_TOKEN && 
        process.env.TWILIO_AUTH_TOKEN !== 'COLOQUE_AQUI_SEU_AUTH_TOKEN') {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.twilioEnabled = true;
      console.log('✅ Twilio configurado');
    } else {
      this.twilioEnabled = false;
    }

    // Configurar SendGrid se API key disponível
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'SG.COLOQUE_AQUI_A_CHAVE_DO_SENDGRID') {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.sendgridEnabled = true;
      console.log('✅ SendGrid configurado');
    } else {
      this.sendgridEnabled = false;
    }

    if (!this.resendEnabled && !this.twilioEnabled && !this.sendgridEnabled) {
      console.log('⚠️ Nenhum provedor de email configurado - usando Ethereal fallback');
    }
    
    this.transporter = this.createTransporter();
  }

  /**
   * Criar transportador de email (fallback para Gmail)
   */
  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'noreply@empresasbrasil.com',
        pass: process.env.EMAIL_PASS || 'senha-temporaria'
      }
    });
  }

  /**
   * Template HTML para email de verificação
   */
  getVerificationEmailTemplate(name, verificationUrl) {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifique seu Email - Empresas Brasil</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            color: #6b7280;
        }
        .content {
            margin: 30px 0;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white !important;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .verify-button:hover {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            transform: translateY(-2px);
        }
        .alternative-link {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            color: #374151;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .security-note strong {
            color: #92400e;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #3b82f6;
        }
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏢 Empresas Brasil</div>
            <h1 class="title">Bem-vindo!</h1>
            <p class="subtitle">Confirme seu email para ativar sua conta</p>
        </div>
        
        <div class="content">
            <p class="greeting">Olá${name ? `, ${name}` : ''}! 👋</p>
            
            <p>Obrigado por se cadastrar na <strong>Empresas Brasil</strong>, a maior base de dados empresariais do país!</p>
            
            <p>Para ativar sua conta e começar a usar nossa plataforma, clique no botão abaixo para verificar seu email:</p>
            
            <div class="button-container">
                <a href="${verificationUrl}" class="verify-button">
                    ✅ Verificar Email
                </a>
            </div>
            
            <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <div class="alternative-link">
                ${verificationUrl}
            </div>
            
            <div class="security-note">
                <strong>🔒 Nota de Segurança:</strong><br>
                Este link expira em <strong>24 horas</strong> por motivos de segurança. 
                Se você não fez este cadastro, ignore este email.
            </div>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">66M+</div>
                    <div class="stat-label">Empresas</div>
                </div>
                <div class="stat">
                    <div class="stat-number">50K</div>
                    <div class="stat-label">Por Consulta</div>
                </div>
                <div class="stat">
                    <div class="stat-number">20</div>
                    <div class="stat-label">Segmentos</div>
                </div>
            </div>
            
            <p><strong>O que você pode fazer após ativar sua conta:</strong></p>
            <ul>
                <li>🔍 Consultar milhões de empresas brasileiras</li>
                <li>📊 Filtrar por 20 segmentos de negócio</li>
                <li>📤 Exportar dados em Excel e CSV</li>
                <li>👥 Acessar informações completas de sócios</li>
                <li>⚡ Performance otimizada para grandes volumes</li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>Empresas Brasil</strong><br>
               A maior base de dados empresariais do Brasil</p>
            
            <p>📧 Se você não conseguir ativar sua conta, responda este email<br>
               🌐 Visite nosso site: <a href="https://brazilcompanies.com.br">brazilcompanies.com.br</a></p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                © 2025 Empresas Brasil. Todos os direitos reservados.<br>
                Este é um email automático, não responda.
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Template de texto simples para email de verificação
   */
  getVerificationEmailText(name, verificationUrl) {
    return `
Olá${name ? `, ${name}` : ''}!

Bem-vindo à Empresas Brasil!

Para ativar sua conta, acesse o link abaixo:
${verificationUrl}

Este link expira em 24 horas por motivos de segurança.

Se você não fez este cadastro, ignore este email.

---
Empresas Brasil
A maior base de dados empresariais do Brasil
66+ milhões de empresas | 20 segmentos | Performance otimizada

Este é um email automático, não responda.
    `;
  }

  /**
   * Enviar email de verificação
   */
  async sendVerificationEmail(email, token, name = null) {
    try {
      // URL de verificação
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4001';
      const verificationUrl = `${baseUrl}/verify-email/${token}`;

      console.log('📧 Sending verification email to:', email);
      console.log('🔗 Verification URL:', verificationUrl);

      // Tentar enviar com Resend primeiro (PRIORIDADE)
      if (this.resendEnabled) {
        try {
          console.log('📤 Using Resend API...');
          
          const fromEmail = process.env.EMAIL_FROM || 'noreply@empresasbrasil.com';
          
          const { data, error } = await this.resend.emails.send({
            from: `Empresas Brasil <${fromEmail}>`,
            to: [email],
            subject: '🏢 Verifique seu email - Empresas Brasil',
            html: this.getVerificationEmailTemplate(name, verificationUrl),
            text: this.getVerificationEmailText(name, verificationUrl)
          });
          
          if (error) {
            console.warn('⚠️ Resend error:', error);
            throw new Error(error.message);
          }
          
          console.log('✅ Email sent successfully via Resend:', data.id);
          
          return {
            success: true,
            messageId: data.id,
            verificationUrl,
            provider: 'resend'
          };

        } catch (resendError) {
          console.warn('⚠️ Resend failed, trying Twilio...', resendError.message);
        }
      }

      // Fallback: Twilio
      if (this.twilioEnabled) {
        try {
          console.log('📤 Using Twilio SendGrid API...');
          
          const fromEmail = process.env.EMAIL_FROM || 'noreply@empresasbrasil.com';
          
          const message = await this.twilioClient.messages.create({
            from: fromEmail,
            to: email,
            subject: '🏢 Verifique seu email - Empresas Brasil',
            html: this.getVerificationEmailTemplate(name, verificationUrl)
          });
          
          console.log('✅ Email sent successfully via Twilio:', message.sid);
          
          return {
            success: true,
            messageId: message.sid,
            verificationUrl,
            provider: 'twilio'
          };

        } catch (twilioError) {
          console.warn('⚠️ Twilio failed, trying SendGrid...', twilioError.message);
        }
      }

      // Fallback: SendGrid direto
      if (this.sendgridEnabled) {
        try {
          console.log('📤 Using SendGrid API...');
          
          const fromEmail = process.env.EMAIL_FROM || 'noreply@empresasbrasil.com';
          
          const msg = {
            to: email,
            from: `Empresas Brasil <${fromEmail}>`,
            subject: '🏢 Verifique seu email - Empresas Brasil',
            html: this.getVerificationEmailTemplate(name, verificationUrl),
            text: this.getVerificationEmailText(name, verificationUrl)
          };

          const [response] = await sgMail.send(msg);
          
          console.log('✅ Email sent successfully via SendGrid:', response.messageId);
          
          return {
            success: true,
            messageId: response.messageId,
            verificationUrl,
            provider: 'sendgrid'
          };

        } catch (sendgridError) {
          console.warn('⚠️ SendGrid failed, trying fallback...', sendgridError.message);
        }
      }

      // Fallback para nodemailer/Gmail
      const mailOptions = {
        from: {
          name: 'Empresas Brasil',
          address: process.env.EMAIL_USER || 'noreply@empresasbrasil.com'
        },
        to: email,
        subject: '🏢 Verifique seu email - Empresas Brasil',
        html: this.getVerificationEmailTemplate(name, verificationUrl),
        text: this.getVerificationEmailText(name, verificationUrl),
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High'
        }
      };

      console.log('📤 Using nodemailer fallback...');
      
      // Para desenvolvimento, usar Ethereal Email (teste)
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV MODE] Creating test email account...');
        
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await testTransporter.sendMail(mailOptions);
        const previewURL = nodemailer.getTestMessageUrl(info);
        
        console.log('✅ Test email sent via Ethereal!');
        console.log('📧 Preview URL:', previewURL);
        console.log('🔗 Your verification link:', verificationUrl);

        return {
          success: true,
          messageId: info.messageId,
          verificationUrl,
          previewURL,
          provider: 'ethereal'
        };
      }
      
      const info = await this.transporter.sendMail(mailOptions);

      console.log('✅ Email sent successfully via nodemailer:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        verificationUrl,
        provider: 'nodemailer'
      };

    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message);
      
      // Em desenvolvimento, continuar mesmo com erro
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Email sending failed in dev mode, showing fallback info...');
        console.log('\n=== EMAIL CONTENT (FALLBACK) ===');
        console.log('To:', email);
        console.log('Token:', token);
        console.log('URL:', verificationUrl);
        console.log(this.getVerificationEmailText(name, verificationUrl));
        console.log('=== END EMAIL ===\n');
        
        return {
          success: true,
          messageId: 'dev-mode-fallback',
          verificationUrl: `${baseUrl}/verify-email/${token}`,
          error: error.message,
          provider: 'fallback'
        };
      }

      throw error;
    }
  }

  /**
   * Enviar email de boas-vindas (após verificação)
   */
  async sendWelcomeEmail(email, name) {
    // TODO: Implementar email de boas-vindas
    console.log('📧 Welcome email would be sent to:', email);
  }

  /**
   * Enviar notificação para admin sobre novo registro
   */
  async sendAdminNotification(adminEmail, userData) {
    const subject = `🔔 Novo Cadastro Pendente - ${userData.userName}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Novo Cadastro Pendente</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .user-info { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; }
        .actions { text-align: center; margin: 20px 0; }
        .approve-btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
        .reject-btn { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-left: 10px; }
        .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏢 Empresas Brasil</h1>
        <h2>Novo Cadastro Aguardando Aprovação</h2>
    </div>
    
    <div class="content">
        <div class="user-info">
            <h3>📋 Dados do Usuário:</h3>
            <p><strong>Nome:</strong> ${userData.userName}</p>
            <p><strong>Email:</strong> ${userData.userEmail}</p>
            <p><strong>IP:</strong> ${userData.userIP}</p>
            <p><strong>Data:</strong> ${new Date(userData.timestamp).toLocaleString('pt-BR')}</p>
            <p><strong>ID:</strong> ${userData.userId}</p>
        </div>
        
        <div class="actions">
            <p><strong>⚡ Ações Rápidas:</strong></p>
            <p>Use os comandos abaixo ou acesse o painel admin:</p>
            
            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px; text-align: left; margin: 15px 0;">
# Aprovar usuário:<br>
curl -X POST http://localhost:6000/api/auth/approve-user \\<br>
&nbsp;&nbsp;-H "Content-Type: application/json" \\<br>
&nbsp;&nbsp;-d '{"email":"${userData.userEmail}","adminKey":"admin-empresas-brasil-2025"}'<br>
<br>
# Listar pendentes:<br>
curl "http://localhost:6000/api/auth/pending-users?adminKey=admin-empresas-brasil-2025"
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>Sistema Empresas Brasil - Notificação Automática</p>
        <p>Este é um email automático, não responda.</p>
    </div>
</body>
</html>`;

    const textContent = `
🏢 EMPRESAS BRASIL - NOVO CADASTRO

📋 Dados do Usuário:
• Nome: ${userData.userName}  
• Email: ${userData.userEmail}
• IP: ${userData.userIP}
• Data: ${new Date(userData.timestamp).toLocaleString('pt-BR')}
• ID: ${userData.userId}

⚡ Para aprovar, use:
curl -X POST http://localhost:6000/api/auth/approve-user -H "Content-Type: application/json" -d '{"email":"${userData.userEmail}","adminKey":"admin-empresas-brasil-2025"}'

Sistema Empresas Brasil - Notificação Automática
    `;

    return await this.sendEmail({
      to: adminEmail,
      subject: subject,
      html: htmlContent,
      text: textContent
    });
  }

  /**
   * Enviar email de conta aprovada para usuário
   */
  async sendAccountApprovedEmail(email, name) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4001';
    const loginUrl = `${baseUrl}/login`;
    
    const subject = `🎉 Sua conta foi aprovada - Empresas Brasil`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Conta Aprovada</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .content { background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .login-btn { background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 20px 0; }
        .trial-info { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0; }
        .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Parabéns!</h1>
        <h2>Sua conta foi aprovada</h2>
    </div>
    
    <div class="content">
        <p>Olá${name ? `, ${name}` : ''}! 👋</p>
        
        <p><strong>Ótimas notícias!</strong> Sua conta na <strong>Empresas Brasil</strong> foi aprovada e está ativa.</p>
        
        <div class="trial-info">
            <p><strong>🎁 Trial Gratuito Ativado!</strong></p>
            <p>• <strong>15 dias</strong> de acesso completo</p>
            <p>• Consulta a <strong>66+ milhões</strong> de empresas</p>
            <p>• Exportação em <strong>Excel e CSV</strong></p>
            <p>• Dados completos de sócios e representantes</p>
        </div>
        
        <div style="text-align: center;">
            <a href="${loginUrl}" class="login-btn">🚀 Fazer Login Agora</a>
        </div>
        
        <p>Aproveite ao máximo sua experiência com a maior base de dados empresariais do Brasil!</p>
    </div>
    
    <div class="footer">
        <p><strong>Empresas Brasil</strong><br>
           A maior base de dados empresariais do Brasil</p>
        <p>📧 Suporte: suporte@empresasbrasil.com</p>
        <p>Este é um email automático, não responda.</p>
    </div>
</body>
</html>`;

    const textContent = `
🎉 CONTA APROVADA - EMPRESAS BRASIL

Olá${name ? `, ${name}` : ''}!

Sua conta na Empresas Brasil foi aprovada e está ativa.

🎁 TRIAL GRATUITO ATIVADO:
• 15 dias de acesso completo
• 66+ milhões de empresas
• Exportação Excel e CSV
• Dados completos de sócios

🚀 FAZER LOGIN: ${loginUrl}

Empresas Brasil - A maior base de dados empresariais do Brasil
    `;

    return await this.sendEmail({
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent
    });
  }

  /**
   * Método genérico para enviar emails
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      console.log(`📧 Sending email to: ${to} - ${subject}`);

      // Tentar enviar com Resend primeiro (PRIORIDADE)
      if (this.resendEnabled) {
        try {
          const fromEmail = process.env.EMAIL_FROM || 'noreply@empresasbrasil.com';
          
          const { data, error } = await this.resend.emails.send({
            from: `Empresas Brasil <${fromEmail}>`,
            to: [to],
            subject: subject,
            html: html,
            text: text
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          console.log('✅ Email sent successfully via Resend:', data.id);
          return { success: true, messageId: data.id, provider: 'resend' };

        } catch (resendError) {
          console.warn('⚠️ Resend failed:', resendError.message);
        }
      }

      // Em desenvolvimento, apenas logar
      if (process.env.NODE_ENV === 'development') {
        console.log('\n=== EMAIL CONTENT (DEV MODE) ===');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Content:', text);
        console.log('=== END EMAIL ===\n');
        
        return { success: true, messageId: 'dev-mode', provider: 'console' };
      }

      throw new Error('No email provider available');

    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw error;
    }
  }

  /**
   * Configurar transportador Hostinger para password reset
   */
  createHostingerTransporter() {
    return nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true, // true for port 465
      auth: {
        user: 'contato@dataatlas.com.br',
        pass: 'Blackboard12!@'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Template HTML para email de nova senha
   */
  getPasswordResetEmailTemplate(userName, newPassword, userEmail) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova Senha - DataAtlas Brasil</title>
    </head>
    <body style="font-family: 'Inter', 'Roboto', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #36e961;">
            <h1 style="color: #0a3042; font-size: 28px; margin: 0; font-weight: 800;">
                🔐 DataAtlas Brasil
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">
                Sistema de Empresas do Brasil
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 0;">
            <h2 style="color: #0a3042; font-size: 24px; margin-bottom: 20px;">
                Nova Senha Gerada
            </h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                Olá <strong>${userName || 'usuário'}</strong>,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
                Uma nova senha foi gerada para sua conta no <strong>DataAtlas Brasil</strong>.
                Use as credenciais abaixo para fazer login:
            </p>

            <!-- Login Box -->
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <div style="margin-bottom: 15px;">
                    <strong style="color: #374151; display: block; margin-bottom: 5px;">📧 Email:</strong>
                    <code style="background: white; border: 1px solid #d1d5db; padding: 8px 12px; border-radius: 6px; font-size: 14px; display: inline-block;">${userEmail}</code>
                </div>
                
                <div>
                    <strong style="color: #374151; display: block; margin-bottom: 5px;">🔑 Nova Senha:</strong>
                    <code style="background: #36e961; color: #0a3042; border: 1px solid #22c55e; padding: 12px 16px; border-radius: 6px; font-size: 16px; font-weight: 700; display: inline-block; letter-spacing: 1px;">${newPassword}</code>
                </div>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://dataatlas.com.br/login" 
                   style="background: linear-gradient(135deg, #36e961, #64ee85); 
                          color: #0a3042; 
                          text-decoration: none; 
                          padding: 12px 30px; 
                          border-radius: 8px; 
                          font-weight: 700; 
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 12px rgba(54, 233, 97, 0.3);">
                    🚀 Acessar Sistema
                </a>
            </div>

            <!-- Security Notice -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px;">
                    ⚠️ Recomendação de Segurança
                </h4>
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                    Após fazer login, recomendamos alterar sua senha para uma de sua preferência através das configurações da conta.
                </p>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Se você não solicitou esta alteração de senha, entre em contato conosco imediatamente através do email 
                <a href="mailto:contato@dataatlas.com.br" style="color: #36e961;">contato@dataatlas.com.br</a>.
            </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">
                © ${new Date().getFullYear()} DataAtlas Brasil - Sistema de Empresas do Brasil<br>
                Este é um email automático, não responda a esta mensagem.
            </p>
        </div>
    </body>
    </html>`;
  }

  /**
   * Template texto para email de nova senha
   */
  getPasswordResetEmailText(userName, newPassword, userEmail) {
    return `
🔐 DataAtlas Brasil - Nova Senha Gerada

Olá ${userName || 'usuário'},

Uma nova senha foi gerada para sua conta no DataAtlas Brasil.

DADOS PARA LOGIN:
📧 Email: ${userEmail}
🔑 Nova Senha: ${newPassword}

Acesse o sistema em: https://dataatlas.com.br/login

⚠️ RECOMENDAÇÃO DE SEGURANÇA:
Após fazer login, recomendamos alterar sua senha para uma de sua preferência através das configurações da conta.

Se você não solicitou esta alteração de senha, entre em contato conosco imediatamente através do email contato@dataatlas.com.br.

---
© ${new Date().getFullYear()} DataAtlas Brasil - Sistema de Empresas do Brasil
Este é um email automático, não responda a esta mensagem.
    `;
  }

  /**
   * Enviar email de recuperação de senha com nova senha
   */
  async sendPasswordResetEmail(userEmail, userName, newPassword) {
    try {
      const transporter = this.createHostingerTransporter();
      
      // Verificar conexão
      await transporter.verify();
      console.log('✅ Conexão com Hostinger SMTP verificada');

      const mailOptions = {
        from: {
          name: 'DataAtlas Brasil',
          address: 'contato@dataatlas.com.br'
        },
        to: userEmail,
        subject: '🔐 Nova Senha - DataAtlas Brasil',
        html: this.getPasswordResetEmailTemplate(userName, newPassword, userEmail),
        text: this.getPasswordResetEmailText(userName, newPassword, userEmail)
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email enviado com sucesso'
      };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao enviar email. Tente novamente.'
      };
    }
  }

  /**
   * Testar conexão com Hostinger SMTP
   */
  async testHostingerConnection() {
    try {
      const transporter = this.createHostingerTransporter();
      await transporter.verify();
      return { success: true, message: 'Conexão com Hostinger SMTP OK' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();