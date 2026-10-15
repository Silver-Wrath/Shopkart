import { useAuth } from "../context/AuthContext"

function Home() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="max-w-5xl mx-auto px-4 py-10">

                <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm mb-8">

                    <p className="text-blue-600 font-semibold mb-2">
                        SHOPKART
                    </p>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome, {user.fullName}!
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Here's your account information.
                    </p>

                </div>

                <div className="grid md:grid-cols-3 gap-5">

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <p className="text-sm text-gray-500 mb-2">
                            Full Name
                        </p>

                        <p className="text-lg font-semibold text-gray-900">
                            {user.fullName}
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <p className="text-sm text-gray-500 mb-2">
                            Email
                        </p>

                        <p className="text-lg font-semibold text-gray-900 break-words">
                            {user.email}
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <p className="text-sm text-gray-500 mb-2">
                            Phone
                        </p>

                        <p className="text-lg font-semibold text-gray-900">
                            {user.phone}
                        </p>
                    </div>

                </div>

            </main>

        </div>
    )
}

export default Home