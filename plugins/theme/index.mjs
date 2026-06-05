import { MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';
import helpers from './helpers/index.mjs';
import partials from './partials/index.mjs';

export class DocKitTheme extends MarkdownTheme {
  getRenderContext(page) {
    return new DocKitThemeContext(this, page, this.application.options);
  }
}

export class DocKitThemeContext extends MarkdownThemeContext {
  helpers = helpers(this);

  partials = partials(this);

  #originalReflection = this.templates.reflection;
  #originalIndex = this.templates.index;

  templates = {
    ...this.templates,

    reflection: page => {
      const frontmatter = `---\nlayout: "api"\n---\n\n`;

      return frontmatter + this.#originalReflection(page);
    },

    index: page => {
      const frontmatter = `---\nlayout: "api"\n---\n\n`;

      return frontmatter + this.#originalIndex(page);
    },
  };
}

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.defineTheme('doc-kit', DocKitTheme);
}
