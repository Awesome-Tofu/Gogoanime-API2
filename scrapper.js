const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer =  require('puppeteer');
const userAgent = require('user-agents');
const FormData = require("form-data");
let mime = require("mime-to-extensions");
const fs = require("fs");

// https://www3.gogoanimes.fi/
// https://gogoanime.run
// https://ww5.gogoanimes.fi/
// https://gogoanime.org.za/
// https://anitaku.so/
const baseUrl = "https://anitaku.so/"

async function newSeason(page) {
    var anime_list = []


    res = await axios.get(`${baseUrl}/new-season.html?page=${page}`)
    const body = await res.data;
    const $ = cheerio.load(body)

    $('div.main_body div.last_episodes ul.items li').each((index, element) => {
        $elements = $(element)
        name = $elements.find('p').find('a')
        img = $elements.find('div').find('a').find('img').attr('src')
        link = $elements.find('div').find('a').attr('href')
        anime_name = { 'name': name.html(), 'img_url': `${baseUrl}${img}`, 'anime_id': link.slice(10,) }
        anime_list.push(anime_name)

    })

    return await (anime_list)
}


async function popular(page) {
    var anime_list = []


    res = await axios.get(`${baseUrl}/popular.html?page=${page}`)
    const body = await res.data;
    const $ = cheerio.load(body)

    $('div.main_body div.last_episodes ul.items li').each((index, element) => {
        $elements = $(element)
        name = $elements.find('p').find('a')
        img = $elements.find('div').find('a').find('img').attr('src')
        link = $elements.find('div').find('a').attr('href')
        anime_name = { 'name': name.html(), 'img_url': img, 'anime_id': link.slice(10,) }
        anime_list.push(anime_name)

    })

    return await (anime_list)
}

async function search(query) {
    var anime_list = []


    res = await axios.get(`${baseUrl}/search.html?keyword=${query}`)
    const body = await res.data;
    const $ = cheerio.load(body)

    $('div.main_body div.last_episodes ul.items li').each((index, element) => {
        $elements = $(element)
        name = $elements.find('p').find('a')
        img = $elements.find('div').find('a').find('img').attr('src')
        link = $elements.find('div').find('a').attr('href')
        anime_name = { 'name': name.html(), 'img_url': img, 'anime_id': link.slice(10,) }
        anime_list.push(anime_name)

    })

    return await (anime_list)
}

async function anime(_anime_name) {


    episode_array = []

    res = await axios.get(`${baseUrl}/category/${_anime_name}`)
    const body = await res.data;
    const $ = cheerio.load(body)

    img_url = $('div.anime_info_body_bg  img').attr('src')
    anime_name = $('div.anime_info_body_bg  h1').text()
    anime_about = $('div.description').text().trim();

    // anime_about = $('div.main_body  div:nth-child(2) > div.anime_info_body_bg > p:nth-child(5)').text()

    //add the new code here
    el = $('#episode_page')

    ep_start = 1

    ep_end = el.children().last().find('a').text().split("-")[1]

    for (let i = ep_start; i <= ep_end; i++) {
        episode_array.push(`${_anime_name}-episode-${i}`)

    }

    anime_result = { 'name': anime_name, 'img_url': img_url, 'about': anime_about, 'episode_id': episode_array }

    return await (anime_result)
}

async function watchAnime(episode_id) {

    res = await axios.get(`${baseUrl}/${episode_id}`)
    const body = await res.data;
    $ = cheerio.load(body)

    episode_link = $('li.dowloads > a').attr('href')

    ep = await getDownloadLink(episode_link)

    return await (ep)
}

async function getDownloadLink(episode_link) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString())
    await page.goto(episode_link, { waitUntil: 'networkidle0' });
    const links = await page.evaluate(() => {
    let ep_links = []
    //fetch all links
    const ep = document.querySelector(".mirror_link");
    ep.querySelectorAll('a').forEach((link)=>{
        ep_links.push({"name":link.innerText.split("D ")[1].replace(/[()]/g, ""),"link":link.href})
    })

    return ep_links
    });

    await browser.close();

    return (links)
}

async function downloadImage(url, destination) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  response.data.pipe(fs.createWriteStream(destination));
  return new Promise((resolve, reject) => {
    response.data.on("end", () => {
      resolve();
    });
    response.data.on("error", (err) => {
      reject(err);
    });
  });
}

async function uploadImageToTelegraph(imagePath) {
  let imageBuffer = fs.readFileSync(imagePath);
  let form = new FormData();
  form.append("file", imageBuffer, {
    filename: `telegraph.${mime.extension('image/png')}`,
  });
  return axios
    .create({
      headers: form.getHeaders(),
    })
    .post("https://te.legra.ph/upload", form)
    .then((response) => {
      return "https://te.legra.ph" + response.data[0].src;
    })
    .catch((error) => {
      return "error";
    });
}

async function telegraph(imageUrl) {
  const imagePath = "/tmp/downloaded_image.png";
  await downloadImage(imageUrl, imagePath);
  const telegraphUrl = await uploadImageToTelegraph(imagePath);
  return telegraphUrl
}

async getRedirectUrl(url) {
    try {
        // Make a GET request to the provided URL
        const response = await axios.get(url);

        const new_url = response.request._redirectable._currentUrl
        // console.log(new_url);
        return new_url;
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    popular,
    newSeason,
    search,
    anime,
    watchAnime,
    telegraph,
    getRedirectUrl
}

