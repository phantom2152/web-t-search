// components/Layout.tsx
import type { FC } from 'hono/jsx'

export interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
  location: string | null
  blog: string | null
  company: string | null
  created_at: string
}

const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>GitHub User Search</title>
        <style>{`
          body { 
            font-family: system-ui, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6;
          }
          .user-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-right: 20px;
          }
          .user-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
          }
          .stats {
            display: flex;
            gap: 20px;
            margin: 15px 0;
          }
          .stat {
            text-align: center;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
            min-width: 80px;
          }
          .search-form {
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          input[type="text"] {
            padding: 8px 12px;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
            width: 200px;
          }
          button {
            padding: 8px 16px;
            font-size: 16px;
            background: #0969da;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background: #0860ca;
          }
        `}</style>
      </head>
      <body>{props.children}</body>
    </html>
  )
}

export const HomePage: FC = () => {
  return (
    <Layout>
      <h1>GitHub User Search</h1>
      <p>Enter a GitHub username to see their profile information (fetched server-side)</p>
      
      <div class="search-form">
  <form>
    <input 
      type="text" 
      id="username" 
      placeholder="Enter GitHub username"
      required 
    />
    <button type="button" onclick="window.location.href='/user/'+document.getElementById('username').value">
      Search User
    </button>
  </form>
</div>
      
      <p><strong>Try these users:</strong></p>
      <ul>
        <li><a href="/user/torvalds">torvalds</a></li>
        <li><a href="/user/gaearon">gaearon</a></li>
        <li><a href="/user/addyosmani">addyosmani</a></li>
      </ul>
    </Layout>
  )
}

export const UserPage: FC<{ user: GitHubUser }> = ({ user }) => {
  const joinDate = new Date(user.created_at).toLocaleDateString()
  
  return (
    <Layout>
      <h1>GitHub User Profile</h1>
      <a href="/">← Back to search</a>
      
      <div class="user-card">
        <div class="user-header">
          <img 
            src={user.avatar_url} 
            alt={`${user.login}'s avatar`} 
            class="avatar" 
          />
          <div>
            <h2>{user.name || user.login}</h2>
            <p><strong>@{user.login}</strong></p>
            {user.bio && <p><em>{user.bio}</em></p>}
          </div>
        </div>
        
        <div class="stats">
          <div class="stat">
            <strong>{user.public_repos}</strong>
            <br />Repos
          </div>
          <div class="stat">
            <strong>{user.followers}</strong>
            <br />Followers
          </div>
          <div class="stat">
            <strong>{user.following}</strong>
            <br />Following
          </div>
        </div>
        
        <div>
          {user.company && <p><strong>Company:</strong> {user.company}</p>}
          {user.location && <p><strong>Location:</strong> {user.location}</p>}
          {user.blog && (
            <p>
              <strong>Website:</strong> 
              <a href={user.blog} target="_blank" rel="noopener">
                {user.blog}
              </a>
            </p>
          )}
          <p><strong>Joined:</strong> {joinDate}</p>
        </div>
        
        <p>
          <a 
            href={`https://github.com/${user.login}`} 
            target="_blank" 
            rel="noopener"
          >
            View on GitHub →
          </a>
        </p>
      </div>
    </Layout>
  )
}