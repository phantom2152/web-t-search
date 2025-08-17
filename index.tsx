import {Hono} from "hono"
import { TorrentSearchPage } from "./components/TorrentSearchPage"

const app = new Hono()


if (process.env.NODE_ENV !== 'production') {
  const { serveStatic } = await import("hono/bun")
  app.use('/static/*', serveStatic({ root: './public' }))
}


app.get('/', (c) => {
  return c.html(<TorrentSearchPage />)
})


app.get('/api/providers', async (c) => {
  try {
    const TorrentSearchApi = require('torrent-search-api')
    const providers = TorrentSearchApi.getProviders()
    
    // Filter to show only public providers
    const publicProviders = providers.filter((provider: any) => provider.public === true)
    
    return c.json({
      success: true,
      providers: publicProviders
    })
  } catch (error:any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})


app.post('/api/search', async (c) => {
  try {
    const { query, provider, category, limit } = await c.req.json()
    
    // TODO: Implement actual search
    return c.json({
      success: true,
      message: `Would search for "${query}" in ${category} on ${provider} (limit: ${limit})`,
      // results: [] // Will contain actual results later
    })
  } catch (error:any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

export default app