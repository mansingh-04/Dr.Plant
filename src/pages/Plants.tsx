import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { plantsAPI } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { PlantCard } from '../components/PlantCard';
import { PlantListItem } from '../components/PlantListItem';
import { Button } from '../components/ui/button';
import { Loading } from '../components/Loading';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '../components/ui/pagination';
import { Plus, Search, Sprout, LayoutGrid, List } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useDebounce } from 'use-debounce';
import { useAuth } from '../contexts/AuthContext';

const Plants = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const itemsPerPage = viewMode === 'grid' ? 6 : 5; // 6 for grid, 5 for list

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['plants', debouncedSearchTerm, currentPage, itemsPerPage, sortBy, sortOrder],
    queryFn: async () => {
      const response = await plantsAPI.getAll({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder
      });

      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const plants = data?.plants || [];
  const totalPlants = data?.total || 0;
  const totalPages = Math.ceil(totalPlants / itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const renderPaginationItems = () => {
    const pages = [];
    const maxPageButtons = 5; // Max number of page buttons to display

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i === currentPage}
              onClick={() => setCurrentPage(i)}
              className={i === currentPage ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "hover:bg-primary/10 hover:text-primary"}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={1 === currentPage}
            onClick={() => setCurrentPage(1)}
            className={1 === currentPage ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "hover:bg-primary/10 hover:text-primary"}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from the beginning
      if (currentPage > 2) {
        pages.push(<PaginationEllipsis key="start-ellipsis" />);
      }

      // Show pages around the current page
      const startPage = Math.max(2, currentPage - Math.floor(maxPageButtons / 2) + 1);
      const endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPageButtons / 2) - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i === currentPage}
              onClick={() => setCurrentPage(i)}
              className={i === currentPage ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "hover:bg-primary/10 hover:text-primary"}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from the end
      if (currentPage < totalPages - 1) {
        pages.push(<PaginationEllipsis key="end-ellipsis" />);
      }

      // Always show last page
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={totalPages === currentPage}
            onClick={() => setCurrentPage(totalPages)}
            className={totalPages === currentPage ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "hover:bg-primary/10 hover:text-primary"}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-8 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                Welcome Back, {user?.name?.split(' ')[0] || 'Gardener'}!
              </h1>
              <p className="text-muted-foreground text-base max-w-2xl">
                Your digital garden is looking lush. Track your plants, monitor their health, and watch them thrive.
              </p>
            </div>
            <Link to="/plants/new">
              <Button className="rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add New Plant
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="glass-panel p-3 rounded-2xl mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your collection..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 bg-transparent border-black/10 dark:border-white/10 focus:ring-primary/50 h-10"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-black/5 dark:border-white/5">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-black/40 shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-black/40 shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-[160px] bg-transparent border-black/10 dark:border-white/10 h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-20">
            <Loading message="Gathering your plants..." fullScreen={false} />
          </div>
        ) : plants && plants.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {plants.map((plant: any) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {plants.map((plant: any) => (
                <PlantListItem key={plant.id} plant={plant} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-2 border-primary/20">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sprout className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Your garden is empty</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start your journey by adding your first plant. We'll help you track its care and growth.
            </p>
            <Link to="/plants/new">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Plant
              </Button>
            </Link>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-12">
            <PaginationContent>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-primary/10 hover:text-primary'}
              />
              {renderPaginationItems()}
              <PaginationNext
                onClick={handleNextPage}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-primary/10 hover:text-primary'}
              />
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default Plants;
