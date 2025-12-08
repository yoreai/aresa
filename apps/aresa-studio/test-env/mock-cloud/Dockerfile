FROM python:3.11-slim

WORKDIR /app

# Install Flask
RUN pip install --no-cache-dir flask

COPY server.py .

EXPOSE 8443

CMD ["python", "server.py"]






