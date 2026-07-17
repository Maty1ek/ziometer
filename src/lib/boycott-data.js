// Boycott dataset — the heart of the scanner + list.
//
// SOURCING PRINCIPLE: every entry carries a `status` tier and a `listedBy`
// attribution. We never assert "this company funds genocide" in our own voice.
// We report *who* listed it and *why*, with a link, so the claim is theirs and
// verifiable — not ours to defend.
//
// TIERS (this distinction matters and is shown in the UI):
//   bds_consumer   — official BDS National Committee CONSUMER boycott target
//                    (the short, deliberately-focused list everyone is asked to boycott)
//   bds_divestment — official BDS DIVESTMENT / pressure target (institutions, not shoppers)
//   grassroots     — widely boycotted by grassroots campaigns, NOT an official BDS call
//   israeli_origin — Israeli company / product origin
//   disputed       — a boycott circulates but the specific link is contested or denied
//
// The official BDS consumer list is intentionally SMALL — the movement argues a
// focused list wins where a "boycott everything" list dilutes. We keep the tiers
// separate so we represent the movement accurately instead of flattening it.

export const STATUS_META = {
  bds_consumer: {
    label: "BDS boycott target",
    tone: "avoid",
    blurb: "On the official BDS consumer boycott list.",
  },
  bds_divestment: {
    label: "BDS divestment target",
    tone: "avoid",
    blurb: "An official BDS divestment/pressure target (aimed at institutions, not just shoppers).",
  },
  grassroots: {
    label: "Grassroots boycott",
    tone: "caution",
    blurb: "Widely boycotted by grassroots campaigns. NOT an official BDS consumer target.",
  },
  israeli_origin: {
    label: "Israeli company",
    tone: "caution",
    blurb: "An Israeli company or product.",
  },
  disputed: {
    label: "Disputed",
    tone: "caution",
    blurb: "A boycott circulates, but the specific connection is contested or denied.",
  },
  no_listing: {
    label: "No listing found",
    tone: "clear",
    blurb: "Not found on the boycott lists we track. Absence is not an endorsement.",
  },
};

// GS1 barcode country prefixes. A 729 prefix means the barcode was registered
// with GS1 Israel — a signal, NOT proof of where a product was made, and its
// ABSENCE means nothing (most complicit multinationals register locally).
export const GS1_PREFIXES = {
  "729": { country: "Israel", note: "Barcode registered with GS1 Israel." },
};

// The explainer shown on the list page — turns the "why so short?" question into
// content that signals we understand the movement.
export const LIST_EXPLAINER = {
  title: "Why the official list is short",
  body:
    "The BDS National Committee runs a deliberately focused consumer boycott — a handful of companies chosen for maximum pressure — because a targeted campaign wins where a “boycott everything” list loses momentum. Most giant lists circulating online are grassroots aggregations, not official BDS positions. We keep those tiers separate so you can see which is which, and decide for yourself.",
};

