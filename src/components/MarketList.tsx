// import React, { useState } from 'react';
// import { Plus, ShoppingCart, Check, Trash2, CreditCard as Edit3, X, DollarSign, Home, FileText } from 'lucide-react';
// import { useMarketItems } from '../hooks/useMarketItems';
// import { useMonthlyBudget } from '../hooks/useMonthlyBudget';
// import { useHomeItems } from '../hooks/useHomeItems';
// import { ConfirmModal } from './ConfirmModal';
// import { generatePDFReport } from '../utils/pdfGenerator';

// interface MarketListProps {
//   month: string;
// }

// export const MarketList: React.FC<MarketListProps> = ({ month }) => {
//   const { items, loading, addItem, deleteItem, toggleCompleted, updateItem, totalValue, completedValue } = useMarketItems(month);
//   const { budget, setBudgetAmount, resetBudget } = useMonthlyBudget(month);
//   const { addItem: addHomeItem } = useHomeItems(month);
//   const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '1' });
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editItem, setEditItem] = useState({ name: '', price: '', quantity: '' });
//   const [budgetInput, setBudgetInput] = useState('');
//   const [showBudgetInput, setShowBudgetInput] = useState(false);
//   const [showClearConfirm, setShowClearConfirm] = useState(false);
//   const [showBudgetResetConfirm, setShowBudgetResetConfirm] = useState(false);
//   const [transferItemId, setTransferItemId] = useState<string | null>(null);

//   const clearAllItems = async () => {
//     for (const item of items) {
//       await deleteItem(item.id);
//     }
//     setShowClearConfirm(false);
//   };
  

//   const handleAddItem = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (newItem.name.trim() && newItem.price) {
//       await addItem(newItem.name.trim(), parseFloat(newItem.price), parseInt(newItem.quantity) || 1);
//       setNewItem({ name: '', price: '', quantity: '1' });
//     }
//   };

//   const handleEditStart = (item: any) => {
//     setEditingId(item.id);
//     setEditItem({
//       name: item.name,
//       price: item.price.toString(),
//       quantity: item.quantity.toString(),
//     });
//   };

//   const handleEditSave = async () => {
//     if (editingId && editItem.name.trim() && editItem.price) {
//       await updateItem(editingId, {
//         name: editItem.name.trim(),
//         price: parseFloat(editItem.price),
//         quantity: parseInt(editItem.quantity) || 1,
//       });
//       setEditingId(null);
//     }
//   };

//   const handleEditCancel = () => {
//     setEditingId(null);
//     setEditItem({ name: '', price: '', quantity: '' });
//   };

//   const handleBudgetSave = async () => {
//     if (budgetInput && parseFloat(budgetInput) > 0) {
//       await setBudgetAmount(parseFloat(budgetInput));
//       setShowBudgetInput(false);
//       setBudgetInput('');
//     }
//   };

//   const handleTransferToInventory = async (itemId: string) => {
//     const item = items.find(i => i.id === itemId);
//     if (item) {
//       await addHomeItem(item.name);
//       await deleteItem(itemId);
//       setTransferItemId(null);
//     }
//   };

//   const remainingBudget = budget ? budget.budget_amount - completedValue : 0;
//   const budgetProgress = budget && budget.budget_amount > 0
//     ? (completedValue / budget.budget_amount) * 100
//     : 0;

//   if (loading) {
//     return (
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <div className="animate-pulse space-y-4">
//           <div className="h-6 bg-gray-200 rounded w-1/4"></div>
//           <div className="space-y-2">
//             <div className="h-4 bg-gray-200 rounded"></div>
//             <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700">
//       <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
//         <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
//         <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Lista com Preços</h3>
//       </div>

//       {/* Budget Section */}
//       <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-500/30">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center gap-1 sm:gap-2">
//             <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
//             <h4 className="text-sm sm:text-base font-semibold text-blue-300">Orçamento do Mês</h4>
//           </div>
//           {!showBudgetInput && (
//             <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
//               <button
//                 onClick={() => {
//                   setShowBudgetInput(true);
//                   setBudgetInput(budget?.budget_amount.toString() || '');
//                 }}
//                 className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 whitespace-nowrap"
//               >
//                 {budget ? 'Editar' : 'Definir'} Orçamento
//               </button>
//               {budget && (
//                 <button
//                   onClick={() => setShowBudgetResetConfirm(true)}
//                   className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
//                 >
//                   Zerar
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
        
