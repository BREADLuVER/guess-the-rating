python-m venvvenv

.\.venv\Scripts\Activate

#django

pip install django psycopg2

django-admin startproject guess_the_rating

python manage.py runserver

python manage.py migrate

#create new postgres on docker, connect with Pgadmin

C:\Users\bread>docker run --name guess_the_rating_db -e POSTGRES_PASSWORD=123 -p 5050:5432 -d postgres

docker exec -it guess_the_rating_db psql -U postgres

CREATE DATABASE guess_the_rating_db;

#amplify

amplify init

amplify add auth

amplify push

#docker

docker compose down
docker build -t guess-the-rating-frontend ./frontend

docker run -p 3000:3000 guess-the-rating-frontend

docker compose up --build

#node

nvm -v

> v18.20.4

#unframer
https://github.com/remorses/unframer

cd src

npx unframer

> import { useNavigate } from'react-router-dom';
>
> constnavigate = useNavigate();
>
> constonClickFutureGames = () => {
>
> navigate('/');
>
> };
>
> vartransition1 = { bounce:0.2, delay:0, duration:0.4, type:'spring', };
>
> vartransition2 = { bounce:0.25, delay:0, duration:0.45, type:'spring', };
>
> varanimation = { opacity:1, rotate:0, rotateX:0, rotateY:0, scale:1.1, skewX:0, skewY:0, transition:transition2, };
>
> onClick: () =>navigate('/user'),
>
> children:props.userName||'User',
>
> whileHover:animation,

#Scraper django
python manage.py makemigrations
python manage.py migrate
python manage.py scrape_games
python manage.py createsuperuser
python manage.py runserver
http://127.0.0.1:8000/admin/

#production

docker compose exec backend python manage.py makemigrations

docker compose exec backend python manage.py migrate

docker compose exec backend python manage.py createsuperuser

docker-compose exec python manage.py scrape_games
