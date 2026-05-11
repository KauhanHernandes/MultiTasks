import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'alimentacao', name: 'Alimentação',       color: '#3b82f6' },
  { id: 'higiene',     name: 'Higiene Pessoal',   color: '#ec4899' },
  { id: 'limpeza',     name: 'Prod. de Limpeza',  color: '#06b6d4' },
  { id: 'bebidas',     name: 'Bebidas',            color: '#f59e0b' },
  { id: 'carnes',      name: 'Carnes / Frios',    color: '#ef4444' },
  { id: 'padaria',     name: 'Padaria / Grãos',   color: '#f97316' },
  { id: 'frutas',      name: 'Frutas e Verduras', color: '#10b981' },
  { id: 'farmacia',    name: 'Farmácia',           color: '#8b5cf6' },
  { id: 'utilidades',  name: 'Utilidades',         color: '#64748b' },
  { id: 'outros',      name: 'Outros',             color: '#6b7280' },
];

export const CATEGORY_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#f97316',
  '#64748b', '#6b7280',
];

// ─── Hook: gerencia categorias no localStorage ────────────────────────────────

export function useCategories(storageKey: string) {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const saveCategories = (cats: Category[]) => {
    setCategories(cats);
    try { localStorage.setItem(storageKey, JSON.stringify(cats)); } catch { /* silent */ }
  };

  const addCategory = (name: string, color: string): string => {
    const id = `cat_${Date.now()}`;
    saveCategories([...categories, { id, name, color }]);
    return id;
  };

  const removeCategory = (id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
  };

  return { categories, addCategory, removeCategory };
}

// ─── CategoryPicker ───────────────────────────────────────────────────────────
// Select de categorias + botão inline para criar nova

interface CategoryPickerProps {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
  onAddCategory: (name: string, color: string) => string;
  accentColor?: 'blue' | 'emerald' | 'violet';
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  categories,
  onAddCategory,
  accentColor = 'blue',
}) => {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);

  const ringClass = {
    blue:    'focus:ring-blue-500',
    emerald: 'focus:ring-emerald-500',
    violet:  'focus:ring-violet-500',
  }[accentColor];

  const btnClass = {
    blue:    'bg-blue-500 hover:bg-blue-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
    violet:  'bg-violet-500 hover:bg-violet-600',
  }[accentColor];

  const selected = categories.find(c => c.id === value);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = onAddCategory(newName.trim(), newColor);
    onChange(id);
    setNewName('');
    setNewColor(CATEGORY_COLORS[0]);
    setShowNew(false);
  };

  return (
    <div className="space-y-2">
      {/* Select + botão nova categoria */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          {selected && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full flex-shrink-0 pointer-events-none"
              style={{ background: selected.color }}
            />
          )}
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full ${selected ? 'pl-8' : 'pl-4'} pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm transition-all focus:ring-2 ${ringClass} focus:border-transparent appearance-none cursor-pointer`}
          >
            <option value="">Sem categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowNew(prev => !prev)}
          title={showNew ? 'Cancelar' : 'Nova categoria'}
          className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        >
          {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Formulário inline para nova categoria */}
      {showNew && (
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nova categoria</p>

          <input
            type="text"
            placeholder="Ex: Higiene, Carnes, Bebidas..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
              if (e.key === 'Escape') setShowNew(false);
            }}
            autoFocus
            maxLength={30}
            className={`w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:ring-2 ${ringClass} focus:border-transparent outline-none`}
          />

          {/* Seletor de cor */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setNewColor(color)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: color,
                  outline: newColor === color ? '3px solid white' : '3px solid transparent',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim()}
              className={`flex-1 py-2 ${btnClass} disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all`}
            >
              Criar categoria
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CategoryHeader ───────────────────────────────────────────────────────────
// Cabeçalho clicável de seção agrupada com cor, nome, contagem e progresso

interface CategoryHeaderProps {
  category: Category | null;
  itemCount: number;
  extra?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  itemCount,
  extra,
  isOpen,
  onToggle,
}) => {
  const color = category?.color ?? '#6b7280';
  const name  = category?.name  ?? 'Sem categoria';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/60 hover:bg-gray-800/90 transition-colors border-b border-gray-700/50"
    >
      {/* Ponto colorido */}
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />

      {/* Nome */}
      <span className="text-sm font-bold text-white flex-1 text-left truncate">{name}</span>

      {/* Contagem */}
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{
          background: `${color}22`,
          color,
          border: `1px solid ${color}44`,
        }}
      >
        {itemCount} {itemCount === 1 ? 'item' : 'itens'}
      </span>

      {/* Extra (ex: total R$) */}
      {extra && (
        <span className="text-sm font-bold flex-shrink-0" style={{ color }}>
          {extra}
        </span>
      )}

      {/* Chevron */}
      {isOpen
        ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
        : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
    </button>
  );
};