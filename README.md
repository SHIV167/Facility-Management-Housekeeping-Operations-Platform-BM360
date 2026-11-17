# BM360 - Bharat Mandapam Operations Portal

A comprehensive housekeeping management portal for Bharat Mandapam operations, built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Authentication
- Secure login page with mobile number verification
- Two-step authentication flow
- Session management

### Admin Dashboard
- **ITPO Operations**
  - Overview with complaint statistics
  - Complaint Register with full CRUD operations
  - ITPO Officials Directory with zone management
- **Complaints Management**
  - All Complaints view
  - Resolved Complaints tracking
  - Pending Complaints monitoring
- **Master Data Entry**
  - Zones management
  - Areas management
  - Categories management

### Agency Dashboard
- Overview with complaint statistics
- Complaint tracking and management
- Staff management
- Performance tracking

### Key Features
- 🌐 **Bilingual Support**: Full English and Hindi language switching
- 📊 **Real-time Statistics**: Dashboard with summary cards and metrics
- 🔍 **Search & Filter**: Advanced search and filtering capabilities
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI**: Clean, professional interface with Tailwind CSS
- ⚡ **Fast Performance**: Built with Next.js 16 and Turbopack

## Tech Stack

- **Framework**: Next.js 16.4.6 (App Router)
- **Language**: TypeScript 7.0.2
- **Styling**: Tailwind CSS 4.3.5
- **UI Components**: Custom components with React 19.3.1
- **Build Tool**: Turbopack
- **Package Manager**: npm

## Prerequisites

- Node.js v26.13.1 or higher
- npm 11.20.0 or higher

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SONI_HOUSEKEEPING_MANAGEMENT
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
SONI_HOUSEKEEPING_MANAGEMENT/
├── app/
│   ├── agency-dashboard/
│   │   └── page.tsx          # Agency staff dashboard
│   ├── dashboard/
│   │   ├── areas/
│   │   │   └── form/         # Areas CRUD form
│   │   ├── categories/
│   │   │   └── form/         # Categories CRUD form
│   │   ├── complaints/
│   │   │   └── form/         # Complaints CRUD form
│   │   ├── itpo-officials/
│   │   │   └── form/         # ITPO Officials CRUD form
│   │   ├── zones/
│   │   │   └── form/         # Zones CRUD form
│   │   └── page.tsx          # Admin dashboard
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Login page
├── lib/
│   └── translations.ts        # Language translations (EN/HI)
├── public/                   # Static assets
├── AGENTS.md                 # AI agent instructions
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Pages

### Authentication
- `/` - Login page

### Admin Dashboard
- `/dashboard` - Main admin dashboard with all sections
- `/dashboard/itpo-officials/form` - Add/Edit ITPO Officials
- `/dashboard/complaints/form` - Add/Edit Complaints
- `/dashboard/zones/form` - Add/Edit Zones
- `/dashboard/areas/form` - Add/Edit Areas
- `/dashboard/categories/form` - Add/Edit Categories

### Agency Dashboard
- `/agency-dashboard` - Agency staff dashboard

## Environment Variables

Currently, the application uses static data. For production, you may need to add the following environment variables:

```env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# API Keys (if needed)
API_KEY=
```

## Language Support

The application supports two languages:
- **English (EN)** - Default language
- **Hindi (हिन्दी)** - Hindi translations

Language can be switched using the EN/हिन्दी buttons in the dashboard.

## Data Management

Currently, the application uses static data. Future implementations will include:
- Database integration (PostgreSQL/MySQL)
- API routes for CRUD operations
- Authentication system integration
- File upload for complaint images

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Style

- Use TypeScript for type safety
- Follow existing code structure
- Use Tailwind CSS for styling
- Keep components modular and reusable
- Add comments for complex logic

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is proprietary software for Bharat Mandapam. All rights reserved.

## Support

For support, please contact the ITPO Platform Administrator.

## Development Notes

- The application uses Next.js App Router
- All pages are client components for dynamic interactivity
- Language switching is implemented with a translation system
- Forms currently use static data and alert for success messages
- Future: Replace with proper database integration and toast notifications

## Roadmap

- [ ] Database integration
- [ ] Authentication system (NextAuth.js)
- [ ] API routes for all CRUD operations
- [ ] File upload for complaint images
- [ ] Email notifications
- [ ] Real-time updates (WebSocket)
- [ ] Report generation
- [ ] Mobile app development
