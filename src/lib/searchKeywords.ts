// Mapping kata natural ke kata kunci teknis database
export const keywordMappings: Record<string, string[]> = {
  // Gejala umum
  "bergetar": ["vibration", "getar", "bergetar", "getaran", "shaking"],
  "goyang": ["vibration", "goyang", "bergoyang", "wobble"],
  "bunyi": ["noise", "bunyi", "suara", "audio", "sound"],
  "berisik": ["noise", "berisik", "bising", "keras"],
  "panas": ["overheat", "panas", "hot", "temperature", "cooling"],
  "dingin": ["cold", "dingin", "ac", "cooling", "hvac"],
  "mati": ["stall", "mati", "dead", "tidak hidup", "won't start"],
  "tidak mau hidup": ["no start", "cranking", "starting", "ignition"],
  "susah hidup": ["hard start", "starting", "cranking"],
  "boros": ["fuel consumption", "boros", "irit", "fuel"],
  "irit": ["fuel efficiency", "irit", "hemat"],
  "asap": ["smoke", "asap", "exhaust", "emission"],
  "bocor": ["leak", "bocor", "kebocoran", "leaking"],
  "rembes": ["seepage", "rembes", "bocor halus"],
  "keras": ["hard", "keras", "stiff", "berat"],
  "berat": ["heavy", "berat", "keras", "stiff"],
  "ringan": ["light", "ringan", "loose"],
  "kendor": ["loose", "kendor", "longgar"],
  "bunyi cit": ["squeal", "cit", "squeak", "brake"],
  "bunyi duk": ["knock", "duk", "knocking", "engine"],
  "bunyi tek tek": ["clicking", "tek", "ticking"],
  "ngebul": ["smoke", "ngebul", "asap tebal"],
  "ngelitik": ["knock", "ping", "detonation", "ngelitik"],
  "brebet": ["misfire", "brebet", "tersendat"],
  "tersendat": ["hesitation", "tersendat", "stumble"],
  "ngadat": ["stall", "ngadat", "mati mendadak"],
  "ngempos": ["power loss", "ngempos", "loyo"],
  "loyo": ["weak", "loyo", "lemah", "power loss"],
  "bau": ["smell", "bau", "odor"],
  "bau gosong": ["burning smell", "gosong", "terbakar"],
  "bau bensin": ["fuel smell", "bensin", "gasoline"],
  
  // Sistem
  "mesin": ["engine", "mesin", "motor"],
  "rem": ["brake", "rem", "braking"],
  "kopling": ["clutch", "kopling"],
  "transmisi": ["transmission", "gigi", "matic"],
  "matic": ["automatic", "matic", "transmission"],
  "manual": ["manual", "transmission"],
  "power steering": ["steering", "power steering", "kemudi"],
  "kemudi": ["steering", "kemudi", "stir"],
  "ac": ["hvac", "ac", "air conditioning", "cooling"],
  "lampu": ["light", "lampu", "electrical"],
  "aki": ["battery", "aki", "accu"],
  "alternator": ["charging", "alternator", "pengisian"],
  "radiator": ["cooling", "radiator", "pendingin"],
  "kipas": ["fan", "kipas", "cooling fan"],
  "oli": ["oil", "oli", "lubricant"],
  "bensin": ["fuel", "bensin", "gasoline"],
  "solar": ["diesel", "solar", "fuel"],
  "knalpot": ["exhaust", "knalpot", "muffler"],
  "suspensi": ["suspension", "suspensi", "shock"],
  "shock": ["suspension", "shock", "damper"],
  "per": ["spring", "per", "coil"],
  "ban": ["tire", "ban", "wheel"],
  "velg": ["wheel", "velg", "rim"],
  
  // Komponen spesifik
  "sensor": ["sensor", "detector"],
  "ecu": ["ecu", "ecm", "computer", "module"],
  "injector": ["injector", "injektor", "fuel injection"],
  "busi": ["spark plug", "busi", "ignition"],
  "coil": ["ignition coil", "coil", "koil"],
  "throttle": ["throttle", "gas", "accelerator"],
  "turbo": ["turbo", "turbocharger", "boost"],
  "catalytic": ["catalytic", "converter", "cat"],
  "oxygen sensor": ["o2 sensor", "oxygen", "lambda"],
  "maf": ["maf", "mass air flow", "sensor udara"],
  "map": ["map", "manifold pressure"],
  "tps": ["tps", "throttle position"],
  "ckp": ["ckp", "crankshaft position"],
  "cmp": ["cmp", "camshaft position"],
  "abs": ["abs", "anti-lock", "brake"],
  "airbag": ["srs", "airbag", "safety"],
  
  // Kode DTC patterns
  "p0": ["P0", "powertrain", "engine"],
  "p1": ["P1", "manufacturer", "powertrain"],
  "p2": ["P2", "powertrain"],
  "b0": ["B0", "body"],
  "c0": ["C0", "chassis"],
  "u0": ["U0", "network"],
};

export function translateToKeywords(naturalQuery: string): string[] {
  const query = naturalQuery.toLowerCase();
  const words = query.split(/\s+/);
  const keywords = new Set<string>();
  
  // Always add original words
  words.forEach(word => {
    if (word.length > 2) {
      keywords.add(word);
    }
  });
  
  // Check for keyword mappings
  for (const [key, values] of Object.entries(keywordMappings)) {
    if (query.includes(key.toLowerCase())) {
      values.forEach(v => keywords.add(v.toLowerCase()));
    }
  }
  
  // Check if query looks like a DTC code (P0xxx, B0xxx, etc.)
  const dtcPattern = /[pbcuPBCU][0-9]{4}/g;
  const dtcMatches = query.match(dtcPattern);
  if (dtcMatches) {
    dtcMatches.forEach(code => keywords.add(code.toUpperCase()));
  }
  
  return Array.from(keywords);
}
