export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Healthcare EMR External API',
    version: '1.0.0',
    description: 'API for external integrations with Healthcare EMR system',
    contact: {
      name: 'API Support',
      email: 'support@healthcare-emr.com'
    }
  },
  servers: [
    {
      url: '/external',
      description: 'External API endpoint'
    }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for authentication'
      }
    },
    schemas: {
      Patient: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string' },
          contact: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      },
      RecordShare: {
        type: 'object',
        properties: {
          shareId: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed'] }
        }
      }
    }
  },
  security: [
    {
      ApiKeyAuth: []
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        security: [],
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/patients/{id}': {
      get: {
        summary: 'Get patient information',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Patient ID'
          }
        ],
        responses: {
          '200': {
            description: 'Patient found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Patient'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Invalid or missing API key',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - Insufficient permissions',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Patient not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/records/share': {
      post: {
        summary: 'Share medical records',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['patientId', 'recordIds', 'recipientOrganizationId'],
                properties: {
                  patientId: { type: 'string' },
                  recordIds: { 
                    type: 'array',
                    items: { type: 'string' }
                  },
                  recipientOrganizationId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Records shared successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RecordShare'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Invalid or missing API key',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - Insufficient permissions',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  }
}; 