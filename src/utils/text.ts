export const convertTextToHTML = (text: string): string => {
  return (
    '<p>' + text.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>'
  )
}
