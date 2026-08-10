export interface FontPairingOption {
  id: string;
  name: string;
  category: string;
  description: string;
  headerFont: string;
  bodyFont: string;
  headerCss: string;
  bodyCss: string;
}

export interface IndividualFontOption {
  id: string;
  name: string;
  css: string;
  category: 'Serif' | 'Sans' | 'Mono' | 'Display';
}

export const INDIVIDUAL_HEADER_FONTS: IndividualFontOption[] = [
  { id: 'playfair', name: 'Playfair Display', css: "'Playfair Display', serif", category: 'Serif' },
  { id: 'cormorant', name: 'Cormorant Garamond', css: "'Cormorant Garamond', serif", category: 'Serif' },
  { id: 'cinzel', name: 'Cinzel Roman', css: "'Cinzel', serif", category: 'Display' },
  { id: 'montserrat', name: 'Montserrat Bold', css: "'Montserrat', sans-serif", category: 'Sans' },
  { id: 'jakarta', name: 'Plus Jakarta Sans', css: "'Plus Jakarta Sans', sans-serif", category: 'Sans' },
  { id: 'outfit', name: 'Outfit Rounded', css: "'Outfit', sans-serif", category: 'Sans' },
  { id: 'oswald', name: 'Oswald Condensed', css: "'Oswald', sans-serif", category: 'Display' },
  { id: 'syne', name: 'Syne Avant-Garde', css: "'Syne', sans-serif", category: 'Display' },
  { id: 'space-grotesk', name: 'Space Grotesk', css: "'Space Grotesk', sans-serif", category: 'Display' },
  { id: 'bodoni', name: 'Bodoni Moda', css: "'Bodoni Moda', serif", category: 'Serif' },
  { id: 'fraunces', name: 'Fraunces Warm Serif', css: "'Fraunces', serif", category: 'Serif' },
  { id: 'bricolage', name: 'Bricolage Grotesk', css: "'Bricolage Grotesk', sans-serif", category: 'Display' },
  { id: 'cabinet', name: 'Cabinet Grotesk', css: "'Cabinet Grotesk', sans-serif", category: 'Display' },
  { id: 'jetbrains', name: 'JetBrains Mono', css: "'JetBrains Mono', monospace", category: 'Mono' },
  { id: 'courier', name: 'Courier Prime', css: "'Courier Prime', monospace", category: 'Mono' },
  { id: 'newsreader', name: 'Newsreader Serif', css: "'Newsreader', serif", category: 'Serif' },
  { id: 'lora', name: 'Lora Editorial', css: "'Lora', serif", category: 'Serif' },
  { id: 'merriweather', name: 'Merriweather', css: "'Merriweather', serif", category: 'Serif' },
  { id: 'spectral', name: 'Spectral Book', css: "'Spectral', serif", category: 'Serif' },
  { id: 'gothic', name: 'Gothic Heritage', css: "'UnifrakturMaguntia', serif", category: 'Display' },
  { id: 'poppins', name: 'Poppins Display', css: "'Poppins', sans-serif", category: 'Sans' },
  { id: 'raleway', name: 'Raleway Geometric', css: "'Raleway', sans-serif", category: 'Sans' },
  { id: 'worksans', name: 'Work Sans Heavy', css: "'Work Sans', sans-serif", category: 'Sans' },
  { id: 'dmsans', name: 'DM Sans Medium', css: "'DM Sans', sans-serif", category: 'Sans' },
  { id: 'archivo', name: 'Archivo Black', css: "'Archivo', sans-serif", category: 'Display' },
  { id: 'sora', name: 'Sora Display', css: "'Sora', sans-serif", category: 'Display' },
  { id: 'inter', name: 'Inter UI Bold', css: "'Inter', sans-serif", category: 'Sans' },
  { id: 'ebgaramond', name: 'EB Garamond', css: "'EB Garamond', serif", category: 'Serif' },
  { id: 'baskerville', name: 'Libre Baskerville', css: "Georgia, serif", category: 'Serif' },
  { id: 'quicksand', name: 'Quicksand Soft', css: "'Quicksand', sans-serif", category: 'Sans' },
  { id: 'special-typewriter', name: 'Special Typewriter', css: "'Courier Prime', monospace", category: 'Mono' },
  { id: 'system-sans', name: 'System Sans Bold', css: "system-ui, -apple-system, sans-serif", category: 'Sans' }
];

