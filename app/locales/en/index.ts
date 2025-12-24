export default {
  // Navigation
  nav: {
    home: "Home",
    vaa: "Voting Advice",
    promises: "Promises",
    politicians: "Politicians",
    parties: "Parties",
    topics: "Topics",
    statistics: "Statistics",
    about: "About",
    methodology: "Methodology",
    search: "Search",
    admin: "Admin Panel",
    login: "Login",
    logout: "Logout",
  },

  // Homepage
  home: {
    title: "Premtimet",
    subtitle: "Track and verify Kosovo politicians' promises",
    heroTitle: "Holding Politicians Accountable",
    heroSubtitle:
      "We track promises made by Kosovo politicians and evaluate whether they have been kept, broken, or are in progress.",
    browsePromises: "Browse Promises",
    submitTip: "Submit a Tip",
    recentUpdates: "Recent Updates",
    featuredPromises: "Featured Promises",
    viewAll: "View All",
  },

  // Promise statuses
  status: {
    NOT_YET_RATED: "Not Yet Rated",
    IN_THE_WORKS: "In the Works",
    STALLED: "Stalled",
    COMPROMISE: "Compromise",
    PROMISE_KEPT: "Promise Kept",
    PROMISE_BROKEN: "Promise Broken",
  },

  // Statistics
  stats: {
    totalPromises: "Total Promises",
    keptPromises: "Promises Kept",
    brokenPromises: "Promises Broken",
    inProgress: "In Progress",
    stalled: "Stalled",
    compromise: "Compromises",
    notRated: "Not Rated",
    overview: "Overview",
  },

  // Common actions
  actions: {
    submit: "Submit",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    search: "Search",
    filter: "Filter",
    clearFilters: "Clear Filters",
    viewDetails: "View Details",
    share: "Share",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    confirm: "Confirm",
    create: "Create",
    update: "Update",
  },

  // Promises page
  promises: {
    title: "Political Promises",
    subtitle: "Track and verify Kosovo politicians' promises",
    searchPlaceholder: "Search promises...",
    allStatuses: "All Statuses",
    allTopics: "All Topics",
    allParties: "All Parties",
    allPoliticians: "All Politicians",
    noResults: "No promises found",
    source: "Source",
    archiveLink: "Archive Link",
    datePromised: "Date Promised",
    lastUpdated: "Last Updated",
    evidence: "Evidence",
    timeline: "Timeline",
    context: "Context",
  },

  // Politicians page
  politicians: {
    title: "Politicians",
    subtitle: "Browse politicians and their promises",
    noResults: "No politicians found",
    viewPromises: "View Promises",
    biography: "Biography",
    currentPosition: "Current Position",
  },

  // Parties page
  parties: {
    title: "Parties",
    subtitle: "Browse political parties and their promises",
    noResults: "No parties found",
    members: "Members",
    website: "Official Website",
  },

  // Topics page
  topics: {
    title: "Topics",
    subtitle: "Browse promises by topic",
    noResults: "No topics found",
  },

  // Tip submission
  tip: {
    title: "Submit a Tip",
    subtitle: "Help verify promises by submitting information",
    typeLabel: "Tip Type",
    typeNewPromise: "New Promise",
    typeEvidence: "New Evidence",
    typeCorrection: "Correction",
    typeOther: "Other",
    contentLabel: "Content",
    contentPlaceholder: "Describe your tip...",
    sourceUrlLabel: "Source URL",
    sourceUrlPlaceholder: "https://...",
    emailLabel: "Email (optional)",
    emailPlaceholder: "email@example.com",
    success: "Thank you! Your tip was submitted successfully.",
  },

  // About page
  about: {
    title: "About Premtimet",
    mission: "Our Mission",
    missionText:
      "Premtimet is an independent platform that tracks and verifies promises made by Kosovo politicians. Our goal is to increase transparency and accountability in Kosovo politics.",
    howItWorks: "How It Works",
    howItWorksText:
      "We collect promises from verifiable sources such as campaign speeches, interviews, and official documents. Each promise is rated based on documented evidence.",
    team: "Team",
    contact: "Contact",
  },

  // Methodology page
  methodology: {
    title: "Methodology",
    subtitle: "How we rate promises",
    ratingCriteria: "Rating Criteria",
    sourcesTitle: "Sources",
    sourcesText:
      "We only use verifiable and archived sources. Each promise has a link to the original source and an archived copy.",
  },

  // Auth
  auth: {
    loginTitle: "Login to your account",
    email: "Email",
    password: "Password",
    login: "Login",
    loggingIn: "Logging in...",
    invalidCredentials: "Invalid email or password",
    logoutSuccess: "Logged out successfully",
  },

  // Admin
  admin: {
    dashboard: "Dashboard",
    promises: "Promises",
    politicians: "Politicians",
    parties: "Parties",
    topics: "Topics",
    tips: "Tips",
    users: "Users",
    settings: "Settings",
    newPromise: "New Promise",
    editPromise: "Edit Promise",
    newPolitician: "New Politician",
    editPolitician: "Edit Politician",
    newParty: "New Party",
    editParty: "Edit Party",
    newTopic: "New Topic",
    editTopic: "Edit Topic",
    addEvidence: "Add Evidence",
    changeStatus: "Change Status",
    justification: "Justification",
    processed: "Processed",
    unprocessed: "Unprocessed",
  },

  // Common
  common: {
    loading: "Loading...",
    error: "An error occurred",
    notFound: "Not Found",
    pageNotFound: "Page not found",
    goHome: "Go to homepage",
    somethingWentWrong: "Something went wrong",
    tryAgain: "Try again",
  },

  // Footer
  footer: {
    rights: "All rights reserved",
    about: "About",
    methodology: "Methodology",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
  },

  // Voting Advice Application (VAA)
  vaa: {
    welcome: {
      title: "Find your party match",
      subtitle: "Answer questions to discover which party best matches your political views",
      howItWorks: "How it works",
      step1: "Answer questions",
      step1Desc: "Tell us if you agree, are neutral, or disagree with each political statement",
      step2: "Weight topics",
      step2Desc: "Mark the topics that are most important to you (optional)",
      step3: "Get results",
      step3Desc: "See which parties match your views",
      startButton: "Start Quiz",
      privacyNote: "Your answers are not saved and remain anonymous",
      estimatedTime: "About 10 minutes",
      notAvailable: "The voting advice quiz is not available yet. Please check back later.",
    },
    questionnaire: {
      progress: "Question {{current}} of {{total}}",
      agree: "Agree",
      neutral: "Neutral",
      disagree: "Disagree",
      skip: "Skip",
      markImportant: "This topic is important to me",
      previous: "Previous",
      next: "Next",
      finish: "Finish",
      cancel: "Cancel",
    },
    results: {
      title: "Your results",
      subtitle: "Based on your answers, these parties match your views",
      match: "match",
      compareAnswers: "Compare answers",
      retake: "Retake quiz",
      share: "Share results",
      noMatch: "Insufficient data for this party",
      topicBreakdown: "Topic breakdown",
      noResults: "No results",
      completeQuiz: "Please complete the questionnaire to get results.",
    },
    compare: {
      title: "Detailed comparison",
      subtitle: "Compare your answers with party positions",
      selectParties: "Select parties to compare",
      yourAnswer: "Your answer",
      statement: "Statement",
      filterByTopic: "Filter by topic",
      allTopics: "All topics",
      match: "Match",
      partial: "Partial",
      noMatch: "No match",
      noData: "No data for comparison.",
    },
    positions: {
      agree: "Agree",
      neutral: "Neutral",
      disagree: "Disagree",
      notSet: "Not set",
      skipped: "Skipped",
    },
  },
};
