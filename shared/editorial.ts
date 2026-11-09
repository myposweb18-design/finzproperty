export type EditorialLanguage = "en" | "si" | "ta";

export type GuideSection = {
  heading: string;
  paragraphs: string[];
};

export type GuideCopy = {
  intro: string;
  sections: GuideSection[];
};

export type EditorialGuide = {
  kind: "guide";
  slug: string;
  topic: string;
  title: string;
  summary: string;
  readTime: string;
  copy: GuideCopy;
  sinhala?: GuideCopy;
  tamil?: GuideCopy;
};

export type EditorialUpdate = {
  kind: "update";
  slug: string;
  topic: "FinzProperty update";
  title: string;
  summary: string;
  readTime: string;
  copy: GuideCopy;
};

export type EditorialEntry = EditorialGuide | EditorialUpdate;

const buyingEnglish: GuideCopy = {
  intro:
    "A good property decision starts with a clear brief, not a rushed viewing. Write down how you expect to use the home, which locations fit your routine, and which compromises you are willing to make before comparing listings.",
  sections: [
    {
      heading: "Start with the life you are buying",
      paragraphs: [
        "Separate needs from preferences: access to work or school, a practical bedroom count, outdoor space, parking, and a monthly cost you can live with. Search /buy, /rent, or /land with those priorities visible rather than letting a polished photograph set the brief.",
      ],
    },
    {
      heading: "Compare the setting as carefully as the property",
      paragraphs: [
        "Visit at more than one time of day if you can. Notice road access, drainage, noise, water and power arrangements, nearby services, and the trip you would make every week. A lower asking price may reflect a trade-off that only becomes clear outside the viewing.",
      ],
    },
    {
      heading: "Treat every number as a starting point",
      paragraphs: [
        "An advertised price is not a valuation or a promise of future return. Compare similar properties, ask what is included, and budget separately for professional checks, repairs, moving, taxes, fees, and financing costs. Use calculators in /tools as illustrations, not approvals or legal advice.",
      ],
    },
  ],
};

const buyingSinhala: GuideCopy = {
  intro:
    "හොඳ දේපළ තීරණයක් ආරම්භ වන්නේ ඉක්මන් නැරඹීමකින් නොව පැහැදිලි අවශ්‍යතා ලැයිස්තුවකිනි. නිවස භාවිතා කරන ආකාරය, දෛනික ජීවිතයට ගැළපෙන ප්‍රදේශ, සහ පිළිගත හැකි වෙනස්කම් කලින් ලියා තබන්න.",
  sections: [
    {
      heading: "ඔබ මිලදී ගන්නේ කුමන ජීවිත රටාවක්දැයි සිතන්න",
      paragraphs: [
        "අවශ්‍යතා සහ කැමැත්ත වෙන් කරන්න: රැකියාවට හෝ පාසලට යාම, නිදන කාමර ගණන, වාහන නැවැත්වීම, සහ මාසිකව ගෙවිය හැකි වියදම. එම ප්‍රමුඛතා සමඟ /buy, /rent හෝ /land සෙවීම ආරම්භ කරන්න.",
      ],
    },
    {
      heading: "නිවස මෙන්ම අවට පරිසරයද සසඳන්න",
      paragraphs: [
        "හැකි නම් දවසේ විවිධ වේලාවල ප්‍රදේශය බලන්න. මාර්ග ප්‍රවේශය, ජලය සහ විදුලිය, ශබ්දය, ජලය බැස යාම, අවට සේවා සහ දෛනික ගමන් මාර්ගය සලකා බලන්න. අඩු මිලකට හේතුව නැරඹීමෙන් පසුව පෙනී යා හැක.",
      ],
    },
    {
      heading: "සෑම අංකයක්ම ආරම්භක තොරතුරක් ලෙස සලකන්න",
      paragraphs: [
        "දැන්වීමේ මිලක් නිල තක්සේරුවක් හෝ අනාගත ලාභයක පොරොන්දුවක් නොවේ. සමාන දේපළ සසඳා, ඇතුළත් දේ අසන්න, සහ පරීක්ෂණ, අලුත්වැඩියා, මාරුවීම, බදු, ගාස්තු සහ ණය වියදම් වෙන වෙනම සැලසුම් කරන්න.",
      ],
    },
  ],
};

