from pathlib import Path

path = Path("src/pages/load-board.astro")
source = path.read_text()

frontmatter_anchor = 'import "../styles/features/load.css";\n---'
frontmatter_replacement = '''import "../styles/features/load.css";

const title = "Car Hauling Load Board for Carriers | Hermes Logistics";
const description = "Review source-gated car hauling loads and clearly labeled demo freight by lane, equipment, deadhead, timing, rate, paperwork, and carrier fit.";
const canonicalUrl = "https://hermeslogisticsus.com/load-board/";
const schema = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    about: [
      { "@type": "Thing", name: "Car hauling loads" },
      { "@type": "Thing", name: "Carrier load evaluation" },
    ],
    audience: {
      "@type": "Audience",
      audienceType: "Motor carriers, owner-operators, and small fleets",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hermeslogisticsus.com/" },
      { "@type": "ListItem", position: 2, name: "Logistics", item: "https://hermeslogisticsus.com/paths/logistics/" },
      { "@type": "ListItem", position: 3, name: "Car Hauling Load Board", item: canonicalUrl },
    ],
  },
];
---'''

if frontmatter_anchor not in source:
    raise SystemExit("frontmatter anchor not found")
source = source.replace(frontmatter_anchor, frontmatter_replacement, 1)

layout_old = '''<BaseLayout
  title="Car Hauling Load Board | Live Feed + Demo Review | Hermes Logistics"
  description="Car hauler load board with a source-gated live marketplace for approved active records plus clearly labeled fictional demo loads for lane, equipment, deadhead, rate, paperwork, and carrier-fit review."
>'''
layout_new = '''<BaseLayout
  title={title}
  description={description}
  schema={schema}
>'''

if layout_old not in source:
    raise SystemExit("BaseLayout metadata block not found")
source = source.replace(layout_old, layout_new, 1)

path.write_text(source)
print("Patched Load Board title, description, CollectionPage schema, and BreadcrumbList schema.")
