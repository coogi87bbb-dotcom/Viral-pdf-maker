// Shared types for the Deal Closer tool suite (ported from
// github.com/coogi87bbb-dotcom/thedealcloserai's "real-estate-toolkit").
// See CLAUDE.md and the plan this was built from for full context on why
// this exists as a from-scratch React port rather than an embed.

export type PropertyMode = 'residential' | 'commercial';

export const DEAL_CLOSER_TOOL_IDS = [
  'commission',
  'marketing',
  'negotiation',
  'emailSequence',
  'listingDescription',
  'eventPlanner',
  'timeline',
  'underwriting',
] as const;

export type DealCloserToolId = (typeof DEAL_CLOSER_TOOL_IDS)[number];

export const DEAL_CLOSER_TOOL_LABELS: Record<DealCloserToolId, string> = {
  commission: 'Commission & Net Sheet',
  marketing: 'Marketing & Strategy',
  negotiation: 'Offer & Counter-Offer',
  emailSequence: 'Follow-Up Email Sequence',
  listingDescription: 'Listing Description',
  eventPlanner: 'Open House / Tour Playbook',
  timeline: 'Deadline Tracker',
  underwriting: 'Underwriting & Deal Verification',
};
