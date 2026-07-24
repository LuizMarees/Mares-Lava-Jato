import React, { useState } from "react";
import { Expense, Wash } from "../types";
import { TrendingUp, TrendingDown, Trash2, Wallet, CreditCard, Banknote, Landmark } from "lucide-react";

interface CashFlowProps {
  washes: Wash[];
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

export const CashFlow: React.FC<CashFlowProps> = ({ washes, expenses, onDeleteExpense }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalRevenue = washes.reduce((sum, w) => sum + w.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Breakdown by payment method
  const pixTotal = washes.filter((w) => w.paymentMethod === "PIX").reduce((sum, w) => sum + w.amount, 0);
  const cashTotal = washes.filter((w) => w.paymentMethod === "DINHEIRO").reduce((sum, w) => sum + w.amount, 0);
  const cardTotal = washes.filter((w) => w.paymentMethod === "CARTÃO").reduce((sum, w) => sum + w.amount, 0);

  return (
    <div id="cash-flow-card" className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col flex-1 overflow-hidden min-h-[300px]">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider italic flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span>Fluxo do Dia (Caixa)</span>
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase">
          Entradas - Saídas
        </span>
      </div>

      {/* List of Entries and Exits */}
      <div className="overflow-y-auto flex-1 px-4 py-2 space-y-2 max-h-[300px]">
        {/* Total Receitas / Lavagens */}
        <div className="flex justify-between items-center py-2.5 border-b border-dashed border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Lavagens ({washes.length} carros)
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">
                Receita acumulada
              </p>
            </div>
          </div>
          <p className="font-mono font-bold text-green-700 text-sm sm:text-base">
            + R$ {totalRevenue.toFixed(2).replace(".", ",")}
          </p>
        </div>

        {/* Expenses list */}
        {expenses.length === 0 ? (
          <div className="py-3 text-center text-slate-400 text-xs italic">
            Nenhuma despesa lançada hoje.
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex justify-between items-center py-2 border-b border-dashed border-slate-100 hover:bg-slate-50 px-1 rounded transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-100 text-red-700 rounded-lg shrink-0">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{expense.description}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">
                    Despesa • {expense.category || "Geral"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="font-mono font-bold text-red-600 text-xs sm:text-sm">
                  - R$ {expense.amount.toFixed(2).replace(".", ",")}
                </p>
                {deletingId === expense.id ? (
                  <button
                    onClick={() => {
                      onDeleteExpense(expense.id);
                      setDeletingId(null);
                    }}
                    className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded"
                  >
                    Excluir
                  </button>
                ) : (
                  <button
                    onClick={() => setDeletingId(expense.id)}
                    className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    title="Excluir despesa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment methods summary pill */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
        <div className="flex flex-col items-center justify-center p-1 bg-white rounded border border-slate-200">
          <span className="text-[9px] text-slate-400 uppercase flex items-center gap-0.5">
            <Landmark className="w-3 h-3 text-emerald-600" /> PIX
          </span>
          <span className="font-mono text-slate-800 text-xs">
            R$ {pixTotal.toFixed(2).replace(".", ",")}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 bg-white rounded border border-slate-200">
          <span className="text-[9px] text-slate-400 uppercase flex items-center gap-0.5">
            <Banknote className="w-3 h-3 text-amber-600" /> Dinheiro
          </span>
          <span className="font-mono text-slate-800 text-xs">
            R$ {cashTotal.toFixed(2).replace(".", ",")}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 bg-white rounded border border-slate-200">
          <span className="text-[9px] text-slate-400 uppercase flex items-center gap-0.5">
            <CreditCard className="w-3 h-3 text-indigo-600" /> Cartão
          </span>
          <span className="font-mono text-slate-800 text-xs">
            R$ {cardTotal.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* RESULTADO FINAL (Lucro Líquido Box) */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-b-xl shrink-0">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">
              Lucro Líquido do Dia
            </p>
            <h4
              className={`text-2xl sm:text-3xl font-mono font-black italic tracking-tight ${
                netProfit >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              R$ {netProfit.toFixed(2).replace(".", ",")}
            </h4>
          </div>

          <div className="text-right text-[10px] text-slate-400 font-bold uppercase leading-tight">
            <span>Balanço Diário</span>
            <span className="block text-white/90 font-mono text-xs mt-0.5">
              {washes.length} lav. / {expenses.length} desp.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
