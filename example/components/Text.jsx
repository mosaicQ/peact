import { Peact } from "peact";

/**
 * Text component
 * @param {string} content - html content
 * @returns {string} - html template filled with content
 */
export default function Text(props) {
  const { text, style } = props ?? {};

  return Peact(
    <div>
      <head>
        <link rel="stylesheet" href="./styles/text.css" />
      </head>

      <p style={style} className="text-component">
        {text}
      </p>
    </div>
  );
}
