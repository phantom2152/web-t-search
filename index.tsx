import {Hono} from "hono"
import { HomePage,UserPage, type GitHubUser } from "./components/Layout"

const app = new Hono()


app.get('/', (c) => {
  return c.html(<HomePage />)
})

app.get("/user/:username",async(c)=>{
  const username = c.req.param("username")

  try {
    const response = await fetch(`https://api.github.com/users/${username}`)

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }


    const userData = await response.json()


    return c.html(<UserPage user={userData as GitHubUser} />)


  } catch (error:any) {
    return c.html(
      <div>
        <h1>Error</h1>
        <p>Could not fetch user data: {error.message}</p>
        <a href="/">Go back home</a>
      </div>
    )
  }
})

export default app