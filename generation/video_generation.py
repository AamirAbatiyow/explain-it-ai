import os
import json
from urllib import response
from openai import OpenAI
from dotenv import load_dotenv
from fishaudio import FishAudio
from fishaudio.utils import save

load_dotenv()

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
fish_client = FishAudio(api_key=os.getenv("FISHAUDIO_API_KEY"))


def generate_video_script(
    topic: str,
    length: int,
    characters: tuple[str, str],
    characters_json_path: str = "characters.json",
    audio_dir: str = "audio",
    output_json_path: str = "final_script.json"
):
    """
    Generates dialogue script, audio, and returns enriched dictionary.

    Parameters:
        topic (str): topic to explain
        length (int): video length in seconds
        characters (tuple): (explainer, contrarian)
        characters_json_path (str): path to characters.json
        audio_dir (str): folder to save audio files
        output_json_path (str): file to save final script

    Returns:
        dict: enriched script dictionary
    """

    explainer, contrarian = characters

    # Load character config
    with open(characters_json_path, "r") as f:
        CHARACTER_DATA = json.load(f)

    # Validate characters exist
    if explainer not in CHARACTER_DATA:
        raise ValueError(f"{explainer} not found in characters.json")

    if contrarian not in CHARACTER_DATA:
        raise ValueError(f"{contrarian} not found in characters.json")

    # Generate script prompt
    prompt = f"""
Create a funny but educational short-form video dialogue script.

Topic: {topic}
Length: {length} seconds

Characters:
Explainer: {explainer}
Contrarian: {contrarian}

Requirements:
- Explainer starts first
- Characters strictly alternate dialogue
- Contrarian disagrees or misunderstands humorously
- Each dialogue line must be its own entry
- Return ONLY valid JSON
- No markdown
- No extra text

Use this EXACT schema and EXACT character names:

{{
  "topic": "{topic}",
  "length_seconds": {length},
  "dialogue": [
    {{
      "speaker": "{explainer}",
      "role": "explainer",
      "text": "dialogue here"
    }},
    {{
      "speaker": "{contrarian}",
      "role": "contrarian",
      "text": "dialogue here"
    }}
  ]
}}
"""

    response = openai_client.responses.create(
        model="gpt-4.1-mini",
        input=prompt,
        temperature=0.9
    )

    script_dict = json.loads(response.output_text)

    # Create audio directory
    os.makedirs(audio_dir, exist_ok=True)

    # Generate audio
    for index, line in enumerate(script_dict["dialogue"]):

        speaker = line["speaker"]

        if speaker not in CHARACTER_DATA:
            raise ValueError(f"{speaker} not found in characters.json")

        character = CHARACTER_DATA[speaker]

        voice_id = character["reference_id"]
        image_path = character["image"]
        text = line["text"]

        print(f"Generating audio for {speaker}...")

        audio = fish_client.tts.convert(
            text=text,
            reference_id=voice_id
        )

        filename = f"{index:03d}_{speaker}.mp3"
        filepath = os.path.join(audio_dir, filename)

        save(audio, filepath)

        # Attach metadata
        line["index"] = index
        line["voice_id"] = voice_id
        line["image_path"] = image_path
        line["audio_path"] = filepath

    # Save final script
    with open(output_json_path, "w") as f:
        json.dump(script_dict, f, indent=2)

    print(f"\nDone. Saved to {output_json_path}")

    return script_dict


import ssl
import certifi
ssl._create_default_https_context = ssl.create_default_context(cafile=certifi.where())

import os
import json
from moviepy import (
    VideoFileClip,
    ImageClip,
    AudioFileClip,
    CompositeVideoClip,
    TextClip,
    concatenate_audioclips
)

# -------------------------
# MAIN FUNCTION
# -------------------------

