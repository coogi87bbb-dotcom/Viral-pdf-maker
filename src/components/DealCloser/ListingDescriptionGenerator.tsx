// Tool 5/7 — "Listing Description Generator". Ported field-for-field from
// thedealcloserai's index.html (see plan Section 2, Tool 5).
import React, { useState } from 'react';
import { Home } from 'lucide-react';
import {
  usePropertyMode,
  TextField,
  TextAreaField,
  SelectField,
  GenerateButton,
  ErrorBanner,
  ResultSection,
  SendToPdfButton,
  callDealCloserAI,
  extractSection,
  trackDealCloserUsage,
} from './shared';

const RES_PROPERTY_TYPES = ['Single Family Home', 'Condo', 'Townhome', 'Luxury Estate', 'Investment', 'Multi-family', 'Land / Lot', 'Commercial Property'];
const CRE_PROPERTY_TYPES = ['Office', 'Retail', 'Industrial', 'Warehouse', 'Multifamily', 'Mixed-Use', 'Land'];
const RES_BUYER_TYPES = ['Growing Families', 'Young Professionals', 'Luxury Buyers', 'Investors — ROI Focus', 'Retirees & Downsizers', 'First-Time Buyers'];
const CRE_BUYER_TYPES = ['Owner-User', 'Investor', 'Cap Rate Buyer', 'Developer', '1031 Exchange Buyer', 'Institutional / REIT'];
const BUILDING_CLASSES = ['Class A', 'Class B', 'Class C'];
const LEASE_TYPES = ['NNN (Triple Net)', 'Gross', 'Modified Gross'];

interface ListingDescriptionGeneratorProps {
  onSendToPdf: (text: string, title: string) => void;
}

