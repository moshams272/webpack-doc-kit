import { MarkdownTheme, MarkdownThemeContext } from "typedoc-plugin-markdown";
import { ReflectionKind } from "typedoc";
import * as typePartials from "./types.mjs";

const KIND_PREFIX = {
  [ReflectionKind.Class]: "Class",
  [ReflectionKind.Interface]: "Interface",
  [ReflectionKind.Enum]: "Enum",
  [ReflectionKind.TypeAlias]: "Type",
  [ReflectionKind.Namespace]: "Namespace",
  [ReflectionKind.Constructor]: "Constructor",
  [ReflectionKind.Property]: "Property",
  [ReflectionKind.Accessor]: "Accessor",
};

const STATIC_PREFIX = {
  [ReflectionKind.Method]: "Static method",
};

const resolveMemberPrefix = (model) =>
  model.flags?.isStatic ? STATIC_PREFIX[model.kind] : KIND_PREFIX[model.kind];

export class DocKitTheme extends MarkdownTheme {
  getRenderContext(page) {
    this.application.options.setValue("propertiesFormat", "table");
    return new DocKitThemeContext(this, page, this.application.options);
  }
}

export class DocKitThemeContext extends MarkdownThemeContext {
  helpers = {
    ...this.helpers,

    /** @param {import('typedoc').ParameterReflection} */
    typedListItem: ({ label, name, type, comment }) => {
      const namePart = label ? ` ${label}:` : name ? ` \`${name}\`` : "";
      const typePart = type
        ? ` ${typeof type === "string" ? type : this.partials.someType(type)}`
        : "";
      const descPart = comment
        ? ` ${this.helpers.getCommentParts(comment.summary ?? comment.content)}`
        : "";

      return `*${namePart}${typePart}${descPart}`;
    },

    typedList: (entries) => entries.map(this.helpers.typedListItem).join("\n"),
  };
  partials = {
    ...this.partials,
    ...typePartials,

    // Typed Lists
    parametersList: this.helpers.typedList,
    propertiesTable: this.helpers.typedList,
    signature: (model, options) => {
      const comment = options.multipleSignatures
        ? model.comment
        : model.comment || model.parent?.comment;

      return [
        model.typeParameters?.length &&
          this.partials.typeParametersList(model.typeParameters, {
            headingLevel: options.headingLevel,
          }),
        model.parameters?.length &&
          this.partials.parametersList(model.parameters, {
            headingLevel: options.headingLevel,
          }),
        this.helpers.typedListItem({
          label: "Returns",
          type: model.type ?? "void",
          comment: model.comment?.getTag("@returns"),
        }),
        "",
        comment &&
          this.partials.comment(comment, {
            headingLevel: options.headingLevel,
          }),
      ]
        .filter((x) => (typeof x === "string" ? x : Boolean(x)))
        .join("\n");
    },

    // Titles
    memberTitle: (model) => {
      const prefix = resolveMemberPrefix(model);
      const params = model.signatures?.[0]?.parameters ?? null;
      let name;
      if (params) {
        const paramsString = params.map((param, index) => {
          const isOptional = param.flags?.isOptional;
          if (isOptional) {
            return index === 0 ? `[${param.name}]` : `[, ${param.name}]`;
          }
          return index === 0 ? param.name : `, ${param.name}`;
        }).join("");
        name = `\`${model.name}(${paramsString})\``;
      } else {
        name = `\`${model.name}\``;
      }
      
      return prefix ? `${prefix}: ${name}` : name;
    },
  };
}

/** @param {import('typedoc').Application} app */
export function load(app) {
  app.renderer.defineTheme("doc-kit", DocKitTheme);
}
