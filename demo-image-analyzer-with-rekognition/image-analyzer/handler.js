'use strict';

const { get } = require('axios')

class Handler {
  constructor({ rekognitionService, translatorService }) {
    this.rekognitionService = rekognitionService
    this.translatorService = translatorService
  }

  async detectImageLabels(buffer) {
    const result = await this.rekognitionService.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise()
    
    const workingItems = result.Labels
      .filter(({ Confidence }) => Confidence > 90)

    const names = workingItems
      .map(({ Name }) => Name)
      .join(' and ')

    return { names, workingItems }
  }

  async translateToPortuguese(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }

    const result = await this.translatorService
      .translateText(params)
      .promise()

    return result.TranslatedText.split(' e ')
  }

  formatTextResults(texts, workingItems) {
    const finalText = []
    for (const indexText in texts) {
      const nameInPortuguese = texts[indexText]
      const { Confidence: confidence } = workingItems[indexText]
      finalText.push(`${confidence.toFixed(2)}% de chance de ser do tipo ${nameInPortuguese}`)
    }
    return finalText.join('\n ')
  }

  async getImageBuffer(imageUrl) {
    const response = await get(imageUrl, {
      responseType: 'arraybuffer'
    })

    const buffer = Buffer.from(response.data, 'base64')
    return buffer
  }

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters

      console.log('Downloading image...')
      const imageBuffer = await this.getImageBuffer(imageUrl)

      console.log('Detecting labels...')
      const { names, workingItems } = await this.detectImageLabels(imageBuffer)

      console.log('Translating to portuguese...')
      const texts = await this.translateToPortuguese(names)

      console.log('Handling final object...')
      const finalText = this.formatTextResults(texts, workingItems)

      return {
        statusCode: 200,
        body: `A imagem tem\n `.concat(finalText)
      }
    } catch (error) {
      console.log('[ERROR]', error.stack)
      return {
        statusCode: 500,
        body: 'Internal server error'
      }
    }
  }
}

const aws = require('aws-sdk')

const rekognition = new aws.Rekognition()
const translator = new aws.Translate()
const handler = new Handler({
  rekognitionService: rekognition,
  translatorService: translator
})

module.exports.main = handler.main.bind(handler);
