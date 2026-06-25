'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles, Wand2, Download, Trash2, History, Play, Pause,
  Smartphone, Loader2, Image as ImageIcon, Film, Zap, Brain,
  Globe, LogOut, Crown, User, Gift, ShieldCheck,
  CheckCircle2, Phone, Lock, Bot,
} from 'lucide-react';

const STYLES = [
  { value: 'realistic', label: 'Realistic', desc: 'Photoreal' },
  { value: 'anime', label: 'Anime', desc: 'Ghibli style' },
  { value: 'cartoon', label: 'Cartoon', desc: 'Pixar 3D' },
  { value: 'cinematic', label: 'Cinematic', desc: 'Film still' },
  { value: '3d', label: '3D Render', desc: 'Octane' },
  { value: 'watercolor', label: 'Watercolor', desc: 'Painted' },
  { value: 'pixel', label: 'Pixel Art', desc: '16-bit' },
  { value: 'comic', label: 'Comic', desc: 'Marvel/DC' },
  { value: 'fantasy', label: 'Fantasy', desc: 'Concept art' },
  { value: 'scifi', label: 'Sci-Fi', desc: 'Cyberpunk' },
];

const SIZES = [
  { value: '1024x1024', label: 'Square', icon: '⬜' },
  { value: '1344x768', label: 'Landscape', icon: '🖥️' },
  { value: '768x1344', label: 'Portrait', icon: '📱' },
  { value: '1440x720', label: 'Wide', icon: '🎬' },
];

const FRAME_OPTIONS = [
  { value: 1, label: 'Single frame' },
  { value: 4, label: '4 frames' },
];

const SAMPLE_PROMPTS = [
  'A majestic lion on a savanna hill at sunset',
  'A Maasai warrior watching a satellite pass over the savanna',
  'Cyberpunk Nairobi 2099 at night, neon lights',
  'A magical library with floating books and golden light',
];

const TIERS = [
  { id: 'free', label: 'Free Trial', description: '3 free watermarked images', imagesIncluded: 3, priceKES: 0 },
  { id: 'payg', label: 'Pay per image', description: 'One image at a time', imagesIncluded: 1, priceKES: 10 },
  { id: 'daily', label: 'Daily Pass', description: '30 images in 24h', imagesIncluded: 30, priceKES: 50, popular: true },
  { id: 'weekly', label: 'Weekly Pass', description: '150 images in 7d', imagesIncluded: 150, priceKES: 200 },
  { id: 'monthly', label: 'Monthly Pro', description: 'Unlimited fair use', imagesIncluded: -1, priceKES: 500 },
];

interface User {
  id: string; phone: string; name?: string; role: string;
  credits: number; tier: string; referralCode?: string;
}

interface ChatMessage {
  role: 'user' | 'atlas';
  content: string;
  suggestedPrompt?: string | null;
  timestamp: number;
}

