import { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Searchbar } from './Searchbar/searchbar';
import { ImageGallery } from './ImageGallery/imagegallery';
import { ImageGalleryItem } from './ImageGalleryItem/ImageGalleryItem';
import { Button } from './Button/button';
import { fetchImages } from './Api/api';
import { Loader } from './Loader/loader';
import { Modal } from './Modal/modal';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [images, setImages] = useState([]);
  const [totalHits, setTotalHits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [largeImageURL, setLargeImageURL] = useState('');
  // За допомогою хука useRef будемо забороняти api запит карток при першому рендерингу
  const hasSearchRef = useRef(false);
  // При зміні запиту або номеру сторінки наповнюємо галерею картками
  useEffect(() => {
    if (!hasSearchRef.current) return;
    const fetchQuery = async () => {
      try {
        //Показуємо loader
        setIsLoading(true);
        // Викликаємо функцію http запиту
        const data = await fetchImages(searchQuery, currentPage);
        // Якщо отримаємо порожній масив, просимо ввести валідний пошуковий запит
        if (data.hits.length === 0) {
          toast.error('Enter valid search query');
          return;
        }
        setImages(prevImages => [...prevImages, ...data.hits]);
        setTotalHits(data.totalHits);
      } catch (error) {
        toast.error(
          'Unfortunately something went wrong. Please reload the page.'
        );
        // Ховаємо loader після виконання http запиту
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuery();
  }, [searchQuery, currentPage]);

  // Функція зміни номеру сторінки після натискання кнопки Load more
  const addPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };
  // Функція отримання інформації з backend при новому пошуковому запиті

  // Функція виклику модального вікна
  const handleImageClick = largeImageURL => {
    setIsModal(true);
    setLargeImageURL(largeImageURL);
  };
  // Функція закриття модального вікна
  const handleCloseModal = () => {
    setIsModal(false);
    setLargeImageURL('');
  };

  // Функція обробки форми з пошуковим запитом
  const searchSubmit = searchQuery => {
    setSearchQuery(searchQuery);
    setCurrentPage(1);
    setImages([]);
    setTotalHits(0);
    hasSearchRef.current = true;
  };

  const isButtonShow = images.length !== totalHits && !isLoading;
  return (
    <>
      <Searchbar handleSubmit={searchSubmit} />
      <ImageGallery>
        {images.length > 0 &&
          images.map(image => (
            <ImageGalleryItem
              source={image.webformatURL}
              deskr={image.tags}
              key={image.id}
              onClick={() => {
                handleImageClick(image.largeImageURL);
              }}
            />
          ))}
      </ImageGallery>
      {isButtonShow && <Button onClick={addPage} />}
      {isLoading && <Loader />}
      {isModal && (
        <Modal onClose={handleCloseModal} largeImage={largeImageURL} />
      )}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        draggable
        pauseOnHover={false}
        theme="colored"
      />
    </>
  );
};

export default App;
