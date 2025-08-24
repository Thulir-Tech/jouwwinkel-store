# Jouwwinkel E-commerce Store

This is a production-ready e-commerce web application built with Next.js, Firebase, and Tailwind CSS.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Features

- **Homepage:** A stunning hero section and a grid of featured products.
- **Product Catalog:** Browse all products with client-side search, filtering, and sorting.
- **Shopping Cart:** A persistent shopping cart using Zustand and localStorage.
- **AI Recommendations:** An AI-powered product recommendation carousel.
- **Modern UI:** Built with shadcn/ui and styled with Tailwind CSS for a clean, elegant, and responsive design.

## Environment Variables

This project uses Firebase for its backend. You need to set up a Firebase project and add the configuration to a `.env.local` file in the root of the project.

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Firestore Setup

The application expects the following collections in your Firestore database:

- `products`: Contains product information.
- `categories`: Contains product categories.

### Security Rules

For development, you can use the following security rules. For production, ensure you have stricter rules in place.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // or allow write: if true; for easy seeding
    }
  }
}
```

## Deployment on Vercel

To deploy this application to Vercel, follow these steps:

1.  Push your code to a Git repository (e.g., GitHub, GitLab).
2.  Import your project into Vercel from the Git repository.
3.  In the Vercel Project Settings, navigate to the "Environment Variables" section.
4.  Add the `NEXT_PUBLIC_FIREBASE_*` environment variables with the values from your Firebase project.
5.  Trigger a new deployment. Vercel will automatically build and deploy your application.
