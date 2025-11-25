import { Bike, User, UserRole, BikeStatus, CashTransaction, TransactionType, Expense, PaymentMode } from '../types';

const KEYS = {
  USERS: 'motodesk_users',
  SESSION: 'motodesk_session',
  BIKES: 'motodesk_bikes',
  TRANSACTIONS: 'motodesk_transactions'
};

// --- Seed Data for Demo ---

const seedDemoData = () => {
  // Only seed if no bikes exist to avoid overwriting user data if they switch to demo account
  const existingBikes = localStorage.getItem(KEYS.BIKES);
  if (existingBikes && JSON.parse(existingBikes).length > 0) return;

  const demoOrgId = 'org_demo';
  const demoUserId = 'user_demo';

  // 1. Sample Bikes
  const bikes: Bike[] = [
    {
      id: 'bike_demo_1', orgId: demoOrgId, brand: 'Royal Enfield', model: 'Classic 350', year: 2022, color: 'Stealth Black',
      engineNumber: 'RE882291', chassisNumber: 'CHS99281', odometer: 12500, description: 'Mint condition, single owner, alloy wheels installed.',
      images: [], status: BikeStatus.AVAILABLE, 
      purchasePrice: 135000, purchasePaymentMode: PaymentMode.ONLINE,
      purchasedFrom: { name: 'Vikram Singh', phone: '9876543210', address: 'Mumbai, MH' },
      purchaseDate: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
      rcNumber: 'MH02 DN 4422', rcDate: '2022-05-15', expenses: []
    },
    {
      id: 'bike_demo_2', orgId: demoOrgId, brand: 'Honda', model: 'Activa 6G', year: 2021, color: 'White',
      engineNumber: 'HON22119', chassisNumber: 'CHS11229', odometer: 18000, description: 'Good for daily commute. Minor scratches on side panel.',
      images: [], status: BikeStatus.UNDER_REPAIR, 
      purchasePrice: 45000, purchasePaymentMode: PaymentMode.CASH,
      purchasedFrom: { name: 'Rahul Sharma', phone: '9988776655', address: 'Pune, MH' },
      purchaseDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      rcNumber: 'MH12 AB 1234', rcDate: '2021-02-20', 
      expenses: [
        { id: 'exp_demo_1', bikeId: 'bike_demo_2', amount: 1200, description: 'Oil Change & Servicing', date: new Date().toISOString(), paymentMode: PaymentMode.CASH }
      ]
    },
    {
      id: 'bike_demo_3', orgId: demoOrgId, brand: 'Yamaha', model: 'R15 V3', year: 2020, color: 'Racing Blue',
      engineNumber: 'YAM99881', chassisNumber: 'CHS88112', odometer: 22000, description: 'Sporty look, new tyres.',
      images: [], status: BikeStatus.SOLD, 
      purchasePrice: 90000, purchasePaymentMode: PaymentMode.ONLINE,
      purchasedFrom: { name: 'Amit Verma', phone: '8877665544', address: 'Nashik, MH' },
      purchaseDate: new Date(Date.now() - 86400000 * 20).toISOString(), // 20 days ago
      rcNumber: 'MH15 CD 5678', rcDate: '2020-08-10', expenses: [],
      sale: {
        id: 'sale_demo_1', bikeId: 'bike_demo_3', customerId: 'cust_demo_1',
        customer: { name: 'Suresh Raina', phone: '7766554433', address: 'Mumbai' },
        sellingPrice: 115000, soldByUserId: demoUserId, date: new Date(Date.now() - 86400000 * 2).toISOString(),
        paymentMode: PaymentMode.ONLINE
      }
    }
  ];

  // 2. Sample Transactions matching the bikes
  const transactions: CashTransaction[] = [
    { id: 'tx_demo_1', amount: 135000, type: TransactionType.OUT, category: 'PURCHASE', description: 'Purchased Royal Enfield Classic 350', referenceId: 'bike_demo_1', date: new Date(Date.now() - 86400000 * 10).toISOString(), paymentMode: PaymentMode.ONLINE },
    { id: 'tx_demo_2', amount: 90000, type: TransactionType.OUT, category: 'PURCHASE', description: 'Purchased Yamaha R15 V3', referenceId: 'bike_demo_3', date: new Date(Date.now() - 86400000 * 20).toISOString(), paymentMode: PaymentMode.ONLINE },
    { id: 'tx_demo_3', amount: 45000, type: TransactionType.OUT, category: 'PURCHASE', description: 'Purchased Honda Activa 6G', referenceId: 'bike_demo_2', date: new Date(Date.now() - 86400000 * 5).toISOString(), paymentMode: PaymentMode.CASH },
    { id: 'tx_demo_4', amount: 1200, type: TransactionType.OUT, category: 'EXPENSE', description: 'Repair: Oil Change (Honda Activa)', referenceId: 'bike_demo_2', date: new Date().toISOString(), paymentMode: PaymentMode.CASH },
    { id: 'tx_demo_5', amount: 115000, type: TransactionType.IN, category: 'SALE', description: 'Sold Yamaha R15 V3', referenceId: 'bike_demo_3', date: new Date(Date.now() - 86400000 * 2).toISOString(), paymentMode: PaymentMode.ONLINE },
    { id: 'tx_demo_6', amount: 500000, type: TransactionType.IN, category: 'ADJUSTMENT', description: 'Initial Capital Injection', referenceId: 'init', date: new Date(Date.now() - 86400000 * 30).toISOString(), paymentMode: PaymentMode.ONLINE }
  ];

  localStorage.setItem(KEYS.BIKES, JSON.stringify(bikes));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};


