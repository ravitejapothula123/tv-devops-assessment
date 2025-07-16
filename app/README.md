# Application

This directory contains the Express.js application and Docker setup.

## Local Development

```bash
# start the app
docker compose up --build
```

The service will be available at [http://localhost:3000/health](http://localhost:3000/health).

## GitHub Actions

CI/CD workflow lives in `.github/workflows/deploy.yml` and builds the image, pushes to ECR and deploys with CDKTF.
