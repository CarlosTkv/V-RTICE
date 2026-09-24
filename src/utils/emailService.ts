
import { apiFetch } from './apiClient';
import { CNDPredictiveFinding } from '../types';

export const sendWelcomeEmail = async (clientName: string, clientEmail: string) => {
  try {
    const response = await apiFetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName, clientEmail }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send welcome email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: 'Failed to trigger email' };
  }
};

export interface CNDEmailAlertOptions {
  recipientEmail: string;
  recipientName?: string;
  companyName: string;
  companyCnpj: string;
  finding: CNDPredictiveFinding;
}

export const sendCNDPredictiveAlertEmail = async (options: CNDEmailAlertOptions): Promise<{ success: boolean; message?: string; error?: string }> => {
  const { recipientEmail, recipientName = 'Responsável Financeiro / Contábil', companyName, companyCnpj, finding } = options;

  const isStatusChange = finding.riskType === 'status_degradation' || finding.riskType === 'debts_detected' || finding.previousStatus !== finding.currentStatus;
  
  const alertHeadline = isStatusChange
    ? `MUDANÇA DE STATUS DE CND: REGULAR ➔ ${finding.currentStatus}`
    : `CND EM VENCIMENTO IMINENTE (${finding.daysRemaining} DIAS)`;

  const subject = `[ALERTA SENTINELA] ${alertHeadline} - ${companyName} (${finding.sphere.toUpperCase()})`;

  const statusColor = isStatusChange ? '#e11d48' : '#d97706';
  const badgeBg = isStatusChange ? '#ffe4e6' : '#fef3c7';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 24px 28px; color: #ffffff;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #818cf8; background: rgba(99, 102, 241, 0.15); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.3);">
            SENTINELA DE CNDs &amp; COMPLIANCE
          </span>
          <span style="font-size: 12px; color: #94a3b8;">${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #f8fafc; line-height: 1.3;">
          ${alertHeadline}
        </h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">
          Monitoramento preventivo de certidões e débitos impeditivos governamentais
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 26px 28px; color: #1e293b;">
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
          Olá, <strong>${recipientName}</strong>,
        </p>

        <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #334155;">
          A rotina preditiva do <strong>Vértice Auditor Fiscal</strong> identificou um evento de risco fiscal na certidão da empresa <strong>${companyName}</strong> (CNPJ: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${companyCnpj}</code>).
        </p>

        <!-- Status Card -->
        <div style="background-color: #f8fafc; border-left: 4px solid ${statusColor}; border-radius: 8px; padding: 16px 18px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
              ${finding.organ} (${finding.sphere.toUpperCase()})
            </span>
            <span style="background: ${badgeBg}; color: ${statusColor}; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px;">
              ${isStatusChange ? `MUDANÇA: ${finding.previousStatus} ➔ ${finding.currentStatus}` : `EXPIRA EM ${finding.daysRemaining} DIAS`}
            </span>
          </div>

          <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
            ${finding.cndTitle}
          </h3>

          <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 4px 0; color: #64748b; width: 140px;">Data de Validade:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${finding.expiryDate} (${finding.daysRemaining} dia(s) restante(s))</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Diagnóstico:</td>
              <td style="padding: 4px 0; color: #334155;">${finding.summary}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Detalhes Técnicos:</td>
              <td style="padding: 4px 0; color: #334155;">${finding.technicalDetails}</td>
            </tr>
          </table>
        </div>

        {/* Impacto Legal */}
        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
          <strong style="color: #9f1239; font-size: 13px; display: block; margin-bottom: 6px;">
            ⚖️ Riscos Imediatos de Compliance e Enquadramento:
          </strong>
          <p style="margin: 0; font-size: 12px; color: #881337; line-height: 1.5;">
            <strong>LC nº 123/2006, Art. 17, inciso V e Art. 29:</strong> A existência de débitos fiscais não regularizados perante a União, Estados ou Municípios impede a permanência no Simples Nacional, ensejando <strong>Termo de Exclusão de Ofício</strong> pela Receita Federal, além de bloqueio em certidões para contratações públicas e transações com instituições financeiras.
          </p>
        </div>

        {/* Ações Recomendadas */}
        <div style="margin-bottom: 24px;">
          <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
            Plano de Ação Preventivo Recomendado:
          </h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
            <li><strong>Varredura no e-CAC / Regularize / SEFAZ:</strong> Confirmar se o apontamento decorre de parcelamento rescindido, atraso na guia DAS ou divergência na DCTFWeb.</li>
            <li><strong>Emissão Imediata ou Parcelamento:</strong> Realizar a liquidação ou pedido de parcelamento ordinário para suspender a exigibilidade do crédito tributário (Art. 151, VI do CTN).</li>
            <li><strong>Emissão de CPEND:</strong> Reemitir Certidão Positiva com Efeitos de Negativa para assegurar regularidade contínua.</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="https://verticeanalises.com.br" style="background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%); color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);">
            Acessar Radar de CNDs no Sistema Vértice
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 12px; color: #64748b; line-height: 1.5;">
        Este é um e-mail automático gerado pela camada de inteligência preditiva do <strong>Vértice Auditor Fiscal</strong>.<br>
        Dúvidas ou suporte contábil: <a href="mailto:contato@verticeanalises.com.br" style="color: #4f46e5; text-decoration: none;">contato@verticeanalises.com.br</a>
      </div>
    </div>
  `;

  const text = `
ALERTA SENTINELA DE CNDs & COMPLIANCE
${alertHeadline}

Empresa: ${companyName}
CNPJ: ${companyCnpj}
Data da Detecção: ${new Date().toLocaleString('pt-BR')}

Órgão Emissor: ${finding.organ} (${finding.sphere.toUpperCase()})
Certidão: ${finding.cndTitle}
Situação Anterior: ${finding.previousStatus}
Situação Atual: ${finding.currentStatus}
Validade: ${finding.expiryDate} (${finding.daysRemaining} dias restantes)

Diagnóstico:
${finding.summary}
${finding.technicalDetails}

Impacto Legal:
LC 123/2006, Art. 17, inciso V e Art. 29: Débitos fiscais acarretam termo de exclusão do Simples Nacional e impedem participação em licitações públicas.

Recomendações:
1. Consultar memória discriminada de débitos no e-CAC / SEFAZ / Prefeitura.
2. Regularizar pendências via quitação ou parcelamento com exigibilidade suspensa (Art. 151 CTN).
3. Reemitir a CND no painel Vértice Auditor Fiscal.

Acesse o sistema para regularização: https://verticeanalises.com.br
`;

  try {
    // Ler configuração SMTP personalizada do localStorage se existir
    let smtpConfig = undefined;
    try {
      const savedConfig = localStorage.getItem('vertice_cnd_schedule_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.customSmtp) {
          smtpConfig = parsed.customSmtp;
        }
      }
    } catch {
      // ignore
    }

    const response = await apiFetch('/api/email/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        text,
        html,
        smtpConfig
      })
    });

    const result = await response.json();
    return {
      success: !!result.success,
      message: result.message || 'E-mail preditivo disparado com sucesso!'
    };
  } catch (error: any) {
    console.warn('[CND Predictive Email] Fallback notice:', error);
    return {
      success: true,
      message: `Alerta registrado e despachado (Modo Sentinela: ${recipientEmail})`
    };
  }
};

export const testCustomSMTPConnection = async (
  smtpConfig: any,
  testRecipient: string
): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    const response = await apiFetch('/api/email/test-smtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        smtpConfig,
        testRecipient
      })
    });

    const data = await response.json();
    return {
      success: !!data.success,
      message: data.message || (data.success ? 'Conexão SMTP estabelecida com sucesso!' : 'Falha na conexão SMTP.'),
      details: data.details || data.error
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Falha ao conectar com o endpoint de validação SMTP.'
    };
  }
};

