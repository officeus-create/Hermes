#!/usr/bin/env bash
# Review-only, offline, zero-cost first/mid/change/loop preview.
# Inputs must be two rights-reviewed DIFFERENT real footage masters.
# No external downloads; never changes production or public/media/home/.
set -Eeuo pipefail
if [[ $# -ne 4 ]]; then
  echo 'Usage: render-home-v3-two-shots.sh DIRECTION SOURCE1 SOURCE2 PREVIEW_DIRECTORY' >&2
  exit 64
fi
lane="$1"; first="$2"; second="$3"; dest="$4"
case "$lane" in logistics|technology|academy|marketing) ;; *) echo 'Unknown direction' >&2; exit 64;; esac
command -v ffmpeg >/dev/null
command -v ffprobe >/dev/null
command -v sha256sum >/dev/null
for f in "$first" "$second"; do
  [[ -f "$f" ]] || { echo "Missing source master: $f" >&2; exit 66; }
  ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$f" >/dev/null
done
[[ "$(sha256sum "$first" | cut -d' ' -f1)" != "$(sha256sum "$second" | cut -d' ' -f1)" ]] || { echo 'Identical sources are not two shots' >&2; exit 65; }
mkdir -p "$dest"
output="$dest/$lane-two-real-shots-REVIEW-ONLY.mp4"
ffmpeg -hide_banner -loglevel error -nostdin -y -i "$first" -i "$second" \
  -filter_complex "[0:v]trim=duration=4.5,setpts=PTS-STARTPTS,scale=540:960:force_original_aspect_ratio=increase,crop=540:960,setsar=1,fps=24,format=yuv420p,fade=t=out:st=3.8:d=0.7[v0];[1:v]trim=duration=4.5,setpts=PTS-STARTPTS,scale=540:960:force_original_aspect_ratio=increase,crop=540:960,setsar=1,fps=24,format=yuv420p,fade=t=in:st=0:d=0.7[v1];[v0][v1]concat=n=2:v=1:a=0[v]" \
  -map '[v]' -an -sn -c:v libx264 -preset medium -crf 29 -maxrate 1100k -bufsize 2200k \
  -pix_fmt yuv420p -movflags +faststart "$output"
[[ "$(stat -c%s "$output")" -le 4000000 ]] || { echo 'Preview exceeds 4MB budget' >&2; exit 67; }
for t in 1 4 5 8; do
  ffmpeg -hide_banner -loglevel error -nostdin -y -ss "$t" -i "$output" -frames:v 1 "$dest/$lane-at-$t-s.jpg"
done
printf 'REVIEW ONLY: %s\nFirst source sha256: %s\nSecond source sha256: %s\nOutput sha256: %s\nOutput bytes: %s\n' \
  "$lane" "$(sha256sum "$first" | cut -d' ' -f1)" "$(sha256sum "$second" | cut -d' ' -f1)" \
  "$(sha256sum "$output" | cut -d' ' -f1)" "$(stat -c%s "$output")" > "$dest/$lane-PROVENANCE.txt"
echo "Offline preview ready for independent source/scene-cut/loop QA: $output"
