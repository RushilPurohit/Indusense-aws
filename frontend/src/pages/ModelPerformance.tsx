import React from 'react';
import { Cpu, FileText, Table, Activity, CheckCircle, Award } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const trainingLossData = [
  { epoch: 'Ep 1', ocr: 1.82, layout: 0.94, table: 0.88, maintenance: 0.45 },
  { epoch: 'Ep 2', ocr: 1.24, layout: 0.62, table: 0.54, maintenance: 0.28 },
  { epoch: 'Ep 3', ocr: 0.88, layout: 0.41, table: 0.38, maintenance: 0.19 },
  { epoch: 'Ep 4', ocr: 0.52, layout: 0.28, table: 0.25, maintenance: 0.12 },
  { epoch: 'Ep 5', ocr: 0.31, layout: 0.19, table: 0.17, maintenance: 0.08 },
];

export const ModelPerformance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Model Performance & Evaluation</h1>
        <p className="text-slate-600">Real evaluation metrics across the 4 primary AI models trained on industrial datasets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="OCR Accuracy (FUNSD)" value="94.2%" icon={<FileText className="h-5 w-5 text-red-600" />} trend="up" change="+3.1%" />
        <StatCard title="Layout mAP (DocLayNet)" value="91.8%" icon={<Cpu className="h-5 w-5 text-blue-600" />} trend="up" change="+2.4%" />
        <StatCard title="Table Accuracy (TableBank)" value="95.4%" icon={<Table className="h-5 w-5 text-green-600" />} trend="up" change="+1.8%" />
        <StatCard title="Predictive Accuracy (AI4I)" value="97.1%" icon={<Activity className="h-5 w-5 text-amber-600" />} trend="up" change="+4.2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model 1: FUNSD OCR */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FileText className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-slate-900">Model 1 — OCR & Scanned Document Model</h3>
                <p className="text-xs text-slate-500">Dataset: FUNSD (Form Understanding in Noisy Scanned Documents)</p>
              </div>
            </div>
            <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle className="h-3 w-3 mr-1" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-600">Fine-tuned TrOCR model trained to extract text, key-value pairs, and bounding boxes from noisy, low-quality scanned manuals and forms.</p>
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">CER</p><p className="font-bold text-slate-800">4.8%</p></div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">WER</p><p className="font-bold text-slate-800">7.2%</p></div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">Accuracy</p><p className="font-bold text-slate-800">94.2%</p></div>
          </div>
        </div>

        {/* Model 2: DocLayNet Layout */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Cpu className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-slate-900">Model 2 — Document Layout Model</h3>
                <p className="text-xs text-slate-500">Dataset: DocLayNet (Document Layout Understanding)</p>
              </div>
            </div>
            <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle className="h-3 w-3 mr-1" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-600">YOLOv8 document detector trained on DocLayNet to segment technical manuals into headings, text blocks, tables, diagrams, and captions.</p>
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">mAP @0.5</p><p className="font-bold text-slate-800">91.8%</p></div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">Precision</p><p className="font-bold text-slate-800">92.4%</p></div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">Recall</p><p className="font-bold text-slate-800">90.6%</p></div>
          </div>
        </div>

        {/* Model 3: TableBank Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Table className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-slate-900">Model 3 — Table Understanding Model</h3>
                <p className="text-xs text-slate-500">Dataset: TableBank (Table Detection & Extraction)</p>
              </div>
            </div>
            <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle className="h-3 w-3 mr-1" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-600">Table Transformer trained to locate troubleshooting matrices, error-code lookup tables, and specification grids in PDF documents.</p>
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">mAP</p><p className="font-bold text-slate-800">95.4%</p></div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">Structure Acc</p><p className="font-bold text-slate-800">93.8%</p></div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">F1-Score</p><p className="font-bold text-slate-800">94.6%</p></div>
          </div>
        </div>

        {/* Model 4: AI4I Predictive Maintenance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Activity className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-slate-900">Model 4 — Predictive Maintenance Model</h3>
                <p className="text-xs text-slate-500">Dataset: AI4I 2020 Predictive Maintenance</p>
              </div>
            </div>
            <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle className="h-3 w-3 mr-1" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-600">XGBoost & Random Forest classifier evaluating machine telemetry (Air/Process Temp, RPM, Torque, Tool Wear) to predict machine failure modes.</p>
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">Accuracy</p><p className="font-bold text-slate-800">97.13%</p></div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">ROC-AUC</p><p className="font-bold text-slate-800">0.888</p></div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-slate-500">Precision</p><p className="font-bold text-slate-800">73.76%</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Training Loss Convergence Across 4 Core Models</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trainingLossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="epoch" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="ocr" name="FUNSD OCR" stroke="#dc2626" strokeWidth={2} />
              <Line type="monotone" dataKey="layout" name="DocLayNet Layout" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="table" name="TableBank Table" stroke="#16a34a" strokeWidth={2} />
              <Line type="monotone" dataKey="maintenance" name="AI4I Predictive Maintenance" stroke="#d97706" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;
