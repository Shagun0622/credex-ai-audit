'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  TrendingDown, 
  Shield, 
  Zap, 
  Users, 
  Code, 
  FileText, 
  BarChart3, 
  Search,
  DollarSign,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Building2,
  Cpu,
  Bot,
  MessageSquare,
  Gem,
  AlertCircle,
  Save,
  ChevronDown,
  Info
} from 'lucide-react';

const TOOLS_META = [
  {
    name: 'cursor',
    displayName: 'Cursor',
    icon: <Cpu className="w-5 h-5" />,
    color: '#7C3AED',
    bgHover: 'hover:bg-purple-50',
    plans: [
      { value: 'hobby', label: 'Hobby', price: 0, monthlyLimit: '20 completions' },
      { value: 'pro', label: 'Pro', price: 20, monthlyLimit: 'Unlimited' },
      { value: 'business', label: 'Business', price: 40, monthlyLimit: 'Team features' },
      { value: 'enterprise', label: 'Enterprise', price: 'Custom', monthlyLimit: 'Custom' },
    ],
    defaultPlan: 'pro',
    defaultSpend: 20,
    savingsTip: 'Business plan is overkill for 1-2 users. Pro gives same features.',
  },
  {
    name: 'github-copilot',
    displayName: 'GitHub Copilot',
    icon: <Bot className="w-5 h-5" />,
    color: '#24292E',
    bgHover: 'hover:bg-gray-50',
    plans: [
      { value: 'individual', label: 'Individual', price: 10, monthlyLimit: 'Individual use' },
      { value: 'business', label: 'Business', price: 19, monthlyLimit: 'Organization wide' },
      { value: 'enterprise', label: 'Enterprise', price: 39, monthlyLimit: 'Enterprise security' },
    ],
    defaultPlan: 'individual',
    defaultSpend: 10,
    savingsTip: 'Business plan offers same features as Individual + license management.',
  },
  {
    name: 'claude',
    displayName: 'Claude',
    icon: <MessageSquare className="w-5 h-5" />,
    color: '#CC4E00',
    bgHover: 'hover:bg-orange-50',
    plans: [
      { value: 'free', label: 'Free', price: 0, monthlyLimit: 'Basic usage' },
      { value: 'pro', label: 'Pro', price: 20, monthlyLimit: 'Priority access' },
      { value: 'max', label: 'Max', price: 50, monthlyLimit: 'Heavy usage' },
      { value: 'team', label: 'Team', price: 30, monthlyLimit: 'Team collaboration' },
      { value: 'enterprise', label: 'Enterprise', price: 'Custom', monthlyLimit: 'Enterprise' },
      { value: 'api-direct', label: 'API Direct', price: 'Pay as you go', monthlyLimit: 'Usage based' },
    ],
    defaultPlan: 'pro',
    defaultSpend: 20,
    savingsTip: 'API may be cheaper than Pro if you use less than 300k tokens/day.',
  },
  {
    name: 'chatgpt',
    displayName: 'ChatGPT',
    icon: <MessageSquare className="w-5 h-5" />,
    color: '#1A7F64',
    bgHover: 'hover:bg-teal-50',
    plans: [
      { value: 'plus', label: 'Plus', price: 20, monthlyLimit: 'Higher limits' },
      { value: 'team', label: 'Team', price: 30, monthlyLimit: 'Team features' },
      { value: 'enterprise', label: 'Enterprise', price: 'Custom', monthlyLimit: 'Advanced security' },
      { value: 'api-direct', label: 'API Direct', price: 'Pay as you go', monthlyLimit: 'Usage based' },
    ],
    defaultPlan: 'plus',
    defaultSpend: 20,
    savingsTip: 'Team plan for 2+ users is cheaper than individual Plus accounts.',
  },
  {
    name: 'anthropic-api',
    displayName: 'Anthropic API',
    icon: <Bot className="w-5 h-5" />,
    color: '#1A3A6B',
    bgHover: 'hover:bg-blue-50',
    plans: [
      { value: 'paygo', label: 'Pay as you go', price: 'Usage based', monthlyLimit: 'Flexible' },
      { value: 'volume', label: 'Volume commitment', price: 'Negotiated', monthlyLimit: 'High volume' },
    ],
    defaultPlan: 'paygo',
    defaultSpend: 50,
    savingsTip: 'Volume commitments can reduce costs by 20-40% for high usage.',
  },
  {
    name: 'openai-api',
    displayName: 'OpenAI API',
    icon: <Bot className="w-5 h-5" />,
    color: '#1A7F64',
    bgHover: 'hover:bg-teal-50',
    plans: [
      { value: 'paygo', label: 'Pay as you go', price: 'Usage based', monthlyLimit: 'Flexible' },
      { value: 'volume', label: 'Volume commitment', price: 'Negotiated', monthlyLimit: 'High volume' },
    ],
    defaultPlan: 'paygo',
    defaultSpend: 50,
    savingsTip: 'Batch processing can reduce API costs by 50%.',
  },
  {
    name: 'gemini',
    displayName: 'Gemini',
    icon: <Gem className="w-5 h-5" />,
    color: '#1565C0',
    bgHover: 'hover:bg-blue-50',
    plans: [
      { value: 'pro', label: 'Pro', price: 0, monthlyLimit: 'Free tier available' },
      { value: 'ultra', label: 'Ultra', price: 19.99, monthlyLimit: 'Advanced capabilities' },
      { value: 'api', label: 'API', price: 'Pay as you go', monthlyLimit: 'Usage based' },
    ],
    defaultPlan: 'pro',
    defaultSpend: 0,
    savingsTip: 'Start with free Pro tier before upgrading to Ultra.',
  },
  {
    name: 'windsurf',
    displayName: 'Windsurf',
    icon: <Zap className="w-5 h-5" />,
    color: '#0077A3',
    bgHover: 'hover:bg-cyan-50',
    plans: [
      { value: 'free', label: 'Free', price: 0, monthlyLimit: 'Basic usage' },
      { value: 'pro', label: 'Pro', price: 15, monthlyLimit: 'Advanced features' },
      { value: 'team', label: 'Team', price: 30, monthlyLimit: 'Team collaboration' },
    ],
    defaultPlan: 'pro',
    defaultSpend: 15,
    savingsTip: 'Team plan for 3+ users is cheaper than individual Pro accounts.',
  },
];

