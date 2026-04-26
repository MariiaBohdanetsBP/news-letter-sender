FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY NewsLetterSender.slnx .
COPY src/NewsLetterSender.Core/NewsLetterSender.Core.csproj src/NewsLetterSender.Core/
COPY src/NewsLetterSender.Infrastructure/NewsLetterSender.Infrastructure.csproj src/NewsLetterSender.Infrastructure/
COPY src/NewsLetterSender.Api/NewsLetterSender.Api.csproj src/NewsLetterSender.Api/
RUN dotnet restore

COPY src/ src/
RUN dotnet publish src/NewsLetterSender.Api/NewsLetterSender.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5000

ENTRYPOINT ["dotnet", "NewsLetterSender.Api.dll"]
