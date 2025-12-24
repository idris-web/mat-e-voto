import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.statusChange.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.tip.deleteMany();
  await prisma.promise.deleteMany();
  await prisma.politician.deleteMany();
  await prisma.party.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.user.deleteMany();

  console.log("📝 Creating users...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@premtimet.org",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const editorPassword = await bcrypt.hash("editor123", 10);
  const editor = await prisma.user.create({
    data: {
      email: "editor@premtimet.org",
      name: "Editor",
      passwordHash: editorPassword,
      role: "EDITOR",
    },
  });

  console.log("🎨 Creating parties...");

  const parties = await Promise.all([
    prisma.party.create({
      data: {
        slug: "vv",
        name: "Lëvizja Vetëvendosje",
        nameEn: "Self-Determination Movement",
        shortName: "VV",
        color: "#FF0000",
        foundedYear: 2005,
        description: "Lëvizja Vetëvendosje është parti politike e majta në Kosovë.",
        descriptionEn: "Self-Determination Movement is a left-wing political party in Kosovo.",
        websiteUrl: "https://www.vetevendosje.org",
      },
    }),
    prisma.party.create({
      data: {
        slug: "ldk",
        name: "Lidhja Demokratike e Kosovës",
        nameEn: "Democratic League of Kosovo",
        shortName: "LDK",
        color: "#0066CC",
        foundedYear: 1989,
        description: "Lidhja Demokratike e Kosovës është parti politike qendrore në Kosovë.",
        descriptionEn: "Democratic League of Kosovo is a center political party in Kosovo.",
        websiteUrl: "https://www.ldk-ks.org",
      },
    }),
    prisma.party.create({
      data: {
        slug: "pdk",
        name: "Partia Demokratike e Kosovës",
        nameEn: "Democratic Party of Kosovo",
        shortName: "PDK",
        color: "#003399",
        foundedYear: 1999,
        description: "Partia Demokratike e Kosovës është parti politike qendrore-djathtë në Kosovë.",
        descriptionEn: "Democratic Party of Kosovo is a center-right political party in Kosovo.",
        websiteUrl: "https://www.pdk-ks.org",
      },
    }),
    prisma.party.create({
      data: {
        slug: "aak",
        name: "Aleanca për Ardhmërinë e Kosovës",
        nameEn: "Alliance for the Future of Kosovo",
        shortName: "AAK",
        color: "#FFD700",
        foundedYear: 2001,
        description: "Aleanca për Ardhmërinë e Kosovës është parti politike konservative në Kosovë.",
        descriptionEn: "Alliance for the Future of Kosovo is a conservative political party in Kosovo.",
        websiteUrl: "https://www.aak-ks.org",
      },
    }),
  ]);

  const [vv, ldk, pdk, aak] = parties;

  console.log("👤 Creating politicians...");

  const politicians = await Promise.all([
    prisma.politician.create({
      data: {
        slug: "albin-kurti",
        name: "Albin Kurti",
        partyId: vv.id,
        currentPosition: "Kryeministër i Kosovës",
        currentPositionEn: "Prime Minister of Kosovo",
        bio: "Albin Kurti është kryeministri i Kosovës dhe lideri i Lëvizjes Vetëvendosje.",
        bioEn: "Albin Kurti is the Prime Minister of Kosovo and leader of the Self-Determination Movement.",
        isActive: true,
      },
    }),
    prisma.politician.create({
      data: {
        slug: "vjosa-osmani",
        name: "Vjosa Osmani",
        partyId: vv.id,
        currentPosition: "Presidente e Kosovës",
        currentPositionEn: "President of Kosovo",
        bio: "Vjosa Osmani është presidentja e Kosovës që nga viti 2021.",
        bioEn: "Vjosa Osmani has been the President of Kosovo since 2021.",
        isActive: true,
      },
    }),
    prisma.politician.create({
      data: {
        slug: "lumir-abdixhiku",
        name: "Lumir Abdixhiku",
        partyId: ldk.id,
        currentPosition: "Kryetar i LDK-së",
        currentPositionEn: "Chairman of LDK",
        bio: "Lumir Abdixhiku është kryetari i Lidhjes Demokratike të Kosovës.",
        bioEn: "Lumir Abdixhiku is the chairman of the Democratic League of Kosovo.",
        isActive: true,
      },
    }),
    prisma.politician.create({
      data: {
        slug: "memli-krasniqi",
        name: "Memli Krasniqi",
        partyId: pdk.id,
        currentPosition: "Kryetar i PDK-së",
        currentPositionEn: "Chairman of PDK",
        bio: "Memli Krasniqi është kryetari i Partisë Demokratike të Kosovës.",
        bioEn: "Memli Krasniqi is the chairman of the Democratic Party of Kosovo.",
        isActive: true,
      },
    }),
  ]);

  const [kurti, osmani, abdixhiku, krasniqi] = politicians;

  console.log("📚 Creating topics...");

  const topics = await Promise.all([
    prisma.topic.create({ data: { slug: "ekonomia", name: "Ekonomia", nameEn: "Economy", icon: "💰" } }),
    prisma.topic.create({ data: { slug: "shendetesia", name: "Shëndetësia", nameEn: "Healthcare", icon: "🏥" } }),
    prisma.topic.create({ data: { slug: "arsimi", name: "Arsimi", nameEn: "Education", icon: "📚" } }),
    prisma.topic.create({ data: { slug: "infrastruktura", name: "Infrastruktura", nameEn: "Infrastructure", icon: "🛣️" } }),
    prisma.topic.create({ data: { slug: "siguria", name: "Siguria", nameEn: "Security", icon: "🛡️" } }),
    prisma.topic.create({ data: { slug: "drejtesia", name: "Drejtësia", nameEn: "Justice", icon: "⚖️" } }),
    prisma.topic.create({ data: { slug: "politika-e-jashtme", name: "Politika e Jashtme", nameEn: "Foreign Policy", icon: "🌍" } }),
    prisma.topic.create({ data: { slug: "energjia", name: "Energjia", nameEn: "Energy", icon: "⚡" } }),
  ]);

  const [ekonomia, shendetesia, arsimi, infrastruktura, siguria, drejtesia, politikaJashtme, energjia] = topics;

  console.log("📜 Creating promises...");

  const promises = await Promise.all([
    prisma.promise.create({
      data: {
        slug: "rritje-pagave-sektori-publik",
        summary: "Rritja e pagave në sektorin publik për 30%",
        textOriginal: "Do të rrisim pagat e sektorit publik për 30% brenda mandatit të parë.",
        textEnglish: "We will increase public sector salaries by 30% within the first term.",
        politicianId: kurti.id,
        partyId: vv.id,
        topicId: ekonomia.id,
        status: "PROMISE_KEPT",
        sourceUrl: "https://example.com/source1",
        sourceType: "CAMPAIGN_SPEECH",
        datePromised: new Date("2021-02-01"),
        context: "Premtim i bërë gjatë fushatës zgjedhore 2021.",
      },
    }),
    prisma.promise.create({
      data: {
        slug: "ndertimi-spitalit-te-ri",
        summary: "Ndërtimi i spitalit të ri universitar në Prishtinë",
        textOriginal: "Do të ndërtojmë spitalin e ri universitar me standardet më të larta europiane.",
        textEnglish: "We will build a new university hospital with the highest European standards.",
        politicianId: kurti.id,
        partyId: vv.id,
        topicId: shendetesia.id,
        status: "IN_THE_WORKS",
        sourceUrl: "https://example.com/source2",
        sourceType: "PARTY_PROGRAM",
        datePromised: new Date("2021-01-15"),
        context: "Pjesë e programit qeveritar 2021-2025.",
      },
    }),
    prisma.promise.create({
      data: {
        slug: "reforma-e-arsimit",
        summary: "Reforma gjithëpërfshirëse e sistemit arsimor",
        textOriginal: "Do të realizojmë reformë të plotë të sistemit arsimor brenda 2 viteve.",
        textEnglish: "We will implement a complete reform of the education system within 2 years.",
        politicianId: kurti.id,
        partyId: vv.id,
        topicId: arsimi.id,
        status: "STALLED",
        sourceUrl: "https://example.com/source3",
        sourceType: "INTERVIEW",
        datePromised: new Date("2021-03-10"),
      },
    }),
    prisma.promise.create({
      data: {
        slug: "liberalizimi-vizave",
        summary: "Liberalizimi i vizave me BE brenda vitit të parë",
        textOriginal: "Kosova do të ketë liberalizim të vizave brenda vitit të parë të mandatit.",
        textEnglish: "Kosovo will have visa liberalization within the first year of the mandate.",
        politicianId: osmani.id,
        partyId: vv.id,
        topicId: politikaJashtme.id,
        status: "PROMISE_KEPT",
        sourceUrl: "https://example.com/source5",
        sourceType: "OFFICIAL_DOCUMENT",
        datePromised: new Date("2021-04-15"),
      },
    }),
    prisma.promise.create({
      data: {
        slug: "autostrada-prishtine-gjilan",
        summary: "Ndërtimi i autostradës Prishtinë-Gjilan",
        textOriginal: "Do të fillojmë ndërtimin e autostradës Prishtinë-Gjilan në vitin 2024.",
        textEnglish: "We will start construction of the Pristina-Gjilan highway in 2024.",
        politicianId: kurti.id,
        partyId: vv.id,
        topicId: infrastruktura.id,
        status: "NOT_YET_RATED",
        sourceUrl: "https://example.com/source6",
        sourceType: "CAMPAIGN_SPEECH",
        datePromised: new Date("2023-09-01"),
      },
    }),
    prisma.promise.create({
      data: {
        slug: "luftimi-korrupsionit",
        summary: "Luftimi i korrupsionit në të gjitha nivelet",
        textOriginal: "Do të luftojmë korrupsionin pa kompromis dhe do të sigurojmë drejtësi.",
        textEnglish: "We will fight corruption without compromise and ensure justice.",
        politicianId: krasniqi.id,
        partyId: pdk.id,
        topicId: drejtesia.id,
        status: "PROMISE_BROKEN",
        sourceUrl: "https://example.com/source9",
        sourceType: "CAMPAIGN_SPEECH",
        datePromised: new Date("2017-06-01"),
      },
    }),
    prisma.promise.create({
      data: {
        slug: "energjia-e-ripertritshme",
        summary: "Investime masive në energji të ripërtëritshme",
        textOriginal: "Do të investojmë në energji diellore dhe erës për të zvogëluar varësinë nga thëngjilli.",
        textEnglish: "We will invest in solar and wind energy to reduce dependence on coal.",
        politicianId: kurti.id,
        partyId: vv.id,
        topicId: energjia.id,
        status: "IN_THE_WORKS",
        sourceUrl: "https://example.com/source10",
        sourceType: "OFFICIAL_DOCUMENT",
        datePromised: new Date("2022-01-15"),
      },
    }),
  ]);

  console.log("🗳️ Creating VAA statements...");

  // Clear existing VAA data first
  await prisma.partyPosition.deleteMany();
  await prisma.statement.deleteMany();

  const statements = await Promise.all([
    // Economy statements (5)
    prisma.statement.create({
      data: {
        slug: "uljet-taksat-biznese-vogla",
        text: "Qeveria duhet të ulë taksat për bizneset e vogla",
        textEn: "The government should lower taxes for small businesses",
        textSr: "Vlada treba da smanji poreze za mala preduzeca",
        topicId: ekonomia.id,
        order: 1,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "paga-minimale-500-euro",
        text: "Paga minimale duhet të jetë së paku 500 euro",
        textEn: "The minimum wage should be at least 500 euros",
        textSr: "Minimalna plata treba da bude najmanje 500 evra",
        topicId: ekonomia.id,
        order: 2,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "subvencione-bujqesore",
        text: "Shteti duhet të rrisë subvencionet për bujqësinë",
        textEn: "The state should increase agricultural subsidies",
        textSr: "Drzava treba da poveca subvencije za poljoprivredu",
        topicId: ekonomia.id,
        order: 3,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "privatizimi-ndermarrjeve",
        text: "Ndërmarrjet publike duhet të privatizohen",
        textEn: "Public enterprises should be privatized",
        textSr: "Javna preduzeca treba da se privatizuju",
        topicId: ekonomia.id,
        order: 4,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "investime-te-huaja",
        text: "Kosova duhet të tërheqë më shumë investime të huaja",
        textEn: "Kosovo should attract more foreign investments",
        textSr: "Kosovo treba da privuce vise stranih investicija",
        topicId: ekonomia.id,
        order: 5,
        isActive: true,
      },
    }),

    // Healthcare statements (4)
    prisma.statement.create({
      data: {
        slug: "shendetesia-falas",
        text: "Shëndetësia duhet të jetë plotësisht falas për të gjithë qytetarët",
        textEn: "Healthcare should be completely free for all citizens",
        textSr: "Zdravstvena zastita treba da bude potpuno besplatna za sve gradjane",
        topicId: shendetesia.id,
        order: 1,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "sigurime-shendetesore-private",
        text: "Sigurimet shëndetësore private duhet të inkurajohen",
        textEn: "Private health insurance should be encouraged",
        textSr: "Privatno zdravstveno osiguranje treba podsticati",
        topicId: shendetesia.id,
        order: 2,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "spitale-rajonale",
        text: "Çdo rajon duhet të ketë spital të plotë funksional",
        textEn: "Every region should have a fully functional hospital",
        textSr: "Svaki region treba da ima potpuno funkcionalnu bolnicu",
        topicId: shendetesia.id,
        order: 3,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "mjeket-jashte-vendit",
        text: "Shteti duhet të financojë trajnimin e mjekëve jashtë vendit",
        textEn: "The state should fund training of doctors abroad",
        textSr: "Drzava treba da finansira obuku lekara u inostranstvu",
        topicId: shendetesia.id,
        order: 4,
        isActive: true,
      },
    }),

    // Education statements (4)
    prisma.statement.create({
      data: {
        slug: "universitetet-falas",
        text: "Universitetet publike duhet të jenë falas për të gjithë studentët",
        textEn: "Public universities should be free for all students",
        textSr: "Drzavni univerziteti treba da budu besplatni za sve studente",
        topicId: arsimi.id,
        order: 1,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "gjuhe-angleze-shkolla",
        text: "Gjuha angleze duhet të mësohet që nga klasa e parë",
        textEn: "English should be taught from the first grade",
        textSr: "Engleski treba da se uci od prvog razreda",
        topicId: arsimi.id,
        order: 2,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "shkollat-profesionale",
        text: "Duhet të investohet më shumë në shkollat profesionale",
        textEn: "More investment should be made in vocational schools",
        textSr: "Treba vise ulagati u strucne skole",
        topicId: arsimi.id,
        order: 3,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "bursa-studimore",
        text: "Shteti duhet të ofrojë më shumë bursa për studime jashtë vendit",
        textEn: "The state should offer more scholarships for studying abroad",
        textSr: "Drzava treba da nudi vise stipendija za studiranje u inostranstvu",
        topicId: arsimi.id,
        order: 4,
        isActive: true,
      },
    }),

    // Infrastructure statements (4)
    prisma.statement.create({
      data: {
        slug: "transport-publik",
        text: "Kosova duhet të investojë më shumë në transport publik",
        textEn: "Kosovo should invest more in public transportation",
        textSr: "Kosovo treba vise da ulaze u javni prevoz",
        topicId: infrastruktura.id,
        order: 1,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "autostrada-e-re",
        text: "Ndërtimi i autostradave të reja duhet të jetë prioritet",
        textEn: "Building new highways should be a priority",
        textSr: "Izgradnja novih autoputeva treba da bude prioritet",
        topicId: infrastruktura.id,
        order: 2,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "internet-falas",
        text: "Interneti i shpejtë duhet të jetë i disponueshëm në të gjitha fshatrat",
        textEn: "High-speed internet should be available in all villages",
        textSr: "Brzi internet treba da bude dostupan u svim selima",
        topicId: infrastruktura.id,
        order: 3,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "aeroporti-i-dyte",
        text: "Kosova ka nevojë për aeroport të dytë ndërkombëtar",
        textEn: "Kosovo needs a second international airport",
        textSr: "Kosovu je potreban drugi medjunarodni aerodrom",
        topicId: infrastruktura.id,
        order: 4,
        isActive: true,
      },
    }),

    // Security statements (4)
    prisma.statement.create({
      data: {
        slug: "anetaresimi-nato",
        text: "Kosova duhet të anëtarësohet në NATO sa më shpejt",
        textEn: "Kosovo should join NATO as soon as possible",
        textSr: "Kosovo treba da se prikljuci NATO sto pre",
        topicId: siguria.id,
        order: 1,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "ushtria-e-kosoves",
        text: "Ushtria e Kosovës duhet të forcohet me pajisje moderne",
        textEn: "The Kosovo Army should be strengthened with modern equipment",
        textSr: "Vojska Kosova treba da se ojaca modernom opremom",
        topicId: siguria.id,
        order: 2,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "policia-komunitet",
        text: "Policia duhet të ketë më shumë prezencë në komunitete",
        textEn: "Police should have more presence in communities",
        textSr: "Policija treba da bude vise prisutna u zajednicama",
        topicId: siguria.id,
        order: 3,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "kufijte-me-siguri",
        text: "Kontrolli i kufijve duhet të forcohet",
        textEn: "Border control should be strengthened",
        textSr: "Kontrola granica treba da se pojaca",
        topicId: siguria.id,
        order: 4,
        isActive: true,
      },
    }),

    // Justice statements (4)
    prisma.statement.create({
      data: {
        slug: "gjykatat-pavarur",
        text: "Gjykatat duhet të jenë më të pavarura nga politika",
        textEn: "Courts should be more independent from politics",
        textSr: "Sudovi treba da budu nezavisniji od politike",
        topicId: drejtesia.id,
        order: 1,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "lufta-korrupsionit",
        text: "Lufta kundër korrupsionit duhet të jetë prioriteti kryesor",
        textEn: "The fight against corruption should be the main priority",
        textSr: "Borba protiv korupcije treba da bude glavni prioritet",
        topicId: drejtesia.id,
        order: 2,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "denimet-me-ashpra",
        text: "Dënimet për krime të rënda duhet të jenë më të ashpra",
        textEn: "Penalties for serious crimes should be harsher",
        textSr: "Kazne za teske zlocine treba da budu strozije",
        topicId: drejtesia.id,
        order: 3,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "ndihma-juridike-falas",
        text: "Ndihma juridike falas duhet të jetë e disponueshme për të gjithë",
        textEn: "Free legal aid should be available for everyone",
        textSr: "Besplatna pravna pomoc treba da bude dostupna svima",
        topicId: drejtesia.id,
        order: 4,
        isActive: true,
      },
    }),

    // Foreign Policy statements (4)
    prisma.statement.create({
      data: {
        slug: "anetaresimi-be",
        text: "Anëtarësimi në BE duhet të jetë prioriteti kryesor i politikës së jashtme",
        textEn: "EU membership should be the main priority of foreign policy",
        textSr: "Clanstvo u EU treba da bude glavni prioritet spoljne politike",
        topicId: politikaJashtme.id,
        order: 1,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "dialogu-serbise",
        text: "Kosova duhet të vazhdojë dialogun me Serbinë",
        textEn: "Kosovo should continue dialogue with Serbia",
        textSr: "Kosovo treba da nastavi dijalog sa Srbijom",
        topicId: politikaJashtme.id,
        order: 2,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "njohjet-nderkombetare",
        text: "Shteti duhet të punojë më shumë për njohje të reja ndërkombëtare",
        textEn: "The state should work more for new international recognitions",
        textSr: "Drzava treba vise da radi na novim medjunarodnim priznanjima",
        topicId: politikaJashtme.id,
        order: 3,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "bashkepunimi-shba",
        text: "Bashkëpunimi me SHBA duhet të forcohet",
        textEn: "Cooperation with the USA should be strengthened",
        textSr: "Saradnja sa SAD treba da se ojaca",
        topicId: politikaJashtme.id,
        order: 4,
        isActive: true,
      },
    }),

    // Energy statements (4)
    prisma.statement.create({
      data: {
        slug: "energji-riperteritshme",
        text: "Kosova duhet të investojë masivisht në energji të ripërtëritshme",
        textEn: "Kosovo should invest massively in renewable energy",
        textSr: "Kosovo treba masivno da ulaze u obnovljivu energiju",
        topicId: energjia.id,
        order: 1,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "termocentrale-thengjiill",
        text: "Termocentralet me thëngjill duhet të mbyllen gradualisht",
        textEn: "Coal power plants should be gradually closed",
        textSr: "Termoelektrane na ugalj treba postepeno zatvoriti",
        topicId: energjia.id,
        order: 2,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "panele-diellore",
        text: "Qytetarët duhet të subvencionohen për instalimin e paneleve diellore",
        textEn: "Citizens should be subsidized for installing solar panels",
        textSr: "Gradjani treba da budu subvencionisani za instaliranje solarnih panela",
        topicId: energjia.id,
        order: 3,
        isActive: true,
      },
    }),
    prisma.statement.create({
      data: {
        slug: "efikasiteti-energjetik",
        text: "Efikasiteti energjetik në ndërtesa duhet të jetë detyrim ligjor",
        textEn: "Energy efficiency in buildings should be a legal requirement",
        textSr: "Energetska efikasnost u zgradama treba da bude zakonska obaveza",
        topicId: energjia.id,
        order: 4,
        isActive: true,
      },
    }),
  ]);

  console.log(`   Created ${statements.length} statements`);

  console.log("🎯 Creating party positions...");

  // Create party positions for all statements
  const positions = [
    // VV positions (left-wing, pro-EU, anti-corruption focus)
    { statementId: statements[0].id, partyId: vv.id, position: "NEUTRAL" }, // Lower taxes for small businesses
    { statementId: statements[1].id, partyId: vv.id, position: "AGREE" }, // Min wage 500
    { statementId: statements[2].id, partyId: vv.id, position: "AGREE" }, // Agricultural subsidies
    { statementId: statements[3].id, partyId: vv.id, position: "DISAGREE" }, // Privatization
    { statementId: statements[4].id, partyId: vv.id, position: "AGREE" }, // Foreign investments
    { statementId: statements[5].id, partyId: vv.id, position: "AGREE" }, // Free healthcare
    { statementId: statements[6].id, partyId: vv.id, position: "NEUTRAL" }, // Private insurance
    { statementId: statements[7].id, partyId: vv.id, position: "AGREE" }, // Regional hospitals
    { statementId: statements[8].id, partyId: vv.id, position: "AGREE" }, // Doctors abroad
    { statementId: statements[9].id, partyId: vv.id, position: "AGREE" }, // Free universities
    { statementId: statements[10].id, partyId: vv.id, position: "AGREE" }, // English from 1st grade
    { statementId: statements[11].id, partyId: vv.id, position: "AGREE" }, // Vocational schools
    { statementId: statements[12].id, partyId: vv.id, position: "AGREE" }, // Scholarships abroad
    { statementId: statements[13].id, partyId: vv.id, position: "AGREE" }, // Public transport
    { statementId: statements[14].id, partyId: vv.id, position: "NEUTRAL" }, // Highways
    { statementId: statements[15].id, partyId: vv.id, position: "AGREE" }, // Rural internet
    { statementId: statements[16].id, partyId: vv.id, position: "NEUTRAL" }, // Second airport
    { statementId: statements[17].id, partyId: vv.id, position: "AGREE" }, // NATO
    { statementId: statements[18].id, partyId: vv.id, position: "AGREE" }, // Modern army
    { statementId: statements[19].id, partyId: vv.id, position: "AGREE" }, // Community police
    { statementId: statements[20].id, partyId: vv.id, position: "AGREE" }, // Border control
    { statementId: statements[21].id, partyId: vv.id, position: "AGREE" }, // Independent courts
    { statementId: statements[22].id, partyId: vv.id, position: "AGREE" }, // Anti-corruption
    { statementId: statements[23].id, partyId: vv.id, position: "AGREE" }, // Harsher penalties
    { statementId: statements[24].id, partyId: vv.id, position: "AGREE" }, // Free legal aid
    { statementId: statements[25].id, partyId: vv.id, position: "AGREE" }, // EU priority
    { statementId: statements[26].id, partyId: vv.id, position: "NEUTRAL" }, // Serbia dialogue
    { statementId: statements[27].id, partyId: vv.id, position: "AGREE" }, // International recognition
    { statementId: statements[28].id, partyId: vv.id, position: "AGREE" }, // USA cooperation
    { statementId: statements[29].id, partyId: vv.id, position: "AGREE" }, // Renewable energy
    { statementId: statements[30].id, partyId: vv.id, position: "AGREE" }, // Close coal plants
    { statementId: statements[31].id, partyId: vv.id, position: "AGREE" }, // Solar subsidies
    { statementId: statements[32].id, partyId: vv.id, position: "AGREE" }, // Energy efficiency

    // LDK positions (center, pro-EU, pro-business)
    { statementId: statements[0].id, partyId: ldk.id, position: "AGREE" }, // Lower taxes
    { statementId: statements[1].id, partyId: ldk.id, position: "NEUTRAL" }, // Min wage 500
    { statementId: statements[2].id, partyId: ldk.id, position: "AGREE" }, // Agricultural subsidies
    { statementId: statements[3].id, partyId: ldk.id, position: "NEUTRAL" }, // Privatization
    { statementId: statements[4].id, partyId: ldk.id, position: "AGREE" }, // Foreign investments
    { statementId: statements[5].id, partyId: ldk.id, position: "NEUTRAL" }, // Free healthcare
    { statementId: statements[6].id, partyId: ldk.id, position: "AGREE" }, // Private insurance
    { statementId: statements[7].id, partyId: ldk.id, position: "AGREE" }, // Regional hospitals
    { statementId: statements[8].id, partyId: ldk.id, position: "AGREE" }, // Doctors abroad
    { statementId: statements[9].id, partyId: ldk.id, position: "NEUTRAL" }, // Free universities
    { statementId: statements[10].id, partyId: ldk.id, position: "AGREE" }, // English
    { statementId: statements[11].id, partyId: ldk.id, position: "AGREE" }, // Vocational schools
    { statementId: statements[12].id, partyId: ldk.id, position: "AGREE" }, // Scholarships
    { statementId: statements[13].id, partyId: ldk.id, position: "AGREE" }, // Public transport
    { statementId: statements[14].id, partyId: ldk.id, position: "AGREE" }, // Highways
    { statementId: statements[15].id, partyId: ldk.id, position: "AGREE" }, // Rural internet
    { statementId: statements[16].id, partyId: ldk.id, position: "AGREE" }, // Second airport
    { statementId: statements[17].id, partyId: ldk.id, position: "AGREE" }, // NATO
    { statementId: statements[18].id, partyId: ldk.id, position: "AGREE" }, // Modern army
    { statementId: statements[19].id, partyId: ldk.id, position: "AGREE" }, // Community police
    { statementId: statements[20].id, partyId: ldk.id, position: "AGREE" }, // Border control
    { statementId: statements[21].id, partyId: ldk.id, position: "AGREE" }, // Independent courts
    { statementId: statements[22].id, partyId: ldk.id, position: "AGREE" }, // Anti-corruption
    { statementId: statements[23].id, partyId: ldk.id, position: "NEUTRAL" }, // Harsher penalties
    { statementId: statements[24].id, partyId: ldk.id, position: "AGREE" }, // Free legal aid
    { statementId: statements[25].id, partyId: ldk.id, position: "AGREE" }, // EU priority
    { statementId: statements[26].id, partyId: ldk.id, position: "AGREE" }, // Serbia dialogue
    { statementId: statements[27].id, partyId: ldk.id, position: "AGREE" }, // International recognition
    { statementId: statements[28].id, partyId: ldk.id, position: "AGREE" }, // USA cooperation
    { statementId: statements[29].id, partyId: ldk.id, position: "AGREE" }, // Renewable energy
    { statementId: statements[30].id, partyId: ldk.id, position: "NEUTRAL" }, // Close coal plants
    { statementId: statements[31].id, partyId: ldk.id, position: "AGREE" }, // Solar subsidies
    { statementId: statements[32].id, partyId: ldk.id, position: "AGREE" }, // Energy efficiency

    // PDK positions (center-right, pro-business)
    { statementId: statements[0].id, partyId: pdk.id, position: "AGREE" }, // Lower taxes
    { statementId: statements[1].id, partyId: pdk.id, position: "NEUTRAL" }, // Min wage 500
    { statementId: statements[2].id, partyId: pdk.id, position: "NEUTRAL" }, // Agricultural subsidies
    { statementId: statements[3].id, partyId: pdk.id, position: "AGREE" }, // Privatization
    { statementId: statements[4].id, partyId: pdk.id, position: "AGREE" }, // Foreign investments
    { statementId: statements[5].id, partyId: pdk.id, position: "NEUTRAL" }, // Free healthcare
    { statementId: statements[6].id, partyId: pdk.id, position: "AGREE" }, // Private insurance
    { statementId: statements[7].id, partyId: pdk.id, position: "AGREE" }, // Regional hospitals
    { statementId: statements[8].id, partyId: pdk.id, position: "NEUTRAL" }, // Doctors abroad
    { statementId: statements[9].id, partyId: pdk.id, position: "DISAGREE" }, // Free universities
    { statementId: statements[10].id, partyId: pdk.id, position: "AGREE" }, // English
    { statementId: statements[11].id, partyId: pdk.id, position: "AGREE" }, // Vocational schools
    { statementId: statements[12].id, partyId: pdk.id, position: "NEUTRAL" }, // Scholarships
    { statementId: statements[13].id, partyId: pdk.id, position: "NEUTRAL" }, // Public transport
    { statementId: statements[14].id, partyId: pdk.id, position: "AGREE" }, // Highways
    { statementId: statements[15].id, partyId: pdk.id, position: "AGREE" }, // Rural internet
    { statementId: statements[16].id, partyId: pdk.id, position: "AGREE" }, // Second airport
    { statementId: statements[17].id, partyId: pdk.id, position: "AGREE" }, // NATO
    { statementId: statements[18].id, partyId: pdk.id, position: "AGREE" }, // Modern army
    { statementId: statements[19].id, partyId: pdk.id, position: "AGREE" }, // Community police
    { statementId: statements[20].id, partyId: pdk.id, position: "AGREE" }, // Border control
    { statementId: statements[21].id, partyId: pdk.id, position: "NEUTRAL" }, // Independent courts
    { statementId: statements[22].id, partyId: pdk.id, position: "AGREE" }, // Anti-corruption
    { statementId: statements[23].id, partyId: pdk.id, position: "AGREE" }, // Harsher penalties
    { statementId: statements[24].id, partyId: pdk.id, position: "NEUTRAL" }, // Free legal aid
    { statementId: statements[25].id, partyId: pdk.id, position: "AGREE" }, // EU priority
    { statementId: statements[26].id, partyId: pdk.id, position: "AGREE" }, // Serbia dialogue
    { statementId: statements[27].id, partyId: pdk.id, position: "AGREE" }, // International recognition
    { statementId: statements[28].id, partyId: pdk.id, position: "AGREE" }, // USA cooperation
    { statementId: statements[29].id, partyId: pdk.id, position: "NEUTRAL" }, // Renewable energy
    { statementId: statements[30].id, partyId: pdk.id, position: "DISAGREE" }, // Close coal plants
    { statementId: statements[31].id, partyId: pdk.id, position: "NEUTRAL" }, // Solar subsidies
    { statementId: statements[32].id, partyId: pdk.id, position: "NEUTRAL" }, // Energy efficiency

    // AAK positions (conservative, nationalist)
    { statementId: statements[0].id, partyId: aak.id, position: "AGREE" }, // Lower taxes
    { statementId: statements[1].id, partyId: aak.id, position: "DISAGREE" }, // Min wage 500
    { statementId: statements[2].id, partyId: aak.id, position: "AGREE" }, // Agricultural subsidies
    { statementId: statements[3].id, partyId: aak.id, position: "AGREE" }, // Privatization
    { statementId: statements[4].id, partyId: aak.id, position: "AGREE" }, // Foreign investments
    { statementId: statements[5].id, partyId: aak.id, position: "NEUTRAL" }, // Free healthcare
    { statementId: statements[6].id, partyId: aak.id, position: "AGREE" }, // Private insurance
    { statementId: statements[7].id, partyId: aak.id, position: "AGREE" }, // Regional hospitals
    { statementId: statements[8].id, partyId: aak.id, position: "NEUTRAL" }, // Doctors abroad
    { statementId: statements[9].id, partyId: aak.id, position: "DISAGREE" }, // Free universities
    { statementId: statements[10].id, partyId: aak.id, position: "AGREE" }, // English
    { statementId: statements[11].id, partyId: aak.id, position: "AGREE" }, // Vocational schools
    { statementId: statements[12].id, partyId: aak.id, position: "NEUTRAL" }, // Scholarships
    { statementId: statements[13].id, partyId: aak.id, position: "NEUTRAL" }, // Public transport
    { statementId: statements[14].id, partyId: aak.id, position: "AGREE" }, // Highways
    { statementId: statements[15].id, partyId: aak.id, position: "AGREE" }, // Rural internet
    { statementId: statements[16].id, partyId: aak.id, position: "AGREE" }, // Second airport
    { statementId: statements[17].id, partyId: aak.id, position: "AGREE" }, // NATO
    { statementId: statements[18].id, partyId: aak.id, position: "AGREE" }, // Modern army
    { statementId: statements[19].id, partyId: aak.id, position: "AGREE" }, // Community police
    { statementId: statements[20].id, partyId: aak.id, position: "AGREE" }, // Border control
    { statementId: statements[21].id, partyId: aak.id, position: "NEUTRAL" }, // Independent courts
    { statementId: statements[22].id, partyId: aak.id, position: "AGREE" }, // Anti-corruption
    { statementId: statements[23].id, partyId: aak.id, position: "AGREE" }, // Harsher penalties
    { statementId: statements[24].id, partyId: aak.id, position: "NEUTRAL" }, // Free legal aid
    { statementId: statements[25].id, partyId: aak.id, position: "AGREE" }, // EU priority
    { statementId: statements[26].id, partyId: aak.id, position: "DISAGREE" }, // Serbia dialogue
    { statementId: statements[27].id, partyId: aak.id, position: "AGREE" }, // International recognition
    { statementId: statements[28].id, partyId: aak.id, position: "AGREE" }, // USA cooperation
    { statementId: statements[29].id, partyId: aak.id, position: "NEUTRAL" }, // Renewable energy
    { statementId: statements[30].id, partyId: aak.id, position: "DISAGREE" }, // Close coal plants
    { statementId: statements[31].id, partyId: aak.id, position: "NEUTRAL" }, // Solar subsidies
    { statementId: statements[32].id, partyId: aak.id, position: "NEUTRAL" }, // Energy efficiency
  ];

  await prisma.partyPosition.createMany({
    data: positions,
  });

  console.log(`   Created ${positions.length} party positions`);

  console.log("📋 Creating status changes...");

  await prisma.statusChange.create({
    data: {
      promiseId: promises[0].id,
      oldStatus: "IN_THE_WORKS",
      newStatus: "PROMISE_KEPT",
      justification: "Pagat u rritën me 30% sipas ligjit të miratuar në Kuvend.",
      changedById: editor.id,
    },
  });

  console.log("📎 Creating evidence...");

  await prisma.evidence.create({
    data: {
      promiseId: promises[0].id,
      title: "Ligji për Pagat",
      description: "Ligji Nr. 08/L-180 për pagat e zyrtarëve publikë u miratua më 15 dhjetor 2022.",
      sourceUrl: "https://example.com/evidence1",
      type: "LEGISLATION",
      addedById: editor.id,
    },
  });

  console.log("💡 Creating tips...");

  await prisma.tip.create({
    data: {
      politicianName: "Albin Kurti",
      promiseText: "Premtoi hapjen e 10 fabrikave të reja brenda vitit 2024.",
      sourceUrl: "https://example.com/tip-source",
      submitterEmail: "citizen@example.com",
      additionalNotes: "Kjo u tha në tubimin në Prizren.",
      isProcessed: false,
    },
  });

  console.log("✅ Seed completed!");
  console.log("\n🔑 Login:");
  console.log("   Admin: admin@premtimet.org / admin123");
  console.log("   Editor: editor@premtimet.org / editor123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
