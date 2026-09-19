import { PartnerOtherCompany, Partner, CompanyAddress, CompanyRFBValidation } from '../types';

export interface CNPJQSAItem {
  nome_socio: string;
  qualificacao_socio?: string;
  codigo_qualificacao_socio?: number;
  faixa_etaria?: string;
  cnpj_cpf_do_socio?: string;
  data_entrada_sociedade?: string;
  percentual_capital_social?: number;
  pais_origem?: string;
}

export interface CNPJApiResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral: string;
  data_situacao_cadastral?: string;
  motivo_situacao_cadastral?: string;
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  cnaes_secundarios?: Array<{ codigo: string; descricao: string }>;
  natureza_juridica?: string;
  capital_social: number;
  porte?: string;
  opcao_pelo_simples: boolean | null;
  data_opcao_pelo_simples?: string | null;
  opcao_pelo_mei: boolean | null;
  uf: string;
  municipio: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  qsa: CNPJQSAItem[];
}

// Clean and sanitize CNPJ string
export function sanitizeDoc(doc: string): string {
  return doc.replace(/\D/g, '');
}

export function formatCNPJ(cnpj: string): string {
  if (!cnpj || cnpj === 'Sem dados disponíveis') return 'Sem dados disponíveis';
  const digits = sanitizeDoc(cnpj);
  if (digits.length !== 14) return cnpj;
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatCPF(cpf: string): string {
  if (!cpf || cpf === 'Sem dados disponíveis') return 'Sem dados disponíveis';
  const digits = sanitizeDoc(cpf);
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCEP(cep?: string): string {
  if (!cep) return '';
  const digits = sanitizeDoc(cep);
  if (digits.length === 8) {
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
}

export function buildFormattedAddress(addr: {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
}): string {
  const parts: string[] = [];
  if (addr.logradouro) {
    let street = addr.logradouro;
    if (addr.numero) street += `, ${addr.numero}`;
    if (addr.complemento) street += ` (${addr.complemento})`;
    parts.push(street);
  }
  if (addr.bairro) parts.push(addr.bairro);
  if (addr.municipio) {
    parts.push(`${addr.municipio}${addr.uf ? `/${addr.uf}` : ''}`);
  } else if (addr.uf) {
    parts.push(addr.uf);
  }
  if (addr.cep) parts.push(`CEP: ${formatCEP(addr.cep)}`);

  return parts.join(' - ');
}

/**
 * Fetches real CNPJ details from public Receita Federal APIs (BrasilAPI and MinhaReceita)
 */
export async function fetchCNPJData(rawCnpj: string): Promise<CNPJApiResponse> {
  const cleanCnpj = sanitizeDoc(rawCnpj);
  if (cleanCnpj.length !== 14) {
    throw new Error('CNPJ inválido. Digite os 14 dígitos numéricos.');
  }

  // 1. Try BrasilAPI (Free public API without authentication token)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      
      const qsa: CNPJQSAItem[] = (data.qsa || []).map((item: any) => ({
        nome_socio: item.nome_socio || item.nome_socio_razao_social || 'Sem dados disponíveis',
        qualificacao_socio: item.qualificacao_socio || item.qualificacao_representante_legal || 'Sócio',
        codigo_qualificacao_socio: item.codigo_qualificacao_socio,
        faixa_etaria: item.faixa_etaria,
        cnpj_cpf_do_socio: item.cnpj_cpf_do_socio || 'Sem dados disponíveis',
        data_entrada_sociedade: item.data_entrada_sociedade,
        percentual_capital_social: item.percentual_capital_social || 0,
        pais_origem: item.pais,
      }));

      const cnaesSec: Array<{ codigo: string; descricao: string }> = (data.cnaes_secundarios || []).map((s: any) => ({
        codigo: s.codigo ? `${String(s.codigo).slice(0, 2)}.${String(s.codigo).slice(2, 4)}-${String(s.codigo).slice(4, 5)}` : String(s.codigo || ''),
        descricao: s.descricao || '',
      }));

      return {
        cnpj: formatCNPJ(cleanCnpj),
        razao_social: data.razao_social || data.nome_fantasia || 'Sem dados disponíveis',
        nome_fantasia: data.nome_fantasia || undefined,
        situacao_cadastral: (data.descricao_situacao_cadastral || 'ATIVA').toUpperCase(),
        data_situacao_cadastral: data.data_situacao_cadastral,
        motivo_situacao_cadastral: data.motivo_situacao_cadastral,
        cnae_fiscal: data.cnae_fiscal ? `${String(data.cnae_fiscal).slice(0, 2)}.${String(data.cnae_fiscal).slice(2, 4)}-${String(data.cnae_fiscal).slice(4, 5)}` : 'Sem dados disponíveis',
        cnae_fiscal_descricao: data.cnae_fiscal_descricao || 'Sem dados disponíveis',
        cnaes_secundarios: cnaesSec,
        natureza_juridica: data.codigo_natureza_juridica ? `${data.codigo_natureza_juridica} - ${data.natureza_juridica || ''}` : data.natureza_juridica,
        capital_social: typeof data.capital_social === 'number' ? data.capital_social : parseFloat(data.capital_social || '0') || 0,
        porte: data.porte || data.descricao_porte,
        opcao_pelo_simples: data.opcao_pelo_simples ?? null,
        data_opcao_pelo_simples: data.data_opcao_pelo_simples,
        opcao_pelo_mei: data.opcao_pelo_mei ?? false,
        uf: data.uf || 'SP',
        municipio: data.municipio || 'Sem dados disponíveis',
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cep: data.cep,
        qsa,
      };
    }
  } catch (err) {
    console.warn('BrasilAPI request error or timeout:', err);
  }

  // 2. Try MinhaReceita public API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(`https://minhareceita.org/${cleanCnpj}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const qsa: CNPJQSAItem[] = (data.qsa || []).map((item: any) => ({
        nome_socio: item.nome_socio || 'Sem dados disponíveis',
        qualificacao_socio: item.qualificacao_socio || 'Sócio',
        faixa_etaria: item.faixa_etaria,
        cnpj_cpf_do_socio: item.cnpj_cpf_do_socio || 'Sem dados disponíveis',
      }));

      const cnaesSec: Array<{ codigo: string; descricao: string }> = (data.cnaes_secundarios || []).map((s: any) => ({
        codigo: String(s.codigo || ''),
        descricao: s.descricao || '',
      }));

      return {
        cnpj: formatCNPJ(cleanCnpj),
        razao_social: data.razao_social || 'Sem dados disponíveis',
        nome_fantasia: data.nome_fantasia || undefined,
        situacao_cadastral: (data.descricao_situacao_cadastral || 'ATIVA').toUpperCase(),
        data_situacao_cadastral: data.data_situacao_cadastral,
        cnae_fiscal: data.cnae_fiscal ? `${data.cnae_fiscal}` : 'Sem dados disponíveis',
        cnae_fiscal_descricao: data.cnae_fiscal_descricao || 'Sem dados disponíveis',
        cnaes_secundarios: cnaesSec,
        capital_social: typeof data.capital_social === 'number' ? data.capital_social : parseFloat(data.capital_social || '0') || 0,
        porte: data.porte || data.descricao_porte,
        natureza_juridica: data.natureza_juridica,
        opcao_pelo_simples: data.opcao_pelo_simples ?? null,
        data_opcao_pelo_simples: data.data_opcao_pelo_simples,
        opcao_pelo_mei: data.opcao_pelo_mei ?? false,
        uf: data.uf || 'SP',
        municipio: data.municipio || 'Sem dados disponíveis',
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cep: data.cep,
        qsa,
      };
    }
  } catch (err) {
    console.warn('MinhaReceita API request error:', err);
  }

  throw new Error('Não foi possível obter dados para este CNPJ nas bases públicas oficiais. Verifique o número digitado ou preencha os dados manualmente.');
}

