import React from 'react';
import { DocumentData, DocSection } from '../types';

/**
 * Advanced Text Cleaner & Professional Document Formatter
 * Fixes raw scraped/pasted text (e.g. kome.ai, PDF copies, raw web dumps)
 * by removing junk metadata, splitting merged lists/steps, and structuring into
 * publication-ready chapters, bullet lists, and key takeaways.
 */

// 1. Remove raw junk metadata (kome.ai tags, PDF page numbers, web export headers)
export function cleanRawText(text: string): string {
  if (!text) return '';

  let cleaned = text
    // Normalize newlines
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Strip kome.ai export footers & timestamps
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}\s*(?:AM|PM)?\s*Generated with https?:\/\/[^\s]+/gi, '')
    .replace(/Generated with https?:\/\/[^\s]+/gi, '')
    .replace(/https?:\/\/(?:www\.)?kome\.ai[^\s]*/gi, '')
    // Strip PDF page numbering noise like "-- 1 of 3 --" or "- 2 of 5 -" or "Page 01"
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '')
    .replace(/-\s*\d+\s+of\s+\d+\s*-/gi, '')
    .replace(/^Page\s+\d+(?:\s+of\s+\d+)?$/gim, '')
    .replace(/^--\s*\d+\s*--$/gim, '')
    // Strip generic web scrape noise
    .replace(/Skip to main content/gi, '')
    .replace(/Accept all cookies/gi, '');

  // 2. Expand merged inline list markers into distinct line breaks
  // e.g. "1. Choose name • Perryman Props • Search cis.scc" -> "1. Choose name\n• Perryman Props\n• Search cis.scc"
  cleaned = cleaned
    // Split on inline bullet points: " • " or " * "
    .replace(/([^\n])\s*[•*⁃▪]\s+/g, '$1\n• ')
    // Split on inline numbered steps: " 1. ", " 2. ", " 3. "
    .replace(/([.!?\s])\s*(\d{1,2}\.\s+[A-Z])/g, '$1\n\n$2')
    // Split on inline Phase/Goal/Step/Milestone/Key details markers
    .replace(/([.!?])\s*(Phase\s+\d+:?|Goal:|Step\s+\d+:?|Milestone:|Key details:|Note:|Important:|Optionally:)/gi, '$1\n\n$2')
    // Fix multiple empty lines
    .replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Converts a raw text string into a fully structured, professional DocumentData
 */
export function cleanChapterTitle(rawTitle: string): string {
  if (!rawTitle) return 'Overview & Strategy';

  let cleaned = rawTitle
    .replace(/^#+\s*/, '')
    .replace(/^Content\s+/i, '')
    .replace(/^Table of Contents\s+/i, '')
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '')
    .replace(/-\s*\d+\s+of\s+\d+\s*-/gi, '')
    .replace(/^Page\s+\d+(?:\s+of\s+\d+)?/gi, '')
    .replace(/^--\s*\d+\s*--$/gi, '')
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/kome\.ai[^\s]*/gi, '')
    // Remove inline trailing page numbers like "Overview 6" or "Candlestick Patterns 14"
    .replace(/\s+\d{1,3}\b/g, '')
    .trim();

  if (!cleaned) return 'Core Framework';

  // Strip prefix words like "CHAPTER 01:", "PROMPT 01", "Module 1:"
  cleaned = cleaned.replace(/^(chapter|module|section|prompt|part|step|phase)\s+\d+[:\s]*/i, '').trim();

  // If title is long (> 45 chars or > 6 words), extract core 1-5 word title
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (cleaned.length > 45 || words.length > 6) {
    if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      const candidate = parts[parts.length - 1].trim();
      if (candidate.length > 2 && candidate.length <= 40) {
        return candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }
    if (cleaned.includes('—') || cleaned.includes('-')) {
      const parts = cleaned.split(/[—\-]/);
      const candidate = parts[0].trim();
      if (candidate.length > 2 && candidate.length <= 40) {
        return candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }
    // Filter filler stop words
    const coreWords = words.filter(
      (w) => !/^(a|an|the|this|that|your|is|are|of|to|in|for|and|with|on|at|by|from)$/i.test(w)
    );
    if (coreWords.length > 0) {
      cleaned = coreWords.slice(0, 4).join(' ');
    } else {
      cleaned = words.slice(0, 4).join(' ');
    }
  }

  // Capitalize title
  if (cleaned) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned || 'Core Strategy';
}

/**
 * Converts a raw text string into a fully structured, professional DocumentData
 */
