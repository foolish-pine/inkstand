/** @type {import('stylelint').Config} */

const config = {
  extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
  rules: {
    "import-notation": "string",
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "apply",
          "config",
          "custom-variant",
          "plugin",
          "reference",
          "source",
          "theme",
          "utility",
          "variant",
        ],
      },
    ],
  },
};

export default config;
