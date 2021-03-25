import TagFinderService from './services/TagFinderService'

export default class TagsCollection {
  constructor () {
    this.tagFinder = new TagFinderService()
    this.tagCollections = {}

    this.tagCollections.unknown = []
  }

  async addImage (imgMetadata) {
    const taggedImage = await this.tagFinder.findTags(imgMetadata)

    this._assignImageToCollections(taggedImage)
  }

  async useImages (images, imageClassifiedCallback) {
    for (let i = 0; i < images.length; i++) {
      const img = images[i]

      await this.addImage(img)

      imageClassifiedCallback(
        this.collectionNames,
        (i + 1) / images.length
      )
    }
  }

  _assignImageToCollections (taggedImage) {
    for (const tag of taggedImage.tags) {
      const collection = this.getCollectionWithName(tag.name)
      collection.push(taggedImage)
    }
  }

  get amount () {
    return Object.keys(this.tagCollections).length
  }

  get collectionNames () {
    return Object.keys(this.tagCollections)
  }

  getCollectionWithName (tagName) {
    if (!tagName) {
      return this.getCollectionWithName('unknown')
    }

    // create if not present
    if (!this.tagCollections[tagName]) {
      this.tagCollections[tagName] = []
    }

    const res = this.tagCollections[tagName]// .find((el) => el.name === tagName)
    // if (!res) {
    //   // res = new TaggedImagesCollection(tagName)
    //   // this.tagCollections.push(res)
    // }

    return res
  }
}