const USE_CASES = [
  { value: 'coding', label: 'Coding & Development', icon: <Code className="w-5 h-5" />, description: 'Software development, debugging, code review' },
  { value: 'writing', label: 'Writing & Content', icon: <FileText className="w-5 h-5" />, description: 'Blog posts, emails, documentation' },
  { value: 'data', label: 'Data Analysis', icon: <BarChart3 className="w-5 h-5" />, description: 'Data processing, analytics, reporting' },
  { value: 'research', label: 'Research', icon: <Search className="w-5 h-5" />, description: 'Literature review, summarization' },
  { value: 'mixed', label: 'Mixed / General', icon: <Sparkles className="w-5 h-5" />, description: 'Varied use across teams' },
];

// Helper function to generate unique ID
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to calculate potential savings percentage
function calculatePotentialSavings(formData: any): number {
  // Simple heuristic based on plan optimization
  let potential = 0;
  formData.tools.forEach((tool: any) => {
    const meta = TOOLS_META.find(t => t.name === tool.name);
    if (meta && tool.plan === 'business' && tool.seats === 1) potential += 20;
    if (meta && tool.plan === 'team' && tool.seats === 1) potential += 10;
    if (meta && tool.plan === 'enterprise' && tool.seats < 10) potential += 30;
  });
  return Math.min(45, potential);
}

