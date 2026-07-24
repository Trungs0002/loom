#!/bin/bash

# 1. Khởi động Flask ML Service chạy ngầm (background) ở cổng 5001
cd /app/ml-service
gunicorn app:app --bind 0.0.0.0:5001 &

# 2. Khởi động Express Backend chạy chính (foreground)
cd /app/server
# Express sẽ tự động lấy port từ biến môi trường $PORT của Render cấp
npm start
