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
      questionType: 'album-year-guess',
      difficulty: 'medium',
      themes: ['timeline'],
      subjects: ['album:1989'],
      prompt: {
        task: 'What year was the album "1989" released?',
        album: '1989',
      },
      choices: [
        {id: 'choice1', text: '2013'},
        {id: 'choice2', text: '2014'},
        {id: 'choice3', text: '2015'},
        {id: 'choice4', text: '2016'},
      ],
      correct: {choiceIndex: 1},
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

// Quiz 2: Matching and Timeline Types
export const advancedQuizMock: QuizMock = {
  id: 'advanced-quiz',
  title: 'Advanced Matching & Timeline',
  description: 'Complex matching questions and timeline ordering',
  difficulty: 'mixed',
  estimatedTime: 10,
  questions: [
    {
      id: '7',
      questionType: 'fill-blank',
      difficulty: 'easy',
      themes: ['lyrics'],
      subjects: ['song:love-story'],
      prompt: {
        task: 'Complete the lyric from "Love Story"',
        text: 'Romeo, take me somewhere we can be _______',
      },
      choices: [
        {id: 'choice1', text: 'alone'},
        {id: 'choice2', text: 'together'},
        {id: 'choice3', text: 'free'},
        {id: 'choice4', text: 'happy'},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '8',
      questionType: 'guess-by-lyric',
      difficulty: 'easy',
      themes: ['lyrics'],
      subjects: ['song:shake-it-off'],
      prompt: {
        task: 'Which song contains this lyric?',
        lyric: 'Cause the players gonna play, play, play',
      },
      choices: [
        {id: 'choice1', text: 'Shake It Off'},
        {id: 'choice2', text: '22'},
        {id: 'choice3', text: 'Bad Blood'},
        {id: 'choice4', text: 'Blank Space'},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '9',
      questionType: 'album-year-guess',
      difficulty: 'easy',
      themes: ['timeline'],
      subjects: ['album:red'],
      prompt: {
        task: 'What year was the album "Red" released?',
        album: 'Red',
      },
      choices: [
        {id: 'choice1', text: '2011'},
        {id: 'choice2', text: '2012'},
        {id: 'choice3', text: '2013'},
        {id: 'choice4', text: '2014'},
      ],
      correct: {choiceIndex: 1},
    },
    {
      id: '10',
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
      id: '11',
      questionType: 'odd-one-out',
      difficulty: 'medium',
      themes: ['eras', 'collaboration'],
      subjects: ['songs'],
      prompt: {
        task: 'Which song is NOT a collaboration?',
        setRule: 'Songs featuring other artists',
      },
      choices: [
        {id: 'choice1', text: 'Everything Has Changed (ft. Ed Sheeran)'},
        {id: 'choice2', text: "Soon You'll Get Better (ft. Dixie Chicks)"},
        {id: 'choice3', text: 'Enchanted'},
        {id: 'choice4', text: 'Breathe (ft. Colbie Caillat)'},
      ],
      correct: {choiceIndex: 2},
    },
    {
      id: '12',
      questionType: 'timeline-order',
      difficulty: 'hard',
      themes: ['timeline', 'albums'],
      subjects: ['albums'],
      prompt: {
        task: 'Arrange these albums in chronological release order',
        items: ['Midnights', 'evermore', 'folklore', 'Lover'],
      },
      correct: ['Lover', 'folklore', 'evermore', 'Midnights'],
    },
  ],
};

// Quiz 3: Interactive and Visual Types
export const interactiveQuizMock: QuizMock = {
  id: 'interactive-quiz',
  title: 'Interactive & Visual Quiz',
  description: 'Audio, visual, and interactive question types',
  difficulty: 'mixed',
  estimatedTime: 12,
  questions: [
    {
      id: '13',
      questionType: 'album-year-guess',
      difficulty: 'easy',
      themes: ['timeline'],
      subjects: ['album:speak-now'],
      prompt: {
        task: 'What year was the album "Speak Now" released?',
        album: 'Speak Now',
      },
      choices: [
        {id: 'choice1', text: '2009'},
        {id: 'choice2', text: '2010'},
        {id: 'choice3', text: '2011'},
        {id: 'choice4', text: '2012'},
      ],
      correct: {choiceIndex: 1},
    },
    {
      id: '14',
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
      id: '15',
      questionType: 'guess-by-lyric',
      difficulty: 'easy',
      themes: ['lyrics'],
      subjects: ['song:22'],
      prompt: {
        task: 'Which song contains this lyric?',
        lyric: "I don't know about you, but I'm feeling",
      },
      choices: [
        {id: 'choice1', text: '22'},
        {id: 'choice2', text: 'ME!'},
        {id: 'choice3', text: 'Paper Rings'},
        {id: 'choice4', text: 'The Best Day'},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '16',
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
      id: '17',
      questionType: 'speed-tap',
      difficulty: 'medium',
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
      id: '18',
      questionType: 'tracklist-order',
      difficulty: 'hard',
      themes: ['albums', 'track-order'],
      subjects: ['album:folklore'],
      prompt: {
        task: 'Arrange these songs in their album order',
        album: 'folklore',
        tracks: ['cardigan', 'the 1', 'august', 'exile'],
      },
      correct: ['the 1', 'cardigan', 'exile', 'august'],
    },
  ],
};
// Quiz 4: Challenge and Special Types
export const challengeQuizMock: QuizMock = {
  id: 'challenge-quiz',
  title: 'Ultimate Challenge',
  description: 'The hardest questions with special formats',
  difficulty: 'mixed',
  estimatedTime: 15,
  questions: [
    {
      id: '19',
      questionType: 'fill-blank',
      difficulty: 'easy',
      themes: ['lyrics'],
      subjects: ['song:fearless'],
      prompt: {
        task: 'Complete the lyric from "Fearless"',
        text: "And I don't know how it gets better than _______",
      },
      choices: [
        {id: 'choice1', text: 'this'},
        {id: 'choice2', text: 'here'},
        {id: 'choice3', text: 'now'},
        {id: 'choice4', text: 'today'},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '20',
      questionType: 'album-year-guess',
      difficulty: 'easy',
      themes: ['timeline'],
      subjects: ['album:fearless'],
      prompt: {
        task: 'What year was the album "Fearless" released?',
        album: 'Fearless',
      },
      choices: [
        {id: 'choice1', text: '2007'},
        {id: 'choice2', text: '2008'},
        {id: 'choice3', text: '2009'},
        {id: 'choice4', text: '2010'},
      ],
      correct: {choiceIndex: 1},
    },
    {
      id: '21',
      questionType: 'guess-by-lyric',
      difficulty: 'easy',
      themes: ['lyrics'],
      subjects: ['song:you-belong-with-me'],
      prompt: {
        task: 'Which song contains this lyric?',
        lyric: 'She wears short skirts, I wear T-shirts',
      },
      choices: [
        {id: 'choice1', text: 'You Belong With Me'},
        {id: 'choice2', text: 'Love Story'},
        {id: 'choice3', text: 'Teardrops On My Guitar'},
        {id: 'choice4', text: 'White Horse'},
      ],
      correct: {choiceIndex: 0},
    },
    {
      id: '22',
      questionType: 'life-trivia',
      difficulty: 'medium',
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
      id: '23',
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
      id: '24',
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
  ],
};

export const allQuizMocks: QuizMock[] = [
  basicQuizMock,
  advancedQuizMock,
  interactiveQuizMock,
  challengeQuizMock,
];

export default allQuizMocks;
