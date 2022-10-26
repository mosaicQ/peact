/**
 * Layout component
 * @param {string} content - html content
 * @returns {string} - html template filled with content
 */
 export default function Layout(props) {
  const { content } = props ?? {}

  return Peact((
    <html>
      <head>
        <link rel="stylesheet" href="./styles/layout.css" />
      </head>

      <body>
        {content}
      </body>
    </html>
  ), {
    path: "out/output.html"
  })
}
