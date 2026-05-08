export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  keywords: string[];
  toolSlug: string;
  toolName: string;
  relatedSlugs: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'lease-red-flags',
    title: '10 Lease Clauses That Should Make You Think Twice (and What to Do About Them)',
    description: 'Learn the most common lease red flags renters miss — from automatic renewal traps to joint liability clauses — and how to protect yourself before signing.',
    date: '2026-05-08',
    category: 'Legal',
    keywords: ['lease red flags', 'bad lease clauses', 'rental agreement red flags', 'lease terms to watch out for'],
    toolSlug: 'lease-scanner',
    toolName: 'Lease Red Flag Scanner',
    relatedSlugs: ['security-deposit-laws', 'joint-and-several-liability'],
  },
  {
    slug: 'beat-ats-resume-filters',
    title: 'How to Beat ATS Resume Filters in 2026: What Actually Works (and What Doesn\'t)',
    description: 'Applicant tracking systems reject 75% of resumes before a human sees them. Here\'s what actually gets you through the filter in 2026.',
    date: '2026-05-08',
    category: 'Career',
    keywords: ['how to beat ATS', 'ATS resume filters', 'applicant tracking system tips', 'resume ATS optimization'],
    toolSlug: 'resume-reviewer',
    toolName: 'Resume Reviewer',
    relatedSlugs: ['resume-keywords', 'resume-bullet-examples'],
  },
  {
    slug: 'fda-food-recalls-explained',
    title: 'FDA Food Recalls Explained: How to Know If What\'s in Your Kitchen Is Safe',
    description: 'Understand the three classes of FDA food recalls, where to check for active recalls, and how to make sure nothing in your pantry is affected.',
    date: '2026-05-08',
    category: 'Health',
    keywords: ['FDA food recalls', 'how to check food recalls', 'food recall lookup', 'is my food recalled'],
    toolSlug: 'food-safety',
    toolName: 'Food Safety Scanner',
    relatedSlugs: ['what-is-bha-in-food', 'food-allergens-label-reading'],
  },
  {
    slug: 'security-deposit-laws',
    title: 'Security Deposit Laws by State: How Much Can a Landlord Actually Charge?',
    description: 'State-by-state guide to security deposit caps, return timelines, and interest requirements. Know your rights before signing a lease.',
    date: '2026-05-08',
    category: 'Legal',
    keywords: ['security deposit laws by state', 'how much can landlord charge security deposit', 'security deposit rules', 'deposit return timeline'],
    toolSlug: 'lease-scanner',
    toolName: 'Lease Red Flag Scanner',
    relatedSlugs: ['lease-red-flags', 'get-security-deposit-back'],
  },
  {
    slug: 'resume-keywords',
    title: 'What Keywords Should I Put on My Resume? A Job-by-Job Guide',
    description: 'Generic keyword lists are useless. Learn how to extract the exact keywords from any job description and place them where ATS systems actually look.',
    date: '2026-05-08',
    category: 'Career',
    keywords: ['resume keywords', 'keywords for resume', 'ATS keywords', 'resume keyword optimization'],
    toolSlug: 'resume-reviewer',
    toolName: 'Resume Reviewer',
    relatedSlugs: ['beat-ats-resume-filters', 'resume-bullet-examples'],
  },
  {
    slug: 'what-is-bha-in-food',
    title: 'What Is BHA in Food? A Plain-English Guide to the Preservative on Your Ingredient List',
    description: 'BHA shows up in everything from cereal to chips. Here\'s what it actually is, what the science says, and whether you should worry about it.',
    date: '2026-05-08',
    category: 'Health',
    keywords: ['what is BHA in food', 'BHA preservative', 'is BHA safe', 'BHA in food products'],
    toolSlug: 'food-safety',
    toolName: 'Food Safety Scanner',
    relatedSlugs: ['fda-food-recalls-explained', 'food-dyes-safety'],
  },
  {
    slug: 'food-allergens-label-reading',
    title: 'Top 10 Food Allergens in the U.S. and How to Spot Them on a Label',
    description: 'The Big 9 allergens hide under dozens of ingredient names. Learn what to look for on labels and how "contains" statements actually work.',
    date: '2026-05-08',
    category: 'Health',
    keywords: ['top food allergens', 'food allergen label reading', 'big 9 allergens', 'hidden allergens in food'],
    toolSlug: 'food-safety',
    toolName: 'Food Safety Scanner',
    relatedSlugs: ['fda-food-recalls-explained', 'what-is-bha-in-food'],
  },
  {
    slug: 'food-dyes-safety',
    title: 'Are Food Dyes Bad for You? What the Science Says About Red 40, Yellow 5, and Blue 1',
    description: 'Food dyes are in more products than you think. Here\'s what the research actually shows about their safety — and what\'s changing in 2026.',
    date: '2026-05-08',
    category: 'Health',
    keywords: ['are food dyes bad for you', 'Red 40 safety', 'food dye health effects', 'artificial food coloring'],
    toolSlug: 'food-safety',
    toolName: 'Food Safety Scanner',
    relatedSlugs: ['what-is-bha-in-food', 'food-allergens-label-reading'],
  },
  {
    slug: 'resume-bullet-examples',
    title: 'Resume Bullet Point Examples That Actually Get Interviews',
    description: 'Stop writing "responsible for" bullets. Learn the CAR framework and see 15 before-and-after examples across industries.',
    date: '2026-05-08',
    category: 'Career',
    keywords: ['resume bullet point examples', 'resume bullet points', 'how to write resume bullets', 'CAR framework resume'],
    toolSlug: 'resume-reviewer',
    toolName: 'Resume Reviewer',
    relatedSlugs: ['beat-ats-resume-filters', 'hard-skills-vs-soft-skills'],
  },
  {
    slug: 'hard-skills-vs-soft-skills',
    title: 'Hard Skills vs. Soft Skills: What Belongs on Your Resume in 2026',
    description: 'The rules have changed. AI fluency is a hard skill, and soft skills belong in your bullets, not your skills section. Here\'s the 2026 playbook.',
    date: '2026-05-08',
    category: 'Career',
    keywords: ['hard skills vs soft skills', 'resume skills section', 'what skills to put on resume', 'soft skills on resume'],
    toolSlug: 'resume-reviewer',
    toolName: 'Resume Reviewer',
    relatedSlugs: ['resume-keywords', 'resume-bullet-examples'],
  },
  {
    slug: 'get-security-deposit-back',
    title: 'How to Get Your Full Security Deposit Back: A Tenant\'s Playbook',
    description: 'A step-by-step guide from move-in photos to demand letters. Protect your deposit before, during, and after your lease.',
    date: '2026-05-08',
    category: 'Legal',
    keywords: ['how to get security deposit back', 'security deposit return', 'landlord keeping deposit', 'deposit demand letter'],
    toolSlug: 'lease-scanner',
    toolName: 'Lease Red Flag Scanner',
    relatedSlugs: ['security-deposit-laws', 'lease-red-flags'],
  },
  {
    slug: 'joint-and-several-liability',
    title: 'What Is a Joint and Several Liability Clause? (And Why It Matters for Roommates)',
    description: 'If your roommate stops paying rent, the landlord can come after you for 100% of it. Here\'s how joint and several liability works and what you can do.',
    date: '2026-05-08',
    category: 'Legal',
    keywords: ['joint and several liability lease', 'roommate liability lease', 'lease liability clause', 'roommate lease protection'],
    toolSlug: 'lease-scanner',
    toolName: 'Lease Red Flag Scanner',
    relatedSlugs: ['lease-red-flags', 'security-deposit-laws'],
  },
  {
    slug: 'natural-vs-organic-food-labels',
    title: 'What\'s the Difference Between \'Natural\' and \'Organic\'? A Buyer\'s Guide',
    description: '"Natural" sounds healthy but means almost nothing legally. Here\'s what food labels actually tell you — and what\'s just marketing.',
    date: '2026-05-08',
    category: 'Health',
    keywords: ['natural vs organic', 'organic food labels', 'what does natural mean on food', 'USDA organic certification'],
    toolSlug: 'food-safety',
    toolName: 'Food Safety Scanner',
    relatedSlugs: ['food-allergens-label-reading', 'what-is-bha-in-food'],
  },
  {
    slug: 'how-to-read-nutrition-label',
    title: 'How to Read a Nutrition Label in Under 60 Seconds',
    description: 'The 5/20 rule, the added sugar trick, and the three numbers that actually matter. A quick guide to reading nutrition labels like a pro.',
    date: '2026-05-08',
    category: 'Health',
    keywords: ['how to read nutrition label', 'nutrition facts explained', 'understanding food labels', 'nutrition label guide'],
    toolSlug: 'food-safety',
    toolName: 'Food Safety Scanner',
    relatedSlugs: ['food-allergens-label-reading', 'natural-vs-organic-food-labels'],
  },
  {
    slug: 'how-long-should-resume-be',
    title: 'How Long Should My Resume Be? The One-Page Myth, Explained',
    description: 'The one-page resume rule is outdated. Here\'s when one page, two pages, or even three pages is the right call — based on your actual career stage.',
    date: '2026-05-08',
    category: 'Career',
    keywords: ['how long should a resume be', 'one page resume', 'two page resume', 'resume length'],
    toolSlug: 'resume-reviewer',
    toolName: 'Resume Reviewer',
    relatedSlugs: ['beat-ats-resume-filters', 'how-to-write-resume-summary'],
  },
  {
    slug: 'how-to-write-resume-summary',
    title: 'How to Write a Resume Summary That Doesn\'t Sound Like Everyone Else\'s',
    description: 'Ditch "results-driven professional" forever. Here\'s a formula for writing a resume summary that actually gets read — with 10 examples by career stage.',
    date: '2026-05-08',
    category: 'Career',
    keywords: ['how to write resume summary', 'resume summary examples', 'professional summary resume', 'resume summary vs objective'],
    toolSlug: 'resume-reviewer',
    toolName: 'Resume Reviewer',
    relatedSlugs: ['resume-bullet-examples', 'how-long-should-resume-be'],
  },
  {
    slug: 'can-landlord-raise-rent-mid-lease',
    title: 'Can Your Landlord Raise Rent Mid-Lease? Know Your Rights',
    description: 'Fixed-term lease? Probably not. Month-to-month? Yes, with notice. Here\'s exactly what your landlord can and can\'t do — and what to do if they try.',
    date: '2026-05-08',
    category: 'Legal',
    keywords: ['can landlord raise rent mid lease', 'rent increase rules', 'rent control laws', 'landlord rent raise notice'],
    toolSlug: 'lease-scanner',
    toolName: 'Lease Red Flag Scanner',
    relatedSlugs: ['lease-red-flags', 'landlord-wont-make-repairs'],
  },
  {
    slug: 'landlord-wont-make-repairs',
    title: 'Your Landlord Won\'t Make Repairs. Now What?',
    description: 'From written notices to repair-and-deduct to breaking the lease — a step-by-step guide for tenants dealing with a landlord who ignores maintenance requests.',
    date: '2026-05-08',
    category: 'Legal',
    keywords: ['landlord won\'t make repairs', 'tenant repair rights', 'implied warranty of habitability', 'landlord maintenance obligations'],
    toolSlug: 'lease-scanner',
    toolName: 'Lease Red Flag Scanner',
    relatedSlugs: ['lease-red-flags', 'can-landlord-raise-rent-mid-lease'],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByTool(toolSlug: string): Article[] {
  return ARTICLES.filter((a) => a.toolSlug === toolSlug);
}

export function getRelatedArticles(article: Article): Article[] {
  return article.relatedSlugs
    .map((s) => ARTICLES.find((a) => a.slug === s))
    .filter((a): a is Article => a !== undefined);
}
