import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface CircularPaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
}

export function CircularPagination({ totalItems, itemsPerPage, currentPage, onPageChange }: CircularPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getItemProps = (index: number) => ({
    onClick: () => {
      onPageChange(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    className: `rounded-full px-4 py-2 transition-all ${
      currentPage === index 
        ? 'bg-gray-900 text-white' 
        : 'bg-transparent text-gray-700 hover:bg-gray-100'
    }`
  });

  const next = () => {
    if (currentPage === totalPages) return;
    onPageChange(currentPage + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    if (currentPage === 1) return;
    onPageChange(currentPage - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Always add first page
    pageNumbers.push(
      <button key={1} {...getItemProps(1)}>
        {1}
      </button>
    );

    // Add ellipsis if needed after first page
    if (startPage > 2) {
      pageNumbers.push(
        <span key="ellipsis1" className="px-2">...</span>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button key={i} {...getItemProps(i)}>
          {i}
        </button>
      );
    }

    // Add ellipsis if needed before last page
    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <span key="ellipsis2" className="px-2">...</span>
      );
    }

    // Add last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(
        <button key={totalPages} {...getItemProps(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 mx-auto py-5">
      <button
        className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
          currentPage === 1 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={prev}
        disabled={currentPage === 1}
      >
        <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" /> Previous
      </button>
      <div className="flex items-center gap-2 overflow-x-auto w-full justify-center">
        {renderPageNumbers()}
      </div>
      <button
        className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
          currentPage === totalPages 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={next}
        disabled={currentPage === totalPages}
      >
        Next
        <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
      </button>
    </div>
  );
}