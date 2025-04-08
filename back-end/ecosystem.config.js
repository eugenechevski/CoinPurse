module.exports = {
  apps: [
    {
      name: "coinpurse-api",
      script: "npm",
      args: "run prod",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
    },
    {
      name: "coinpurse-frontend",
      cwd: "/opt/bitnami/projects/coinpurse/frontend",
      script: "npm",
      args: "run prod",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
