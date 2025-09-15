# Question Types Documentation

This document provides comprehensive documentation for all 19 question types available in the Eras Quiz system. Each question type is designed to test different aspects of Taylor Swift knowledge through various interactive mechanics within the daily quiz format.

## Overview

Eras Quiz is a daily competitive quiz for Taylor Swift fans featuring 6 questions per day (3 easy, 2 medium, 1 hard) selected from 19 different question types. Players have a 1-hour window to start after the daily drop and 10 minutes base time to complete (extendable with subscriptions).

## Basic Question Structure

All questions extend from the `BasicQuestion` interface which includes:

- `id`: Unique identifier
- `questionType`: Type of question (one of 19 types)
- `difficulty`: easy | medium | hard (weighted for scoring: easy=1, medium=2, hard=3)
- `themes`: Array of thematic tags (lyrics, charts, aesthetic, timeline, career, audio, etc.)
- `subjects`: Array of subject tags (song:..., album:..., tour:..., etc.)
- `prompt`: Question-specific prompt object
- `choices`: Array of possible answers (optional, depends on question type)
- `correct`: Correct answer structure (varies by question type)
- `mediaRefs`: Array of media references (images/audio) (optional)
- `scoringHints`: Additional scoring configuration (optional)

## Content Guidelines

- **No portraits, logos, or masters**: Only era-inspired assets are used
- **Short/paraphrased lyrics**: Avoid full lyric reproduction
- **Era-inspired visuals only**: AI-generated content that captures era aesthetics
- Questions are tagged by themes and subjects, not always era-bound
- Daily modes include: mix (varied themes), spotlight (one theme), or event-specific

## Question Types

### 1. Album Year Guess (`album_year_guess`)

**Description**: Player is shown an album and must select the correct release year from multiple choices.

**Structure**:

- **Prompt**: `{ task: string; album: string; }` - Task description and album name
- **Choices**: `string[]` - Array of year options
- **Correct**: `number` - Index of correct year choice
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests knowledge of album release chronology and discography timeline.

**Technical Details**:

- Single-choice question type
- Choices shuffled deterministically using shared seed
- Part of timeline/chronology theme category

**Example**: Task: "What year was this album released?", Album: "Folklore", Choices: ["2019", "2020", "2021", "2022"]

---

### 2. Song Album Match (`song_album_match`)

**Description**: Player matches each song to its correct album from two lists.

**Structure**:

- **Prompt**: `{ task: string; left: string[]; right: string[]; }` - Task description and lists to match
- **Choices**: Not used (matching interface)
- **Correct**: `Record<string, string>` - Map from song to album
- **Answer Format**: `Record<string, string>` - Player's song-to-album mapping

**Use Case**: Tests detailed knowledge of which songs belong to which albums across Taylor Swift's discography.

**Technical Details**:

- Matching question type with no predetermined choices
- Both lists shuffled independently using deterministic seed
- Requires knowledge of complete discography
- Part of discography knowledge theme

**Example**: Task: "Match each song to its correct album", Left: ["Anti-Hero", "Lavender Haze"], Right: ["Midnights", "Folklore", "1989"]

---

### 3. Fill in the Blank (`fill_blank`)

**Description**: Player selects the correct word or phrase to complete a lyric or statement.

**Structure**:

- **Prompt**: `{ task: string; text: string; }` - Task description and text with blank
- **Choices**: `string[]` - Word/phrase options
- **Correct**: `number` - Index of correct choice
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests lyric memorization and attention to specific word choices using short, paraphrased lyric excerpts.

**Technical Details**:

- Single-choice question type
- Uses short/paraphrased lyrics to avoid copyright issues
- Part of lyrics theme category
- Can include audio snippets as media references

**Example**: Task: "Complete this lyric", Text: "You were my crown, now I'm in \_\_\_", Choices: ["exile", "flames", "pain", "ruins"]

---

### 4. Guess by Lyric (`guess_by_lyric`)

**Description**: Player is shown a lyric excerpt and must pick the correct song from multiple choices.

