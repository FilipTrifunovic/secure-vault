FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app

COPY *.sln .
COPY src/WebUI/*.csproj ./src/WebUI/
COPY src/Domain/*.csproj ./src/Domain/
COPY src/Application/*.csproj ./src/Application/
COPY src/Infrastructure/*.csproj ./src/Infrastructure/

RUN dotnet restore

COPY . .
RUN find . \( -name "obj" -o -name "bin*" \) -type d -exec rm -rf {} + 2>/dev/null || true
RUN dotnet publish src/WebUI/WebUI.csproj -c Release -o /app/src/WebUI/out

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build-env /app/src/WebUI/out .
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

USER appuser

ENTRYPOINT ["dotnet", "security_file_share_api.WebUI.dll"]
