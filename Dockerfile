# morpheus.js 
# This Dockerfile serves morpheus.js a Javascript based matrix visualization tool
# 
# Build using:
# build_version=0.1.0
# docker_user=$USER
# docker build --no-cache=true --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') --build-arg BUILD_VERSION="${build_version}" -t ${docker_user}/morpheus.js:${build_version} .

#------------------
# First build stage
#------------------
FROM node:14-alpine as builder
#FROM mhart/alpine-node:14 as builder
LABEL stage=builder

ARG BUILD_DATE
ARG BUILD_VERSION="latest"

LABEL org.label-schema.name="morpheus.js" \
	  org.label-schema.description="morpheus.js is a container image that morpheus.js a javascript matrix visualization tool" \
	  org.label-schema.version="$BUILD_VERSION" \
	  org.label-schema.build-date="$BUILD_DATE" \
	  org.label-schema.license="BSD 3-Clause License" \
      org.label-schema.schema-version="1.0"

# Copy app's source code to the /app directory
COPY . /app

# The application's directory will be the working directory
WORKDIR /app

# Install Node.js dependencies defined in '/app/packages.json'
RUN npm install

#-------------------
# Second build stage
#-------------------
FROM node:14-alpine as release
#FROM mhart/alpine-node:slim-14

# Add tini init
RUN apk add --no-cache tini

# To run node in production mode
ENV NODE_ENV="production"

# Copy the application code
COPY --from=builder /app /app

# Create a non-root user
#RUN useradd -r -u 1001 -g root nonroot
#RUN chown -R nonroot /app

# Create a group and user
RUN addgroup -g 1001 -S appgroup && \
adduser -u 1001 -S appuser -G appgroup && \
chown -R appuser /app

#USER nonroot
USER appuser

WORKDIR /app
EXPOSE 3000

# Start the application
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
