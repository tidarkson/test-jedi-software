const http = require('http')
const assert = require('assert')
const path = require('path')

function createWindowMock() {
  const storage = new Map()
  const dispatchedEvents = []

  class CustomEventMock {
    constructor(type, init = {}) {
      this.type = type
      this.detail = init.detail
    }
  }

  const windowMock = {
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null
      },
      setItem(key, value) {
        storage.set(key, String(value))
      },
      removeItem(key) {
        storage.delete(key)
      },
      clear() {
        storage.clear()
      },
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event)
      return true
    },
  }

  global.window = windowMock
  global.CustomEvent = CustomEventMock

  return {
    storage,
    dispatchedEvents,
    cleanup: () => {
      delete global.window
      delete global.CustomEvent
    },
  }
}

function createTestServer() {
  let mode = 'refresh-success'
  let refreshCalls = 0

  const server = http.createServer((req, res) => {
    if (req.url === '/api/v1/auth/refresh' && req.method === 'POST') {
      refreshCalls += 1

      if (mode === 'refresh-failure') {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            status: 'error',
            code: 401,
            error: 'UNAUTHORIZED',
            message: 'Refresh failed',
            errors: [],
          })
        )
        return
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          status: 'success',
          code: 200,
          data: {
            accessToken: 'new-token',
          },
        })
      )
      return
    }

    if (req.url === '/api/v1/protected' && req.method === 'GET') {
      const auth = req.headers.authorization
      if (auth === 'Bearer new-token') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            status: 'success',
            code: 200,
            data: { ok: true },
          })
        )
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            status: 'error',
            code: 401,
            error: 'UNAUTHORIZED',
            message: 'Token expired',
            errors: [],
          })
        )
      }
      return
    }

    if (req.url === '/api/v1/bad-request' && req.method === 'GET') {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          status: 'error',
          code: 400,
          error: 'VALIDATION_FAILED',
          message: 'Validation failed',
          errors: [{ field: 'email', message: 'Invalid email' }],
        })
      )
      return
    }

    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        status: 'error',
        code: 404,
        error: 'NOT_FOUND',
        message: 'Not found',
        errors: [],
      })
    )
  })

  return {
    server,
    setMode(value) {
      mode = value
    },
    getRefreshCalls() {
      return refreshCalls
    },
    resetRefreshCalls() {
      refreshCalls = 0
    },
  }
}

async function startServer(server) {
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start server')
  }

  return address.port
}

async function stopServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

async function main() {
  const windowState = createWindowMock()
  const testServer = createTestServer()

  try {
    const port = await startServer(testServer.server)
    process.env.NEXT_PUBLIC_API_BASE_URL = `http://127.0.0.1:${port}/api/v1`

    const axios = require('axios')
    const clientModulePath = path.resolve(process.cwd(), '.tmp-api-check/client.js')
    const errorsModulePath = path.resolve(process.cwd(), '.tmp-api-check/errors.js')

    const { apiClient, TOKEN_STORAGE_KEY, setAccessToken, getAccessToken } = require(clientModulePath)
    const { ApiError, isApiError } = require(errorsModulePath)

    assert.strictEqual(apiClient.defaults.baseURL, process.env.NEXT_PUBLIC_API_BASE_URL)

    testServer.setMode('refresh-success')
    testServer.resetRefreshCalls()
    setAccessToken('expired-token')

    const success = await apiClient.get('/protected')
    assert.strictEqual(success.status, 200)
    assert.strictEqual(success.data.data.ok, true)
    assert.strictEqual(testServer.getRefreshCalls(), 1)
    assert.strictEqual(getAccessToken(), 'new-token')

    testServer.setMode('refresh-failure')
    testServer.resetRefreshCalls()
    setAccessToken('expired-again')

    let refreshFailureCaught = false
    try {
      await apiClient.get('/protected')
    } catch (error) {
      refreshFailureCaught = true
      assert.strictEqual(isApiError(error), true)
    }

    assert.strictEqual(refreshFailureCaught, true)
    assert.strictEqual(testServer.getRefreshCalls(), 1)
    assert.strictEqual(window.localStorage.getItem(TOKEN_STORAGE_KEY), null)
    const logoutEvents = windowState.dispatchedEvents.filter((event) => event.type === 'auth:logout')
    assert.ok(logoutEvents.length >= 1)

    let envelopeParsed = false
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bad-request`)
    } catch (axiosError) {
      const parsed = ApiError.fromResponse(axiosError)
      assert.strictEqual(parsed.code, 400)
      assert.strictEqual(parsed.error, 'VALIDATION_FAILED')
      assert.strictEqual(parsed.message, 'Validation failed')
      assert.strictEqual(Array.isArray(parsed.errors), true)
      assert.strictEqual(parsed.errors.length, 1)
      envelopeParsed = true
    }

    assert.strictEqual(envelopeParsed, true)

    console.log('CHECKLIST_RESULT: PASS')
    console.log(' - 401 triggers one refresh attempt')
    console.log(' - refresh failure clears token + emits auth:logout')
    console.log(' - ApiError.fromResponse parses backend envelope')
    console.log(' - client baseURL sourced from NEXT_PUBLIC_API_BASE_URL')
  } finally {
    await stopServer(testServer.server)
    windowState.cleanup()
  }
}

main().catch((error) => {
  console.error('CHECKLIST_RESULT: FAIL')
  console.error(error)
  process.exit(1)
})
