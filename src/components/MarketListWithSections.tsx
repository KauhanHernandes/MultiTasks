import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, ShoppingCart, Check, Trash2, Edit3, X, DollarSign, Home,
  FileText, Search, SortAsc, SortDesc, Tag, Package,
  CheckSquare, Square,
} from 'lucide-react';
import { useMarketItems } from '../hooks/useMarketItems';
import { useMonthlyBudget } from '../hooks/useMonthlyBudget';
import { useInventoryItems } from '../hooks/useInventoryItems';
import { ConfirmModal } from './ConfirmModal';
import { generatePDFReportWithSections } from '../utils/pdfGeneratorSections';
import { supabase } from '../lib/supabase';
import {
  CategoryPicker,
  CategoryHeader,
  useCategories,
  DEFAULT_CATEGORIES,
  type Category,
} from './CategoryManager';

interface MarketListWithSectionsProps {
  month: string;
}

// ─── Keepalive Supabase (ping a cada 6 dias) ─────────────────────────────────
function useSupabaseKeepalive() {
  useEffect(() => {
    const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;
    const ping = async () => {
      try { await supabase.from('market_items').select('id').limit(1); } catch { /* silent */ }
    };
    ping();
    const interval = setInterval(ping, SIX_DAYS_MS);
    return () => clearInterval(interval);
  }, []);
}

