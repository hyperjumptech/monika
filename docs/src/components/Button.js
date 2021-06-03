export default function Button(props) {
  if (props.outline) {
    return (<ButtonOutlined className={props.className}>{props.children}</ButtonOutlined>)
  }

  return (
    <button
      className={`min-w-md px-4 py-2 bg-gradient-to-r from-aqua to-purple rounded-full font-sans text-white`}
    >
      {props.children}
    </button>)
}

function ButtonOutlined(props) {
  return (
    <button
      className={`min-w-md px-4 py-2 outline font-sans`}>
      <span className="bg-gradient-to-r from-aqua to-purple text-transparent bg-clip-text">{props.children}</span>
    </button>
  )
}
