# Url Shortner App

This URL Shortener App is a modern web application designed to generate shortened URLs for longer web addresses, making them easier to share and manage. Users can input a long URL, and the application will return a shorter version that redirects to the original URL. Additionally, users can view all their shortened URLs, copy them to the clipboard, or delete them when they are no longer needed. This app leverages the MERN stack (MongoDB, Express.js, React, Node.js) along with TypeScript and Tailwind CSS to provide a robust and scalable solution.

# Features

    Shorten URLs: Generate short URLs for longer web addresses.
    View All Shortened URLs: Display all the shortened URLs in a table format.
    Copy URLs: Easily copy the shortened URLs to the clipboard.
    Delete URLs: Remove shortened URLs from the database.

# Tech Stack

    Frontend: React, TypeScript, Tailwind CSS
    Backend: Node.js, Express.js, MongoDB, Mongoose, TypeScript
    Other Tools: Axios, Nanoid, Vite

# Project Structure
## Backend

    server.ts: Main server file to set up Express and middleware.
    routes/shortUrl.ts: Defines API routes for URL operations.
    models/shortUrl.ts: Defines the schema for storing URLs in MongoDB.
    controllers/shorturl.ts: Contains the business logic for creating, retrieving, and deleting URLs.

## Frontend

    App.tsx: Main entry point of the React application.
    components: Contains React components like Header, Footer, Container, DataTable, and FormContainer.
    helpers/Constants.ts: Contains constants like the server URL.
    interface/UrlData.ts: TypeScript interface for URL data.

# Author

- **Jaynesh Bhandari** - [@thejaynesh](https://github.com/thejaynesh)