/**
 * Validates company data with Receita Federal official registration
 */
export async function validateCompanyWithRFB(
  rawCnpj: string,
  declaredCompanyName?: string
): Promise<{
  rfbData: CNPJApiResponse;
  validation: CompanyRFBValidation;
  address: CompanyAddress;
  partners: Partner[];
}> {
  const rfbData = await fetchCNPJData(rawCnpj);

  const address: CompanyAddress = {
    logradouro: rfbData.logradouro,
    numero: rfbData.numero,
    complemento: rfbData.complemento,
    bairro: rfbData.bairro,
    municipio: rfbData.municipio,
    uf: rfbData.uf,
    cep: rfbData.cep,
    formatted: buildFormattedAddress({
      logradouro: rfbData.logradouro,
      numero: rfbData.numero,
      complemento: rfbData.complemento,
      bairro: rfbData.bairro,
      municipio: rfbData.municipio,
      uf: rfbData.uf,
      cep: rfbData.cep,
    }),
  };

  const messages: string[] = [];
  let status: 'valid' | 'warning' | 'error' = 'valid';

  // 1. Cadastral situation check
  const sitUpper = (rfbData.situacao_cadastral || '').toUpperCase();
  if (sitUpper === 'ATIVA') {
    messages.push('Situação Cadastral ATIVA perante a Receita Federal do Brasil.');
  } else {
    status = 'error';
    messages.push(`ATENÇÃO: Situação Cadastral ${sitUpper} na Receita Federal. Regularização mandatória.`);
  }

  // 2. Simples Nacional optant check
  if (rfbData.opcao_pelo_simples === true) {
    messages.push(`Opção pelo Simples Nacional ATIVA${rfbData.data_opcao_pelo_simples ? ` desde ${rfbData.data_opcao_pelo_simples}` : ''}.`);
  } else if (rfbData.opcao_pelo_simples === false) {
    status = status === 'error' ? 'error' : 'warning';
    messages.push('Aviso: Cadastro na RFB não indica opção ativa pelo Simples Nacional.');
  }

  // 3. Name comparison
  if (declaredCompanyName && declaredCompanyName.trim().length > 3) {
    const cleanDeclared = declaredCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanRfb = rfbData.razao_social.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanRfb && !cleanRfb.includes(cleanDeclared) && !cleanDeclared.includes(cleanRfb)) {
      messages.push(`Divergência de Nome: Declaração consta "${declaredCompanyName}", enquanto na RFB consta "${rfbData.razao_social}".`);
    }
  }

  const validation: CompanyRFBValidation = {
    validatedAt: new Date().toISOString(),
    situacaoCadastral: rfbData.situacao_cadastral,
    dataSituacaoCadastral: rfbData.data_situacao_cadastral,
    razaoSocialOficial: rfbData.razao_social,
    nomeFantasia: rfbData.nome_fantasia,
    opcaoSimples: rfbData.opcao_pelo_simples,
    dataOpcaoSimples: rfbData.data_opcao_pelo_simples,
    opcaoMei: rfbData.opcao_pelo_mei,
    capitalSocial: rfbData.capital_social,
    porte: rfbData.porte,
    naturezaJuridica: rfbData.natureza_juridica,
    address,
    cnaeFiscal: rfbData.cnae_fiscal,
    cnaeFiscalDescricao: rfbData.cnae_fiscal_descricao,
    cnaesSecundarios: rfbData.cnaes_secundarios,
    status,
    messages,
  };

  const partners = convertQSAToPartners(rfbData.qsa);

  return {
    rfbData,
    validation,
    address,
    partners,
  };
}

