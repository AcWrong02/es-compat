import * as compatibility from './compatibility.js';
import { createDelegatee, delegatingVisitor } from './delegation.js';
import features from './features/index.js';
import targetRuntimes from './targetRuntimes.js';

export default {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          polyfills: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                // This list is hard-coded so it can serve as documentation
                'globalThis',
                '{Array,String,TypedArray}.prototype.at',
                '{Array,TypedArray}.prototype.findLast',
                '{Array,TypedArray}.prototype.toReversed',
                '{Array,TypedArray}.prototype.toSorted',
                '{Array,TypedArray}.prototype.with',
                'Array.prototype.flat',
                'Array.prototype.flatMap',
                'Array.prototype.includes',
                'Array.prototype.toSpliced',
                'Error.cause',
                'Object.entries',
                'Object.fromEntries',
                'Object.getOwnPropertyDescriptors',
                'Object.hasOwn',
                'Object.values',
                'Promise.prototype.allSettled',
                'Promise.prototype.any',
                'Promise.prototype.finally',
                'String.prototype.matchAll',
                'String.prototype.padEnd',
                'String.prototype.padStart',
                'String.prototype.replaceAll',
                'String.prototype.trimEnd',
                'String.prototype.trimLeft',
                'String.prototype.trimRight',
                'String.prototype.trimStart',
              ],
            },
          },
          overrideBrowserslist: {
            oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          },
          browserslistOptions: {
            type: 'object',
            additionalProperties: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    // 提取用户配置
    const overrideBrowserslist = context.options?.[0]?.overrideBrowserslist;
    const browserslistOptions = context.options?.[0]?.browserslistOptions;
    // 解析目标运行时, 计算用户的目标运行时环境（如某些浏览器版本或 Node.js 版本）
    const targets = targetRuntimes(overrideBrowserslist, browserslistOptions);
    // 获取不支持的特性
    const unsupportedFeatures = compatibility.unsupportedFeatures(features, targets);
    // 处理 polyfills
    // 提取用户指定的 polyfills 列表
    // 如果某个特性出现在 polyfills 中，即使目标运行时不支持，也不会报告错误
    const polyfills = context.options?.[0]?.polyfills ?? [];
    // 创建访问器
    // 1.过滤：
    //  (1)忽略那些已经通过 polyfills 处理的不兼容特性
    // 2.创建访问器：
    //  (1)每个不兼容的特性都定义了自己的规则配置（feature.ruleConfig）。
    //  (2)调用 createDelegatee，为每个规则生成特定的访问器。
    const visitors = unsupportedFeatures
      .filter((feature) => !polyfills.includes(feature.polyfill))
      .map((feature) => createDelegatee(feature.ruleConfig, context));
    // 返回代理访问器
    return delegatingVisitor(visitors);
  },
};
