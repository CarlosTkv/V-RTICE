import { describe, it, expect } from 'vitest';
import { validateDpsPreflight, generateRawDpsXml, signXmlDps, DadosDpsInput } from '../utils/sefinDpsEngine';
import forge from 'node-forge';

// Helper de teste para gerar um certificado autoassinado A1 e exportar como PFX Base64
function generateTestPfxBase64(password: string = '123456'): string {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [
    { name: 'commonName', value: 'EMPRESA TESTE LTDA:00631114000130' },
    { name: 'countryName', value: 'BR' },
    { name: 'organizationName', value: 'ICP-Brasil' }
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const pfxAsn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], password, {
    generateLocalKeyId: true,
    friendlyName: 'Test Cert A1'
  });

  const pfxDer = forge.asn1.toDer(pfxAsn1).getBytes();
  return forge.util.encode64(pfxDer);
}

describe('SefinNacional DPS - Preflight Validator', () => {
  it('deve aprovar dados válidos da DPS sem retornar erros', () => {
    const payload: DadosDpsInput = {
      prestadorCnpj: '00.631.114/0001-30',
      tomadorCnpjCpf: '33.000.167/0001-01',
      tomadorRazaoSocial: 'PETROBRAS DISTRIBUIDORA S/A',
      codigoLc116: '17.01',
      cnae: '6920601',
      discriminacao: 'Serviços de consultoria contábil e auditoria fiscal digital',
      codigoMunicipioEmissao: '3304557', // Rio de Janeiro
      valorServico: 15000.00,
      aliquotaIss: 5.0
    };

    const errors = validateDpsPreflight(payload);
    expect(errors).toHaveLength(0);
  });

  it('deve rejeitar alíquotas de ISS fora dos limites da LC 116/03 (< 2.0% ou > 5.0%)', () => {
    const payloadBaixo: DadosDpsInput = {
      prestadorCnpj: '00631114000130',
      tomadorCnpjCpf: '33000167000101',
      tomadorRazaoSocial: 'TOMADOR TESTE',
      codigoLc116: '17.01',
      cnae: '6920601',
      discriminacao: 'Serviço',
      codigoMunicipioEmissao: '3304557',
      valorServico: 1000,
      aliquotaIss: 1.5 // Viola mínimo de 2%
    };

    const errors = validateDpsPreflight(payloadBaixo);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('viola os limites da LC 116/03');
  });

  it('deve rejeitar CNAE inválido (diferente de 7 dígitos)', () => {
    const payloadCnaeInvalido: DadosDpsInput = {
      prestadorCnpj: '00631114000130',
      tomadorCnpjCpf: '33000167000101',
      tomadorRazaoSocial: 'TOMADOR TESTE',
      codigoLc116: '17.01',
      cnae: '123', // Invalido
      discriminacao: 'Serviço',
      codigoMunicipioEmissao: '3304557',
      valorServico: 1000,
      aliquotaIss: 3.0
    };

    const errors = validateDpsPreflight(payloadCnaeInvalido);
    expect(errors.some(e => e.includes('CNAE fiscal'))).toBe(true);
  });
});

describe('SefinNacional DPS - Assinatura Digital XMLDSIG (node-forge)', () => {
  it('deve assinar o XML da DPS injetando a nó de <Signature> com DigestValue e SignatureValue válidos', () => {
    const payload: DadosDpsInput = {
      prestadorCnpj: '00631114000130',
      tomadorCnpjCpf: '33000167000101',
      tomadorRazaoSocial: 'PETROBRAS DISTRIBUIDORA S/A',
      codigoLc116: '17.01',
      cnae: '6920601',
      discriminacao: 'Auditoria Tributária Digital e Conciliação fiscal',
      codigoMunicipioEmissao: '3304557',
      valorServico: 25000.00,
      aliquotaIss: 5.0,
      numeroDps: '000000123'
    };

    const rawXml = generateRawDpsXml(payload, '1');
    expect(rawXml).toContain('<DPS xmlns="http://www.gov.br/nfse/schema" versao="1.00">');
    expect(rawXml).toContain('<infDPS Id="DPS00631114000130000000123">');

    const testPassword = 'senha_teste_123';
    const pfxBase64 = generateTestPfxBase64(testPassword);

    const signingResult = signXmlDps(rawXml, pfxBase64, testPassword);
    expect(signingResult.error).toBeUndefined();
    expect(signingResult.signedXml).toBeDefined();

    const signedXml = signingResult.signedXml;

    // Validações da Estrutura XMLDSIG
    expect(signedXml).toContain('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">');
    expect(signedXml).toContain('<SignedInfo>');
    expect(signedXml).toContain('<SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>');
    expect(signedXml).toContain('<DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>');
    expect(signedXml).toContain('<DigestValue>');
    expect(signedXml).toContain('<SignatureValue>');
    expect(signedXml).toContain('<X509Certificate>');
  });
});
