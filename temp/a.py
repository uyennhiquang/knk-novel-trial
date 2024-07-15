import re
import json

# regex = '(?:(?<=\s|\"|\'|…|.)|^...)[^\.\?!;]+[\.\?!;…]+[\"\']?'
# regex = '(?:(?<=\s|…)|\"|\'|\.\.\.|\w)[^\.\?!;]+[\.\?!;…—]+[\"\']?'
regex = re.compile(r"\s*((?:\.{3})?(?:[^\".?!—-]*\"[^\"]+\")*[^\".?!—-]*(?:[.?!]+|\s*[-—]))")

def chapter(paragraphs):
    return {"texts": paragraphs}


TITLES = ("overlooking-view", "murder-speculation-1", "remaining-pain",
          "the-hollow-shrine", "paradox-paradigm", "fairytale", "murder-spec-2")

TITLES_DICT = {
    TITLES[0]: 6,
    TITLES[1]: 7,
    TITLES[2]: 8,
}

knk = []
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
                    "id": "01"
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
                "id": "07"
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
                "id": "18"
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

for novel_index in range(2):
    current_title = TITLES[novel_index]
    title_dict = {
        "title": current_title,
        "chapters": []
    }

    for chapter_index in range(TITLES_DICT[current_title]):
        file = f"{current_title}/ch{chapter_index}.txt"
        paragraphs = []
        try:
            chapter_tracks = ost[novel_index]["chapters"][chapter_index]
        except IndexError:
            chapter_tracks = []

        with open(file) as f:
            paragraph_index = 0
            for line in f:
                paragraph = {"sentences": re.findall(
                    regex, line)}
                if paragraph_index == 13 and chapter_index == 2:
                    print(paragraph)
                paragraphs.append(paragraph)

                audio_id = None
                for track in chapter_tracks:
                    if paragraph_index >= track["start"] and paragraph_index <= track["end"]:
                        if audio_id == None:
                            audio_id = [track["id"]]
                        else:
                            audio_id.append(track["id"])

                if audio_id != None:
                    paragraph["audioId"] = audio_id
                paragraph_index += 1

        chapter = {
            "texts": paragraphs
        }
        title_dict["chapters"].append(chapter)
    knk.append(title_dict)

json_data = {
    "knk": knk
}
with open("db.json", "w", encoding="utf-8") as f:
    json.dump(json_data, f, ensure_ascii=False, indent=2)
