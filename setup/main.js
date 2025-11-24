import { defineAppSetup } from 'valaxy'
import setupPreconnect from './preconnect'

export default defineAppSetup(({ app }) => {
  setupPreconnect()
})
