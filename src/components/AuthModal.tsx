import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Crown, 
  ArrowRight,
  X,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  LogOut,
  FileText,
  Users,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  ShieldAlert,
  Percent,
  Clock,
  RefreshCw,
  Award,
  Copy,
  ExternalLink,
  Inbox,
  Send,
  CheckCheck,
  Fingerprint,
  UploadCloud,
  FileCheck,
  Shield
} from 'lucide-react';
import { AuthUser, SoldSubscription, SystemUser, SystemUserPermission, PlanPeriodicity, PlanAllowedModules, AuthSecurityMode, DigitalCertificateInfo } from '../types';
import { AuthService, SentEmailNotification, PendingRegistration, PendingPasswordReset, DEFAULT_AVAILABLE_CERTIFICATES } from '../utils/authService';
import { PartnerCommissionService } from '../utils/partnerCommissionService';
import { CustomPlanBuilderModal } from './CustomPlanBuilderModal';
import { CancellationSettlementModal } from './CancellationSettlementModal';
import { PLATFORM_PLANS } from '../data/adminBillingData';
import { CancellationSettlementResult } from '../utils/customPlanCalculator';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  onUpgradePlan: (plan: AuthUser['plan']) => void;
  onOpenPartnerPortal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpgradePlan,
  onOpenPartnerPortal,
}) => {
  const [mode, setMode] = useState<
    | 'profile'
    | 'security_settings'
    | 'sub_users'
    | 'my_subscription'
    | 'change_password'
    | 'reset_password_logged_in'
    | 'plans'
    | 'login'
    | 'register'
    | 'register_sent'
    | 'confirm_register'
    | 'forgot'
    | 'forgot_sent'
    | 'confirm_reset'
    | 'inbox'
  >(currentUser ? 'profile' : 'login');

  // Security Configuration State (2FA / Certificado Digital)
  const [userSecMode, setUserSecMode] = useState<AuthSecurityMode>(
    () => currentUser?.authSecurityMode || 'password_only'
  );
  const [userSecCert, setUserSecCert] = useState<DigitalCertificateInfo | undefined>(
    () => currentUser?.digitalCertificate || DEFAULT_AVAILABLE_CERTIFICATES[0]
  );
  const [availableCertsList, setAvailableCertsList] = useState<DigitalCertificateInfo[]>(
    () => AuthService.getAvailableCertificates()
  );

  // Sincroniza estado de segurança com usuário logado
  useEffect(() => {
    if (currentUser) {
      setUserSecMode(currentUser.authSecurityMode || 'password_only');
      setUserSecCert(currentUser.digitalCertificate || DEFAULT_AVAILABLE_CERTIFICATES[0]);
    }
  }, [currentUser]);

  // Email Confirmation & Verification States
  const [allSentEmails, setAllSentEmails] = useState<SentEmailNotification[]>(() => AuthService.getSentEmails());
  const [lastSentEmail, setLastSentEmail] = useState<SentEmailNotification | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Pending Registration State (for defining password via email link)
  const [activeRegToken, setActiveRegToken] = useState('');
  const [pendingRegData, setPendingRegData] = useState<PendingRegistration | null>(null);
  const [regSetPassword, setRegSetPassword] = useState('');
  const [regSetConfirmPassword, setRegSetConfirmPassword] = useState('');
  const [showRegSetPassword, setShowRegSetPassword] = useState(false);

  // Pending Password Reset State (for resetting password via email link)
  const [activeResetToken, setActiveResetToken] = useState('');
  const [pendingResetData, setPendingResetData] = useState<PendingPasswordReset | null>(null);
  const [resetSetPassword, setResetSetPassword] = useState('');
  const [resetSetConfirmPassword, setResetSetConfirmPassword] = useState('');
  const [showResetSetPassword, setShowResetSetPassword] = useState(false);

  // Escuta alteração de Hash da URL (#action=set-password&token=... ou #action=reset-password&token=...)
  useEffect(() => {
    const handleUrlAction = () => {
      const hash = window.location.hash;
      if (hash.includes('action=set-password')) {
        const match = hash.match(/token=([^&]+)/);
        if (match && match[1]) {
          const token = decodeURIComponent(match[1]);
          const check = AuthService.getPendingRegistration(token);
          if (check.success && check.pending) {
            setActiveRegToken(token);
            setPendingRegData(check.pending);
            setMode('confirm_register');
            setErrorMessage('');
            setSuccessMessage(`Link de ativação validado para ${check.pending.email}! Defina sua senha.`);
          } else {
            setErrorMessage(check.error || 'Link de confirmação inválido ou expirado.');
          }
        }
      } else if (hash.includes('action=reset-password')) {
        const match = hash.match(/token=([^&]+)/);
        if (match && match[1]) {
          const token = decodeURIComponent(match[1]);
          const check = AuthService.getPendingPasswordReset(token);
          if (check.success && check.pending) {
            setActiveResetToken(token);
            setPendingResetData(check.pending);
            setMode('confirm_reset');
            setErrorMessage('');
            setSuccessMessage(`Link de recuperação autenticado para ${check.pending.email}! Defina sua nova senha.`);
          } else {
            setErrorMessage(check.error || 'Link de recuperação inválido ou expirado.');
          }
        }
      }
    };

    handleUrlAction();
    window.addEventListener('hashchange', handleUrlAction);
    return () => window.removeEventListener('hashchange', handleUrlAction);
  }, []);

  // Sincroniza e-mails disparados em tempo real
  useEffect(() => {
    const handleEmailDispatched = () => {
      setAllSentEmails(AuthService.getSentEmails());
    };
    window.addEventListener('vertice_email_dispatched', handleEmailDispatched);
    return () => window.removeEventListener('vertice_email_dispatched', handleEmailDispatched);
  }, []);

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Sub-Users Management State (for Client Profile)
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('sna_admin_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Client Subscriptions State
  const [subscriptions, setSubscriptions] = useState<SoldSubscription[]>(() => {
    const saved = localStorage.getItem('sna_admin_subscriptions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Salvar em localStorage quando houver alterações
  useEffect(() => {
    if (systemUsers.length > 0) {
      localStorage.setItem('sna_admin_users', JSON.stringify(systemUsers));
    }
  }, [systemUsers]);

  useEffect(() => {
    if (subscriptions.length > 0) {
      localStorage.setItem('sna_admin_subscriptions', JSON.stringify(subscriptions));
    }
  }, [subscriptions]);

  // Form para adicionar/editar usuário do cliente
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userNameInput, setUserNameInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [userPasswordInput, setUserPasswordInput] = useState('');
  const [userRoleInput, setUserRoleInput] = useState<SystemUser['role']>('contador_senior');
  const [userDepartmentInput, setUserDepartmentInput] = useState('Fiscal / Contábil');
  const [userPermissionsInput, setUserPermissionsInput] = useState<SystemUserPermission>({
    canSimulateRegimes: true,
    canExportReports: true,
    canAccessAIAuditor: true,
    canEditCompanyData: true,
    canManageUsers: false,
    canViewFinancials: false,
    canAccessTaxReform: true,
    canAccessCFOP: true,
  });

  // Modais de Plano Customizado & Rescisão
  const [isCustomPlanModalOpen, setIsCustomPlanModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOffice, setRegOffice] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<SystemUser['role']>('contador_senior');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regReferralCodeInput, setRegReferralCodeInput] = useState('');
  const [regPartnerDiscountInput, setRegPartnerDiscountInput] = useState(10);

  // Dynamic validation of referral code for regular users
  const referralValidation = useMemo(() => {
    if (!regReferralCodeInput || regRole === 'parceiro_negocios') return null;
    return PartnerCommissionService.validateCode(regReferralCodeInput);
  }, [regReferralCodeInput, regRole]);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Identificação do Usuário e Assinatura Ativa
  const isMasterUser = currentUser?.role === 'master' || currentUser?.plan === 'master_ilimitado' || currentUser?.email === 'contato@verticeanalises.com.br' || currentUser?.email === 'carlosmiguelvieira1@gmail.com';
  const isAdminUser = Boolean(
    currentUser?.isAdmin || 
    currentUser?.role === 'administrador' || 
    currentUser?.role === 'master' || 
    currentUser?.isMaster || 
    currentUser?.email === 'contato@verticeanalises.com.br' ||
    currentUser?.email === 'carlosmiguelvieira1@gmail.com'
  );

  const activeSubscription = useMemo(() => {
    if (!currentUser) return null;
    return subscriptions.find(s => 
      s.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      s.companyName.toLowerCase() === (currentUser.companyName || '').toLowerCase()
    ) || subscriptions[0] || null;
  }, [subscriptions, currentUser]);

  const clientSubUsers = useMemo(() => {
    if (!currentUser) return [];
    if (isMasterUser) return systemUsers;
    return systemUsers.filter(u => 
      u.email.toLowerCase() === currentUser.email.toLowerCase() ||
      u.companyName.toLowerCase() === (currentUser.companyName || '').toLowerCase() ||
      u.subscriptionId === activeSubscription?.id
    );
  }, [systemUsers, currentUser, isMasterUser, activeSubscription]);

  const maxAllowedUsers = activeSubscription?.maxUsersAllowed || (isMasterUser ? 999 : 5);

  if (!isOpen) return null;

  // LOGIN HANDLER
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = AuthService.login(loginEmail, loginPassword);
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Credenciais inválidas.');
        return;
      }

      setSuccessMessage(`Bem-vindo, ${res.user.name}!`);
      onLogin(res.user);
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 700);
    }, 350);
  };

  // REGISTER HANDLER
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const plan = regRole === 'master' 
        ? 'master_ilimitado' 
        : regRole === 'parceiro_negocios'
        ? 'parceiro_isento'
        : regRole === 'cliente_leitor' 
        ? 'consumo_relatorios' 
        : 'pro_tributario';

      const res = AuthService.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        companyName: regOffice,
        role: regRole,
        plan,
        partnerReferralCode: regRole === 'parceiro_negocios' && regReferralCodeInput ? regReferralCodeInput.toUpperCase().trim() : undefined,
        partnerDiscountPercent: regRole === 'parceiro_negocios' ? regPartnerDiscountInput : undefined,
      });

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Falha ao registrar conta.');
        return;
      }

      // Se um cliente regular se cadastrou com código de parceiro válido, vincula a indicação
      if (regRole !== 'parceiro_negocios' && referralValidation && referralValidation.valid && referralValidation.partner) {
        try {
          PartnerCommissionService.registerReferredClient({
            partnerId: referralValidation.partner.id,
            partnerName: referralValidation.partner.name,
            clientName: res.user.name,
            clientEmail: res.user.email,
            planId: plan,
            planName: 'Profissional Tributário',
            originalPlanPrice: 397,
            discountPercentGiven: referralValidation.discountPercent,
            billingPeriodicity: 'mensal',
            status: 'ativo',
            paymentStatus: 'pago',
          });
        } catch (err) {
          console.error('Erro ao vincular indicação:', err);
        }
      }

      setSuccessMessage(`Conta criada com sucesso para ${res.user.name}!`);
      onLogin(res.user);
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 700);
    }, 350);
  };

  // CHANGE PASSWORD HANDLER
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser) return;

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('A confirmação da nova senha não coincide.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = AuthService.changePassword(currentUser.id, currentPassword, newPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao alterar senha.');
        return;
      }

      setSuccessMessage('Senha alterada com sucesso! Suas novas credenciais estão salvas.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setSuccessMessage('');
        setMode('profile');
      }, 1500);
    }, 350);
  };

  // SOLICITAR LINK DE RECUPERAÇÃO DE SENHA POR E-MAIL
  const handleRequestPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMessage('Informe o endereço de e-mail cadastrado da sua conta.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = AuthService.requestPasswordReset(forgotEmail);
      if (!res.success || !res.emailNotification) {
        setErrorMessage(res.error || 'Nenhuma conta localizada com este e-mail.');
        return;
      }

      setLastSentEmail(res.emailNotification);
      setAllSentEmails(AuthService.getSentEmails());
      const check = AuthService.getPendingPasswordReset(res.token!);
      if (check.pending) {
        setActiveResetToken(res.token!);
        setPendingResetData(check.pending);
      }
      setSuccessMessage(`Link seguro de recuperação enviado com sucesso para ${res.emailNotification.toEmail}!`);
      setMode('forgot_sent');
    }, 350);
  };

  // DEFINIR NOVA SENHA A PARTIR DO TOKEN DE RECUPERAÇÃO
  const handleConfirmResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetSetPassword || resetSetPassword.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (resetSetPassword !== resetSetConfirmPassword) {
      setErrorMessage('A confirmação da nova senha não coincide.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = AuthService.completePasswordResetWithToken(activeResetToken, resetSetPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao redefinir a senha.');
        return;
      }

      setSuccessMessage('Senha atualizada com sucesso! Você já pode realizar o login com suas novas credenciais.');
      setLoginEmail(pendingResetData?.email || forgotEmail);
      setLoginPassword(resetSetPassword);
      setResetSetPassword('');
      setResetSetConfirmPassword('');
      setActiveResetToken('');
      setPendingResetData(null);
      if (typeof window !== 'undefined' && window.location.hash.includes('action=reset-password')) {
        window.location.hash = '';
      }
      setTimeout(() => {
        setSuccessMessage('');
        setMode('login');
      }, 1500);
    }, 350);
  };

  // SOLICITAR CONFIRMAÇÃO DE CADASTRO POR E-MAIL
  const handleRequestRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim()) {
      setErrorMessage('Informe seu nome completo.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Informe um e-mail profissional válido.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const plan = regRole === 'master' 
        ? 'master_ilimitado' 
        : regRole === 'parceiro_negocios'
        ? 'parceiro_isento'
        : regRole === 'cliente_leitor' 
        ? 'consumo_relatorios' 
        : 'pro_tributario';

      const res = AuthService.requestRegistrationConfirmation({
        name: regName,
        email: regEmail,
        companyName: regOffice,
        role: regRole,
        plan,
      });

      if (!res.success || !res.emailNotification) {
        setErrorMessage(res.error || 'Falha ao solicitar confirmação de cadastro.');
        return;
      }

      setLastSentEmail(res.emailNotification);
      setAllSentEmails(AuthService.getSentEmails());
      const check = AuthService.getPendingRegistration(res.token!);
      if (check.pending) {
        setActiveRegToken(res.token!);
        setPendingRegData(check.pending);
      }
      setSuccessMessage(`Link de ativação enviado com sucesso para ${res.emailNotification.toEmail}!`);
      setMode('register_sent');
    }, 350);
  };

  // ATIVAR CONTA E DEFINIR SENHA A PARTIR DO TOKEN DE CADASTRO
  const handleConfirmRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regSetPassword || regSetPassword.length < 6) {
      setErrorMessage('A senha de acesso deve ter no mínimo 6 caracteres.');
      return;
    }
    if (regSetPassword !== regSetConfirmPassword) {
      setErrorMessage('A confirmação da senha não coincide.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = AuthService.completeRegistrationWithPassword(activeRegToken, regSetPassword);
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Falha ao ativar o cadastro.');
        return;
      }

      // Se um cliente regular se cadastrou com código de parceiro válido, vincula a indicação
      if (pendingRegData?.role !== 'parceiro_negocios' && referralValidation && referralValidation.valid && referralValidation.partner) {
        try {
          PartnerCommissionService.registerReferredClient({
            partnerId: referralValidation.partner.id,
            partnerName: referralValidation.partner.name,
            clientName: res.user.name,
            clientEmail: res.user.email,
            planId: pendingRegData?.plan || 'pro_tributario',
            planName: 'Profissional Tributário',
            originalPlanPrice: 397,
            discountPercentGiven: referralValidation.discountPercent,
            billingPeriodicity: 'mensal',
            status: 'ativo',
            paymentStatus: 'pago',
          });
        } catch (err) {
          console.error('Erro ao vincular indicação:', err);
        }
      }

      setSuccessMessage(`Cadastro ativado com sucesso para ${res.user.name}!`);
      onLogin(res.user);
      setActiveRegToken('');
      setPendingRegData(null);
      setRegSetPassword('');
      setRegSetConfirmPassword('');
      if (typeof window !== 'undefined' && window.location.hash.includes('action=set-password')) {
        window.location.hash = '';
      }
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 700);
    }, 350);
  };

  // AÇÃO AO CLICAR EM UM E-MAIL DA CAIXA DE ENTRADA DO SISTEMA
  const handleOpenEmailAction = (emailItem: SentEmailNotification) => {
    AuthService.markEmailAsRead(emailItem.id);
    setAllSentEmails(AuthService.getSentEmails());
    setErrorMessage('');
    setSuccessMessage('');

    if (emailItem.type === 'registration_confirmation') {
      const check = AuthService.getPendingRegistration(emailItem.token);
      if (check.success && check.pending) {
        setActiveRegToken(emailItem.token);
        setPendingRegData(check.pending);
        setMode('confirm_register');
        setSuccessMessage(`Link de ativação validado para ${check.pending.email}! Crie sua senha de acesso.`);
      } else {
        setErrorMessage(check.error || 'Link de confirmação inválido ou expirado.');
      }
    } else if (emailItem.type === 'password_reset') {
      const check = AuthService.getPendingPasswordReset(emailItem.token);
      if (check.success && check.pending) {
        setActiveResetToken(emailItem.token);
        setPendingResetData(check.pending);
        setMode('confirm_reset');
        setSuccessMessage(`Link de recuperação validado para ${check.pending.email}! Defina sua nova senha.`);
      } else {
        setErrorMessage(check.error || 'Link de recuperação inválido ou expirado.');
      }
    }
  };

  // HANDLER: SAVE SUB-USER (FOR ACTIVE CLIENT)
  const handleSaveSubUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNameInput || !userEmailInput) {
      setErrorMessage('Preencha o nome e e-mail do operador.');
      return;
    }

    if (!editingUserId && clientSubUsers.length >= maxAllowedUsers && !isMasterUser) {
      setErrorMessage(`Limite de ${maxAllowedUsers} usuários do seu plano atingido. Faça upgrade do plano para liberar mais acessos.`);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (editingUserId) {
      setSystemUsers(prev => prev.map(u => {
        if (u.id === editingUserId) {
          return {
            ...u,
            name: userNameInput,
            email: userEmailInput,
            role: userRoleInput,
            department: userDepartmentInput,
            permissions: userPermissionsInput,
          };
        }
        return u;
      }));
      setSuccessMessage(`Operador "${userNameInput}" atualizado com sucesso!`);
    } else {
      const newUser: SystemUser = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: userNameInput,
        email: userEmailInput,
        role: userRoleInput,
        status: 'ativo',
        companyName: currentUser?.companyName || 'Minha Empresa',
        subscriptionId: activeSubscription?.id,
        department: userDepartmentInput,
        createdAt: today,
        lastAccess: 'Nunca acessou',
        permissions: userPermissionsInput,
      };

      // Registrar também no AuthService para permitir login com a senha definida
      if (userPasswordInput) {
        AuthService.register({
          name: userNameInput,
          email: userEmailInput,
          password: userPasswordInput,
          companyName: currentUser?.companyName,
          role: userRoleInput,
          plan: currentUser?.plan,
        });
      }

      setSystemUsers(prev => [newUser, ...prev]);
      setSuccessMessage(`Novo operador "${userNameInput}" cadastrado com sucesso!`);
    }

    setIsAddingUser(false);
    setEditingUserId(null);
    setUserNameInput('');
    setUserEmailInput('');
    setUserPasswordInput('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEditUser = (user: SystemUser) => {
    const isCarlosMaster = user.id === 'usr-carlos-miguel-master' || user.name === 'Carlos Miguel Vieira' || (user.email || '').toLowerCase() === 'carlosmiguelvieira1@gmail.com';
    const safeEmail = isCarlosMaster ? 'contato@verticeanalises.com.br' : user.email;
    setEditingUserId(user.id);
    setUserNameInput(user.name);
    setUserEmailInput(safeEmail);
    setUserRoleInput(user.role);
    setUserDepartmentInput(user.department || 'Fiscal / Contábil');
    setUserPermissionsInput(user.permissions);
    setIsAddingUser(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Deseja realmente remover o acesso deste operador?')) {
      setSystemUsers(prev => prev.filter(u => u.id !== userId));
      setSuccessMessage('Acesso do operador revogado com sucesso.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // HANDLER: UPGRADE / CHANGE PLAN WITH PRO-RATA
  const handleApplyCustomPlan = (config: any) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Atualiza ou cria assinatura do cliente
    setSubscriptions(prev => {
      const filtered = prev.filter(s => s.customerEmail.toLowerCase() !== (currentUser?.email || '').toLowerCase());
      const newSub: SoldSubscription = {
        id: `sub-${Date.now().toString().slice(-4)}`,
        customerName: currentUser?.name || 'Cliente',
        customerEmail: currentUser?.email || 'cliente@empresa.com.br',
        customerDocument: activeSubscription?.customerDocument || '00.000.000/0001-00',
        customerPhone: activeSubscription?.customerPhone || '(11) 99999-9999',
        companyName: currentUser?.companyName || 'Empresa Assinante',
        planId: 'custom_modular',
        planName: config.planName,
        periodicity: config.periodicity,
        preferredDueDay: config.preferredDueDay,
        pricePaid: config.pricePaid,
        originalPrice: config.originalPrice,
        discountAppliedPercent: config.discountAppliedPercent,
        billingMethod: 'pix',
        status: 'ativa',
        startDate: today,
        nextBillingDate: config.firstInvoiceDueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        loyaltyMonths: config.loyaltyMonths,
        terminationFinePercent: config.terminationFinePercent,
        usersCount: clientSubUsers.length || 1,
        maxUsersAllowed: config.usersCount,
        maxCompaniesAllowed: config.companiesCount,
        allowedModules: config.selectedModules,
        isProRataApplied: config.isProRataApplied,
        proRataAmount: config.proRataAmount,
        notes: `Plano customizado alterado pelo próprio cliente com pro-rata e vencimento dia ${config.preferredDueDay}.`
      };
      return [newSub, ...filtered];
    });

    onUpgradePlan('enterprise_escritorio');
    setSuccessMessage(`Plano atualizado com sucesso para "${config.planName}"! Suas cotas e módulos já foram liberados.`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // HANDLER: EXECUTE CANCELLATION WITH PRO-RATA & CDC
  const handleConfirmCancellation = (settlement: CancellationSettlementResult) => {
    if (!activeSubscription) return;
    
    setSubscriptions(prev => prev.map(s => {
      if (s.id === activeSubscription.id) {
        return {
          ...s,
          status: 'cancelada',
          cancellationSettlement: {
            cancelDate: settlement.cancelDate,
            finalBalance: settlement.finalBalanceToPayOrRefund,
            penaltyFineAmount: settlement.penaltyFineAmount,
            proRataUsedAmount: settlement.amountUsedProRata,
            refundAmount: settlement.amountUnusedRefundable,
            summary: settlement.settlementSummary,
          }
        };
      }
      return s;
    }));

    setSuccessMessage('Solicitação de cancelamento processada com apuração de pro-rata registrada.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-4xl text-slate-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19] shrink-0">
          <div className="flex items-center gap-3">
            <div className="shrink-0 mr-1">
              <BrandLogo size="md" animate={true} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Painel do Assinante & Operadores
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {isMasterUser ? 'MASTER VIP' : 'CLIENTE ATIVO'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cadastro de operadores da empresa, gestão de acessos, alteração de plano sob medida e pro-rata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0B0F19]/80 px-4 sm:px-6 pt-2.5 gap-1.5 overflow-x-auto shrink-0">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode('profile');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  mode === 'profile'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Meu Perfil</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('security_settings');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  mode === 'security_settings'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Segurança & 2FA</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase ${
                  userSecMode === 'password_and_email_otp' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  userSecMode === 'digital_certificate' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {userSecMode === 'password_and_email_otp' ? '2FA Ativo' : userSecMode === 'digital_certificate' ? 'ICP-Brasil' : 'Senha'}
                </span>
              </button>

              {isAdminUser && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('sub_users');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    mode === 'sub_users'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Usuários da Empresa</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                    {clientSubUsers.length}/{maxAllowedUsers}
                  </span>
                </button>
              )}

              {isAdminUser && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('my_subscription');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    mode === 'my_subscription'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Minha Assinatura & Alteração</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode('change_password');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  mode === 'change_password'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Alterar Senha</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('reset_password_logged_in');
                  setForgotEmail(currentUser.email);
                  setForgotNewPassword('');
                  setForgotConfirmPassword('');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  mode === 'reset_password_logged_in'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Resetar Senha</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('inbox');
                  setAllSentEmails(AuthService.getSentEmails());
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  mode === 'inbox'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 text-cyan-400" />
                <span>E-mails do Sistema</span>
                {allSentEmails.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    {allSentEmails.length}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  mode === 'login' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Login de Acesso</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  mode === 'register' || mode === 'register_sent' || mode === 'confirm_register'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  mode === 'forgot' || mode === 'forgot_sent' || mode === 'confirm_reset'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Recuperar Senha</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('inbox');
                  setAllSentEmails(AuthService.getSentEmails());
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  mode === 'inbox' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 text-cyan-400" />
                <span>E-mails do Sistema</span>
                {allSentEmails.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    {allSentEmails.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Feedback Alert Banners */}
        <div className="px-6 pt-3 shrink-0">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">

          {/* TAB 1: MEU PERFIL */}
          {mode === 'profile' && currentUser && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                      currentUser.role === 'master'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                        {currentUser.name}
                        {currentUser.role === 'master' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            👑 Master / Proprietário
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                            Contador / Titular da Assinatura
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {currentUser.email} • {currentUser.companyName || 'Empresa Assinante'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      AuthService.logout();
                      onLogout();
                      onClose();
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/60 transition cursor-pointer flex items-center gap-1.5 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Plano Ativo</span>
                    <span className="font-bold text-amber-300 text-xs">
                      {currentUser.role === 'parceiro_negocios' ? 'Parceiro Isento (R$ 0,00)' : activeSubscription?.planName || 'Profissional Tributário'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Operadores Cadastrados</span>
                    <span className="font-bold text-blue-300 text-xs font-mono">
                      {clientSubUsers.length} de {maxAllowedUsers} vagas liberadas
                    </span>
                  </div>
                  <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Dia de Vencimento</span>
                    <span className="font-bold text-emerald-300 text-xs font-mono">
                      {currentUser.role === 'parceiro_negocios' ? 'Isento de Mensalidade' : `Dia ${activeSubscription?.preferredDueDay || 10} de cada ciclo`}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD EXCLUSIVO DE PARCEIRO DE NEGÓCIOS */}
              {(currentUser.role === 'parceiro_negocios' || currentUser.partnerReferralCode || isMasterUser) && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-blue-950/30 to-slate-900 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-slate-100 text-xs">
                        Programa de Parceiro de Negócios • Vértice Auditor Fiscal
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        Isenção 100%
                      </span>
                    </div>

                    {onOpenPartnerPortal && (
                      <button
                        onClick={onOpenPartnerPortal}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <Percent className="w-3.5 h-3.5" />
                        <span>Abrir Portal do Parceiro</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Seu Código de Indicação:</span>
                      <span className="font-bold text-amber-300 font-mono text-xs">
                        {currentUser.partnerReferralCode || 'VERTICE-ALIANCA10'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Desconto Concedido:</span>
                      <span className="font-bold text-emerald-300 font-mono text-xs">
                        {currentUser.partnerDiscountPercent ?? 10}% aos clientes
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Teto de Comissão:</span>
                      <span className="font-bold text-blue-300 font-mono text-xs">
                        Até 35% (Plano Master)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS DE SEGURANÇA & 2FA NO PERFIL */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    (currentUser.authSecurityMode || 'password_only') === 'password_and_email_otp' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    (currentUser.authSecurityMode || 'password_only') === 'digital_certificate' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {(currentUser.authSecurityMode || 'password_only') === 'digital_certificate' ? <Fingerprint className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>Método de Autenticação Ativo:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (currentUser.authSecurityMode || 'password_only') === 'password_and_email_otp' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        (currentUser.authSecurityMode || 'password_only') === 'digital_certificate' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {(currentUser.authSecurityMode || 'password_only') === 'password_and_email_otp' ? '🛡️ Senha + Código por E-mail (2FA Ativo)' :
                         (currentUser.authSecurityMode || 'password_only') === 'digital_certificate' ? '🏛️ Certificado Digital ICP-Brasil' :
                         '🔑 Apenas Senha'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {(currentUser.authSecurityMode || 'password_only') === 'password_and_email_otp' ? 'Protegido por verificação em duas etapas via código OTP de 6 dígitos enviado ao seu e-mail cadastrado.' :
                       (currentUser.authSecurityMode || 'password_only') === 'digital_certificate' ? `Vinculado a: ${currentUser.digitalCertificate?.subjectCommonName || 'Certificado Digital ICP-Brasil'}.` :
                       'Você pode elevar a proteção da sua conta ativando a validação em 2 etapas por e-mail ou Certificado Digital.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode('security_settings');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Configurar 2FA / Certificado</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB DE CONFIGURAÇÃO DE SEGURANÇA & 2FA */}
          {mode === 'security_settings' && currentUser && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-[#0B0F19] rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Etapa de Segurança & Validação em 2 Etapas (2FA)</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Defina como deseja realizar a autenticação e login no sistema Vértice Auditor Fiscal. Você pode alterar essa escolha a qualquer momento.
                </p>
              </div>

              {/* 3 Opções de Segurança */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Opção 1: Senha + Código por E-mail (2FA) */}
                <div
                  onClick={() => setUserSecMode('password_and_email_otp')}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between relative ${
                    userSecMode === 'password_and_email_otp'
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/20'
                      : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        ⭐ Recomendado
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">Senha + Código por E-mail</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Validação em 2 etapas: digite sua senha e valide com código numérico de 6 dígitos enviado instantaneamente ao seu e-mail cadastrado ({currentUser.email}).
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                    <span>{userSecMode === 'password_and_email_otp' ? '✓ Selecionado' : 'Selecionar este modo'}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${userSecMode === 'password_and_email_otp' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-700'}`}>
                      {userSecMode === 'password_and_email_otp' && <Check className="w-3 h-3 text-black" />}
                    </div>
                  </div>
                </div>

                {/* Opção 2: Apenas com Senha */}
                <div
                  onClick={() => setUserSecMode('password_only')}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between relative ${
                    userSecMode === 'password_only'
                      ? 'bg-blue-950/30 border-blue-500 shadow-lg shadow-blue-950/20'
                      : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <Lock className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                        Padrão
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">Apenas com Senha</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Acesso direto com e-mail e senha cadastrada. Prático e rápido, recomendado para acessos em terminais individuais seguros.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-400">
                    <span>{userSecMode === 'password_only' ? '✓ Selecionado' : 'Selecionar este modo'}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${userSecMode === 'password_only' ? 'border-blue-400 bg-blue-500' : 'border-slate-700'}`}>
                      {userSecMode === 'password_only' && <Check className="w-3 h-3 text-black" />}
                    </div>
                  </div>
                </div>

                {/* Opção 3: Certificado Digital ICP-Brasil */}
                <div
                  onClick={() => setUserSecMode('digital_certificate')}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between relative ${
                    userSecMode === 'digital_certificate'
                      ? 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-950/20'
                      : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                        <Fingerprint className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        e-CNPJ / e-CPF
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">Com Certificado Digital</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Autenticação criptográfica de alta segurança ICP-Brasil A1 / A3. Faça login direto sem precisar digitar senha.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-cyan-400">
                    <span>{userSecMode === 'digital_certificate' ? '✓ Selecionado' : 'Selecionar este modo'}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${userSecMode === 'digital_certificate' ? 'border-cyan-400 bg-cyan-500' : 'border-slate-700'}`}>
                      {userSecMode === 'digital_certificate' && <Check className="w-3 h-3 text-black" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalhes de Configuração para Certificado Digital */}
              {userSecMode === 'digital_certificate' && (
                <div className="p-4 bg-[#0B0F19] rounded-2xl border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-cyan-400" />
                      <span>Selecione o Certificado Digital ICP-Brasil para vincular à sua conta:</span>
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {availableCertsList.length} detectados no repositório
                    </span>
                  </div>

                  <div className="space-y-2">
                    {availableCertsList.map(cert => {
                      const isSelected = userSecCert?.serialNumber === cert.serialNumber;
                      return (
                        <div
                          key={cert.serialNumber}
                          onClick={() => setUserSecCert(cert)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-400 text-white'
                              : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-cyan-400'}`}>
                              <Fingerprint className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-xs flex items-center gap-2">
                                <span>{cert.subjectCommonName}</span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300 font-mono">
                                  {cert.type}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {cert.documentNumber} • Emissor: {cert.issuer} • Válido até {cert.validUntil}
                              </div>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-500 text-black' : 'border-slate-700'}`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botões de Ação e Teste */}
              <div className="p-4 bg-[#0B0F19] rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const req = AuthService.request2FACode(currentUser.email, currentUser.name);
                      if (req.success) {
                        setAllSentEmails(AuthService.getSentEmails());
                        setSuccessMessage(`Código 2FA de teste disparado com sucesso para ${currentUser.email}! Verifique a aba "E-mails do Sistema".`);
                        setTimeout(() => setSuccessMessage(''), 5000);
                      } else {
                        setErrorMessage(req.error || 'Erro ao disparar código de teste.');
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Testar Disparo de Código 2FA por E-mail</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const res = AuthService.updateAccountSecurity(
                        currentUser.id,
                        userSecMode,
                        userSecMode === 'digital_certificate' ? userSecCert : undefined
                      );
                      if (res.success && res.user) {
                        onLogin(res.user);
                        setSuccessMessage(`Preferência de segurança salva com sucesso! Modo ativo: ${
                          userSecMode === 'password_and_email_otp' ? 'Senha + Código 2FA por E-mail' :
                          userSecMode === 'digital_certificate' ? 'Certificado Digital ICP-Brasil' :
                          'Apenas Senha'
                        }.`);
                        setTimeout(() => setSuccessMessage(''), 4000);
                      } else {
                        setErrorMessage(res.error || 'Erro ao salvar preferências de segurança.');
                      }
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Configuração de Segurança</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CADASTRO E GESTÃO DE USUÁRIOS DA EMPRESA (ACTIVE CLIENT REQUIREMENT) */}
          {mode === 'sub_users' && currentUser && (
            <div className="space-y-4">
              
              {/* Header com Contador e Botão de Novo Usuário */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#0B0F19] rounded-2xl border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-white text-sm">Operadores da Sua Empresa</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cadastre os membros da sua equipe contábil ou clientes com perfis de permissão customizados
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-blue-400 font-mono block">
                      {clientSubUsers.length} / {maxAllowedUsers} vagas
                    </span>
                    <span className="text-[10px] text-slate-400">Capacidade do plano</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (clientSubUsers.length >= maxAllowedUsers && !isMasterUser) {
                        setErrorMessage(`Limite de ${maxAllowedUsers} usuários atingido. Altere seu plano para liberar mais operadores.`);
                        return;
                      }
                      setEditingUserId(null);
                      setUserNameInput('');
                      setUserEmailInput('');
                      setUserPasswordInput('');
                      setIsAddingUser(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Novo Operador</span>
                  </button>
                </div>
              </div>

              {/* Form de Cadastro / Edição de Usuário */}
              {isAddingUser && (
                <form onSubmit={handleSaveSubUser} className="p-4 bg-[#0B0F19] rounded-2xl border border-blue-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{editingUserId ? 'Editar Operador' : 'Novo Cadastro de Operador'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={userNameInput}
                        onChange={e => setUserNameInput(e.target.value)}
                        placeholder="Ex: Dra. Mariana Costa"
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">E-mail de Login</label>
                      <input
                        type="email"
                        value={userEmailInput}
                        onChange={e => setUserEmailInput(e.target.value)}
                        placeholder="mariana@empresa.com.br"
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        {editingUserId ? 'Nova Senha (opcional)' : 'Senha Inicial'}
                      </label>
                      <input
                        type="password"
                        value={userPasswordInput}
                        onChange={e => setUserPasswordInput(e.target.value)}
                        placeholder="Mínimo 6 dígitos"
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                        required={!editingUserId}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Perfil de Operação</label>
                      <select
                        value={userRoleInput}
                        onChange={e => setUserRoleInput(e.target.value as any)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="contador_senior">Contador Sênior (Acesso Completo às Simulações)</option>
                        <option value="auditor_fiscal">Auditor Fiscal (Pareceres e Inteligência Tributária)</option>
                        <option value="assistente_fiscal">Assistente Fiscal (Operacional e Digitação)</option>
                        <option value="parceiro_negocios">⭐ Parceiro de Negócios (Isenção 100% & Comissões)</option>
                        <option value="cliente_leitor">Cliente Decisor / Leitor (Apenas Consulta e Relatórios)</option>
                        {isMasterUser && <option value="master">Master VIP Administrador</option>}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Departamento / Cargo</label>
                      <input
                        type="text"
                        value={userDepartmentInput}
                        onChange={e => setUserDepartmentInput(e.target.value)}
                        placeholder="Ex: Consultoria Tributária / BPO"
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Matriz de Permissões */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="text-slate-300 font-semibold block mb-1.5">Permissões de Acesso</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <label className="flex items-center gap-2 p-2 bg-[#0F172A] rounded border border-slate-800 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPermissionsInput.canSimulateRegimes}
                          onChange={e => setUserPermissionsInput(prev => ({ ...prev, canSimulateRegimes: e.target.checked }))}
                          className="rounded accent-blue-500"
                        />
                        <span>Simular Regimes</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-[#0F172A] rounded border border-slate-800 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPermissionsInput.canExportReports}
                          onChange={e => setUserPermissionsInput(prev => ({ ...prev, canExportReports: e.target.checked }))}
                          className="rounded accent-blue-500"
                        />
                        <span>Emitir Pareceres</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-[#0F172A] rounded border border-slate-800 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPermissionsInput.canAccessAIAuditor}
                          onChange={e => setUserPermissionsInput(prev => ({ ...prev, canAccessAIAuditor: e.target.checked }))}
                          className="rounded accent-blue-500"
                        />
                        <span>Auditor IA</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-[#0F172A] rounded border border-slate-800 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPermissionsInput.canAccessTaxReform}
                          onChange={e => setUserPermissionsInput(prev => ({ ...prev, canAccessTaxReform: e.target.checked }))}
                          className="rounded accent-blue-500"
                        />
                        <span>Reforma 2026-33</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-xs"
                    >
                      {editingUserId ? 'Salvar Alterações' : 'Cadastrar Operador'}
                    </button>
                  </div>
                </form>
              )}

              {/* Lista dos Usuários Cadastrados */}
              <div className="space-y-2">
                {clientSubUsers.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-[#0B0F19] rounded-xl border border-slate-800">
                    Nenhum operador cadastrado ainda. Clique em "Cadastrar Novo Operador" para liberar acessos à sua equipe.
                  </div>
                ) : (
                  clientSubUsers.map(user => (
                    <div
                      key={user.id}
                      className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-2">
                            {user.name}
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                              {user.department || 'Operador'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {user.email} • Cadastro: {user.createdAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                          title="Editar permissões"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 cursor-pointer"
                          title="Remover acesso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 3: MINHA ASSINATURA & ALTERAÇÃO DE PLANO COM PRO-RATA */}
          {mode === 'my_subscription' && currentUser && (
            <div className="space-y-4">
              
              {/* Card da Assinatura Atual */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/30 to-indigo-950/20 border border-blue-800/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800/30 pb-3">
                  <div>
                    <span className="text-[11px] text-blue-300 font-bold uppercase tracking-wider block">
                      Assinatura Ativa
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                      {activeSubscription?.planName || 'Plano Profissional Tributário'}
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        {activeSubscription?.status === 'ativa' ? '✓ Em Dia' : 'Ativo'}
                      </span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-amber-300 font-mono block">
                      R$ {(activeSubscription?.pricePaid || 397).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Ciclo {activeSubscription?.periodicity || 'mensal'} • Vencimento todo dia {activeSubscription?.preferredDueDay || 10}
                    </span>
                  </div>
                </div>

                {/* Métricas e Prazos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Operadores Liberados</span>
                    <span className="font-bold text-white text-xs font-mono">
                      {clientSubUsers.length} / {maxAllowedUsers} vagas
                    </span>
                  </div>

                  <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">CNPJs na Base</span>
                    <span className="font-bold text-white text-xs font-mono">
                      {activeSubscription?.maxCompaniesAllowed || 30} empresas
                    </span>
                  </div>

                  <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Próximo Vencimento</span>
                    <span className="font-bold text-emerald-400 text-xs font-mono">
                      {activeSubscription?.nextBillingDate?.split('-').reverse().join('/') || '10/10/2026'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Fidelidade Contratual</span>
                    <span className="font-bold text-blue-300 text-xs">
                      {activeSubscription?.loyaltyMonths ? `${activeSubscription.loyaltyMonths} meses` : 'Sem fidelidade'}
                    </span>
                  </div>
                </div>

                {/* Ações: Alteração Sob Medida & Rescisão */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-blue-800/30">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Solicitar Rescisão / Cancelamento (Pro-rata)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomPlanModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Personalizar / Alterar Plano Sob Medida</span>
                  </button>
                </div>
              </div>

              {/* Tabela Comparativa de Planos Padronizados */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs">Outras Opções de Planos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLATFORM_PLANS.filter(p => p.id !== 'custom_modular').map(p => (
                    <div key={p.id} className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">{p.name}</span>
                          <span className="text-[10px] text-amber-400 font-mono font-bold">R$ {p.priceMonthly}/mês</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{p.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onUpgradePlan(p.id as any);
                          setSuccessMessage(`Plano alterado para ${p.name}!`);
                          setTimeout(() => setSuccessMessage(''), 3000);
                        }}
                        className="mt-3 w-full py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs rounded-lg border border-blue-500/40 transition cursor-pointer"
                      >
                        Mudar para {p.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ALTERAR SENHA */}
          {mode === 'change_password' && currentUser && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Senha Atual</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showChangePassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite a senha atual"
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showChangePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nova Senha (Mín. 6 chars)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showChangePassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova senha segura"
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showChangePassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: RESET DE SENHA LOGGED IN */}
          {mode === 'reset_password_logged_in' && currentUser && (
            <form onSubmit={(e) => {
              e.preventDefault();
              setErrorMessage('');
              setSuccessMessage('');

              if (!forgotNewPassword || forgotNewPassword.length < 6) {
                setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
                return;
              }
              if (forgotNewPassword !== forgotConfirmPassword) {
                setErrorMessage('A confirmação da nova senha não coincide.');
                return;
              }

              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                const res = AuthService.resetPassword(currentUser.email, forgotNewPassword);
                if (!res.success) {
                  setErrorMessage(res.error || 'Erro ao redefinir senha.');
                  return;
                }

                setSuccessMessage('Senha redefinida com sucesso!');
                setForgotNewPassword('');
                setForgotConfirmPassword('');
                setTimeout(() => {
                  setSuccessMessage('');
                  setMode('profile');
                }, 1600);
              }, 350);
            }} className="space-y-4">
              <div className="p-3 bg-blue-950/30 border border-blue-800/60 rounded-xl text-xs text-blue-300">
                <span className="font-bold block">Reset de Senha do Cliente</span>
                <p className="text-blue-300/80">Redefina a senha de acesso da sua conta diretamente.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nova Senha</label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Mín. 6 dígitos"
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Redefinindo...' : 'Confirmar e Resetar Senha'}
                </button>
              </div>
            </form>
          )}

          {/* TAB: LOGIN (WHEN LOGGED OUT) */}
          {mode === 'login' && !currentUser && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Profissional</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@empresa.com.br"
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(loginEmail);
                    setMode('forgot');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition cursor-pointer"
                >
                  Esqueceu sua senha? Recuperar por e-mail
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>
                  Não possui conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-white font-bold hover:underline cursor-pointer"
                  >
                    Cadastre-se na plataforma
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* TAB: REGISTER (WHEN LOGGED OUT) */}
          {mode === 'register' && !currentUser && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Dr. Carlos Miguel"
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="email@empresa.com.br"
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Seleção do Perfil de Acesso */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Perfil de Acesso Desejado</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('contador_senior')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      regRole === 'contador_senior'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Auditor / Contador</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Operação técnica contábil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('cliente_leitor')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      regRole === 'cliente_leitor'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Empresário / Diretor</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Visão executiva e laudos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('parceiro_negocios')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      regRole === 'parceiro_negocios'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Parceiro de Negócios</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">R$ 0</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Isento • Até 35% comissão</span>
                  </button>
                </div>
              </div>

              {/* CAMPOS ESPECÍFICOS PARA PARCEIRO DE NEGÓCIOS */}
              {regRole === 'parceiro_negocios' ? (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-blue-950/30 to-slate-900 border border-amber-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-amber-300 block">Vantagens do Perfil Parceiro de Negócios</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        • <strong>Sem custo de assinatura:</strong> Isenção total da mensalidade da plataforma.<br />
                        • <strong>Comissões de até 35%:</strong> Ganho recorrente sobre todos os clientes indicados.<br />
                        • <strong>Desconto concedido:</strong> Você define o desconto que seu cliente recebe, o qual é deduzido da sua comissão.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-200 mb-1">
                        Código de Indicação Desejado
                      </label>
                      <input
                        type="text"
                        value={regReferralCodeInput}
                        onChange={(e) => setRegReferralCodeInput(e.target.value.toUpperCase())}
                        placeholder="Ex: VERTICE-PARCEIRO10"
                        className="w-full bg-[#0B0F19] border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400 uppercase tracking-wider"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">Se vazio, um código único será gerado automaticamente.</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-amber-200">
                          Desconto ao Cliente Indicado
                        </label>
                        <span className="font-bold text-amber-300 text-xs font-mono">{regPartnerDiscountInput}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        step="1"
                        value={regPartnerDiscountInput}
                        onChange={(e) => setRegPartnerDiscountInput(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Esse desconto será deduzido da sua comissão paga pela plataforma.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* CAMPO DE CÓDIGO DE INDICAÇÃO PARA CLIENTES NORMAIS */
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-blue-400" />
                      <span>Código de Indicação do Parceiro (Opcional)</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Ganhe desconto na assinatura</span>
                  </div>

                  <input
                    type="text"
                    value={regReferralCodeInput}
                    onChange={(e) => setRegReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: VERTICE-ALIANCA10"
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono uppercase tracking-wider focus:outline-none focus:border-blue-500"
                  />

                  {referralValidation && referralValidation.valid ? (
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-[11px] flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <strong>Código Válido!</strong> Desconto de <span className="font-bold text-emerald-200">{referralValidation.discountPercent}%</span> concedido pelo parceiro <span className="font-bold text-white">{referralValidation.partner?.name}</span>.
                      </div>
                    </div>
                  ) : regReferralCodeInput && referralValidation && !referralValidation.valid ? (
                    <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px] flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{referralValidation.message || 'Código de parceiro não encontrado ou inválido.'}</span>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Senha (Mín. 6)</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Senha"
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Senha</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  ← Já possui conta? Fazer login
                </button>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleRequestRegistrationSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    title="Envia um link oficial de validação e ativação por e-mail"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Enviar Link por E-mail</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Cadastrando...' : 'Criar Conta Imediata'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB: FORGOT PASSWORD REQUEST (WHEN LOGGED OUT) */}
          {mode === 'forgot' && !currentUser && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 via-[#0B0F19] to-slate-900 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Recuperação Segura de Senha</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Informe o e-mail cadastrado na plataforma. Nós geraremos um link exclusivo com validade de 30 minutos para você redefinir sua senha com segurança.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seu.email@empresa.com.br"
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  ← Voltar para o Login
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isLoading ? 'Disparando...' : 'Enviar Link de Redefinição'}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('inbox');
                    setAllSentEmails(AuthService.getSentEmails());
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Acessar Caixa de Entrada do Sistema ({allSentEmails.length})</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: FORGOT SENT CONFIRMATION (WHEN LOGGED OUT) */}
          {mode === 'forgot_sent' && !currentUser && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">E-mail de Recuperação Disparado!</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Um link seguro de redefinição com validade de 30 minutos foi gerado para <strong>{lastSentEmail?.toEmail || forgotEmail}</strong>.
                  </p>
                </div>
              </div>

              {/* Detalhes do E-mail e Link Rápido */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Destinatário:</span>
                  <span className="font-mono text-slate-200 font-bold">{lastSentEmail?.toEmail || forgotEmail}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Validade do Token:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono font-bold">30 Minutos</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Link de Segurança Direto:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={lastSentEmail?.linkUrl || (typeof window !== 'undefined' ? `${window.location.origin}/#action=reset-password&token=${activeResetToken}` : '')}
                      className="w-full bg-[#080B12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyText(lastSentEmail?.linkUrl || (typeof window !== 'undefined' ? `${window.location.origin}/#action=reset-password&token=${activeResetToken}` : ''))}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeResetToken) {
                      const check = AuthService.getPendingPasswordReset(activeResetToken);
                      if (check.pending) {
                        setPendingResetData(check.pending);
                        setMode('confirm_reset');
                        setErrorMessage('');
                        return;
                      }
                    }
                    setMode('confirm_reset');
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Abrir Link e Redefinir Senha Agora</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('inbox');
                    setAllSentEmails(AuthService.getSentEmails());
                  }}
                  className="px-4 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Ver na Caixa de Entrada</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Voltar para o Login
                </button>
              </div>
            </div>
          )}

          {/* TAB: CONFIRM RESET PASSWORD WITH TOKEN (WHEN LOGGED OUT) */}
          {mode === 'confirm_reset' && !currentUser && (
            <form onSubmit={handleConfirmResetSubmit} className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/30 via-[#0B0F19] to-slate-900 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Criar Nova Senha de Acesso</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Redefinição de credenciais para a conta <strong>{pendingResetData?.email || forgotEmail || 'autenticada'}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nova Senha (Mín. 6)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={resetSetPassword}
                      onChange={(e) => setResetSetPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={resetSetConfirmPassword}
                      onChange={(e) => setResetSetConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Cancelar e ir ao Login
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isLoading ? 'Salvando...' : 'Salvar Nova Senha & Entrar'}
                </button>
              </div>
            </form>
          )}

          {/* TAB: REGISTER SENT CONFIRMATION (WHEN LOGGED OUT) */}
          {mode === 'register_sent' && !currentUser && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 text-blue-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Confirmação de Cadastro Disparada!</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Enviamos um e-mail com o link de ativação e criação de senha para <strong>{lastSentEmail?.toEmail || regEmail}</strong>.
                  </p>
                </div>
              </div>

              {/* Detalhes da Solicitação */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Titular:</span>
                  <span className="font-bold text-white">{pendingRegData?.name || regName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">E-mail:</span>
                  <span className="font-mono text-slate-200 font-bold">{lastSentEmail?.toEmail || regEmail}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Validade do Token:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-mono font-bold">30 Minutos</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Link de Ativação:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={lastSentEmail?.linkUrl || (typeof window !== 'undefined' ? `${window.location.origin}/#action=set-password&token=${activeRegToken}` : '')}
                      className="w-full bg-[#080B12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyText(lastSentEmail?.linkUrl || (typeof window !== 'undefined' ? `${window.location.origin}/#action=set-password&token=${activeRegToken}` : ''))}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeRegToken) {
                      const check = AuthService.getPendingRegistration(activeRegToken);
                      if (check.pending) {
                        setPendingRegData(check.pending);
                        setMode('confirm_register');
                        setErrorMessage('');
                        return;
                      }
                    }
                    setMode('confirm_register');
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Ativar Conta e Definir Senha Agora</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('inbox');
                    setAllSentEmails(AuthService.getSentEmails());
                  }}
                  className="px-4 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Ver na Caixa de Entrada</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Voltar para o Login
                </button>
              </div>
            </div>
          )}

          {/* TAB: CONFIRM REGISTRATION & SET PASSWORD (WHEN LOGGED OUT) */}
          {mode === 'confirm_register' && !currentUser && (
            <form onSubmit={handleConfirmRegisterSubmit} className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 via-[#0B0F19] to-slate-900 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ativação de Conta & Criação de Senha</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Olá, <strong>{pendingRegData?.name || 'Profissional'}</strong>! Para finalizar a ativação da sua conta (<strong>{pendingRegData?.email}</strong>), crie sua senha de acesso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Criar Senha de Acesso (Mín. 6)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={regSetPassword}
                      onChange={(e) => setRegSetPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={regSetConfirmPassword}
                      onChange={(e) => setRegSetConfirmPassword(e.target.value)}
                      placeholder="Repita sua senha"
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isLoading ? 'Ativando...' : 'Ativar Conta & Iniciar Sessão'}
                </button>
              </div>
            </form>
          )}

          {/* TAB: SYSTEM EMAIL SIMULATOR / INBOX (ACCESSIBLE TO ALL) */}
          {mode === 'inbox' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#0B0F19] to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Caixa de Entrada / Simulador de E-mails</h4>
                    <p className="text-[11px] text-slate-400">
                      Notificações e links de autenticação disparados pelo sistema para testes e validação.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      AuthService.clearSentEmails();
                      setAllSentEmails([]);
                    }}
                    className="px-2.5 py-1 text-[10px] text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
                    title="Limpar histórico de e-mails"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAllSentEmails(AuthService.getSentEmails());
                    }}
                    className="px-2.5 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>

              {allSentEmails.length === 0 ? (
                <div className="p-10 text-center rounded-xl bg-[#0B0F19] border border-slate-800/80 space-y-2">
                  <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">Nenhum e-mail disparado recentemente</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Solicite uma confirmação de cadastro ou recuperação de senha para testar os links automáticos nesta caixa.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allSentEmails.map((item) => {
                    const isReg = item.type === 'registration_confirmation';
                    const isExpired = new Date(item.expiresAt).getTime() < Date.now();
                    const emailBodyText = isReg
                      ? `Olá, ${item.toName || 'Profissional'}!\n\nSua solicitação de cadastro na plataforma VÉRTICE AUDITOR FISCAL foi registrada com sucesso. Para concluir o processo e definir sua senha de acesso exclusiva, utilize o link de ativação abaixo.\n\nPor razões de segurança, este link de validação expira em 30 minutos.`
                      : `Olá, ${item.toName || 'Usuário'}!\n\nRecebemos uma solicitação de redefinição de senha para sua conta (${item.toEmail}). Para definir uma nova senha com segurança, utilize o link de recuperação abaixo.\n\nEste link é válido por 30 minutos a partir do envio.`;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition ${
                          !item.read
                            ? 'bg-[#0E1526] border-cyan-500/40 shadow-sm'
                            : 'bg-[#0B0F19] border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                                isReg
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {isReg ? 'Confirmação de Cadastro' : 'Redefinição de Senha'}
                            </span>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title="Novo E-mail" />
                            )}
                            {isExpired ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">Expirado</span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Válido</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(item.createdAt).toLocaleTimeString('pt-BR')} • {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>

                        <div className="py-2.5 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 font-medium">Para:</span>
                            <span className="text-slate-200 font-bold">{item.toName || 'Usuário'}</span>
                            <span className="text-slate-400 font-mono text-[11px]">&lt;{item.toEmail}&gt;</span>
                          </div>
                          <div className="text-xs font-bold text-white">{item.subject}</div>
                          <div className="p-3 rounded-lg bg-[#070A10] border border-slate-800/80 text-[11px] text-slate-300 whitespace-pre-line font-sans leading-relaxed">
                            {emailBodyText}
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyText(item.linkUrl)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                            >
                              {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>Copiar Link</span>
                            </button>
                            <span className="text-[10px] font-mono text-slate-500">Token: {item.token.slice(0, 8)}...</span>
                          </div>

                          <button
                            type="button"
                            disabled={isExpired}
                            onClick={() => handleOpenEmailAction(item)}
                            className={`px-4 py-1.5 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                              isReg
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-amber-600 hover:bg-amber-500 text-white'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{isReg ? 'Ativar Conta & Criar Senha' : 'Redefinir Senha Agora'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modal Custom Plan Builder (For Active Client) */}
      <CustomPlanBuilderModal
        isOpen={isCustomPlanModalOpen}
        onClose={() => setIsCustomPlanModalOpen(false)}
        isClientSelfService={true}
        initialValues={{
          usersCount: activeSubscription?.maxUsersAllowed || 3,
          companiesCount: activeSubscription?.maxCompaniesAllowed || 10,
          periodicity: activeSubscription?.periodicity || 'mensal',
          preferredDueDay: activeSubscription?.preferredDueDay || 10,
        }}
        onSavePlan={handleApplyCustomPlan}
      />

      {/* Modal Cancellation Settlement (Pro-rata & CDC) */}
      <CancellationSettlementModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        subscription={activeSubscription}
        onConfirmCancellation={handleConfirmCancellation}
      />

    </div>
  );
};
