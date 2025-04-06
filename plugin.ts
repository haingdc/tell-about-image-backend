export default {
  name: "personal-lint-rule",
  rules: {
    "prefer-export-default": {
      create(ctx) {
        return {
          ExportNamedDeclaration(node) {
            if (node.declaration?.type === "VariableDeclaration") {
              ctx.report({
                node,
                message:
                  "Don't use export constin multiple places, prefer to use a single `export default`",
                fix(fixer) {
                  // return fixer.remove(node);
                  return fixer.insertTextBefore(
                    node,
                    "/* warning: don't use export const */\n",
                  );
                },
              });
            }
          },
        };
      },
    },
  },
} satisfies Deno.lint.Plugin;