def generate_video_from_script(
    script_dict: dict,
    background_video_path: str,
    characters_json_path: str,
    output_file: str = "final_video.mp4",
    width: int = 1080,
    height: int = 1920,
    font: str = "/System/Library/Fonts/Supplemental/Impact.ttf",
    character_width: int = 600,
    words_per_chunk: int = 3
):

    # Load character config
    with open(characters_json_path, "r") as f:
        CHARACTER_DATA = json.load(f)

    dialogue = script_dict["dialogue"]

    # -------------------------
    # LOAD ALL AUDIO + BUILD TIMELINE
    # -------------------------

    audio_clips = []
    character_clips = []
    subtitle_clips = []

    current_time = 0

    for line in dialogue:

        speaker = line["speaker"]
        text = line["text"]
        audio_path = line["audio_path"]

        character = CHARACTER_DATA[speaker]
        image_path = character["image"]
        color = character["color"]

        audio_clip = AudioFileClip(audio_path)

        start = current_time
        end = current_time + audio_clip.duration

        audio_clips.append(audio_clip)

        # -------------------------
        # CHARACTER IMAGE CLIP
        # -------------------------

        character_clip = (
            ImageClip(image_path)
            .with_start(start)
            .with_end(end)
            .resized(width=character_width)
            .with_position(("center", height//2 - 100))
        )

        character_clips.append(character_clip)

        # -------------------------
        # SUBTITLES (chunked words)
        # -------------------------

        words = text.split()

        chunk_duration = audio_clip.duration / max(1, len(words))

        for i in range(0, len(words), words_per_chunk):

            chunk_words = words[i:i+words_per_chunk]
            chunk_text = " ".join(chunk_words)

            chunk_start = start + i * chunk_duration
            chunk_end = start + (i + len(chunk_words)) * chunk_duration

            subtitle = (
                TextClip(
                    text=chunk_text,
                    font=font,
                    font_size=75,
                    color=color,
                    stroke_color="black",
                    stroke_width=5,
                    method="caption",
                    size=(width - 120, 250),
                    text_align="center"
                )
                .with_start(chunk_start)
                .with_end(chunk_end)
                .with_position(("center", height - 450))
            )

            subtitle_clips.append(subtitle)

        current_time = end

    # -------------------------
    # COMBINE AUDIO
    # -------------------------

    final_audio = concatenate_audioclips(audio_clips)

    total_duration = final_audio.duration

    # -------------------------
    # BACKGROUND VIDEO
    # -------------------------

    bg_source = VideoFileClip(background_video_path)

    scale = max(width / bg_source.w, height / bg_source.h)

    bg_resized = bg_source.resized(scale)

    background = (
        bg_resized
        .cropped(
            x_center=bg_resized.w / 2,
            y_center=bg_resized.h / 2,
            width=width,
            height=height
        )
        .with_duration(total_duration)
    )

    # -------------------------
    # TITLE
    # -------------------------

    title_text = script_dict.get("topic", "")

    title = (
        TextClip(
            text=title_text,
            font=font,
            font_size=110,
            color="white",
            stroke_color="black",
            stroke_width=6,
            method="caption",
            size=(width - 100, 300),
            text_align="center"
        )
        .with_duration(total_duration)
        .with_position(("center", height//2 - 650))
    )

    # -------------------------
    # FINAL COMPOSITION
    # -------------------------

    final_video = CompositeVideoClip(
        [background, title] + character_clips + subtitle_clips,
        size=(width, height)
    ).with_audio(final_audio)

    # -------------------------
    # EXPORT
    # -------------------------

    final_video.write_videofile(
        output_file,
        fps=30,
        codec="h264_videotoolbox",  # Mac GPU acceleration
        audio_codec="aac",
        preset="ultrafast",
        threads=4,
        ffmpeg_params=["-pix_fmt", "yuv420p"]
    )

    print(f"\nVideo saved to {output_file}")


import os
import shutil
import re

def cleanup_after_render(
    video_path: str,
    posted_dir: str = "posted",
    audio_dir: str = "audio"
):
    """
    Moves finished video to posted/ with auto-increment index
    and clears audio directory.

    Example result:
    posted/
        001.mp4
        002.mp4
        003.mp4
    """

    # -------------------------
    # CREATE POSTED DIRECTORY
    # -------------------------

    os.makedirs(posted_dir, exist_ok=True)

    # -------------------------
    # FIND NEXT INDEX
    # -------------------------

    existing = [
        f for f in os.listdir(posted_dir)
        if f.endswith(".mp4")
    ]

    max_index = 0

    for file in existing:
        match = re.match(r"(\d+)\.mp4", file)
        if match:
            num = int(match.group(1))
            max_index = max(max_index, num)

    next_index = max_index + 1

    new_filename = f"{next_index:03d}.mp4"
    new_path = os.path.join(posted_dir, new_filename)

    # -------------------------
    # MOVE VIDEO
    # -------------------------

    shutil.move(video_path, new_path)

    print(f"Moved video to {new_path}")

    # -------------------------
    # CLEAR AUDIO DIRECTORY
    # -------------------------

    if os.path.exists(audio_dir):

        for file in os.listdir(audio_dir):

            file_path = os.path.join(audio_dir, file)

            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)

            except Exception as e:
                print(f"Could not delete {file_path}: {e}")

    print("Audio directory cleared.")

    return new_path


import os
import random

def get_random_background(backgrounds_dir: str = "backgrounds") -> str:
    """
    Returns random .mp4 file from backgrounds directory
    """

    if not os.path.exists(backgrounds_dir):
        raise ValueError(f"{backgrounds_dir} does not exist")

    files = [
        f for f in os.listdir(backgrounds_dir)
        if f.lower().endswith(".mp4")
    ]

    if not files:
        raise ValueError(f"No .mp4 files found in {backgrounds_dir}")

    chosen = random.choice(files)

    return os.path.join(backgrounds_dir, chosen)


def generate_quiz_from_script(
    script_dict: dict,
    video_path: str,
    quizzes_dir: str = "quizzes"
):
    """
    Generates comprehension quiz from script and saves it
    matching the video filename.

    Example:
    posted/002.mp4 -> quizzes/002.json
    """

    os.makedirs(quizzes_dir, exist_ok=True)

    # Extract video index
    video_filename = os.path.basename(video_path)
    video_index = os.path.splitext(video_filename)[0]

    quiz_path = os.path.join(quizzes_dir, f"{video_index}.json")

    # Combine full script text
    full_text = "\n".join(
        f"{line['speaker']}: {line['text']}"
        for line in script_dict["dialogue"]
    )

    topic = script_dict.get("topic", "")

    prompt = f"""
Create exactly 3 multiple choice questions based on this educational script.

Topic: {topic}

Script:
{full_text}

Requirements:
- Each question must have 4 choices
- Only one correct answer
- The correct answer must be randomly positioned among the 4 choices
- DO NOT always put the correct answer at index 0
- Return correct_index matching the correct choice position
- Return ONLY valid JSON

Format:
{{
  "topic": "{topic}",
  "video": "{video_filename}",
  "questions": [
    {{
      "question": "text",
      "choices": ["A", "B", "C", "D"],
      "correct_index": 2
    }}
  ]
}}
"""

    quiz_dict = generate_quiz_with_retry(prompt)

    # Save quiz file
    with open(quiz_path, "w") as f:
        json.dump(quiz_dict, f, indent=2)

    print(f"Quiz saved to {quiz_path}")

    return quiz_dict


def generate_quiz_with_retry(prompt, max_attempts=5):
    """
    Calls OpenAI until valid JSON is returned or max_attempts reached.
    """

    for attempt in range(max_attempts):

        print(f"Generating quiz (attempt {attempt+1}/{max_attempts})...")

        response = openai_client.responses.create(
            model="gpt-4.1-mini",
            input=prompt,
            temperature=0.9
        )

        # Try multiple extraction methods
        text = None

        if hasattr(response, "output_text") and response.output_text:
            text = response.output_text
        elif hasattr(response, "output") and response.output:
            for block in response.output:
                if hasattr(block, "content"):
                    for item in block.content:
                        if hasattr(item, "text"):
                            text = item.text
                            break

        if not text:
            print("No text returned, retrying...")
            continue

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            print("Invalid JSON returned, retrying...")
            continue

    raise RuntimeError("Failed to generate valid quiz JSON after max attempts")


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 5:
        print("Usage: video_generation.py character1 character2 topic duration", file=sys.stderr)
        sys.exit(1)
    character1 = sys.argv[1]
    character2 = sys.argv[2]
    topic = sys.argv[3]
    duration = int(sys.argv[4])

    script = generate_video_script(
        topic=topic,
        length=duration,
        characters=(character1, character2),
    )

    background = get_random_background("backgrounds")

    generate_video_from_script(
        script_dict=script,
        background_video_path=background,
        characters_json_path="characters.json",
        output_file="final_video.mp4"
    )

    final_path = cleanup_after_render(
        video_path="final_video.mp4",
        posted_dir="posted",
        audio_dir="audio"
    )

    quiz = generate_quiz_from_script(
        script_dict=script,
        video_path=final_path
    )