export function parseTextIntoDocument(rawText: string, titleHint?: string): DocumentData {
  const cleaned = cleanRawText(rawText);

  // 1. Detect Resume / CV Archetype
  const isResume =
    /curriculum vitae|resume\b|work experience|employment history|education\b|skills\b|professional summary|certifications\b/i.test(
      cleaned
    ) &&
    /experience|education|skills|summary|profile|email|phone|linkedin/i.test(cleaned);

  if (isResume) {
    return parseResumeDocument(cleaned, titleHint);
  }

  // 2. Detect Business Proposal / Executive Audit
  const isProposal =
    /executive summary|business plan|project proposal|financial analysis|audit report|deliverables|roi projection|scope of work|market analysis/i.test(
      cleaned
    );

  if (isProposal) {
    return parseProposalDocument(cleaned, titleHint);
  }

  // 3. Detect Technical Playbook / Prompt Stack
  const isPlaybook =
    /prompt\b|system instruction|api documentation|technical guide|blueprint|code snippet|workflow automation/i.test(
      cleaned
    );

  if (isPlaybook) {
    return parsePlaybookDocument(cleaned, titleHint);
  }

  // 4. Fallback to General Publication Parser
  return parseGeneralPublication(cleaned, titleHint);
}

function parseResumeDocument(cleanedText: string, titleHint?: string): DocumentData {
  const lines = cleanedText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Try to find candidate name from titleHint or top lines
  let candidateName = (titleHint || '').trim();
  if (!candidateName || candidateName.includes('Imported') || candidateName.endsWith('.pdf') || candidateName.endsWith('.docx')) {
    const firstLine = lines.find((l) => l.length > 2 && l.length < 50 && !l.includes('@') && !l.includes('http') && !/^\d+$/.test(l));
    candidateName = firstLine ? firstLine.replace(/^#+\s*/, '') : 'Alexander Vance';
  }

  // Find candidate headline or current role
  const headlineLine = lines.find(
    (l) =>
      /engineer|architect|developer|manager|lead|director|designer|consultant|executive|specialist|analyst/i.test(l) &&
      l !== candidateName &&
      l.length < 90
  );
  const headline = headlineLine ? headlineLine.replace(/^#+\s*/, '') : 'Senior AI Systems Architect & Full-Stack Lead';

  // Extract contact info or highlights
  const contactLines = lines.filter((l) => l.includes('@') || l.includes('phone') || l.includes('linkedin') || l.includes('github') || /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(l));
  const contactSummary = contactLines.slice(0, 3).join(' • ') || 'email@example.com • +1 (555) 019-2831 • LinkedIn Profile';

  // Categorize content into sections: Summary, Experience, Skills, Education
  const rawBlocks = cleanedText.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  const sections: DocSection[] = [];
  let currentSecTitle = 'Executive Profile & Professional Summary';
  let currentParas: string[] = [];
  let expCards: any[] = [];
  let secIdx = 1;

  for (const block of rawBlocks) {
    const isHeader =
      /^(experience|work experience|employment history|career profile|executive summary|skills|technical skills|education|certifications|projects|key achievements)/i.test(
        block
      ) ||
      (/^#+\s+/.test(block) && block.length < 60);

    if (isHeader) {
      if (currentParas.length > 0 || expCards.length > 0) {
        sections.push({
          id: `sec-resume-${secIdx}`,
          chapterNumber: secIdx,
          title: cleanChapterTitle(currentSecTitle),
          subtitle: `Core qualifications, metrics, and key details for ${cleanChapterTitle(currentSecTitle)}.`,
          paragraphs: currentParas.length > 0 ? currentParas : ['Detailed record & background.'],
          bulletCards: expCards.length > 0 ? expCards.slice(0, 4) : undefined,
          callout:
            secIdx === 1
              ? {
                  type: 'insight',
                  title: 'Candidate Value Proposition',
                  content: `${candidateName} brings proven technical leadership, scalable architecture design, and a track record of driving revenue growth.`
                }
              : undefined
        });
        secIdx++;
        currentParas = [];
        expCards = [];
      }
      currentSecTitle = block.replace(/^#+\s*/, '').trim();
    } else {
      if (block.startsWith('•') || block.startsWith('-')) {
        const subItems = block.split('\n').map((s) => s.trim()).filter(Boolean);
        for (const item of subItems) {
          const cleanItem = item.replace(/^[•*-]\s*/, '');
          currentParas.push(`• ${cleanItem}`);
          if (expCards.length < 4 && cleanItem.length > 20) {
            expCards.push({
              title: cleanItem.slice(0, 45) + (cleanItem.length > 45 ? '...' : ''),
              description: cleanItem,
              badgeText: `HIGHLIGHT ${expCards.length + 1}`
            });
          }
        }
      } else {
        currentParas.push(block);
      }
    }
  }

  if (currentParas.length > 0 || sections.length === 0) {
    sections.push({
      id: `sec-resume-${secIdx}`,
      chapterNumber: secIdx,
      title: cleanChapterTitle(currentSecTitle || 'Core Qualifications'),
      subtitle: 'Education, honors, and technical credentials.',
      paragraphs: currentParas.length > 0 ? currentParas : ['Full candidate profile processed.'],
      bulletCards: expCards.length > 0 ? expCards.slice(0, 4) : undefined
    });
  }

  return {
    title: candidateName.toUpperCase(),
    subtitle: `${headline} | ${contactSummary}`,
    author: candidateName,
    category: 'Executive Resume & Career Portfolio',
    estimatedReadTime: '3 min review',
    keyTakeaways: [
      `Candidate: ${candidateName}`,
      `Role: ${headline}`,
      '10+ Years Building High-Scale Distributed Systems',
      'Proven Technical Leadership & Engineering Strategy'
    ],
    sections,
    callToAction: {
      headline: `Connect With ${candidateName}`,
      subhead: 'Thank you for reviewing this executive candidate portfolio.',
      buttonText: 'Schedule Interview',
      websiteOrHandle: contactSummary
    },
    suggestedThemeId: 'emerald-executive',
    suggestedCoverStyle: 'executive-bar'
  };
}

function parseProposalDocument(cleanedText: string, titleHint?: string): DocumentData {
  const docTitle = (titleHint || 'Executive Strategy Proposal').replace(/\.[a-z0-9]+$/i, '');
  const rawBlocks = cleanedText.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  const sections: DocSection[] = [];
  let secIdx = 1;
  let currentRawTitle = 'Executive Overview & Strategic Objectives';
  let currentParas: string[] = [];

  for (const block of rawBlocks) {
    const isHeading =
      /^#+\s+/.test(block) ||
      /^(executive summary|background|objectives|strategy|deliverables|financials|roadmap|conclusion)/i.test(block) ||
      (block.length < 60 && !/[.!?]$/.test(block) && currentParas.length > 0);

    if (isHeading) {
      if (currentParas.length > 0) {
        sections.push(buildStructuredSection(secIdx, cleanChapterTitle(currentRawTitle), `Tactical execution and guidelines for ${cleanChapterTitle(currentRawTitle)}.`, currentParas));
        secIdx++;
        currentParas = [];
      }
      currentRawTitle = block.replace(/^#+\s*/, '').trim();
    } else {
      currentParas.push(block);
    }
  }

  if (currentParas.length > 0 || sections.length === 0) {
    sections.push(buildStructuredSection(secIdx, cleanChapterTitle(currentRawTitle || 'Strategic Execution'), 'Key recommendations and deliverables.', currentParas.length > 0 ? currentParas : ['Proposal details formatted.']));
  }

  return {
    title: docTitle,
    subtitle: 'Executive Briefing, Strategic Roadmap & Financial Analysis',
    author: 'Principal Strategy Director',
    category: 'Executive Proposal & Strategic Audit',
    estimatedReadTime: `${Math.max(3, Math.ceil(cleanedText.length / 1000))} min read`,
    keyTakeaways: [
      `High-Impact Strategy: ${docTitle}`,
      '350% Targeted Efficiency Improvement Across Channels',
      'Comprehensive Risk Mitigation & Governance Model',
      '5.2x ROI Projected Over First 90 Days'
    ],
    sections,
    callToAction: {
      headline: `Approve The ${docTitle} Roadmap`,
      subhead: 'Ready to execute the strategic vision outlined in this proposal.',
      buttonText: 'Review Executive Agreement',
      websiteOrHandle: 'www.doccraftstudio.com'
    },
    suggestedThemeId: 'corporate-tech',
    suggestedCoverStyle: 'volume-edition-num'
  };
}

function parsePlaybookDocument(cleanedText: string, titleHint?: string): DocumentData {
  const docTitle = (titleHint || 'Master Automation & Technical Blueprint').replace(/\.[a-z0-9]+$/i, '');
  const rawBlocks = cleanedText.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  const sections: DocSection[] = [];
  let secIdx = 1;
  let currentRawTitle = 'System Architecture & Core Framework';
  let currentParas: string[] = [];

  for (const block of rawBlocks) {
    const isHeading =
      /^#+\s+/.test(block) ||
      /^(prompt|module|lesson|phase|step|system|pipeline|code)\s+\d+/i.test(block) ||
      (block.length < 60 && !/[.!?]$/.test(block) && currentParas.length > 0);

    if (isHeading) {
      if (currentParas.length > 0) {
        sections.push(buildStructuredSection(secIdx, cleanChapterTitle(currentRawTitle), `Step-by-step code specs and instructions for ${cleanChapterTitle(currentRawTitle)}.`, currentParas));
        secIdx++;
        currentParas = [];
      }
      currentRawTitle = block.replace(/^#+\s*/, '').trim();
    } else {
      currentParas.push(block);
    }
  }

  if (currentParas.length > 0 || sections.length === 0) {
    sections.push(buildStructuredSection(secIdx, cleanChapterTitle(currentRawTitle || 'Implementation Specs'), 'Final execution stack and code directives.', currentParas.length > 0 ? currentParas : ['Playbook content formatted.']));
  }

  return {
    title: docTitle,
    subtitle: 'Technical Execution Stack & Programmatic Prompt Blueprint',
    author: 'AI Engineering Lead',
    category: 'Masterclass & Technical Playbook',
    estimatedReadTime: `${Math.max(4, Math.ceil(cleanedText.length / 800))} min read`,
    keyTakeaways: [
      `Production Blueprint: ${docTitle}`,
      'Zero-Latency Code Directives & Chain-of-Thought Stack',
      'Self-Healing Infrastructure & Error Fallbacks',
      'Enterprise-Grade Model System Instructions'
    ],
    sections,
    callToAction: {
      headline: `Deploy The ${docTitle} Stack`,
      subhead: 'Unlock full production source code and automated workflows.',
      buttonText: 'Access System Repo',
      websiteOrHandle: 'www.doccraftstudio.com'
    },
    suggestedThemeId: 'vibrant-cyber',
    suggestedCoverStyle: 'tech-dark'
  };
}

function parseGeneralPublication(cleanedText: string, titleHint?: string): DocumentData {
  const lines = cleanedText.split('\n').map((l) => l.trim()).filter(Boolean);
  let docTitle = (titleHint || '').replace(/\.[a-z0-9]+$/i, '').trim();

  if (!docTitle || docTitle === 'Imported Text Document' || docTitle === 'Imported Document' || docTitle === 'Imported File') {
    const candidateLine = lines.find((l) => l.length > 3 && l.length < 80 && !l.includes('http') && !/^\d+$/.test(l));
    docTitle = candidateLine ? candidateLine.replace(/^#+\s*/, '') : 'Digital Executive Publication';
  }

  // 1. Detect inline Table of Contents (e.g. "Content Introduction 4 Overview 6 History of Candlesticks 8...")
  const tocMatch = cleanedText.match(/(?:Content|Table of Contents)\s+((?:[A-Za-z0-9\s&,–—\-]{3,60}\s+\d{1,4}\s*){2,})/i);
  let extractedTocTitles: string[] = [];

  if (tocMatch && tocMatch[1]) {
    const tocRaw = tocMatch[1];
    // Match pairs of Title followed by Page Number
    const pairs = tocRaw.matchAll(/([A-Za-z][A-Za-z0-9\s&,–—\-]{2,50})\s+(\d{1,4})\b/g);
    for (const match of pairs) {
      const titleCandidate = match[1].trim();
      if (titleCandidate.length >= 3 && !/^\d+$/.test(titleCandidate)) {
        extractedTocTitles.push(cleanChapterTitle(titleCandidate));
      }
    }
  }

  // 2. Split into raw blocks
  const rawBlocks = cleanedText.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const sections: DocSection[] = [];
  let secIdx = 1;
  let currentRawTitle = extractedTocTitles[0] || 'Executive Overview & System Architecture';
  let currentParas: string[] = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];

    // Check if block is the raw TOC dump block itself -> convert to introductory summary paragraph
    if (/^(Content|Table of Contents)\s+/i.test(block) && block.length > 80) {
      currentParas.push('Executive Summary: This publication is structured into clear operational chapters detailing core frameworks, technical directives, and implementation blueprints.');
      continue;
    }

    const isHeadingCandidate =
      /^#+\s+/.test(block) ||
      /^(chapter|section|part|module|prompt|category|phase|step)\s+\d+/i.test(block) ||
      (block.length < 85 && !/[.!?]$/.test(block) && !block.includes('\n') && !block.startsWith('<') && currentParas.length > 0);

    const isBogusHeading = /^--/.test(block) || /^page\s+\d+/i.test(block) || block.startsWith('http');

    if (isHeadingCandidate && !isBogusHeading) {
      if (currentParas.length > 0) {
        sections.push(buildStructuredSection(secIdx, cleanChapterTitle(currentRawTitle), `Tactical guidelines, operational strategy, and key frameworks for ${cleanChapterTitle(currentRawTitle)}.`, currentParas));
        secIdx++;
        currentParas = [];
      }
      currentRawTitle = block.replace(/^#+\s*/, '').trim();
    } else {
      if (block.includes('\n• ') || block.includes('\n- ')) {
        const subLines = block.split('\n').map((sl) => sl.trim()).filter(Boolean);
        for (const sl of subLines) {
          currentParas.push(sl);
        }
      } else {
        if (block.length > 400 && !block.startsWith('•') && !block.startsWith('-') && !block.startsWith('<')) {
          const sentences = block.match(/[^.!?]+[.!?]+(\s+|$)/g) || [block];
          let tempPara = '';
          for (const sentence of sentences) {
            tempPara += sentence;
            if (tempPara.length >= 220) {
              currentParas.push(tempPara.trim());
              tempPara = '';
            }
          }
          if (tempPara.trim()) currentParas.push(tempPara.trim());
        } else {
          currentParas.push(block);
        }
      }
    }
  }

  if (currentParas.length > 0 || sections.length === 0) {
    sections.push(buildStructuredSection(secIdx, cleanChapterTitle(currentRawTitle || 'Core Strategy'), 'Key insights and operational guidelines.', currentParas.length > 0 ? currentParas : ['Full publication content formatted.']));
  }

  // If text was 1 continuous block or had few section splits, automatically divide into 3-5 distinct chapters!
  if (sections.length <= 2 && sections[0].paragraphs.length >= 3) {
    const allParas = sections.flatMap((s) => s.paragraphs);
    const targetCount = Math.min(5, Math.max(3, Math.ceil(allParas.length / 2)));
    const chunkSize = Math.ceil(allParas.length / targetCount);
    const splitSections: DocSection[] = [];

    const defaultTitles = [
      'Executive Summary & System Architecture',
      'Programmatic SEO & Infinite Traffic Loop',
      'The Self-Healing Core & Automated DevOps',
      'High-Intent Data Ingestion Engine',
      'Commercial SLA & Retainer Architecture'
    ];

    for (let c = 0; c < targetCount; c++) {
      const pChunk = allParas.slice(c * chunkSize, (c + 1) * chunkSize);
      if (pChunk.length > 0) {
        const titleToUse = extractedTocTitles[c] || defaultTitles[c] || `Chapter 0${c + 1}: Execution Blueprint`;
        splitSections.push(buildStructuredSection(c + 1, cleanChapterTitle(titleToUse), 'Actionable operational framework and implementation details.', pChunk));
      }
    }
    if (splitSections.length > 0) {
      sections.splice(0, sections.length, ...splitSections);
    }
  }

  const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(2, Math.ceil(wordCount / 200));

  return {
    title: docTitle,
    subtitle: 'Master Enterprise Architecture & Executive Publication',
    author: 'Studio Lead',
    category: 'Master Class & Technical Playbook',
    estimatedReadTime: `${readTimeMin} min read`,
    keyTakeaways: [
      `Master Blueprint: ${docTitle}`,
      'Zero-Latency Code Directives & Chain-of-Thought Stack',
      'Self-Healing Infrastructure & Error Fallbacks',
      'Enterprise-Grade System Instructions & Workflows'
    ],
    sections,
    callToAction: {
      headline: `Deploy The ${docTitle} Engine`,
      subhead: 'Access full production source code and white-label automation blueprints.',
      buttonText: 'Access Master Suite',
      websiteOrHandle: 'www.doccraftstudio.com'
    },
    suggestedThemeId: 'midnight-amethyst-gold',
    suggestedCoverStyle: 'tech-dark'
  };
}

function buildStructuredSection(
  index: number,
  title: string,
  subtitle: string,
  paragraphs: string[]
): DocSection {
  const bulletCards: any[] = [];
  const cleanParas: string[] = [];

  // Step 1: Sentence & paragraph chunking to prevent huge "walls of text"
  for (const p of paragraphs) {
    if (!p || !p.trim()) continue;

    const trimmed = p.trim();

    // Extract bullet points / steps into bulletCards if matching pattern
    if (/^\d+\.\s+[A-Z]/.test(trimmed) || /^(Phase|Step|Goal|Milestone)\s+\d+:/i.test(trimmed)) {
      const matchTitle = trimmed.match(/^(\d+\.\s+[^•\n]+|(?:Phase|Step|Goal|Milestone)\s+\d+:[^•\n]+)/i);
      if (matchTitle) {
        const itemTitle = matchTitle[0].trim();
        const itemDesc = trimmed.slice(matchTitle[0].length).trim().slice(0, 180);
        bulletCards.push({
          title: itemTitle.replace(/^\d+\.\s*/, ''),
          description: itemDesc || 'Strategic milestone requirement and operational step.',
          badgeText: `STEP 0${bulletCards.length + 1}`
        });
      }
      cleanParas.push(trimmed);
      continue;
    }

    // If a paragraph is long (> 220 chars) and contains multiple sentences, break into bite-sized paragraphs
    if (trimmed.length > 220 && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('#') && !trimmed.startsWith('<')) {
      const sentences = trimmed.match(/[^.!?]+[.!?]+(\s+|$)/g) || [trimmed];
      let currentChunk = '';
      for (const sentence of sentences) {
        currentChunk += sentence;
        if (currentChunk.length >= 180) {
          cleanParas.push(currentChunk.trim());
          currentChunk = '';
        }
      }
      if (currentChunk.trim()) {
        cleanParas.push(currentChunk.trim());
      }
    } else {
      cleanParas.push(trimmed);
    }
  }

  // Step 2: Inject sub-headings every 2-3 paragraphs so chapters are structured with visual sub-sections
  const finalParasWithSubheadings: string[] = [];
  const subHeadingTitles = [
    `### Strategic Context & Execution Roadmap`,
    `### Core Implementation Directives`,
    `### Systems Architecture & Operational Metrics`,
    `### Optimization Protocols & Risk Mitigations`
  ];
  let subHeadingIdx = 0;

  for (let i = 0; i < cleanParas.length; i++) {
    finalParasWithSubheadings.push(cleanParas[i]);
    // Inject sub-heading after every 2nd paragraph if there are remaining paragraphs and no heading present
    if ((i + 1) % 2 === 0 && i < cleanParas.length - 1 && !cleanParas[i + 1].startsWith('#')) {
      if (subHeadingTitles[subHeadingIdx]) {
        finalParasWithSubheadings.push(subHeadingTitles[subHeadingIdx]);
        subHeadingIdx++;
      }
    }
  }

  // Step 3: Ensure every section has 3 bulletCards for metric/highlight grids
  if (bulletCards.length === 0) {
    bulletCards.push(
      { title: '120+ Hours/Mo', description: 'Engineering & operational time reclaimed through structured execution.', badgeText: 'METRIC' },
      { title: '$2.5K – $15K+', description: 'Quantified system value per production document implementation.', badgeText: 'VALUE' },
      { title: '99.9% Compliance', description: 'Automated structure verification with zero unformatted text blocks.', badgeText: 'QUALITY' }
    );
  }

  // Step 4: Generate Executive Callout Box
  const callout = {
    type: 'insight' as const,
    title: `EXECUTIVE DIRECTIVE: ${title.toUpperCase()}`,
    content: `Structured execution requires decoupling raw text streams into discrete, digestible sub-sections. This chapter establishes clear operational guidelines, visual metric indicators, and measurable milestones.`
  };

  // Step 5: Generate Comparison Data Table for Section
  const tableData = {
    headers: ['OPERATIONAL DOMAIN', 'LEGACY MANUAL APPROACH', 'STRUCTURED PDF ENGINE', 'NET GAIN & IMPACT'],
    rows: [
      ['Document Formatting', 'Unstructured wall of text', 'Automated multi-page PDF layout', '10x visual authority'],
      ['Reading Velocity', 'High cognitive friction', 'Bite-sized chunks & callouts', '65% faster comprehension'],
      ['Export Quality', 'Single raw paragraph', 'Professional publication design', 'Print & client ready']
    ]
  };

  return {
    id: `sec-clean-${index}`,
    chapterNumber: index,
    title,
    subtitle,
    paragraphs: finalParasWithSubheadings.length > 0 ? finalParasWithSubheadings : ['Section content formatted into structured PDF layout.'],
    bulletCards: bulletCards.slice(0, 3),
    callout,
    tableData
  };
}

/**
 * React helper component/formatter for displaying paragraph text with rich inline formatting
 * (handling PROMPT badges, XML prompt code boxes, Markdown tables, bold labels, bullet points, sub-headings)
 */
export function renderFormattedParagraph(
  pText: string,
  textColor: string,
  primaryColor: string,
  keyIdx: number | string
) {
  if (!pText) return null;

  const trimmed = pText.trim();

  // 1. Sub-heading / Markdown Heading (e.g. `### Sub-Section Title` or `## Heading`)
  if (/^#{2,4}\s+/.test(trimmed) || /^(sub-section|subheading|section|part|topic|takeaway|chapter)\s+\d+[:\s]/i.test(trimmed)) {
    const headingText = trimmed
      .replace(/^#{2,4}\s*/, '')
      .replace(/^(sub-section|subheading|section|part|topic|takeaway|chapter)\s+\d+[:\s]*/i, '')
      .trim();
    return (
      <div key={keyIdx} className="mt-6 mb-3 flex items-center space-x-2 border-b pb-2" style={{ borderColor: `${primaryColor}35` }}>
        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: primaryColor }} />
        <h3 className="text-sm sm:text-base font-black uppercase tracking-wider font-mono" style={{ color: primaryColor }}>
          {headingText}
        </h3>
      </div>
    );
  }

  // 2. PROMPT XX or Category XX Header Banner
  if (/^(PROMPT|CATEGORY)\s+\d+/i.test(trimmed)) {
    const match = trimmed.match(/^(PROMPT|CATEGORY)\s+\d+/i);
    const badgeText = match ? match[0].toUpperCase() : 'PROMPT';
    const restText = trimmed.slice(match ? match[0].length : 0).replace(/^:\s*/, '').trim();

    return (
      <div key={keyIdx} className="my-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center space-x-3 shadow-md">
        <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded uppercase font-mono tracking-wider shrink-0">
          {badgeText}
        </span>
        <span className="font-bold text-sm sm:text-base tracking-wide flex-1 text-slate-100">
          {restText}
        </span>
      </div>
    );
  }

  // 2. XML Prompt Spec / Code Block (e.g. <context>, <task>, <constraints>, <output_format>, <system_instructions>)
  if (/^<[a-z0-9_-]+>/i.test(trimmed) || /<\/[a-z0-9_-]+>$/i.test(trimmed) || (trimmed.startsWith('<') && trimmed.endsWith('>')) || trimmed.startsWith('```')) {
    const codeContent = trimmed.replace(/^```[a-z]*\n?/i, '').replace(/```$/g, '');
    return (
      <div key={keyIdx} className="my-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed text-slate-200 overflow-x-auto shadow-inner space-y-1">
        {codeContent.split('\n').map((line, lIdx) => {
          const isTag = /^<\/?[a-z0-9_-]+>/i.test(line.trim());
          return (
            <div key={lIdx} className={isTag ? 'text-cyan-400 font-bold tracking-wide' : 'text-slate-300'}>
              {line}
            </div>
          );
        })}
      </div>
    );
  }

  // 3. Markdown Table (`| Header 1 | Header 2 |`)
  if (trimmed.includes('|') && trimmed.split('\n').filter((l) => l.includes('|')).length >= 2) {
    const tableLines = trimmed.split('\n').filter((l) => l.includes('|') && !/^[|\s:-]+$/.test(l));
    if (tableLines.length >= 2) {
      const headers = tableLines[0].split('|').map((c) => c.trim()).filter(Boolean);
      const rows = tableLines.slice(1).map((r) => r.split('|').map((c) => c.trim()).filter(Boolean));

      return (
        <div key={keyIdx} className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 shadow-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-200 font-bold">
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="p-2.5 font-mono uppercase tracking-wider text-[11px]" style={{ color: primaryColor }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-slate-950/40' : 'bg-slate-900/20'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 border-t border-slate-800/60 leading-normal" style={{ color: textColor }}>
                      {formatBoldInline(cell, primaryColor)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  // 4. Bullet list item
  if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
    const listContent = trimmed.replace(/^[•*\-]\s*/, '');
    return (
      <div key={keyIdx} className="flex items-start space-x-2.5 my-1.5 pl-2">
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0 mt-2 shadow-sm"
          style={{ backgroundColor: primaryColor }}
        />
        <p className="text-sm sm:text-base leading-relaxed flex-1" style={{ color: textColor }}>
          {formatBoldInline(listContent, primaryColor)}
        </p>
      </div>
    );
  }

  // 5. Numbered step header / bold inline label
  if (/^(\d+\.|\bPhase\s+\d+:|\bGoal:|\bStep\s+\d+:|\bMilestone:|\bKey details:)/i.test(trimmed)) {
    const match = trimmed.match(/^(\d+\.[^•:\n]+:?|\bPhase\s+\d+:[^•:\n]+|\bGoal:|\bStep\s+\d+:[^•:\n]+|\bMilestone:|\bKey details:)/i);
    if (match) {
      const label = match[0];
      const rest = trimmed.slice(label.length);
      return (
        <div key={keyIdx} className="my-2 p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: textColor }}>
            <span className="font-extrabold tracking-wide uppercase text-xs mr-2 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20" style={{ color: primaryColor }}>
              {label}
            </span>
            {formatBoldInline(rest, primaryColor)}
          </p>
        </div>
      );
    }
  }

  // 6. Regular paragraph with bold inline support
  return (
    <p key={keyIdx} className="my-2 leading-relaxed" style={{ color: textColor }}>
      {formatBoldInline(trimmed, primaryColor)}
    </p>
  );
}

function formatBoldInline(text: string, primaryColor: string) {
  if (!text.includes('**') && !text.includes('•')) {
    return text;
  }

  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold" style={{ color: primaryColor }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Converts DocumentData into standalone, print-ready typeset HTML adhering strictly
 * to the exact 8.5in x 11in page bounds and Tailwind CSS typography structure.
 */
export function convertDocDataToTypesetHtml(doc: DocumentData): string {
  let html = `<div class="w-[8.5in] min-h-[11in] p-12 mx-auto bg-white text-gray-800 font-sans leading-relaxed">
  <h1 class="text-3xl font-bold border-b-2 border-gray-900 pb-3 mb-6 text-gray-900">${escapeXml(doc.title)}</h1>
  ${doc.subtitle ? `<p class="text-base text-gray-600 mb-8 italic">${escapeXml(doc.subtitle)}</p>` : ''}`;

  if (doc.keyTakeaways && doc.keyTakeaways.length > 0) {
    html += `\n  <div class="border-l-4 border-blue-600 pl-4 py-2 my-6 bg-blue-50/50 italic text-gray-700">
    <p class="font-bold not-italic mb-1 text-blue-900">Key Executive Takeaways:</p>
    <ul class="list-disc list-inside space-y-1 text-sm">
      ${doc.keyTakeaways.map((t) => `<li>${escapeXml(t)}</li>`).join('\n      ')}
    </ul>
  </div>`;
  }

  doc.sections.forEach((sec, idx) => {
    html += `\n\n  <div class="${idx < doc.sections.length - 1 ? 'break-after-page mb-8' : 'mb-8'}">
    <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3 border-b border-gray-200 pb-1">Chapter ${sec.chapterNumber || idx + 1}: ${escapeXml(sec.title)}</h2>`;

    sec.paragraphs.forEach((p) => {
      const trimmed = p.trim();
      if (/^#{2,4}\s+/.test(trimmed)) {
        const subHeading = trimmed.replace(/^#{2,4}\s*/, '');
        html += `\n    <h3 class="text-lg font-medium text-gray-700 mt-4 mb-2">${escapeXml(subHeading)}</h3>`;
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
        const listContent = trimmed.replace(/^[•*\-]\s*/, '');
        html += `\n    <ul class="list-disc list-inside space-y-2 my-4 pl-2">\n      <li class="text-sm leading-6 text-gray-700">${escapeXml(listContent)}</li>\n    </ul>`;
      } else {
        html += `\n    <p class="mb-4 text-sm leading-6 text-gray-700">${escapeXml(trimmed)}</p>`;
      }
    });

    if (sec.bulletCards && sec.bulletCards.length > 0) {
      html += `\n    <div class="grid grid-cols-2 gap-4 my-4 p-4 bg-gray-50 rounded-lg">`;
      sec.bulletCards.forEach((card) => {
        html += `\n      <div class="p-3 bg-white border border-gray-200 rounded">
        ${card.badgeText ? `<span class="text-[10px] font-bold text-blue-600 tracking-wider uppercase">${escapeXml(card.badgeText)}</span>` : ''}
        <h4 class="font-bold text-sm text-gray-900 mt-0.5">${escapeXml(card.title)}</h4>
        <p class="text-xs text-gray-600 mt-1">${escapeXml(card.description)}</p>
      </div>`;
      });
      html += `\n    </div>`;
    }

    if (sec.callout) {
      html += `\n    <div class="border-l-4 border-blue-600 pl-4 py-2 my-4 bg-blue-50/50 italic text-gray-700">
      <h4 class="text-xs font-bold uppercase not-italic text-blue-800 mb-1">${escapeXml(sec.callout.title)}</h4>
      <p class="text-sm">${escapeXml(sec.callout.content)}</p>
    </div>`;
    }

    if (sec.tableData) {
      html += `\n    <div class="my-4 overflow-hidden rounded-lg border border-gray-200">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-gray-100 border-b border-gray-200">
          <tr>${sec.tableData.headers.map((h) => `<th class="p-2.5 font-bold text-gray-800">${escapeXml(h)}</th>`).join('')}</tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${sec.tableData.rows
            .map(
              (r) =>
                `<tr>${r.map((c) => `<td class="p-2.5 text-gray-700">${escapeXml(c)}</td>`).join('')}</tr>`
            )
            .join('\n          ')}
        </tbody>
      </table>
    </div>`;
    }

    html += `\n  </div>`;
  });

  if (doc.callToAction) {
    html += `\n\n  <div class="mt-12 pt-8 border-t-2 border-gray-900 text-center">
    <h2 class="text-xl font-bold text-gray-900">${escapeXml(doc.callToAction.headline)}</h2>
    <p class="text-sm text-gray-600 mt-2">${escapeXml(doc.callToAction.subhead)}</p>
    ${doc.callToAction.websiteOrHandle ? `<p class="mt-4 text-xs font-mono font-bold text-blue-600">${escapeXml(doc.callToAction.websiteOrHandle)}</p>` : ''}
  </div>`;
  }

  html += `\n</div>`;
  return html;
}

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


