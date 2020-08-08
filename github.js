const puppeteer = require('puppeteer');
const fs = require('fs');


async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  // await page.goto('https://github.com');
  // await page.screenshot({ path: 'screenshots/github.png' });

  await page.goto('https://github.com/login');

  // dom element selectors
  const USERNAME_SELECTOR = '#login_field';
  const PASSWORD_SELECTOR = '#password';
  const BUTTON_SELECTOR = '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block';

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type("Sanjay007");

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type("888999999#");

  await page.click(BUTTON_SELECTOR);
  await page.waitForNavigation();

  const userToSearch = 'java';
  const searchUrl = `https://github.com/search?q=${userToSearch}&type=Users&utf8=%E2%9C%93`;
  // let searchUrl = 'https://github.com/search?utf8=%E2%9C%93&q=bashua&type=Users';

  await page.goto(searchUrl);
  await page.waitFor(2 * 1000);

    // const LIST_USERNAME_SELECTOR = '#user_search_results > div.user-list > div:nth-child(1) > div.d-flex > div > a';
  const LIST_USERNAME_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex > div > a';
    // const LIST_EMAIL_SELECTOR = '#user_search_results > div.user-list > div:nth-child(1) > div.d-flex > div > ul > li:nth-child(2) > a';
  const LIST_EMAIL_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex > div > ul > li:nth-child(2) > a';
  const LENGTH_SELECTOR_CLASS = 'user-list-item';
  const numPages = await getNumPages(page);

  console.log('Numpages: ', numPages);
  let arr=[];
  for (let h = 1; h <= 100; h++) {
    //await page.waitFor(3000);

    let pageUrl = searchUrl + '&p=' + h;
    await page.goto(pageUrl);

    await page.waitFor(5 * 1000);


    let listLength = await page.evaluate((LIST_USERNAME_SELECTOR) => {
      return document.getElementsByClassName(LIST_USERNAME_SELECTOR).length;
    }, LENGTH_SELECTOR_CLASS);

   
    for (let i = 1; i <= listLength; i++) {
      // change the index to the next child
      const LIST_USERNAME_SELECTOR2= '#user_search_results > div.user-list > div:nth-child(INDEX) div.d-flex  a';

      let usernameSelector = LIST_USERNAME_SELECTOR2.replace("INDEX", i);

      const LIST_EMAIL_SELECTOR2= '#user_search_results > div.user-list > div:nth-child(INDEX) > div.flex-auto > div.d-flex.flex-wrap.text-small.text-gray > div > a';


      let emailSelector = LIST_EMAIL_SELECTOR2.replace("INDEX", i);

      let username = await page.evaluate((sel) => {
          console.log(sel);
        return document.querySelector(sel).getAttribute('href').replace('/', '');
      }, usernameSelector);

      //console.log(username);

      let email = await page.evaluate((sel) => {
        let element = document.querySelector(sel);
        return element ? element.innerHTML : null;
      }, emailSelector);

      // not all users have emails visible
      if (!email)
        continue;
        //console.log({"username":username,"email":email});
arr.push({"username":username,"email":email})

      
    }
  }
let data=JSON.stringify(arr);
fs.writeFileSync('student-2.json', data);

  browser.close();
}

async function getNumPages(page) {
  const NUM_USER_SELECTOR = '#js-pjax-container > div > div.col-12.col-md-9.float-left.px-2.pt-3.pt-md-0.codesearch-results > div > div.d-flex.flex-column.flex-md-row.flex-justify-between.border-bottom.pb-3.position-relative > h3';
  let inner = await page.evaluate((sel) => {
    let html = document.querySelector(sel).innerHTML;

    // format is: "69,803 users"
    return html.replace(',', '').replace('users', '').trim();
  }, NUM_USER_SELECTOR);

  const numUsers = parseInt(inner);

  console.log('numUsers: ', numUsers);

  /**
   * GitHub shows 10 resuls per page, so
   */
  return Math.ceil(numUsers / 10);
}


run();