export const INDIVIDUAL_BODY_FONTS: IndividualFontOption[] = [
  { id: 'newsreader-body', name: 'Newsreader Editorial', css: "'Newsreader', Georgia, serif", category: 'Serif' },
  { id: 'merriweather-body', name: 'Merriweather Book', css: "'Merriweather', Georgia, serif", category: 'Serif' },
  { id: 'georgia-body', name: 'Georgia Classic', css: "Georgia, serif", category: 'Serif' },
  { id: 'inter-body', name: 'Inter UI Regular', css: "'Inter', sans-serif", category: 'Sans' },
  { id: 'jakarta-body', name: 'Plus Jakarta Sans', css: "'Plus Jakarta Sans', sans-serif", category: 'Sans' },
  { id: 'worksans-body', name: 'Work Sans Regular', css: "'Work Sans', sans-serif", category: 'Sans' },
  { id: 'opensans-body', name: 'Open Sans Clean', css: "'Open Sans', sans-serif", category: 'Sans' },
  { id: 'roboto-body', name: 'Roboto Standard', css: "'Roboto', sans-serif", category: 'Sans' },
  { id: 'lora-body', name: 'Lora Book', css: "'Lora', Georgia, serif", category: 'Serif' },
  { id: 'sourceserif-body', name: 'Source Serif Book', css: "Georgia, serif", category: 'Serif' },
  { id: 'sourcesans-body', name: 'Source Sans Pro', css: "sans-serif", category: 'Sans' },
  { id: 'firacode-body', name: 'Fira Code Mono', css: "'JetBrains Mono', monospace", category: 'Mono' },
  { id: 'jetbrains-body', name: 'JetBrains Code Mono', css: "'JetBrains Mono', monospace", category: 'Mono' },
  { id: 'nunito-body', name: 'Nunito Soft', css: "sans-serif", category: 'Sans' },
  { id: 'dmsans-body', name: 'DM Sans Regular', css: "'DM Sans', sans-serif", category: 'Sans' },
  { id: 'system-body', name: 'System UI Standard', css: "system-ui, -apple-system, sans-serif", category: 'Sans' },
  { id: 'courier-body', name: 'Courier Typewriter', css: "'Courier Prime', monospace", category: 'Mono' },
  { id: 'lato-body', name: 'Lato Clean', css: "sans-serif", category: 'Sans' },
  { id: 'ebgaramond-body', name: 'EB Garamond Book', css: "Georgia, serif", category: 'Serif' },
  { id: 'spectral-body', name: 'Spectral Book', css: "Georgia, serif", category: 'Serif' },
  { id: 'ptserif-body', name: 'PT Serif', css: "Georgia, serif", category: 'Serif' },
  { id: 'inconsolata-body', name: 'Inconsolata Mono', css: "'JetBrains Mono', monospace", category: 'Mono' }
];

