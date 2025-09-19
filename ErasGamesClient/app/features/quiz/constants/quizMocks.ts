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
  difficulty: 'easy',
  estimatedTime: 5,
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
  ],
};

// Quiz 2: Matching and Timeline Types
export const advancedQuizMock: QuizMock = {
  id: 'advanced-quiz',
  title: 'Advanced Matching & Timeline',
  description: 'Complex matching questions and timeline ordering',
  difficulty: 'medium',
  estimatedTime: 8,
  questions: [
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
      themes: ['timeline'],
      subjects: ['albums'],
      prompt: {
        task: 'Arrange these albums in chronological release order',
        items: ['Red', 'Speak Now', 'Fearless', '1989'],
      },
      correct: ['Fearless', 'Speak Now', 'Red', '1989'],
    },
    {
      id: '7',
      questionType: 'tracklist-order',
      difficulty: 'hard',
      themes: ['albums'],
      subjects: ['album:1989'],
      prompt: {
        task: 'Arrange these songs in their album order',
        album: '1989',
        tracks: ['Shake It Off', 'Welcome To New York', 'Blank Space', 'Style'],
      },
      correct: ['Welcome To New York', 'Blank Space', 'Style', 'Shake It Off'],
    },
    {
      id: '8',
      questionType: 'popularity-match',
      difficulty: 'medium',
      themes: ['charts'],
      subjects: ['songs'],
      prompt: {
        task: 'Match each song to its peak chart position',
        songs: ['Shake It Off', 'Anti-Hero', 'Look What You Made Me Do'],
        positions: ['#1', '#2', '#3', '#5'],
      },
      correct: {
        'Shake It Off': '#1',
        'Anti-Hero': '#1',
        'Look What You Made Me Do': '#1',
      },
    },
  ],
};

// Quiz 3: Interactive and Visual Types
export const interactiveQuizMock: QuizMock = {
  id: 'interactive-quiz',
  title: 'Interactive & Visual Quiz',
  description: 'Audio, visual, and interactive question types',
  difficulty: 'mixed',
  estimatedTime: 10,
  questions: [
    {
      id: '9',
      questionType: 'mood-match',
      difficulty: 'medium',
      themes: ['emotions'],
      subjects: ['songs'],
      prompt: {
        task: 'Match each song to its mood/vibe',
        songs: ['All Too Well', 'Shake It Off', 'Delicate', 'Bad Blood'],
        moods: ['Melancholic', 'Upbeat', 'Romantic', 'Angry'],
      },
      correct: {
        'All Too Well': 'Melancholic',
        'Shake It Off': 'Upbeat',
        Delicate: 'Romantic',
        'Bad Blood': 'Angry',
      },
    },
    {
      id: '10',
      questionType: 'outfit-era',
      difficulty: 'easy',
      themes: ['fashion', 'eras'],
      subjects: ['eras'],
      prompt: {
        task: 'Which era does this outfit belong to?',
        imageUrl: 'https://example.com/outfit1.jpg',
        description: 'Sparkly dress with fringe and cowboy boots',
      },
      choices: [
        {id: 'choice1', text: 'Fearless Era'},
        {id: 'choice2', text: '1989 Era'},
        {id: 'choice3', text: 'folklore Era'},
        {id: 'choice4', text: 'Midnights Era'},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '11',
      questionType: 'speed-tap',
      difficulty: 'easy',
      themes: ['reflexes'],
      subjects: ['songs'],
      prompt: {
        task: 'Tap all the real song titles as quickly as possible!',
        realItems: ['Love Story', 'You Belong With Me', 'Fearless'],
        fakeItems: ['Love Drama', 'You Belong To Me', 'Careless'],
        timeLimit: 10,
      },
      correct: {
        correctTaps: ['Love Story', 'You Belong With Me', 'Fearless'],
        incorrectTaps: [],
      },
    },
    {
      id: '12',
      questionType: 'lyric-mashup',
      difficulty: 'hard',
      themes: ['lyrics'],
      subjects: ['songs'],
      prompt: {
        task: 'Identify which songs these mixed lyrics come from',
        mashupText:
          'We are never getting back together / Like ever / Cause we are never getting back together',
        segments: [
          {
            text: 'We are never getting back together',
            startIndex: 0,
            endIndex: 34,
          },
          {text: 'Like ever', startIndex: 35, endIndex: 44},
          {
            text: 'Cause we are never getting back together',
            startIndex: 45,
            endIndex: 85,
          },
        ],
      },
      correct: {
        'We are never getting back together':
          'We Are Never Getting Back Together',
        'Like ever': 'We Are Never Getting Back Together',
        'Cause we are never getting back together':
          'We Are Never Getting Back Together',
      },
    },
  ],
};

// Quiz 4: Challenge and Special Types
export const challengeQuizMock: QuizMock = {
  id: 'challenge-quiz',
  title: 'Ultimate Challenge',
  description: 'The hardest questions with special formats',
  difficulty: 'hard',
  estimatedTime: 12,
  questions: [
    {
      id: '13',
      questionType: 'life-trivia',
      difficulty: 'hard',
      themes: ['biography'],
      subjects: ['personal'],
      prompt: {
        task: 'What significant event happened in this year?',
        year: 2016,
        category: 'personal',
      },
      choices: [
        {id: 'choice1', text: 'First Grammy win'},
        {id: 'choice2', text: 'Moved to Nashville'},
        {id: 'choice3', text: 'Kim Kardashian phone call controversy'},
        {id: 'choice4', text: 'Started dating Joe Alwyn'},
      ],
      correct: {choiceIndex: 2},
    },
    {
      id: '14',
      questionType: 'inspiration-map',
      difficulty: 'hard',
      themes: ['influences'],
      subjects: ['songs'],
      prompt: {
        task: 'Match each song to its reported inspiration or influence',
        songs: ['Style', 'All Too Well', 'august', 'Ronan'],
        inspirations: [
          'Harry Styles relationship',
          'Jake Gyllenhaal relationship',
          'Fictional love triangle',
          'Charity for cancer research',
        ],
      },
      correct: {
        Style: 'Harry Styles relationship',
        'All Too Well': 'Jake Gyllenhaal relationship',
        august: 'Fictional love triangle',
        Ronan: 'Charity for cancer research',
      },
    },
    {
      id: '15',
      questionType: 'longest-song',
      difficulty: 'medium',
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
      questionType: 'one-second',
      difficulty: 'hard',
      themes: ['audio'],
      subjects: ['songs'],
      prompt: {
        task: 'Identify the song from this 1-second audio clip',
        audioUrl: 'https://example.com/audio1.mp3',
        startTime: 45.2,
      },
      choices: [
        {id: 'choice1', text: 'Love Story'},
        {id: 'choice2', text: 'You Belong With Me'},
        {id: 'choice3', text: 'White Horse'},
        {id: 'choice4', text: 'Teardrops On My Guitar'},
      ],
      correct: {choiceIndex: 0},
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
