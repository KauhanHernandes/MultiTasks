import React, { useState } from 'react';
import { Plus, Home, Check, Trash2, Edit3, X } from 'lucide-react';
import { useHomeItems } from '../hooks/useHomeItems';
import { ConfirmModal } from './ConfirmModal';

interface HomeListProps {
  month: string;
}

export const HomeList: React.FC<HomeListProps> = ({ month }) => {
  const { items, loading, addItem, deleteItem, toggleCompleted, updateItem } = useHomeItems(month);
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearAllItems = async () => {
    for (const item of items) await deleteItem(item.id);
    setShowClearConfirm(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) { await addItem(newItemName.trim()); setNewItemName(''); }
  };

  const handleEditSave = async () => {
    if (editingId && editItemName.trim()) {
      await updateItem(editingId, { name: editItemName.trim() });
      setEditingId(null);
    }
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-7 bg-gray-800 rounded-lg w-1/3" />
          <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}</div>
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-800 rounded-xl" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/20 rounded-xl border border-violet-500/30">
              <Home className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Tarefas de Casa</h3>
          </div>
          <button onClick={() => setShowClearConfirm(true)} disabled={items.length === 0}
            className="px-3 py-2 text-xs sm:text-sm bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
            <Trash2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Limpar</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-wide mb-1">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-violet-300">{totalCount}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-1">Feitas</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-300">{completedCount}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-1">Progresso</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-300">{completionRate.toFixed(0)}%</p>
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{completedCount} de {totalCount} concluídas</span>
              <span className="font-semibold text-gray-300">{completionRate.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-violet-500 to-blue-500 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Add Form ─────────────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-violet-400" />
          <h4 className="text-sm font-semibold text-white">Nova Tarefa</h4>
        </div>
        <form onSubmit={handleAddItem} className="p-4">
          <div className="flex gap-2.5">
            <input type="text" placeholder="Digite uma tarefa de casa..." value={newItemName}
              onChange={e => setNewItemName(e.target.value)} required
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-gray-600 text-sm transition-all" />
            <button type="submit"
              className="flex items-center gap-2 px-5 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/30 active:scale-95">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Items ────────────────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-14">
            <div className="p-4 bg-gray-800 rounded-2xl w-fit mx-auto mb-4">
              <Home className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">Nenhuma tarefa cadastrada</p>
            <p className="text-sm text-gray-600 mt-1">Adicione tarefas para organizar seu mês</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {items.map(item => (
              <div key={item.id}
                className={`flex items-center gap-3 px-4 py-3.5 transition-all ${item.completed ? 'bg-emerald-900/10' : 'hover:bg-gray-800/50'}`}>
                {/* Complete toggle */}
                <button onClick={() => toggleCompleted(item.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    item.completed ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'border-2 border-gray-700 hover:border-emerald-400'
                  }`}>
                  {item.completed && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

                {editingId === item.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input type="text" value={editItemName} autoFocus
                      onChange={e => setEditItemName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 text-white" />
                    <button onClick={handleEditSave} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <p className={`flex-1 text-sm font-medium ${item.completed ? 'line-through text-gray-600' : 'text-white'}`}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingId(item.id); setEditItemName(item.name); }}
                        className="p-2 text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
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

      <ConfirmModal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} onConfirm={clearAllItems}
        title="Limpar Lista" message="Tem certeza que deseja remover todas as tarefas desta lista? Esta ação não pode ser desfeita." />
    </div>
  );
};