import request from 'supertest'
import express from 'express'
import { nunjucksSetup } from '../utils'
import indexRouter from '../routes/index'
import * as reportService from '../services/reportService.js'

jest.mock('../services/reportService.js')

describe('GET /', () => {
  let app

  beforeEach(() => {
    jest.resetAllMocks()
    app = express()

    // Set up the route
    app.use('/', indexRouter)

    // Set up Nunjucks
    nunjucksSetup(app)
  })

  it('should render index page when getReports succeeds', async () => {
    // Mock the service to return dummy data
    reportService.getReports.mockResolvedValue({
      reportList: [
        {
          id: '2345',
          reportName: 'Dummy Report',
          description: 'Dummy description',
        },
      ],
    })

    const response = await request(app).get('/').expect('Content-Type', /html/).expect(200)

    expect(response.text).toContain('Dummy Report')
    expect(response.text).toContain('/csv/2345')
  })

  it('should render error page when getReports throws error', async () => {
    // Mock the service to reject
    reportService.getReports.mockRejectedValue(new Error('API connection issue'))

    const response = await request(app).get('/').expect('Content-Type', /html/).expect(200)

    // Confirm that the error template is rendered
    expect(response.text).toContain('An error occurred')
    expect(response.text).toContain('An error occurred while loading the reports.')
  })
})
