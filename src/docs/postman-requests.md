# ErasGames Question Creation API - Postman Testing Guide

This document provides comprehensive Postman request examples for testing all question types in the ErasGames Question Creation API.

## Base URL

```
http://localhost:3000
```

## Common Headers

```
Content-Type: application/json
```

## General Information

### Get Supported Question Types

```http
GET /questions/types
```

**Response:**

```json
{
  "supportedTypes": [
    "album-year-guess",
    "song-album-match",
    "fill-blank",
    "guess-by-lyric",
    "odd-one-out",
    "ai-visual",
    "sound-alike-snippet",
    "mood-match",
    "inspiration-map",
    "life-trivia",
    "timeline-order",
    "popularity-match",
    "longest-song",
    "tracklist-order",
    "outfit-era",
    "lyric-mashup",
    "speed-tap",
    "reverse-audio",
    "one-second"
  ]
}
```

---

## Question Creation Requests

### Main Endpoint

All requests use: `POST /questions/create`

---

## 1. Album Year Guess Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "album-year-guess",
  "difficulty": "medium",
  "themes": ["Albums"],
  "subjects": ["Taylor Swift"],
  "prompt": {
    "album_name": "1989"
  },
  "choices": [
    {
      "id": "choice1",
      "text": "2012"
    },
    {
      "id": "choice2",
      "text": "2014"
    },
    {
      "id": "choice3",
      "text": "2016"
    },
    {
      "id": "choice4",
      "text": "2018"
    }
  ],
  "correct": {
    "choiceId": "choice2"
  }
}
```

```Response
{
    "id": "e321ed6e-e138-488b-b660-d5c306cb5d8f",
    "questionType": "album-year-guess",
    "difficulty": "medium",
    "themesJSON": [
        "albums"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "album_name": "1989"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "text": "2012"
        },
        {
            "id": "choice2",
            "text": "2014"
        },
        {
            "id": "choice3",
            "text": "2016"
        },
        {
            "id": "choice4",
            "text": "2018"
        }
    ],
    "correctJSON": {
        "choiceId": "choice2"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:20:45.005Z"
}
```

---

## 2. Song Album Match Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "song-album-match",
  "difficulty": "hard",
  "themes": ["Albums"],
  "subjects": ["Taylor Swift"],
  "prompt": {
    "songs": ["Shake It Off", "Blank Space", "Bad Blood"],
    "albums": ["1989", "Reputation", "Lover", "Folklore"]
  },
  "correct": {
    "map": {
      "Shake It Off": "1989",
      "Blank Space": "1989",
      "Bad Blood": "1989"
    }
  }
}
```

```Response
{
    "id": "8c7fec49-6910-4b3e-9481-2c2bc14bba06",
    "questionType": "song-album-match",
    "difficulty": "hard",
    "themesJSON": [
        "albums"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "songs": [
            "Shake It Off",
            "Blank Space",
            "Bad Blood"
        ],
        "albums": [
            "1989",
            "Reputation",
            "Lover",
            "Folklore"
        ]
    },
    "choicesJSON": null,
    "correctJSON": {
        "map": {
            "Shake It Off": "1989",
            "Blank Space": "1989",
            "Bad Blood": "1989"
        }
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:22:32.742Z"
}
```

---

