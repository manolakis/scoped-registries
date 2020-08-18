/* eslint func-names:0, object-shorthand:0 */
Object.defineProperty(CSSStyleSheet.prototype, 'subscriptions', {
  get: function () {
    if (!this.__subscriptions) {
      this.__subscriptions = [];
    }

    return this.__subscriptions;
  },
  set: function (value) {
    this.__subscriptions = value;
  },
});

export const polyfillCSSStyleSheet = () => {
  const that = CSSStyleSheet.prototype;

  that.subscribe = function subscribe(callback) {
    this.subscriptions.push(callback);
  };

  const __replace = that.replace;
  that.replace = async function replace(html) {
    const result = await __replace.call(this, html);

    this.subscriptions.forEach(subscription =>
      subscription({
        name: 'replace',
        args: [html],
      })
    );

    return result;
  };

  const addNotification = methodName => {
    if (that[methodName]) {
      const method = that[methodName];
      that[methodName] = function (...args) {
        const result = method.call(this, ...args);

        this.subscriptions.forEach(subscription =>
          subscription({
            name: methodName,
            args,
          })
        );

        return result;
      };
    }
  };

  [
    'replaceSync',
    'addRule',
    'removeRule',
    'insertRule',
    'deleteRule',
  ].forEach(methodName => addNotification(methodName));
};
