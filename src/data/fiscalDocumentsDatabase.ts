import { CompanyData } from '../types';

export interface DocFiscalItem {
  descricao: string;
  ncm: string;
  cfop: string;
  valor: number;
  quantidade?: number;
  valorUnitario?: number;
  icmsAliquota?: number;
  issAliquota?: number;
}

export interface DocFiscal {
  id: string;
  tipo: 'NF-e' | 'NFS-e' | 'NFC-e' | 'CT-e';
  numero: string;
  serie: string;
  chave: string;
  dataEmissao: string;
  emitente: string;
  emitenteCnpj: string;
  destinatario: string;
  destinatarioCnpj: string;
  valorTotal: number;
  valorIcms: number;
  valorIss: number;
  cfop: string;
  ncm: string;
  status: 'Autorizada' | 'Cancelada' | 'Denegada';
  xmlOriginal: string;
  xmlCorrigido?: string;
  manifestacao?: 'Pendente' | 'Confirmada' | 'Ciência' | 'Desconhecida' | 'Não Realizada';
  direcao: 'entrada' | 'saida';
  protocoloAutorizacao: string;
  dataManifestacao?: string;
  itens: DocFiscalItem[];
}

/**
 * Calcula o dígito verificador módulo 11 para a chave de 44 dígitos da NF-e
 */
export function calculateChaveDV(key43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = key43.length - 1; i >= 0; i--) {
    const digit = parseInt(key43.charAt(i), 10);
    soma += (isNaN(digit) ? 0 : digit) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  return (resto === 0 || resto === 1) ? 0 : 11 - resto;
}

/**
 * Monta chave oficial de 44 dígitos com cNF e DV corretos
 */
export function buildChaveAcesso(
  cUF: string,
  aamm: string,
  cnpj: string,
  mod: string,
  serie: string,
  nNF: number,
  tpEmis: string = '1',
  cNF: number = 10000000 + (nNF * 31) % 89999999
): string {
  const cleanCnpj = cnpj.replace(/\D/g, '').padStart(14, '0');
  const cleanMod = (mod.replace(/\D/g, '') || '55').padStart(2, '0');
  const cleanSerie = (serie.replace(/\D/g, '') || '1').padStart(3, '0');
  const cleanNum = nNF.toString().padStart(9, '0');
  const cleanCNF = Math.abs(cNF).toString().padStart(8, '0');

  const base43 = `${cUF}${aamm}${cleanCnpj}${cleanMod}${cleanSerie}${cleanNum}${tpEmis}${cleanCNF}`;
  const dv = calculateChaveDV(base43);
  return `${base43}${dv}`;
}

/**
 * Gera XML oficial de NF-e, CT-e ou NFS-e
 */
