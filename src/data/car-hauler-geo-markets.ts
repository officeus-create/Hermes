export type CarHaulerGeoMarket = {
  slug: string;
  city: string;
  state: string;
  stateName: string;
  region: string;
  marketContext: string;
  nearby: string[];
};

export const carHaulerGeoMarkets: CarHaulerGeoMarket[] = [
  { slug: "colorado-springs-co", city: "Colorado Springs", state: "CO", stateName: "Colorado", region: "Front Range", marketContext: "Colorado Springs sits on Colorado's Front Range with practical access to Fountain, Pueblo, Denver, and Aurora. Car-hauling operators often need flexible origin-only, destination-only, and route-based searches rather than a single fixed lane.", nearby: ["Fountain, CO", "Pueblo, CO", "Denver, CO", "Aurora, CO"] },
  { slug: "puyallup-wa", city: "Puyallup", state: "WA", stateName: "Washington", region: "South Puget Sound", marketContext: "Puyallup is a useful South Puget Sound operating point for carriers working between Tacoma, Auburn, Renton, Seattle, and the broader Pierce/King County market. Search strategy should account for dense metro pickup points and route timing.", nearby: ["Tacoma, WA", "Auburn, WA", "Renton, WA", "Seattle, WA"] },
  { slug: "denver-co", city: "Denver", state: "CO", stateName: "Colorado", region: "Denver metro / Front Range", marketContext: "Denver is the central Front Range market in this launch set, connecting nearby Aurora, Commerce City, Brighton, and the I-25 corridor toward Colorado Springs. A carrier may need a mix of metro moves and longer outbound opportunities.", nearby: ["Aurora, CO", "Commerce City, CO", "Brighton, CO", "Colorado Springs, CO"] },
  { slug: "springfield-mo", city: "Springfield", state: "MO", stateName: "Missouri", region: "Southwest Missouri", marketContext: "Springfield anchors the southwest Missouri portion of this carrier-intake cluster, with nearby Rogersville and practical connections toward Kansas City and St. Louis. Operators may need both regional reloads and longer-haul options.", nearby: ["Rogersville, MO", "Kansas City, MO/KS", "St. Louis, MO"] },
  { slug: "aurora-co", city: "Aurora", state: "CO", stateName: "Colorado", region: "Denver metro / Front Range", marketContext: "Aurora gives carriers an eastern Denver-metro search point with quick access to Denver, Commerce City, Brighton, and the southbound Front Range. It is useful for building a broader metro search rather than relying on one pickup ZIP.", nearby: ["Denver, CO", "Commerce City, CO", "Brighton, CO", "Colorado Springs, CO"] },
  { slug: "kansas-city-mo-ks", city: "Kansas City", state: "MO/KS", stateName: "Missouri / Kansas", region: "Kansas City metro", marketContext: "Kansas City spans both Missouri and Kansas, so carrier search should treat the metro as one operating market while still respecting pickup state, ZIP, broker rules, and delivery details.", nearby: ["Topeka, KS", "Springfield, MO", "St. Louis, MO"] },
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
  { slug: "chicago-il", city: "Chicago", state: "IL", stateName: "Illinois", region: "Chicago metro", marketContext: "Chicago is the broadest Illinois market in this set and should be treated as a metro search, not a single downtown point. South-suburban locations such as Chicago Heights and University Park can matter to a car hauler's practical pickup radius.", nearby: ["Chicago Heights, IL", "University Park, IL"] },
  { slug: "tacoma-wa", city: "Tacoma", state: "WA", stateName: "Washington", region: "South Puget Sound", marketContext: "Tacoma is a core South Puget Sound operating point with Puyallup, Auburn, Renton, and Seattle nearby. Carriers can compare city, radius, and route searches while keeping equipment capacity and appointment requirements in view.", nearby: ["Puyallup, WA", "Auburn, WA", "Renton, WA", "Seattle, WA"] },
  { slug: "bridgeton-mo", city: "Bridgeton", state: "MO", stateName: "Missouri", region: "St. Louis metro", marketContext: "Bridgeton is part of the St. Louis metro, so car-hauler search should usually extend beyond the city boundary and compare metro-wide pickup options against destination direction and deadhead.", nearby: ["St. Louis, MO", "Springfield, MO", "Kansas City, MO/KS"] },
  { slug: "seattle-wa", city: "Seattle", state: "WA", stateName: "Washington", region: "Central Puget Sound", marketContext: "Seattle anchors the central Puget Sound market, with Renton and Auburn to the south and Lynnwood/Marysville to the north. A carrier's useful search area can span several municipalities while still respecting pickup access, timing, and equipment fit.", nearby: ["Renton, WA", "Auburn, WA", "Lynnwood, WA", "Marysville, WA"] },
  { slug: "auburn-wa", city: "Auburn", state: "WA", stateName: "Washington", region: "South King County / Puget Sound", marketContext: "Auburn sits between Seattle/Renton and Puyallup/Tacoma, making it a practical cross-metro search point for car haulers. Hermes can review radius, direction, deadhead, and carrier-approved operating preferences across the surrounding market.", nearby: ["Renton, WA", "Puyallup, WA", "Tacoma, WA", "Seattle, WA"] },
  { slug: "fremont-ca", city: "Fremont", state: "CA", stateName: "California", region: "San Francisco Bay Area", marketContext: "Fremont is a Bay Area operating point with access to the East Bay and South Bay. Dense metro geography makes route-aware searching, appointment timing, equipment fit, and deadhead review more useful than a city-only search.", nearby: ["San Jose, CA", "Oakland, CA", "San Francisco, CA"] },
  { slug: "brighton-co", city: "Brighton", state: "CO", stateName: "Colorado", region: "North Denver metro / Front Range", marketContext: "Brighton is a north Denver-metro search point near Commerce City, Denver, and Aurora. Carriers can widen or narrow the search based on available capacity, destination preference, deadhead, and pickup timing.", nearby: ["Commerce City, CO", "Denver, CO", "Aurora, CO"] },
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
