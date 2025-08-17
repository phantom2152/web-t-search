import type { FC } from "hono/jsx"

export const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>T-Search - Torrent Search Engine</title>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 min-h-screen">
        {props.children}
      </body>
    </html>
  )
}

