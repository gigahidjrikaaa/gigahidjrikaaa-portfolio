// src/components/Projects.js
import ProjectCard from './ProjectCard';

// --- Placeholder Project Data ---
// Replace this with your actual project details
const myProjects = [
  {
    title: 'UGM-AICare Chatbot',
    description: 'A mental health support chatbot for university students, using Next.js, FastAPI, and Redis to provide accessible resources and conversation.',
    imageUrl: '/placeholder-project-ugm.jpg', // Replace with screenshot
    techStack: ['Next.js', 'FastAPI', 'Redis', 'Python', 'AI/NLP', 'Tailwind CSS'],
    githubUrl: 'https://github.com/yourusername/ugm-aicare-frontend', // Replace
    liveUrl: undefined, // Add URL if deployed
  },
  {
    title: 'Decentralized Voting System',
    description: 'Proof-of-concept blockchain application for secure and transparent voting using Solidity and Ethereum testnet.',
    imageUrl: '/placeholder-project-blockchain.jpg', // Replace
    techStack: ['Solidity', 'Hardhat', 'Ethers.js', 'React', 'Blockchain'],
    githubUrl: 'https://github.com/yourusername/blockchain-voting', // Replace
    liveUrl: undefined,
  },
  {
    title: 'AI Image Analyzer',
    description: 'A tool utilizing machine learning models (e.g., TensorFlow/PyTorch) to analyze and classify image content.',
    imageUrl: '/placeholder-project-ai.jpg', // Replace
    techStack: ['Python', 'TensorFlow', 'Flask', 'Machine Learning', 'API'],
    githubUrl: 'https://github.com/yourusername/ai-image-analyzer', // Replace
    liveUrl: undefined,
  },

];
// --- End Placeholder Data ---


const Projects = () => {
  return (
    <section id="projects" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-4 font-heading">
            My Projects
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Here are some of the projects I&apos;ve worked on, showcasing my skills in web development, AI, and blockchain.
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myProjects.map((project, index) => (
            <ProjectCard
              key={index} // Use a unique ID if available, otherwise index is okay for static lists
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl}
              techStack={project.techStack}
              githubUrl={project.githubUrl}
              liveUrl={project.liveUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;