export default function Home() {
  const [formData, setFormData] = useState({
    tools: [
      {
        id: generateId(),
        name: 'cursor',
        plan: 'pro',
        monthlySpend: 20,
        seats: 1,
      },
    ],
    teamSize: 1,
    useCase: 'coding',
  });
  
  const [activeTab, setActiveTab] = useState('tools');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('audit-form-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to load saved form');
      }
    }
  }, []);

  // Save to localStorage with visual indicator
  useEffect(() => {
    localStorage.setItem('audit-form-data', JSON.stringify(formData));
    setShowSaveIndicator(true);
    const timer = setTimeout(() => setShowSaveIndicator(false), 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Validate form data
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (formData.teamSize < 1) {
      errors.teamSize = 'Team size must be at least 1';
    }
    formData.tools.forEach((tool, index) => {
      if (tool.monthlySpend < 0) {
        errors[`tool_${index}_spend`] = 'Spend cannot be negative';
      }
      if (tool.seats < 1) {
        errors[`tool_${index}_seats`] = 'Seats must be at least 1';
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addTool = () => {
    setFormData(prev => ({
      ...prev,
      tools: [
        ...prev.tools,
        {
          id: generateId(),
          name: 'cursor',
          plan: 'pro',
          monthlySpend: 20,
          seats: 1,
        },
      ],
    }));
  };

  const removeTool = (id: string) => {
    if (formData.tools.length === 1) return;
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t.id !== id),
    }));
  };

  const updateTool = (id: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const getToolMeta = (name: string) => TOOLS_META.find(t => t.name === name) || TOOLS_META[0];

  const calculateTotalSpend = () => {
    return formData.tools.reduce((total, tool) => {
      const meta = getToolMeta(tool.name);
      const plan = meta.plans.find(p => p.value === tool.plan);
      const price = typeof plan?.price === 'number' ? plan.price : 0;
      return total + (price * tool.seats);
    }, 0);
  };

  const totalSpend = calculateTotalSpend();
  const potentialSavingsPercent = calculatePotentialSavings(formData);
  const estimatedSavings = Math.floor(totalSpend * (potentialSavingsPercent / 100));

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const encodedData = encodeURIComponent(btoa(JSON.stringify(formData)));
    setTimeout(() => {
      window.location.href = `/audit/${encodedData}`;
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">

      {/* Top nav bar */}
      <div className="border-b border-[#E2E0DB] bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-[#1A3A6B]" />
            <span className="text-base font-semibold tracking-tight text-[#0F0E0D]">AI Spend Audit</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#6B6A66]">
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> No signup required</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Instant results</span>
            {showSaveIndicator && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-xs text-green-600"
              >
                <Save className="w-3 h-3" /> Auto-saved
              </motion.span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-end justify-between flex-wrap gap-4"
        >
          <div>
            <p className="text-sm font-semibold tracking-wider uppercase text-[#8C8A86] mb-3">
              Spend analysis
            </p>
            <h1 className="text-4xl leading-tight font-bold text-[#0F0E0D] tracking-tight mb-2">
              Find savings in your<br />AI tooling budget
            </h1>
            <p className="text-base text-[#6B6A66]">Identify optimization opportunities across your team's AI subscriptions</p>
          </div>
          <div className="text-right pb-1">
            <p className="text-sm font-semibold tracking-wider uppercase text-[#8C8A86] mb-2">
              Est. monthly spend
            </p>
            <p className="text-4xl font-bold text-[#0F0E0D] tabular-nums tracking-tight">
              ${totalSpend.toLocaleString()}
              <span className="text-lg font-normal text-[#8C8A86] ml-1">/mo</span>
            </p>
          </div>
        </motion.div>

        {/* Savings strip with dynamic calculation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className={`flex items-center gap-3 rounded-lg px-5 py-3.5 mb-8 text-base ${
            estimatedSavings > 0 
              ? 'bg-[#EAFAF2] border border-[#B8DECE] text-[#0F5C3A]'
              : 'bg-[#F0F0EE] border border-[#E2E0DB] text-[#6B6A66]'
          }`}
        >
          <TrendingDown className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">
            {estimatedSavings > 0 
              ? `Teams typically save 30–45% after completing this audit. We estimate you could save ~$${estimatedSavings}/mo (${potentialSavingsPercent}% of current spend). Takes under 2 minutes.`
              : 'Teams typically save 30–45% after completing this audit. Your current setup looks optimized already! Takes under 2 minutes.'}
          </span>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.06 }}
          className="mb-6"
        >
          <div className="flex justify-between text-xs text-[#8C8A86] mb-1.5">
            <span>Audit readiness</span>
            <span>{Math.min(100, formData.tools.length * 12.5 + (formData.teamSize > 0 ? 10 : 0))}%</span>
          </div>
          <div className="h-1.5 bg-[#E2E0DB] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, formData.tools.length * 12.5 + (formData.teamSize > 0 ? 10 : 0))}%` }}
              className="h-full bg-[#1A3A6B] rounded-full"
            />
          </div>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white border border-[#E2E0DB] rounded-xl overflow-hidden shadow-sm"
        >
          {/* Tabs */}
          <div className="flex border-b border-[#E2E0DB] px-8">
            <button
              onClick={() => setActiveTab('tools')}
              className={`relative py-5 mr-8 text-base font-semibold transition-colors ${
                activeTab === 'tools' ? 'text-[#0F0E0D]' : 'text-[#8C8A86] hover:text-[#4A4845]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Bot className="w-5 h-5" />
                AI Tools
              </span>
              {activeTab === 'tools' && (
                <motion.div
                  layoutId="activeTabBar"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F0E0D]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`relative py-5 text-base font-semibold transition-colors ${
                activeTab === 'company' ? 'text-[#0F0E0D]' : 'text-[#8C8A86] hover:text-[#4A4845]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5" />
                Team Info
              </span>
              {activeTab === 'company' && (
                <motion.div
                  layoutId="activeTabBar"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F0E0D]"
                />
              )}
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'tools' ? (
              <div className="space-y-5">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#0F0E0D] mb-1">Which tools is your team paying for?</h2>
                  <p className="text-sm text-[#6B6A66]">Include all active subscriptions and API usage across your organization</p>
                </div>

                <AnimatePresence>
                  {formData.tools.map((tool, index) => {
                    const meta = getToolMeta(tool.name);
                    const spendError = validationErrors[`tool_${index}_spend`];
                    const seatsError = validationErrors[`tool_${index}_seats`];
                    return (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className={`border rounded-xl overflow-hidden transition-colors ${meta.bgHover} border-[#E2E0DB] hover:border-[#C8C6C0]`}
                      >
                        {/* Card header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-[#FAFAF8] border-b border-[#E2E0DB]">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: meta.color }}
                            />
                            <select
                              value={tool.name}
                              onChange={(e) => {
                                const newMeta = getToolMeta(e.target.value);
                                updateTool(tool.id, {
                                  name: e.target.value,
                                  plan: newMeta.defaultPlan,
                                  monthlySpend: newMeta.defaultSpend,
                                });
                              }}
                              className="text-base font-semibold text-[#0F0E0D] bg-transparent border-none outline-none cursor-pointer pr-6 appearance-none"
                            >
                              {TOOLS_META.map(m => (
                                <option key={m.name} value={m.name}>{m.displayName}</option>
                              ))}
                            </select>
                            {/* Tooltip with savings tip */}
                            <div className="group relative">
                              <Info className="w-4 h-4 text-[#8C8A86] cursor-help" />
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-[#1A3A6B] text-white text-xs rounded-lg px-3 py-2 w-64 z-10">
                                {meta.savingsTip}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-[#8C8A86] font-mono">Tool #{index + 1}</span>
                            {formData.tools.length > 1 && (
                              <button
                                onClick={() => removeTool(tool.id)}
                                className="text-[#8C8A86] hover:text-red-700 transition-colors p-1 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="grid grid-cols-3 gap-5 px-5 py-5">
                          <div>
                            <label className="block text-xs font-semibold tracking-wider uppercase text-[#8C8A86] mb-2">
                              Plan
                            </label>
                            <div className="relative">
                              <select
                                value={tool.plan}
                                onChange={(e) => updateTool(tool.id, { plan: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-[#E2E0DB] rounded-lg bg-white text-[#0F0E0D] outline-none focus:border-[#A0ADCA] focus:ring-2 focus:ring-[#1A3A6B]/10 transition-all appearance-none pr-10"
                              >
                                {meta.plans.map(plan => (
                                  <option key={plan.value} value={plan.value}>
                                    {plan.label}{typeof plan.price === 'number' ? ` — $${plan.price}` : plan.price !== 'Custom' && plan.price !== 'Pay as you go' && plan.price !== 'Usage based' && plan.price !== 'Negotiated' ? '' : ` — ${plan.price}`}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8A86] pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold tracking-wider uppercase text-[#8C8A86] mb-2">
                              Monthly spend
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#8C8A86] font-mono pointer-events-none">$</span>
                              <input
                                type="number"
                                value={tool.monthlySpend}
                                onChange={(e) => updateTool(tool.id, { monthlySpend: Number(e.target.value) })}
                                className={`w-full pl-8 pr-4 py-2.5 text-base border rounded-lg bg-white text-[#0F0E0D] font-mono outline-none transition-all ${
                                  spendError ? 'border-red-400 focus:border-red-500' : 'border-[#E2E0DB] focus:border-[#A0ADCA]'
                                } focus:ring-2 focus:ring-[#1A3A6B]/10`}
                                placeholder="0"
                              />
                            </div>
                            {spendError && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {spendError}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold tracking-wider uppercase text-[#8C8A86] mb-2">
                              Seats
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8C8A86] font-medium pointer-events-none">×</span>
                              <input
                                type="number"
                                value={tool.seats}
                                onChange={(e) => updateTool(tool.id, { seats: Number(e.target.value) })}
                                className={`w-full pl-8 pr-4 py-2.5 text-base border rounded-lg bg-white text-[#0F0E0D] font-mono outline-none transition-all ${
                                  seatsError ? 'border-red-400 focus:border-red-500' : 'border-[#E2E0DB] focus:border-[#A0ADCA]'
                                } focus:ring-2 focus:ring-[#1A3A6B]/10`}
                                min="1"
                              />
                            </div>
                            {seatsError && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {seatsError}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <button
                  onClick={addTool}
                  className="w-full py-3.5 border-2 border-dashed border-[#C8C6C0] rounded-xl text-base text-[#8C8A86] hover:border-[#1A3A6B] hover:text-[#1A3A6B] hover:bg-[#EEF2FA] transition-all flex items-center justify-center gap-2.5 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add another tool
                </button>
              </div>
            ) : (
              <div className="space-y-7">
                <div>
                  <h2 className="text-lg font-semibold text-[#0F0E0D] mb-1">Tell us about your team</h2>
                  <p className="text-sm text-[#6B6A66]">Used to calibrate recommendations and benchmark your spending</p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase text-[#8C8A66] mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Team size
                    </label>
                    <input
                      type="number"
                      value={formData.teamSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamSize: Number(e.target.value) }))}
                      className={`w-full px-4 py-2.5 text-base border rounded-lg bg-white text-[#0F0E0D] font-mono outline-none transition-all ${
                        validationErrors.teamSize ? 'border-red-400' : 'border-[#E2E0DB] focus:border-[#A0ADCA]'
                      } focus:ring-2 focus:ring-[#1A3A6B]/10`}
                      min="1"
                    />
                    {validationErrors.teamSize && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {validationErrors.teamSize}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-[#8C8A86] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Primary use case
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {USE_CASES.map(useCase => (
                      <button
                        key={useCase.value}
                        onClick={() => setFormData(prev => ({ ...prev, useCase: useCase.value as any }))}
                        className={`flex items-center gap-3 p-4 border rounded-lg text-left transition-all group ${
                          formData.useCase === useCase.value
                            ? 'border-[#1A3A6B] bg-[#EEF2FA] text-[#1A3A6B] font-semibold'
                            : 'border-[#E2E0DB] bg-white text-[#4A4845] hover:border-[#A0ADCA] hover:bg-[#EEF2FA]/50'
                        }`}
                      >
                        <span className={formData.useCase === useCase.value ? 'text-[#1A3A6B]' : 'text-[#8C8A86]'}>
                          {useCase.icon}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{useCase.label}</div>
                          <div className="text-xs text-[#8C8A86] group-hover:text-[#6B6A66]">{useCase.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-[#F7F6F3] border border-[#E2E0DB] rounded-lg px-5 py-4">
                  <CheckCircle2 className="w-5 h-5 text-[#0F5C3A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#0F0E0D] mb-1">Privacy guaranteed</p>
                    <p className="text-sm text-[#6B6A66] leading-relaxed">
                      No data leaves this session. We never store, share, or sell any information you enter.
                      Email is optional and only used to send your report.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit area */}
            <div className="mt-8 pt-6 border-t border-[#E2E0DB] flex items-center justify-between flex-wrap gap-4">
              <div className="text-base text-[#6B6A66]">
                Analyzing{' '}
                <span className="font-semibold text-[#0F0E0D]">{formData.tools.length}</span>{' '}
                tool{formData.tools.length !== 1 ? 's' : ''}{' '}
                <span className="mx-2">·</span>
                <span className="font-mono font-bold text-[#0F0E0D] text-xl">
                  ${totalSpend.toLocaleString()}
                </span>
                <span className="text-sm">/mo</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2.5 bg-[#1A3A6B] text-white text-base font-semibold px-6 py-3 rounded-lg hover:bg-[#152e58] active:scale-[.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Run audit
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#E2E0DB] flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#8C8A86]">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> No credit card required</span>
          <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Results are instant</span>
          <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Shareable report</span>
          <span className="text-[#C8C6C0] ml-auto">Cursor · GitHub Copilot · Claude · ChatGPT · Anthropic API · OpenAI API · Gemini · Windsurf</span>
        </div>
      </div>
    </div>
  );
}