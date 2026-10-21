#!/usr/bin/env python3
"""Non-blocking, reproducible video loop seam QA for Hermes Home people-scenes.

Prints loop discontinuity relative to ordinary adjacent-frame motion. It does NOT
re-encode video, assert subjective quality or authorize a production release.
"""
import json
import statistics
import subprocess
from pathlib import Path

MEDIA = Path("public/media/home")
SCENES = ("marketing-team-720.mp4", "technology-claude-v3-720.mp4", "academy-claude-v3-720.mp4")
WIDTH, HEIGHT = 32, 56
FRAME_BYTES = WIDTH * HEIGHT

def decode(path):
    probe = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,avg_frame_rate",
        "-of", "json", str(path)
    ], timeout=20))
    stream = probe["streams"][0]
    frames = subprocess.check_output([
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-i", str(path), "-vf", f"scale={WIDTH}:{HEIGHT}:flags=bilinear,format=gray",
        "-f", "rawvideo", "-pix_fmt", "gray", "-vsync", "0", "-"
    ], timeout=70)
    if not frames or len(frames) % FRAME_BYTES:
        raise RuntimeError(f"Bad decoded video sample: {path}")
    return [frames[p:p+FRAME_BYTES] for p in range(0, len(frames), FRAME_BYTES)],stream

def mad(frame_a,frame_b):
    return sum(abs(a-b) for a,b in zip(frame_a,frame_b)) / len(frame_a)

print("scene\\tframe_count\\tmedian_adjacent_delta\\tlast_first_delta\\tloop_cut_ratio\\tclassification")
for name in SCENES:
    frames,stream = decode(MEDIA / name)
    if len(frames) < 20:
        raise RuntimeError(f"Insufficient decoded frames: {name}")
    typical=statistics.median(mad(a,b) for a,b in zip(frames,frames[1:]))
    boundary=mad(frames[-1],frames[0])
    ratio=boundary/max(typical,0.001)
    verdict="VISIBLE_HARD_CUT_RISK" if ratio > 8 else "CHECK_VISUALLY"
    print(f"{name}\\t{len(frames)}\\t{typical:.2f}\\t{boundary:.2f}\\t{ratio:.1f}\\t{verdict}")
    if ratio > 8:
        print(f"::warning title=Home video loop cut::{name} has {ratio:.1f}x normal frame delta at its loop boundary; verify in real playback. Never force overlapping face crossfades.")