export const ListingDescriptionGenerator: React.FC<ListingDescriptionGeneratorProps> = ({ onSendToPdf }) => {
  const mode = usePropertyMode();
  const isCommercial = mode === 'commercial';

  const [bedBath, setBedBath] = useState('');
  const [sqft, setSqft] = useState('');
  const [propType, setPropType] = useState(RES_PROPERTY_TYPES[0]);
  const [buyer, setBuyer] = useState(RES_BUYER_TYPES[0]);

  const [buildingClass, setBuildingClass] = useState(BUILDING_CLASSES[0]);
  const [sqftCRE, setSqftCRE] = useState('');
  const [propTypeCRE, setPropTypeCRE] = useState(CRE_PROPERTY_TYPES[0]);
  const [buyerCRE, setBuyerCRE] = useState(CRE_BUYER_TYPES[0]);
  const [leaseRate, setLeaseRate] = useState('');
  const [leaseType, setLeaseType] = useState(LEASE_TYPES[0]);

  const [features, setFeatures] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!features.trim() || !location.trim() || !price.trim()) {
      setError('Please fill in features/upgrades, location, and price.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const propDetails = isCommercial
        ? `Building Class: ${buildingClass}\nTotal / Leasable Sq Ft: ${sqftCRE}\nProperty Type: ${propTypeCRE}\nTarget Buyer: ${buyerCRE}\nLease Rate: ${leaseRate}\nLease Type: ${leaseType}`
        : `Beds / Baths: ${bedBath}\nSquare Footage: ${sqft}\nProperty Type: ${propType}\nTarget Buyer: ${buyer}`;

      const systemPrompt = isCommercial
        ? 'You are an elite commercial real estate copywriter writing MLS/CoStar-quality listing copy.'
        : 'You are an elite residential real estate copywriter writing MLS-quality listing copy.';

      const userPrompt = `${propDetails}
Top Features & Upgrades: ${features}
Neighborhood & Location Selling Points: ${location}
Listing Price: ${price}

Generate listing copy with EXACTLY these 4 labeled sections:

[FULL MLS DESCRIPTION]: A 200-250 word full MLS description.
[SHORT VERSION]: A 75-word short version for social/flyers/email.
[HEADLINE OPTIONS]: 5 numbered headline options.
[SEO STRENGTH SCORE]: A 1-10 SEO strength rating with the top 5 keywords.`;

      const text = await callDealCloserAI(systemPrompt, userPrompt);
      setResult(text);
      trackDealCloserUsage('listingDescription', mode);
    } catch (err: any) {
      setError(err.message || 'Something went wrong generating your listing copy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-accent-rosegold-500/10 border border-accent-rosegold-500/30 text-accent-rosegold-400">
          <Home className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
            Listing Description Generator
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">NEW</span>
          </h2>
          <p className="text-xs text-ink-muted">Full MLS copy, short version, headlines &amp; an SEO strength score.</p>
        </div>
      </div>

      <div className="bg-surface-1 border border-white/10 rounded-2xl p-5 space-y-4">
        {isCommercial ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Building Class" value={buildingClass} onChange={setBuildingClass} options={BUILDING_CLASSES.map((c) => ({ value: c, label: c }))} />
            <TextField label="Total / Leasable Sq Ft" value={sqftCRE} onChange={setSqftCRE} placeholder="e.g. 18000" type="number" />
            <SelectField label="Property Type" value={propTypeCRE} onChange={setPropTypeCRE} options={CRE_PROPERTY_TYPES.map((t) => ({ value: t, label: t }))} />
            <SelectField label="Target Buyer" value={buyerCRE} onChange={setBuyerCRE} options={CRE_BUYER_TYPES.map((t) => ({ value: t, label: t }))} />
            <TextField label="Lease Rate ($/SF/Year) — optional" value={leaseRate} onChange={setLeaseRate} placeholder="e.g. $24.50/SF/yr" />
            <SelectField label="Lease Type" value={leaseType} onChange={setLeaseType} options={LEASE_TYPES.map((t) => ({ value: t, label: t }))} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Beds / Baths" value={bedBath} onChange={setBedBath} placeholder="e.g. 4BD / 3.5BA" />
            <TextField label="Square Footage" value={sqft} onChange={setSqft} placeholder="e.g. 2450" type="number" />
            <SelectField label="Property Type" value={propType} onChange={setPropType} options={RES_PROPERTY_TYPES.map((t) => ({ value: t, label: t }))} />
            <SelectField label="Target Buyer" value={buyer} onChange={setBuyer} options={RES_BUYER_TYPES.map((t) => ({ value: t, label: t }))} />
          </div>
        )}

        <TextAreaField
          label="Top Features & Upgrades (list everything)"
          value={features}
          onChange={setFeatures}
          rows={3}
          placeholder={isCommercial ? 'e.g. Zoned C-2, 24ft clear height...' : "e.g. Renovated chef's kitchen..."}
        />
        <TextField
          label="Neighborhood & Location Selling Points"
          value={location}
          onChange={setLocation}
          placeholder={isCommercial ? 'e.g. 28,000 VPD on Main St, 5 min to I-85...' : 'e.g. Top-rated schools...'}
        />
        <TextField label="Listing Price" value={price} onChange={setPrice} placeholder={isCommercial ? 'e.g. $3,750,000 or $24.50/SF/yr NNN' : 'e.g. $649,000'} />

        <GenerateButton onClick={handleGenerate} loading={loading} label="✍️ Generate MLS Listing + SEO & GEO Score" />
        {error && <ErrorBanner message={error} />}
      </div>

      {result && (
        <div className="space-y-3">
          <SendToPdfButton
            onClick={() => onSendToPdf(result, location ? `${location} — Listing Description` : 'Listing Description')}
          />
          <ResultSection title="📝 Full MLS Description" content={extractSection(result, 'FULL MLS DESCRIPTION')} copyKey="mls" />
          <ResultSection title="📱 Short Version — Social / Flyers / Email" content={extractSection(result, 'SHORT VERSION')} copyKey="short" />
          <ResultSection title="💡 Headline Options" content={extractSection(result, 'HEADLINE OPTIONS')} copyKey="headlines" />
          <ResultSection title="📊 SEO Strength Score & Keywords" content={extractSection(result, 'SEO STRENGTH SCORE')} copyKey="seo" />
        </div>
      )}
    </div>
  );
};

export default ListingDescriptionGenerator;
