import { getSeedFolderPath } from "lib/test/helpers"
import { setupTinybaseStore } from "lib/tinybase/tinybase"
import { addMarkdownFileAsTopic, markdownFilePaths } from "lib/wiki/wiki"
import { Persister } from "tinybase/cjs"

// implies `dev-setup` was ran and seed folder is present at root
// uses seed/wiki/nikita folder to load all .md files from it into tinybase
async function main() {
  const tinybase = setupTinybaseStore({ persist: true }) as Persister
  const store = tinybase.getStore()
  await tinybase.load()
  await tinybase.startAutoSave()

  const wikiPath = getSeedFolderPath("nikita")
  const filePaths = await markdownFilePaths(wikiPath)
  // console.log(filePaths, "file paths")

  // TODO: below breaks on adding links, result is 0 links added
  // when it should be 80,000+ links added
  store.startTransaction()
  await Promise.all(
    filePaths.map(async (filePath) => {
      await addMarkdownFileAsTopic(filePath, store)
    }),
  )
  store.finishTransaction()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
