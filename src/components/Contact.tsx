// src/components/Contact.js
import { FaGithub, FaLinkedinIn, FaTwitter, FaEnvelope } from 'react-icons/fa';

const Contact = () => {
  // NOTE: Form submission requires a backend handler (API Route or 3rd party service)
  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    // Add form submission logic here
    alert('Form submission logic needs to be implemented!');
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-4 font-heading">
            Get In Touch
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Interested in collaborating or have a question? Feel free to reach out!
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-secondary/5 p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="transition-all duration-300 focus-within:scale-[1.01]">
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="block w-full rounded-md border border-gray-200 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-3 px-4 bg-background transition-all duration-200"
                  placeholder="Your Name"
                  aria-label="Your name"
                />
              </div>
              <div className="transition-all duration-300 focus-within:scale-[1.01]">
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="block w-full rounded-md border border-gray-200 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-3 px-4 bg-background transition-all duration-200"
                  placeholder="you@example.com"
                  aria-label="Your email address"
                />
              </div>
            </div>
            <div className="transition-all duration-300 focus-within:scale-[1.01]">
              <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                rows={5}
                required
                className="block w-full rounded-md border border-gray-200 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-3 px-4 bg-background transition-all duration-200"
                placeholder="Your message here..."
                aria-label="Your message"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 rounded-md border border-transparent bg-primary px-6 py-3 text-base font-medium text-black shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 hover:scale-[1.01]"
              >
                <span>Send Message</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>

            {/* Social Links */}
            <div className="mt-12 text-center">
            <p className="text-text-secondary mb-4">Or connect with me on:</p>
            <div className="flex justify-center space-x-6">
              <a 
              href="https://github.com/gigahidjrikaaa" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-primary transition-colors duration-300"
              aria-label="GitHub Profile"
              >
              <span className="sr-only">GitHub</span>
              <FaGithub />
              </a>
              <a 
              href="https://linkedin.com/in/gigahidjrikaaa" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-primary transition-colors duration-300"
              aria-label="LinkedIn Profile"
              >
              <span className="sr-only">LinkedIn</span>
              <FaLinkedinIn />
              </a>
              <a
              href="https://twitter.com/gigahidjrikaaa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-primary transition-colors duration-300"
              aria-label="Twitter Profile"
              >
              <span className="sr-only">Twitter</span>
              <FaTwitter />
              </a>
              <a
              href="mailto:gigahidjrikaaa@gmail.com"
              className="text-text-secondary hover:text-primary transition-colors duration-300"
              aria-label="Email"
              >
              <span className="sr-only">Email</span>
              <FaEnvelope />
              </a>
            </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;