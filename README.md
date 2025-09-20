
# 🧭 Career Compass: Your AI-Powered Career Counselor

Career Compass is a cutting-edge web application designed to guide students and professionals through the complexities of modern career planning. Powered by generative AI, it provides personalized career exploration, detailed learning roadmaps, and valuable market insights to help users confidently navigate their professional journey.

## ✨ Key Features

- **Career Exploration**: Discover a wide range of career fields and specific job roles that align with your unique interests and background.
- **Personalized Roadmaps**: Receive a step-by-step learning path for any role, complete with curated resources like courses, videos, and articles.
- **In-Depth Market Analysis**: Gain valuable insights into salary expectations, current job market trends, and global opportunities for your chosen career.
- **AI-Powered Questionnaire**: Not sure where to start? Our interactive questionnaire gets to know you and suggests tailored career paths based on your passions and skills.
- **Dynamic & Responsive UI**: A modern, clean, and fully responsive user interface built with Next.js, ShadCN, and Tailwind CSS.
- **User Authentication**: Securely sign up, log in, and manage your profile with Firebase Authentication.
- **Personal History**: Keep track of your past career explorations to review and continue your journey at any time.

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **AI Integration**: [Google's Gemini Pro via Genkit](https://firebase.google.com/docs/genkit)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Deployment**: Firebase App Hosting

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/career-compass.git
cd career-compass
```

### 2. Install Dependencies

Install the required packages using npm:

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and add your credentials for the following services:

- **Firebase**: You need to create a Firebase project and get your web app's configuration keys.
- **Google AI (Gemini)**: You need an API key from Google AI Studio.
- **Google Custom Search & YouTube API**: You need an API key from Google Cloud Console with these APIs enabled.

Your `.env` file should look like this:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Google AI (Gemini)
GEMINI_API_KEY="your-gemini-api-key"

# Google Services (Search & YouTube)
GOOGLE_API_KEY="your-google-cloud-api-key"
GOOGLE_CSE_ID="your-custom-search-engine-id"
YOUTUBE_API_KEY="your-youtube-data-api-key"
```

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## 📜 Available Scripts

- `npm run dev`: Starts the development server with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the project files.

