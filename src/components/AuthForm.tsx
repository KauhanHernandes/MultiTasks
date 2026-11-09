import React, { useState, useEffect, useRef } from 'react';
import {
  Lock, Mail, Eye, EyeOff, ShoppingCart, ArrowRight,
  UserPlus, LogIn, Info, Package, Home, Calendar,
  CheckCircle, TrendingUp, Tag, ChevronRight, Sparkles,
  Shield, Zap,
} from 'lucide-react';

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

type Tab = 'login' | 'signup' | 'about';

// ─── Feature data ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: ShoppingCart,
    color: 'blue' as const,
    label: 'Lista com Preços',
    desc: 'Adicione produtos com preço e quantidade por categoria. Defina orçamento mensal e exporte relatório em PDF.',
    gradient: 'from-blue-600 to-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: Tag,
    color: 'violet' as const,
    label: 'Lista Simples',
    desc: 'Lista rápida sem preços para anotar o que precisa comprar, organizada por categorias.',
    gradient: 'from-violet-600 to-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/20',
  },
  {
    icon: Package,
    color: 'emerald' as const,
    label: 'Inventário de Casa',
    desc: 'Registre o estoque em casa com quantidade e validade. Alertas visuais para produtos prestes a vencer.',
    gradient: 'from-emerald-600 to-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: Home,
    color: 'violet' as const,
    label: 'Tarefas de Casa',
    desc: 'Organize tarefas domésticas do mês, marque como concluídas e acompanhe o progresso visualmente.',
    gradient: 'from-fuchsia-600 to-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
    text: 'text-fuchsia-400',
    glow: 'shadow-fuchsia-500/20',
  },
  {
    icon: Calendar,
    color: 'amber' as const,
    label: 'Histórico por Mês',
    desc: 'Listas independentes por mês. Navegue entre períodos para comparar gastos e planejar o futuro.',
    gradient: 'from-amber-600 to-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
  },
];

const categories = [
  'Alimentação', 'Higiene Pessoal', 'Prod. de Limpeza',
  'Bebidas', 'Carnes / Frios', 'Padaria / Grãos',
  'Frutas e Verduras', 'Farmácia', 'Utilidades', 'Outros',
];

