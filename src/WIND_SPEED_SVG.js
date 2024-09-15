import * as React from "react"
const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={800}
    height={800}
    className="icon flat-color"
    data-name="Flat Color"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="M16 13H3a1 1 0 0 1 0-2h13a1 1 0 0 1 0 2Z"
      style={{
        fill: "#2ca9bc",
      }}
    />
    <path
      d="M12.5 9H3a1 1 0 0 1 0-2h9.5a1.5 1.5 0 0 0 0-3 1 1 0 0 1 0-2 3.5 3.5 0 0 1 0 7Zm8.5 9.5a3.5 3.5 0 0 0-3.5-3.5H3a1 1 0 0 0 0 2h14.5a1.5 1.5 0 0 1 0 3 1 1 0 0 0 0 2 3.5 3.5 0 0 0 3.5-3.5Z"
      style={{
        fill: "#000",
      }}
    />
  </svg>
)
export default SvgComponent
