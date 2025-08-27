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
- `users`: Stores user profile data, including the `isAdmin` flag.
- `checkouts`: Stores order information.

### Security Rules

For development, you can use relaxed rules. For a production environment, you must implement stricter rules to protect your data. Here is a secure set of rules to start with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    // Products and Categories are public
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(db)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(db)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Users can read their own profile, admins can read any profile
    // Only admins can change the isAdmin flag
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(db)/documents/users/$(request.auth.uid)).data.isAdmin == true);
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId && !("isAdmin" in request.resource.data);
      allow write: if request.auth != null && get(/databases/$(db)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Anyone can create a checkout
    // Users can only read their own checkouts, admins can read any
    match /checkouts/{checkoutId} {
      allow create: if true;
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || get(/databases/$(db)/documents/users/$(request.auth.uid)).data.isAdmin == true);
      allow update, delete: if request.auth != null && get(/databases/$(db)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## How to make a user an admin
1.  After a user has signed up, go to your **Firebase Console**.
2.  Navigate to the **Firestore Database**.
3.  Find the `users` collection.
4.  Locate the document corresponding to the user you want to make an admin (the document ID will be their User UID).
5.  Edit the `isAdmin` field for that user from `false` to `true`.

The user will need to log out and log back in for the change to take effect.

## Deployment on Vercel

To deploy this application to Vercel, follow these steps:

1.  Push your code to a Git repository (e.g., GitHub, GitLab).
2.  Import your project into Vercel from the Git repository.
3.  In the Vercel Project Settings, navigate to the "Environment Variables" section.
4.  Add the `NEXT_PUBLIC_FIREBASE_*` environment variables with the values from your Firebase project.
5.  Trigger a new deployment. Vercel will automatically build and deploy your application.
