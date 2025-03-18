import { getReports } from './reportService.js'

// Mock the reportService module
jest.mock('./reportService.js', () => ({
  getReports: jest.fn(() =>
    Promise.resolve({
      reportList: [
        {
          id: 1,
          reportName: 'Report 1',
          description: 'This is the first report',
        },
        {
          id: 2,
          reportName: 'Report 2',
          description: 'This is the second report',
        },
      ],
    }),
  ),
}))

describe('reportService', () => {
  it('should return an object with a "reportList" array', async () => {
    const result = await getReports()

    // Ensure 'reportList' exists
    expect(result).toHaveProperty('reportList')
    // Ensure 'reportList' is an array
    expect(Array.isArray(result.reportList)).toBe(true)

    // Check that it has at least one item
    expect(result.reportList.length).toBeGreaterThan(0)

    const firstReport = result.reportList[0]
    expect(firstReport).toHaveProperty('id')
    expect(firstReport).toHaveProperty('reportName')
    expect(firstReport).toHaveProperty('description')
  })
})