const badges = [
  { icon: Shield, text: 'Dados seguros', sub: 'via Supabase', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Zap, text: 'Gratuito', sub: '100% free', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: TrendingUp, text: 'Multi-mês', sub: 'com histórico', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
];

// ─── Animation Styles (injected once) ─────────────────────────────────────────
const animationStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.3); }
    50% { box-shadow: 0 0 40px rgba(96, 165, 250, 0.5); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(2deg); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-fade-in-down { animation: fadeInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-slide-in-right { animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-slide-in-left { animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
  .stagger-1 { animation-delay: 0.05s; }
  .stagger-2 { animation-delay: 0.1s; }
  .stagger-3 { animation-delay: 0.15s; }
  .stagger-4 { animation-delay: 0.2s; }
  .stagger-5 { animation-delay: 0.25s; }
  .stagger-6 { animation-delay: 0.3s; }
  .stagger-7 { animation-delay: 0.35s; }
  .stagger-8 { animation-delay: 0.4s; }
  .stagger-9 { animation-delay: 0.45s; }
  .stagger-10 { animation-delay: 0.5s; }
  .tab-enter { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1), slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  .tab-exit { animation: fadeInDown 0.3s cubic-bezier(0.4, 0, 1, 1) reverse, slideInLeft 0.3s cubic-bezier(0.4, 0, 1, 1) reverse; }
`;

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById('auth-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'auth-animations';
  styleSheet.textContent = animationStyles;
  document.head.appendChild(styleSheet);
}

// ─── About Content ────────────────────────────────────────────────────────────
const AboutContent: React.FC = () => (
  <div className="space-y-6 animate-fade-in-up">

    {/* Hero tagline */}
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/60 via-gray-900/80 to-violet-950/40 p-5 text-center animate-float">
      <div className="pointer-events-none absolute -top-6 -left-6 w-24 h-24 rounded-full bg-blue-500/20 blur-2xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-violet-500/20 blur-2xl animate-pulse-glow" style={{animationDelay: '1.5s'}} />

      <div className="relative flex justify-center mb-3 animate-scale-in stagger-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-300 tracking-wide">
          <Sparkles className="w-3 h-3 animate-float" style={{animationDuration: '3s'}} />
          Tudo em um só lugar
        </span>
      </div>
      <p className="relative text-sm font-medium text-gray-200 leading-relaxed animate-fade-in-up stagger-2">
        Organize suas compras, controle o estoque em casa e gerencie tarefas domésticas —{' '}
        <span className="text-blue-400 font-semibold">sempre sincronizado</span>.
      </p>
    </div>

    {/* Features */}
    <div>
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 animate-fade-in-up">O que você pode fazer</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {features.map(({ icon: Icon, label, desc, gradient, bg, border, text, glow }, index) => (
          <div
            key={label}
            className={`group relative flex gap-3 rounded-xl border p-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${bg} ${border} shadow-lg ${glow} animate-fade-in-up`}
            style={{animationDelay: `${0.1 + index * 0.05}s`}}
          >
            <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} shadow-lg animate-scale-in`} style={{animationDelay: `${0.15 + index * 0.05}s`}}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${text}`}>{label}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Categories */}
    <div className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-4 animate-fade-in-up stagger-3">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Categorias disponíveis</p>
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat, index) => (
          <span
            key={cat}
            className="px-2.5 py-1 bg-gray-700/80 text-gray-300 text-[11px] rounded-lg font-medium border border-gray-600/40 transition-all duration-200 hover:bg-gray-700 hover:text-white hover:border-gray-500 hover:scale-105 animate-scale-in"
            style={{animationDelay: `${0.2 + index * 0.03}s`}}
          >
            {cat}
          </span>
        ))}
        <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-[11px] rounded-lg font-semibold border border-blue-500/30 flex items-center gap-1 animate-scale-in stagger-10">
          <span>+</span> Criar suas próprias
        </span>
      </div>
    </div>

    {/* Trust badges */}
    <div className="grid grid-cols-3 gap-2 animate-fade-in-up stagger-4">
      {badges.map(({ icon: Icon, text, sub, color, bg, border }, index) => (
        <div
          key={text}
          className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center ${bg} ${border} transition-all duration-300 hover:scale-105 hover:shadow-lg animate-scale-in`}
          style={{animationDelay: `${0.25 + index * 0.08}s`}}
        >
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${bg} border ${border} transition-all duration-300 group-hover:scale-110`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <p className="text-[11px] font-bold text-white leading-tight">{text}</p>
          <p className="text-[10px] text-gray-500">{sub}</p>
        </div>
      ))}
    </div>

    {/* Checklist footer */}
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 space-y-2 animate-fade-in-up stagger-5">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Por que usar?</p>
      {[
        'Funciona offline e sincroniza na nuvem',
        'Compartilhe listas com a família',
        'Sem anúncios, sem cobranças ocultas',
        'Exportação em PDF com um clique',
      ].map((item, index) => (
        <div key={item} className="flex items-center gap-2.5 animate-slide-in-right" style={{animationDelay: `${0.3 + index * 0.06}s`}}>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-scale-in" style={{animationDelay: `${0.35 + index * 0.06}s`}} />
          <span className="text-xs text-gray-300">{item}</span>
        </div>
      ))}
    </div>

  </div>
);

// ─── Tab Content Components ───────────────────────────────────────────────────
const LoginForm: React.FC<{ email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void; showPassword: boolean; setShowPassword: (v: boolean) => void; loading: boolean; error: string | null; validationError: string | null; onSubmit: (e: React.FormEvent) => void }> = ({
  email, setEmail, password, setPassword, showPassword, setShowPassword, loading, error, validationError, onSubmit
}) => (
  <form onSubmit={onSubmit} className="space-y-4 tab-enter" noValidate>
    <div className="space-y-1.5 animate-fade-in-up stagger-1">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors duration-200 group-focus-within:text-blue-400" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="seu@email.com"
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 text-sm transition-all duration-200 hover:border-gray-600"
        />
      </div>
    </div>

    <div className="space-y-1.5 animate-fade-in-up stagger-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Senha</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors duration-200 group-focus-within:text-blue-400" />
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full pl-10 pr-11 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 text-sm transition-all duration-200 hover:border-gray-600"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200"
          aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>

    {(error || validationError) && (
      <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in-up stagger-3 animate-shimmer">
        <p className="text-red-400 text-sm">{validationError || error}</p>
      </div>
    )}

    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 animate-scale-in stagger-4"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Entrando...
        </>
      ) : (
        <>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          Entrar
        </>
      )}
    </button>
  </form>
);

const SignupForm: React.FC<{ email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void; showPassword: boolean; setShowPassword: (v: boolean) => void; loading: boolean; error: string | null; validationError: string | null; onSubmit: (e: React.FormEvent) => void }> = ({
  email, setEmail, password, setPassword, showPassword, setShowPassword, loading, error, validationError, onSubmit
}) => (
  <form onSubmit={onSubmit} className="space-y-4 tab-enter" noValidate>
    <div className="space-y-1.5 animate-fade-in-up stagger-1">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors duration-200 group-focus-within:text-fuchsia-400" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="new-email"
          placeholder="seu@email.com"
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white placeholder-gray-600 text-sm transition-all duration-200 hover:border-gray-600"
        />
      </div>
    </div>

    <div className="space-y-1.5 animate-fade-in-up stagger-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Senha</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors duration-200 group-focus-within:text-fuchsia-400" />
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full pl-10 pr-11 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-white placeholder-gray-600 text-sm transition-all duration-200 hover:border-gray-600"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200"
          aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>

    {(error || validationError) && (
      <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in-up stagger-3 animate-shimmer">
        <p className="text-red-400 text-sm">{validationError || error}</p>
      </div>
    )}

    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-fuchsia-500 hover:bg-fuchsia-600 active:scale-[0.98] text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-fuchsia-500/30 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-gray-900 animate-scale-in stagger-4"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Criando conta...
        </>
      ) : (
        <>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          Criar Conta
        </>
      )}
    </button>
  </form>
);

// ─── AuthForm principal ───────────────────────────────────────────────────────
export const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onSignUp, loading, error }) => {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevTabRef = useRef<Tab>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === 'signup' && password.length < 6) {
      setValidationError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setValidationError(null);

    if (tab === 'login') await onLogin(email, password);
    else await onSignUp(email, password);
  };

  const switchTab = (newTab: Tab) => {
    if (newTab === tab || isTransitioning) return;

    setIsTransitioning(true);
    prevTabRef.current = tab;

    // Small delay for exit animation
    setTimeout(() => {
      setTab(newTab);
      setValidationError(null);
      setEmail('');
      setPassword('');
      setShowPassword(false);

      // Reset transition flag after enter animation
      setTimeout(() => setIsTransitioning(false), 400);
    }, 150);
  };

  // Dynamic background glow based on active tab
  const bgGlowColors = {
    login: 'bg-blue-500/10',
    signup: 'bg-fuchsia-500/10',
    about: 'bg-violet-500/10',
  };

  const tabConfigs = [
    { id: 'login' as Tab, icon: LogIn, label: 'Entrar',
      activeColor: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
      inactiveColor: 'text-gray-400 hover:text-white hover:bg-blue-500/10',
      glowColor: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
    { id: 'signup' as Tab, icon: UserPlus, label: 'Criar conta',
      activeColor: 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30',
      inactiveColor: 'text-fuchsia-400 hover:text-white hover:bg-fuchsia-500/10',
      glowColor: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300' },
    { id: 'about' as Tab, icon: Info, label: 'Sobre',
      activeColor: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
      inactiveColor: 'text-gray-400 hover:text-white hover:bg-blue-500/10',
      glowColor: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
  ] as const;

  const activeTabConfig = tabConfigs.find(t => t.id === tab)!;

  const tabSubtitles = {
    login: 'Entre para continuar',
    signup: 'Crie sua conta gratuitamente',
    about: 'Seu organizador pessoal',
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ease-out ${bgGlowColors[tab]} animate-pulse-glow`}
          style={{ animationDelay: '0s' }}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl transition-all duration-700 ease-out ${tab === 'signup' ? 'bg-fuchsia-500/5' : 'bg-violet-500/5'}`}
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div
        className={`w-full relative transition-all duration-500 ease-out ${tab === 'about' ? 'max-w-lg' : 'max-w-sm'}`}
        style={{
          transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
          opacity: isTransitioning ? 0.8 : 1
        }}
      >

        {/* Logo with animation */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl mb-4 transition-all duration-500 ${tab === 'signup' ? 'bg-fuchsia-500 shadow-fuchsia-500/40' : 'bg-blue-500 shadow-blue-500/40'}`}>
            <ShoppingCart className="w-8 h-8 text-white animate-float" style={{animationDuration: '4s'}} />
          </div>
          <h1 className="text-2xl font-bold text-white transition-colors duration-300">Minhas Listas</h1>
          <p className="text-sm text-gray-500 mt-1 transition-all duration-300 animate-fade-in-up stagger-1">
            {tabSubtitles[tab]}
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl p-6 space-y-5 relative overflow-hidden">

          {/* Animated border glow on card */}
          <div
            className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-500 ${activeTabConfig.glowColor} opacity-50`}
            style={{ boxShadow: 'inset 0 0 60px currentColor' }}
          />

          {/* Tab toggle */}
          <div className="relative flex p-1 bg-gray-800/50 rounded-xl gap-0.5 backdrop-blur-sm">
            {/* Animated slider indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-lg shadow-lg transition-all duration-300 ease-out pointer-events-none"
              style={{
                background: tab === 'signup'
                  ? 'linear-gradient(135deg, rgba(232, 121, 249, 0.3), rgba(217, 70, 239, 0.2))'
                  : 'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(139, 92, 246, 0.2))',
                width: `${100 / 3}%`,
                left: `${tabConfigs.findIndex(t => t.id === tab) * (100 / 3)}%`,
                boxShadow: tab === 'signup'
                  ? '0 0 20px rgba(232, 121, 249, 0.4)'
                  : '0 0 20px rgba(96, 165, 250, 0.4)',
              }}
            />

            {tabConfigs.map(({ id, icon: Icon, label, activeColor, inactiveColor }) => (
              <button
                key={id}
                type="button"
                onClick={() => switchTab(id)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  tab === id ? activeColor : inactiveColor
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform duration-200 ${tab === id ? 'animate-pulse' : ''}`} style={{animationDuration: '2s'}} />
                <span className="hidden xs:inline sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Conditional content with smooth transitions */}
          <div className="relative min-h-[280px]">
            {tab === 'about' ? (
              <div className="tab-enter" style={{width: '100%'}}>
                <div className="max-h-[70vh] sm:max-h-[80vh] overflow-y-auto pr-1 -mr-1 scrollbar-invisible pb-4">
                  <AboutContent />
                </div>

                <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm mt-4 pt-4 border-t border-gray-800/50">
                  <button
                    type="button"
                    onClick={() => switchTab('signup')}
                    className="w-full py-3 bg-fuchsia-500 hover:bg-fuchsia-600 active:scale-[0.98] text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-fuchsia-500/25 flex items-center justify-center gap-2 focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-gray-900 animate-scale-in stagger-6"
                  >
                    Criar minha conta grátis
                    <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ) : tab === 'login' ? (
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                loading={loading}
                error={error}
                validationError={validationError}
                onSubmit={handleSubmit}
              />
            ) : (
              <SignupForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                loading={loading}
                error={error}
                validationError={validationError}
                onSubmit={handleSubmit}
              />
            )}
          </div>

        </div>

        <p className="text-center text-xs text-gray-700 mt-4 animate-fade-in-up stagger-5">© 2025 KauhanHernandes</p>
      </div>
    </div>
  );
};