import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/apiClient';
import { 
  Video, 
  VideoOff,
  Mic, 
  MicOff,
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  Zap, 
  Clock, 
  Copy, 
  Check, 
  AlertCircle,
  Eye,
  Settings2,
  Circle,
  Square,
  Download,
  FlipHorizontal,
  Maximize2,
  Minimize2,
  Gauge,
  Sliders,
  Type,
  Radio,
  Film,
  Award,
  Layers,
  Edit3,
  RefreshCw,
  X
} from 'lucide-react';
import { TeleprompterScript, TeleprompterScriptSegment } from '../types';

// Preset topics for instant 1-click script generation
const PRESET_TOPICS = [
  {
    label: '3 AI Workflows Replacing $50K Agencies',
    topic: '3 AI Workflows to Replace a $50K Social Media Agency in 2026',
    platform: 'tiktok',
    length: '45 seconds'
  },
  {
    label: '1M Views on TikTok with 0 Followers',
    topic: 'How to Get 1 Million Organic Views on TikTok starting from 0 Followers',
    platform: 'tiktok',
    length: '30 seconds'
  },
  {
    label: 'Stop Using ChatGPT Like This',
    topic: 'Stop Using ChatGPT like a beginner. Use this 3-step prompt stack instead.',
    platform: 'instagram',
    length: '45 seconds'
  },
  {
    label: 'B2B Lead Gen Secret (LinkedIn Video)',
    topic: 'The B2B Cold Outreach Framework that booked 42 client meetings last month',
    platform: 'linkedin',
    length: '60 seconds'
  }
];

