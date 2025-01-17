module.exports = {
    apps: [{
      name: "partyvault",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3005
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }]
  }