**Structure**:

- **Prompt**: `{ task: string; lyric: string; }` - Task description and lyric excerpt
- **Choices**: `string[]` - Song title options
- **Correct**: `number` - Index of correct song
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests ability to identify songs from specific lyric lines using short, paraphrased excerpts.

**Technical Details**:

- Single-choice question type
- Uses short/paraphrased lyrics to comply with content guidelines
- Part of lyrics theme category
- May include audio snippets as additional clues

**Example**: Task: "Which song contains this lyric?", Lyric: "It's a love story, baby just say yes", Choices: ["Love Story", "You Belong With Me", "White Horse", "Fearless"]

---

### 5. Odd One Out (`odd_one_out`)

**Description**: Player selects the item that does not fit the set rule among the choices.

**Structure**:

- **Prompt**: `{ task: string; setRule: string; }` - Task description and rule explanation
- **Choices**: `string[]` - Items where one doesn't fit the pattern
- **Correct**: `number` - Index of the odd item
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests pattern recognition and categorical knowledge across themes, eras, or other groupings.

**Technical Details**:

- Single-choice question type
- Requires understanding of thematic or categorical relationships
- Can span multiple theme categories (eras, albums, chart performance, etc.)
- No media typically required

**Example**: Task: "Which item doesn't belong?", SetRule: "Songs from the Fearless era", Choices: ["Love Story", "You Belong With Me", "Anti-Hero", "White Horse"]

---

### 6. AI Visual (`ai_visual`)

**Description**: Player is shown AI-generated images and must pick the one matching the described era or theme.

**Structure**:

- **Prompt**: `{ task: string; }` - Task description of target era/theme
- **Choices**: `string[]` - Choice labels for images
- **Correct**: `number` - Index of matching image
- **MediaRefs**: Required AI-generated images
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests visual era recognition and thematic understanding using era-inspired aesthetics.

**Technical Details**:

- Single-choice question with visual media
- Uses only AI-generated era-inspired visuals (no portraits/logos)
- Part of aesthetic theme category
- Images comply with content guidelines (era-inspired only)
- MediaRefs contain the actual image URLs

**Example**: Task: "Which image best represents the Folklore era aesthetic?", with AI-generated images showing different era-appropriate visual themes

---

### 7. Sound-alike Snippet (`sound_alike_snippet`)

**Description**: Player listens to audio clips and selects the one that matches the described sound or song pattern.

**Structure**:

- **Prompt**: `{ task: string; }` - Description of target sound to match
- **Choices**: `string[]` - Labels for audio options
- **Correct**: `number` - Index of matching clip
- **MediaRefs**: Required audio snippets
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests audio recognition and musical pattern identification without using copyrighted masters.

**Technical Details**:

- Single-choice question with audio media
- Uses sound-alike snippets, not original masters
- Part of audio theme category
- Requires audio pattern recognition skills
- MediaRefs contain the audio clip URLs

**Example**: Task: "Which clip has a similar sound pattern to the described song?", with various sound-alike audio snippets

---

### 8. Mood Match (`mood_match`)

**Description**: Player matches a song or snippet to the correct mood or emotional tag from the options.

**Structure**:

- **Prompt**: `{ task: string; moodTags: string[]; note?: string; }` - Task, available mood tags, and optional context
- **Choices**: `string[]` - Mood/tag options
- **Correct**: `number` - Index of correct mood
- **MediaRefs**: Optional audio snippets
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests understanding of emotional content and musical atmosphere through mood classification.

**Technical Details**:

- Single-choice question potentially with audio media
- Part of mood/emotional analysis theme category
- May include sound-alike snippets for context
- Tests emotional intelligence related to music

**Example**: Task: "What mood best describes this song?", MoodTags: ["nostalgic", "energetic", "melancholic", "uplifting"], Choices: ["Nostalgic", "Energetic", "Peaceful", "Angry"]

---

### 9. Inspiration Map (`inspiration_map`)

**Description**: Player selects the correct inspiration or relationship mapping for a song or creative work.