## 3. Fill Blank Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "fill-blank",
  "difficulty": "easy",
  "themes": ["Lyrics"],
  "subjects": ["Taylor Swift"],
  "prompt": {
    "sentence": "We are never ever getting back _______"
  },
  "choices": [
    {
      "id": "choice1",
      "text": "together"
    },
    {
      "id": "choice2",
      "text": "again"
    },
    {
      "id": "choice3",
      "text": "home"
    },
    {
      "id": "choice4",
      "text": "there"
    }
  ],
  "correct": {
    "choiceId": "choice1"
  }
}
```

```Response
{
    "id": "fead17d8-f5b6-4c24-91d1-0b471c329761",
    "questionType": "fill-blank",
    "difficulty": "easy",
    "themesJSON": [
        "lyrics"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "sentence": "We are never ever getting back _______"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "text": "together"
        },
        {
            "id": "choice2",
            "text": "again"
        },
        {
            "id": "choice3",
            "text": "home"
        },
        {
            "id": "choice4",
            "text": "there"
        }
    ],
    "correctJSON": {
        "choiceId": "choice1"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:24:56.864Z"
}
```

---

## 4. Guess By Lyric Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "guess-by-lyric",
  "difficulty": "medium",
  "themes": ["Lyrics"],
  "subjects": ["Taylor Swift"],
  "prompt": {
    "lyric": "You were my crown, now I'm in exile seeing you out"
  },
  "choices": [
    {
      "id": "choice1",
      "text": "exile"
    },
    {
      "id": "choice2",
      "text": "cardigan"
    },
    {
      "id": "choice3",
      "text": "the 1"
    },
    {
      "id": "choice4",
      "text": "august"
    }
  ],
  "correct": {
    "choiceId": "choice1"
  }
}
```

```Response
{
    "id": "6ee669ad-f509-4612-b32d-f2c2904843be",
    "questionType": "guess-by-lyric",
    "difficulty": "medium",
    "themesJSON": [
        "lyrics"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "lyric": "You were my crown, now I'm in exile seeing you out"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "text": "exile"
        },
        {
            "id": "choice2",
            "text": "cardigan"
        },
        {
            "id": "choice3",
            "text": "the 1"
        },
        {
            "id": "choice4",
            "text": "august"
        }
    ],
    "correctJSON": {
        "choiceId": "choice1"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:25:58.047Z"
}
```

---

## 5. Odd One Out Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "odd-one-out",
  "difficulty": "medium",
  "themes": ["lyrics"],
  "subjects": ["Taylor Swift"],
  "prompt": {
    "instruction": "Which album doesn't belong with the others?",
    "items": ["1989", "Reputation", "Lover", "The White Album"]
  },
  "choices": [
    {
      "id": "choice1",
      "text": "1989"
    },
    {
      "id": "choice2",
      "text": "Reputation"
    },
    {
      "id": "choice3",
      "text": "Lover"
    },
    {
      "id": "choice4",
      "text": "The White Album"
    }
  ],
  "correct": {
    "choiceId": "choice4"
  }
}
```

```Response
{
    "id": "337f72e3-d8ff-46ed-b88c-42ccbb074c38",
    "questionType": "odd-one-out",
    "difficulty": "medium",
    "themesJSON": [
        "lyrics"
    ],
    "subjectsJSON": [
        "Taylor Swift"
    ],
    "promptJSON": {
        "instruction": "Which album doesn't belong with the others?",
        "items": [
            "1989",
            "Reputation",
            "Lover",
            "The White Album"
        ]
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "text": "1989"
        },
        {
            "id": "choice2",
            "text": "Reputation"
        },
        {
            "id": "choice3",
            "text": "Lover"
        },
        {
            "id": "choice4",
            "text": "The White Album"
        }
    ],
    "correctJSON": {
        "choiceId": "choice4"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:27:33.545Z"
}
```

---

## 6. AI Visual Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "ai-visual",
  "difficulty": "hard",
  "themes": ["Visual"],
  "subjects": ["Album Covers"],
  "prompt": {
    "description": "Identify the album from this AI-generated visual representation"
  },
  "choices": [
    {
      "id": "choice1",
      "url": "https://example.com/album-cover-1.jpg"
    },
    {
      "id": "choice2",
      "url": "https://example.com/album-cover-2.jpg"
    },
    {
      "id": "choice3",
      "url": "https://example.com/album-cover-3.jpg"
    },
    {
      "id": "choice4",
      "url": "https://example.com/album-cover-4.jpg"
    }
  ],
  "correct": {
    "choiceId": "choice2"
  }
}
```

