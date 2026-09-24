import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Printer,
  ChevronRight,
  HelpCircle,
  Building,
  Check,
  ShieldCheck,
  Globe,
  Tag,
  AlertCircle,
  FolderLock,
  Sparkles,
  Bell,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { CompanyData, ObrigacaoFiscal } from '../types';
import { CNDRadarHubModal } from './CNDRadarHubModal';

interface AgendaFiscalViewProps {
  currentCompany?: CompanyData;
}

// Banco de Dados Oficial de Obrigações Acessórias Brasileiras Expandido
export const OBRIGACOES_DATABASE: ObrigacaoFiscal[] = [
  // --- FEDERAIS ---
  {
    id: 'fed-pgdas',
    sigla: 'PGDAS-D',
    nome: 'Programa Gerador do Documento de Arrecadação do Simples Nacional',
    esfera: 'Federal',
    setor: 'Fiscal',
    diaEntregaSugerido: 'Até o dia 20 do mês subsequente',
    descricao: 'Declaração mensal obrigatória para empresas optantes pelo Simples Nacional para apuração dos tributos unificados (DAS) e envio de receitas.',
    destinatario: 'Microempresas (ME) e Empresas de Pequeno Porte (EPP) optantes pelo Simples Nacional.',
    penalidade: 'Multa mínima de R$ 50,00 por competência em atraso ou até 2% sobre o montante de tributos declarados.',
    legislacaoBase: 'Art. 18-A da Lei Complementar nº 123/6006.',
    recorrencia: 'Mensal',
    alertaVencimentoDias: 5
  },
  {
    id: 'fed-dctfweb',
    sigla: 'DCTFWeb',
    nome: 'Declaração de Débitos e Créditos Tributários Federais Previdenciários',
    esfera: 'Federal',
    setor: 'Departamento Pessoal',
    diaEntregaSugerido: 'Até o dia 15 do mês subsequente',
    descricao: 'Declaração gerada a partir das escriturações eSocial e EFD-Reinf para confissão de débitos previdenciários e emissão da guia de recolhimento unificada.',
    destinatario: 'Todas as empresas privadas com funcionários registrados ou pró-labore ativo.',
    penalidade: 'Multa mínima de R$ 200,00 (sem fato gerador) ou R$ 500,00 (ativo), além de juros Selic por dia de atraso.',
    legislacaoBase: 'Instrução Normativa RFB nº 2005/6021.',
    recorrencia: 'Mensal',
    alertaVencimentoDias: 3
  },
  {
    id: 'fed-reinf',
    sigla: 'EFD-Reinf',
    nome: 'Escrituração Fiscal Digital de Retenções e Outras Informações Fiscais',
    esfera: 'Federal',
    setor: 'Fiscal',
    diaEntregaSugerido: 'Até o dia 15 do mês subsequente',
    descricao: 'Escrituração digital de retenções na fonte (IR, CSLL, PIS, COFINS) incidentes sobre pagamentos de serviços tomados, distribuição de lucros e receitas agroindustriais.',
    destinatario: 'Empresas tomadoras de serviços de terceirização, prestadoras com retenções ou que realizem distribuição de dividendos relevantes.',
    penalidade: 'Multa de R$ 500,00 por competência em atraso ou omissão de registros técnicos.',
    legislacaoBase: 'Instrução Normativa RFB nº 2043/6021.',
    recorrencia: 'Mensal',
    alertaVencimentoDias: 3
  },
  {
    id: 'fed-esocial',
    sigla: 'eSocial',
    nome: 'Sistema de Escrituração Digital das Obrigações Trabalhistas',
    esfera: 'Federal',
    setor: 'Departamento Pessoal',
    diaEntregaSugerido: 'Até o dia 15 do mês subsequente',
    descricao: 'Escrituração unificada de eventos trabalhistas (admissões, demissões, folhas de pagamento, acidentes de trabalho e exames de SST).',
    destinatario: 'Qualquer pessoa jurídica com funcionários contratados sob regime CLT ou estagiários.',
    penalidade: 'Multa variável de R$ 200,00 a R$ 3.000,00 por evento enviado com atraso ou retificação dolosa.',
    legislacaoBase: 'Decreto Federal nº 8.373/6014.',
    recorrencia: 'Mensal',
    alertaVencimentoDias: 2
  },
  {
    id: 'fed-defis',
    sigla: 'DEFIS',
    nome: 'Declaração de Informações Socioeconômicas e Fiscais',
    esfera: 'Federal',
    setor: 'Societário',
    diaEntregaSugerido: 'Até 31 de março do ano subsequente',
    descricao: 'Declaração anual simplificada para prestação de contas sobre contas bancárias, despesas operacionais globais, retiradas de sócios, estoque inicial e final.',
    destinatario: 'Exclusivo para empresas do Simples Nacional.',
    penalidade: 'Bloqueio imediato da emissão do DAS mensal subsequente e restrição de regularidade fiscal perante a RFB.',
    legislacaoBase: 'Resolução CGSN nº 140/6018.',
    recorrencia: 'Anual',
    alertaVencimentoDias: 15
  },
  {
    id: 'est-efd-icms',
    sigla: 'EFD ICMS/IPI',
    nome: 'Escrituração Fiscal Digital de ICMS e IPI (SPED Fiscal)',
    esfera: 'Estadual',
    setor: 'Fiscal',
    diaEntregaSugerido: 'Até o dia 20 do mês subsequente (varia por UF)',
    descricao: 'Arquivo digital que contém os registros de entrada, saída, apuração de impostos estaduais e inventário físico.',
    destinatario: 'Contribuintes de ICMS e IPI, exceto MEIs e alguns enquadrados no Simples sem IE.',
    penalidade: 'Multas pesadas sobre o valor das operações ou fixas por arquivo não enviado, variando por Estado.',
    legislacaoBase: 'Convênio ICMS 143/2006.',
    recorrencia: 'Mensal',
    alertaVencimentoDias: 5
  },
  {
    id: 'mun-iss',
    sigla: 'ISSQN / DMS',
    nome: 'Declaração Mensal de Serviços e Imposto Sobre Serviços',
    esfera: 'Municipal',
    setor: 'Fiscal',
    diaEntregaSugerido: 'Até o dia 10 do mês subsequente',
    descricao: 'Prestação de contas municipal sobre os serviços prestados e tomados, servindo de base para a guia de ISS própria ou retida.',
    destinatario: 'Prestadores e tomadores de serviço em municípios com sistema de nota eletrônica ou declaração obrigatória.',
    penalidade: 'Multas acessórias municipais e impedimento de emissão de Certidão Negativa de Débitos (CND) municipal.',
    legislacaoBase: 'Lei Complementar nº 116/2003 e Código Tributário Municipal.',
    recorrencia: 'Mensal',
    alertaVencimentoDias: 4
  }
];

