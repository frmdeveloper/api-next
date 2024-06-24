import translate from "translate-google-api"
export default async function handler(req, res) {
  if (req.method != 'POST') return res.json({error:"Only POST"})
  try {
    const tr = await translate(req.body.text, {from: req.body.from, to: req.body.to || "id"})
    res.json(tr+"")
  } catch (e) {
    res.json({error:e+""})
  }
}