```Response
{
    "id": "516581e2-3905-47e2-af6f-f79d09e2e61a",
    "questionType": "ai-visual",
    "difficulty": "hard",
    "themesJSON": [
        "visuals"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "description": "Identify the album from this AI-generated visual representation"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "url": "https://example.com/album-cover-1.jpg"
        },
        {
            "id": "choice2",
            "url": "https://example.com/album-cover-2.jpg"
        },
        {
            "id": "choice3",
            "url": "https://example.com/album-cover-3.jpg"
        },
        {
            "id": "choice4",
            "url": "https://example.com/album-cover-4.jpg"
        }
    ],
    "correctJSON": {
        "choiceId": "choice2"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:28:24.923Z"
}
```

---

## 7. Sound Alike Snippet Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "sound-alike-snippet",
  "difficulty": "hard",
  "themes": ["audio"],
  "subjects": ["Songs"],
  "prompt": {
    "description": "Which song does this snippet sound most similar to?"
  },
  "choices": [
    {
      "id": "choice1",
      "url": "https://example.com/audio-snippet-1.mp3"
    },
    {
      "id": "choice2",
      "url": "https://example.com/audio-snippet-2.mp3"
    },
    {
      "id": "choice3",
      "url": "https://example.com/audio-snippet-3.mp3"
    }
  ],
  "correct": {
    "choiceId": "choice1"
  }
}
```

```Response
{
    "id": "5b5ca23c-21c1-4884-9627-64f4c5b3439e",
    "questionType": "sound-alike-snippet",
    "difficulty": "hard",
    "themesJSON": [
        "audio"
    ],
    "subjectsJSON": [
        "Songs"
    ],
    "promptJSON": {
        "description": "Which song does this snippet sound most similar to?"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "url": "https://example.com/audio-snippet-1.mp3"
        },
        {
            "id": "choice2",
            "url": "https://example.com/audio-snippet-2.mp3"
        },
        {
            "id": "choice3",
            "url": "https://example.com/audio-snippet-3.mp3"
        }
    ],
    "correctJSON": {
        "choiceId": "choice1"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:29:55.573Z"
}
```

---

## 8. Mood Match Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "mood-match",
  "difficulty": "medium",
  "themes": ["Mood"],
  "subjects": ["Songs"],
  "prompt": {
    "mood_description": "Melancholy and introspective"
  },
  "choices": [
    {
      "id": "choice1",
      "url": "https://example.com/song1.jpg"
    },
    {
      "id": "choice2",
      "url": "https://example.com/song2.jpg"
    },
    {
      "id": "choice3",
      "url": "https://example.com/song3.jpg"
    }
  ],
  "correct": {
    "choiceId": "choice3"
  }
}
```

```Response
{
    "id": "34411fb0-440f-465f-80cf-fbe0100dd7ce",
    "questionType": "mood-match",
    "difficulty": "medium",
    "themesJSON": [
        "mood"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "mood_description": "Melancholy and introspective"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "url": "https://example.com/song1.jpg"
        },
        {
            "id": "choice2",
            "url": "https://example.com/song2.jpg"
        },
        {
            "id": "choice3",
            "url": "https://example.com/song3.jpg"
        }
    ],
    "correctJSON": {
        "choiceId": "choice3"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:30:33.875Z"
}
```

---

## 9. Inspiration Map Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "inspiration-map",
  "difficulty": "hard",
  "themes": ["Inspiration"],
  "subjects": ["Artists"],
  "prompt": {
    "concept": "Folk storytelling meets modern pop production"
  },
  "choices": [
    {
      "id": "choice1",
      "text": "folklore"
    },
    {
      "id": "choice2",
      "text": "1989"
    },
    {
      "id": "choice3",
      "text": "Reputation"
    }
  ],
  "correct": {
    "choiceId": "choice1"
  }
}
```

```Response
{
    "id": "7de73a4c-ccb8-46e8-ac0f-d234ee7111b7",
    "questionType": "inspiration-map",
    "difficulty": "hard",
    "themesJSON": [
        "inspiration"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "concept": "Folk storytelling meets modern pop production"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "text": "folklore"
        },
        {
            "id": "choice2",
            "text": "1989"
        },
        {
            "id": "choice3",
            "text": "Reputation"
        }
    ],
    "correctJSON": {
        "choiceId": "choice1"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:31:09.363Z"
}
```

---

## 10. Life Trivia Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "life-trivia",
  "difficulty": "easy",
  "themes": ["Trivia"],
  "subjects": ["Taylor Swift"],
  "prompt": {
    "question": "In what year was Taylor Swift born?"
  },
  "choices": [
    {
      "id": "choice1",
      "text": "1989"
    },
    {
      "id": "choice2",
      "text": "1990"
    },
    {
      "id": "choice3",
      "text": "1991"
    },
    {
      "id": "choice4",
      "text": "1992"
    }
  ],
  "correct": {
    "choiceId": "choice1"
  }
}
```

