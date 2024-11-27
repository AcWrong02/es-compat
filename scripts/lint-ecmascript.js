async function main() {
  const cmd = process.argv[2];
  const params = process.argv.slice(3);

  const fileParams = [];
  const otherParams = []; // 在此处代码中动态的修改BROWSERSLIST_ENV变量的值

  params.forEach((param) => {
    console.log('param--', param);
    if (/\.[a-z]+$/i.test(param)) {
      fileParams.push(param);
    } else {
      otherParams.push(param);
    }
  });

  process.exit(1);
}
main();