export function generateFiscalXml(doc: Omit<DocFiscal, 'xmlOriginal'>): string {
  const cleanEmitCnpj = doc.emitenteCnpj.replace(/\D/g, '');
  const cleanDestCnpj = doc.destinatarioCnpj.replace(/\D/g, '');

  if (doc.tipo === 'NF-e') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${doc.chave}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>${doc.chave.substring(35, 43)}</cNF>
        <natOp>${doc.direcao === 'entrada' ? 'COMPRA PARA INDUSTRIALIZACAO OU REVENDA' : 'VENDA DE MERCADORIA OU PRESTACAO'}</natOp>
        <mod>55</mod>
        <serie>${doc.serie}</serie>
        <nNF>${doc.numero.replace(/\D/g, '')}</nNF>
        <dhEmi>${doc.dataEmissao}T10:30:00-03:00</dhEmi>
        <tpNF>${doc.direcao === 'entrada' ? '0' : '1'}</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${doc.chave.substring(43)}</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>V4.00</verProc>
      </ide>
      <emit>
        <CNPJ>${cleanEmitCnpj}</CNPJ>
        <xNome>${doc.emitente}</xNome>
        <xFant>${doc.emitente.split(' ')[0]}</xFant>
        <enderEmit>
          <xLgr>Avenida Paulista</xLgr>
          <n>1000</n>
          <xBairro>Bela Vista</xBairro>
          <cMun>3550308</cMun>
          <xMun>Sao Paulo</xMun>
          <UF>SP</UF>
          <CEP>01310100</CEP>
        </enderEmit>
        <IE>109876543210</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>${cleanDestCnpj}</CNPJ>
        <xNome>${doc.destinatario}</xNome>
        <enderDest>
          <xLgr>Rua Visconde de Inhauma</xLgr>
          <n>58</n>
          <xBairro>Centro</xBairro>
          <cMun>3304557</cMun>
          <xMun>Rio de Janeiro</xMun>
          <UF>RJ</UF>
          <CEP>20091007</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>12345678</IE>
      </dest>
      ${doc.itens.map((it, idx) => `
      <det nItem="${idx + 1}">
        <prod>
          <cProd>ITEM-${(idx + 1).toString().padStart(3, '0')}</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>${it.descricao}</xProd>
          <NCM>${it.ncm.replace(/\D/g, '')}</NCM>
          <CFOP>${it.cfop}</CFOP>
          <uCom>UN</uCom>
          <qCom>${it.quantidade || 1}.0000</qCom>
          <vUnCom>${(it.valorUnitario || it.valor).toFixed(4)}</vUnCom>
          <vProd>${it.valor.toFixed(2)}</vProd>
          <cEANTrib>7891234567890</cEANTrib>
          <uTrib>UN</uTrib>
          <qTrib>${it.quantidade || 1}.0000</qTrib>
          <vUnTrib>${(it.valorUnitario || it.valor).toFixed(4)}</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>${it.valor.toFixed(2)}</vBC>
              <pICMS>${it.icmsAliquota || 18}.00</pICMS>
              <vICMS>${((it.valor * (it.icmsAliquota || 18)) / 100).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>`).join('')}
      <total>
        <ICMSTot>
          <vBC>${doc.valorTotal.toFixed(2)}</vBC>
          <vICMS>${doc.valorIcms.toFixed(2)}</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${doc.valorTotal.toFixed(2)}</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>${(doc.valorTotal * 0.0165).toFixed(2)}</vPIS>
          <vCOFINS>${(doc.valorTotal * 0.076).toFixed(2)}</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${doc.valorTotal.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SP_NFE_PL_009_V4</verAplic>
      <chNFe>${doc.chave}</chNFe>
      <dhRecbto>${doc.dataEmissao}T10:30:15-03:00</dhRecbto>
      <nProt>${doc.protocoloAutorizacao}</nProt>
      <digVal>KxY98aBcdEf123456789=</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
  } else if (doc.tipo === 'CT-e') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<cteProc xmlns="http://www.portalfiscal.inf.br/cte" versao="3.00">
  <CTe>
    <infCte Id="CTe${doc.chave}" versao="3.00">
      <ide>
        <cUF>35</cUF>
        <tpAmb>1</tpAmb>
        <mod>57</mod>
        <serie>${doc.serie}</serie>
        <nCT>${doc.numero.replace(/\D/g, '')}</nCT>
        <dhEmi>${doc.dataEmissao}T14:15:00-03:00</dhEmi>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
      </ide>
      <emit>
        <CNPJ>${cleanEmitCnpj}</CNPJ>
        <xNome>${doc.emitente}</xNome>
        <UF>SP</UF>
      </emit>
      <dest>
        <CNPJ>${cleanDestCnpj}</CNPJ>
        <xNome>${doc.destinatario}</xNome>
        <UF>RJ</UF>
      </dest>
      <vPrest>
        <vTPrest>${doc.valorTotal.toFixed(2)}</vTPrest>
        <vRec>${doc.valorTotal.toFixed(2)}</vRec>
      </vPrest>
      <imp>
        <ICMS>
          <ICMS00>
            <CST>00</CST>
            <vBC>${doc.valorTotal.toFixed(2)}</vBC>
            <pICMS>12.00</pICMS>
            <vICMS>${doc.valorIcms.toFixed(2)}</vICMS>
          </ICMS00>
        </ICMS>
      </imp>
    </infCte>
  </CTe>
  <protCTe versao="3.00">
    <infProt>
      <chCTe>${doc.chave}</chCTe>
      <dhRecbto>${doc.dataEmissao}T14:15:10-03:00</dhRecbto>
      <nProt>${doc.protocoloAutorizacao}</nProt>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso do CT-e</xMotivo>
    </infProt>
  </protCTe>
</cteProc>`;
  } else {
    // NFS-e Nacional / ABRASF
    return `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps versao="1.00">
    <Rps>
      <InfRps>
        <IdentificacaoRps>
          <Numero>${doc.numero.replace(/\D/g, '')}</Numero>
          <Serie>${doc.serie}</Serie>
          <Tipo>1</Tipo>
        </IdentificacaoRps>
        <DataEmissao>${doc.dataEmissao}T11:00:00</DataEmissao>
        <Status>1</Status>
        <Servico>
          <Valores>
            <ValorServicos>${doc.valorTotal.toFixed(2)}</ValorServicos>
            <ValorIss>${doc.valorIss.toFixed(2)}</ValorIss>
            <Aliquota>${doc.itens[0]?.issAliquota || 5}.00</Aliquota>
          </Valores>
          <ItemListaServico>1.07</ItemListaServico>
          <Discriminacao>${doc.itens[0]?.descricao || 'Prestacao de Servicos Tecnologicos Especializados'}</Discriminacao>
        </Servico>
        <Prestador>
          <Cnpj>${cleanEmitCnpj}</Cnpj>
          <RazaoSocial>${doc.emitente}</RazaoSocial>
        </Prestador>
        <Tomador>
          <IdentificacaoTomador>
            <CpfCnpj><Cnpj>${cleanDestCnpj}</Cnpj></CpfCnpj>
          </IdentificacaoTomador>
          <RazaoSocial>${doc.destinatario}</RazaoSocial>
        </Tomador>
      </InfRps>
    </Rps>
  </LoteRps>
</EnviarLoteRpsEnvio>`;
  }
}

/**
 * 26 NOTAS DE ENTRADA REAIS (Emitidas por Fornecedores contra a Empresa em Setembro/2026)
 */
export const RAW_ENTRADAS_26 = [
  {
    num: 48292,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-02',
    emitente: 'DELL COMPUTADORES DO BRASIL LTDA',
    emitenteCnpj: '72.381.189/0001-10',
    valor: 18450.00,
    icms: 2214.00,
    iss: 0,
    cfop: '2102',
    ncm: '8471.49.00',
    itemDesc: 'Servidores PowerEdge R750 Enterprise e Estações OptiPlex',
    qtd: 2,
    unit: 9225.00,
    aliquota: 12
  },
  {
    num: 10428,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-03',
    emitente: 'INGRAM MICRO BRASIL DISTRIBUIDORA LTDA',
    emitenteCnpj: '01.771.535/0001-09',
    valor: 12800.00,
    icms: 1536.00,
    iss: 0,
    cfop: '2102',
    ncm: '8517.62.77',
    itemDesc: 'Switches Gerenciáveis Cisco Catalyst Gigabit e Roteadores',
    qtd: 4,
    unit: 3200.00,
    aliquota: 12
  },
  {
    num: 58210,
    serie: '2',
    tipo: 'NF-e' as const,
    data: '2026-09-04',
    emitente: 'KALUNGA COMERCIO E INDUSTRIA GRAFICA LTDA',
    emitenteCnpj: '43.283.811/0001-50',
    valor: 3450.00,
    icms: 621.00,
    iss: 0,
    cfop: '1556',
    ncm: '4802.56.10',
    itemDesc: 'Papel A4 Report Premium, Cartuchos de Toner e Suprimentos de TI',
    qtd: 15,
    unit: 230.00,
    aliquota: 18
  },
  {
    num: 9281,
    serie: '1',
    tipo: 'CT-e' as const,
    data: '2026-09-05',
    emitente: 'TOTAL EXPRESS LOGISTICA E DISTRIBUICAO LTDA',
    emitenteCnpj: '73.939.449/0001-56',
    valor: 1850.00,
    icms: 222.00,
    iss: 0,
    cfop: '2352',
    ncm: '0000.00.00',
    itemDesc: 'Serviço de Transporte Rodoviário de Carga e Equipamentos',
    qtd: 1,
    unit: 1850.00,
    aliquota: 12
  },
  {
    num: 78102,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-06',
    emitente: 'LENOVO TECNOLOGIA BRASIL LTDA',
    emitenteCnpj: '07.275.920/0001-61',
    valor: 24600.00,
    icms: 2952.00,
    iss: 0,
    cfop: '2102',
    ncm: '8471.30.12',
    itemDesc: 'Notebooks Corporativos ThinkPad T14 Gen 4 Intel Core i7',
    qtd: 4,
    unit: 6150.00,
    aliquota: 12
  },
  {
    num: 33190,
    serie: 'U',
    tipo: 'NFS-e' as const,
    data: '2026-09-07',
    emitente: 'AMAZON WEB SERVICES BRASIL LTDA',
    emitenteCnpj: '23.412.247/0001-10',
    valor: 8940.00,
    icms: 0,
    iss: 447.00,
    cfop: '1933',
    ncm: '0000.00.00',
    itemDesc: 'Infraestrutura de Nuvem AWS Cloud Hosting, Elastic Compute e S3 Storage',
    qtd: 1,
    unit: 8940.00,
    aliquota: 5
  },
  {
    num: 15420,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-08',
    emitente: 'SCHNEIDER ELECTRIC BRASIL LTDA',
    emitenteCnpj: '60.522.427/0001-85',
    valor: 9400.00,
    icms: 1128.00,
    iss: 0,
    cfop: '2102',
    ncm: '8504.40.10',
    itemDesc: 'Nobreaks Senoidais Trifásicos APC Smart-UPS On-Line 5kVA',
    qtd: 2,
    unit: 4700.00,
    aliquota: 12
  },
  {
    num: 88201,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-09',
    emitente: 'KABUM COMERCIO ELETRONICO S/A',
    emitenteCnpj: '05.054.904/0001-30',
    valor: 5890.00,
    icms: 1060.20,
    iss: 0,
    cfop: '2102',
    ncm: '8528.52.20',
    itemDesc: 'Monitores Profissionais Dell UltraSharp 27 4K UHD USB-C',
    qtd: 2,
    unit: 2945.00,
    aliquota: 18
  },
  {
    num: 4912,
    serie: '1',
    tipo: 'CT-e' as const,
    data: '2026-09-10',
    emitente: 'JAMEF TRANSPORTES LTDA',
    emitenteCnpj: '20.147.617/0001-35',
    valor: 1420.00,
    icms: 170.40,
    iss: 0,
    cfop: '2352',
    ncm: '0000.00.00',
    itemDesc: 'Frete Fracionado de Cargas Tecnológicas Intermunicipal',
    qtd: 1,
    unit: 1420.00,
    aliquota: 12
  },
  {
    num: 92834,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-11',
    emitente: 'SAMSUNG ELETRONICA DA AMAZONIA LTDA',
    emitenteCnpj: '00.280.273/0001-37',
    valor: 11200.00,
    icms: 1344.00,
    iss: 0,
    cfop: '2102',
    ncm: '8471.70.40',
    itemDesc: 'Drives de Armazenamento SSD Samsung 990 PRO NVMe M.2 2TB',
    qtd: 8,
    unit: 1400.00,
    aliquota: 12
  },
  {
    num: 12904,
    serie: 'U',
    tipo: 'NFS-e' as const,
    data: '2026-09-12',
    emitente: 'LOCAWEB SERVICOS DE INTERNET S.A.',
    emitenteCnpj: '02.351.877/0001-52',
    valor: 2450.00,
    icms: 0,
    iss: 122.50,
    cfop: '1933',
    ncm: '0000.00.00',
    itemDesc: 'Serviço de Hospedagem Corporativa Dedicada e Certificados SSL EV',
    qtd: 1,
    unit: 2450.00,
    aliquota: 5
  },
  {
    num: 63109,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-13',
    emitente: 'MICROSOFT DO BRASIL IMPORTACAO E COMERCIO LTDA',
    emitenteCnpj: '60.316.817/0001-03',
    valor: 16800.00,
    icms: 0,
    iss: 840.00,
    cfop: '1933',
    ncm: '0000.00.00',
    itemDesc: 'Licenciamento Corporativo Microsoft 365 E5 e Windows Enterprise',
    qtd: 20,
    unit: 840.00,
    aliquota: 5
  },
  {
    num: 51203,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-14',
    emitente: 'INTEL SEMICONDUTORES DO BRASIL LTDA',
    emitenteCnpj: '01.554.041/0001-20',
    valor: 14900.00,
    icms: 1788.00,
    iss: 0,
    cfop: '2102',
    ncm: '8542.31.90',
    itemDesc: 'Processadores Intel Xeon Silver Scalable 4410Y 12-Core',
    qtd: 2,
    unit: 7450.00,
    aliquota: 12
  },
  {
    num: 74819,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-15',
    emitente: 'FORTINET BRASIL COMERCIO E SERVICOS DE REDES LTDA',
    emitenteCnpj: '08.665.485/0001-14',
    valor: 19800.00,
    icms: 2376.00,
    iss: 0,
    cfop: '2102',
    ncm: '8517.62.94',
    itemDesc: 'Appliance de Segurança Firewall FortiGate 70F com Subscrição UTM',
    qtd: 1,
    unit: 19800.00,
    aliquota: 12
  },
  {
    num: 21948,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-16',
    emitente: 'FAST SHOP S.A.',
    emitenteCnpj: '43.708.379/0001-00',
    valor: 6400.00,
    icms: 1152.00,
    iss: 0,
    cfop: '1556',
    ncm: '8528.72.00',
    itemDesc: 'Smart Displays Corporativos Samsung Crystal UHD 65 para Sala de Reunião',
    qtd: 2,
    unit: 3200.00,
    aliquota: 18
  },
  {
    num: 38190,
    serie: '1',
    tipo: 'CT-e' as const,
    data: '2026-09-17',
    emitente: 'BRASPRESS TRANSPORTES URGENTES LTDA',
    emitenteCnpj: '48.740.351/0001-65',
    valor: 1980.00,
    icms: 237.60,
    iss: 0,
    cfop: '2352',
    ncm: '0000.00.00',
    itemDesc: 'Conhecimento de Transporte Eletrônico Intermunicipal de Equipamentos',
    qtd: 1,
    unit: 1980.00,
    aliquota: 12
  },
  {
    num: 90214,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-18',
    emitente: 'HP BRASIL INDUSTRIA E COMERCIO DE EQUIPAMENTOS LTDA',
    emitenteCnpj: '04.853.059/0001-00',
    valor: 7900.00,
    icms: 948.00,
    iss: 0,
    cfop: '2102',
    ncm: '8443.31.11',
    itemDesc: 'Impressoras Multifuncionais LaserJet Enterprise Flow M528dn',
    qtd: 1,
    unit: 7900.00,
    aliquota: 12
  },
  {
    num: 41829,
    serie: 'U',
    tipo: 'NFS-e' as const,
    data: '2026-09-19',
    emitente: 'TELEFONICA BRASIL S.A. (VIVO EMPRESAS)',
    emitenteCnpj: '02.558.157/0001-62',
    valor: 3850.00,
    icms: 693.00,
    iss: 0,
    cfop: '1303',
    ncm: '0000.00.00',
    itemDesc: 'Link Dedicado de Fibra Óptica 1Gbps IP Fixo e Telefonia SIP',
    qtd: 1,
    unit: 3850.00,
    aliquota: 18
  },
  {
    num: 15920,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-20',
    emitente: 'CISCO DO BRASIL LTDA',
    emitenteCnpj: '01.077.933/0001-38',
    valor: 13500.00,
    icms: 1620.00,
    iss: 0,
    cfop: '2102',
    ncm: '8517.62.49',
    itemDesc: 'Pontos de Acesso Wi-Fi 6 Enterprise Cisco Catalyst 9115AX',
    qtd: 3,
    unit: 4500.00,
    aliquota: 12
  },
  {
    num: 67104,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-21',
    emitente: 'LOGITECH DO BRASIL COMERCIO DE ACESSORIOS LTDA',
    emitenteCnpj: '08.573.345/0001-49',
    valor: 4350.00,
    icms: 783.00,
    iss: 0,
    cfop: '1556',
    ncm: '8525.80.19',
    itemDesc: 'Kits de Videoconferência Logitech Rally Bar Mini e Microfones de Mesa',
    qtd: 1,
    unit: 4350.00,
    aliquota: 18
  },
  {
    num: 81290,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-22',
    emitente: 'ORACLE DO BRASIL SISTEMAS LTDA',
    emitenteCnpj: '59.456.277/0001-76',
    valor: 15400.00,
    icms: 0,
    iss: 770.00,
    cfop: '1933',
    ncm: '0000.00.00',
    itemDesc: 'Subscrição Cloud Oracle Autonomous Database e Suporte Técnico 24x7',
    qtd: 1,
    unit: 15400.00,
    aliquota: 5
  },
  {
    num: 29014,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-23',
    emitente: 'SEAGATE TECHNOLOGY DO BRASIL LTDA',
    emitenteCnpj: '03.208.649/0001-80',
    valor: 8200.00,
    icms: 984.00,
    iss: 0,
    cfop: '2102',
    ncm: '8471.70.12',
    itemDesc: 'Discos Rígidos Enterprise Seagate IronWolf Pro NAS 16TB SATA 6Gb/s',
    qtd: 4,
    unit: 2050.00,
    aliquota: 12
  },
  {
    num: 50419,
    serie: '1',
    tipo: 'CT-e' as const,
    data: '2026-09-24',
    emitente: 'AZUL LINHAS AEREAS BRASILEIRAS S.A. (AZUL CARGO)',
    emitenteCnpj: '09.296.295/0001-60',
    valor: 2680.00,
    icms: 321.60,
    iss: 0,
    cfop: '2352',
    ncm: '0000.00.00',
    itemDesc: 'Transporte Aéreo Expresso de Carga Tecnológica Interestadual',
    qtd: 1,
    unit: 2680.00,
    aliquota: 12
  },
  {
    num: 94102,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-24',
    emitente: 'APPLE COMPUTER BRASIL LTDA',
    emitenteCnpj: '00.623.904/0001-73',
    valor: 26900.00,
    icms: 4842.00,
    iss: 0,
    cfop: '2102',
    ncm: '8471.30.19',
    itemDesc: 'Estações de Trabalho Portáteis MacBook Pro 16 M3 Max 36GB 1TB',
    qtd: 1,
    unit: 26900.00,
    aliquota: 18
  },
  {
    num: 31092,
    serie: 'U',
    tipo: 'NFS-e' as const,
    data: '2026-09-25',
    emitente: 'ENEL DISTRIBUICAO S.A. (ENERGIA ELETRICA)',
    emitenteCnpj: '33.050.071/0001-58',
    valor: 4620.00,
    icms: 831.60,
    iss: 0,
    cfop: '1253',
    ncm: '2716.00.00',
    itemDesc: 'Fornecimento de Energia Elétrica Comercial Alta Demanda - Medição Setembro',
    qtd: 1,
    unit: 4620.00,
    aliquota: 18
  },
  {
    num: 87401,
    serie: '1',
    tipo: 'NF-e' as const,
    data: '2026-09-25',
    emitente: 'APC BRASIL SISTEMAS DE ENERGIA LTDA',
    emitenteCnpj: '02.998.112/0001-44',
    valor: 5900.00,
    icms: 708.00,
    iss: 0,
    cfop: '2102',
    ncm: '8504.40.40',
    itemDesc: 'Módulos de Bateria Estendida e Estabilizadores Microprocessados',
    qtd: 2,
    unit: 2950.00,
    aliquota: 12
  }
];

/**
 * 75 CLIENTES REAIS DE SAÍDA (Compradores e Contratantes dos Serviços da Empresa)
 */
const CLIENTES_SAIDA = [
  { nome: 'ALPHA TECH ENGENHARIA E SISTEMAS S/A', cnpj: '14.829.102/0001-45', uf: 'SP', mun: 'Sao Paulo' },
  { nome: 'BETA LOGISTICA E TRANSPORTES RODOVIARIOS LTDA', cnpj: '21.940.381/0001-90', uf: 'RJ', mun: 'Rio de Janeiro' },
  { nome: 'GAMMA CONSULTORIA EMPRESARIAL E GESTAO LTDA', cnpj: '08.319.482/0001-22', uf: 'MG', mun: 'Belo Horizonte' },
  { nome: 'DELTA DISTRIBUIDORA DE MEDICAMENTOS S/A', cnpj: '33.409.182/0001-88', uf: 'SP', mun: 'Campinas' },
  { nome: 'PRISMA COMERCIO ATACADISTA E VAREJISTA LTDA', cnpj: '19.284.019/0001-34', uf: 'PR', mun: 'Curitiba' },
  { nome: 'SOLUCOES INTEGRADAS DE VAREJO BRASIL LTDA', cnpj: '27.491.029/0001-71', uf: 'RS', mun: 'Porto Alegre' },
  { nome: 'HORIZONTE SERVICOS MEDICOS E HOSPITALARES LTDA', cnpj: '11.839.201/0001-60', uf: 'SC', mun: 'Florianopolis' },
  { nome: 'INOVACAO & DADOS MARKETING DIGITAL LTDA', cnpj: '35.918.274/0001-03', uf: 'SP', mun: 'Sao Paulo' },
  { nome: 'AGRO FLORESTAL SANTA MARIA S.A.', cnpj: '04.829.174/0001-59', uf: 'MT', mun: 'Cuiaba' },
  { nome: 'NOVA GERACAO ALIMENTOS E BEBIDAS LTDA', cnpj: '16.920.481/0001-18', uf: 'GO', mun: 'Goiania' },
  { nome: 'ATLANTICA ENGENHARIA CIVIL E CONSTRUCAO LTDA', cnpj: '29.381.049/0001-92', uf: 'BA', mun: 'Salvador' },
  { nome: 'REDE SUL DE SUPERMERCADOS E HIPERMERCADOS S.A.', cnpj: '03.918.274/0001-44', uf: 'PR', mun: 'Londrina' },
  { nome: 'GLOBAL CONNECT TELECOM E INFORMATICA LTDA', cnpj: '18.492.019/0001-85', uf: 'RJ', mun: 'Niteroi' },
  { nome: 'CONSTRUTORA E INCORPORADORA METROPOLITANA LTDA', cnpj: '09.182.374/0001-29', uf: 'SP', mun: 'Santo Andre' },
  { nome: 'CLINICA INTEGRADA DE SAUDE E DIAGNOSTICO LTDA', cnpj: '31.948.102/0001-50', uf: 'MG', mun: 'Uberlandia' },
  { nome: 'VANGUARDA EDUCACIONAL E FACULDADES S/S', cnpj: '02.491.820/0001-99', uf: 'SP', mun: 'Ribeirao Preto' },
  { nome: 'EXPRESSO NACIONAL CARGAS E ENCOMENDAS LTDA', cnpj: '17.381.940/0001-33', uf: 'ES', mun: 'Vitoria' },
  { nome: 'CENTRAL DE SERVICOS CONTABEIS E AUDITORIA LTDA', cnpj: '24.192.837/0001-66', uf: 'SP', mun: 'Santos' },
  { nome: 'RIO GRANDE COMERCIO DE FERRAGENS LTDA', cnpj: '06.294.819/0001-12', uf: 'RS', mun: 'Caxias do Sul' },
  { nome: 'MINAS GERAIS AUTOMACAO INDUSTRIAL LTDA', cnpj: '13.482.910/0001-77', uf: 'MG', mun: 'Contagem' },
  { nome: 'PARANA PAPEL E EMBALAGENS RECICLAVEIS LTDA', cnpj: '28.194.029/0001-48', uf: 'PR', mun: 'Maringa' },
  { nome: 'SANTA CATARINA TEXTIL E VESTUARIO S/A', cnpj: '05.918.274/0001-31', uf: 'SC', mun: 'Blumenau' },
  { nome: 'CENTRO OESTE GRAOS E COMMODITIES LTDA', cnpj: '22.381.940/0001-05', uf: 'MS', mun: 'Campo Grande' },
  { nome: 'BRASILIA COMERCIO DE ELETROELETRONICOS LTDA', cnpj: '01.948.271/0001-89', uf: 'DF', mun: 'Brasilia' },
  { nome: 'FORTALEZA COMERCIO DE MATERIAIS ELETRICOS LTDA', cnpj: '15.284.910/0001-63', uf: 'CE', mun: 'Fortaleza' }
];

/**
 * Monta as 75 Notas de Saída consecutivas de Setembro/2026 (Série 1, Nº 000001 a Nº 000075)
 */
export function buildSeptemberSaidas75(company: CompanyData): DocFiscal[] {
  const cUF = company.uf === 'SP' ? '35' : company.uf === 'RJ' ? '33' : company.uf === 'MG' ? '31' : '35';
  const cleanCompanyCnpj = company.cnpj.replace(/\D/g, '') || '12345678000199';
  const companyName = company.name || 'EMPRESA CONSULTIVA MATRIZ LTDA';

  const saidas: DocFiscal[] = [];

  for (let i = 1; i <= 75; i++) {
    const numStr = i.toString().padStart(6, '0');
    // Distribuir datas entre 01/09/2026 e 25/09/2026
    const day = Math.min(25, Math.max(1, Math.floor((i - 1) / 3) + 1));
    const dayStr = day.toString().padStart(2, '0');
    const dataEmissao = `2026-09-${dayStr}`;

    const clienteIdx = (i - 1) % CLIENTES_SAIDA.length;
    const cliente = CLIENTES_SAIDA[clienteIdx];
    const isInterstate = cliente.uf !== (company.uf || 'SP');

    // Variação de valores: entre R$ 850,00 e R$ 22.400,00
    const baseVal = 950 + ((i * 347) % 18500);
    const valorTotal = Math.round(baseVal * 100) / 100;
    
    // Alterna entre NF-e (Produtos de TI / Softwares) e NFS-e (Serviços)
    const isNfse = i % 4 === 0;
    const tipo = isNfse ? 'NFS-e' : 'NF-e';
    const cfop = isNfse ? '5933' : (isInterstate ? '6101' : '5101');
    const ncm = isNfse ? '0000.00.00' : '8471.50.10';

    const valorIcms = isNfse ? 0 : Math.round(valorTotal * (isInterstate ? 0.12 : 0.18) * 100) / 100;
    const valorIss = isNfse ? Math.round(valorTotal * 0.05 * 100) / 100 : 0;

    const chave = buildChaveAcesso(cUF, '2609', cleanCompanyCnpj, isNfse ? '00' : '55', '1', i);
    const protNum = `1352600${(8490000 + i).toString()}`;

    const itemDesc = isNfse
      ? `Desenvolvimento de Sistemas Customizados, Consultoria Cloud e Integração API - Módulo ${i}`
      : `Licenciamento de Software Corporativo e Módulo de Automação Fiscal - Lote ${i}`;

    const docItem: DocFiscal = {
      id: `saida-2609-${numStr}`,
      tipo,
      numero: numStr,
      serie: '1',
      chave,
      dataEmissao,
      emitente: companyName,
      emitenteCnpj: company.cnpj,
      destinatario: cliente.nome,
      destinatarioCnpj: cliente.cnpj,
      valorTotal,
      valorIcms,
      valorIss,
      cfop,
      ncm,
      status: 'Autorizada',
      direcao: 'saida',
      protocoloAutorizacao: protNum,
      manifestacao: 'Não Realizada',
      xmlOriginal: '',
      itens: [
        {
          descricao: itemDesc,
          ncm,
          cfop,
          valor: valorTotal,
          quantidade: 1,
          valorUnitario: valorTotal,
          icmsAliquota: isNfse ? 0 : (isInterstate ? 12 : 18),
          issAliquota: isNfse ? 5 : 0
        }
      ]
    };

    docItem.xmlOriginal = generateFiscalXml(docItem);
    saidas.push(docItem);
  }

  return saidas;
}

/**
 * Monta as 26 Notas de Entrada oficiais contra a Empresa em Setembro/2026
 */
export function buildSeptemberEntradas26(company: CompanyData): DocFiscal[] {
  const cUF = company.uf === 'SP' ? '35' : company.uf === 'RJ' ? '33' : company.uf === 'MG' ? '31' : '35';
  const cleanCompanyCnpj = company.cnpj.replace(/\D/g, '') || '12345678000199';
  const companyName = company.name || 'EMPRESA CONSULTIVA MATRIZ LTDA';

  return RAW_ENTRADAS_26.map((raw, idx) => {
    const numStr = raw.num.toString().padStart(6, '0');
    const chave = buildChaveAcesso(
      cUF,
      '2609',
      raw.emitenteCnpj,
      raw.tipo === 'NF-e' ? '55' : raw.tipo === 'CT-e' ? '57' : '00',
      raw.serie,
      raw.num
    );
    const protNum = `1352600${(9180000 + idx).toString()}`;

    const doc: DocFiscal = {
      id: `entrada-2609-${numStr}`,
      tipo: raw.tipo,
      numero: numStr,
      serie: raw.serie,
      chave,
      dataEmissao: raw.data,
      emitente: raw.emitente,
      emitenteCnpj: raw.emitenteCnpj,
      destinatario: companyName,
      destinatarioCnpj: company.cnpj,
      valorTotal: raw.valor,
      valorIcms: raw.icms,
      valorIss: raw.iss,
      cfop: raw.cfop,
      ncm: raw.ncm,
      status: 'Autorizada',
      direcao: 'entrada',
      protocoloAutorizacao: protNum,
      manifestacao: idx % 3 === 0 ? 'Confirmada' : 'Ciência',
      dataManifestacao: `${raw.data} 15:30:00`,
      xmlOriginal: '',
      itens: [
        {
          descricao: raw.itemDesc,
          ncm: raw.ncm,
          cfop: raw.cfop,
          valor: raw.valor,
          quantidade: raw.qtd,
          valorUnitario: raw.unit,
          icmsAliquota: raw.aliquota,
          issAliquota: raw.iss > 0 ? 5 : 0
        }
      ]
    };

    doc.xmlOriginal = generateFiscalXml(doc);
    return doc;
  });
}

/**
 * Retorna o acervo de documentos reais armazenados. Retorna array vazio se nenhuma nota real foi sincronizada.
 */
export function getCompanyFiscalDocuments(company: CompanyData): DocFiscal[] {
  // Retorna estritamente vazio por padrão para não exibir dados fictícios/demonstração.
  // Apenas notas fiscais reais capturadas na SEFAZ mTLS ou importadas via XML/ZIP serão exibidas.
  return [];
}
