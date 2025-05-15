import { Button } from "@material-tailwind/react";
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
    variant: currentPage === index ? "filled" : "text",
    color: "gray",
    onClick: () => {
      onPageChange(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    className: "rounded-full",
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
      <Button key={1} {...getItemProps(1)}>{1}</Button>
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
        <Button key={i} {...getItemProps(i)}>{i}</Button>
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
        <Button key={totalPages} {...getItemProps(totalPages)}>{totalPages}</Button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="lg:flex items-center gap-4 mx-auto py-5 hidden">
      <Button
        variant="text"
        color="gray"
        className="flex items-center gap-2 rounded-full"
        onClick={prev}
        disabled={currentPage === 1}
      >
        <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" /> Previous
      </Button>
      <div className="flex items-center gap-2">
        {renderPageNumbers()}
      </div>
      <Button
        variant="text"
        color="gray"
        className="flex items-center gap-2 rounded-full"
        onClick={next}
        disabled={currentPage === totalPages}
      >
        Next
        <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
      </Button>
    </div>
  );
}