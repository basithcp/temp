
const RiskGauge = ({ result }) => {
  if (!result) return null;

  const probability = result.fraud_probability;
  const percentage = (probability * 100).toFixed(1);
  
  let statusText = "";
  if (probability > 0.5) statusText = "HIGH RISK BLOCKED";
  else if (probability >= 0.1) statusText = "SECURITY WARNING";
  else statusText = "APPROVED APPROVED";

  return (
    <div className="risk-gauge-container">
      <div className="gauge-label">
        <span>STATUS: {statusText}</span>
        <span>{percentage}% Risk Score</span>
      </div>
      
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {result.explanation && (
        <div className="result-explanation">
          <strong>ML Model Insight:</strong> {result.explanation}
        </div>
      )}
    </div>
  );
};

export default RiskGauge;