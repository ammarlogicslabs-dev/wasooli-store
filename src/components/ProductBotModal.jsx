import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wrench,
  Zap,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  ShoppingBag,
} from "lucide-react";
import { getProductInstructions, generateBotResponse } from "../data/productInstructions";
import { formatPrice } from "../data/product";
import { useCart } from "../cart/CartContext";

export default function ProductBotModal({ product, isOpen, onClose }) {
  const { addItem, openCart } = useCart();
  const [activeTab, setActiveTab] = useState("instructions"); // "instructions" | "chat"
  const [copied, setCopied] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  const instructions = getProductInstructions(product);

  // Initialize chat when opened or product changes
  useEffect(() => {
    if (!product) return;
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: `Salam! I am your Wasooli Smart Guide for ${product.title}.\n\nI can help you with setup instructions, speed optimization, compatibility, and troubleshooting for this item. How can I help you today?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [product]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab, isTyping]);

  if (!isOpen || !product || !instructions) return null;

  function handleSendMessage(queryText) {
    const textToSend = (queryText || inputMessage).trim();
    if (!textToSend) return;

    const userMsg = {
      id: `u-${crypto.randomUUID()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botReplyText = generateBotResponse(textToSend, product, instructions);
      const botMsg = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  }

  function handleCopyInstructions() {
    const text = `Instructions for ${product.title}:\n\n` +
      instructions.setupSteps.map((s) => `Step ${s.step}: ${s.title}\n${s.detail}`).join("\n\n") +
      `\n\nCompatibility:\n` + instructions.compatibilityList.join(", ");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const quickPrompts = [
    { label: "Setup Steps", query: "How do I install and set this up?" },
    { label: "Compatibility", query: "Is this compatible with my devices?" },
    { label: "Speed & Performance", query: "How do I get maximum speed from this?" },
    { label: "Troubleshooting", query: "What are common fixes if it doesn't work?" },
    { label: "Warranty & Care", query: "What is the warranty and return policy?" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 flex flex-col w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden ">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="relative grid size-10 place-items-center rounded-2xl bg-brand-500/20 border border-brand-400/30 text-brand-300">
              <Bot size={22} className="animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  Wasooli Product Bot
                </h3>
                {/* <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-400/30">
                  <Sparkles size={10} /> AI Guide
                </span> */}
              </div>
              <p className="text-xs text-slate-300 truncate max-w-xs sm:max-w-md">
                Guide for: {product.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyInstructions}
              title="Copy instructions"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Bot"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("instructions")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "instructions"
                ? "border-brand-600 text-brand-600 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <BookOpen size={16} />
            <span>Product Instructions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "chat"
                ? "border-brand-600 text-brand-600 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <MessageSquare size={16} />
            <span>Ask Bot Live</span>
            <span className="size-2 rounded-full bg-emerald-500" />
          </button>
        </div>

        {/* Modal Body */} 
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {activeTab === "instructions" ? (
            /* TAB 1: STRUCTURED INSTRUCTIONS */
            <div className="space-y-6">
              {/* Product Quick Overview Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-brand-50/60 border border-brand-100">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="size-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold uppercase text-brand-700 truncate">
                      {product.brand} • {product.category}
                    </h4>
                    <p className="text-[11px] font-bold text-slate-900 ">
                      {product.title}
                    </p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">
                      Interface: <span className="font-semibold text-slate-900">{instructions.portType}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <span className="text-sm font-bold text-slate-900 shrink-0 whitespace-nowrap">
                    {formatPrice(product.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addItem(product, 1);
                      openCart();
                      onClose();
                    }}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-3xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 cursor-pointer"
                  >
                    <ShoppingBag size={14} className="shrink-0" />
                    <span className="whitespace-nowrap">Add to Cart</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Installation */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
                  <Wrench size={16} className="text-brand-600" /> Step-by-Step Setup Guide
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {instructions.setupSteps.map((item) => (
                    <div
                      key={item.step}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-brand-200 transition"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="grid size-6 place-items-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
                          {item.step}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">
                          {item.title}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-8">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do's & Don'ts */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
                  <ShieldCheck size={16} className="text-brand-600" /> Essential Do's & Don'ts
                </h4>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {instructions.dosAndDonts.map((rule, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed ${
                        rule.type === "do"
                          ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                          : "bg-red-50/50 border-red-100 text-red-900"
                      }`}
                    >
                      {rule.type === "do" ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                      )}
                      <span>{rule.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compatibility & Devices */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide mb-2.5">
                  <Zap size={15} className="text-amber-500" /> Compatible Devices & Systems
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {instructions.compatibilityList.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Common Troubleshooting */}
              {instructions.troubleshooting.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
                    <HelpCircle size={16} className="text-brand-600" /> Troubleshooting & Quick Fixes
                  </h4>
                  <div className="space-y-2">
                    {instructions.troubleshooting.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white"
                      >
                        <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="text-amber-500 font-extrabold">Q:</span> {item.problem}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 pl-4 border-l-2 border-brand-200">
                          <span className="font-semibold text-brand-700">Solution:</span> {item.solution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: INTERACTIVE LIVE BOT CHAT */
            <div className="flex flex-col h-[400px]">
              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
                {quickPrompts.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip.query)}
                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200 transition cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div className="grid size-7 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700 mt-0.5">
                        <Bot size={15} />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-brand-600 text-white rounded-tr-none shadow-xs"
                          : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                      }`}
                    >
                      {msg.text}
                      <span
                        className={`block text-[9px] mt-1 text-right ${
                          msg.sender === "user" ? "text-brand-200" : "text-slate-400"
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs pl-9">
                    <span className="size-1.5 rounded-full bg-brand-500 animate-bounce" />
                    <span className="size-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="size-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-slate-400">Bot is replying...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-200"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask anything about ${product.title}...`}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  aria-label="Send query to bot"
                  className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Wasooli Store AI Assistant • Always ready to assist</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "instructions" ? "chat" : "instructions")}
            className="font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            {activeTab === "instructions" ? "Switch to Live Chat" : "View Instructions Guide"}
            <ChevronRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
