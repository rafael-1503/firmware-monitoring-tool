const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'firmware-monitoring',
      description: "Backend des firmware-monitorings",
      contact: {
        name: "Rafael Amann",
        email: "rafael.amann@bechtle.com",
      },
      version: '1.0.0',
    },
    servers: [
      {
        url: "http://localhost:3030/",
        description: "Server"
      }
    ]
  },
  // looks for configuration in specified directories
  apis: ['./routes/*/*.js'],
}
const swaggerSpec = swaggerJsdoc(options)
function swaggerDocs(app, port) {
  // Swagger Page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  // Documentation in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
}
module.exports = swaggerDocs