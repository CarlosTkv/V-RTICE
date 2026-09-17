import React, { useState } from 'react';
import { Mail, Send, X, ShieldCheck, Building2, Phone, Briefcase } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SupportContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportContactModal: React.FC<SupportContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: 'Dúvida Geral / Comercial',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call to send email
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      // Reset form after a delay and close
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          subject: 'Dúvida Geral / Comercial',
          message: ''
        });
        onClose();
      }, 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Brand & Info */}
        <div className="w-full md:w-5/12 bg-slate-900 border-r border-slate-800 p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10 space-y-6">
            <BrandLogo variant="navbar" size="lg" />
            
            <div className="pt-4 space-y-3">
              <h2 className="text-2xl font-black text-white leading-tight">
                Inteligência Tributária & <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  Emissão Nacional
                </span>
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nossa equipe de engenharia e auditoria fiscal está pronta para sanar suas dúvidas, apresentar propostas sob medida ou auxiliar na integração dos seus certificados A1.
              </p>
            </div>

            <div className="pt-6 space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/50">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">E-mail Oficial</h4>
                  <a href="mailto:contato@verticeanalises.com.br" className="text-sm text-white font-medium hover:text-blue-400 transition">
                    contato@verticeanalises.com.br
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/50">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Conformidade</h4>
                  <p className="text-sm text-white font-medium">
                    Adequado à EC 132/23 (Reforma) e LC 123/06. Proteção de ponta a ponta mTLS.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/80">
            <p className="text-xs text-slate-500">
              Vértice Auditor Fiscal © 2026<br/>
              Todos os direitos reservados.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 bg-[#0B0F19] p-8 relative">
          {success ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0F19] p-8 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Mensagem Recebida!</h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                Sua solicitação foi encaminhada diretamente para nossa equipe de Inteligência Fiscal. Retornaremos o contato em breve através do e-mail informado.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Fale com a Vértice</h3>
                <p className="text-xs text-slate-400">Preencha o formulário abaixo ou envie um e-mail direto.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Seu Nome / Razão Social</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                      style={{ paddingLeft: '2.75rem' }}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      placeholder="Nome da empresa ou responsável"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
                      style={{ paddingLeft: '2.75rem' }}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      placeholder="seu@email.com.br"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))}
                      style={{ paddingLeft: '2.75rem' }}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assunto</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <select 
                      value={formData.subject}
                      onChange={e => setFormData(prev => ({...prev, subject: e.target.value}))}
                      style={{ paddingLeft: '2.75rem' }}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition appearance-none"
                    >
                      <option>Dúvida Comercial / Planos</option>
                      <option>Suporte Técnico (Erros/Bugs)</option>
                      <option>Dúvida sobre Fator R / Tributação</option>
                      <option>Dúvida sobre NFS-e / Certificado A1</option>
                      <option>Parceria / Indicação (Escritórios)</option>
                      <option>Outros</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sua Mensagem</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={e => setFormData(prev => ({...prev, message: e.target.value}))}
                  className="w-full flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none min-h-[120px]"
                  placeholder="Descreva como podemos ajudar a sua empresa..."
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white font-extrabold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando solicitação...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Mensagem</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