**Structure**:

- **Prompt**: `{ task: string; disclaimer?: string; }` - Task description and optional disclaimer
- **Choices**: `string[]` - Inspiration/relationship options
- **Correct**: `number` - Index of correct mapping
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests knowledge of song backstories, creative influences, and documented inspirations.

**Technical Details**:

- Single-choice question type
- Part of career/biographical theme category
- May include disclaimers about speculative content
- Focuses on documented or widely acknowledged inspirations
- No media typically required

**Example**: Task: "What is the documented inspiration for this song?", with various creative influence or life event options

---

### 10. Life Trivia (`life_trivia`)

**Description**: Player answers a trivia question about Taylor Swift's life, career milestones, or public information.

**Structure**:

- **Prompt**: `{ task: string; question: string; }` - Task description and specific question
- **Choices**: `string[]` - Answer options
- **Correct**: `number` - Index of correct answer
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests biographical and career milestone knowledge using publicly available information.

**Technical Details**:

- Single-choice question type
- Part of career/biographical theme category
- Uses only publicly available, documented information
- Can include career achievements, public milestones, etc.
- May include related media references

**Example**: Task: "Answer this trivia question", Question: "In which state was Taylor Swift born?", Choices: ["Pennsylvania", "Tennessee", "New York", "California"]

---

### 11. Timeline Order (`timeline_order`)

**Description**: Player arranges items (songs, albums, events, etc.) in the correct chronological order.

**Structure**:

- **Prompt**: `{ task: string; items: string[]; }` - Task description and items to order
- **Choices**: Not used (ordering interface)
- **Correct**: `string[]` - Correct chronological order
- **Answer Format**: `{ orderedItems: string[] }`

**Use Case**: Tests chronological knowledge and sequence understanding across career timeline.

**Technical Details**:

- Ordering question type with no predetermined choices
- Part of timeline theme category
- Items shuffled deterministically using seed
- Player must arrange in correct chronological sequence
- May include timeline images as media references

**Example**: Task: "Arrange these albums in chronological release order", Items: ["1989", "folklore", "Fearless", "Midnights"]

---

### 12. Popularity Match (`popularity_match`)

**Description**: Player arranges items (songs, albums, etc.) in their correct popularity ranking or order.

**Structure**:

- **Prompt**: `{ task: string; asOf: string; }` - Task description and time reference for rankings
- **Choices**: `string[]` - Items to rank
- **Correct**: `string[]` - Correct popularity order
- **Answer Format**: `{ orderedChoices: string[] }`

**Use Case**: Tests knowledge of commercial success, chart performance, and documented popularity metrics.

**Technical Details**:

- Ordering question type
- Part of charts/commercial success theme category
- Uses documented metrics (chart positions, streaming numbers, etc.)
- Time-stamped rankings with "asOf" date for accuracy
- May include chart data as media references

**Example**: Task: "Arrange these songs by peak chart position (highest to lowest)", AsOf: "2023-12-01", Choices: ["Anti-Hero", "Shake It Off", "Love Story", "Blank Space"]

---

### 13. Longest Song (`longest_song`)

**Description**: Player selects the longest song from a list of options based on track duration.

**Structure**:

- **Prompt**: `{ task: string; }` - Task description
- **Choices**: `string[]` - Song options to compare
- **Correct**: `number` - Index of longest song
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests knowledge of song durations and track characteristics across the discography.

**Technical Details**:

- Single-choice question type
- Part of track characteristics theme category
- Based on documented track durations
- May include audio previews as media references
- Tests detailed discography knowledge

**Example**: Task: "Which is the longest song?", Choices: ["All Too Well (Taylor's Version)", "I Knew You Were Trouble", "Love Story", "cardigan"]

---

### 14. Tracklist Order (`tracklist_order`)

**Description**: Player arranges tracks in the correct order for a specific album.

**Structure**:

