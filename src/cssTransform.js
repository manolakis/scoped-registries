import { definitionsRegistry } from './definitionsRegistry.js';

/**
 * Tokens of just one character.
 *
 * @type {string}
 */
const singleTokens = ' *,()>+~|';

/**
 * Type of tokens.
 * @readonly
 * @enum {number}
 */
const TokenType = {
  CHAR: 1,
  CLASS: 2,
  ID: 3,
  PSEUDO_CLASS: 4,
  ATTRIBUTE: 5,
  SINGLE: 6,
  BLOCK: 7,
};

/**
 * Returns the token type of the character.
 * @param {string} char
 * @return {TokenType}
 */
const getType = char => {
  if (singleTokens.includes(char)) {
    return TokenType.SINGLE;
  }

  switch (char) {
    case ':':
      return TokenType.PSEUDO_CLASS;
    case '.':
      return TokenType.CLASS;
    case '#':
      return TokenType.ID;
    case '[':
      return TokenType.ATTRIBUTE;
    case '{':
      return TokenType.BLOCK;
    default:
      return TokenType.CHAR;
  }
};

/**
 * Obtains the proper tagName for the specified registry.
 *
 * @param {string} token
 * @param {CustomElementRegistry} registry
 * @return {string}
 */
const getTagName = (token, registry) => {
  const { originalTagName } = definitionsRegistry.findByTagName(token) || {};

  if (originalTagName) {
    return definitionsRegistry.getTagName(originalTagName, registry);
  }

  return definitionsRegistry.getTagName(token, registry);
};

/**
 * Obtains a tagName from the selector's string and scope it if is a custom element
 * @param {string} query
 * @param {number} start
 * @param {CustomElementRegistry} registry
 * @return {{index: number, token: string}}
 */
const elementExtractor = (query, start, registry) => {
  let isCustomElement = false;
  let index = start;
  let type;

  do {
    index += 1;
    type = getType(query[index]);
    // TODO probably this check must be improved
    isCustomElement = isCustomElement || query[index] === '-';
  } while (index < query.length && type === TokenType.CHAR);

  let token = query.substring(start, index);

  if (isCustomElement) {
    token = getTagName(token, registry);
  }

  return { token, index };
};

/**
 * Obtains a single character from the selector's string.
 * @param {string} query
 * @param {number} start
 * @return {{index: number, token: string}}
 */
const singleCharacterExtractor = (query, start) => {
  return { token: query.substring(start, start + 1), index: start + 1 };
};

/**
 * Obtains a pseudo class, class or id from a selector's string. Those elements don't require to to be scoped.
 * @param {string} query
 * @param {number} start
 * @return {{index: number, token: string}}
 */
const unscopedWordExtractor = (query, start) => {
  let index = start;
  let type;

  do {
    index += 1;
    type = getType(query[index]);
  } while (index < query.length && type === TokenType.CHAR);

  const token = query.substring(start, index);

  if (token === ':lang') {
    do {
      index += 1;
    } while (index < query.length && query[index] !== ')');
  }

  return { token: query.substring(start, index), index };
};

/**
 * Extracts a block of text.
 *
 * @param {string} endCharacter - character that determines the end of the text block
 * @return {function(string, number): {index: number, token: string}}
 */
const blockExtractor = endCharacter => (query, start) => {
  let index = start;

  do {
    index += 1;
  } while (index < query.length && query[index] !== endCharacter);

  return { token: query.substring(start, index), index };
};

/**
 * Transforms the CSS scoping the custom element tag names.
 * @param {string} cssText
 * @param {CustomElementRegistry} registry
 * @return {string}
 */
export const cssTransform = (cssText, registry = window.customElements) => {
  if (registry === window.customElements) {
    return cssText;
  }

  const tokens = [];
  let index = 0;
  let extractor;

  while (index < cssText.length) {
    switch (getType(cssText[index])) {
      case TokenType.SINGLE:
        extractor = singleCharacterExtractor;
        break;
      case TokenType.PSEUDO_CLASS:
      case TokenType.CLASS:
      case TokenType.ID:
        extractor = unscopedWordExtractor;
        break;
      case TokenType.ATTRIBUTE:
        extractor = blockExtractor(']');
        break;
      case TokenType.BLOCK:
        extractor = blockExtractor('}');
        break;
      default:
        extractor = elementExtractor;
    }

    const { index: newIndex, token } = extractor(cssText, index, registry);
    tokens.push(token);

    index = newIndex;
  }

  return tokens.join('');
};
