import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in Vértice Auditor Fiscal:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    try {
      localStorage.removeItem('sna_companies_base');
      localStorage.removeItem('sna_auth_user');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-[#0F172A] border border-rose-800/60 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-800/60">
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Recuperação de Interface Tributária</h2>
                <p className="text-xs text-slate-400 font-mono">VÉRTICE AUDITOR FISCAL • Safe Guard</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 ">
              <p className="text-rose-400 font-bold mb-1">
                {this.state.error?.name}: {this.state.error?.message}
              </p>
              {this.state.error?.stack && (
                <pre className="text-[11px] text-slate-500 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {this.state.error.stack.slice(0, 500)}
                </pre>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Ocorreu uma divergência nos parâmetros de dados. Você pode recarregar a interface ou restabelecer a base de empresas para o padrão oficial homologado.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Painel</span>
              </button>
              <button
                onClick={this.handleResetState}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Restaurar Base Padrão</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
