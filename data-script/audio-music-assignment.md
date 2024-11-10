For convenience's sake, the numbers correspond to the actual indices of the novel/chapter/paragraph/sentence (index starting 0 - looking at you MatLab). Only use the data below as a reference as the mapping from audio to location, not the actual formatting. For reference, the sentence object JSON formatting should be:

```json
{
  "en": "text",
  "jp": "text",
  "bgm": [], // fill this with track objects
  "sfx": [], // see above
  "sprites": [], // keep these two empty for now
  "bg": [],
}
```

And for the track
```json
{
  "audioId": "00",
  "vol": "0.5",
  "repeat": "true", // note that you may or may not have to capitalize/uncapitalize the T, python sux!!!
}
```

(For copy-paste purposes) 
```python
{
  "audioId": 01,
  "vol": 0.5,
  "repeat" True,
  "start": {
    "novel" 0,
    "chapter" 0,
    "paragraph" 0,
    "sentence" 0,
  }
  "end":{
    "novel" 0,
    "chapter" 0,
    "paragraph" 0,
    "sentence" 0,
  }
}
```

## Novel 0 - Overlooking View

### Chapter

0. Nothing here
1. Tracks:

```python
{
  "audioId": 02,
  "vol": 0.5,
  "repeat" True,
  "start": {
    "novel" 0,
    "chapter" 1,
    "paragraph" 40,
    "sentence" ,
  }
  "end":{
    "novel" 0,
    "chapter" 1,
    "paragraph" 64,
    "sentence" 0,
  }
},
{
  "audioId": 01,
  "vol": 0.5,
  "repeat" True,
  "start": {
    "novel" 0,
    "chapter" 0,
    "paragraph" 0,
    "sentence" 0,
  }
  "end":{
    "novel" 0,
    "chapter" 0,
    "paragraph" 0,
    "sentence" 0,
  }
}

```
