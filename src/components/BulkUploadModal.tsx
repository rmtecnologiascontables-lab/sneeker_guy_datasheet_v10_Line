import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product, OrderStatus } from '../types';
import { cn } from '../lib/utils';

interface BulkUploadModalProps {
  onUpload: (products: Partial<Product>[]) => Promise<void>;
  onClose: () => void;
}

export function BulkUploadModal({ onUpload, onClose }: BulkUploadModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isParsing, setIsParsing] = React.useState(false);
  const [parsedData, setParsedData] = React.useState<any[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setIsParsing(true);
    setParsedData(null);
    setError(null);

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        setParsedData(Array.isArray(data) ? data : [data]);
      } else if (['xlsx', 'xls', 'csv'].includes(extension || '')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setParsedData(jsonData);
      } else if (extension === 'pdf') {
        // PDF parsing usually requires more than just frontend logic or complex libraries
        // For now, we notify that PDF is experimental
        setError("El formato PDF requiere procesamiento avanzado. Por favor usa Excel o CSV para mayor precisión.");
      } else {
        setError("Formato de archivo no soportado. Usa XLS, XLSX, CSV o JSON.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al leer el archivo. Asegúrate de que el formato sea válido.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!parsedData) return;
    setIsUploading(true);

    // Map extracted data to Product schema
    const productsToUpload: Partial<Product>[] = parsedData.map(item => ({
      sku: (item.SKU || item.SKU || item.id || '').toString(),
      name: (item.Nombre || item.Modelo || item.Name || item.ARTICULO || '').toString(),
      brand: (item.Marca || item.Brand || item.MARCA || '').toString(),
      category: (item.Categoria || item.Category || item.CATEGORIA || '').toString(),
      subcategory: (item.Subcategoria || item.Subcategory || item.SUBCATEGORIA || '').toString(),
      buyPriceUsd: parseFloat(item['Costo USD'] || item.CostUSD || item.buyPriceUsd || 0),
      quantity: parseInt(item.Cantidad || item.Stock || item.quantity || 1),
      minStock: parseInt(item['Stock Minimo'] || item.minStock || 0),
      currentStatus: (item.Status || item.Status || 'COMPRADO') as OrderStatus,
      notes: (item.Notas || item.Notes || '').toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })).filter(p => p.name || p.sku);

    try {
      await onUpload(productsToUpload);
      onClose();
    } catch (err) {
      setError("Error al subir los datos al servidor.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white max-w-2xl w-full rounded-[2rem] overflow-hidden shadow-2xl border border-brand-border flex flex-col max-h-[90vh]"
      >
        <div className="px-8 py-6 border-b border-brand-border flex items-center justify-between bg-[#F8FAF9]">
          <div>
            <h3 className="text-xl font-black text-brand-ink uppercase tracking-tight">Carga Masiva de Stock</h3>
            <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-1">Sincronización de Inventario vía Datasheet</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group",
              file ? "border-brand-accent bg-brand-accent/5" : "border-brand-border hover:border-brand-ink/20 bg-[#FBFBFB] hover:bg-[#F8FAF9]"
            )}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept=".csv, .xlsx, .xls, .json, .pdf"
              onChange={handleFileChange}
            />
            
            {!file ? (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-brand-border flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="text-brand-ink" size={28} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-brand-ink uppercase tracking-tight">Selecciona tu archivo de datos</p>
                  <p className="text-[10px] text-brand-muted font-bold uppercase tracking-[0.1em] mt-1">Excel (XLS/XLSX), CSV o JSON</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-brand-accent text-white rounded-2xl shadow-xl flex items-center justify-center">
                  {file.name.endsWith('.json') ? <FileJson size={28} /> : file.name.endsWith('.pdf') ? <FileText size={28} /> : <FileSpreadsheet size={28} />}
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-brand-ink uppercase tracking-tight">{file.name}</p>
                  <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest mt-1">Archivo preparado para captura</p>
                </div>
              </>
            )}
          </div>

          {isParsing && (
            <div className="flex items-center justify-center gap-3 text-brand-muted italic py-4">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest">Analizando estructura de datos...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          {parsedData && !error && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Datos capturados exitosamente</span>
                </div>
                <span className="px-3 py-1 bg-brand-ink text-white rounded-full text-[10px] font-black">{parsedData.length} FILAS</span>
              </div>

              <div className="border border-brand-border rounded-2xl overflow-hidden">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-[#F8FAF9] border-b border-brand-border">
                    <tr>
                      <th className="px-4 py-3 font-black uppercase tracking-wider">Identificador / SKU</th>
                      <th className="px-4 py-3 font-black uppercase tracking-wider">Articulo</th>
                      <th className="px-4 py-3 font-black uppercase tracking-wider text-right">Costo USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-brand-muted">{row.SKU || row.id || row.PEDIDO || 'N/A'}</td>
                        <td className="px-4 py-3 truncate max-w-[200px] font-bold text-brand-ink">{row.Nombre || row.Modelo || row.ARTICULO || 'Desconocido'}</td>
                        <td className="px-4 py-3 text-right font-black">${row['Costo USD'] || row.buyPriceUsd || 0}</td>
                      </tr>
                    ))}
                    {parsedData.length > 5 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-center text-brand-muted italic bg-gray-50/50">
                          ... y {parsedData.length - 5} artículos más
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-brand-accent/10 rounded-2xl border border-brand-accent/20">
                <p className="text-[10px] text-brand-accent-dark font-bold leading-relaxed uppercase tracking-tight">
                  Asegúrate que los encabezados de tu archivo coincidan con: <b>SKU, Nombre, Marca, Categoria, Costo USD, Cantidad</b>. 
                  Los campos no encontrados se inicializarán con valores por defecto.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-[#F8FAF9] border-t border-brand-border flex items-center justify-end gap-4">
          <button 
            disabled={isUploading}
            onClick={onClose}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted hover:text-brand-ink disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            disabled={!parsedData || isUploading || !!error}
            onClick={handleConfirmUpload}
            className="px-10 py-4 bg-brand-ink text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center gap-2"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {isUploading ? 'Capturando en Sheets...' : 'Confirmar Importación'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
