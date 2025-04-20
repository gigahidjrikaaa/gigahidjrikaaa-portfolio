// src/components/About.js
import Image from 'next/image'; // Use Next.js Image for optimization

const About = () => {
  return (
    <section id="about" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          {/* Text Content Area */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-6 font-heading">
              About Me
            </h2>
            {/* Use max-w-prose for optimal reading line length */}
            <div className="prose prose-lg text-text-secondary max-w-none">
              <p>
                Hi, I&apos;m Giga! I&apos;m currently pursuing my degree in Information Engineering at Universitas Gadjah Mada,
                with a deep fascination for the potential of Artificial Intelligence and Blockchain technologies.
                I thrive on solving complex problems and building impactful solutions.
              </p>
              <p>
                My journey has led me to work on exciting projects like UGM-AICare, where we leverage technology
                (Next.js, FastAPI, Redis) to address mental health challenges within the university community.
                I&apos;m particularly interested in NLP for mental health and sharia-compliant decentralized finance.
              </p>
              <p>
                Beyond coding, I enjoy playing competitive games and table tennis. These activities help me maintain a balanced lifestyle and provide an outlet for my competitive spirit. Gaming sharpens my strategic thinking, while table tennis keeps me physically active and improves my reflexes and concentration.
                I&apos;m always eager to learn, collaborate, and apply my skills to create meaningful change.
              </p>
            </div>
          </div>

          {/* Image Area */}
          <div className="flex justify-center md:justify-end">
            <div className="relative h-64 w-64 sm:h-80 sm:w-80 rounded-full overflow-hidden shadow-lg">
              <Image
                src="/profile.jpg" // Replace with your professional photo in /public
                alt="Giga - Professional Headshot" // Descriptive alt text
                layout="fill" // Makes image fill the container
                objectFit="cover" // Scales image nicely within the container
                className="transition-transform duration-500 ease-in-out hover:scale-105" // Subtle hover effect
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;