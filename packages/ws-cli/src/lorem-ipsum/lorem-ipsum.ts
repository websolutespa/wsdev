import { getStandardDeviation, randomFromRange, randomPositiveFromRange } from './lorem-ipsum.utils.js';
import loremIpsumWords from './lorem-ipsum.words.json';

export type CreateLoremIpsum = {
  paragraphs: number,
  sentences: number, // average sentences per paragraph
  words: number, // average words per sentence
  lorem: boolean, // start with Lore ipsum
  random: boolean,
  punctuation: boolean,
};

const DEFAULTS = {
  paragraphs: 1,
  sentences: 1,
  words: 8,
  lorem: false,
  random: true,
  punctuation: true,
};

// Standard deviation percentage for words and sentences
const STANDARD_DEVIATION = 0.25;

// Get a random word from Latin word list
function getRandomWord() {
  return loremIpsumWords[randomFromRange(0, loremIpsumWords.length - 1)];
}

// Get a specific word from Latin word list
function getWord(i: number): string {
  return loremIpsumWords[i % loremIpsumWords.length];
}

// Get a punctuation for middle of the sentence randomly
function getPunctuation(sentences: number): { char: string | undefined, position: number | undefined } {
  const chars = [',', ';'];
  let char;
  let position;
  if (sentences > 6) {
    // 25% probability for punctuation
    const hasPunctuation = !!(Math.random() <= 0.25);
    if (hasPunctuation) {
      position = randomFromRange(2, sentences - 3);
      char = chars[randomFromRange(0, chars.length - 1)];
    }
  }
  return { char, position };
}

// Get a punctuation for end of the sentence randomly
function getEndPunctuation(punctuation: boolean = true) {
  if (punctuation) {
    const random = Math.random();
    // 1% probability exclamation mark, 4% probability question mark, 95% probability dot
    if (random > 0.99) return '!';
    if (random > 0.95) return '?';
    return '.';
  } else {
    return '';
  }
}

// Creates always the same text, averages are used as exacts.
export function createLoremIpsumStandardParagraph({
  sentences,
  words
}: Pick<CreateLoremIpsum, 'sentences' | 'words'>) {
  let paragraph = '';
  for (let i = 0; i < sentences; i++) {
    let sentence = '';
    for (let j = 0; j < words; j++) {
      sentence += `${getWord(i * sentences + j)} `;
    }
    paragraph += `${sentence.charAt(0).toUpperCase() + sentence.slice(1).trim()}. `;
  }
  return paragraph.trim();
}

// Create a Sentence by using random words
export function createLoremIpsumRandomSentence({ words, lorem, punctuation }: Pick<CreateLoremIpsum, 'words' | 'lorem' | 'punctuation'>) {
  if (lorem) {
    return 'Lorem ipsum odor amet, consectetuer adipiscing elit.';
  }
  const deviation = getStandardDeviation(words, STANDARD_DEVIATION);
  words = randomPositiveFromRange(words - deviation, words + deviation);
  // console.log(deviation, words);
  const middlePunctuation = getPunctuation(words);
  let sentence = '';
  for (let i = 0; i < words; i++) {
    sentence += `${getRandomWord()}${middlePunctuation.position === i ? middlePunctuation.char : ''} `;
  }
  sentence = `${sentence.charAt(0).toUpperCase() + sentence.substr(1).trim()}${getEndPunctuation(punctuation)}`;
  return sentence;
}

// Create a Paragraph by using random words
export function createLoremIpsumRandomParagraph({
  sentences,
  words,
  lorem,
  punctuation,
  first,
}: Pick<CreateLoremIpsum, 'sentences' | 'words' | 'lorem' | 'punctuation'> & { first: boolean }) {
  const deviation = getStandardDeviation(sentences, STANDARD_DEVIATION);
  sentences = randomPositiveFromRange(sentences - deviation, sentences + deviation);
  // console.log(deviation, sentences);
  let paragraph = '';
  for (let i = 0; i < sentences; i++) {
    lorem = !!(lorem && first && i === 0);
    const sentence = createLoremIpsumRandomSentence({ lorem, words, punctuation });
    paragraph += `${sentence} `;
  }
  return paragraph.trim();
}

export function createLoremIpsum(props: Partial<CreateLoremIpsum> = {}) {
  const options: CreateLoremIpsum = Object.assign({}, DEFAULTS, props);
  const { paragraphs, sentences, words, random, lorem, punctuation } = options;
  // console.log('createLoremIpsum', options);
  const createParagraph = random ? createLoremIpsumRandomParagraph : createLoremIpsumStandardParagraph;
  return Array.from({ length: paragraphs }, (_, i) => i).map((_, i) => createParagraph({
    sentences,
    words,
    lorem,
    punctuation,
    first: i === 0,
  }));
}
