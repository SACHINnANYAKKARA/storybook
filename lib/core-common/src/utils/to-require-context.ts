import { NormalizedStoriesSpecifier } from '../types';
import { globToRegex } from './glob-to-regexp';

export const toRequireContext = (specifier: NormalizedStoriesSpecifier) => {
  const { directory, files } = specifier;

  // The importPathMatcher is a `./`-prefixed matcher that includes the directory
  // For `require.context()` we want the same thing, relative to directory
  const match = globToRegex(`./${files}`);
  return {
    path: directory,
    recursive: !!files.match(/^\*{1,2}\//),
    match,
  };
};

export const toRequireContextString = (specifier: NormalizedStoriesSpecifier) => {
  const { path: p, recursive: r, match: m } = toRequireContext(specifier);

  const result = `require.context('${p}', ${r}, ${m})`;
  return result;
};
