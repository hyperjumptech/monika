import PropTypes from 'prop-types'

const PrimaryButton = (props) => {
  return (
    <>
      <div className={`${props.rootClassName} `}>
        <button className="button mediumLabel">{props.button}</button>
      </div>
      <style jsx>
        {`
          .button {
            color: var(--dl-color-gray-white);
            align-self: center;
            background: linear-gradient(310deg, #2fdcdc, #987ce8);
            transition: 0.3s;
            padding-top: 12px;
            border-width: 0px;
            padding-left: 32px;
            border-radius: var(--dl-radius-radius-radius6);
            padding-right: 32px;
            padding-bottom: 12px;
            background-color: transparent;
          }
          .button:hover {
            background-color: var(--dl-color-purple-900);
          }
          .button:active {
            background-color: var(--dl-color-purple-1000);
          }
          .rootClassName {
            margin-bottom: var(--dl-space-space-unit);
          }
        `}
      </style>
    </>
  )
}

PrimaryButton.defaultProps = {
  rootClassName: '',
  button: 'Button',
}

PrimaryButton.propTypes = {
  rootClassName: PropTypes.string,
  button: PropTypes.string,
}

export default PrimaryButton
