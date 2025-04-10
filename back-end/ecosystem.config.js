module.exports = {
  apps: [
    {
      name: "coinpurse-api",
      script: "npm",
      args: "run prod",
      instances: 1,
      autorestart: true,
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
    },
    {
      name: "coinpurse-front",
      cwd: "../front-end",
      script: "npm",
      args: "run serve",
      instances: 1,
      autorestart: true,
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
