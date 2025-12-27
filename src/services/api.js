import { v4 as uuidv4 } from 'uuid';

// --- LOCAL STORAGE KEYS ---
const USERS_KEY = 'fraudApp_users';
const TRANSACTIONS_KEY = 'fraudApp_transactions';

// --- HELPER: DB ACCESS ---
const getDB = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// --- AUTHENTICATION SIMULATION ---

export const registerMerchant = async (username, password) => {
  await new Promise(r => setTimeout(r, 500)); // Simulate delay
  const users = getDB(USERS_KEY);
  if (users.find(u => u.username === username)) throw new Error("Username already exists");
  
  const newUser = { id: uuidv4(), username, password, role: 'merchant' };
  users.push(newUser);
  setDB(USERS_KEY, users);
  return { id: newUser.id, username: newUser.username, role: newUser.role };
};

export const loginUser = async (username, password, requiredRole) => {
  await new Promise(r => setTimeout(r, 500));
  
  // Hardcoded Admin for testing
  if (requiredRole === 'admin' && username === 'admin' && password === 'admin123') {
    return { id: 'admin-1', username: 'admin', role: 'admin' };
  }

  const users = getDB(USERS_KEY);
  const user = users.find(u => u.username === username && u.password === password && u.role === 'merchant');

  if (!user && requiredRole === 'merchant') throw new Error("Invalid credentials");
  if (!user && requiredRole === 'admin') throw new Error("Not an admin account");
  
  return { id: user.id, username: user.username, role: user.role };
};


// --- RISK API SIMULATION (POST) ---

export const analyzeRisk = async (transactionPayload, currentUser) => {
    // 1. Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // 2. Generate Unique ID
    const transactionId = uuidv4().slice(0, 8).toUpperCase();

    // 3. Fake ML Logic (High amount = high risk for demo)
    const isHighAmount = transactionPayload.Amount > 5000;
    // Add some randomness for "moderate" results
    let probability = isHighAmount ? (Math.random() * 0.2 + 0.8) : (Math.random() * 0.15); 
    if(transactionPayload.Amount > 1000 && transactionPayload.Amount <= 5000) {
         probability = Math.random() * 0.4 + 0.1; // Moderate range
    }
    
    let riskLabel = 'low';
    if (probability > 0.5) riskLabel = 'high';
    else if (probability >= 0.1) riskLabel = 'moderate';

    const result = {
      transaction_id: transactionId,
      fraud_probability: parseFloat(probability.toFixed(4)),
      risk_label: riskLabel,
      explanation: isHighAmount ? "Amount exceeds typical threshold." : "Transaction pattern is normal.",
      timestamp: new Date().toISOString()
    };

    // 4. "SAVE TO DATABASE" (LocalStorage)
    const newRecord = {
        ...result,
        payload: transactionPayload, // Store the input inputs (Amount, V1-V28)
        merchant_username: currentUser.username || 'demo_user'
    };

    const transactions = getDB(TRANSACTIONS_KEY);
    transactions.unshift(newRecord); // Add to start of array
    setDB(TRANSACTIONS_KEY, transactions);

    alert(`Transaction ${transactionId} Posted & Saved!`);
    return result;
};

// --- ADMIN API SIMULATION (GET) ---

export const getAllTransactions = async () => {
    await new Promise(r => setTimeout(r, 500));
    // Read from our fake localstorage DB
    return getDB(TRANSACTIONS_KEY);
}