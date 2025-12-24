// Hardcoded data - no database needed

export const topics = [
  { id: "1", slug: "economy", name: "Ekonomia", nameEn: "Economy", icon: "economy" },
  { id: "2", slug: "healthcare", name: "Shëndetësia", nameEn: "Healthcare", icon: "healthcare" },
  { id: "3", slug: "education", name: "Arsimi", nameEn: "Education", icon: "education" },
  { id: "4", slug: "infrastructure", name: "Infrastruktura", nameEn: "Infrastructure", icon: "infrastructure" },
  { id: "5", slug: "security", name: "Siguria", nameEn: "Security", icon: "security" },
  { id: "6", slug: "justice", name: "Drejtësia", nameEn: "Justice", icon: "justice" },
  { id: "7", slug: "foreign-policy", name: "Politika e Jashtme", nameEn: "Foreign Policy", icon: "foreign-policy" },
  { id: "8", slug: "energy", name: "Energjia", nameEn: "Energy", icon: "energy" },
];

export const parties = [
  { id: "1", slug: "vv", name: "Lëvizja Vetëvendosje", shortName: "VV", color: "#E31E24" },
  { id: "2", slug: "ldk", name: "Lidhja Demokratike e Kosovës", shortName: "LDK", color: "#003399" },
  { id: "3", slug: "pdk", name: "Partia Demokratike e Kosovës", shortName: "PDK", color: "#FDB913" },
  { id: "4", slug: "aak", name: "Aleanca për Ardhmërinë e Kosovës", shortName: "AAK", color: "#009639" },
];

