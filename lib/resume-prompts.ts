import type { ScoreResult } from "./resume-scorer";

export const RECRUITER_INTEL = `Fortune 500: 97.8% use ATS, 6-sec scan, 79% want quantified impact, 76.4% filter by skills first.`;

export const EXTRACT_KW_SYSTEM = `Extract 12-18 ATS keywords from this job description. Exact phrases as in JD. Technical skills + domain terms. No generic terms.
JSON only: {"keywords":["<phrase>"]}`;

export const makeFeedbackSystem = (kwList: string[]) => `Resume analyst. Give qualitative feedback ONLY — no score (scored separately).
KEYWORDS: ${kwList.join(", ")}
CONCISE — strings under 50 chars. Max 3 per array.
JSON only: {"eye_test":{"impression":"<short>","red_flags":["<short>"],"strengths":["<short>"]},"job_match":{"match_pct":0,"matched":["<short>"],"gaps":["<short>"],"verdict":"<short>"},"top3_fixes":["<short>","<short>","<short>"]}`;

export const makeRewriteSystem = (kwList: string[]) => `Elite resume writer. ${RECRUITER_INTEL}

STRUCTURAL RULES (will be checked by automated scorer):
1. SKILLS section: EXACTLY 10-12 items separated by " | ". Not more, not less.
2. SUMMARY: EXACTLY 2 sentences. Under 280 chars total. Must contain 3+ keywords from list.
3. BULLETS: 5-7 per role. Every bullet starts with a power verb. Every bullet contains a number. NO bullet may be truncated or incomplete.
4. Every keyword below must appear in Skills OR a bullet.
5. Section order: PROFESSIONAL SUMMARY, SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS

KEYWORDS TO INJECT (all must appear):
${kwList.map((k, i) => `${i + 1}. "${k}"`).join("\n")}

CRITICAL: Respond with ONLY a JSON object. No commentary, no explanation, no notes before or after. Start your response with { and end with }.
JSON format:
{"name":"","email":"","phone":"","location":"","linkedin":"","summary":"<2 sentences, <280 chars, 3+ keywords>","skills":["<exactly 10-12 items>"],"experience":[{"title":"","company":"","dates":"","bullets":["<5-7, verb+action+number, no truncation>"]}],"education":[{"degree":"","school":"","year":""}],"certifications":[],"changes":["<change>"]}`;

export const makeBoostSystem = (kwList: string[], scoreBreakdown: ScoreResult, target = 90) => `Resume BOOST. Current score: ${scoreBreakdown.total}/100. Need ${target}+.

EXACT ISSUES TO FIX (automated scorer found these):
${scoreBreakdown.summary.issues.map(i => `SUMMARY: ${i}`).join("\n")}
${scoreBreakdown.skills.issues.map(i => `SKILLS: ${i}`).join("\n")}
${scoreBreakdown.bullets.issues.map(i => `BULLETS: ${i}`).join("\n")}
${scoreBreakdown.format.issues.map(i => `FORMAT: ${i}`).join("\n")}
MISSING KEYWORDS: ${scoreBreakdown.ats.missing.join(", ")}

FIX EVERY ISSUE:
- Skills must be EXACTLY 10-12 items
- Summary must be <280 chars, exactly 2 sentences
- Every bullet must end with a period and contain a number
- Every missing keyword must be added to Skills or a bullet
- No truncated bullets

KEYWORDS: ${kwList.map((k, i) => `${i + 1}."${k}"`).join(", ")}

CRITICAL: Respond with ONLY a JSON object. No commentary. Start with { end with }.
Format: {"name":"","email":"","phone":"","location":"","linkedin":"","summary":"","skills":[],"experience":[{"title":"","company":"","dates":"","bullets":[]}],"education":[{"degree":"","school":"","year":""}],"certifications":[],"changes":["<fix>"]}`;

export interface CompanyTools {
  name: string;
  tools: string;
}

