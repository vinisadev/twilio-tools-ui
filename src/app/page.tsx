import TwilioValidationForm from '@/components/TwilioValidationForm';

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Twilio API Explorer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn and explore Twilio APIs with interactive examples. Start by validating your 
            Twilio credentials to unlock the full potential of Twilio's communication platform.
          </p>
        </div>

        <div className="flex justify-center">
          <TwilioValidationForm />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Explore Twilio Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Messaging</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Send SMS, MMS, WhatsApp, and other messaging services
              </p>
              <div className="text-xs text-gray-500">
                SMS • MMS • WhatsApp • Facebook Messenger • Conversations
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Voice</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Make and receive phone calls with advanced features
              </p>
              <div className="text-xs text-gray-500">
                Calls • Conference • Recordings • Transcriptions • Queues
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">📹</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Video</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Build video applications with real-time communication
              </p>
              <div className="text-xs text-gray-500">
                Rooms • Compositions • Recordings
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Authentication</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Secure your applications with phone verification
              </p>
              <div className="text-xs text-gray-500">
                Verify • Authy • Two-Factor Authentication
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Studio</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Visual flow builder for communication workflows
              </p>
              <div className="text-xs text-gray-500">
                Flows • Executions • Visual Builder
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">☁️</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Functions</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Serverless functions for custom logic
              </p>
              <div className="text-xs text-gray-500">
                Serverless • Assets • Custom Logic
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Use the sidebar navigation to explore different Twilio services. Each section 
              includes interactive examples and detailed documentation to help you build 
              amazing communication experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm text-gray-500">
                <strong>💡 Tip:</strong> Start with credential validation above, then explore the sidebar!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}