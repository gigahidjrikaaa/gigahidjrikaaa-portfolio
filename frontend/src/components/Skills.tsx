// src/components/Skills.js

// Example: Define skill categories and skills
const skillCategories = [
    {
      name: 'Programming Languages',
      skills: ['JavaScript (ES6+)', 'Python', 'TypeScript', 'Solidity', 'HTML5', 'CSS3'],
    },
    {
      name: 'Frameworks & Libraries',
      skills: ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Ethers.js', 'Hardhat', 'Tailwind CSS', 'TensorFlow/Keras', 'PyTorch'],
    },
    {
      name: 'Databases & Storage',
      skills: ['PostgreSQL', 'MongoDB', 'Redis', 'IPFS'],
    },
    {
      name: 'AI / Blockchain Concepts',
      skills: ['Machine Learning', 'Natural Language Processing', 'Smart Contracts', 'DeFi Basics', 'Consensus Algorithms', 'Data Structures & Algorithms'],
    },
    {
      name: 'Tools & Platforms',
      skills: ['Git & GitHub', 'Docker', 'Vercel', 'Netlify', 'AWS (Basic)', 'Linux/Unix', 'Jira', 'Figma (Basic)'],
    },
    {
      name: 'Methodologies',
      skills: ['Agile/Scrum', 'RESTful APIs', 'Project Management Principles'],
    },
  ];
  
  const Skills = () => {
    return (
      <section id="skills" className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-4 font-heading">
              Skills & Expertise
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              A snapshot of the technologies, tools, and concepts I work with regularly.
            </p>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {skillCategories.map((category) => (
              <div key={category.name} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold font-heading text-primary mb-4">{category.name}</h3>
                <ul className="space-y-2">
                  {category.skills.map((skill) => (
                    <li key={skill} className="flex items-center text-text-secondary">
                      {/* Optional: Add an icon here */}
                      <svg className="w-4 h-4 mr-2 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default Skills;