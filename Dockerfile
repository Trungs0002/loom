FROM nikolaik/python-nodejs:python3.11-nodejs20

WORKDIR /app

# Copy toàn bộ source code
COPY . .

# Cài đặt thư viện cho ML Service (Python)
WORKDIR /app/ml-service
RUN pip install -r requirements.txt

# Cài đặt thư viện cho Backend (Node.js)
WORKDIR /app/server
RUN npm install

# Phân quyền thực thi cho file start.sh
WORKDIR /app
RUN chmod +x start.sh

# Render sẽ cung cấp cổng qua biến môi trường $PORT
# Lệnh CMD này sẽ chạy file start.sh
CMD ["./start.sh"]
