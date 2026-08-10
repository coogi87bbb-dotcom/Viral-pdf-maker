import { DocumentData } from '../types';

export const SAMPLE_DOCUMENTS: { name: string; tag: string; description: string; doc: DocumentData; rawText: string }[] = [
  {
    name: 'The Creator Monetization Playbook',
    tag: 'Gumroad Best-Seller Format',
    description: 'A 5-chapter blueprint detailing how to turn knowledge into $10k/month digital downloads.',
    doc: {
      title: 'The Creator Monetization Playbook',
      subtitle: 'A Step-by-Step System to Build, Launch, and Scale Digital Products on Gumroad & Pinterest',
      author: 'Alex Vance | Studio Publishing',
      category: 'Digital Business & Creator Economy',
      estimatedReadTime: '12 min read',
      keyTakeaways: [
        'How to identify high-converting digital product niches in 30 minutes',
        'The exact 3-step Gumroad sales page formula that generated over $150k',
        'Designing viral Pinterest pins that drive 50,000+ targeted monthly visitors',
        'Converting one Google Doc into 4 distinct passive income formats'
      ],
      sections: [
        {
          id: 'sec-1',
          chapterNumber: 1,
          title: 'The Shift: From Reading to Digital Products',
          subtitle: 'Why digital downloads are the highest-margin leverage in the creator economy',
          paragraphs: [
            'In traditional publishing, creating a book required agents, publishers, and months of waiting. Today, an elite digital guide or workbook can be exported directly from a simple Google Document and listed for sale worldwide in less than an hour.',
            'The secret to high-converting digital products is not page count—it is visual clarity, actionable structure, and clear problem solving. People don’t buy 300 pages of fluff; they buy structured clarity they can implement immediately.'
          ],
          callout: {
            type: 'insight',
            title: 'The Core Golden Rule of Digital Products',
            content: 'Format matters as much as content. A standard raw Google Doc sells for $0. The exact same text transformed into a beautifully laid out, high-contrast PDF guide sells for $29 to $49 on Gumroad and Etsy.'
          },
          bulletCards: [
            {
              title: 'Instant Delivery',
              description: 'Zero inventory, zero shipping costs, and 95%+ profit margins on every order.',
              badgeText: '95% Margin'
            },
            {
              title: 'Viral Distribution',
              description: 'Pinterest, Twitter/X, and Instagram previews drive organic traffic straight to checkout.',
              badgeText: 'Organic Reach'
            },
            {
              title: 'Evergreen Asset',
              description: 'Build once, update periodically, and generate revenue for years to come.',
              badgeText: 'Passive Income'
            }
          ]
        },
        {
          id: 'sec-2',
          chapterNumber: 2,
          title: 'The High-Converting Offer Blueprint',
          subtitle: 'Positioning your document for maximum perceived value',
          paragraphs: [
            'To sell a document on Pinterest or Gumroad, you must frame your knowledge around a specific outcome. Never label your PDF a "generic ebook"—label it a Playbook, Cheat Sheet, Master System, or Operating System.',
            'When potential buyers scroll through social media, they judge your offer by its visual cover page and PDF preview. High contrast typography, clean section callouts, and structured worksheet blocks instantly build buyer trust.'
          ],
          callout: {
            type: 'tip',
            title: 'Pro Tip: The 3-Part Headline Formula',
            content: 'Use: [Specific Desired Outcome] + [In Timeframe / Without Frustration] + [Interactive Asset Included]. Example: "The $10k Creator Playbook + Includes Printable Worksheets & 3D Cover Mockups."'
          },
          tableData: {
            headers: ['Product Type', 'Target Price', 'Best Selling Channels', 'Conversion Rate'],
            rows: [
              ['Quick Cheat Sheet (2-5 pages)', '$9 - $15', 'Pinterest & Twitter', '6.5% - 10%'],
              ['Interactive Master Workbook', '$24 - $39', 'Gumroad & Instagram', '3.8% - 6.2%'],
              ['Complete Creator System', '$49 - $99', 'Email Newsletter & YouTube', '2.5% - 4.5%']
            ]
          }
        },
        {
          id: 'sec-3',
          chapterNumber: 3,
          title: 'Executing The Studio Formatting Flow',
          subtitle: 'Turning plain paragraphs into readable, engaging visual pages',
          paragraphs: [
            'When someone opens your PDF, their eyes scan for headers, bold callout boxes, and structured summary cards before reading line-by-line.',
            'Break up large blocks of text after every two paragraphs with a quote box, an action step, or a key takeaway card. This keeps the reader engaged and ensures your document looks like a professional publication.'
          ],
          callout: {
            type: 'worksheet',
            title: 'Action Item: Product Audit Worksheet',
            content: 'Check off your document assets before export: [ ] Title & Subtitle defined [ ] High-contrast Cover Page selected [ ] Chapter Headers added [ ] Key Takeaways summary included [ ] Back cover CTA page configured.'
          }
        }
      ],
      callToAction: {
        headline: 'Ready to Scale Your Digital Shop?',
        subhead: 'Join 12,000+ creators who use DocCraft Studio to transform plain Google Docs into high-converting PDF assets.',
        buttonText: 'Get The Master Digital Toolset',
        websiteOrHandle: 'www.doccraftstudio.com | @doccraftstudio'
      },
      marketingCopy: {
        gumroadHeadline: 'The Creator Monetization Playbook: Turn Google Docs into $10k/mo PDF Assets',
        pinterestPinText: 'Stop selling cheap ebooks. Use this 5-step framework to convert plain Google Docs into luxury PDF playbooks people actually buy!',
        salesHighlights: [
          'Instant Google Doc to PDF transformation',
          'Includes 6 Studio Publishing Themes',
          'Automated 3D Pinterest & Gumroad Product Mockups',
          'Full-commercial distribution rights'
        ]
      }
    },
    rawText: `The Creator Monetization Playbook
A Step-by-Step System to Build, Launch, and Scale Digital Products on Gumroad & Pinterest
By Alex Vance | Studio Publishing

Chapter 1: The Shift: From Reading to Digital Products
In traditional publishing, creating a book required agents, publishers, and months of waiting. Today, an elite digital guide or workbook can be exported directly from a simple Google Document and listed for sale worldwide in less than an hour.
The secret to high-converting digital products is not page count—it is visual clarity, actionable structure, and clear problem solving. People don’t buy 300 pages of fluff; they buy structured clarity they can implement immediately.

Chapter 2: The High-Converting Offer Blueprint
To sell a document on Pinterest or Gumroad, you must frame your knowledge around a specific outcome. Never label your PDF a "generic ebook"—label it a Playbook, Cheat Sheet, Master System, or Operating System.
When potential buyers scroll through social media, they judge your offer by its visual cover page and PDF preview. High contrast typography, clean section callouts, and structured worksheet blocks instantly build buyer trust.

Chapter 3: Executing The Studio Formatting Flow
When someone opens your PDF, their eyes scan for headers, bold callout boxes, and structured summary cards before reading line-by-line.
Break up large blocks of text after every two paragraphs with a quote box, an action step, or a key takeaway card.`
  },
  {
    name: 'SaaS Growth & AI Automation Operating System',
    tag: 'B2B Whitepaper & Guide',
    description: 'An executive B2B framework for autonomous AI agent pipelines and programmatic SEO.',
    doc: {
      title: 'SaaS Growth & AI Automation OS',
      subtitle: 'Architecting Zero-Employee Growth Pipelines with Autonomous LLM Workflows & Programmatic SEO',
      author: 'Enterprise AI Systems Team',
      category: 'Software & AI Architecture',
      estimatedReadTime: '18 min read',
      keyTakeaways: [
        'How to build autonomous data ingestion & enrichment pipelines',
        'Programmatic SEO engine architecture driving 100k+ organic monthly impressions',
        'Self-healing system monitoring to automatically fix scraper blocks & API rate limits',
        'Compute-to-revenue optimization maintaining 85%+ SaaS software margins'
      ],
      sections: [
        {
          id: 'sec-s1',
          chapterNumber: 1,
          title: 'The Autonomous Data Factory',
          subtitle: 'Scraping, parsing, and enriching public intelligence at scale',
          paragraphs: [
            'Modern B2B intelligence platforms rely on autonomous AI agents to continuously scrape, parse, and enrich public business data (job postings, funding rounds, hiring velocity) without manual human intervention.',
            'By pairing structured web scrapers with Gemini 2.5 Flash, raw unstructured web HTML is instantly transformed into JSON lead records with 99.4% parsing accuracy.'
          ],
          callout: {
            type: 'warning',
            title: 'Rate Limit & Hygiene Protocol',
            content: 'Always implement exponential backoff retry algorithms and rotating proxy pools. Raw scraper dumps create dirty vector indexes; enforce JSON Schema validation before database writes.'
          }
        },
        {
          id: 'sec-s2',
          chapterNumber: 2,
          title: 'The Infinite Traffic Loop',
          subtitle: 'Programmatic SEO and autonomous indexing',
          paragraphs: [
            'Programmatic SEO is the engine that generates thousands of high-intent landing pages tailored to targeted ICP queries.',
            'Each landing page dynamically pulls live enriched data from the vector database, creating unique, high-value web pages that search engines index aggressively.'
          ],
          bulletCards: [
            {
              title: 'Dynamic Page Generation',
              description: 'AI agents continuously spin up location and niche specific pages.',
              badgeText: '10k Pages/Mo'
            },
            {
              title: 'Automated Indexing',
              description: 'Google Indexing API integration submits new URLs within 5 minutes of publish.',
              badgeText: 'Instant Rank'
            }
          ]
        }
      ],
      callToAction: {
        headline: 'Scale Your SaaS Architecture Today',
        subhead: 'Download the complete infrastructure codebase and Docker containers.',
        buttonText: 'Access Technical Repository',
        websiteOrHandle: 'https://github.com/enterprise-ai-os'
      }
    },
    rawText: `SaaS Growth & AI Automation OS
Architecting Zero-Employee Growth Pipelines with Autonomous LLM Workflows
By Enterprise AI Systems Team

Chapter 1: The Autonomous Data Factory
Modern B2B intelligence platforms rely on autonomous AI agents to continuously scrape, parse, and enrich public business data without manual human intervention. By pairing structured web scrapers with Gemini, raw unstructured web HTML is instantly transformed into clean lead records.

Chapter 2: The Infinite Traffic Loop
Programmatic SEO is the engine that generates thousands of high-intent landing pages tailored to targeted ICP queries. Each page dynamically pulls live enriched data, creating unique pages search engines index aggressively.`
  }
];
