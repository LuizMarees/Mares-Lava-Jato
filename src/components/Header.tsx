import React from "react";
import { Car, Calendar, RefreshCw, HelpCircle, HardDrive } from "lucide-react";

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  totalRevenue: number;
  carCount: number;
  isOnline: boolean;
  onOpenDeployGuide: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  totalRevenue,
  carCount,
  isOnline,
  onOpenDeployGuide,
  onRefresh,
}) => {
  // Format selected date nicely in Portuguese
  const formatDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);

    const weekDays = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const weekDay = weekDays[dateObj.getDay()];
    const dayNum = dateObj.getDate();
    const monthName = months[dateObj.getMonth()];

    if (dateStr === today) {
      return `Hoje • ${weekDay}, ${dayNum} de ${monthName}`;
    }
    return `${weekDay}, ${dayNum} de ${monthName}`;
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <header id="header-section" className="bg-blue-700 text-white shadow-md shrink-0 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="bg-white/15 p-2 rounded-xl backdrop-blur-xs flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 leading-none">
                MARES LAVA-JATO
              </h1>
              <p className="text-blue-100 text-[11px] font-semibold uppercase tracking-wider mt-0.5">
                Painel Operacional
              </p>
            </div>
          </div>

          {/* Quick Deploy / Help Button for Mobile */}
          <button
            onClick={onOpenDeployGuide}
            className="md:hidden flex items-center gap-1 text-xs bg-blue-800 hover:bg-blue-900 px-2.5 py-1.5 rounded-lg border border-blue-500/40 text-blue-100 font-medium"
            title="Deploy Railway & Ajuda"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Deploy</span>
          </button>
        </div>

        {/* Center: Date picker toggle */}
        <div className="flex items-center gap-2 bg-blue-800/80 p-1.5 rounded-xl border border-blue-500/30 text-xs w-full md:w-auto justify-center">
          <Calendar className="w-4 h-4 text-blue-200 ml-1" />
          <span className="font-bold text-blue-100 hidden sm:inline">
            {formatDateLabel(selectedDate)}
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="bg-blue-900 text-white font-bold rounded-lg px-2 py-1 outline-none text-xs border border-blue-600 focus:ring-2 focus:ring-white/40 cursor-pointer"
          />
          {!isToday && (
            <button
              onClick={() => onDateChange(new Date().toISOString().split("T")[0])}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-1 rounded-md text-[10px] uppercase tracking-wide"
            >
              Ir para Hoje
            </button>
          )}
        </div>

        {/* Right: Quick Stats */}
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-blue-600/50 pt-2 md:pt-0">
          <div className="text-left md:text-right">
            <span className="block text-[10px] text-blue-200 uppercase font-extrabold tracking-wider">
              {isToday ? "Faturamento Hoje" : "Faturamento Dia"}
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-bold italic text-white">
              R$ {totalRevenue.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] text-blue-200 uppercase font-extrabold tracking-wider">
              Carros Lavados
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-bold italic text-blue-100">
              {carCount}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-blue-600/60">
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-blue-100 hover:text-white transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenDeployGuide}
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 rounded-lg border border-blue-400/40 shadow-xs"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Deploy Railway</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
