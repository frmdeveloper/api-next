export default async function handler(req, res) {
  if (req.method != 'POST') return res.json({error:"Only POST"})
  try {
    let p
    if (req.body.url) p = await pindl(req.body.url)
    if (req.body.query) p = await pinterest(req.body.query)
    if (req.body.base64) p = await pinterestReverse(Buffer.from(req.body.base64, "base64"))
    res.json(p)
  } catch (e) {
    res.json({error:e+""})
  }
}

import axios from "axios"
import cheerio from "cheerio"
import { fileTypeFromBuffer } from "file-type"
import FormData from "form-data"
import randomUA from "rand-user-agent"

const isUrl = (url) => {
	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/, 'gi'))
}
function getRandomNoRepeat(array, batasan) {
    var arrayAcak = [];
    while (arrayAcak.length < batasan && array.length > 0) {
        var randomIndex = Math.floor(Math.random() * array.length);
        var elemenAcak = array[randomIndex];
        arrayAcak.push(elemenAcak);
        array.splice(randomIndex, 1);
    }
    return Array.from(new Set(arrayAcak))
}

async function pindl(url) {
   try {
      let { data } = await axios.get("https://www.savepin.app/download.php", {
         params: {
            url,
            lang: "en",
            type: "redirect"
         }
      })
      let $ = cheerio.load(data)
      let formats = []
      $("table > tbody > tr").map((a, b) => {
         formats.push("https://www.savepin.app/" + $(b).find("#submiturl").attr("href"))
      })
      let result = {
         thumbnail: $("article > figure > p > img").attr("src"),
         description: $("article > div > div > p").text().trim(),
         formats
      }
      return result
   } catch {
      let { data } = await axios({
         url: "https://www.expertsphp.com/facebook-video-downloader.php",
         method: "POST",
         headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
         },
         data: new URLSearchParams(Object.entries({ url }))
      })
      let $ = cheerio.load(data)
      let html = $("#showdata").html()
      let arr = html?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|webp|mov|mp4|webm|gif))/g) || isUrl(html)
      return { formats: (arr.filter((a) => /videos/.test(a))[0] || arr[0]) }
   }
}

async function pinterest(query) {
   return new Promise(async (resolve) => {
      const res = await axios.get(
         `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${query}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${query}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`
      );
      var container = [];
      var data = res.data.resource_response.data.results;
      data = data.filter((v) => v.images?.orig !== undefined);
      for (const result of data) {
         container.push({
            upload_by: result.pinner.username,
            fullname: result.pinner.full_name,
            followers: result.pinner.follower_count,
            caption: result.grid_title,
            image: result.images.orig.url,
            source: "https://id.pinterest.com/pin/" + result.id,
         });
      }
      resolve(container);
   });
}

async function pinterestReverse(image) {
   try {
      let {ext} = await fileTypeFromBuffer(image)
      let form = new FormData()
      form.append('image', image, Math.floor(Math.random() * 99999999) + "." + ext)
      form.append('x', '0')
      form.append('y', '0')
      form.append('w', '1')
      form.append('h', '1')
      form.append('base_scheme', 'https')
      let { data } = await axios.put("https://api.pinterest.com/v3/visual_search/extension/image/", form, {
         headers: {
            "User-Agent": randomUA("desktop", "edge", "windows")
         }
      })
      return data
   } catch (e) {
      throw e
   }
}
