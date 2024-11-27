const { execSync } = require('child_process');

async function main() {
  const cmd = process.argv[2]; // 获取命令，如 'eslint'
  const params = process.argv.slice(3); // 获取后续的参数

  const fileParams = [];
  const otherParams = [];

  params.forEach((param) => {
    console.log('param--', param);
    if (/\.[a-z]+$/i.test(param)) {
      fileParams.push(param); // 匹配文件参数
    } else {
      otherParams.push(param); // 其他参数
    }
  });

  // 动态设置 BROWSERSLIST_ENV 变量
  process.env.BROWSERSLIST_ENV = 'dbsheet'; // 您可以根据需要动态调整此值
  console.log(`BROWSERSLIST_ENV is set to: ${process.env.BROWSERSLIST_ENV}`);

  // 拼接完整的命令
  const fullCommand = `${cmd} ${otherParams.join(' ')} ${fileParams.join(' ')}`;
  console.log(`Executing: ${fullCommand}`);

  try {
    // 执行命令并输出结果
    execSync(fullCommand, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error executing command:', error.message);
    process.exit(1);
  }
}

main();