const buyingTamil: GuideCopy = {
  intro:
    "நல்ல சொத்து முடிவு அவசரமான பார்வையிடலால் அல்ல, தெளிவான தேவைகளால் தொடங்குகிறது. வீட்டை எவ்வாறு பயன்படுத்துவீர்கள், உங்கள் நாளாந்த வாழ்க்கைக்கு ஏற்ற இடங்கள், ஏற்றுக்கொள்ளக்கூடிய சமரசங்கள் ஆகியவற்றை முன்கூட்டியே எழுதுங்கள்.",
  sections: [
    {
      heading: "நீங்கள் வாங்கும் வாழ்க்கையை முதலில் வரையறுக்கவும்",
      paragraphs: [
        "தேவைகளையும் விருப்பங்களையும் பிரிக்கவும்: வேலை அல்லது பள்ளிக்குச் செல்லும் வசதி, அறைகளின் எண்ணிக்கை, வாகன நிறுத்தம், மற்றும் மாதச் செலவு. அந்த முன்னுரிமைகளுடன் /buy, /rent அல்லது /land தேடலை தொடங்குங்கள்.",
      ],
    },
    {
      heading: "சொத்தைப் போலவே சுற்றுப்புறத்தையும் ஒப்பிடுங்கள்",
      paragraphs: [
        "முடிந்தால் வெவ்வேறு நேரங்களில் இடத்தைப் பாருங்கள். சாலை அணுகல், நீர் மற்றும் மின்சாரம், சத்தம், வடிகால், அருகிலுள்ள சேவைகள், வாராந்திர பயணம் ஆகியவற்றைக் கவனியுங்கள். குறைந்த விலைக்கான காரணம் பார்வையிட்ட பிறகே தெளிவாகலாம்.",
      ],
    },
    {
      heading: "ஒவ்வொரு எண்ணையும் தொடக்கத் தகவலாகக் கருதுங்கள்",
      paragraphs: [
        "விளம்பர விலை மதிப்பீடோ எதிர்கால வருமான வாக்குறுதியோ அல்ல. ஒத்த சொத்துகளை ஒப்பிட்டு, விலையில் என்ன சேர்க்கப்பட்டுள்ளது என்று கேளுங்கள். தொழில்முறை பரிசோதனை, பழுது, இடமாற்றம், வரி, கட்டணம் மற்றும் நிதிச் செலவுகளுக்குத் தனியாகத் திட்டமிடுங்கள்.",
      ],
    },
  ],
};

const rentingEnglish: GuideCopy = {
  intro:
    "A calmer rental move comes from writing down the agreement before the boxes arrive. Check the home, the costs, and the responsibilities with the owner or agent, then keep copies of what was agreed.",
  sections: [
    {
      heading: "Inspect before you commit",
      paragraphs: [
        "Check water pressure, locks, sockets, appliances, signs of damp, access, parking, and the condition of shared areas. Record existing marks with dated notes or photographs and ask who will handle repairs. Do not treat a viewing or a listing description as a substitute for your own checks.",
      ],
    },
    {
      heading: "Put the important terms in writing",
      paragraphs: [
        "The agreement should make the rent, deposit, payment timing, term, notice expectations, utilities, maintenance responsibilities, permitted occupants, and handover condition understandable. Local rules and contract remedies can depend on the circumstances, so obtain advice from a qualified professional for a dispute or unusual arrangement.",
      ],
    },
    {
      heading: "Protect your records and your money",
      paragraphs: [
        "Confirm who you are dealing with, use a traceable payment method, and keep receipts and copies of identity or property documents only where appropriate. Never send a deposit because of pressure or a promise that cannot be checked. If something feels inconsistent, pause and seek independent help.",
      ],
    },
  ],
};

