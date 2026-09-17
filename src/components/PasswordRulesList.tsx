import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';
import { validatePasswordPolicy } from '../utils/passwordPolicy';

interface PasswordRulesListProps {
  password: string;
  showTitle?: boolean;
}

export const PasswordRulesList: React.FC<PasswordRulesListProps> = ({ password, showTitle = true }) => {
  const result = validatePasswordPolicy(password);

  return (
    <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
      {showTitle && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Requisitos de Segurança da Senha</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            result.isValid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
          }`}>
            {result.isValid ? 'Senha Válida' : 'Exigido pelo Sistema'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {result.rules.map((rule) => (
          <div 
            key={rule.id}
            className={`flex items-center gap-2 text-[11px] p-1.5 rounded-lg transition ${
              rule.isMet 
                ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/40' 
                : 'bg-slate-900/60 text-slate-400 border border-slate-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
              rule.isMet ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
            }`}>
              {rule.isMet ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
            </div>
            <span className="leading-tight">{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
