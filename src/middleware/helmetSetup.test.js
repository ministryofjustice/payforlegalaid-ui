import { helmetSetup } from './helmetSetup'
import helmet from 'helmet'

jest.mock('helmet')

describe('helmetSetup middleware', () => {
  let app

  beforeEach(() => {
    app = { use: jest.fn() }
  })

  it('should apply helmet with content security policy (CSP) set', () => {
    helmetSetup(app)

    expect(app.use).toHaveBeenCalled()
    expect(helmet).toHaveBeenCalled()

    // Grab the parameter we passed into helmet to make sure we set CSP
    const helmetSettings = helmet.mock.calls[0][0]
    expect(helmetSettings).toHaveProperty('contentSecurityPolicy')
  })
})