export const COMPANY_TOOLS: Record<string, CompanyTools> = {
  microsoft: { name: "Microsoft", tools: "Bug tracking & project management: Azure DevOps (Azure Boards, Azure Repos, Azure Pipelines). Formerly Team Foundation Server (TFS) / Visual Studio Team Services (VSTS). Test management: Azure Test Plans (in Visual Studio). Source control: Git via Azure Repos or GitHub. CI/CD: Azure Pipelines. Cloud: Microsoft Azure. IDE: Visual Studio, VS Code. Collaboration: Microsoft Teams, SharePoint, Outlook. Office suite: Microsoft 365. NOT Jira, NOT Slack, NOT Google Workspace." },
  google: { name: "Google / Alphabet", tools: "Bug tracking: Google Issue Tracker (Buganizer). Project management: internal tools. Source control: Piper (internal monorepo), Git (external). CI/CD: Blaze/Bazel build system. Cloud: Google Cloud Platform (GCP). IDE: IntelliJ-based tools, VS Code. Collaboration: Google Workspace (Gmail, Docs, Sheets, Meet, Chat). Languages: Go, Python, Java, C++, TypeScript. NOT Azure, NOT Jira, NOT Microsoft Office." },
  amazon: { name: "Amazon / AWS", tools: "Bug tracking & project management: internal tools (Sims, Pipelines). Source control: Brazil/Git (internal), CodeCommit. CI/CD: AWS CodePipeline, CodeBuild, CodeDeploy. Cloud: Amazon Web Services (AWS). Testing: internal frameworks. Collaboration: Amazon Chime, Slack (acquired). Languages: Java, Python, TypeScript. NOT Azure, NOT Google Cloud, NOT Jira." },
  apple: { name: "Apple", tools: "Bug tracking: Radar (internal). Source control: Git. IDE: Xcode. CI/CD: Xcode Cloud, internal build systems. Languages: Swift, Objective-C, Python, C++. Collaboration: internal tools, Slack. Testing: XCTest, XCUITest. NOT Azure DevOps, NOT Jira, NOT Android Studio." },
  meta: { name: "Meta / Facebook", tools: "Bug tracking: internal tools (Phabricator-derived). Source control: Mercurial (internal monorepo), Git. CI/CD: Buck build system. IDE: VS Code, internal tools. Languages: Hack (PHP derivative), Python, C++, Rust, React/JavaScript. Collaboration: Workplace by Meta, internal Messenger. Testing: Jest, internal frameworks. Cloud: internal infrastructure + some AWS. NOT Azure, NOT Google Cloud, NOT Jira." },
  netflix: { name: "Netflix", tools: "Cloud: AWS (primary). CI/CD: Spinnaker (Netflix open-source), Jenkins. Source control: Git/GitHub. Languages: Java, Python, Node.js, Kotlin. Monitoring: Atlas, internal tools. Collaboration: Slack, Google Workspace. Testing: Chaos Monkey, internal QA frameworks." },
  nvidia: { name: "NVIDIA", tools: "Languages: C, C++, CUDA, Python. IDE: Visual Studio, VS Code, Nsight. GPU tools: CUDA Toolkit, Nsight Systems, Nsight Graphics. CI/CD: Jenkins, GitLab CI. Source control: Git/Perforce. Collaboration: Microsoft Teams, Slack." },
  nintendo: { name: "Nintendo", tools: "Game engines: proprietary Nintendo SDK, Unity (third-party). Languages: C++, C. Testing: Mario Club (QA subsidiary), internal proprietary tools. Hardware: proprietary dev kits. Distribution: internal FTP/VPN systems, proprietary submission and tracking databases. Source control: Perforce, SVN, Git. Collaboration: internal systems. NOT Jira, NOT Azure DevOps." },
  tesla: { name: "Tesla", tools: "Languages: Python, C++, C. CI/CD: internal tools. Source control: Git. Cloud: internal + AWS. Collaboration: Slack. Hardware: custom silicon, internal firmware tools. NOT Azure, NOT Google Cloud." },
  salesforce: { name: "Salesforce", tools: "Platform: Salesforce Platform (Apex, Lightning, Visualforce). Bug tracking: Jira, GUS (internal). Source control: Git/GitHub. CI/CD: Salesforce DX, Jenkins. Cloud: Salesforce Cloud, Heroku, AWS. Languages: Apex, Java, JavaScript, Python. Collaboration: Slack (owned by Salesforce). Testing: Apex Test Framework, Selenium." },
  oracle: { name: "Oracle", tools: "Bug tracking: Jira, internal tools. Languages: Java, PL/SQL, Python, C/C++. Database: Oracle Database, MySQL. Cloud: Oracle Cloud Infrastructure (OCI). IDE: JDeveloper, IntelliJ, VS Code. CI/CD: Jenkins, internal build systems." },
  ibm: { name: "IBM", tools: "Cloud: IBM Cloud. AI: Watson. Languages: Java, Python, Go, Node.js. CI/CD: IBM UrbanCode, Jenkins. Source control: Git/GitHub Enterprise. Project management: Jira, IBM Rational tools. Collaboration: IBM Verse, Slack." },
  intel: { name: "Intel", tools: "Languages: C, C++, Assembly, Python. IDE: Intel oneAPI, Visual Studio. Build: CMake, Make, internal build systems. Source control: Git, Gerrit. CI/CD: Jenkins, internal. Testing: internal validation frameworks. Collaboration: Microsoft Teams." },
  adobe: { name: "Adobe", tools: "Languages: C++, Java, JavaScript/TypeScript. Cloud: AWS, Adobe Experience Platform. CI/CD: Jenkins, GitHub Actions. Source control: Git/GitHub. Collaboration: Slack, Adobe workspaces. Products: Creative Cloud SDK, Experience Platform." },
  uber: { name: "Uber", tools: "Languages: Go, Java, Python, Node.js. CI/CD: internal (Piper), BuildKite. Source control: Git. Cloud: Google Cloud, internal. Collaboration: Slack. Testing: internal frameworks. Monitoring: M3, Jaeger." },
  airbnb: { name: "Airbnb", tools: "Languages: Ruby, Java, JavaScript/React. Cloud: AWS. CI/CD: internal tools, BuildKite. Source control: Git/GitHub. Collaboration: Slack. Design: internal design system (DLS). Testing: Jest, Enzyme, internal." },
  spotify: { name: "Spotify", tools: "Languages: Java, Python, JavaScript/TypeScript. Cloud: Google Cloud Platform (GCP). CI/CD: internal (Backstage, open-sourced). Source control: Git/GitHub. Collaboration: Slack, Google Workspace. Testing: internal frameworks." },
  jpmorgan: { name: "JPMorgan Chase", tools: "Languages: Java, Python, C++. Cloud: internal + AWS + Azure. CI/CD: Jenkins, internal. Source control: Git, Bitbucket. Project management: Jira, Confluence. Collaboration: Symphony (financial chat), Microsoft Teams. Compliance: internal regulatory tools." },
  goldman: { name: "Goldman Sachs", tools: "Languages: Java, Python, Slang (internal). Platform: SecDB (internal). Cloud: internal + AWS. CI/CD: internal build systems. Collaboration: Symphony, Microsoft Teams. Source control: Git." },
  deloitte: { name: "Deloitte", tools: "Cloud: Azure, AWS, GCP (all three). Project management: Jira, ServiceNow. Collaboration: Microsoft Teams, Outlook. Languages: Java, Python, .NET, JavaScript. CI/CD: Jenkins, Azure DevOps." },
  accenture: { name: "Accenture", tools: "Cloud: AWS, Azure, GCP (all three — client dependent). Project management: Jira, ServiceNow. Collaboration: Microsoft Teams. Languages: Java, .NET, Python, JavaScript. CI/CD: Jenkins, Azure DevOps, GitHub Actions." },
  boeing: { name: "Boeing", tools: "Languages: C, C++, Ada, Python, MATLAB. Requirements: IBM DOORS. Project management: Jira, MS Project. Source control: Git, ClearCase. CI/CD: Jenkins, internal. Collaboration: Microsoft Teams, Outlook. Compliance: DO-178C aviation standards." },
  lockheed: { name: "Lockheed Martin", tools: "Languages: C, C++, Ada, Java. Requirements: IBM DOORS. Project management: Jira, MS Project. Source control: Git, ClearCase. Collaboration: Microsoft Teams. Compliance: CMMI Level 5, DO-178C." },
  walmart: { name: "Walmart", tools: "Cloud: Azure (Walmart Cloud), internal. Languages: Java, Node.js, React. CI/CD: internal (OneOps), Jenkins. Source control: Git/GitHub. Collaboration: Microsoft Teams, Slack. NOT AWS (competitor)." },
  disney: { name: "Disney / Walt Disney Company", tools: "Cloud: AWS, GCP. Languages: Java, Python, JavaScript/TypeScript. CI/CD: Jenkins, GitHub Actions. Source control: Git/GitHub. Collaboration: Slack. Streaming: internal media pipeline tools." },
  target: { name: "Target", tools: "Cloud: GCP (primary), internal. Languages: Java, Kotlin, JavaScript/React. CI/CD: Drone CI, internal. Source control: Git/GitHub. Project management: Jira. Collaboration: Slack." },
  costco: { name: "Costco", tools: "Cloud: Azure. Languages: Java, .NET, JavaScript. Project management: internal tools. Collaboration: Microsoft Teams, Outlook." },
  unitedhealth: { name: "UnitedHealth Group / Optum", tools: "Cloud: Azure, AWS. Languages: Java, .NET, Python. EHR: Epic, Cerner. Project management: Jira. Collaboration: Microsoft Teams. CI/CD: Jenkins, Azure DevOps." },
  kaiser: { name: "Kaiser Permanente", tools: "EHR: Epic. Cloud: AWS, internal. Languages: Java, Python, .NET. Collaboration: Microsoft Teams. Project management: Jira, ServiceNow." },
  johnson: { name: "Johnson & Johnson", tools: "Cloud: AWS, Azure. Languages: Python, R, Java. Compliance: GxP validation. Project management: Jira, ServiceNow. Collaboration: Microsoft Teams." },
  pfizer: { name: "Pfizer", tools: "Cloud: AWS. Languages: Python, R, SAS. Compliance: GxP, 21 CFR Part 11. Project management: Jira. Collaboration: Microsoft Teams, Webex." },
  visa: { name: "Visa", tools: "Languages: Java, C++, Python. Cloud: internal + AWS. CI/CD: Jenkins, internal. Source control: Git. Collaboration: Microsoft Teams. Compliance: PCI-DSS." },
  mastercard: { name: "Mastercard", tools: "Languages: Java, Scala, Python. Cloud: internal + AWS + GCP. CI/CD: Jenkins, Spinnaker. Source control: Git/GitHub. Collaboration: Microsoft Teams, Slack." },
  cisco: { name: "Cisco", tools: "Languages: C, C++, Python, Go. Cloud: internal + AWS. CI/CD: Jenkins, internal. Source control: Git. Collaboration: Webex (owned by Cisco). Project management: Jira." },
  att: { name: "AT&T", tools: "Cloud: Azure (primary partner). Languages: Java, Python, Go. CI/CD: Jenkins, Azure DevOps. Collaboration: Microsoft Teams. Project management: Jira, ServiceNow." },
  verizon: { name: "Verizon", tools: "Cloud: AWS. Languages: Java, Python, JavaScript. CI/CD: Jenkins. Project management: Jira, ServiceNow. Collaboration: Microsoft Teams, Slack." },
  comcast: { name: "Comcast / NBCUniversal", tools: "Cloud: AWS. Languages: Java, Python, JavaScript/React. CI/CD: Jenkins, internal. Collaboration: Slack, Microsoft Teams. Streaming: internal Peacock platform tools." },
  stripe: { name: "Stripe", tools: "Languages: Ruby, Go, Java, JavaScript/TypeScript. Cloud: AWS. CI/CD: internal (Pay Server). Source control: Git/GitHub. Collaboration: Slack. Testing: internal frameworks, Sorbet (type checker)." },
  coinbase: { name: "Coinbase", tools: "Languages: Go, Ruby, JavaScript/TypeScript, React. Cloud: AWS. CI/CD: BuildKite, internal. Source control: Git/GitHub. Collaboration: Slack. Testing: internal frameworks." },
  twilio: { name: "Twilio", tools: "Languages: Java, Python, JavaScript/Node.js. Cloud: AWS. CI/CD: Jenkins, BuildKite. Source control: Git/GitHub. Collaboration: Slack." },
  twitter: { name: "X (formerly Twitter)", tools: "Languages: Scala, Java, Python, JavaScript/React. Cloud: internal + GCP. CI/CD: internal (Pants build). Source control: Git/GitHub. Collaboration: Slack (historically), internal." },
  snap: { name: "Snap / Snapchat", tools: "Cloud: Google Cloud Platform (GCP). Languages: C++, Java, Python, JavaScript. CI/CD: internal. Source control: Git. Collaboration: Slack." },
  lyft: { name: "Lyft", tools: "Languages: Python, Go, JavaScript/React. Cloud: AWS. CI/CD: internal. Source control: Git/GitHub. Collaboration: Slack." },
  doordash: { name: "DoorDash", tools: "Languages: Kotlin, Python, JavaScript/React. Cloud: AWS. CI/CD: internal, Argo. Source control: Git/GitHub. Collaboration: Slack." },
  epic: { name: "Epic Games", tools: "Engine: Unreal Engine. Languages: C++, Blueprints, Python. Source control: Perforce, Git. CI/CD: internal, Jenkins. Collaboration: Slack." },
  sony: { name: "Sony / PlayStation", tools: "Languages: C, C++, Python. Engine: proprietary + Unreal/Unity. Source control: Perforce, Git. CI/CD: Jenkins, internal. Testing: internal QA frameworks. Dev kits: proprietary PlayStation dev kits." },
  ea: { name: "Electronic Arts (EA)", tools: "Engine: Frostbite (internal), Unreal. Languages: C++, Python. Source control: Perforce, Git. CI/CD: Jenkins, internal. Project management: Jira. Collaboration: Slack." },
};

export function matchCompany(input: string): CompanyTools | null {
  if (!input || input.length < 2) return null;
  const lower = input.toLowerCase().trim();
  if (COMPANY_TOOLS[lower]) return COMPANY_TOOLS[lower];
  for (const [key, val] of Object.entries(COMPANY_TOOLS)) {
    if (val.name.toLowerCase().includes(lower) || lower.includes(key) || lower.includes(val.name.toLowerCase().split(/[\/\s]/)[0])) {
      return val;
    }
  }
  return null;
}
