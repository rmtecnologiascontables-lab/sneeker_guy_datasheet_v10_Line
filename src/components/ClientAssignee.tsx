import React, { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  UserPlus, 
  Search, 
  Check, 
  Users,
  ChevronDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer } from '../types';
import { cn } from '../lib/utils';

interface ClientAssigneeProps {
  customers: Customer[];
  selectedCustomer: string;
  onSelect: (customer: string, details?: Partial<Customer>) => void;
  customerData?: Partial<Customer>;
}

export function ClientAssignee({ customers, selectedCustomer, onSelect, customerData }: ClientAssigneeProps) {
  const [search, setSearch] = useState(selectedCustomer);
  const [showSearch, setShowSearch] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers.slice(0, 5);
    return customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 10);
  }, [customers, search]);

  const exactMatch = customers.find(c => c.name.toLowerCase() === search.toLowerCase());

  const handleSelect = (customer: Customer) => {
    setSearch(customer.name);
    onSelect(customer.name, customer);
    setShowSearch(false);
    setIsNewClient(false);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 block pl-1">
          Asignación de Cliente Master
        </label>
        
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-accent transition-colors">
            <User size={18} />
          </div>
          <input 
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSearch(true);
              onSelect(e.target.value);
            }}
            onFocus={() => setShowSearch(true)}
            placeholder="Buscar por nombre o alias..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-12 text-sm font-bold text-white outline-none focus:border-brand-accent/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20"
          />
          <button 
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
          >
            <ChevronDown size={20} className={cn("transition-transform", showSearch && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showSearch && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
              >
                <div className="p-2">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
                      <button
                        key={customer.name}
                        onClick={() => handleSelect(customer)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors group text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-brand-ink border border-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-accent transition-colors">
                             <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors">{customer.name}</p>
                            {customer.email && <p className="text-[10px] text-white/30 font-medium">{customer.email}</p>}
                          </div>
                        </div>
                        <Check size={16} className={cn("opacity-0 transition-opacity", selectedCustomer === customer.name && "opacity-100 text-brand-accent")} />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Users size={32} className="mx-auto text-white/10 mb-3" />
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest">No se encontraron registros</p>
                    </div>
                  )}

                  {!exactMatch && search.length > 2 && (
                    <button
                      onClick={() => {
                        setIsNewClient(true);
                        setShowSearch(false);
                      }}
                      className="w-full p-4 bg-brand-accent/10 border-t border-white/5 flex items-center gap-4 group hover:bg-brand-accent/20 transition-all"
                    >
                      <UserPlus className="text-brand-accent" size={20} />
                      <div className="text-left">
                        <p className="text-xs font-black text-brand-accent uppercase tracking-widest">Registrar Nuevo Cliente</p>
                        <p className="text-[10px] text-brand-accent/50 font-bold uppercase">Crear perfil para "{search}"</p>
                      </div>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {(isNewClient || (exactMatch && !exactMatch.email)) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-brand-accent/5 rounded-3xl border border-brand-accent/10 p-8 space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Info size={16} className="text-brand-accent" />
              <h5 className="text-[11px] font-black text-brand-accent uppercase tracking-[0.2em]">Perfil de Seguridad y Contacto</h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-brand-accent/40 uppercase tracking-widest pl-1">Email Principal</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent/30" size={16} />
                  <input 
                    type="email"
                    value={customerData?.email || ''}
                    onChange={(e) => onSelect(search, { ...customerData, email: e.target.value })}
                    placeholder="cliente@ejemplo.com"
                    className="w-full bg-black/40 border border-brand-accent/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-brand-accent/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-brand-accent/40 uppercase tracking-widest pl-1">Teléfono WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent/30" size={16} />
                  <input 
                    type="tel"
                    value={customerData?.phone || ''}
                    onChange={(e) => onSelect(search, { ...customerData, phone: e.target.value })}
                    placeholder="+52 000 000 0000"
                    className="w-full bg-black/40 border border-brand-accent/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-brand-accent/40"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-brand-accent/40 uppercase tracking-widest pl-1">Referenciado Por (Opcional)</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent/30" size={16} />
                <input 
                  type="text"
                  value={customerData?.referido_por || ''}
                  onChange={(e) => onSelect(search, { ...customerData, referido_por: e.target.value })}
                  placeholder="Nombre de quien recomendó"
                  className="w-full bg-black/40 border border-brand-accent/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-brand-accent/40"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
