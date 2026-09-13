const targetSuffix = "/src/pages/load-board.astro";

const replacements = [
  ["<dt>Pickup</dt><dd>Jul 22 · 8 AM–2 PM</dd>", "<dt>Pickup</dt><dd>8 AM–2 PM</dd>"],
  ["<dt>Posted</dt><dd>18 min ago</dd>", "<dt>Status</dt><dd>PREVIEW · NOT LIVE</dd>"],
  ["<dt>Pickup</dt><dd>Jul 23</dd>", "<dt>Pickup</dt><dd>Flexible pickup</dd>"],
  ["<dt>Posted</dt><dd>41 min ago</dd>", "<dt>Status</dt><dd>PREVIEW · NOT LIVE</dd>"],
  ["<dt>Pickup</dt><dd>Jul 24 · appointment</dd>", "<dt>Pickup</dt><dd>Appointment required</dd>"],
  ["<dt>Posted</dt><dd>1 hr ago</dd>", "<dt>Status</dt><dd>PREVIEW · NOT LIVE</dd>"],
  ["<dt>Pickup</dt><dd>Jul 25–26</dd>", "<dt>Pickup</dt><dd>2-day pickup window</dd>"],
  ["<dt>Posted</dt><dd>2 hr ago</dd>", "<dt>Status</dt><dd>PREVIEW · NOT LIVE</dd>"],
];

export function evergreenLoadBoardDemo() {
  return {
    name: "hermes-evergreen-load-board-demo",
    enforce: "pre",
    transform(code, id) {
      const cleanId = id.split("?", 1)[0].replaceAll("\\", "/");
      if (!cleanId.endsWith(targetSuffix)) return null;

      let transformed = code;
      for (const [stale, evergreen] of replacements) {
        transformed = transformed.replace(stale, evergreen);
      }

      if (transformed === code) return null;
      return { code: transformed, map: null };
    },
  };
}