export const FONT_PAIRINGS_DATA: FontPairingOption[] = [
  // 1. EDITORIAL & SERIF
  {
    id: 'editorial-serif',
    name: '1. Playfair + Newsreader',
    category: 'Editorial & Serif',
    description: 'Classic Vogue & New York Times editorial feel',
    headerFont: 'Playfair Display',
    bodyFont: 'Newsreader Editorial',
    headerCss: "'Playfair Display', serif",
    bodyCss: "'Newsreader', Georgia, serif"
  },
  {
    id: 'luxury-garamond',
    name: '2. Cormorant + Merriweather',
    category: 'Editorial & Serif',
    description: 'High-end book publisher aesthetic',
    headerFont: 'Cormorant Garamond',
    bodyFont: 'Merriweather',
    headerCss: "'Cormorant Garamond', serif",
    bodyCss: "'Merriweather', Georgia, serif"
  },
  {
    id: 'bodoni-news',
    name: '3. Bodoni Moda + Georgia',
    category: 'Editorial & Serif',
    description: 'Harper\'s Bazaar & haute fashion layout',
    headerFont: 'Bodoni Moda',
    bodyFont: 'Georgia',
    headerCss: "'Bodoni Moda', serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'spectral-lora',
    name: '4. Spectral + Lora',
    category: 'Editorial & Serif',
    description: 'Soft literary book paper feel',
    headerFont: 'Spectral',
    bodyFont: 'Lora',
    headerCss: "'Spectral', serif",
    bodyCss: "'Lora', Georgia, serif"
  },
  {
    id: 'ebgaramond-source',
    name: '5. EB Garamond + Source Serif',
    category: 'Editorial & Serif',
    description: 'Traditional Oxford Press book spread',
    headerFont: 'EB Garamond',
    bodyFont: 'Source Serif',
    headerCss: "'EB Garamond', serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'baskerville-georgia',
    name: '6. Baskerville + Georgia',
    category: 'Editorial & Serif',
    description: 'Historical British literary press',
    headerFont: 'Libre Baskerville',
    bodyFont: 'Georgia',
    headerCss: "Georgia, serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'fraunces-newsreader',
    name: '7. Fraunces + Newsreader',
    category: 'Editorial & Serif',
    description: 'Warm organic retro serif paperback',
    headerFont: 'Fraunces',
    bodyFont: 'Newsreader',
    headerCss: "'Fraunces', serif",
    bodyCss: "'Newsreader', Georgia, serif"
  },
  {
    id: 'playfair-merriweather',
    name: '8. Playfair + Merriweather',
    category: 'Editorial & Serif',
    description: 'High contrast trade hardcover format',
    headerFont: 'Playfair Display',
    bodyFont: 'Merriweather',
    headerCss: "'Playfair Display', serif",
    bodyCss: "'Merriweather', Georgia, serif"
  },
  {
    id: 'cormorant-lora',
    name: '9. Cormorant + Lora',
    category: 'Editorial & Serif',
    description: 'Poetry & philosophy journal layout',
    headerFont: 'Cormorant Garamond',
    bodyFont: 'Lora',
    headerCss: "'Cormorant Garamond', serif",
    bodyCss: "'Lora', Georgia, serif"
  },
  {
    id: 'cinzel-georgia',
    name: '10. Cinzel + Georgia',
    category: 'Editorial & Serif',
    description: 'Classical Roman literature press',
    headerFont: 'Cinzel Roman',
    bodyFont: 'Georgia',
    headerCss: "'Cinzel', serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'newsreader-georgia',
    name: '11. Newsreader + Georgia',
    category: 'Editorial & Serif',
    description: 'Broadsheet literary review',
    headerFont: 'Newsreader Serif',
    bodyFont: 'Georgia',
    headerCss: "'Newsreader', serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'bodoni-lora',
    name: '12. Bodoni + Lora',
    category: 'Editorial & Serif',
    description: 'High-fashion editorial showcase',
    headerFont: 'Bodoni Moda',
    bodyFont: 'Lora',
    headerCss: "'Bodoni Moda', serif",
    bodyCss: "'Lora', Georgia, serif"
  },

  // 2. CORPORATE & SANS
  {
    id: 'modern-sans',
    name: '13. Plus Jakarta + Inter',
    category: 'Corporate & Sans',
    description: 'Clean modern tech corporate pitchbook',
    headerFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter UI',
    headerCss: "'Plus Jakarta Sans', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'montserrat-opensans',
    name: '14. Montserrat + Open Sans',
    category: 'Corporate & Sans',
    description: 'Executive corporate report deck',
    headerFont: 'Montserrat',
    bodyFont: 'Open Sans',
    headerCss: "'Montserrat', sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'oswald-roboto',
    name: '15. Oswald + Roboto',
    category: 'Corporate & Sans',
    description: 'Industrial bold annual report',
    headerFont: 'Oswald',
    bodyFont: 'Roboto',
    headerCss: "'Oswald', sans-serif",
    bodyCss: "'Roboto', sans-serif"
  },
  {
    id: 'outfit-inter',
    name: '16. Outfit + Inter',
    category: 'Corporate & Sans',
    description: 'SaaS product document & manual',
    headerFont: 'Outfit Rounded',
    bodyFont: 'Inter',
    headerCss: "'Outfit', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'work-opensans',
    name: '17. Work Sans + Open Sans',
    category: 'Corporate & Sans',
    description: 'Clean corporate whitepaper spread',
    headerFont: 'Work Sans',
    bodyFont: 'Open Sans',
    headerCss: "'Work Sans', sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'poppins-inter',
    name: '18. Poppins + Inter',
    category: 'Corporate & Sans',
    description: 'Sleek design agency proposal',
    headerFont: 'Poppins',
    bodyFont: 'Inter',
    headerCss: "'Poppins', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'raleway-lato',
    name: '19. Raleway + Lato',
    category: 'Corporate & Sans',
    description: 'Contemporary consulting guide',
    headerFont: 'Raleway',
    bodyFont: 'Lato',
    headerCss: "'Raleway', sans-serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'dmsans-inter',
    name: '20. DM Sans + Inter',
    category: 'Corporate & Sans',
    description: 'Financial technology summary',
    headerFont: 'DM Sans',
    bodyFont: 'Inter',
    headerCss: "'DM Sans', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'jost-opensans',
    name: '21. Jost + Open Sans',
    category: 'Corporate & Sans',
    description: 'Minimalist business plan deck',
    headerFont: 'Jost',
    bodyFont: 'Open Sans',
    headerCss: "sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'archivo-roboto',
    name: '22. Archivo + Roboto',
    category: 'Corporate & Sans',
    description: 'Heavy headline corporate deck',
    headerFont: 'Archivo Black',
    bodyFont: 'Roboto',
    headerCss: "'Archivo', sans-serif",
    bodyCss: "'Roboto', sans-serif"
  },
  {
    id: 'sora-inter',
    name: '23. Sora + Inter',
    category: 'Corporate & Sans',
    description: 'Modern digital media report',
    headerFont: 'Sora Display',
    bodyFont: 'Inter',
    headerCss: "'Sora', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'jakarta-system',
    name: '24. Jakarta + System UI',
    category: 'Corporate & Sans',
    description: 'Native product documentation',
    headerFont: 'Plus Jakarta Sans',
    bodyFont: 'System UI',
    headerCss: "'Plus Jakarta Sans', sans-serif",
    bodyCss: "system-ui, -apple-system, sans-serif"
  },

  // 3. TECH & CYBER
  {
    id: 'tech-mono',
    name: '25. JetBrains + Jakarta',
    category: 'Tech & Cyber',
    description: 'Developer API documentation',
    headerFont: 'JetBrains Code Mono',
    bodyFont: 'Plus Jakarta',
    headerCss: "'JetBrains Mono', monospace",
    bodyCss: "'Plus Jakarta Sans', sans-serif"
  },
  {
    id: 'space-jakarta',
    name: '26. Space Grotesk + Jakarta',
    category: 'Tech & Cyber',
    description: 'Web3 & AI technical whitepaper',
    headerFont: 'Space Grotesk',
    bodyFont: 'Plus Jakarta',
    headerCss: "'Space Grotesk', sans-serif",
    bodyCss: "'Plus Jakarta Sans', sans-serif"
  },
  {
    id: 'firacode-inter',
    name: '27. Fira Code + Inter',
    category: 'Tech & Cyber',
    description: 'Code walkthrough & engineering manual',
    headerFont: 'Fira Code Mono',
    bodyFont: 'Inter UI',
    headerCss: "'JetBrains Mono', monospace",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'syne-sourcesans',
    name: '28. Syne + Source Sans',
    category: 'Tech & Cyber',
    description: 'Avant-garde AI tech newsletter',
    headerFont: 'Syne Display',
    bodyFont: 'Source Sans',
    headerCss: "'Syne', sans-serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'jetbrains-inter',
    name: '29. JetBrains + Inter',
    category: 'Tech & Cyber',
    description: 'Modern DevOps playbook & spec',
    headerFont: 'JetBrains Mono',
    bodyFont: 'Inter',
    headerCss: "'JetBrains Mono', monospace",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'courier-inter',
    name: '30. Courier Prime + Inter',
    category: 'Tech & Cyber',
    description: 'Technical specification sheet',
    headerFont: 'Courier Prime',
    bodyFont: 'Inter',
    headerCss: "'Courier Prime', monospace",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'space-roboto',
    name: '31. Space Grotesk + Roboto',
    category: 'Tech & Cyber',
    description: 'Robotics & hardware specification',
    headerFont: 'Space Grotesk',
    bodyFont: 'Roboto',
    headerCss: "'Space Grotesk', sans-serif",
    bodyCss: "'Roboto', sans-serif"
  },
  {
    id: 'inconsolata-work',
    name: '32. Inconsolata + Work Sans',
    category: 'Tech & Cyber',
    description: 'Data science notebook report',
    headerFont: 'Inconsolata Mono',
    bodyFont: 'Work Sans',
    headerCss: "'JetBrains Mono', monospace",
    bodyCss: "'Work Sans', sans-serif"
  },
  {
    id: 'firacode-roboto',
    name: '33. Fira Code + Roboto',
    category: 'Tech & Cyber',
    description: 'Cloud architecture documentation',
    headerFont: 'Fira Code Mono',
    bodyFont: 'Roboto',
    headerCss: "'JetBrains Mono', monospace",
    bodyCss: "'Roboto', sans-serif"
  },
  {
    id: 'jetbrains-jakarta',
    name: '34. JetBrains + Plus Jakarta',
    category: 'Tech & Cyber',
    description: 'Distributed systems manual',
    headerFont: 'JetBrains Mono',
    bodyFont: 'Plus Jakarta Sans',
    headerCss: "'JetBrains Mono', monospace",
    bodyCss: "'Plus Jakarta Sans', sans-serif"
  },
  {
    id: 'mono-minimal',
    name: '35. JetBrains + System UI',
    category: 'Tech & Cyber',
    description: 'Monospace code manifest',
    headerFont: 'JetBrains Mono',
    bodyFont: 'System UI',
    headerCss: "'JetBrains Mono', monospace",
    bodyCss: "system-ui, -apple-system, sans-serif"
  },
  {
    id: 'cyber-bold',
    name: '36. Archivo + JetBrains',
    category: 'Tech & Cyber',
    description: 'Cybersecurity threat intelligence brief',
    headerFont: 'Archivo Black',
    bodyFont: 'JetBrains Mono',
    headerCss: "'Archivo', sans-serif",
    bodyCss: "'JetBrains Mono', monospace"
  },

  // 4. LUXURY & GOLD
  {
    id: 'cormorant-inter',
    name: '37. Cormorant + Inter',
    category: 'Luxury & Gold',
    description: 'Modern luxury brand guideline',
    headerFont: 'Cormorant Garamond',
    bodyFont: 'Inter UI',
    headerCss: "'Cormorant Garamond', serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'playfair-montserrat',
    name: '38. Playfair + Montserrat',
    category: 'Luxury & Gold',
    description: 'Boutique jewelry catalog layout',
    headerFont: 'Playfair Display',
    bodyFont: 'Montserrat',
    headerCss: "'Playfair Display', serif",
    bodyCss: "'Montserrat', sans-serif"
  },
  {
    id: 'bodoni-outfit',
    name: '39. Bodoni + Outfit',
    category: 'Luxury & Gold',
    description: 'High-fashion lookbook & magazine',
    headerFont: 'Bodoni Moda',
    bodyFont: 'Outfit',
    headerCss: "'Bodoni Moda', serif",
    bodyCss: "'Outfit', sans-serif"
  },
  {
    id: 'fraunces-dmsans',
    name: '40. Fraunces + DM Sans',
    category: 'Luxury & Gold',
    description: 'Artisan perfume & wine tasting guide',
    headerFont: 'Fraunces',
    bodyFont: 'DM Sans',
    headerCss: "'Fraunces', serif",
    bodyCss: "'DM Sans', sans-serif"
  },
  {
    id: 'cinzel-montserrat',
    name: '41. Cinzel + Montserrat',
    category: 'Luxury & Gold',
    description: 'Luxury real estate portfolio',
    headerFont: 'Cinzel Roman',
    bodyFont: 'Montserrat',
    headerCss: "'Cinzel', serif",
    bodyCss: "'Montserrat', sans-serif"
  },
  {
    id: 'spectral-inter',
    name: '42. Spectral + Inter',
    category: 'Luxury & Gold',
    description: 'High-end hotel amenity press kit',
    headerFont: 'Spectral',
    bodyFont: 'Inter',
    headerCss: "'Spectral', serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'garamond-outfit',
    name: '43. Garamond + Outfit',
    category: 'Luxury & Gold',
    description: 'Exclusive club membership monograph',
    headerFont: 'EB Garamond',
    bodyFont: 'Outfit',
    headerCss: "'EB Garamond', serif",
    bodyCss: "'Outfit', sans-serif"
  },
  {
    id: 'playfair-lato',
    name: '44. Playfair + Lato',
    category: 'Luxury & Gold',
    description: 'Luxury resort itinerary booklet',
    headerFont: 'Playfair Display',
    bodyFont: 'Lato',
    headerCss: "'Playfair Display', serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'cormorant-dmsans',
    name: '45. Cormorant + DM Sans',
    category: 'Luxury & Gold',
    description: 'Fine watchmaking journal spread',
    headerFont: 'Cormorant Garamond',
    bodyFont: 'DM Sans',
    headerCss: "'Cormorant Garamond', serif",
    bodyCss: "'DM Sans', sans-serif"
  },
  {
    id: 'bodoni-inter',
    name: '46. Bodoni + Inter',
    category: 'Luxury & Gold',
    description: 'Architectural digest showcase',
    headerFont: 'Bodoni Moda',
    bodyFont: 'Inter',
    headerCss: "'Bodoni Moda', serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'cinzel-inter',
    name: '47. Cinzel + Inter',
    category: 'Luxury & Gold',
    description: 'Haute couture fashion portfolio',
    headerFont: 'Cinzel Roman',
    bodyFont: 'Inter',
    headerCss: "'Cinzel', serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'baskerville-montserrat',
    name: '48. Baskerville + Montserrat',
    category: 'Luxury & Gold',
    description: 'Private wealth management guide',
    headerFont: 'Libre Baskerville',
    bodyFont: 'Montserrat',
    headerCss: "Georgia, serif",
    bodyCss: "'Montserrat', sans-serif"
  },

  // 5. CREATIVE & DISPLAY
  {
    id: 'syne-inter',
    name: '49. Syne + Inter',
    category: 'Creative & Display',
    description: 'Creative agency portfolio deck',
    headerFont: 'Syne Display',
    bodyFont: 'Inter UI',
    headerCss: "'Syne', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'bricolage-jakarta',
    name: '50. Bricolage + Jakarta',
    category: 'Creative & Display',
    description: 'Indie design magazine headline',
    headerFont: 'Bricolage Grotesk',
    bodyFont: 'Plus Jakarta',
    headerCss: "'Bricolage Grotesk', sans-serif",
    bodyCss: "'Plus Jakarta Sans', sans-serif"
  },
  {
    id: 'cabinet-worksans',
    name: '51. Cabinet + Work Sans',
    category: 'Creative & Display',
    description: 'Modern design studio project brief',
    headerFont: 'Cabinet Grotesk',
    bodyFont: 'Work Sans',
    headerCss: "'Cabinet Grotesk', sans-serif",
    bodyCss: "'Work Sans', sans-serif"
  },
  {
    id: 'fraunces-inter',
    name: '52. Fraunces + Inter',
    category: 'Creative & Display',
    description: 'Warm expressive editorial guide',
    headerFont: 'Fraunces',
    bodyFont: 'Inter',
    headerCss: "'Fraunces', serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'sora-opensans',
    name: '53. Sora + Open Sans',
    category: 'Creative & Display',
    description: 'Creative digital agency showcase',
    headerFont: 'Sora Display',
    bodyFont: 'Open Sans',
    headerCss: "'Sora', sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'archivo-inter',
    name: '54. Archivo + Inter',
    category: 'Creative & Display',
    description: 'High-impact exhibition poster guide',
    headerFont: 'Archivo Black',
    bodyFont: 'Inter',
    headerCss: "'Archivo', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'quicksand-inter',
    name: '55. Quicksand + Inter',
    category: 'Creative & Display',
    description: 'Playful creative design workshop',
    headerFont: 'Quicksand',
    bodyFont: 'Inter',
    headerCss: "'Quicksand', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'bricolage-inter',
    name: '56. Bricolage + Inter',
    category: 'Creative & Display',
    description: 'Futuristic design manifesto',
    headerFont: 'Bricolage Grotesk',
    bodyFont: 'Inter',
    headerCss: "'Bricolage Grotesk', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'syne-worksans',
    name: '57. Syne + Work Sans',
    category: 'Creative & Display',
    description: 'Contemporary art gallery catalog',
    headerFont: 'Syne Display',
    bodyFont: 'Work Sans',
    headerCss: "'Syne', sans-serif",
    bodyCss: "'Work Sans', sans-serif"
  },
  {
    id: 'cabinet-inter',
    name: '58. Cabinet + Inter',
    category: 'Creative & Display',
    description: 'Creative agency pitch deck',
    headerFont: 'Cabinet Grotesk',
    bodyFont: 'Inter',
    headerCss: "'Cabinet Grotesk', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'outfit-lato',
    name: '59. Outfit + Lato',
    category: 'Creative & Display',
    description: 'Brand identity design guide',
    headerFont: 'Outfit Rounded',
    bodyFont: 'Lato',
    headerCss: "'Outfit', sans-serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'poppins-lato',
    name: '60. Poppins + Lato',
    category: 'Creative & Display',
    description: 'Graphic design studio showcase',
    headerFont: 'Poppins',
    bodyFont: 'Lato',
    headerCss: "'Poppins', sans-serif",
    bodyCss: "sans-serif"
  },

  // 6. VINTAGE & RETRO
  {
    id: 'vintage-typewriter',
    name: '61. Courier + Georgia',
    category: 'Vintage & Retro',
    description: 'Retro investigative reporter dossier',
    headerFont: 'Courier Prime',
    bodyFont: 'Georgia',
    headerCss: "'Courier Prime', monospace",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'special-merriweather',
    name: '62. Special + Merriweather',
    category: 'Vintage & Retro',
    description: '1950s classified intelligence file',
    headerFont: 'Special Typewriter',
    bodyFont: 'Merriweather',
    headerCss: "'Courier Prime', monospace",
    bodyCss: "'Merriweather', Georgia, serif"
  },
  {
    id: 'gothic-garamond',
    name: '63. Gothic + Georgia',
    category: 'Vintage & Retro',
    description: 'Medieval antiquarian manuscript',
    headerFont: 'Gothic Heritage',
    bodyFont: 'Georgia',
    headerCss: "'UnifrakturMaguntia', serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'courier-georgia',
    name: '64. Courier + Georgia Classic',
    category: 'Vintage & Retro',
    description: 'Vintage newspaper columnist layout',
    headerFont: 'Courier Prime',
    bodyFont: 'Georgia Classic',
    headerCss: "'Courier Prime', monospace",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'typewriter-newsreader',
    name: '65. Typewriter + Newsreader',
    category: 'Vintage & Retro',
    description: 'Classic literary fiction draft',
    headerFont: 'Courier Typewriter',
    bodyFont: 'Newsreader',
    headerCss: "'Courier Prime', monospace",
    bodyCss: "'Newsreader', Georgia, serif"
  },
  {
    id: 'special-georgia',
    name: '66. Special + Georgia',
    category: 'Vintage & Retro',
    description: 'Vintage noir detective log',
    headerFont: 'Special Typewriter',
    bodyFont: 'Georgia',
    headerCss: "'Courier Prime', monospace",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'gothic-merriweather',
    name: '67. Gothic + Merriweather',
    category: 'Vintage & Retro',
    description: 'Gothic dark fantasy chronicle',
    headerFont: 'Gothic Heritage',
    bodyFont: 'Merriweather',
    headerCss: "'UnifrakturMaguntia', serif",
    bodyCss: "'Merriweather', Georgia, serif"
  },
  {
    id: 'fraunces-georgia',
    name: '68. Fraunces + Georgia',
    category: 'Vintage & Retro',
    description: '1920s jazz era publication',
    headerFont: 'Fraunces',
    bodyFont: 'Georgia',
    headerCss: "'Fraunces', serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'typewriter-lora',
    name: '69. Courier + Lora',
    category: 'Vintage & Retro',
    description: 'Retro typewriter letter format',
    headerFont: 'Courier Prime',
    bodyFont: 'Lora',
    headerCss: "'Courier Prime', monospace",
    bodyCss: "'Lora', Georgia, serif"
  },
  {
    id: 'courier-source',
    name: '70. Courier + Source Serif',
    category: 'Vintage & Retro',
    description: 'Vintage academic dissertation',
    headerFont: 'Courier Prime',
    bodyFont: 'Source Serif',
    headerCss: "'Courier Prime', monospace",
    bodyCss: "Georgia, serif"
  },

  // 7. ACADEMIC & RESEARCH
  {
    id: 'academic-cinzel',
    name: '71. Cinzel + Georgia',
    category: 'Academic & Research',
    description: 'University press thesis & monograph',
    headerFont: 'Cinzel Roman',
    bodyFont: 'Georgia',
    headerCss: "'Cinzel', serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'ebgaramond-lora',
    name: '72. Garamond + Lora',
    category: 'Academic & Research',
    description: 'Oxford philosophical review spread',
    headerFont: 'EB Garamond',
    bodyFont: 'Lora',
    headerCss: "'EB Garamond', serif",
    bodyCss: "'Lora', Georgia, serif"
  },
  {
    id: 'baskerville-georgia2',
    name: '73. Baskerville + Georgia',
    category: 'Academic & Research',
    description: 'Royal society scientific journal',
    headerFont: 'Libre Baskerville',
    bodyFont: 'Georgia',
    headerCss: "Georgia, serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'spectral-merriweather',
    name: '74. Spectral + Merriweather',
    category: 'Academic & Research',
    description: 'Scholarly research paper layout',
    headerFont: 'Spectral',
    bodyFont: 'Merriweather',
    headerCss: "'Spectral', serif",
    bodyCss: "'Merriweather', Georgia, serif"
  },
  {
    id: 'cinzel-lora',
    name: '75. Cinzel + Lora',
    category: 'Academic & Research',
    description: 'Classical antiquities & history study',
    headerFont: 'Cinzel Roman',
    bodyFont: 'Lora',
    headerCss: "'Cinzel', serif",
    bodyCss: "'Lora', Georgia, serif"
  },
  {
    id: 'garamond-georgia',
    name: '76. Garamond + Georgia',
    category: 'Academic & Research',
    description: 'Humanities & history research paper',
    headerFont: 'EB Garamond',
    bodyFont: 'Georgia',
    headerCss: "'EB Garamond', serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'newsreader-lora',
    name: '77. Newsreader + Lora',
    category: 'Academic & Research',
    description: 'Academic literary criticism spread',
    headerFont: 'Newsreader',
    bodyFont: 'Lora',
    headerCss: "'Newsreader', serif",
    bodyCss: "'Lora', Georgia, serif"
  },
  {
    id: 'spectral-georgia',
    name: '78. Spectral + Georgia',
    category: 'Academic & Research',
    description: 'Scholarly monograph publication',
    headerFont: 'Spectral',
    bodyFont: 'Georgia',
    headerCss: "'Spectral', serif",
    bodyCss: "Georgia, serif"
  },
  {
    id: 'baskerville-lora',
    name: '79. Baskerville + Lora',
    category: 'Academic & Research',
    description: 'Medical & scientific review layout',
    headerFont: 'Libre Baskerville',
    bodyFont: 'Lora',
    headerCss: "Georgia, serif",
    bodyCss: "'Lora', Georgia, serif"
  },
  {
    id: 'cinzel-merriweather',
    name: '80. Cinzel + Merriweather',
    category: 'Academic & Research',
    description: 'Legal scholar treatise & digest',
    headerFont: 'Cinzel Roman',
    bodyFont: 'Merriweather',
    headerCss: "'Cinzel', serif",
    bodyCss: "'Merriweather', Georgia, serif"
  },

  // 8. SWISS & MINIMAL
  {
    id: 'swiss-grotesk',
    name: '81. Inter Bold + Inter Regular',
    category: 'Swiss & Minimal',
    description: 'International typographic style',
    headerFont: 'Inter Bold',
    bodyFont: 'Inter Regular',
    headerCss: "'Inter', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'system-minimal',
    name: '82. System Sans + System UI',
    category: 'Swiss & Minimal',
    description: 'Clean stark neutral UI layout',
    headerFont: 'System Sans',
    bodyFont: 'System UI',
    headerCss: "system-ui, -apple-system, sans-serif",
    bodyCss: "system-ui, -apple-system, sans-serif"
  },
  {
    id: 'worksans-inter',
    name: '83. Work Sans + Inter',
    category: 'Swiss & Minimal',
    description: 'Clean architectural spec sheet',
    headerFont: 'Work Sans',
    bodyFont: 'Inter',
    headerCss: "'Work Sans', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'dmsans-opensans',
    name: '84. DM Sans + Open Sans',
    category: 'Swiss & Minimal',
    description: 'Swiss graphic design grid',
    headerFont: 'DM Sans',
    bodyFont: 'Open Sans',
    headerCss: "'DM Sans', sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'jakarta-inter',
    name: '85. Plus Jakarta + Inter',
    category: 'Swiss & Minimal',
    description: 'Minimalist product manual',
    headerFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    headerCss: "'Plus Jakarta Sans', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'roboto-inter',
    name: '86. Roboto + Inter',
    category: 'Swiss & Minimal',
    description: 'Industrial minimal guide layout',
    headerFont: 'Roboto',
    bodyFont: 'Inter',
    headerCss: "'Roboto', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'inter-system',
    name: '87. Inter + System Sans',
    category: 'Swiss & Minimal',
    description: 'Pure neutral document layout',
    headerFont: 'Inter UI',
    bodyFont: 'System Sans',
    headerCss: "'Inter', sans-serif",
    bodyCss: "system-ui, -apple-system, sans-serif"
  },
  {
    id: 'jost-inter',
    name: '88. Jost + Inter',
    category: 'Swiss & Minimal',
    description: 'Scandinavian minimalist deck',
    headerFont: 'Jost',
    bodyFont: 'Inter',
    headerCss: "sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'worksans-opensans',
    name: '89. Work Sans + Open Sans',
    category: 'Swiss & Minimal',
    description: 'Functional instructional guide',
    headerFont: 'Work Sans',
    bodyFont: 'Open Sans',
    headerCss: "'Work Sans', sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'dmsans-inter2',
    name: '90. DM Sans + Inter Grid',
    category: 'Swiss & Minimal',
    description: 'Pure geometric whitepaper grid',
    headerFont: 'DM Sans',
    bodyFont: 'Inter UI',
    headerCss: "'DM Sans', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },

  // 9. FRIENDLY & MODERN
  {
    id: 'poppins-opensans',
    name: '91. Poppins + Open Sans',
    category: 'Friendly & Modern',
    description: 'Warm friendly ebook & guide',
    headerFont: 'Poppins',
    bodyFont: 'Open Sans',
    headerCss: "'Poppins', sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'nunito-inter',
    name: '92. Nunito + Inter',
    category: 'Friendly & Modern',
    description: 'Approachable wellness guide',
    headerFont: 'Nunito Soft',
    bodyFont: 'Inter',
    headerCss: "sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'quicksand-opensans',
    name: '93. Quicksand + Open Sans',
    category: 'Friendly & Modern',
    description: 'Youthful educational workbook',
    headerFont: 'Quicksand',
    bodyFont: 'Open Sans',
    headerCss: "'Quicksand', sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'outfit-opensans',
    name: '94. Outfit + Open Sans',
    category: 'Friendly & Modern',
    description: 'Friendly community newsletter',
    headerFont: 'Outfit Rounded',
    bodyFont: 'Open Sans',
    headerCss: "'Outfit', sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'raleway-inter',
    name: '95. Raleway + Inter',
    category: 'Friendly & Modern',
    description: 'Modern lifestyle publication',
    headerFont: 'Raleway',
    bodyFont: 'Inter',
    headerCss: "'Raleway', sans-serif",
    bodyCss: "'Inter', sans-serif"
  },
  {
    id: 'jost-lato',
    name: '96. Jost + Lato',
    category: 'Friendly & Modern',
    description: 'Friendly personal development guide',
    headerFont: 'Jost',
    bodyFont: 'Lato',
    headerCss: "sans-serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'poppins-roboto',
    name: '97. Poppins + Roboto',
    category: 'Friendly & Modern',
    description: 'Modern coaching workbook',
    headerFont: 'Poppins',
    bodyFont: 'Roboto',
    headerCss: "'Poppins', sans-serif",
    bodyCss: "'Roboto', sans-serif"
  },
  {
    id: 'nunito-opensans',
    name: '98. Nunito + Open Sans',
    category: 'Friendly & Modern',
    description: 'Self-help & mindfulness ebook',
    headerFont: 'Nunito Soft',
    bodyFont: 'Open Sans',
    headerCss: "sans-serif",
    bodyCss: "'Open Sans', sans-serif"
  },
  {
    id: 'quicksand-roboto',
    name: '99. Quicksand + Roboto',
    category: 'Friendly & Modern',
    description: 'Children\'s learning ebook',
    headerFont: 'Quicksand',
    bodyFont: 'Roboto',
    headerCss: "'Quicksand', sans-serif",
    bodyCss: "'Roboto', sans-serif"
  },
  {
    id: 'outfit-roboto',
    name: '100. Outfit + Roboto',
    category: 'Friendly & Modern',
    description: 'Warm agency onboarding guide',
    headerFont: 'Outfit Rounded',
    bodyFont: 'Roboto',
    headerCss: "'Outfit', sans-serif",
    bodyCss: "'Roboto', sans-serif"
  },

  // 10. MAGAZINE & PRESS
  {
    id: 'playfair-sourcesans',
    name: '101. Playfair + Source Sans',
    category: 'Magazine & Press',
    description: 'Modern lifestyle magazine spread',
    headerFont: 'Playfair Display',
    bodyFont: 'Source Sans',
    headerCss: "'Playfair Display', serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'newsreader-sourcesans',
    name: '102. Newsreader + Source Sans',
    category: 'Magazine & Press',
    description: 'Investigative journalism report',
    headerFont: 'Newsreader',
    bodyFont: 'Source Sans',
    headerCss: "'Newsreader', serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'cormorant-sourcesans',
    name: '103. Cormorant + Source Sans',
    category: 'Magazine & Press',
    description: 'Art & culture magazine feature',
    headerFont: 'Cormorant Garamond',
    bodyFont: 'Source Sans',
    headerCss: "'Cormorant Garamond', serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'bodoni-sourcesans',
    name: '104. Bodoni + Source Sans',
    category: 'Magazine & Press',
    description: 'Glossy fashion magazine spread',
    headerFont: 'Bodoni Moda',
    bodyFont: 'Source Sans',
    headerCss: "'Bodoni Moda', serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'fraunces-sourcesans',
    name: '105. Fraunces + Source Sans',
    category: 'Magazine & Press',
    description: 'Indie culture quarterly gazette',
    headerFont: 'Fraunces',
    bodyFont: 'Source Sans',
    headerCss: "'Fraunces', serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'spectral-sourcesans',
    name: '106. Spectral + Source Sans',
    category: 'Magazine & Press',
    description: 'Current affairs magazine layout',
    headerFont: 'Spectral',
    bodyFont: 'Source Sans',
    headerCss: "'Spectral', serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'cinzel-sourcesans',
    name: '107. Cinzel + Source Sans',
    category: 'Magazine & Press',
    description: 'Heritage press gazette feature',
    headerFont: 'Cinzel Roman',
    bodyFont: 'Source Sans',
    headerCss: "'Cinzel', serif",
    bodyCss: "sans-serif"
  },
  {
    id: 'baskerville-sourcesans',
    name: '108. Baskerville + Source Sans',
    category: 'Magazine & Press',
    description: 'Sunday magazine feature story',
    headerFont: 'Libre Baskerville',
    bodyFont: 'Source Sans',
    headerCss: "Georgia, serif",
    bodyCss: "sans-serif"
  }
];
