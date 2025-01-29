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
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    } else if (currentPage + 2 >= totalPages) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button key={i} {...getItemProps(i)}>{i}</Button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="lg:flex items-center gap-4 mx-auto py-5 hidden">
      <Button
        variant="text"
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