/**
 * Searches / extracts linked companies for a partner strictly from real queries
 */
export async function searchPartnerOtherCompanies(
  partnerName: string,
  partnerCpf?: string,
  currentCnpj?: string
): Promise<PartnerOtherCompany[]> {
  if (!partnerName || partnerName.trim().length < 3) return [];

  try {
    const response = await fetch('/api/socios/outras-empresas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerName,
        partnerCpf,
        currentCnpj
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.companies)) {
        return data.companies.map((c: any) => ({
          id: c.id || `outra-${Date.now()}-${Math.random()}`,
          name: c.name || 'Sem dados disponíveis',
          cnpj: c.cnpj || 'Sem dados disponíveis',
          revenue12m: c.revenue12m || 0,
          participationPercent: c.participationPercent || 0,
          isManager: c.isManager ?? false,
          regime: c.regime || 'simples',
          cnae: c.cnae,
          cnaeDescription: c.cnaeDescription,
          uf: c.uf || 'PR',
          city: c.city || 'Sem dados disponíveis',
          status: c.status || 'ATIVA',
          capitalSocial: c.capitalSocial || 0,
          simplesOptant: c.simplesOptant ?? true,
          meiOptant: c.meiOptant ?? false,
          partnerRole: c.partnerRole || 'Sócio',
          source: 'api'
        }));
      }
    }
  } catch (err) {
    console.warn('Falha na consulta remota de outras empresas do sócio:', err);
  }

  return [];
}

/**
 * Converts a CNPJ QSA list directly into the app's Partner structure
 */
export function convertQSAToPartners(qsa: CNPJQSAItem[]): Partner[] {
  if (!qsa || qsa.length === 0) return [];

  return qsa.map((item, index) => {
    const isManager = (item.qualificacao_socio || '').toLowerCase().includes('administrador') ||
                      (item.qualificacao_socio || '').toLowerCase().includes('gerente') ||
                      (item.qualificacao_socio || '').toLowerCase().includes('diretor') ||
                      (item.qualificacao_socio || '').includes('49') ||
                      (item.qualificacao_socio || '').includes('05');

    return {
      id: `socio-qsa-${Date.now()}-${index}`,
      name: item.nome_socio || 'Sem dados disponíveis',
      cpf: item.cnpj_cpf_do_socio || 'Sem dados disponíveis',
      participationPercent: item.percentual_capital_social || 0,
      isManager,
      roleInCurrentCompany: item.qualificacao_socio || 'Sem dados disponíveis',
      otherCompanies: [],
    };
  });
}
