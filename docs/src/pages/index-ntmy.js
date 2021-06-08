import { Seo } from 'components/Seo'
import NavBar from 'components/NavBar'
import Head from 'next/head'
import { Sticky } from 'components/Sticky'
import Banner from 'components/landing-page/Banner'

export default function IndexPage() {
  return (
    <>
      <Seo
        title="Monika"
        description="Free and Open Source Synthetic Monitoring Tool"
      />
      <Head>
        <title>Monika - Free and Open Source Synthetic Monitoring Tool</title>
      </Head>
      <Sticky>
        <NavBar />
      </Sticky>
      <Banner />
    </>
  )
}
