import { definitionsRegistry } from './definitionsRegistry.js';

const NONE = 0;
const OPEN = 1;
const CLOSE = 2;

/**
 * Allowed tag name characters
 *
 * @type {string[]}
 */
const TAGNAME_CHARS = '-.0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(
  ''
);

/**
 * Characters used to open a string
 *
 * @type {string[]}
 */
const OPEN_STRING_CHARS = `"'`.split('');

/**
 * Checks if the next token is an string
 *
 * @param {string} str
 * @param {number} index
 * @returns {boolean}
 */
const isOpenString = (str, index) => OPEN_STRING_CHARS.includes(str[index]);

/**
 * Returns the length of the opening or closing chars of a tag name
 *
 * @param {string} str
 * @param {number} index
 * @returns {number}
 */
const getStartTagLength = (str, index) => {
  if (str[index] !== '<') return NONE;
  if (str[index + 1] === '/') return CLOSE;

  return OPEN;
};

/**
 * Obtains the next name in the string from the index
 *
 * @param {string} str
 * @param {number} index
 * @returns {{isCustomElement: boolean, index: *, tagName: string}}
 */
const getName = (str, index) => {
  let i = index;
  let isCustomElement = false;

  while (TAGNAME_CHARS.includes(str[i])) {
    isCustomElement = isCustomElement || str[i] === '-';

    i += 1;
  }

  return {
    index,
    isCustomElement,
    tagName: str.substring(index, i),
  };
};

/**
 * Find custom element tags in the string
 *
 * @param {string} str
 * @returns {{index: number, tagName: string}[]}
 */
const matchAll = str => {
  const matches = [];
  let openStringChar;

  for (let index = 0; index < str.length; index += 1) {
    if (!openStringChar) {
      const startTagLength = getStartTagLength(str, index);

      if (startTagLength !== NONE) {
        index += startTagLength;

        const tagName = getName(str, index);

        if (tagName.isCustomElement) {
          matches.push({
            index: tagName.index,
            tagName: tagName.tagName,
            type: startTagLength,
          });
        }

        index += tagName.tagName.length;
      }

      if (isOpenString(str, index)) {
        openStringChar = str[index];
        index += 1;
      }
    }

    if (str[index] === openStringChar) {
      index += 1;
      openStringChar = undefined;
    }
  }

  return matches;
};

/**
 * Transforms a string array into another one with resolved scoped elements.
 *
 * @param {string} template
 * @param {CustomElementRegistry} registry
 * @returns {string}
 */
export const transform = (template, registry) => {
  let acc = template;
  const matches = matchAll(template);

  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const { index, tagName, type } = matches[i];
    const tag = definitionsRegistry.getTagName(tagName, registry);
    const start = index;
    const end = start + tagName.length;

    acc =
      acc.slice(0, start) +
      (type === OPEN ? `${tag} data-tag-name="${tagName}"` : tag) +
      acc.slice(end);
  }

  return acc;
};
