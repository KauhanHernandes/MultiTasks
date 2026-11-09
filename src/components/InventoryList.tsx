import React, { useState, useMemo } from 'react';
import {
  Plus, Package, Trash2, Edit3, X, Check, Calendar,
  Search, SortAsc, SortDesc, FileText, Tag,
} from 'lucide-react';
import { useInventoryItems } from '../hooks/useInventoryItems';
import { ConfirmModal } from './ConfirmModal';
import { generatePDFReport } from '../utils/pdfGenerator';
import {
  CategoryPicker,
  CategoryHeader,
  useCategories,
  DEFAULT_CATEGORIES,
  type Category,
} from './CategoryManager';

export const InventoryList: React.FC = () => {
  const { items, loading, addItem, deleteItem, updateItem } = useInventoryItems();
  const { categories, addCategory }                        = useCategories('inventory_categories');

  // ── Form ─────────────────────────────────────────────────────────────────────
  const [newItem, setNewItem]     = useState({ name: '', quantity: '1', expiryDate: '', categoryId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem]   = useState({ name: '', quantity: '', expiryDate: '' });

  // ── Modais / painel ──────────────────────────────────────────────────────────
  const [showClearConfirm, setShowClearConfirm]   = useState(false);
  const [panelOpen, setPanelOpen]                 = useState<'search' | 'selection' | null>(null);
  const [selectedItems, setSelectedItems]         = useState<Set<string>>(new Set());

  // ── Busca / ordenação ────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy]         = useState<'name' | 'quantity' | 'expiry'>('name');
  const [sortOrder, setSortOrder]   = useState<'asc' | 'desc'>('asc');

  // ── Categorias abertas ────────────────────────────────────────────────────────
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['', ...DEFAULT_CATEGORIES.map(c => c.id)])
  );

  // ── Helpers de validade ───────────────────────────────────────────────────────
  const isExpiringSoon = (d: string | null) => {
    if (!d) return false;
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return diff <= 7 && diff >= 0;
  };
  const isExpired = (d: string | null) => !!d && new Date(d) < new Date();

  // ── Dados derivados ───────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let list = searchTerm
      ? items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name')     cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'quantity') cmp = a.quantity - b.quantity;
      else {
        const da = a.expiry_date ? new Date(a.expiry_date).getTime() : Number.MAX_SAFE_INTEGER;
        const db = b.expiry_date ? new Date(b.expiry_date).getTime() : Number.MAX_SAFE_INTEGER;
        cmp = da - db;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [items, searchTerm, sortBy, sortOrder]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, typeof items>();
    filteredItems.forEach(item => {
      const key = (item as any).category_id ?? '';
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

  const totalProdutos    = items.length;
  const expiredCount      = items.filter(i => isExpired(i.expiry_date ?? null)).length;
  const expiringSoonCount = items.filter(i => isExpiringSoon(i.expiry_date ?? null)).length;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const [actionError, setActionError] = useState<string | null>(null);

  const clearAllItems = async () => {
    try {
      for (const item of items) await deleteItem(item.id);
      setShowClearConfirm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao limpar inventário');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (newItem.name.trim()) {
      try {
        await addItem(
          newItem.name.trim(),
          parseInt(newItem.quantity) || 1,
          newItem.expiryDate || undefined,
        );
        setNewItem({ name: '', quantity: '1', expiryDate: '', categoryId: newItem.categoryId });
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Erro ao adicionar item');
      }
    }
  };

  const handleEditStart = (item: any) => {
    setEditingId(item.id);
    setEditItem({ name: item.name, quantity: item.quantity.toString(), expiryDate: item.expiry_date || '' });
  };

  const handleEditSave = async () => {
    if (editingId && editItem.name.trim()) {
      try {
        await updateItem(editingId, {
          name:        editItem.name.trim(),
          quantity:    parseInt(editItem.quantity) || 1,
          expiry_date: editItem.expiryDate || undefined,
        });
        setEditingId(null);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Erro ao salvar alterações');
      }
    }
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const toggleSelectItem = (id: string) => {
    const s = new Set(selectedItems);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedItems(s);
  };

  const deleteSelected = async () => {
    try {
      for (const id of selectedItems) await deleteItem(id);
      setSelectedItems(new Set());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao excluir itens');
    }
  };

  const toggleCategoryOpen = (catId: string) => {
    const next = new Set(openCategories);
    next.has(catId) ? next.delete(catId) : next.add(catId);
    setOpenCategories(next);
  };

  const togglePanel = (p: typeof panelOpen) => setPanelOpen(prev => prev === p ? null : p);

  const generateInventoryPDF = () => {
    const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    generatePDFReport(
      month,
      items.map(i => ({ name: i.name, price: 0, quantity: i.quantity, completed: false })),
      null, 0, 0,
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-7 bg-gray-800 rounded-lg w-1/3" />
          <div className="grid grid-cols-3 gap-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}</div>
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-800 rounded-xl" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Error Toast */}
      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-4">
            <p className="text-red-400 text-sm">{actionError}</p>
            <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-300 transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Inventário de Casa</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={generateInventoryPDF} disabled={items.length === 0}
              className="px-3 py-2 text-xs sm:text-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <FileText className="w-3.5 h-3.5" /><span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={() => setShowClearConfirm(true)} disabled={items.length === 0}
              className="px-3 py-2 text-xs sm:text-sm bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <Trash2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Limpar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-1">Produtos</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-300">{totalProdutos}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-1">Vencendo</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-300">{expiringSoonCount}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-1">Vencidos</p>
            <p className="text-xl sm:text-2xl font-bold text-red-300">{expiredCount}</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="flex divide-x divide-gray-800">
          {[
            { id: 'search' as const,    icon: <Search className="w-4 h-4" />, label: 'Pesquisar' },
            { id: 'selection' as const, icon: <Check className="w-4 h-4" />,  label: 'Selecionar' },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => togglePanel(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                panelOpen === id ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}>
              {icon}<span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            <span className="hidden sm:inline">Ordenar</span>
          </button>
        </div>

        {panelOpen === 'search' && (
          <div className="border-t border-gray-800 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Pesquisar produtos..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white text-sm placeholder-gray-500" />
            </div>
            <div className="flex gap-2 mt-3">
              {(['name', 'quantity', 'expiry'] as const).map(field => (
                <button key={field} onClick={() => toggleSort(field)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sortBy === field ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>
                  {field === 'name' ? 'Nome' : field === 'quantity' ? 'Qtd' : 'Validade'}
                </button>
              ))}
            </div>
          </div>
        )}

        {panelOpen === 'selection' && (
          <div className="border-t border-gray-800 p-4">
            <p className="text-xs text-gray-500 mb-3">
              {selectedItems.size > 0 ? `${selectedItems.size} selecionado(s)` : 'Nenhum item selecionado'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setSelectedItems(new Set(filteredItems.map(i => i.id)))} disabled={filteredItems.length === 0}
                className="flex items-center justify-center gap-2 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 rounded-xl text-xs font-medium disabled:opacity-40">
                <Check className="w-4 h-4" /> Todos
              </button>
              <button onClick={() => setSelectedItems(new Set())} disabled={selectedItems.size === 0}
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-xl text-xs font-medium disabled:opacity-40">
                <X className="w-4 h-4" /> Desmarcar
              </button>
              <button onClick={deleteSelected} disabled={selectedItems.size === 0}
                className="flex items-center justify-center gap-2 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl text-xs font-medium disabled:opacity-40">
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Formulário de Adição ─────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white">Adicionar Produto ao Inventário</h4>
        </div>
        <form onSubmit={handleAddItem} className="p-4 space-y-3">
          <CategoryPicker
            value={newItem.categoryId}
            onChange={val => setNewItem({ ...newItem, categoryId: val })}
            categories={categories}
            onAddCategory={addCategory}
            accentColor="emerald"
          />
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px_140px_auto] gap-2.5">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input type="text" placeholder="Nome do produto" value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })} required
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-600 text-sm" />
            </div>
            <input type="number" min="1" placeholder="Qtd" value={newItem.quantity}
              onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
              className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-600 text-sm" />
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              <input type="date" value={newItem.expiryDate}
                onChange={e => setNewItem({ ...newItem, expiryDate: e.target.value })}
                className="w-full pl-9 pr-2 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white text-sm" />
            </div>
            <button type="submit"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/30 active:scale-95">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Itens agrupados por categoria ────────────────────────────── */}
      <div className="space-y-3">
        {orderedSections.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
            <div className="p-4 bg-gray-800 rounded-2xl w-fit mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">{searchTerm ? 'Nenhum item encontrado' : 'Inventário vazio'}</p>
            <p className="text-sm text-gray-600 mt-1">Adicione produtos que você já tem em casa</p>
          </div>
        ) : (
          orderedSections.map(({ category, catId, items: sectionItems }) => {
            const isOpen   = openCategories.has(catId);
            const totalQty = sectionItems.reduce((s, i) => s + i.quantity, 0);

            return (
              <div key={catId} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <CategoryHeader
                  category={category}
                  itemCount={sectionItems.length}
                  extra={`${totalQty} un.`}
                  isOpen={isOpen}
                  onToggle={() => toggleCategoryOpen(catId)}
                />

                {isOpen && (
                  <div className="divide-y divide-gray-800">
                    {sectionItems.map(item => {
                      const expired  = isExpired(item.expiry_date ?? null);
                      const expiring = isExpiringSoon(item.expiry_date ?? null);
                      return (
                        <div key={item.id}
                          className={`flex items-center gap-3 px-4 py-3.5 transition-all ${
                            expired ? 'bg-red-900/10' : expiring ? 'bg-amber-900/10' : 'hover:bg-gray-800/50'
                          }`}>

                          <button onClick={() => toggleSelectItem(item.id)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedItems.has(item.id) ? 'bg-violet-500 shadow-lg shadow-violet-500/30' : 'border-2 border-gray-700 hover:border-violet-400'
                            }`}>
                            {selectedItems.has(item.id) && <Check className="w-3 h-3 text-white" />}
                          </button>

                          {editingId === item.id ? (
                            <div className="flex-1 flex flex-col sm:flex-row gap-2">
                              <input type="text" value={editItem.name} autoFocus
                                onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditingId(null); }}
                                className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white" />
                              <div className="flex gap-2">
                                <input type="number" min="1" value={editItem.quantity}
                                  onChange={e => setEditItem({ ...editItem, quantity: e.target.value })}
                                  className="w-16 px-2 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white" />
                                <input type="date" value={editItem.expiryDate}
                                  onChange={e => setEditItem({ ...editItem, expiryDate: e.target.value })}
                                  className="w-32 px-2 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white" />
                                <button onClick={handleEditSave} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg"><Check className="w-4 h-4" /></button>
                                <button onClick={() => setEditingId(null)} className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                  <span className="text-xs text-gray-500">
                                    Qtd: <span className="text-gray-300 font-medium">{item.quantity}</span>
                                  </span>
                                  {item.expiry_date && (
                                    <span className={`flex items-center gap-1 text-xs font-medium ${
                                      expired ? 'text-red-400' : expiring ? 'text-amber-400' : 'text-gray-500'
                                    }`}>
                                      <Calendar className="w-3 h-3" />
                                      {new Date(item.expiry_date).toLocaleDateString('pt-BR')}
                                      {expired && ' · Vencido'}
                                      {expiring && !expired && ' · Vence em breve'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => handleEditStart(item)}
                                  className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => deleteItem(item.id)}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} onConfirm={clearAllItems}
        title="Limpar Inventário"
        message="Tem certeza que deseja remover todos os itens do inventário? Esta ação não pode ser desfeita." />
    </div>
  );
};