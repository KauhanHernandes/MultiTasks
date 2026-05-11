import React, { useState } from 'react';
import { ArrowRight, DollarSign, Package, X } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (price: number, quantity: number) => void;
  itemName: string;
  currentQuantity: number;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen, onClose, onConfirm, itemName, currentQuantity,
}) => {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(currentQuantity.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (price && parseFloat(price) > 0 && quantity && parseInt(quantity) > 0) {
      onConfirm(parseFloat(price), parseInt(quantity));
      setPrice(''); setQuantity('');
    }
  };

  const handleClose = () => {
    setPrice(''); setQuantity(currentQuantity.toString()); onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/15 rounded-xl border border-blue-500/20">
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-bold text-white text-base">Transferir com Preço</h3>
          </div>
          <button onClick={handleClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Item badge */}
          <div className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl">
            <p className="text-xs text-gray-500 mb-0.5">Item selecionado</p>
            <p className="text-sm font-semibold text-white">{itemName}</p>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Preço unitário
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">R$</span>
              <input
                type="number" step="0.01" min="0.01" placeholder="0,00"
                value={price} onChange={e => setPrice(e.target.value)} required autoFocus
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 text-sm transition-all"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Quantidade
            </label>
            <input
              type="number" min="1" placeholder="1"
              value={quantity} onChange={e => setQuantity(e.target.value)} required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 text-sm transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={handleClose}
              className="flex-1 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-all border border-gray-700">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!price || parseFloat(price) <= 0 || !quantity || parseInt(quantity) <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <ArrowRight className="w-4 h-4" /> Transferir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};