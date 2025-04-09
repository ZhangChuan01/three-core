module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-rational-order'
  ],
  plugins: [ 'stylelint-scss', 'stylelint-order' ],
  overrides: [
    // 扫描.vue/html文件中的<style>标签内的样式
    {
      files: [ '**/*.{vue,html}' ],
      customSyntax: 'postcss-html' 
    }
  ],
  // 覆盖配置（优先级大于config-standard）
  rules: {
    'declaration-colon-space-after': 'always',
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: [ 'deep' ]
      }
    ],
    'no-extra-semicolons': true,
    'block-opening-brace-space-before': 'always',
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'rule-empty-line-before': 'never-multi-line',
    'block-closing-brace-empty-line-before': 'never',
    'selector-id-pattern': '^[a-z][a-zA-Z0-9]+$',
    'max-line-length': null
  }
}
