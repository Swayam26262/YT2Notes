import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

const ContactForm = () => {
  const [state, handleSubmit] = useForm("meogzjeo");
  
  if (state.succeeded) {
    return (
      <div className="text-center py-8">
        <svg className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
        <p className="text-lg">Your message has been sent successfully.</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-left mb-1 font-medium">
          Name
        </label>
        <input
          id="name"
          type="text" 
          name="name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-left mb-1 font-medium">
          Email Address
        </label>
        <input
          id="email"
          type="email" 
          name="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
          required
        />
        <ValidationError 
          prefix="Email" 
          field="email"
          errors={state.errors}
          className="text-red-500 text-sm mt-1 text-left"
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-left mb-1 font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
          required
        />
        <ValidationError 
          prefix="Message" 
          field="message"
          errors={state.errors}
          className="text-red-500 text-sm mt-1 text-left"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={state.submitting}
        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
      >
        {state.submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm; 