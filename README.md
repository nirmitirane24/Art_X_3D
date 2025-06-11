#  ARTX3D – A Web-Based 3D Editor with AI Assistant

**ARTX3D** is a web-based 3D modeling platform built to democratize 3D design. Designed using modern web technologies like React, Three.js, and WebGL, it empowers users of all skill levels to create, modify, and interact with 3D content — all without needing any kind of high-end hardware or complex installations. The integration of AI assistance (powered by Google Gemini) helps beginners navigate the platform in real-time, making 3D design more inclusive and accessible.

## 🌐 Live hosted website
> _https://artx3d.vercel.app_


## Steps to run project locally:
Frontend:
> ```bash
> cd frontend
> npm run dev
> ```

Backend:
> ```bash
> cd backend
> python app.py
> ```

AIbackend:
> ```bash
> cd aibackend
> python app.py
> ```


## 📦 Required Python Libraries

| Library            | Purpose                                                | Install Command                        |
|--------------------|--------------------------------------------------------|----------------------------------------|
| `flask`            | Web framework for handling backend routes              | `pip install flask`                    |
| `flask-cors`       | Enables Cross-Origin Resource Sharing (CORS)           | `pip install flask-cors`              |
| `psycopg2-binary`  | PostgreSQL database adapter for Python                 | `pip install psycopg2-binary`         |
| `python-dotenv`    | Load environment variables from `.env` file            | `pip install python-dotenv`           |
| `redis`            | Redis client library for Python                        | `pip install redis`                   |
| `werkzeug`         | Password hashing and WSGI utilities (used for auth)   | `pip install werkzeug`                |


## 🚀 Features

-   **Real-Time 3D Editing:** Create, transform, and manage 3D models directly in the browser.
-   **Modular Editor Interface:** An intuitive user interface featuring a Hierarchy panel for scene organization, a Material editor for visual properties, a Properties panel for detailed adjustments, a toolbar for quick actions, and a dynamic viewport.
-   **Cloud-Based Storage:** Seamlessly save and load projects with persistent storage capabilities powered by Supabase, S3, and R2, ensuring your work is always accessible.
-   **AI Assistant:** Enhance your workflow with an integrated AI chatbot, powered by Google's Gemini, providing real-time guidance and answers to your queries.
-   **Import/Export Capabilities:** Broad support for standard 3D file formats including `.glb`, `.gltf`, `.obj`, and `.fbx`, enabling easy integration and sharing of assets.
-   **Advanced Material System:** Customize your models with granular control over material properties such as metalness, roughness, color, opacity, and the application of textures and normal maps.
-   **Cross-Platform & Lightweight:** Optimized to run efficiently on all modern web browsers and even lower-end hardware, ensuring broad accessibility.
-   **User Account Management:** Secure login, registration, and logout functionalities to manage user profiles and ensure personalized access to saved projects.
-   **Scene Management & Organization:** Easily save, load, and manage multiple scenes directly from the homepage, providing a streamlined project workflow.
-   **Pre-built Scene Templates/Examples:** Access a variety of pre-configured scenes and project templates to quickly start new creations or learn from practical examples.
-   **Comprehensive Asset Library:** Browse and integrate a rich collection of 3D models, materials, and textures directly into your scenes, enhancing creativity and efficiency.
-   **Subscription-Based Access (Pro Features):** Unlock premium functionalities, such as unlimited scene saving and advanced export options, through a tiered subscription model.
-   **Integrated Tutorials & Learning Resources:** Access in-app tutorials and guided workflows directly from the homepage to master the editor's capabilities.
-   **Undo/Redo System:** A robust history of actions allows for easy reversal and reapplication of changes within the scene, ensuring a flexible editing experience.
-   **Advanced Lighting & Environment Controls:** Adjust lighting parameters, add environmental effects, and set up skyboxes for realistic scene rendering.


## 🏗️ Architecture Overview

### 🔷 Frontend

- **React + Vite** – Component-based UI
- **React Three Fiber (R3F)** – Declarative WebGL rendering
- **Three.js** – Core 3D engine
- **Drei** – Utility helpers for R3F
- **Axios** – Communication with backend APIs

### 🔶 Backend

- **Flask (Python)** – Lightweight backend with REST APIs
- **Supabase + PostgreSQL** – Database for user and project metadata
- **Amazon S3 / Cloudflare R2** – Storage for 3D models and thumbnails
- **Gemini AI API** – AI assistant for contextual guidance


## 🧱 Core Modules

| Module              | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| Editor Manager       | Manages global state, scene graph, selections, undo/redo                   |
| Scene Renderer       | Handles 3D rendering, grid, lighting, and controls                         |
| Model Loader         | Import external 3D assets, apply scaling and centering                     |
| Material Editor      | Modify PBR materials: color, emissive, metalness, roughness, maps          |
| Properties Panel     | Position, rotation, scale, and object-specific attributes                  |
| Hierarchy Panel      | All objects, lights are displayed in that region                                       |
| AI Assistant         | Gemini-powered chatbot integrated with manual/documentation                |
| Library / Save-Load  | Load from prebuilt library or user's saved scenes from cloud               |


## 🏗️ System Architecture
![image](https://github.com/user-attachments/assets/3b9198fd-f39c-4ad4-b65a-ef1387dafabe)


## 🏗️ Short(3mins)walkthrough of the website
> _https://drive.google.com/drive/folders/1hE6AoaFiWvpqruM3wqYAVwVEl3omGYo7?usp=sharing_


## 🏡 Sample House model
![home model](https://github.com/user-attachments/assets/825a5469-ef49-4eb1-a3a9-3c06c9ad31ab)


## 🤝 Contributors
- Aniket Mahajan: https://github.com/Aniike-t
- Pranav Patil: https://github.com/pranavpatil1504
- Nirmiti Rane: https://github.com/nirmitirane24


## 📄 License
This project is open-source under the [MIT License](LICENSE).
