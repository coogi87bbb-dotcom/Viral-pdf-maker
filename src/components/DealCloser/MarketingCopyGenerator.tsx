// Tool 2/7 — "AI Marketing & Strategy Engine". Ported field-for-field from
// thedealcloserai's index.html (see plan Section 2, Tool 2).
import React, { useState } from 'react';
import { Megaphone } from 'lucide-react';
import {
  usePropertyMode,
  TextField,
  TextAreaField,
  GenerateButton,
  ErrorBanner,
  ResultSection,
  callDealCloserAI,
  extractSection,
  trackDealCloserUsage,
} from './shared';

export const MarketingCopyGenerator: React.FC = () => {
  const mode = usePropertyMode();
  const isCommercial = mode === 'commercial';

  const [specs, setSpecs] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [price, setPrice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!specs.trim() || !neighborhood.trim() || !price.trim()) {
      setError('Please fill in property specs, target market, and listing price.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const systemPrompt = isCommercial
        ? 'You are an elite commercial real estate marketing strategist. Emphasize cap rates, institutional capital, NOI, and broker network positioning.'
        : 'You are an elite residential real estate marketing strategist for a top-producing agent.';

      const roiLabel = isCommercial ? 'INVESTOR ROI ANGLE' : 'BUYER ROI ANGLE';
      const scriptLabel = isCommercial ? 'BROKER NETWORK OUTREACH SCRIPT' : 'TIKTOK / REEL SCRIPT';

      const userPrompt = `Property Specs & Key Assets: ${specs}
Target Market / Neighborhood: ${neighborhood}
Listing Price: ${price}

Generate a full marketing strategy package with EXACTLY these 4 labeled sections, each on its own line starting with the bracketed label:

[SEO STRATEGY]: 5 SEO keywords and a 90-word meta description.
[MARKET POSITIONING PITCH]: A 100-word compelling positioning pitch.
[${roiLabel}]: A 100-word ${isCommercial ? 'investor' : 'buyer'} ROI / profit angle.
[${scriptLabel}]: ${isCommercial ? 'A short broker network outreach email/video script.' : 'A 30-second TikTok/Reel script with emojis.'}`;

      const text = await callDealCloserAI(systemPrompt, userPrompt, 1800);
      setResult(text);
      trackDealCloserUsage('marketing', mode);
    } catch (err: any) {
      setError(err.message || 'Something went wrong generating your marketing package.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent-rosegold-500/10 border border-accent-rosegold-500/30 text-accent-rosegold-400">
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white font-display">AI Marketing &amp; Strategy Engine</h2>
          <p className="text-xs text-ink-muted">SEO, positioning, ROI angle &amp; a ready-to-post script — in one pass.</p>
        </div>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-2xl p-5 space-y-4">
        <TextAreaField
          label="Property Specs & Key Assets"
          value={specs}
          onChange={setSpecs}
          rows={3}
          placeholder={isCommercial ? 'e.g. 45,000 SF industrial, 24ft clear height, 6 dock doors...' : "e.g. 4BR/3BA, 2,200 sqft, renovated chef's kitchen..."}
        />
        <TextField
          label="Target Market / Neighborhood"
          value={neighborhood}
          onChange={setNeighborhood}
          placeholder={isCommercial ? 'e.g. Perimeter submarket Atlanta, institutional investors...' : 'e.g. Buckhead Atlanta, first-time buyers...'}
        />
        <TextField label="Listing Price" value={price} onChange={setPrice} placeholder={isCommercial ? 'e.g. $4,200,000' : 'e.g. $525,000'} />

        <GenerateButton onClick={handleGenerate} loading={loading} label="⚡ Generate Full Strategy Package" />
        {error && <ErrorBanner message={error} />}
      </div>

      {result && (
        <div className="space-y-3">
          <ResultSection title="📊 SEO Strategy" content={extractSection(result, 'SEO STRATEGY')} copyKey="seo" />
          <ResultSection title="🏆 Market Positioning Pitch" content={extractSection(result, 'MARKET POSITIONING PITCH')} copyKey="positioning" />
          <ResultSection
            title={isCommercial ? '💰 Investor ROI Angle' : '💰 Buyer ROI & Profit Angle'}
            content={extractSection(result, isCommercial ? 'INVESTOR ROI ANGLE' : 'BUYER ROI ANGLE')}
            copyKey="roi"
          />
          <ResultSection
            title={isCommercial ? '📹 Broker Network Outreach Script' : '📹 TikTok / Reel Script'}
            content={extractSection(result, isCommercial ? 'BROKER NETWORK OUTREACH SCRIPT' : 'TIKTOK / REEL SCRIPT')}
            copyKey="script"
          />
        </div>
      )}
    </div>
  );
};

export default MarketingCopyGenerator;
