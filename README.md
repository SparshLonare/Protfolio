# Sparsh Lonare Portfolio (Django)

This project is a personal portfolio website built with **Django** (server-side rendering) and **Tailwind CSS** (via the `theme` app), with custom UI/animations powered by **GSAP**, **Lenis**, and additional front-end JavaScript.

## Features

- Single-page portfolio layout composed from reusable Django templates (`templates/components/*`)
- Smooth scrolling (`Lenis`) and scroll animations (`GSAP` + `ScrollTrigger`)
- Custom cursor UI
- Projects section rendered from server-side data in `core/views.py`

## Tech Stack

- **Python / Django**
- **Tailwind CSS** (integrated through the `tailwind` + `theme` apps)
- **JavaScript**: `gsap`, `lenis`, `three`

## Project Structure (high level)

- `Protfolio/` - Django project configuration
  - `settings.py`, `urls.py`, `asgi.py`, `wsgi.py`
- `core/` - Django app containing the main page view
  - `views.py`, `urls.py`, `models.py`
- `theme/` - Tailwind/theme integration
- `templates/` - Django templates
  - `home.html` and `templates/components/*.html`
- `static/` - front-end assets (JS/CSS/images)

## How the site works

- `core/urls.py` routes the root URL (`/`) to `core/views.py::home`.
- `core/views.py` prepares a list of projects and renders `templates/home.html`.
- `templates/home.html` includes page sections using:
  - `components/navbar.html`
  - `components/hero.html`
  - `components/about.html`
  - `components/skills.html`
  - `components/projects.html`
  - `components/contact.html`
  - `components/footer.html`

## Running locally

### 1) Prerequisites

- Python installed
- Node.js installed (for Tailwind/theme assets if needed)

### 2) Install Python dependencies

> If your project uses a virtual environment, create/activate it first.

Django dependencies are not listed in this repo snapshot, so install whatever is required for your environment. At minimum you need **Django**.

### 3) Install Node dependencies (optional)

If you need to build Tailwind/static assets:

```bash
npm install
```

### 4) Start the Django development server

```bash
python manage.py runserver
```

Open:

- http://127.0.0.1:8000/

## Configuration Notes

- `Protfolio/settings.py`
  - `DEBUG = True`
  - `INSTALLED_APPS` includes `tailwind` and `theme`
  - Static files are served from `static/`

## Customizing Projects

Edit the projects shown on the homepage in:

- `core/views.py` (the `projects = [...]` list)

Each project item supports keys like:

- `number`
- `title`
- `description`
- `tags`
- `github_url`

## License

Add a license file if you plan to share the repository publicly.

