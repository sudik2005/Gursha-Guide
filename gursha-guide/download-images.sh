#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p public/images

# Download placeholder images for Ethiopian dishes
cd public/images

# Hero images
curl -o hero-bg.jpg https://source.unsplash.com/random/1920x1080/?ethiopian,food
curl -o about-hero.jpg https://source.unsplash.com/random/1920x1080/?ethiopia,cuisine
curl -o recipes-hero.jpg https://source.unsplash.com/random/1920x1080/?cooking,spices
curl -o subscription-hero.jpg https://source.unsplash.com/random/1920x1080/?cooking,chef

# Food images
curl -o doro-wat.jpg https://source.unsplash.com/random/800x600/?chicken,stew
curl -o injera.jpg https://source.unsplash.com/random/800x600/?bread,ethiopian
curl -o misir-wat.jpg https://source.unsplash.com/random/800x600/?lentil,stew
curl -o berbere.jpg https://source.unsplash.com/random/800x600/?spices,red
curl -o kitfo.jpg https://source.unsplash.com/random/800x600/?beef,tartare
curl -o shiro.jpg https://source.unsplash.com/random/800x600/?chickpea,stew
curl -o tibs.jpg https://source.unsplash.com/random/800x600/?meat,sauteed
curl -o coffee-ceremony.jpg https://source.unsplash.com/random/800x600/?coffee,ceremony
curl -o traditional-meal.jpg https://source.unsplash.com/random/800x600/?ethiopian,meal
curl -o vegetarian-platter.jpg https://source.unsplash.com/random/800x600/?vegetarian,platter

# Spice Images
curl -o niter-kibbeh.jpg https://source.unsplash.com/random/800x600/?butter,spices
curl -o fenugreek.jpg https://source.unsplash.com/random/800x600/?fenugreek,spices
curl -o korarima.jpg https://source.unsplash.com/random/800x600/?cardamom,spices
curl -o ajwain.jpg https://source.unsplash.com/random/800x600/?caraway,spices
curl -o rue.jpg https://source.unsplash.com/random/800x600/?herb,green

# Testimonial images
curl -o testimonial-1.jpg https://source.unsplash.com/random/300x300/?woman,portrait
curl -o testimonial-2.jpg https://source.unsplash.com/random/300x300/?man,portrait
curl -o testimonial-3.jpg https://source.unsplash.com/random/300x300/?person,portrait

echo "Image download complete!"
