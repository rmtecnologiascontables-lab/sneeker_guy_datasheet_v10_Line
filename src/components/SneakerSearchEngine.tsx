import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Zap, 
  TrendingUp, 
  History, 
  Package, 
  Globe, 
  Database, 
  ArrowRight, 
  ChevronUp, 
  ChevronDown,
  Plus,
  Maximize2,
  ExternalLink,
  RefreshCw,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { cn } from '../lib/utils';

interface SneakerSearchEngineProps {
  products: Product[];
  onSearch: (query: string) => void;
  onQuickPurchase?: (initialData: Partial<Product>) => void;
}

export function SneakerSearchEngine({ products, onSearch, onQuickPurchase }: SneakerSearchEngineProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchMode, setSearchMode] = useState<'system' | 'web'>('system');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // ... rest of the component state/colors

  const handleQuickAdd = (name: string) => {
    if (onQuickPurchase) {
      onQuickPurchase({ 
        name, 
        brand: products.find(p => p.name === name)?.brand || '',
        category: products.find(p => p.name === name)?.category || 'SNEAKERS'
      });
      setIsExpanded(false);
      setShowBrowser(false);
    }
  };

  const handleExecuteSearch = () => {
    if (!query.trim()) return;
    
    if (searchMode === 'web') {
      const targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      setBrowserUrl(targetUrl);
      setShowBrowser(true);
    } else {
      onSearch(query);
      setIsExpanded(false); 
    }
    setIsFocused(false);
  };

  // Google Colors for "The Sneaker Guy"
  const googleColors = [
    'text-[#4285F4]', // Blue
    'text-[#EA4335]', // Red
    'text-[#FBBC05]', // Yellow
    'text-[#4285F4]', // Blue
    'text-[#34A853]', // Green
    'text-[#EA4335]', // Red
  ];

  const renderColorfulLogo = (size: 'sm' | 'lg' = 'lg') => {
    const text = "Sneaker Engine";
    return (
      <div className={cn("flex flex-col items-center select-none", size === 'lg' ? "mb-10" : "mb-0")}>
        <h1 className={cn(
          "font-black tracking-tighter flex",
          size === 'lg' ? "text-5xl md:text-8xl" : "text-2xl"
        )}>
          {text.split('').map((char, i) => (
            <span key={i} className={cn(googleColors[i % googleColors.length], char === ' ' ? size === 'lg' ? 'mr-4' : 'mr-2' : '')}>
              {char}
            </span>
          ))}
          <span className={cn("text-brand-ink/10 ml-2", size === 'lg' ? "text-2xl" : "text-xs")}>™</span>
        </h1>
        {size === 'lg' && (
          <div className="mt-2 text-[10px] font-black text-brand-muted uppercase tracking-[0.5em] opacity-40">
            Advanced Global Search System
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (searchMode === 'system' && query.trim().length > 1) {
      const filtered = Array.from(new Set(
        products
          .filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.brand?.toLowerCase().includes(query.toLowerCase()) ||
            p.sku?.toLowerCase().includes(query.toLowerCase())
          )
          .map(p => p.name)
          .slice(0, 8)
      ));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setSelectedIndex(-1);
  }, [query, products, searchMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        handleSelect(suggestions[selectedIndex]);
      } else {
        handleExecuteSearch();
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleSelect = (val: string) => {
    setQuery(val);
    if (searchMode === 'web') {
      const targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(val)}`;
      setBrowserUrl(targetUrl);
      setShowBrowser(true);
    } else {
      onSearch(val);
      setIsExpanded(false);
    }
    setIsFocused(false);
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Curtain Toggle Button */}
      <div className="absolute top-0 right-0 z-[60] pt-4 pr-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            isExpanded ? "bg-brand-ink text-white" : "bg-white border border-brand-border text-brand-muted hover:border-brand-ink hover:text-brand-ink shadow-sm"
          )}
          title={isExpanded ? "Contraer Buscador" : "Expandir Buscador"}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="w-full max-w-4xl mx-auto py-16 px-4">
              {renderColorfulLogo()}

              <div className="flex justify-center gap-8 mb-8">
                <button 
                  onClick={() => setSearchMode('system')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                    searchMode === 'system' 
                      ? "bg-brand-ink text-white shadow-xl shadow-brand-ink/10" 
                      : "text-brand-muted hover:text-brand-ink"
                  )}
                >
                  <Database size={14} /> CRM Interno
                </button>
                <button 
                  onClick={() => setSearchMode('web')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                    searchMode === 'web' 
                      ? "bg-[#4285F4] text-white shadow-xl shadow-blue-500/20" 
                      : "text-brand-muted hover:text-brand-ink"
                  )}
                >
                  <Globe size={14} /> Web Engine
                </button>
              </div>

              <div className="relative z-50">
                <div className={cn(
                  "relative flex items-center transition-all duration-300",
                  isFocused ? "scale-[1.01]" : ""
                )}>
                  <button 
                    onClick={handleExecuteSearch}
                    className={cn(
                      "absolute left-6 transition-colors",
                      isFocused ? "text-brand-accent" : "text-brand-muted hover:text-brand-ink"
                    )}
                  >
                    <Search size={22} className={cn(isFocused ? "animate-pulse" : "")} />
                  </button>
                  
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={searchMode === 'system' ? "Busca stock, clientes o pedidos..." : "Buscar artículos, precios o info en la web..."}
                    className={cn(
                      "w-full h-20 pl-16 pr-20 bg-white border-2 rounded-full text-xl font-bold outline-none transition-all duration-300 shadow-sm",
                      isFocused ? "border-brand-ink ring-[12px] ring-brand-ink/5" : "border-brand-border hover:border-brand-muted hover:shadow-2xl"
                    )}
                  />

                  <div className="absolute right-6 flex items-center gap-2">
                    {query && (
                      <button 
                        onClick={() => { setQuery(''); setSuggestions([]); }}
                        className="p-2 text-brand-muted hover:text-brand-ink transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                    <button 
                      onClick={handleExecuteSearch}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        query ? "bg-brand-ink text-white" : "bg-brand-bg text-brand-muted"
                      )}
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isFocused && (suggestions.length > 0 || query === '') && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[32px] border-2 border-brand-border shadow-2xl overflow-hidden"
                    >
                      <div className="py-6">
                        {query === '' ? (
                          <div className="px-10 py-2">
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                              <TrendingUp size={12} className="text-brand-accent" />
                              Tendencias Globales
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {['Jordan 1 Low', 'Dunk High Retro', 'Essentials FOG', 'Stock Actual'].map((item, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSelect(item)}
                                  className="flex items-center gap-4 px-6 py-4 hover:bg-brand-bg rounded-2xl text-sm font-bold text-brand-ink transition-colors group text-left border border-transparent hover:border-brand-border"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-muted group-hover:text-brand-accent transition-colors">
                                    <History size={16} />
                                  </div>
                                  <span className="flex-1">{item}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {suggestions.map((s, i) => (
                              <div key={i} className={cn(
                                "flex items-center gap-2 pr-6 transition-colors",
                                selectedIndex === i ? "bg-brand-bg" : "hover:bg-brand-bg"
                              )}>
                                <button
                                  className="flex-1 flex items-center gap-6 px-10 py-4 text-left text-sm font-bold"
                                  onClick={() => handleSelect(s)}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-brand-bg flex items-center justify-center text-brand-muted">
                                    <Package size={16} />
                                  </div>
                                  <span className="flex-1">{s}</span>
                                  <Zap size={14} className="text-brand-accent opacity-20" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleQuickAdd(s); }}
                                  className="px-4 py-2 bg-brand-ink text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-ink/20 flex items-center gap-2"
                                >
                                  <Zap size={10} /> Compra
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-brand-bg px-10 py-4 border-t border-brand-border flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", searchMode === 'system' ? "bg-green-500" : "bg-blue-500")} />
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                              {searchMode === 'system' ? 'Conectado a Base de Datos Enterprise' : 'Asistente de Navegación Activo'}
                            </p>
                         </div>
                         <div className="flex gap-4">
                            <span className="text-[9px] font-black text-brand-ink/40 uppercase tracking-widest">The Sneaker Guy v1.6</span>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex justify-center gap-4 mt-8">
                <button 
                   onClick={handleExecuteSearch}
                   className="px-6 py-2 bg-brand-surface border border-brand-border rounded-lg text-[11px] font-bold text-brand-muted hover:border-brand-ink hover:text-brand-ink transition-all"
                >
                  Búsqueda Avanzada
                </button>
                <button 
                   onClick={() => { setQuery(''); setSuggestions([]); setIsFocused(false); }}
                   className="px-6 py-2 bg-brand-surface border border-brand-border rounded-lg text-[11px] font-bold text-brand-muted hover:border-brand-ink hover:text-brand-ink transition-all"
                >
                  Limpiar Engine
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Collapsed View */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex items-center justify-between px-8 py-3 bg-white border-b border-brand-border shadow-sm"
          >
            {renderColorfulLogo('sm')}
            <div className="flex-1 max-w-xl mx-8 relative flex items-center">
              <Search size={14} className="absolute left-4 text-brand-muted" />
              <input 
                type="text"
                placeholder="Presiona para buscar..."
                className="w-full bg-brand-bg border border-brand-border rounded-full py-1.5 pl-10 pr-4 text-xs font-bold outline-none focus:border-brand-ink"
                onFocus={() => setIsExpanded(true)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 grayscale opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Ready</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Internal Navigation Browser Assistant Modal */}
      <AnimatePresence>
        {showBrowser && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBrowser(false)}
              className="absolute inset-0 bg-brand-ink/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full h-full bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative z-10 border border-white/20"
            >
              {/* Browser Header */}
              <div className="h-16 flex items-center justify-between px-8 border-b border-brand-border bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <button className="p-2 hover:bg-brand-bg rounded-lg text-brand-muted transition-colors">
                    <Home size={18} />
                  </button>
                  <button className="p-2 hover:bg-brand-bg rounded-lg text-brand-muted transition-colors">
                    <RefreshCw size={18} />
                  </button>
                  <div className="flex items-center gap-2 bg-brand-bg border border-brand-border px-4 py-2 rounded-xl text-xs font-bold text-brand-muted w-80 md:w-[400px]">
                    <Globe size={14} className="shrink-0" />
                    <span className="truncate">{browserUrl}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleQuickAdd(query)}
                    className="flex items-center gap-2 bg-brand-accent text-brand-ink px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                  >
                    <Plus size={14} /> Nueva Compra
                  </button>
                  <span className="text-[10px] font-black text-brand-ink uppercase tracking-widest bg-brand-bg px-3 py-1 rounded-full border border-brand-border">
                    Navegación Asistida
                  </span>
                  <button 
                    onClick={() => {
                        window.open(browserUrl, '_blank');
                    }}
                    className="p-2.5 hover:bg-brand-bg rounded-xl text-brand-ink transition-colors"
                    title="Abrir en pestaña nueva"
                  >
                    <ExternalLink size={20} />
                  </button>
                  <button 
                    onClick={() => setShowBrowser(false)}
                    className="w-10 h-10 bg-brand-ink text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Browser Viewport */}
              <div className="flex-1 bg-brand-bg relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-5">
                   {renderColorfulLogo('lg')}
                </div>
                <iframe 
                  src={browserUrl} 
                  className="w-full h-full relative z-10"
                  title="Sneaker Engine View"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Browser Footer */}
              <div className="h-10 bg-brand-ink text-white/50 flex items-center justify-center px-8 text-[9px] font-black uppercase tracking-[0.3em] shrink-0">
                 The Sneaker Guy Global Assistant — Safe Browsing Environment v1.0
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowUpRight({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}
