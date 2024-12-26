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

knk_text = []

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