// The dataset. Reasons are attributed and phrased as reports, not verdicts.
export const COMPANIES = [
  // ── Official BDS consumer boycott targets ──────────────────────────────
  {
    slug: "hp",
    name: "HP (Hewlett-Packard)",
    category: "Technology",
    status: "bds_consumer",
    reason:
      "Named by the BDS movement for providing technology used by the Israeli government and military, including systems used in the occupation.",
    listedBy: [{ org: "BDS National Committee", url: "https://bdsmovement.net/get-involved/what-to-boycott" }],
    alternatives: ["Brother, Epson, Canon printers"],
    brands: ["HP", "Hewlett-Packard", "Hewlett Packard", "HP Inc", "HPE"],
  },
  {
    slug: "puma",
    name: "Puma",
    category: "Apparel",
    status: "bds_consumer",
    reason:
      "Targeted by BDS for sponsoring the Israel Football Association, which includes clubs in illegal settlements. (Puma announced it would end the sponsorship in 2024.)",
    listedBy: [{ org: "BDS National Committee", url: "https://bdsmovement.net/get-involved/what-to-boycott" }],
    alternatives: ["New Balance, ASICS, or local brands"],
    brands: ["Puma"],
  },
  {
    slug: "carrefour",
    name: "Carrefour",
    category: "Retail / Groceries",
    status: "bds_consumer",
    reason:
      "Targeted by BDS over a franchise partnership with an Israeli company operating in illegal settlements.",
    listedBy: [{ org: "BDS National Committee", url: "https://bdsmovement.net/get-involved/what-to-boycott" }],
    alternatives: ["Local independent grocers"],
    brands: ["Carrefour"],
  },
  {
    slug: "sodastream",
    name: "SodaStream",
    category: "Home / Beverages",
    status: "bds_consumer",
    reason:
      "Israeli company long targeted by BDS; previously operated a factory in an illegal settlement before relocating.",
    listedBy: [{ org: "BDS National Committee", url: "https://bdsmovement.net/get-involved/what-to-boycott" }],
    alternatives: ["Refillable bottles, other soda makers"],
    brands: ["SodaStream"],
  },
  {
    slug: "ahava",
    name: "Ahava",
    category: "Cosmetics",
    status: "bds_consumer",
    reason:
      "Israeli Dead Sea cosmetics company with production historically tied to an illegal settlement.",
    listedBy: [{ org: "BDS National Committee", url: "https://bdsmovement.net/get-involved/what-to-boycott" }],
    alternatives: ["Other natural cosmetics brands"],
    brands: ["Ahava"],
  },
  {
    slug: "axa",
    name: "AXA",
    category: "Insurance / Finance",
    status: "bds_consumer",
    reason:
      "Targeted by BDS over investments in Israeli banks financing settlement activity.",
    listedBy: [{ org: "BDS National Committee", url: "https://bdsmovement.net/get-involved/what-to-boycott" }],
    alternatives: ["Other insurers"],
    brands: ["AXA"],
  },

  // ── Official BDS divestment / pressure targets ─────────────────────────
  {
    slug: "elbit-systems",
    name: "Elbit Systems",
    category: "Arms / Defense",
    status: "bds_divestment",
    reason:
      "Israel's largest private arms company, supplying drones and weapons used in attacks on Gaza. A central BDS divestment target.",
    listedBy: [{ org: "BDS National Committee", url: "https://bdsmovement.net/get-involved/what-to-boycott" }],
    alternatives: [],
    brands: ["Elbit", "Elbit Systems"],
  },
  {
    slug: "chevron",
    name: "Chevron",
    category: "Energy",
    status: "bds_divestment",
    reason:
      "Named by BDS for extracting gas claimed by Israel from occupied Palestinian maritime areas.",
    listedBy: [{ org: "BDS National Committee", url: "https://bdsmovement.net/get-involved/what-to-boycott" }],
    alternatives: [],
    brands: ["Chevron", "Caltex", "Texaco"],
  },
  {
    slug: "barclays",
    name: "Barclays",
    category: "Finance / Banking",
    status: "bds_divestment",
    reason:
      "Targeted by BDS campaigns over holdings and financing linked to companies arming Israel.",
    listedBy: [{ org: "BDS-aligned campaigns", url: "https://bdsmovement.net" }],
    alternatives: ["Ethical banks / credit unions"],
    brands: ["Barclays", "Barclaycard"],
  },
  {
    slug: "hyundai-hd",
    name: "HD Hyundai (Hyundai Heavy Industries)",
    category: "Heavy machinery",
    status: "bds_divestment",
    reason:
      "Named by BDS over heavy machinery used in demolitions of Palestinian homes. (Note: distinct from Hyundai Motor cars.)",
    listedBy: [{ org: "BDS National Committee", url: "https://bdsmovement.net/get-involved/what-to-boycott" }],
    alternatives: [],
    brands: ["HD Hyundai", "Hyundai Heavy Industries"],
  },
  {
    slug: "volvo-group",
    name: "Volvo Group (construction equipment)",
    category: "Heavy machinery",
    status: "bds_divestment",
    reason:
      "Named over equipment used in home demolitions and settlement construction. (Refers to Volvo Group machinery.)",
    listedBy: [{ org: "BDS-aligned campaigns", url: "https://bdsmovement.net" }],
    alternatives: [],
    brands: ["Volvo Construction", "Volvo Group"],
  },

  // ── Grassroots boycotts (NOT official BDS consumer targets) ────────────
  {
    slug: "mcdonalds",
    name: "McDonald's",
    category: "Fast food",
    status: "grassroots",
    reason:
      "Boycotted after the Israeli franchise reported giving free meals to Israeli soldiers during the assault on Gaza (Oct 2023). Franchises are independently owned.",
    listedBy: [{ org: "Grassroots BDS campaigns", url: "https://bdsmovement.net" }],
    note: "The BDS National Committee has not called an official boycott of McDonald's — this is a grassroots/organic boycott.",
    alternatives: ["Local independent restaurants"],
    brands: ["McDonalds", "McDonald's"],
  },
  {
    slug: "burger-king",
    name: "Burger King",
    category: "Fast food",
    status: "grassroots",
    reason:
      "Boycotted after the Israeli franchise reportedly donated meals to Israeli soldiers. Franchises are independently owned.",
    listedBy: [{ org: "Grassroots BDS campaigns", url: "https://bdsmovement.net" }],
    note: "Grassroots boycott, not an official BDS consumer target.",
    alternatives: ["Local independent restaurants"],
    brands: ["Burger King"],
  },
  {
    slug: "starbucks",
    name: "Starbucks",
    category: "Coffee",
    status: "disputed",
    reason:
      "Widely boycotted, but the BDS National Committee states Starbucks and its owner are NOT BDS targets and have no proven investments in Israel. The grassroots boycott stems from a dispute with a workers' union over a pro-Palestine post.",
    listedBy: [{ org: "Grassroots campaigns", url: "https://bdsmovement.net" }],
    note: "BDS explicitly does NOT list Starbucks. A clear example of a grassroots boycott the official movement has distanced itself from.",
    alternatives: ["Local independent coffee shops"],
    brands: ["Starbucks"],
  },
  {
    slug: "coca-cola",
    name: "Coca-Cola",
    category: "Beverages",
    status: "grassroots",
    reason:
      "Boycotted by grassroots campaigns over a bottling plant reported to operate in an illegal settlement (Atarot).",
    listedBy: [{ org: "Grassroots BDS campaigns", url: "https://bdsmovement.net" }],
    note: "Grassroots boycott, not on the official BDS consumer list.",
    alternatives: ["Local drinks, other sodas"],
    brands: ["Coca-Cola", "Coca Cola", "Coke", "Sprite", "Fanta", "Diet Coke", "Costa Coffee", "Fuze Tea", "Powerade"],
  },
  {
    slug: "nestle",
    name: "Nestlé",
    category: "Food / Beverages",
    status: "grassroots",
    reason:
      "Boycotted by grassroots campaigns over a long-held stake in Israeli food company Osem.",
    listedBy: [{ org: "Grassroots BDS campaigns", url: "https://bdsmovement.net" }],
    note: "Grassroots boycott, not an official BDS consumer target.",
    alternatives: ["Other food brands"],
    brands: ["Nestle", "Nestlé", "Nescafe", "KitKat", "Nesquik", "Maggi", "Purina", "San Pellegrino", "Perrier"],
  },
  {
    slug: "sabra",
    name: "Sabra",
    category: "Food",
    status: "grassroots",
    reason:
      "Hummus brand co-owned by Israel's Strauss Group, which has publicly supported Israeli military units.",
    listedBy: [{ org: "Grassroots BDS campaigns", url: "https://bdsmovement.net" }],
    alternatives: ["Other hummus brands, homemade"],
    brands: ["Sabra"],
  },
  {
    slug: "wix",
    name: "Wix",
    category: "Technology",
    status: "israeli_origin",
    reason: "Israeli website-building company headquartered in Tel Aviv.",
    listedBy: [{ org: "Israeli origin", url: "" }],
    alternatives: ["Other website builders"],
    brands: ["Wix"],
  },
];

// Israeli-origin brand name hints for the scanner's origin heuristic.
export const ISRAELI_ORIGIN_HINTS = ["made in israel", "product of israel", "israel"];
