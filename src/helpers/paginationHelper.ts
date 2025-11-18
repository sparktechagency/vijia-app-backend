import { IPaginationOptions } from '../types/pagination';

const calculatePagination = (options: IPaginationOptions) => {
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 10);

  const skip = (page - 1) * limit;

  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};
const paginateArray = (
  array: any[],
  query: Record<string, any>,
  search?: { searchTerm: string; fields?: string[] }
) => {
  let results = [...array];

  // Search Filter
  if (search?.searchTerm && search?.fields?.length) {
    const regex = new RegExp(search.searchTerm, 'i');
    results = results.filter(item =>
      search.fields!.some(field => {
        const value = item[field];
        return typeof value === 'string' && regex.test(value);
      })
    );
  }

  // Pagination
  const limit = Math.max(Number(query?.limit) || 10, 1);
  const page = Math.max(Number(query?.page) || 1, 1);

  const total = results.length;
  const totalPage = Math.ceil(total / limit);

  const startIndex = Math.max((page - 1) * limit, 0);
  const endIndex = Math.min(startIndex + limit, total);
  const paginatedData = results.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      total,
      page,
      limit,
      totalPage,
    },
  };
};



export const paginationHelper = {
  calculatePagination,
  paginateArray
};
