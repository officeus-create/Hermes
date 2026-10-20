#!/usr/bin/env bash
set -Eeuo pipefail
# Source-master-only 720p preview; not deployed.
cd "$(git rev-parse --show-toplevel)"
command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
out="public/media/home"
mkdir -p "$out"
report="$work/home-v3-quality-metadata.tsv"
printf 'scene\tsource\tinput_dimensions\tinput_fps\toutput_width\toutput_height\toutput_fps\tbytes\tsha256\n' > "$report"
process() {
  local name="$1" origin="$2" duration="$3" filter="$4" source="$5" poster="$6"
  local input="$work/$name-original.mp4"
  printf 'Downloading Pexels original: %s\n' "$name"
  curl --fail --location --silent --show-error --retry 2 --connect-timeout 20 --max-time 240 "$origin" --output "$input"
  test "$(stat -c%s "$input")" -gt 100000
  local dims fps outvid width height fps_out hash size
  dims="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$input")"
  fps="$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of default=noprint_wrappers=1:nokey=1 "$input")"
  case "$fps" in "24/1"|"25/1"|"30/1"|"24000/1001"|"30000/1001") ;; *) echo "Unexpected source fps: $fps" >&2; exit 1;; esac
  outvid="$out/$name-720.mp4"
  ffmpeg -hide_banner -loglevel error -nostdin -y -i "$input" -t "$duration" \
    -map 0:v:0 -vf "$filter" -an -sn -fps_mode passthrough \
    -c:v libx264 -preset medium -crf 25 -maxrate 1700k -bufsize 3400k \
    -pix_fmt yuv420p -movflags +faststart "$outvid"
  for poster_width in 400 720; do
    ffmpeg -hide_banner -loglevel error -nostdin -y -ss 1.8 -i "$input" \
      -vf "$filter,scale=$poster_width:-2:flags=lanczos" -frames:v 1 \
      -c:v libwebp -q:v 78 -compression_level 6 \
      "$out/$poster-$poster_width.webp"
    test "$(stat -c%s "$out/$poster-$poster_width.webp")" -gt 3000
    test "$(stat -c%s "$out/$poster-$poster_width.webp")" -lt 190000
  done
  size="$(stat -c%s "$outvid")"
  if ((size > 3500000)); then echo "Video exceeds 3.5MB: $name $size" >&2; exit 1; fi
  width="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$outvid")"
  height="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$outvid")"
  fps_out="$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of default=noprint_wrappers=1:nokey=1 "$outvid")"
  [[ "$width" == 720 && "$height" == 1280 ]] || { echo "Invalid output size $width x $height" >&2; exit 1; }
  hash="$(sha256sum "$outvid" | cut -d' ' -f1)"
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$name" "$source" "$dims" "$fps" "$width" "$height" "$fps_out" "$size" "$hash" >> "$report"
  printf 'Generated %-10s %sx%s fps=%s bytes=%s\n' "$name" "$width" "$height" "$fps_out" "$size"
}
process "marketing-team" \
  "https://videos.pexels.com/video-files/6774593/6774593-hd_1080_1920_30fps.mp4" \
  11.1 "scale=720:1280:flags=lanczos,setsar=1" \
  "Pexels 6774593 Kindel Media" "marketing-team-poster"
process "technology-claude-v3" \
  "https://videos.pexels.com/video-files/6804109/6804109-uhd_4096_2160_25fps.mp4" \
  10 "crop=ih*9/16:ih:(iw-ow)/2:0,scale=720:1280:flags=lanczos,setsar=1" \
  "Pexels 6804109 cottonbro studio" "technology-claude-v3-poster"
process "academy-claude-v3" \
  "https://videos.pexels.com/video-files/7413799/7413799-hd_1080_1920_24fps.mp4" \
  8.3 "scale=720:1280:flags=lanczos,setsar=1" \
  "Pexels 7413799 RDNE stock video" "academy-claude-v3-poster"
cp "$report" docs/design/HOME_V3_720P_CANDIDATE_METADATA.tsv
cat "$report"
echo "Preview only. Production release requires visual / Safari / full CI approval."
