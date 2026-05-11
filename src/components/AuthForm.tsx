import React, { useState } from 'react';
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

// ─── About Content ────────────────────────────────────────────────────────────
const AboutContent: React.FC = () => (
  <div className="space-y-6">

    {/* Hero tagline */}
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/60 via-gray-900/80 to-violet-950/40 p-5 text-center">
      <div className="pointer-events-none absolute -top-6 -left-6 w-24 h-24 rounded-full bg-blue-500/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-violet-500/20 blur-2xl" />

      <div className="relative flex justify-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-300 tracking-wide">
          <Sparkles className="w-3 h-3" />
          Tudo em um só lugar
        </span>
      </div>
      <p className="relative text-sm font-medium text-gray-200 leading-relaxed">
        Organize suas compras, controle o estoque em casa e gerencie tarefas domésticas —{' '}
        <span className="text-blue-400 font-semibold">sempre sincronizado</span>.
      </p>
    </div>

    {/* Features */}
    <div>
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">O que você pode fazer</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {features.map(({ icon: Icon, label, desc, gradient, bg, border, text, glow }) => (
          <div
            key={label}
            className={`group relative flex gap-3 rounded-xl border p-3.5 transition-all duration-200 hover:scale-[1.01] ${bg} ${border} shadow-lg ${glow}`}
          >
            <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
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
    <div className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-4">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Categorias disponíveis</p>
      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <span
            key={cat}
            className="px-2.5 py-1 bg-gray-700/80 text-gray-300 text-[11px] rounded-lg font-medium border border-gray-600/40"
          >
            {cat}
          </span>
        ))}
        <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-[11px] rounded-lg font-semibold border border-blue-500/30 flex items-center gap-1">
          <span>+</span> Criar suas próprias
        </span>
      </div>
    </div>

    {/* Trust badges */}
    <div className="grid grid-cols-3 gap-2">
      {badges.map(({ icon: Icon, text, sub, color, bg, border }) => (
        <div
          key={text}
          className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center ${bg} ${border}`}
        >
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${bg} border ${border}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <p className="text-[11px] font-bold text-white leading-tight">{text}</p>
          <p className="text-[10px] text-gray-500">{sub}</p>
        </div>
      ))}
    </div>

    {/* Checklist footer */}
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 space-y-2">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Por que usar?</p>
      {[
        'Funciona offline e sincroniza na nuvem',
        'Compartilhe listas com a família',
        'Sem anúncios, sem cobranças ocultas',
        'Exportação em PDF com um clique',
      ].map(item => (
        <div key={item} className="flex items-center gap-2.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-gray-300">{item}</span>
        </div>
      ))}
    </div>

  </div>
);

// ─── AuthForm principal ───────────────────────────────────────────────────────
export const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onSignUp, loading, error }) => {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação customizada
    if (tab === 'signup' && password.length < 6) {
      setValidationError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    setValidationError(null);
    
    if (tab === 'login') await onLogin(email, password);
    else await onSignUp(email, password);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className={`w-full relative transition-all duration-300 ${tab === 'about' ? 'max-w-lg' : 'max-w-sm'}`}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl shadow-2xl shadow-blue-500/40 mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Minhas Listas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tab === 'login'  && 'Entre para continuar'}
            {tab === 'signup' && 'Crie sua conta gratuitamente'}
            {tab === 'about'  && 'Seu organizador pessoal'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl p-6 space-y-5">

          {/* Tab toggle */}
          <div className="flex p-1 bg-gray-800 rounded-xl gap-0.5">
            {([
              { id: 'login',  icon: LogIn,    label: 'Entrar' },
              { id: 'signup', icon: UserPlus,  label: 'Criar conta' },
              { id: 'about',  icon: Info,      label: 'Sobre' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  setValidationError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  tab === id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Conditional content */}
          {tab === 'about' ? (
            <>
              <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
                <AboutContent />
              </div>

              <button
                type="button"
                onClick={() => setTab('signup')}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                Criar minha conta grátis
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete={tab === 'login' ? 'email' : 'new-email'}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Errors */}
              {(error || validationError) && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{validationError || error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {tab === 'login' ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    {tab === 'login' ? 'Entrar' : 'Criar Conta'}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-700 mt-4">© 2025 KauhanHernandes</p>
      </div>
    </div>
  );
};