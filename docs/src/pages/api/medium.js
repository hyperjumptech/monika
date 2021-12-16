import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(404).json({
      success: false,
      message: 'Method not found',
    })
  }

  const { data } = await axios({
    method: 'GET',
    url: 'https://medium.com/feed/hyperjump-tech',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/rss+xml',
    },
  })

  const parser = new XMLParser()
  const parsed = parser.parse(data)
  const { rss } = parsed
  const { channel } = rss
  const { item } = channel

  res.status(200).json(item)
}