// --- Auth Service ---

export const getSession = (): User | null => {
  const session = localStorage.getItem(KEYS.SESSION);
  return session ? JSON.parse(session) : null;
};

export const signup = (email: string, password: string, name: string, orgName: string): User => {
  const usersStr = localStorage.getItem(KEYS.USERS);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  if (users.find(u => u.email === email)) {
    throw new Error("Account with this email already exists.");
  }

  const newUser: User = {
    id: 'user_' + Date.now(),
    email,
    name,
    role: UserRole.OWNER, // First user of an org is Owner
    orgId: 'org_' + Date.now()
  };

  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(KEYS.SESSION, JSON.stringify(newUser));
  return newUser;
};

export const login = (email: string, password: string): User => {
  // Demo Mode Handler
  if (email === 'demo@motodesk.com') {
    seedDemoData();
    const demoUser: User = {
      id: 'user_demo', email: 'demo@motodesk.com', name: 'Demo Dealer',
      role: UserRole.OWNER, orgId: 'org_demo'
    };
    localStorage.setItem(KEYS.SESSION, JSON.stringify(demoUser));
    return demoUser;
  }

  const usersStr = localStorage.getItem(KEYS.USERS);
  let users: User[] = usersStr ? JSON.parse(usersStr) : [];

  const user = users.find(u => u.email === email);
  if (user) {
    // In a real app, verify password hash here.
    localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    return user;
  } else {
    // Fallback: If no users at all, allow first login to be admin (Dev convenience)
    if (users.length === 0) {
       const newUser: User = {
        id: 'user_' + Date.now(),
        email,
        name: email.split('@')[0],
        role: UserRole.OWNER,
        orgId: 'org_default'
      };
      users.push(newUser);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(KEYS.SESSION, JSON.stringify(newUser));
      return newUser;
    }
    throw new Error("User not found. Please Sign Up.");
  }
};

export const logout = () => {
  localStorage.removeItem(KEYS.SESSION);
  // Optional: Clear demo data on logout if you want fresh demo every time
  // localStorage.removeItem(KEYS.BIKES); 
};

// --- Data Service ---

const getBikes = (): Bike[] => {
  const data = localStorage.getItem(KEYS.BIKES);
  return data ? JSON.parse(data) : [];
};

