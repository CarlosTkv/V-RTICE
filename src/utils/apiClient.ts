/**
 * API Client robusto para comunicação resiliênte com o servidor (Vértice Auditor Fiscal)
 * Projetado especialmente para suportar e tolerar "cold starts" e instabilidades do Render.com.
 * Se o servidor estiver dormindo (Free Tier do Render) ou oscilando, este cliente realiza
 * tentativas automáticas (retries) com espaçamento exponencial (exponential backoff).
 */

interface FetchOptions extends RequestInit {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number; // Tempo base em ms
}

export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const {
    timeout = 90000, // Timeout padrão estendido para 90 segundos (ideal para cold starts do Render)
    maxRetries = 3,
    retryDelay = 1500,
    ...initOptions
  } = options;

  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (attempt > 0) {
        console.warn(`[API Client] Tentativa ${attempt} de ${maxRetries} para ${url}...`);
      }

      const response = await fetch(url, {
        ...initOptions,
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...(initOptions.headers || {}),
        }
      });

      clearTimeout(timeoutId);

      // Se obtivermos 502, 503 ou 504, são sintomas clássicos de servidor reiniciando ou acordando no Render.
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(`Servidor instável (HTTP ${response.status})`);
      }

      // Sucesso total
      return response;

    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      const isAbort = error?.name === 'AbortError';
      const isNetworkError = error instanceof TypeError; // Falha de conexão/DNS/CORS
      const isServerWakingUp = error?.message?.includes('HTTP 502') || error?.message?.includes('HTTP 503') || error?.message?.includes('HTTP 504');

      // Se estourar as tentativas, lança o erro final
      if (attempt === maxRetries) {
        break;
      }

      // Se for abortado manualmente pelo usuário (não timeout), não faz sentido tentar novamente
      if (isAbort && !controller.signal.aborted) {
        throw error;
      }

      // Calcula o atraso exponencial (ex: 1.5s, 3.0s, 6.0s...)
      const delay = retryDelay * Math.pow(2, attempt);
      console.warn(
        `[API Client] Falha ao comunicar com o servidor (${error?.message || 'Timeout/Erro de Rede'}). ` +
        `O Render pode estar acordando (Cold Start). Retentando em ${(delay / 1000).toFixed(1)} segundos...`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`Falha de comunicação persistente com o servidor em ${url}`);
}