//         {showBudgetInput ? (
//           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
//             <span className="text-blue-300 font-medium">R$</span>
//             <input
//               type="number"
//               step="0.01"
//               min="0"
//               placeholder="Digite o valor do orçamento"
//               value={budgetInput}
//               onChange={(e) => setBudgetInput(e.target.value)}
//               className="flex-1 px-3 py-2 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
//               autoFocus
//             />
//             <button
//               onClick={handleBudgetSave}
//               className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
//               disabled={!budgetInput || parseFloat(budgetInput) < 0}
//             >
//               Salvar
//             </button>
//             <button
//               onClick={() => {
//                 setShowBudgetInput(false);
//                 setBudgetInput('');
//               }}
//               className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
//             >
//               Cancelar
//             </button>
//           </div>
//         ) : (
//           <div>
//             {budget ? (
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center text-sm sm:text-base">
//                   <span className="text-blue-300">Orçamento Total:</span>
//                   <span className="font-bold text-blue-200 text-sm sm:text-base">R$ {budget.budget_amount.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm sm:text-base">
//                   <span className="text-blue-300">Já Gasto:</span>
//                   <span className="font-bold text-orange-400 text-sm sm:text-base">R$ {completedValue.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm sm:text-base">
//                   <span className="text-blue-300">Restante:</span>
//                   <span className={`font-bold text-sm sm:text-base ${remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                     R$ {remainingBudget.toFixed(2)}
//                   </span>
//                 </div>
//                 {budget.budget_amount > 0 && (
//                   <div className="mt-3">
//                     <div className="flex justify-between text-sm text-blue-300 mb-1">
//                       <span>Progresso do Orçamento</span>
//                       <span>{budgetProgress.toFixed(1)}%</span>
//                     </div>
//                     <div className="w-full bg-gray-700 rounded-full h-2">
//                       <div 
//                         className={`h-2 rounded-full transition-all duration-500 ${
//                           budgetProgress > 100 ? 'bg-red-400' : budgetProgress > 80 ? 'bg-yellow-400' : 'bg-green-400'
//                         }`}
//                         style={{ width: `${Math.min(budgetProgress, 100)}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <p className="text-sm sm:text-base text-blue-300">Nenhum orçamento definido para este mês</p>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
//         <div className="bg-blue-900/30 p-3 sm:p-4 rounded-lg border border-blue-500/30">
//           <p className="text-xs sm:text-sm text-blue-400 font-medium">Total Planejado</p>
//           <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-300">R$ {totalValue.toFixed(2)}</p>
//         </div>
//         <div className="bg-green-900/30 p-3 sm:p-4 rounded-lg border border-green-500/30">
//           <p className="text-xs sm:text-sm text-green-400 font-medium">Já Comprado</p>
//           <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-300">R$ {completedValue.toFixed(2)}</p>
//         </div>
//         <div className="bg-orange-900/30 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1 border border-orange-500/30">
//           <p className="text-xs sm:text-sm text-orange-400 font-medium">Restante</p>
//           <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-300">R$ {(totalValue - completedValue).toFixed(2)}</p>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="mb-4 sm:mb-6 flex justify-end gap-2">
//         <button
//           onClick={() => generatePDFReport(month, items, budget, totalValue, completedValue)}
//           className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
//           disabled={items.length === 0}
//         >
//           <FileText className="w-4 h-4" />
//           Gerar Relatório PDF
//         </button>
//         <button
//           onClick={() => setShowClearConfirm(true)}
//           className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
//           disabled={items.length === 0}
//         >
//           <Trash2 className="w-4 h-4" />
//           Limpar Lista
//         </button>
//       </div>

//       {/* Add new item form */}
//       <form onSubmit={handleAddItem} className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-700 rounded-lg border border-gray-600">
//         <div className="flex flex-col sm:flex-row lg:flex-row gap-2 sm:gap-3">
//           <input
//             type="text"
//             placeholder="Nome do produto"
//             value={newItem.name}
//             onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
//             className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
//             required
//           />
//           <input
//             type="number"
//             step="0.01"
//             placeholder="Preço"
//             value={newItem.price}
//             onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
//             className="w-full sm:w-20 lg:w-24 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
//             required
//           />
//           <input
//             type="number"
//             min="1"
//             placeholder="Qtd"
//             value={newItem.quantity}
//             onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
//             className="w-full sm:w-16 lg:w-20 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
//           />
//           <button
//             type="submit"
//             className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 font-medium"
//           >
//             <Plus className="w-4 h-4" />
//             <span className="hidden sm:inline">Adicionar</span>
//             <span className="sm:hidden">Add</span>
//           </button>
//         </div>
//       </form>

