from sentence_transformers import SentenceTransformer

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

# Two lists of sentences
JP = [
    "その合格発表の時、両儀式という名前があんまりに珍しいので覚えていたら、クラスが一緒になってしまった。",
    "以来、自分は式の数少ない友人の一人となった。",
    "うちの学校は私服オッケーっていう進学校だったので、みなそれぞれの服装で自分を表現していたと思う。",
    "そんな中、校内での式の姿はとても目立った。",
    "なにしろ、いつも着物なのだ。", 
]

EN = [
    "You don't see a name like Ryougi Shiki every day, so it stuck in my mind when I went to see the application results. ",
    "And we ended up in the same class. ",
    "Since then, I became one of Shiki's very few friends.",
    "As our school did not have uniforms, I think everyone expressed themselves by how they dressed. ",
    "In that kind of crowd, Shiki stood out. ",
    "The reason was because Shiki always wore a kimono. ",
    "Always."
]


def generate_mapping(jp, en):
    jp_index = en_index = 0
    # <language>_mapping = mapping from this language to a different language
    jp_mapping = []
    en_mapping = []

    for jp_index in range(len(jp)):
        found_highest = False
        # en_matched_indices = [en_index]
        en_matched_indices = []

        jp_sentence = jp[jp_index]
        while not found_highest:
            en_matched_indices.append(en_index)

            en_sentence = "".join([en[i] for i in en_matched_indices])
            
            if en_index+1 == len(en):
                jp_mapping.append(en_matched_indices[0])
                for _ in en_matched_indices:
                    en_mapping.append(jp_index)
                break
                
            next_en_sentence = en_sentence + en[en_index+1]

            # # Compute embeddings for both lists
            jp_embedding = model.encode(jp_sentence)
            en_embedding = model.encode(en_sentence)
            next_en_embedding = model.encode(next_en_sentence)

            # Compare jp sentence with current en sentence(s)
            simil = model.similarity(jp_embedding, en_embedding)

            # Compare jp sentence w/ current + next sentence
            next_simil = model.similarity(jp_embedding, next_en_embedding)

            # Does the new combination have a higher similarity than our current sentence(s)?
            # If no, set the appropriate mappings for both arrays
            if (not (next_simil.item() >= simil.item())):
                jp_mapping.append(en_matched_indices[0])
                for _ in en_matched_indices:
                    en_mapping.append(jp_index)
                found_highest = True

            # Otherwise, repeat with next en sentences

            en_index += 1

    return [jp_mapping, en_mapping]

def main():
    # Compute embeddings for both lists
    # jp_embedding = model.encode(jp)
    # en_embedding = model.encode(en)

    # Compute cosine similarities
    # similarities = model.similarity(jp_embedding, en_embedding)


    # Output the pairs with their score
    # for idx_i, jp_sentence in enumerate(jp):
    #     print(jp_sentence)
    #     for idx_j, en_sentence in enumerate(en):
    #         print(f" - {en_sentence : <30}: {similarities[idx_i][idx_j]:.4f}")

    # Compute embeddings for both lists
    # s1 = model.encode("今日はいいね!")
    # s2 = model.encode("Today is a great day!")

    # Compute cosine similarities
    # similarities = model.similarity(s1 , s2)

    # print(similarities.item()) # value of 1-element tensor

    # Output the pairs with their score
    # for idx_i, jp_sentence in enumerate(jp):
    #     print(jp_sentence)
    #     for idx_j, en_sentence in enumerate(en):
    #         print(f" - {en_sentence : <30}: {similarities[idx_i][idx_j]:.4f}")
    print(generate_mapping(JP, EN))

if __name__ == "__main__":
    main()