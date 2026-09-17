import React, { useState } from 'react';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Check, 
  X, 
  LayoutGrid, 
  ArrowUp, 
  ArrowDown,
  Sparkles,
  Sliders
} from 'lucide-react';
import { DashboardWidgetConfig, DashboardWidgetId } from '../types';
import { DEFAULT_DASHBOARD_WIDGETS } from '../utils/widgetStorage';

interface DashboardWidgetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidgetConfig[];
  onSaveWidgets: (updatedWidgets: DashboardWidgetConfig[]) => void;
  onResetWidgets: () => void;
  showToast: (msg: string) => void;
}

export const DashboardWidgetCustomizerModal: React.FC<DashboardWidgetCustomizerModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onSaveWidgets,
  onResetWidgets,
  showToast,
}) => {
  const [localWidgets, setLocalWidgets] = useState<DashboardWidgetConfig[]>(widgets);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleToggleVisibility = (id: DashboardWidgetId) => {
    setLocalWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localWidgets.length) return;

    const newArr = [...localWidgets];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    setLocalWidgets(newArr.map((item, idx) => ({ ...item, order: idx })));
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newArr = [...localWidgets];
    const draggedItem = newArr[draggedIndex];
    newArr.splice(draggedIndex, 1);
    newArr.splice(dropIndex, 0, draggedItem);

    const reordered = newArr.map((item, idx) => ({ ...item, order: idx }));
    setLocalWidgets(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = () => {
    onSaveWidgets(localWidgets);
    showToast('Layout do Dashboard personalizado com sucesso!');
    onClose();
  };

  const handleReset = () => {
    onResetWidgets();
    setLocalWidgets(DEFAULT_DASHBOARD_WIDGETS);
    showToast('Layout restaurado para a ordem padrão.');
  };

  const visibleCount = localWidgets.filter(w => w.visible).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Personalizar Organização dos Widgets</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30">
                  {visibleCount} de {localWidgets.length} Ativos
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Arraste os cards para reorganizar a ordem de prioridade dos KPIs e gráficos no seu Dashboard
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Instruction Banner */}
        <div className="px-6 py-3 bg-[#0B0F19]/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Segure e arraste o ícone <GripVertical className="w-3.5 h-3.5 inline text-slate-400" /> para reposicionar</span>
          </div>
          
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
            title="Restaurar visualização original de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restaurar Padrão</span>
          </button>
        </div>

        {/* List of Reorderable Widgets */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          {localWidgets.map((widget, idx) => {
            const isDragging = draggedIndex === idx;
            const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

            return (
              <div
                key={widget.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                  isDragging 
                    ? 'opacity-40 bg-blue-950/40 border-blue-500/50 scale-[0.99]' 
                    : isDragOver 
                    ? 'bg-blue-600/20 border-blue-400 ring-2 ring-blue-500/50' 
                    : widget.visible 
                    ? 'bg-[#0B0F19] border-slate-800 text-white hover:border-slate-700' 
                    : 'bg-slate-950/60 border-slate-900 text-slate-500 opacity-60'
                }`}
              >
                {/* Drag Handle & Info */}
                <div className="flex items-center space-x-3 cursor-grab active:cursor-grabbing">
                  <div className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white transition">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  <span className="w-5 text-center font-mono text-xs font-bold text-slate-500">
                    #{idx + 1}
                  </span>

                  <div>
                    <h4 className={`text-xs font-bold ${widget.visible ? 'text-white' : 'text-slate-500 font-normal line-through'}`}>
                      {widget.title}
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Categoria: {widget.category === 'kpi' ? 'Indicador KPI' : widget.category === 'chart' ? 'Gráfico Analítico' : 'Módulo / Ferramenta'}
                    </span>
                  </div>
                </div>

                {/* Right controls: Arrows & Visibility Toggle */}
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center space-x-1 border-r border-slate-800 pr-2 mr-1">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === localWidgets.length - 1}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleVisibility(widget.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      widget.visible 
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30' 
                        : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {widget.visible ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Visível</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        <span>Oculto</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            A sua configuração personalizada será salva automaticamente nesta sessão.
          </span>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Layout</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
