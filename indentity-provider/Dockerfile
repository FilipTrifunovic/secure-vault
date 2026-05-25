FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY IdentityProvider.sln .
COPY src/IdentityServer/*.csproj ./src/IdentityServer/
RUN dotnet restore

COPY . .
WORKDIR /app/src/IdentityServer
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /app/src/IdentityServer/out .

# Create data directory for SQLite with correct permissions
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

USER appuser

ENTRYPOINT ["dotnet", "IdentityServer.dll"]
