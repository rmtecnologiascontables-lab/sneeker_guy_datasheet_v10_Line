import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Search, MessageSquare, Clock, CheckCheck, Bot, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { SystemSettings } from '../types';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatState {
  isFirstMessage: boolean;
  isWaitingForSatisfaction: boolean;
  lastInteractionTime: number;
}

interface Chat {
  id: string;
  userName: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
}

const MOCK_CHATS: Chat[] = [
  { id: '1', userName: 'Admin Master', lastMessage: 'Actualizado el stock de Jordan 1', time: '10:30 AM', unreadCount: 2, online: true },
  { id: '2', userName: 'Logística Ensenada', lastMessage: 'Recibido el pedido #4592', time: '9:45 AM', unreadCount: 0, online: true },
  { id: '3', userName: 'Ventas CDMX', lastMessage: '¿Tenemos el SKU 992-B en stock?', time: 'Ayer', unreadCount: 0, online: false },
  { id: '4', userName: 'Warehouse Zafi', lastMessage: 'Saliendo ruta hacia México', time: 'Lunes', unreadCount: 0, online: true },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', senderId: 'me', senderName: 'Tú', content: 'Hola Admin, ¿puedes revisar el status del pedido de Nike Dunk?', timestamp: '10:15 AM', read: true },
    { id: 'm2', senderId: '1', senderName: 'Admin Master', content: 'Sí, claro. Ya está en tránsito a Warehouse.', timestamp: '10:20 AM', read: true },
    { id: 'm3', senderId: '1', senderName: 'Admin Master', content: 'Actualizado el stock de Jordan 1 también.', timestamp: '10:30 AM', read: false },
  ]
};

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function callGroq(prompt: string) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export function MessagingView({ settings }: { settings: SystemSettings }) {
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [chatStates, setChatStates] = useState<Record<string, ChatState>>({});

  const messages = allMessages[selectedChat] || [];
  const activeChat = MOCK_CHATS.find(c => c.id === selectedChat);

  // AI Workflow Effect: Professional Farewell Timeout
  React.useEffect(() => {
    if (!settings?.isAiAssistantEnabled || !settings?.isAiPrimaryResponder) return;

    const timer = setInterval(() => {
      const now = Date.now();
      Object.keys(chatStates).forEach(chatId => {
        const state = chatStates[chatId];
        if (state.isWaitingForSatisfaction && now - state.lastInteractionTime > 30000) { // 30 seconds
          triggerFarewell(chatId);
        }
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [chatStates, settings]);

  const triggerFarewell = async (chatId: string) => {
    // Clear waiting state to prevent multiple farewells
    setChatStates(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId], isWaitingForSatisfaction: false }
    }));

    const farewellMsg = "Ha pasado un tiempo sin respuesta, así que daré por terminada nuestra sesión. ¡Que tengas un excelente día! Recuerda que estoy aquí si me necesitas nuevamente.";
    
    // Check if last message was already a bot message or if we are still waiting
    sendBotMessage(farewellMsg, chatId);
  };

  const sendBotMessage = (text: string, chatId: string = selectedChat) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'ai',
      senderName: 'Asistente AI',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setAllMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));
  };

  const handleAiResponse = async (userText: string, chatId: string) => {
    if (!settings?.isAiAssistantEnabled) return;
    setIsAiLoading(true);

    const state = chatStates[chatId] || { isFirstMessage: true, isWaitingForSatisfaction: false, lastInteractionTime: Date.now() };

    try {
      const chatMsgs = allMessages[chatId] || [];
      const history = chatMsgs.map(m => `${m.senderName}: ${m.content}`).join('\n');
      
      const prompt = `
        Brain Config (Instrucciones Primarias):
        ${settings.aiPrimaryPrompt}
        
        Reglas de Interacción:
        1. Eres un asistente profesional, corto y conciso.
        2. ${state.isFirstMessage ? "Este es tu PRIMER mensaje. Preséntate brevemente." : ""}
        3. Ayuda con la consulta del usuario. Si no tienes la respuesta, indícalo educadamente y ofrece contactar con un humano (opción de contactar con soporte interno).
        4. Al final de tu respuesta SIEMPRE debes incluir EXACTAMENTE: "¿Te puedo ayudar en algo más?" (sin variaciones).
        
        Historial:
        ${history}
        User: ${userText}
        
        Respuesta AI:`;

      const text = await callGroq(prompt) || "Lo siento, tuve un problema procesando tu solicitud.";
      sendBotMessage(text, chatId);

      setChatStates(prev => ({
        ...prev,
        [chatId]: {
          isFirstMessage: false,
          isWaitingForSatisfaction: true,
          lastInteractionTime: Date.now()
        }
      }));

    } catch (error) {
      console.error('AI Response Error:', error);
      sendBotMessage("Hubo un error en mi sistema. ¿Deseas que te comunique con un asistente humano?", chatId);
    } finally {
      setIsAiLoading(false);
    }
  };

  const sendMessage = (text: string = messageText, sender: string = 'me', senderName: string = 'Tú') => {
    if (!text.trim()) return;
    
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: sender,
      senderName: senderName,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setAllMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage]
    }));

    if (sender === 'me') {
      setMessageText('');
      
      // Update state tracking
      const isNegative = text.toLowerCase().includes('no') && text.length < 15;
      
      if (isNegative && chatStates[selectedChat]?.isWaitingForSatisfaction) {
        // Professional farewell if user says no
        setTimeout(() => triggerFarewell(selectedChat), 1000);
      } else if (settings?.isAiAssistantEnabled && settings?.isAiPrimaryResponder) {
        // Trigger AI response with delay for realism
        setTimeout(() => handleAiResponse(text, selectedChat), 1200);
      }
    }
  };

  const askAI = () => {
    handleAiResponse(messages[messages.length - 1]?.content || "Hola", selectedChat);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-brand-surface rounded-2xl border border-brand-border overflow-hidden shadow-sm transition-colors duration-300">
      {/* Sidebar: Chat List */}
      <div className="w-80 border-r border-brand-border flex flex-col bg-brand-bg/50">
        <div className="p-4 border-b border-brand-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
            <input 
              type="text" 
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-brand-bg border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-ink transition-all text-brand-ink"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {MOCK_CHATS.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={cn(
                "w-full p-4 flex items-center gap-3 transition-colors border-l-4",
                selectedChat === chat.id ? "bg-brand-surface border-brand-ink shadow-sm" : "bg-transparent border-transparent hover:bg-brand-bg"
              )}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-brand-ink rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {chat.userName.substring(0, 2).toUpperCase()}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-xs text-brand-ink">{chat.userName}</span>
                  <span className="text-[10px] text-brand-muted">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-brand-muted line-clamp-1">{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-brand-ink text-white rounded-full flex items-center justify-center text-[9px] font-black">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-brand-bg transition-colors duration-300">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 bg-brand-surface border-b border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-ink rounded-full flex items-center justify-center text-brand-bg font-bold text-[10px]">
                  {activeChat.userName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-brand-ink">{activeChat.userName}</h3>
                  <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">
                    {activeChat.online ? 'En línea ahora' : 'Desconectado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={askAI}
                  disabled={isAiLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-ink text-brand-bg rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 size={12} className="animate-spin text-brand-bg" /> : <Sparkles size={12} className="text-yellow-400" />}
                  Consultar AI
                </motion.button>
                <button className="p-2 hover:bg-brand-bg rounded-lg transition-colors text-brand-muted">
                  <Clock size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex justify-center mb-8">
                <span className="px-3 py-1 bg-brand-surface border border-brand-border rounded-full text-[9px] font-bold text-brand-muted uppercase tracking-widest">
                  Hoy
                </span>
              </div>
              
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    msg.senderId === 'me' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  {msg.senderId === 'ai' && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <Bot size={10} className="text-brand-accent" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-brand-accent">Asistente AI</span>
                    </div>
                  )}
                  <div className={cn(
                    "p-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm",
                    msg.senderId === 'me' 
                      ? "bg-brand-ink text-brand-bg rounded-tr-none" 
                      : msg.senderId === 'ai'
                        ? "bg-brand-accent/10 text-brand-ink border border-brand-accent/20 rounded-tl-none italic"
                        : "bg-brand-surface text-brand-ink border border-brand-border rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 px-1">
                    <span className="text-[9px] text-brand-muted font-bold">{msg.timestamp}</span>
                    {msg.senderId === 'me' && (
                      <CheckCheck size={12} className={cn(msg.read ? "text-blue-500" : "text-brand-muted")} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: Input */}
            <div className="p-4 bg-brand-surface border-t border-brand-border">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje interno..."
                    className="w-full px-5 py-3 bg-brand-bg border-none rounded-2xl text-xs outline-none focus:ring-1 focus:ring-brand-ink transition-all text-brand-ink"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-brand-muted hover:text-brand-ink transition-colors">
                    <MessageSquare size={16} />
                  </button>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  className="w-10 h-10 bg-brand-ink text-brand-bg rounded-xl flex items-center justify-center shadow-lg shadow-black/10 hover:scale-105 transition-transform"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-brand-border">
              <MessageSquare size={32} className="text-brand-border" />
            </div>
            <h3 className="font-bold text-brand-ink mb-1">Mensajería Interna</h3>
            <p className="text-xs text-brand-muted max-w-[240px]">Selecciona un usuario del panel izquierdo para comenzar una conversación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
