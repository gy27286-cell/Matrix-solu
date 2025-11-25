export enum UserRole {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
}

export enum BikeStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  UNDER_REPAIR = 'UNDER_REPAIR'
}

export enum PaymentMode {
  CASH = 'CASH',
  ONLINE = 'ONLINE'
}

export interface Expense {
  id: string;
  bikeId: string;
  amount: number;
  description: string;
  date: string; // ISO String
  mechanicName?: string;
  paymentMode: PaymentMode;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  idProofType?: string;
  idProofNumber?: string;
}

export interface Sale {
  id: string;
  bikeId: string;
  customerId: string;
  customer: Customer;
  sellingPrice: number;
  soldByUserId: string;
  date: string;
  paymentMode: PaymentMode;
}

export interface Bike {
  id: string;
  orgId: string;
  
  // Bike Details
  brand: string;
  model: string;
  year: number;
  color: string;
  engineNumber: string;
  chassisNumber: string;
  odometer: number;
  description: string;
  images: string[]; // Base64 strings

  // Purchase Details (Restricted View)
  purchasePrice: number;
  purchasePaymentMode?: PaymentMode;
  purchasedFrom: {
    name: string;
    phone: string;
    address?: string;
    idProof?: string;
  };
  purchaseDate: string;

  // RC Details
  rcNumber: string;
  rcDate?: string;

  status: BikeStatus;
  
  // Computed/Linked
  expenses: Expense[];
  sale?: Sale;
}

export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT'
}

export interface CashTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'ADJUSTMENT';
  description: string;
  referenceId?: string; // ID of bike or expense
  date: string;
  paymentMode: PaymentMode;
}