'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [careerGoals, setCareerGoals] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string>("Freshman");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const router = useRouter();

  // Loading messages array
  const loadingMessages = useMemo(() => [
    (filename: string) => `Opening ${filename}... this BETTER be good...`,
    "this person might be cooked chat...",
    "dawg you are NOT locked in 😭🙏🙏...",
    "eh pretty good for a high schooler ig...",
    "just put the fries in the bag gng 😭😭...",
    "u are definitely lying about these achievements...",
    "let me fact check ts...",
    "ts pmo ts pmo ts pmo ts pmo ts pmo ts pmo...",
    "斯基比迪厕所...",
    "XIAOHONGSHU...",
  ], []); // Empty dependency array since these messages never change

  useEffect(() => {
    if (isLoading) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        const messageOrFn = loadingMessages[currentIndex];
        const message = currentIndex === 0 && file 
          ? (messageOrFn as (filename: string) => string)(file.name)
          : messageOrFn as string;
        setLoadingMessage(message);
        currentIndex = (currentIndex + 1) % loadingMessages.length;
      }, 2000); // Change message every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isLoading, file, loadingMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please provide a resume');
      return;
    }

    setIsLoading(true);
    const firstMessage = (loadingMessages[0] as (filename: string) => string)(file.name);
    setLoadingMessage(firstMessage);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('careerGoals', careerGoals);
      formData.append('gradeLevel', gradeLevel);

      const response = await fetch('/api/roast', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (!data.success || !data.feedback) {
        throw new Error(data.error || 'Invalid response from server');
      }

      // Store the feedback in localStorage for the results page
      localStorage.setItem('resumeRoastFeedback', JSON.stringify({
        ...data.feedback,
        studentInfo: {
          ...data.feedback.studentInfo,
          gradeLevel,
        },
      }));
      
      // Add a small delay before navigation to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to results
      router.push('/results');
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'TS pmo 💔 js try again gng';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-8 relative overflow-hidden">
      {/* Top Marquee */}
      <div className="fixed top-0 left-0 right-0 overflow-hidden whitespace-nowrap bg-main">
        <div className="animate-marquee-right inline-block">
          <span className="inline-block py-2 text-black font-bold tracking-tight" style={{ WebkitTextStroke: '1px black' }}>
            {Array(10).fill("BY FSB BUSINESS CLUB • ").join(" ")}
          </span>
        </div>
        <div className="animate-marquee-right inline-block absolute top-0">
          <span className="inline-block py-2 text-black font-bold tracking-tight" style={{ WebkitTextStroke: '1px black' }}>
            {Array(10).fill("BY FSB BUSINESS CLUB • ").join(" ")}
          </span>
        </div>
      </div>

      {/* Bottom Marquee */}
      <div className="fixed bottom-0 left-0 right-0 overflow-hidden whitespace-nowrap bg-main">
        <div className="animate-marquee-left inline-block">
          <span className="inline-block py-2 text-black font-bold tracking-tight" style={{ WebkitTextStroke: '1px black' }}>
            {Array(10).fill("BY FSB BUSINESS CLUB • ").join(" ")}
          </span>
        </div>
        <div className="animate-marquee-left inline-block absolute top-0">
          <span className="inline-block py-2 text-black font-bold tracking-tight" style={{ WebkitTextStroke: '1px black' }}>
            {Array(10).fill("BY FSB BUSINESS CLUB • ").join(" ")}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-bw border-2 border-border shadow-shadow p-8 rounded-base relative z-10"
      >
        <h1 className="text-4xl font-heading text-text mb-2 font-display">Resume Roaster</h1>
        <p className="text-text mb-8">ts app gives you resume feedback or sum 💔</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="grade-level" className="text-lg font-medium text-text font-display">
                What grade u in gng 🙏
              </label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger className="w-full bg-white border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <SelectValue placeholder="Select your grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Freshman">Freshman</SelectItem>
                  <SelectItem value="Sophomore">Sophomore</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-base text-text mb-2 font-display">
                pls put ur resume here 🤑
              </label>
              <div className="relative">
                <label 
                  htmlFor="resume-upload" 
                  className="flex items-center justify-center w-full h-32 px-4 transition bg-bw border-2 border-dashed border-border rounded-base cursor-pointer hover:border-black/50"
                >
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-text" />
                    <p className="mt-2 text-sm text-text font-base">ig you can js drag or click fr</p>
                    {file && <p className="mt-1 text-sm text-text/70">{file.name}</p>}
                  </div>
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-base text-text mb-2 font-display">
              career goals here (1 sentence is enough)
            </label>
            <Input
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              placeholder="uh im looking for internships in Finance before college applications fr"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full relative"
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <span className="animate-pulse">{loadingMessage}</span>
                <span className="ml-2 animate-bounce">🤔</span>
              </span>
            ) : (
              'js roast me gng 💔'
            )}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
