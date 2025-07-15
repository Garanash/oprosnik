FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt
COPY . .
# Скачиваем wait-for-it
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh
# Используем wait-for-it для ожидания БД
CMD ["/wait-for-it.sh", "postgres:5432", "--timeout=60", "--", "bash", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"] 