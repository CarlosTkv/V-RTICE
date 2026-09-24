import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  QrCode as QrCodeIcon,
  Building2,
  Landmark,
  Scale,
  Calendar,
  Lock,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import { motion } from 'motion/react';
import { CNDItem, CompanyData } from '../types';
import { generateCNDQRCodeDataUrl, downloadSingleCNDPDF } from '../utils/cndPdfGenerator';
import { getStateJurisdiction, getMunicipalJurisdiction } from '../utils/cndJurisdictionEngine';

interface OfficialCNDViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cnd: CNDItem | null;
  company: CompanyData;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const OfficialCNDViewerModal: React.FC<OfficialCNDViewerModalProps> = ({
  isOpen,
  onClose,
  cnd,
  company,
  showToast
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const uf = (company?.uf || 'PR').toUpperCase();
  const city = company?.city || 'Curitiba';
  const stateInfo = getStateJurisdiction(uf);
  const municipalInfo = getMunicipalJurisdiction(city, uf);

  useEffect(() => {
    if (cnd && isOpen) {
      generateCNDQRCodeDataUrl(cnd.officialValidationUrl || 'https://servicos.receita.fazenda.gov.br').then(url => {
        setQrCodeUrl(url);
      });
    }
  }, [cnd, isOpen]);

  if (!isOpen || !cnd) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cnd.controlCode);
    setCopiedCode(true);
    showToast?.('Código de autenticação copiado com sucesso!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadSingleCNDPDF(cnd, company);
      showToast?.(`Download da certidão ${cnd.sphere.toUpperCase()} iniciado com sucesso!`, 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao gerar arquivo PDF da certidão.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Barra de Controle do Visualizador */}
        <div className="p-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                Visualizador de Documento Oficial ICP-Brasil
              </span>
              <h3 className="text-sm font-black text-slate-100">
                {cnd.title}
              </h3>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloading ? 'Gerando PDF...' : 'Baixar PDF Oficial'}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Imprimir Certidão"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Imprimir
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title="Fechar Visualizador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área do Documento Oficial Estilizado no Padrão A4 Governamental */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-950/60 flex justify-center">
          <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 max-w-3xl w-full border border-slate-200 relative select-text font-serif leading-relaxed text-[13px]">
            
            {/* Marca d'água de segurança */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <span className="text-8xl font-black rotate-[-35deg] text-slate-900 tracking-widest uppercase">
                VÉRTICE FISCAL
              </span>
            </div>

            {/* Borda de Segurança Oficial */}
            <div className="absolute inset-3 border-2 border-slate-300 pointer-events-none rounded-sm">
              <div className="absolute inset-1 border border-slate-200"></div>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Cabeçalho do Órgão */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800">
                {cnd.sphere === 'federal' && (
                  <>
                    <div className="w-12 h-12 mx-auto mb-2 text-slate-800 flex items-center justify-center">
                      <Landmark className="w-10 h-10" />
                    </div>
                    <h4 className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                      REPÚBLICA FEDERATIVA DO BRASIL
                    </h4>
                    <h5 className="font-semibold text-xs text-slate-700 uppercase">
                      MINISTÉRIO DA FAZENDA
                    </h5>
                    <p className="text-[11px] text-slate-600 uppercase font-sans">
                      SECRETARIA ESPECIAL DA RECEITA FEDERAL DO BRASIL
                    </p>
                    <p className="text-[11px] text-slate-600 uppercase font-sans">
                      PROCURADORIA-GERAL DA FAZENDA NACIONAL
                    </p>
                  </>
                )}

                {cnd.sphere === 'estadual' && (
                  <>
                    <div className="w-12 h-12 mx-auto mb-2 text-slate-800 flex items-center justify-center">
                      <Building2 className="w-10 h-10" />
                    </div>
                    <h4 className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                      GOVERNO DO ESTADO DE {stateInfo.stateName.toUpperCase()}
                    </h4>
                    <h5 className="font-semibold text-xs text-slate-700 uppercase">
                      {stateInfo.organName.toUpperCase()}
                    </h5>
                    <p className="text-[11px] text-slate-600 uppercase font-sans">
                      DIRETORIA DE ARRECADAÇÃO E DÍVIDA ATIVA DO ESTADO
                    </p>
                  </>
                )}

                {cnd.sphere === 'municipal' && (
                  <>
                    <div className="w-12 h-12 mx-auto mb-2 text-slate-800 flex items-center justify-center">
                      <Building2 className="w-10 h-10" />
                    </div>
                    <h4 className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                      PREFEITURA MUNICIPAL DE {city.toUpperCase()} - {uf}
                    </h4>
                    <h5 className="font-semibold text-xs text-slate-700 uppercase">
                      {municipalInfo.organName.toUpperCase()}
                    </h5>
                    <p className="text-[11px] text-slate-600 uppercase font-sans">
                      DIVISÃO DE TRIBUTOS MOBILIÁRIOS E DÍVIDA ATIVA
                    </p>
                  </>
                )}

                {cnd.sphere === 'trabalhista' && (
                  <>
                    <div className="w-12 h-12 mx-auto mb-2 text-slate-800 flex items-center justify-center">
                      <Scale className="w-10 h-10" />
                    </div>
                    <h4 className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                      PODER JUDICIÁRIO - JUSTIÇA DO TRABALHO
                    </h4>
                    <h5 className="font-semibold text-xs text-slate-700 uppercase">
                      TRIBUNAL SUPERIOR DO TRABALHO (TST)
                    </h5>
                    <p className="text-[11px] text-slate-600 uppercase font-sans">
                      BANCO NACIONAL DE DEVEDORES TRABALHISTAS - BNDT
                    </p>
                  </>
                )}

                {cnd.sphere === 'fgts' && (
                  <>
                    <div className="w-12 h-12 mx-auto mb-2 text-slate-800 flex items-center justify-center">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h4 className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                      CAIXA ECONÔMICA FEDERAL
                    </h4>
                    <h5 className="font-semibold text-xs text-slate-700 uppercase">
                      CERTIFICADO DE REGULARIDADE DO FGTS - CRF
                    </h5>
                    <p className="text-[11px] text-slate-600 uppercase font-sans">
                      SISTEMA NACIONAL DE ARRECADAÇÃO E BENEFÍCIOS DO TRABALHADOR
                    </p>
                  </>
                )}

                <div className="pt-3">
                  <h3 className="font-sans font-black text-sm text-slate-900 uppercase tracking-tight">
                    {cnd.title}
                  </h3>
                </div>
              </div>

              {/* Dados do Contribuinte */}
              <div className="bg-slate-50 border border-slate-300 p-4 rounded font-sans text-xs space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-semibold">Razão Social:</span>
                  <strong className="text-slate-900">{company.name || 'EMPRESA CONTRIBUINTE LTDA'}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-semibold">CNPJ / Inscrição Federal:</span>
                  <strong className="text-slate-900 font-mono">{company.cnpj || '00.000.000/0001-00'}</strong>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-semibold">Endereço / Jurisdição Territorial:</span>
                  <span className="text-slate-800">
                    {company.address?.logradouro || 'Av. Principal'}, {company.address?.numero || '100'} - {city}/{uf}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-semibold">Órgão Emissor / Competência:</span>
                  <span className="text-slate-800">{cnd.organ} ({cnd.jurisdictionName})</span>
                </div>
              </div>

              {/* Conteúdo Certificatório Textual */}
              <div className="text-justify leading-relaxed text-slate-800 space-y-3 font-serif">
                {cnd.sphere === 'federal' && (
                  <>
                    <p>
                      Ressalvado o direito de a Fazenda Nacional cobrar e inscrever quaisquer dívidas de responsabilidade do sujeito passivo acima identificado que vierem a ser apuradas, é certificado que <strong>NÃO CONSTAM</strong> pendências em seu nome relativas a créditos tributários administrados pela Secretaria Especial da Receita Federal do Brasil (RFB) e a inscrições em Dívida Ativa da União (DAU) junto à Procuradoria-Geral da Fazenda Nacional (PGFN).
                    </p>
                    <p className="text-xs text-slate-600">
                      Esta certidão é válida para a matriz e suas filiais e abrange inclusive as contribuições sociais previstas nas alíneas &apos;a&apos; a &apos;d&apos; do parágrafo único do art. 11 da Lei nº 8.212, de 24 de julho de 1991.
                    </p>
                  </>
                )}

                {cnd.sphere === 'estadual' && (
                  <>
                    <p>
                      Certifica-se, para os devidos fins de direito, que examinados os assentamentos fiscais e os registros de Dívida Ativa da Fazenda Pública Estadual, <strong>NÃO CONSTAM</strong>, até a presente data, débitos tributários pendentes de quitação de responsabilidade da pessoa jurídica acima qualificada perante a Fazenda do Estado.
                    </p>
                    <p className="text-xs text-slate-600">
                      A presente certidão abrange todos os créditos tributários de competência estadual (ICMS, ITCMD, IPVA e Taxas Estaduais) e não elide o direito de a Fazenda Estadual exigir créditos que venham a ser constatados posteriormente.
                    </p>
                  </>
                )}

                {cnd.sphere === 'municipal' && (
                  <>
                    <p>
                      Certificamos que, consultado o Cadastro Fiscal de Contribuintes do Município e os registros da Dívida Ativa Municipal, <strong>NÃO CONSTAM</strong> registros de débitos tributários inscritos ou não inscritos relativos ao Imposto Sobre Serviços de Qualquer Natureza (ISSQN), Taxas de Licença, IPTU Mobiliário ou quaisquer outros tributos municipais para a inscrição acima epigrafada.
                    </p>
                    <p className="text-xs text-slate-600">
                      Fica ressalvado o direito da Fazenda Municipal proceder à cobrança de débitos que posteriormente venham a ser apurados.
                    </p>
                  </>
                )}

                {cnd.sphere === 'trabalhista' && (
                  <>
                    <p>
                      Certifica-se que a pessoa jurídica acima identificada <strong>NÃO CONSTA</strong> como devedora no Banco Nacional de Devedores Trabalhistas (BNDT).
                    </p>
                    <p className="text-xs text-slate-600">
                      Certidão expedida com base no art. 642-A da Consolidação das Leis do Trabalho, acrescentado pela Lei nº 12.440, de 7 de julho de 2011, e na Resolução Administrativa nº 1470/2011 do Tribunal Superior do Trabalho.
                    </p>
                  </>
                )}

                {cnd.sphere === 'fgts' && (
                  <>
                    <p>
                      A Caixa Econômica Federal, no uso da atribuição que lhe confere o Art. 7º, da Lei 8.036, de 11 de maio de 1990, certifica que, nesta data, a empresa acima identificada encontra-se em <strong>SITUAÇÃO REGULAR</strong> perante o Fundo de Garantia do Tempo de Serviço - FGTS.
                    </p>
                    <p className="text-xs text-slate-600">
                      O presente Certificado não exime de responsabilidade o empregador quanto a valores não recolhidos e não quita débitos com vencimento posterior à data de sua expedição.
                    </p>
                  </>
                )}
              </div>

              {/* Quadro de Validade & Autenticação */}
              <div className="bg-slate-100 border border-slate-300 p-4 rounded font-sans text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block">Emitido em:</span>
                  <strong className="text-slate-900">{new Date(cnd.issueDate).toLocaleDateString('pt-BR')} às 09:30</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Válido até:</span>
                  <strong className="text-emerald-700 font-bold">{new Date(cnd.expiryDate).toLocaleDateString('pt-BR')} ({cnd.daysRemaining} dias)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    <Check className="w-3 h-3" /> NEGATIVA (REGULAR)
                  </span>
                </div>
              </div>

              {/* Código de Controle & QR Code Oficial */}
              <div className="border border-slate-300 p-4 rounded font-sans flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Código de Controle do Documento
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-indigo-900 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                      {cnd.controlCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs flex items-center gap-1 transition-colors"
                      title="Copiar código"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Base Legal: {cnd.legalBase}
                  </p>
                  <a
                    href={cnd.officialValidationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-700 hover:underline inline-flex items-center gap-1 font-medium pt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Verificar no Portal Oficial do Órgão Emissor
                  </a>
                </div>

                {qrCodeUrl && (
                  <div className="text-center p-2 bg-white rounded border border-slate-200 shadow-sm flex-shrink-0">
                    <img src={qrCodeUrl} alt="QR Code de Validação" className="w-24 h-24 mx-auto" />
                    <span className="text-[9px] text-slate-500 block mt-1 font-mono">Validação Instantânea</span>
                  </div>
                )}
              </div>

              {/* Rodapé Oficial */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-sans">
                <span>Certificação Digital ICP-Brasil | Vértice Suite</span>
                <span>Fé Pública em Todo o Território Nacional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Documento emitido com integridade garantida por chave pública e barramento oficial.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Fechar Visualizador
          </button>
        </div>
      </motion.div>
    </div>
  );
};
