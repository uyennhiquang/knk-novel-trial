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


"""
Creates two JSON: 1 is the structural text in English, 1 is the mapping of a sentence's index among all the sentences within a novel to its actual position in the structural JSON
"""
def generate_text():
    knk_text = []
    index_position = [] # mapping of sentence-based position to hierarchical position in a novel 
    sentence_count_total = 0
    for novel_index in range(2):
        novel_index_position = [] 
        sentence_count = 0

        current_title = TITLES[novel_index]
        novel_dict = {
            "title": current_title,
            "content": []
        }

        for chapter_index in range(TITLES_DICT[current_title]):
            chapter = []
            file = f"{current_title}/ch{chapter_index}.txt"
            with open(file) as f:
                paragraph_index = 0
                for line in f:
                    sentences = re.findall(regex, line)
                    paragraph = []
                    for sentence_index in range(len(sentences)):
                        position = {
                            "novel": novel_index,
                            "chapter": chapter_index,
                            "paragraph": paragraph_index,
                            "sentence": sentence_index
                        }
                        sentence_dict = {"en": sentences[sentence_index], "jp": "", "position": position} # position property is only for debugging
                        
                        novel_index_position.append(position)
                        sentence_count += 1
                        sentence_count_total += 1
                        paragraph.append(sentence_dict)

                    chapter.append(paragraph)
                    paragraph_index += 1
            novel_dict["content"].append(chapter)

        knk_text.append(novel_dict)
        index_position.append(novel_index_position)

    json_data_text = {
        "knk_text": knk_text
    }

    json_data_index_position = index_position

    actual_sentence_total = 0
    for novel_index_position in index_position:
        actual_sentence_total += len(novel_index_position)
    
    
    print(sentence_count_total, actual_sentence_total)

    with open("knk_text.json", "w", encoding="utf-8") as f:
        json.dump(json_data_text, f, ensure_ascii=False, indent=2)
    with open("knk_index_position.json", "w", encoding="utf-8") as f:
        json.dump(json_data_index_position, f, ensure_ascii=False, indent=2)

def main():
    generate_text()

if __name__ == "__main__":
    main()