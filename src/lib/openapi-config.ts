/**
 * OpenAPI/Swagger documentation configuration
 */

export const openApiConfig = {
  openapi: '3.0.0',
  info: {
    title: 'INFINITY LOOP - Light Pollution Monitoring API',
    description: 'Advanced satellite-based light pollution monitoring system API powered by INFINITY LOOP',
    version: '1.0.0',
    contact: {
      name: 'INFINITY LOOP Support',
      email: 'favchildofuniverse@gmail.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'INFINITY LOOP Development server',
    },
    {
      url: 'https://staging.infinity-loop.example.com/api',
      description: 'INFINITY LOOP Staging server',
    },
    {
      url: 'https://infinity-loop.example.com/api',
      description: 'INFINITY LOOP Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
    schemas: {
      District: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique identifier for the district',
          },
          name: {
            type: 'string',
            description: 'District name',
          },
          state: {
            type: 'string',
            description: 'State name',
          },
          bounds: {
            type: 'object',
            properties: {
              north: { type: 'number', description: 'Northern boundary latitude' },
              south: { type: 'number', description: 'Southern boundary latitude' },
              east: { type: 'number', description: 'Eastern boundary longitude' },
              west: { type: 'number', description: 'Western boundary longitude' },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['id', 'name', 'state', 'bounds'],
      },
      Hotspot: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique identifier for the hotspot',
          },
          latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90,
            description: 'Latitude coordinate',
          },
          longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180,
            description: 'Longitude coordinate',
          },
          brightness: {
            type: 'number',
            minimum: 0,
            description: 'Light pollution brightness measurement',
          },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Severity level of light pollution',
          },
          detectedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Detection timestamp',
          },
          districtId: {
            type: 'string',
            description: 'Associated district ID',
          },
        },
        required: ['id', 'latitude', 'longitude', 'brightness', 'severity', 'detectedAt'],
      },
      TrendData: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            description: 'Time period identifier',
          },
          averageBrightness: {
            type: 'number',
            description: 'Average brightness for the period',
          },
          hotspotCount: {
            type: 'integer',
            description: 'Number of hotspots detected',
          },
          changePercentage: {
            type: 'number',
            description: 'Percentage change from previous period',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error type',
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          statusCode: {
            type: 'integer',
            description: 'HTTP status code',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error occurrence time',
          },
        },
        required: ['error', 'message', 'statusCode', 'timestamp'],
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'degraded', 'unhealthy'],
            description: 'Overall system health status',
          },
          version: {
            type: 'string',
            description: 'Application version',
          },
          uptime: {
            type: 'number',
            description: 'System uptime in seconds',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Health check timestamp',
          },
          checks: {
            type: 'object',
            properties: {
              database: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['ok', 'error'] },
                  responseTime: { type: 'number', description: 'Response time in ms' },
                },
              },
              email: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['ok', 'error'] },
                  responseTime: { type: 'number', description: 'Response time in ms' },
                },
              },
            },
          },
        },
        required: ['status', 'version', 'uptime', 'timestamp'],
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'System health check',
        description: 'Returns the current health status of the system and its components',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'Health check completed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthCheck',
                },
              },
            },
          },
          '503': {
            description: 'Service unavailable',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/districts': {
      get: {
        summary: 'List all districts',
        description: 'Retrieve a list of all districts with optional filtering',
        tags: ['Districts'],
        parameters: [
          {
            name: 'state',
            in: 'query',
            description: 'Filter by state name',
            required: false,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Maximum number of results',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 50,
            },
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Number of results to skip',
            required: false,
            schema: {
              type: 'integer',
              minimum: 0,
              default: 0,
            },
          },
        ],
        responses: {
          '200': {
            description: 'List of districts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/District',
                      },
                    },
                    total: {
                      type: 'integer',
                      description: 'Total number of districts',
                    },
                    limit: {
                      type: 'integer',
                      description: 'Requested limit',
                    },
                    offset: {
                      type: 'integer',
                      description: 'Requested offset',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/districts/{id}': {
      get: {
        summary: 'Get district by ID',
        description: 'Retrieve detailed information about a specific district',
        tags: ['Districts'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'District ID',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'District details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/District',
                },
              },
            },
          },
          '404': {
            description: 'District not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/hotspots': {
      get: {
        summary: 'List hotspots',
        description: 'Retrieve light pollution hotspots with filtering options',
        tags: ['Hotspots'],
        parameters: [
          {
            name: 'districtId',
            in: 'query',
            description: 'Filter by district ID',
            required: false,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'severity',
            in: 'query',
            description: 'Filter by severity level',
            required: false,
            schema: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
            },
          },
          {
            name: 'from',
            in: 'query',
            description: 'Start date for filtering (ISO 8601)',
            required: false,
            schema: {
              type: 'string',
              format: 'date-time',
            },
          },
          {
            name: 'to',
            in: 'query',
            description: 'End date for filtering (ISO 8601)',
            required: false,
            schema: {
              type: 'string',
              format: 'date-time',
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Maximum number of results',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 1000,
              default: 100,
            },
          },
        ],
        responses: {
          '200': {
            description: 'List of hotspots',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Hotspot',
                      },
                    },
                    total: {
                      type: 'integer',
                    },
                    filters: {
                      type: 'object',
                      description: 'Applied filters',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/trends': {
      get: {
        summary: 'Get trend analysis',
        description: 'Retrieve light pollution trend data for analysis',
        tags: ['Analytics'],
        parameters: [
          {
            name: 'period',
            in: 'query',
            description: 'Time period for trend analysis',
            required: false,
            schema: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly', 'yearly'],
              default: 'monthly',
            },
          },
          {
            name: 'districtId',
            in: 'query',
            description: 'Specific district for analysis',
            required: false,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Trend analysis data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    trends: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/TrendData',
                      },
                    },
                    summary: {
                      type: 'object',
                      properties: {
                        overallTrend: { type: 'string', enum: ['increasing', 'decreasing', 'stable'] },
                        changePercentage: { type: 'number' },
                        period: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/reports/email': {
      post: {
        summary: 'Send email report',
        description: 'Generate and send an email report with current data',
        tags: ['Reports'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'Recipient email address',
                  },
                  reportType: {
                    type: 'string',
                    enum: ['summary', 'detailed', 'trends'],
                    description: 'Type of report to generate',
                  },
                  districtId: {
                    type: 'string',
                    description: 'Optional district filter',
                  },
                  timeRange: {
                    type: 'string',
                    enum: ['week', 'month', 'quarter', 'year'],
                    description: 'Time range for the report',
                  },
                },
                required: ['email', 'reportType'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Email sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    reportId: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Health',
      description: 'System health and monitoring endpoints',
    },
    {
      name: 'Districts',
      description: 'Geographic district management',
    },
    {
      name: 'Hotspots',
      description: 'Light pollution hotspot data',
    },
    {
      name: 'Analytics',
      description: 'Data analysis and trends',
    },
    {
      name: 'Reports',
      description: 'Report generation and delivery',
    },
  ],
};

export default openApiConfig;