//@ts-ignore
import { Account, User, JWT } from "next-auth"
import { JWTDecodeParams } from "next-auth/jwt"
import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify"

// interface Token extends JWT {
//   accessToken: string
//   refreshToken: string
//   username: string
//   accessTokenExpires: number
// }


//@ts-ignore
// interface JwtParams extends JWTDecodeParams {
//   token: Token
//   account?: Account
//   user?: User
// }

export function refreshAccessToken({ token }) {
  try {
    spotifyApi.setAccessToken(token.accessToken)
    spotifyApi.setRefreshToken(token.refreshToken)

    const { body: refreshedToken } = spotifyApi.refreshAccessToken()

    console.log("REFRESHED TOKEN IS", refreshedToken)
    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accessTokenExpires: Date.now + refreshedToken.expires_at * 1000,
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.log(error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000,
        }
      }
      if (Date.now() < token.accessTokenExpires) {
        console.log("Existing access token is valid")
        return token
      }

      console.log("Access token has expired")
      
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken
      session.user.refreshToken = token.refreshToken
      session.user.username = token.username
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/api/auth/error',
  }
}

export default NextAuth(authOptions)
