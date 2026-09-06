/**
 * Generates an aesthetically pleasing, high-fidelity medical PDF report.
 * Opens an isolated print window with rich visual elements, SVG charts, and structured clinical summaries.
 */

const DISEASE_CATEGORIES = {
  "Asthma": "Respiratory",
  "Bronchitis": "Respiratory",
  "Pneumonia": "Respiratory",
  "Tuberculosis": "Respiratory",
  "COPD": "Respiratory",
  "Common Cold": "Respiratory",
  "Influenza": "Respiratory",
  "COVID-19": "Infectious",
  "Migraine": "Neurological",
  "Migraine with Aura": "Neurological",
  "Tension Headache": "Neurological",
  "Epilepsy": "Neurological",
  "Stroke": "Neurological",
  "Appendicitis": "Digestive",
  "Gastritis": "Digestive",
  "GERD": "Digestive",
  "Peptic Ulcer": "Digestive",
  "Jaundice": "Digestive",
  "Hepatitis A": "Digestive",
  "Hepatitis B": "Digestive",
  "Gastroenteritis": "Digestive",
  "Typhoid": "Infectious",
  "Malaria": "Infectious",
  "Dengue Fever": "Infectious",
  "Chickenpox": "Infectious",
  "Hypertension": "Cardiovascular",
  "Coronary Artery Disease": "Cardiovascular",
  "Heart Attack": "Cardiovascular",
  "Arrhythmia": "Cardiovascular",
  "Diabetes Type 1": "Metabolic",
  "Diabetes Type 2": "Metabolic",
  "Hyperthyroidism": "Endocrine",
  "Hypothyroidism": "Endocrine",
  "Urinary Tract Infection": "Urologic",
  "Kidney Stones": "Urologic",
  "Chronic Kidney Disease": "Urologic",
  "Arthritis": "Musculoskeletal",
  "Osteoarthritis": "Musculoskeletal",
  "Rheumatoid Arthritis": "Musculoskeletal",
  "Eczema": "Dermatologic",
  "Psoriasis": "Dermatologic",
  "Acne": "Dermatologic",
  "Fungal Infection": "Dermatologic",
};