const saveBikes = (bikes: Bike[]) => {
  localStorage.setItem(KEYS.BIKES, JSON.stringify(bikes));
};

const getTransactions = (): CashTransaction[] => {
  const data = localStorage.getItem(KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

const saveTransactions = (txs: CashTransaction[]) => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
};

export const api = {
  bikes: {
    list: () => getBikes(),
    get: (id: string) => getBikes().find(b => b.id === id),
    add: (bike: Bike) => {
      const bikes = getBikes();
      bikes.unshift(bike);
      saveBikes(bikes);

      // Record Cash Out for Purchase
      if (bike.purchasePrice > 0) {
        api.cash.add({
          id: 'tx_' + Date.now(),
          amount: bike.purchasePrice,
          type: TransactionType.OUT,
          category: 'PURCHASE',
          description: `Purchased ${bike.brand} ${bike.model}`,
          referenceId: bike.id,
          date: new Date().toISOString(),
          paymentMode: bike.purchasePaymentMode || PaymentMode.CASH
        });
      }
    },
    update: (updatedBike: Bike) => {
      const bikes = getBikes();
      const index = bikes.findIndex(b => b.id === updatedBike.id);
      if (index !== -1) {
        bikes[index] = updatedBike;
        saveBikes(bikes);
      }
    },
    delete: (id: string) => {
      const bikes = getBikes().filter(b => b.id !== id);
      saveBikes(bikes);
    },
    addExpense: (bikeId: string, expense: Expense) => {
      const bikes = getBikes();
      const bike = bikes.find(b => b.id === bikeId);
      if (bike) {
        bike.expenses.push(expense);
        saveBikes(bikes);

        // Record Cash Out
        api.cash.add({
          id: 'tx_' + Date.now(),
          amount: expense.amount,
          type: TransactionType.OUT,
          category: 'EXPENSE',
          description: `Repair: ${expense.description} (${bike.brand} ${bike.model})`,
          referenceId: bike.id,
          date: new Date().toISOString(),
          paymentMode: expense.paymentMode
        });
      }
    },
    markSold: (bikeId: string, saleDetails: any) => {
      const bikes = getBikes();
      const bike = bikes.find(b => b.id === bikeId);
      if (bike) {
        bike.status = BikeStatus.SOLD;
        bike.sale = saleDetails;
        saveBikes(bikes);

        // Record Cash In
        api.cash.add({
          id: 'tx_' + Date.now(),
          amount: saleDetails.sellingPrice,
          type: TransactionType.IN,
          category: 'SALE',
          description: `Sold ${bike.brand} ${bike.model} to ${saleDetails.customer.name}`,
          referenceId: bike.id,
          date: new Date().toISOString(),
          paymentMode: saleDetails.paymentMode
        });
      }
    }
  },
  cash: {
    list: () => getTransactions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    add: (tx: CashTransaction) => {
      const txs = getTransactions();
      txs.push(tx);
      saveTransactions(txs);
    },
    getBalance: (mode?: PaymentMode) => {
      const txs = getTransactions();
      return txs.reduce((acc, tx) => {
        if (mode && tx.paymentMode !== mode) return acc;
        return tx.type === TransactionType.IN ? acc + tx.amount : acc - tx.amount;
      }, 0);
    }
  },
  users: {
    list: (orgId: string) => {
      const allUsers = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      return allUsers.filter((u: User) => u.orgId === orgId);
    },
    invite: (newUser: User) => {
      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      if (users.find((u: any) => u.email === newUser.email)) throw new Error("User already exists");
      users.push(newUser);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },
    updateRole: (userId: string, newRole: UserRole) => {
      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      const index = users.findIndex((u: any) => u.id === userId);
      if (index !== -1) {
        users[index].role = newRole;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
    },
    remove: (userId: string) => {
      let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      users = users.filter((u: any) => u.id !== userId);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
  }
};