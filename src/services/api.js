// Change this to false when your Python Flask server is running
const USE_MOCK_DATA = true; 
const API_URL = "http://localhost:5000/analyze-risk";

export const analyzeRisk = async (transactionData) => {
  if (USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple logic: if amount > 5000, pretend it's fraud for testing
    const isHighAmount = transactionData.Amount > 5000;
    const probability = isHighAmount ? 0.92 : 0.04;
    
    return {
      fraud_probability: probability,
      risk_label: probability > 0.5 ? "high" : "low",
      explanation: isHighAmount 
        ? "Unusually high transaction amount for this time window." 
        : "Transaction appears normal."
    };
  }

  // Real API Call
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) throw new Error("API Connection Failed");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};