export const MarketListWithSections: React.FC<MarketListWithSectionsProps> = ({ month }) => {
  useSupabaseKeepalive();

  const {
    items, loading, addItem, deleteItem, toggleCompleted, updateItem, totalValue, completedValue,
  } = useMarketItems(month);
  const { budget, setBudgetAmount, resetBudget } = useMonthlyBudget(month);
  const { addItem: addInventoryItem }             = useInventoryItems();
  const { categories, addCategory }              = useCategories('market_categories');

  // ── Form ─────────────────────────────────────────────────────────────────────
  const [newItem, setNewItem]     = useState({ name: '', price: '', quantity: '1', categoryId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem]   = useState({ name: '', price: '', quantity: '' });

  // ── Orçamento ────────────────────────────────────────────────────────────────
  const [budgetInput, setBudgetInput]         = useState('');
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  // ── Modais ───────────────────────────────────────────────────────────────────
  const [showClearConfirm, setShowClearConfirm]           = useState(false);
  const [showBudgetResetConfirm, setShowBudgetResetConfirm] = useState(false);
  const [transferItemId, setTransferItemId]               = useState<string | null>(null);
  const [showFinalizeConfirm, setShowFinalizeConfirm]     = useState(false);

  // ── Toolbar ──────────────────────────────────────────────────────────────────
  const [panelOpen, setPanelOpen]   = useState<'search' | 'selection' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy]         = useState<'name' | 'price' | 'quantity'>('name');
  const [sortOrder, setSortOrder]   = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // ── Categorias abertas ────────────────────────────────────────────────────────
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['', ...DEFAULT_CATEGORIES.map(c => c.id)])
  );

  // ── Dados derivados ───────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let list = searchTerm
      ? items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name')     cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'price')    cmp = a.price - b.price;
      else if (sortBy === 'quantity') cmp = a.quantity - b.quantity;
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [items, searchTerm, sortBy, sortOrder]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, typeof items>();
    filteredItems.forEach(item => {
      // Suporta tanto category_id (nova coluna) quanto section_name (legado)
      const key = (item as any).category_id ?? (item as any).section_name ?? '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return map;
  }, [filteredItems]);

  const orderedSections = useMemo(() => {
    const result: Array<{ category: Category | null; catId: string; items: typeof items }> = [];
    groupedByCategory.forEach((sectionItems, catId) => {
      const category = categories.find(c => c.id === catId) ?? null;
      result.push({ category, catId, items: sectionItems });
    });
    result.sort((a, b) => (a.category?.name ?? 'Zzz').localeCompare(b.category?.name ?? 'Zzz'));
    return result;
  }, [groupedByCategory, categories]);

  // Seções formatadas para o PDF (compatível com pdfGeneratorSections)
  const sectionsForPDF = orderedSections.map(s => ({
    name: s.category?.name ?? 'Sem categoria',
    items: s.items,
  }));

  const remainingBudget = budget ? budget.budget_amount - completedValue : 0;
  const budgetProgress = (budget?.budget_amount ?? 0) > 0
  ? (completedValue / budget!.budget_amount!) * 100
  : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const clearAllItems = async () => {
    for (const item of items) await deleteItem(item.id);
    setShowClearConfirm(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name.trim() && newItem.price) {
      await addItem(
        newItem.name.trim(),
        parseFloat(newItem.price),
        parseInt(newItem.quantity) || 1,
        newItem.categoryId, // salvo em section_name ou category_id dependendo do seu hook
      );
      setNewItem({ name: '', price: '', quantity: '1', categoryId: newItem.categoryId });
    }
  };

  const handleEditStart = (item: any) => {
    setEditingId(item.id);
    setEditItem({ name: item.name, price: item.price.toString(), quantity: item.quantity.toString() });
  };

  const handleEditSave = async () => {
    if (editingId && editItem.name.trim() && editItem.price) {
      await updateItem(editingId, {
        name:     editItem.name.trim(),
        price:    parseFloat(editItem.price),
        quantity: parseInt(editItem.quantity) || 1,
      });
      setEditingId(null);
    }
  };

  const handleBudgetSave = async () => {
    if (budgetInput && parseFloat(budgetInput) > 0) {
      await setBudgetAmount(parseFloat(budgetInput));
      setShowBudgetInput(false);
      setBudgetInput('');
    }
  };

  const handleTransferToInventory = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) { await addInventoryItem(item.name, item.quantity); setTransferItemId(null); }
  };

  const handleFinalizeAll = async () => {
    for (const item of items) await updateItem(item.id, { is_finalized: true });
    setShowFinalizeConfirm(false);
  };

  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedItems);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedItems(next);
  };

  const deleteSelected = async () => {
    for (const id of selectedItems) await deleteItem(id);
    setSelectedItems(new Set());
  };

  const transferSelectedToInventory = async () => {
    for (const id of selectedItems) {
      const item = items.find(i => i.id === id);
      if (item) await addInventoryItem(item.name, item.quantity);
    }
    setSelectedItems(new Set());
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const togglePanel = (panel: typeof panelOpen) => setPanelOpen(p => p === panel ? null : panel);

  const toggleCategoryOpen = (catId: string) => {
    const next = new Set(openCategories);
    next.has(catId) ? next.delete(catId) : next.add(catId);
    setOpenCategories(next);
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-7 bg-gray-700 rounded-lg w-1/3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-700 rounded-xl" />)}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-700 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header / Resumo ─────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-700/50">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Lista com Preços</h3>
          </div>
          <button
            onClick={() => generatePDFReportWithSections(month, sectionsForPDF, budget, totalValue, completedValue)}
            disabled={items.length === 0}
            className="px-3 py-2 text-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Gerar PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-1">Planejado</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-300">R$ {totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-1">Comprado</p>
            <p className="text-lg sm:text-2xl font-bold text-amber-300">R$ {completedValue.toFixed(2)}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-1">Restante</p>
            <p className="text-lg sm:text-2xl font-bold text-emerald-300">R$ {(totalValue - completedValue).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* ── Orçamento ───────────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-white">Orçamento do Mês</h4>
          </div>
          {!showBudgetInput && (
            <div className="flex gap-2">
              <button
                onClick={() => { setShowBudgetInput(true); setBudgetInput(budget?.budget_amount.toString() || ''); }}
                className="px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {budget ? 'Editar' : 'Definir'} Orçamento
              </button>
              {budget && (
                <button
                  onClick={() => setShowBudgetResetConfirm(true)}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  Zerar
                </button>
              )}
            </div>
          )}
        </div>

        {showBudgetInput ? (
          <div className="flex items-center gap-2">
            <span className="text-blue-300 font-bold">R$</span>
            <input
              type="number" step="0.01" min="0" placeholder="Valor do orçamento"
              value={budgetInput} onChange={e => setBudgetInput(e.target.value)} autoFocus
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white text-sm"
            />
            <button onClick={handleBudgetSave} disabled={!budgetInput || parseFloat(budgetInput) < 0}
              className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm disabled:opacity-50">Salvar
            </button>
            <button onClick={() => { setShowBudgetInput(false); setBudgetInput(''); }}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">Cancelar
            </button>
          </div>
        ) : budget ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Total</p>
                <p className="font-bold text-white">R$ {budget.budget_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Gasto</p>
                <p className="font-bold text-amber-300">R$ {completedValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Restante</p>
                <p className={`font-bold ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R$ {remainingBudget.toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Progresso do orçamento</span>
                <span>{budgetProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${
                    budgetProgress > 100 ? 'bg-red-500' : budgetProgress > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhum orçamento definido para este mês.</p>
        )}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
        <div className="flex divide-x divide-gray-700/50">
          {[
            { id: 'search' as const,    icon: <Search className="w-4 h-4" />,      label: 'Pesquisar' },
            { id: 'selection' as const, icon: <CheckSquare className="w-4 h-4" />, label: 'Selecionar' },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => togglePanel(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                panelOpen === id ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}>
              {icon}<span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <button
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            <span className="hidden sm:inline">Ordenar</span>
          </button>
          <button
            onClick={() => setShowClearConfirm(true)} disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" /><span className="hidden sm:inline">Limpar</span>
          </button>
        </div>

        {/* Painel de pesquisa */}
        {panelOpen === 'search' && (
          <div className="border-t border-gray-700/50 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text" placeholder="Pesquisar produtos..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-white text-sm placeholder-gray-500"
              />
            </div>
            <div className="flex gap-2 mt-3">
              {(['name', 'price', 'quantity'] as const).map(field => (
                <button key={field} onClick={() => toggleSort(field)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sortBy === field ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}>
                  {field === 'name' ? 'Nome' : field === 'price' ? 'Preço' : 'Qtd'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Painel de seleção */}
        {panelOpen === 'selection' && (
          <div className="border-t border-gray-700/50 p-4">
            <p className="text-xs text-gray-500 mb-3">
              {selectedItems.size > 0 ? `${selectedItems.size} selecionado(s)` : 'Nenhum item selecionado'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button onClick={() => setSelectedItems(new Set(filteredItems.map(i => i.id)))}
                disabled={filteredItems.length === 0}
                className="flex items-center justify-center gap-2 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 rounded-xl text-xs font-medium transition-all disabled:opacity-40">
                <CheckSquare className="w-4 h-4" /> Todos
              </button>
              <button onClick={() => setSelectedItems(new Set())} disabled={selectedItems.size === 0}
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-xl text-xs font-medium transition-all disabled:opacity-40">
                <Square className="w-4 h-4" /> Desmarcar
              </button>
              <button onClick={transferSelectedToInventory} disabled={selectedItems.size === 0}
                className="flex items-center justify-center gap-2 py-2.5 bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30 rounded-xl text-xs font-medium transition-all disabled:opacity-40">
                <Home className="w-4 h-4" /> Inventário
              </button>
              <button onClick={deleteSelected} disabled={selectedItems.size === 0}
                className="flex items-center justify-center gap-2 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl text-xs font-medium transition-all disabled:opacity-40">
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Formulário de Adição ─────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-700/50 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">Adicionar Produto</h4>
        </div>
        <form onSubmit={handleAddItem} className="p-4 space-y-3">
          {/* Categoria */}
          <CategoryPicker
            value={newItem.categoryId}
            onChange={val => setNewItem({ ...newItem, categoryId: val })}
            categories={categories}
            onAddCategory={addCategory}
            accentColor="blue"
          />
          {/* Nome / Preço / Qtd / Botão */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_80px_auto] gap-2.5">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Nome do produto" value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })} required
                className="w-full pl-9 pr-4 py-3 bg-gray-700/60 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 text-sm" />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">R$</span>
              <input type="number" step="0.01" placeholder="0,00" value={newItem.price}
                onChange={e => setNewItem({ ...newItem, price: e.target.value })} required
                className="w-full pl-9 pr-3 py-3 bg-gray-700/60 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 text-sm" />
            </div>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="number" min="1" placeholder="Qtd" value={newItem.quantity}
                onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                className="w-full pl-9 pr-2 py-3 bg-gray-700/60 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm" />
            </div>
            <button type="submit"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 active:scale-95">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Itens agrupados por categoria ────────────────────────────── */}
      <div className="space-y-4">
        {orderedSections.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl border border-gray-700/50 p-12 text-center">
            <div className="p-4 bg-gray-700/50 rounded-2xl w-fit mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-400 font-medium">Nenhum item na lista ainda</p>
            <p className="text-sm text-gray-500 mt-1">Adicione produtos acima para começar</p>
          </div>
        ) : (
          orderedSections.map(({ category, catId, items: sectionItems }) => {
            const isOpen      = openCategories.has(catId);
            const sectionTotal = sectionItems.reduce((s, i) => s + i.price * i.quantity, 0);
            const doneCount   = sectionItems.filter(i => i.completed).length;

            return (
              <div key={catId} className="bg-gray-800 rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                <CategoryHeader
                  category={category}
                  itemCount={sectionItems.length}
                  extra={`R$ ${sectionTotal.toFixed(2)}`}
                  isOpen={isOpen}
                  onToggle={() => toggleCategoryOpen(catId)}
                />

                {/* Mini progress bar da categoria */}
                {isOpen && sectionItems.length > 0 && (
                  <div className="px-4 py-1.5 bg-gray-800/80 border-b border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${(doneCount / sectionItems.length) * 100}%`,
                            background: category?.color ?? '#6b7280',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{doneCount}/{sectionItems.length}</span>
                    </div>
                  </div>
                )}

                {isOpen && (
                  <div className="divide-y divide-gray-700/50">
                    {sectionItems.map(item => (
                      <div key={item.id}
                        className={`flex items-center gap-3 px-4 py-3.5 transition-all ${
                          item.completed ? 'bg-emerald-900/10' : 'hover:bg-gray-700/30'
                        }`}>

                        {/* Seleção */}
                        <button onClick={() => toggleSelectItem(item.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                            selectedItems.has(item.id)
                              ? 'bg-violet-500 shadow-lg shadow-violet-500/30'
                              : 'border-2 border-gray-600 hover:border-violet-400'
                          }`}>
                          {selectedItems.has(item.id) && <Check className="w-3 h-3 text-white" />}
                        </button>

                        {/* Concluído */}
                        <button onClick={() => toggleCompleted(item.id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            item.completed
                              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                              : 'border-2 border-gray-600 hover:border-emerald-400'
                          }`}>
                          {item.completed && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>

                        {editingId === item.id ? (
                          <div className="flex-1 flex flex-col sm:flex-row gap-2">
                            <input type="text" value={editItem.name} autoFocus
                              onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                              className="flex-1 px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white" />
                            <div className="flex gap-2">
                              <input type="number" step="0.01" value={editItem.price}
                                onChange={e => setEditItem({ ...editItem, price: e.target.value })}
                                className="w-20 px-2 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white" />
                              <input type="number" min="1" value={editItem.quantity}
                                onChange={e => setEditItem({ ...editItem, quantity: e.target.value })}
                                className="w-14 px-2 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white" />
                              <button onClick={handleEditSave}
                                className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingId(null)}
                                className="p-1.5 bg-gray-600 text-gray-300 hover:bg-gray-500 rounded-lg">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                {item.name}
                              </p>
                              <p className={`text-xs mt-0.5 ${item.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                                R$ {item.price.toFixed(2)} × {item.quantity} =&nbsp;
                                <span className="font-semibold text-gray-300">R$ {(item.price * item.quantity).toFixed(2)}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => handleEditStart(item)}
                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setTransferItemId(item.id)}
                                className="p-2 text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors">
                                <Home className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteItem(item.id)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Modais ──────────────────────────────────────────────────── */}
      <ConfirmModal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAllItems} title="Limpar Lista"
        message="Tem certeza que deseja remover todos os itens desta lista? Esta ação não pode ser desfeita." />

      <ConfirmModal isOpen={showBudgetResetConfirm} onClose={() => setShowBudgetResetConfirm(false)}
        onConfirm={async () => { await resetBudget(); setShowBudgetResetConfirm(false); }}
        title="Zerar Orçamento" message="Tem certeza que deseja zerar o orçamento deste mês?" />

      <ConfirmModal isOpen={transferItemId !== null} onClose={() => setTransferItemId(null)}
        onConfirm={() => { if (transferItemId) handleTransferToInventory(transferItemId); }}
        title="Transferir para Inventário"
        message={`Deseja transferir "${items.find(i => i.id === transferItemId)?.name}" para o inventário?`} />

      <ConfirmModal isOpen={showFinalizeConfirm} onClose={() => setShowFinalizeConfirm(false)}
        onConfirm={handleFinalizeAll} title="Finalizar Todas as Compras"
        message="Tem certeza que deseja marcar todos os itens como finalizados?" />
    </div>
  );
};