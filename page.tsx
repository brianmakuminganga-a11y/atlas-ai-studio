'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles, Wand2, Download, Trash2, History, Play, Pause,
  Smartphone, Loader2, Image as ImageIcon, Film, Zap, Brain,
  Globe, LogOut, Crown, User, Gift, ShieldCheck, BarChart3,
  CheckCircle2, Phone, Lock, MapPin, TrendingUp, Share2, Layout,
} from 'lucide-react';
import {
  STYLES, SIZES, FRAME_OPTIONS, SAMPLE_PROMPTS,
  TIERS, COUNTRY_CURRENCY, COUNTRY_NAME, AVAILABLE_PAYMENTS,
  formatPrice, type CountryCode, type CurrencyCode,
} from '@/lib/pricing-client';
import { PROMPT_PACKS, PROMPT_CATEGORIES } from '@/lib/prompt-packs';

interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  country?: string;
  role: string;
  credits: number;
  tier: string;
  tierExpiresAt?: string | null;
  referralCode?: string;
  referredBy?: string;
  referralsCount: number;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  prompt: string;
  enhancedPrompt?: string;
  style: string;
  size: string;
  frames: { base64: string; index: number }[];
  isWatermarked?: boolean;
  timestamp: number;
}

export default function Home() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authPhone, setAuthPhone] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [authReferral, setAuthReferral] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devCode, setDevCode] = useState('');

  // Country
  const [country, setCountry] = useState<CountryCode>('KE');
  const currency: CurrencyCode = COUNTRY_CURRENCY[country];

  // Generation state
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1024x1024');
  const [frameCount, setFrameCount] = useState(1);
  const [physicsAware, setPhysicsAware] = useState(true);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [playingSeq, setPlayingSeq] = useState(false);
  const [seqFrame, setSeqFrame] = useState(0);
  const seqTimerRef = useRef<any>(null);

  // History (local-only)
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('create');

  // Pricing modal
  const [pricingOpen, setPricingOpen] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<string | null>(null);
  const [checkoutProvider, setCheckoutProvider] = useState<string>('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Prompt packs
  const [packCategory, setPackCategory] = useState('All');
  const [showPacks, setShowPacks] = useState(false);

  // Admin
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // PWA install
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  const { toast } = useToast();

  // ---- Effects ----
  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)); }, []);

  useEffect(() => {
    try { const raw = localStorage.getItem('atlas_history'); if (raw) setHistory(JSON.parse(raw)); } catch {}
    const storedCountry = (localStorage.getItem('atlas_country') as CountryCode) || null;
    if (storedCountry) setCountry(storedCountry);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPromptEvent(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  useEffect(() => {
    if (playingSeq && result && result.frames.length > 1) {
      seqTimerRef.current = setInterval(() => setSeqFrame(f => (f + 1) % result.frames.length), 600);
    } else if (seqTimerRef.current) {
      clearInterval(seqTimerRef.current);
    }
    return () => { if (seqTimerRef.current) clearInterval(seqTimerRef.current); };
  }, [playingSeq, result]);

  const persistHistory = useCallback((items: HistoryItem[]) => {
    try { localStorage.setItem('atlas_history', JSON.stringify(items.slice(0, 50))); } catch {
      try { localStorage.setItem('atlas_history', JSON.stringify(items.slice(0, 20))); } catch {}
    }
  }, []);

  // ---- Auth ----
  const handleSendOtp = async () => {
    if (!authPhone || authPhone.length < 10) { toast({ title: 'Enter valid phone', variant: 'destructive' }); return; }
    setOtpSending(true);
    try {
      const r = await fetch('/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: authPhone }),
      });
      const d = await r.json();
      if (d.success) {
        setOtpSent(true);
        setDevCode(d.devCode || '');
        toast({ title: 'OTP sent!', description: d.message });
      } else toast({ title: 'Failed', description: d.error, variant: 'destructive' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setOtpSending(false); }
  };

  const handleVerifyOtp = async () => {
    if (!authCode || authCode.length !== 6) { toast({ title: 'Enter 6-digit code', variant: 'destructive' }); return; }
    setVerifying(true);
    try {
      const r = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: authPhone, code: authCode, referredBy: authReferral || undefined }),
      });
      const d = await r.json();
      if (d.success) {
        setUser(d.user);
        setAuthOpen(false);
        setAuthPhone(''); setAuthCode(''); setAuthReferral(''); setOtpSent(false); setDevCode('');
        toast({ title: 'Welcome to Atlas AI Studio!', description: `Logged in. ${d.user.credits} credits available.` });
      } else toast({ title: 'Verification failed', description: d.error, variant: 'destructive' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setVerifying(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'POST' });
    setUser(null);
    toast({ title: 'Logged out' });
  };

  // ---- Enhance ----
  const handleEnhance = async () => {
    if (!prompt.trim()) { toast({ title: 'Enter a prompt first', variant: 'destructive' }); return; }
    setIsEnhancing(true); setEnhancedPrompt('');
    try {
      const r = await fetch('/api/enhance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, physicsAware }),
      });
      const d = await r.json();
      if (d.success) { setEnhancedPrompt(d.enhanced); toast({ title: 'Prompt enhanced' }); }
      else toast({ title: 'Enhancement failed', description: d.error, variant: 'destructive' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setIsEnhancing(false); }
  };

  // ---- Generate ----
  const handleGenerate = async () => {
    if (!user) { setAuthOpen(true); return; }
    const finalPrompt = enhancedPrompt || prompt;
    if (!finalPrompt.trim()) { toast({ title: 'Enter a prompt first', variant: 'destructive' }); return; }
    setIsGenerating(true); setProgress(0); setResult(null); setPlayingSeq(false); setSeqFrame(0);
    const progTimer = setInterval(() => setProgress(p => Math.min(p + Math.random() * 8, 92)), 400);
    try {
      const r = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, size, frames: frameCount }),
      });
      const d = await r.json();
      clearInterval(progTimer); setProgress(100);
      if (d.success) {
        const item: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          prompt, enhancedPrompt: enhancedPrompt || undefined, style, size,
          frames: d.frames, isWatermarked: d.isWatermarked, timestamp: d.timestamp,
        };
        setResult({ ...d, historyItem: item });
        const newHistory = [item, ...history];
        setHistory(newHistory); persistHistory(newHistory);
        // Update user credits
        if (user) setUser({ ...user, credits: d.remainingCredits, tier: d.tier });
        toast({ title: `Generated ${d.frames.length} frame${d.frames.length > 1 ? 's' : ''}!`, description: `${d.remainingCredits} credits left` });
      } else {
        if (d.needsAuth) setAuthOpen(true);
        else if (d.needsPayment) setPricingOpen(true);
        toast({ title: 'Cannot generate', description: d.error, variant: 'destructive' });
      }
    } catch (e: any) { clearInterval(progTimer); toast({ title: 'Failed', description: e.message, variant: 'destructive' }); }
    finally { setIsGenerating(false); setTimeout(() => setProgress(0), 800); }
  };

  // ---- Payment ----
  const handleInitiatePayment = async () => {
    if (!checkoutTier) return;
    if (checkoutProvider === 'mpesa' && !checkoutPhone) { toast({ title: 'Enter M-Pesa phone number', variant: 'destructive' }); return; }
    setCheckoutLoading(true);
    try {
      const r = await fetch('/api/payment/initiate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: checkoutTier, provider: checkoutProvider, phoneNumber: checkoutPhone }),
      });
      const d = await r.json();
      if (d.success) {
        // For dev mode: simulate success immediately
        if (d.mode === 'dev') {
          toast({ title: 'DEV: Simulating payment success...', description: d.message });
          const cb = await fetch('/api/payment/callback', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: d.paymentId, status: 'completed' }),
          });
          const cbd = await cb.json();
          if (cbd.success) {
            toast({ title: 'Payment successful!', description: `${cbd.imagesIncluded} credits added. Tier: ${cbd.tier}` });
            // Refresh user
            const me = await fetch('/api/auth/me').then(r => r.json());
            setUser(me.user);
            setPricingOpen(false); setCheckoutTier(null); setCheckoutProvider(''); setCheckoutPhone('');
          }
        } else if (d.checkoutUrl) {
          window.location.href = d.checkoutUrl;
        } else if (d.provider === 'mpesa') {
          toast({ title: 'Check your phone', description: d.message });
        }
      } else toast({ title: 'Payment failed', description: d.error, variant: 'destructive' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setCheckoutLoading(false); }
  };

  // ---- Admin ----
  const handleOpenAdmin = async () => {
    if (!user || user.role !== 'admin') { toast({ title: 'Admin only', variant: 'destructive' }); return; }
    setAdminOpen(true); setAdminLoading(true);
    try {
      const r = await fetch('/api/admin/stats');
      const d = await r.json();
      if (r.ok) setAdminStats(d);
      else toast({ title: 'Failed', description: d.error, variant: 'destructive' });
    } finally { setAdminLoading(false); }
  };

  // ---- Country switch ----
  const changeCountry = (c: CountryCode) => {
    setCountry(c); localStorage.setItem('atlas_country', c);
  };

  // ---- Download / History ----
  const downloadFrame = (base64: string, idx: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `atlas-ai-${Date.now()}-${idx + 1}.png`;
    link.click();
  };
  const shareResult = async (prompt: string) => {
    const shareText = `🎨 Made with Atlas AI Studio — "${prompt.slice(0, 60)}${prompt.length > 60 ? '…' : ''}"\n\nTry it free: ${window.location.origin}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Atlas AI Studio', text: shareText, url: window.location.origin });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({ title: 'Copied to clipboard!', description: 'Paste in WhatsApp/TikTok to share.' });
      }
    } catch {}
  };
  const deleteHistoryItem = (id: string) => {
    const n = history.filter(h => h.id !== id); setHistory(n); persistHistory(n);
  };
  const clearHistory = () => { setHistory([]); localStorage.removeItem('atlas_history'); toast({ title: 'History cleared' }); };

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === 'accepted') toast({ title: 'Installed!', description: 'Atlas AI added to home screen.' });
    setShowInstall(false); setInstallPromptEvent(null);
  };

  const currentStyleObj = STYLES.find(s => s.value === style);
  const currentDisplayFrame = result?.frames?.[Math.min(seqFrame, (result?.frames?.length || 1) - 1)];
  const availablePayments = AVAILABLE_PAYMENTS[country] || AVAILABLE_PAYMENTS.OTHER;
  const selectedTierObj = TIERS.find(t => t.id === checkoutTier);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0F] text-[#F5F2E8]">
      {/* HEADER */}
      <header className="border-b border-[#2A2A35] bg-[#14141A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#B45309] flex items-center justify-center font-bold text-[#0B0B0F] text-lg">A</div>
            <div>
              <div className="font-bold text-base leading-tight">Atlas AI Studio</div>
              <div className="text-[10px] text-[#9A9AA5] font-mono uppercase tracking-wider">by Ng'ang'a Makumi</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Country selector */}
            <Select value={country} onValueChange={(v) => changeCountry(v as CountryCode)}>
              <SelectTrigger className="w-[90px] h-8 bg-[#0B0B0F] border-[#2A2A35] text-xs">
                <Globe className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#14141A] border-[#2A2A35]">
                {Object.entries(COUNTRY_NAME).map(([code, name]) => (
                  <SelectItem key={code} value={code}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showInstall && (
              <Button size="sm" onClick={handleInstall} className="bg-[#F5A623] text-[#0B0B0F] hover:bg-[#F5A623]/90 h-8">
                <Smartphone className="w-4 h-4 mr-1" /> Install
              </Button>
            )}
            {user ? (
              <>
                <Badge variant="outline" className="border-[#2A2A35] text-[#9A9AA5] text-[10px]">
                  <Crown className="w-3 h-3 mr-1 text-[#F5A623]" />
                  {user.tier.toUpperCase()} · {user.credits}cr
                </Badge>
                {user.role === 'admin' && (
                  <Button size="sm" variant="ghost" onClick={handleOpenAdmin} className="h-8 text-[#9A9AA5] hover:text-[#F5A623]">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleLogout} className="h-8 text-[#9A9AA5] hover:text-[#E94560]">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setAuthOpen(true)} className="bg-[#F5A623] text-[#0B0B0F] hover:bg-[#F5A623]/90 h-8">
                <User className="w-4 h-4 mr-1" /> Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#14141A] border border-[#2A2A35]">
            <TabsTrigger value="create" className="data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#0B0B0F]">
              <Wand2 className="w-4 h-4 mr-2" /> Create
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#0B0B0F]">
              <History className="w-4 h-4 mr-2" /> History
              {history.length > 0 && <Badge className="ml-2 bg-[#2A2A35] text-[#F5F2E8] text-[10px] px-1.5 py-0">{history.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* CREATE TAB */}
          <TabsContent value="create" className="mt-6 space-y-6">
            <div className="text-center py-2">
              <h1 className="text-3xl sm:text-5xl font-bold mb-3 leading-tight">
                Generate anything.<br className="sm:hidden" />
                <span className="text-[#F5A623]"> Physics-aware. Real.</span>
              </h1>
              <p className="text-[#9A9AA5] text-sm sm:text-base max-w-2xl mx-auto">
                Realistic photos, anime, cartoons, cinematic shots — pay with {availablePayments[0]?.label || 'M-Pesa/PayPal'}.
                Serving {COUNTRY_NAME[country]} · {currency}.
              </p>
            </div>

            {/* PROMPT PACKS — niche templates */}
            <Card className="bg-[#14141A] border-[#2A2A35]">
              <CardHeader className="pb-3">
                <button onClick={() => setShowPacks(!showPacks)} className="flex items-center justify-between w-full text-left">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layout className="w-4 h-4 text-[#F5A623]" /> Quick start templates
                  </CardTitle>
                  <span className="text-[10px] text-[#9A9AA5] font-mono uppercase">{showPacks ? 'Hide' : 'Show'}</span>
                </button>
              </CardHeader>
              {showPacks && (
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_CATEGORIES.map((cat) => (
                      <button key={cat} onClick={() => setPackCategory(cat)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${packCategory === cat ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]' : 'border-[#2A2A35] text-[#9A9AA5] hover:border-[#9A9AA5]'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {PROMPT_PACKS
                      .filter(p => packCategory === 'All' || p.category === packCategory)
                      .map((pack) => (
                        <button key={pack.id}
                          onClick={() => { setPrompt(pack.prompt); setStyle(pack.recommendedStyle); setEnhancedPrompt(''); toast({ title: `${pack.label} loaded`, description: `Style: ${pack.recommendedStyle}` }); }}
                          className="text-left p-2.5 rounded-lg border border-[#2A2A35] bg-[#0B0B0F] hover:border-[#F5A623] hover:bg-[#F5A623]/5 transition-all">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-base">{pack.icon}</span>
                            <span className="text-xs font-medium">{pack.label}</span>
                          </div>
                          <div className="text-[10px] text-[#9A9AA5] line-clamp-2">{pack.prompt.slice(0, 80)}…</div>
                        </button>
                      ))}
                  </div>
                </CardContent>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* CONTROLS */}
              <Card className="lg:col-span-3 bg-[#14141A] border-[#2A2A35]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wand2 className="w-5 h-5 text-[#F5A623]" /> Generator
                  </CardTitle>
                  <CardDescription className="text-[#9A9AA5]">
                    {user ? `You have ${user.credits} credits · ${user.tier} tier` : 'Sign in to generate (3 free credits)'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-xs uppercase tracking-wider text-[#9A9AA5]">Your prompt</Label>
                    <Textarea
                      id="prompt" value={prompt}
                      onChange={(e) => { setPrompt(e.target.value); if (enhancedPrompt) setEnhancedPrompt(''); }}
                      placeholder="A lone samurai standing in cherry blossom rain at dusk..."
                      className="min-h-[100px] bg-[#0B0B0F] border-[#2A2A35] text-[#F5F2E8] resize-none focus-visible:ring-[#F5A623]"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_PROMPTS.slice(0, 4).map((p) => (
                        <button key={p} onClick={() => { setPrompt(p); setEnhancedPrompt(''); }}
                          className="text-[10px] text-[#9A9AA5] hover:text-[#F5A623] border border-[#2A2A35] hover:border-[#F5A623] rounded-full px-2 py-1 transition-colors">
                          {p.slice(0, 40)}{p.length > 40 ? '…' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-[#9A9AA5]">Style</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {STYLES.map((s) => (
                        <button key={s.value} onClick={() => setStyle(s.value)}
                          className={`text-left p-2.5 rounded-lg border transition-all ${style === s.value ? 'border-[#F5A623] bg-[#F5A623]/10' : 'border-[#2A2A35] bg-[#0B0B0F] hover:border-[#9A9AA5]'}`}>
                          <div className="text-sm font-medium">{s.label}</div>
                          <div className="text-[10px] text-[#9A9AA5] mt-0.5">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-[#9A9AA5]">Aspect ratio</Label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger className="bg-[#0B0B0F] border-[#2A2A35]"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#14141A] border-[#2A2A35]">
                          {SIZES.map((s) => <SelectItem key={s.value} value={s.value}>{s.icon} {s.label} · {s.value}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-[#9A9AA5]">Frames</Label>
                      <Select value={String(frameCount)} onValueChange={(v) => setFrameCount(Number(v))}>
                        <SelectTrigger className="bg-[#0B0B0F] border-[#2A2A35]"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#14141A] border-[#2A2A35]">
                          {FRAME_OPTIONS.map((f) => <SelectItem key={f.value} value={String(f.value)}>{f.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#0B0B0F] border border-[#2A2A35]">
                    <div className="flex items-start gap-2.5">
                      <Brain className="w-4 h-4 text-[#F5A623] mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Physics-aware enhancement</div>
                        <div className="text-[11px] text-[#9A9AA5] mt-0.5">AI expands your prompt with material, lighting, lens & chemistry cues.</div>
                      </div>
                    </div>
                    <Switch checked={physicsAware} onCheckedChange={setPhysicsAware} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleEnhance} disabled={isEnhancing || !prompt.trim()} variant="outline"
                      className="border-[#2A2A35] hover:border-[#F5A623] hover:text-[#F5A623] bg-transparent">
                      {isEnhancing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Enhance prompt
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || !(enhancedPrompt || prompt).trim()}
                      className="flex-1 bg-[#F5A623] text-[#0B0B0F] hover:bg-[#F5A623]/90">
                      {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                      {isGenerating ? 'Generating...' : (user ? 'Generate' : 'Sign in to generate')}
                    </Button>
                  </div>

                  {enhancedPrompt && (
                    <div className="p-3 rounded-lg bg-[#F5A623]/5 border border-[#F5A623]/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F5A623]" />
                        <span className="text-xs uppercase tracking-wider text-[#F5A623] font-mono">Enhanced prompt</span>
                      </div>
                      <p className="text-xs text-[#F5F2E8] leading-relaxed">{enhancedPrompt}</p>
                    </div>
                  )}

                  {/* Pricing CTA */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#F5A623]/10 to-transparent border border-[#F5A623]/30">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#F5A623]" />
                      <div>
                        <div className="text-sm font-medium">Need more credits?</div>
                        <div className="text-[11px] text-[#9A9AA5]">From {formatPrice(TIERS[1].prices[currency] || 0, currency)} per image</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setPricingOpen(true)}
                      className="border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-[#0B0B0F] bg-transparent">
                      View plans
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* PREVIEW */}
              <Card className="lg:col-span-2 bg-[#14141A] border-[#2A2A35] lg:sticky lg:top-20 self-start">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#F5A623]" /> Preview</span>
                    {result && result.frames.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => setPlayingSeq(!playingSeq)} className="h-7 text-[#9A9AA5] hover:text-[#F5A623]">
                        {playingSeq ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span className="ml-1 text-xs">{playingSeq ? 'Pause' : 'Play'}</span>
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-[#0B0B0F] rounded-lg border border-[#2A2A35] flex items-center justify-center overflow-hidden relative">
                    {isGenerating ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                        <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
                        <div className="text-xs text-[#9A9AA5] text-center">{frameCount > 1 ? `Generating ${frameCount} frames...` : 'Generating image...'}</div>
                        <Progress value={progress} className="w-3/4 h-1.5 bg-[#2A2A35]" />
                        <div className="text-[10px] text-[#9A9AA5] font-mono">{Math.round(progress)}%</div>
                      </div>
                    ) : currentDisplayFrame ? (
                      <>
                        <img src={`data:image/png;base64,${currentDisplayFrame.base64}`} alt="Generated" className="w-full h-full object-contain" />
                        {result?.isWatermarked && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-[#F5A623] text-[10px] font-mono px-2 py-1 rounded">
                            ATLAS AI · FREE
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-[#6E6E78] p-6">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <div className="text-xs">Your generated image will appear here</div>
                      </div>
                    )}
                  </div>

                  {result && result.frames.length > 1 && (
                    <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                      {result.frames.map((f: any, i: number) => (
                        <button key={i} onClick={() => { setSeqFrame(i); setPlayingSeq(false); }}
                          className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden ${i === seqFrame ? 'border-[#F5A623]' : 'border-[#2A2A35] opacity-60'}`}>
                          <img src={`data:image/png;base64,${f.base64}`} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {result && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-[#2A2A35] hover:border-[#F5A623] hover:text-[#F5A623] bg-transparent"
                        onClick={() => downloadFrame(currentDisplayFrame!.base64, seqFrame)}>
                        <Download className="w-3.5 h-3.5 mr-1" /> Download
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-[#2A2A35] hover:border-[#F5A623] hover:text-[#F5A623] bg-transparent"
                        onClick={() => shareResult(prompt)}>
                        <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                      </Button>
                      {result.frames.length > 1 && (
                        <Button size="sm" variant="outline" className="flex-1 border-[#2A2A35] hover:border-[#F5A623] hover:text-[#F5A623] bg-transparent"
                          onClick={() => result.frames.forEach((f: any, i: number) => setTimeout(() => downloadFrame(f.base64, i), i * 200))}>
                          <Film className="w-3.5 h-3.5 mr-1" /> All
                        </Button>
                      )}
                    </div>
                  )}

                  {result && (
                    <div className="mt-3 pt-3 border-t border-[#2A2A35] space-y-1 text-[10px] font-mono text-[#9A9AA5]">
                      <div className="flex justify-between"><span>STYLE</span><span className="text-[#F5F2E8]">{currentStyleObj?.label}</span></div>
                      <div className="flex justify-between"><span>SIZE</span><span className="text-[#F5F2E8]">{result.size}</span></div>
                      <div className="flex justify-between"><span>FRAMES</span><span className="text-[#F5F2E8]">{result.frames.length}</span></div>
                      <div className="flex justify-between"><span>PHYSICS</span><span className="text-[#F5A623]">{physicsAware ? 'ENHANCED' : 'RAW'}</span></div>
                      <div className="flex justify-between"><span>WATERMARK</span><span className={result.isWatermarked ? 'text-[#E94560]' : 'text-[#4ADE80]'}>{result.isWatermarked ? 'YES (free tier)' : 'NO (paid)'}</span></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-[#14141A] border-[#2A2A35]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Generation history</CardTitle>
                  <CardDescription className="text-[#9A9AA5]">Stored locally on your device. {history.length} item{history.length !== 1 ? 's' : ''}.</CardDescription>
                </div>
                {history.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearHistory} className="text-[#E94560] hover:text-[#E94560]">
                    <Trash2 className="w-4 h-4 mr-1" /> Clear all
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-16 text-[#6E6E78]">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <div className="text-sm">No generations yet</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {history.map((item) => (
                      <div key={item.id} className="group relative aspect-square bg-[#0B0B0F] rounded-lg border border-[#2A2A35] overflow-hidden">
                        <img src={`data:image/png;base64,${item.frames[0].base64}`} alt={item.prompt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                          <div className="text-[10px] text-[#F5F2E8] line-clamp-2 mb-1">{item.prompt}</div>
                          <div className="flex items-center justify-between">
                            <Badge className="text-[9px] bg-[#F5A623] text-[#0B0B0F] px-1 py-0">{item.style}</Badge>
                            <button onClick={() => deleteHistoryItem(item.id)} className="text-[#E94560] hover:text-red-400 p-1">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {item.frames.length > 1 && (
                          <Badge className="absolute top-1 right-1 text-[9px] bg-black/70 text-[#F5A623] px-1 py-0">
                            <Film className="w-2.5 h-2.5 mr-0.5" /> {item.frames.length}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* PRICING SECTION */}
        <div className="mt-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Simple pricing. Big value.</h2>
            <p className="text-[#9A9AA5] text-sm">Pay in {currency}. Cancel anytime. Made for {COUNTRY_NAME[country]}.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {TIERS.map((tier) => (
              <Card key={tier.id} className={`bg-[#14141A] relative ${tier.popular ? 'border-[#F5A623] border-2' : 'border-[#2A2A35]'}`}>
                {tier.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#F5A623] text-[#0B0B0F] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    POPULAR
                  </div>
                )}
                <CardContent className="pt-5">
                  <div className="text-sm font-semibold mb-1">{tier.label}</div>
                  <div className="text-2xl font-bold mb-2 text-[#F5A623]">{formatPrice(tier.prices[currency] || 0, currency)}</div>
                  <div className="text-[11px] text-[#9A9AA5] mb-3 min-h-[32px]">{tier.description}</div>
                  <div className="text-[10px] font-mono text-[#9A9AA5] mb-3">
                    {tier.imagesIncluded === -1 ? 'Unlimited (fair use)' : `${tier.imagesIncluded} images`}
                    {tier.durationHours && ` · ${tier.durationHours}h`}
                  </div>
                  <Button
                    size="sm"
                    variant={tier.id === 'free' ? 'outline' : 'default'}
                    className={`w-full ${tier.id === 'free' ? 'border-[#2A2A35] bg-transparent text-[#9A9AA5]' : 'bg-[#F5A623] text-[#0B0B0F] hover:bg-[#F5A623]/90'}`}
                    disabled={tier.id === 'free'}
                    onClick={() => { if (!user) setAuthOpen(true); else { setCheckoutTier(tier.id); setCheckoutProvider(availablePayments[0]?.provider || 'mpesa'); } }}
                  >
                    {tier.id === 'free' ? 'Current plan' : 'Choose'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* REFERRAL SECTION */}
        {user && (
          <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-[#4ADE80]/10 to-transparent border border-[#4ADE80]/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
              <div className="flex items-start gap-2.5">
                <Gift className="w-5 h-5 text-[#4ADE80] mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">Refer friends, earn free images</div>
                  <div className="text-[11px] text-[#9A9AA5]">Share your code — both of you get 5 free images when they sign up.</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#0B0B0F] text-[#4ADE80] border border-[#4ADE80]/30 font-mono">{user.referralCode}</Badge>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(user.referralCode || ''); toast({ title: 'Copied!' }); }}
                  className="border-[#4ADE80]/30 text-[#4ADE80] hover:bg-[#4ADE80] hover:text-[#0B0B0F] bg-transparent">
                  Copy
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* FEATURES */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-[#14141A] border-[#2A2A35]"><CardContent className="pt-5">
            <Brain className="w-6 h-6 text-[#F5A623] mb-2" />
            <div className="font-semibold text-sm mb-1">Physics-aware AI</div>
            <div className="text-xs text-[#9A9AA5]">LLM expands your prompt with PBR materials, lens specs, lighting chemistry for true realism.</div>
          </CardContent></Card>
          <Card className="bg-[#14141A] border-[#2A2A35]"><CardContent className="pt-5">
            <Film className="w-6 h-6 text-[#F5A623] mb-2" />
            <div className="font-semibold text-sm mb-1">Frame sequences</div>
            <div className="text-xs text-[#9A9AA5]">Generate 4–8 frames with motion continuity. Play as animation. Download for video editing.</div>
          </CardContent></Card>
          <Card className="bg-[#14141A] border-[#2A2A35]"><CardContent className="pt-5">
            <ShieldCheck className="w-6 h-6 text-[#F5A623] mb-2" />
            <div className="font-semibold text-sm mb-1">Secure payments</div>
            <div className="text-xs text-[#9A9AA5]">Pay with M-Pesa (Kenya), Paystack (Nigeria), Stripe (USA), or PayPal — anywhere, anytime.</div>
          </CardContent></Card>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#2A2A35] bg-[#14141A] mt-auto">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#9A9AA5]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#F5A623]" />
            <span>Atlas AI Studio</span>
            <span className="text-[#6E6E78]">·</span>
            <span>Owned & operated by <span className="text-[#F5F2E8] font-medium">Ng'ang'a Makumi</span></span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider">
            Kenya · Nigeria · USA · East Africa
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setAuthOpen(false)}>
          <Card className="w-full max-w-md bg-[#14141A] border-[#2A2A35]" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5 text-[#F5A623]" /> Sign in to Atlas AI</CardTitle>
              <CardDescription>3 free credits to start. No password needed — just your phone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-[#9A9AA5]">Phone number</Label>
                    <Input value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} placeholder="+254 712 345 678"
                      className="bg-[#0B0B0F] border-[#2A2A35] focus-visible:ring-[#F5A623]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-[#9A9AA5]">Referral code (optional)</Label>
                    <Input value={authReferral} onChange={(e) => setAuthReferral(e.target.value.toUpperCase())} placeholder="ATLASXXXX"
                      className="bg-[#0B0B0F] border-[#2A2A35] focus-visible:ring-[#F5A623] font-mono" />
                  </div>
                  <Button onClick={handleSendOtp} disabled={otpSending} className="w-full bg-[#F5A623] text-[#0B0B0F] hover:bg-[#F5A623]/90">
                    {otpSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-2 rounded bg-[#F5A623]/5 border border-[#F5A623]/20 text-xs text-[#9A9AA5]">
                    OTP sent to <span className="text-[#F5F2E8] font-mono">{authPhone}</span>
                    {devCode && <div className="mt-1 text-[#F5A623] font-mono">DEV CODE: {devCode}</div>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-[#9A9AA5]">6-digit code</Label>
                    <Input value={authCode} onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456"
                      className="bg-[#0B0B0F] border-[#2A2A35] focus-visible:ring-[#F5A623] font-mono text-center text-lg tracking-widest" />
                  </div>
                  <Button onClick={handleVerifyOtp} disabled={verifying} className="w-full bg-[#F5A623] text-[#0B0B0F] hover:bg-[#F5A623]/90">
                    {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                    Verify & sign in
                  </Button>
                  <button onClick={() => { setOtpSent(false); setAuthCode(''); setDevCode(''); }} className="w-full text-xs text-[#9A9AA5] hover:text-[#F5A623]">
                    ← Change phone number
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* PRICING/CHECKOUT MODAL */}
      {pricingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => { setPricingOpen(false); setCheckoutTier(null); }}>
          <Card className="w-full max-w-md bg-[#14141A] border-[#2A2A35]" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-[#F5A623]" /> {checkoutTier ? `Upgrade to ${TIERS.find(t=>t.id===checkoutTier)?.label}` : 'Choose a plan'}</CardTitle>
              <CardDescription>Pay in {currency}. Instant activation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!checkoutTier ? (
                <div className="space-y-2">
                  {TIERS.filter(t => t.id !== 'free').map((tier) => (
                    <button key={tier.id} onClick={() => { setCheckoutTier(tier.id); setCheckoutProvider(availablePayments[0]?.provider || 'mpesa'); }}
                      className="w-full text-left p-3 rounded-lg border border-[#2A2A35] hover:border-[#F5A623] bg-[#0B0B0F] flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{tier.label}</div>
                        <div className="text-[11px] text-[#9A9AA5]">{tier.description}</div>
                      </div>
                      <div className="text-[#F5A623] font-bold">{formatPrice(tier.prices[currency] || 0, currency)}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-[#F5A623]/5 border border-[#F5A623]/20 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{selectedTierObj?.label}</div>
                      <div className="text-[11px] text-[#9A9AA5]">{selectedTierObj?.imagesIncluded === -1 ? 'Unlimited' : `${selectedTierObj?.imagesIncluded} images`}</div>
                    </div>
                    <div className="text-2xl font-bold text-[#F5A623]">{formatPrice(selectedTierObj?.prices[currency] || 0, currency)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-[#9A9AA5]">Payment method</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availablePayments.map((p) => (
                        <button key={p.provider} onClick={() => setCheckoutProvider(p.provider)}
                          className={`p-2 rounded border text-left ${checkoutProvider === p.provider ? 'border-[#F5A623] bg-[#F5A623]/10' : 'border-[#2A2A35] bg-[#0B0B0F]'}`}>
                          <div className="text-xs">{p.icon} {p.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {checkoutProvider === 'mpesa' && (
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-[#9A9AA5]">M-Pesa phone number</Label>
                      <Input value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} placeholder={user?.phone || '+254 7XX XXX XXX'}
                        className="bg-[#0B0B0F] border-[#2A2A35] focus-visible:ring-[#F5A623]" />
                    </div>
                  )}
                  <Button onClick={handleInitiatePayment} disabled={checkoutLoading} className="w-full bg-[#F5A623] text-[#0B0B0F] hover:bg-[#F5A623]/90">
                    {checkoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                    Pay {formatPrice(selectedTierObj?.prices[currency] || 0, currency)}
                  </Button>
                  <button onClick={() => setCheckoutTier(null)} className="w-full text-xs text-[#9A9AA5] hover:text-[#F5A623]">← Back to plans</button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ADMIN MODAL */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setAdminOpen(false)}>
          <Card className="w-full max-w-2xl bg-[#14141A] border-[#2A2A35] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#F5A623]" /> Owner Dashboard</CardTitle>
              <CardDescription>Atlas AI Studio — owner: Ng'ang'a Makumi</CardDescription>
            </CardHeader>
            <CardContent>
              {adminLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-[#F5A623] animate-spin" /></div>
              ) : adminStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#0B0B0F] border border-[#2A2A35]">
                      <div className="text-[10px] uppercase text-[#9A9AA5]">Users</div>
                      <div className="text-2xl font-bold text-[#F5A623]">{adminStats.totals.users}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B0B0F] border border-[#2A2A35]">
                      <div className="text-[10px] uppercase text-[#9A9AA5]">Paid</div>
                      <div className="text-2xl font-bold text-[#4ADE80]">{adminStats.totals.paidUsers}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B0B0F] border border-[#2A2A35]">
                      <div className="text-[10px] uppercase text-[#9A9AA5]">Generations</div>
                      <div className="text-2xl font-bold">{adminStats.totals.generations}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0B0B0F] border border-[#2A2A35]">
                    <div className="text-[10px] uppercase text-[#9A9AA5] mb-2">Revenue</div>
                    {Object.keys(adminStats.revenue).length > 0 ? (
                      Object.entries(adminStats.revenue).map(([cur, amt]: any) => (
                        <div key={cur} className="flex justify-between text-sm">
                          <span className="font-mono">{cur}</span>
                          <span className="font-bold text-[#F5A623]">{Number(amt).toLocaleString()}</span>
                        </div>
                      ))
                    ) : <div className="text-xs text-[#6E6E78]">No revenue yet</div>}
                  </div>
                  <div className="p-3 rounded-lg bg-[#0B0B0F] border border-[#2A2A35]">
                    <div className="text-[10px] uppercase text-[#9A9AA5] mb-2">Top countries</div>
                    {adminStats.topCountries.map((c: any) => (
                      <div key={c.country || 'unknown'} className="flex justify-between text-xs">
                        <span>{c.country || 'Unknown'}</span>
                        <span className="font-mono">{c._count.country}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <div className="text-center text-[#6E6E78] text-sm">Failed to load</div>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


