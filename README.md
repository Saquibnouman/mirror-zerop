# MIRROR

> A lightweight application monitoring and recovery system designed to monitor a target application, detect its health status, and recover it when necessary.

## 🌐 Live Demo

**MIRROR is deployed on Zerops.**

**Live Application:**
https://mirror-220.ny1.zerops.app

**GitHub Repository:**
https://github.com/Saquibnouman/mirror-zerop

---

## 📖 What is MIRROR?

**MIRROR** is a lightweight monitoring and recovery system built with Node.js.

The main idea behind MIRROR is simple:

> **MIRROR watches another application, checks whether it is healthy, and responds when the target application becomes unhealthy.**

Instead of simply running an application and waiting for it to fail, MIRROR continuously observes the target application's state.

The project contains two main parts:

1. **MIRROR Server** — the monitoring and control layer.
2. **Target Application** — the application being monitored.

---

# 🎯 The Problem

Applications can fail for many reasons.

For example:

* The application may stop responding.
* An API may become unavailable.
* A service may return errors.
* A process may crash.
* The application may become unhealthy even though the server itself is still running.

A basic server can tell us that a process exists, but that does not necessarily mean the application is actually healthy.

MIRROR focuses on monitoring the **application's health**, rather than only checking whether the process is running.

---

# 💡 The Solution

MIRROR introduces a monitoring layer between the user and the target application.

The system continuously communicates with the target application and evaluates its condition.

The general flow is:

```text
                USER
                  │
                  ▼
          ┌───────────────┐
          │    MIRROR     │
          │    :3000      │
          └───────┬───────┘
                  │
                  │ monitors
                  ▼
          ┌───────────────┐
          │     TARGET    │
          │    :4000      │
          └───────┬───────┘
                  │
                  ▼
            Health Status
             /         \
            /           \
       HEALTHY         FAILED
          │               │
          │               ▼
          │            Recovery
          │               │
          │               ▼
          └──────────► HEALTHY
```

---

# 🏗️ Architecture

MIRROR currently runs two Node.js processes inside the Zerops service.

```text
┌─────────────────────────────────────┐
│             Zerops                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │        MIRROR Service         │  │
│  │                               │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │     server.js           │  │  │
│  │  │     MIRROR Server       │  │  │
│  │  │        :3000            │  │  │
│  │  └────────────┬────────────┘  │  │
│  │               │               │  │
│  │               │ monitors      │  │
│  │               ▼               │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   target-server.js      │  │  │
│  │  │   Target Application    │  │  │
│  │  │        :4000            │  │  │
│  │  └─────────────────────────┘  │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Ports

| Port   | Purpose            |
| ------ | ------------------ |
| `3000` | MIRROR server      |
| `4000` | Target application |

Port `3000` is exposed publicly through Zerops.

Port `4000` is used internally by the target application.

---

# 🔍 How MIRROR Works

The monitoring process can be understood in several stages.

## 1. Start the target application

The target application starts on port `4000`.

```text
Target application running at http://localhost:4000
```

The target application represents the service that MIRROR needs to monitor.

---

## 2. Start MIRROR

The MIRROR server starts on port `3000`.

```text
MIRROR server running at http://localhost:3000
```

MIRROR knows the target application's address:

```text
Monitoring target: http://localhost:4000
```

---

## 3. Check application health

MIRROR communicates with the target application and checks its current state.

A healthy application can report information such as:

```text
Healthy: 98 health | 124ms API | 0 errors
```

This provides MIRROR with information about:

* Health status
* API response time
* Errors

---

## 4. Detect failures

If the target application becomes unavailable or unhealthy, MIRROR can detect that condition.

The target is not considered healthy simply because the Node.js process exists.

MIRROR uses communication with the target application to determine whether the application is actually responding correctly.

---

## 5. Recovery

When the target application becomes unhealthy, MIRROR can attempt to recover the target.

After recovery, the system can return to a healthy state.

The runtime logs demonstrate this lifecycle:

```text
TARGET: Application recovered.
MIRROR: Target initialized in healthy state.
```

---

# ❤️ Health Monitoring

One of the important concepts in MIRROR is the difference between:

### Process running

and

### Application healthy

A process can technically still be running while the application itself is not responding correctly.

MIRROR therefore focuses on the application's actual behaviour.

For example:

```text
Healthy
   ↓
Application responds
   ↓
API works
   ↓
