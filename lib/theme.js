import React, {Component, PropTypes} from 'react';
import {render as reactRender} from 'react-dom';
import {renderToString} from 'react-dom/server';
import keyMirror from 'key-mirror';
import jsonStringifySafe from 'json-stringify-safe';
import stringFormat from 'string-template';

export default class Theme extends Component {
  static PROP_NAME = '__DIZ__';

  static propTypes = {
    type: PropTypes.string.isRequired
  };

  static types = keyMirror({
    LIST: null,
    POST: null
  });

  static toSafeJson(props) {
    return jsonStringifySafe(props);
  }

  static render(props) {
    return renderToString(<this {...JSON.parse(props)}/>);
  }

  static buildHTML(opts) {
    return stringFormat(this.wrapper, opts);
  }

  static get wrapper() {
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="stylesheet" href="/styles/index.css">
  <title>Document</title>
</head>
<body>
  <div id="blog" class="blog">{markup}</div>

  <script src="/scripts/bundle.js"></script>
  <script>
    window.${this.PROP_NAME}.render({props})
  </script>
</body>
</html>
    `.trim();
  }

  static renderingElement = 'blog';

  static renderToString(props) {
    props = this.toSafeJson(props);
    const markup = this.render(props);
    return stringFormat(this.wrapper, {markup, props});
  }

  renderContents(type) {
    switch (type) {
      case this.constructor.types.LIST: {
        return this.renderContentOfList();
      }
      case this.constructor.types.POST: {
        return this.renderContentOfPost();
      }
      default: {
        return null;
      }
    }
  }

  static init() {
    if (typeof window !== 'undefined') {
      const Container = this;
      window[this.PROP_NAME] = {
        render(props) {
          const elem = document.getElementById(Container.renderingElement);
          if (!elem) {
            throw new Error([
              'No element.',
              'It may be fixed by specifying `this.renderingElement`'
            ].join(' '));
          }
          reactRender(<Container {...props}/>, elem);
        }
      };
    }
  }
}