export const statements = [
  // Economy (4)
  { id: "1", slug: "eco-1", text: "Kosova duhet të ketë taksë të sheshtë për të gjitha bizneset.", textEn: "Kosovo should have a flat tax for all businesses.", topicId: "1", order: 1, isActive: true },
  { id: "2", slug: "eco-2", text: "Qeveria duhet të subvencionojë prodhuesit vendorë.", textEn: "The government should subsidize local producers.", topicId: "1", order: 2, isActive: true },
  { id: "3", slug: "eco-3", text: "Paga minimale duhet të rritet në 500 euro.", textEn: "Minimum wage should be raised to 500 euros.", topicId: "1", order: 3, isActive: true },
  { id: "4", slug: "eco-4", text: "Duhet të ulen taksat për bizneset e vogla.", textEn: "Taxes should be lowered for small businesses.", topicId: "1", order: 4, isActive: true },

  // Healthcare (4)
  { id: "5", slug: "health-1", text: "Shëndetësia duhet të jetë falas për të gjithë.", textEn: "Healthcare should be free for everyone.", topicId: "2", order: 1, isActive: true },
  { id: "6", slug: "health-2", text: "Kosova duhet të ndërtojë spitale të reja rajonale.", textEn: "Kosovo should build new regional hospitals.", topicId: "2", order: 2, isActive: true },
  { id: "7", slug: "health-3", text: "Mjekët duhet të paguhen më shumë për të ndalur emigrimin.", textEn: "Doctors should be paid more to stop emigration.", topicId: "2", order: 3, isActive: true },
  { id: "8", slug: "health-4", text: "Duhet të legalizohet mariuana për qëllime mjekësore.", textEn: "Medical marijuana should be legalized.", topicId: "2", order: 4, isActive: true },

  // Education (4)
  { id: "9", slug: "edu-1", text: "Universitetet publike duhet të jenë falas.", textEn: "Public universities should be free.", topicId: "3", order: 1, isActive: true },
  { id: "10", slug: "edu-2", text: "Mësuesit duhet të paguhen më shumë.", textEn: "Teachers should be paid more.", topicId: "3", order: 2, isActive: true },
  { id: "11", slug: "edu-3", text: "Gjuha angleze duhet të mësohet nga klasa e parë.", textEn: "English should be taught from first grade.", topicId: "3", order: 3, isActive: true },
  { id: "12", slug: "edu-4", text: "Duhet më shumë shkolla profesionale.", textEn: "More vocational schools are needed.", topicId: "3", order: 4, isActive: true },

  // Infrastructure (4)
  { id: "13", slug: "infra-1", text: "Kosova duhet të ndërtojë autostradë deri në Shqipëri.", textEn: "Kosovo should build a highway to Albania.", topicId: "4", order: 1, isActive: true },
  { id: "14", slug: "infra-2", text: "Transporti publik duhet të jetë falas në qytete.", textEn: "Public transport should be free in cities.", topicId: "4", order: 2, isActive: true },
  { id: "15", slug: "infra-3", text: "Duhet të ndërtohet hekurudhë e re.", textEn: "A new railway should be built.", topicId: "4", order: 3, isActive: true },
  { id: "16", slug: "infra-4", text: "Aeroporti i Prishtinës duhet të zgjerohet.", textEn: "Prishtina Airport should be expanded.", topicId: "4", order: 4, isActive: true },

  // Security (4)
  { id: "17", slug: "sec-1", text: "Kosova duhet të anëtarësohet në NATO.", textEn: "Kosovo should join NATO.", topicId: "5", order: 1, isActive: true },
  { id: "18", slug: "sec-2", text: "Ushtria e Kosovës duhet të forcohet.", textEn: "Kosovo's army should be strengthened.", topicId: "5", order: 2, isActive: true },
  { id: "19", slug: "sec-3", text: "Duhet më shumë polici në rrugë.", textEn: "More police on the streets are needed.", topicId: "5", order: 3, isActive: true },
  { id: "20", slug: "sec-4", text: "Kamerat e sigurisë duhet të vendosen në të gjitha qytetet.", textEn: "Security cameras should be installed in all cities.", topicId: "5", order: 4, isActive: true },

  // Justice (4)
  { id: "21", slug: "just-1", text: "Gjyqtarët duhet të zgjidhen nga populli.", textEn: "Judges should be elected by the people.", topicId: "6", order: 1, isActive: true },
  { id: "22", slug: "just-2", text: "Korrupsioni duhet të dënohet më ashpër.", textEn: "Corruption should be punished more severely.", topicId: "6", order: 2, isActive: true },
  { id: "23", slug: "just-3", text: "Duhet të krijohet gjykatë speciale kundër korrupsionit.", textEn: "A special anti-corruption court should be established.", topicId: "6", order: 3, isActive: true },
  { id: "24", slug: "just-4", text: "Procesi gjyqësor duhet të jetë më i shpejtë.", textEn: "Court proceedings should be faster.", topicId: "6", order: 4, isActive: true },

  // Foreign Policy (4)
  { id: "25", slug: "fp-1", text: "Kosova duhet të anëtarësohet në BE sa më shpejt.", textEn: "Kosovo should join the EU as soon as possible.", topicId: "7", order: 1, isActive: true },
  { id: "26", slug: "fp-2", text: "Dialogu me Serbinë duhet të vazhdojë.", textEn: "Dialogue with Serbia should continue.", topicId: "7", order: 2, isActive: true },
  { id: "27", slug: "fp-3", text: "Kosova duhet të bashkohet me Shqipërinë.", textEn: "Kosovo should unite with Albania.", topicId: "7", order: 3, isActive: true },
  { id: "28", slug: "fp-4", text: "Njohja nga Serbia nuk është e nevojshme.", textEn: "Recognition from Serbia is not necessary.", topicId: "7", order: 4, isActive: true },

  // Energy (5)
  { id: "29", slug: "energy-1", text: "Kosova duhet të investojë në energji të ripërtërishme.", textEn: "Kosovo should invest in renewable energy.", topicId: "8", order: 1, isActive: true },
  { id: "30", slug: "energy-2", text: "Termocentralet me qymyr duhet të mbyllen.", textEn: "Coal power plants should be closed.", topicId: "8", order: 2, isActive: true },
  { id: "31", slug: "energy-3", text: "Energjia diellore duhet të subvencionohet.", textEn: "Solar energy should be subsidized.", topicId: "8", order: 3, isActive: true },
  { id: "32", slug: "energy-4", text: "Çmimi i rrymës duhet të kontrollohet nga shteti.", textEn: "Electricity prices should be controlled by the state.", topicId: "8", order: 4, isActive: true },
  { id: "33", slug: "energy-5", text: "Duhet të ndërtohet termocentral i ri.", textEn: "A new power plant should be built.", topicId: "8", order: 5, isActive: true },
];