export function generatePdfReport({ prediction, user, date }) {
  if (!prediction) return;

  const topDisease = prediction.top_disease || prediction.top_prediction?.disease || "Undetermined";
  const confidence = prediction.confidence || prediction.top_prediction?.confidence || 0;
  const symptoms = prediction.detected_symptoms || [];
  const otherPredictions = prediction.other_predictions || [];
  const riskLevel = prediction.risk_level || "Low";
  const inputText = prediction.input_text || "Self-reported symptoms";
  const explanation = prediction.explanation || "";
  const recommendations = prediction.recommendations || {};
  const reportDate = date ? new Date(date).toLocaleString() : new Date().toLocaleString();
  const patientName = user?.name || "Patient";
  const patientEmail = user?.email || "patient@mediscan.ai";

  // Derive affected systems reliably
  let affectedSystems = (prediction.affected_systems && prediction.affected_systems.length > 0)
    ? prediction.affected_systems
    : null;

  if (!affectedSystems || affectedSystems.length === 0) {
    const counts = {};
    const topCat = DISEASE_CATEGORIES[topDisease] || "General";
    counts[topCat] = (counts[topCat] || 0) + (confidence || 85);

    (otherPredictions || []).forEach((o) => {
      const cat = DISEASE_CATEGORIES[o.disease] || "General";
      counts[cat] = (counts[cat] || 0) + (o.confidence || 25);
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    affectedSystems = Object.entries(counts).map(([system, val]) => ({
      system,
      percentage: Math.max(10, Math.round((val / total) * 100)),
    })).sort((a, b) => b.percentage - a.percentage);
  }

  const riskColor =
    riskLevel === "High" ? "#dc2626" : riskLevel === "Moderate" ? "#d97706" : "#1e4d2b";
  const riskBg =
    riskLevel === "High" ? "#fef2f2" : riskLevel === "Moderate" ? "#fffbeb" : "#edf5f0";

  const printWindow = window.open("", "_blank", "width=880,height=980");
  if (!printWindow) {
    alert("Please allow popups to download the PDF report.");
    return;
  }

  const colors = ["#1e4d2b", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4"];

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>MEDiScan Medical Report - ${topDisease}</title>
      <style>
        @page {
          size: A4;
          margin: 12mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1f2937;
          background: #ffffff;
          padding: 24px;
          line-height: 1.45;
          font-size: 12px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 2.5px solid #1e4d2b;
          margin-bottom: 14px;
        }
        .logo-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #1e4d2b;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
        }
        .brand-name {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.5px;
        }
        .brand-sub {
          font-size: 10.5px;
          color: #4b5563;
        }
        .meta-info {
          text-align: right;
          font-size: 10.5px;
          color: #6b7280;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 14px;
          background: #fafaf9;
        }
        .card-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #374151;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .patient-row {
          display: flex;
          justify-content: space-between;
          padding: 2.5px 0;
          font-size: 11px;
        }
        .patient-label {
          color: #6b7280;
        }
        .patient-val {
          font-weight: 600;
          color: #111827;
        }
        .primary-result {
          background: linear-gradient(135deg, #edf5f0 0%, #d8ebe0 100%);
          border: 1.5px solid #1e4d2b;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 12px;
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .disease-name {
          font-size: 21px;
          font-weight: 800;
          color: #111827;
        }
        .confidence-badge {
          background: #1e4d2b;
          color: white;
          padding: 3px 12px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
        }
        .progress-bar {
          height: 7px;
          background: #c2decb;
          border-radius: 999px;
          overflow: hidden;
          margin: 6px 0;
        }
        .progress-fill {
          height: 100%;
          background: #1e4d2b;
          border-radius: 999px;
          width: ${confidence}%;
        }
        .badge-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 4px;
        }
        .symptom-tag {
          background: white;
          border: 1px solid #d1e3d7;
          color: #1e4d2b;
          padding: 2.5px 8px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 600;
        }
        
        /* Visual Elements Section */
        .visual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .system-bar {
          margin-bottom: 6px;
        }
        .system-bar-header {
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 2px;
        }
        .bar-track {
          height: 6px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 4px;
        }
        
        .recommendation-box {
          border: 1px solid #cbe2d4;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 12px;
          background: #ffffff;
        }
        .rec-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          margin-bottom: 6px;
          padding-bottom: 5px;
          border-bottom: 1px dashed #f3f4f6;
        }
        .rec-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .rec-icon {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: #edf5f0;
          color: #1e4d2b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 10px;
          shrink: 0;
          margin-top: 1px;
        }
        .rec-content {
          flex: 1;
        }
        .rec-title {
          font-size: 11px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1px;
        }
        .rec-text {
          font-size: 11px;
          color: #4b5563;
          line-height: 1.35;
        }
        .disclaimer {
          margin-top: 10px;
          padding: 7px 10px;
          background: #fefce8;
          border: 1px solid #fef08a;
          border-radius: 6px;
          font-size: 9.5px;
          color: #854d0e;
          text-align: center;
        }
        .footer {
          margin-top: 10px;
          padding-top: 6px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          font-size: 9.5px;
          color: #9ca3af;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-title">
          <div class="logo-icon">✚</div>
          <div>
            <div class="brand-name">MEDiScan</div>
            <div class="brand-sub">AI Disease Analysis & Personal Health Insights</div>
          </div>
        </div>
        <div class="meta-info">
          <div><strong>Report Date:</strong> ${reportDate}</div>
          <div><strong>Report ID:</strong> MDS-${Math.floor(100000 + Math.random() * 900000)}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">Patient Profile</div>
          <div class="patient-row"><span class="patient-label">Name:</span> <span class="patient-val">${patientName}</span></div>
          <div class="patient-row"><span class="patient-label">Email:</span> <span class="patient-val">${patientEmail}</span></div>
          <div class="patient-row"><span class="patient-label">Account:</span> <span class="patient-val">Verified Member</span></div>
        </div>
        <div class="card">
          <div class="card-title">Clinical Risk Assessment</div>
          <div class="patient-row">
            <span class="patient-label">Risk Level:</span>
            <span class="patient-val" style="color: ${riskColor}; background: ${riskBg}; padding: 1px 8px; border-radius: 4px; font-weight: bold;">${riskLevel} Risk</span>
          </div>
          <div class="patient-row"><span class="patient-label">Detected Symptoms:</span> <span class="patient-val">${symptoms.length} identified</span></div>
          <div class="patient-row"><span class="patient-label">Top Confidence:</span> <span class="patient-val">${confidence}% match</span></div>
        </div>
      </div>

      <!-- Main Diagnosis Result -->
      <div class="primary-result">
        <div class="result-header">
          <div>
            <div style="font-size: 10px; color: #1e4d2b; font-weight: 700; text-transform: uppercase;">Most Likely Condition</div>
            <div class="disease-name">${topDisease}</div>
          </div>
          <div class="confidence-badge">${confidence}% Match</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <p style="font-size: 11px; color: #374151; margin-top: 3px;">${explanation}</p>
      </div>

      <!-- Detected Symptoms -->
      <div class="card" style="margin-bottom: 12px;">
        <div class="card-title">Detected Symptoms in Clinical Input</div>
        <p style="font-size: 11px; color: #6b7280; margin-bottom: 5px;"><em>"${inputText}"</em></p>
        <div class="badge-list">
          ${symptoms.map((s) => `<span class="symptom-tag">✓ ${s}</span>`).join("")}
        </div>
      </div>

      <!-- Visual Elements: Differential Diagnoses & Affected Body Systems -->
      <div class="visual-grid">
        <!-- Differential Diagnoses with Visual Bars -->
        <div class="card">
          <div class="card-title">Differential Diagnoses</div>
          <div style="margin-top: 4px;">
            ${
              otherPredictions.length > 0
                ? otherPredictions
                    .map(
                      (o, idx) => `
                  <div class="system-bar">
                    <div class="system-bar-header">
                      <span>${idx + 2}. ${o.disease}</span>
                      <span style="color: #1e4d2b; font-weight: bold;">${o.confidence}%</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill" style="width: ${o.confidence}%; background: ${idx === 0 ? "#1e4d2b" : idx === 1 ? "#2d6a4f" : "#52b788"};"></div>
                    </div>
                  </div>
                `
                    )
                    .join("")
                : '<p style="font-size: 10.5px; color: #9ca3af;">No secondary conditions isolated</p>'
            }
          </div>
        </div>

        <!-- Affected Body Systems Visual Distribution -->
        <div class="card">
          <div class="card-title">Affected Body Systems</div>
          <div style="margin-top: 4px;">
            ${affectedSystems
              .map(
                (item, idx) => `
              <div class="system-bar">
                <div class="system-bar-header">
                  <span><span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${colors[idx % colors.length]}; margin-right: 4px;"></span>${item.system} System</span>
                  <span style="color: ${colors[idx % colors.length]}; font-weight: bold;">${item.percentage}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" style="width: ${item.percentage}%; background: ${colors[idx % colors.length]};"></div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>

      <!-- Personalized AI Health Guidance -->
      <div class="recommendation-box">
        <div class="card-title" style="color: #1e4d2b; margin-bottom: 8px;">✦ Personalized AI Health Guidance</div>
        
        <div class="rec-item">
          <div class="rec-icon">🩺</div>
          <div class="rec-content">
            <div class="rec-title">Recommended Specialist Consultation:</div>
            <div class="rec-text">${recommendations.doctor_consult || `Schedule an evaluation with a ${recommendations.specialist || "General Physician"}.`}</div>
          </div>
        </div>

        <div class="rec-item">
          <div class="rec-icon">❤️</div>
          <div class="rec-content">
            <div class="rec-title">Immediate Care & Comfort Measures:</div>
            <div class="rec-text">${(recommendations.immediate_care || ["Rest in a comfortable environment.", "Maintain clean hydration."]).join(" • ")}</div>
          </div>
        </div>

        <div class="rec-item">
          <div class="rec-icon">🥗</div>
          <div class="rec-content">
            <div class="rec-title">Diet & Recovery Guidance:</div>
            <div class="rec-text">${recommendations.diet_lifestyle || "Prioritize light digestible nutrition and restorative rest."}</div>
          </div>
        </div>

        <div class="rec-item">
          <div class="rec-icon" style="background: #fee2e2; color: #dc2626;">⚠️</div>
          <div class="rec-content">
            <div class="rec-title" style="color: #b91c1c;">Warning Signs (When to seek urgent care):</div>
            <div class="rec-text" style="color: #991b1b;">${recommendations.red_flags || "Seek emergency care if severe pain, difficulty breathing, or dizziness occurs."}</div>
          </div>
        </div>
      </div>

      <div class="disclaimer">
        <strong>MEDICAL DISCLAIMER:</strong> This report is generated by an educational AI model (MEDiScan) for informational purposes only. It does not replace professional medical advice, diagnosis, or treatment.
      </div>

      <div class="footer">
        <span>MEDiScan Digital Clinical Engine v2.0</span>
        <span>Confidential Medical Analysis</span>
        <span>Page 1 of 1</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
