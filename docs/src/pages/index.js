import { Seo } from 'components/Seo'
import NavBar from 'components/NavBar'
import Head from 'next/head'
import { Sticky } from 'components/Sticky'
import Banner from 'components/landing-page/Banner'
import FeatureBanner from 'components/landing-page/FeatureBanner'
import DemoVideo from 'components/landing-page/DemoVideo'
import SpeakerDeck from 'components/landing-page/SpeakerDeck'
import GetStartedBanner from 'components/landing-page/GetStartedBanner'
import FooterDark from 'components/FooterDark'

export default function IndexPage() {
  return (
    <div className="relative bg-black-monika">
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
      <SpeakerDeck />
      <GetStartedBanner />
      <FooterDark />
    </div>
  )
}
