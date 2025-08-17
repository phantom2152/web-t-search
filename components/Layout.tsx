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
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="bg-gray-50 min-h-screen">
        <div class="max-w-4xl mx-auto py-8 px-4">
          {props.children}
        </div>
      </body>
    </html>
  )
}

export const HomePage: FC = () => {
  return (
    <Layout>
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          GitHub User Search
        </h1>
        <p class="text-lg text-gray-600 mb-8">
          Enter a GitHub username to see their profile information (fetched server-side)
        </p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <form>
          <div class="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              id="username" 
              placeholder="Enter GitHub username"
              class="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required 
            />
            <button 
              type="button" 
              class="px-8 py-3 bg-red-600 text-white text-lg font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onclick="window.location.href='/user/'+document.getElementById('username').value"
            >
              Search User
            </button>
          </div>
        </form>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Try these users:</h2>
        <div class="flex flex-wrap gap-3">
          <a 
            href="/user/torvalds" 
            class="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            torvalds
          </a>
          <a 
            href="/user/gaearon" 
            class="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            gaearon
          </a>
          <a 
            href="/user/addyosmani" 
            class="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            addyosmani
          </a>
        </div>
      </div>
    </Layout>
  )
}

export const UserPage: FC<{ user: GitHubUser }> = ({ user }) => {
  const joinDate = new Date(user.created_at).toLocaleDateString()
  
  return (
    <Layout>
      <div class="mb-6">
        <a 
          href="/" 
          class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          ← Back to search
        </a>
      </div>
      
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
            <img 
              src={user.avatar_url} 
              alt={`${user.login}'s avatar`} 
              class="w-24 h-24 rounded-full border-4 border-gray-200" 
            />
            <div class="text-center sm:text-left">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                {user.name || user.login}
              </h1>
              <p class="text-xl text-gray-600 mb-3">@{user.login}</p>
              {user.bio && (
                <p class="text-gray-700 italic max-w-2xl">{user.bio}</p>
              )}
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{user.public_repos}</div>
              <div class="text-sm text-gray-600">Repositories</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{user.followers}</div>
              <div class="text-sm text-gray-600">Followers</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{user.following}</div>
              <div class="text-sm text-gray-600">Following</div>
            </div>
          </div>
          
          <div class="space-y-3 mb-6">
            {user.company && (
              <div class="flex items-center text-gray-700">
                <span class="font-semibold w-20">Company:</span>
                <span>{user.company}</span>
              </div>
            )}
            {user.location && (
              <div class="flex items-center text-gray-700">
                <span class="font-semibold w-20">Location:</span>
                <span>{user.location}</span>
              </div>
            )}
            {user.blog && (
              <div class="flex items-center text-gray-700">
                <span class="font-semibold w-20">Website:</span>
                <a 
                  href={user.blog} 
                  target="_blank" 
                  rel="noopener"
                  class="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {user.blog}
                </a>
              </div>
            )}
            <div class="flex items-center text-gray-700">
              <span class="font-semibold w-20">Joined:</span>
              <span>{joinDate}</span>
            </div>
          </div>
          
          <div class="pt-4 border-t border-gray-200">
            <a 
              href={`https://github.com/${user.login}`} 
              target="_blank" 
              rel="noopener"
              class="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}