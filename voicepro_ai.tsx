import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Play, Square, Pause, Download, Settings, FileText, 
  History, LayoutDashboard, Wand2, Sliders, Volume2, 
  CheckCircle2, Sparkles, MessageSquare, Plus, Trash2, Cpu,
  AlertTriangle, Palette, Check
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('tts');
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Theme State
  const [currentTheme, setCurrentTheme] = useState('blue');

  // Audio Settings State
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'male-friendly',
    speed: 1.0,
    pitch: 1.0,
    volume: 80,
    emotion: 'neutral',
  });

  // History State
  const [history, setHistory] = useState([]);

  // Engine Selection State
  const [ttsEngine, setTtsEngine] = useState('gemini'); 
  const audioRef = useRef(null);

  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);

  // --- 20 PILIHAN TEMA WARNA ---
  const THEMES = [
    { id: 'red', name: 'Merah', primary: '#ef4444', light: '#fee2e2', shadow: 'rgba(239, 68, 68, 0.4)' },
    { id: 'orange', name: 'Oranye', primary: '#f97316', light: '#ffedd5', shadow: 'rgba(249, 115, 22, 0.4)' },
    { id: 'amber', name: 'Amber', primary: '#f59e0b', light: '#fef3c7', shadow: 'rgba(245, 158, 11, 0.4)' },
    { id: 'yellow', name: 'Kuning', primary: '#eab308', light: '#fef9c3', shadow: 'rgba(234, 179, 8, 0.4)' },
    { id: 'lime', name: 'Jeruk Nipis', primary: '#84cc16', light: '#ecfccb', shadow: 'rgba(132, 204, 22, 0.4)' },
    { id: 'green', name: 'Hijau', primary: '#22c55e', light: '#dcfce3', shadow: 'rgba(34, 197, 94, 0.4)' },
    { id: 'emerald', name: 'Zamrud', primary: '#10b981', light: '#d1fae5', shadow: 'rgba(16, 185, 129, 0.4)' },
    { id: 'teal', name: 'Teal', primary: '#14b8a6', light: '#ccfbf1', shadow: 'rgba(20, 184, 166, 0.4)' },
    { id: 'cyan', name: 'Sian', primary: '#06b6d4', light: '#cffafe', shadow: 'rgba(6, 182, 212, 0.4)' },
    { id: 'sky', name: 'Langit', primary: '#0ea5e9', light: '#e0f2fe', shadow: 'rgba(14, 165, 233, 0.4)' },
    { id: 'blue', name: 'Biru', primary: '#3b82f6', light: '#dbeafe', shadow: 'rgba(59, 130, 246, 0.4)' },
    { id: 'indigo', name: 'Indigo', primary: '#6366f1', light: '#e0e7ff', shadow: 'rgba(99, 102, 241, 0.4)' },
    { id: 'violet', name: 'Violet', primary: '#8b5cf6', light: '#ede9fe', shadow: 'rgba(139, 92, 246, 0.4)' },
    { id: 'purple', name: 'Ungu', primary: '#a855f7', light: '#f3e8ff', shadow: 'rgba(168, 85, 247, 0.4)' },
    { id: 'fuchsia', name: 'Fuchsia', primary: '#d946ef', light: '#fae8ff', shadow: 'rgba(217, 70, 239, 0.4)' },
    { id: 'pink', name: 'Merah Muda', primary: '#ec4899', light: '#fce7f3', shadow: 'rgba(236, 72, 153, 0.4)' },
    { id: 'rose', name: 'Mawar', primary: '#f43f5e', light: '#ffe4e6', shadow: 'rgba(244, 63, 94, 0.4)' },
    { id: 'slate', name: 'Batu Tulis', primary: '#64748b', light: '#f1f5f9', shadow: 'rgba(100, 116, 139, 0.4)' },
    { id: 'gray', name: 'Abu-abu', primary: '#6b7280', light: '#f3f4f6', shadow: 'rgba(107, 114, 128, 0.4)' },
    { id: 'zinc', name: 'Zink', primary: '#71717a', light: '#f4f4f5', shadow: 'rgba(113, 113, 122, 0.4)' },
  ];

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[10];

  // --- MOCK DATA ---
  const voices = [
    { id: 'male-friendly', name: 'Pria Muda Ramah', gender: 'Pria' },
    { id: 'male-pro', name: 'Pria Profesional', gender: 'Pria' },
    { id: 'male-elegant', name: 'Pria Elegan', gender: 'Pria' },
    { id: 'male-energetic', name: 'Pria Enerjik', gender: 'Pria' },
    { id: 'female-friendly', name: 'Wanita Ramah', gender: 'Wanita' },
    { id: 'female-premium', name: 'Wanita Premium', gender: 'Wanita' },
    { id: 'female-cheerful', name: 'Wanita Ceria', gender: 'Wanita' },
  ];

  const templates = [
    { title: 'Promo Laptop Gaming', content: 'Kabar gembira untuk para gamers! Dapatkan laptop gaming RTX seri terbaru dengan diskon hingga 2 juta rupiah. Performa rata kanan, main game tanpa ngelag. Stok sangat terbatas, buruan checkout sekarang!' },
    { title: 'Laptop Kantoran Second', content: 'Sedang mencari laptop berkualitas dengan harga terjangkau? Kini tersedia pilihan laptop second premium dengan kondisi sangat mulus. Prosesor Intel Core i5, RAM 8GB, dan SSD super cepat. Siap kerja, siap lembur!' },
    { title: 'PC Rakitan', content: 'Rakit PC impianmu sekarang! Dengan kombinasi prosesor Ryzen dan RAM DDR4, nikmati performa editing dan gaming yang luar biasa mulus. Gratis perakitan dan instalasi Windows.' }
  ];

  const pcmToWav = (pcmData, sampleRate) => {
    const numChannels = 1; 
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    const pcmBytes = new Uint8Array(pcmData);
    new Uint8Array(buffer, 44).set(pcmBytes);
    return buffer;
  };

  const processAIText = (rawText) => {
    let processed = rawText;
    const techDict = {
      "SSD": "es es di", "RAM": "rem", "Core i5": "kor ai lima", "Core i7": "kor ai tujuh",
      "Ryzen": "raizen", "RTX": "ar ti eks", "GTX": "ji ti eks", "DDR4": "di di er empat",
      "Windows": "windous", "Office": "ofis", "Intel": "intel", "AMD": "e em di",
      "USB": "yu es bi", "HDMI": "ha de em ai", "Type C": "taip si", "Bluetooth": "blutut", "WiFi": "wai fai"
    };
    for (const [key, value] of Object.entries(techDict)) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      processed = processed.replace(regex, value);
    }
    processed = processed.replace(/\b(Rp|Harga)\b/gi, ", $1");
    processed = processed.replace(/\./g, '... ');
    processed = processed.replace(/,/g, ', ');
    const emotionTriggers = ['PROMO', 'DISKON', 'GRATIS', 'MURAH', 'TERBATAS', 'OBRAL KILAT'];
    emotionTriggers.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processed = processed.replace(regex, `${word}!`);
    });
    return processed;
  };

  const handlePlay = async () => {
    if (!text.trim()) return;
    if (ttsEngine === 'browser') {
      if (synth.paused) { synth.resume(); setIsPlaying(true); return; }
      setIsGenerating(true);
      synth.cancel();
      setTimeout(() => {
        const processedText = processAIText(text);
        const utterance = new SpeechSynthesisUtterance(processedText);
        const availableVoices = synth.getVoices();
        const idVoice = availableVoices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
        if (idVoice) utterance.voice = idVoice;
        utterance.rate = voiceSettings.speed;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume / 100;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        utteranceRef.current = utterance;
        synth.speak(utterance);
        setIsPlaying(true); setIsGenerating(false); saveToHistory();
      }, 800); 
    } else {
      setIsGenerating(true);
      if (audioRef.current) audioRef.current.pause();
      try {
        const apiKey = ""; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        let aiPrompt = `Bacakan dengan suara natural dan fasih berbahasa Indonesia: "${text}"`;
        if (voiceSettings.emotion === 'enthusiastic') aiPrompt = `Bacakan naskah iklan berikut dengan energi tinggi, sangat antusias, dan ceria dalam bahasa Indonesia: "${text}"`;
        else if (voiceSettings.emotion === 'elegant') aiPrompt = `Bacakan naskah ini dengan nada elegan, mewah, tenang, dan berwibawa dalam bahasa Indonesia: "${text}"`;

        const payload = {
          contents: [{ parts: [{ text: aiPrompt }] }],
          generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceSettings.voice.includes('female') ? "Aoede" : "Zephyr" } } } }
        };

        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        
        if (result.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = result.candidates[0].content.parts[0].inlineData;
          const binaryString = atob(inlineData.data);
          const pcmData = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) pcmData[i] = binaryString.charCodeAt(i);
          const sampleRateMatch = inlineData.mimeType.match(/rate=(\d+)/);
          const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
          const wavBuffer = pcmToWav(pcmData, sampleRate);
          const blob = new Blob([wavBuffer], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => setIsPlaying(false);
          audio.play();
          setIsPlaying(true); saveToHistory();
        } else {
          console.error("Gagal mendapatkan audio:", result); setIsPlaying(false);
        }
      } catch (error) {
        console.error("TTS API Error:", error); setIsPlaying(false);
      } finally { setIsGenerating(false); }
    }
  };

  const saveToHistory = () => {
    const newHistory = {
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID'),
      time: new Date().toLocaleTimeString('id-ID'),
      text: text.substring(0, 30) + '...',
      voice: ttsEngine === 'browser' ? 'Browser Basic' : 'Premium AI'
    };
    setHistory(prev => [newHistory, ...prev]);
  };

  const handleStop = () => {
    if (ttsEngine === 'browser') { synth.cancel(); } 
    else if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
  };

  const [scriptForm, setScriptForm] = useState({ product: '', specs: '', price: '', promo: '' });
  const generateScript = () => {
    const script = `PROMO SPESIAL! Sedang mencari ${scriptForm.product || 'laptop'} idaman? 
Kami hadirkan solusi untuk Anda. Dibekali spesifikasi gahar ${scriptForm.specs || 'terbaru'}, siap melibas semua tugas berat Anda. 
Harganya? Tenang, cukup ${scriptForm.price || 'harga terjangkau'} saja! 
Apalagi ada promo ${scriptForm.promo || 'menarik'} khusus hari ini. 
Tunggu apa lagi? Stok sangat terbatas. Hubungi kami sekarang juga!`;
    setText(script); setActiveTab('tts');
  };

  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
        ? 'bg-[var(--theme-light)] text-[var(--theme-primary)] font-semibold shadow-sm border border-[var(--theme-primary)]/30' 
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium'
      }`}
    >
      <Icon size={20} className={activeTab === id ? 'text-[var(--theme-primary)]' : 'text-slate-400'} />
      <span className="tracking-wide">{label}</span>
    </button>
  );

  return (
    <div 
      className="min-h-screen bg-slate-50 text-slate-800 font-sans flex overflow-hidden transition-colors duration-500"
      style={{ 
        '--theme-primary': activeThemeObj.primary, 
        '--theme-light': activeThemeObj.light, 
        '--theme-shadow': activeThemeObj.shadow 
      }}
    >
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shadow-md shadow-[var(--theme-shadow)] text-white">
            <Mic size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">VoicePro AI</h1>
            <p className="text-xs text-slate-500 font-medium">IDN Tech Marketer</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dasbor" id="dashboard" />
          <SidebarItem icon={MessageSquare} label="Teks ke Suara" id="tts" />
          <SidebarItem icon={Wand2} label="Generator Naskah" id="generator" />
          <SidebarItem icon={FileText} label="Templat" id="templates" />
          <SidebarItem icon={History} label="Riwayat" id="history" />
          <div className="my-2 border-t border-slate-100"></div>
          <SidebarItem icon={Palette} label="Tema & Warna" id="theme" />
          <SidebarItem icon={Settings} label="Pengaturan" id="settings" />
        </nav>

        <div className="mt-auto pt-6">
          <div className="bg-[var(--theme-light)] rounded-xl p-4 border border-[var(--theme-primary)]/20">
            <h3 className="text-sm font-bold text-[var(--theme-primary)] mb-1">Paket Premium</h3>
            <p className="text-xs text-[var(--theme-primary)]/70 mb-3 font-medium">Akses suara ultra-realistis.</p>
            <button className="w-full py-2 bg-[var(--theme-primary)] hover:opacity-90 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-[var(--theme-shadow)]">
              Tingkatkan
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto z-10">
        
        {/* --- TAB: TEKS KE SUARA --- */}
        {activeTab === 'tts' && (
          <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
            <header className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Teks ke Suara</h2>
                <p className="text-slate-500 text-sm">Ubah naskah promosi menjadi suara profesional.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
                  <button 
                    onClick={() => setTtsEngine('browser')}
                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${ttsEngine === 'browser' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Mode Bawaan
                  </button>
                  <button 
                    onClick={() => setTtsEngine('gemini')}
                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${ttsEngine === 'gemini' ? 'bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-shadow)]' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Sparkles size={14} /> Premium AI
                  </button>
                </div>
              </div>
            </header>

            {ttsEngine === 'browser' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-800 font-bold text-sm">Mode Bawaan Browser Aktif</h4>
                  <p className="text-yellow-700 text-xs mt-1 leading-relaxed font-medium">
                    Saat ini Anda menggunakan mesin suara gratis dari browser yang terdengar kaku. 
                    Pilih opsi <strong>Premium AI</strong> di pojok kanan atas untuk mendapatkan suara manusia asli yang natural.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              
              {/* Kiri: Area Teks */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col focus-within:border-[var(--theme-primary)] focus-within:ring-4 focus-within:ring-[var(--theme-light)] transition-all">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <FileText size={16} className="text-[var(--theme-primary)]"/> Editor Naskah
                    </span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-200/50 px-2 py-1 rounded-md">{text.length} karakter</span>
                  </div>
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tulis naskah promosi laptop/komputer Anda di sini...&#10;&#10;Contoh:&#10;PROMO! Laptop premium Core i7, RAM 16GB, dan SSD 512GB cuma 5 jutaan!"
                    className="w-full flex-1 bg-transparent p-6 text-slate-800 font-medium outline-none resize-none leading-relaxed placeholder-slate-400"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-light)] border border-[var(--theme-primary)]/20 rounded-full text-xs font-bold text-[var(--theme-primary)] shadow-sm">
                    <Cpu size={14} /> Pengucapan AI Aktif
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-600 shadow-sm">
                    <CheckCircle2 size={14} /> Jeda Cerdas Aktif
                  </div>
                </div>
              </div>

              {/* Kanan: Pengaturan & Kontrol */}
              <div className="flex flex-col gap-6">
                
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Mic size={18} className="text-[var(--theme-primary)]" /> Karakter Suara
                  </h3>
                  <select 
                    value={voiceSettings.voice}
                    onChange={(e) => setVoiceSettings({...voiceSettings, voice: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 font-medium text-sm rounded-xl px-4 py-3 outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-light)] text-slate-800 transition-all cursor-pointer"
                  >
                    <optgroup label="Pria">
                      {voices.filter(v => v.gender === 'Pria').map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </optgroup>
                    <optgroup label="Wanita">
                      {voices.filter(v => v.gender === 'Wanita').map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </optgroup>
                  </select>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col gap-5">
                  <div>
                    <div className="flex justify-between font-medium text-xs mb-2">
                      <span className="text-slate-600">Kecepatan Bicara</span>
                      <span className="text-[var(--theme-primary)] font-bold">{voiceSettings.speed}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2" step="0.1" 
                      value={voiceSettings.speed}
                      onChange={(e) => setVoiceSettings({...voiceSettings, speed: parseFloat(e.target.value)})}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between font-medium text-xs mb-2">
                      <span className="text-slate-600">Pitch (Nada)</span>
                      <span className="text-[var(--theme-primary)] font-bold">{voiceSettings.pitch}</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="1.5" step="0.1" 
                      value={voiceSettings.pitch}
                      onChange={(e) => setVoiceSettings({...voiceSettings, pitch: parseFloat(e.target.value)})}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between font-medium text-xs mb-2">
                      <span className="text-slate-600">Emosi AI</span>
                    </div>
                    <select 
                      value={voiceSettings.emotion}
                      onChange={(e) => setVoiceSettings({...voiceSettings, emotion: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 font-medium text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[var(--theme-primary)] text-slate-800 transition-all cursor-pointer"
                    >
                      <option value="neutral">Netral</option>
                      <option value="enthusiastic">Antusias (Promo)</option>
                      <option value="elegant">Keanggunan (Premium)</option>
                      <option value="friendly">Ramah (Pelayanan)</option>
                      <option value="convincing">Meyakinkan (Review)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handlePlay}
                      disabled={isGenerating || !text}
                      className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
                        text ? 'bg-[var(--theme-primary)] hover:opacity-90 text-white shadow-md shadow-[var(--theme-shadow)]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Play size={18} fill="currentColor" />}
                      {isGenerating ? 'Memproses' : 'Bermain'}
                    </button>
                    <button 
                      onClick={handleStop}
                      className="flex items-center justify-center gap-2 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold transition-colors shadow-sm"
                    >
                      <Square size={18} fill="currentColor" /> Berhenti
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors border border-slate-200 shadow-sm">
                      <Download size={16} /> MP3
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors border border-slate-200 shadow-sm">
                      <Download size={16} /> WAV
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- TAB: GENERATOR NASKAH --- */}
        {activeTab === 'generator' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Wand2 className="text-[var(--theme-primary)]" /> AI Generator Naskah
                </h2>
                <p className="text-slate-500 font-medium text-sm">Biarkan AI menulis naskah promosi yang menarik untuk produk Anda.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama/Merek Produk</label>
                  <input type="text" placeholder="Cth: Lenovo ThinkPad T480" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-light)] transition-all font-medium" onChange={e => setScriptForm({...scriptForm, product: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Spesifikasi Utama</label>
                  <input type="text" placeholder="Cth: Core i5, RAM 16GB, SSD 512GB" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-light)] transition-all font-medium" onChange={e => setScriptForm({...scriptForm, specs: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Harga</label>
                  <input type="text" placeholder="Cth: 4 Jutaan saja" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-light)] transition-all font-medium" onChange={e => setScriptForm({...scriptForm, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Detail Promo/Bonus</label>
                  <input type="text" placeholder="Cth: Gratis Mouse & Tas" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-light)] transition-all font-medium" onChange={e => setScriptForm({...scriptForm, promo: e.target.value})} />
                </div>
              </div>
              <button 
                onClick={generateScript}
                className="mt-6 w-full py-4 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-[var(--theme-shadow)] transition-all flex items-center justify-center gap-2 text-lg"
              >
                <Sparkles size={20} fill="currentColor" /> Buat Naskah Sekarang
              </button>
            </div>
          </div>
        )}

        {/* --- TAB: TEMA & WARNA --- */}
        {activeTab === 'theme' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Tema & Warna</h2>
            <p className="text-slate-500 font-medium mb-8">Pilih warna solid favorit Anda untuk menyesuaikan tampilan antarmuka.</p>
            
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
              <div className="grid grid-cols-4 md:grid-cols-5 gap-6">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setCurrentTheme(theme.id)}
                    className="flex flex-col items-center gap-3 group outline-none"
                  >
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-md ${currentTheme === theme.id ? 'ring-4 ring-offset-2' : 'ring-0'}`}
                      style={{ 
                        backgroundColor: theme.primary,
                        '--tw-ring-color': theme.primary
                      }}
                    >
                      {currentTheme === theme.id && <Check size={24} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-sm font-bold ${currentTheme === theme.id ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: TEMPLAT --- */}
        {activeTab === 'templates' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Templat Siap Pakai</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl, idx) => (
                <div key={idx} className="bg-white border border-slate-200 hover:border-[var(--theme-primary)] hover:ring-4 hover:ring-[var(--theme-light)] shadow-sm rounded-2xl p-6 transition-all group cursor-pointer"
                     onClick={() => { setText(tpl.content); setActiveTab('tts'); }}>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-[var(--theme-primary)] transition-colors">{tpl.title}</h3>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed line-clamp-4">{tpl.content}</p>
                  <div className="mt-5 flex items-center text-xs text-[var(--theme-primary)] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--theme-light)] w-max px-3 py-1.5 rounded-lg">
                    Gunakan Templat <Plus size={14} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: RIWAYAT --- */}
        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Riwayat Suara</h2>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                    <th className="p-5 font-bold">Tanggal</th>
                    <th className="p-5 font-bold">Naskah</th>
                    <th className="p-5 font-bold">Suara</th>
                    <th className="p-5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-500 font-medium">Belum ada riwayat suara tersimpan.</td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-5 text-sm font-bold text-slate-800">{item.date} <span className="text-slate-400 font-medium text-xs block mt-0.5">{item.time}</span></td>
                        <td className="p-5 text-sm font-medium text-slate-600">"{item.text}"</td>
                        <td className="p-5 text-sm font-bold text-[var(--theme-primary)]">
                          <span className="bg-[var(--theme-light)] px-2.5 py-1 rounded-md">{item.voice}</span>
                        </td>
                        <td className="p-5 flex gap-2 justify-end">
                          <button className="p-2.5 bg-[var(--theme-light)] text-[var(--theme-primary)] rounded-lg hover:brightness-95 transition-all"><Play size={16} fill="currentColor" /></button>
                          <button className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"><Download size={16} /></button>
                          <button className="p-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB: PENGATURAN --- */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Pengaturan API Key</h2>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 flex flex-col gap-6">
              <div className="bg-[var(--theme-light)] text-[var(--theme-primary)] px-4 py-3 rounded-xl text-sm font-medium flex gap-3 items-start border border-[var(--theme-primary)]/20">
                <Sparkles size={20} className="shrink-0 mt-0.5" />
                <p>Aplikasi ini menggunakan teknologi Premium AI dari Google. Masukkan API Key dari Google AI Studio untuk mengaktifkan fitur suara tingkat dewa secara penuh.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-slate-700">Google AI Studio API Key</label>
                <div className="flex gap-3">
                  <input type="password" placeholder="Masukkan API Key (AIzaSy...)" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-light)] transition-all" />
                  <button className="px-6 py-3 bg-[var(--theme-primary)] hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[var(--theme-shadow)]">Verifikasi & Simpan</button>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Dapatkan API Key gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[var(--theme-primary)] hover:underline font-bold">aistudio.google.com</a></p>
              </div>
            </div>
          </div>
        )}
        
        {/* TAB: DASBOR */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-24 h-24 rounded-full bg-[var(--theme-light)] flex items-center justify-center mb-6 border-4 border-white shadow-lg shadow-[var(--theme-shadow)]">
              <Mic size={48} className="text-[var(--theme-primary)]" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-5">Selamat Datang di VoicePro AI</h2>
            <p className="text-slate-500 font-medium max-w-xl leading-relaxed mb-10 text-lg">
              Platform Text-to-Speech khusus untuk pemasaran teknologi di Indonesia. 
              Mulai buat voice over berkualitas tinggi untuk TikTok, Reels, atau Tokopedia Anda sekarang.
            </p>
            <button 
              onClick={() => setActiveTab('tts')}
              className="px-8 py-4 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold text-lg rounded-2xl shadow-xl shadow-[var(--theme-shadow)] transition-all flex items-center gap-3 transform hover:-translate-y-1"
            >
              <Plus size={24} strokeWidth={3} /> Buat Proyek Baru
            </button>
          </div>
        )}

      </main>
    </div>
  );
}