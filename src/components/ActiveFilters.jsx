const ActiveFilters = ({ filters = [] }) => {
    const active = filters.filter((filter) => filter.values?.length > 0);
    if (active.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {active.map((filter) => (
                <span
                    key={filter.label}
                    className="inline-flex items-center rounded-full bg-black px-3 py-1 text-sm text-white"
                >
                    {filter.label}: {filter.values.join(', ')}
                    <button
                        type="button"
                        aria-label={`Remove ${filter.label} filter`}
                        onClick={filter.onRemove}
                        className="ml-2 leading-none text-white"
                    >
                        ×
                    </button>
                </span>
            ))}
        </div>
    );
};

export default ActiveFilters;
