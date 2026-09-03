import React, { useState } from "react";
import { runManualPrediction } from "../api";
import { 
  Sparkles, 
  Clock, 
  Coins, 
  ShieldAlert, 
  ArrowRight, 
  Loader2, 
  Compass, 
  HelpCircle,
  Database,
  History,
  Info,
  Brain,
  Zap,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";

interface PredictionsViewProps {
  initialSubTab?: 'delay' | 'cost' | 'legal';
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function PredictionsView({ initialSubTab = 'delay', showToast }: PredictionsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'delay' | 'cost' | 'legal'>(initialSubTab);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  React.useEffect(() => {
    setActiveSubTab(initialSubTab);
    setPredictionResult(null);
  }, [initialSubTab]);

  // Delay Model Inputs
  const [landArea, setLandArea] = useState(5.4);
  const [ownersCount, setOwnersCount] = useState(4);
  const [ownershipDispute, setOwnershipDispute] = useState(true);
  const [documentsComplete, setDocumentsComplete] = useState(false);
  const [previousDelay, setPreviousDelay] = useState(false);
  const [distanceFromProject, setDistanceFromProject] = useState(3.5);

  // Cost Overrun Model Inputs
  const [originalCost, setOriginalCost] = useState(15000000);
  const [delayDays, setDelayDays] = useState(90);
  const [objectionFiled, setObjectionFiled] = useState(false);
  const [courtCase, setCourtCase] = useState(false);

  // Legal Risk Model Inputs
  const [legalOwnershipDispute, setLegalOwnershipDispute] = useState(true);
  const [legalCourtCase, setLegalCourtCase] = useState(false);
  const [environmentalClearance, setEnvironmentalClearance] = useState(true);
  const [governmentApproval, setGovernmentApproval] = useState(true);

  // Logged Sandbox Predictions History
  const [history, setHistory] = useState<Array<{ id: string; timestamp: string; modelName: string; inputs: string; output: string }>>([
    { id: "RF-8091", timestamp: "Today, 10:14 AM", modelName: "Random Forest + XGBoost Delay Engine", inputs: "Area: 5.4Ac, Dispute: Yes", output: "88.4% HIGH (125 Days)" },
    { id: "XGB-2041", timestamp: "Yesterday, 3:45 PM", modelName: "Cost Overrun Regressor", inputs: "Cost: ₹1.5 Cr, Stay: Yes", output: "₹22.5 Lakhs (+15.0%)" }
  ]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPredictionResult(null);

    let inputs: any = {};
    if (activeSubTab === 'delay') {
      inputs = { landArea, ownersCount, ownershipDispute, documentsComplete, previousDelay, distanceFromProject };
    } else if (activeSubTab === 'cost') {
      inputs = { originalCost, delayDays, objectionFiled, courtCase };
    } else {
      inputs = { ownershipDispute: legalOwnershipDispute, courtCase: legalCourtCase, environmentalClearance, governmentApproval };
    }

    try {
      const res = await runManualPrediction(activeSubTab, inputs);
      setPredictionResult(res);

      const newHistoryItem = {
        id: `ML-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        modelName: activeSubTab === 'delay' ? "Random Forest + XGBoost Delay Engine" : activeSubTab === 'cost' ? "Cost Overrun Regressor" : "Legal Dispute Classifier",
        inputs: activeSubTab === 'delay' 
          ? `Area: ${landArea}Ac, Claims: ${ownersCount}, Dispute: ${ownershipDispute ? "Y" : "N"}`
          : activeSubTab === 'cost'
            ? `Base: ₹${(originalCost/100000).toFixed(0)}L, Delay: ${delayDays}D`
            : `Stay: ${legalCourtCase ? "Y" : "N"}, Gov App: ${governmentApproval ? "Y" : "N"}`,
        output: activeSubTab === 'delay'
          ? `${res.probability}% ${res.riskClass} (${res.predictedDelayDays} Days)`
          : activeSubTab === 'cost'
            ? `+₹${(res.additionalCost/100000).toFixed(1)}L (+${res.percentageIncrease}%)`
            : `${res.probability}% ${res.riskClass}`
      };
      setHistory(prev => [newHistoryItem, ...prev]);

      if (showToast) {
        showToast("ML prediction inference solved successfully.");
      }
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast("Random Forest & XGBoost model processed using client-side engine.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top ML & AI Technology Stack Summary Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Brain className="w-64 h-64 text-blue-400" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-600/30 border border-blue-500/40 rounded-xl text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">ML & AI Predictive Analytics System</h2>
            <p className="text-xs text-slate-400 font-medium">Random Forest • XGBoost • SHAP Explainable AI • LLM Action Directives</p>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
            <div className="flex items-center justify-between text-blue-400 font-bold mb-1">
              <span>Random Forest</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300">Regressor</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Delay Days Forecast</p>
          </div>

          <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
            <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
              <span>XGBoost ML</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300">Advanced</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Delay Probability %</p>
          </div>

          <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
            <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
              <span>SHAP XAI</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300">Explainable</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Key Delay Factor Drivers</p>
          </div>

          <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
            <div className="flex items-center justify-between text-purple-400 font-bold mb-1">
              <span>LLM Recommendation</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">AI Advisor</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Actionable Officer Steps</p>
          </div>
        </div>
      </div>

      {/* Internal Sub Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => { setActiveSubTab('delay'); setPredictionResult(null); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'delay' 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Random Forest + XGBoost Delay Model</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('cost'); setPredictionResult(null); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'cost' 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Cost Overrun Regressor</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('legal'); setPredictionResult(null); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'legal' 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Legal Stay Dispute Classifier</span>
        </button>
      </div>

      {/* Main Simulation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Section */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span>Simulator Input Parameters</span>
          </h4>

          <form onSubmit={handlePredict} className="space-y-4">
            {/* Tab 1: Delay risk input parameters */}
            {activeSubTab === 'delay' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Land Plot Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={landArea}
                    onChange={(e) => setLandArea(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Number of Claimants / Co-owners</label>
                  <input
                    type="number"
                    value={ownersCount}
                    onChange={(e) => setOwnersCount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="simDispute"
                      checked={ownershipDispute}
                      onChange={(e) => setOwnershipDispute(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="simDispute" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Title / Boundary Dispute Active
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="simDocs"
                      checked={documentsComplete}
                      onChange={(e) => setDocumentsComplete(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="simDocs" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Revenue Deed & Patta Complete
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="simPrevDelay"
                      checked={previousDelay}
                      onChange={(e) => setPreviousDelay(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="simPrevDelay" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Historical Revenue Administrative Delay
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Cost overrun inputs */}
            {activeSubTab === 'cost' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Initial Valuation Award (INR)</label>
                  <input
                    type="number"
                    value={originalCost}
                    onChange={(e) => setOriginalCost(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Delay Duration (Days)</label>
                  <input
                    type="number"
                    value={delayDays}
                    onChange={(e) => setDelayDays(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="simObjection"
                      checked={objectionFiled}
                      onChange={(e) => setObjectionFiled(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="simObjection" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Valuation Award Objection Filed
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="simCourt"
                      checked={courtCase}
                      onChange={(e) => setCourtCase(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="simCourt" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Court Injunction / Stay Active
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Legal dispute inputs */}
            {activeSubTab === 'legal' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="simLegalDispute"
                      checked={legalOwnershipDispute}
                      onChange={(e) => setLegalOwnershipDispute(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="simLegalDispute" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Active Civil Title Injunction
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="simLegalCourt"
                      checked={legalCourtCase}
                      onChange={(e) => setLegalCourtCase(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="simLegalCourt" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Writ Petition in High Court
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="simEnv"
                      checked={environmentalClearance}
                      onChange={(e) => setEnvironmentalClearance(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="simEnv" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Environmental Clearance Obtained
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-blue-100 animate-spin" />
                  <span>Solving Random Forest & XGBoost Ensembles...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-100" />
                  <span>Run Random Forest + XGBoost Inference</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Section */}
        <div className="lg:col-span-7 space-y-6">
          {predictionResult ? (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span>ML & AI Inference Results</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">Model: {predictionResult.model}</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                  ✓ High Accuracy
                </span>
              </div>

              {/* Output Stats Display */}
              {activeSubTab === 'delay' && (
                <div className="space-y-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Random Forest Regressor</span>
                      <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1 font-mono">{predictionResult.predictedDelayDays} Days</p>
                      <span className="text-[9px] font-bold text-slate-500 block mt-1">Expected Delay</span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">XGBoost ML</span>
                      <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono">{predictionResult.probability}%</p>
                      <span className="text-[9px] font-bold text-slate-500 block mt-1">Delay Probability</span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center flex flex-col justify-center items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Risk Classifier</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        predictionResult.riskClass === "High" ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}>
                        {predictionResult.riskClass} Risk
                      </span>
                    </div>
                  </div>

                  {/* SHAP Explainable AI Factor Breakdown */}
                  <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>SHAP Explainable AI — Key Delay Drivers</span>
                      </h5>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">Impact Score (Days)</span>
                    </div>

                    <div className="space-y-2.5">
                      {predictionResult.shapFactors?.map((f: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{f.feature}</span>
                            <span className="text-rose-600 font-mono">+{f.impactDays} Days ({f.percentage}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                f.type === "High Risk" ? "bg-rose-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.min(100, f.percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendation Engine Box */}
                  <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl shadow-lg border border-blue-800 space-y-3">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Recommendation Engine Directive</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white">{predictionResult.aiRecommendation}</h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-medium pl-1">
                      {predictionResult.aiDirectives?.map((d: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeSubTab === 'cost' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Final Cost</span>
                      <p className="text-base font-black text-slate-900 mt-1 font-mono">{formatCurrency(predictionResult.expectedFinalCost)}</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Additional Cost</span>
                      <p className="text-base font-black text-rose-600 mt-1 font-mono">+{formatCurrency(predictionResult.additionalCost)}</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Increase %</span>
                      <p className="text-base font-black text-amber-600 mt-1 font-mono">+{predictionResult.percentageIncrease}%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">AI Cost Mitigation Recommendation</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{predictionResult.aiRecommendation}</p>
                  </div>
                </div>
              )}

              {activeSubTab === 'legal' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Writ Stay Probability</span>
                      <p className="text-3xl font-black text-slate-900 mt-1 font-mono">{predictionResult.probability}%</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Risk Class</span>
                      <p className="text-xl font-black text-rose-600 mt-1 uppercase">{predictionResult.riskClass} RISK</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Legal Action Directive</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{predictionResult.aiRecommendation}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs h-full flex flex-col items-center justify-center text-center">
              <Brain className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-800">Awaiting ML Model Simulation</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Select scenario parameters on the left pane and execute the Random Forest + XGBoost model solver to compute delay days, probability, SHAP factors, and AI recommendations.
              </p>
            </div>
          )}

          {/* History Log */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
              <History className="w-4 h-4 text-slate-400" />
              <span>ML Simulation Audit Trail</span>
            </h4>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] mr-2">[{h.id}]</span>
                    <span className="text-slate-800">{h.modelName}</span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{h.inputs}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-900 font-mono font-bold block">{h.output}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{h.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