```Response
{
    "id": "4acac734-ca77-468f-a835-8d921cff2e9b",
    "questionType": "life-trivia",
    "difficulty": "easy",
    "themesJSON": [
        "trivia"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "question": "In what year was Taylor Swift born?"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "text": "1989"
        },
        {
            "id": "choice2",
            "text": "1990"
        },
        {
            "id": "choice3",
            "text": "1991"
        },
        {
            "id": "choice4",
            "text": "1992"
        }
    ],
    "correctJSON": {
        "choiceId": "choice1"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:31:46.870Z"
}
```

---

## 11. Timeline Order Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "timeline-order",
  "difficulty": "medium",
  "themes": ["Timeline"],
  "subjects": ["Albums"],
  "prompt": {
    "instruction": "Arrange these albums in chronological order",
    "items": ["Reputation", "folklore", "1989", "Lover"]
  },
  "correct": {
    "order": ["1989", "Reputation", "Lover", "folklore"]
  }
}
```

```Response
{
    "id": "16e62e07-e9a0-418c-aeed-1ad1584e8b11",
    "questionType": "timeline-order",
    "difficulty": "medium",
    "themesJSON": [
        "timeline"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "instruction": "Arrange these albums in chronological order",
        "items": [
            "Reputation",
            "folklore",
            "1989",
            "Lover"
        ]
    },
    "choicesJSON": null,
    "correctJSON": {
        "order": [
            "1989",
            "Reputation",
            "Lover",
            "folklore"
        ]
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:32:25.673Z"
}
```

---

## 12. Popularity Match Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "popularity-match",
  "difficulty": "hard",
  "themes": ["Popularity"],
  "subjects": ["Songs"],
  "prompt": {
    "instruction": "Rank these songs from most to least popular"
  },
  "choices": [
    {
      "id": "choice1",
      "text": "Shake It Off"
    },
    {
      "id": "choice2",
      "text": "Anti-Hero"
    },
    {
      "id": "choice3",
      "text": "Blank Space"
    },
    {
      "id": "choice4",
      "text": "cardigan"
    }
  ],
  "correct": {
    "order": ["choice2", "choice1", "choice3", "choice4"]
  }
}
```

```Response
{
    "id": "ca934ada-a9f3-491f-aa41-cc62d7a558b6",
    "questionType": "popularity-match",
    "difficulty": "hard",
    "themesJSON": [
        "popularity"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "instruction": "Rank these songs from most to least popular"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "text": "Shake It Off"
        },
        {
            "id": "choice2",
            "text": "Anti-Hero"
        },
        {
            "id": "choice3",
            "text": "Blank Space"
        },
        {
            "id": "choice4",
            "text": "cardigan"
        }
    ],
    "correctJSON": {
        "order": [
            "choice2",
            "choice1",
            "choice3",
            "choice4"
        ]
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:33:18.847Z"
}
```

---

## 13. Longest Song Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "longest-song",
  "difficulty": "medium",
  "themes": ["Songs"],
  "subjects": ["Duration"],
  "prompt": {
    "instruction": "Which is the longest song?"
  },
  "choices": [
    {
      "id": "choice1",
      "text": "All Too Well (10 Minute Version)"
    },
    {
      "id": "choice2",
      "text": "Shake It Off"
    },
    {
      "id": "choice3",
      "text": "Love Story"
    }
  ],
  "correct": {
    "choiceId": "choice1"
  }
}
```

```Response
{
    "id": "4bf5afbb-210c-44a5-93cd-0796b48aba3a",
    "questionType": "longest-song",
    "difficulty": "medium",
    "themesJSON": [
        "songs"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "instruction": "Which is the longest song?"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "text": "All Too Well (10 Minute Version)"
        },
        {
            "id": "choice2",
            "text": "Shake It Off"
        },
        {
            "id": "choice3",
            "text": "Love Story"
        }
    ],
    "correctJSON": {
        "choiceId": "choice1"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:34:09.191Z"
}
---
```

## 14. Tracklist Order Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "tracklist-order",
  "difficulty": "hard",
  "themes": ["Tracklist"],
  "subjects": ["Albums"],
  "prompt": {
    "album_name": "1989",
    "tracks": ["Shake It Off", "Welcome To New York", "Blank Space", "Style"]
  },
  "correct": {
    "order": ["Welcome To New York", "Blank Space", "Style", "Shake It Off"]
  }
}
```

