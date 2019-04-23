FROM node:11
RUN apt-get update && apt-get install -y \
    python-pip
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
RUN npm install bcrypt@latest
COPY . .
RUN pip install -r requirements.txt
EXPOSE 5000