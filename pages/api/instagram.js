export default async function handler(req, res) {
  if (req.method != 'POST') return res.json({error:"Only POST"})
  try {
    const p = await instavideosave(req.body.url)
    res.json(p)
  } catch (e) {
    res.json({error:e+""})
  }
}

import axios from "axios"
import cheerio from "cheerio"
import randomUA from "rand-user-agent"
import crypto from "crypto"

function igdl(url) {
    return new Promise(async (resolve, reject) => {
    const payload = new URLSearchParams(
      Object.entries({
        url: url,
        host: "instagram"
      })
    )
    await axios.request({
      method: "POST",
      baseURL: "https://saveinsta.io/core/ajax.php",
      data: payload,
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: "PHPSESSID=rmer1p00mtkqv64ai0pa429d4o",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
      }
    })
    .then(( response ) => {      
      const $ = cheerio.load(response.data)
      const mediaURL = $("div.row > div.col-md-12 > div.row.story-container.mt-4.pb-4.border-bottom").map((_, el) => {
        return "https://saveinsta.io/" + $(el).find("div.col-md-8.mx-auto > a").attr("href")
      }).get()
      const res = {
        media: mediaURL
      }
      resolve(res)
    })
    .catch((e) => {
      console.log(e)
      throw {
        message: "error",
      }
    })
  })
}

async function instavideosave(url) {
    const encodeUrl = (text) => {
        const key = 'qwertyuioplkjhgf';
        const cipher = crypto.createCipheriv('aes-128-ecb', key, '');
        return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    }

    try {
        let { data } = await axios.get("https://backend.instavideosave.com/allinone", {
            headers: {
                "Accept": "*/*",
                "Origin": "https://instavideosave.net",
                "Referer": "https://instavideosave.net/",
                "User-Agent": randomUA("dekstop", "chrome", "linux"),
                "Url": encodeUrl(url)
            }
        })

        return data
    } catch (e) {
        throw e
    }
}