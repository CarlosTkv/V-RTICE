import forge from 'node-forge';

export interface DadosDpsInput {
  prestadorCnpj: string;
  tomadorCnpjCpf: string;
  tomadorRazaoSocial: string;
  codigoLc116: string;
  cnae: string;
  discriminacao: string;
  codigoMunicipioEmissao: string;
  valorServico: number;
  aliquotaIss: number;
  dataCompetencia?: string;
  numeroDps?: string;
  serieDps?: string;
  pfxBase64?: string;
  password?: string;
}

export function validateDpsPreflight(payload: DadosDpsInput): string[] {
  const errors: string[] = [];

  const cleanPrestadorCnpj = (payload.prestadorCnpj || '').replace(/\D/g, '');
  if (cleanPrestadorCnpj.length !== 14) {
    errors.push('CNPJ do Prestador é inválido. Deve possuir 14 dígitos numéricos.');
  }

  const cleanTomadorCnpjCpf = (payload.tomadorCnpjCpf || '').replace(/\D/g, '');
  if (cleanTomadorCnpjCpf.length !== 11 && cleanTomadorCnpjCpf.length !== 14) {
    errors.push('CNPJ ou CPF do Tomador é inválido. Deve possuir 11 (CPF) ou 14 (CNPJ) dígitos.');
  }

  const aliquota = Number(payload.aliquotaIss);
  if (isNaN(aliquota) || aliquota < 2.0 || aliquota > 5.0) {
    errors.push(`Alíquota do ISS (${payload.aliquotaIss}%) viola os limites da LC 116/03 (Mínimo: 2.0%, Máximo: 5.0%).`);
  }

  const valorServico = Number(payload.valorServico);
  if (isNaN(valorServico) || valorServico <= 0) {
    errors.push('Valor do Serviço deve ser um valor numérico positivo maior que R$ 0,00.');
  }

  const cleanCnae = (payload.cnae || '').replace(/\D/g, '');
  if (cleanCnae.length !== 7) {
    errors.push(`CNAE fiscal (${payload.cnae}) é inválido. Deve conter 7 dígitos numéricos.`);
  }

  const codigoLc116 = (payload.codigoLc116 || '').trim();
  if (!codigoLc116) {
    errors.push('Código do Serviço da LC 116/03 é obrigatório (ex: 17.01 ou 07.02).');
  }

  const municipioIbge = (payload.codigoMunicipioEmissao || '').replace(/\D/g, '');
  if (municipioIbge.length !== 7) {
    errors.push('Código IBGE do Município de Emissão deve conter 7 dígitos numéricos.');
  }

  return errors;
}

export function generateRawDpsXml(payload: DadosDpsInput, environment: string = '1'): string {
  const cleanPrestadorCnpj = payload.prestadorCnpj.replace(/\D/g, '');
  const cleanTomadorCnpjCpf = payload.tomadorCnpjCpf.replace(/\D/g, '');
  const isTomadorCnpj = cleanTomadorCnpjCpf.length === 14;
  const numeroDps = payload.numeroDps || Math.floor(100000 + Math.random() * 900000).toString();
  const valorServico = Number(payload.valorServico);
  const aliquotaIss = Number(payload.aliquotaIss);
  const valorIss = (valorServico * aliquotaIss) / 100;
  const idDps = `DPS${cleanPrestadorCnpj}${numeroDps.padStart(9, '0')}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.gov.br/nfse/schema" versao="1.00">
  <infDPS Id="${idDps}">
    <tpAmb>${environment}</tpAmb>
    <dhEmi>${new Date().toISOString()}</dhEmi>
    <verAplic>VERTICE_ERP_v2.5</verAplic>
    <dCompet>${payload.dataCompetencia || new Date().toISOString().split('T')[0]}</dCompet>
    <cLocEmi>${payload.codigoMunicipioEmissao}</cLocEmi>
    <prest>
      <CNPJ>${cleanPrestadorCnpj}</CNPJ>
    </prest>
    <toma>
      <${isTomadorCnpj ? 'CNPJ' : 'CPF'}>${cleanTomadorCnpjCpf}</${isTomadorCnpj ? 'CNPJ' : 'CPF'}>
      <xNome>${payload.tomadorRazaoSocial}</xNome>
    </toma>
    <serv>
      <cServ>
        <cTribNac>${payload.codigoLc116.replace('.', '')}</cTribNac>
        <cTribMun>${payload.codigoLc116.replace('.', '')}00</cTribMun>
        <CNAE>${payload.cnae.replace(/\D/g, '')}</CNAE>
        <xDescServ>${payload.discriminacao}</xDescServ>
      </cServ>
      <vServ>
        <vServPrest>${valorServico.toFixed(2)}</vServPrest>
        <vAliquota>${aliquotaIss.toFixed(2)}</vAliquota>
        <vISS>${valorIss.toFixed(2)}</vISS>
      </vServ>
    </serv>
  </infDPS>
</DPS>`.trim();
}

export function signXmlDps(xmlContent: string, pfxBase64: string, password: string): { signedXml: string; error?: string } {
  try {
    const sanitized = pfxBase64.replace(/^data:.*?;base64,/i, '').replace(/\s+/g, '');
    const pfxBuffer = Buffer.from(sanitized, 'base64');
    const pfxAsn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
    const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, false, password || '');

    let privateKey: forge.pki.PrivateKey | null = null;
    let certificate: forge.pki.Certificate | null = null;

    const keyBags = (pfx as any).getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })?.[forge.pki.oids.pkcs8ShroudedKeyBag] || [];
    if (keyBags.length > 0 && keyBags[0].key) {
      privateKey = keyBags[0].key;
    }

    if (!privateKey) {
      const keyBags2 = (pfx as any).getBags({ bagType: forge.pki.oids.keyBag })?.[forge.pki.oids.keyBag] || [];
      if (keyBags2.length > 0 && keyBags2[0].key) {
        privateKey = keyBags2[0].key;
      }
    }

    const certBags = (pfx as any).getBags({ bagType: forge.pki.oids.certBag })?.[forge.pki.oids.certBag] || [];
    if (certBags.length > 0 && certBags[0].cert) {
      certificate = certBags[0].cert;
    }

    if (!privateKey || !certificate) {
      return { signedXml: xmlContent, error: 'Chave privada ou certificado x509 não encontrados no arquivo PFX.' };
    }

    const md = forge.md.sha256.create();
    md.update(xmlContent, 'utf8');
    const digestBase64 = forge.util.encode64(md.digest().getBytes());

    const mdSign = forge.md.sha256.create();
    mdSign.update(xmlContent, 'utf8');
    const signatureBytes = (privateKey as any).sign(mdSign);
    const signatureBase64 = forge.util.encode64(signatureBytes);

    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
    const certBase64 = forge.util.encode64(certDer);

    const signatureXml = `
<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
  <SignedInfo>
    <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
    <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
    <Reference URI="">
      <Transforms>
        <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
        <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      </Transforms>
      <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
      <DigestValue>${digestBase64}</DigestValue>
    </Reference>
  </SignedInfo>
  <SignatureValue>${signatureBase64}</SignatureValue>
  <KeyInfo>
    <X509Data>
      <X509Certificate>${certBase64}</X509Certificate>
    </X509Data>
  </KeyInfo>
</Signature>`;

    const signedXml = xmlContent.replace('</DPS>', `${signatureXml}\n</DPS>`);
    return { signedXml };
  } catch (err: any) {
    return { signedXml: xmlContent, error: err.message };
  }
}
