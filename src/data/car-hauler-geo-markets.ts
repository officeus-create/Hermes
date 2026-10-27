export type CarHaulerGeoMarket = {
  slug: string;
  city: string;
  state: string;
  stateName: string;
  region: string;
  marketContext: string;
  nearby: string[];
  localOperatingNotes?: string[];
  officialSources?: Array<{ label: string; url: string }>;
};

export const carHaulerGeoMarkets: CarHaulerGeoMarket[] = [
  {
    slug: "colorado-springs-co",
    city: "Colorado Springs",
    state: "CO",
    stateName: "Colorado",
    region: "Front Range",
    marketContext: "Colorado Springs sits on Colorado's Front Range with practical access to Fountain, Pueblo, Denver, and Aurora. Car-hauling operators often need flexible origin-only, destination-only, and route-based searches rather than a single fixed lane.",
    nearby: ["Fountain, CO", "Pueblo, CO", "Denver, CO", "Aurora, CO"],
    localOperatingNotes: [
      "CDOT substantially completed new I-25 auxiliary lanes between Fillmore Street and Garden of the Gods Road in September 2026. For a car hauler, the useful planning question is where the truck is positioned on I-25 and what pickup window it can actually reach, not simply whether a load says Colorado Springs.",
      "CDOT's Colorado Springs–Denver South study treats I-25 between Monument and C-470 as the vital connection between the state's two largest population centers. When a local search is thin, compare Fountain/Pueblo options with northbound Denver/Aurora repositioning before accepting extra deadhead.",
      "Hermes' private operating records contain repeated origin/destination activity connecting Colorado Springs with Denver, Aurora, Fountain, Pueblo, and other Front Range points. That history is used only to improve search questions; it is not public live inventory, a current load count, or rate evidence.",
    ],
    officialSources: [
      { label: "CDOT — Colorado Springs I-25 auxiliary lanes, Sept. 2026", url: "https://www.codot.gov/news/2026/september-2026-news/coloradosprings-i25-auxiliary-lanes-complete" },
      { label: "CDOT — Colorado Springs–Denver South I-25 study", url: "https://www.codot.gov/projects/I25COSDEN" },
    ],
  },
  { slug: "puyallup-wa", city: "Puyallup", state: "WA", stateName: "Washington", region: "South Puget Sound", marketContext: "Puyallup is a useful South Puget Sound operating point for carriers working between Tacoma, Auburn, Renton, Seattle, and the broader Pierce/King County market. Search strategy should account for dense metro pickup points and route timing.", nearby: ["Tacoma, WA", "Auburn, WA", "Renton, WA", "Seattle, WA"] },
  {
    slug: "denver-co",
    city: "Denver",
    state: "CO",
    stateName: "Colorado",
    region: "Denver metro / Front Range",
    marketContext: "Denver is the central Front Range market in this launch set, connecting nearby Aurora, Commerce City, Brighton, and the I-25 corridor toward Colorado Springs. A carrier may need a mix of metro moves and longer outbound opportunities.",
    nearby: ["Aurora, CO", "Commerce City, CO", "Brighton, CO", "Colorado Springs, CO"],
    localOperatingNotes: [
      "CDOT describes I-270 between I-25 and I-70 as one of the Denver metro area's busiest and oldest freight corridors. For car-hauler planning, east/west I-70 access, north/south I-25 positioning, and the I-270 connection can change which metro pickup radius is practical.",
      "Manheim's current Colorado location directory places Manheim Denver in Aurora, east of central Denver. Treat auction and remarketing locations as independent pickup nodes to verify for gate and appointment rules — not as Hermes partners or proof that a load is available.",
      "Hermes' private operating records show repeated Denver-area origin/destination activity involving Aurora, Colorado Springs, Brighton, Fountain, and other Colorado points. We use those historical patterns to ask better radius and direction questions without exposing customers, rates, contacts, or claiming current availability.",
    ],
    officialSources: [
      { label: "CDOT — I-270 freight-corridor decision, Sept. 2026", url: "https://www.codot.gov/news/2026/september-2026-news/final-eis-rod-i270-corridor-improvements-project-published" },
      { label: "Manheim — Colorado locations / Manheim Denver", url: "https://site.manheim.com/en/states/colorado" },
    ],
  },
  { slug: "springfield-mo", city: "Springfield", state: "MO", stateName: "Missouri", region: "Southwest Missouri", marketContext: "Springfield anchors the southwest Missouri portion of this carrier-intake cluster, with nearby Rogersville and practical connections toward Kansas City and St. Louis. Operators may need both regional reloads and longer-haul options.", nearby: ["Rogersville, MO", "Kansas City, MO/KS", "St. Louis, MO"] },
  { slug: "aurora-co", city: "Aurora", state: "CO", stateName: "Colorado", region: "Denver metro / Front Range", marketContext: "Aurora gives carriers an eastern Denver-metro search point with quick access to Denver, Commerce City, Brighton, and the southbound Front Range. It is useful for building a broader metro search rather than relying on one pickup ZIP.", nearby: ["Denver, CO", "Commerce City, CO", "Brighton, CO", "Colorado Springs, CO"] },
  {
    slug: "kansas-city-mo-ks",
    city: "Kansas City",
    state: "MO/KS",
    stateName: "Missouri / Kansas",
    region: "Kansas City metro",
    marketContext: "Kansas City spans both Missouri and Kansas, so carrier search should treat the metro as one operating market while still respecting pickup state, ZIP, broker rules, and delivery details.",
    nearby: ["Topeka, KS", "Springfield, MO", "St. Louis, MO"],
    localOperatingNotes: [
      "MoDOT's Kansas City District Freight Plan identifies a dense highway network that includes I-29, I-35, I-49, I-70, I-435, I-470, I-635, and I-670. A Kansas City car-hauler search should therefore record the truck's actual side of the state line and intended outbound direction before widening the radius.",
      "Both Manheim Kansas City and ADESA Kansas City publish current auction/gate information in the metro. These are independent vehicle-market nodes; verify each location's current access rules before dispatch and never treat the listing as a Hermes affiliation or a guaranteed load source.",
      "Hermes' private operating records contain repeated Kansas City origin/destination activity toward Missouri, Kansas, and Illinois markets, including St. Louis/Springfield and Chicago-area patterns. The history guides corridor research only and is not exposed as live load inventory or customer/rate data.",
    ],
    officialSources: [
      { label: "MoDOT — Kansas City District Freight Plan", url: "https://www.modot.org/kansas-city-district-freight-plan" },
      { label: "Manheim — Kansas City", url: "https://site.manheim.com/en/locations/manheim-kansas-city.html" },
      { label: "ADESA — Kansas City", url: "https://www.adesa.com/auction_location/adesa-kansas-city/" },
    ],
  },
  { slug: "chicago-heights-il", city: "Chicago Heights", state: "IL", stateName: "Illinois", region: "South Chicago", marketContext: "Chicago Heights is part of the south Chicago carrier market, close to University Park and other industrial suburbs. Car-hauler search often benefits from widening the radius beyond the city name while keeping deadhead and appointment timing visible.", nearby: ["University Park, IL", "Chicago, IL"] },
  { slug: "lynnwood-wa", city: "Lynnwood", state: "WA", stateName: "Washington", region: "North Puget Sound", marketContext: "Lynnwood gives north Puget Sound carriers a search point between Seattle, Everett/Marysville, and the larger metro. The practical opportunity is often a route-aware search across multiple nearby cities rather than one municipal boundary.", nearby: ["Marysville, WA", "Seattle, WA", "Renton, WA", "Puyallup, WA"] },
  { slug: "pueblo-co", city: "Pueblo", state: "CO", stateName: "Colorado", region: "Southern Front Range", marketContext: "Pueblo is the southern Front Range anchor in this batch, with Fountain and Colorado Springs directly north and Denver farther up the corridor. Carriers may need to balance local reload possibilities against the deadhead required to reach a denser market.", nearby: ["Fountain, CO", "Colorado Springs, CO", "Denver, CO"] },
  { slug: "fountain-co", city: "Fountain", state: "CO", stateName: "Colorado", region: "Southern Front Range", marketContext: "Fountain sits immediately south of Colorado Springs and north of Pueblo, so carriers should not search it in isolation. Hermes can review the wider Front Range radius, equipment fit, timing, and carrier-approved destination preferences.", nearby: ["Colorado Springs, CO", "Pueblo, CO", "Denver, CO"] },
  { slug: "university-park-il", city: "University Park", state: "IL", stateName: "Illinois", region: "South Chicago", marketContext: "University Park is a south Chicago operating point close to Chicago Heights and the wider Chicago market. Search strategy can combine a tight local radius with broader metro options when deadhead, capacity, and appointment timing make sense.", nearby: ["Chicago Heights, IL", "Chicago, IL"] },
  { slug: "st-louis-mo", city: "St. Louis", state: "MO", stateName: "Missouri", region: "St. Louis metro", marketContext: "St. Louis is the eastern Missouri anchor in this launch set, with Bridgeton inside the metro and Springfield/Kansas City forming the larger Missouri network. Carriers may need both metro-area opportunities and longer outbound freight.", nearby: ["Bridgeton, MO", "Springfield, MO", "Kansas City, MO/KS"] },
  { slug: "renton-wa", city: "Renton", state: "WA", stateName: "Washington", region: "Seattle / South King County", marketContext: "Renton sits between Seattle and the South Puget Sound markets of Auburn, Puyallup, and Tacoma. A useful carrier search can combine city, radius, destination, and route filters instead of treating each nearby municipality separately.", nearby: ["Seattle, WA", "Auburn, WA", "Puyallup, WA", "Tacoma, WA"] },
  { slug: "rogersville-mo", city: "Rogersville", state: "MO", stateName: "Missouri", region: "Southwest Missouri", marketContext: "Rogersville is part of the Springfield-area market, so a carrier should usually evaluate it together with Springfield and wider Missouri opportunities. Hermes can help compare deadhead, destination, rate discussion, and equipment fit before the carrier decides.", nearby: ["Springfield, MO", "Kansas City, MO/KS", "St. Louis, MO"] },
  { slug: "topeka-ks", city: "Topeka", state: "KS", stateName: "Kansas", region: "Northeast Kansas", marketContext: "Topeka gives carriers a northeast Kansas search point with Kansas City as the nearest major metro in this batch. Route-aware search is especially useful when the best candidate load is outside a tight city radius.", nearby: ["Kansas City, MO/KS", "Springfield, MO"] },
  { slug: "marysville-wa", city: "Marysville", state: "WA", stateName: "Washington", region: "North Puget Sound", marketContext: "Marysville is the northern Puget Sound edge of this batch, with Lynnwood and Seattle to the south. Carriers can use a broader search radius and route filters to compare local and southbound opportunities without assuming a guaranteed backhaul.", nearby: ["Lynnwood, WA", "Seattle, WA", "Renton, WA"] },
  {
    slug: "chicago-il",
    city: "Chicago",
    state: "IL",
    stateName: "Illinois",
    region: "Chicago metro",
    marketContext: "Chicago is the broadest Illinois market in this set and should be treated as a metro search, not a single downtown point. South-suburban locations such as Chicago Heights and University Park can matter to a car hauler's practical pickup radius.",
    nearby: ["Chicago Heights, IL", "University Park, IL"],
    localOperatingNotes: [
      "CMAP describes northeastern Illinois as a major freight hub and notes that the region's ten interstate highways form the key truck-freight network. For car haulers, Chicago should be searched as a metro system: exact suburb, appointment, toll/congestion exposure, and outbound direction matter more than the word Chicago alone.",
      "ADESA Chicago is in Hoffman Estates and publishes vehicle pickup/drop-off and transportation information. Use those published gate rules as a planning check for that independent location, not as evidence of a Hermes relationship or current load availability.",
      "Hermes' private operating records show repeated Chicago/Chicago Heights origin/destination activity with Kansas City, Topeka, St. Louis/Springfield, and other Midwest points. The public page uses only the resulting corridor lesson; customer identities, rates, contacts, and live availability remain private.",
    ],
    officialSources: [
      { label: "CMAP — Chicago-region freight and rail network", url: "https://cmap.illinois.gov/focus-areas/transportation/freight-and-rail/" },
      { label: "IDOT — Illinois State Freight Plan", url: "https://idot.illinois.gov/programs-and-projects/rail-and-freight/illinois-state-freight-plan.html" },
      { label: "ADESA — Chicago", url: "https://www.adesa.com/auction_location/adesa-chicago/" },
    ],
  },
  { slug: "tacoma-wa", city: "Tacoma", state: "WA", stateName: "Washington", region: "South Puget Sound", marketContext: "Tacoma is a core South Puget Sound operating point with Puyallup, Auburn, Renton, and Seattle nearby. Carriers can compare city, radius, and route searches while keeping equipment capacity and appointment requirements in view.", nearby: ["Puyallup, WA", "Auburn, WA", "Renton, WA", "Seattle, WA"] },
  { slug: "bridgeton-mo", city: "Bridgeton", state: "MO", stateName: "Missouri", region: "St. Louis metro", marketContext: "Bridgeton is part of the St. Louis metro, so car-hauler search should usually extend beyond the city boundary and compare metro-wide pickup options against destination direction and deadhead.", nearby: ["St. Louis, MO", "Springfield, MO", "Kansas City, MO/KS"] },
  {
    slug: "seattle-wa",
    city: "Seattle",
    state: "WA",
    stateName: "Washington",
    region: "Central Puget Sound",
    marketContext: "Seattle anchors the central Puget Sound market, with Renton and Auburn to the south and Lynnwood/Marysville to the north. A carrier's useful search area can span several municipalities while still respecting pickup access, timing, and equipment fit.",
    nearby: ["Renton, WA", "Auburn, WA", "Lynnwood, WA", "Marysville, WA"],
    localOperatingNotes: [
      "WSDOT classifies I-405 in central Puget Sound as a T-1 freight corridor carrying more than 10 million tons annually, while I-5 remains the primary north-south economic corridor. A Seattle-area car hauler should compare current position against I-5/I-405 access instead of treating every nearby municipality as equivalent deadhead.",
      "Manheim Seattle is in Kent and ADESA Seattle is in Auburn. These independently operated auction locations make Kent/Auburn practical nodes to include when building a South King County radius; always verify current gate, pickup, and sale-day restrictions directly with the location.",
      "Hermes' private operating records contain repeated Seattle-area origin/destination activity involving Puyallup, Renton, Kent, Tacoma, and nearby Puget Sound points. That historical evidence informs radius and route questions only; it does not represent today's inventory or disclose customers, rates, or contacts.",
    ],
    officialSources: [
      { label: "WSDOT — Central Puget Sound I-405 freight corridor", url: "https://www.wsdot.wa.gov/about/data/multimodal-mobility-dashboard/dashboard/central-puget-sound/default.htm" },
      { label: "Manheim — Seattle (Kent)", url: "https://site.manheim.com/en/locations/manheim-seattle.html" },
      { label: "ADESA — Seattle (Auburn)", url: "https://www.adesa.com/auction_location/adesa-seattle/" },
    ],
  },
  { slug: "auburn-wa", city: "Auburn", state: "WA", stateName: "Washington", region: "South King County / Puget Sound", marketContext: "Auburn sits between Seattle/Renton and Puyallup/Tacoma, making it a practical cross-metro search point for car haulers. Hermes can review radius, direction, deadhead, and carrier-approved operating preferences across the surrounding market.", nearby: ["Renton, WA", "Puyallup, WA", "Tacoma, WA", "Seattle, WA"] },
  { slug: "fremont-ca", city: "Fremont", state: "CA", stateName: "California", region: "San Francisco Bay Area", marketContext: "Fremont is a Bay Area operating point with access to the East Bay and South Bay. Dense metro geography makes route-aware searching, appointment timing, equipment fit, and deadhead review more useful than a city-only search.", nearby: ["San Jose, CA", "Oakland, CA", "San Francisco, CA"] },
  {
    slug: "brighton-co",
    city: "Brighton",
    state: "CO",
    stateName: "Colorado",
    region: "North Denver metro / Front Range",
    marketContext: "Brighton is a north Denver-metro search point where a carrier can compare Denver-area work with northbound Front Range repositioning. The useful search depends on which corridor the truck is actually positioned for, not only the city name.",
    nearby: ["Commerce City, CO", "Denver, CO", "Aurora, CO"],
    localOperatingNotes: [
      "US 85 is the north-south corridor through Brighton. CDOT identifies the urban US 85 corridor north of I-76 as a route that carries truck freight, so northbound versus southbound direction is a meaningful search input for a carrier positioned here.",
      "CO 7 reaches US 85 at Brighton on CDOT's Brighton-to-Boulder corridor. That gives Brighton a distinct east-west decision point in addition to Denver-metro and north-south Front Range movement.",
      "Before widening the radius, record the truck's actual position, open deck capacity, pickup appointment constraints, destination preference, and acceptable deadhead. Hermes can then compare Brighton with Commerce City, Denver, and Aurora without assuming that a wider radius automatically improves the load.",
    ],
    officialSources: [
      { label: "CDOT — US 85 corridor profile", url: "https://www.codot.gov/programs/planning/transportation-plans-and-studies/assets/rtp-dev-documents/upper-front-range-2040-corridor-profiles.pdf" },
      { label: "CDOT — CO 7 Brighton to Boulder corridor", url: "https://www.codot.gov/projects/studies/co7brightonboulder" },
    ],
  },
  { slug: "graham-wa", city: "Graham", state: "WA", stateName: "Washington", region: "Pierce County / South Puget Sound", marketContext: "Graham sits in Pierce County near Puyallup and Tacoma. For car haulers, the more useful search is often a practical radius around the truck rather than the city boundary alone.", nearby: ["Puyallup, WA", "Tacoma, WA", "Auburn, WA"] },
  { slug: "commerce-city-co", city: "Commerce City", state: "CO", stateName: "Colorado", region: "Denver metro / Front Range", marketContext: "Commerce City is a Denver-metro operating point close to Denver, Brighton, and Aurora. A carrier can use it as an anchor for metro load search while comparing route direction, deadhead, timing, and equipment requirements.", nearby: ["Denver, CO", "Brighton, CO", "Aurora, CO"] },
];

export const carHaulerPlatformExamples = [
  "Central Dispatch",
  "Super Dispatch",
  "Ship.Cars Carrier Market",
  "CarsArrive Network",
  "RunBuggy",
] as const;

export const carHaulerSupportCategories = [
  "Load-search support",
  "Route review",
  "Equipment-fit review",
  "Pickup and delivery requirement review",
  "Deadhead awareness",
  "Broker communication support",
  "Rate-discussion support without a promised result",
  "Broker setup-packet coordination",
  "Insurance-certificate coordination",
  "Rate-confirmation organization",
  "Pickup and delivery document organization",
  "Invoice preparation or organization support",
  "Accounts-receivable follow-up support",
  "Carrier operating-profile documentation",
  "Capacity and equipment-restriction documentation",
  "Preferred-region and lane-preference documentation",
  "Availability and communication-rule documentation",
  "Authority, insurance, and readiness review using available information",
  "Direct-freight relationship research and development as a separate long-term process",
  "Structured operating communication and back-office follow-through",
] as const;
