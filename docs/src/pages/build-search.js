/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

const algoliasearch = require('algoliasearch')
const fs = require('fs')
const matter = require('gray-matter')
const path = require('path')

const options = {
  indexName: 'monika-documentation',
  appId: process.env.ALGOLIA_APPLICATION_ID || '',
  adminAPIKey: process.env.ALGOLIA_ADMIN_API_KEY || '',
}
const file =
  ('./src/pages/tutorial',
  './src/pages/deployment',
  './src/pages',
  './src/pages/guides')

main()

async function main() {
  try {
    validateKey(options)

    const articles = await getAllBlogPosts()
    const algoliaObjects = transformPostsToSearchObjects(articles)
    const algoliaResponse = await saveObjectToAlgolia(
      options.indexName,
      algoliaObjects
    )

    console.log(
      `Successfully added ${
        algoliaResponse.objectIDs.length
      } records to Algolia search! Object IDs:\n${algoliaResponse.objectIDs.join(
        '\n'
      )}`
    )
  } catch (error) {
    console.error(error)
  }
}

function validateKey(options) {
  if (!options.indexName) {
    throw new Error('Algolia index name is not defined')
  }

  if (!options.appId) {
    throw new Error('ALGOLIA_APPLICATION_ID is not defined')
  }

  if (!options.adminAPIKey) {
    throw new Error('ALGOLIA_SEARCH_API_KEY is not defined')
  }
}

async function getAllBlogPosts() {
  const CONTENT_PATH = path.join(process.cwd(), file)
  const contentFilePaths = fs
    .readdirSync(CONTENT_PATH)
    // Only include md files
    .filter((path) => /\.md?$/.test(path))
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

async function saveObjectToAlgolia(indexName, algoliaObject) {
  // initialize the client with your environment variables
  const client = algoliasearch(options.appId, options.adminAPIKey)

  // initialize the index with your index name
  const index = client.initIndex(indexName)

  // add the data to the index
  const algoliaResponse = await index.saveObjects(algoliaObject)

  return algoliaResponse
}
