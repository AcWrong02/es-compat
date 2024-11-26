const bcd = require('@mdn/browser-compat-data');
const chalk = require('chalk');

// 获取API支持数据的函数
function getBrowserSupport(apiName) {
  // 遍历BCD中的所有API数据
  const apiPaths = apiName.split('.');
  let data = bcd;

  // 按路径查找API
  try {
    for (const path of apiPaths) {
      data = data[path];
    }

    if (!data || !data.__compat) {
      console.log(chalk.red(`未找到API: ${apiName}`));
      return;
    }

    const supportData = data.__compat.support;

    console.log(chalk.green(`兼容性信息: ${apiName}`));
    for (const [browser, info] of Object.entries(supportData)) {
      const versions = Array.isArray(info) ? info : [info];
      versions.forEach((version) => {
        console.log(`${chalk.blue(browser)}: ${version.version_added || '不支持'}`);
      });
    }
  } catch (error) {
    console.log(chalk.red('查询时出错:'), error);
  }
}

const apiName = 'javascript.builtins.String.replaceAll';

getBrowserSupport(apiName);