const rentingSinhala: GuideCopy = {
  intro:
    "බඩු ගෙන යාමට පෙර ගිවිසුම පැහැදිලිව ලියා තැබීමෙන් කුලී මාරුවීම සන්සුන් කරගත හැක. නිවස, වියදම් සහ වගකීම් හිමිකරු හෝ නියෝජිතයා සමඟ පරීක්ෂා කර, එකඟ වූ දේවල පිටපත් තබා ගන්න.",
  sections: [
    {
      heading: "එකඟ වීමට පෙර නිවස පරීක්ෂා කරන්න",
      paragraphs: [
        "ජල පීඩනය, අගුලු, විදුලි සොකට්, උපකරණ, තෙතමනය, ප්‍රවේශය, වාහන නැවැත්වීම සහ පොදු ප්‍රදේශ බලන්න. තිබූ සීරීම් දින සඳහන් සටහන් හෝ ඡායාරූපවලින් ලියා තබා අලුත්වැඩියා කරන්නේ කවුදැයි අසන්න.",
      ],
    },
    {
      heading: "වැදගත් කොන්දේසි ලිඛිතව තබන්න",
      paragraphs: [
        "කුලිය, තැන්පතුව, ගෙවීම් වේලාව, කාලය, දැනුම්දීම, උපයෝගිතා, නඩත්තු වගකීම්, පදිංචිකරුවන් සහ භාරදීමේ තත්ත්වය පැහැදිලි විය යුතුය. නීතිමය ගැටලුවක් හෝ අසාමාන්‍ය ගිවිසුමක් සඳහා සුදුසු වෘත්තීය උපදෙස් ලබා ගන්න.",
      ],
    },
    {
      heading: "ලේඛන සහ මුදල් ආරක්ෂා කරගන්න",
      paragraphs: [
        "ඔබ ගනුදෙනු කරන්නේ කා සමඟදැයි තහවුරු කර, සොයාගත හැකි ගෙවීම් ක්‍රමයක් භාවිතා කර, රිසිට්පත් තබා ගන්න. පරීක්ෂා කළ නොහැකි පොරොන්දුවක් හෝ පීඩනයක් නිසා තැන්පතුවක් නොයවන්න.",
      ],
    },
  ],
};

const rentingTamil: GuideCopy = {
  intro:
    "பெட்டிகள் வருவதற்கு முன் ஒப்பந்தத்தைத் தெளிவாக எழுதுவது வாடகை மாற்றத்தை அமைதியாக்கும். வீடு, செலவுகள் மற்றும் பொறுப்புகளை உரிமையாளர் அல்லது முகவருடன் சரிபார்த்து, ஒப்புக்கொண்டவற்றின் நகல்களை வைத்திருங்கள்.",
  sections: [
    {
      heading: "ஒப்புக்கொள்வதற்கு முன் வீட்டைச் சரிபார்க்கவும்",
      paragraphs: [
        "நீர் அழுத்தம், பூட்டுகள், மின் இணைப்புகள், சாதனங்கள், ஈரப்பதம், அணுகல், வாகன நிறுத்தம் மற்றும் பொதுப் பகுதிகளைப் பாருங்கள். ஏற்கனவே உள்ள சேதங்களை தேதியிட்ட குறிப்புகள் அல்லது படங்களால் பதிவு செய்து, பழுதுகளை யார் செய்வார்கள் என்று கேளுங்கள்.",
      ],
    },
    {
      heading: "முக்கிய நிபந்தனைகளை எழுத்தில் வைத்திருங்கள்",
      paragraphs: [
        "வாடகை, முன்பணம், செலுத்தும் நேரம், காலம், அறிவிப்பு, பயன்பாடுகள், பராமரிப்பு, அனுமதிக்கப்பட்ட குடியிருப்போர் மற்றும் ஒப்படைக்கும் நிலை தெளிவாக இருக்க வேண்டும். தகராறு அல்லது அசாதாரண ஏற்பாட்டிற்கு தகுதியான நிபுணரிடம் ஆலோசனை பெறுங்கள்.",
      ],
    },
    {
      heading: "ஆவணங்களையும் பணத்தையும் பாதுகாக்கவும்",
      paragraphs: [
        "யாருடன் தொடர்பு கொள்கிறீர்கள் என்பதை உறுதிப்படுத்தி, கண்காணிக்கக்கூடிய கட்டண முறையைப் பயன்படுத்தி, ரசீதுகளை வைத்திருங்கள். சரிபார்க்க முடியாத வாக்குறுதி அல்லது அழுத்தம் காரணமாக முன்பணம் அனுப்பாதீர்கள்.",
      ],
    },
  ],
};

