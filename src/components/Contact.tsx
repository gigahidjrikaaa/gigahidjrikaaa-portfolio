// src/components/Contact.js

// Example Social Icons (Replace with actual icons)
const GitHubIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.201 2.397.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>;
const LinkedInIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;


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
              <a href="https://github.com/gigahidjrikaaa" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors duration-200">
                <span className="sr-only">GitHub</span>
                <GitHubIcon />
              </a>
              <a href="https://linkedin.com/in/gigahidjrikaaa" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors duration-200">
                <span className="sr-only">LinkedIn</span>
                <LinkedInIcon />
              </a>
              {/* Add other relevant social links */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;