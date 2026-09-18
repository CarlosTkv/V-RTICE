import React from 'react';
import { 
  Sparkles, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Building2, 
  RefreshCw, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { REDESIM_SMART_PRESETS, RedesimPreset } from '../../data/precedentesClausulasData';

interface SmartRedesimPresetsProps {
  onSelectPreset: (preset: RedesimPreset) => void;
  selectedPresetId?: string;
}

export const SmartRedesimPresets: React.FC<SmartRedesimPresetsProps> = ({
  onSelectPreset,
  selectedPresetId
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Motor de Modelagem Contratual Inteligente REDESIM
            </h3>
            <p className="text-xs text-slate-400">
              Selecione uma arquitetura pré-configurada para parametrizar automaticamente eventos, quóruns e cláusulas blindadas.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {REDESIM_SMART_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/30'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                    {preset.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Eventos: {preset.events.join(', ')}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100 leading-snug">
                  {preset.name}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-indigo-400 font-semibold">
                  Modo: {preset.targetMode.toUpperCase()}
                </span>

                <button
                  type="button"
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <Zap className="w-3 h-3" />
                  <span>Aplicar Preset</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
