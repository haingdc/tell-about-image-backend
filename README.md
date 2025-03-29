docker build -t tell-about-image-backend .

docker run -it -p 8000:8000 tell-about-image-backend

flyctl launch

fly deploy