```Response
{
    "id": "901c0c58-bff0-4475-9a01-1248cd95b04f",
    "questionType": "tracklist-order",
    "difficulty": "hard",
    "themesJSON": [
        "tracklist"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "album_name": "1989",
        "tracks": [
            "Shake It Off",
            "Welcome To New York",
            "Blank Space",
            "Style"
        ]
    },
    "choicesJSON": null,
    "correctJSON": {
        "order": [
            "Welcome To New York",
            "Blank Space",
            "Style",
            "Shake It Off"
        ]
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:34:39.844Z"
}
```

---

## 15. Outfit Era Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "outfit-era",
  "difficulty": "medium",
  "themes": ["Fashion"],
  "subjects": ["Eras"],
  "prompt": {
    "era_description": "Dark, edgy aesthetic with snake imagery"
  },
  "choices": [
    {
      "id": "choice1",
      "url": "https://example.com/reputation-outfit.jpg"
    },
    {
      "id": "choice2",
      "url": "https://example.com/folklore-outfit.jpg"
    },
    {
      "id": "choice3",
      "url": "https://example.com/lover-outfit.jpg"
    }
  ],
  "correct": {
    "choiceId": "choice1"
  }
}
```

```Response
{
    "id": "80d281ae-bbe9-40d9-910f-e28aa9b0f4da",
    "questionType": "outfit-era",
    "difficulty": "medium",
    "themesJSON": [
        "outfits"
    ],
    "subjectsJSON": [],
    "promptJSON": {
        "era_description": "Dark, edgy aesthetic with snake imagery"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "url": "https://example.com/reputation-outfit.jpg"
        },
        {
            "id": "choice2",
            "url": "https://example.com/folklore-outfit.jpg"
        },
        {
            "id": "choice3",
            "url": "https://example.com/lover-outfit.jpg"
        }
    ],
    "correctJSON": {
        "choiceId": "choice1"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:36:14.326Z"
}
```

---

## 16. Lyric Mashup Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "lyric-mashup",
  "difficulty": "hard",
  "themes": ["lyrics"],
  "subjects": ["Songs"],
  "prompt": {
    "lyrics": [
      {
        "id": "lyric1",
        "text": "We are never ever getting back together"
      },
      {
        "id": "lyric2",
        "text": "You belong with me"
      },
      {
        "id": "lyric3",
        "text": "Shake it off, shake it off"
      }
    ],
    "songs": [
      {
        "id": "song1",
        "title": "We Are Never Ever Getting Back Together"
      },
      {
        "id": "song2",
        "title": "You Belong With Me"
      },
      {
        "id": "song3",
        "title": "Shake It Off"
      }
    ]
  },
  "correct": {
    "map": {
      "lyric1": "song1",
      "lyric2": "song2",
      "lyric3": "song3"
    }
  }
}
```

