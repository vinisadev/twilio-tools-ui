import TwilioValidationForm from "@/components/TwilioValidationForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Twilio API Explorer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn and explore Twilio APIs with interactive examples. Start by validating your
            Twilio credentials to unlock the full potential of Twilio's communication platform.
          </p>
        </div>

        <div className="flex justify-center">
          <TwilioValidationForm />
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            What&apos;s Next?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">SMS & MMS</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Send and receive text messages and multimedia messages
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Voice Calls</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Make and receive phone calls with advanced features
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">WhatsApp</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Integrate WhatsApp messaging into your applications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}