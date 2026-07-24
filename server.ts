import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// File-based persistent storage directory and path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "mares_database.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface Wash {
  id: string;
  vehicle: string;
  service: "SIMPLES" | "COMPLETA" | "GERAL" | string;
  amount: number;
  paymentMethod: "PIX" | "DINHEIRO" | "CARTÃO" | string;
  createdAt: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category?: string;
  createdAt: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

interface DBData {
  washes: Wash[];
  expenses: Expense[];
}

function loadData(): DBData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        washes: Array.isArray(parsed.washes) ? parsed.washes : [],
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      };
    }
  } catch (err) {
    console.error("Error reading database file:", err);
  }
  return { washes: [], expenses: [] };
}

function saveData(data: DBData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Get current YYYY-MM-DD in local time
function getTodayString(dateObj?: Date): string {
  const d = dateObj || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Mares Lava-jato API" });
});

// GET all data or filtered by date
app.get("/api/data", (req, res) => {
  const data = loadData();
  const filterDate = (req.query.date as string) || getTodayString();
  
  const dayWashes = data.washes.filter((w) => w.date === filterDate);
  const dayExpenses = data.expenses.filter((e) => e.date === filterDate);

  const totalRevenue = dayWashes.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const totalExpenses = dayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  res.json({
    date: filterDate,
    washes: dayWashes,
    expenses: dayExpenses,
    allWashesCount: data.washes.length,
    allExpensesCount: data.expenses.length,
    stats: {
      carCount: dayWashes.length,
      totalRevenue,
      totalExpenses,
      netProfit,
    },
  });
});

// Add a new wash
app.post("/api/washes", (req, res) => {
  const { vehicle, service, amount, paymentMethod, customDate } = req.body;
  if (!vehicle || !amount) {
    return res.status(400).json({ error: "Veículo e Valor são obrigatórios." });
  }

  const data = loadData();
  const now = new Date();
  const targetDate = customDate || getTodayString(now);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const newWash: Wash = {
    id: "w_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    vehicle: String(vehicle).trim(),
    service: service || "SIMPLES",
    amount: parseFloat(String(amount).replace(",", ".")),
    paymentMethod: paymentMethod || "PIX",
    createdAt: now.toISOString(),
    date: targetDate,
    time: `${hours}:${minutes}`,
  };

  data.washes.unshift(newWash);
  saveData(data);

  res.status(201).json(newWash);
});

// Delete a wash
app.delete("/api/washes/:id", (req, res) => {
  const { id } = req.params;
  const data = loadData();
  const initialLength = data.washes.length;
  data.washes = data.washes.filter((w) => w.id !== id);

  if (data.washes.length === initialLength) {
    return res.status(404).json({ error: "Lavagem não encontrada." });
  }

  saveData(data);
  res.json({ success: true, id });
});

// Add a new expense
app.post("/api/expenses", (req, res) => {
  const { description, amount, category, customDate } = req.body;
  if (!description || !amount) {
    return res.status(400).json({ error: "Descrição e Valor são obrigatórios." });
  }

  const data = loadData();
  const now = new Date();
  const targetDate = customDate || getTodayString(now);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const newExpense: Expense = {
    id: "e_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    description: String(description).trim(),
    amount: parseFloat(String(amount).replace(",", ".")),
    category: category || "Geral",
    createdAt: now.toISOString(),
    date: targetDate,
    time: `${hours}:${minutes}`,
  };

  data.expenses.unshift(newExpense);
  saveData(data);

  res.status(201).json(newExpense);
});

// Delete an expense
app.delete("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const data = loadData();
  const initialLength = data.expenses.length;
  data.expenses = data.expenses.filter((e) => e.id !== id);

  if (data.expenses.length === initialLength) {
    return res.status(404).json({ error: "Despesa não encontrada." });
  }

  saveData(data);
  res.json({ success: true, id });
});

// Sync / Bulk save endpoint (from localstorage backup if needed)
app.post("/api/sync", (req, res) => {
  const { washes, expenses } = req.body;
  if (Array.isArray(washes) && Array.isArray(expenses)) {
    const data = loadData();
    const washMap = new Map<string, Wash>();
    data.washes.forEach((w) => washMap.set(w.id, w));
    washes.forEach((w) => washMap.set(w.id, w));

    const expenseMap = new Map<string, Expense>();
    data.expenses.forEach((e) => expenseMap.set(e.id, e));
    expenses.forEach((e) => expenseMap.set(e.id, e));

    const mergedData: DBData = {
      washes: Array.from(washMap.values()).sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      ),
      expenses: Array.from(expenseMap.values()).sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      ),
    };

    saveData(mergedData);
    return res.json({
      success: true,
      message: "Dados sincronizados com sucesso.",
      allWashesCount: mergedData.washes.length,
      allExpensesCount: mergedData.expenses.length,
    });
  }
  res.status(400).json({ error: "Formato de dados inválido." });
});

// Mount Vite middleware or static files
async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const hasDistIndex = fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV === "production" || hasDistIndex) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const portNum = Number(PORT) || 3000;
  app.listen(portNum, "0.0.0.0", () => {
    console.log(`Server Mares Lava-jato running on port ${PORT}`);
  });
}

startServer();
