import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Twitter, 
  Instagram, 
  Video, 
  Facebook, 
  AtSign, 
  Pin, 
  Linkedin, 
  Clock, 
  TrendingUp, 
  Edit3, 
  Sparkles,
  Share2,
  Bookmark,
  Layers,
  Film
} from 'lucide-react';
import { PlatformContent, SocialPlatform } from '../types';
import { PLATFORM_CONFIGS } from '../data/niches';
import { MotionPanel3D } from './MotionPanel3D';

interface PlatformCardProps {
  content: PlatformContent;
  onUpdateContent?: (updated: PlatformContent) => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ content, onUpdateContent }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableBody, setEditableBody] = useState(content.mainBody);
  const [activeSlide, setActiveSlide] = useState(0);

  const config = PLATFORM_CONFIGS[content.platform] || PLATFORM_CONFIGS.x;

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onUpdateContent) {
      onUpdateContent({ ...content, mainBody: editableBody });
    }
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'x': return <Twitter className="h-5 w-5 text-sky-400" />;
      case 'instagram': return <Instagram className="h-5 w-5 text-pink-500" />;
      case 'tiktok': return <Video className="h-5 w-5 text-cyan-400" />;
      case 'facebook': return <Facebook className="h-5 w-5 text-blue-500" />;
      case 'threads': return <AtSign className="h-5 w-5 text-violet-400" />;
      case 'pinterest': return <Pin className="h-5 w-5 text-red-500" />;
      case 'linkedin': return <Linkedin className="h-5 w-5 text-blue-400" />;
      default: return <Sparkles className="h-5 w-5 text-violet-400" />;
    }
  };

  return (
    <MotionPanel3D tiltX={10} delay={0.1}>
      <div className="bg-surface-1/90 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Platform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
            {getPlatformIcon(content.platform)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{config.name}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                {content.estimatedReachMultiplier}
              </span>
            </div>
            <p className="text-xs text-ink-muted">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2/80 border border-white/15 text-xs text-ink-secondary">
            <Clock className="h-3.5 w-3.5 text-accent-amber-400" />
            <span>Best time: <strong className="text-white">{content.bestPostingTime}</strong></span>
          </div>

          <button
            onClick={() => handleCopy(content.mainBody)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Copy'}</span>
          </button>
        </div>
      </div>

      {/* Visual Direction or Audio Notes */}
      {(content.visualDirection || content.audioOrSoundSuggestion) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {content.visualDirection && (
            <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-800/40 text-violet-200 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-violet-300 block">Visual Concept Direction:</span>
                <span>{content.visualDirection}</span>
              </div>
            </div>
          )}

          {content.audioOrSoundSuggestion && (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-cyan-300 block">Viral Sound Recommendation:</span>
                <span>{content.audioOrSoundSuggestion}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <span>{content.title}</span>
          </label>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-ink-muted hover:text-ink-secondary flex items-center gap-1 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Copy'}</span>
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editableBody}
              onChange={(e) => setEditableBody(e.target.value)}
              rows={12}
              className="w-full bg-surface-0 border border-violet-500/50 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface-0 rounded-xl border border-white/10 p-4 font-sans text-ink-secondary text-sm leading-relaxed whitespace-pre-line shadow-inner max-h-[500px] overflow-y-auto">
            {content.mainBody}
          </div>
        )}
      </div>

      {/* X / Twitter Character Limit & Thread Inspector */}
      {content.platform === 'x' && (
        <div className="mt-4 p-4 bg-surface-0 rounded-xl border border-sky-500/30 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wide">
              <Twitter className="h-4 w-4 shrink-0" />
              <span>Twitter Character Count & Thread Inspector (280 Limit Safe)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const parsed = (content.mainBody || '').split(/\n\s*\n/).filter(Boolean);
                  const fixed = parsed.map((p, i) => {
                    const clean = p.trim();
                    if (clean.length <= 280) return clean;
                    return clean.substring(0, 277) + '...';
                  }).join('\n\n');
                  if (onUpdateContent) {
                    onUpdateContent({ ...content, mainBody: fixed });
                  }
                  setEditableBody(fixed);
                }}
                className="px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Auto-Trim All to 280 Limit</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {((content.mainBody || '').split(/\n\s*\n/).filter(p => p.trim().length > 0)).map((postText, idx) => {
              const charLen = postText.trim().length;
              const isSafe = charLen <= 280;
              const percent = Math.min(Math.round((charLen / 280) * 100), 100);

              return (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-xl bg-surface-1 border transition-colors ${
                    isSafe ? 'border-white/10 hover:border-sky-500/40' : 'border-amber-500/60 bg-amber-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sky-400 font-mono">Tweet #{idx + 1}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSafe 
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' 
                          : 'bg-amber-950/80 border-amber-800 text-accent-amber-300'
                      }`}>
                        {isSafe ? `✓ ${charLen} / 280 chars (Twitter Safe)` : `⚠️ ${charLen} / 280 chars (Exceeds Twitter Limit)`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(postText.trim())}
                      className="px-2.5 py-1 rounded bg-surface-2 hover:bg-slate-700 text-ink-secondary text-[11px] font-medium transition-colors flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3 text-sky-400" />
                      <span>Copy Tweet #{idx + 1}</span>
                    </button>
                  </div>

                  {/* Character Usage Bar */}
                  <div className="w-full h-1.5 bg-surface-0 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full transition-colors ${
                        charLen <= 240 ? 'bg-sky-500' : charLen <= 280 ? 'bg-emerald-400' : 'bg-accent-amber-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-xs text-ink-secondary leading-relaxed font-sans whitespace-pre-line">
                    {postText.trim()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instagram Carousel Slide Viewer */}
      {content.carouselSlides && content.carouselSlides.length > 0 && (
        <div className="mt-4 p-4 bg-surface-0 rounded-xl border border-pink-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wide">
              <Layers className="h-4 w-4" />
              <span>Instagram 8-Slide Carousel Preview</span>
            </div>
            <span className="text-xs text-ink-muted">
              Slide {activeSlide + 1} of {content.carouselSlides.length}
            </span>
          </div>

          <div className="bg-surface-1 border border-white/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-pink-400 font-bold">
              <span>SLIDE {content.carouselSlides[activeSlide].slideNumber}</span>
              <span className="text-ink-muted font-normal">{content.carouselSlides[activeSlide].visualConcept}</span>
            </div>
            <h4 className="text-base font-extrabold text-white">{content.carouselSlides[activeSlide].headline}</h4>
            <p className="text-xs text-ink-secondary leading-relaxed">{content.carouselSlides[activeSlide].body}</p>
          </div>

          {/* Slide Navigator Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {content.carouselSlides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-colors ${
                  activeSlide === idx ? 'w-6 bg-pink-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* TikTok Script Timeline Table */}
      {content.scriptTiming && content.scriptTiming.length > 0 && (
        <div className="mt-4 p-4 bg-surface-0 rounded-xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wide">
            <Film className="h-4 w-4" />
            <span>TikTok Script Pacing & Cue Timeline</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-ink-muted">
                  <th className="py-2 px-3">Timing</th>
                  <th className="py-2 px-3">Visual Cue</th>
                  <th className="py-2 px-3">Voiceover Script</th>
                  <th className="py-2 px-3">On-Screen Text</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {content.scriptTiming.map((step, idx) => (
                  <tr key={idx} className="hover:bg-surface-1/50">
                    <td className="py-2.5 px-3 font-semibold text-cyan-400 whitespace-nowrap">{step.timestamp}</td>
                    <td className="py-2.5 px-3 text-ink-secondary">{step.visualCue}</td>
                    <td className="py-2.5 px-3 text-white font-medium">{step.audioVoiceover}</td>
                    <td className="py-2.5 px-3 text-accent-amber-300 font-mono text-[11px]">{step.onScreenText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Facebook Discussion Questions */}
      {content.discussionQuestions && content.discussionQuestions.length > 0 && (
        <div className="p-4 bg-surface-0 rounded-xl border border-blue-500/20 space-y-2">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wide">
            💬 Facebook Community Engagement & Reply Triggers
          </div>
          <ul className="space-y-1.5 text-xs text-ink-secondary">
            {content.discussionQuestions.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pinterest Titles & Boards */}
      {(content.pinterestTitles || content.pinterestBoards) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {content.pinterestTitles && content.pinterestTitles.length > 0 && (
            <div className="p-3 bg-surface-0 rounded-xl border border-red-500/20 space-y-1.5">
              <span className="font-bold text-red-400 block uppercase tracking-wide">📌 High-CTR Pinterest Titles:</span>
              <ul className="space-y-1 text-ink-secondary">
                {content.pinterestTitles.map((t, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-red-400">✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.pinterestBoards && content.pinterestBoards.length > 0 && (
            <div className="p-3 bg-surface-0 rounded-xl border border-red-500/20 space-y-1.5">
              <span className="font-bold text-red-400 block uppercase tracking-wide">🎯 Target Pinterest Boards:</span>
              <div className="flex flex-wrap gap-1.5">
                {content.pinterestBoards.map((b, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-red-950/40 border border-red-800/40 text-red-300">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LinkedIn Executive Takeaways */}
      {content.executiveTakeaways && content.executiveTakeaways.length > 0 && (
        <div className="p-4 bg-surface-0 rounded-xl border border-blue-400/20 space-y-2">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wide">
            💼 LinkedIn Executive Authority Takeaways
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {content.executiveTakeaways.map((takeaway, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-surface-1 border border-white/10 text-xs text-ink-secondary">
                <span className="font-bold text-blue-400 block mb-0.5">Key Point #{idx + 1}</span>
                <span>{takeaway}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {content.hashtags && content.hashtags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {content.hashtags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 rounded bg-surface-2 text-violet-300 font-mono text-[11px]">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
          <span className="font-bold">CTA:</span>
          <span>{content.callToAction}</span>
        </div>
      </div>
    </div>
  </MotionPanel3D>
);
};
