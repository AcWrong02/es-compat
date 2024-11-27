const puppeteer = require('puppeteer');

async function fetchCompatibility(keyword) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 设置请求拦截
    await page.setRequestInterception(true);

    let isHandled = false;

    // 创建一个 Promise，用于等待目标响应
    const responsePromise = new Promise((resolve, reject) => {
      // 监听请求事件
      page.on('request', (request) => {
        const url = request.url();
        if (url.includes('https://caniuse.com/process/get_feat_data.php') && !isHandled) {
          console.log('Intercepted request:', url);
          request.continue();
        } else {
          request.continue();
        }
      });

      // 监听响应事件
      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('https://caniuse.com/process/get_feat_data.php') && !isHandled) {
          console.log('Matched response:', url);

          try {
            const responseData = await response.json();
            console.log('Response data:', responseData);
            isHandled = true;
            resolve(); // 响应捕获后立即解决 Promise
          } catch (err) {
            console.error('Error reading response:', err);
            reject(err); // 如果解析失败，拒绝 Promise
          }
        }
      });
    });

    // 打开页面
    await page.goto('https://caniuse.com/', { waitUntil: 'networkidle2' });

    // 输入关键词并触发搜索
    await page.type('#feat_search', keyword);
    await page.keyboard.press('Enter');

    // 等待响应 Promise 完成
    await responsePromise;

    // 处理完成后关闭浏览器
    await browser.close();
    console.log('Browser closed after processing first response.');
  } catch (error) {
    console.error('Error fetching compatibility data:', error);
    await browser.close(); // 确保发生错误时也关闭浏览器
  }
}

// 使用示例
fetchCompatibility('Promise.finally');
