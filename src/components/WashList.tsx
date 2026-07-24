import React, { useState } from "react";
import { Wash } from "../types";
import { Trash2, Car, Search, ArrowUpDown } from "lucide-react";

interface WashListProps {
  washes: Wash[];
  onDeleteWash: (id: string) => void;
  selectedDate: string;
}

export const WashList: React.FC<WashListProps> = ({ washes, onDeleteWash }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredWashes = washes.filter((w) =>
    w.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceBadgeClass = (service: string) => {
    switch (service) {
      case "SIMPLES":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETA":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "GERAL":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getPaymentBadgeClass = (method: string) => {
    switch (method) {
      case "PIX":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DINHEIRO":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CARTÃO":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const handleDeleteConfirm = (id: string) => {
    onDeleteWash(id);
    setDeletingId(null);
  };

  return (
    <div id="wash-list-card" className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col flex-1 overflow-hidden min-h-[300px]">
      {/* Header bar of today's washes */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider italic">
            Histórico do Dia ({washes.length})
          </h3>
        </div>

        {/* Search Input */}
        {washes.length > 0 && (
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar veículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-y-auto flex-1 max-h-[380px] sm:max-h-[460px]">
        {filteredWashes.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 h-full">
            <Car className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">
              {washes.length === 0
                ? "Nenhum carro lavado registrado ainda para esta data."
                : "Nenhum veículo encontrado com este termo de busca."}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Registre uma nova lavagem no formulário acima.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-slate-500 shadow-2xs text-[10px] uppercase font-black tracking-wider">
              <tr>
                <th className="px-3 sm:px-4 py-2.5">Horário</th>
                <th className="px-3 sm:px-4 py-2.5">Veículo</th>
                <th className="px-3 sm:px-4 py-2.5">Serviço</th>
                <th className="px-3 sm:px-4 py-2.5">Pagamento</th>
                <th className="px-3 sm:px-4 py-2.5 text-right">Valor</th>
                <th className="px-2 sm:px-3 py-2.5 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs sm:text-sm">
              {filteredWashes.map((wash) => (
                <tr key={wash.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-3 sm:px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                    {wash.time || "12:00"}
                  </td>
                  <td className="px-3 sm:px-4 py-3 font-bold text-slate-900 break-words max-w-[140px] sm:max-w-[200px]">
                    {wash.vehicle}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wide inline-block ${getServiceBadgeClass(
                        wash.service
                      )}`}
                    >
                      {wash.service}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase inline-block ${getPaymentBadgeClass(
                        wash.paymentMethod
                      )}`}
                    >
                      {wash.paymentMethod}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-right font-mono font-bold text-green-700 whitespace-nowrap">
                    R$ {wash.amount.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-2 sm:px-3 py-3 text-center">
                    {deletingId === wash.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDeleteConfirm(wash.id)}
                          className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded hover:bg-red-700"
                          title="Confirmar exclusão"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="bg-slate-200 text-slate-700 font-bold text-[10px] px-1.5 py-0.5 rounded hover:bg-slate-300"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(wash.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Excluir lavagem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
