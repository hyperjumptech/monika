import { Seo } from 'components/Seo'
import NavBar from 'components/NavBar'
import Head from 'next/head'
import { Sticky } from 'components/Sticky'
import Banner from 'components/landing-page/Banner'
import FeatureBanner from 'components/landing-page/FeatureBanner'
import DemoVideo from 'components/landing-page/DemoVideo'
import GetStartedBanner from 'components/landing-page/GetStartedBanner'
import FooterDark from 'components/FooterDark'

export default function IndexPage() {
  return (
    <div className="relative">
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
      <FeatureBanner />
      <DemoVideo />
      <GetStartedBanner />
      <FooterDark />
    </div>
  )
}
