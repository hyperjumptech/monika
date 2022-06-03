// List of projects/orgs using your project for the users page.
export const siteConfig = {
  editUrl: 'https://github.com/hyperjumptech/monika/edit/main/docs/src/pages',
  copyright: `Copyright © ${new Date().getFullYear()} Hyperjump Tech. All Rights Reserved.`,
  npmUrl: 'https://www.npmjs.com/package/@hyperjumptech/monika',
  repoUrl: 'https://github.com/hyperjumptech/monika',
  algolia: {
    appId: process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID || '',
    apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '',
    indexName: 'monika-documentation',
    // algoliaOptions: {
    //   facetFilters: ['version:VERSION'],
    // },
  },
}
