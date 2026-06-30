# Apply Super Quick – Frontend (React.js)

This is the frontend of the Apply Super Quick project built with **React.js**.

---

## System Requirements

This project requires the following tools to be installed on your system:

- Node.js
- npm
- Git

You can verify installation by running:

```bash
node -v
npm -v
git --version
```

---

## Clone Repository

Clone the project using:

```bash
git clone git@github.com:hamza-nafasat/apply-super-quick-frontend.git
cd apply-super-quick-frontend
```

---

## Environment Setup

Create a `.env` file:

```bash
touch .env
```

Add the following variables:

```env
VITE_SERVER_URL=""
VITE_CLOUDINARY_CLIENT_KEY=""
VITE_CLOUDINARY_CLIENT_NAME=""
VITE_RECAPTCHA_SITE_KEY=""
VITE_RECAPTCHA_SITE_SECRET=""
```

---

## Install Dependencies

Run the following command to install packages:

```bash
npm install
```

---

## Run Project

Start the development server using:

```bash
npm run dev
```

If `npm run dev` does not work, use:

```bash
npm start
```

Open your browser and go to:

```
http://localhost:3000
```

---

## Build for Production

To create a production build, run:

```bash
npm run build
```
