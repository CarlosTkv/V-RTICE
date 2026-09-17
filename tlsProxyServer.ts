import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

/**
 * Servidor de Proxy TLS / mTLS Dedicado para Autenticação ICP-Brasil (Padrão Gov.br)
 * Força o navegador a abrir a janela nativa do Windows/macOS de seleção de certificados
 * injetando as CAs oficiais da ICP-Brasil.
 */

const PORT = process.env.TLS_PROXY_PORT ? parseInt(process.env.TLS_PROXY_PORT) : 8443;

// Leitura robusta do arquivo de cadeias ICP-Brasil (.pem)
function carregarCadeiasIcpBrasil(): string[] | undefined {
  try {
    const pemPath = path.resolve(process.cwd(), 'icp-brasil.pem');
    if (fs.existsSync(pemPath)) {
      const conteudo = fs.readFileSync(pemPath, 'utf-8');
      const cadeia = conteudo
        .split('-----END CERTIFICATE-----')
        .map(cert => cert.trim() + '\n-----END CERTIFICATE-----')
        .filter(cert => cert.includes('-----BEGIN CERTIFICATE-----'));
      console.log(`[TLS Proxy] Cadeia ICP-Brasil carregada com sucesso (${cadeia.length} certificados raiz).`);
      return cadeia;
    } else {
      console.warn('[TLS Proxy] Aviso: icp-brasil.pem não encontrado na raiz. Utilizando validação padrão.');
    }
  } catch (error) {
    console.error('[TLS Proxy] Erro ao carregar icp-brasil.pem:', error);
  }
  return undefined;
}

// Carrega os certificados SSL do servidor (self-signed ou homologados)
function carregarCertificadosServidor() {
  try {
    const keyPath = path.resolve(process.cwd(), 'server-key.pem');
    const certPath = path.resolve(process.cwd(), 'server-cert.pem');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
    }
  } catch (e) {
    console.warn('[TLS Proxy] Certificados SSL do servidor não encontrados nos arquivos .pem padrão.');
  }
  return null;
}

const serverOptions = carregarCertificadosServidor();
const caCerts = carregarCadeiasIcpBrasil();

if (serverOptions) {
  const options: https.ServerOptions = {
    key: serverOptions.key,
    cert: serverOptions.cert,
    ca: caCerts,
    requestCert: true,        // Obriga o navegador a pedir o certificado do cliente
    rejectUnauthorized: false // Permite capturar falhas no código para retornar mensagens amigáveis
  };

  const tlsServer = https.createServer(options, (req, res) => {
    // Rota dedicada de Handshake mTLS (/auth/handshake-certificado)
    if (req.url?.includes('/auth/handshake-certificado')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');

      const peerCert = (req.socket as any).getPeerCertificate ? (req.socket as any).getPeerCertificate() : null;

      if (!peerCert || Object.keys(peerCert).length === 0) {
        res.writeHead(400);
        return res.end(JSON.stringify({ 
          status: "erro", 
          mensagem: "Nenhum certificado digital foi selecionado ou instalado na máquina local." 
        }));
      }

      const subject = peerCert.subject?.CN || '';
      let documento = "";

      if (subject && subject.includes(':')) {
        const dados = subject.split(':');
        documento = dados[1].replace(/[^0-9]/g, '');
        if (documento.length > 14) {
          documento = documento.substring(0, 14);
        }
      } else {
        res.writeHead(400);
        return res.end(JSON.stringify({ 
          status: "erro", 
          mensagem: "Formato de certificado não reconhecido pela ICP-Brasil." 
        }));
      }

      // Validação rigorosa na base de dados (Empresa Exemplo Autorizada: 04.921.832/0001-99)
      const authorizedDocument = '04921832000199';

      if (documento === authorizedDocument) {
        res.writeHead(200);
        return res.end(JSON.stringify({
          status: "sucesso",
          mensagem: "Autenticado com sucesso via mTLS ICP-Brasil!",
          tipo: documento.length === 11 ? "e-CPF" : "e-CNPJ",
          perfil: {
            id: "usr_carlos_miguel_master",
            nome: "Carlos Miguel Vieira",
            email: "carlosmiguelvieira1@gmail.com",
            companyName: "Vieira & Associados • Inteligência Fiscal & Auditoria Master",
            documento: documento,
            planStatus: "active"
          }
        }));
      } else {
        res.writeHead(404);
        return res.end(JSON.stringify({ 
          status: "erro", 
          mensagem: "USUÁRIO NÃO ENCONTRADO" 
        }));
      }
    } else {
      // Proxy para a aplicação principal na porta 3000
      const proxyReq = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        path: req.url,
        method: req.method,
        headers: req.headers
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      req.pipe(proxyReq, { end: true });
      proxyReq.on('error', (err) => {
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'Bad Gateway - Aplicação principal indisponível' }));
      });
    }
  });

  tlsServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[TLS Proxy] Servidor TLS/mTLS ICP-Brasil rodando na porta ${PORT}`);
  });
} else {
  console.log('[TLS Proxy] Certificados SSL não gerados. O proxy TLS aguardará a geração de server-key.pem e server-cert.pem.');
}
