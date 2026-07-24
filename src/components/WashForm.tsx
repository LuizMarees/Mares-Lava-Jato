import React, { useState } from "react";
import { ServiceType, PaymentMethod } from "../types";
import { PlusCircle, CheckCircle2 } from "lucide-react";

interface WashFormProps {
  onAddWash: (wash: {
    vehicle: string;
    service: ServiceType;
    amount: number;
    paymentMethod: PaymentMethod;
  }) => void;
}

const SERVICE_PRESETS: { type: ServiceType; label: string; defaultPrice: number }[] = [
  { type: "SIMPLES", label: "SIMPLES", defaultPrice: 35 },
  { type: "COMPLETA", label: "COMPLETA", defaultPrice: 80 },
  { type: "GERAL", label: "GERAL", defaultPrice: 120 },
];

export const WashForm: React.FC<WashFormProps> = ({ onAddWash }) => {
  const [vehicle, setVehicle] = useState("");
  const [service, setService] = useState<ServiceType>("SIMPLES");
  const [amount, setAmount] = useState<string>("35,00");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSelectService = (preset: { type: ServiceType; defaultPrice: number }) => {
    setService(preset.type);
    setAmount(preset.defaultPrice.toFixed(2).replace(".", ","));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle.trim()) return;

    const parsedAmount = parseFloat(amount.replace(".", "").replace(",", ".")) || 0;
    if (parsedAmount <= 0) return;

    onAddWash({
      vehicle: vehicle.trim(),
      service,
      amount: parsedAmount,
      paymentMethod,
    });

    // Reset vehicle field for lightning fast next entry
    setVehicle("");
    
    // Show quick feedback highlight
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1200);
  };

  return (
    <div id="wash-form-card" className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 flex flex-col shrink-0">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base sm:text-lg font-bold text-blue-900 border-l-4 border-blue-600 pl-3 uppercase tracking-tight italic">
          Nova Lavagem
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
          Agilidade em 5s
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Veículo */}
        <div className="sm:col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
            Veículo (Placa ou Modelo)
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Corolla Prata / BRA2E19"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-base font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            autoComplete="off"
          />
        </div>

        {/* Tipo de Serviço (Botões Rápidos) */}
        <div className="sm:col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
            Tipo de Serviço
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SERVICE_PRESETS.map((preset) => {
              const isActive = service === preset.type;
              return (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => handleSelectService(preset)}
                  className={`py-2.5 px-1 text-xs font-black rounded-lg transition-all border-2 text-center ${
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs scale-[1.01]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {preset.label}
                  <span className="block text-[10px] font-mono font-medium text-slate-400 mt-0.5">
                    R$ {preset.defaultPrice}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Valor (R$) */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
            Valor (R$)
          </label>
          <input
            type="text"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base font-mono font-bold text-green-700 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            placeholder="0,00"
          />
        </div>

        {/* Forma de Pagamento */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
            Forma de Pagamento
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
          >
            <option value="PIX">PIX</option>
            <option value="DINHEIRO">DINHEIRO</option>
            <option value="CARTÃO">CARTÃO</option>
          </select>
        </div>

        {/* Botão de Salvar Lavagem */}
        <button
          type="submit"
          className={`sm:col-span-2 font-black py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wider text-base flex items-center justify-center gap-2 mt-1 ${
            savedFeedback
              ? "bg-green-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {savedFeedback ? (
            <>
              <CheckCircle2 className="w-5 h-5 animate-bounce" />
              <span>LAVAGEM REGISTRADA!</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>Salvar Lavagem</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
