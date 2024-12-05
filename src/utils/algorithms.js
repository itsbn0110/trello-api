// algorithm

// Tính toán giá trị skip phục vụ các tác vụ phân trang

export const pagingSkipValue = (page, itemsPerPage) => {
  // Luôn luôn đảm bảo nếu giá trị không hợp lệ thì return về 0 hếts
  if (!page || !itemsPerPage) return 0;
  if (page <= 0 || itemsPerPage <= 0) return 0;

  /**
   * Giải thích công thức đơn giản dễ hiểu:
   * Ví dụ trường hợp mỗi page hiển thị 12 sản phẩm (itemPerPage =12 )
   * Case 01 : User đứng ở page 1 (page = 1 ) thì sẽ lấy 1-1 = 0 sau đó nhân với 12 thì cũng = 0,
   lúc này giá trị skip là 0, nghĩa là không skip bản ghi
   * Case 02 : User đứng ở page 2 (page = 2 )thì sẽ lấy 2-1 =1 sau đó nhân với 12 thì = 12, lúc này giá trị skip là 12
   nghĩa là skip 12 bản ghi của page trước đó
     Case 03 : User đứng ở page 5 (page = 5) thì sẽ lấy 5-1 =4 sau đó nhân với 12 thì = 48,lúc này giá trị skip là 48
   nghĩa là skip 48 bản ghi của page trước đó
   ....
   */
  return (page - 1) * itemsPerPage;
};
