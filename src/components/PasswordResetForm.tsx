import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { AuthService } from '../utils/authService';

interface PasswordResetFormProps {
  oobCode: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ oobCode, onSuccess, onError }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // confirmPasswordReset(auth, oobCode, password); // Implementação Firebase
      onSuccess();
    } catch (error: any) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nova Senha</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            placeholder="Digite sua nova senha"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
        Definir Nova Senha
      </button>
    </form>
  );
};
