// src/components/SimpleAnniversariesCarousel.js

import React from 'react';
import Slider from 'react-slick';
import './SimpleAnniversariesCarousel.css'; // Mude o nome do arquivo CSS conforme o seu
import image1 from './src/assets/aniversariantes/aniversariante1.png'; // Importe a imagem 1
import image2 from './src/assets/aniversariantes/aniversariante2.png'; // Importe a imagem 2


const images = [image1, image2];

const SimpleAnniversariesCarousel = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    dots: false,
  };

  return (
    <div className="anniversary-carousel-container">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <img src={image} alt={`Aniversariantes ${index + 1}`} className="carousel-image" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SimpleAnniversariesCarousel;