// Party positions: partyId -> statementId -> position
export const partyPositions: Record<string, Record<string, string>> = {
  // VV positions
  "1": {
    "1": "DISAGREE", "2": "AGREE", "3": "AGREE", "4": "AGREE",
    "5": "AGREE", "6": "AGREE", "7": "AGREE", "8": "NEUTRAL",
    "9": "AGREE", "10": "AGREE", "11": "AGREE", "12": "AGREE",
    "13": "AGREE", "14": "AGREE", "15": "AGREE", "16": "AGREE",
    "17": "AGREE", "18": "AGREE", "19": "NEUTRAL", "20": "NEUTRAL",
    "21": "DISAGREE", "22": "AGREE", "23": "AGREE", "24": "AGREE",
    "25": "AGREE", "26": "NEUTRAL", "27": "NEUTRAL", "28": "AGREE",
    "29": "AGREE", "30": "AGREE", "31": "AGREE", "32": "AGREE", "33": "DISAGREE",
  },
  // LDK positions
  "2": {
    "1": "NEUTRAL", "2": "AGREE", "3": "NEUTRAL", "4": "AGREE",
    "5": "AGREE", "6": "AGREE", "7": "AGREE", "8": "DISAGREE",
    "9": "NEUTRAL", "10": "AGREE", "11": "AGREE", "12": "AGREE",
    "13": "AGREE", "14": "NEUTRAL", "15": "AGREE", "16": "AGREE",
    "17": "AGREE", "18": "AGREE", "19": "AGREE", "20": "AGREE",
    "21": "DISAGREE", "22": "AGREE", "23": "AGREE", "24": "AGREE",
    "25": "AGREE", "26": "AGREE", "27": "DISAGREE", "28": "DISAGREE",
    "29": "AGREE", "30": "NEUTRAL", "31": "AGREE", "32": "NEUTRAL", "33": "NEUTRAL",
  },
  // PDK positions
  "3": {
    "1": "AGREE", "2": "AGREE", "3": "NEUTRAL", "4": "AGREE",
    "5": "NEUTRAL", "6": "AGREE", "7": "AGREE", "8": "DISAGREE",
    "9": "NEUTRAL", "10": "AGREE", "11": "AGREE", "12": "AGREE",
    "13": "AGREE", "14": "DISAGREE", "15": "AGREE", "16": "AGREE",
    "17": "AGREE", "18": "AGREE", "19": "AGREE", "20": "AGREE",
    "21": "DISAGREE", "22": "AGREE", "23": "NEUTRAL", "24": "AGREE",
    "25": "AGREE", "26": "AGREE", "27": "DISAGREE", "28": "DISAGREE",
    "29": "NEUTRAL", "30": "DISAGREE", "31": "NEUTRAL", "32": "AGREE", "33": "AGREE",
  },
  // AAK positions
  "4": {
    "1": "AGREE", "2": "AGREE", "3": "AGREE", "4": "AGREE",
    "5": "NEUTRAL", "6": "AGREE", "7": "AGREE", "8": "DISAGREE",
    "9": "NEUTRAL", "10": "AGREE", "11": "AGREE", "12": "AGREE",
    "13": "AGREE", "14": "NEUTRAL", "15": "AGREE", "16": "AGREE",
    "17": "AGREE", "18": "AGREE", "19": "AGREE", "20": "NEUTRAL",
    "21": "DISAGREE", "22": "AGREE", "23": "AGREE", "24": "AGREE",
    "25": "AGREE", "26": "NEUTRAL", "27": "NEUTRAL", "28": "NEUTRAL",
    "29": "AGREE", "30": "NEUTRAL", "31": "AGREE", "32": "AGREE", "33": "NEUTRAL",
  },
};

// Helper to get statement with topic
export function getStatementsWithTopics() {
  return statements.map(s => ({
    ...s,
    topic: topics.find(t => t.id === s.topicId)!
  }));
}

// Helper to get all positions as flat array
export function getAllPositions() {
  const positions: { statementId: string; partyId: string; position: string }[] = [];
  for (const [partyId, stmtPositions] of Object.entries(partyPositions)) {
    for (const [statementId, position] of Object.entries(stmtPositions)) {
      positions.push({ partyId, statementId, position });
    }
  }
  return positions;
}