export const editorialGuides: EditorialGuide[] = [
  {
    kind: "guide",
    slug: "finding-a-property",
    topic: "Finding a property",
    title: "A better brief for finding a property",
    summary: "Turn a broad search into a shortlist you can actually compare.",
    readTime: "5 min read",
    copy: {
      intro:
        "The most useful search is not the one with the most results. It is the one that makes your trade-offs visible, so you can compare homes, apartments, land, and commercial spaces on the things that matter to you.",
      sections: [
        {
          heading: "Write the non-negotiables",
          paragraphs: [
            "Start with location, intended use, space, access, and a comfortable budget range. Keep a second list for preferences so a good compromise is not rejected for an item that can be changed later.",
          ],
        },
        {
          heading: "Search broadly, then narrow carefully",
          paragraphs: [
            "Use /buy, /rent, and /land to see the shape of the market before filtering. Save a few comparable results, revisit the map and description, and ask whether missing information is a reason to investigate rather than a reason to assume.",
          ],
        },
        {
          heading: "Make each viewing answer a question",
          paragraphs: [
            "Bring a short checklist: condition, utilities, access, documents, neighbourhood, and total cost. Notes made immediately are more useful than relying on memory after several viewings.",
          ],
        },
      ],
    },
  },
  {
    kind: "guide",
    slug: "buying-property",
    topic: "Buying",
    title: "How to research a property before buying",
    summary:
      "A practical sequence for comparing a place, its setting, and the information behind the listing.",
    readTime: "6 min read",
    copy: buyingEnglish,
    sinhala: buyingSinhala,
    tamil: buyingTamil,
  },
  {
    kind: "guide",
    slug: "property-checks",
    topic: "Checks",
    title: "The checks that make a shortlist stronger",
    summary:
      "Move from attractive listing to useful evidence before you commit time or money.",
    readTime: "5 min read",
    copy: {
      intro:
        "A listing can help you discover an opportunity, but it cannot answer every question about condition, ownership, access, or future costs. Use the first viewing to create a verification plan.",
      sections: [
        {
          heading: "Check what you can observe",
          paragraphs: [
            "Look for moisture, cracks, ventilation, water pressure, electrical condition, boundary markers, road access, and signs of previous repairs. Ask for permission before testing anything and record what you find.",
          ],
        },
        {
          heading: "Check what needs a professional",
          paragraphs: [
            "Title, survey, approvals, construction quality, and utility arrangements may need a licensed attorney, surveyor, engineer, or other qualified professional. FinzProperty can store a request for assistance, but a request is not a completed check.",
          ],
        },
        {
          heading: "Keep the trail",
          paragraphs: [
            "Save the listing URL, names, dates, documents received, questions asked, and answers given. Clear records make it easier to spot contradictions and to obtain focused advice.",
          ],
        },
      ],
    },
  },
  {
    kind: "guide",
    slug: "legal-documents",
    topic: "Documents",
    title: "Documents to discuss before a property decision",
    summary:
      "Know which questions belong with a qualified legal or technical adviser.",
    readTime: "5 min read",
    copy: {
      intro:
        "Property documents vary by the land, building, transaction, and parties involved. This guide is a conversation starter, not a legal opinion or a substitute for checking the original records.",
      sections: [
        {
          heading: "Ask for a document map",
          paragraphs: [
            "Ask what proves ownership or authority to sell or let, what describes the boundaries and access, and which approvals or certificates relate to the building. A professional can tell you which originals and searches are relevant.",
          ],
        },
        {
          heading: "Do not rely on a screenshot",
          paragraphs: [
            "Names, dates, boundaries, restrictions, and signatures need careful comparison. Keep copies securely, avoid sharing unnecessary identity information, and ask how documents will be handled.",
          ],
        },
        {
          heading: "Get advice for your circumstances",
          paragraphs: [
            "Foreign ownership, inheritance, co-ownership, leases, condominium rules, taxes, and development work can change the questions. For legal, tax, or regulatory advice, speak with a licensed professional who can review the facts.",
          ],
        },
      ],
    },
  },
  {
    kind: "guide",
    slug: "financing-a-home",
    topic: "Financing",
    title: "Plan the cost before you plan the move",
    summary:
      "Use a simple affordability picture without treating an estimate as a bank decision.",
    readTime: "5 min read",
    copy: {
      intro:
        "A property budget is wider than the advertised price. Build a range that includes recurring costs, one-off professional fees, repairs, insurance, moving, and a buffer for changes in income or timing.",
      sections: [
        {
          heading: "Separate facts from assumptions",
          paragraphs: [
            "Write down verified income and commitments separately from a hoped-for rate, future rent, or expected resale. Lenders apply their own assessment, documentation, and risk rules.",
          ],
        },
        {
          heading: "Use calculators as scenarios",
          paragraphs: [
            "A repayment illustration can show how price, deposit, rate, and term interact. It is not approval, a quote, or a guarantee that a lender will offer those terms. Avoid making a commitment from one optimistic scenario.",
          ],
        },
        {
          heading: "Ask the right professional",
          paragraphs: [
            "A bank or licensed adviser can explain current products and the documents they need. FinzProperty can record a private mortgage assistance request; it does not approve loans or collect a payment.",
          ],
        },
      ],
    },
  },
  {
    kind: "guide",
    slug: "building-or-renovating",
    topic: "Building & renovating",
    title: "A calmer way to scope a build or renovation",
    summary:
      "Turn an idea into a brief a qualified professional can respond to.",
    readTime: "6 min read",
    copy: {
      intro:
        "The first useful building conversation is about the brief, the site, and the decisions still open. A clear request helps a professional say what they can assess and what needs another specialist.",
      sections: [
        {
          heading: "Describe the project honestly",
          paragraphs: [
            "Say whether it is a new build, renovation, or extension; whether land is secured; when you might start; and what stage you have reached. Include the city or district and the work you already know you need.",
          ],
        },
        {
          heading: "Expect more than one discipline",
          paragraphs: [
            "Design, approvals, surveying, engineering, quantities, construction, and interior work may involve different qualified people. Availability and suitability must be checked for the individual project.",
          ],
        },
        {
          heading: "Keep expectations realistic",
          paragraphs: [
            "A request stored by FinzProperty is not a quote, appointment, design, or builder commitment. No provider is onboarded in the directory yet, and no fulfilment or transaction happens here.",
          ],
        },
      ],
    },
  },
  {
    kind: "guide",
    slug: "moving-home",
    topic: "Moving",
    title: "Plan the handover, not just moving day",
    summary:
      "A short checklist for leaving one place and starting well in another.",
    readTime: "4 min read",
    copy: {
      intro:
        "Moving is a chain of small deadlines. Give yourself a written handover plan so keys, utilities, documents, belongings, and access are not left to a last-minute conversation.",
      sections: [
        {
          heading: "Confirm dates and responsibilities",
          paragraphs: [
            "Write down the agreed handover date, who provides keys, what stays, meter readings, cleaning, repairs, and any access restrictions. Keep the final messages with your other records.",
          ],
        },
        {
          heading: "Pack for the first evening",
          paragraphs: [
            "Keep medication, chargers, basic tools, documents, water, and a change of clothes separate. Photograph the condition of a rental on arrival and report urgent problems promptly.",
          ],
        },
        {
          heading: "Update the practical details",
          paragraphs: [
            "Redirect important post, check service arrangements, update trusted contacts, and review security. Avoid publishing your exact new address more widely than necessary.",
          ],
        },
      ],
    },
  },
  {
    kind: "guide",
    slug: "property-maintenance",
    topic: "Maintenance",
    title: "A maintenance rhythm that prevents surprises",
    summary:
      "Notice small issues early and know when to call a qualified person.",
    readTime: "4 min read",
    copy: {
      intro:
        "Good maintenance is mostly observation and record keeping. A small recurring check can reveal moisture, leaks, pests, electrical problems, or blocked drainage before they become expensive or unsafe.",
      sections: [
        {
          heading: "Make a seasonal list",
          paragraphs: [
            "Walk the roofline, gutters, drains, doors, windows, plumbing fixtures, and visible electrical points at sensible intervals. Never open or repair a system you are not qualified to handle.",
          ],
        },
        {
          heading: "Record the change",
          paragraphs: [
            "Date the note, photograph the area, and record what happened before and after a repair. For a rental, check the agreement before arranging work and notify the owner or agent through a traceable channel.",
          ],
        },
        {
          heading: "Escalate safety issues",
          paragraphs: [
            "Gas, structural movement, exposed wiring, significant water ingress, and suspected contamination need prompt attention from an appropriate qualified professional. When in doubt, keep people away from the hazard.",
          ],
        },
      ],
    },
  },
  {
    kind: "guide",
    slug: "renting-property",
    topic: "Renting",
    title: "What to check before you sign a rental agreement",
    summary:
      "A practical checklist for the home, the terms, the payment trail, and your records.",
    readTime: "6 min read",
    copy: rentingEnglish,
    sinhala: rentingSinhala,
    tamil: rentingTamil,
  },
];