```Response
{
    "id": "a43087e0-9398-4766-a7e6-f869956e5af1",
    "questionType": "lyric-mashup",
    "difficulty": "hard",
    "themesJSON": [
        "lyrics"
    ],
    "subjectsJSON": [
        "Songs"
    ],
    "promptJSON": {
        "lyrics": [
            {
                "id": "lyric1",
                "text": "We are never ever getting back together"
            },
            {
                "id": "lyric2",
                "text": "You belong with me"
            },
            {
                "id": "lyric3",
                "text": "Shake it off, shake it off"
            }
        ],
        "songs": [
            {
                "id": "song1",
                "title": "We Are Never Ever Getting Back Together"
            },
            {
                "id": "song2",
                "title": "You Belong With Me"
            },
            {
                "id": "song3",
                "title": "Shake It Off"
            }
        ]
    },
    "choicesJSON": null,
    "correctJSON": {
        "map": {
            "lyric1": "song1",
            "lyric2": "song2",
            "lyric3": "song3"
        }
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:39:13.461Z"
}
```

---

## 17. Speed Tap Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "speed-tap",
  "difficulty": "easy",
  "themes": ["speed"],
  "subjects": ["Songs"],
  "prompt": {
    "rule": "Tap all Taylor Swift songs as fast as possible",
    "options": ["Shake It Off", "Shape of You", "Blank Space", "Blinding Lights", "Anti-Hero"]
  },
  "correct": {
    "sequence": ["Shake It Off", "Blank Space", "Anti-Hero"]
  }
}
```

```Response
{
    "id": "c8b4cdb7-d5e8-41a8-ae63-eb6872a28aed",
    "questionType": "speed-tap",
    "difficulty": "easy",
    "themesJSON": [
        "speed"
    ],
    "subjectsJSON": [
        "Songs"
    ],
    "promptJSON": {
        "rule": "Tap all Taylor Swift songs as fast as possible",
        "options": [
            "Shake It Off",
            "Shape of You",
            "Blank Space",
            "Blinding Lights",
            "Anti-Hero"
        ]
    },
    "choicesJSON": null,
    "correctJSON": {
        "sequence": [
            "Shake It Off",
            "Blank Space",
            "Anti-Hero"
        ]
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:40:09.348Z"
}
```

---

## 18. Reverse Audio Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "reverse-audio",
  "difficulty": "hard",
  "themes": ["audio"],
  "subjects": ["Songs"],
  "prompt": {
    "instruction": "What song is this when played in reverse?"
  },
  "choices": [
    {
      "id": "choice1",
      "url": "https://example.com/song1.mp3"
    },
    {
      "id": "choice2",
      "url": "https://example.com/song2.mp3"
    },
    {
      "id": "choice3",
      "url": "https://example.com/song3.mp3"
    }
  ],
  "correct": {
    "choiceId": "choice2"
  }
}
```

```Response
{
    "id": "f412e39b-7e5e-4d6c-b4f7-4486087442f0",
    "questionType": "reverse-audio",
    "difficulty": "hard",
    "themesJSON": [
        "audio"
    ],
    "subjectsJSON": [
        "Songs"
    ],
    "promptJSON": {
        "instruction": "What song is this when played in reverse?"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "url": "https://example.com/song1.mp3"
        },
        {
            "id": "choice2",
            "url": "https://example.com/song2.mp3"
        },
        {
            "id": "choice3",
            "url": "https://example.com/song3.mp3"
        }
    ],
    "correctJSON": {
        "choiceId": "choice2"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:41:02.549Z"
}
```

---

## 19. One Second Questions

**Request:**

```http
POST /questions/create
Content-Type: application/json

{
  "questionType": "one-second",
  "difficulty": "hard",
  "themes": ["Audio"],
  "subjects": ["Songs"],
  "prompt": {
    "instruction": "Identify the song from this one-second clip"
  },
  "choices": [
    {
      "id": "choice1",
      "url": "https://example.com/snippet1.mp3"
    },
    {
      "id": "choice2",
      "url": "https://example.com/snippet2.mp3"
    },
    {
      "id": "choice3",
      "url": "https://example.com/snippet3.mp3"
    }
  ],
  "correct": {
    "choiceId": "choice1"
  }
}
```

```Response
{
    "id": "1b36a618-7924-42f2-8f1b-ad6881969615",
    "questionType": "one-second",
    "difficulty": "hard",
    "themesJSON": [
        "audio"
    ],
    "subjectsJSON": [
        "Songs"
    ],
    "promptJSON": {
        "instruction": "Identify the song from this one-second clip"
    },
    "choicesJSON": [
        {
            "id": "choice1",
            "url": "https://example.com/snippet1.mp3"
        },
        {
            "id": "choice2",
            "url": "https://example.com/snippet2.mp3"
        },
        {
            "id": "choice3",
            "url": "https://example.com/snippet3.mp3"
        }
    ],
    "correctJSON": {
        "choiceId": "choice1"
    },
    "mediaJSON": null,
    "approved": true,
    "disabled": false,
    "exposureCount": 0,
    "lastUsedAt": null,
    "updatedAt": "2025-09-13T21:41:40.572Z"
}
```

---

## Batch Creation

### Create Multiple Questions

```http
POST /questions/create/batch
Content-Type: application/json

[
  {
    "questionType": "album-year-guess",
    "difficulty": "easy",
    "themes": ["Albums"],
    "subjects": ["Taylor Swift"],
    "prompt": {
      "album_name": "Lover"
    },
    "choices": [
      {
        "id": "choice1",
        "text": "2019"
      },
      {
        "id": "choice2",
        "text": "2020"
      }
    ],
    "correct": {
      "choiceId": "choice1"
    }
  },
  {
    "questionType": "life-trivia",
    "difficulty": "medium",
    "themes": ["Trivia"],
    "subjects": ["Taylor Swift"],
    "prompt": {
      "question": "What is Taylor Swift's middle name?"
    },
    "choices": [
      {
        "id": "choice1",
        "text": "Alison"
      },
      {
        "id": "choice2",
        "text": "Anne"
      }
    ],
    "correct": {
      "choiceId": "choice1"
    }
  }
]
```

---

## Response Format

All successful requests return a Question object:

```json
{
  "id": "uuid-string",
  "questionType": "album-year-guess",
  "difficulty": "medium",
  "themesJSON": ["Albums"],
  "subjectsJSON": ["Taylor Swift"],
  "promptJSON": {
    "album_name": "1989"
  },
  "choicesJSON": [
    {
      "id": "choice1",
      "text": "2012"
    },
    {
      "id": "choice2",
      "text": "2014"
    }
  ],
  "correctJSON": {
    "choiceId": "choice2"
  },
  "mediaJSON": null,
  "approved": true,
  "disabled": false,
  "exposureCount": 0,
  "lastUsedAt": null,
  "createdAt": "2025-09-03T17:23:00.000Z",
  "updatedAt": "2025-09-03T17:23:00.000Z"
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Unsupported Question Type (400)

```json
{
  "statusCode": 400,
  "message": "Unsupported question type: invalid-type",
  "error": "Bad Request"
}
```

---

## Important Notes

1. **Question Types**: Use dash-separated values (e.g., `"album-year-guess"`, not `"album_year_guess"`)
2. **Difficulty**: Must be one of: `"easy"`, `"medium"`, `"hard"`
3. **Themes**: Array of strings representing question themes
4. **Subjects**: Array of strings representing question subjects
5. **Media References**: Optional array for image/audio URLs
6. **Choice IDs**: Must be unique within each question
7. **Correct Answers**: Format varies by question type (single choice, order, map)

---

## Testing Tips

1. Start with simple question types like `life-trivia` or `album-year-guess`
2. Test validation by sending invalid data (wrong difficulty, missing fields)
3. Test batch creation with multiple question types
4. Verify the database persistence by checking the returned IDs
5. Test the GET endpoint to confirm supported types match your requests

Happy testing! 🎵
