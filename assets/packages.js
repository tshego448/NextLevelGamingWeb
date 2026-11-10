// Illustrative proposal packages transcribed from the supplied website. These are not final rates.
// Exposes the catalog records consumed by site.js; each object supplies identity, filtering, display, and estimate data for one package.
window.NL_PACKAGES = [
  // Solo session package and its per-person illustrative starting price.
  {
    id: "individual",
    number: "01 / SOLO",
    category: "solo",
    categoryLabel: "Solo",
    name: "Individual gaming",
    detail: "A 90-minute gaming session with standard equipment.",
    audience: "For a solo player or casual visit",
    price: 150,
    unit: "person",
    glyph: "⌘"
  },
  // Reserved-station group booking and its illustrative group starting price.
  {
    id: "friends-family",
    number: "02 / GROUP",
    category: "group",
    categoryLabel: "Group",
    name: "Friends & family",
    detail: "Two hours, reserved stations and group booking support.",
    audience: "For birthdays and small groups",
    price: 1200,
    unit: "up to 8",
    glyph: "✦"
  },
  // Supervised community session for schools, clubs, and youth groups.
  {
    id: "school-club",
    number: "03 / COMMUNITY",
    category: "community",
    categoryLabel: "Community",
    name: "School or club",
    detail: "A supervised session with tournament-style activities.",
    audience: "For schools, clubs and youth groups",
    price: 2500,
    unit: "up to 20",
    glyph: "♜"
  },
  // Organized team-building event and its illustrative group starting price.
  {
    id: "corporate",
    number: "04 / TEAM",
    category: "team",
    categoryLabel: "Team",
    name: "Corporate team-building",
    detail: "Organised challenges and event-planning support.",
    audience: "For businesses and work teams",
    price: 4500,
    unit: "up to 20",
    glyph: "⌘"
  },
  // Scheduled competitive match entry and its illustrative per-player starting price.
  {
    id: "tournament",
    number: "05 / COMPETE",
    category: "compete",
    categoryLabel: "Compete",
    name: "Tournament entry",
    detail: "Registration for scheduled matches and leaderboard play.",
    audience: "For competitive gamers",
    price: 100,
    unit: "player",
    glyph: "✦"
  }
];
