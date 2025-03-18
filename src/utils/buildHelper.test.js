import { getBuildNumber, getLatestBuildFile } from './buildHelper'
import fs from 'fs'

jest.mock('fs')

describe('getBuildNumber', () => {
  it('should return a string of a number', () => {
    let buildNo = getBuildNumber()
    expect(typeof buildNo).toBe('string')
    // Make sure its a number!
    expect(Number(buildNo)).toBeTruthy()
  })
})

describe('getLatestBuildFile', () => {
  let directoryContents = ['test.xml', 'blah.c', 'prefix.43243.ext', 'bumblebee.java']

  it('should return a filename if a build file exists with the given name', () => {
    fs.readdirSync.mockReturnValue(directoryContents)

    let result = getLatestBuildFile('dir', 'prefix', 'ext')

    expect(result).toBe('prefix.43243.ext')
  })

  it('should return an empty string if a build file does not exists with the given name', () => {
    fs.readdirSync.mockReturnValue(directoryContents)

    let result = getLatestBuildFile('dir', 'wrongone', 'ext')

    expect(result).toBe('')
  })

  it('should return an empty string if directory is empty', () => {
    fs.readdirSync.mockReturnValue([])

    let result = getLatestBuildFile('dir', 'prefix', 'ext')

    expect(result).toBe('')
  })
})
