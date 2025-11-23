"use client";

interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function InteractiveButton({ children, onClick, className }: InteractiveButtonProps) {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function ScrollToSolutionsButton() {
  const scrollToSolutions = () => {
    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToSolutions}
      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-8 py-5 rounded-2xl text-xl font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-700/50 transition-all duration-300 transform hover:-translate-y-1 hover:text-orange-600 dark:hover:text-orange-400"
    >
      See How It Works
    </button>
  );
}

export function ScrollToGetStartedButton() {
  const scrollToGetStarted = () => {
    document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToGetStarted}
      className="bg-red-700/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-red-400/30 hover:bg-red-600/30 hover:border-red-300/50 transition-all duration-300"
    >
      Learn More
    </button>
  );
}