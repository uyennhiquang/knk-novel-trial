import re
import json

# regex = '(?:(?<=\s|\"|\'|…|.)|^...)[^\.\?!;]+[\.\?!;…]+[\"\']?'
regex = '(?:(?<=\s|…)|\"|\'|\.\.\.|\w)[^\.\?!;]+[\.\?!;…—]+[\"\']?'
# regex = re.compile(r"\s*((?:\.{3})?(?:[^\".?!—-]*\"[^\"]+\")*[^\".?!—-]*(?:[.?!]+|\s*[—]))")

TITLES = ("overlooking-view", "murder-speculation-1", "remaining-pain",
          "the-hollow-shrine", "paradox-paradigm", "fairytale", "murder-speculation-2")

# A dictionary that maps a novel to the number of chapters it has. The primarily usage is for the iterator to know how many chapter text files to iterate over
TITLES_DICT = {
    TITLES[0]: 6,
    TITLES[1]: 7,
    TITLES[2]: 8,
}
DEFAULT_VOLUME = 0.3
NOVEL_COUNT = 2

knk_audio = []
ost = [
    {
        "chapters": [
            [],
            [
                {
                    "start": 40,
                    "end": 64,
                    "id": "02",
                },

            ],
            [
                {
                    "start": 57,
                    "end": 93,
                    "id": "01",
                    "loop": False
                },
                {
                    "start": 94,
                    "end": 146,
                    "id": "19"
                },
                {
                    "start": 151,
                    "end": 282,
                    "id": "03a"
                }
            ],
            [
                {
                    "start": 0,
                    "end": 11,
                    "id": "11"
                },
                {
                    "start": 33,
                    "end": 67,
                    "id": "14"
                },
                {
                    "start": 68,
                    "end": 73,
                    "id": "15"
                }
            ],
            [
                {
                    "start": 36,
                    "end": 102,
                    "id": "16"
                },
                {
                    "start": 114,
                    "end": 125,
                    "id": "17"
                },
                {
                    "start": 128,
                    "end": 143,
                    "id": "18"
                }
            ],
            []

        ]
    },
    {
        "chapters": [[
            {
                "start": 3,
                "end": 32,
                "id": "02"
            },
            {
                "start": 33,
                "end": 47,
                "id": "03"
            }],
            [{
                "start": 0,
                "end": 3,
                "id": "24"
            },
            {
                "start": 4,
                "end": 9,
                "id": "04"
            },
            {
                "start": 14,
                "end": 25,
                "id": "25"
            },
            {
                "start": 31,
                "end": 86,
                "id": "26"
            },
            {
                "start": 58,
                "end": 65,
                "id": "07",
                "loop": False
            },
            {
                "start": 88,
                "end": 110,
                "id": "08"
            },
            {
                "start": 131,
                "end": 147,
                "id": "09"
            },
            {
                "start": 182,
                "end": 203,
                "id": "10"
            }
        ],
            [
                {
                    "start": 6,
                    "end": 8,
                    "id": "24"
                },
                {
                    "start": 9,
                    "end": 26,
                    "id": "11"
                },
                {
                    "start": 58,
                    "end": 74,
                    "id": "12",

                }

        ],
            [
            {
                "start": 2,
                "end": 13,
                "id": "13"
            },
            {
                "start": 14,
                "end": 37,
                "id": "14"
            },
            {
                "start": 82,
                "end": 97,
                "id": "15"
            },
            {
                "start": 102,
                "end": 106,
                "id": "15"
            },
            {
                "start": 122,
                "end": 152,
                "id": "16",
                "loop": False
            },
        ],
            [
            {
                "start": 8,
                "end": 22,
                "id": "17"
            },
            {
                "start": 77,
                "end": 105,
                "id": "18",
                "loop": False
            },
            {
                "start": 108,
                "end": 154,
                "id": "19"
            }
        ],
            [
            {
                "start": 0,
                "end": 66,
                "id": "26"
            },
            {
                "start": 27,
                "end": 66,
                "id": "20",
                "loop": False
            },
            {
                "start": 81,
                "end": 99,
                "id": "21"
            }
        ],
            [
                {
                    "start": 0,
                    "end": 4,
                    "id": "23"
                }
        ]
        ],
    }
]

def generate_audio():
    for novel_index in range(NOVEL_COUNT):
        current_title = TITLES[novel_index]
        novel_dict = {
            "title": current_title,
            "content": []
        }
        for chapter_index in range(TITLES_DICT[current_title]):
            chapter = []
            file = f"/home/uq8273/repos/knk-novel-trial/data-script/{current_title}/ch{chapter_index}.txt"
            with open(file) as f:
                for line in f:
                    paragraph = []
                    sentences = re.findall(regex, line)
                    for sentence in sentences:
                        paragraph.append(dict())
                    chapter.append(paragraph)
            novel_dict["content"].append(chapter)
        knk_audio.append(novel_dict)

    novel_audio_index = 0
    for novel in ost:
        chapters_audio = novel["chapters"]
        chapter_audio_index = 0
        for chapter_audio in chapters_audio:
            for audio in chapter_audio:
                # temporarily setting the sentence index to 0 as the old system depends on paragraph position
                # current_novel_audio = knk_audio[novel_audio_index]
                # current_chapter_audio = current_novel_audio[chapter_audio_index]
                
                start_audio_dict = knk_audio[novel_audio_index]["content"][chapter_audio_index][audio["start"]][0]
                # temporarily setting the sentence index to 0 as the old system depends on paragraph position only
                end_audio_dict = knk_audio[novel_audio_index]["content"][chapter_audio_index][audio["end"]][0]

                if "start" not in start_audio_dict:
                    start_audio_dict["start"] = []
                if "end" not in end_audio_dict:
                    end_audio_dict["end"] = []

                start_audio_dict["start"].append({
                    "audio_id": audio["id"],
                    "vol": DEFAULT_VOLUME,
                    "loop": False if "loop" in audio else True
                })
                end_audio_dict["end"].append({
                    "audio_id": audio["id"],
                    "vol": DEFAULT_VOLUME,
                    "loop": False if "loop" in audio else True
                })

            chapter_audio_index += 1

        novel_audio_index += 1
                

    json_data = {
        "knk_audio": knk_audio
    }


    with open("knk_audio.json", "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    
    # Only used for testing
    # return knk_audio

def main():
    generate_audio()

if __name__ == "__main__":
    main()