- **Prompt**: `{ task: string; album: string; tracks: string[]; }` - Task description, album name, and tracks to order
- **Choices**: Not used (ordering interface)
- **Correct**: `string[]` - Correct track order
- **Answer Format**: `{ orderedTracks: string[] }`

**Use Case**: Tests detailed album knowledge and track sequence memorization for specific releases.

**Technical Details**:

- Ordering question type
- Part of album/discography theme category
- Tracks shuffled deterministically using seed
- Tests deep album knowledge and listening habits
- May include album artwork as media references

**Example**: Task: "Arrange these tracks in the correct album order", Album: "1989", Tracks: ["Shake It Off", "Blank Space", "Welcome to New York", "Style"]

---

### 15. Outfit Era (`outfit_era`)

**Description**: Player is shown images and must select the outfit/styling that matches the described era aesthetic.

**Structure**:

- **Prompt**: `{ task: string; }` - Era description and context
- **Choices**: `string[]` - Labels for outfit options
- **Correct**: `number` - Index of era-matching outfit
- **MediaRefs**: Required outfit/styling images
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests visual era recognition and fashion evolution knowledge through era-appropriate styling.

**Technical Details**:

- Single-choice question with visual media
- Part of aesthetic theme category
- Uses only era-inspired images (no actual portraits)
- MediaRefs contain outfit/styling image URLs
- Tests knowledge of visual era evolution

**Example**: Task: "Which outfit best represents the described era aesthetic?", with era-inspired styling images representing different periods

---

### 16. Lyric Mashup (`lyric_mashup`)

**Description**: Player matches multiple lyric snippets to their correct songs in a mashup challenge.

**Structure**:

- **Prompt**: `{ task: string; snippets: string[]; optionsPerSnippet: string[]; }` - Task, lyric snippets, and song options
- **Choices**: Not used (matching interface)
- **Correct**: `Record<string, string>` - Map from snippet to correct song
- **Answer Format**: `Record<string, string>` - Player's snippet-to-song mapping

**Use Case**: Tests ability to identify multiple songs from mixed, paraphrased lyric fragments simultaneously.

**Technical Details**:

- Complex matching question type
- Part of lyrics theme category
- Uses short/paraphrased lyric excerpts
- Tests advanced lyric recognition across multiple songs
- May include audio mashups as media references

**Example**: Task: "Match each lyric snippet to its correct song", with multiple paraphrased lyric fragments and corresponding song options

---

### 17. Speed Tap (`speed_tap`)

**Description**: Player taps correct options as quickly as possible according to a specific rule within a time limit.

**Structure**:

- **Prompt**: `{ task: string; targetRule: string; roundSeconds: number; grid: string[]; }` - Task, tapping rule, time limit, and grid of options
- **Choices**: Not used (dynamic tapping interface)
- **Correct**: `{ targets: string[] }` - List of correct targets to tap
- **ScoringHints**: `{ perCorrect: number; perWrong: number }` - Custom scoring per correct/incorrect tap
- **Answer Format**: `{ roundSeconds: number; events: Array<{ts: number; option: string; action: "tap"|"undo"}>; clientSummary?: {taps: number; correct: number; wrong: number} }`

**Use Case**: Tests quick recognition and reaction time under pressure with time-based scoring.

**Technical Details**:

- Time-based interactive question type
- Part of speed/reaction theme category
- Custom scoring system (different from standard accuracy scoring)
- Records detailed tap events with timestamps
- Tests pattern recognition under time pressure

**Example**: Task: "Tap all items that match the rule", TargetRule: "Songs from the Folklore album", RoundSeconds: 30, Grid: mixed song titles from various albums

---

### 18. Reverse Audio (`reverse_audio`)

**Description**: Player listens to reversed audio clips and selects the correct original song from normal audio options.

**Structure**:

- **Prompt**: `{ task: string; }` - Instructions for the reversed audio challenge
- **Choices**: `string[]` - Labels for original song options
- **Correct**: `number` - Index of correct original song
- **MediaRefs**: Required reversed audio clips
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests advanced audio pattern recognition and musical memory through audio manipulation.

