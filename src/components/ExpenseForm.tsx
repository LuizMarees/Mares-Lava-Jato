import React, { useState } from "react";
import { DollarSign, CheckCircle2 } from "lucide-react";

interface ExpenseFormProps {
  onAddExpense: (expense: { description: string; amount: number; category?: string }) => void;
}

const EXPENSE_CATEGORIES = ["Materiais", "Equipe / Lanche", "Água / Luz", "Manutenção", "Outros"];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Materiais");
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const parsedAmount = parseFloat(amount.replace(".", "").replace(",", ".")) || 0;
    if (parsedAmount <= 0) return;

    onAddExpense({
      description: description.trim(),
      amount: parsedAmount,
      category,
    });

    setDescription("");
    setAmount("");
    
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1200);
  };

  return (
    <div id="expense-form-card" className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 shrink-0">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base sm:text-lg font-bold text-red-800 border-l-4 border-red-500 pl-3 uppercase tracking-tight italic">
          Nova Despesa
        </h2>
        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">
          Saída de Caixa
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Descrição */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
            Descrição da Despesa
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Shampoo 5L, Conta de Água, Lanche equipe"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:bg-white outline-none"
          />
        </div>

        {/* Categoria + Valor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
              Valor (R$)
            </label>
            <input
              type="text"
              required
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-red-600 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* Botão Salvar Despesa */}
        <button
          type="submit"
          className={`w-full font-black py-2.5 px-4 rounded-lg uppercase tracking-wider text-sm transition-all shadow-xs flex items-center justify-center gap-2 ${
            savedFeedback
              ? "bg-green-600 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {savedFeedback ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>DESPESA SALVA!</span>
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4" />
              <span>Salvar Despesa</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
