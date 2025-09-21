import {AnyQuestion} from '../../../shared/interfaces/questions/any-question.type';

export interface QuizMock {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  estimatedTime: number; // in minutes
  questions: AnyQuestion[];
}

// Quiz 1: Basic Question Types
export const basicQuizMock: QuizMock = {
  id: 'basic-quiz',
  title: 'Basic Quiz Types',
  description: 'Test album knowledge, lyrics, and simple matching',
  difficulty: 'mixed',
  estimatedTime: 8,
  questions: [
    {
      id: '1',
      questionType: 'album-year-guess',
      difficulty: 'easy',
      themes: ['timeline'],
      subjects: ['album:folklore'],
      prompt: {
        task: 'What year was the album "folklore" released?',
        album: 'folklore',
      },
      choices: [
        {id: 'choice1', text: '2019'},
        {id: 'choice2', text: '2020'},
        {id: 'choice3', text: '2021'},
        {id: 'choice4', text: '2022'},
      ],
      correct: {choiceIndex: 1},
    },
    {
      id: '2',
      questionType: 'fill-blank',
      difficulty: 'easy',
      themes: ['lyrics'],
      subjects: ['song:blank-space'],
      prompt: {
        task: 'Complete the lyric from "Blank Space"',
        text: "I've got a blank space baby, and I'll _______",
      },
      choices: [
        {id: 'choice1', text: 'write your name'},
        {id: 'choice2', text: 'sing your song'},
        {id: 'choice3', text: 'dance all night'},
        {id: 'choice4', text: 'call you mine'},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '3',
      questionType: 'guess-by-lyric',
      difficulty: 'easy',
      themes: ['lyrics'],
      subjects: ['song:all-too-well'],
      prompt: {
        task: 'Which song contains this lyric?',
        lyric: 'And you were tossing me the car keys',
      },
      choices: [
        {id: 'choice1', text: 'All Too Well (10 Minute Version)'},
        {id: 'choice2', text: 'Red'},
        {id: 'choice3', text: 'We Are Never Getting Back Together'},
        {id: 'choice4', text: 'I Knew You Were Trouble'},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '4',
      questionType: 'odd-one-out',
      difficulty: 'medium',
      themes: ['eras'],
      subjects: ['albums'],
      prompt: {
        task: "Which album doesn't belong with the others?",
        setRule: 'Albums from the 2010s',
      },
      choices: [
        {id: 'choice1', text: 'Lover'},
        {id: 'choice2', text: 'folklore'},
        {id: 'choice3', text: '1989'},
        {id: 'choice4', text: 'reputation'},
      ],
      correct: {choiceIndex: 1},
    },
    {
      id: '5',
      questionType: 'song-album-match',
      difficulty: 'medium',
      themes: ['albums'],
      subjects: ['albums'],
      prompt: {
        task: 'Match each song to its correct album',
        left: ['cardigan', 'Anti-Hero', 'Shake It Off'],
        right: ['folklore', 'Midnights', '1989', 'Lover'],
      },
      correct: {
        cardigan: 'folklore',
        'Anti-Hero': 'Midnights',
        'Shake It Off': '1989',
      },
    },
    {
      id: '6',
      questionType: 'timeline-order',
      difficulty: 'hard',
      themes: ['timeline', 'albums'],
      subjects: ['albums'],
      prompt: {
        task: 'Arrange these albums in chronological release order',
        items: ['Red', 'Speak Now', 'Fearless', '1989'],
      },
      correct: ['Fearless', 'Speak Now', 'Red', '1989'],
    },
  ],
};

// Quiz 2: Visual & Audio Types
export const advancedQuizMock: QuizMock = {
  id: 'advanced-quiz',
  title: 'Visual & Audio Quiz',
  description: 'Test your visual recognition and audio skills',
  difficulty: 'mixed',
  estimatedTime: 10,
  questions: [
    {
      id: '7',
      questionType: 'outfit-era',
      difficulty: 'easy',
      themes: ['fashion', 'eras'],
      subjects: ['eras'],
      prompt: {
        task: 'Which era does this outfit belong to?',
      },
      mediaRefs: [
        {type: 'image', url: 'https://example.com/outfit1.jpg'},
        {type: 'image', url: 'https://example.com/outfit1_alt.jpg'},
      ],
      choices: ['Fearless Era', '1989 Era', 'folklore Era', 'Midnights Era'],
      correct: {choiceIndex: 0},
      hint: 'Think about which era featured the most country-style outfits and performances',
    },
    {
      id: '8',
      questionType: 'ai-visual',
      difficulty: 'easy',
      themes: ['visual', 'ai'],
      subjects: ['albums'],
      prompt: {
        task: 'Which album cover is shown in this AI-generated image?',
      },
      mediaRefs: [
        {
          type: 'image',
          url: 'https://httpbin.org/image/jpeg',
        },
      ],
      choices: [
        {id: 'choice1', text: 'Midnights'},
        {id: 'choice2', text: 'folklore'},
        {id: 'choice3', text: 'evermore'},
        {id: 'choice4', text: 'Lover'},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '9',
      questionType: 'sound-alike-snippet',
      difficulty: 'easy',
      themes: ['audio'],
      subjects: ['songs'],
      prompt: {
        task: 'Which audio clip matches the described sound?',
        description: 'Upbeat pop song with synthesizers',
      },
      mediaRefs: [
        {type: 'audio', url: 'https://example.com/clip1.mp3'},
        {type: 'audio', url: 'https://example.com/clip2.mp3'},
        {type: 'audio', url: 'https://example.com/clip3.mp3'},
        {type: 'audio', url: 'https://example.com/clip4.mp3'},
      ],
      choices: [
        {id: 'choice1', text: 'Clip 1'},
        {id: 'choice2', text: 'Clip 2'},
        {id: 'choice3', text: 'Clip 3'},
        {id: 'choice4', text: 'Clip 4'},
      ],
      correct: {choiceIndex: 1},
    },
    {
      id: '10',
      questionType: 'mood-match',
      difficulty: 'medium',
      themes: ['emotions'],
      subjects: ['songs'],
      prompt: {
        task: 'Which mood best describes the song "All Too Well"?',
        moodTags: ['emotional', 'nostalgic', 'heartbreak'],
        note: 'Consider the overall feeling and lyrics of the song',
      },
      choices: ['Melancholic', 'Upbeat', 'Romantic', 'Angry'],
      correct: 0, // Melancholic is the correct answer
    },
    {
      id: '11',
      questionType: 'reverse-audio',
      difficulty: 'medium',
      themes: ['audio', 'challenge'],
      subjects: ['songs'],
      prompt: {
        task: 'Identify the song from this reversed audio clip',
      },
      mediaRefs: [{type: 'audio', url: 'https://example.com/reversed.mp3'}],
      choices: ['Love Story', 'You Belong With Me', 'Shake It Off', '22'],
      correct: {choiceIndex: 2},
    },
    {
      id: '12',
      questionType: 'tracklist-order',
      difficulty: 'hard',
      themes: ['albums', 'track-order'],
      subjects: ['album:folklore'],
      prompt: {
        task: 'Arrange these songs in their album order',
        album: 'folklore',
        tracks: ['cardigan', 'the 1', 'august', 'exile'],
      },
      choices: [],
      correct: {values: ['the 1', 'cardigan', 'exile', 'august']},
    },
  ],
};

// Quiz 3: Matching & Analysis Types
export const interactiveQuizMock: QuizMock = {
  id: 'interactive-quiz',
  title: 'Matching & Analysis Quiz',
  description: 'Advanced matching, trivia, and analytical challenges',
  difficulty: 'mixed',
  estimatedTime: 12,
  questions: [
    {
      id: '13',
      questionType: 'life-trivia',
      difficulty: 'easy',
      themes: ['biography'],
      subjects: ['personal'],
      prompt: {
        task: "Select the correct answer about Taylor Swift's life",
        question:
          "What significant event happened in Taylor Swift's life in 2016?",
      },
      choices: [
        {id: 'choice1', text: 'First Grammy win'},
        {id: 'choice2', text: 'Moved to Nashville'},
        {id: 'choice3', text: 'Phone call controversy'},
        {id: 'choice4', text: 'Started dating Joe Alwyn'},
      ],
      correct: {choiceIndex: 2},
    },
    {
      id: '14',
      questionType: 'popularity-match',
      difficulty: 'easy',
      themes: ['charts', 'popularity'],
      subjects: ['songs'],
      prompt: {
        task: 'Order these songs by total Spotify streams (highest to lowest)',
        asOf: '2025-09-01',
      },
      choices: ['Shake It Off', 'Anti-Hero', 'Love Story', 'Cruel Summer'],
      correct: {
        values: ['Anti-Hero', 'Shake It Off', 'Cruel Summer', 'Love Story'],
      },
    },
    {
      id: '15',
      questionType: 'longest-song',
      difficulty: 'easy',
      themes: ['duration'],
      subjects: ['songs'],
      prompt: {
        task: 'Which of these songs is the longest?',
        context: 'From the Red album',
      },
      choices: [
        {
          id: 'choice1',
          text: 'All Too Well (10 Minute Version)',
          duration: 630,
        },
        {id: 'choice2', text: 'State of Grace', duration: 295},
        {id: 'choice3', text: 'Holy Ground', duration: 203},
        {id: 'choice4', text: 'Begin Again', duration: 239},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '16',
      questionType: 'inspiration-map',
      difficulty: 'medium',
      themes: ['influences'],
      subjects: ['songs'],
      prompt: {
        task: 'Who is widely believed to have inspired the song "All Too Well"?',
        disclaimer:
          'Based on fan interpretations and media reports, not officially confirmed.',
      },
      choices: ['Joe Jonas', 'Jake Gyllenhaal', 'Harry Styles', 'John Mayer'],
      correct: 1,
    },
    {
      id: '17',
      questionType: 'lyric-mashup',
      difficulty: 'medium',
      themes: ['lyrics', 'challenge'],
      subjects: ['songs'],
      prompt: {
        task: 'Match each lyric snippet to the correct song',
        snippets: [
          'Midnight rain',
          'Golden daylight',
          'Paper rings',
          'Cornelia Street',
        ],
        optionsPerSnippet: [
          'Lavender Haze',
          'Daylight',
          'Paper Rings',
          'Cornelia Street',
        ],
      },
      correct: {
        'Midnight rain': 'Lavender Haze',
        'Golden daylight': 'Daylight',
        'Paper rings': 'Paper Rings',
        'Cornelia Street': 'Cornelia Street',
      },
    },
    {
      id: '18',
      questionType: 'one-second',
      difficulty: 'hard',
      themes: ['audio', 'challenge'],
      subjects: ['songs'],
      prompt: {
        task: 'Identify the song from this 1-second audio clip',
      },
      mediaRefs: [{type: 'audio', url: 'https://example.com/one-second.mp3'}],
      choices: [
        'We Are Never Getting Back Together',
        'I Knew You Were Trouble',
        '22',
        'Everything Has Changed',
      ],
      correct: 0,
    },
  ],
};
// Quiz 4: Final Challenge - Speed Tap
export const challengeQuizMock: QuizMock = {
  id: 'challenge-quiz',
  title: 'Ultimate Challenge',
  description: 'The final question type: Speed Tap Challenge',
  difficulty: 'easy',
  estimatedTime: 5,
  questions: [
    {
      id: '19',
      questionType: 'speed-tap',
      difficulty: 'easy',
      themes: ['reflexes', 'songs'],
      subjects: ['songs'],
      prompt: {
        task: 'Tap all the real song titles as quickly as possible!',
        targetRule: 'Real Taylor Swift songs',
        roundSeconds: 15,
        grid: [
          'Love Story',
          'Heart Attack',
          'You Belong With Me',
          'Bad Romance',
          'Fearless',
          'Poker Face',
          'Shake It Off',
          'Rolling in the Deep',
          '22',
        ],
      },
      correct: {
        targets: [
          'Love Story',
          'You Belong With Me',
          'Fearless',
          'Shake It Off',
          '22',
        ],
      },
      scoringHints: {
        perCorrect: 10,
        perWrong: -5,
      },
    },
  ],
};

export const allQuizMocks: QuizMock[] = [
  basicQuizMock,
  advancedQuizMock,
  interactiveQuizMock,
  challengeQuizMock,
];

export default allQuizMocks;
