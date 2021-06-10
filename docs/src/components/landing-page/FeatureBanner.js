export default function FeatureBanner() {
  return (
    <div className="relative bg-white h-screen z-10 transform -skew-y-6 -mt-20">
      <div className="w-1/4 h-8 absolute top-0 right-0 bg-gradient-to-r from-purple-monika to-aqua-monika" />
      <div className="w-1/4 h-8 absolute bottom-0 left-0 bg-gradient-to-r from-purple-monika to-aqua-monika" />
      <div className="relative flex flex-col justify-center z-10 w-auto m-auto pt-48 transform skew-y-6">
        <h2 className="bg-gradient-to-r from-purple-monika to-aqua-monika bg-clip-text text-transparent font-bold text-3xl">
          Why Monika
        </h2>
        <h2>
          Free and Open Source Synthetic
          <br />
          Monitoring Tool
        </h2>
      </div>
    </div>
  )
}
