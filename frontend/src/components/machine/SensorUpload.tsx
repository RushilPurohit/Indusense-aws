import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileSpreadsheet, Loader2, UploadCloud, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import client from '../../api/client';

interface Props {
  onPredictionComplete: (result: any, rawData: any[]) => void;
}

const REQUIRED_COLS = [
  'Air temperature [K]',
  'Process temperature [K]',
  'Rotational speed [rpm]',
  'Torque [Nm]',
  'Tool wear [min]',
];

const DEMO_ROWS = [
  { 'Air temperature [K]': 298.1, 'Process temperature [K]': 308.6, 'Rotational speed [rpm]': 1551, 'Torque [Nm]': 42.8, 'Tool wear [min]': 50 },
  { 'Air temperature [K]': 300.2, 'Process temperature [K]': 309.8, 'Rotational speed [rpm]': 1420, 'Torque [Nm]': 55.4, 'Tool wear [min]': 140 },
  { 'Air temperature [K]': 302.1, 'Process temperature [K]': 310.8, 'Rotational speed [rpm]': 1315, 'Torque [Nm]': 64.2, 'Tool wear [min]': 216 },
];

const SensorUpload: React.FC<Props> = ({ onPredictionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewCols, setPreviewCols] = useState<string[]>([]);
  const [missingCols, setMissingCols] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [datasets, setDatasets] = useState<{ id: string; name: string; available: boolean }[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    client.get('/machine/datasets')
      .then(response => setDatasets(response.data.filter((dataset: { available: boolean }) => dataset.available)))
      .catch(() => setDatasets([]));
  }, []);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return { headers: [], data: [] };
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((h: string, idx: number) => {
        row[h] = isNaN(Number(vals[idx])) ? vals[idx] : Number(vals[idx]);
      });
      data.push(row);
    }
    return { headers, data };
  };

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setUploadSuccess(false);
    setFileName(file.name);
    setLoading(true);

    try {
      const text = await file.text();
      const { headers, data: rawRows } = parseCSV(text);

      // Validate columns
      const missing = REQUIRED_COLS.filter(c => !headers.includes(c));
      setMissingCols(missing);
      setPreviewCols(headers.slice(0, 7)); // show first 7 columns
      setPreviewRows(rawRows.slice(0, 5));
      setShowPreview(true);

      if (missing.length > 0) {
        setError(`This file is missing required columns: ${missing.join(', ')}`);
        setLoading(false);
        return;
      }

      // Call backend
      const formData = new FormData();
      formData.append('file', file);
      const res = await client.post('/machine/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadSuccess(true);
      onPredictionComplete(res.data, rawRows);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Telemetry analysis failed. Check that the API is running and try again.');
      setUploadSuccess(false);
    } finally {
      setLoading(false);
    }
  }, [onPredictionComplete]);

  const analyzeDataset = async (datasetId: string) => {
    setSelectedDataset(datasetId);
    setError(null);
    setUploadSuccess(false);
    setLoading(true);
    try {
      const response = await client.post(`/machine/datasets/${datasetId}/predict`);
      setFileName(response.data.dataset_name);
      setPreviewRows(response.data.sample_rows || []);
      setPreviewCols(REQUIRED_COLS);
      setMissingCols([]);
      setShowPreview(true);
      setUploadSuccess(true);
      onPredictionComplete(response.data, response.data.sample_rows || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to analyze the selected dataset.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) processFile(file);
    else setError('Please drop a valid .csv file.');
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleClear = () => {
    setFileName(null);
    setPreviewRows([]);
    setPreviewCols([]);
    setMissingCols([]);
    setShowPreview(false);
    setError(null);
    setUploadSuccess(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-primary" />
            Upload Sensor Telemetry
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            AI4I 2020 format · XGBoost / Random Forest model
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Evaluating telemetry…
            </span>
          )}
          {uploadSuccess && !loading && (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Analysis ready
            </span>
          )}
          {fileName && (
            <button
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
              title="Clear upload"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {datasets.length > 0 && (
        <div className="px-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-red-100 bg-red-50/50 px-4 py-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-700">Analyze an included fault dataset</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Use the curated AI4I-derived samples without downloading a file.</p>
            </div>
            <select
              value={selectedDataset}
              onChange={event => event.target.value && analyzeDataset(event.target.value)}
              className="w-full sm:w-56 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700"
            >
              <option value="">Choose dataset...</option>
              {datasets.map(dataset => <option key={dataset.id} value={dataset.id}>{dataset.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div className="p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative block border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200
            ${isDragging
              ? 'border-primary bg-red-50 scale-[1.01]'
              : fileName
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors
              ${fileName ? 'bg-emerald-100' : isDragging ? 'bg-red-100' : 'bg-slate-200'}`}>
              <FileSpreadsheet className={`w-7 h-7 ${fileName ? 'text-emerald-600' : isDragging ? 'text-primary' : 'text-slate-500'}`} />
            </div>
            {fileName ? (
              <>
                <span className="text-sm font-semibold text-emerald-700">{fileName}</span>
                <span className="text-xs text-slate-500 mt-1">Click to replace file</span>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold text-slate-700">
                  {isDragging ? 'Drop CSV file here' : 'Drag & drop or click to upload'}
                </span>
                <span className="text-xs text-slate-400 mt-1">Supports AI4I 2020 sensor CSV format</span>
              </>
            )}
          </div>
        </label>

        {/* Required columns hint */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Columns</p>
          <div className="flex flex-wrap gap-1.5">
            {REQUIRED_COLS.map(col => (
              <span
                key={col}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium
                  ${missingCols.includes(col)
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : uploadSuccess
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-white text-slate-600 border border-slate-300'
                  }`}
              >
                {missingCols.includes(col) && <AlertCircle className="inline w-2.5 h-2.5 mr-1" />}
                {col}
              </span>
            ))}
          </div>
          {missingCols.length > 0 && (
            <p className="text-[11px] text-red-600 mt-2 font-medium">
              ⚠ Missing columns detected — using demo data for preview.
            </p>
          )}
        </div>

        {/* CSV Preview table */}
        {showPreview && previewRows.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowPreview(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2"
            >
              {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Data preview ({previewRows.length} rows shown)
            </button>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold uppercase tracking-wider">#</th>
                    {previewCols.map(col => (
                      <th key={col} className="text-left px-3 py-2 text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-3 py-2 text-slate-400 font-mono">{i + 1}</td>
                      {previewCols.map(col => (
                        <td key={col} className="px-3 py-2 text-slate-700 font-mono whitespace-nowrap">
                          {row[col] !== undefined ? String(row[col]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorUpload;
