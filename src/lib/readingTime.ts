const WORDS_PER_MINUTE = 200;

export interface ReadingTimeEstimate {
  words: number;
  minutes: number;
}

export function estimateReadingTime(content: string, wordsPerMinute = WORDS_PER_MINUTE): ReadingTimeEstimate {
  const normalized = content.replace(/[`*_>#-]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = normalized ? normalized.split(' ').length : 0;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  return { words, minutes };
}