export const TeleprompterStudio: React.FC = () => {
  // Script Generator Form State
  const [topic, setTopic] = useState(PRESET_TOPICS[0].topic);
  const [platform, setPlatform] = useState('tiktok');
  const [videoLength, setVideoLength] = useState('45 seconds');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Script Data State
  const [scriptData, setScriptData] = useState<TeleprompterScript>({
    title: '3 AI Workflows to Replace a $50K Agency (TikTok / Reels)',
    targetDurationSeconds: 45,
    wordCount: 115,
    estimatedPacingWordsPerMin: 145,
    suggestedBGM: 'Trending upbeat phonk bass / corporate dark lofi beat',
    segments: [
      {
        timeMarker: '00:00 - 00:03',
        spokenText: 'Stop scrolling right now if you are still paying $5,000 a month for social media management.',
        visualCue: 'POINT AT CAMERA + INTENSE EYE CONTACT',
        onScreenGraphicText: 'DO NOT IGNORE THIS ⚠️',
        pacing: 'Fast & High Energy'
      },
      {
        timeMarker: '00:03 - 00:15',
        spokenText: 'Here are the exact 3 AI workflows we built into ViralOS that generate 60 viral social posts across 7 networks in under 10 seconds.',
        visualCue: 'SNAP FINGERS & CUT TO SCREEN DEMO',
        onScreenGraphicText: '3 AI WORKFLOWS REVEALED 🧠',
        pacing: 'Rapid Fire'
      },
      {
        timeMarker: '00:15 - 00:30',
        spokenText: 'Step 1: The Psychological Hook Engine. It tests 10 pattern interrupts. Step 2: Gemini 3.1 Visual Graphic Creator for custom thumbnails. Step 3: Auto Content Scheduler.',
        visualCue: 'COUNT ON FINGERS 1-2-3',
        onScreenGraphicText: 'STEP 1 → STEP 2 → STEP 3',
        pacing: 'Clear & Authoritative'
      },
      {
        timeMarker: '00:30 - 00:45',
        spokenText: 'Type "VIRAL" in the comments right now and I will DM you the entire software link and system blueprint for free.',
        visualCue: 'POINT DOWN TO COMMENT SECTION',
        onScreenGraphicText: 'COMMENT "VIRAL" FOR ACCESS 📩',
        pacing: 'Urgent Call to Action'
      }
    ]
  });

  // Teleprompter Display & Control Settings
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeedWpm, setScrollSpeedWpm] = useState(140); // Words Per Minute
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'>('xl');
  const [theme, setTheme] = useState<'amber' | 'cyber' | 'studio' | 'subtitle'>('amber');
  const [mirrorX, setMirrorX] = useState(false);
  const [mirrorY, setMirrorY] = useState(false);
  const [eyeGuideY, setEyeGuideY] = useState(30); // percentage from top (20% - 60%)
  const [readingWidth, setReadingWidth] = useState<'narrow' | 'medium' | 'full'>('medium');
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0);

  // Webcam & Studio Recording
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isWebcamMirrored, setIsWebcamMirrored] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Voice Follow / Speech Recognition
  const [isVoiceFollowActive, setIsVoiceFollowActive] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0); // 0-100 VU level
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // Inline Editing Mode
  const [editingSegmentIdx, setEditingSegmentIdx] = useState<number | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Refs
  const teleprompterContainerRef = useRef<HTMLDivElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const scrollIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Check speech recognition support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
    }
  }, []);

  // Handle smooth auto-scroll when isPlaying is true
  useEffect(() => {
    if (isPlaying) {
      // Calculate scroll speed in pixels per frame based on WPM
      // Average line ~10 words, ~30px line height
      const pxPerSecond = (scrollSpeedWpm / 60) * 18; 
      const intervalMs = 30; // ~33fps
      const pxPerStep = (pxPerSecond * intervalMs) / 1000;

      scrollIntervalRef.current = setInterval(() => {
        if (teleprompterContainerRef.current) {
          const container = teleprompterContainerRef.current;
          container.scrollTop += pxPerStep;

          // Check which segment is currently near the eye line
          const containerTop = container.getBoundingClientRect().top;
          const eyeLinePos = containerTop + (container.clientHeight * (eyeGuideY / 100));

          const children = container.querySelectorAll('.teleprompter-segment');
          children.forEach((child, idx) => {
            const rect = child.getBoundingClientRect();
            if (rect.top <= eyeLinePos && rect.bottom >= eyeLinePos) {
              setActiveSegmentIdx(idx);
            }
          });

          // Stop if reached bottom
          if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
            setIsPlaying(false);
          }
        }
      }, intervalMs);
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isPlaying, scrollSpeedWpm, eyeGuideY]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Webcam Toggle logic
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      // Turn off
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
      setIsVoiceFollowActive(false);
    } else {
      // Turn on
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true
        });
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
        setIsWebcamActive(true);

        // Setup audio level analyzer
        setupAudioAnalyzer(stream);
      } catch (err) {
        console.error('Webcam access error:', err);
        setError('Could not access webcam/microphone. Please allow browser camera permissions.');
      }
    }
  };

  // Setup Web Audio VU Meter
  const setupAudioAnalyzer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.error(e);
    }
  };

  // Start Recording with Countdown
  const handleStartRecording = () => {
    if (!isWebcamActive) {
      toggleWebcam().then(() => startCountdownAndRecord());
    } else {
      startCountdownAndRecord();
    }
  };

  const startCountdownAndRecord = () => {
    setCountdown(3);
    const countTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countTimer);
          executeRecordingStart();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const executeRecordingStart = () => {
    if (!mediaStreamRef.current) return;

    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm'
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setShowVideoModal(true);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      // Reset prompter scroll and start playing automatically
      if (teleprompterContainerRef.current) {
        teleprompterContainerRef.current.scrollTop = 0;
      }
      setIsPlaying(true);
    } catch (err) {
      console.error('MediaRecorder start failed:', err);
      setError('Recording failed to start on this browser.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPlaying(false);
    }
  };

  // Toggle Voice Follow (Speech Recognition)
  const toggleVoiceFollow = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition is not supported in this browser (Use Chrome or Edge).');
      return;
    }

    if (isVoiceFollowActive) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsVoiceFollowActive(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setSpeechTranscript(currentTranscript);

          // Voice tracking auto-scroll logic: search spoken transcript for segment words
          const lowerTranscript = currentTranscript.toLowerCase();
          scriptData.segments.forEach((seg, idx) => {
            const firstWords = seg.spokenText.toLowerCase().slice(0, 20);
            if (lowerTranscript.includes(firstWords)) {
              setActiveSegmentIdx(idx);
              scrollToSegment(idx);
            }
          });
        };

        recognition.onerror = (e: any) => {
          console.error('Speech recognition error:', e);
        };

        recognition.onend = () => {
          if (isVoiceFollowActive) {
            recognition.start(); // auto restart if active
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        setIsVoiceFollowActive(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const scrollToSegment = (idx: number) => {
    if (teleprompterContainerRef.current) {
      const container = teleprompterContainerRef.current;
      const elements = container.querySelectorAll('.teleprompter-segment');
      if (elements[idx]) {
        elements[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Generate Script via Backend API
  const handleGenerateScript = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/viral/teleprompter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, videoLength })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Teleprompter script generation failed');
      }

      const data: TeleprompterScript = await response.json();
      setScriptData(data);
      setIsPlaying(false);
      if (teleprompterContainerRef.current) {
        teleprompterContainerRef.current.scrollTop = 0;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate script. Check Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    const fullText = scriptData.segments.map(s => `${s.timeMarker} [CUE: ${s.visualCue}]:\n"${s.spokenText}"`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const resetScroll = () => {
    setIsPlaying(false);
    if (teleprompterContainerRef.current) {
      teleprompterContainerRef.current.scrollTop = 0;
    }
    setActiveSegmentIdx(0);
  };

  // Theme Styling Rules
  const themeStyles = {
    amber: 'bg-black text-accent-amber-300 font-sans',
    cyber: 'bg-surface-0 text-emerald-400 font-mono',
    studio: 'bg-surface-1 text-white font-sans',
    subtitle: 'bg-black text-white font-sans'
  };

  const fontSizeClasses = {
    sm: 'text-sm leading-snug',
    md: 'text-base leading-relaxed',
    lg: 'text-xl leading-relaxed',
    xl: 'text-2xl leading-loose',
    '2xl': 'text-3xl leading-loose font-bold',
    '3xl': 'text-4xl leading-loose font-extrabold'
  };

  const widthClasses = {
    narrow: 'max-w-md mx-auto',
    medium: 'max-w-2xl mx-auto',
    full: 'w-full'
  };

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Studio Header & Topic Generator */}
      <div className="relative overflow-hidden bg-surface-1 p-6 sm:p-8 rounded-3xl border border-hairline shadow-[var(--shadow-panel-brass)] space-y-6">
        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 bg-accent-brass-500/[0.07] rounded-full blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-brass-500/40 to-transparent" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-accent-brass-500/10 border border-accent-brass-500/25 text-[11px] font-mono font-bold uppercase tracking-wider text-accent-brass-300 mb-3">
              <Film className="h-3.5 w-3.5 text-accent-brass-400" />
              <span>Studio Video Teleprompter & Recording Suite</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-primary tracking-[-0.02em]">
              Teleprompter Studio Pro
            </h2>
            <p className="text-sm text-ink-muted mt-2 max-w-3xl leading-[1.7]">
              Read scripts naturally while maintaining eye contact with the camera. Features live webcam mirror overlay, WebM studio recorder, speech-to-text auto-follow, beam-splitter mirror glass modes, and AI scene direction cues.
            </p>
          </div>

          {/* Quick Teleprompter Status Widget */}
          <div className="flex items-center gap-3 bg-surface-0 p-3 rounded-xl border border-hairline shrink-0">
            <div className="px-3 py-1 text-center border-r border-hairline">
              <div className="text-base font-black text-accent-amber-400">{scrollSpeedWpm} WPM</div>
              <div className="text-[10px] text-ink-muted uppercase font-bold">Pacing Speed</div>
            </div>
            <div className="px-3 py-1 text-center border-r border-hairline">
              <div className="text-base font-black text-accent-brass-400">{scriptData.targetDurationSeconds}s</div>
              <div className="text-[10px] text-ink-muted uppercase font-bold">Est. Duration</div>
            </div>
            <div className="px-3 py-1 text-center">
              <div className="text-base font-black text-status-positive">{scriptData.segments.length} Cues</div>
              <div className="text-[10px] text-ink-muted uppercase font-bold">Scene Blocks</div>
            </div>
          </div>
        </div>

        {/* Preset Topic Buttons */}
        <div className="relative">
          <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-2">
            1-Click Script Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PRESET_TOPICS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTopic(preset.topic);
                  setPlatform(preset.platform);
                  setVideoLength(preset.length);
                }}
                className="p-2.5 rounded-lg bg-surface-1 border border-hairline hover:border-accent-brass-500/50 hover:bg-surface-2 text-[11px] font-bold text-ink-secondary transition-colors text-left truncate cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerateScript} className="relative grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-0 p-4 rounded-xl border border-hairline">
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1">
              Video Topic / Core Value Pitch
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-surface-1 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary text-xs focus:outline-none focus:border-accent-brass-500"
              placeholder="e.g. 3 AI prompts that double cold email conversions"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1">
              Target Duration
            </label>
            <select
              value={videoLength}
              onChange={(e) => setVideoLength(e.target.value)}
              className="w-full bg-surface-1 border border-hairline rounded-xl px-3.5 py-2.5 text-ink-primary text-xs focus:outline-none focus:border-accent-brass-500 font-semibold"
            >
              <option value="15 seconds">15 Seconds (Super Short Hook)</option>
              <option value="30 seconds">30 Seconds (Ultra Punchy)</option>
              <option value="45 seconds">45 Seconds (Standard Retention)</option>
              <option value="60 seconds">60 Seconds (Deep Value Thread)</option>
              <option value="90 seconds">90 Seconds (Longer Format)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-brass-500 via-accent-brass-400 to-accent-brass-500 hover:brightness-105 text-slate-950 font-bold text-xs shadow-[var(--shadow-glow-brass)] transition-[filter] cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
            >
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>{loading ? 'AI directing script…' : 'Generate Teleprompter Script'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="relative p-3.5 rounded-lg bg-status-danger-dim border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Countdown Flash Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 bg-surface-0/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
          <div className="text-8xl font-black text-accent-amber-400 animate-ping">
            {countdown}
          </div>
          <p className="text-xl font-bold text-ink-primary mt-8 tracking-widest uppercase">
            Get Ready to Record...
          </p>
        </div>
      )}

      {/* MAIN TELEPROMPTER & STUDIO CAMERA SCREEN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TELEPROMPTER VIEWPORT CONTAINER */}
        <div className="lg:col-span-8 bg-surface-1/90 rounded-3xl border border-hairline p-6 shadow-[var(--shadow-panel)] flex flex-col justify-between space-y-6">
          {/* Top Bar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Webcam Studio Toggle */}
                <button
                  onClick={toggleWebcam}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                    isWebcamActive 
                      ? 'bg-status-positive-dim text-status-positive border border-status-positive/30' 
                      : 'bg-surface-2 hover:bg-surface-3 text-ink-secondary'
                  }`}
                >
                  {isWebcamActive ? <Video className="h-4 w-4 text-status-positive" /> : <VideoOff className="h-4 w-4 text-ink-muted" />}
                  <span>{isWebcamActive ? 'Webcam ON' : 'Enable Studio Camera'}</span>
                </button>

                {/* Webcam Mirror Flip Toggle */}
                {isWebcamActive && (
                  <button
                    onClick={() => setIsWebcamMirrored(!isWebcamMirrored)}
                    title="Mirror Flip Camera"
                    className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      isWebcamMirrored ? 'bg-accent-brass-500/20 text-accent-brass-300 border-accent-brass-500/30' : 'bg-surface-2 border-hairline-strong text-ink-muted'
                    }`}
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </button>
                )}

                {/* Voice Follow Speech Recognition Toggle */}
                {isSpeechSupported && (
                  <button
                    onClick={toggleVoiceFollow}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                      isVoiceFollowActive
                        ? 'bg-accent-brass-500/20 text-accent-brass-300 border border-accent-brass-500/30 animate-pulse'
                        : 'bg-surface-2 hover:bg-surface-3 text-ink-secondary'
                    }`}
                  >
                    {isVoiceFollowActive ? <Mic className="h-4 w-4 text-accent-brass-400" /> : <MicOff className="h-4 w-4 text-ink-muted" />}
                    <span>{isVoiceFollowActive ? 'Voice Tracking ON' : 'Voice-Follow Mode'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Studio Recording & Script Copy Buttons */}
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="px-4 py-2 rounded-xl bg-status-danger hover:brightness-105 text-ink-primary font-bold text-xs flex items-center gap-2 shadow-[var(--shadow-panel)] transition-[filter] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger"
                >
                  <Circle className="h-4 w-4 fill-white text-ink-primary animate-pulse" />
                  <span>Start Studio Recording</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-status-danger font-bold text-xs flex items-center gap-2 border border-status-danger/40 animate-pulse cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger"
                >
                  <Square className="h-4 w-4 fill-status-danger" />
                  <span>Stop Recording ({formatTime(recordingSeconds)})</span>
                </button>
              )}

              <button
                onClick={handleCopyScript}
                className="px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-secondary text-xs font-bold flex items-center gap-1.5"
              >
                {copiedScript ? <Check className="h-4 w-4 text-status-positive" /> : <Copy className="h-4 w-4 text-accent-brass-400" />}
                <span>{copiedScript ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* TELEPROMPTER SCREEN DISPLAY FRAME */}
          <div className="relative rounded-2xl overflow-hidden border border-hairline bg-black min-h-[440px] max-h-[520px] shadow-[var(--shadow-panel)] flex flex-col justify-center">
            {/* Live Camera Video Feed Element (Background) */}
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isWebcamActive ? 'opacity-35' : 'opacity-0 pointer-events-none'
              } ${isWebcamMirrored ? 'scale-x-[-1]' : ''}`}
            />

            {/* Horizontal Eye-Contact Line Indicator */}
            <div 
              className="absolute left-0 right-0 z-20 border-t-2 border-dashed border-accent-amber-400/80 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 h-10 pointer-events-none flex items-center justify-between px-4"
              style={{ top: `${eyeGuideY}%` }}
            >
              <span className="text-[9px] font-mono font-bold text-accent-amber-300 bg-black/80 px-2 py-0.5 rounded border border-accent-amber-400/40 uppercase inline-flex items-center gap-1">
                <Eye className="h-2.5 w-2.5" />
                EYE CONTACT TARGET LINE
              </span>
              <span className="text-[9px] font-mono font-bold text-accent-amber-300 bg-black/80 px-2 py-0.5 rounded border border-accent-amber-400/40 uppercase">
                LOOK AT LENS HERE
              </span>
            </div>

            {/* Recording Active HUD Badge */}
            {isRecording && (
              <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-danger/90 text-ink-primary font-mono text-xs font-bold border border-status-danger/50 shadow-[var(--shadow-panel)] animate-pulse">
                <Circle className="h-3 w-3 fill-white text-ink-primary" />
                <span>REC {formatTime(recordingSeconds)}</span>
              </div>
            )}

            {/* Microphone Audio VU Meter Bar */}
            {isWebcamActive && (
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-0/80 border border-hairline text-[10px] font-mono font-bold text-ink-secondary">
                <Volume2 className="h-3.5 w-3.5 text-accent-brass-400" />
                <span>MIC LEVEL</span>
                <div className="w-16 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-status-positive via-accent-amber-400 to-status-danger transition-colors duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}

            {/* SCROLLABLE TELEPROMPTER TEXT AREA */}
            <div
              ref={teleprompterContainerRef}
              className={`relative z-10 w-full h-full min-h-[440px] max-h-[520px] overflow-y-auto px-6 py-32 space-y-12 transition-transform duration-150 ${
                themeStyles[theme]
              } ${mirrorX ? 'scale-x-[-1]' : ''} ${mirrorY ? 'scale-y-[-1]' : ''}`}
            >
              {scriptData.segments.map((segment, idx) => {
                const isActive = activeSegmentIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`teleprompter-segment p-6 rounded-2xl transition-colors duration-300 ${widthClasses[readingWidth]} ${
                      isActive 
                        ? 'bg-surface-1/80 border-2 border-accent-amber-400/80 shadow-[var(--shadow-panel)] scale-[1.02]' 
                        : 'opacity-50 hover:opacity-80'
                    }`}
                  >
                    {/* Scene Cue Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-accent-brass-500/20 text-accent-brass-300 font-bold border border-accent-brass-500/30">
                          {segment.timeMarker}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-accent-amber-500/20 text-accent-amber-300 font-bold border border-amber-500/30 uppercase">
                          CUE: {segment.visualCue}
                        </span>
                      </div>

                      <span className="px-2.5 py-1 rounded bg-surface-2 text-ink-secondary font-semibold text-[11px]">
                        TEXT GRAPHIC: &quot;{segment.onScreenGraphicText}&quot;
                      </span>
                    </div>

                    {/* Spoken Text */}
                    {editingSegmentIdx === idx ? (
                      <div className="space-y-2">
                        <textarea
                          value={segment.spokenText}
                          onChange={(e) => {
                            const updated = [...scriptData.segments];
                            updated[idx].spokenText = e.target.value;
                            setScriptData({ ...scriptData, segments: updated });
                          }}
                          className="w-full bg-surface-0 border border-accent-brass-500 p-3 rounded-xl text-ink-primary text-base focus:outline-none"
                          rows={3}
                        />
                        <button
                          onClick={() => setEditingSegmentIdx(null)}
                          className="px-3 py-1 rounded-lg bg-status-positive hover:brightness-105 text-slate-950 text-xs font-bold transition-[filter] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-positive"
                        >
                          Save Segment Edit
                        </button>
                      </div>
                    ) : (
                      <p 
                        onClick={() => setEditingSegmentIdx(idx)}
                        className={`font-semibold cursor-pointer hover:text-accent-brass-300 transition-colors ${fontSizeClasses[fontSize]}`}
                        title="Click to edit segment text"
                      >
                        &quot;{segment.spokenText}&quot;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TELEPROMPTER INTERACTIVE CONTROLS BAR */}
          <div className="pt-2 border-t border-hairline flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Play/Pause & Reset Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-5 py-2.5 rounded-xl text-slate-950 font-bold flex items-center gap-2 transition-[filter] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 ${
                  isPlaying
                    ? 'bg-accent-amber-500 hover:brightness-105 shadow-[var(--shadow-glow-amber)] focus-visible:ring-accent-amber-400'
                    : 'bg-status-positive hover:brightness-105 shadow-[var(--shadow-panel)] focus-visible:ring-status-positive'
                }`}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? 'Pause Prompter' : 'Start Auto-Scroll'}</span>
              </button>

              <button
                onClick={resetScroll}
                title="Reset Prompter to Top"
                className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink-secondary transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Pacing WPM Speed Slider */}
            <div className="flex items-center gap-3 bg-surface-0 p-2 px-4 rounded-xl border border-hairline">
              <span className="text-ink-muted font-bold uppercase text-[10px] flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-accent-brass-400" />
                <span>Speed:</span>
              </span>
              <input
                type="range"
                min={80}
                max={260}
                step={5}
                value={scrollSpeedWpm}
                onChange={(e) => setScrollSpeedWpm(Number(e.target.value))}
                className="w-24 accent-brass-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-accent-brass-300 w-16 text-right">
                {scrollSpeedWpm} WPM
              </span>
            </div>

            {/* Font Size Chooser */}
            <div className="flex items-center gap-1.5 bg-surface-0 p-1.5 rounded-xl border border-hairline">
              <span className="text-ink-muted font-bold uppercase text-[10px] px-2">Size:</span>
              {(['sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`px-2 py-1 rounded-md uppercase font-bold text-[10px] transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 ${
                    fontSize === sz ? 'bg-accent-brass-500 text-slate-950' : 'bg-surface-2 text-ink-muted hover:bg-surface-3'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR: STUDIO DISPLAY SETTINGS & SCENE CUE JUMPERS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Display & Hardware Mirror Settings Card */}
          <div className="bg-surface-1 rounded-2xl border border-hairline p-6 shadow-[var(--shadow-panel)] space-y-5">
            <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2 border-b border-hairline pb-3">
              <Sliders className="h-4 w-4 text-accent-brass-400" />
              <span>Studio Display & Hardware Controls</span>
            </h3>

            {/* Color Theme Preset Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
                Color Palette Theme:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('amber')}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 transition-colors ${
                    theme === 'amber' ? 'bg-accent-amber-500/20 border-accent-amber-500 text-accent-amber-300' : 'bg-surface-0 border-hairline text-ink-muted'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-amber-400 shrink-0" />
                  <span>High Contrast Amber</span>
                </button>

                <button
                  onClick={() => setTheme('cyber')}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 transition-colors ${
                    theme === 'cyber' ? 'bg-status-positive-dim border-status-positive text-status-positive' : 'bg-surface-0 border-hairline text-ink-muted'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-status-positive shrink-0" />
                  <span>Cyber Matrix</span>
                </button>

                <button
                  onClick={() => setTheme('studio')}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 transition-colors ${
                    theme === 'studio' ? 'bg-accent-brass-400/20 border-accent-brass-400 text-accent-brass-300' : 'bg-surface-0 border-hairline text-ink-muted'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-primary shrink-0" />
                  <span>Studio Crisp White</span>
                </button>

                <button
                  onClick={() => setTheme('subtitle')}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400 transition-colors ${
                    theme === 'subtitle' ? 'bg-accent-brass-700/20 border-accent-brass-600 text-accent-brass-300' : 'bg-surface-0 border-hairline text-ink-muted'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-brass-600 shrink-0" />
                  <span>Subtitle Backdrop</span>
                </button>
              </div>
            </div>

            {/* Reading Width Margin Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
                Reading Column Width:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['narrow', 'medium', 'full'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setReadingWidth(w)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize border ${
                      readingWidth === w ? 'bg-accent-brass-500/20 border-accent-brass-500 text-accent-brass-300' : 'bg-surface-0 border-hairline text-ink-muted'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Glass Mirror Flip Controls */}
            <div className="space-y-2 pt-2 border-t border-hairline">
              <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
                Beam-Splitter Mirror Glass Setup:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMirrorX(!mirrorX)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                    mirrorX ? 'bg-accent-brass-500/20 border-accent-brass-500 text-accent-brass-300' : 'bg-surface-0 border-hairline text-ink-muted'
                  }`}
                >
                  <FlipHorizontal className="h-4 w-4" />
                  <span>Mirror X (Horizontal)</span>
                </button>

                <button
                  onClick={() => setMirrorY(!mirrorY)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                    mirrorY ? 'bg-accent-brass-500/20 border-accent-brass-500 text-accent-brass-300' : 'bg-surface-0 border-hairline text-ink-muted'
                  }`}
                >
                  <FlipHorizontal className="h-4 w-4 rotate-90" />
                  <span>Mirror Y (Vertical)</span>
                </button>
              </div>
            </div>

            {/* Eye Contact Guide Y Position Slider */}
            <div className="space-y-2 pt-2 border-t border-hairline">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-ink-muted uppercase tracking-wider">
                  Eye Contact Target Height:
                </label>
                <span className="font-mono text-accent-brass-300 font-bold">{eyeGuideY}%</span>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                value={eyeGuideY}
                onChange={(e) => setEyeGuideY(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Scene Cue Jumper Cards */}
          <div className="bg-surface-1/90 rounded-3xl border border-hairline p-6 shadow-[var(--shadow-panel)] space-y-4">
            <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent-brass-400" />
              <span>Scene Block Cue Jumpers</span>
            </h3>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {scriptData.segments.map((seg, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSegmentIdx(idx);
                    scrollToSegment(idx);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-colors space-y-1 ${
                    activeSegmentIdx === idx
                      ? 'bg-surface-2 border-accent-amber-400 text-ink-primary shadow-[var(--shadow-panel-brass)]'
                      : 'bg-surface-0 border-hairline text-ink-muted hover:bg-surface-1'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-accent-brass-400 font-mono">{seg.timeMarker}</span>
                    <span className="text-accent-amber-400 text-[10px] uppercase">CUE #{idx + 1}</span>
                  </div>
                  <p className="text-xs font-medium line-clamp-1">
                    {seg.spokenText}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECORDED VIDEO REVIEW MODAL */}
      {showVideoModal && recordedVideoUrl && (
        <div className="fixed inset-0 z-50 bg-surface-0/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center animate-fade-in">
          <div className="bg-surface-1 border border-hairline rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-[var(--shadow-panel)] relative">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-surface-2 text-ink-secondary hover:bg-surface-3 transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-accent-amber-400" />
              <div>
                <h3 className="text-xl font-extrabold text-ink-primary">Studio Recording Take Ready!</h3>
                <p className="text-xs text-ink-muted">Review your teleprompter video take or download file.</p>
              </div>
            </div>

            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-black border border-hairline aspect-video">
              <video src={recordedVideoUrl} controls autoPlay className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2.5 rounded-xl bg-surface-2 text-ink-secondary text-xs font-bold hover:bg-surface-3 transition-colors cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brass-400"
              >
                Close & Record New Take
              </button>

              <a
                href={recordedVideoUrl}
                download={`ViralOS_Teleprompter_Take_${Date.now()}.webm`}
                className="px-6 py-2.5 rounded-xl bg-status-positive hover:brightness-105 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-[var(--shadow-panel)] transition-[filter] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-positive"
              >
                <Download className="h-4 w-4" />
                <span>Download Recorded Video (WebM/MP4)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
