import Head from 'next/head'
import Sidebar from '../components/Sidebar'
import Center from '../components/Center'
import { getSession } from 'next-auth/react'
import Player from '../Components/Player'

export default function Home() {

  return (
    <div className="bg-black h-screen overflow-hidden">
      <Head>
        <title>Spotify Clone - Web Player</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='flex'>
        <Sidebar />
        <Center />
      </main>

      <div className='sticky bottom-0'>
        <Player />
      </div>
    </div>
  )
}
//@ts-ignore
export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session
    }
  }
}