//       {/* Items list */}
//       <div className="space-y-3">
//         {items.length === 0 ? (
//           <div className="text-center py-6 sm:py-8 text-gray-500">
//             <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-600" />
//             <p className="text-base sm:text-lg">Nenhum item na lista ainda</p>
//             <p className="text-sm">Adicione produtos para começar suas compras</p>
//           </div>
//         ) : (
//           items.map((item) => (
//             <div
//               key={item.id}
//               className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
//                 item.completed
//                   ? 'bg-green-900/30 border-green-500/30'
//                   : 'bg-gray-700 border-gray-600 hover:border-blue-500/50'
//               }`}
//             >
//               <button
//                 onClick={() => toggleCompleted(item.id)}
//                 className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
//                   item.completed
//                     ? 'bg-green-400 text-white'
//                     : 'border-2 border-gray-500 hover:border-green-400'
//                 }`}
//               >
//                 {item.completed && <Check className="w-4 h-4" />}
//               </button>
              
//               {editingId === item.id ? (
//                 <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
//                   <input
//                     type="text"
//                     value={editItem.name}
//                     onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
//                     className="flex-1 px-2 sm:px-3 py-1 text-sm sm:text-base bg-gray-600 border border-gray-500 rounded focus:ring-2 focus:ring-blue-500 text-white"
//                   />
//                   <div className="flex gap-2">
//                     <input
//                       type="number"
//                       step="0.01"
//                       value={editItem.price}
//                       onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
//                       className="w-16 sm:w-20 px-2 sm:px-3 py-1 text-sm sm:text-base bg-gray-600 border border-gray-500 rounded focus:ring-2 focus:ring-blue-500 text-white"
//                     />
//                     <input
//                       type="number"
//                       min="1"
//                       value={editItem.quantity}
//                       onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
//                       className="w-12 sm:w-16 px-2 sm:px-3 py-1 text-sm sm:text-base bg-gray-600 border border-gray-500 rounded focus:ring-2 focus:ring-blue-500 text-white"
//                     />
//                     <button
//                       onClick={handleEditSave}
//                       className="p-1 sm:p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors duration-200"
//                     >
//                       <Check className="w-3 h-3 sm:w-4 sm:h-4" />
//                     </button>
//                     <button
//                       onClick={handleEditCancel}
//                       className="p-1 sm:p-2 text-gray-400 hover:bg-gray-600 rounded-lg transition-colors duration-200"
//                     >
//                       <X className="w-3 h-3 sm:w-4 sm:h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex-1">
//                     <p className={`text-sm sm:text-base font-medium ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
//                       {item.name}
//                     </p>
//                     <p className={`text-xs sm:text-sm ${item.completed ? 'text-gray-500' : 'text-gray-400'}`}>
//                       R$ {item.price.toFixed(2)} × {item.quantity} = R$ {(item.price * item.quantity).toFixed(2)}
//                     </p>
//                   </div>
                  
//                   <div className="flex flex-col sm:flex-row items-center gap-2">
//                     <button
//                       onClick={() => handleEditStart(item)}
//                       className="p-2 sm:p-3 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
//                       title="Editar item"
//                     >
//                       <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
//                     </button>
//                     <button
//                       onClick={() => setTransferItemId(item.id)}
//                       className="p-2 sm:p-3 text-purple-400 hover:bg-purple-900/30 rounded-lg transition-colors duration-200"
//                       title="Transferir para inventário"
//                     >
//                       <Home className="w-5 h-5 sm:w-6 sm:h-6" />
//                     </button>
//                     <button
//                       onClick={() => deleteItem(item.id)}
//                       className="p-2 sm:p-3 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors duration-200"
//                       title="Excluir item"
//                     >
//                       <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           ))
//         )}
//       </div>

//       {/* Confirm Modals */}
//       <ConfirmModal
//         isOpen={showClearConfirm}
//         onClose={() => setShowClearConfirm(false)}
//         onConfirm={clearAllItems}
//         title="Limpar Lista"
//         message="Tem certeza que deseja remover todos os itens desta lista? Esta ação não pode ser desfeita."
//       />

//       <ConfirmModal
//         isOpen={showBudgetResetConfirm}
//         onClose={() => setShowBudgetResetConfirm(false)}
//         onConfirm={async () => {
//           await resetBudget();
//           setShowBudgetResetConfirm(false);
//         }}
//         title="Zerar Orçamento"
//         message="Tem certeza que deseja zerar o orçamento deste mês?"
//       />

//       <ConfirmModal
//         isOpen={transferItemId !== null}
//         onClose={() => setTransferItemId(null)}
//         onConfirm={() => {
//           if (transferItemId) {
//             handleTransferToInventory(transferItemId);
//           }
//         }}
//         title="Transferir para Inventário"
//         message={`Deseja transferir "${items.find(i => i.id === transferItemId)?.name}" para o inventário da casa? O item será removido da lista de compras.`}
//       />
//     </div>
//   );
// };