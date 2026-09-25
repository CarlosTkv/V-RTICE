import axios from 'axios';

export interface CancelAlertPayload {
  eventoId: string;
  chaveAcesso: string;
  numeroNota: string;
  serie: string;
  cnpjEmitente: string;
  razaoSocialEmitente: string;
  cnpjDestinatario: string;
  valorTotal: number;
  dataCancelamento: string;
  justificativa?: string;
  protocoloHomologacao?: string;
}

export interface WebhookConfig {
  url: string;
  secretToken?: string;
  ativo: boolean;
}

const inMemoryAlertQueue: CancelAlertPayload[] = [];

/**
 * Dispara notificação de cancelamento para o webhook configurado e grava no feed de alertas do sistema
 */
export async function notificarCancelamentoNFe(
  payload: CancelAlertPayload, 
  webhookConfig?: WebhookConfig
): Promise<{ success: boolean; status: string }> {
  // 1. Grava na fila de alertas em memória para o frontend
  inMemoryAlertQueue.unshift(payload);
  if (inMemoryAlertQueue.length > 50) {
    inMemoryAlertQueue.pop();
  }

  console.log(`[ALERT/COMPLIANCE] Cancelamento detectado na chave ${payload.chaveAcesso} emitida por ${payload.razaoSocialEmitente}`);

  // 2. Se houver webhook externo configurado, envia via POST com assinatura
  if (webhookConfig && webhookConfig.ativo && webhookConfig.url) {
    try {
      const response = await axios.post(webhookConfig.url, {
        tipo: 'ALERTA_CANCELAMENTO_NFE',
        dataHora: new Date().toISOString(),
        documento: payload
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Vertice-Event': 'NFe.Cancelamento',
          ...(webhookConfig.secretToken ? { 'Authorization': `Bearer ${webhookConfig.secretToken}` } : {})
        },
        timeout: 5000
      });

      return { success: true, status: `Webhook enviado com status ${response.status}` };
    } catch (err: any) {
      console.error(`[ALERT/WEBHOOK] Falha ao entregar webhook para ${webhookConfig.url}:`, err?.message);
      return { success: false, status: `Falha no webhook: ${err?.message}` };
    }
  }

  return { success: true, status: 'Alerta gravado no centro de notificações do Vértice' };
}

/**
 * Retorna os últimos alertas de cancelamento e inconsistências críticas
 */
export function getRecentCancelAlerts(): CancelAlertPayload[] {
  return inMemoryAlertQueue;
}
