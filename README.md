# 🔥 ResumeRoaster

> A modern, AI-powered resume analysis tool built by a high school student to help Friends students perfect their resumes.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-blue?logo=googlegemini&logoColor=fff)](https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/#ceo-message)

## 🚀 Features

- 📊 Advanced resume analysis using Google's Gemini AI
- 💡 Smart recommendations for improvements
- 📱 Responsive, modern UI built with Next.js and Tailwind CSS
- 📈 Visual feedback and scoring system
- ⚡️ Real-time processing and feedback
- 🎨 Beautiful, accessible design with Radix UI components

## 🛠 Tech Stack

- **Frontend Framework**: Next.js 15.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Integration**: Google Gemini API
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Charts**: Chart.js with react-chartjs-2

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resumeroaster.git
   cd resumeroaster
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then, add your Google Gemini API key to `.env.local`:
   ```
   GEMINI_API_KEY="your_api_key_here"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Getting a Gemini API Key

1. Visit the [Google AI Studio](https://aistudio.google.com)
2. Create or sign in to your Google account
3. Generate a new API key
4. Copy the key and paste it into your `.env.local` file

## 📚 Project Structure

```
resumeroaster/
├── src
│   ├── app/         # Next.js app router pages
│   ├── components/  # Reusable UI components
│   ├── lib/         # Utility functions and configurations
│   └── types/       # TypeScript type definitions
├── public/          # Static assets
└── ...config files  # Various configuration files
```

## 🧪 Key Features Explained

- **AI Analysis**: Leverages Google's Gemini AI to provide detailed resume feedback
- **Modern UI**: Built with the latest Next.js features and Tailwind CSS for a sleek look
- **Type Safety**: Full TypeScript implementation for robust code quality
- **Component Library**: Custom components built on Radix UI primitives
- **Form Validation**: Zod schema validation for reliable data handling
- **Responsive Design**: Fully responsive layout that works on all devices

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🙋‍♂️ About the Developer

Built by Kofi, a high school student and head of business club at Friends School, to help fellow students improve their resumes.

---

⭐️ If you found this helpful, please star the repo!

For questions or feedback, feel free to open an issue or reach out directly.