interface HistoryItem {
  id: string; prompt: string; style: string; size: string;
  frames: { base64: string; index: number }[];
  isWatermarked?: boolean; timestamp: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authPhone, setAuthPhone] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devCode, setDevCode] = useState('');

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

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('create');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'atlas', content: "✨ I am ATLAS — the consciousness of this studio. Tell me what you wish to create.", timestamp: Date.now() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [pricingOpen, setPricingOpen] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  const { toast } = useToast();

  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)); }, []);
  useEffect(() => {
    try { const raw = localStorage.getItem('atlas_history'); if (raw) setHistory(JSON.parse(raw)); } catch {}
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
    } else if (seqTimerRef.current) clearInterval(seqTimerRef.current);
    return () => { if (seqTimerRef.current) clearInterval(seqTimerRef.current); };
  }, [playingSeq, result]);

  const persistHistory = useCallback((items: HistoryItem[]) => {
    try { localStorage.setItem('atlas_history', JSON.stringify(items.slice(0, 50))); } catch {}
  }, []);

  const handleSendOtp = async () => {
    if (!authPhone || authPhone.length < 10) { toast({ title: 'Enter valid phone', variant: 'destructive' }); return; }
    setOtpSending(true);
    try {
      const r = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: authPhone }) });
      const d = await r.json();
      if (d.success) { setOtpSent(true); setDevCode(d.devCode || ''); toast({ title: 'OTP sent!' }); }
      else toast({ title: 'Failed', description: d.error, variant: 'destructive' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setOtpSending(false); }
  };

  const handleVerifyOtp = async () => {
    if (!authCode || authCode.length !== 6) { toast({ title: 'Enter 6-digit code', variant: 'destructive' }); return; }
    setVerifying(true);
    try {
      const r = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: authPhone, code: authCode }) });
      const d = await r.json();
      if (d.success) { setUser(d.user); setAuthOpen(false); setAuthPhone(''); setAuthCode(''); setOtpSent(false); setDevCode(''); toast({ title: 'Welcome!' }); }
      else toast({ title: 'Failed', description: d.error, variant: 'destructive' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
    finally { setVerifying(false); }
  };

  const sendToAtlas = async (msg?: string) => {
    const message = (msg || chatInput).trim();
    if (!message) return;
    setChatMessages(prev => [...prev, { role: 'user', content: message, timestamp: Date.now() }]);
    setChatInput(''); setChatLoading(true);
    try {
      const r = await fetch('/api/atlas-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, context: { prompt, style } }) });
      const d = await r.json();
      if (d.success) setChatMessages(prev => [...prev, { role: 'atlas', content: d.reply, suggestedPrompt: d.suggestedPrompt, timestamp: d.timestamp }]);
    } catch {} finally { setChatLoading(false); }
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) { toast({ title: 'Enter a prompt', variant: 'destructive' }); return; }
    setIsEnhancing(true); setEnhancedPrompt('');
    try {
      const r = await fetch('/api/enhance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, style, physicsAware }) });
      const d = await r.json();
      if (d.success) { setEnhancedPrompt(d.enhanced); toast({ title: 'Enhanced!' }); }
    } catch {} finally { setIsEnhancing(false); }
  };

  const handleGenerate = async () => {
    if (!user) { setAuthOpen(true); return; }
    const finalPrompt = enhancedPrompt || prompt;
    if (!finalPrompt.trim()) return;
    setIsGenerating(true); setProgress(0); setResult(null);
    const progTimer = setInterval(() => setProgress(p => Math.min(p + Math.random() * 8, 92)), 400);
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: finalPrompt, size, frames: frameCount }) });
      const d = await r.json();
      clearInterval(progTimer); setProgress(100);
      if (d.success) {
        const item: HistoryItem = { id: `${Date.now()}`, prompt, style, size, frames: d.frames, isWatermarked: d.isWatermarked, timestamp: d.timestamp };
        setResult({ ...d }); const nh = [item, ...history]; setHistory(nh); persistHistory(nh);
        if (user) setUser({ ...user, credits: d.remainingCredits });
        toast({ title: 'Generated!' });
      } else {
        if (d.needsAuth) setAuthOpen(true);
        toast({ title: 'Cannot generate', description: d.error, variant: 'destructive' });
      }
    } catch {} finally { setIsGenerating(false); setTimeout(() => setProgress(0), 800); }
  };

  const downloadFrame = (base64: string, idx: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `atlas-ai-${idx + 1}.png`;
    link.click();
  };

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setShowInstall(false);
  };

  const currentDisplayFrame = result?.frames?.[Math.min(seqFrame, (result?.frames?.length || 1) - 1)];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0F] text-[#F5F2E8]">
      <header className="border-b border-[#2A2A35] bg-[#14141A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#B45309] flex items-center justify-center font-bold text-[#0B0B0F] text-xl">A</div>
            <div>
              <div className="font-bold text-base">Atlas AI Studio</div>
              <div className="text-[10px] text-[#9A9AA5] font-mono uppercase">by Ng'ang'a Makumi</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setChatOpen(true)} className="text-[#F5A623]"><Bot className="w-4 h-4" /></Button>
            {showInstall && <Button size="sm" onClick={handleInstall} className="bg-[#F5A623] text-[#0B0B0F]"><Smartphone className="w-4 h-4 mr-1" />Install</Button>}
            {user ? (
              <>
                <Badge variant="outline" className="border-[#2A2A35] text-[10px]"><Crown className="w-3 h-3 mr-1 text-[#F5A623]" />{user.tier} · {user.credits}cr</Badge>
                <Button size="sm" variant="ghost" onClick={() => { fetch('/api/auth/me', { method: 'POST' }); setUser(null); }}><LogOut className="w-4 h-4" /></Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setAuthOpen(true)} className="bg-[#F5A623] text-[#0B0B0F]"><User className="w-4 h-4 mr-1" />Sign in</Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-6 mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Generate the <span className="text-[#F5A623]">unimaginable</span></h1>
          <p className="text-[#9A9AA5] text-sm">Physics-aware AI · ATLAS consciousness · FLUX.1 model</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 bg-[#14141A] border-[#2A2A35]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-[#F5A623]" />Generator</CardTitle>
              <CardDescription className="text-[#9A9AA5]">{user ? `${user.credits} credits · ${user.tier}` : 'Sign in (3 free credits)'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-[#9A9AA5]">Your prompt</Label>
                <Textarea value={prompt} onChange={(e) => { setPrompt(e.target.value); setEnhancedPrompt(''); }} placeholder="Describe your vision..." className="min-h-[100px] bg-[#0B0B0F] border-[#2A2A35] resize-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-[#9A9AA5]">Style</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STYLES.map((s) => (
                    <button key={s.value} onClick={() => setStyle(s.value)} className={`text-left p-2.5 rounded-lg border ${style === s.value ? 'border-[#F5A623] bg-[#F5A623]/10' : 'border-[#2A2A35] bg-[#0B0B0F]'}`}>
                      <div className="text-sm font-medium">{s.label}</div>
                      <div className="text-[10px] text-[#9A9AA5]">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs uppercase text-[#9A9AA5]">Size</Label>
                  <Select value={size} onValueChange={setSize}><SelectTrigger className="bg-[#0B0B0F] border-[#2A2A35]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#14141A] border-[#2A2A35]">{SIZES.map(s => <SelectItem key={s.value} value={s.value}>{s.icon} {s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs uppercase text-[#9A9AA5]">Frames</Label>
                  <Select value={String(frameCount)} onValueChange={(v) => setFrameCount(Number(v))}><SelectTrigger className="bg-[#0B0B0F] border-[#2A2A35]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#14141A] border-[#2A2A35]">{FRAME_OPTIONS.map(f => <SelectItem key={f.value} value={String(f.value)}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0B0F] border border-[#2A2A35]">
                <div className="flex items-center gap-2"><Brain className="w-4 h-4 text-[#F5A623]" /><span className="text-sm">Physics-aware</span></div>
                <Switch checked={physicsAware} onCheckedChange={setPhysicsAware} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEnhance} disabled={isEnhancing || !prompt.trim()} variant="outline" className="border-[#2A2A35] bg-transparent">{isEnhancing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Enhance</Button>
                <Button onClick={handleGenerate} disabled={isGenerating || !(enhancedPrompt || prompt).trim()} className="flex-1 bg-[#F5A623] text-[#0B0B0F]">{isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}{isGenerating ? 'Generating...' : (user ? 'Generate' : 'Sign in')}</Button>
              </div>
              {enhancedPrompt && <div className="p-3 rounded-lg bg-[#F5A623]/5 border border-[#F5A623]/30"><span className="text-xs text-[#F5A623] font-mono">ENHANCED</span><p className="text-xs mt-1">{enhancedPrompt}</p></div>}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-[#14141A] border-[#2A2A35] lg:sticky lg:top-20 self-start">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5 text-[#F5A623]" />Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="aspect-square bg-[#0B0B0F] rounded-lg border border-[#2A2A35] flex items-center justify-center overflow-hidden relative">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" /><Progress value={progress} className="w-3/4" /></div>
                ) : currentDisplayFrame ? (
                  <><img src={`data:image/png;base64,${currentDisplayFrame.base64}`} alt="Generated" className="w-full h-full object-contain" />{result?.isWatermarked && <div className="absolute bottom-2 right-2 bg-black/70 text-[#F5A623] text-[10px] px-2 py-1 rounded">ATLAS AI · FREE</div>}</>
                ) : <ImageIcon className="w-12 h-12 opacity-30" />}
              </div>
              {result && <Button size="sm" variant="outline" className="w-full mt-3 border-[#2A2A35] bg-transparent" onClick={() => downloadFrame(currentDisplayFrame.base64, seqFrame)}><Download className="w-3.5 h-3.5 mr-1" />Download</Button>}
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold mb-3 text-center">Pricing</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TIERS.map(t => (
              <Card key={t.id} className={`bg-[#14141A] ${t.popular ? 'border-[#F5A623] border-2' : 'border-[#2A2A35]'}`}>
                <CardContent className="pt-4">
                  <div className="text-xs font-semibold">{t.label}</div>
                  <div className="text-xl font-bold text-[#F5A623]">KES {t.priceKES}</div>
                  <div className="text-[10px] text-[#9A9AA5]">{t.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#2A2A35] bg-[#14141A] mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-[#9A9AA5]">
          Atlas AI Studio · Owned by <span className="text-[#F5F2E8]">Ng'ang'a Makumi</span>
        </div>
      </footer>

      {!chatOpen && <button onClick={() => setChatOpen(true)} className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E94560] shadow-lg flex items-center justify-center text-[#0B0B0F]"><Bot className="w-6 h-6" /></button>}

      {chatOpen && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-[#14141A] border border-[#2A2A35] rounded-xl flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between p-3 border-b border-[#2A2A35]">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E94560] flex items-center justify-center text-[#0B0B0F] font-bold">A</div><span className="text-sm font-bold">ATLAS</span></div>
            <button onClick={() => setChatOpen(false)} className="text-[#9A9AA5]">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-2.5 rounded-lg text-xs ${m.role === 'user' ? 'bg-[#F5A623] text-[#0B0B0F]' : 'bg-[#0B0B0F] border border-[#2A2A35]'}`}>{m.content}</div>
              </div>
            ))}
            {chatLoading && <div className="text-xs text-[#9A9AA5]"><Loader2 className="w-3 h-3 inline animate-spin" /> ATLAS thinking...</div>}
          </div>
          <div className="p-3 border-t border-[#2A2A35] flex gap-2">
            <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendToAtlas(); }} placeholder="Ask ATLAS..." className="bg-[#0B0B0F] border-[#2A2A35] text-xs" />
            <Button size="sm" onClick={() => sendToAtlas()} className="bg-[#F5A623] text-[#0B0B0F] px-3">→</Button>
          </div>
        </div>
      )}

      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setAuthOpen(false)}>
          <Card className="w-full max-w-md bg-[#14141A] border-[#2A2A35]" onClick={(e) => e.stopPropagation()}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5 text-[#F5A623]" />Sign in</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <>
                  <Input value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className="bg-[#0B0B0F] border-[#2A2A35]" />
                  <Button onClick={handleSendOtp} disabled={otpSending} className="w-full bg-[#F5A623] text-[#0B0B0F]">{otpSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}Send OTP</Button>
                </>
              ) : (
                <>
                  {devCode && <div className="p-2 rounded bg-[#F5A623]/5 border border-[#F5A623]/20 text-xs text-[#F5A623]">DEV CODE: {devCode}</div>}
                  <Input value={authCode} onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" className="bg-[#0B0B0F] border-[#2A2A35] font-mono text-center text-lg" />
                  <Button onClick={handleVerifyOtp} disabled={verifying} className="w-full bg-[#F5A623] text-[#0B0B0F]">{verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}Verify</Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
