const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

class EmailService {
  constructor() {
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

    if (!this.twilioEnabled && !this.sendgridEnabled) {
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

      // Tentar enviar com Twilio primeiro (mais confiável)
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
   * Enviar email de recuperação de senha
   */
  async sendPasswordResetEmail(email, token, name) {
    // TODO: Implementar email de recuperação
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4001';
    const resetUrl = `${baseUrl}/reset-password/${token}`;
    
    console.log('📧 Password reset email would be sent to:', email);
    console.log('🔗 Reset URL:', resetUrl);
    
    return { success: true, resetUrl };
  }
}

module.exports = new EmailService();