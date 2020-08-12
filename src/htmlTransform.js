import { definitionsRegistry } from './definitionsRegistry.js';

/**
 * Characters used to open a string
 *
 * @type {string[]}
 */
const OPEN_STRING_CHARS = `"'`.split('');

/**
 * Checks if the next token is an string
 *
 * @param {string} character
 * @returns {boolean}
 */
const isOpeningString = character => OPEN_STRING_CHARS.includes(character);

/**
 * Returns the index within the calling String object of the first occurrence of the specified value, starting the
 * search at fromIndex and avoiding the "strings" in the template . Returns -1 if the value is not found.
 * @param {string} template
 * @param {string} value
 * @param {number} fromIndex
 * @return {number}
 */
const search = (template, value, fromIndex) => {
  let index = fromIndex;
  let inString = false;

  while (index !== template.length) {
    if (isOpeningString(template[index])) {
      inString = !inString;
    } else if (!inString && template[index] === value) {
      return index;
    }

    index += 1;
  }

  return -1;
};

/**
 * Returns the index of the first starting node occurrence. Returns -1 if not found.
 * @param {string} template
 * @param {number} [fromIndex=0]
 * @return {number}
 */
const searchStart = (template, fromIndex = 0) =>
  search(template, '<', fromIndex);

/**
 * Returns the index of the first ending node occurrence. Returns -1 if not found.
 * @param {string} template
 * @param {number} fromIndex
 * @return {number}
 */
const searchEnd = (template, fromIndex) => search(template, '>', fromIndex);

/**
 * Checks if is a valid custom element name.
 * @param {string} data
 * @return {boolean}
 */
const isCustomElement = data => data.includes('-'); // TODO it could be a better algorithm

/**
 * Get the scoped tagName for a registry from a tagName, that could be previously scoped.
 * @param {string} tagName
 * @param {CustomElementRegistry} registry
 * @return {string}
 */
const getScopedTagName = (tagName, registry) => {
  const { originalTagName = tagName } =
    definitionsRegistry.findByTagName(tagName) || {};

  return definitionsRegistry.getTagName(originalTagName, registry);
};

/**
 * Transforms a node into a scoped one if valid.
 * @param {string} data
 * @param {boolean} isClosingTag
 * @param {CustomElementRegistry} registry
 * @return {string}
 */
const transformNode = (data, isClosingTag, registry) => {
  const [tagName, ...attrs] = data.substring(isClosingTag ? 2 : 1).split(/\s/);

  if (!isCustomElement(tagName) || registry === customElements) {
    return data;
  }

  const scopedTagName = getScopedTagName(tagName, registry);

  if (isClosingTag) {
    return `</${scopedTagName}`;
  }

  attrs.splice(0, 0, scopedTagName);

  return `<${attrs.join(' ')}`;
};

/**
 * Transforms a string array into another one with resolved scoped elements.
 *
 * @param {string} template
 * @param {CustomElementRegistry} registry
 * @returns {string}
 */
export const htmlTransform = (template, registry) => {
  let acc = '';
  let start = searchStart(template);
  let end = 0;
  let isClosingTag = false;

  while (start !== -1) {
    acc += template.slice(end, start);

    isClosingTag = template[start + 1] === '/';
    end = searchEnd(template, start + 1);

    acc += transformNode(template.slice(start, end), isClosingTag, registry);

    start = searchStart(template, end + 1);
  }

  acc += template.slice(end, template.length);

  return acc;
};
