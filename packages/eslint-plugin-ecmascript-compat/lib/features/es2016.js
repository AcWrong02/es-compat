import eslint from 'eslint';
import esPlugin from 'eslint-plugin-es-x';
// Import assertions aren't yet stage 4 so aren't supported by ESLint
import compatData from '@mdn/browser-compat-data/forLegacyNode';
import { noRestrictedSyntaxPrototypeMethod } from './ruleOptionsUtil.js';

const coreRules = new eslint.Linter().getRules();

export default [
  {
    ruleConfig: {
      definition: coreRules.get('no-restricted-syntax'), // 对于 Array.prototype.includes，使用 no-restricted-syntax 规则来检查是否正确使用了该方法
      options: noRestrictedSyntaxPrototypeMethod('Array.prototype.includes', 'ES2016'),
    },
    compatFeatures: [compatData.javascript.builtins.Array.includes], // 浏览器兼容性信息
    polyfill: 'Array.prototype.includes', // 如果目标环境不支持该特性，则需要使用的 polyfill 名称。比如，Array.prototype.includes 在不支持的环境中需要使用 polyfill
  },
  // 幂等运算符，可pass
  {
    ruleConfig: { definition: esPlugin.rules['no-exponential-operators'] },
    compatFeatures: [compatData.javascript.operators.exponentiation],
  },
];