**Technical Details**:

- Single-choice question with audio media
- Part of audio theme category
- Uses reversed sound-alike snippets (not original masters)
- Advanced audio recognition challenge
- Tests musical pattern memory in unusual format

**Example**: Task: "Listen to this reversed audio and identify the original song", with reversed sound-alike snippet and normal audio options

---

### 19. One Second Challenge (`one_second`)

**Description**: Player listens to a one-second audio clip and must identify the correct song from audio options.

**Structure**:

- **Prompt**: `{ task: string; }` - Brief audio identification challenge description
- **Choices**: `string[]` - Labels for song options
- **Correct**: `number` - Index of correct song
- **MediaRefs**: Required one-second audio clip
- **Answer Format**: `{ choiceIndex: number }`

**Use Case**: Tests instant audio recognition and musical memory through extremely brief audio exposure.

**Technical Details**:

- Single-choice question with audio media
- Part of audio theme category
- Uses one-second sound-alike snippets (not original masters)
- Ultimate audio recognition challenge
- Tests immediate pattern recognition from minimal audio cues

**Example**: Task: "Identify the song from this one-second clip", with extremely brief sound-alike snippet and song title options

---

## Technical Implementation

### Answer Formats by Question Type

Each question type has a specific answer format for client responses:

- **Single Choice**: `{ choiceIndex: number }` - Album Year Guess, Fill Blank, Guess by Lyric, Odd One Out, AI Visual, Sound-alike Snippet, Mood Match, Inspiration Map, Life Trivia, Longest Song, Outfit Era, Reverse Audio, One Second
- **Mapping**: `Record<string, string>` - Song Album Match, Lyric Mashup
- **Ordering**: `{ orderedItems: string[] }` or `{ orderedChoices: string[] }` or `{ orderedTracks: string[] }` - Timeline Order, Popularity Match, Tracklist Order
- **Speed Events**: `{ roundSeconds: number; events: Array<{ts: number; option: string; action: "tap"|"undo"}>; clientSummary?: {taps: number; correct: number; wrong: number} }` - Speed Tap

### Content Delivery

- **CDN Templates**: Questions delivered via CDN without answers for security
- **Deterministic Shuffle**: Client and server use shared seed to shuffle questions and choices identically
- **Media References**: Images and audio delivered through secure, signed URLs
- **No Masters Policy**: All audio content uses sound-alike snippets, never original recordings

### Anti-Repeat System

Questions follow a 30-day anti-repeat policy with relaxation steps:

- Target: 30 days between reuse
- Relaxation: 30→21→14→10→7 days if insufficient pool
- Minimum: Never below 7 days between reuse
- Weighting: Prefer questions with lower exposure count and older last-used dates

### Scoring Integration

Questions contribute to daily score calculation:

- **Accuracy Bonus**: 25 × (points / 10) where easy=1, medium=2, hard=3 points
- **Speed Bonus**: 25 × (1 - finish_time / 600) normalized to 10 minutes base time
- **Early Bonus**: 50 × (1 - effective_start_delay / 3600) adjusted for push jitter
- **Hint Penalty**: ~20% reduction in question weight when hints are used
- **Speed Tap**: Custom scoring using perCorrect/perWrong values instead of standard accuracy

### Theme Categories

Questions are tagged with themes for daily composition and leaderboards:

- **lyrics**: Fill Blank, Guess by Lyric, Lyric Mashup
- **audio**: Sound-alike Snippet, Mood Match, Reverse Audio, One Second, Speed Tap (audio)
- **visual**: AI Visual, Outfit Era
- **timeline**: Album Year Guess, Timeline Order
- **charts**: Popularity Match
- **career**: Life Trivia, Inspiration Map
- **discography**: Song Album Match, Tracklist Order, Longest Song
- **aesthetic**: AI Visual, Outfit Era, Mood Match

This system provides a comprehensive framework for testing Taylor Swift knowledge across musical, biographical, visual, and interactive dimensions while maintaining content compliance and technical scalability for 10k-50k concurrent users.