export const editorialUpdates: EditorialUpdate[] = [
  {
    kind: "update",
    slug: "a-clearer-way-to-ask-for-help",
    topic: "FinzProperty update",
    title: "A clearer way to ask FinzProperty for help",
    summary:
      "What happens when you submit a private property, service, event, or feedback request.",
    readTime: "3 min read",
    copy: {
      intro:
        "FinzProperty is a discovery portal, so some questions need a careful hand-off rather than a promise on a listing card. Our request form records the context for admin review without pretending that an external provider, lender, event, or adviser is already confirmed.",
      sections: [
        {
          heading: "Choose the closest request type",
          paragraphs: [
            "You can ask about a property or development, valuation, mortgage, professional service, a private property-match brief, an event interest, or general contact. The choice helps the internal review team understand the route.",
          ],
        },
        {
          heading: "Know what the receipt means",
          paragraphs: [
            "After submission you receive a request ID. It confirms that the portal stored your request for review; it is not an appointment, quote, provider match, reservation, loan approval, or automatic email or WhatsApp delivery.",
          ],
        },
        {
          heading: "Share only what is useful",
          paragraphs: [
            "Use the message for context and avoid unnecessary identity, financial, or document details. For legal, tax, or regulated advice, an appropriately licensed professional must review your circumstances.",
          ],
        },
      ],
    },
  },
];

export const editorialEntries: EditorialEntry[] = [
  ...editorialGuides,
  ...editorialUpdates,
];

export function getEditorialEntry(slug: string) {
  return editorialEntries.find(entry => entry.slug === slug);
}

export function getEditorialCopy(
  entry: EditorialEntry,
  language: EditorialLanguage
): GuideCopy {
  if (entry.kind === "guide") {
    if (language === "si" && entry.sinhala) return entry.sinhala;
    if (language === "ta" && entry.tamil) return entry.tamil;
  }
  return entry.copy;
}

export const guideTopics = [
  "All topics",
  ...Array.from(new Set(editorialGuides.map(guide => guide.topic))),
];
