// src/components/ProjectCard.js
import Image from 'next/image';

// Example Icons (Replace with actual icons e.g., from heroicons or react-icons)
const CodeBracketIcon = () => <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 11.5a1 1 0 01-1.898-.65l4-11.5a1 1 0 011.265-.615zM6.684 3.051a1 1 0 011.265.615l-4 11.5a1 1 0 01-1.898-.65l4-11.5a1 1 0 01.633-1.265z" clipRule="evenodd" /></svg>;
const ArrowTopRightOnSquareIcon = () => <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11.5a1 1 0 012 0v5.071a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" clipRule="evenodd" /></svg>;


interface ProjectCardProps {
  title: string;
  description: string;
  imageUrl: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
}

const ProjectCard = ({ title, description, imageUrl, techStack, githubUrl, liveUrl }: ProjectCardProps) => {
  return (
    <article className="group relative flex flex-col rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-white">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={`${title} screenshot`}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-4 sm:p-6">
        <h3 className="text-xl font-semibold font-heading text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary text-sm flex-grow mb-4">{description}</p>

        {/* Tech Stack Tags */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase text-text-secondary mb-2">Technologies Used:</h4>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span key={tech} className="inline-block bg-accent/10 text-accent text-xs font-medium px-2.5 py-0.5 rounded-full">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="mt-auto flex justify-start gap-4 border-t pt-4">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors duration-200"
            >
              <CodeBracketIcon /> View Code
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors duration-200"
            >
              <ArrowTopRightOnSquareIcon /> Live Demo
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;