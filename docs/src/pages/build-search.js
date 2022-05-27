const algoliasearch = require('algoliasearch')
const fs = require('fs')
const matter = require('gray-matter')
const path = require('path')

const options = {
  appId: process.env.ALGOLIA_APPLICATION_ID || '',
  apiKey: process.env.ALGOLIA_SEARCH_API_KEY || '',
}

try {
  if (!options.appId) {
    throw new Error('ALGOLIA_APPLICATION_ID is not defined')
  }

  if (!options.apiKey) {
    throw new Error('ALGOLIA_SEARCH_API_KEY is not defined')
  }
} catch (error) {
  console.error(error)
  process.exit(1)
}

console.log('Algolia It works!')
const file =
  ('./src/pages/tutorial',
  './src/pages/deployment',
  './src/pages',
  './src/pages/guides')
const CONTENT_PATH = path.join(process.cwd(), file)
const contentFilePaths = fs
  .readdirSync(CONTENT_PATH)
  // Only include md files
  .filter((path) => /\.md?$/.test(path))

async function getAllBlogPosts() {
  const articles = contentFilePaths.map((filePath) => {
    const source = fs.readFileSync(path.join(CONTENT_PATH, filePath))
    const { content, data } = matter(source)
    return {
      content, // this is the .md content
      data, // this is the frontmatter
      filePath, // this is the file path
    }
  })
  return articles
}

function transformPostsToSearchObjects(articles) {
  const transformed = articles.map((article) => {
    return {
      objectID: article.data.id,
      title: article.data.title,
      content: article.content,
      slug: article.filePath,
      type: 'article',
    }
  })
  return transformed
}

module.exports = (async function () {
  try {
    const articles = await getAllBlogPosts()
    const transformed = transformPostsToSearchObjects(articles)

    // initialize the client with your environment variables
    const client = algoliasearch(
      process.env.ALGOLIA_APPLICATION_ID || '',
      process.env.ALGOLIA_SEARCH_API_KEY || ''
    )

    // initialize the index with your index name
    const index = client.initIndex('monika-documentation')

    // add the data to the index
    const algoliaResponse = await index.saveObjects(transformed)
    console.log(
      `Successfully added ${
        algoliaResponse.objectIDs.length
      } records to Algolia search! Object IDs:\n${algoliaResponse.objectIDs.join(
        '\n'
      )}`
    )
  } catch (err) {
    console.error(err)
  }
})()
