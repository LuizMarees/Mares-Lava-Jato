import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { WashForm } from "./components/WashForm";
import { WashList } from "./components/WashList";
import { ExpenseForm } from "./components/ExpenseForm";
import { CashFlow } from "./components/CashFlow";
import { DeployGuideModal } from "./components/DeployGuideModal";
import { Wash, Expense, ServiceType, PaymentMethod } from "./types";
import { Database, ShieldCheck, HelpCircle, HardDrive } from "lucide-react";

const LOCAL_STORAGE_KEY = "mares_lava_jato_data_v1";

function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [washes, setWashes] = useState<Wash[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allWashesCount, setAllWashesCount] = useState<number>(0);
  const [allExpensesCount, setAllExpensesCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load local backup from localStorage
  const loadFromLocalStorage = useCallback((date: string) => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const allWashes: Wash[] = Array.isArray(parsed.washes) ? parsed.washes : [];
        const allExpenses: Expense[] = Array.isArray(parsed.expenses) ? parsed.expenses : [];

        setWashes(allWashes.filter((w) => w.date === date));
        setExpenses(allExpenses.filter((e) => e.date === date));
        setAllWashesCount(allWashes.length);
        setAllExpensesCount(allExpenses.length);
      }
    } catch (err) {
      console.error("Erro ao carregar do localStorage:", err);
    }
  }, []);

  // Save full state to localStorage
  const saveToLocalStorage = useCallback((newWashes: Wash[], newExpenses: Expense[]) => {
    try {
      // Fetch current all records in localStorage to merge
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let existingWashes: Wash[] = [];
      let existingExpenses: Expense[] = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        existingWashes = Array.isArray(parsed.washes) ? parsed.washes : [];
        existingExpenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
      }

      // Upsert/Merge newWashes and newExpenses by id
      const washMap = new Map<string, Wash>();
      existingWashes.forEach((w) => washMap.set(w.id, w));
      newWashes.forEach((w) => washMap.set(w.id, w));

      const expenseMap = new Map<string, Expense>();
      existingExpenses.forEach((e) => expenseMap.set(e.id, e));
      newExpenses.forEach((e) => expenseMap.set(e.id, e));

      const allMergedWashes = Array.from(washMap.values());
      const allMergedExpenses = Array.from(expenseMap.values());

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          washes: allMergedWashes,
          expenses: allMergedExpenses,
        })
      );
      setAllWashesCount(allMergedWashes.length);
      setAllExpensesCount(allMergedExpenses.length);
    } catch (err) {
      console.error("Erro ao salvar no localStorage:", err);
    }
  }, []);

  // Fetch data from Server API or LocalStorage
  const fetchData = useCallback(
    async (dateStr: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/data?date=${dateStr}`);
        if (res.ok) {
          const data = await res.json();
          setWashes(data.washes || []);
          setExpenses(data.expenses || []);
          setAllWashesCount(data.allWashesCount || 0);
          setAllExpensesCount(data.allExpensesCount || 0);
          setIsOnline(true);
          // Sync back to localstorage for offline continuity
          saveToLocalStorage(data.washes || [], data.expenses || []);
        } else {
          setIsOnline(false);
          loadFromLocalStorage(dateStr);
        }
      } catch (err) {
        setIsOnline(false);
        loadFromLocalStorage(dateStr);
      } finally {
        setIsLoading(false);
      }
    },
    [loadFromLocalStorage, saveToLocalStorage]
  );

  // Auto-sync localStorage with backend server on initial launch
  useEffect(() => {
    const autoSync = async () => {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if ((parsed.washes && parsed.washes.length > 0) || (parsed.expenses && parsed.expenses.length > 0)) {
            const res = await fetch("/api/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                washes: parsed.washes || [],
                expenses: parsed.expenses || [],
              }),
            });
            if (res.ok) {
              fetchData(selectedDate);
            }
          }
        }
      } catch (e) {
        console.warn("Auto-sync error:", e);
      }
    };
    autoSync();
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, fetchData]);

  // Handler: Add Wash
  const handleAddWash = async (data: {
    vehicle: string;
    service: ServiceType;
    amount: number;
    paymentMethod: PaymentMethod;
  }) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const newWash: Wash = {
      id: "w_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      vehicle: data.vehicle,
      service: data.service,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      createdAt: now.toISOString(),
      date: selectedDate,
      time: `${hours}:${minutes}`,
    };

    // Optimistic UI update
    const updatedWashes = [newWash, ...washes];
    setWashes(updatedWashes);
    saveToLocalStorage(updatedWashes, expenses);

    // Try posting to backend
    try {
      const res = await fetch("/api/washes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          customDate: selectedDate,
        }),
      });
      if (res.ok) {
        const savedServerWash = await res.json();
        // Update local id if needed
        setWashes((prev) =>
          prev.map((w) => (w.id === newWash.id ? savedServerWash : w))
        );
      }
    } catch (err) {
      console.warn("Backend offline, dados salvos localmente.");
    }
  };

  // Handler: Delete Wash
  const handleDeleteWash = async (id: string) => {
    const updatedWashes = washes.filter((w) => w.id !== id);
    setWashes(updatedWashes);

    // Update local storage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const filteredAll = (parsed.washes || []).filter((w: Wash) => w.id !== id);
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ ...parsed, washes: filteredAll })
        );
      }
    } catch (e) {}

    // Delete on backend
    try {
      await fetch(`/api/washes/${id}`, { method: "DELETE" });
    } catch (err) {}
  };

  // Handler: Add Expense
  const handleAddExpense = async (data: {
    description: string;
    amount: number;
    category?: string;
  }) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const newExpense: Expense = {
      id: "e_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      description: data.description,
      amount: data.amount,
      category: data.category || "Geral",
      createdAt: now.toISOString(),
      date: selectedDate,
      time: `${hours}:${minutes}`,
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    saveToLocalStorage(washes, updatedExpenses);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          customDate: selectedDate,
        }),
      });
      if (res.ok) {
        const savedServerExpense = await res.json();
        setExpenses((prev) =>
          prev.map((e) => (e.id === newExpense.id ? savedServerExpense : e))
        );
      }
    } catch (err) {}
  };

  // Handler: Delete Expense
  const handleDeleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExpenses);

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const filteredAll = (parsed.expenses || []).filter((e: Expense) => e.id !== id);
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ ...parsed, expenses: filteredAll })
        );
      }
    } catch (e) {}

    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    } catch (err) {}
  };

  // Export JSON backup file
  const handleExportBackup = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || JSON.stringify({ washes, expenses });
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_mares_lava_jato_${selectedDate}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao exportar backup.");
    }
  };

  // Restore JSON backup
  const handleImportBackup = async (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.washes) && Array.isArray(parsed.expenses)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed),
        });
        fetchData(selectedDate);
        alert("Backup restaurado com sucesso no servidor e localmente!");
      } else {
        alert("Formato de arquivo JSON inválido.");
      }
    } catch (err) {
      alert("JSON inválido.");
    }
  };

  // Clear current date's data
  const handleClearDayData = () => {
    if (confirm(`Tem certeza que deseja apagar todos os registros do dia ${selectedDate}?`)) {
      washes.forEach((w) => handleDeleteWash(w.id));
      expenses.forEach((e) => handleDeleteExpense(e.id));
    }
  };

  const totalRevenue = washes.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* HEADER SECTION */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        totalRevenue={totalRevenue}
        carCount={washes.length}
        isOnline={isOnline}
        onOpenDeployGuide={() => setIsGuideOpen(true)}
        onRefresh={() => fetchData(selectedDate)}
      />

      {/* MAIN INTERFACE (HIGH DENSITY TWO-COLUMN GRID) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: REGISTRO DE LAVAGEM (7 Columns on LG) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <WashForm onAddWash={handleAddWash} />
          <WashList
            washes={washes}
            onDeleteWash={handleDeleteWash}
            selectedDate={selectedDate}
          />
        </section>

        {/* RIGHT COLUMN: CAIXA / DESPESAS / FLUXO (5 Columns on LG) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <ExpenseForm onAddExpense={handleAddExpense} />
          <CashFlow
            washes={washes}
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
          />
        </section>
      </main>

      {/* FOOTER ACTION BAR */}
      <footer id="footer-section" className="bg-white border-t border-slate-200 mt-auto py-3 px-4 sm:px-8 text-[11px] font-bold text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SISTEMA OPERACIONAL ONLINE
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              Banco de Dados Persistente • {allWashesCount} lavagens no histórico
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px] sm:text-[11px] uppercase tracking-tight">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-blue-700 hover:text-blue-900 font-extrabold flex items-center gap-1 underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Instruções de Deploy Railway</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 font-mono">v1.0.2</span>
          </div>
        </div>
      </footer>

      {/* DEPLOY GUIDE & BACKUP MODAL */}
      <DeployGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearDayData={handleClearDayData}
      />
    </div>
  );
}
