/* eslint-disable camelcase, no-underscore-dangle */
import compareVersions from './compareVersions.js';

// 功能：返回一个数组，其中包含所有在目标环境（targets）中不被支持的特性（features）。
// 输入参数：
// features：这是一个特性列表（如 features/index.js 中的所有特性）。
// targets：目标环境列表（例如用户通过 browserslist 配置提供的浏览器版本或 Node.js 版本）。
// 实现：
// 对于每个特性（feature），调用 isFeatureSupportedByTargets(feature, targets) 来判断它是否被所有目标环境支持。
// 如果一个特性在任何目标环境中都不支持，那么它就会被包含在返回结果中。
export function unsupportedFeatures(features, targets) {
  return features.filter((feature) => !isFeatureSupportedByTargets(feature, targets));
}

// 功能：检查一个特性是否被所有目标环境（targets）支持。
// 实现：
// 使用 every 方法，确保特性在每个目标环境中都受到支持。
// 对于每个目标环境（target），调用 isFeatureSupportedByTarget(feature, target) 进行判断。
function isFeatureSupportedByTargets(feature, targets) {
  return targets.every((target) => isFeatureSupportedByTarget(feature, target));
}

// 功能：判断一个特性是否在某个目标环境（target）中被支持。
// 实现：
// 首先，检查 feature.compatFeatures 中是否存在 undefined，如果存在，则抛出异常。
// compatFeatures 是特性对应的兼容性数据数组。如果某个特性的兼容性数据不完整，说明可能存在问题。
// 接着，使用 every 确保所有与该特性相关的兼容性数据（compatFeature）都被目标环境支持。如果一个兼容性特性未被目标环境支持，返回 false。
function isFeatureSupportedByTarget(feature, target) {
  if (feature.compatFeatures.includes(undefined)) {
    const summary = feature.compatFeatures.map((compatFeature) => typeof compatFeature);
    const ruleDescription = feature.ruleConfig.definition.meta.docs.description;

    throw new Error(`Sparse compatFeatures for rule '${ruleDescription}': ${summary}`);
  }

  return feature.compatFeatures.every((compatFeature) =>
    isCompatFeatureSupportedByTarget(compatFeature, target)
  );
}

// 功能：判断一个兼容性特性（compatFeature）是否在某个目标环境（target）中被支持。
// 实现：
// eslint-disable-next-line max-len
// 使用 getSimpleSupportStatement(compatFeature, target) 获取该特性在目标环境中的支持情况。该支持情况包括 version_added 字段，表示该特性在目标环境中被添加的版本。
// 使用 interpretSupport(versionAdded) 解析 versionAdded 字段：
// isUnknown：表示该特性是否在目标环境中有未知的支持状态。
// isNone：表示该特性在目标环境中不被支持。
// isVersionUnknown：表示该特性支持的版本未知。
// 如果支持版本未知（isUnknown 或 isVersionUnknown），函数会假设该特性在目标环境中是支持的。
// eslint-disable-next-line max-len
// 否则，函数会比较目标环境的版本（target.version）与该特性添加支持的版本（versionAdded）。如果目标版本高于或等于该特性支持的版本，则认为该特性在目标环境中是支持的。
function isCompatFeatureSupportedByTarget(compatFeature, target) {
  const versionAdded = getSimpleSupportStatement(compatFeature, target).version_added;
  const support = interpretSupport(versionAdded);

  if (support.isUnknown || support.isVersionUnknown) {
    // Assume optimistically; we can only be as good as the compatibility data
    return true;
  }

  return !support.isNone && compareVersions(target.version, versionAdded) >= 0;
}

// 功能：获取特性在特定目标环境中的兼容性声明。
// 实现：
// 从 compatFeature.__compat.support[target.name] 获取该特性在目标环境中的支持情况。
// 如果支持声明是一个数组（可能因为该特性在目标环境中有多个支持版本），则选择数组中的第一个声明。
// 如果没有支持声明，则返回一个默认值 { version_added: null }，表示该特性没有明确的支持版本。
function getSimpleSupportStatement(compatFeature, target) {
  const statement = compatFeature.__compat.support[target.name];

  // Take the most relevant and general entry when there are ones for behind-a-flag etc.
  // https://github.com/mdn/browser-compat-data/blob/master/schemas/compat-data-schema.md#the-support_statement-object
  const simpleStatement = Array.isArray(statement) ? statement[0] : statement;

  // Only mandatory for desktop browsers
  // https://github.com/mdn/browser-compat-data/blob/master/schemas/compat-data-schema.md#browser-identifiers
  return simpleStatement || { version_added: null };
}

// 功能：解析 versionAdded 字段，返回该特性在目标环境中的支持状态。
// 实现：
// 如果 versionAdded 为 null，则认为该特性支持情况未知（isUnknown）。
// 如果 versionAdded 为 false，则认为该特性在目标环境中不被支持（isNone）。
// 如果 versionAdded 为 true，则认为该特性的支持版本未知（isVersionUnknown）。
function interpretSupport(versionAdded) {
  // https://github.com/mdn/browser-compat-data/blob/master/schemas/compat-data-schema.md#version_added
  return {
    isUnknown: versionAdded == null,
    isNone: versionAdded === false,
    isVersionUnknown: versionAdded === true,
  };
}
