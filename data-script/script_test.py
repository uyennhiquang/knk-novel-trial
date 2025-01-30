import generate_audio
import similarity

# def test_generate_audio():
#   # setup
#   novel_audio_index = 0
#   chapter_audio_index = 0
  
#   # invoke
#   output = generate_audio.generate_audio()
  
#   # analysis
#   for novel_audio in generate_audio.ost:
#     chapters_audio = novel_audio["chapters"] 
#     for chapter_audio in chapters_audio:
#       for audio in chapter_audio:
#         start_sentence = output[novel_audio_index]["content"][chapter_audio_index][audio["start"]][0]
#         assert "start" in start_sentence
        
#         end_sentence = output[novel_audio_index]["content"][chapter_audio_index][audio["end"]][0]
#         assert "end" in end_sentence
#       chapter_audio_index += 1

#     novel_audio_index += 1 
#     chapter_audio_index = 0
  
#   meow = "cat"

def test_similarity_1():
  JP = [
    "その合格発表の時、両儀式という名前があんまりに珍しいので覚えていたら、クラスが一緒になってしまった。",
    "以来、自分は式の数少ない友人の一人となった。", 
    "うちの学校は私服オッケーっていう進学校だったので、みなそれぞれの服装で自分を表現していたと思う。", 
    "そんな中、校内での式の姿はとても目立った。", 
    "なにしろ、いつも着物なのだ。", 
    "質素な着流しの立ち姿は式の撫で肩によく似合っていて、式が歩いているだけで教室が武家屋敷のように思えたほどだ、格好だけじゃなくて立ち居振る舞いにも一切の無駄がなく、授業中にしか言葉らしい言葉を口にしなかった。",
    "式がどんな人間かなんていうのは、この話だけで表れていると思う。"
]

  EN = [
      "You don't see a name like Ryougi Shiki every day, so it stuck in my mind when I went to see the application results. ",
      "And we ended up in the same class. ",
      "Since then, I became one of Shiki's very few friends.",
      "As our school did not have uniforms, I think everyone expressed themselves by how they dressed. ",
      "In that kind of crowd, Shiki stood out. ",
      "The reason was because Shiki always wore a kimono. ",
      "Always.",
      "The modest, informal look complemented Shiki's sloping shoulders so much that it made the classroom feel like a samurai-style house just by her walking, and it wasn't just her looks, either. ",
      "She made no unnecessary movements. ",
      "Only in class did she utter anything resembling words.",
      "I think that was the only thing that gave us any idea of what Shiki was like as a person."
  ]
  expected_jp_mapping = [0, 2, 3, 4, 5, 7, 10]
  expected_en_mapping = [0, 0, 1, 2, 3, 4, 4, 5, 5, 5, 6] 

  actual_jp_mapping, actual_en_mapping = similarity.generate_mapping(JP, EN)

  assert actual_jp_mapping == expected_jp_mapping
  assert actual_en_mapping == expected_en_mapping

