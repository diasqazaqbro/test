import { useState, useEffect } from 'react';
import md5 from 'crypto-js/md5';

const API_URL = 'https://api.valantis.store:41000/';
const PASSWORD = 'Valantis';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [authString, setAuthString] = useState('');

  useEffect(() => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Текущая дата в формате YYYYMMDD
    const hash = md5(`${PASSWORD}_${timestamp}`).toString();
    setAuthString(hash);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, authString]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth': authString
        },
        body: JSON.stringify({
          action: 'get_ids',
          params: { offset: (page - 1) * 50, limit: 50 }
        })
      });
      
      const data = await response.json();
      if (data.error) {
        console.error('API error:', data.error);
      } else {
        const productIds = data.result;
        const productsData = await fetchProductDetails(productIds);
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const fetchProductDetails = async (productIds) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth': authString
        },
        body: JSON.stringify({
          action: 'get_items',
          params: { ids: productIds }
        })
      });
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };


  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };
 

  return (
    <div className="product-list-container">
      <h1>Product List</h1>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id} className="product-list-item">
            {product.product} - {product.price} - {product.brand}
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        hasNextPage={products.length === 50}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
};


const Pagination = ({ page, hasNextPage, onPrevPage, onNextPage }) => {
  return (
    <div className="pagination">
      <button onClick={onPrevPage} disabled={page === 1} className="pagination-button">Previous</button>
      <span>Page {page}</span>
      <button onClick={onNextPage} disabled={!hasNextPage} className="pagination-button">Next</button>
    </div>
  );
};

export default ProductList;
