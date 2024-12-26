import generate_audio

def test_generate_audio():
  # setup
  novel_audio_index = 0
  chapter_audio_index = 0
  
  # invoke
  output = generate_audio.generate_audio()
  
  # analysis
  for novel_audio in generate_audio.ost:
    chapters_audio = novel_audio["chapters"] 
    for chapter_audio in chapters_audio:
      for audio in chapter_audio:
        start_sentence = output[novel_audio_index]["content"][chapter_audio_index][audio["start"]][0]
        assert "start" in start_sentence
        
        end_sentence = output[novel_audio_index]["content"][chapter_audio_index][audio["end"]][0]
        assert "end" in end_sentence
      chapter_audio_index += 1

    novel_audio_index += 1 
    chapter_audio_index = 0
  
  meow = "cat"

