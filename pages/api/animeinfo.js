export default async function handler(req, res) {
  try {
    const p = await anime(req.query?.title || req.body?.title)
    res.json(p)
  } catch (e) {
    res.json({error:e+""})
  }
}

import axios from "axios"
import cheerio from "cheerio"

async function infolngkp(linkanime) {
    const lihat = await axios.get(linkanime)
    const $$ = cheerio.load(lihat.data)
    const info = {}
    $$('#content > table > tbody > tr > td.borderClass > div > div.spaceit_pad').each(function (a, b) {
        const nama = $$(b).text().split(':')[0].trim().split('\n')[0] || $$(b).text().split(':')[0].trim()
        if (nama) info[nama] = $$(b).text().split(':')[1].trim().split('\n')[0] || $$(b).text().split(':')[1].trim()
    })
    return {
        Title: $$('#contentWrapper > div:nth-child(1) > div > div.h1-title > div > h1').text(),
        ...info,
        Image: $$('#content > table > tbody > tr > td.borderClass > div > div:nth-child(1) > a > img').attr('data-src') || $$('#content > table > tbody > tr > td.borderClass > div > div:nth-child(1) > a > img').attr('src'),
        Synopsis: $$('#content > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr:nth-child(1) > td > p').text(),
    }
}
async function anime(q) {
    const cari = await axios.get("https://myanimelist.net/anime.php?cat=anime&q="+q)
    const $ = cheerio.load(cari.data)
    const link = $("#content > div.js-categories-seasonal.js-block-list.list > table > tbody > tr > td:nth-child(1) > div > a").attr("href")
    if (!link) throw "not found"
    return infolngkp(link)
}

export async function tracemoe(buper) {
    const {data} = await axios.post("https://api.trace.moe/search?anilistInfo", buper)
    if (data?.error) throw data.error
    const {idMal} = data?.result[0]?.anilist
    const inp = await infolngkp("https://myanimelist.net/anime/"+idMal)
    return {...inp, ...data?.result[0]}
}