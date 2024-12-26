import re
import json

# regex = '(?:(?<=\s|\"|\'|…|.)|^...)[^\.\?!;]+[\.\?!;…]+[\"\']?'
regex = '(?:(?<=\s|…)|\"|\'|\.\.\.|\w)[^\.\?!;]+[\.\?!;…—]+[\"\']?'
# regex = re.compile(r"\s*((?:\.{3})?(?:[^\".?!—-]*\"[^\"]+\")*[^\".?!—-]*(?:[.?!]+|\s*[—]))")


def chapter(paragraphs):
    return {"texts": paragraphs}


TITLES = ("overlooking-view", "murder-speculation-1", "remaining-pain",
          "the-hollow-shrine", "paradox-paradigm", "fairytale", "murder-speculation-2")

# A dictionary that maps a novel to the number of chapters it has. The primarily usage is for the iterator to know how many chapter text files to iterate over
TITLES_DICT = {
    TITLES[0]: 6,
    TITLES[1]: 7,
    TITLES[2]: 8,
}

knk_text = []
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

def generate_text():
    for novel_index in range(2):
        current_title = TITLES[novel_index]
        novel_dict = {
            "title": current_title,
            "content": []
        }
        for chapter_index in range(TITLES_DICT[current_title]):
            chapter = []
            file = f"{current_title}/ch{chapter_index}.txt"
            with open(file) as f:
                for line in f:
                    sentences = re.findall(regex, line)
                    paragraph = [{"en": sentence, "jp": ""}
                                for sentence in sentences]
                    chapter.append(paragraph)
            novel_dict["content"].append(chapter)
        knk_text.append(novel_dict)

    json_data = {
        "knk_text": knk_text
    }


    with open("knk_text.json", "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)

def main():
    generate_text()

if __name__ == "__main__":
    main()