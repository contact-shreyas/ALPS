# 🌟 INFINITY LOOP - Light Pollution Monitoring System

> Advanced satellite-based light pollution monitoring system with AI-powered analysis and automated alerts powered by INFINITY LOOP

[![CI/CD Pipeline](https://github.com/your-username/agentic-light-sentinel/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/your-username/agentic-light-sentinel/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Development](#development)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🌍 Overview

The Agentic Light Pollution Sentinel is a cutting-edge environmental monitoring system that leverages VIIRS satellite data to track and analyze light pollution patterns across geographic regions. Built with modern web technologies and AI-powered insights, it provides real-time monitoring, automated alerts, and comprehensive reporting capabilities.

### Key Capabilities

- **Real-time Monitoring**: Continuous satellite data ingestion and processing
- **AI-Powered Analysis**: Intelligent pattern recognition and trend analysis
- **Automated Alerts**: Multi-channel notification system (Email, Slack, Webhooks)
- **Interactive Dashboard**: Rich visualizations and data exploration tools
- **RESTful API**: Comprehensive API for data access and integration
- **Scalable Architecture**: Production-ready with caching, rate limiting, and monitoring

## ✨ Features

### 🛰️ Data Processing
- **VIIRS Satellite Integration**: Automated download and processing of NASA VIIRS data
- **Geospatial Analysis**: Advanced coordinate system handling and geographic calculations
- **Data Validation**: Comprehensive validation and quality assurance
- **Hotspot Detection**: Intelligent light pollution hotspot identification

### 📊 Analytics & Reporting
- **Interactive Maps**: Leaflet-based mapping with heat overlays
- **Time Series Analysis**: Historical trend analysis and forecasting
- **Custom Reports**: Automated report generation and scheduling
- **Performance Metrics**: System health and data quality monitoring

### 🔔 Alert System
- **Multi-channel Notifications**: Email, Slack, webhook integration
- **Severity-based Routing**: Intelligent alert routing based on severity levels
- **Template Engine**: Rich HTML email templates with data visualization
- **Rate Limiting**: Intelligent throttling to prevent alert fatigue

### 🚀 Performance & Scalability
- **Caching Layer**: Multi-level caching for optimal performance
- **Rate Limiting**: API protection with configurable limits
- **Error Handling**: Comprehensive error tracking and recovery
- **Health Monitoring**: System health checks and automated diagnostics

## 🏗️ Architecture

```mermaid
graph TB
    A[VIIRS Satellite Data] --> B[Data Ingestion Service]
    B --> C[PostgreSQL Database]
    C --> D[Next.js API Routes]
    D --> E[React Dashboard]
    D --> F[Alert System]
    F --> G[Email/Slack/Webhook]
    C --> H[Background Jobs]
    H --> I[Data Processing]
    I --> J[Hotspot Detection]
    J --> K[Report Generation]
```

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js 20, Prisma ORM, PostgreSQL
- **Mapping**: Leaflet, React-Leaflet
- **Charts**: Chart.js, Recharts, D3.js
- **Notifications**: Nodemailer, Slack API
- **Testing**: Vitest, Testing Library
- **Deployment**: Docker, GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 13 or higher
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agentic-light-sentinel.git
   cd agentic-light-sentinel
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm seed
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see the application.

## 💻 Development

### Available Scripts

#### Development
- `pnpm dev` - Start development server
- `pnpm dev:watch` - Development with database watching
- `pnpm build` - Build production application
- `pnpm start` - Start production server

#### Database
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:reset` - Reset database (development only)

#### Testing
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Open Vitest UI
- `pnpm test:coverage` - Generate coverage report

#### Data Management
- `pnpm data:import` - Import geographic data
- `pnpm data:pipeline` - Run complete data pipeline
- `pnpm data:quality` - Run data quality checks

#### Utilities
- `pnpm health` - Run health checks
- `pnpm logs` - View system logs
- `pnpm backup:db` - Create database backup
- `pnpm lint` - Lint code
- `pnpm format` - Format code

### Project Structure

```
agentic-light-sentinel/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── charts/         # Chart components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── map/           # Map components
│   │   └── ui/            # UI components
│   ├── lib/               # Utility libraries
│   │   ├── prisma.ts      # Database client
│   │   ├── mailer.ts      # Email utilities
│   │   ├── cache.ts       # Caching system
│   │   └── ...            # Other utilities
│   └── types/             # TypeScript definitions
├── prisma/                # Database schema and migrations
├── scripts/               # Utility scripts
├── tests/                 # Test files
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/light_sentinel"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# API Configuration
API_KEY="your-secure-api-key"
NEXTAUTH_SECRET="your-auth-secret"

# External Services
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
WEBHOOK_URL="https://your-webhook-endpoint.com"
```

### Data Sources

The system integrates with:

- **NASA VIIRS**: Visible Infrared Imaging Radiometer Suite data
- **Geographic Data**: District and state boundary information
- **Weather APIs**: Optional weather data integration

## 📡 API Reference

### Endpoints

#### Health & Monitoring
- `GET /api/health` - System health check
- `GET /api/metrics` - Performance metrics

#### Data Access
- `GET /api/districts` - List all districts
- `GET /api/districts/:id` - Get district details
- `GET /api/hotspots` - List hotspots with filtering
- `GET /api/trends` - Trend analysis data

#### Reports
- `POST /api/reports/email` - Send email report
- `GET /api/reports/dashboard` - Dashboard data

#### Administration
- `POST /api/ingest/run` - Trigger data ingestion
- `POST /api/alerts` - Create alert

### Authentication

API endpoints require authentication via Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://your-domain.com/api/districts
```

## 🚢 Deployment

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

2. **Environment-specific deployments**
   ```bash
   # Staging
   docker-compose -f docker-compose.staging.yml up -d
   
   # Production
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. **Build application**
   ```bash
   pnpm deploy:build
   ```

2. **Run deployment script**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

### CI/CD Pipeline

The project includes a comprehensive GitHub Actions pipeline:

- **Continuous Integration**: Automated testing, linting, type checking
- **Security Scanning**: Vulnerability assessment
- **Automated Deployment**: Staging and production deployments
- **Notifications**: Slack integration for deployment status

## 🧪 Testing

### Test Structure

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application workflow testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test tests/api.test.ts

# Interactive test UI
pnpm test:ui
```

## 🛡️ Security

### Security Features

- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data validation using Zod
- **Error Handling**: Secure error messages without information leakage
- **CORS Protection**: Configurable cross-origin policies
- **Authentication**: API key-based authentication

### Security Best Practices

- Regular dependency updates
- Environment variable protection
- Database query sanitization
- Secure HTTP headers
- Logging and monitoring

## 📈 Monitoring

### Health Checks

The system includes comprehensive health monitoring:

```bash
# Check system health
pnpm health

# View system logs
pnpm logs

# Monitor performance
curl http://localhost:3000/api/metrics
```

### Metrics Collected

- **System**: Memory usage, CPU utilization, uptime
- **Database**: Connection health, query performance
- **API**: Response times, error rates, request volumes
- **Data Quality**: Validation results, processing statistics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- TypeScript for all new code
- ESLint + Prettier for code formatting
- Comprehensive tests for new features
- Documentation updates for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA**: VIIRS satellite data
- **OpenStreetMap**: Geographic data
- **Next.js Team**: Amazing framework
- **Prisma Team**: Excellent ORM
- **Contributors**: All the amazing people who contribute to this project

## 📞 Support

- **Documentation**: [Full documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/agentic-light-sentinel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/agentic-light-sentinel/discussions)
- **Email**: support@light-sentinel.example.com

---

<div align="center">

**Built with ❤️ for environmental monitoring and protection**

[🌟 Star this project](https://github.com/your-username/agentic-light-sentinel) | [🐛 Report Bug](https://github.com/your-username/agentic-light-sentinel/issues) | [💡 Request Feature](https://github.com/your-username/agentic-light-sentinel/issues)

</div>