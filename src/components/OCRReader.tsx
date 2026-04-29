import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Search, 
  Sparkles, 
  Trash2, 
  ImageIcon, 
  Loader2,
  Check,
  CheckCircle2,
  Zap,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// --- Hooks ---

/**
 * Hook to manage Object URL lifecycle
 */
export function useObjectURL(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const newUrl = URL.createObjectURL(file);
    setUrl(newUrl);

    return () => {
      URL.revokeObjectURL(newUrl);
    };
  }, [file]);

  return url;
}

// --- Components ---

export interface OCRData {
  category: string;
  brand: string;
  name: string;
  color_description: string;
  gender: string;
  size: string;
  buyPriceUsd?: number;
}

interface LectorOCRProps {
  onScan: (file: File) => Promise<OCRData | void>;
  onUpdate: (data: Partial<OCRData>) => void;
  currentItem: any;
  isScanning: boolean;
}

export function LectorOCR({ onScan, onUpdate, currentItem, isScanning }: LectorOCRProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const previewUrl = useObjectURL(selectedFile);
  
  // Use currentItem.imageUrl as fallback if no local file is selected yet
  const displayImage = previewUrl || currentItem.imageUrl;

  const handleFile = (file: File) => {
    setSelectedFile(file);
    onScan(file);
  };

  return (
    <div className="space-y-6">
      <ImageDropzone 
        onFileSelect={handleFile}
        displayImage={displayImage}
        isScanning={isScanning}
        onReset={() => {
          setSelectedFile(null);
          onUpdate({ imageUrl: '' } as any);
        }}
        onZoom={() => setShowModal(true)}
      />

      <motion.button
        whileHover={!isScanning ? { scale: 1.02 } : {}}
        whileTap={!isScanning ? { scale: 0.98 } : {}}
        type="button"
        disabled={isScanning || !displayImage}
        onClick={() => selectedFile && onScan(selectedFile)}
        className={cn(
          "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-2",
          isScanning || !displayImage
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
            : "bg-gradient-to-br from-[#10B981] to-[#3B82F6] border-white/20 text-white shadow-xl shadow-brand-accent/20"
        )}
      >
        {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
        {isScanning ? 'Procesando Inteligencia Artificial...' : 'Escanear con Gemini AI'}
      </motion.button>

      <AnimatePresence>
        {showModal && displayImage && (
          <OCRModal 
            imageUrl={displayImage} 
            data={currentItem} 
            onUpdate={onUpdate}
            onClose={() => setShowModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageDropzone({ onFileSelect, displayImage, isScanning, onReset, onZoom }: { 
  onFileSelect: (file: File) => void, 
  displayImage: string | null, 
  isScanning: boolean,
  onReset: () => void,
  onZoom: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div 
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        "relative group aspect-square rounded-3xl border-2 border-dashed transition-all overflow-hidden shadow-inner",
        displayImage ? "border-brand-ink/10 bg-white" : "border-gray-200 bg-gray-50/50 hover:border-brand-ink/30"
      )}
    >
      {displayImage ? (
        <div className="absolute inset-0">
          <img 
            src={displayImage} 
            alt="Preview" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={onZoom}
              className="p-3 rounded-full bg-white text-brand-ink shadow-xl hover:scale-110 transition-transform"
            >
              <Maximize2 size={20} />
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="p-3 rounded-full bg-red-500 text-white hover:scale-110 transition-transform shadow-xl"
            >
              <Trash2 size={20} />
            </button>
          </div>
          
          {isScanning && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-brand-accent" size={40} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Analizando...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-brand-border flex items-center justify-center text-brand-muted group-hover:text-brand-ink transition-all group-hover:rotate-6">
            {isScanning ? <Loader2 className="animate-spin" size={28} /> : <ImageIcon size={28} />}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-brand-ink uppercase tracking-tight">Dropzone de Imagen</p>
            <p className="text-[10px] text-brand-muted font-bold tracking-widest uppercase">Arrastra, pega o selecciona</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-brand-ink text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-ink/90 transition-all shadow-xl active:scale-95"
          >
            Explorar
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*" 
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }} 
          />
        </div>
      )}
    </div>
  );
}

export function OCRModal({ imageUrl, data, onUpdate, onClose, totalItems = 1, currentItemIndex = 1 }: { 
  imageUrl: string, 
  data: any, 
  onUpdate: (data: Partial<OCRData>) => void,
  onClose: () => void,
  totalItems?: number,
  currentItemIndex?: number
}) {
  const [zoom, setZoom] = useState(100);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 lg:p-6 overflow-hidden"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="w-full max-w-[1600px] h-full lg:h-[95vh] flex flex-col bg-[#0F0F0F] rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 relative"
      >
        {/* Header - High End Dark Mode */}
        <header className="px-8 py-5 flex items-center justify-between border-b border-white/5 bg-[#141414]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/20 flex items-center justify-center text-brand-accent shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Search size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Verificación OCR</h2>
              <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest leading-none">
                Ítem {currentItemIndex} de {totalItems} • Compara la imagen con los datos detectados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <button type="button" onClick={() => setZoom(z => Math.max(50, z - 25))} className="p-1 hover:text-white text-brand-muted transition-colors"><ZoomOut size={16} /></button>
              <span className="text-[10px] font-mono font-black text-white px-2">{zoom}%</span>
              <button type="button" onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-1 hover:text-white text-brand-muted transition-colors"><ZoomIn size={16} /></button>
              <div className="w-px h-3 bg-white/10 mx-1" />
              <button type="button" className="p-1 hover:text-white text-brand-muted transition-colors"><Maximize size={16} /></button>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-brand-muted hover:text-white rounded-2xl transition-all flex items-center justify-center"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Left: Image Side with Custom Controls */}
          <div className="flex-1 bg-[#050505] relative overflow-hidden flex flex-col border-r border-white/5">
            <div className="flex-1 overflow-auto custom-scrollbar flex items-center justify-center p-12 bg-[radial-gradient(circle_at_center,_#111_0%,_transparent_100%)]">
              <motion.div 
                style={{ scale: zoom / 100 }}
                className="transition-transform duration-300"
              >
                <img 
                  src={imageUrl} 
                  alt="OCR Verification" 
                  className="max-h-[75vh] w-auto rounded-xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/5 pointer-events-none select-none"
                />
              </motion.div>
            </div>

            {/* Bottom Float Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A]/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-6 shadow-2xl">
               <button type="button" onClick={() => setZoom(z => Math.max(50, z - 25))} className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all"><ZoomOut size={18} /></button>
               <span className="text-[12px] font-mono font-black text-white min-w-[3rem] text-center">{zoom}%</span>
               <button type="button" onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all"><ZoomIn size={18} /></button>
               <div className="w-px h-6 bg-white/10" />
               <button type="button" onClick={() => setZoom(100)} className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all"><Maximize size={18} /></button>
            </div>
          </div>

          {/* Right: Detected Data Dashboard */}
          <div className="w-full lg:w-[480px] bg-[#111111] border-l border-white/5 p-10 lg:p-14 flex flex-col justify-between">
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Datos Detectados por OCR</h3>
                <div className="w-12 h-1 bg-brand-accent rounded-full" />
              </div>

              <div className="space-y-8 overflow-y-auto max-h-[55vh] pr-4 custom-scrollbar-dark">
                <QuickEditField 
                  label="Categoría" 
                  value={data.category} 
                  options={['CALZADO', 'ACCESORIOS', 'STREETWEAR', 'COLECCIONABLES', 'OTROS']}
                  onChange={val => onUpdate({ category: val })} 
                />
                
                <div className="grid grid-cols-1 gap-6">
                  <QuickEditField 
                    label="Marca" 
                    value={data.brand} 
                    placeholder="Ej: Nike"
                    onChange={val => onUpdate({ brand: val })} 
                  />
                  <QuickEditField 
                    label="Modelo" 
                    value={data.name} 
                    placeholder="Ej: Air Jordan 1..."
                    onChange={val => onUpdate({ name: val })} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <QuickEditField 
                    label="Género" 
                    value={data.gender || 'UNISEX'} 
                    options={['HOMBRE', 'MUJER', 'UNISEX', 'KIDS']}
                    onChange={val => onUpdate({ gender: val })} 
                  />
                  <QuickEditField 
                    label="Color" 
                    value={data.color_description || ''} 
                    placeholder="Forest Fog"
                    onChange={val => onUpdate({ color_description: val.toUpperCase() })} 
                  />
                </div>
                
                <QuickEditField 
                  label="Talla" 
                  value={data.size || ''} 
                  placeholder="29W x 29L"
                  onChange={val => onUpdate({ size: val } as any)} 
                />

                <div className="pt-4 border-t border-white/5">
                   <QuickEditField 
                    label="Precio USD" 
                    value={data.buyPriceUsd?.toString() || ''} 
                    placeholder="0.00"
                    onChange={val => onUpdate({ buyPriceUsd: parseFloat(val) || 0 })} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-10">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="w-full py-6 bg-brand-accent text-white rounded-[24px] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                <CheckCircle2 size={24} className="group-hover:rotate-12 transition-transform" /> 
                Verificado • Importar al Formulario
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function QuickEditField({ label, value, onChange, placeholder, options }: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void,
  placeholder?: string,
  options?: string[]
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest pl-1 italic">{label}</label>
      <div className="relative group">
        {options ? (
          <select 
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-base font-bold text-white outline-none focus:border-brand-accent focus:bg-white/10 transition-all appearance-none cursor-pointer"
          >
            {options.map(opt => <option key={opt} value={opt} className="bg-[#1A1A1A] text-white">{opt}</option>)}
          </select>
        ) : (
          <input 
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-base font-bold text-white outline-none focus:border-brand-accent focus:bg-white/10 transition-all placeholder:text-white/20"
          />
        )}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Zap size={14} className="text-brand-accent/50" />
        </div>
      </div>
    </div>
  );
}