No critical errors
```

If these conditions stop being satisfied, MIRROR can identify that the target requires attention or recovery.

---

# 🧩 Project Structure

```text
mirror-zerop/
│
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── server.js
├── target-app.js
├── target-server.js
│
├── package.json
├── package-lock.json
├── zerops.yml
│
└── .gitignore
```

---

# 📁 File Responsibilities

## `server.js`

The main MIRROR server.

It is responsible for the monitoring layer and communicates with the target application.

It runs on:

```text
PORT 3000
```

The port is configurable through the environment:

```javascript
const PORT = process.env.PORT || 3000;
```

This allows the application to use the port provided by the hosting platform while still using `3000` during local development.

---

## `target-server.js`

Runs the target application.

The target application listens on:

```text
PORT 4000
```

It represents the service that MIRROR monitors.

---

## `target-app.js`

Contains functionality used by the target application.

It is separated from the target server so that the target application's logic and server startup can remain independent.

---

## `public/`

Contains the frontend of MIRROR.

```text
public/
├── index.html
├── script.js
└── style.css
```

### `index.html`

Defines the structure of the MIRROR interface.

### `script.js`

Handles frontend-side JavaScript behaviour.

### `style.css`

Contains the visual styling of the MIRROR interface.

---

## `package.json`

Defines the Node.js project metadata, dependencies, and available scripts.

---

## `package-lock.json`

Locks the installed dependency versions so that the environment can reproduce the same dependency tree.

---

## `zerops.yml`

Defines how MIRROR is built and started on Zerops.

---

# ⚙️ Zerops Deployment

MIRROR is deployed using **Zerops**.

The deployment process is defined in:

```text
zerops.yml
```

The current configuration uses Node.js 20.

```yaml
zerops:
  - setup: app

    build:
      base: nodejs@20

      buildCommands:
        - npm ci

      deployFiles:
        - ./

      cache:
        - node_modules

    run:
      base: nodejs@20

      ports:
        - port: 3000
          httpSupport: true

      start: node target-server.js & node server.js
```

---

# 🚀 Deployment Configuration Explained

## Build environment

```yaml
base: nodejs@20
```

The application is built using Node.js 20.

---

## Install dependencies

```yaml
buildCommands:
  - npm ci
```

`npm ci` installs the dependencies defined by `package-lock.json`.

This makes the deployment environment reproducible.

---

## Deploy application files

```yaml
deployFiles:
  - ./
```

The project files are made available to the runtime environment.

---

## Dependency cache

```yaml
cache:
  - node_modules
```

The Node.js dependency directory can be cached to improve subsequent builds.

---

## Public port

```yaml
ports:
  - port: 3000
    httpSupport: true
```

MIRROR listens on port `3000`, which is exposed through Zerops HTTP routing.

---

## Start command

```yaml
start: node target-server.js & node server.js
```

This starts both applications:

```text
target-server.js → :4000

server.js → :3000
```

The target application starts first and MIRROR starts alongside it.

---

# 📊 Runtime Behaviour

During deployment, Zerops starts the configured processes.

A successful startup produces logs similar to:

```text
Target application running at http://localhost:4000

Target starts in HEALTHY state.

Healthy: 98 health | 124ms API | 0 errors

MIRROR server running at http://localhost:3000

Monitoring target: http://localhost:4000

Frontend directory: /var/www/public

MIRROR: Target initialized in healthy state.
```

These logs confirm that:

1. The target application started.
2. The target application entered a healthy state.
3. MIRROR started successfully.
4. MIRROR connected to the target.
5. The target was initialized as healthy.

---

# 🛠️ Technologies Used

* **Node.js**
* **Express.js**
* **JavaScript**
* **HTML**
* **CSS**
* **Zerops**
* **GitHub**
* **Git**

---

# 💻 Run MIRROR Locally

## 1. Clone the repository

```bash
git clone https://github.com/Saquibnouman/mirror-zerop.git
```

## 2. Enter the project

```bash
cd mirror-zerop
```

## 3. Install dependencies

```bash
npm install
```

## 4. Start the target application

```bash
node target-server.js
```

The target application runs on:

```text
http://localhost:4000
```

## 5. Start MIRROR

In another terminal:

```bash
node server.js
```

MIRROR runs on:

```text
http://localhost:3000
```

---

# 🔗 Local Architecture

After starting both processes:

```text
Browser
   │
   ▼
http://localhost:3000
   │
   ▼
MIRROR
   │
   │ monitors
   ▼
http://localhost:4000
   │
   ▼
Target Application
```

---

# 🌐 Production Architecture

On Zerops:

```text
Internet
    │
    ▼
Zerops HTTP Routing
    │
    ▼
MIRROR :3000
    │
    ▼
Target Application :4000
```

The Zerops environment provides the infrastructure required to run the application.

---

# 🔐 Environment Configuration

MIRROR uses environment variables where appropriate.

The server port is determined using:

```javascript
process.env.PORT || 3000
```

This allows the application to adapt to the port supplied by the deployment environment.

---

# ✨ Key Features

* Lightweight Node.js architecture
* Application health monitoring
* Target application monitoring
* Failure detection
* Recovery mechanism
* Health and API status information
* Simple frontend interface
* Zerops deployment support
* Environment-aware port configuration
* GitHub-based deployment pipeline

---

# 🎯 Why MIRROR?

MIRROR demonstrates a simple but important idea in modern application infrastructure:

> **Running an application is not enough; we also need to know whether the application is actually healthy.**

MIRROR explores this concept by combining:

```text
Application
     +
Monitoring
     +
Health Detection
     +
Recovery
     =
Resilient Application System
```

---

# 🚧 Future Improvements

Possible future improvements include:

* Independent target and MIRROR services
* More advanced health checks
* Configurable health-check intervals
* Failure history and analytics
* Persistent monitoring data
* Alert notifications
* Multiple target applications
* Automatic scaling
* More detailed recovery strategies
* Authentication and access control
* External monitoring integrations
* Metrics and observability dashboards

---

# 📌 Project Status

**Status:** Active / Deployed

MIRROR is currently deployed on Zerops and running through a Node.js service.

---

# 👨‍💻 Author

**Saquib Nouman**

GitHub:
https://github.com/Saquibnouman

Repository:
https://github.com/Saquibnouman/mirror-zerop

---

# 📄 License

This project is available for educational and development purposes.
