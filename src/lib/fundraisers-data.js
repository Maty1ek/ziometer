// Curated fundraisers that help Palestinians. We LINK OUT only — we never take
// donations in-app (that would make us a money transmitter and a single point a
// payment processor could freeze). Each entry says who it is, what it funds, and
// whether it's an established registered charity vs. an aggregator to vet.

export const FUNDRAISER_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "medical", label: "Medical" },
  { key: "food", label: "Food & water" },
  { key: "relief", label: "Emergency relief" },
  { key: "connectivity", label: "eSIMs" },
  { key: "families", label: "Families" },
];

export const FUNDRAISERS = [
  {
    name: "Palestine Children's Relief Fund (PCRF)",
    category: "medical",
    verified: true,
    verifier: "Registered 501(c)(3) nonprofit",
    blurb:
      "Provides free medical care to injured and sick children in Gaza and the West Bank, and runs on-the-ground relief in Gaza.",
    url: "https://www.pcrf.net/",
  },
  {
    name: "Medical Aid for Palestinians (MAP)",
    category: "medical",
    verified: true,
    verifier: "Registered UK charity",
    blurb: "Delivers emergency medical aid and long-term health support to Palestinians in Gaza, the West Bank, and refugee camps.",
    url: "https://www.map.org.uk/",
  },
  {
    name: "Palestine Red Crescent Society (PRCS)",
    category: "medical",
    verified: true,
    verifier: "National Red Crescent society",
    blurb: "Frontline ambulance and emergency medical services in Gaza and the West Bank.",
    url: "https://www.palestinercs.org/en/Donation",
  },
  {
    name: "Anera",
    category: "relief",
    verified: true,
    verifier: "Registered 501(c)(3) nonprofit",
    blurb: "Delivers food, medical supplies, and humanitarian relief in Gaza with a long-standing on-the-ground presence.",
    url: "https://www.anera.org/",
  },
  {
    name: "UNRWA",
    category: "relief",
    verified: true,
    verifier: "UN agency for Palestine refugees",
    blurb: "The main UN agency providing food, shelter, and services to Palestine refugees across the region.",
    url: "https://www.unrwa.org/donate",
  },
  {
    name: "Gaza Soup Kitchen",
    category: "food",
    verified: true,
    verifier: "Grassroots kitchen, widely reported",
    blurb: "Community kitchens cooking and distributing hot meals directly to displaced families inside Gaza.",
    url: "https://www.gazasoupkitchen.org/",
  },
  {
    name: "World Central Kitchen",
    category: "food",
    verified: true,
    verifier: "Registered 501(c)(3) nonprofit",
    blurb: "Large-scale meal distribution in crisis zones, including operations serving Gaza.",
    url: "https://wck.org/",
  },
  {
    name: "Middle East Children's Alliance (MECA)",
    category: "relief",
    verified: true,
    verifier: "Registered 501(c)(3) nonprofit",
    blurb: "Provides food, clean water, and medical aid to children in Gaza and the West Bank.",
    url: "https://www.mecaforpeace.org/",
  },
  {
    name: "Connecting Humanity — eSIMs for Gaza",
    category: "connectivity",
    verified: true,
    verifier: "Founded by journalist Mirna El Helbawi",
    blurb: "Sends eSIMs so people in Gaza can stay connected to family and emergency services during telecom blackouts.",
    url: "https://gazaesims.com/",
  },
  {
    name: "Operation Olive Branch",
    category: "families",
    verified: false,
    verifier: "Aggregator — vet each campaign individually",
    blurb:
      "A community-maintained directory of individual Palestinian families' fundraisers. Not a single charity — review each campaign before giving.",
    url: "https://sites.google.com/view/operationolivebranch/home",
  },
];
