
# Delete the database and migration files
clean:
	rm -f db.sqlite3
	find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
	find . -path "*/migrations/*.pyc" -delete

makemigrations:
	python manage.py makemigrations

migrate:
	python manage.py migrate

run:
	python manage.py runserver

fetch_assets:
	python manage.py fetch_assets

reset: clean makemigrations migrate fetch_assets
