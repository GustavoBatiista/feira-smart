# build
FROM public.ecr.aws/docker/library/maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests clean package

# runtime
FROM public.ecr.aws/docker/library/eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/feira-smart-api-1.0.0.jar app.jar
EXPOSE 3001
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","java  -jar app.jar"]

