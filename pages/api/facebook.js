export default async function handler(req, res) {
  if (req.method != 'POST') return res.json({error:"Only POST"})
  try {
    const p = await snapsave(req.body.url)
    res.json(p)
  } catch (e) {
    res.json({error:e+""})
  }
}

import axios from "axios"
import cheerio from "cheerio"
import randomUA from "rand-user-agent"
import FormData from "form-data"

async function facebook(url) {
   try {
      let date = String(Date.now()).slice(0, 10)
      let { data } = await axios.post("https://yt5s.io/api/ajaxSearch/facebook", {
         q: url,
         vt: "facebook"
      }, {
         headers: {
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://yt5s.io",
            "Referer": "https://yt5s.io/en20/facebook-downloader",
            "Cookie": `.AspNetCore.Culture=c%3Den%7Cuic%3Den; _ga=GA1.1.2011585369.${date}; _ga_P5PP4YVN0Y=GS1.1.${date}.4.1.${date}.0.0.0`,
            "User-Agent": randomUA("desktop", "edge", "windows"),
            "X-Requested-With": "XMLHttpRequest"
         }
      })

      return data
   } catch (e) {
      return await facebookdlv2(url)
   }
}

async function facebookdlv2(url) {
   try {
      let date = String(Date.now()).slice(0, 1)
      let { data } = await axios.post("https://getmyfb.com/process", {
         "id": url,
         locale: "en"
      }, {
         headers: {
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": `PHPSESSID=k3eqo1f3rsq8fld57fgs9ck0q9; _token=1AHD0rRsiBSwwh7ypRad; __cflb=04dToeZfC9vebXjRcJCMjjSQh5PprejvCpooJf5xhb; _ga=GA1.2.193364307.1690654540; _gid=GA1.2.326360651.1690654544; _gat_UA-3524196-5=1; _ga_96G5RB4BBD=GS1.1.1690654539.1.0.1690654555.0.0.0`,
            "Origin": "https://getmyfb.com",
            "Referer": "https://getmyfb.com/",
            "Hx-Current-Url": "https://getmyfb.com",
            "Hx-Request": true,
            "Hx-Target": "target",
            "Hx-Trigger": "form",
            "User-Agent": randomUA("desktop", "edge", "windows")
         }
      })
      let $ = cheerio.load(data)
      let urls = []
      $("ul > li").map((a, b) => {
         urls.push({ quality: $(b).text().trim(), url: $(b).find("a").attr("href") })
      })
      let result = {
         description: $("div.results-item > div.results-item-text").text().trim(),
         urls
      }
      if (urls.length == 0) return $("h4").text()
      return result
   } catch (e) {
      throw e
   }
}

function decodeSnapApp(args) {
   let [h, u, n, t, e, r] = args
   // @ts-ignore
   function decode(d, e, f) {
      const g = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('')
      let h = g.slice(0, e)
      let i = g.slice(0, f)
      // @ts-ignore
      let j = d.split('').reverse().reduce(function (a, b, c) {
         if (h.indexOf(b) !== -1)
            return a += h.indexOf(b) * (Math.pow(e, c))
      }, 0)
      let k = ''
      while (j > 0) {
         k = i[j % f] + k
         j = (j - (j % f)) / f
      }
      return k || '0'
   }
   r = ''
   for (let i = 0, len = h.length; i < len; i++) {
      let s = ""
      // @ts-ignore
      while (h[i] !== n[e]) {
         s += h[i]; i++
      }
      for (let j = 0; j < n.length; j++)
         s = s.replace(new RegExp(n[j], "g"), j.toString())
      // @ts-ignore
      r += String.fromCharCode(decode(s, e, 10) - t)
   }
   return decodeURIComponent(encodeURIComponent(r))
}
function getEncodedSnapApp(data) {
   return data?.split('decodeURIComponent(escape(r))}(')[1]
      .split('))')[0]
      .split(',')
      .map(v => v.replace(/"/g, '').trim())
}
function getDecodedSnapSave(data) {
   return data?.split('getElementById("download-section").innerHTML = "')[1]
      .split('"; document.getElementById("inputData").remove(); ')[0]
      .replace(/\\(\\)?/g, '')
}
function decryptSnapSave(data) {
   return getDecodedSnapSave(decodeSnapApp(getEncodedSnapApp(data)))
}
async function getRender(url) {
   try {
      let { data } = await axios.get("https://snapsave.app" + url, {
         headers: {
            "Accept": "*/*",
            "Referer": "https://snapsave.app/"
         }
      })
      return data?.data?.file_path || ""
   } catch (e) {
      throw e
   }
}
async function snapsave(url) {
   try {
      let date = String(Date.now()).slice(0, 10)
      let form = new FormData()
      form.append("url", url)
      let { data } = await axios.post("https://snapsave.app/action.php?lang=en", form, {
         headers: {
            "Origin": "https://snapsave.app",
            "Referer": "https://snapsave.app/",
            "Cookie": `_ga=GA1.1.2035716653.${date}; _ga_WNPZGVDWE9=GS1.1.${date}.2.1.${date}.49.0.0`,
            "User-Agent": randomUA("desktop", "edge", "windows"),
            ...form.getHeaders()
         }
      })
      data = await decryptSnapSave(data)
      let $ = cheerio.load(data)
      let results = []
      $("table > tbody > tr").map(async (c, d) => {
         let render = $(d).find("button").attr("onclick")
         render = /(['"])(.*?)\1/g.exec(render)
         render = render?.[2] || render?.[1] || render?.[0] || false
         //if (render) render = await getRender(render)
         results.push({ quality: $(d).find("td.video-quality").text(), url: ($(d).find("a").attr("href") || render) })
      })
      return { description: $('div.media-content > div.content > p > span.video-des').text(), urls: results.filter(a => a) }
   } catch (e) {
      return await facebook(url)
   }
}
