export type ServiceType = "SIMPLES" | "COMPLETA" | "GERAL" | "OUTRO";
export type PaymentMethod = "PIX" | "DINHEIRO" | "CARTÃO";

export interface Wash {
  id: string;
  vehicle: string;
  service: ServiceType;
  amount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category?: string;
  createdAt: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface DayStats {
  carCount: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pixTotal: number;
  cashTotal: number;
  cardTotal: number;
}