export const AgendaFiscalView: React.FC<AgendaFiscalViewProps> = ({ currentCompany }) => {
  const cnpjKey = currentCompany?.cnpj || 'geral';

  const [statusObrigacoes, setStatusObrigacoes] = useState<Record<string, Record<string, 'Pendente' | 'Entregue' | 'Atrasado'>>>(() => {
    try {
      const saved = localStorage.getItem('vertice_agenda_status_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEsfera, setSelectedEsfera] = useState<'Todas' | 'Federal' | 'Estadual' | 'Municipal'>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | 'Pendente' | 'Entregue' | 'Atrasado'>('Todos');
  const [selectedSetor, setSelectedSetor] = useState<'Todos' | 'Fiscal' | 'Contábil' | 'Societário' | 'Departamento Pessoal' | 'Financeiro'>('Todos');
  const [selectedObrigacao, setSelectedObrigacao] = useState<ObrigacaoFiscal | null>(OBRIGACOES_DATABASE[0]);
  const [filtrarPorPerfil, setFiltrarPorPerfil] = useState(true);
  const [showCndModal, setShowCndModal] = useState<boolean>(false);

  const regimeEmpresa = currentCompany?.regimeTributario || 'simples_nacional';
  const atividadeEmpresa = currentCompany?.atividadeEmpresa || 'servicos';

  const updateStatus = (id: string, newStatus: 'Pendente' | 'Entregue' | 'Atrasado') => {
    setStatusObrigacoes(prev => {
      const updatedCompanyStatus = {
        ...(prev[cnpjKey] || {}),
        [id]: newStatus
      };

      const newState = {
        ...prev,
        [cnpjKey]: updatedCompanyStatus
      };

      localStorage.setItem('vertice_agenda_status_v2', JSON.stringify(newState));
      return newState;
    });
  };

  const getStatus = (id: string) => {
    return statusObrigacoes[cnpjKey]?.[id] || 'Pendente';
  };

  const filteredObrigacoes = useMemo(() => {
    return OBRIGACOES_DATABASE.filter(ob => {
      if (filtrarPorPerfil) {
        const idLower = ob.id.toLowerCase();
        const siglaLower = ob.sigla.toLowerCase();
        if (regimeEmpresa === 'simples_nacional' && (idLower.includes('ecd') || idLower.includes('ecf'))) return false;
        if ((regimeEmpresa === 'lucro_presumido' || regimeEmpresa === 'lucro_real') && (idLower.includes('pgdas') || idLower.includes('defis'))) return false;
        if (atividadeEmpresa === 'servicos' && (idLower.includes('sped-fiscal') || idLower.includes('gia'))) return false;
      }

      const matchSearch =
        ob.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ob.nome.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEsfera = selectedEsfera === 'Todas' || ob.esfera === selectedEsfera;
      const matchSetor = selectedSetor === 'Todos' || ob.setor === selectedSetor;
      const matchStatus = selectedStatus === 'Todos' || getStatus(ob.id) === selectedStatus;

      return matchSearch && matchEsfera && matchSetor && matchStatus;
    });
  }, [searchTerm, selectedEsfera, selectedSetor, selectedStatus, filtrarPorPerfil, regimeEmpresa, atividadeEmpresa, statusObrigacoes, cnpjKey]);

  const stats = useMemo(() => {
    const relevant = OBRIGACOES_DATABASE.filter(ob => {
      if (!filtrarPorPerfil) return true;
      const idLower = ob.id.toLowerCase();
      if (regimeEmpresa === 'simples_nacional' && (idLower.includes('ecd') || idLower.includes('ecf'))) return false;
      if ((regimeEmpresa === 'lucro_presumido' || regimeEmpresa === 'lucro_real') && (idLower.includes('pgdas') || idLower.includes('defis'))) return false;
      return true;
    });

    const total = relevant.length;
    let entregues = 0;
    let atrasadas = 0;
    
    relevant.forEach(ob => {
      const s = getStatus(ob.id);
      if (s === 'Entregue') entregues++;
      if (s === 'Atrasado') atrasadas++;
    });

    const pendentes = total - entregues - atrasadas;
    const porcentagemConclusao = total > 0 ? Math.round((entregues / total) * 100) : 0;

    return { total, entregues, pendentes, atrasadas, porcentagemConclusao };
  }, [statusObrigacoes, cnpjKey, filtrarPorPerfil, regimeEmpresa]);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/60 text-amber-400">
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">
                Módulo: Agenda de Obrigações Recorrentes
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Controle de status, alertas de vencimento e conformidade tributária.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
             <button
               onClick={() => setShowCndModal(true)}
               className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
               title="Verificar CNDs nas 5 Esferas (Federal, Estadual, Municipal, Trabalhista e FGTS)"
             >
               <ShieldCheck className="w-4 h-4 text-white" />
               <span>Verificar CNDs & Débitos 360° ({currentCompany?.city || 'Curitiba'}/{currentCompany?.uf || currentCompany?.state || 'PR'})</span>
             </button>

             <button
               onClick={() => {
                 let icsLines = [
                   'BEGIN:VCALENDAR',
                   'VERSION:2.0',
                   'PRODID:-//VERTICE TRIBUTARIO//AGENDA FISCAL//PT-BR',
                   'CALSCALE:GREGORIAN',
                   'METHOD:PUBLISH',
                   `X-WR-CALNAME:Agenda Fiscal - ${currentCompany?.name || 'Vértice'}`
                 ];

                 filteredObrigacoes.forEach(ob => {
                   const today = new Date();
                   const year = today.getFullYear();
                   const month = String(today.getMonth() + 1).padStart(2, '0');
                   const day = ob.diaEntregaSugerido.includes('15') ? '15' : ob.diaEntregaSugerido.includes('20') ? '20' : '28';
                   
                   icsLines.push('BEGIN:VEVENT');
                   icsLines.push(`SUMMARY:[FISCAL] ${ob.sigla} - ${ob.nome}`);
                   icsLines.push(`DESCRIPTION:${ob.descricao.replace(/\n/g, ' ')}\\n\\nPenalidade: ${ob.penalidade.replace(/\n/g, ' ')}`);
                   icsLines.push(`DTSTART;VALUE=DATE:${year}${month}${day}`);
                   icsLines.push(`DTEND;VALUE=DATE:${year}${month}${day}`);
                   icsLines.push('STATUS:CONFIRMED');
                   icsLines.push('END:VEVENT');
                 });

                 icsLines.push('END:VCALENDAR');

                 const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = `Agenda_Fiscal_${(currentCompany?.name || 'Vertice').replace(/\s+/g, '_')}.ics`;
                 document.body.appendChild(a);
                 a.click();
                 document.body.removeChild(a);
                 URL.revokeObjectURL(url);
               }}
               className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition cursor-pointer"
               title="Exportar arquivo .ics para Google Agenda, Outlook ou Apple Calendar"
             >
               <Calendar className="w-4 h-4" />
               <span>Sincronizar iCal / Google Calendar</span>
             </button>

             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Última Atualização</div>
                <div className="text-xs font-mono text-slate-300">Hoje, 19:54</div>
             </div>
             <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 transition cursor-pointer">
               <RefreshCw className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Taxa de Entrega</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.porcentagemConclusao}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${stats.porcentagemConclusao}%` }} />
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pendentes</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.pendentes}</div>
          <p className="text-[10px] text-slate-500 mt-2">Aguardando envio neste mês</p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.entregues}</div>
          <p className="text-[10px] text-slate-500 mt-2">Obrigações com recibo salvo</p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-3xl shadow-lg border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Em Atraso / Alerta</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-500">{stats.atrasadas}</div>
          <p className="text-[10px] text-rose-400/70 mt-2">Risco de multas e penalidades</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar obrigação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="Todos">Status: Todos</option>
          <option value="Pendente">Pendente</option>
          <option value="Entregue">Entregue</option>
          <option value="Atrasado">Atrasado</option>
        </select>

        <select
          value={selectedEsfera}
          onChange={(e) => setSelectedEsfera(e.target.value as any)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="Todas">Esfera: Todas</option>
          <option value="Federal">Federal</option>
          <option value="Estadual">Estadual</option>
          <option value="Municipal">Municipal</option>
        </select>

        <button
          onClick={() => setFiltrarPorPerfil(!filtrarPorPerfil)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            filtrarPorPerfil ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          {filtrarPorPerfil ? 'Perfil Inteligente ON' : 'Exibir Tudo'}
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/90 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    <th className="px-6 py-4">Sigla / Nome</th>
                    <th className="px-6 py-4">Periodicidade</th>
                    <th className="px-6 py-4">Vencimento</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/90">
                  {filteredObrigacoes.map(ob => {
                    const status = getStatus(ob.id);
                    return (
                      <tr 
                        key={ob.id} 
                        onClick={() => setSelectedObrigacao(ob)}
                        className={`hover:bg-slate-800/70 transition cursor-pointer group ${selectedObrigacao?.id === ob.id ? 'bg-blue-500/5' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="text-xs font-black text-white">{ob.sigla}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{ob.nome}</div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5">
                             <RefreshCw className="w-3 h-3 text-slate-500" />
                             <span className="text-[10px] font-bold text-slate-400">{ob.recorrencia}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-[10px] font-bold text-slate-300">{ob.diaEntregaSugerido}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                             status === 'Entregue' 
                               ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/60' 
                               : status === 'Atrasado'
                               ? 'bg-rose-500/10 text-rose-400 border-rose-500/60'
                               : 'bg-amber-500/10 text-amber-400 border-amber-500/60'
                           }`}>
                             {status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                             {status !== 'Entregue' ? (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); updateStatus(ob.id, 'Entregue'); }}
                                 className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/60 rounded-lg hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                               >
                                 <Check className="w-3.5 h-3.5" />
                               </button>
                             ) : (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); updateStatus(ob.id, 'Pendente'); }}
                                 className="p-1.5 bg-slate-800 text-slate-500 border border-slate-700 rounded-lg hover:bg-slate-700 transition cursor-pointer"
                               >
                                 <RefreshCw className="w-3.5 h-3.5" />
                               </button>
                             )}
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          {selectedObrigacao ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                 <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{selectedObrigacao.esfera}</div>
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alerta: {selectedObrigacao.alertaVencimentoDias} dias antes</div>
              </div>
              <h3 className="text-lg font-black text-white mb-1">{selectedObrigacao.sigla}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">{selectedObrigacao.nome}</p>

              <div className="space-y-4">
                 <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Penalidade por Atraso</div>
                    <p className="text-[11px] text-rose-300 leading-relaxed">{selectedObrigacao.penalidade}</p>
                 </div>

                 <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Legislação Base</div>
                    <p className="text-[11px] text-slate-400 font-mono">{selectedObrigacao.legislacaoBase}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => updateStatus(selectedObrigacao.id, 'Entregue')}
                     className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer"
                   >
                     Entregue
                   </button>
                   <button 
                     onClick={() => updateStatus(selectedObrigacao.id, 'Atrasado')}
                     className="py-2.5 bg-rose-600/10 hover:bg-rose-600/60 text-rose-400 border border-rose-500/70 text-[10px] font-black uppercase rounded-xl transition cursor-pointer"
                   >
                     Atrasado
                   </button>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#0F172A]/90 border border-slate-800 border-dashed rounded-3xl p-8 text-center text-slate-500 h-[400px] flex flex-col items-center justify-center">
               <Info className="w-8 h-8 mb-4 opacity-20" />
               <p className="text-xs">Selecione uma obrigação para gerenciar o status e prazos.</p>
            </div>
          )}
        </div>
      </div>

      {/* CND Radar Hub Modal */}
      {currentCompany && (
        <CNDRadarHubModal
          isOpen={showCndModal}
          onClose={() => setShowCndModal(false)}
          currentCompany={currentCompany}
        />
      )}
    </div>
  );
};
