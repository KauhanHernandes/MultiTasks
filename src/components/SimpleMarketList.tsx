import React, { useState, useMemo } from 'react';
import {
  Plus, ShoppingBag, Check, Trash2, Edit3, X, ArrowRight, Home,
  Search, SortAsc, SortDesc, Tag, Package, CheckSquare, Square,
} from 'lucide-react';
import { useSimpleMarketItems } from '../hooks/useSimpleMarketItems';
import { useMarketItems } from '../hooks/useMarketItems';
import { useInventoryItems } from '../hooks/useInventoryItems';
import { ConfirmModal } from './ConfirmModal';
import { TransferModal } from './TransferModal';
import {
  CategoryPicker,
  CategoryHeader,
  useCategories,
  DEFAULT_CATEGORIES,
  type Category,
} from './CategoryManager';

interface SimpleMarketListProps {
  month: string;
}

export const SimpleMarketList: React.FC<SimpleMarketListProps> = ({ month }) => {
  const { items, loading, addItem, deleteItem, toggleCompleted, updateItem } = useSimpleMarketItems(month);
  const { addItem: addPriceItem }     = useMarketItems(month);
  const { addItem: addInventoryItem } = useInventoryItems();
  const { categories, addCategory }  = useCategories('simple_categories');

  // ── Form ─────────────────────────────────────────────────────────────────────
  const [newItem, setNewItem]     = useState({ name: '', quantity: '1', categoryId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem]   = useState({ name: '', quantity: '' });

  // ── Modais ───────────────────────────────────────────────────────────────────
  const [showClearConfirm, setShowClearConfirm]   = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferItem, setTransferItem]           = useState<any>(null);
  const [transferMode, setTransferMode]           = useState<'price' | 'inventory'>('price');

  // ── Toolbar ──────────────────────────────────────────────────────────────────
  const [panelOpen, setPanelOpen]         = useState<'search' | 'selection' | null>(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [sortBy, setSortBy]               = useState<'name' | 'quantity'>('name');
  const [sortOrder, setSortOrder]         = useState<'asc' | 'desc'>('asc');
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
      const cmp = sortBy === 'name' ? a.name.localeCompare(b.name) : a.quantity - b.quantity;
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

  const completedCount = items.filter(i => i.completed).length;
  const totalCount     = items.length;
  const completionPct  = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const clearAllItems = async () => {
    for (const item of items) await deleteItem(item.id);
    setShowClearConfirm(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name.trim()) {
      await addItem(newItem.name.trim(), parseInt(newItem.quantity) || 1, newItem.categoryId);
      setNewItem({ name: '', quantity: '1', categoryId: newItem.categoryId });
    }
  };

  const handleEditSave = async () => {
    if (editingId && editItem.name.trim()) {
      await updateItem(editingId, { name: editItem.name.trim(), quantity: parseInt(editItem.quantity) || 1 });
      setEditingId(null);
    }
  };

  const handleTransferConfirm = async (price: number, quantity: number) => {
    if (transferItem) {
      if (transferMode === 'price') {
        await addPriceItem(transferItem.name, price, quantity);
        await addInventoryItem(transferItem.name, quantity);
      } else {
        await addInventoryItem(transferItem.name, transferItem.quantity);
      }
      setShowTransferModal(false);
      setTransferItem(null);
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

  const transferSelectedToPriceList = async () => {
    for (const id of selectedItems) {
      const item = items.find(i => i.id === id);
      if (item) { await addPriceItem(item.name, 0, item.quantity); await addInventoryItem(item.name, item.quantity); }
    }
    setSelectedItems(new Set());
  };

  const toggleCategoryOpen = (catId: string) => {
    const next = new Set(openCategories);
    next.has(catId) ? next.delete(catId) : next.add(catId);
    setOpenCategories(next);
  };

  const togglePanel = (p: typeof panelOpen) => setPanelOpen(prev => prev === p ? null : p);

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-7 bg-gray-800 rounded-lg w-1/3" />
          <div className="grid grid-cols-2 gap-3">{[1, 2].map(i => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}</div>
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-800 rounded-xl" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Lista Simples</h3>
          </div>
          <button onClick={() => setShowClearConfirm(true)} disabled={items.length === 0}
            className="px-3 py-2 text-xs sm:text-sm bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
            <Trash2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Limpar</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-1">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-300">{totalCount}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-1">Comprados</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-300">{completedCount}</p>
          </div>
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-wide mb-1">Progresso</p>
            <p className="text-xl sm:text-2xl font-bold text-violet-300">{completionPct.toFixed(0)}%</p>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="flex divide-x divide-gray-800">
          {[
            { id: 'search' as const,    icon: <Search className="w-4 h-4" />,      label: 'Pesquisar' },
            { id: 'selection' as const, icon: <CheckSquare className="w-4 h-4" />, label: 'Selecionar' },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => togglePanel(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                panelOpen === id ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
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
              <input type="text" placeholder="Pesquisar..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-white text-sm placeholder-gray-500" />
            </div>
            <div className="flex gap-2 mt-3">
              {(['name', 'quantity'] as const).map(field => (
                <button key={field} onClick={() => toggleSort(field)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sortBy === field ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>
                  {field === 'name' ? 'Nome' : 'Quantidade'}
                </button>
              ))}
            </div>
          </div>
        )}

        {panelOpen === 'selection' && (
          <div className="border-t border-gray-800 p-4">
            <p className="text-xs text-gray-500 mb-3">
              {selectedItems.size > 0 ? `${selectedItems.size} selecionado(s)` : 'Nenhum selecionado'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Todos',         icon: <CheckSquare className="w-4 h-4" />, onClick: () => setSelectedItems(new Set(filteredItems.map(i => i.id))), disabled: filteredItems.length === 0, color: 'blue' },
                { label: 'Desmarcar',     icon: <Square className="w-4 h-4" />,      onClick: () => setSelectedItems(new Set()), disabled: selectedItems.size === 0, color: 'gray' },
                { label: '→ Com Preço',  icon: <ArrowRight className="w-4 h-4" />,  onClick: transferSelectedToPriceList, disabled: selectedItems.size === 0, color: 'emerald' },
                { label: '→ Inventário', icon: <Home className="w-4 h-4" />,        onClick: transferSelectedToInventory, disabled: selectedItems.size === 0, color: 'violet' },
                { label: 'Excluir',       icon: <Trash2 className="w-4 h-4" />,      onClick: deleteSelected, disabled: selectedItems.size === 0, color: 'red' },
              ].map(({ label, icon, onClick, disabled, color }) => {
                const colors: Record<string, string> = {
                  blue:    'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30',
                  gray:    'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white',
                  emerald: 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30',
                  violet:  'bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30',
                  red:     'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30',
                };
                return (
                  <button key={label} onClick={onClick} disabled={disabled}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]}`}>
                    {icon}<span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Formulário de Adição ─────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">Adicionar Produto</h4>
        </div>
        <form onSubmit={handleAddItem} className="p-4 space-y-3">
          <CategoryPicker
            value={newItem.categoryId}
            onChange={val => setNewItem({ ...newItem, categoryId: val })}
            categories={categories}
            onAddCategory={addCategory}
            accentColor="blue"
          />
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px_auto] gap-2.5">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input type="text" placeholder="Nome do produto" value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })} required
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 text-sm" />
            </div>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input type="number" min="1" placeholder="Qtd" value={newItem.quantity}
                onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                className="w-full pl-9 pr-2 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm" />
            </div>
            <button type="submit"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 active:scale-95">
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
              <ShoppingBag className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">{searchTerm ? 'Nenhum item encontrado' : 'Lista vazia'}</p>
            <p className="text-sm text-gray-600 mt-1">Adicione produtos para começar</p>
          </div>
        ) : (
          orderedSections.map(({ category, catId, items: sectionItems }) => {
            const isOpen = openCategories.has(catId);

            return (
              <div key={catId} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <CategoryHeader
                  category={category}
                  itemCount={sectionItems.length}
                  isOpen={isOpen}
                  onToggle={() => toggleCategoryOpen(catId)}
                />

                {isOpen && (
                  <div className="divide-y divide-gray-800">
                    {sectionItems.map(item => (
                      <div key={item.id}
                        className={`flex items-center gap-3 px-4 py-3.5 transition-all ${item.completed ? 'bg-emerald-900/10' : 'hover:bg-gray-800/50'}`}>

                        <button onClick={() => toggleSelectItem(item.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                            selectedItems.has(item.id) ? 'bg-violet-500 shadow-lg shadow-violet-500/30' : 'border-2 border-gray-700 hover:border-violet-400'
                          }`}>
                          {selectedItems.has(item.id) && <Check className="w-3 h-3 text-white" />}
                        </button>

                        <button onClick={() => toggleCompleted(item.id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            item.completed ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'border-2 border-gray-700 hover:border-emerald-400'
                          }`}>
                          {item.completed && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>

                        {editingId === item.id ? (
                          <div className="flex-1 flex flex-col sm:flex-row gap-2">
                            <input type="text" value={editItem.name} autoFocus
                              onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                              onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditingId(null); }}
                              className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white" />
                            <div className="flex gap-2">
                              <input type="number" min="1" value={editItem.quantity}
                                onChange={e => setEditItem({ ...editItem, quantity: e.target.value })}
                                className="w-16 px-2 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white" />
                              <button onClick={handleEditSave} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditingId(null)} className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${item.completed ? 'line-through text-gray-600' : 'text-white'}`}>{item.name}</p>
                              <p className={`text-xs mt-0.5 ${item.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                                Qtd: <span className="font-medium text-gray-300">{item.quantity}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => { setEditingId(item.id); setEditItem({ name: item.name, quantity: item.quantity.toString() }); }}
                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => { setTransferItem(item); setTransferMode('price'); setShowTransferModal(true); }}
                                className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"><ArrowRight className="w-4 h-4" /></button>
                              <button onClick={() => { setTransferItem(item); setTransferMode('inventory'); setShowTransferModal(true); }}
                                className="p-2 text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors"><Home className="w-4 h-4" /></button>
                              <button onClick={() => deleteItem(item.id)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
      <ConfirmModal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} onConfirm={clearAllItems}
        title="Limpar Lista" message="Tem certeza que deseja remover todos os itens?" />

      {transferMode === 'price' ? (
        <TransferModal isOpen={showTransferModal} onClose={() => { setShowTransferModal(false); setTransferItem(null); }}
          onConfirm={handleTransferConfirm} itemName={transferItem?.name || ''} currentQuantity={transferItem?.quantity || 1} />
      ) : (
        <ConfirmModal isOpen={showTransferModal} onClose={() => { setShowTransferModal(false); setTransferItem(null); }}
          onConfirm={async () => { if (transferItem) { await addInventoryItem(transferItem.name, transferItem.quantity); setShowTransferModal(false); setTransferItem(null); } }}
          title="Transferir para Inventário" message={`Deseja transferir "${transferItem?.name}" para o inventário?`} />
      )}
    </div>
  );
};