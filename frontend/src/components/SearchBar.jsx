// Categories come from the API so the dropdown always matches real product data
function SearchBar({ search, setSearch, category, setCategory, categories = [] }) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">

            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-blue-500"
            >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

        </div>
    )
}

export default SearchBar