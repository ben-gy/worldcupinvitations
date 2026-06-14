// Profession "disguise kits". Each one supplies the vocabulary the invite generator
// stitches together so a football match looks like a perfectly boring work meeting.
// types     = the kind of meeting
// agenda    = fake agenda bullet points
// locations = plausible neutral "where" (never the actual stadium)

const PROFESSIONS = [
  {
    key: "swe", name: "Software Engineer", emoji: "👩‍💻",
    types: ["Sprint Planning", "Incident Post-mortem", "Architecture Sync", "Code Review", "Backlog Grooming", "Release Retro", "On-call Handover", "Tech-Debt Triage", "Deploy Window", "Pairing Session"],
    agenda: ["walk through the rollback plan", "unblock the staging deploy", "align on the migration", "triage the flaky tests", "review the latest PR", "scope the hotfix", "discuss the incident timeline"],
    locations: ["Zoom", "Google Meet", "War Room (virtual)", "Slack Huddle", "Conf Room: Kubernetes"],
  },
  {
    key: "law", name: "Lawyer", emoji: "⚖️",
    types: ["Deposition Prep", "Discovery Review", "Client Privilege Call", "Contract Redline", "Settlement Strategy", "Compliance Briefing", "Closing Checklist", "Matter Status Update"],
    agenda: ["review the latest redlines", "prep the witness", "walk through the exhibits", "align on settlement posture", "confirm the filing deadline", "review privilege log"],
    locations: ["Conf Room A", "Client Call (dial-in)", "Teams", "Boardroom"],
  },
  {
    key: "accounting", name: "Accountant", emoji: "📊",
    types: ["Quarter-End Close", "Reconciliation Review", "Audit Prep", "Variance Analysis", "Budget Forecast", "Tax Provision Sync", "Month-End Lock"],
    agenda: ["tie out the ledger", "review accruals", "finalize the forecast", "clear the open items", "walk through the variances", "confirm the journal entries"],
    locations: ["Conf Room B", "Zoom", "Finance Wing", "Teams"],
  },
  {
    key: "healthcare", name: "Doctor / Healthcare", emoji: "🩺",
    types: ["Case Review", "M&M Conference", "Care Coordination", "Grand Rounds", "Patient Handoff", "Clinical Protocol Review", "Tumor Board"],
    agenda: ["review the chart", "align on the care plan", "discuss the intake", "confirm the discharge", "review the labs", "walk the protocol"],
    locations: ["Ward Conf Room", "Telehealth", "Clinic 3", "Zoom"],
  },
  {
    key: "education", name: "Teacher / Educator", emoji: "🍎",
    types: ["Curriculum Planning", "Parent-Teacher Sync", "Department Meeting", "Grading Moderation", "Lesson Study", "Assessment Review", "Faculty Standup"],
    agenda: ["align on the rubric", "review assessment data", "plan the unit", "moderate the grades", "confirm the syllabus", "discuss the cohort"],
    locations: ["Staff Room", "Library", "Zoom", "Room 204"],
  },
  {
    key: "marketing", name: "Marketing", emoji: "📣",
    types: ["Campaign Kickoff", "Brand Review", "Content Calendar Sync", "Funnel Deep-Dive", "Launch War Room", "Creative Review", "Channel Standup"],
    agenda: ["align on messaging", "review the funnel", "approve the creative", "lock the calendar", "review channel performance", "brief the agency"],
    locations: ["Zoom", "Studio", "Brand HQ", "Google Meet"],
  },
  {
    key: "sales", name: "Sales", emoji: "💼",
    types: ["Pipeline Review", "Deal Desk", "QBR Prep", "Account Strategy", "Forecast Call", "Renewal Sync", "Territory Planning"],
    agenda: ["review the pipeline", "prep the proposal", "align on next steps", "qualify the lead", "walk the forecast", "plan the renewal"],
    locations: ["Zoom", "Sales Floor", "Client Dial-in", "Teams"],
  },
  {
    key: "consulting", name: "Consultant", emoji: "📈",
    types: ["Stakeholder Alignment", "Workstream Sync", "Findings Review", "Steering Committee", "Scoping Workshop", "Deliverable Review", "Status Readout"],
    agenda: ["align on the workstream", "review the deck", "socialize the findings", "confirm scope", "prep the steerco", "walk the recommendations"],
    locations: ["Client Site", "Zoom", "War Room", "Teams"],
  },
  {
    key: "hr", name: "HR / People", emoji: "🧑‍🤝‍🧑",
    types: ["Headcount Planning", "Performance Calibration", "Onboarding Sync", "Org Design Review", "Engagement Readout", "Policy Review", "Comp Cycle Sync"],
    agenda: ["align on calibration", "review the org chart", "discuss the survey", "plan onboarding", "walk the comp bands", "review the policy"],
    locations: ["People Team Room", "Zoom", "Conf Room C", "Teams"],
  },
  {
    key: "pm", name: "Product Manager", emoji: "🧭",
    types: ["Roadmap Review", "Discovery Sync", "Prioritization Workshop", "Launch Readiness", "Stakeholder Update", "Backlog Refinement", "Metrics Review"],
    agenda: ["align on priorities", "review the roadmap", "groom the backlog", "walk the metrics", "confirm launch criteria", "review discovery notes"],
    locations: ["Zoom", "Product Hub", "Google Meet", "War Room"],
  },
  {
    key: "design", name: "Designer", emoji: "🎨",
    types: ["Design Critique", "Usability Readout", "Component Audit", "Brand Refresh Review", "Handoff Sync", "Research Debrief", "Design System Sync"],
    agenda: ["review the prototypes", "align on the system", "walk the flows", "debrief the research", "audit the components", "prep the handoff"],
    locations: ["Figma (live)", "Studio", "Zoom", "Design Lab"],
  },
  {
    key: "finance", name: "Finance / Banking", emoji: "🏦",
    types: ["Deal Review", "Risk Committee", "Liquidity Sync", "Portfolio Review", "Earnings Prep", "Capital Planning", "Treasury Standup"],
    agenda: ["review the model", "align on exposure", "prep the deck", "walk the portfolio", "confirm the covenants", "review liquidity"],
    locations: ["Boardroom", "Zoom", "Trading Floor (quiet room)", "Teams"],
  },
  {
    key: "realestate", name: "Real Estate", emoji: "🏠",
    types: ["Listing Review", "Site Walkthrough", "Closing Coordination", "Portfolio Sync", "Investor Update", "Zoning Briefing", "Offer Strategy"],
    agenda: ["review the comps", "walk the site", "align on offers", "confirm the closing", "review the appraisal", "prep the listing"],
    locations: ["On-site", "Zoom", "Title Office", "Teams"],
  },
  {
    key: "research", name: "Researcher / Academic", emoji: "🔬",
    types: ["Lab Meeting", "Grant Strategy", "Peer Review", "Literature Sync", "Data Readout", "Thesis Committee", "Methods Workshop"],
    agenda: ["review the data", "align on the draft", "discuss methodology", "prep the grant", "walk the results", "review the citations"],
    locations: ["Lab", "Zoom", "Seminar Room", "Teams"],
  },
  {
    key: "generic", name: "Office Worker (Other)", emoji: "🗂️",
    types: ["Weekly Sync", "Status Update", "Working Session", "Alignment Call", "Touchpoint", "Standup", "Catch-up", "Deep Work Block"],
    agenda: ["review action items", "align on next steps", "walk the tracker", "confirm owners", "review the doc", "unblock the team"],
    locations: ["Zoom", "Conf Room", "Teams", "Google Meet"],
  },
];

// Shared qualifiers sprinkled in for extra corporate camouflage.
const QUALIFIERS = ["Quarterly", "Weekly", "Bi-weekly", "Cross-functional", "Urgent", "Mandatory", "Confidential", "Ad-hoc", "Priority", "Monthly", "Regional", "Global"];
